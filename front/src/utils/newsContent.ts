const HTML_TAG = /<\/?[a-z][^>]*>/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Keeps older plain-text records readable beside new rich-text records. */
export function newsBodyHtml(value: string): string {
  if (!value) return "";
  if (HTML_TAG.test(value)) return value;

  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function newsBodyPlainText(value: string): string {
  if (!value) return "";

  if (typeof DOMParser !== "undefined") {
    const spacedHtml = newsBodyHtml(value)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(?:p|h[1-6]|blockquote|li|ul|ol|figure|figcaption)>/gi, " $&");
    const document = new DOMParser().parseFromString(spacedHtml, "text/html");
    return (document.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function newsExcerpt(value: string, max: number): string {
  const clean = newsBodyPlainText(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
