import { query } from "../config/db.js";

export interface HomepageVideoRow {
  id: number;
  title_fr: string;
  title_en: string;
  video_url: string;
  poster_url: string;
  created_at: string;
  updated_at: string;
}

export async function getHomepageVideo(): Promise<HomepageVideoRow | null> {
  const result = await query("SELECT * FROM homepage_video WHERE id = 1");
  return result.rows[0] || null;
}

export async function saveHomepageVideo(data: {
  title_fr: string;
  title_en: string;
  video_url: string;
  poster_url: string;
}): Promise<HomepageVideoRow> {
  const result = await query(
    `INSERT INTO homepage_video (id, title_fr, title_en, video_url, poster_url)
     VALUES (1, $1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET
       title_fr = EXCLUDED.title_fr,
       title_en = EXCLUDED.title_en,
       video_url = EXCLUDED.video_url,
       poster_url = EXCLUDED.poster_url,
       updated_at = NOW()
     RETURNING *`,
    [data.title_fr, data.title_en, data.video_url, data.poster_url],
  );
  return result.rows[0];
}
