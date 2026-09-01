import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getThumbnail, newsCategoryLabel, type NewsData } from '@/api/auth';
import type { Locale } from '@/context/locale';

// Truncate body to ~150 chars at a word boundary for card previews.
function truncate(text: string, max = 300): string {
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
    <section id="actualites" className="bg-oss-paper py-10 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mb-10 lg:mb-12 flex w-full items-end justify-between gap-4">
          <div>
            <h2 className="oss-section-title">
              {locale === 'fr' ? 'Actualités' : 'News'}
            </h2>
          </div>
          <Link
            to={`/${locale}/news`}
            className="hidden items-center gap-2 border-b-2 border-oss-ochre pb-1 text-sm font-bold text-oss-blue transition-colors hover:text-oss-blue-dark sm:flex"
          >
            {locale === 'fr' ? 'Toutes les actualités' : 'All news'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial layout: 1.7fr featured + 1fr sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-12">
          {/* Featured story */}
          {featured && (
            <article className="border-b border-oss-line pb-10 lg:border-b-0 lg:border-r lg:pr-12">
              <Link to={`/${locale}/news/${featured.slug}`} className="group block">
                {/* Featured image (16:9) */}
                <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden border-b-4 border-oss-ochre">
                  {getThumbnail(featured) && (
                    <img
                      src={getThumbnail(featured)}
                      alt={locale === 'fr' ? featured.title_fr : featured.title_en}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                </div>

                {/* Headline */}
                <h3 className="mb-4 text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.08] text-oss-blue-dark transition-colors">
                  <span className="bg-gradient-to-r from-oss-blue to-oss-blue bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                    {locale === 'fr' ? featured.title_fr : featured.title_en}
                  </span>
                </h3>

                {/* Dek (truncated body) */}
                <p className="mb-5 text-[17px] leading-[1.6] text-ink/65">
                  {truncate(locale === 'fr' ? featured.body_fr : featured.body_en)}
                </p>

                {/* Byline */}
                <div className="flex items-center justify-between border-t border-oss-line pt-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink/50">
                  <span>{newsCategoryLabel(featured.category, locale)} · {formatDate(featured.date, locale)}</span>
                  <span className="flex items-center gap-1.5 font-bold normal-case tracking-normal text-oss-blue">
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
              <div className="flex-1 flex flex-col justify-between gap-0">
                {rest.map((h, i) => (
                  <Link
                    key={h.id}
                    to={`/${locale}/news/${h.slug}`}
                    className={`group block py-4 ${
                      i === 0 ? 'pt-0' : 'border-t border-ink/10'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Thumbnail (16:6 letterbox) with date overlay */}
                      <div className="relative w-full aspect-[16/6] overflow-hidden">
                        {getThumbnail(h) && (
                          <img
                            src={getThumbnail(h)}
                            alt={locale === 'fr' ? h.title_fr : h.title_en}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        )}
                        <span className="absolute bottom-2 right-2 bg-oss-blue-dark/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          {formatDate(h.date, locale)}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="min-w-0">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.07em] text-oss-blue/60">
                          {newsCategoryLabel(h.category, locale)}
                        </p>
                        <h4 className="text-[16px] font-bold leading-[1.3] text-oss-blue-dark">
                          <span className="bg-gradient-to-r from-oss-blue to-oss-blue bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                            {locale === 'fr' ? h.title_fr : h.title_en}
                          </span>
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>

        {/* Mobile "view all" link */}
        <div className="sm:hidden mt-8 flex justify-end">
          <Link
            to={`/${locale}/news`}
            className="flex items-center gap-1.5 text-sm font-bold text-oss-blue"
          >
            {locale === 'fr' ? 'Toutes les actualités' : 'All news'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
