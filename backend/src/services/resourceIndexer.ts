import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { v4 as uuidv4 } from "uuid";
import { pool, query } from "../config/db.js";
import { env } from "../config/env.js";
import type { ResourceLanguage, ResourceRow } from "./resources.js";

const execFileAsync = promisify(execFile);
const POLL_INTERVAL_MS = 5_000;
const STALE_PROCESSING_MINUTES = 20;
const WORDS_PER_CHUNK = 420;
const WORD_OVERLAP = 60;
const EMBEDDING_BATCH_SIZE = 24;

type IndexableResource = ResourceRow & { claimed_at: string };

type TextChunk = {
  language: ResourceLanguage;
  pageStart: number;
  pageEnd: number;
  chunkIndex: number;
  content: string;
};

function localPdfPath(publicPath: string) {
  const prefix = "/uploads/resources/files/";
  if (!publicPath.startsWith(prefix)) throw new Error("Invalid resource PDF path");
  const filesRoot = path.resolve(process.cwd(), "uploads", "resources", "files");
  const relativePath = decodeURIComponent(publicPath.slice(prefix.length));
  const resolved = path.resolve(filesRoot, relativePath);
  const staysInsideFilesRoot = resolved.startsWith(`${filesRoot}${path.sep}`);
  if (!relativePath || !staysInsideFilesRoot || path.extname(resolved).toLowerCase() !== ".pdf") {
    throw new Error("Invalid resource PDF filename");
  }
  return resolved;
}

function cleanPageText(value: string) {
  return value
    .replace(/([\p{L}\p{N}])-\s*\r?\n\s*([\p{L}\p{N}])/gu, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractPdfPages(publicPath: string) {
  const pdfPath = localPdfPath(publicPath);
  const info = await execFileAsync("pdfinfo", [pdfPath], { maxBuffer: 4 * 1024 * 1024 });
  const pageMatch = info.stdout.match(/^Pages:\s+(\d+)\s*$/im);
  const pageCount = Number(pageMatch?.[1] || 0);
  if (!pageCount || pageCount > 5_000) throw new Error("Could not determine a valid PDF page count");

  const pages: Array<{ page: number; words: string[] }> = [];
  for (let page = 1; page <= pageCount; page += 1) {
    const extracted = await execFileAsync(
      "pdftotext",
      ["-f", String(page), "-l", String(page), "-layout", pdfPath, "-"],
      { maxBuffer: 16 * 1024 * 1024 },
    );
    const text = cleanPageText(extracted.stdout);
    if (text) pages.push({ page, words: text.split(/\s+/) });
  }
  return pages;
}

function chunkPages(
  pages: Array<{ page: number; words: string[] }>,
  language: ResourceLanguage,
) {
  const tokens = pages.flatMap(({ page, words }) => words.map((word) => ({ word, page })));
  const chunks: TextChunk[] = [];
  const step = WORDS_PER_CHUNK - WORD_OVERLAP;

  for (let offset = 0; offset < tokens.length; offset += step) {
    const slice = tokens.slice(offset, offset + WORDS_PER_CHUNK);
    if (slice.length === 0) break;
    chunks.push({
      language,
      pageStart: slice[0].page,
      pageEnd: slice[slice.length - 1].page,
      chunkIndex: chunks.length,
      content: slice.map(({ word }) => word).join(" "),
    });
    if (offset + WORDS_PER_CHUNK >= tokens.length) break;
  }
  return chunks;
}

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function embedTexts(texts: string[], inputType: "search_document" | "search_query") {
  if (!env.openRouterApiKey) throw new Error("OPENROUTER_API_KEY is not configured");
  if (texts.length === 0) return [] as number[][];

  let lastError = "Embedding request failed";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.allowedOrigins[0] || "http://localhost:3000",
          "X-OpenRouter-Title": "OSS Resource Indexer",
        },
        body: JSON.stringify({
          model: env.openRouterEmbeddingModel,
          input: texts,
          dimensions: env.embeddingDimensions,
          input_type: inputType,
        }),
      });

      if (!response.ok) {
        lastError = `OpenRouter embeddings returned ${response.status}: ${(await response.text()).slice(0, 400)}`;
        if (response.status < 500 && response.status !== 429) break;
        throw new Error(lastError);
      }

      const body = await response.json() as {
        data?: Array<{ index?: number; embedding?: number[] }>;
      };
      const ordered = [...(body.data || [])].sort((a, b) => (a.index || 0) - (b.index || 0));
      const embeddings = ordered.map((item) => item.embedding || []);
      if (embeddings.length !== texts.length || embeddings.some((item) => item.length !== env.embeddingDimensions)) {
        throw new Error("Embedding response had an unexpected size");
      }
      return embeddings;
    } catch (error: any) {
      lastError = error?.message || lastError;
      if (attempt < 3) await wait(attempt * 1_000);
    }
  }
  throw new Error(lastError);
}

