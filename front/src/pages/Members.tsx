import { useEffect, useRef, useState } from "react";

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
    <div className="min-h-screen bg-white text-ink font-sans relative overflow-hidden antialiased selection:bg-emerald-500/30">

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24 lg:py-32">

        {/* ── HEADER ── */}
        <section className="mb-20 border-b border-ink/10 pb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-12 bg-emerald-500"></span>
            <span className="text-xs font-mono tracking-[0.3em] text-emerald-500 uppercase">RÉSEAU // MEMBRES</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-5xl md:text-7xl font-medium text-ink mb-6 leading-[1.05] tracking-tight">
                États & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Organisations</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                Un réseau international dédié à la gestion durable des ressources naturelles et à la lutte contre la désertification en Afrique.
              </p>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              <div className="bg-[#EFECE5] border border-ink/10 rounded-2xl p-6">
                <div className="text-5xl font-serif font-bold text-ink">35</div>
                <div className="text-xs font-mono uppercase tracking-widest text-slate-600 mt-2">États Membres</div>
              </div>
              <div className="bg-[#EFECE5] border border-ink/10 rounded-2xl p-6">
                <div className="text-5xl font-serif font-bold text-ink">12</div>
                <div className="text-xs font-mono uppercase tracking-widest text-slate-600 mt-2">Organisations</div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            1. COMPACT COUNTRY DIRECTORY
        ════════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-10 bg-emerald-500"></span>
            <span className="text-xs font-mono tracking-[0.2em] text-emerald-500 uppercase">01 / ÉTATS</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[#EFECE5]">
            <div className="flex flex-col gap-4 border-b border-ink/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-ink">
                  {activeTab === "africa" ? "Pays africains" : "Pays non africains"}
                </h3>
                <p className="mt-1 text-sm text-ink/45">
                  {activeTab === "africa" ? "Membres africains du réseau de l’OSS" : "Partenaires internationaux du réseau"}
                </p>
              </div>

              <div className="inline-flex self-start rounded-xl bg-[#F5F3EE] p-1" role="tablist" aria-label="Groupes de pays membres">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "africa"}
                  onClick={() => setActiveTab("africa")}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === "africa" ? "border border-emerald-200 bg-white text-emerald-800" : "border border-transparent text-ink/45 hover:text-ink"}`}
                >
                  Afrique · 28
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "international"}
                  onClick={() => setActiveTab("international")}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === "international" ? "border border-sky-200 bg-white text-sky-800" : "border border-transparent text-ink/45 hover:text-ink"}`}
                >
                  International · 07
                </button>
              </div>
            </div>

            <div key={activeTab} className="p-6">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {currentCountries.map((country) => (
                  <div key={country} className="group flex cursor-default items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150 ${activeTab === "africa" ? "bg-emerald-500" : "bg-sky-500"}`} />
                    <span className="font-mono text-sm text-slate-600 transition-colors group-hover:text-ink">{country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            2. COMPACT ORGANIZATION DIRECTORY
        ════════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-10 bg-purple-500"></span>
            <span className="text-xs font-mono tracking-[0.2em] text-purple-500 uppercase">02 / ORGANISATIONS</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[#EFECE5]">
            <div className="flex items-center justify-between border-b border-ink/10 bg-[#E5E1D8] px-6 py-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-ink">Organisations membres</h3>
                <p className="mt-1 text-sm text-ink/45">Institutions régionales et internationales</p>
              </div>
              <span className="rounded-full bg-purple-100 px-3 py-1 font-mono text-xs font-bold text-purple-800">12</span>
            </div>

            <div className="grid md:grid-cols-2 md:divide-x md:divide-ink/10">
              {[organisations.slice(0, 6), organisations.slice(6)].map((column, columnIndex) => (
                <table key={columnIndex} className="w-full table-fixed">
                  <tbody className="divide-y divide-ink/10">
                    {column.map((org) => (
                      <tr key={org.abbr} className="group h-[92px] transition-colors hover:bg-purple-50">
                        <td className="w-24 px-5 align-middle font-mono text-sm font-bold text-purple-600">
                          {org.abbr}
                        </td>
                        <td className="h-[92px] pr-5 align-middle text-sm leading-snug text-slate-600 transition-colors group-hover:text-ink">
                          <span className="line-clamp-3">
                            {org.name}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            3. ADMISSION TIMELINE
        ════════════════════════════════════════════ */}
        <section ref={admissionRef}>
          <div className="flex items-center gap-4 mb-12">
            <span className="h-px w-10 bg-amber-500"></span>
            <span className="text-xs font-mono tracking-[0.2em] text-amber-500 uppercase">03 / PROCÉDURE</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink leading-tight mb-6">
                Admission
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mb-8">
                Les États et les Organisations souhaitant adhérer à l'OSS peuvent suivre la procédure décrite dans les statuts de l'institution.
              </p>
              <div className="p-6 border border-ink/10 bg-[#EFECE5] rounded-xl">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pour obtenir les documents statutaires et toute information complémentaire, rapprochez-vous du Secrétariat exécutif.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 relative">
              <div className={`absolute left-4 top-2 bottom-2 w-px origin-top bg-gradient-to-b from-amber-500/50 via-ink/10 to-transparent transition-transform duration-[1800ms] ease-out motion-reduce:transform-none motion-reduce:transition-none ${admissionVisible ? "scale-y-100" : "scale-y-0"}`}></div>

              <div className="space-y-12">
                {admissionSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`relative pl-12 transition-all duration-[1000ms] ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none ${admissionVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
                    style={{ transitionDelay: admissionVisible ? `${i * 700 + 500}ms` : "0ms" }}
                  >
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full border border-amber-500/50 bg-white flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    </div>
                    <div className="font-mono text-xs text-amber-400 uppercase tracking-widest mb-3">
                      Critère {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-ink mb-4">
                      {step.title}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                      {step.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>


    </div>
  );
}
