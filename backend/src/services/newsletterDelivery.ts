import { env } from "../config/env.js";
import { pool, query } from "../config/db.js";
import { escapeHtml, isMailConfigured, mailLayout, sendMail } from "./mail.js";

type NewsletterDelivery = {
  id: string;
  attempts: number;
  email: string;
  locale: "fr" | "en";
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
  slug: string;
  date: string | Date;
};

const POLL_INTERVAL_MS = 5_000;
const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 5;
let processing = false;

export async function ensureNewsletterDeliverySchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS newsletter_deliveries (
      id              BIGSERIAL PRIMARY KEY,
      news_id         INT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
      subscriber_id   BIGINT NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
      status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
      attempts        INT NOT NULL DEFAULT 0,
      next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_error      TEXT NOT NULL DEFAULT '',
      sent_at         TIMESTAMPTZ,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (news_id, subscriber_id)
    );

    CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_pending
      ON newsletter_deliveries (status, next_attempt_at, id);
  `);
}

async function claimDelivery(): Promise<NewsletterDelivery | null> {
  const result = await query(
    `WITH candidate AS (
       SELECT delivery.id
       FROM newsletter_deliveries AS delivery
       JOIN newsletter_subscribers AS subscriber ON subscriber.id = delivery.subscriber_id
       WHERE subscriber.is_active = true
         AND delivery.attempts < $1
         AND delivery.next_attempt_at <= NOW()
         AND (
           delivery.status = 'pending'
           OR (delivery.status = 'processing' AND delivery.updated_at < NOW() - INTERVAL '10 minutes')
         )
       ORDER BY delivery.id
       FOR UPDATE OF delivery SKIP LOCKED
       LIMIT 1
     ), claimed AS (
       UPDATE newsletter_deliveries AS delivery
       SET status = 'processing', attempts = delivery.attempts + 1, updated_at = NOW()
       FROM candidate
       WHERE delivery.id = candidate.id
       RETURNING delivery.*
     )
     SELECT claimed.id, claimed.attempts, subscriber.email, subscriber.locale,
            news.title_fr, news.title_en, news.body_fr, news.body_en, news.slug, news.date
     FROM claimed
     JOIN newsletter_subscribers AS subscriber ON subscriber.id = claimed.subscriber_id
     JOIN news ON news.id = claimed.news_id`,
    [MAX_ATTEMPTS],
  );
  return (result.rows[0] as NewsletterDelivery | undefined) ?? null;
}

function plainTextExcerpt(value: string) {
  const plain = value
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 320 ? `${plain.slice(0, 317).trimEnd()}…` : plain;
}

function formatPublicationDate(value: string | Date, locale: "fr" | "en") {
  const parsed = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00Z`)
      : new Date(value);

  if (Number.isNaN(parsed.getTime())) return String(value);

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(parsed);
}

function localizedMail(delivery: NewsletterDelivery) {
  const isEnglish = delivery.locale === "en";
  const title = isEnglish ? delivery.title_en : delivery.title_fr;
  const body = isEnglish ? delivery.body_en : delivery.body_fr;
  const articleUrl = `${env.publicSiteUrl}/${delivery.locale}/news/${delivery.slug}`;
  const safeTitle = escapeHtml(title);
  const safeExcerpt = escapeHtml(plainTextExcerpt(body));
  const safeUrl = escapeHtml(articleUrl);
  const formattedDate = formatPublicationDate(delivery.date, delivery.locale);

  const subject = isEnglish
    ? `New OSS article — ${title}`
    : `Nouvelle actualité de l’OSS — ${title}`;
  const heading = isEnglish ? "New OSS article" : "Nouvelle actualité de l’OSS";
  const readLabel = isEnglish ? "Read the article" : "Lire l’actualité";
  const intro = isEnglish
    ? "A new article has just been published by the Sahara and Sahel Observatory."
    : "Une nouvelle actualité vient d’être publiée par l’Observatoire du Sahara et du Sahel.";

  return {
    subject,
    html: mailLayout(
      heading,
      `<p>${intro}</p>
       <p style="margin:18px 0 6px;font-size:19px;line-height:1.35;color:#17324d"><strong>${safeTitle}</strong></p>
       <p style="margin:0 0 16px;color:#6b7d8c;font-size:13px">${escapeHtml(formattedDate)}</p>
       ${safeExcerpt ? `<p>${safeExcerpt}</p>` : ""}
       <p style="margin:24px 0 0"><a href="${safeUrl}" style="display:inline-block;background:#3183d4;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:6px;font-weight:700">${readLabel}</a></p>`,
    ),
  };
}

async function markSent(deliveryId: string) {
  await query(
    `UPDATE newsletter_deliveries
     SET status = 'sent', sent_at = NOW(), last_error = '', updated_at = NOW()
     WHERE id = $1`,
    [deliveryId],
  );
}

async function markFailed(delivery: NewsletterDelivery, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const finalFailure = delivery.attempts >= MAX_ATTEMPTS;
  const retryMinutes = [1, 5, 15, 60][Math.min(delivery.attempts - 1, 3)];
  await query(
    `UPDATE newsletter_deliveries
     SET status = $2,
         next_attempt_at = NOW() + ($3 * INTERVAL '1 minute'),
         last_error = $4,
         updated_at = NOW()
     WHERE id = $1`,
    [delivery.id, finalFailure ? "failed" : "pending", retryMinutes, message.slice(0, 1_000)],
  );
  console.error(
    `[NEWSLETTER] Delivery ${delivery.id} ${finalFailure ? "failed permanently" : "will retry"}: ${message}`,
  );
}

async function processBatch() {
  if (processing) return;
  processing = true;
  let sent = 0;
  try {
    for (let processed = 0; processed < BATCH_SIZE; processed += 1) {
      const delivery = await claimDelivery();
      if (!delivery) break;

      try {
        const message = localizedMail(delivery);
        await sendMail({
          to: [{ address: delivery.email }],
          subject: message.subject,
          html: message.html,
        });
        await markSent(delivery.id);
        sent += 1;
      } catch (error) {
        await markFailed(delivery, error);
      }
    }
    if (sent > 0) console.log(`[NEWSLETTER] Sent ${sent} news notification(s)`);
  } catch (error) {
    console.error("[NEWSLETTER] Worker error:", error instanceof Error ? error.message : error);
  } finally {
    processing = false;
  }
}

export function startNewsletterDeliveryWorker() {
  if (!isMailConfigured()) {
    console.warn("[NEWSLETTER] Microsoft Graph mail is not configured; delivery worker is disabled");
    return;
  }

  const timer = setInterval(() => void processBatch(), POLL_INTERVAL_MS);
  timer.unref();
  setTimeout(() => void processBatch(), 1_000).unref();
  console.log("[NEWSLETTER] News delivery worker started");
}
