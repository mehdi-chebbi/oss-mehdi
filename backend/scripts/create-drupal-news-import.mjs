import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";

const sanitizeHtml = await import("sanitize-html")
  .then((module) => module.default)
  .catch(() => null);

const inputPath = resolve(process.argv[2] || "db/drupal-content.json");
const outputPath = resolve(process.argv[3] || "db/drupal-news-latest-10.sql");
const requestedLimit = Number.parseInt(process.argv[4] || "10", 10);
const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 10;
const imageManifestPath = process.argv[5] ? resolve(process.argv[5]) : null;

function sqlText(value) {
  return `'${String(value ?? "")
    .replaceAll("\0", "")
    .replaceAll("'", "''")}'`;
}

function isCompletePublishedArticle(article) {
  return Boolean(
    article.is_published &&
      article.title_fr?.trim() &&
      article.title_en?.trim() &&
      article.body_fr?.trim() &&
      article.body_en?.trim() &&
      article.date &&
      article.slug,
  );
}

function newestFirst(left, right) {
  return (
    String(right.date).localeCompare(String(left.date)) ||
    Number(right.drupal_node_id) - Number(left.drupal_node_id)
  );
}

const payload = JSON.parse(await readFile(inputPath, "utf8"));
const imageManifest = imageManifestPath
  ? JSON.parse(await readFile(imageManifestPath, "utf8"))
  : null;

function normalizeDrupalImageUrl(value) {
  try {
    const parsed = new URL(String(value || ""), "https://www.oss-online.org");
    if (!/^(?:www\.)?oss-online\.org$/i.test(parsed.hostname)) return null;
    if (!parsed.pathname.startsWith("/sites/default/files/")) return null;
    parsed.protocol = "https:";
    parsed.hostname = "www.oss-online.org";
    parsed.search = "";
    parsed.hash = "";
    return parsed.href;
  } catch {
    return null;
  }
}

function migratedImagePath(value) {
  if (!imageManifest) return null;
  const normalized = normalizeDrupalImageUrl(value);
  return normalized ? imageManifest.images?.[normalized]?.local_path || null : null;
}

