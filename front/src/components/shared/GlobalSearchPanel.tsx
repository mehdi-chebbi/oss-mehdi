import { useEffect, useRef, type FormEvent } from "react";
import { ArrowRight, Briefcase, FileText, Newspaper, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { SearchLocale } from "@/api/search";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

interface GlobalSearchPanelProps {
  open: boolean;
  locale: SearchLocale;
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

export default function GlobalSearchPanel({ open, locale, query, onQueryChange, onClose }: GlobalSearchPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const results = useGlobalSearch(query, locale, 4);
  const trimmedQuery = query.trim();
  const resultGroupCount = [results.news.length, results.projects.length, results.pages.length].filter((count) => count > 0).length;

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(frame);
    }

    if (panelRef.current?.contains(document.activeElement)) {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      const clickedTrigger = target instanceof Element && target.closest("[data-global-search-trigger]");
      if (!panelRef.current?.contains(target) && !clickedTrigger) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmedQuery.length < 2) return;
    navigate(`/${locale}/search?q=${encodeURIComponent(trimmedQuery)}`);
    onClose();
  };

  const closeAfterNavigation = () => onClose();
  const hasResults = results.news.length > 0 || results.projects.length > 0 || results.pages.length > 0;

  return (
    <div
      ref={panelRef}
      id="global-search-panel"
      role="dialog"
      aria-hidden={!open}
      aria-label={locale === "fr" ? "Recherche sur le site" : "Site search"}
      className={`absolute inset-x-0 top-full border-t border-oss-blue/10 bg-white shadow-[0_22px_48px_rgba(18,53,91,0.16)] transition-[transform,opacity,visibility] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        open
          ? "visible translate-y-0 opacity-100"
          : "invisible pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7">
        <label htmlFor="global-search-input" className="mb-2 block text-xs font-bold text-oss-blue-dark">
          {locale === "fr" ? "Rechercher dans le site" : "Search the site"}
        </label>
        <form onSubmit={submit} role="search" className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oss-blue" aria-hidden="true" />
            <input
              ref={inputRef}
              id="global-search-input"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={locale === "fr" ? "Rechercher une actualité, un projet ou une page" : "Search news, projects or pages"}
              autoComplete="off"
              className="h-12 w-full border border-oss-blue/25 bg-oss-paper pl-12 pr-4 text-base text-ink outline-none placeholder:text-ink/45 focus:border-oss-blue focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={trimmedQuery.length < 2}
            className="hidden h-12 shrink-0 items-center gap-2 bg-oss-blue px-5 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 sm:inline-flex"
          >
            {locale === "fr" ? "Rechercher" : "Search"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid h-12 w-12 shrink-0 place-items-center border border-oss-blue/20 text-oss-blue transition-colors hover:bg-oss-blue hover:text-white active:translate-y-px"
            aria-label={locale === "fr" ? "Fermer la recherche" : "Close search"}
          >
            <X className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-5 max-h-[min(62vh,520px)] overflow-y-auto" aria-live="polite">
          {trimmedQuery.length < 2 ? null : results.loading ? (
            <div className="grid animate-pulse gap-4 sm:grid-cols-3" aria-label={locale === "fr" ? "Recherche en cours" : "Searching"}>
              {[0, 1, 2].map((item) => (
                <div key={item} className="border-t border-oss-line py-4">
                  <div className="h-4 w-3/4 bg-oss-blue/12" />
                  <div className="mt-3 h-3 w-full bg-oss-blue/8" />
                  <div className="mt-2 h-3 w-2/3 bg-oss-blue/8" />
                </div>
              ))}
            </div>
          ) : results.error ? (
            <p className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{results.error}</p>
          ) : !hasResults ? (
            <p className="border-l-4 border-oss-ochre bg-oss-paper px-4 py-4 text-sm text-ink/60">
              {locale === "fr" ? "Aucun résultat trouvé." : "No results found."}
            </p>
          ) : (
            <div className={`grid gap-6 ${resultGroupCount === 1 ? "md:grid-cols-1" : resultGroupCount === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {results.news.length > 0 && (
                <section aria-labelledby="search-panel-news">
                  <h2 id="search-panel-news" className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark">
                    <Newspaper className="h-4 w-4 text-oss-blue" aria-hidden="true" />
                    {locale === "fr" ? "Actualités" : "News"}
                  </h2>
                  <div className="border-t border-oss-line">
                    {results.news.map((item) => (
                      <Link key={item.id} to={`/${locale}/news/${item.slug}`} onClick={closeAfterNavigation} className="group block border-b border-oss-line py-3">
                        <span className="line-clamp-2 text-sm font-bold leading-snug text-oss-blue-dark transition-colors group-hover:text-oss-blue">{item.title}</span>
                        {item.excerpt && <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink/55">{item.excerpt}</span>}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {results.projects.length > 0 && (
                <section aria-labelledby="search-panel-projects">
                  <h2 id="search-panel-projects" className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark">
                    <Briefcase className="h-4 w-4 text-oss-blue" aria-hidden="true" />
                    {locale === "fr" ? "Projets" : "Projects"}
                  </h2>
                  <div className="border-t border-oss-line">
                    {results.projects.map((item) => (
                      <Link key={item.id} to={`/${locale}/projects/${item.department_slug}/${item.slug}`} onClick={closeAfterNavigation} className="group block border-b border-oss-line py-3">
                        <span className="line-clamp-2 text-sm font-bold leading-snug text-oss-blue-dark transition-colors group-hover:text-oss-blue">{item.title}</span>
                        {item.excerpt && <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink/55">{item.excerpt}</span>}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {results.pages.length > 0 && (
                <section aria-labelledby="search-panel-pages">
                  <h2 id="search-panel-pages" className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark">
                    <FileText className="h-4 w-4 text-oss-blue" aria-hidden="true" />
                    {locale === "fr" ? "Pages" : "Pages"}
                  </h2>
                  <div className="border-t border-oss-line">
                    {results.pages.map((item) => (
                      <Link key={item.id} to={item.href} onClick={closeAfterNavigation} className="group block border-b border-oss-line py-3">
                        <span className="line-clamp-2 text-sm font-bold leading-snug text-oss-blue-dark transition-colors group-hover:text-oss-blue">{item.title}</span>
                        <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink/55">{item.excerpt}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {trimmedQuery.length >= 2 && hasResults && !results.loading && (
          <Link
            to={`/${locale}/search?q=${encodeURIComponent(trimmedQuery)}`}
            onClick={closeAfterNavigation}
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-oss-blue transition-colors hover:text-oss-blue-dark"
          >
            {locale === "fr" ? "Voir tous les résultats" : "View all results"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
