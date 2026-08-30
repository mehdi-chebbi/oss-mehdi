import { pool, query } from "../config/db.js";
import {
  AFRICAN_COUNTRIES,
  getAfricanCountry,
  isAfricanCountryCode,
  type AfricanCountry,
} from "../constants/africanCountries.js";

export type ProjectCountry = AfricanCountry;

export interface ProjectRow {
  id: number;
  department_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  results_fr: string;
  results_en: string;
  result_files: ProjectResultFile[];
  image: string;
  year_start: number | null;
  year_end: number | null;
  status: "en_cours" | "cloture";
  budget: string;
  beneficiary_country_codes: string[];
  countries: ProjectCountry[];
  country_codes?: string[];
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function normalizeCountryCodes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("At least one beneficiary country is required");
  }

  const countryCodes = [
    ...new Set(
      value
        .filter((code): code is string => typeof code === "string")
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean),
    ),
  ];

  if (countryCodes.length === 0) {
    throw new Error("At least one beneficiary country is required");
  }
  if (!countryCodes.every(isAfricanCountryCode)) {
    throw new Error("One or more beneficiary countries are invalid");
  }
  return countryCodes;
}

function withCountries<T extends { beneficiary_country_codes?: unknown }>(row: T) {
  const countryCodes = Array.isArray(row.beneficiary_country_codes)
    ? row.beneficiary_country_codes.filter(
        (code): code is string => typeof code === "string" && isAfricanCountryCode(code),
      )
    : [];

  return {
    ...row,
    countries: countryCodes
      .map(getAfricanCountry)
      .filter((country): country is AfricanCountry => Boolean(country)),
    country_codes: countryCodes,
  };
}

export async function listAfricanCountries() {
  return AFRICAN_COUNTRIES;
}

export interface ProjectResultFile {
  name_fr: string;
  name_en: string;
  url: string;
  mime_type?: string;
  size?: number;
}

function normalizeResultFiles(value: unknown): ProjectResultFile[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 50)
    .map((item) => {
      const file = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const url = typeof file.url === "string" ? file.url.trim().slice(0, 1000) : "";
      const isAllowedUrl =
        url.startsWith("/uploads/project-results/") ||
        /^https?:\/\//i.test(url);

      return {
        name_fr: typeof file.name_fr === "string" ? file.name_fr.trim().slice(0, 255) : "",
        name_en: typeof file.name_en === "string" ? file.name_en.trim().slice(0, 255) : "",
        url: isAllowedUrl ? url : "",
        mime_type:
          typeof file.mime_type === "string" ? file.mime_type.trim().slice(0, 150) : "",
        size:
          typeof file.size === "number" && Number.isFinite(file.size) && file.size >= 0
            ? file.size
            : undefined,
      };
    })
    .filter((file) => file.url);
}

// ── Slug generation ──
// Same approach as news/departments: slugify(title_en) + "-" + id, stable, never regenerated.
function slugify(text: string, fallback = "project"): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .split("-")
      .filter(Boolean)
      .slice(0, 6)
      .join("-") || fallback
  );
}

// ── Public: projects for a department (by dept slug) ──
// Joins departments so the response includes dept slug + title for breadcrumbs.
export async function getPublicProjectsByDeptSlug(deptSlug: string) {
  const result = await query(
    `SELECT p.id, p.title_fr, p.title_en, p.description_fr, p.description_en, p.image,
            p.year_start, p.year_end, p.status, p.budget, p.beneficiary_country_codes,
            p.slug, p.sort_order,
            d.slug AS department_slug, d.title_fr AS department_title_fr, d.title_en AS department_title_en
     FROM projects p
     JOIN departments d ON d.id = p.department_id
     WHERE d.slug = $1
     ORDER BY p.sort_order ASC, p.id ASC`,
    [deptSlug],
  );
  return result.rows.map(withCountries);
}