function allowedUrl(value, allowLocal = true) {
  const url = String(value || "").trim();
  if (allowLocal && url.startsWith("/")) return url;
  return /^(?:https?:\/\/|mailto:)/i.test(url) ? url : "";
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function readAttribute(source, name) {
  const match = String(source || "").match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? match[1] ?? match[2] ?? match[3] ?? "" : "";
}

// Used only when dependencies have not been installed yet. The normal path
// uses sanitize-html; this fallback lets the checked-in SQL be regenerated
// without weakening the allowlist or trusting Drupal attributes.
function sanitizeDrupalHtmlFallback(value) {
  const allowedContainers = new Set([
    "p", "h2", "h3", "h4", "strong", "em", "s", "ul", "ol", "li", "blockquote",
    "figure", "figcaption",
  ]);

  return String(value || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(?:script|style|textarea|option|noscript)\b[^>]*>[\s\S]*?<\/(?:script|style|textarea|option|noscript)\s*>/gi, "")
    .replace(/<\/?[a-z][^>]*>/gi, (tag) => {
      const parsed = tag.match(/^<\s*(\/?)\s*([a-z0-9]+)/i);
      if (!parsed) return "";
      const closing = Boolean(parsed[1]);
      let name = parsed[2].toLowerCase();
      if (name === "h1") name = "h2";
      if (["h5", "h6"].includes(name)) name = "h4";
      if (name === "b") name = "strong";
      if (name === "i") name = "em";

      if (name === "br" || name === "hr") return closing ? "" : `<${name}>`;
      if (allowedContainers.has(name)) return closing ? `</${name}>` : `<${name}>`;

      if (name === "a") {
        if (closing) return "</a>";
        const href = allowedUrl(readAttribute(tag, "href"));
        if (!href) return "";
        const title = readAttribute(tag, "title");
        const target = readAttribute(tag, "target") === "_blank" ? "_blank" : "";
        return `<a href="${escapeAttribute(href)}"${title ? ` title="${escapeAttribute(title)}"` : ""}${target ? ' target="_blank" rel="noopener noreferrer"' : ""}>`;
      }

      if (name === "img" && !closing) {
        const src = migratedImagePath(readAttribute(tag, "src"));
        if (!src) return "";
        const alt = readAttribute(tag, "alt");
        const title = readAttribute(tag, "title");
        return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${title ? ` title="${escapeAttribute(title)}"` : ""} loading="lazy">`;
      }

      return "";
    })
    .replace(/<p>\s*(?:&nbsp;|<br>)*\s*<\/p>/gi, "")
    .trim();
}

function sanitizeDrupalHtml(value) {
  if (!sanitizeHtml) return sanitizeDrupalHtmlFallback(value);
  return sanitizeHtml(String(value || ""), {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "em", "s", "ul", "ol", "li",
      "blockquote", "a", "img", "figure", "figcaption", "hr",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
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
      img: (_tagName, attribs) => {
        const localPath = migratedImagePath(attribs.src);
        return {
          tagName: "img",
          attribs: {
            ...attribs,
            src: localPath || "",
            loading: "lazy",
          },
        };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
    disallowedTagsMode: "discard",
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  })
    .replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, "")
    .trim();
}

function migratedImages(article) {
  if (!imageManifest) return article.images || [];
  return (article.images || [])
    .map(migratedImagePath)
    .filter(Boolean);
}

const selected = payload.articles
  .filter(isCompletePublishedArticle)
  .sort(newestFirst)
  .slice(0, limit);

if (selected.length === 0) {
  throw new Error("No complete published Drupal articles were found.");
}

const values = selected
  .map(
    (article) => `  (${sqlText(article.title_fr)},
   ${sqlText(article.title_en)},
   ${sqlText(sanitizeDrupalHtml(article.body_fr))},
   ${sqlText(sanitizeDrupalHtml(article.body_en))},
   'partnership',
   ${sqlText(JSON.stringify(migratedImages(article)))}::jsonb,
   0,
   ${sqlText(article.date)}::date,
   ${sqlText(article.slug)})`,
  )
  .join(",\n\n");

const sourceList = selected
  .map(
    (article) =>
      `--   Drupal node ${article.drupal_node_id} | ${article.date} | ${article.slug}`,
  )
  .join("\n");
const imageComment = imageManifest
  ? "Drupal gallery and inline images use local optimized upload paths."
  : "Drupal gallery images retain remote URLs; inline images are omitted until a local image manifest is supplied.";

const sql = `-- Latest ${selected.length} complete, published Drupal news records.
-- Generated from backend/db/drupal-content.json.
-- ${imageComment} Every initial category is partnership.
-- The conflict clause makes this file safe to apply again by canonical slug.
${sourceList}

BEGIN;

INSERT INTO news (
  title_fr,
  title_en,
  body_fr,
  body_en,
  category,
  images,
  thumbnail_index,
  date,
  slug
) VALUES
${values}
ON CONFLICT (slug) DO UPDATE SET
  title_fr = EXCLUDED.title_fr,
  title_en = EXCLUDED.title_en,
  body_fr = EXCLUDED.body_fr,
  body_en = EXCLUDED.body_en,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  thumbnail_index = EXCLUDED.thumbnail_index,
  date = EXCLUDED.date,
  index_status = 'pending',
  index_error = '',
  index_started_at = NULL,
  indexed_at = NULL,
  active_index_version = NULL,
  updated_at = NOW();

COMMIT;
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, sql, "utf8");

process.stdout.write(
  `${JSON.stringify(
    {
      output: outputPath,
      count: selected.length,
      articles: selected.map(({ drupal_node_id, date, slug, title_fr }) => ({
        drupal_node_id,
        date,
        slug,
        title_fr,
      })),
    },
    null,
    2,
  )}\n`,
);
