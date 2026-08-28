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
  chunk_index: number;
  content: string;
  file_path: string;
  published_at: string;
  category: string | null;
  distance: number | string;
  anchor_matches?: number | string;
  term_matches?: number | string;
};

type LexicalSourceRow = {
  source_type: KnowledgeSourceType;
  source_id: string;
  published_at: string;
  category: string | null;
  metadata_anchor_matches: number | string;
  anchor_chunk_hits: number | string;
  anchor_matches: number | string;
  leading_anchor_matches: number | string;
  total_chunks: number | string;
  term_matches: number | string;
};

type RankedSource = {
  key: string;
  sourceType: KnowledgeSourceType;
  sourceId: string;
  publishedAt: string;
  category: string | null;
  bestDistance?: number;
  vectorRank?: number;
  lexicalRank?: number;
  metadataAnchorMatches: number;
  anchorChunkHits: number;
  anchorMatches: number;
  leadingAnchorMatches: number;
  totalChunks: number;
  termMatches: number;
  score: number;
};

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "and", "are", "avec", "avoir", "aux", "can", "ces",
  "cette", "dans", "des", "does", "dont", "elle", "elles", "est", "et", "for", "from",
  "give", "have", "how", "ils", "les", "leur", "leurs", "mais", "not", "nous", "ont",
  "our", "par", "pas", "plus", "pour", "que", "quel", "quelle", "quelles", "quels", "qui",
  "ses", "son", "sont", "sur", "the", "their", "them", "then", "this", "those", "tout",
  "une", "vous", "what", "when", "where", "which", "who", "with", "were", "was", "your",
  "just", "very", "long", "short", "text", "texte", "donne", "moi", "apres", "oss",
  "answer", "response", "reply", "bullet", "bullets", "brief", "bref",
]);

