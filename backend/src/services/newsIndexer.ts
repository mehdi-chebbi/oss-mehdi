import { v4 as uuidv4 } from "uuid";
import { pool, query } from "../config/db.js";
import { env } from "../config/env.js";
import { embedTexts } from "./resourceIndexer.js";
import type { NewsRow } from "./news.js";

const POLL_INTERVAL_MS = 5_000;
const STALE_PROCESSING_MINUTES = 20;
const WORDS_PER_CHUNK = 420;
const WORD_OVERLAP = 60;
const EMBEDDING_BATCH_SIZE = 24;

type NewsLanguage = "fr" | "en";
type IndexableNews = NewsRow & { claimed_at: string };
type NewsChunk = {
  language: NewsLanguage;
  chunkIndex: number;
  content: string;
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function chunkArticle(title: string, body: string, language: NewsLanguage) {
  const cleanTitle = cleanText(title);
  const words = cleanText(body).split(/\s+/).filter(Boolean);
  const chunks: NewsChunk[] = [];
  const step = WORDS_PER_CHUNK - WORD_OVERLAP;

  if (words.length === 0) {
    return [{ language, chunkIndex: 0, content: cleanTitle }];
  }

  for (let offset = 0; offset < words.length; offset += step) {
    const bodyChunk = words.slice(offset, offset + WORDS_PER_CHUNK).join(" ");
    chunks.push({
      language,
      chunkIndex: chunks.length,
      content: `${cleanTitle}\n\n${bodyChunk}`,
    });
    if (offset + WORDS_PER_CHUNK >= words.length) break;
  }
  return chunks;
}

async function claimNextNews() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT * FROM news
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
      `UPDATE news
       SET index_status = 'processing', index_error = '', index_started_at = $2
       WHERE id = $1 RETURNING *`,
      [result.rows[0].id, claimedAt],
    );
    await client.query("COMMIT");
    return { ...claimed.rows[0], claimed_at: claimedAt } as IndexableNews;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function indexNews(article: IndexableNews) {
  try {
    const metadata = `Publication date: ${article.date}\nCategory: ${article.category}`;
    const chunks = [
      ...chunkArticle(article.title_fr, article.body_fr, "fr"),
      ...chunkArticle(article.title_en, article.body_en, "en"),
    ].map((chunk) => ({ ...chunk, content: `${metadata}\n\n${chunk.content}` }));
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
           ) VALUES ('news', $1, $2, $3, NULL, NULL, $4, $5, $6::vector, $7)`,
          [String(article.id), version, chunk.language, chunk.chunkIndex, chunk.content,
            `[${vectors[index].join(",")}]`, env.openRouterEmbeddingModel],
        );
      }
      const activated = await client.query(
        `UPDATE news SET
           index_status = 'ready', index_error = '', indexed_at = NOW(),
           active_index_version = $3, index_started_at = NULL
         WHERE id = $1 AND index_status = 'processing' AND index_started_at = $2`,
        [article.id, article.claimed_at, version],
      );
      if (activated.rowCount !== 1) throw new Error("Article changed while it was being indexed");
      await client.query(
        `DELETE FROM knowledge_chunks
         WHERE source_type = 'news' AND source_id = $1 AND index_version <> $2`,
        [String(article.id), version],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    console.log(`[NEWS INDEX] Indexed ${article.id}: ${chunks.length} chunks`);
  } catch (error: any) {
    const message = String(error?.message || error || "Indexing failed").slice(0, 2_000);
    await query(
      `UPDATE news SET index_status = 'failed', index_error = $3, index_started_at = NULL
       WHERE id = $1 AND index_status = 'processing' AND index_started_at = $2`,
      [article.id, article.claimed_at, message],
    );
    console.error(`[NEWS INDEX] Failed ${article.id}: ${message}`);
  }
}

let workerBusy = false;

async function pollNewsIndex() {
  if (workerBusy || !env.openRouterApiKey) return;
  workerBusy = true;
  try {
    const article = await claimNextNews();
    if (article) await indexNews(article);
  } catch (error: any) {
    console.error("[NEWS INDEX] Worker error:", error?.message || error);
  } finally {
    workerBusy = false;
  }
}

export function startNewsIndexer() {
  void pollNewsIndex();
  const timer = setInterval(() => void pollNewsIndex(), POLL_INTERVAL_MS);
  timer.unref();
}
