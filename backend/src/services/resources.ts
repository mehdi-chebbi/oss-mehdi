import { pool, query } from "../config/db.js";

export const RESOURCE_DOCUMENT_TYPES = [
  "report",
  "study",
  "guide",
  "atlas",
  "policy_brief",
  "newsletter",
  "conference_document",
  "strategy",
  "other",
] as const;

export const RESOURCE_FIELDS = [
  "biodiversity",
  "climate",
  "water",
  "land",
  "institutional",
] as const;

export type ResourceDocumentType = (typeof RESOURCE_DOCUMENT_TYPES)[number];
export type ResourceField = (typeof RESOURCE_FIELDS)[number];
export type ResourceLanguage = "fr" | "en";
export type ResourceIndexStatus = "pending" | "processing" | "ready" | "failed";

export interface ResourceRow {
  id: string;
  title_fr: string;
  title_en: string;
  summary_fr: string;
  summary_en: string;
  document_type: ResourceDocumentType;
  fields: ResourceField[];
  publication_date: string;
  cover_image_path: string;
  cover_is_custom: boolean;
  file_fr_path: string | null;
  file_fr_original_name: string | null;
  file_fr_size: number | null;
  file_en_path: string | null;
  file_en_original_name: string | null;
  file_en_size: number | null;
  is_published: boolean;
  index_status: ResourceIndexStatus;
  index_error: string;
  index_started_at: string | null;
  indexed_at: string | null;
  active_index_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceInput {
  id: string;
  title_fr: string;
  title_en: string;
  summary_fr: string;
  summary_en: string;
  document_type: ResourceDocumentType;
  fields: ResourceField[];
  publication_date: string;
  cover_image_path: string;
  cover_is_custom: boolean;
  file_fr_path: string | null;
  file_fr_original_name: string | null;
  file_fr_size: number | null;
  file_en_path: string | null;
  file_en_original_name: string | null;
  file_en_size: number | null;
  is_published: boolean;
}

export function isResourceDocumentType(value: string): value is ResourceDocumentType {
  return RESOURCE_DOCUMENT_TYPES.includes(value as ResourceDocumentType);
}

export function isResourceField(value: string): value is ResourceField {
  return RESOURCE_FIELDS.includes(value as ResourceField);
}

export async function listPublishedResources(options: {
  page: number;
  limit: number;
  documentType?: ResourceDocumentType;
  field?: ResourceField;
  year?: number;
  language?: ResourceLanguage;
  q?: string;
}) {
  const conditions = ["is_published = true"];
  const values: unknown[] = [];

  const addValue = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (options.documentType) {
    conditions.push(`document_type = ${addValue(options.documentType)}`);
  }
  if (options.field) {
    conditions.push(`${addValue(options.field)} = ANY(fields)`);
  }
  if (options.year) {
    conditions.push(`EXTRACT(YEAR FROM publication_date) = ${addValue(options.year)}`);
  }
  if (options.language === "fr") conditions.push("file_fr_path IS NOT NULL");
  if (options.language === "en") conditions.push("file_en_path IS NOT NULL");
  if (options.q?.trim()) {
    const search = addValue(`%${options.q.trim()}%`);
    conditions.push(`(
      title_fr ILIKE ${search}
      OR title_en ILIKE ${search}
      OR summary_fr ILIKE ${search}
      OR summary_en ILIKE ${search}
    )`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await query(`SELECT COUNT(*)::int AS total FROM resources ${where}`, values);
  const total = Number(countResult.rows[0]?.total || 0);

  const offsetPlaceholder = addValue((options.page - 1) * options.limit);
  const limitPlaceholder = addValue(options.limit);
  const result = await query(
    `SELECT * FROM resources
     ${where}
     ORDER BY publication_date DESC, created_at DESC
     OFFSET ${offsetPlaceholder} LIMIT ${limitPlaceholder}`,
    values,
  );

  return { items: result.rows as ResourceRow[], total };
}

export async function getPublishedResourceYears() {
  const result = await query(
    `SELECT DISTINCT EXTRACT(YEAR FROM publication_date)::int AS year
     FROM resources
     WHERE is_published = true
     ORDER BY year DESC`,
  );
  return result.rows.map((row) => Number(row.year));
}

export async function listAllResources() {
  const result = await query(
    "SELECT * FROM resources ORDER BY publication_date DESC, created_at DESC",
  );
  return result.rows as ResourceRow[];
}

export async function getResource(id: string) {
  const result = await query("SELECT * FROM resources WHERE id = $1", [id]);
  return (result.rows[0] as ResourceRow) || null;
}

export async function createResource(data: ResourceInput) {
  const result = await query(
    `INSERT INTO resources (
      id, title_fr, title_en, summary_fr, summary_en, document_type, fields,
      publication_date, cover_image_path, cover_is_custom,
      file_fr_path, file_fr_original_name, file_fr_size,
      file_en_path, file_en_original_name, file_en_size, is_published
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7::text[],
      $8, $9, $10,
      $11, $12, $13,
      $14, $15, $16, $17
    ) RETURNING *`,
    [
      data.id,
      data.title_fr,
      data.title_en,
      data.summary_fr,
      data.summary_en,
      data.document_type,
      data.fields,
      data.publication_date,
      data.cover_image_path,
      data.cover_is_custom,
      data.file_fr_path,
      data.file_fr_original_name,
      data.file_fr_size,
      data.file_en_path,
      data.file_en_original_name,
      data.file_en_size,
      data.is_published,
    ],
  );
  return result.rows[0] as ResourceRow;
}

export async function updateResource(id: string, data: Omit<ResourceInput, "id">) {
  const result = await query(
    `UPDATE resources SET
      title_fr = $1,
      title_en = $2,
      summary_fr = $3,
      summary_en = $4,
      document_type = $5,
      fields = $6::text[],
      publication_date = $7,
      cover_image_path = $8,
      cover_is_custom = $9,
      file_fr_path = $10,
      file_fr_original_name = $11,
      file_fr_size = $12,
      file_en_path = $13,
      file_en_original_name = $14,
      file_en_size = $15,
      is_published = $16,
      updated_at = NOW()
     WHERE id = $17
     RETURNING *`,
    [
      data.title_fr,
      data.title_en,
      data.summary_fr,
      data.summary_en,
      data.document_type,
      data.fields,
      data.publication_date,
      data.cover_image_path,
      data.cover_is_custom,
      data.file_fr_path,
      data.file_fr_original_name,
      data.file_fr_size,
      data.file_en_path,
      data.file_en_original_name,
      data.file_en_size,
      data.is_published,
      id,
    ],
  );
  return (result.rows[0] as ResourceRow) || null;
}

export async function deleteResourceRecord(id: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("DELETE FROM resources WHERE id = $1 RETURNING *", [id]);
    if (result.rows[0]) {
      await client.query("DELETE FROM knowledge_chunks WHERE source_type = 'resource' AND source_id = $1", [id]);
    }
    await client.query("COMMIT");
    return (result.rows[0] as ResourceRow) || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function queueResourceIndexing(id: string) {
  const result = await query(
    `UPDATE resources SET
       index_status = 'pending', index_error = '', index_started_at = NULL, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id],
  );
  return (result.rows[0] as ResourceRow) || null;
}
