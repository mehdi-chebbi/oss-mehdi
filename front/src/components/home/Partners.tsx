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

function LogoContent({ name, image }: { name: string; image: string }) {
  return (
    <img
      src={localLogoByPartnerName[name] ?? image}
      alt={name}
      loading="lazy"
      className="max-h-16 w-auto max-w-full select-none object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.14] sm:max-w-[180px] lg:max-h-20 lg:max-w-[210px]"
    />
  );
}

function LogoTile({ partner, locale }: { partner: PartnerData; locale: 'fr' | 'en' }) {
  const className =
    'group flex min-h-24 basis-1/2 items-center justify-center px-3 py-5 transition-opacity duration-300 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oss-blue sm:min-h-28 sm:basis-1/3 sm:px-5 md:basis-1/4 lg:min-h-32 lg:basis-[20%] xl:basis-1/6';

  if (partner.website_url) {
    return (
      <a
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={locale === 'fr' ? `Visiter le site de ${partner.name}` : `Visit ${partner.name} website`}
        className={className}
      >
        <LogoContent name={partner.name} image={partner.image} />
      </a>
    );
  }

  return (
    <div className={className}>
      <LogoContent name={partner.name} image={partner.image} />
    </div>
  );
}

interface PartnersProps {
  items: PartnerData[];
}

export default function Partners({ items: partners }: PartnersProps) {
  const { locale } = useLocale();
  if (partners.length === 0) return null;

  return (
    <section id="partenaires" className="bg-oss-paper py-10 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="mb-7 max-w-2xl lg:mb-9">
          <h2 className="oss-section-title">
            {locale === 'fr' ? 'Nos partenaires' : 'Our partners'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-y-3">
          {partners.map((partner) => (
            <LogoTile key={partner.id} partner={partner} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
