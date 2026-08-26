import { query } from "../config/db.js";
import { env } from "../config/env.js";
import { embedTexts } from "./resourceIndexer.js";
import type { ResourceLanguage } from "./resources.js";

export type KnowledgeSourceType = "resource" | "news";

export interface KnowledgeCitation {
  id: string;
  sourceType: KnowledgeSourceType;
  sourceId: string;
  titleFr: string;
  titleEn: string;
  language: ResourceLanguage;
  pageStart: number | null;
  pageEnd: number | null;
  filePath: string;
}

type RetrievedRow = {
  source_type: KnowledgeSourceType;
  source_id: string;
  title_fr: string;
  title_en: string;
  language: ResourceLanguage;
  page_start: number | null;
  page_end: number | null;
  content: string;
  file_path: string;
  published_at: string;
  category: string | null;
  distance: number | string;
  retrieval_score?: number;
};

function asksForRecentNews(question: string) {
  return /\b(latest|recent|newest|today|news|actualité|actualités|récent|récente|récentes|dernière|dernières)\b/i.test(question);
}

export async function retrieveResourceContext(question: string) {
  const [vector] = await embedTexts([question], "search_query");
  const vectorLiteral = `[${vector.join(",")}]`;
  const result = await query(
    `SELECT * FROM (
       (SELECT
          'resource'::text AS source_type, c.source_id, r.title_fr, r.title_en,
          c.language, c.page_start, c.page_end, c.content,
          CASE WHEN c.language = 'fr' THEN r.file_fr_path ELSE r.file_en_path END AS file_path,
          r.publication_date::text AS published_at, NULL::text AS category,
          c.embedding <=> $1::vector AS distance
        FROM knowledge_chunks c
        JOIN resources r
          ON c.source_id = r.id::text AND r.active_index_version = c.index_version
        WHERE c.source_type = 'resource' AND r.index_status = 'ready'
        ORDER BY c.embedding <=> $1::vector
        LIMIT 30)
       UNION ALL
       (SELECT
          'news'::text AS source_type, c.source_id, n.title_fr, n.title_en,
          c.language, c.page_start, c.page_end, c.content,
          '/news/' || n.slug AS file_path,
          n.date::text AS published_at, n.category,
          c.embedding <=> $1::vector AS distance
        FROM knowledge_chunks c
        JOIN news n
          ON c.source_id = n.id::text AND n.active_index_version = c.index_version
        WHERE c.source_type = 'news' AND n.index_status = 'ready'
        ORDER BY c.embedding <=> $1::vector
        LIMIT 30)
     ) AS candidates
     ORDER BY distance
     LIMIT 40`,
    [vectorLiteral],
  );

  const rows = result.rows as RetrievedRow[];
  const recentNewsQuery = asksForRecentNews(question);
  if (recentNewsQuery) {
    const now = Date.now();
    for (const row of rows) {
      const ageDays = Math.max(0, (now - Date.parse(row.published_at)) / 86_400_000);
      const newsBonus = row.source_type === "news" ? 0.08 + 0.12 * Math.exp(-ageDays / 365) : 0;
      row.retrieval_score = Number(row.distance) - newsBonus;
    }
    rows.sort((a, b) => (a.retrieval_score || 0) - (b.retrieval_score || 0));
  }

  const selected: RetrievedRow[] = [];
  const chunksPerSource = new Map<string, number>();
  const selectedLanguage = new Map<string, ResourceLanguage>();
  for (const row of rows) {
    const maxDistance = recentNewsQuery && row.source_type === "news"
      ? Math.max(env.resourceRetrievalMaxDistance, 0.78)
      : env.resourceRetrievalMaxDistance;
    if (Number(row.distance) > maxDistance) continue;
    const sourceKey = `${row.source_type}:${row.source_id}`;
    const language = selectedLanguage.get(sourceKey);
    if (language && language !== row.language) continue;
    if (!language && selectedLanguage.size >= 3) continue;
    const count = chunksPerSource.get(sourceKey) || 0;
    if (count >= 2) continue;
    selectedLanguage.set(sourceKey, row.language);
    chunksPerSource.set(sourceKey, count + 1);
    selected.push(row);
    if (selected.length >= 6) break;
  }

  const sourcesByKey = new Map<string, KnowledgeCitation>();
  for (const row of selected) {
    const sourceKey = `${row.source_type}:${row.source_id}`;
    const existing = sourcesByKey.get(sourceKey);
    if (existing) {
      if (row.page_start !== null) {
        existing.pageStart = existing.pageStart === null ? row.page_start : Math.min(existing.pageStart, row.page_start);
        existing.pageEnd = existing.pageEnd === null ? row.page_end : Math.max(existing.pageEnd, row.page_end || row.page_start);
      }
      continue;
    }
    sourcesByKey.set(sourceKey, {
      id: `SOURCE_${sourcesByKey.size + 1}`,
      sourceType: row.source_type,
      sourceId: row.source_id,
      titleFr: row.title_fr,
      titleEn: row.title_en,
      language: row.language,
      pageStart: row.page_start,
      pageEnd: row.page_end,
      filePath: row.file_path,
    });
  }
  const sources = [...sourcesByKey.values()];

  const context = selected.map((row) => {
    const source = sourcesByKey.get(`${row.source_type}:${row.source_id}`)!;
    const location = row.source_type === "news"
      ? `published ${row.published_at}${row.category ? `, category ${row.category}` : ""}`
      : row.page_start === row.page_end
        ? `page ${row.page_start}`
        : `pages ${row.page_start}-${row.page_end}`;
    return `[${source.id}] ${row.title_fr} / ${row.title_en} | ${row.language.toUpperCase()} | ${location}\n${row.content}`;
  }).join("\n\n");

  return { sources, context };
}
