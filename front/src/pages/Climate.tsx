import { useLoaderData, useParams } from 'react-router-dom';
import DomainIntro from '@/components/domains/DomainIntro';
import DomainProjectsSection from '@/components/domains/DomainProjectsSection';
import type { Locale } from '@/context/locale';
import type { DomainProjectsLoaderData } from '@/loaders/public';

const intro: Record<Locale, { title: string; paragraphs: string[] }> = {
  fr: {
    title: 'Renforcer la résilience face au changement climatique',
    paragraphs: [
      'Confronté à l’urgence climatique, l’OSS se positionne comme un acteur clé pour accompagner l’adaptation, atténuer les impacts et renforcer la résilience des populations et des écosystèmes. Accrédité auprès du Fonds vert pour le climat et du Fonds d’adaptation, il soutient ses pays membres dans la conception, le financement et la mise en œuvre de projets climatiques innovants et structurants. Il contribue également à l’élaboration et au suivi des contributions déterminées au niveau national (CDN), tout en favorisant le développement de mécanismes de gestion des risques, de systèmes d’alerte précoce et de dispositifs de partage des connaissances scientifiques.',
      'Ses interventions s’inscrivent pleinement dans la dynamique de l’Accord de Paris, de la CCNUCC, ainsi que des grands agendas africains et internationaux, afin de promouvoir une action climatique ambitieuse, inclusive et ancrée dans les territoires.',
    ],
  },
  en: {
    title: 'Strengthen resilience to climate change',
    paragraphs: [
      'Faced with the climate emergency, OSS plays a key role in supporting adaptation, reducing impacts and strengthening the resilience of communities and ecosystems. Accredited by the Green Climate Fund and the Adaptation Fund, it supports its member countries in designing, financing and implementing innovative, transformative climate projects. OSS also contributes to the development and monitoring of nationally determined contributions (NDCs), while promoting risk-management mechanisms, early warning systems and scientific knowledge-sharing arrangements.',
      'Its work fully supports the momentum of the Paris Agreement, the UNFCCC and major African and international agendas, promoting ambitious and inclusive climate action rooted in local territories.',
    ],
  },
};

export default function Climate() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { projects } = useLoaderData() as DomainProjectsLoaderData;

  return (
    <main className="font-oss min-h-[65vh] bg-oss-paper text-ink antialiased">
      <DomainIntro
        title={intro[locale].title}
        paragraphs={intro[locale].paragraphs}
        image={{
          src: '/images/domains/climate.png',
          alt: locale === 'fr'
            ? 'Communauté agricole utilisant des pratiques résilientes face au changement climatique'
            : 'Farming community using climate-resilient practices',
          position: '40% center',
        }}
      />
      <DomainProjectsSection
        locale={locale}
        projects={projects}
        thematicSlug="climate"
        description={{
          fr: 'Découvrez les dernières initiatives de l’OSS consacrées à l’adaptation et à la résilience climatique.',
          en: 'Discover the latest OSS initiatives supporting climate adaptation and resilience.',
        }}
      />
    </main>
  );
}
