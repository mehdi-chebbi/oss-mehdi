import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { ArrowLeft, Clock } from 'lucide-react';
import { getNewsBySlug, type NewsData } from '@/api/auth';
import type { Locale } from '@/context/locale';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SocialSidebar from '@/components/shared/SocialSidebar';

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

// Estimate reading time from body length (~200 words per minute).
function readingTime(body: string, locale: Locale): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return locale === 'fr' ? `${minutes} min de lecture` : `${minutes} min read`;
}

// Render plain-text body as paragraphs (split on blank lines).
// First paragraph gets a drop cap for editorial feel.
function renderBody(body: string): React.ReactNode {
  if (!body) return null;
  const paragraphs = body
    .split(/\n\s*\n/) // blank line = paragraph break
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return paragraphs.map((p, i) => (
    <p
      key={i}
      className={`mb-5 text-ink/75 leading-[1.75] text-[18px] ${
        i === 0
          ? 'first-letter:float-left first-letter:font-serif first-letter:text-[64px] first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1 first-letter:text-[#489e42] first-letter:font-bold'
          : ''
      }`}
    >
      {p}
    </p>
  ));
}

export default function NewsArticle() {
  const { lang, slug } = useParams<{ lang: string; slug: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const [article, setArticle] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    getNewsBySlug(slug)
      .then((data) => setArticle(data))
      .catch(() => {
        setArticle(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SocialSidebar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-bone">
          <div className="space-y-4 w-full max-w-3xl px-6">
            <div className="h-6 w-32 bg-ink/10 rounded animate-pulse" />
            <div className="h-12 w-3/4 bg-ink/10 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-ink/5 rounded animate-pulse" />
            <div className="w-full aspect-[16/9] bg-ink/10 rounded-xl animate-pulse mt-8" />
            <div className="space-y-3 mt-8">
              <div className="h-4 w-full bg-ink/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-ink/5 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-ink/5 rounded animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <SocialSidebar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-bone">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-ink mb-3">404</h1>
            <p className="text-ink/50 mb-6">
              {locale === 'fr' ? 'Article introuvable.' : 'Article not found.'}
            </p>
            <Link
              to={`/${locale}/news`}
              className="inline-flex items-center gap-1.5 text-[#489e42] font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'fr' ? 'Retour aux actualités' : 'Back to news'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = locale === 'fr' ? article.title_fr : article.title_en;
  const body = locale === 'fr' ? article.body_fr : article.body_en;
  const images = Array.isArray(article.images) ? article.images : [];

  return (
    <div className="min-h-screen flex flex-col">
      <SocialSidebar />
      <Navbar />
      <main className="flex-1 bg-bone pb-20">
        <article className="max-w-3xl mx-auto px-6">
          {/* Back link */}
          <Link
            to={`/${locale}/news`}
            className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'fr' ? 'Toutes les actualités' : 'All news'}
          </Link>

          {/* Byline meta row */}
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-ink/40 mb-4">
            <span>{formatDate(article.date, locale)}</span>
            <span className="w-1 h-1 rounded-full bg-ink/20" />
            <span className="flex items-center gap-1 normal-case tracking-normal">
              <Clock className="w-3 h-3" />
              {readingTime(body, locale)}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif font-bold text-[clamp(28px,4.5vw,48px)] leading-[1.08] text-ink mb-8">
            {title}
          </h1>

          {/* Divider */}
          <div className="h-px bg-ink/10 mb-8" />

          {/* Image carousel (or single image, or nothing) */}
          {images.length === 1 && (
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl mb-10">
              <img
                src={images[0]}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          {images.length > 1 && (
            <div className="article-carousel relative w-full aspect-[16/9] overflow-hidden rounded-xl mb-10 group">
              <Swiper
                modules={[Autoplay, EffectFade, Pagination, Navigation]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop
                pagination={{
                  clickable: true,
                  bulletClass: 'swiper-pagination-bullet',
                }}
                navigation={{
                  nextEl: '.article-carousel-next',
                  prevEl: '.article-carousel-prev',
                }}
                className="w-full h-full"
              >
                {images.map((url, i) => (
                  <SwiperSlide key={i}>
                    <div className="relative w-full h-full">
                      <img
                        src={url}
                        alt={`${title} — ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom navigation arrows (appear on hover) */}
              <button
                className="article-carousel-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-ink/70 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-ink"
                aria-label={locale === 'fr' ? 'Image précédente' : 'Previous image'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                className="article-carousel-next absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-ink/70 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-ink"
                aria-label={locale === 'fr' ? 'Image suivante' : 'Next image'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Image counter */}
              <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs font-medium">
                {locale === 'fr' ? 'Image' : 'Photo'} 1 / {images.length}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="font-serif">
            {renderBody(body)}
          </div>

          {/* Bottom divider + back-to-news CTA */}
          <div className="h-px bg-ink/10 mt-12 mb-8" />
          <Link
            to={`/${locale}/news`}
            className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-[#489e42] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'fr' ? 'Retour aux actualités' : 'Back to all news'}
          </Link>
        </article>
      </main>
      <Footer />
    </div>
  );
}
