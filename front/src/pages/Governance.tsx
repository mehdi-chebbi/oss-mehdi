import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Building2, Compass, Landmark, Users } from "lucide-react";
import BrandBands from '@/components/shared/BrandBands';

const boardComposition = [
  { label: "Président", value: "Egypte" },
  { label: "Espace CBLT", value: "République Centrafricaine et Tchad" },
  { label: "Zone Cen-Sad", value: "Djibouti et Soudan" },
  { label: "Zone CILSS", value: "Bénin et Niger" },
  { label: "Région de l'IGAD", value: "Kenya et Ouganda" },
  { label: "Organisations internationales", value: "CNULCD" },
  { label: "Organisations de la société civile", value: "ENDA et CARI" },
  { label: "Organisations sous-régionales", value: "APGMV, CBLT, CEN-SAD, CILSS, IGAD et UMA" },
  { label: "Pays du Nord", value: "Allemagne, Belgique, Canada, France, Italie, Luxembourg et Suisse" },
  { label: "Zone de l'Union du Maghreb Arabe", value: "Maroc et Mauritanie" },
];

const boardOffice = [
  { label: "Présidence", value: "Egypte" },
  { label: "Membres", value: "Bénin, France, Kenya, Mauritanie, Niger, Ouganda, Tchad et SE/OSS" },
  { label: "Pays hôte", value: "Tunisie" },
  { label: "Rapporteur", value: "Djibouti" },
];