// ── Public: single project by slug ──
// Joins departments for breadcrumb context.
export async function getPublicProjectBySlug(slug: string) {
  const result = await query(
    `SELECT p.*, d.slug AS department_slug, d.title_fr AS department_title_fr, d.title_en AS department_title_en
     FROM projects p
     JOIN departments d ON d.id = p.department_id
     WHERE p.slug = $1`,
    [slug],
  );
  return result.rows[0] ? withCountries(result.rows[0]) : null;
}

// ── Authenticated: list all projects for a department ──
export async function listAllProjectsByDept(departmentId: number) {
  const result = await query(
    `SELECT p.id, p.title_fr, p.title_en, p.year_start, p.year_end, p.status, p.budget,
            p.beneficiary_country_codes, p.slug, p.sort_order, p.created_at, p.updated_at
     FROM projects p
     WHERE p.department_id = $1
     ORDER BY p.sort_order ASC, p.id ASC`,
    [departmentId],
  );
  return result.rows.map(withCountries);
}

// ── Authenticated: get single project (admin, includes full description) ──
export async function getProject(id: number) {
  const result = await query(
    `SELECT p.* FROM projects p
     WHERE p.id = $1`,
    [id],
  );
  return result.rows[0] ? withCountries(result.rows[0]) : null;
}

// ── Authenticated: create project ──
// Slug = slugify(title_en) + "-" + id. Insert with placeholder, then UPDATE.
export async function createProject(data: {
  department_id: number;
  title_fr: string;
  title_en: string;
  description_fr?: string;
  description_en?: string;
  results_fr?: string;
  results_en?: string;
  result_files?: ProjectResultFile[];
  image?: string;
  year_start?: number | null;
  year_end?: number | null;
  status?: "en_cours" | "cloture";
  budget?: string;
  sort_order?: number;
  country_codes: string[];
}) {
  const countryCodes = normalizeCountryCodes(data.country_codes);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO projects (department_id, title_fr, title_en, description_fr, description_en,
       results_fr, results_en, result_files, image, year_start, year_end, status, budget,
       beneficiary_country_codes, slug, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14::text[], $15, $16)
       RETURNING *`,
      [
        data.department_id,
        data.title_fr,
        data.title_en,
        data.description_fr || "",
        data.description_en || "",
        data.results_fr || "",
        data.results_en || "",
        JSON.stringify(normalizeResultFiles(data.result_files)),
        data.image || "",
        data.year_start ?? null,
        data.year_end ?? null,
        data.status || "en_cours",
        data.budget || "",
        countryCodes,
        "placeholder",
        data.sort_order ?? 0,
      ],
    );

    const row = result.rows[0];
    const finalSlug = `${slugify(data.title_en)}-${row.id}`;
    await client.query("UPDATE projects SET slug = $1 WHERE id = $2", [finalSlug, row.id]);
    await client.query("COMMIT");
    return getProject(row.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ── Authenticated: update project ──
// Slug is intentionally NOT updated on title change — URLs must stay stable.
export async function updateProject(
  id: number,
  data: Partial<ProjectRow> & { country_codes?: string[] },
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = [
    "department_id",
    "title_fr",
    "title_en",
    "description_fr",
    "description_en",
    "results_fr",
    "results_en",
    "result_files",
    "image",
    "year_start",
    "year_end",
    "status",
    "budget",
    "sort_order",
  ];

  for (const key of allowed) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${key} = $${idx++}${key === "result_files" ? "::jsonb" : ""}`);
      values.push(
        key === "result_files"
          ? JSON.stringify(normalizeResultFiles((data as any)[key]))
          : (data as any)[key],
      );
    }
  }

  if (data.country_codes !== undefined) {
    fields.push(`beneficiary_country_codes = $${idx++}::text[]`);
    values.push(normalizeCountryCodes(data.country_codes));
  }

  if (fields.length === 0) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    fields.push("updated_at = NOW()");
    values.push(id);
    const result = await client.query(
      `UPDATE projects SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id`,
      values,
    );
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("COMMIT");
    return getProject(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ── Authenticated: delete project ──
export async function deleteProject(id: number) {
  const result = await query("DELETE FROM projects WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
