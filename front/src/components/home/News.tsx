import { ArrowRight } from 'lucide-react';
import { featured, headlines } from '@/data/news';

export default function News() {
  return (
    <section id="actualites" className="bg-bone pt-4 lg:pt-6 pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <div className="mb-10 lg:mb-12 max-w-2xl">
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-tight">
            Actualités
          </h2>
        </div>

        {/* Editorial layout: 1.7fr featured + 1fr sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-12">
          {/* Featured story */}
          <article className="lg:border-r lg:border-ink/10 lg:pr-12 lg:pb-0 pb-10 lg:border-b-0 border-b border-ink/10">
            <a href={featured.href} className="group block">
              {/* Featured image (16:9) */}
              <div className="relative w-full aspect-[16/9] overflow-hidden mb-5">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
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
                  {featured.title}
                </span>
              </h3>

              {/* Dek */}
              {featured.dek && (
                <p className="font-serif text-[19px] text-ink/55 leading-[1.5] mb-5">
                  {featured.dek}
                </p>
              )}

              {/* Byline */}
              <div className="text-[12px] uppercase tracking-[0.08em] text-ink/45 border-t border-ink/10 pt-3 flex items-center justify-between">
                <span>{featured.date}</span>
                <span className="flex items-center gap-1.5 text-[#489e42] font-semibold normal-case tracking-normal">
                  Lire
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          </article>

          {/* Sidebar — small stories */}
          <aside className="flex flex-col">
            <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#b07a48] mb-5">
              Plus d&apos;actualités
            </div>

            <div className="flex flex-col justify-between gap-0">
              {headlines.map((h, i) => (
                <a
                  key={h.title}
                  href={h.href}
                  className={`group block py-4 ${
                    i === 0 ? 'pt-0' : 'border-t border-ink/10'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    {/* Thumbnail (16:6 letterbox) */}
                    <div className="relative w-full aspect-[16/6] overflow-hidden">
                      <img
                        src={h.imageUrl}
                        alt={h.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>

                    {/* Body */}
                    <div className="min-w-0">
                      <h4 className="font-serif font-semibold text-[16.5px] leading-[1.25] text-ink">
                        <span className="bg-gradient-to-r from-[#489e42] to-[#489e42] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                          {h.title}
                        </span>
                      </h4>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