const committeeMembers = [
  { name: "M. Habib BEN YAHIA", title: "Président d'honneur depuis 2016, ancien Président du COS, ancien Secrétaire Général de l'Union du Maghreb Arabe (UMA), ancien Ministre des Affaires Etrangères et de la Défense Nationale", country: "Tunisie", flag: "/flags/tn.svg", image: "/cos people/habib ben yahia.jpg" },
  { name: "M. Jean Luc GNACADJA", title: "Président d'honneur, ancien Président du COS, ancien Secrétaire exécutif de la CNULCD, ancien Ministre de l'Environnement et du Développement durable", country: "Bénin", flag: "/flags/bj.svg", image: "/cos people/Jean Luc GNACADJA.jpg" },
  { name: "M. Assane SOUMARE", title: "Président, Professeur à l'Université de Nouakchott, ancien Ministre des Pêches", country: "Mauritanie", flag: "/flags/mr.svg", image: "/cos people/assane soumare.jpg" },
  { name: "Mme Anneke TRUX", title: "Vice Présidente du COS et Cheffe de programme à la GIZ", country: "Allemagne", flag: "/flags/de.svg", image: "/cos people/Anneke TRUX.webp" },
  { name: "M. Alhamandou DORSOUMA", title: "Directeur intérimaire et chef de division au département du changement climatique et de la croissance verte à la BAD", country: "Tchad", flag: "/flags/td.svg", image: "/cos people/Alhamandou DORSOUMA.jpg" },
  { name: "Mme Anta SECK", title: "Coordinatrice du Programme de Gestion intégrée des Ressources en Eau (PGIRE 2)", country: "Sénégal", flag: "/flags/sn.svg", image: "/cos people/Anta SECK.jpg" },
  { name: "M. Callist TINDIMUGAYA", title: "Commissaire à la planification des ressources en eau et à la réglementation, Ministère de l'Eau et de l'Environnement", country: "Ouganda", flag: "/flags/ug.svg", image: "/cos people/Callist TINDIMUGAYA.jpg" },
  { name: "Mme Dorothy AMWATA", title: "Professeure universitaire", country: "Kenya", flag: "/flags/ke.svg", image: "/cos people/Dorothy AMWATA.jpg" },
  { name: "M. Elyes HAMZA", title: "Directeur du Centre d'activités régionales pour les aires spécialement protégées (SPA/RAC), ancien Ministre de l'Agriculture", country: "Tunisie", flag: "/flags/tn.svg", image: "/cos people/Elyes HAMZA.jpg" },
  { name: "M. Jean Luc CHOTTE", title: "Directeur de recherche à l'Institut de Recherche pour le Développement (IRD)", country: "France", flag: "/flags/fr.svg", image: "/cos people/Jean Luc CHOTTE.webp" },
  { name: "M. Jesper WOHLERT", title: "Directeur de Humana People to People (HPP)", country: "Suisse", flag: "/flags/ch.svg", image: "/cos people/Jesper WOHLERT.jpg" },
  { name: "M. Raafat MISAK", title: "Professeur émérite au Desert Research Centre (DRC)", country: "Egypte", flag: "/flags/eg.svg", image: "/cos people/Raafat MISAK.jpg" },
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
  const [selectedMember, setSelectedMember] = useState(0);
  const activeMember = committeeMembers[selectedMember];

  return (
    <div className="font-oss min-h-screen overflow-hidden bg-oss-paper text-ink antialiased selection:bg-oss-blue selection:text-white">
      {/* Introduction */}
      <section className="px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="oss-kicker mb-5">Gouvernance de l&apos;OSS</p>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
              Une gouvernance conçue pour <span className="text-oss-blue">agir ensemble.</span>
            </h1>
            <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
              L’OSS collabore avec ses pays membres selon le principe de subsidiarité, en initiant et en facilitant des partenariats face aux défis environnementaux communs.
            </p>
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
              <h2 className="text-xl font-bold text-oss-blue-dark">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{text}</p>
            </div>
          ))}
        </Reveal>
      </section>


      {/* General Assembly */}
      <section id="assemblee" className="scroll-mt-24 px-6 py-12 sm:px-8 lg:px-12">
        <Reveal className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <h2 className="oss-section-title">L’Assemblée Générale</h2>
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
              <h2 className="oss-section-title">Le Conseil d’Administration</h2>
              <p className="mt-6 leading-relaxed text-ink/65">
                Le CA met en œuvre les orientations de l’Assemblée Générale, examine les états financiers, amende les textes réglementaires, désigne le Secrétaire Exécutif et adopte le budget annuel.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="bg-oss-blue-dark p-5 text-white"><strong className="text-4xl text-oss-blue-light">27</strong><span className="mt-1 block text-xs text-white/55">membres élus</span></div>
                <div className="bg-white p-5"><strong className="text-4xl text-oss-blue">11</strong><span className="mt-1 block text-xs text-ink/48">membres du Bureau</span></div>
              </div>
              <div className="mt-8 border-t border-oss-line pt-7">
                <h3 className="text-lg font-bold text-oss-blue-dark">Un organe de pilotage et de suivi</h3>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/60">
                  <p>
                    Entre deux sessions de l’Assemblée Générale, le Conseil veille à la continuité des orientations de l’OSS et accompagne leur traduction en décisions opérationnelles.
                  </p>
                  <p>
                    Il constitue un espace de concertation entre les pays et les organisations membres, où sont examinées les priorités institutionnelles, financières et stratégiques de l’Organisation.
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-ink/45">Le Conseil se réunit une fois par an, statue par consensus et exerce un mandat renouvelable de quatre ans.</p>
            </div>

            <div className="self-start">
              <div className="overflow-hidden border border-oss-line bg-white">
                <div className="border-b border-oss-line bg-oss-blue px-5 py-4 text-white">
                  <h3 className="text-base font-bold">Composition du CA</h3>
                  <p className="mt-1 text-xs text-white/65">Représentation des pays et organisations membres</p>
                </div>
                <div className="grid sm:grid-cols-2">
                  {boardComposition.map((item, index) => (
                    <div
                      key={item.label}
                      className={`min-h-28 border-oss-line p-5 transition-colors hover:bg-oss-blue/5 ${index % 2 === 0 ? "sm:border-r" : ""} ${index < boardComposition.length - 2 ? "border-b" : ""}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-oss-blue">{item.label}</span>
                      <p className="mt-3 text-sm font-medium leading-relaxed text-ink/70">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-oss-blue-dark p-5 text-white sm:p-6">
            <div className="border-b border-white/15 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-oss-blue-light">Instance exécutive</p>
                <h3 className="mt-1 text-xl font-bold">Bureau du Conseil</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {boardOffice.map((item) => (
                <div key={item.label} className="min-h-28 border border-white/15 bg-white/[0.035] p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-oss-blue-light">
                    {item.label}
                  </span>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-white/78">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Strategic Committee */}
      <section id="cos" className="scroll-mt-24 px-6 py-12 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h2 className="oss-section-title">Le Comité d’Orientation Stratégique</h2>
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
                    <span className={`mt-1.5 flex items-center gap-2 text-xs ${selectedMember === index ? 'text-oss-ochre' : 'text-ink/42'}`}>
                      <img src={member.flag} alt="" className="h-3.5 w-5 shrink-0 object-cover shadow-sm" aria-hidden="true" />
                      {member.country}
                    </span>
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${selectedMember === index ? "translate-x-1 text-oss-ochre" : "text-ink/15"}`} />
                </button>
              ))}
            </div>

            <div key={activeMember.name} className="relative grid animate-[governance-panel-in_500ms_cubic-bezier(0.16,1,0.3,1)] overflow-hidden bg-oss-blue-dark text-white sm:h-[460px] sm:grid-cols-[0.85fr_1.15fr] lg:sticky lg:top-28">
              <div className="relative h-[300px] overflow-hidden bg-oss-blue sm:h-full">
                <img src={activeMember.image} alt={activeMember.name} className="absolute inset-0 h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-oss-blue-dark/35 to-transparent" aria-hidden="true" />
              </div>
              <div className="flex flex-col justify-center p-7 pb-12 sm:p-8 sm:pb-12">
                <Compass className="h-7 w-7 text-oss-ochre" />
                <span className="mt-8 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.1em] text-oss-blue-light">
                  <img src={activeMember.flag} alt="" className="h-4 w-6 shrink-0 object-cover shadow-sm" aria-hidden="true" />
                  Membre du COS · {activeMember.country}
                </span>
                <h3 className="mt-4 text-3xl font-bold leading-tight">{activeMember.name}</h3>
                <p className="mt-5 leading-relaxed text-white/68">{activeMember.title}</p>
              </div>
              <BrandBands className="absolute inset-x-0 bottom-0" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Executive Secretariat */}
      <section id="secretariat" className="scroll-mt-24 px-6 pb-24 pt-12 sm:px-8 lg:px-12 lg:pb-28">
        <Reveal className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <h2 className="oss-section-title">Le Secrétariat Exécutif</h2>
          </div>
          <p className="text-lg leading-relaxed text-ink/68 sm:text-xl">
            Constitué d’une équipe pluriculturelle, multidisciplinaire et compétente, il applique les décisions du CA et de l’AG et prend les mesures nécessaires à la gestion de l’OSS, à l’exécution de ses programmes, à l’application de ses politiques et à l’accomplissement de sa mission.
          </p>
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
