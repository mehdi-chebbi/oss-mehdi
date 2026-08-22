import { useParams } from 'react-router-dom';

type Domain = 'biodiversity' | 'climate' | 'water' | 'land';

const domainNames: Record<'en' | 'fr', Record<Domain, string>> = {
  en: {
    biodiversity: 'Biodiversity',
    climate: 'Climate',
    water: 'Water',
    land: 'Land',
  },
  fr: {
    biodiversity: 'Biodiversité',
    climate: 'Climat',
    water: 'Eau',
    land: 'Terre',
  },
};

export default function DomainPlaceholder({ domain }: { domain: Domain }) {
  const { lang } = useParams<{ lang: string }>();
  const locale = lang === 'en' ? 'en' : 'fr';

  return (
    <main className="font-oss flex min-h-[65vh] items-center justify-center bg-oss-paper px-6 text-center">
      <h1 className="text-4xl font-bold text-oss-blue-dark sm:text-5xl">
        Hi from {domainNames[locale][domain]} page
      </h1>
    </main>
  );
}
