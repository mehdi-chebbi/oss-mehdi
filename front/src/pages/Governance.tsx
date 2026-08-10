import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Building2, Compass, Landmark, Users } from "lucide-react";
import BrandBands from '@/components/shared/BrandBands';

const boardComposition = [
  { label: "Président", value: "Egypte" },
  { label: "Zone Cen-Sad", value: "Djibouti et Soudan" },
  { label: "Zone de l'Union du Maghreb Arabe", value: "Maroc et Mauritanie" },
  { label: "Zone CILSS", value: "Bénin et Niger" },
  { label: "Région de l'IGAD", value: "Kenya et Ouganda" },
  { label: "Espace CBLT", value: "République Centrafricaine et Tchad" },
  { label: "Pays du Nord", value: "Allemagne, Belgique, Canada, France, Italie, Luxembourg et Suisse" },
  { label: "Organisations sous-régionales", value: "APGMV, CBLT, CEN-SAD, CILSS, IGAD et UMA" },
  { label: "Organisations internationales", value: "CNULCD" },
  { label: "Organisations de la société civile", value: "ENDA et CARI" },
];

const boardOffice = [
  { label: "Présidence", value: "Egypte" },
  { label: "Membres", value: "Bénin, France, Kenya, Mauritanie, Niger, Ouganda, Tchad et SE/OSS" },
  { label: "Pays hôte", value: "Tunisie" },
  { label: "Rapporteur", value: "Djibouti" },
];

