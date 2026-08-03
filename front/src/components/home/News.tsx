import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getThumbnail, type NewsData } from '@/api/auth';
import type { Locale } from '@/context/locale';

// Truncate body to ~150 chars at a word boundary for card previews.
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

interface NewsProps {
  articles: NewsData[];
}

export default function News({ articles }: NewsProps) {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section id="actualites" className="bg-bone pt-4 lg:pt-6 pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <div className="mb-10 lg:mb-12 max-w-2xl flex items-end justify-between gap-4">
          <div>
            <div className="h-1 w-12 bg-[#489e42] mb-5" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-tight">
              {locale === 'fr' ? 'Actualités' : 'News'}
            </h2>
          </div>
          <Link
            to={`/${locale}/news`}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#489e42] hover:gap-2.5 transition-all whitespace-nowrap"
          >
            {locale === 'fr' ? 'Toutes les actualités' : 'All news'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial layout: 1.7fr featured + 1fr sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-12">
          {/* Featured story */}
          {featured && (
            <article className="lg:border-r lg:border-ink/10 lg:pr-12 lg:pb-0 pb-10 lg:border-b-0 border-b border-ink/10">
              <Link to={`/${locale}/news/${featured.slug}`} className="group block">
                {/* Featured image (16:9) */}
                <div className="relative w-full aspect-[16/9] overflow-hidden mb-5">
                  {getThumbnail(featured) && (
                    <img
                      src={getThumbnail(featured)}
                      alt={locale === 'fr' ? featured.title_fr : featured.title_en}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 10px)',
                    }}
                  />
                </div>

                {/* Headline */}
                <h3 className="font-serif font-bold text-[clamp(28px,3.4vw,42px)] leading-[1.08] text-ink mb-4 transition-colors">
                  <span className="bg-gradient-to-r from-[#489e42] to-[#489e42] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                    {locale === 'fr' ? featured.title_fr : featured.title_en}
                  </span>
                </h3>

                {/* Dek (truncated body) */}
                <p className="font-serif text-[19px] text-ink/55 leading-[1.5] mb-5">
                  {truncate(locale === 'fr' ? featured.body_fr : featured.body_en)}
                </p>

                {/* Byline */}
                <div className="text-[12px] uppercase tracking-[0.08em] text-ink/45 border-t border-ink/10 pt-3 flex items-center justify-between">
                  <span>{formatDate(featured.date, locale)}</span>
                  <span className="flex items-center gap-1.5 text-[#489e42] font-semibold normal-case tracking-normal">
                    {locale === 'fr' ? 'Lire' : 'Read'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          )}

          {/* Sidebar — small stories */}
          {rest.length > 0 && (
            <aside className="flex flex-col">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#b07a48] mb-5">
                {locale === 'fr' ? "Plus d'actualités" : 'More news'}
              </div>

              <div className="flex flex-col justify-between gap-0">
                {rest.map((h, i) => (
                  <Link
                    key={h.id}
                    to={`/${locale}/news/${h.slug}`}
                    className={`group block py-4 ${
                      i === 0 ? 'pt-0' : 'border-t border-ink/10'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Thumbnail (16:6 letterbox) */}
                      <div className="relative w-full aspect-[16/6] overflow-hidden">
                        {getThumbnail(h) && (
                          <img
                            src={getThumbnail(h)}
                            alt={locale === 'fr' ? h.title_fr : h.title_en}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        )}
                      </div>

                      {/* Body */}
                      <div className="min-w-0">
                        <h4 className="font-serif font-semibold text-[16.5px] leading-[1.25] text-ink">
                          <span className="bg-gradient-to-r from-[#489e42] to-[#489e42] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                            {locale === 'fr' ? h.title_fr : h.title_en}
                          </span>
                        </h4>
                        <p className="text-sm text-ink/45 mt-1">
                          {formatDate(h.date, locale)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>

        {/* Mobile "view all" link */}
        <div className="sm:hidden mt-8 flex justify-center">
          <Link
            to={`/${locale}/news`}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#489e42]"
          >
            {locale === 'fr' ? 'Toutes les actualités' : 'All news'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
