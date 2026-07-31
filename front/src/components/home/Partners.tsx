import { row1, row2 } from '@/data/partners';
import type { Partner } from '@/types';

// Edge fade mask — applied to the row viewport (not the track).
const fadeMask = {
  maskImage:
    'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
  WebkitMaskImage:
    'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
} as React.CSSProperties;

function LogoTile({ name, logo }: Partner) {
  return (
    <div className="shrink-0 px-8 lg:px-12 flex items-center justify-center h-28">
      <img
        src={logo}
        alt={name}
        loading="lazy"
        className="
          h-16 lg:h-20 w-auto max-w-[280px] object-contain
          opacity-70
          transition-all duration-300 ease-out
          hover:opacity-100 hover:scale-105
          select-none
        "
      />
    </div>
  );
}

export default function Partners() {
  // Duplicate each list once -> track is exactly 2x content, so the
  // -50% translate yields a seamless loop.
  const row1Track = [...row1, ...row1];
  const row2Track = [...row2, ...row2];

  return (
    <section id="partenaires" className="bg-bone pt-4 lg:pt-6 pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <div className="mb-10 lg:mb-12 max-w-2xl">
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-tight">
            Nos partenaires
          </h2>
        </div>

        {/* Marquee rows */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Row 1 — scrolls right */}
          <div className="relative overflow-hidden" style={fadeMask}>
            <div
              className="flex w-max group hover:[animation-play-state:paused]"
              style={{ animation: 'marquee-right 50s linear infinite' }}
            >
              {row1Track.map((p, i) => (
                <LogoTile key={`r1-${i}`} name={p.name} logo={p.logo} />
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls left */}
          <div className="relative overflow-hidden" style={fadeMask}>
            <div
              className="flex w-max group hover:[animation-play-state:paused]"
              style={{ animation: 'marquee-left 60s linear infinite' }}
            >
              {row2Track.map((p, i) => (
                <LogoTile key={`r2-${i}`} name={p.name} logo={p.logo} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
