import { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import BrandBands from '@/components/shared/BrandBands';
import MemberWorldMap from '@/components/members/MemberWorldMap';

export default function Members() {
  const { lang } = useParams<{ lang: string }>();
  const locale = lang === 'en' ? 'en' : 'fr';
  const [admissionVisible, setAdmissionVisible] = useState(false);
  const admissionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = admissionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setAdmissionVisible(true);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const organisations = [
    { abbr: 'APGMV', name: 'Agence Panafricaine de la Grande Muraille Verte', logo: '/member-logos/apgmv.jpg', website: 'https://www.grandemurailleverte.org/' },
    { abbr: 'CARI', name: "Centre d'Actions et de Réalisations Internationales", logo: '/member-logos/cari.png', website: 'https://www.cariassociation.org/' },
    { abbr: 'CRTEAN', name: "Centre Régional de Télédétection des Etats de l'Afrique du Nord", logo: '/member-logos/crtean.jpg', website: 'https://crtean.org.tn/' },
    { abbr: 'CILSS', name: "Comité permanent Inter-Etats de Lutte contre la Sécheresse dans le Sahel", logo: '/member-logos/cilss.png', website: 'https://www.cilss.int/' },
    { abbr: 'CBLT', name: 'Commission du Bassin du Lac Tchad', logo: '/member-logos/cblt.jpg', website: 'https://cblt.org/fr/' },
    { abbr: 'CENSAD', name: 'Communauté des Etats sahélo-sahariens', website: 'https://censad.int/' },
    { abbr: 'CNULCD', name: 'Convention des Nations Unies sur la Lutte Contre la Désertification', logo: '/member-logos/cnulcd.png', website: 'https://www.unccd.int/' },
    { abbr: 'CRU-BN', name: "Coordination Régionale des Usagers.eres des ressources naturelles du Bassin du Niger" },
    { abbr: 'ENDA', name: 'Environnement et Développement du tiers-monde', website: 'https://www.enda-tm.org/' },
    { abbr: 'IGAD', name: 'Intergovernmental Authority on Development', logo: '/member-logos/igad.png', website: 'https://igad.int/' },
    { abbr: 'FAO', name: "Organisation des Nations Unies pour l'alimentation et l'agriculture", logo: '/member-logos/fao.png', website: 'https://www.fao.org/home/fr/' },
    { abbr: 'UMA', name: 'Union du Maghreb Arabe', logo: '/member-logos/uma.png', website: 'https://maghrebarabe.org/fr/' },
  ];

  const admissionSteps = [
    {
      title: "États & Organisations Intergouvernementales",
      content: "Les États et les Organisations intergouvernementales qui ont notifié leurs contributions au budget de l'OSS par écrit."
    },
    {
      title: "Organisations Non Gouvernementales",
      content: "Les Organisations internationales non gouvernementales dont la demande officielle d'adhésion a été adressée au Secrétariat exécutif de l'OSS et approuvée par l'Assemblée Générale."
    },
    {
      title: "Critères d'Éligibilité",
      content: "Seules les Organisations non gouvernementales internationales opérant dans le domaine de la science et dont les activités sont compatibles avec les objectifs de l'OSS, peuvent en devenir membres."
    }
  ];

  return (
    <div className="font-oss min-h-screen overflow-hidden bg-oss-paper text-ink antialiased selection:bg-oss-blue selection:text-white">
      <section className="mx-auto grid max-w-[1400px] gap-10 px-6 pb-12 pt-16 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-16 lg:px-12 lg:pb-16 lg:pt-20">
        <div>
          <p className="oss-kicker mb-5">Réseau international de l&apos;OSS</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
            États membres &amp; organisations
          </h1>
          <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
            Un réseau international dédié à la gestion durable des ressources naturelles et à la lutte contre la désertification en Afrique.
          </p>
        </div>

        <div className="relative grid min-h-[245px] grid-cols-2 overflow-hidden bg-oss-blue-dark text-white">
          <div className="flex flex-col justify-end border-r border-white/15 p-6 sm:p-8">
            <div className="text-5xl font-bold leading-none text-oss-ochre sm:text-6xl">35</div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.09em] text-white/70">États membres</p>
          </div>
          <div className="flex flex-col justify-end p-6 sm:p-8">
            <div className="text-5xl font-bold leading-none text-oss-blue-light sm:text-6xl">12</div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.09em] text-white/70">Organisations</p>
          </div>
          <BrandBands className="absolute inset-x-0 bottom-0" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-9">
          <div>
            <h2 className="oss-section-title">Pays membres</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/65">Explorez le réseau international de l&apos;OSS et découvrez ses pays membres à travers le monde.</p>
          </div>
        </div>
        <MemberWorldMap locale={locale} />
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-9 max-w-2xl">
          <h2 className="oss-section-title">Organisations membres</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">Institutions régionales et internationales réunies autour des priorités environnementales du continent.</p>
        </div>

        <div className="grid border-l border-t border-oss-line sm:grid-cols-2 lg:grid-cols-3">
          {organisations.map((org, index) => {
            const card = (
              <article className="group relative grid h-32 grid-cols-[8rem_1fr] overflow-hidden border-b border-r border-oss-line bg-white transition-colors duration-300 hover:bg-oss-blue/5">
              <span className={`absolute left-0 top-0 h-1 w-12 transition-all duration-300 group-hover:w-full ${index % 3 === 0 ? "bg-oss-blue" : index % 3 === 1 ? "bg-oss-green" : "bg-oss-ochre"}`} aria-hidden="true" />
              <div className="flex min-h-full items-center justify-center overflow-hidden border-r border-oss-line bg-oss-paper">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={`Logo ${org.abbr}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                ) : (
                  <span className="sr-only">Emplacement du logo {org.abbr}</span>
                )}
              </div>
              <div className="min-w-0 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold tracking-[0.06em] text-oss-blue">{org.abbr}</span>
                  <span className="text-[10px] font-bold text-ink/25">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-ink/62 transition-colors group-hover:text-oss-blue-dark">{org.name}</p>
              </div>
              </article>
            );

            return org.website ? (
              <a
                key={org.abbr}
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visiter le site officiel de ${org.name}`}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-oss-blue"
              >
                {card}
              </a>
            ) : (
              <div key={org.abbr}>{card}</div>
            );
          })}
        </div>
      </section>

      <section ref={admissionRef} className="mx-auto max-w-[1400px] px-6 pb-24 pt-12 sm:px-8 lg:px-12 lg:pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="self-start bg-oss-blue-dark p-7 text-white sm:p-9 lg:sticky lg:top-28">
            <h2 className="text-4xl font-bold tracking-[-0.025em] sm:text-5xl">Admission</h2>
            <p className="mt-6 text-base leading-relaxed text-white/72">Les États et les Organisations souhaitant adhérer à l&apos;OSS peuvent suivre la procédure décrite dans les statuts de l&apos;institution.</p>
            <p className="mt-8 border-l-2 border-oss-ochre pl-5 text-sm leading-relaxed text-white/62">Pour obtenir les documents statutaires et toute information complémentaire, rapprochez-vous du Secrétariat exécutif.</p>
          </div>

          <div className="relative">
            <div className={`absolute bottom-8 left-5 top-8 w-px origin-top bg-oss-ochre/55 transition-transform duration-[1800ms] ease-out motion-reduce:transform-none motion-reduce:transition-none ${admissionVisible ? "scale-y-100" : "scale-y-0"}`} aria-hidden="true" />
            <div className="space-y-3">
              {admissionSteps.map((step, index) => (
                <article
                  key={step.title}
                  className={`relative ml-5 bg-white py-7 pl-12 pr-7 transition-all duration-[1000ms] ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none sm:py-9 sm:pl-16 sm:pr-9 ${admissionVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
                  style={{ transitionDelay: admissionVisible ? `${index * 350 + 250}ms` : "0ms" }}
                >
                  <div className="absolute -left-5 top-8 flex h-10 w-10 items-center justify-center bg-oss-ochre text-xs font-bold text-oss-blue-dark">{String(index + 1).padStart(2, '0')}</div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-oss-blue/65">Critère d&apos;admission</p>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-oss-blue-dark sm:text-2xl">{step.title}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/65">{step.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
