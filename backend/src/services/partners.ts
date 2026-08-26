import { query } from "../config/db.js";

export interface PartnerRow {
  id: number;
  page_id: number;
  name: string;
  image: string;
  row_number: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getPagePartners(pageId: number) {
  const result = await query(
    "SELECT * FROM partners WHERE page_id = $1 ORDER BY row_number ASC, sort_order ASC",
    [pageId],
  );
  return result.rows;
}

export async function listPartners(pageId: number) {
  const result = await query(
    "SELECT * FROM partners WHERE page_id = $1 ORDER BY row_number ASC, sort_order ASC",
    [pageId],
  );
  return result.rows;
}

export async function getPartner(id: number) {
  const result = await query("SELECT * FROM partners WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createPartner(data: {
  page_id: number;
  name: string;
  image?: string;
  row_number?: number;
  sort_order?: number;
}) {
  const result = await query(
    `INSERT INTO partners (page_id, name, image, row_number, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [
      data.page_id,
      data.name,
      data.image || "",
      data.row_number ?? 1,
      data.sort_order ?? 0,
    ],
  );
  return result.rows[0];
}

export async function updatePartner(id: number, data: Partial<PartnerRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = ["name", "image", "row_number", "sort_order"];

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
    `UPDATE partners SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
}

export async function deletePartner(id: number) {
  const result = await query("DELETE FROM partners WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
