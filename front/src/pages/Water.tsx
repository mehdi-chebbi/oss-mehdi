import { useLoaderData, useParams } from 'react-router-dom';
import DomainIntro from '@/components/domains/DomainIntro';
import DomainProjectsSection from '@/components/domains/DomainProjectsSection';
import type { Locale } from '@/context/locale';
import type { DomainProjectsLoaderData } from '@/loaders/public';

const intro: Record<Locale, { title: string; paragraphs: string[] }> = {
  fr: {
    title: 'Garantir la sécurité hydrique et la coopération régionale',
    paragraphs: [
      'L’eau occupe une place centrale dans les priorités stratégiques de l’OSS. Ressource vitale, elle conditionne la sécurité des populations, la stabilité régionale et le développement durable. À travers sa Stratégie 2030, l’OSS s’attache à améliorer la connaissance, la gouvernance et la gestion durable des ressources en eau, qu’elles soient souterraines ou de surface.',
      'L’institution appuie ses pays membres dans la planification des usages, la mise en œuvre de politiques intégrées et le développement de mécanismes de concertation autour des aquifères partagés, tels que le SASS et ITTAS, tout en travaillant avec l’AMCOW, le RAOB et les autorités de bassin pour placer l’eau au cœur des priorités politiques et renforcer la résilience face aux pressions climatiques et socio-économiques.',
    ],
  },
  en: {
    title: 'Ensure water security and regional cooperation',
    paragraphs: [
      'Water lies at the heart of OSS strategic priorities. As a vital resource, it shapes human security, regional stability and sustainable development. Through its 2030 Strategy, OSS works to improve knowledge, governance and the sustainable management of groundwater and surface water resources.',
      'It supports its member countries in planning water uses, implementing integrated policies and developing consultation mechanisms for shared aquifers such as SASS and ITTAS. OSS also works with AMCOW, ANBO and basin authorities to place water at the centre of policy priorities and strengthen resilience to climate and socioeconomic pressures.',
    ],
  },
};

export default function Water() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { projects } = useLoaderData() as DomainProjectsLoaderData;

  return (
    <main className="font-oss min-h-[65vh] bg-oss-paper text-ink antialiased">
      <DomainIntro
        title={intro[locale].title}
        paragraphs={intro[locale].paragraphs}
        image={{
          src: '/images/domains/water.png',
          alt: locale === 'fr'
            ? 'Spécialistes de l’eau réunis près d’un canal d’irrigation dans une oasis'
            : 'Water specialists meeting beside an irrigation channel in an oasis',
          position: '72% center',
        }}
      />
      <DomainProjectsSection
        locale={locale}
        projects={projects}
        thematicSlug="water"
        description={{
          fr: 'Découvrez les dernières initiatives de l’OSS consacrées à la sécurité hydrique et à la gestion concertée des ressources en eau.',
          en: 'Discover the latest OSS initiatives supporting water security and cooperative water resource management.',
        }}
      />
    </main>
  );
}
