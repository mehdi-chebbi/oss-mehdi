import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const inputPath = resolve(process.argv[2] || "db/drupal-content.json");
const outputRoot = resolve(process.argv[3] || "../storage/uploads/news/drupal");
const manifestPath = resolve(process.argv[4] || "db/drupal-news-latest-10-images.json");
const requestedLimit = Number.parseInt(process.argv[5] || "10", 10);
const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 10;
const concurrency = 6;
const attempts = 3;

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

function bodyImageUrls(html) {
  const urls = [];
  const imagePattern = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi;
  for (const match of String(html || "").matchAll(imagePattern)) {
    const normalized = normalizeDrupalImageUrl(match[2]);
    if (normalized) urls.push(normalized);
  }
  return urls;
}

function articleImageUrls(article) {
  return [
    ...(article.images || []).map(normalizeDrupalImageUrl).filter(Boolean),
    ...bodyImageUrls(article.body_fr),
    ...bodyImageUrls(article.body_en),
  ];
}

function safeFileName(url) {
  const parsed = new URL(url);
  if (!/^www\.oss-online\.org$/i.test(parsed.hostname)) {
    throw new Error(`Unsupported image host: ${parsed.hostname}`);
  }
  if (!parsed.pathname.startsWith("/sites/default/files/")) {
    throw new Error(`Unsupported Drupal image path: ${parsed.pathname}`);
  }

  const originalBaseName = decodeURIComponent(basename(parsed.pathname));
  const cleanedBaseName = originalBaseName
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/[. ]+$/g, "")
    .slice(-120) || "image";
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
  const extension = extname(cleanedBaseName);
  const stem = extension ? cleanedBaseName.slice(0, -extension.length) : cleanedBaseName;
  return `${hash}-${stem}${extension.toLowerCase()}`;
}

async function existingFileSize(path) {
  try {
    const details = await stat(path);
    return details.isFile() && details.size > 0 ? details.size : 0;
  } catch {
    return 0;
  }
}

async function downloadOnce(url, destination) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  const temporaryPath = `${destination}.${process.pid}.part`;

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "OSS Drupal content migration/1.0" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(`Unexpected content type: ${contentType || "missing"}`);
    }
    if (!response.body) throw new Error("Response did not contain a body");

    await mkdir(dirname(destination), { recursive: true });
    await pipeline(Readable.fromWeb(response.body), createWriteStream(temporaryPath));
    const size = await existingFileSize(temporaryPath);
    if (size === 0) throw new Error("Downloaded file is empty");
    await rename(temporaryPath, destination);
    return { size, content_type: contentType };
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function downloadWithRetry(url, destination) {
  const currentSize = await existingFileSize(destination);
  if (currentSize > 0) return { status: "existing", size: currentSize, content_type: null };

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await downloadOnce(url, destination);
      return { status: "downloaded", ...result };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((accept) => setTimeout(accept, attempt * 750));
      }
    }
  }
  throw lastError;
}

async function mapWithConcurrency(items, workerCount, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(workerCount, items.length) }, () => runWorker()),
  );
  return results;
}

const payload = JSON.parse(await readFile(inputPath, "utf8"));
const articles = payload.articles
  .filter(isCompletePublishedArticle)
  .sort(newestFirst)
  .slice(0, limit);
const urls = [...new Set(articles.flatMap(articleImageUrls))];

await mkdir(outputRoot, { recursive: true });

const results = await mapWithConcurrency(urls, concurrency, async (url) => {
  let fileName;
  try {
    fileName = safeFileName(url);
    const destination = resolve(outputRoot, fileName);
    const result = await downloadWithRetry(url, destination);
    return {
      remote_url: url,
      local_path: `/uploads/news/drupal/${encodeURIComponent(fileName)}`,
      file_name: fileName,
      ...result,
    };
  } catch (error) {
    return {
      remote_url: url,
      local_path: null,
      file_name: fileName || null,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

const successful = results.filter((result) => result.local_path);
const failed = results.filter((result) => !result.local_path);
const manifest = {
  format_version: 1,
  generated_at: new Date().toISOString(),
  source: inputPath,
  output_root: outputRoot,
  article_ids: articles.map((article) => article.drupal_node_id),
  counts: {
    articles: articles.length,
    unique_urls: urls.length,
    downloaded: results.filter((result) => result.status === "downloaded").length,
    existing: results.filter((result) => result.status === "existing").length,
    failed: failed.length,
    bytes: successful.reduce((total, result) => total + Number(result.size || 0), 0),
  },
  images: Object.fromEntries(results.map((result) => [result.remote_url, result])),
};

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify(manifest.counts, null, 2)}\n`);
if (failed.length > 0) process.exitCode = 1;
