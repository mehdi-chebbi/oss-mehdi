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
  department_slug: string;
  score: number;
}

export interface DynamicSearchResponse {
  news: NewsSearchResult[];
  projects: ProjectSearchResult[];
  totals: {
    news: number;
    projects: number;
  };
}

export async function searchDynamicContent(
  query: string,
  locale: SearchLocale,
  limit = 8,
  signal?: AbortSignal,
): Promise<DynamicSearchResponse> {
  const params = new URLSearchParams({
    q: query.trim(),
    lang: locale,
    limit: String(limit),
  });
  const response = await fetch(`/api/search?${params.toString()}`, { signal });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Search failed" }));
    throw new Error(body.error || `Error ${response.status}`);
  }

  return response.json();
}
