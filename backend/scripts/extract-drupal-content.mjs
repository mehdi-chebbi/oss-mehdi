import { createReadStream, createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";

const SOURCE_BUNDLES = new Set(["actualite", "activite"]);
const SUPPORTED_LANGUAGES = new Set(["fr", "en"]);
const TABLE_PREFIX = "mod455_";
const DRUPAL_PUBLIC_FILES_URL = "https://www.oss-online.org/sites/default/files";

const inputPath = resolve(process.argv[2] || "../plexitw424_backup.sql.gz");
const outputPath = resolve(process.argv[3] || "db/drupal-content.json");

const nodes = new Map();
const aliasesByNode = new Map();
const filesById = new Map();
const imagesByNode = new Map();
const usedSlugs = new Set();

function articleFor(nodeId, bundle = null) {
  let article = nodes.get(nodeId);
  if (!article) {
    article = {
      drupal_node_id: nodeId,
      source_bundle: bundle,
      translations: {},
      source_type: null,
    };
    nodes.set(nodeId, article);
  } else if (bundle) {
    article.source_bundle = bundle;
  }
  return article;
}

function decodeMysqlEscape(character) {
  const escapes = {
    "0": "\0",
    b: "\b",
    n: "\n",
    r: "\r",
    t: "\t",
    Z: "\x1a",
  };
  return escapes[character] ?? character;
}

/**
 * Parses the VALUES portion of an extended MySQL INSERT statement.
 * This is deliberately limited to mysqldump literals: strings, numbers and NULL.
 */
function parseInsertRows(line) {
  const valuesIndex = line.indexOf(" VALUES ");
  if (valuesIndex === -1) return [];

  const rows = [];
  let row = null;
  let token = "";
  let quoted = false;
  let valueWasQuoted = false;
  let escaped = false;

  function pushValue() {
    const value = valueWasQuoted ? token : token.trim();
    row.push(!valueWasQuoted && value.toUpperCase() === "NULL" ? null : value);
    token = "";
    quoted = false;
    valueWasQuoted = false;
  }

  for (let index = valuesIndex + 8; index < line.length; index += 1) {
    const character = line[index];

    if (row === null) {
      if (character === "(") row = [];
      continue;
    }

    if (quoted) {
      if (escaped) {
        token += decodeMysqlEscape(character);
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === "'") {
        quoted = false;
      } else {
        token += character;
      }
      continue;
    }

    if (character === "'" && token.trim() === "") {
      token = "";
      quoted = true;
      valueWasQuoted = true;
    } else if (character === ",") {
      pushValue();
    } else if (character === ")") {
      pushValue();
      rows.push(row);
      row = null;
    } else {
      token += character;
    }
  }

  return rows;
}

function tableFromInsert(line) {
  const match = line.match(/^INSERT INTO `([^`]+)` VALUES /);
  return match?.[1] || null;
}

function cleanAlias(alias) {
  return String(alias || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

function publicFileUrl(uri) {
  const value = String(uri || "");
  if (!value.startsWith("public://")) return null;
  const encodedPath = value
    .slice("public://".length)
    .split("/")
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
  return `${DRUPAL_PUBLIC_FILES_URL}/${encodedPath}`;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .split("-")
    .filter(Boolean)
    .slice(0, 10)
    .join("-");
}

function uniqueSlug(preferred, nodeId) {
  const base = preferred || `drupal-article-${nodeId}`;
  let candidate = base;
  if (usedSlugs.has(candidate)) candidate = `${base}-drupal-${nodeId}`;
  let suffix = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${base}-drupal-${nodeId}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function unixDate(timestamp) {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

function categoryFor(article) {
  if (article.source_bundle === "activite") return "event";
  if (article.source_type === "evenement") return "event";
  return "institutional";
}

function handleNodeFieldData(row) {
  const [nid, , bundle, langcode, status, , title, created, changed] = row;
  if (!SOURCE_BUNDLES.has(bundle) || !SUPPORTED_LANGUAGES.has(langcode)) return;

  const article = articleFor(Number(nid), bundle);
  article.translations[langcode] = {
    ...(article.translations[langcode] || {}),
    title,
    body: article.translations[langcode]?.body || "",
    summary: article.translations[langcode]?.summary || "",
    body_format: article.translations[langcode]?.body_format || null,
    published: Number(status) === 1,
    created: unixDate(created),
    changed: unixDate(changed),
  };
}

function handleBody(row) {
  const [bundle, deleted, entityId, , langcode, delta, body, summary, format] = row;
  if (
    !SOURCE_BUNDLES.has(bundle) ||
    !SUPPORTED_LANGUAGES.has(langcode) ||
    Number(deleted) !== 0 ||
    Number(delta) !== 0
  ) {
    return;
  }

  const article = articleFor(Number(entityId), bundle);
  article.translations[langcode] = {
    title: article.translations[langcode]?.title || "",
    published: article.translations[langcode]?.published || false,
    created: article.translations[langcode]?.created || null,
    changed: article.translations[langcode]?.changed || null,
    body: body || "",
    summary: summary || "",
    body_format: format || null,
  };
}

function handleArticleType(row) {
  const [bundle, deleted, entityId, , , delta, type] = row;
  if (bundle !== "actualite" || Number(deleted) !== 0 || Number(delta) !== 0) return;
  articleFor(Number(entityId), bundle).source_type = type || null;
}

function handlePathAlias(row) {
  const [id, , , langcode, path, alias, status] = row;
  const match = String(path || "").match(/^\/node\/(\d+)$/);
  if (!match || Number(status) !== 1) return;

  const nodeId = Number(match[1]);
  const aliases = aliasesByNode.get(nodeId) || [];
  aliases.push({
    id: Number(id),
    language: langcode,
    path: cleanAlias(alias),
  });
  aliasesByNode.set(nodeId, aliases);
}

function handleFile(row) {
  const [fileId, , , , , uri, filemime, , status] = row;
  const url = publicFileUrl(uri);
  if (Number(status) !== 1 || !url || !String(filemime || "").startsWith("image/")) return;
  filesById.set(Number(fileId), url);
}

function handleImage(row, placement) {
  const [bundle, deleted, entityId, , langcode, delta, fileId] = row;
  if (!SOURCE_BUNDLES.has(bundle) || Number(deleted) !== 0) return;
  const nodeId = Number(entityId);
  const images = imagesByNode.get(nodeId) || [];
  images.push({
    placement,
    language: langcode,
    delta: Number(delta),
    fileId: Number(fileId),
  });
  imagesByNode.set(nodeId, images);
}

const handlers = new Map([
  [`${TABLE_PREFIX}node_field_data`, handleNodeFieldData],
  [`${TABLE_PREFIX}node__body`, handleBody],
  [`${TABLE_PREFIX}node__field_type_article`, handleArticleType],
  [`${TABLE_PREFIX}path_alias`, handlePathAlias],
  [`${TABLE_PREFIX}file_managed`, handleFile],
  [`${TABLE_PREFIX}node__field_top_image`, (row) => handleImage(row, "top")],
  [`${TABLE_PREFIX}node__field_activite_img_top`, (row) => handleImage(row, "top")],
  [`${TABLE_PREFIX}node__field_image_g`, (row) => handleImage(row, "gallery")],
]);

async function extract() {
  const input = createReadStream(inputPath);
  const lines = createInterface({
    input: input.pipe(createGunzip()),
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    const table = tableFromInsert(line);
    const handler = handlers.get(table);
    if (!handler) continue;
    for (const row of parseInsertRows(line)) handler(row);
  }

  const articles = [...nodes.values()]
    .filter((article) => SOURCE_BUNDLES.has(article.source_bundle))
    .sort((left, right) => left.drupal_node_id - right.drupal_node_id)
    .map((article) => {
      const aliases = (aliasesByNode.get(article.drupal_node_id) || [])
        .filter((entry) => entry.path)
        .sort((left, right) => left.id - right.id);
      const aliasFr = [...aliases].reverse().find((entry) => entry.language === "fr")?.path || null;
      const aliasEn = [...aliases].reverse().find((entry) => entry.language === "en")?.path || null;
      const generated = slugify(
        article.translations.en?.title || article.translations.fr?.title,
      );
      const canonicalSlug = uniqueSlug(
        slugify(aliasEn || aliasFr) || generated,
        article.drupal_node_id,
      );
      const translations = article.translations;
      const preferredDate = translations.fr?.created || translations.en?.created || null;
      const images = (imagesByNode.get(article.drupal_node_id) || [])
        .sort((left, right) => {
          const placementOrder = Number(left.placement === "gallery") - Number(right.placement === "gallery");
          const languageOrder = Number(left.language !== "fr") - Number(right.language !== "fr");
          return placementOrder || left.delta - right.delta || languageOrder;
        })
        .map((image) => filesById.get(image.fileId))
        .filter(Boolean);

      return {
        drupal_node_id: article.drupal_node_id,
        source_bundle: article.source_bundle,
        source_type: article.source_type,
        category: categoryFor(article),
        is_published: Object.values(translations).some((translation) => translation.published),
        date: preferredDate,
        slug: canonicalSlug,
        slug_fr: aliasFr,
        slug_en: aliasEn,
        legacy_paths: [...new Set(aliases.map((entry) => `/${entry.path}`))],
        title_fr: translations.fr?.title || "",
        title_en: translations.en?.title || "",
        body_fr: translations.fr?.body || "",
        body_en: translations.en?.body || "",
        summary_fr: translations.fr?.summary || "",
        summary_en: translations.en?.summary || "",
        published_fr: translations.fr?.published || false,
        published_en: translations.en?.published || false,
        images: [...new Set(images)],
        thumbnail_index: 0,
      };
    });

  const counts = articles.reduce(
    (result, article) => {
      result.total += 1;
      result[article.source_bundle] += 1;
      if (article.is_published) result.published += 1;
      if (article.title_fr && article.title_en) result.bilingual += 1;
      if (article.legacy_paths.length > 0) result.with_legacy_alias += 1;
      if (article.images.length > 0) result.with_images += 1;
      result.image_urls += article.images.length;
      return result;
    },
    {
      total: 0,
      actualite: 0,
      activite: 0,
      published: 0,
      bilingual: 0,
      with_legacy_alias: 0,
      with_images: 0,
      image_urls: 0,
    },
  );

  const payload = {
    format_version: 1,
    source: "Drupal MySQL dump",
    generated_at: new Date().toISOString(),
    notes: [
      "Image references are resolved from Drupal public:// URIs to public oss-online.org URLs.",
      "Drupal activite records map to the new event category.",
      "Drupal actualite/evenement records map to event; other actualite records map to institutional.",
      "Separate Drupal language aliases are retained alongside one canonical slug.",
      "Unpublished records remain in this review dataset and should be filtered before import if needed.",
    ],
    counts,
    articles,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await new Promise((accept, reject) => {
    const output = createWriteStream(outputPath, { encoding: "utf8" });
    output.on("error", reject);
    output.on("finish", accept);
    output.end(`${JSON.stringify(payload, null, 2)}\n`);
  });

  process.stdout.write(`Extracted ${counts.total} records to ${outputPath}\n`);
}

extract().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
