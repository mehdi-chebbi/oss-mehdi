import { query } from "../config/db.js";

export interface TeamRow {
  id: number;
  name: string;
  title_fr: string;
  title_en: string;
  diplomas_fr: string;
  diplomas_en: string;
  nationality_fr: string;
  nationality_en: string;
  image: string;
  department: string;
}

export async function getPublicTeam(department?: string) {
  if (department) {
    const result = await query(
      "SELECT * FROM team WHERE department = $1 ORDER BY id ASC",
      [department],
    );
    return result.rows;
  }
  const result = await query("SELECT * FROM team ORDER BY department, id ASC");
  return result.rows;
}

export async function listTeam(department?: string) {
  if (department) {
    const result = await query(
      "SELECT * FROM team WHERE department = $1 ORDER BY id ASC",
      [department],
    );
    return result.rows;
  }
  const result = await query("SELECT * FROM team ORDER BY department, id ASC");
  return result.rows;
}

export async function getTeamMember(id: number) {
  const result = await query("SELECT * FROM team WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createTeamMember(data: {
  name: string;
  title_fr?: string;
  title_en?: string;
  diplomas_fr?: string;
  diplomas_en?: string;
  nationality_fr?: string;
  nationality_en?: string;
  image?: string;
  department?: string;
}) {
  const result = await query(
    `INSERT INTO team (name, title_fr, title_en, diplomas_fr, diplomas_en, nationality_fr, nationality_en, image, department)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      data.name,
      data.title_fr || "",
      data.title_en || "",
      data.diplomas_fr || "",
      data.diplomas_en || "",
      data.nationality_fr || "",
      data.nationality_en || "",
      data.image || "",
      data.department || "direction",
    ],
  );
  return result.rows[0];
}

export async function updateTeamMember(id: number, data: Partial<TeamRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = ["name", "title_fr", "title_en", "diplomas_fr", "diplomas_en", "nationality_fr", "nationality_en", "image", "department"];

  for (const key of allowed) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push((data as any)[key]);
    }
  }

  if (fields.length === 0) return null;

  values.push(id);

  const result = await query(
    `UPDATE team SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
}

export async function deleteTeamMember(id: number) {
  const result = await query("DELETE FROM team WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
