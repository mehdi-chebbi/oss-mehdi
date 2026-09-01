import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Briefcase, FileText, Newspaper, Search as SearchIcon } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { SearchLocale } from "@/api/search";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

interface ResultGroupProps {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

function ResultGroup({ id, title, icon, children }: ResultGroupProps) {
  return (
    <section aria-labelledby={id} className="border-t-4 border-oss-blue bg-white px-5 py-7 sm:px-8 sm:py-9">
      <h2 id={id} className="flex items-center gap-3 text-xl font-bold text-oss-blue-dark sm:text-2xl">
        <span className="text-oss-blue" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ResultRow({ to, title, excerpt, meta }: { to: string; title: string; excerpt: string; meta?: string }) {
  return (
    <Link to={to} className="group grid gap-3 border-t border-oss-line py-5 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
      <span>
        <span className="block text-base font-bold leading-snug text-oss-blue-dark transition-colors group-hover:text-oss-blue sm:text-lg">{title}</span>
        {excerpt && <span className="mt-2 line-clamp-2 block max-w-4xl text-sm leading-relaxed text-ink/58">{excerpt}</span>}
        {meta && <span className="mt-2 block text-xs font-semibold text-ink/45">{meta}</span>}
      </span>
      <ArrowRight className="hidden h-5 w-5 text-oss-blue transition-transform group-hover:translate-x-1 sm:block" aria-hidden="true" />
    </Link>
  );
}

function formatDate(value: string, locale: SearchLocale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Search() {
  const { lang } = useParams<{ lang: string }>();
  const locale: SearchLocale = lang === "en" ? "en" : "fr";
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim().slice(0, 120);
  const [input, setInput] = useState(query);
  const results = useGlobalSearch(query, locale, 50);
  const hasResults = results.news.length > 0 || results.projects.length > 0 || results.pages.length > 0;

  useEffect(() => setInput(query), [query]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextQuery = input.trim().slice(0, 120);
    const next = new URLSearchParams();
    if (nextQuery) next.set("q", nextQuery);
    setSearchParams(next);
  };

  return (
    <div className="font-oss min-h-[70dvh] bg-oss-paper pb-24 text-ink antialiased selection:bg-oss-blue selection:text-white lg:pb-28">
      <header className="mx-auto max-w-[1100px] px-5 pb-10 pt-14 sm:px-8 sm:pb-12 sm:pt-16">
        <h1 className="text-4xl font-bold leading-tight tracking-[-0.035em] text-oss-blue-dark sm:text-5xl">
          {locale === "fr" ? "Recherche" : "Search"}
        </h1>
        <form onSubmit={submit} role="search" className="mt-8">
          <label htmlFor="search-page-input" className="mb-2 block text-sm font-bold text-oss-blue-dark">
            {locale === "fr" ? "Rechercher dans le site" : "Search the site"}
          </label>
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oss-blue" aria-hidden="true" />
              <input
                id="search-page-input"
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={locale === "fr" ? "Actualités, projets ou pages" : "News, projects or pages"}
                autoComplete="off"
                className="h-12 w-full border border-oss-blue/25 bg-white pl-12 pr-4 text-base text-ink outline-none placeholder:text-ink/45 focus:border-oss-blue"
              />
            </div>
            <button
              type="submit"
              disabled={input.trim().length < 2}
              className="inline-flex h-12 shrink-0 items-center gap-2 bg-oss-blue px-5 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 sm:px-7"
            >
              <span className="hidden sm:inline">{locale === "fr" ? "Rechercher" : "Search"}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 sm:px-8" aria-live="polite" aria-busy={results.loading}>
        {query.length < 2 ? (
          <div className="border-l-4 border-oss-ochre bg-white px-6 py-8 text-ink/62">
            {locale === "fr" ? "Saisissez au moins deux caractères pour lancer une recherche." : "Enter at least two characters to start a search."}
          </div>
        ) : results.loading ? (
          <div className="space-y-4" aria-label={locale === "fr" ? "Recherche en cours" : "Searching"}>
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse bg-white px-6 py-7">
                <div className="h-5 w-2/5 bg-oss-blue/12" />
                <div className="mt-4 h-3 w-full bg-oss-blue/8" />
                <div className="mt-2 h-3 w-3/4 bg-oss-blue/8" />
              </div>
            ))}
          </div>
        ) : results.error ? (
          <div className="border-l-4 border-red-500 bg-red-50 px-6 py-6 text-red-700">{results.error}</div>
        ) : !hasResults ? (
          <div className="border-l-4 border-oss-ochre bg-white px-6 py-9">
            <h2 className="text-xl font-bold text-oss-blue-dark">{locale === "fr" ? "Aucun résultat" : "No results"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/58">
              {locale === "fr" ? "Essayez une expression plus courte ou un autre mot-clé." : "Try a shorter phrase or a different keyword."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {results.news.length > 0 && (
              <ResultGroup id="search-news-results" title={locale === "fr" ? "Actualités" : "News"} icon={<Newspaper className="h-6 w-6" />}>
                {results.news.map((item) => (
                  <ResultRow
                    key={item.id}
                    to={`/${locale}/news/${item.slug}`}
                    title={item.title}
                    excerpt={item.excerpt}
                    meta={formatDate(item.date, locale)}
                  />
                ))}
              </ResultGroup>
            )}

            {results.projects.length > 0 && (
              <ResultGroup id="search-project-results" title={locale === "fr" ? "Projets" : "Projects"} icon={<Briefcase className="h-6 w-6" />}>
                {results.projects.map((item) => (
                  <ResultRow
                    key={item.id}
                    to={`/${locale}/projects/${item.thematic_slug}/${item.slug}`}
                    title={item.title}
                    excerpt={item.excerpt}
                  />
                ))}
              </ResultGroup>
            )}

            {results.pages.length > 0 && (
              <ResultGroup id="search-page-results" title={locale === "fr" ? "Pages" : "Pages"} icon={<FileText className="h-6 w-6" />}>
                {results.pages.map((item) => (
                  <ResultRow key={item.id} to={item.href} title={item.title} excerpt={item.excerpt} />
                ))}
              </ResultGroup>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
