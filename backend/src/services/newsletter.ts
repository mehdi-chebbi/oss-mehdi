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