function toNumber(value: number | string | undefined) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSearchValue(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function currentQuestionFromRetrievalQuery(value: string) {
  const marker = "Current question: ";
  const markerIndex = value.lastIndexOf(marker);
  return markerIndex >= 0 ? value.slice(markerIndex + marker.length).trim() : value.trim();
}

function unique(values: string[], maximum: number) {
  return [...new Set(values.map(normalizeSearchValue).filter(Boolean))].slice(0, maximum);
}

function explicitAnchors(value: string) {
  const quotedPhrases = [...value.matchAll(/["“”«»]([^"“”«»]{2,120})["“”«»]/gu)]
    .map((match) => match[1]);
  const numbers = value.match(/\b(?:19|20)\d{2}\b|\b\d+(?:[.,]\d+)?(?:\s?(?:%|km2|km²|ha|eur|usd)|\s?€)/giu) || [];
  const acronyms = (value.match(/\b[\p{Lu}][\p{Lu}\p{N}-]{1,}\b/gu) || [])
    .filter((value) => !["OSS", "FR", "EN"].includes(value));
  const projectCodes = (value.match(/\b[\p{L}\p{N}]+-[\p{L}\p{N}-]+\b/gu) || [])
    .filter((value) => /\d|\p{Lu}/u.test(value));
  const namedEntities = (value.match(/\b\p{Lu}\p{Ll}{2,}(?:[-’']\p{L}+)*\b/gu) || [])
    .filter((entity) => !STOP_WORDS.has(normalizeSearchValue(entity)) && entity !== "OSS");
  return unique([...quotedPhrases, ...numbers, ...acronyms, ...projectCodes, ...namedEntities], 10);
}

function extractSearchSignals(retrievalQuery: string) {
  const currentQuestion = currentQuestionFromRetrievalQuery(retrievalQuery);
  let anchors = explicitAnchors(currentQuestion);
  if (anchors.length === 0) {
    const previousUserQuestions = [...retrievalQuery.matchAll(/^User: ([^\n]+)$/gmu)]
      .map((match) => match[1]);
    anchors = explicitAnchors(previousUserQuestions.slice(-2).join(" "));
  }

  const tokens = currentQuestion
    .replace(/[’']/g, " ")
    .match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu) || [];
  const terms = unique(
    tokens.filter((token) => {
      const normalized = normalizeSearchValue(token);
      return normalized.length >= 3 && !STOP_WORDS.has(normalized);
    }),
    16,
  );

  return { currentQuestion, anchors, terms };
}

function asksForRecentNews(question: string) {
  return /\b(latest|recent|newest|today|news|actualité|actualités|récent|récente|récentes|dernière|dernières)\b/i.test(question);
}

async function retrieveVectorCandidates(vectorLiteral: string) {
  const result = await query(
    `SELECT * FROM (
       (SELECT
          'resource'::text AS source_type, c.source_id, r.title_fr, r.title_en,
          c.language, c.page_start, c.page_end, c.chunk_index, c.content,
          COALESCE(CASE WHEN c.language = 'fr' THEN r.file_fr_path ELSE r.file_en_path END, '') AS file_path,
          r.publication_date::text AS published_at, r.document_type::text AS category,
          c.embedding <=> $1::vector AS distance
        FROM knowledge_chunks c
        JOIN resources r
          ON c.source_id = r.id::text AND r.active_index_version = c.index_version
        WHERE c.source_type = 'resource' AND r.index_status = 'ready'
        ORDER BY c.embedding <=> $1::vector
        LIMIT 50)
       UNION ALL
       (SELECT
          'news'::text AS source_type, c.source_id, n.title_fr, n.title_en,
          c.language, c.page_start, c.page_end, c.chunk_index, c.content,
          '/news/' || n.slug AS file_path,
          n.date::text AS published_at, n.category,
          c.embedding <=> $1::vector AS distance
        FROM knowledge_chunks c
        JOIN news n
          ON c.source_id = n.id::text AND n.active_index_version = c.index_version
        WHERE c.source_type = 'news' AND n.index_status = 'ready'
        ORDER BY c.embedding <=> $1::vector
        LIMIT 50)
     ) AS candidates
     ORDER BY distance
     LIMIT 80`,
    [vectorLiteral],
  );
  return result.rows as RetrievedRow[];
}

async function retrieveLexicalSources(anchors: string[], terms: string[]) {
  if (anchors.length === 0 && terms.length === 0) return [] as LexicalSourceRow[];

  const result = await query(
    `WITH active_chunks AS (
       SELECT
         'resource'::text AS source_type,
         c.source_id,
         c.chunk_index,
         c.content,
         CONCAT_WS(' ', r.title_fr, r.title_en, r.summary_fr, r.summary_en,
           r.publication_date::text, r.document_type, ARRAY_TO_STRING(r.fields, ' ')) AS metadata_text,
         r.publication_date::text AS published_at,
         r.document_type::text AS category
       FROM knowledge_chunks c
       JOIN resources r
         ON c.source_id = r.id::text AND r.active_index_version = c.index_version
       WHERE c.source_type = 'resource' AND r.index_status = 'ready'

       UNION ALL

       SELECT
         'news'::text AS source_type,
         c.source_id,
         c.chunk_index,
         c.content,
         CONCAT_WS(' ', n.title_fr, n.title_en, n.date::text, n.category) AS metadata_text,
         n.date::text AS published_at,
         n.category
       FROM knowledge_chunks c
       JOIN news n
         ON c.source_id = n.id::text AND n.active_index_version = c.index_version
       WHERE c.source_type = 'news' AND n.index_status = 'ready'
     ), scored AS (
       SELECT
         source_type,
         source_id,
         chunk_index,
         published_at,
         category,
         (SELECT COUNT(*)::int FROM UNNEST($1::text[]) AS anchors(value)
           WHERE POSITION(value IN LOWER(metadata_text)) > 0) AS metadata_anchor_matches,
         (SELECT COUNT(*)::int FROM UNNEST($1::text[]) AS anchors(value)
           WHERE POSITION(value IN LOWER(content)) > 0) AS anchor_matches,
         (SELECT COUNT(*)::int FROM UNNEST($2::text[]) AS terms(value)
           WHERE POSITION(value IN LOWER(metadata_text || ' ' || content)) > 0) AS term_matches
       FROM active_chunks
     )
     SELECT
       source_type,
       source_id,
       MAX(published_at) AS published_at,
       MAX(category) AS category,
       MAX(metadata_anchor_matches)::int AS metadata_anchor_matches,
       (COUNT(*) FILTER (WHERE anchor_matches > 0))::int AS anchor_chunk_hits,
       MAX(anchor_matches)::int AS anchor_matches,
       COALESCE(MAX(anchor_matches) FILTER (WHERE chunk_index <= 2), 0)::int AS leading_anchor_matches,
       COUNT(*)::int AS total_chunks,
       MAX(term_matches)::int AS term_matches
     FROM scored
     WHERE metadata_anchor_matches > 0 OR anchor_matches > 0 OR term_matches > 0
     GROUP BY source_type, source_id
     ORDER BY
       MAX(metadata_anchor_matches) DESC,
       COALESCE(MAX(anchor_matches) FILTER (WHERE chunk_index <= 2), 0) DESC,
       COUNT(*) FILTER (WHERE anchor_matches > 0) DESC,
       MAX(anchor_matches) DESC,
       MAX(term_matches) DESC
     LIMIT 30`,
    [anchors, terms],
  );
  return result.rows as LexicalSourceRow[];
}

function rankSources(
  vectorRows: RetrievedRow[],
  lexicalRows: LexicalSourceRow[],
  anchors: string[],
  terms: string[],
  recentNewsQuery: boolean,
) {
  const candidates = new Map<string, RankedSource>();

  vectorRows.forEach((row, index) => {
    const key = `${row.source_type}:${row.source_id}`;
    const distance = toNumber(row.distance);
    const existing = candidates.get(key);
    if (!existing) {
      candidates.set(key, {
        key,
        sourceType: row.source_type,
        sourceId: row.source_id,
        publishedAt: row.published_at,
        category: row.category,
        bestDistance: distance,
        vectorRank: index + 1,
        metadataAnchorMatches: 0,
        anchorChunkHits: 0,
        anchorMatches: 0,
        leadingAnchorMatches: 0,
        totalChunks: 0,
        termMatches: 0,
        score: 0,
      });
    } else if (existing.bestDistance === undefined || distance < existing.bestDistance) {
      existing.bestDistance = distance;
    }
  });

  lexicalRows.forEach((row, index) => {
    const key = `${row.source_type}:${row.source_id}`;
    const existing: RankedSource = candidates.get(key) || {
      key,
      sourceType: row.source_type,
      sourceId: row.source_id,
      publishedAt: row.published_at,
      category: row.category,
      metadataAnchorMatches: 0,
      anchorChunkHits: 0,
      anchorMatches: 0,
      leadingAnchorMatches: 0,
      totalChunks: 0,
      termMatches: 0,
      score: 0,
    };
    existing.lexicalRank = index + 1;
    existing.metadataAnchorMatches = toNumber(row.metadata_anchor_matches);
    existing.anchorChunkHits = toNumber(row.anchor_chunk_hits);
    existing.anchorMatches = toNumber(row.anchor_matches);
    existing.leadingAnchorMatches = toNumber(row.leading_anchor_matches);
    existing.totalChunks = toNumber(row.total_chunks);
    existing.termMatches = toNumber(row.term_matches);
    candidates.set(key, existing);
  });

  const ranked = [...candidates.values()];
  for (const candidate of ranked) {
    const vectorScore = candidate.bestDistance === undefined
      ? 0
      : Math.max(0, 1 - candidate.bestDistance);
    const termCoverage = terms.length === 0 ? 0 : candidate.termMatches / terms.length;
    const hasAnchorMatch = candidate.metadataAnchorMatches > 0 || candidate.anchorMatches > 0;
    const vectorRankBonus = candidate.vectorRank ? 0.35 / (20 + candidate.vectorRank) : 0;
    const lexicalRankBonus = candidate.lexicalRank ? 0.55 / (20 + candidate.lexicalRank) : 0;

    candidate.score = vectorScore
      + Math.min(0.4, termCoverage * 0.4)
      + vectorRankBonus
      + lexicalRankBonus;

    if (anchors.length > 0) {
      const anchorDensity = candidate.totalChunks > 0
        ? candidate.anchorChunkHits / candidate.totalChunks
        : 0;
      candidate.score += hasAnchorMatch ? 0.8 : -0.7;
      candidate.score += Math.log2(1 + candidate.anchorChunkHits) * 0.08;
      candidate.score += Math.min(0.45, anchorDensity * 0.75);
      candidate.score += Math.min(candidate.leadingAnchorMatches, 3) * 0.45;
      candidate.score += Math.min(candidate.metadataAnchorMatches, 3) * 1.2;
    }

    if (recentNewsQuery && candidate.sourceType === "news") {
      const ageDays = Math.max(0, (Date.now() - Date.parse(candidate.publishedAt)) / 86_400_000);
      candidate.score += 0.08 + 0.12 * Math.exp(-ageDays / 365);
    }
  }

  return ranked
    .filter((candidate) => {
      if (anchors.length > 0 && (candidate.metadataAnchorMatches > 0 || candidate.anchorMatches > 0)) return true;
      if (candidate.termMatches >= Math.min(2, Math.max(1, terms.length))) return true;
      if (candidate.bestDistance === undefined) return false;
      const maxDistance = recentNewsQuery && candidate.sourceType === "news"
        ? Math.max(env.resourceRetrievalMaxDistance, 0.78)
        : env.resourceRetrievalMaxDistance;
      return candidate.bestDistance <= maxDistance;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

async function retrievePassages(
  vectorLiteral: string,
  anchors: string[],
  terms: string[],
  sources: RankedSource[],
) {
  if (sources.length === 0) return [] as RetrievedRow[];

  const params: unknown[] = [vectorLiteral, anchors, terms];
  const sourceFilters = sources.map((source) => {
    params.push(source.sourceType, source.sourceId);
    const typeParameter = params.length - 1;
    const idParameter = params.length;
    return `(c.source_type = $${typeParameter} AND c.source_id = $${idParameter})`;
  }).join(" OR ");

  const result = await query(
    `WITH selected_chunks AS (
       SELECT
         'resource'::text AS source_type, c.source_id, r.title_fr, r.title_en,
         c.language, c.page_start, c.page_end, c.chunk_index, c.content,
         COALESCE(CASE WHEN c.language = 'fr' THEN r.file_fr_path ELSE r.file_en_path END, '') AS file_path,
         r.publication_date::text AS published_at, r.document_type::text AS category,
         CONCAT_WS(' ', r.title_fr, r.title_en, r.summary_fr, r.summary_en,
           r.publication_date::text, r.document_type, ARRAY_TO_STRING(r.fields, ' ')) AS metadata_text,
         c.embedding <=> $1::vector AS distance
       FROM knowledge_chunks c
       JOIN resources r
         ON c.source_id = r.id::text AND r.active_index_version = c.index_version
       WHERE c.source_type = 'resource' AND r.index_status = 'ready' AND (${sourceFilters})

       UNION ALL

       SELECT
         'news'::text AS source_type, c.source_id, n.title_fr, n.title_en,
         c.language, c.page_start, c.page_end, c.chunk_index, c.content,
         '/news/' || n.slug AS file_path,
         n.date::text AS published_at, n.category,
         CONCAT_WS(' ', n.title_fr, n.title_en, n.date::text, n.category) AS metadata_text,
         c.embedding <=> $1::vector AS distance
       FROM knowledge_chunks c
       JOIN news n
         ON c.source_id = n.id::text AND n.active_index_version = c.index_version
       WHERE c.source_type = 'news' AND n.index_status = 'ready' AND (${sourceFilters})
     ), scored AS (
       SELECT
         selected_chunks.*,
         (SELECT COUNT(*)::int FROM UNNEST($2::text[]) AS anchors(value)
           WHERE POSITION(value IN LOWER(metadata_text || ' ' || content)) > 0) AS anchor_matches,
         (SELECT COUNT(*)::int FROM UNNEST($3::text[]) AS terms(value)
           WHERE POSITION(value IN LOWER(metadata_text || ' ' || content)) > 0) AS term_matches
       FROM selected_chunks
     ), ranked AS (
       SELECT
         scored.*,
         ROW_NUMBER() OVER (
           PARTITION BY source_type, source_id, language
           ORDER BY distance
         ) AS semantic_rank,
         ROW_NUMBER() OVER (
           PARTITION BY source_type, source_id, language
           ORDER BY anchor_matches DESC, term_matches DESC, distance
         ) AS lexical_rank
       FROM scored
     )
     SELECT *
     FROM ranked
     WHERE semantic_rank <= 8 OR lexical_rank <= 4
     ORDER BY source_type, source_id, language, distance`,
    params,
  );
  return result.rows as RetrievedRow[];
}

function selectPassages(rows: RetrievedRow[], sources: RankedSource[], anchors: string[]) {
  const selected: RetrievedRow[] = [];
  const limits = [4, 2, 1];

  sources.forEach((source, sourceIndex) => {
    const sourceRows = rows.filter(
      (row) => row.source_type === source.sourceType && row.source_id === source.sourceId,
    );
    if (sourceRows.length === 0) return;

    const byLanguage = new Map<ResourceLanguage, RetrievedRow[]>();
    for (const row of sourceRows) {
      const languageRows = byLanguage.get(row.language) || [];
      languageRows.push(row);
      byLanguage.set(row.language, languageRows);
    }

    const language = [...byLanguage.entries()]
      .sort(([, firstRows], [, secondRows]) => {
        const bestScore = (languageRows: RetrievedRow[]) => Math.max(...languageRows.map((row) =>
          Math.max(0, 1 - toNumber(row.distance))
          + Math.min(toNumber(row.anchor_matches), 3) * 0.2
          + Math.min(toNumber(row.term_matches), 5) * 0.03,
        ));
        return bestScore(secondRows) - bestScore(firstRows);
      })[0]?.[0];
    if (!language) return;

    const languageRows = byLanguage.get(language)!;
    const semanticRows = [...languageRows].sort((a, b) => toNumber(a.distance) - toNumber(b.distance));
    const lexicalRows = [...languageRows].sort((a, b) =>
      toNumber(b.anchor_matches) - toNumber(a.anchor_matches)
      || toNumber(b.term_matches) - toNumber(a.term_matches)
      || toNumber(a.distance) - toNumber(b.distance),
    );
    const combinedRows = [...languageRows].sort((a, b) => {
      const score = (row: RetrievedRow) => toNumber(row.distance)
        - Math.min(toNumber(row.anchor_matches), 3) * 0.12
        - Math.min(toNumber(row.term_matches), 5) * 0.025;
      return score(a) - score(b);
    });

    const sourceSelection: RetrievedRow[] = [];
    const add = (row: RetrievedRow | undefined) => {
      if (!row) return;
      if (sourceSelection.some((item) => item.chunk_index === row.chunk_index)) return;
      sourceSelection.push(row);
    };

    add(semanticRows[0]);
    if (limits[sourceIndex] >= 3) add(semanticRows[1]);
    if (anchors.length > 0) add(lexicalRows.find((row) => toNumber(row.anchor_matches) > 0));
    for (const row of combinedRows) {
      if (sourceSelection.length >= limits[sourceIndex]) break;
      add(row);
    }
    selected.push(...sourceSelection.slice(0, limits[sourceIndex]));
  });

  return selected;
}

export async function retrieveResourceContext(question: string) {
  const signals = extractSearchSignals(question);
  const [vector] = await embedTexts([question], "search_query");
  const vectorLiteral = `[${vector.join(",")}]`;
  const [vectorRows, lexicalRows] = await Promise.all([
    retrieveVectorCandidates(vectorLiteral),
    retrieveLexicalSources(signals.anchors, signals.terms),
  ]);
  const recentNewsQuery = asksForRecentNews(signals.currentQuestion);
  const rankedSources = rankSources(
    vectorRows,
    lexicalRows,
    signals.anchors,
    signals.terms,
    recentNewsQuery,
  );
  const passageRows = await retrievePassages(
    vectorLiteral,
    signals.anchors,
    signals.terms,
    rankedSources,
  );
  const selected = selectPassages(passageRows, rankedSources, signals.anchors);

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
