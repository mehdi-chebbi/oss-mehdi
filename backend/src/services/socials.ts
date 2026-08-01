import { query } from "../config/db.js";

export interface SocialRow {
  id: number;
  platform: string;
  url: string;
  icon_svg: string;
  icon_file: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getSocials() {
  const result = await query(
    "SELECT * FROM socials ORDER BY sort_order ASC",
  );
  return result.rows;
}

export async function getSocial(id: number) {
  const result = await query("SELECT * FROM socials WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createSocial(data: {
  platform: string;
  url: string;
  icon_svg?: string;
  icon_file?: string;
  sort_order?: number;
}) {
  const result = await query(
    `INSERT INTO socials (platform, url, icon_svg, icon_file, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [data.platform, data.url, data.icon_svg ?? "", data.icon_file ?? "", data.sort_order ?? 0],
  );
  return result.rows[0];
}

export async function updateSocial(id: number, data: Partial<SocialRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = ["platform", "url", "icon_svg", "icon_file", "sort_order"];

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
    `UPDATE socials SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
}

export async function deleteSocial(id: number) {
  const result = await query("DELETE FROM socials WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] ||= null;
}
