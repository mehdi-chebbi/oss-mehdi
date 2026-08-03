import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { HeroData } from '../../api/auth';
import type { Locale } from '../../context/locale';

interface HeroProps {
  data: HeroData | null;
}

export default function Hero({ data: hero }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Fallback defaults if API fails
  const title = locale === 'en' ? (hero?.title_en ?? "The future of the Sahel is decided on the ground") : (hero?.title_fr ?? "L'avenir du Sahel se decide sur le terrain");
  const subtitle = locale === 'en' ? (hero?.subtitle_en ?? 'Monitoring, data and action for 22 member states facing land degradation.') : (hero?.subtitle_fr ?? 'Surveillance, donnees et action pour 22 Etats membres face a la degradation des terres.');
  const ctaPrimaryLabel = locale === 'en' ? (hero?.cta_primary_label_en ?? 'See our actions') : (hero?.cta_primary_label_fr ?? 'Voir nos actions');
  const ctaPrimaryLink = hero?.cta_primary_link ?? '#';
  const ctaSecondaryLabel = locale === 'en' ? (hero?.cta_secondary_label_en ?? 'Latest news') : (hero?.cta_secondary_label_fr ?? 'Dernieres actualites');
  const ctaSecondaryLink = hero?.cta_secondary_link ?? '#';
  const bgImage = hero?.background_image ?? '/hero.jpg';

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Image */}
      <img
        src={bgImage}
        alt="Paysage du Sahel"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/15" />
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:pl-10 pb-20 lg:pb-28">
        {/* Green accent line */}
        <div
          className="h-1 bg-[#489e42] mb-8 transition-all duration-700 ease-out"
          style={{ width: mounted ? '3rem' : '0rem', transitionDelay: '100ms' }}
        />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.05] max-w-3xl">
          {title}
        </h1>
        <p className="text-white/40 text-base lg:text-lg mt-5 max-w-lg leading-relaxed font-light">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-5 mt-12">
          {/* Primary — isoline button */}
          <a
            href={ctaPrimaryLink}
            className="group relative inline-flex items-center gap-3 px-9 py-[18px] text-[15px] font-semibold tracking-tight text-white isolate"
          >
            {/* Ring 3 — outermost */}
            <span
              className="absolute inset-0 border border-[#489e42]/40 -z-10 transition-all ease-out"
              style={{
                opacity: mounted ? 1 : 0,
                transitionDuration: '600ms',
                transitionDelay: '260ms',
                transform: mounted
                  ? 'translate(0.375rem, 0.375rem)'
                  : 'translate(0.9rem, 0.9rem)',
              }}
              aria-hidden="true"
            />
            {/* Ring 2 — mid layer */}
            <span
              className="absolute inset-0 border border-[#489e42]/65 -z-10 transition-all ease-out"
              style={{
                opacity: mounted ? 1 : 0,
                transitionDuration: '600ms',
                transitionDelay: '160ms',
                transform: mounted
                  ? 'translate(0.375rem, 0.375rem)'
                  : 'translate(1.4rem, 1.4rem)',
              }}
              aria-hidden="true"
            />
            {/* On hover, rings pull in tighter */}
            <span
              className="absolute inset-0 border border-[#489e42]/40 -z-10 transition-all duration-300 ease-out
                         translate-x-1.5 translate-y-1.5 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:border-[#489e42]/70"
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 border border-[#489e42]/65 -z-10 transition-all duration-300 ease-out
                         translate-x-1.5 translate-y-1.5 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
            {/* Fill — fades/scales in first */}
            <span
              className="absolute inset-0 -z-10 bg-[#489e42] transition-all ease-out group-hover:bg-[#3fa838]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'scale(1)' : 'scale(0.85)',
                transitionDuration: '500ms',
                transitionProperty: 'opacity, transform, background-color',
              }}
              aria-hidden="true"
            />
            <span
              className="relative flex items-center gap-3 transition-all ease-out"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(6px)',
                transitionDuration: '500ms',
                transitionDelay: '80ms',
              }}
            >
              {ctaPrimaryLabel}
              <svg
                width="18" height="18" viewBox="0 0 16 16" fill="none"
                className="transition-transform duration-300 ease-out group-hover:translate-x-1.5"
              >
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>

          {/* Secondary — corner brackets */}
          <a
            href={ctaSecondaryLink}
            className="group relative inline-flex items-center gap-3 px-9 py-[18px] text-[15px] font-semibold tracking-tight
                       text-white/75 transition-colors duration-300 hover:text-white"
          >
            <span
              className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-white/40 ease-out group-hover:w-4 group-hover:h-4 group-hover:border-white [transition:width_100ms,height_100ms,border-color_100ms]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translate(0,0)' : 'translate(-10px,-10px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '500ms',
                transitionDelay: mounted ? '0ms' : '340ms',
              }}
              aria-hidden="true"
            />
            <span
              className="absolute top-0 right-0 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-white/40 ease-out group-hover:w-4 group-hover:h-4 group-hover:border-white [transition:width_100ms,height_100ms,border-color_100ms]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translate(0,0)' : 'translate(10px,-10px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '500ms',
                transitionDelay: mounted ? '0ms' : '380ms',
              }}
              aria-hidden="true"
            />
            <span
              className="absolute bottom-0 left-0 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-white/40 ease-out group-hover:w-4 group-hover:h-4 group-hover:border-white [transition:width_100ms,height_100ms,border-color_100ms]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translate(0,0)' : 'translate(-10px,10px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '500ms',
                transitionDelay: mounted ? '0ms' : '380ms',
              }}
              aria-hidden="true"
            />
            <span
              className="absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-white/40 ease-out group-hover:w-4 group-hover:h-4 group-hover:border-white [transition:width_100ms,height_100ms,border-color_100ms]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translate(0,0)' : 'translate(10px,10px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '500ms',
                transitionDelay: mounted ? '0ms' : '420ms',
              }}
              aria-hidden="true"
            />
            <span
              className="transition-all ease-out group-hover:tracking-wide"
              style={{
                opacity: mounted ? 1 : 0,
                transitionDuration: '400ms',
                transitionDelay: '300ms',
              }}
            >
              {ctaSecondaryLabel}
            </span>
          </a>

        </div>
      </div>
    </section>
  );
}
