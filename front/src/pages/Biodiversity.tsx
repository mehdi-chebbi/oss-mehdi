import { useLoaderData, useParams } from 'react-router-dom';
import DomainIntro from '@/components/domains/DomainIntro';
import DomainProjectsSection from '@/components/domains/DomainProjectsSection';
import type { Locale } from '@/context/locale';
import type { DomainProjectsLoaderData } from '@/loaders/public';

const intro: Record<Locale, { title: string; paragraphs: string[] }> = {
  fr: {
    title: 'Préserver la biodiversité, restaurer les écosystèmes, renforcer la résilience.',
    paragraphs: [
      'L’OSS accompagne ses pays membres dans la mise en œuvre du Cadre mondial de la biodiversité de Kunming-Montréal, en plaçant la biodiversité et la gestion durable des terres au cœur de son mandat.',
      'En tant que Centre africain de soutien technique et scientifique, intégré à un réseau mondial de 18 centres similaires, l’OSS appuie ses pays membres à travers la production et la diffusion de données environnementales, la mobilisation de financements, l’appui institutionnel et le renforcement des capacités.',
      'Depuis vingt ans, l’OSS mène des projets dans des écosystèmes variés (forêts, zones humides, oasis, littoraux, aires protégées et terres agricoles) touchant plus de 5 millions de personnes, principalement en milieu rural. Ces actions contribuent directement aux ODD 15, 13 et 2 et confirment le rôle de l’OSS comme catalyseur régional pour la préservation de la biodiversité.',
    ],
  },
  en: {
    title: 'Protect biodiversity, restore ecosystems, strengthen resilience.',
    paragraphs: [
      'OSS supports its member countries in implementing the Kunming-Montreal Global Biodiversity Framework, placing biodiversity and sustainable land management at the heart of its mandate.',
      'As an African technical and scientific support centre within a global network of 18 similar centres, OSS assists its member countries by producing and sharing environmental data, mobilising finance, providing institutional support and strengthening capacities.',
      'For twenty years, OSS has implemented projects across a wide range of ecosystems, including forests, wetlands, oases, coastal areas, protected areas and agricultural land. These projects have reached more than 5 million people, mainly in rural areas. They contribute directly to SDGs 15, 13 and 2 and confirm the role of OSS as a regional catalyst for biodiversity conservation.',
    ],
  },
};

export default function Biodiversity() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { projects } = useLoaderData() as DomainProjectsLoaderData;

  return (
    <main className="font-oss min-h-[65vh] bg-oss-paper text-ink antialiased">
      <DomainIntro
        title={intro[locale].title}
        paragraphs={intro[locale].paragraphs}
        image={{
          src: '/images/domains/biodiversity.png',
          alt: locale === 'fr'
            ? 'Spécialistes observant la biodiversité dans une zone humide africaine'
            : 'Specialists observing biodiversity in an African wetland',
          position: '72% center',
        }}
      />
      <DomainProjectsSection
        locale={locale}
        projects={projects}
        thematicSlug="biodiversity"
        description={{
          fr: 'Découvrez les dernières initiatives de l’OSS en faveur de la biodiversité et des écosystèmes.',
          en: 'Discover the latest OSS initiatives supporting biodiversity and ecosystems.',
        }}
      />
    </main>
  );
}
