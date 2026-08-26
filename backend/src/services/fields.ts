import { query } from "../config/db.js";

export interface FieldRow {
  id: number;
  page_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image: string;
  gradient_hue: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Public: returns fields for a page, ordered by sort_order
export async function getPageFields(pageId: number) {
  const result = await query(
    "SELECT * FROM fields WHERE page_id = $1 ORDER BY sort_order ASC",
    [pageId],
  );
  return result.rows;
}

// Authenticated: list all fields for a page
export async function listFields(pageId: number) {
  const result = await query(
    "SELECT * FROM fields WHERE page_id = $1 ORDER BY sort_order ASC",
    [pageId],
  );
  return result.rows;
}

// Authenticated: get single field
export async function getField(id: number) {
  const result = await query("SELECT * FROM fields WHERE id = $1", [id]);
  return result.rows[0] || null;
}

// Authenticated: create field
export async function createField(data: {
  page_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image?: string;
  gradient_hue?: number;
  sort_order?: number;
}) {
  const result = await query(
    `INSERT INTO fields (page_id, title_fr, title_en, description_fr, description_en,
     image, gradient_hue, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      data.page_id,
      data.title_fr,
      data.title_en,
      data.description_fr,
      data.description_en,
      data.image || "/terre.jpg",
      data.gradient_hue ?? 120,
      data.sort_order ?? 0,
    ],
  );
  return result.rows[0];
}

// Authenticated: update field
export async function updateField(id: number, data: Partial<FieldRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = [
    "title_fr",
    "title_en",
    "description_fr",
    "description_en",
    "image",
    "gradient_hue",
    "sort_order",
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
    `UPDATE fields SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
}

// Authenticated: delete field
export async function deleteField(id: number) {
  const result = await query("DELETE FROM fields WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
