import type { PartnerData } from '@/api/auth';
import { useLocale } from '@/context/locale';

const localLogoByPartnerName: Record<string, string> = {
  'Adaptation Fund': '/logo/adaptation-fund.png',
  'Green Climate Fund': '/logo/green-climate-fund.png',
  GEF: '/logo/gef.avif',
  FFEM: '/logo/ffem.webp',
  'World Bank': '/logo/world-bank.webp',
  'African Union': '/logo/african-union.png',
  'African Development Bank': '/logo/african-development-bank.png',
  'African Water Facility': '/logo/awf.png',
  UNEP: '/logo/unep.png',
  COOP: '/logo/coop.png',
  GIZ: '/logo/giz.png',
  "Ministère de l'Environnement du Climat et de la Biodiversité":
    '/logo/luxembourg-environment.png',
  'Swiss Confederation': '/logo/swiss-confederation.svg',
  'European Union': '/logo/european-union.svg',
  'Europe et Étranger': '/logo/europe-foreign-affairs.jpg',
  'Ministère de la Transition Écologique et Solidaire':
    '/logo/france-ecological-transition.svg',
  AFD: '/logo/afd.png',
};

// Edge fade mask — applied to the row viewport (not the track).
const fadeMask = {
  maskImage:
    'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
  WebkitMaskImage:
    'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
} as React.CSSProperties;

function LogoTile({ name, image }: { name: string; image: string }) {
  const logoSource = localLogoByPartnerName[name] ?? image;

  return (
    <div className="shrink-0 px-8 lg:px-12 flex items-center justify-center h-28">
      <img
        src={logoSource}
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

interface PartnersProps {
  items: PartnerData[];
}

export default function Partners({ items: partners }: PartnersProps) {
  const { locale } = useLocale();

  if (partners.length === 0) return null;

  const row1 = partners.filter((p) => p.row_number === 1);
  const row2 = partners.filter((p) => p.row_number === 2);

  // Duplicate each list once -> track is exactly 2x content, so the
  // -50% translate yields a seamless loop.
  const row1Track = [...row1, ...row1];
  const row2Track = [...row2, ...row2];

  return (
    <section id="partenaires" className="bg-[#ffffff] pt-4 lg:pt-6 pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <div className="mb-10 lg:mb-12 max-w-2xl">
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-tight">
            {locale === 'fr' ? 'Nos partenaires' : 'Our Partners'}
          </h2>
        </div>
      </div>

      {/* Full-width marquee rows */}
      <div className="flex w-full flex-col gap-6 lg:gap-8">
          {/* Row 1 — scrolls right */}
          {row1Track.length > 0 && (
            <div className="relative overflow-hidden" style={fadeMask}>
              <div
                className="flex w-max group hover:[animation-play-state:paused]"
                style={{ animation: 'marquee-right 50s linear infinite' }}
              >
                {row1Track.map((p, i) => (
                  <LogoTile key={`r1-${i}`} name={p.name} image={p.image} />
                ))}
              </div>
            </div>
          )}

          {/* Row 2 — scrolls left */}
          {row2Track.length > 0 && (
            <div className="relative overflow-hidden" style={fadeMask}>
              <div
                className="flex w-max group hover:[animation-play-state:paused]"
                style={{ animation: 'marquee-left 60s linear infinite' }}
              >
                {row2Track.map((p, i) => (
                  <LogoTile key={`r2-${i}`} name={p.name} image={p.image} />
                ))}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
