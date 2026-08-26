import { query } from "../config/db.js";

export interface ToolRow {
  id: number;
  page_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image: string;
  link: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Public: returns tools for a page, ordered by sort_order
export async function getPageTools(pageId: number) {
  const result = await query(
    "SELECT * FROM tools WHERE page_id = $1 ORDER BY sort_order ASC",
    [pageId],
  );
  return result.rows;
}

// Authenticated: list all tools for a page
export async function listTools(pageId: number) {
  const result = await query(
    "SELECT * FROM tools WHERE page_id = $1 ORDER BY sort_order ASC",
    [pageId],
  );
  return result.rows;
}

// Authenticated: get single tool
export async function getTool(id: number) {
  const result = await query("SELECT * FROM tools WHERE id = $1", [id]);
  return result.rows[0] || null;
}

// Authenticated: create tool
export async function createTool(data: {
  page_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image?: string;
  link?: string;
  sort_order?: number;
}) {
  const result = await query(
    `INSERT INTO tools (page_id, title_fr, title_en, description_fr, description_en,
     image, link, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      data.page_id,
      data.title_fr,
      data.title_en,
      data.description_fr,
      data.description_en,
      data.image || "/misland.jpg",
      data.link || "#",
      data.sort_order ?? 0,
    ],
  );
  return result.rows[0];
}

// Authenticated: update tool
export async function updateTool(id: number, data: Partial<ToolRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = [
    "title_fr",
    "title_en",
    "description_fr",
    "description_en",
    "image",
    "link",
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
    `UPDATE tools SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
}

// Authenticated: delete tool
export async function deleteTool(id: number) {
  const result = await query("DELETE FROM tools WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