async function claimNextResource() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT * FROM resources
       WHERE index_status = 'pending'
          OR (index_status = 'processing' AND index_started_at < NOW() - ($1 * INTERVAL '1 minute'))
       ORDER BY updated_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 1`,
      [STALE_PROCESSING_MINUTES],
    );
    if (!result.rows[0]) {
      await client.query("COMMIT");
      return null;
    }
    const claimedAt = new Date().toISOString();
    const claimed = await client.query(
      `UPDATE resources
       SET index_status = 'processing', index_error = '', index_started_at = $2
       WHERE id = $1 RETURNING *`,
      [result.rows[0].id, claimedAt],
    );
    await client.query("COMMIT");
    return { ...claimed.rows[0], claimed_at: claimedAt } as IndexableResource;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function buildChunks(resource: IndexableResource) {
  const files: Array<{ language: ResourceLanguage; filePath: string }> = [];
  if (resource.file_fr_path) files.push({ language: "fr", filePath: resource.file_fr_path });
  if (resource.file_en_path) files.push({ language: "en", filePath: resource.file_en_path });

  const chunks: TextChunk[] = [];
  const warnings: string[] = [];
  for (const file of files) {
    try {
      const pages = await extractPdfPages(file.filePath);
      const languageChunks = chunkPages(pages, file.language);
      if (languageChunks.length === 0) throw new Error("no selectable text found");
      chunks.push(...languageChunks);
    } catch (error: any) {
      warnings.push(`${file.language.toUpperCase()}: ${error?.message || "text extraction failed"}`);
    }
  }
  if (chunks.length === 0) throw new Error(warnings.join(" | ") || "No PDF text could be indexed");
  return { chunks, warnings };
}

async function indexResource(resource: IndexableResource) {
  try {
    const { chunks, warnings } = await buildChunks(resource);
    const vectors: number[][] = [];
    for (let offset = 0; offset < chunks.length; offset += EMBEDDING_BATCH_SIZE) {
      const batch = chunks.slice(offset, offset + EMBEDDING_BATCH_SIZE);
      vectors.push(...await embedTexts(batch.map((chunk) => chunk.content), "search_document"));
    }

    const version = uuidv4();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        await client.query(
          `INSERT INTO knowledge_chunks (
             source_type, source_id, index_version, language, page_start, page_end,
             chunk_index, content, embedding, embedding_model
           ) VALUES ('resource', $1, $2, $3, $4, $5, $6, $7, $8::vector, $9)`,
          [resource.id, version, chunk.language, chunk.pageStart, chunk.pageEnd,
            chunk.chunkIndex, chunk.content, `[${vectors[index].join(",")}]`, env.openRouterEmbeddingModel],
        );
      }
      const activated = await client.query(
        `UPDATE resources SET
           index_status = 'ready', index_error = $3, indexed_at = NOW(),
           active_index_version = $4, index_started_at = NULL
         WHERE id = $1 AND index_status = 'processing' AND index_started_at = $2`,
        [resource.id, resource.claimed_at, warnings.join(" | "), version],
      );
      if (activated.rowCount !== 1) throw new Error("Resource changed while it was being indexed");
      await client.query(
        "DELETE FROM knowledge_chunks WHERE source_type = 'resource' AND source_id = $1 AND index_version <> $2",
        [resource.id, version],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    console.log(`[RESOURCE INDEX] Indexed ${resource.id}: ${chunks.length} chunks`);
  } catch (error: any) {
    const message = String(error?.message || error || "Indexing failed").slice(0, 2_000);
    await query(
      `UPDATE resources SET index_status = 'failed', index_error = $3, index_started_at = NULL
       WHERE id = $1 AND index_status = 'processing' AND index_started_at = $2`,
      [resource.id, resource.claimed_at, message],
    );
    console.error(`[RESOURCE INDEX] Failed ${resource.id}: ${message}`);
  }
}

let workerBusy = false;

async function pollResourceIndex() {
  if (workerBusy || !env.openRouterApiKey) return;
  workerBusy = true;
  try {
    const resource = await claimNextResource();
    if (resource) await indexResource(resource);
  } catch (error: any) {
    console.error("[RESOURCE INDEX] Worker error:", error?.message || error);
  } finally {
    workerBusy = false;
  }
}

export function startResourceIndexer() {
  void pollResourceIndex();
  const timer = setInterval(() => void pollResourceIndex(), POLL_INTERVAL_MS);
  timer.unref();
}
