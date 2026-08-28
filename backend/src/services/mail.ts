import { env } from "../config/env.js";

type MailRecipient = {
  address: string;
  name?: string;
};

type SendMailOptions = {
  to: MailRecipient[];
  subject: string;
  html: string;
  replyTo?: MailRecipient;
};

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error_description?: string;
};

let cachedAccessToken = "";
let accessTokenExpiresAt = 0;

export class MailConfigurationError extends Error {}

export function isMailConfigured() {
  return Boolean(
    env.microsoftTenantId &&
    env.microsoftClientId &&
    env.microsoftClientSecret &&
    env.mailSenderAddress
  );
}

function assertConfigured() {
  if (!isMailConfigured()) {
    throw new MailConfigurationError("Microsoft Graph mail is not configured");
  }
}

async function getAccessToken() {
  assertConfigured();
  if (cachedAccessToken && Date.now() < accessTokenExpiresAt) return cachedAccessToken;

  const body = new URLSearchParams({
    client_id: env.microsoftClientId,
    client_secret: env.microsoftClientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(env.microsoftTenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(15_000),
    },
  );
  const payload = (await response.json().catch(() => ({}))) as TokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(`Microsoft Graph authentication failed: ${payload.error_description || response.status}`);
  }

  cachedAccessToken = payload.access_token;
  accessTokenExpiresAt = Date.now() + Math.max(60, (payload.expires_in || 3600) - 120) * 1000;
  return cachedAccessToken;
}

function graphRecipient(recipient: MailRecipient) {
  return {
    emailAddress: {
      address: recipient.address,
      ...(recipient.name ? { name: recipient.name } : {}),
    },
  };
}

export async function sendMail(options: SendMailOptions) {
  const accessToken = await getAccessToken();
  const sender = encodeURIComponent(env.mailSenderAddress);
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${sender}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: options.subject,
        body: { contentType: "HTML", content: options.html },
        toRecipients: options.to.map(graphRecipient),
        ...(options.replyTo ? { replyTo: [graphRecipient(options.replyTo)] } : {}),
      },
      saveToSentItems: true,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Microsoft Graph send failed (${response.status}): ${detail.slice(0, 300)}`);
  }
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function mailLayout(title: string, content: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#f4f5f2;font-family:Arial,sans-serif;color:#17324d">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px">
    <div style="border-top:6px solid #3183d4;background:#ffffff;padding:28px">
      <p style="margin:0 0 8px;color:#489e42;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Observatoire du Sahara et du Sahel</p>
      <h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;color:#17324d">${title}</h1>
      <div style="font-size:15px;line-height:1.65;color:#405466">${content}</div>
    </div>
  </div>
</body></html>`;
}
