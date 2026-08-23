import { query } from "../config/db.js";
import { env } from "../config/env.js";
import { embedTexts } from "./resourceIndexer.js";
import type { ResourceLanguage } from "./resources.js";

export interface ResourceCitation {
  id: string;
  resourceId: string;
  titleFr: string;
  titleEn: string;
  language: ResourceLanguage;
  pageStart: number;
  pageEnd: number;
  filePath: string;
}

type RetrievedRow = {
  resource_id: string;
  title_fr: string;
  title_en: string;
  language: ResourceLanguage;
  page_start: number;
  page_end: number;
  content: string;
  file_path: string;
  distance: number | string;
};

export async function retrieveResourceContext(question: string) {
  const [vector] = await embedTexts([question], "search_query");
  const vectorLiteral = `[${vector.join(",")}]`;
  const result = await query(
    `SELECT
       c.resource_id, r.title_fr, r.title_en, c.language, c.page_start, c.page_end,
       c.content,
       CASE WHEN c.language = 'fr' THEN r.file_fr_path ELSE r.file_en_path END AS file_path,
       c.embedding <=> $1::vector AS distance
     FROM resource_chunks c
     JOIN resources r
       ON r.id = c.resource_id AND r.active_index_version = c.index_version
     WHERE r.is_published = true AND r.index_status = 'ready'
     ORDER BY c.embedding <=> $1::vector
     LIMIT 20`,
    [vectorLiteral],
  );

  const selected: RetrievedRow[] = [];
  const chunksPerResource = new Map<string, number>();
  const selectedLanguage = new Map<string, ResourceLanguage>();
  for (const row of result.rows as RetrievedRow[]) {
    if (Number(row.distance) > env.resourceRetrievalMaxDistance) continue;
    const language = selectedLanguage.get(row.resource_id);
    if (language && language !== row.language) continue;
    if (!language && selectedLanguage.size >= 3) continue;
    const count = chunksPerResource.get(row.resource_id) || 0;
    if (count >= 2) continue;
    selectedLanguage.set(row.resource_id, row.language);
    chunksPerResource.set(row.resource_id, count + 1);
    selected.push(row);
    if (selected.length >= 6) break;
  }

  const sourcesByResource = new Map<string, ResourceCitation>();
  for (const row of selected) {
    const existing = sourcesByResource.get(row.resource_id);
    if (existing) {
      existing.pageStart = Math.min(existing.pageStart, row.page_start);
      existing.pageEnd = Math.max(existing.pageEnd, row.page_end);
      continue;
    }
    sourcesByResource.set(row.resource_id, {
      id: `SOURCE_${sourcesByResource.size + 1}`,
      resourceId: row.resource_id,
      titleFr: row.title_fr,
      titleEn: row.title_en,
      language: row.language,
      pageStart: row.page_start,
      pageEnd: row.page_end,
      filePath: row.file_path,
    });
  }
  const sources = [...sourcesByResource.values()];

  const context = selected.map((row) => {
    const source = sourcesByResource.get(row.resource_id)!;
    const pages = row.page_start === row.page_end
      ? `page ${row.page_start}`
      : `pages ${row.page_start}-${row.page_end}`;
    return `[${source.id}] ${row.title_fr} / ${row.title_en} | ${row.language.toUpperCase()} | ${pages}\n${row.content}`;
  }).join("\n\n");

  return { sources, context };
}
