import { query } from "../config/db.js";

export interface HeroRow {
  id: number;
  page_id: number;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  cta_primary_label_fr: string;
  cta_primary_label_en: string;
  cta_primary_link: string;
  cta_secondary_label_fr: string;
  cta_secondary_label_en: string;
  cta_secondary_link: string;
  background_image: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Public: returns published hero for a page
export async function getPublishedHero(pageId: number) {
  const result = await query(
    "SELECT * FROM hero WHERE page_id = $1 AND is_published = true ORDER BY id DESC LIMIT 1",
    [pageId],
  );
  return result.rows[0] || null;
}

// Admin: list all hero entries
export async function listHero(pageId: number) {
  const result = await query("SELECT * FROM hero WHERE page_id = $1 ORDER BY id DESC", [pageId]);
  return result.rows;
}

// Admin: get single hero
export async function getHero(id: number) {
  const result = await query("SELECT * FROM hero WHERE id = $1", [id]);
  return result.rows[0] || null;
}

// Admin: create hero
export async function createHero(data: {
  page_id: number;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  cta_primary_label_fr: string;
  cta_primary_label_en: string;
  cta_primary_link?: string;
  cta_secondary_label_fr: string;
  cta_secondary_label_en: string;
  cta_secondary_link?: string;
  background_image?: string;
  is_published?: boolean;
}) {
  const result = await query(
    `INSERT INTO hero (page_id, title_fr, title_en, subtitle_fr, subtitle_en,
     cta_primary_label_fr, cta_primary_label_en, cta_primary_link,
     cta_secondary_label_fr, cta_secondary_label_en, cta_secondary_link,
     background_image, is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      data.page_id, data.title_fr, data.title_en, data.subtitle_fr, data.subtitle_en,
      data.cta_primary_label_fr, data.cta_primary_label_en, data.cta_primary_link || "#",
      data.cta_secondary_label_fr, data.cta_secondary_label_en, data.cta_secondary_link || "#",
      data.background_image || "/hero.jpg", data.is_published ?? true,
    ],
  );
  return result.rows[0];
}

// Admin: update hero
export async function updateHero(id: number, data: Partial<HeroRow>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = [
    "title_fr", "title_en", "subtitle_fr", "subtitle_en",
    "cta_primary_label_fr", "cta_primary_label_en", "cta_primary_link",
    "cta_secondary_label_fr", "cta_secondary_label_en", "cta_secondary_link",
    "background_image", "is_published",
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
    `UPDATE hero SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
}

// Admin: delete hero
export async function deleteHero(id: number) {
  const result = await query("DELETE FROM hero WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
