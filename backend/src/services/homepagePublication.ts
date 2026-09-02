import { query } from "../config/db.js";

export interface HomepagePublicationRow {
  id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image_url: string;
  url_fr: string | null;
  url_en: string | null;
  created_at: string;
  updated_at: string;
}

export async function getHomepagePublication(): Promise<HomepagePublicationRow | null> {
  const result = await query("SELECT * FROM homepage_publication WHERE id = 1");
  return result.rows[0] || null;
}

export async function saveHomepagePublication(data: {
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image_url: string;
  url_fr: string | null;
  url_en: string | null;
}): Promise<HomepagePublicationRow> {
  const result = await query(
    `INSERT INTO homepage_publication (
       id, title_fr, title_en, description_fr, description_en,
       image_url, url_fr, url_en
     ) VALUES (1, $1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       title_fr = EXCLUDED.title_fr,
       title_en = EXCLUDED.title_en,
       description_fr = EXCLUDED.description_fr,
       description_en = EXCLUDED.description_en,
       image_url = EXCLUDED.image_url,
       url_fr = EXCLUDED.url_fr,
       url_en = EXCLUDED.url_en,
       updated_at = NOW()
     RETURNING *`,
    [
      data.title_fr,
      data.title_en,
      data.description_fr,
      data.description_en,
      data.image_url,
      data.url_fr,
      data.url_en,
    ],
  );
  return result.rows[0];
}
