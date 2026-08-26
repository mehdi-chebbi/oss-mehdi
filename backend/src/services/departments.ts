import { query } from "../config/db.js";

export interface DepartmentRow {
  id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ── Slug generation ──
// Derived from the English title (ASCII-safe, no accents), truncated to ~6 words,
// with the row ID appended to guarantee uniqueness without collision handling.
// Generated once at creation, never editable, never regenerated — same approach
// as news (stable URLs for SEO).
function slugify(text: string, fallback = "department"): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents
      .toLowerCase()
      .replace(/['']/g, "") // drop apostrophes
      .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → dash
      .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
      .replace(/-{2,}/g, "-") // collapse multiple dashes
      .split("-")
      .filter(Boolean)
      .slice(0, 6) // max 6 words
      .join("-") || fallback
  );
}

// ── Public: departments ordered by sort_order ──
export async function getPublicDepartments() {
  const result = await query(
    `SELECT id, title_fr, title_en, description_fr, description_en, image, slug, sort_order
     FROM departments
     ORDER BY sort_order ASC, id ASC`,
  );
  return result.rows;
}

// ── Public: single department by slug ──
export async function getPublicDepartmentBySlug(slug: string) {
  const result = await query(
    `SELECT id, title_fr, title_en, description_fr, description_en, image, slug, sort_order, created_at
     FROM departments
     WHERE slug = $1`,
    [slug],
  );
  return result.rows[0] || null;
}

// ── Authenticated: list all departments (admin) ──
export async function listAllDepartments() {
  const result = await query(
    `SELECT id, title_fr, title_en, description_fr, description_en, image, slug, sort_order, created_at, updated_at
     FROM departments
     ORDER BY sort_order ASC, id ASC`,
  );
  return result.rows;
}

// ── Authenticated: get single department (admin) ──
export async function getDepartment(id: number) {
  const result = await query("SELECT * FROM departments WHERE id = $1", [id]);
  return result.rows[0] || null;
}

// ── Authenticated: create department ──
// Slug = slugify(title_en) + "-" + id. Insert with placeholder, then UPDATE
// with the final slug (ID only known after INSERT).
export async function createDepartment(data: {
  title_fr: string;
  title_en: string;
  description_fr?: string;
  description_en?: string;
  image?: string;
  sort_order?: number;
}) {
  const result = await query(
    `INSERT INTO departments (title_fr, title_en, description_fr, description_en, image, slug, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.title_fr,
      data.title_en,
      data.description_fr || "",
      data.description_en || "",
      data.image || "",
      "placeholder", // replaced below
      data.sort_order ?? 0,
    ],
  );

  const row = result.rows[0];
  const finalSlug = `${slugify(data.title_en)}-${row.id}`;

  await query("UPDATE departments SET slug = $1 WHERE id = $2", [finalSlug, row.id]);
  row.slug = finalSlug;
  return row;
}

// ── Authenticated: update department ──
// Slug is intentionally NOT updated on title change — URLs must stay stable.
export async function updateDepartment(id: number, data: Partial<DepartmentRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = [
    "title_fr",
    "title_en",
    "description_fr",
    "description_en",
    "image",
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
    `UPDATE departments SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
}

// ── Authenticated: delete department ──
export async function deleteDepartment(id: number) {
  const result = await query("DELETE FROM departments WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
