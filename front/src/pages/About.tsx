import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BrandBands from '@/components/shared/BrandBands';

const axes = [
  {
    title: 'Accords multilatéraux',
    subtitle: 'Mise en œuvre environnementale',
    content: "Appliquer les accords sur la dégradation des terres, la biodiversité et le changement climatique. L'OSS agit comme un pont entre les politiques globales et les réalités locales africaines.",
  },
  {
    title: "Promotion d'initiatives",
    subtitle: 'Synergie et partenariat',
    content: "Appuyer les initiatives régionales et internationales qui répondent aux défis environnementaux en favorisant la synergie entre les États et les organisations sous-régionales afin de consolider un véritable espace de partenariat.",
  },
  {
    title: 'Harmonisation des approches',
    subtitle: 'Méthodologies unifiées',
    content: "Définir des concepts et unifier les méthodologies liées à la gestion durable des terres et des ressources en eau. Standardiser les données pour une meilleure prise de décision.",
  },
];

const pillarNames = ['Terre', 'Eau', 'Climat', 'Biodiversité'] as const;
type PillarName = (typeof pillarNames)[number];

const pillars: Record<PillarName, {
  text: string;
  tags: string[];
  image: string;
  accent: string;
  surface: string;
  active: string;
}> = {
  Terre: {
    text: "Lutte contre la dégradation des terres et la désertification. Élaboration de concepts dédiés au suivi environnemental et à la gestion durable des terres en zones arides.",
    tags: ['Neutralité des terres', 'Restauration écologique', 'Suivi de la désertification'],
    image: '/terre.jpg',
    accent: 'bg-oss-ochre',
    surface: 'bg-oss-ochre/10',
    active: 'border-oss-ochre text-oss-blue-dark',
  },
  Eau: {
    text: 'Gestion durable des ressources en eau et renforcement de la résilience des populations face aux mutations environnementales et au stress hydrique.',
    tags: ["Gestion intégrée de l'eau", 'Aquifères transfrontaliers', 'Aide à la décision'],
    image: '/eau.jpg',
    accent: 'bg-oss-blue',
    surface: 'bg-oss-blue/10',
    active: 'border-oss-blue text-oss-blue-dark',
  },
  Climat: {
    text: "Adaptation au changement climatique. Grâce à ses accréditations GCF et FA, l'OSS soutient les pays dans la mise en œuvre de projets atténuant les impacts climatiques sur les populations.",
    tags: ['Accrédité GCF', 'Accrédité FA', 'Adaptation locale'],
    image: '/climat.jpg',
    accent: 'bg-oss-green',
    surface: 'bg-oss-green/10',
    active: 'border-oss-green text-oss-blue-dark',
  },
  Biodiversité: {
    text: 'Protection du patrimoine biologique et suivi environnemental pour préserver les écosystèmes africains face aux pressions anthropiques et climatiques.',
    tags: ['Suivi écologique', 'Solutions fondées sur la nature', 'Conservation des habitats'],
    image: '/hero.jpg',
    accent: 'bg-oss-teal',
    surface: 'bg-oss-teal/10',
    active: 'border-oss-teal text-oss-blue-dark',
  },
};

