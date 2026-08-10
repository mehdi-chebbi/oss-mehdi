import { useEffect, useRef, useState } from "react";
import BrandBands from '@/components/shared/BrandBands';

export default function Members() {
  const [activeTab, setActiveTab] = useState("africa");
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

  const africanCountries = [
    'Algérie', 'Bénin', 'Burkina Faso', 'Cameroun', 'Cap Vert',
    "Côte d'Ivoire", 'Djibouti', 'Egypte', 'Erythrée', 'Ethiopie',
    'Gambie', 'Guinée', 'Guinée-Bissau', 'Kenya', 'Libéria', 'Libye',
    'Mali', 'Maroc', 'Mauritanie', 'Niger', 'Nigeria', 'Ouganda',
    'République centrafricaine', 'Sénégal', 'Somalie', 'Soudan', 'Tchad', 'Tunisie',
  ];

  const nonAfricanCountries = [
    'Allemagne', 'Belgique', 'Canada', 'France', 'Italie', 'Luxembourg', 'Suisse',
  ];

  const organisations = [
    { abbr: 'APGMV', name: 'Agence Panafricaine de la Grande Muraille Verte' },
    { abbr: 'CARI', name: "Centre d'Actions et de Réalisations Internationales" },
    { abbr: 'CRTEAN', name: "Centre Régional de Télédétection des Etats de l'Afrique du Nord" },
    { abbr: 'CILSS', name: "Comité permanent Inter-Etats de Lutte contre la Sécheresse dans le Sahel" },
    { abbr: 'CBLT', name: 'Commission du Bassin du Lac Tchad' },
    { abbr: 'CENSAD', name: 'Communauté des Etats sahélo-sahariens' },
    { abbr: 'CNULCD', name: 'Convention des Nations Unies sur la Lutte Contre la Désertification' },
    { abbr: 'CRU-BN', name: "Coordination Régionale des Usagers.eres des ressources naturelles du Bassin du Niger" },
    { abbr: 'ENDA', name: 'Environnement et Développement du tiers-monde' },
    { abbr: 'IGAD', name: 'Intergovernmental Authority on Development' },
    { abbr: 'FAO', name: "Organisation des Nations Unies pour l'alimentation et l'agriculture" },
    { abbr: 'UMA', name: 'Union du Maghreb Arabe' },
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


  const currentCountries = activeTab === "africa" ? africanCountries : nonAfricanCountries;

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
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="oss-kicker mb-3">01 · États</p>
            <h2 className="oss-section-title">Pays membres</h2>
          </div>
          <div className="flex self-start border border-oss-line bg-white" role="tablist" aria-label="Groupes de pays membres">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "africa"}
              onClick={() => setActiveTab("africa")}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-[0.07em] transition-colors duration-300 ${activeTab === "africa" ? "bg-oss-green text-white" : "text-ink/55 hover:bg-oss-green/10 hover:text-oss-blue-dark"}`}
            >
              Afrique · 28
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "international"}
              onClick={() => setActiveTab("international")}
              className={`border-l border-oss-line px-5 py-3 text-xs font-bold uppercase tracking-[0.07em] transition-colors duration-300 ${activeTab === "international" ? "bg-oss-blue text-white" : "text-ink/55 hover:bg-oss-blue/10 hover:text-oss-blue-dark"}`}
            >
              International · 07
            </button>
          </div>
        </div>

        <div className="overflow-hidden bg-white">
          <div className={`h-1.5 ${activeTab === "africa" ? "bg-oss-green" : "bg-oss-blue"}`} aria-hidden="true" />
          <div className="flex flex-col gap-2 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <h3 className="text-xl font-bold text-oss-blue-dark">{activeTab === "africa" ? "Pays africains" : "Pays non africains"}</h3>
              <p className="mt-1 text-sm text-ink/50">{activeTab === "africa" ? "Membres africains du réseau de l’OSS" : "Partenaires internationaux du réseau"}</p>
            </div>
            <span className="text-3xl font-bold text-oss-blue">{String(currentCountries.length).padStart(2, '0')}</span>
          </div>
          <div key={activeTab} className="grid border-t border-oss-line sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentCountries.map((country, index) => (
              <div key={country} className="group flex min-h-14 items-center gap-3 border-b border-oss-line px-6 py-4 transition-colors hover:bg-oss-blue/5 sm:border-r">
                <span className={`h-2 w-2 transition-transform duration-300 group-hover:scale-150 ${activeTab === "africa" ? "bg-oss-green" : "bg-oss-blue"}`} aria-hidden="true" />
                <span className="text-sm font-medium text-ink/65 transition-colors group-hover:text-oss-blue-dark">{country}</span>
                <span className="ml-auto text-[10px] font-bold text-ink/25">{String(index + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-9 max-w-2xl">
          <p className="oss-kicker mb-3">02 · Organisations</p>
          <h2 className="oss-section-title">Organisations membres</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">Institutions régionales et internationales réunies autour des priorités environnementales du continent.</p>
        </div>

        <div className="grid border-l border-t border-oss-line sm:grid-cols-2 lg:grid-cols-3">
          {organisations.map((org, index) => (
            <article key={org.abbr} className="group relative grid h-32 grid-cols-[8rem_1fr] overflow-hidden border-b border-r border-oss-line bg-white transition-colors duration-300 hover:bg-oss-blue/5">
              <span className={`absolute left-0 top-0 h-1 w-12 transition-all duration-300 group-hover:w-full ${index % 3 === 0 ? "bg-oss-blue" : index % 3 === 1 ? "bg-oss-green" : "bg-oss-ochre"}`} aria-hidden="true" />
              <div className="flex min-h-full items-center justify-center border-r border-oss-line bg-oss-paper" aria-label={`Emplacement du logo ${org.abbr}`} />
              <div className="min-w-0 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold tracking-[0.06em] text-oss-blue">{org.abbr}</span>
                  <span className="text-[10px] font-bold text-ink/25">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-ink/62 transition-colors group-hover:text-oss-blue-dark">{org.name}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section ref={admissionRef} className="mx-auto max-w-[1400px] px-6 pb-24 pt-12 sm:px-8 lg:px-12 lg:pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="self-start bg-oss-blue-dark p-7 text-white sm:p-9 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-oss-ochre">03 · Procédure</p>
            <h2 className="mt-5 text-4xl font-bold tracking-[-0.025em] sm:text-5xl">Admission</h2>
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