const committeeMembers = [
  { name: "M. Habib BEN YAHIA", title: "Président d'honneur depuis 2016, ancien Président du COS, ancien Secrétaire Général de l'Union du Maghreb Arabe (UMA), ancien Ministre des Affaires Etrangères et de la Défense Nationale", country: "Tunisie" },
  { name: "M. Jean Luc GNACADJA", title: "Président d'honneur, ancien Président du COS, ancien Secrétaire exécutif de la CNULCD, ancien Ministre de l'Environnement et du Développement durable", country: "Bénin" },
  { name: "M. Assane SOUMARE", title: "Président, Professeur à l'Université de Nouakchott, ancien Ministre des Pêches", country: "Mauritanie" },
  { name: "Mme Anneke TRUX", title: "Vice Présidente du COS et Cheffe de programme à la GIZ", country: "Allemagne" },
  { name: "M. Alhamandou DORSOUMA", title: "Directeur intérimaire et chef de division au département du changement climatique et de la croissance verte à la BAD", country: "Tchad" },
  { name: "Mme Anta SECK", title: "Coordinatrice du Programme de Gestion intégrée des Ressources en Eau (PGIRE 2)", country: "Sénégal" },
  { name: "M. Callist TINDIMUGAYA", title: "Commissaire à la planification des ressources en eau et à la réglementation, Ministère de l'Eau et de l'Environnement", country: "Ouganda" },
  { name: "Mme Dorothy AMWATA", title: "Professeure universitaire", country: "Kenya" },
  { name: "M. Elyes HAMZA", title: "Directeur du Centre d'activités régionales pour les aires spécialement protégées (SPA/RAC), ancien Ministre de l'Agriculture", country: "Tunisie" },
  { name: "M. Jean Luc CHOTTE", title: "Directeur de recherche à l'Institut de Recherche pour le Développement (IRD)", country: "France" },
  { name: "M. Jesper WOHLERT", title: "Directeur de Humana People to People (HPP)", country: "Suisse" },
  { name: "M. Raafat MISAK", title: "Professeur émérite au Desert Research Centre (DRC)", country: "Egypte" },
];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.16 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-[900ms] ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default function Governance() {
  const [boardView, setBoardView] = useState<"composition" | "bureau">("composition");
  const [selectedMember, setSelectedMember] = useState(0);
  const activeMember = committeeMembers[selectedMember];
  const activeBoardRows = boardView === "composition" ? boardComposition : boardOffice;

  return (
    <div className="font-oss min-h-screen overflow-hidden bg-oss-paper text-ink antialiased selection:bg-oss-blue selection:text-white">
      {/* Introduction */}
      <section className="px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <Reveal>
            <p className="oss-kicker mb-5">Gouvernance de l&apos;OSS</p>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
              Une gouvernance conçue pour <span className="text-oss-blue">agir ensemble.</span>
            </h1>
            <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
              L’OSS collabore avec ses pays membres selon le principe de subsidiarité, en initiant et en facilitant des partenariats face aux défis environnementaux communs.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="relative overflow-hidden bg-oss-blue-dark p-7 pb-10 text-white lg:p-9 lg:pb-12">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-oss-ochre">Modèle institutionnel</p>
              <p className="mt-6 text-2xl font-bold leading-snug">
                Une structure légère, flexible et transparente, portée par une équipe multiculturelle et multidisciplinaire.
              </p>
              <div className="mt-8 grid grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-6">
                <div className="pr-4"><strong className="block text-4xl text-oss-blue-light">04</strong><span className="mt-1 block text-xs text-white/55">organes</span></div>
                <div className="px-4"><strong className="block text-4xl text-oss-blue-light">27</strong><span className="mt-1 block text-xs text-white/55">membres du CA</span></div>
                <div className="pl-4"><strong className="block text-4xl text-oss-blue-light">04</strong><span className="mt-1 block text-xs text-white/55">ans par mandat</span></div>
              </div>
              <BrandBands className="absolute inset-x-0 bottom-0" />
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-10 grid max-w-[1400px] gap-3 md:grid-cols-3" delay={220}>
          {[
            ["Ressources naturelles", "Gestion de l’eau et mise en œuvre des accords multilatéraux sur l’environnement."],
            ["Financement volontaire", "Contributions, subventions et dons des pays membres, organisations et partenaires."],
            ["Décision partagée", "Une gouvernance efficace qui relie orientations politiques, expertise et exécution."],
          ].map(([title, text], index) => (
            <div key={title} className="relative overflow-hidden bg-white p-6 transition-colors hover:bg-oss-blue/5">
              <span className={`absolute inset-x-0 top-0 h-1 ${index === 0 ? 'bg-oss-blue' : index === 1 ? 'bg-oss-green' : 'bg-oss-ochre'}`} aria-hidden="true" />
              <span className="text-[11px] font-bold text-oss-blue/60">0{index + 1}</span>
              <h2 className="mt-5 text-xl font-bold text-oss-blue-dark">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{text}</p>
            </div>
          ))}
        </Reveal>
      </section>


      {/* General Assembly */}
      <section id="assemblee" className="scroll-mt-24 px-6 py-12 sm:px-8 lg:px-12">
        <Reveal className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <span className="oss-kicker">01 · Organe suprême</span>
            <h2 className="oss-section-title mt-4">L’Assemblée Générale</h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-ink/68 sm:text-xl">
              Elle représente l’appropriation de l’Organisation par ses membres, définit ses orientations et approuve les statuts ainsi que les stratégies d’intervention.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="relative bg-white p-6"><Landmark className="h-5 w-5 text-oss-blue" /><strong className="mt-8 block text-3xl text-oss-blue-dark">4 ans</strong><span className="mt-1 block text-xs text-ink/48">entre les sessions ordinaires</span><span className="absolute inset-x-0 bottom-0 h-1 bg-oss-blue" /></div>
              <div className="relative bg-white p-6"><Users className="h-5 w-5 text-oss-green" /><strong className="mt-8 block text-3xl text-oss-blue-dark">Élection</strong><span className="mt-1 block text-xs text-ink/48">des membres du Conseil</span><span className="absolute inset-x-0 bottom-0 h-1 bg-oss-green" /></div>
              <div className="relative bg-white p-6"><Building2 className="h-5 w-5 text-oss-ochre" /><strong className="mt-8 block text-3xl text-oss-blue-dark">Égypte</strong><span className="mt-1 block text-xs text-ink/48">présidence jusqu’en 2029</span><span className="absolute inset-x-0 bottom-0 h-1 bg-oss-ochre" /></div>
            </div>
            <p className="mt-7 border-l-2 border-oss-ochre pl-5 text-sm leading-relaxed text-ink/58">
              La présidence est assurée par Son Excellence M. Alaaeddine Farouk Zaki El-SAYED, Ministre de l’agriculture et de la réhabilitation des terres de l’Égypte.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Board */}
      <section id="conseil" className="scroll-mt-24 px-6 py-12 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <span className="oss-kicker">02 · Décision &amp; supervision</span>
              <h2 className="oss-section-title mt-4">Le Conseil d’Administration</h2>
              <p className="mt-6 leading-relaxed text-ink/65">
                Le CA met en œuvre les orientations de l’Assemblée Générale, examine les états financiers, amende les textes réglementaires, désigne le Secrétaire Exécutif et adopte le budget annuel.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="bg-oss-blue-dark p-5 text-white"><strong className="text-4xl text-oss-blue-light">27</strong><span className="mt-1 block text-xs text-white/55">membres élus</span></div>
                <div className="bg-white p-5"><strong className="text-4xl text-oss-blue">11</strong><span className="mt-1 block text-xs text-ink/48">membres du Bureau</span></div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-ink/45">Le Conseil se réunit une fois par an, statue par consensus et exerce un mandat renouvelable de quatre ans.</p>
            </div>

            <div className="self-start overflow-hidden border border-oss-line bg-white">
              <div className="flex border-b border-oss-line bg-oss-paper">
                <button type="button" onClick={() => setBoardView("composition")} className={`flex-1 px-4 py-4 text-sm font-bold transition-colors ${boardView === "composition" ? "bg-oss-blue text-white" : "text-ink/48 hover:bg-oss-blue/5 hover:text-oss-blue-dark"}`}>Composition du CA</button>
                <button type="button" onClick={() => setBoardView("bureau")} className={`flex-1 border-l border-oss-line px-4 py-4 text-sm font-bold transition-colors ${boardView === "bureau" ? "bg-oss-blue text-white" : "text-ink/48 hover:bg-oss-blue/5 hover:text-oss-blue-dark"}`}>Bureau du Conseil</button>
              </div>
              <div key={boardView} className="grid animate-[governance-panel-in_450ms_cubic-bezier(0.16,1,0.3,1)] sm:grid-cols-2">
                {activeBoardRows.map((item, index) => (
                  <div key={item.label} className={`min-h-28 border-oss-line p-5 transition-colors hover:bg-oss-blue/5 ${index % 2 === 0 ? "sm:border-r" : ""} ${index < activeBoardRows.length - 2 ? "border-b" : ""}`}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-oss-blue">{item.label}</span>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-ink/70">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Strategic Committee */}
      <section id="cos" className="scroll-mt-24 px-6 py-12 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="oss-kicker">03 · Réflexion &amp; anticipation</span>
              <h2 className="oss-section-title mt-4">Le Comité d’Orientation Stratégique</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-ink/65">
              <p>Organe bénévole et consultatif, le COS conduit une mission de réflexion, d’anticipation et d’analyse stratégique face aux évolutions de la gouvernance régionale et internationale.</p>
              <p>Composé de scientifiques et de praticiens indépendants du développement durable, il se réunit chaque année avant la session ordinaire du CA et lui soumet ses orientations.</p>
              <p>La diversité académique, technique et institutionnelle de ses membres renforce la légitimité et la portée de ses recommandations.</p>
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="grid gap-2 sm:grid-cols-2">
              {committeeMembers.map((member, index) => (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => setSelectedMember(index)}
                  aria-pressed={selectedMember === index}
                  className={`flex min-h-20 items-center justify-between border px-4 py-3 text-left transition-colors duration-300 ${selectedMember === index ? "border-oss-blue bg-oss-blue text-white" : "border-oss-line bg-white hover:border-oss-blue/35 hover:bg-oss-blue/5"}`}
                >
                  <div>
                    <span className={`text-sm font-bold ${selectedMember === index ? 'text-white' : 'text-oss-blue-dark'}`}>{member.name}</span>
                    <span className={`mt-1 block text-xs ${selectedMember === index ? 'text-oss-ochre' : 'text-ink/42'}`}>{member.country}</span>
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${selectedMember === index ? "translate-x-1 text-oss-ochre" : "text-ink/15"}`} />
                </button>
              ))}
            </div>

            <div key={activeMember.name} className="relative animate-[governance-panel-in_500ms_cubic-bezier(0.16,1,0.3,1)] overflow-hidden bg-oss-blue-dark p-8 pb-11 text-white lg:sticky lg:top-28 lg:min-h-[360px]">
              <Compass className="h-7 w-7 text-oss-ochre" />
              <span className="mt-16 block text-xs font-bold uppercase tracking-[0.1em] text-oss-blue-light">Membre du COS · {activeMember.country}</span>
              <h3 className="mt-4 text-3xl font-bold leading-tight">{activeMember.name}</h3>
              <p className="mt-5 leading-relaxed text-white/68">{activeMember.title}</p>
              <BrandBands className="absolute inset-x-0 bottom-0" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Executive Secretariat */}
      <section id="secretariat" className="scroll-mt-24 px-6 pb-24 pt-12 sm:px-8 lg:px-12 lg:pb-28">
        <Reveal className="mx-auto max-w-[1400px] overflow-hidden bg-white">
          <div className="grid lg:grid-cols-[0.7fr_1.3fr] lg:items-stretch">
            <div className="relative bg-oss-blue p-8 pb-12 text-white md:p-12 md:pb-14">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-oss-ochre">04 · Mise en œuvre</span>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.025em] sm:text-5xl">Le Secrétariat Exécutif</h2>
              <BrandBands className="absolute inset-x-0 bottom-0" />
            </div>
            <p className="flex items-center p-8 text-lg leading-relaxed text-ink/65 md:p-12 lg:p-16">
              Constitué d’une équipe pluriculturelle, multidisciplinaire et compétente, il applique les décisions du CA et de l’AG et prend les mesures nécessaires à la gestion de l’OSS, à l’exécution de ses programmes, à l’application de ses politiques et à l’accomplissement de sa mission.
            </p>
          </div>
        </Reveal>
      </section>

      <style>{`
        @keyframes governance-panel-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