export default function About() {
  const [activeAxis, setActiveAxis] = useState(0);
  const [activePillar, setActivePillar] = useState<PillarName>('Terre');
  const [isPillarHovered, setIsPillarHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const currentPillar = pillars[activePillar];

  useEffect(() => {
    if (isPillarHovered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setTimeout(() => {
      setActivePillar((current) => {
        const currentIndex = pillarNames.indexOf(current);
        return pillarNames[(currentIndex + 1) % pillarNames.length];
      });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activePillar, isPillarHovered]);

  return (
    <div className="about-page font-oss min-h-screen overflow-hidden bg-oss-paper text-ink antialiased selection:bg-oss-blue selection:text-white">
      <section className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 pb-12 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-20">
        <div>
          <p className="oss-kicker mb-5">Organisation internationale basée à Tunis</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">Observatoire du Sahara et du Sahel</h1>
          <div className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
            <p>Fondé en 1992 et basé à Tunis depuis 2000, l&apos;OSS crée et soutient des partenariats pour relever les défis liés à la gestion des ressources en eau et à la mise en œuvre, en Afrique, des Accords multilatéraux sur l&apos;environnement.</p>
            <p className="mt-5">Les collaborations entre l&apos;OSS et ses membres renforcent les efforts communs pour un avenir durable en Afrique, face à la dégradation des terres, la perte de biodiversité et le changement climatique.</p>
          </div>
        </div>

        <figure className="relative min-h-[360px] overflow-hidden bg-oss-blue-dark sm:min-h-[460px]">
          <img src="/oss-sahara-sahel-aerial.png" alt="Transition entre le Sahara, le Sahel et un système fluvial" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-oss-blue-dark/75 via-transparent to-oss-blue/10" />
          <figcaption className="absolute inset-x-0 bottom-0 p-7 text-sm leading-relaxed text-white/85 sm:p-9">Une coopération régionale fondée sur la connaissance, la concertation et l&apos;action.</figcaption>
          <BrandBands className="absolute inset-x-0 bottom-0" />
        </figure>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-9 max-w-2xl">
          <h2 className="oss-section-title">Un réseau multilatéral</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">Membres africains, pays partenaires et organisations réunis autour d&apos;une mission commune.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative flex min-h-[230px] flex-col items-center justify-center overflow-hidden bg-oss-blue-dark p-7 text-center text-white">
            <span className="text-sm font-bold uppercase tracking-[0.1em] text-oss-blue-light">Réseau des membres</span>
            <div className="mt-5 text-7xl font-bold leading-none">48</div>
            <p className="mt-4 max-w-[18rem] text-base font-medium leading-relaxed text-white/75">Une coopération multilatérale au service du développement durable.</p>
            <span className="absolute inset-x-0 bottom-0 h-1.5 bg-oss-ochre" aria-hidden="true" />
          </div>
          <div className="relative flex min-h-[230px] flex-col items-center justify-center bg-white p-7 text-center">
            <div className="text-5xl font-bold text-oss-blue">28</div>
            <p className="mt-4 text-lg font-semibold leading-snug text-ink/65">Pays africains membres</p>
            <span className="absolute inset-x-0 top-0 h-1 bg-oss-green" aria-hidden="true" />
          </div>
          <div className="relative flex min-h-[230px] flex-col items-center justify-center bg-white p-7 text-center">
            <div className="text-5xl font-bold text-oss-blue">07</div>
            <p className="mt-4 text-lg font-semibold leading-snug text-ink/65">Pays non-africains</p>
            <span className="absolute inset-x-0 top-0 h-1 bg-oss-blue" aria-hidden="true" />
          </div>
          <div className="relative flex min-h-[230px] flex-col items-center justify-center bg-white p-7 text-center">
            <div className="text-5xl font-bold text-oss-blue">13</div>
            <p className="mt-4 text-lg font-semibold leading-snug text-ink/65">Entités et organisations</p>
            <span className="absolute inset-x-0 top-0 h-1 bg-oss-ochre" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <h2 className="oss-section-title">Mission et expertise</h2>
          <p className="mt-5 text-base leading-relaxed text-ink/65 sm:text-lg">L&apos;OSS aide ses pays membres africains à gérer durablement leurs ressources naturelles dans un contexte climatique exigeant. Son action se concentre sur les zones arides, semi-arides et subhumides sèches.</p>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {axes.map((axis, index) => (
            <button
              key={axis.title}
              type="button"
              onMouseEnter={() => setActiveAxis(index)}
              onFocus={() => setActiveAxis(index)}
              onClick={() => setActiveAxis(index)}
              aria-pressed={activeAxis === index}
              className={`relative min-h-24 overflow-hidden border p-5 text-left transition-colors duration-300 ${activeAxis === index ? 'border-oss-blue text-white' : 'border-oss-line bg-white text-oss-blue-dark hover:border-oss-blue/40 hover:bg-oss-blue/5'}`}
            >
              {activeAxis === index && (
                <motion.span
                  layoutId="active-axis-background"
                  className="absolute inset-0 bg-oss-blue"
                  transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden="true"
                />
              )}
              <span className={`relative z-10 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-300 ${activeAxis === index ? 'text-oss-ochre' : 'text-oss-blue/60'}`}>{axis.subtitle}</span>
              <span className="relative z-10 mt-2 block text-lg font-bold leading-tight">{axis.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 min-h-[180px] overflow-hidden border-l-4 border-oss-ochre bg-white p-7 sm:p-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeAxis}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 34 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="text-2xl font-bold text-oss-blue-dark">{axes[activeAxis].title}</h3>
              <p className="mt-4 max-w-4xl text-base leading-relaxed text-ink/68">{axes[activeAxis].content}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-12 sm:px-8 lg:px-12 lg:pb-28">
        <div className="mb-10 max-w-3xl">
          <h2 className="oss-section-title">Programmes structurants</h2>
          <p className="mt-5 text-base leading-relaxed text-ink/65 sm:text-lg">Quatre domaines complémentaires structurent l&apos;action de l&apos;OSS et traduisent les priorités environnementales de ses membres.</p>
        </div>

        <div
          className="grid gap-5 lg:grid-cols-[0.34fr_1fr] lg:gap-8"
          onMouseLeave={() => setIsPillarHovered(false)}
        >
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {pillarNames.map((pillar) => (
              <button
                key={pillar}
                type="button"
                onMouseEnter={() => {
                  setIsPillarHovered(true);
                  setActivePillar(pillar);
                }}
                onClick={() => setActivePillar(pillar)}
                aria-pressed={activePillar === pillar}
                className={`relative min-h-16 overflow-hidden border bg-white px-5 py-4 text-left text-base font-bold transition-colors duration-300 ${activePillar === pillar ? pillars[pillar].active : 'border-oss-line text-ink/65 hover:border-oss-blue/30 hover:bg-oss-blue/5 hover:text-oss-blue-dark'}`}
              >
                {activePillar === pillar && (
                  <motion.span
                    layoutId="active-pillar-background"
                    className={`absolute inset-0 ${pillars[pillar].surface}`}
                    transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden="true"
                  />
                )}
                <span className={`absolute inset-y-0 left-0 z-10 w-1 ${pillars[pillar].accent}`} aria-hidden="true" />
                <span className="relative z-10">{pillar}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[440px] overflow-hidden bg-white">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={activePillar}
                className="grid min-h-[440px] md:grid-cols-[0.8fr_1.2fr]"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 34 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 34 }}
                transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative min-h-[260px] overflow-hidden bg-oss-blue-dark md:min-h-full">
                  <img src={currentPillar.image} alt={activePillar} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-oss-blue-dark/55 to-transparent" />
                  <span className={`absolute inset-x-0 top-0 h-1.5 ${currentPillar.accent}`} aria-hidden="true" />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <h3 className="text-3xl font-bold text-oss-blue-dark sm:text-4xl">{activePillar}</h3>
                  <p className="mt-5 text-base leading-relaxed text-ink/68 sm:text-lg">{currentPillar.text}</p>
                  <div className="mt-8 grid w-fit max-w-full gap-2">
                    {currentPillar.tags.map((tag) => (
                      <div key={tag} className="w-full border border-oss-line bg-oss-paper px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-oss-blue-dark/70">{tag}</div>
                    ))}
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
