import { useState, type ReactNode } from 'react';
import { useLoaderData, useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import type { Locale } from '@/context/locale';
import type { NewsArticleLoaderData } from '@/loaders/public';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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


function renderBody(body: string): ReactNode {
  if (!body) return null;
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return paragraphs.map((paragraph, index) => (
    <p
      key={index}
      className={`mb-8 font-serif text-[19px] leading-[1.85] text-ink/72 md:text-[20px] ${
        index === 0
          ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:font-serif first-letter:text-[76px] first-letter:font-bold first-letter:leading-[0.72] first-letter:text-[#489e42]'
          : ''
      }`}
    >
      {paragraph}
    </p>
  ));
}

export default function NewsArticle() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { article } = useLoaderData() as NewsArticleLoaderData;
  const [activeImage, setActiveImage] = useState(0);

  if (!article) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-white px-6 py-20">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#489e42]">Erreur 404</span>
          <h1 className="mt-4 font-serif text-4xl font-bold text-ink">
            {locale === 'fr' ? 'Article introuvable' : 'Article not found'}
          </h1>
          <p className="mt-3 text-ink/50">
            {locale === 'fr' ? 'Cette actualité n’est plus disponible.' : 'This news article is no longer available.'}
          </p>
          <Link to={`/${locale}/news`} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#489e42] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3d7e38]">
            <ArrowLeft className="h-4 w-4" />
            {locale === 'fr' ? 'Retour aux actualités' : 'Back to news'}
          </Link>
        </div>
      </div>
    );
  }

  const title = locale === 'fr' ? article.title_fr : article.title_en;
  const body = locale === 'fr' ? article.body_fr : article.body_en;
  const images = Array.isArray(article.images) ? article.images : [];
  const date = formatDate(article.date, locale);


  return (
    <div className="flex-1 bg-white pb-24 text-ink">
      <article>
        {/* Editorial masthead */}
        <header className="px-6 pb-14 pt-12 lg:px-10 lg:pb-20 lg:pt-16">
          <div className="mx-auto max-w-7xl rounded-[28px] bg-[#EFECE5] px-6 py-8 sm:px-9 sm:py-10 lg:rounded-[36px] lg:px-12 lg:py-12">

            <div className={`grid gap-10 ${images.length > 0 ? 'lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16' : ''}`}>
              <div className="animate-[news-article-rise_750ms_cubic-bezier(0.16,1,0.3,1)_both]">
                <h1 className="max-w-3xl font-serif text-4xl font-bold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[58px]">
                  {title}
                </h1>

                <div className="mt-9 flex flex-wrap gap-x-7 gap-y-4 border-y border-ink/15 py-5">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 text-[#489e42]" />
                    <span className="text-sm font-semibold text-ink/65">{date}</span>
                  </div>
                  {images.length > 1 && (
                    <div className="flex items-center gap-2.5">
                      <Images className="h-4 w-4 text-[#489e42]" />
                      <span className="text-sm font-semibold text-ink/65">{images.length} images</span>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 0 && (
                <div className="animate-[news-article-rise_850ms_cubic-bezier(0.16,1,0.3,1)_160ms_both]">
                  {images.length === 1 ? (
                    <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#EFECE5] lg:rounded-[28px]">
                      <img src={images[0]} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                    </figure>
                  ) : (
                    <div className="news-detail-carousel group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#EFECE5] lg:rounded-[28px]">
                      <Swiper
                        modules={[Autoplay, EffectFade, Pagination, Navigation]}
                        effect="fade"
                        fadeEffect={{ crossFade: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        loop
                        pagination={{ clickable: true }}
                        navigation={{ nextEl: '.news-carousel-next', prevEl: '.news-carousel-prev' }}
                        onSlideChange={(swiper) => setActiveImage(swiper.realIndex)}
                        className="h-full w-full"
                      >
                        {images.map((url, index) => (
                          <SwiperSlide key={`${url}-${index}`}>
                            <img src={url} alt={`${title} — ${index + 1}`} className="h-full w-full object-cover" />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      <button className="news-carousel-prev absolute left-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink/70 opacity-100 backdrop-blur transition-all hover:bg-white hover:text-ink md:opacity-0 md:group-hover:opacity-100" aria-label={locale === 'fr' ? 'Image précédente' : 'Previous image'}>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button className="news-carousel-next absolute right-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink/70 opacity-100 backdrop-blur transition-all hover:bg-white hover:text-ink md:opacity-0 md:group-hover:opacity-100" aria-label={locale === 'fr' ? 'Image suivante' : 'Next image'}>
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-4 right-4 z-10 rounded-full bg-black/55 px-3 py-1.5 font-mono text-xs text-white backdrop-blur">
                        {String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Article body */}
        <section className="px-6 py-12 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[760px]">
            {renderBody(body)}
          </div>
        </section>

      </article>

      <style>{`
        @keyframes news-article-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .news-detail-carousel .swiper-pagination-bullet {
          background: white;
          opacity: 0.45;
        }
        .news-detail-carousel .swiper-pagination-bullet-active {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .news-detail-carousel *, [class*="news-article-rise"] {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
