import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Building2, Compass, Landmark, Users } from "lucide-react";

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
    <div className="min-h-screen bg-white text-ink antialiased selection:bg-emerald-600/20">
      {/* Introduction */}
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-20">
          <Reveal>
            <div className="mb-7 flex items-center gap-4">
              <span className="h-1 w-12 bg-[#489e42]" />
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#3d7e38]">Gouvernance de l’OSS</span>
            </div>
            <h1 className="max-w-4xl font-serif text-5xl font-bold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[76px]">
              Une gouvernance conçue pour <span className="text-[#489e42]">agir ensemble.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-ink/60 lg:text-xl">
              L’OSS collabore avec ses pays membres selon le principe de subsidiarité, en initiant et en facilitant des partenariats face aux défis environnementaux communs.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="rounded-[28px] border border-ink/10 bg-[#EFECE5] p-7 lg:p-9">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#3d7e38]">Modèle institutionnel</p>
              <p className="mt-6 font-serif text-2xl font-semibold leading-snug text-ink/85">
                Une structure légère, flexible et transparente, portée par une équipe multiculturelle et multidisciplinaire.
              </p>
              <div className="mt-8 grid grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 pt-6">
                <div className="pr-4"><strong className="block font-serif text-4xl">04</strong><span className="mt-1 block text-xs text-ink/45">organes</span></div>
                <div className="px-4"><strong className="block font-serif text-4xl">27</strong><span className="mt-1 block text-xs text-ink/45">membres du CA</span></div>
                <div className="pl-4"><strong className="block font-serif text-4xl">04</strong><span className="mt-1 block text-xs text-ink/45">ans par mandat</span></div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-14 grid max-w-7xl gap-4 md:grid-cols-3" delay={220}>
          {[
            ["Ressources naturelles", "Gestion de l’eau et mise en œuvre des accords multilatéraux sur l’environnement."],
            ["Financement volontaire", "Contributions, subventions et dons des pays membres, organisations et partenaires."],
            ["Décision partagée", "Une gouvernance efficace qui relie orientations politiques, expertise et exécution."],
          ].map(([title, text], index) => (
            <div key={title} className="rounded-2xl border border-ink/10 bg-[#EFECE5] p-6 transition-colors hover:bg-[#E5E1D8]">
              <span className="font-mono text-[11px] text-[#489e42]">0{index + 1}</span>
              <h2 className="mt-5 font-serif text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/55">{text}</p>
            </div>
          ))}
        </Reveal>
      </section>


      {/* General Assembly */}
      <section id="assemblee" className="scroll-mt-24 px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3d7e38]">01 / Organe suprême</span>
            <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl">L’Assemblée Générale</h2>
          </div>
          <div>
            <p className="text-xl font-light leading-relaxed text-ink/70">
              Elle représente l’appropriation de l’Organisation par ses membres, définit ses orientations et approuve les statuts ainsi que les stratégies d’intervention.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-ink/10 bg-[#EFECE5] p-6"><Landmark className="h-5 w-5 text-[#489e42]" /><strong className="mt-8 block font-serif text-3xl">4 ans</strong><span className="mt-1 block text-xs text-ink/45">entre les sessions ordinaires</span></div>
              <div className="rounded-2xl border border-ink/10 bg-[#EFECE5] p-6"><Users className="h-5 w-5 text-[#489e42]" /><strong className="mt-8 block font-serif text-3xl">Élection</strong><span className="mt-1 block text-xs text-ink/45">des membres du Conseil</span></div>
              <div className="rounded-2xl border border-ink/10 bg-[#EFECE5] p-6"><Building2 className="h-5 w-5 text-[#489e42]" /><strong className="mt-8 block font-serif text-3xl">Égypte</strong><span className="mt-1 block text-xs text-ink/45">présidence jusqu’en 2029</span></div>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-ink/55">
              La présidence est assurée par Son Excellence M. Alaaeddine Farouk Zaki El-SAYED, Ministre de l’agriculture et de la réhabilitation des terres de l’Égypte.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Board */}
      <section id="conseil" className="scroll-mt-24 bg-white px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3d7e38]">02 / Décision & supervision</span>
              <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Le Conseil d’Administration</h2>
              <p className="mt-6 leading-relaxed text-ink/60">
                Le CA met en œuvre les orientations de l’Assemblée Générale, examine les états financiers, amende les textes réglementaires, désigne le Secrétaire Exécutif et adopte le budget annuel.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink/10 bg-[#EFECE5] p-5 transition-colors hover:bg-[#E5E1D8]"><strong className="font-serif text-4xl">27</strong><span className="mt-1 block text-xs text-ink/45">membres élus</span></div>
                <div className="rounded-xl border border-ink/10 bg-[#EFECE5] p-5 transition-colors hover:bg-[#E5E1D8]"><strong className="font-serif text-4xl">11</strong><span className="mt-1 block text-xs text-ink/45">membres du Bureau</span></div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-ink/45">Le Conseil se réunit une fois par an, statue par consensus et exerce un mandat renouvelable de quatre ans.</p>
            </div>

            <div className="self-start overflow-hidden rounded-3xl border border-ink/10 bg-white">
              <div className="flex border-b border-ink/10 bg-[#EFECE5] p-1.5">
                <button type="button" onClick={() => setBoardView("composition")} className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${boardView === "composition" ? "bg-[#DCEBD8] text-[#2f6f34]" : "text-ink/45 hover:text-ink"}`}>Composition du CA</button>
                <button type="button" onClick={() => setBoardView("bureau")} className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${boardView === "bureau" ? "bg-[#DCEBD8] text-[#2f6f34]" : "text-ink/45 hover:text-ink"}`}>Bureau du Conseil</button>
              </div>
              <div key={boardView} className="grid bg-[#EFECE5] animate-[governance-panel-in_450ms_cubic-bezier(0.16,1,0.3,1)] sm:grid-cols-2">
                {activeBoardRows.map((item, index) => (
                  <div key={item.label} className={`min-h-28 border-ink/10 p-5 transition-colors hover:bg-[#E5E1D8] ${index % 2 === 0 ? "sm:border-r" : ""} ${index < activeBoardRows.length - 2 ? "border-b" : ""}`}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#489e42]">{item.label}</span>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-ink/70">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Strategic Committee */}
      <section id="cos" className="scroll-mt-24 px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3d7e38]">03 / Réflexion & anticipation</span>
              <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Le Comité d’Orientation Stratégique</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-ink/60">
              <p>Organe bénévole et consultatif, le COS conduit une mission de réflexion, d’anticipation et d’analyse stratégique face aux évolutions de la gouvernance régionale et internationale.</p>
              <p>Composé de scientifiques et de praticiens indépendants du développement durable, il se réunit chaque année avant la session ordinaire du CA et lui soumet ses orientations.</p>
              <p>La diversité académique, technique et institutionnelle de ses membres renforce la légitimité et la portée de ses recommandations.</p>
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="grid gap-2 sm:grid-cols-2">
              {committeeMembers.map((member, index) => (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => setSelectedMember(index)}
                  aria-pressed={selectedMember === index}
                  className={`flex min-h-20 items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${selectedMember === index ? "border-[#489e42]/40 bg-[#DCEBD8]" : "border-ink/10 bg-[#EFECE5] hover:border-ink/20 hover:bg-[#E5E1D8]"}`}
                >
                  <div>
                    <span className="text-sm font-semibold text-ink/80">{member.name}</span>
                    <span className="mt-1 block text-xs text-ink/40">{member.country}</span>
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${selectedMember === index ? "text-[#489e42]" : "text-ink/15"}`} />
                </button>
              ))}
            </div>

            <div key={activeMember.name} className="animate-[governance-panel-in_500ms_cubic-bezier(0.16,1,0.3,1)] rounded-3xl bg-[#173f36] p-8 text-white lg:sticky lg:top-28 lg:min-h-[360px]">
              <Compass className="h-7 w-7 text-[#8fc88a]" />
              <span className="mt-16 block font-mono text-xs uppercase tracking-[0.18em] text-[#8fc88a]">Membre du COS · {activeMember.country}</span>
              <h3 className="mt-4 font-serif text-3xl font-bold leading-tight">{activeMember.name}</h3>
              <p className="mt-5 leading-relaxed text-white/65">{activeMember.title}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Executive Secretariat */}
      <section id="secretariat" className="scroll-mt-24 px-6 pb-24 lg:px-10 lg:pb-32">
        <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-[#489e42]/20 bg-[#edf5eb]">
          <div className="grid gap-10 p-8 md:p-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:p-16">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3d7e38]">04 / Mise en œuvre</span>
              <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Le Secrétariat Exécutif</h2>
            </div>
            <p className="text-lg font-light leading-relaxed text-ink/65">
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
