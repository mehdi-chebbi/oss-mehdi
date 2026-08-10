import { useState, useEffect } from 'react';
import { useLoaderData, useSearchParams, useNavigation, useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { getThumbnail } from '@/api/auth';
import type { Locale } from '@/context/locale';
import type { NewsListLoaderData } from '@/loaders/public';

function truncate(text: string, max = 150): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function formatDate(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function NewsList() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { data, years, page, year, q } = useLoaderData() as NewsListLoaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  // When filters change, the URL updates → the loader re-runs → this
  // component re-renders with fresh data. The old data stays visible during
  // the reload (React Router keeps it), so there's no flash — just a subtle
  // spinner overlay while the new data arrives.
  const isReloading = navigation.state === 'loading';

  const [searchInput, setSearchInput] = useState(q);

  // Keep the search input in sync with the URL when navigating back/forward
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Reset to page 1 when filters change (except when changing page itself)
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput.trim() || undefined);
  };

  const items = data.items;
  const totalPages = data.totalPages;
  const total = data.total;

  return (
    <div className="font-oss relative min-h-screen overflow-hidden bg-oss-paper pb-24 text-ink antialiased selection:bg-oss-blue selection:text-white lg:pb-28">
      <section className="mx-auto max-w-[1400px] px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-20">
        <div className="max-w-3xl">
          <p className="oss-kicker mb-5">{locale === 'fr' ? 'Information & événements' : 'Information & events'}</p>
          <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
            {locale === 'fr' ? 'Actualités' : 'News'}
          </h1>
          <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
            {locale === 'fr'
              ? 'Toutes les actualités et nouveautés de l\u2019OSS.'
              : 'All the latest news and updates from OSS.'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 border-y border-oss-line bg-white p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-center gap-3">
            <label className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.07em] text-oss-blue/65">
              {locale === 'fr' ? 'Année' : 'Year'}:
            </label>
            <select
              value={year || ''}
              onChange={(e) => updateParam('year', e.target.value || undefined)}
              className="border border-oss-line bg-oss-paper px-3 py-2.5 text-sm font-medium text-oss-blue-dark outline-none transition-colors focus:border-oss-blue"
            >
              <option value="">{locale === 'fr' ? 'Toutes' : 'All'}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearch} className="flex max-w-xl flex-1 items-center gap-2 sm:ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-oss-blue/45" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={locale === 'fr' ? 'Rechercher…' : 'Search…'}
                className="w-full border border-oss-line bg-oss-paper py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-oss-blue"
              />
            </div>
            {(q || year) && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchParams(new URLSearchParams());
                }}
                className="border border-oss-line px-3 py-2.5 text-sm font-bold text-ink/50 transition-colors hover:border-oss-blue/35 hover:text-oss-blue"
              >
                {locale === 'fr' ? 'Effacer' : 'Clear'}
              </button>
            )}
          </form>
        </div>

        <p className="mb-6 text-xs font-bold uppercase tracking-[0.07em] text-ink/40">
          {total} {locale === 'fr' ? (total > 1 ? 'articles' : 'article') : (total !== 1 ? 'articles' : 'article')}
        </p>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex min-h-64 items-center justify-center bg-white p-12 text-center text-ink/40">
            {locale === 'fr'
              ? 'Aucun article trouvé.'
              : 'No articles found.'}
          </div>
        )}

        {/* Articles grid */}
        {items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <Link
                key={article.id}
                to={`/${locale}/news/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden border border-oss-line bg-white transition-colors duration-300 hover:border-oss-blue/40"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-oss-blue-dark">
                  {getThumbnail(article) ? (
                    <img
                      src={getThumbnail(article)}
                      alt={locale === 'fr' ? article.title_fr : article.title_en}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/35">OSS · News</span>
                    </div>
                  )}
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-oss-ochre" aria-hidden="true" />
                </div>

                <div className="flex min-h-[245px] flex-1 flex-col p-5 sm:p-6">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-oss-blue/58">
                    {formatDate(article.date, locale)}
                  </p>
                  <h3 className="text-lg font-bold leading-snug text-oss-blue-dark transition-colors duration-300 group-hover:text-oss-blue">
                    {locale === 'fr' ? article.title_fr : article.title_en}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/55">
                    {truncate(locale === 'fr' ? article.body_fr : article.body_en)}
                  </p>
                  <div className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-bold text-oss-blue">
                    {locale === 'fr' ? 'Lire la suite' : 'Read more'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => updateParam('page', page > 1 ? String(page - 1) : undefined)}
              disabled={page <= 1}
              className="flex items-center gap-1 border border-oss-line bg-white px-4 py-2.5 text-sm font-bold text-ink/60 transition-colors hover:border-oss-blue hover:text-oss-blue disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'fr' ? 'Précédent' : 'Previous'}
            </button>

            <span className="bg-oss-blue px-4 py-2.5 text-sm font-bold text-white">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => updateParam('page', String(page + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 border border-oss-line bg-white px-4 py-2.5 text-sm font-bold text-ink/60 transition-colors hover:border-oss-blue hover:text-oss-blue disabled:cursor-not-allowed disabled:opacity-30"
            >
              {locale === 'fr' ? 'Suivant' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Subtle reloading overlay — shows when filters change and the loader
          is re-running. Old data stays visible underneath (no flash). */}
      {isReloading && (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-oss-paper/55 pt-32 backdrop-blur-[1px]">
          <Loader2 className="h-5 w-5 animate-spin text-oss-blue" />
        </div>
      )}
    </div>
  );
}
