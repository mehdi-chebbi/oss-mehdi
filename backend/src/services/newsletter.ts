import type { PoolClient } from "pg";
import { query } from "../config/db.js";

export async function registerNewsletterSubscriber(email: string, locale: "fr" | "en") {
  const result = await query(
    `INSERT INTO newsletter_subscribers (email, locale)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE
       SET locale = EXCLUDED.locale, is_active = true, updated_at = NOW()
     RETURNING welcome_sent_at`,
    [email.toLowerCase(), locale],
  );
  return result.rows[0]?.welcome_sent_at == null;
}

export async function markNewsletterWelcomeSent(email: string) {
  await query(
    "UPDATE newsletter_subscribers SET welcome_sent_at = NOW(), updated_at = NOW() WHERE email = $1",
    [email.toLowerCase()],
  );
}

export async function enqueueNewsForSubscribers(client: PoolClient, newsId: number) {
  await client.query(
    `INSERT INTO newsletter_deliveries (news_id, subscriber_id)
     SELECT $1, id
     FROM newsletter_subscribers
     WHERE is_active = true
     ON CONFLICT (news_id, subscriber_id) DO NOTHING`,
    [newsId],
  );
}
