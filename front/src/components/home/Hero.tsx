import { ArrowRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { HeroData } from '../../api/auth';
import type { Locale } from '../../context/locale';
import BrandBands from '../shared/BrandBands';

interface HeroProps {
  data: HeroData | null;
}

export default function Hero({ data: hero }: HeroProps) {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  const title = locale === 'en'
    ? (hero?.title_en ?? 'The future of the Sahel is decided on the ground')
    : (hero?.title_fr ?? "L'avenir du Sahel se décide sur le terrain");
  const subtitle = locale === 'en'
    ? (hero?.subtitle_en ?? 'Monitoring, data and action for 22 member states facing land degradation.')
    : (hero?.subtitle_fr ?? 'Surveillance, données et action pour 22 États membres face à la dégradation des terres.');
  const ctaPrimaryLabel = locale === 'en'
    ? (hero?.cta_primary_label_en ?? 'See our actions')
    : (hero?.cta_primary_label_fr ?? 'Voir nos actions');
  const ctaSecondaryLabel = locale === 'en'
    ? (hero?.cta_secondary_label_en ?? 'Latest news')
    : (hero?.cta_secondary_label_fr ?? 'Dernières actualités');

  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden bg-oss-blue-dark pt-24">
      <img
        src={hero?.background_image ?? '/hero.jpg'}
        alt={locale === 'en' ? 'Sahel landscape' : 'Paysage du Sahel'}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,53,91,0.94)_0%,rgba(18,53,91,0.76)_42%,rgba(18,53,91,0.18)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-oss-blue-dark/70 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-20 sm:px-8 lg:px-12 lg:pb-24">
        <div className="max-w-3xl border-l-4 border-oss-ochre pl-6 sm:pl-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-oss-ochre">
            {locale === 'en' ? 'Sahara and Sahel Observatory' : 'Observatoire du Sahara et du Sahel'}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl xl:text-[4.4rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 lg:text-lg">
            {subtitle}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={hero?.cta_primary_link ?? '#nos-domaines'}
              className="inline-flex min-h-12 items-center gap-3 bg-oss-ochre px-6 py-3 text-sm font-bold text-oss-blue-dark transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-oss-blue-dark"
            >
              {ctaPrimaryLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={hero?.cta_secondary_link ?? '#actualites'}
              className="inline-flex min-h-12 items-center gap-3 border border-white/70 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-oss-blue-dark focus:outline-none focus:ring-2 focus:ring-white"
            >
              {ctaSecondaryLabel}
            </a>
          </div>
        </div>
      </div>

      <BrandBands className="absolute inset-x-0 bottom-0 z-20" />
    </section>
  );
}
