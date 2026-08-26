import { Router, type Response } from "express";
import { env } from "../config/env.js";
import { ipRateLimit } from "../utils/security.js";
import { escapeHtml, mailLayout, MailConfigurationError, sendMail } from "../services/mail.js";
import { markNewsletterWelcomeSent, registerNewsletterSubscriber } from "../services/newsletter.js";

const router = Router();
const contactLimiter = ipRateLimit({ windowMs: 10 * 60_000, max: 5, keySuffix: "contact-mail" });
const newsletterLimiter = ipRateLimit({ windowMs: 10 * 60_000, max: 5, keySuffix: "newsletter" });
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function localeFrom(value: unknown): "fr" | "en" {
  return value === "en" ? "en" : "fr";
}

function clean(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cleanSingleLine(value: unknown, maximum: number) {
  return clean(value, maximum).replace(/[\r\n]+/g, " ");
}

function mailError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[MAIL]", message);
  res.status(error instanceof MailConfigurationError ? 503 : 502).json({
    error: error instanceof MailConfigurationError
      ? "The email service is not configured yet."
      : "The email could not be sent. Please try again later.",
  });
}

router.post("/contact", contactLimiter, async (req, res) => {
  const locale = localeFrom(req.body?.locale);
  const name = cleanSingleLine(req.body?.name, 120);
  const email = clean(req.body?.email, 254).toLowerCase();
  const subject = cleanSingleLine(req.body?.subject, 200);
  const message = clean(req.body?.message, 5_000);

  if (!name || !EMAIL_PATTERN.test(email) || !subject || !message) {
    res.status(400).json({ error: "Valid name, email, subject, and message are required." });
    return;
  }

  try {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");

    await sendMail({
      to: [{ address: env.contactRecipientAddress }],
      replyTo: { address: email, name },
      subject: `[OSS website] ${subject}`,
      html: mailLayout(
        "Nouveau message depuis le site OSS",
        `<p><strong>Nom :</strong> ${safeName}</p>
         <p><strong>Email :</strong> ${safeEmail}</p>
         <p><strong>Objet :</strong> ${safeSubject}</p>
         <hr style="border:0;border-top:1px solid #dbe3e8;margin:20px 0">
         <p>${safeMessage}</p>`,
      ),
    });

    try {
      const acknowledgement = locale === "en"
        ? {
            subject: "We received your message — OSS",
            title: "Thank you for contacting OSS",
            body: `<p>Hello ${safeName},</p><p>We have received your message concerning <strong>${safeSubject}</strong>. Our team will reply as soon as possible.</p>`,
          }
        : {
            subject: "Nous avons reçu votre message — OSS",
            title: "Merci d’avoir contacté l’OSS",
            body: `<p>Bonjour ${safeName},</p><p>Nous avons bien reçu votre message concernant <strong>${safeSubject}</strong>. Notre équipe vous répondra dans les meilleurs délais.</p>`,
          };
      await sendMail({
        to: [{ address: email, name }],
        subject: acknowledgement.subject,
        html: mailLayout(acknowledgement.title, acknowledgement.body),
      });
    } catch (error) {
      console.error("[MAIL] Contact acknowledgement failed:", error instanceof Error ? error.message : error);
    }

    res.status(202).json({ message: "Message sent" });
  } catch (error) {
    mailError(res, error);
  }
});

router.post("/newsletter", newsletterLimiter, async (req, res) => {
  const locale = localeFrom(req.body?.locale);
  const email = clean(req.body?.email, 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  try {
    const needsWelcomeEmail = await registerNewsletterSubscriber(email, locale);
    if (needsWelcomeEmail) {
      const copy = locale === "en"
        ? {
            subject: "Welcome to the OSS newsletter",
            title: "Your subscription is registered",
            body: "<p>Thank you for subscribing. You will receive the latest news and publications from the Sahara and Sahel Observatory.</p>",
          }
        : {
            subject: "Bienvenue dans la newsletter de l’OSS",
            title: "Votre inscription est enregistrée",
            body: "<p>Merci pour votre inscription. Vous recevrez les dernières actualités et publications de l’Observatoire du Sahara et du Sahel.</p>",
          };
      await sendMail({
        to: [{ address: email }],
        subject: copy.subject,
        html: mailLayout(copy.title, copy.body),
      });
      await markNewsletterWelcomeSent(email);
    }
    res.status(needsWelcomeEmail ? 201 : 200).json({ message: "Subscription registered", alreadySubscribed: !needsWelcomeEmail });
  } catch (error) {
    mailError(res, error);
  }
});

export default router;
