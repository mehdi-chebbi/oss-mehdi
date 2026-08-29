import { useEffect, useState } from "react";
import {
  searchDynamicContent,
  type DynamicSearchResponse,
  type SearchLocale,
} from "@/api/search";
import { searchStaticPages, type PageSearchResult } from "@/data/searchPages";

const EMPTY_DYNAMIC_RESULTS: DynamicSearchResponse = {
  news: [],
  projects: [],
  totals: { news: 0, projects: 0 },
};

export interface GlobalSearchState extends DynamicSearchResponse {
  pages: PageSearchResult[];
  total: number;
  loading: boolean;
  error: string;
}

export function useGlobalSearch(query: string, locale: SearchLocale, limit: number): GlobalSearchState {
  const [dynamicResults, setDynamicResults] = useState<DynamicSearchResponse>(EMPTY_DYNAMIC_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const trimmedQuery = query.trim();
  const pages = searchStaticPages(trimmedQuery, locale).slice(0, limit);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setDynamicResults(EMPTY_DYNAMIC_RESULTS);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setDynamicResults(EMPTY_DYNAMIC_RESULTS);
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      searchDynamicContent(trimmedQuery, locale, limit, controller.signal)
        .then(setDynamicResults)
        .catch((searchError: unknown) => {
          if (searchError instanceof DOMException && searchError.name === "AbortError") return;
          setDynamicResults(EMPTY_DYNAMIC_RESULTS);
          setError(locale === "fr" ? "La recherche est temporairement indisponible." : "Search is temporarily unavailable.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery, locale, limit]);

  return {
    ...dynamicResults,
    pages,
    total: dynamicResults.totals.news + dynamicResults.totals.projects + pages.length,
    loading,
    error,
  };
}
