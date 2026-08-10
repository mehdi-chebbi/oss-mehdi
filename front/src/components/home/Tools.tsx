import { useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import type { ToolData } from '@/api/auth';
import { localized, useLocale } from '@/context/locale';
import 'swiper/css';

interface ToolsProps {
  items: ToolData[];
}

export default function Tools({ items: tools }: ToolsProps) {
  const { locale } = useLocale();
  const [activeIdx, setActiveIdx] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  if (tools.length === 0) return null;

  const active = tools[activeIdx] ?? tools[0];

  return (
    <section className="overflow-hidden bg-oss-paper py-10 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="mb-12 max-w-3xl">
          <p className="oss-kicker mb-4">
            {locale === 'fr' ? 'Connaissance et décision' : 'Knowledge and decisions'}
          </p>
          <h2 className="oss-section-title">
            {locale === 'fr' ? 'Nos outils' : 'Our tools'}
          </h2>
        </div>

        <div className="grid items-stretch gap-8 border border-oss-blue/15 bg-oss-blue/5 p-5 sm:p-8 lg:grid-cols-[0.85fr_1.4fr] lg:gap-14 lg:p-10">
          <div className="flex flex-col justify-between border border-oss-line border-l-4 border-l-oss-ochre bg-white p-7 sm:p-9">
            <div>
              <div className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-oss-blue">
                {String(activeIdx + 1).padStart(2, '0')} / {String(tools.length).padStart(2, '0')}
              </div>
              <h3 className="text-2xl font-bold leading-tight text-oss-blue-dark sm:text-3xl">
                {localized(active, 'title', locale)}
              </h3>
              <p className="mt-5 text-base leading-relaxed text-ink/65">
                {localized(active, 'description', locale)}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <a
                href={active.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 bg-oss-ochre px-5 py-3 text-sm font-bold text-oss-blue-dark transition-colors hover:bg-white"
              >
                {locale === 'fr' ? "Visiter l'outil" : 'Visit tool'}
                <ExternalLink className="h-4 w-4" />
              </a>
              <div className="flex gap-2">
                <button type="button" onClick={() => swiper?.slidePrev()} className="grid h-11 w-11 place-items-center border border-oss-blue/25 text-oss-blue transition-colors hover:border-oss-blue hover:bg-oss-blue hover:text-white" aria-label="Précédent">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => swiper?.slideNext()} className="grid h-11 w-11 place-items-center border border-oss-blue/25 text-oss-blue transition-colors hover:border-oss-blue hover:bg-oss-blue hover:text-white" aria-label="Suivant">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <Swiper
              slidesPerView={1}
              spaceBetween={18}
              loop={tools.length > 2}
              speed={450}
              onSwiper={(instance) => setSwiper(instance)}
              onSlideChange={(instance) => setActiveIdx(instance.realIndex)}
              className="h-full"
            >
              {tools.map((tool) => (
                <SwiperSlide key={tool.id} className="h-auto">
                  <article className="group relative min-h-[360px] overflow-hidden border-b-4 border-oss-ochre sm:min-h-[430px]">
                    <img src={tool.image} alt={localized(tool, 'title', locale)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-oss-blue-dark/90 via-oss-blue-dark/20 to-transparent" />
                    <h4 className="absolute inset-x-0 bottom-0 p-6 text-xl font-bold leading-tight text-white sm:p-8 sm:text-2xl">
                      {localized(tool, 'title', locale)}
                    </h4>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
