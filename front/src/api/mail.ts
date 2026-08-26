type Locale = "fr" | "en";

async function post(path: string, body: unknown) {
  const response = await fetch(`/api/mail/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "The email could not be sent.");
}

export function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: Locale;
}) {
  return post("contact", data);
}

export function subscribeToNewsletter(email: string, locale: Locale) {
  return post("newsletter", { email, locale });
}
