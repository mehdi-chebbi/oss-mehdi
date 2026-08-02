import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { listPublishedNews, getNewsYears, getThumbnail, type NewsData } from '@/api/auth';
import type { Locale } from '@/context/locale';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SocialSidebar from '@/components/shared/SocialSidebar';

const PAGE_SIZE = 9;

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
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
  const q = searchParams.get('q') || '';

  const [items, setItems] = useState<NewsData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(q);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, yrs] = await Promise.all([
        listPublishedNews({ page, limit: PAGE_SIZE, year, q: q || undefined }),
        getNewsYears(),
      ]);
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setYears(yrs);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, year, q]);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <SocialSidebar />
      <Navbar />
      <main className="flex-1 bg-bone pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Heading */}
          <div className="mb-10 max-w-2xl">
            <div className="h-1 w-12 bg-[#489e42] mb-5" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
              {locale === 'fr' ? 'Actualités' : 'News'}
            </h1>
            <p className="text-ink/55 text-base lg:text-lg mt-4 leading-relaxed font-light">
              {locale === 'fr'
                ? 'Toutes les actualités et nouveautés de l\u2019OSS.'
                : 'All the latest news and updates from OSS.'}
            </p>
          </div>

          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Year filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-ink/50 whitespace-nowrap">
                {locale === 'fr' ? 'Année' : 'Year'}:
              </label>
              <select
                value={year || ''}
                onChange={(e) => updateParam('year', e.target.value || undefined)}
                className="px-3 py-2 border border-ink/15 rounded-lg bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#489e42]"
              >
                <option value="">{locale === 'fr' ? 'Toutes' : 'All'}</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={locale === 'fr' ? 'Rechercher…' : 'Search…'}
                  className="w-full pl-9 pr-3 py-2 border border-ink/15 rounded-lg bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#489e42]"
                />
              </div>
              {(q || year) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                  className="px-3 py-2 text-sm text-ink/50 hover:text-ink border border-ink/15 rounded-lg transition-colors"
                >
                  {locale === 'fr' ? 'Effacer' : 'Clear'}
                </button>
              )}
            </form>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-ink/40 mb-6">
              {total} {locale === 'fr' ? (total > 1 ? 'articles' : 'article') : (total !== 1 ? 'articles' : 'article')}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-12 text-center text-ink/40">
              {locale === 'fr'
                ? 'Aucun article trouvé.'
                : 'No articles found.'}
            </div>
          )}

          {/* Articles grid */}
          {!loading && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {items.map((article) => (
                <Link
                  key={article.id}
                  to={`/${locale}/news/${article.slug}`}
                  className="group block bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  {getThumbnail(article) && (
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      <img
                        src={getThumbnail(article)}
                        alt={locale === 'fr' ? article.title_fr : article.title_en}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-ink/40 mb-2">
                      {formatDate(article.date, locale)}
                    </p>
                    <h3 className="font-serif font-bold text-lg leading-snug text-ink mb-2">
                      <span className="bg-gradient-to-r from-[#489e42] to-[#489e42] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                        {locale === 'fr' ? article.title_fr : article.title_en}
                      </span>
                    </h3>
                    <p className="text-sm text-ink/55 leading-relaxed">
                      {truncate(locale === 'fr' ? article.body_fr : article.body_en)}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#489e42]">
                      {locale === 'fr' ? 'Lire la suite' : 'Read more'}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => updateParam('page', page > 1 ? String(page - 1) : undefined)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-ink/15 rounded-lg text-ink/60 hover:text-ink hover:border-ink/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                {locale === 'fr' ? 'Précédent' : 'Previous'}
              </button>

              <span className="px-4 py-2 text-sm text-ink/50">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => updateParam('page', String(page + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-ink/15 rounded-lg text-ink/60 hover:text-ink hover:border-ink/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {locale === 'fr' ? 'Suivant' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
