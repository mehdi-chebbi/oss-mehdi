import { useLoaderData, useParams } from 'react-router-dom';
import DomainIntro from '@/components/domains/DomainIntro';
import DomainProjectsSection from '@/components/domains/DomainProjectsSection';
import type { Locale } from '@/context/locale';
import type { DomainProjectsLoaderData } from '@/loaders/public';

const intro: Record<Locale, { title: string; paragraphs: string[] }> = {
  fr: {
    title: 'Lutter contre la désertification, restaurer les terres, bâtir la résilience',
    paragraphs: [
      'L’OSS agit pour combattre la désertification, restaurer les terres dégradées et renforcer la résilience des États face à la sécheresse et aux pressions liées aux activités humaines. En appui à des initiatives majeures telles que la Grande Muraille Verte et les programmes de Neutralité en matière de Dégradation des Terres, l’OSS développe et met à disposition des outils de suivi et de planification qui associent données satellitaires et observations de terrain.',
      'À travers cet axe stratégique, l’OSS contribue activement à la mise en œuvre de la Convention des Nations Unies sur la lutte contre la désertification (CNULCD) et à l’atteinte de la cible 15.3 des Objectifs de développement durable, qui vise la neutralité en matière de dégradation des terres d’ici 2030.',
    ],
  },
  en: {
    title: 'Combat desertification, restore land, build resilience',
    paragraphs: [
      'OSS works to combat desertification, restore degraded land and strengthen the resilience of states facing drought and pressures from human activities. In support of major initiatives such as the Great Green Wall and Land Degradation Neutrality programmes, OSS develops and provides monitoring and planning tools that combine satellite data with field observations.',
      'Through this strategic area, OSS actively contributes to implementing the United Nations Convention to Combat Desertification (UNCCD) and achieving Sustainable Development Goal target 15.3, which aims to reach land degradation neutrality by 2030.',
    ],
  },
};

export default function Land() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { projects } = useLoaderData() as DomainProjectsLoaderData;

  return (
    <main className="font-oss min-h-[65vh] bg-oss-paper text-ink antialiased">
      <DomainIntro
        title={intro[locale].title}
        paragraphs={intro[locale].paragraphs}
        image={{
          src: '/images/domains/land.png',
          alt: locale === 'fr'
            ? 'Communauté restaurant des terres dégradées dans un paysage semi-aride africain'
            : 'Community restoring degraded land in a semi-arid African landscape',
          position: '70% center',
        }}
      />
      <DomainProjectsSection
        locale={locale}
        projects={projects}
        thematicSlug="land-biodiversity"
        description={{
          fr: 'Découvrez les dernières initiatives de l’OSS consacrées à la restauration des terres et à la lutte contre la désertification.',
          en: 'Discover the latest OSS initiatives supporting land restoration and the fight against desertification.',
        }}
      />
    </main>
  );
}
