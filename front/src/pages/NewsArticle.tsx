import { useState } from 'react';
import { useLoaderData, useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { newsCategoryLabel } from '@/api/auth';
import type { Locale } from '@/context/locale';
import type { NewsArticleLoaderData } from '@/loaders/public';
import { newsBodyHtml } from '@/utils/newsContent';

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


export default function NewsArticle() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { article } = useLoaderData() as NewsArticleLoaderData;
  const [activeImage, setActiveImage] = useState(0);

  if (!article) {
    return (
      <div className="font-oss flex min-h-[60vh] flex-1 items-center justify-center bg-oss-paper px-6 py-20">
        <div className="border-l-4 border-oss-ochre bg-white p-8 text-center sm:p-10">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-oss-blue">Erreur 404</span>
          <h1 className="mt-4 text-4xl font-bold text-oss-blue-dark">
            {locale === 'fr' ? 'Article introuvable' : 'Article not found'}
          </h1>
          <p className="mt-3 text-ink/50">
            {locale === 'fr' ? 'Cette actualité n’est plus disponible.' : 'This news article is no longer available.'}
          </p>
          <Link to={`/${locale}/news`} className="mt-8 inline-flex items-center gap-2 bg-oss-blue px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark">
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
    <div className="font-oss flex-1 bg-oss-paper pb-24 text-ink antialiased selection:bg-oss-blue selection:text-white">
      <article>
        {/* Editorial masthead */}
        <header className="px-6 pb-14 pt-12 sm:px-8 lg:px-12 lg:pb-16 lg:pt-16">
          <div className="mx-auto max-w-[1400px] rounded-[28px] bg-white px-6 py-8 sm:px-9 sm:py-10 lg:rounded-[36px] lg:px-12 lg:py-12">

            <div className={`grid gap-10 ${images.length > 0 ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16' : ''}`}>
              <div className="animate-[news-article-rise_750ms_cubic-bezier(0.16,1,0.3,1)_both]">
                <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-[58px]">
                  {title}
                </h1>

                <div className="mt-9 flex flex-wrap gap-x-7 gap-y-4 border-y border-oss-line py-5">
                  <span className="bg-oss-blue px-3 py-1.5 text-xs font-bold text-white">
                    {newsCategoryLabel(article.category, locale)}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 text-oss-blue" />
                    <span className="text-sm font-bold text-ink/65">{date}</span>
                  </div>
                  {images.length > 1 && (
                    <div className="flex items-center gap-2.5">
                      <Images className="h-4 w-4 text-oss-blue" />
                      <span className="text-sm font-bold text-ink/65">{images.length} images</span>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 0 && (
                <div className="min-w-0 w-full animate-[news-article-rise_850ms_cubic-bezier(0.16,1,0.3,1)_160ms_both]">
                  {images.length === 1 ? (
                    <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-oss-paper lg:rounded-[28px]">
                      <img src={images[0]} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                    </figure>
                  ) : (
                    <div className="news-detail-carousel group relative aspect-[4/3] min-w-0 w-full max-w-full overflow-hidden rounded-2xl bg-oss-paper lg:rounded-[28px]">
                      <Swiper
                        modules={[Autoplay, EffectFade, Pagination, Navigation]}
                        effect="fade"
                        fadeEffect={{ crossFade: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        loop
                        pagination={{ clickable: true }}
                        navigation={{ nextEl: '.news-carousel-next', prevEl: '.news-carousel-prev' }}
                        onSlideChange={(swiper) => setActiveImage(swiper.realIndex)}
                        className="h-full min-w-0 w-full max-w-full"
                      >
                        {images.map((url, index) => (
                          <SwiperSlide key={`${url}-${index}`}>
                            <img src={url} alt={`${title} - ${index + 1}`} className="h-full w-full object-cover" />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      <button className="news-carousel-prev absolute left-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-oss-blue opacity-100 backdrop-blur transition-all hover:bg-white hover:text-oss-blue-dark md:opacity-0 md:group-hover:opacity-100" aria-label={locale === 'fr' ? 'Image précédente' : 'Previous image'}>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button className="news-carousel-next absolute right-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-oss-blue opacity-100 backdrop-blur transition-all hover:bg-white hover:text-oss-blue-dark md:opacity-0 md:group-hover:opacity-100" aria-label={locale === 'fr' ? 'Image suivante' : 'Next image'}>
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-4 right-4 z-10 rounded-full bg-oss-blue-dark/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
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
        <section className="px-6 py-10 sm:px-8 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-[1100px] border-l-4 border-oss-ochre bg-white px-7 py-9 sm:px-10 sm:py-12 lg:px-14">
            <div
              className="news-rich-text mx-auto max-w-[920px]"
              dangerouslySetInnerHTML={{ __html: newsBodyHtml(body) }}
            />
            <div className="mx-auto mt-12 max-w-[920px] border-t border-oss-line pt-6">
              <Link to={`/${locale}/news`} className="group inline-flex items-center gap-2 text-sm font-bold text-ink/55 transition-colors hover:text-oss-blue">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                {locale === 'fr' ? 'Retour aux actualités' : 'Back to news'}
              </Link>
            </div>
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
        .news-rich-text {
          color: rgb(21 39 53 / 0.72);
          font-size: 18px;
          line-height: 1.85;
        }
        .news-rich-text > * + * {
          margin-top: 1.75rem;
        }
        .news-rich-text h2,
        .news-rich-text h3,
        .news-rich-text h4 {
          color: var(--color-oss-blue-dark);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .news-rich-text h2 {
          margin-top: 3.25rem;
          font-size: clamp(1.65rem, 3vw, 2.25rem);
        }
        .news-rich-text h3 {
          margin-top: 2.5rem;
          font-size: clamp(1.3rem, 2vw, 1.65rem);
        }
        .news-rich-text h4 {
          margin-top: 2rem;
          font-size: clamp(1.08rem, 1.5vw, 1.25rem);
          letter-spacing: -0.01em;
        }
        .news-rich-text > p:first-of-type::first-letter {
          float: left;
          margin: 0.44rem 0.75rem 0 0;
          color: var(--color-oss-blue);
          font-size: 4.75rem;
          font-weight: 700;
          line-height: 0.72;
        }
        .news-rich-text strong { color: inherit; }
        .news-rich-text em { font-style: italic; }
        .news-rich-text ul,
        .news-rich-text ol { padding-left: 1.5rem; }
        .news-rich-text ul { list-style: disc; }
        .news-rich-text ol { list-style: decimal; }
        .news-rich-text li + li { margin-top: 0.55rem; }
        .news-rich-text blockquote {
          border-left: 4px solid var(--color-oss-ochre);
          padding: 0.4rem 0 0.4rem 1.4rem;
          color: rgb(21 39 53 / 0.82);
          font-size: 1.1em;
          font-style: italic;
        }
        .news-rich-text a {
          color: var(--color-oss-blue);
          font-weight: 650;
          text-decoration: underline;
          text-decoration-color: rgb(49 131 212 / 0.35);
          text-underline-offset: 0.2em;
        }
        .news-rich-text img {
          display: block;
          width: auto;
          max-width: 100%;
          height: auto;
          margin: 2rem auto;
          border-radius: 1rem;
        }
        .news-rich-text img[data-size="25"] { width: 25%; }
        .news-rich-text img[data-size="50"] { width: 50%; }
        .news-rich-text img[data-size="75"] { width: 75%; }
        .news-rich-text img[data-size="100"] { width: 100%; }
        .news-rich-text figcaption {
          margin-top: -1.25rem;
          color: rgb(21 39 53 / 0.52);
          font-size: 0.8em;
          line-height: 1.5;
          text-align: center;
        }
        .news-rich-text hr {
          margin: 3rem 0;
          border: 0;
          border-top: 1px solid var(--color-oss-line);
        }
        @media (min-width: 768px) {
          .news-rich-text { font-size: 19px; }
        }
        @media (max-width: 639px) {
          .news-rich-text img[data-size] { width: 100%; }
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
