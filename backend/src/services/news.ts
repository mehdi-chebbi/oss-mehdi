import { pool, query } from "../config/db.js";

export const NEWS_CATEGORIES = [
  "partnership",
  "event",
  "project",
  "institutional",
  "publication",
  "opportunity",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];
export type NewsIndexStatus = "pending" | "processing" | "ready" | "failed";

export function isNewsCategory(value: unknown): value is NewsCategory {
  return typeof value === "string" && NEWS_CATEGORIES.includes(value as NewsCategory);
}

export interface NewsRow {
  id: number;
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
  category: NewsCategory;
  images: string[];        // JSONB array of URL strings
  thumbnail_index: number; // which image is the card thumbnail
  date: string;            // ISO date string from DB
  slug: string;
  index_status: NewsIndexStatus;
  index_error: string;
  index_started_at: string | null;
  indexed_at: string | null;
  active_index_version: string | null;
  created_at: string;
  updated_at: string;
}

// ── Slug generation ──
// Derived from the English title (ASCII-safe, no accents), truncated to ~6 words,
// with the row ID appended to guarantee uniqueness without collision handling.
// Generated once at creation, never editable, never regenerated.

export function slugifyTitle(title: string): string {
  return (
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents
      .toLowerCase()
      .replace(/['']/g, "") // drop apostrophes (don't turn them into dashes)
      .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → dash
      .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
      .replace(/-{2,}/g, "-") // collapse multiple dashes
      .split("-")
      .filter(Boolean)
      .slice(0, 6) // max 6 words
      .join("-") || "article"
  );
}

// ── Normalize images array ──
// Ensures images is always a string[] (pg returns JSONB as already-parsed, but
// we guard against null/undefined/wrong-type from older rows or bad input).
function normalizeImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === "string");
}

// ── Clamp thumbnail_index to a valid range ──
function clampThumbnailIndex(idx: unknown, images: string[]): number {
  const n = typeof idx === "number" ? idx : 0;
  if (images.length === 0) return 0;
  return Math.min(Math.max(0, n), images.length - 1);
}

