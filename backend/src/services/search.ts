import { query } from "../config/db.js";

export type SearchLocale = "fr" | "en";

export interface NewsSearchResult {
  id: number;
  type: "news";
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  score: number;
}

export interface ProjectSearchResult {
  id: number;
  type: "project";
  title: string;
  excerpt: string;
  slug: string;
  thematic_slug: string;
  score: number;
}

export interface GlobalSearchResponse {
  news: NewsSearchResult[];
  projects: ProjectSearchResult[];
  totals: {
    news: number;
    projects: number;
  };
}

function plainText(value: unknown): string {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function excerptAround(content: unknown, searchTerm: string, maxLength = 220): string {
  const text = plainText(content);
  if (!text || text.length <= maxLength) return text;

  const matchIndex = text.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase());
  const start = matchIndex > 70 ? matchIndex - 70 : 0;
  const slice = text.slice(start, start + maxLength).trim();
  return `${start > 0 ? "..." : ""}${slice}${start + maxLength < text.length ? "..." : ""}`;
}

function preferredExcerptContent(searchTerm: string, ...values: unknown[]): string {
  const normalizedTerm = searchTerm.toLocaleLowerCase();
  const cleanedValues = values.map(plainText).filter(Boolean);
  return cleanedValues.find((value) => value.toLocaleLowerCase().includes(normalizedTerm)) || cleanedValues[0] || "";
}

export async function globalSearch(
  searchTerm: string,
  locale: SearchLocale,
  limit = 8,
): Promise<GlobalSearchResponse> {
  const normalizedTerm = searchTerm.trim().slice(0, 120);
  const pattern = `%${escapeLike(normalizedTerm)}%`;
  const tokenPatterns = normalizedTerm
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((token) => `%${escapeLike(token)}%`);
  const otherLocale: SearchLocale = locale === "fr" ? "en" : "fr";
  const titleColumn = `title_${locale}`;
  const otherTitleColumn = `title_${otherLocale}`;
  const newsBodyColumn = `body_${locale}`;
  const projectDescriptionColumn = `description_${locale}`;
  const projectResultsColumn = `results_${locale}`;

  const [newsRows, projectRows, newsCount, projectCount] = await Promise.all([
    query(
      `SELECT id, ${titleColumn} AS title, ${newsBodyColumn} AS content, slug, date,
              CASE
                WHEN LOWER(${titleColumn}) = LOWER($1) THEN 100
                WHEN LOWER(${otherTitleColumn}) = LOWER($1) THEN 95
                WHEN ${titleColumn} ILIKE $3 THEN 80
                WHEN ${otherTitleColumn} ILIKE $3 THEN 75
                WHEN ${newsBodyColumn} ILIKE $3 THEN 45
                ELSE 35
              END AS score
       FROM news
       WHERE NOT EXISTS (
         SELECT 1
         FROM unnest($2::text[]) AS search_token(pattern)
         WHERE NOT (CONCAT_WS(' ', title_fr, title_en, body_fr, body_en) ILIKE search_token.pattern)
       )
       ORDER BY score DESC, date DESC, id DESC
       LIMIT $4`,
      [normalizedTerm, tokenPatterns, pattern, limit],
    ),
    query(
      `SELECT p.id, p.${titleColumn} AS title, p.${projectDescriptionColumn} AS description,
              p.${projectResultsColumn} AS results, p.slug, t.slug AS thematic_slug,
              CASE
                WHEN LOWER(p.${titleColumn}) = LOWER($1) THEN 100
                WHEN LOWER(p.${otherTitleColumn}) = LOWER($1) THEN 95
                WHEN p.${titleColumn} ILIKE $3 THEN 80
                WHEN p.${otherTitleColumn} ILIKE $3 THEN 75
                WHEN p.${projectDescriptionColumn} ILIKE $3 OR p.${projectResultsColumn} ILIKE $3 THEN 45
                ELSE 35
              END AS score
       FROM projects p
       JOIN thematics t ON t.id = p.thematic_id
       WHERE NOT EXISTS (
         SELECT 1
         FROM unnest($2::text[]) AS search_token(pattern)
         WHERE NOT (
           CONCAT_WS(' ', p.title_fr, p.title_en, p.description_fr, p.description_en, p.results_fr, p.results_en)
           ILIKE search_token.pattern
         )
       )
       ORDER BY score DESC, p.updated_at DESC, p.id DESC
       LIMIT $4`,
      [normalizedTerm, tokenPatterns, pattern, limit],
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM news
       WHERE NOT EXISTS (
         SELECT 1
         FROM unnest($1::text[]) AS search_token(pattern)
         WHERE NOT (CONCAT_WS(' ', title_fr, title_en, body_fr, body_en) ILIKE search_token.pattern)
       )`,
      [tokenPatterns],
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM projects
       WHERE NOT EXISTS (
         SELECT 1
         FROM unnest($1::text[]) AS search_token(pattern)
         WHERE NOT (
           CONCAT_WS(' ', title_fr, title_en, description_fr, description_en, results_fr, results_en)
           ILIKE search_token.pattern
         )
       )`,
      [tokenPatterns],
    ),
  ]);

  const news = newsRows.rows.map((row): NewsSearchResult => ({
    id: Number(row.id),
    type: "news",
    title: plainText(row.title),
    excerpt: excerptAround(row.content, normalizedTerm),
    slug: String(row.slug),
    date: String(row.date),
    score: Number(row.score),
  }));

  const projects = projectRows.rows.map((row): ProjectSearchResult => ({
    id: Number(row.id),
    type: "project",
    title: plainText(row.title),
    excerpt: excerptAround(preferredExcerptContent(normalizedTerm, row.description, row.results), normalizedTerm),
    slug: String(row.slug),
    thematic_slug: String(row.thematic_slug),
    score: Number(row.score),
  }));

  return {
    news,
    projects,
    totals: {
      news: Number(newsCount.rows[0]?.count || 0),
      projects: Number(projectCount.rows[0]?.count || 0),
    },
  };
}
