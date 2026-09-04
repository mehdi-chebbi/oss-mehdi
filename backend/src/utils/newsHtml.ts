import sanitizeHtml from "sanitize-html";

const BLOCK_END_TAGS = /<\/(?:p|h[1-6]|blockquote|li|ul|ol|figure|figcaption)>/gi;
const LINE_BREAK_TAGS = /<br\s*\/?>/gi;

function isLocalNewsImage(src: string) {
  return /^\/uploads\/news\/[a-z0-9/_().%+\-]+$/i.test(src);
}

function sanitizedImageAttributes(attribs: Record<string, string>) {
  const { "data-size": requestedSize, ...safeAttribs } = attribs;
  const size = ["25", "50", "75", "100"].includes(requestedSize)
    ? requestedSize
    : undefined;

  return {
    ...safeAttribs,
    ...(size ? { "data-size": size } : {}),
    loading: "lazy",
  };
}

/** Clean the trusted subset of HTML supported by the news editor. */
export function sanitizeNewsHtml(value: unknown): string {
  return sanitizeHtml(String(value ?? ""), {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "em", "s", "ul", "ol", "li",
      "blockquote", "a", "img", "figure", "figcaption", "hr", "span",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "data-size"],
      span: ["style"],
    },
    allowedStyles: {
      span: {
        color: [/^#[0-9a-f]{6}$/i],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      h1: "h2",
      h5: "h4",
      h6: "h4",
      b: "strong",
      i: "em",
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: sanitizedImageAttributes(attribs),
      }),
    },
    exclusiveFilter: (frame) =>
      frame.tag === "img" && !isLocalNewsImage(String(frame.attribs.src || "")),
    disallowedTagsMode: "discard",
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  }).trim();
}

/** Return readable text for cards, email excerpts, search, and embeddings. */
export function newsHtmlToPlainText(value: unknown): string {
  const withSpacing = String(value ?? "")
    .replace(LINE_BREAK_TAGS, "\n")
    .replace(/<li\b[^>]*>/gi, "\n")
    .replace(BLOCK_END_TAGS, "\n\n");

  return sanitizeHtml(withSpacing, { allowedTags: [], allowedAttributes: {} })
    .replace(/\u00a0/g, " ")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n[\t ]+/g, "\n")
    .replace(/[\t ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