// ── Public: latest news (for the home page) ──
export async function getLatestNews(limit = 4) {
  const result = await query(
    `SELECT id, title_fr, title_en, body_fr, body_en, category, images, thumbnail_index, date, slug
     FROM news
     ORDER BY date DESC, id DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map((r: any) => ({
    ...r,
    images: normalizeImages(r.images),
    thumbnail_index: clampThumbnailIndex(r.thumbnail_index, normalizeImages(r.images)),
  }));
}

// ── Public: paginated list with optional year + keyword filter (for /news) ──
export async function listPublicNews(opts: {
  page?: number;
  limit?: number;
  year?: number;
  category?: NewsCategory;
  q?: string;
}): Promise<{ items: NewsRow[]; total: number }> {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(50, Math.max(1, opts.limit || 12));
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const params: unknown[] = [];

  if (opts.year) {
    params.push(opts.year);
    where.push(`EXTRACT(YEAR FROM date) = $${params.length}`);
  }

  if (opts.category) {
    params.push(opts.category);
    where.push(`category = $${params.length}`);
  }

  if (opts.q && opts.q.trim()) {
    params.push(`%${opts.q.trim()}%`);
    const idx = params.length;
    where.push(
      `(title_fr ILIKE $${idx} OR title_en ILIKE $${idx} OR body_fr ILIKE $${idx} OR body_en ILIKE $${idx})`,
    );
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await query(
    `SELECT COUNT(*)::int AS count FROM news ${whereClause}`,
    params,
  );
  const total = countResult.rows[0]?.count || 0;

  params.push(limit, offset);
  const result = await query(
    `SELECT id, title_fr, title_en, body_fr, body_en, category, images, thumbnail_index, date, slug
     FROM news
     ${whereClause}
     ORDER BY date DESC, id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const items = result.rows.map((r: any) => ({
    ...r,
    images: normalizeImages(r.images),
    thumbnail_index: clampThumbnailIndex(r.thumbnail_index, normalizeImages(r.images)),
  }));

  return { items, total };
}

// ── Public: single article by slug ──
export async function getPublicNewsBySlug(slug: string) {
  const result = await query(
    `SELECT id, title_fr, title_en, body_fr, body_en, category, images, thumbnail_index, date, slug, created_at
     FROM news
     WHERE slug = $1`,
    [slug],
  );
  if (!result.rows[0]) return null;
  const r = result.rows[0];
  const images = normalizeImages(r.images);
  return {
    ...r,
    images,
    thumbnail_index: clampThumbnailIndex(r.thumbnail_index, images),
  };
}

// ── Public: distinct article years (for the year filter) ──
export async function getPublicNewsYears() {
  const result = await query(
    `SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS year
     FROM news
     ORDER BY year DESC`,
  );
  return result.rows.map((r) => r.year) as number[];
}

// ── Authenticated: list all news (admin) ──
export async function listAllNews() {
  const result = await query(
    `SELECT id, title_fr, title_en, category, images, thumbnail_index, date, slug,
            index_status, index_error, index_started_at, indexed_at, active_index_version,
            created_at, updated_at
     FROM news
     ORDER BY date DESC, id DESC`,
  );
  return result.rows.map((r: any) => ({
    ...r,
    images: normalizeImages(r.images),
    thumbnail_index: clampThumbnailIndex(r.thumbnail_index, normalizeImages(r.images)),
  }));
}

// ── Authenticated: get single news (admin, includes body) ──
export async function getNews(id: number) {
  const result = await query("SELECT * FROM news WHERE id = $1", [id]);
  if (!result.rows[0]) return null;
  const r = result.rows[0];
  const images = normalizeImages(r.images);
  return {
    ...r,
    images,
    thumbnail_index: clampThumbnailIndex(r.thumbnail_index, images),
  };
}

// ── Authenticated: create news ──
// Slug is generated server-side: slugify(title_en) + "-" + id.
// Because the ID is only known after INSERT, we insert with a placeholder slug,
// then UPDATE with the final slug in the same logical operation.
export async function createNews(data: {
  title_fr: string;
  title_en: string;
  body_fr?: string;
  body_en?: string;
  category: NewsCategory;
  images?: string[];
  thumbnail_index?: number;
  date?: string;
}) {
  const images = normalizeImages(data.images);
  const thumbnail_index = clampThumbnailIndex(data.thumbnail_index, images);

  const result = await query(
    `INSERT INTO news (title_fr, title_en, body_fr, body_en, category, images, thumbnail_index, date, slug)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.title_fr,
      data.title_en,
      data.body_fr || "",
      data.body_en || "",
      data.category,
      JSON.stringify(images),
      thumbnail_index,
      data.date || new Date().toISOString().slice(0, 10),
      "placeholder", // will be replaced below
    ],
  );

  const row = result.rows[0];
  const finalSlug = `${slugifyTitle(data.title_en)}-${row.id}`;

  await query("UPDATE news SET slug = $1 WHERE id = $2", [finalSlug, row.id]);
  row.slug = finalSlug;
  row.images = normalizeImages(row.images);
  row.thumbnail_index = clampThumbnailIndex(row.thumbnail_index, row.images);
  return row;
}

// ── Authenticated: update news ──
// Slug is intentionally NOT updated on title change — URLs must stay stable.
export async function updateNews(id: number, data: Partial<NewsRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  // Handle images + thumbnail_index together so we can clamp the index
  // against the new image array in the same UPDATE.
  if ((data as any).images !== undefined) {
    const images = normalizeImages((data as any).images);
    fields.push(`images = $${idx++}`);
    values.push(JSON.stringify(images));

    // If thumbnail_index is also provided, use it (clamped); else keep current
    // by not touching it (the clamp happens on read via getNews).
    if ((data as any).thumbnail_index !== undefined) {
      fields.push(`thumbnail_index = $${idx++}`);
      values.push(clampThumbnailIndex((data as any).thumbnail_index, images));
    }
  } else if ((data as any).thumbnail_index !== undefined) {
    // thumbnail_index without images — clamp against existing (we don't know
    // the array here, so just store it; reads will clamp).
    fields.push(`thumbnail_index = $${idx++}`);
    values.push((data as any).thumbnail_index);
  }

  const allowed = [
    "title_fr",
    "title_en",
    "body_fr",
    "body_en",
    "category",
    "date",
  ];

  for (const key of allowed) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push((data as any)[key]);
    }
  }

  if (fields.length === 0) return null;

  fields.push("updated_at = NOW()");
  values.push(id);

  const result = await query(
    `UPDATE news SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  if (!result.rows[0]) return null;
  const r = result.rows[0];
  r.images = normalizeImages(r.images);
  r.thumbnail_index = clampThumbnailIndex(r.thumbnail_index, r.images);
  return r;
}

// ── Authenticated: delete news ──
export async function deleteNews(id: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("DELETE FROM news WHERE id = $1 RETURNING id", [id]);
    if (result.rows[0]) {
      await client.query("DELETE FROM knowledge_chunks WHERE source_type = 'news' AND source_id = $1", [String(id)]);
    }
    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function queueNewsIndexing(id: number) {
  const result = await query(
    `UPDATE news SET
       index_status = 'pending', index_error = '', index_started_at = NULL, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id],
  );
  return (result.rows[0] as NewsRow) || null;
}
