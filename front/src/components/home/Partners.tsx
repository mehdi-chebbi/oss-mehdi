import { useState } from 'react';
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
  "Ministère de l'Environnement du Climat et de la Biodiversité": '/logo/luxembourg-environment.png',
  'Swiss Confederation': '/logo/swiss-confederation.svg',
  'European Union': '/logo/european-union.svg',
  'Europe et Étranger': '/logo/europe-foreign-affairs.jpg',
  'Ministère de la Transition Écologique et Solidaire': '/logo/france-ecological-transition.svg',
  AFD: '/logo/afd.png',
};

function LogoTile({ name, image }: { name: string; image: string }) {
  return (
    <div className="group relative flex h-28 w-60 shrink-0 items-center justify-center overflow-hidden border-r border-oss-line bg-white px-6 py-5 transition-colors duration-300 hover:bg-oss-blue/5 lg:h-32 lg:w-72">
      <img
        src={localLogoByPartnerName[name] ?? image}
        alt={name}
        loading="lazy"
        className="h-14 w-auto max-w-[190px] select-none object-contain transition-transform duration-300 ease-out group-hover:scale-[1.15] lg:h-16"
      />
      <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-oss-ochre transition-transform duration-300 ease-out group-hover:scale-x-100" aria-hidden="true" />
    </div>
  );
}

interface PartnersProps {
  items: PartnerData[];
}

export default function Partners({ items: partners }: PartnersProps) {
  const { locale } = useLocale();
  const [paused, setPaused] = useState(false);
  if (partners.length === 0) return null;

  const configuredRow1 = partners.filter((partner) => partner.row_number === 1);
  const configuredRow2 = partners.filter((partner) => partner.row_number === 2);
  const row1 = configuredRow1.length > 0 ? configuredRow1 : partners.filter((_, index) => index % 2 === 0);
  const row2 = configuredRow2.length > 0 ? configuredRow2 : partners.filter((_, index) => index % 2 === 1);
  const row1Track = [...row1, ...row1];
  const row2Track = [...row2, ...row2];

  const fadeMask = {
    maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
  };

  return (
    <section id="partenaires" className="bg-oss-paper py-10 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <p className="oss-kicker mb-4">{locale === 'fr' ? 'Coopération' : 'Cooperation'}</p>
          <h2 className="oss-section-title">
            {locale === 'fr' ? 'Nos partenaires' : 'Our partners'}
          </h2>
        </div>
      </div>

      <div
        className="grid gap-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {row1.length > 0 && (
          <div className="overflow-hidden" style={fadeMask}>
            <div
              className="flex w-max motion-reduce:[animation:none]"
              style={{ animation: 'marquee-right 48s linear infinite', animationPlayState: paused ? 'paused' : 'running' }}
            >
              {row1Track.map((partner, index) => (
                <LogoTile key={`row-1-${partner.id}-${index}`} name={partner.name} image={partner.image} />
              ))}
            </div>
          </div>
        )}

        {row2.length > 0 && (
          <div className="overflow-hidden" style={fadeMask}>
            <div
              className="flex w-max motion-reduce:[animation:none]"
              style={{ animation: 'marquee-left 54s linear infinite', animationPlayState: paused ? 'paused' : 'running' }}
            >
              {row2Track.map((partner, index) => (
                <LogoTile key={`row-2-${partner.id}-${index}`} name={partner.name} image={partner.image} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
