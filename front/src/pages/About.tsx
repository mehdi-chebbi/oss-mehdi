import { useState, useEffect } from "react";

const pillarNames = ["Terre", "Eau", "Climat", "Biodiversité"] as const;
type PillarName = (typeof pillarNames)[number];

export default function About() {
  const [activeAxis, setActiveAxis] = useState(0);
  const [isAxisHovered, setIsAxisHovered] = useState(false);
  const [activePillar, setActivePillar] = useState<PillarName>("Terre");
  const [isPillarHovered, setIsPillarHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const axes = [
    {
      id: "01",
      title: "Accords Multilatéraux",
      subtitle: "Mise en œuvre environnementale",
      content: "Appliquer les accords sur la dégradation des terres, la biodiversité et le changement climatique. L'OSS agit comme un pont entre les politiques globales et les réalités locales africaines."
    },
    {
      id: "02",
      title: "Promotion d'Initiatives",
      subtitle: "Synergie & Partenariat",
      content: "Appuyer les initiatives régionales et internationales qui répondent aux défis environnementaux en favorisant la synergie entre les Etats et les Organisations sous régionales afin de consolider un véritable espace de partenariat."
    },
    {
      id: "03",
      title: "Harmonisation des Approches",
      subtitle: "Méthodologies unifiées",
      content: "Définir des concepts et unifier les méthodologies liées à la gestion durable des terres et des ressources en eau. Standardiser les données pour une meilleure prise de décision."
    }
  ];

  useEffect(() => {
    if (isAxisHovered || axes.length < 2) return;

    const timer = window.setTimeout(() => {
      setActiveAxis((current) => (current + 1) % axes.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeAxis, isAxisHovered, axes.length]);

  useEffect(() => {
    if (isPillarHovered || pillarNames.length < 2) return;

    const timer = window.setTimeout(() => {
      setActivePillar((current) => {
        const currentIndex = pillarNames.indexOf(current);
        return pillarNames[(currentIndex + 1) % pillarNames.length];
      });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activePillar, isPillarHovered]);


  const pillars = {
    "Terre": {
      color: "#10b981", // Emerald
      bg: "from-emerald-100/70",
      glow: "shadow-[0_24px_80px_rgba(16,185,129,0.10)]",
      text: "Lutte contre la dégradation des terres et la désertification. Élaboration de concepts dédiés au suivi environnemental et à la gestion durable des terres en zones arides.",
      tags: ["Neutralité des terres", "Restauration écologique", "Suivi de la désertification"]
    },
    "Eau": {
      color: "#0ea5e9", // Sky Blue
      bg: "from-sky-100/70",
      glow: "shadow-[0_24px_80px_rgba(14,165,233,0.10)]",
      text: "Gestion durable des ressources en eau et renforcement de la résilience des populations face aux mutations environnementales et au stress hydrique.",
      tags: ["Gestion intégrée de l’eau", "Aquifères transfrontaliers", "Aide à la décision"]
    },
    "Climat": {
      color: "#f59e0b", // Amber
      bg: "from-amber-100/70",
      glow: "shadow-[0_24px_80px_rgba(245,158,11,0.10)]",
      text: "Adaptation au changement climatique. Grâce à ses accréditations GCF et FA, l'OSS soutient les pays dans la mise en œuvre de projets atténuant les impacts climatiques sur les populations.",
      tags: ["Accrédité GCF", "Accrédité FA", "Adaptation locale"]
    },
    "Biodiversité": {
      color: "#a855f7", // Purple
      bg: "from-purple-100/70",
      glow: "shadow-[0_24px_80px_rgba(168,85,247,0.10)]",
      text: "Protection du patrimoine biologique et suivi environnemental pour préserver les écosystèmes africains face aux pressions anthropiques et climatiques.",
      tags: ["Suivi écologique", "Solutions fondées sur la nature", "Conservation des habitats"]
    }
  };

  const currentPillar = pillars[activePillar];

  return (
    <div className="about-page min-h-screen bg-[#ffffff] text-ink font-sans relative overflow-hidden antialiased selection:bg-emerald-700/20">
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 lg:py-32">
        
        {/* ════════════════════════════════════════════
            1. HERO / PRÉSENTATION
        ════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32 items-start">
          
          {/* Left: Title & Drop-cap Text */}
          <div className="lg:col-span-7">
            <div className={`flex items-center gap-4 mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="h-px w-12 bg-emerald-500"></span>
              <span className="text-xs font-mono tracking-[0.3em] text-emerald-500 uppercase">ORG. INTERNATIONALE // TUNIS</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-medium text-ink mb-12 leading-[1.05] tracking-tight">
              <span className="block overflow-hidden">
                <span className={`block transition-transform duration-1000 ease-out ${mounted ? 'translate-y-0' : 'translate-y-full'}`}>
                  Observatoire du Sahara
                </span>
              </span>
              <span className="block overflow-hidden">
                <span className={`block transition-transform duration-1000 ease-out delay-150 ${mounted ? 'translate-y-0' : 'translate-y-full'} text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-500`}>
                  & du Sahel.
                </span>
              </span>
            </h1>
            
            <div className="text-lg leading-[1.8] text-slate-600 font-light max-w-2xl">
              <p className="mb-6">
                <span className="float-left text-6xl font-serif font-bold text-emerald-400 mr-3 mt-1 leading-none">F</span>
                ondé en 1992 et basé à Tunis depuis 2000, l'OSS a pour rôle principal de créer et de soutenir des partenariats pour relever les défis liés à la gestion des ressources en eau et à la mise en œuvre, en Afrique, des Accords Multilatéraux sur l'Environnement.
              </p>
              <p>
                Les collaborations entre l'OSS et ses membres visent, en premier lieu, à renforcer les efforts communs pour un avenir durable en Afrique, particulièrement face à la dégradation des terres, la perte de biodiversité et le changement climatique.
              </p>
            </div>
          </div>

          {/* Right: Membership Treemap */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className={`relative overflow-hidden bg-[#EFECE5] border border-[#C8C1B5] backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_24px_70px_rgba(26,31,28,0.10)] transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-600/[0.08] blur-3xl" />
              
              <div className="relative flex justify-between items-start mb-9">
                <div>
                  <h3 className="text-xs font-mono tracking-[0.2em] uppercase text-slate-500 mb-2">Réseau des membres</h3>
                  <div className="text-7xl font-serif font-bold text-ink leading-none">48</div>
                  <p className="text-sm text-slate-600 mt-3">Une coopération multilatérale</p>
                </div>
                <span className="font-mono text-xs text-emerald-700">1992-2026</span>
              </div>

              <div className="relative grid min-h-[300px] grid-cols-[1.3fr_0.9fr] grid-rows-2 gap-3">
                <div className={`group row-span-2 flex flex-col justify-between rounded-2xl bg-emerald-700 p-6 text-[#F7F7F3] transition-all duration-700 ease-out ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'}`}>
                  <span className="text-xs font-mono uppercase tracking-[0.14em] text-[#F7F7F3]/70">Afrique</span>
                  <div>
                    <div className="font-serif text-6xl font-bold leading-none">28</div>
                    <p className="mt-3 max-w-[12ch] text-sm leading-snug text-[#F7F7F3]/80">pays africains membres</p>
                  </div>
                </div>
                <div className={`flex items-end justify-between rounded-2xl border border-[#C8C1B5] bg-[#E4EAE4] p-5 transition-all duration-700 delay-150 ease-out ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
                  <div>
                    <div className="font-serif text-4xl font-bold text-ink">07</div>
                    <p className="mt-2 text-xs leading-snug text-slate-600">pays non-africains</p>
                  </div>
                </div>
                <div className={`flex items-end justify-between rounded-2xl border border-[#C8C1B5] bg-[#D5DDD5] p-5 transition-all duration-700 delay-300 ease-out ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
                  <div>
                    <div className="font-serif text-4xl font-bold text-ink">13</div>
                    <p className="mt-2 text-xs leading-snug text-slate-600">entités et organisations</p>
                  </div>
                </div>
              </div>

              <div className="relative mt-7 flex items-center justify-between border-t border-[#C8C1B5] pt-5 text-xs text-slate-500">
                <span>Siège social</span>
                <span className="font-medium text-ink">Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            2. MISSION & EXPERTISE (Interactive Grid)
        ════════════════════════════════════════════ */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px w-10 bg-emerald-500"></span>
                <span className="text-xs font-mono tracking-[0.2em] text-emerald-500 uppercase">02 / Mandat</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink leading-tight">
                Mission et expertise
              </h2>
            </div>
            <div className="lg:col-span-8 flex items-end">
              <p className="text-lg leading-[1.7] text-slate-600 font-light max-w-2xl border-l-2 border-emerald-700/30 pl-6">
                L'OSS aide ses pays membres africains à gérer durablement leurs ressources naturelles, dans un contexte de changement climatique des plus difficiles. Son action se concentre sur les zones arides, semi-arides et subhumides sèches.
              </p>
            </div>
          </div>

          {/* Horizontal Expanding Grid */}
          <div
            className="flex flex-col md:flex-row gap-4 h-auto md:h-[320px]"
            onMouseLeave={() => setIsAxisHovered(false)}
          >
            {axes.map((axis, i) => (
              <div
                key={axis.id}
                onMouseEnter={() => {
                  setIsAxisHovered(true);
                  setActiveAxis(i);
                }}
                onClick={() => setActiveAxis(i)}
                className={`group relative flex-1 cursor-pointer border rounded-2xl p-8 transition-all duration-500 ease-in-out overflow-hidden ${
                  activeAxis === i 
                    ? "md:flex-[3] bg-gradient-to-br from-[#EFECE5] to-emerald-50/70 border-emerald-600/30 shadow-[0_16px_45px_rgba(26,31,28,0.08)]"
                    : "border-[#C8C1B5] bg-[#EFECE5] hover:bg-[#E5E1D8] hover:border-[#AAA397]"
                }`}
              >
                {/* Glow on active */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transition-opacity duration-500 ${activeAxis === i ? 'opacity-100' : 'opacity-0'}`}></div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className={`font-mono text-sm transition-colors duration-300 mb-4 ${activeAxis === i ? 'text-emerald-700' : 'text-slate-500'}`}>
                    AXE_{axis.id}
                  </div>
                  <h3 className={`font-serif text-2xl md:text-3xl font-medium transition-colors duration-300 mb-2 ${activeAxis === i ? 'text-ink' : 'text-slate-600'}`}>
                    {axis.title}
                  </h3>
                  <p className={`text-xs font-mono uppercase tracking-wider mb-6 transition-colors duration-300 ${activeAxis === i ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {axis.subtitle}
                  </p>
                  
                  <div className={`flex-1 overflow-hidden transition-all duration-500 ${activeAxis === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-[15px] leading-relaxed text-slate-700 font-light border-t border-black/10 pt-4">
                      {axis.content}
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="mt-auto pt-4">
                    <div className="h-1 w-full rounded-full bg-black/10 overflow-hidden">
                      <div className={`h-full bg-emerald-500 transition-all duration-500 ease-out ${activeAxis === i ? 'w-full' : 'w-0 group-hover:w-1/4'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            3. ACTION & PROGRAMMES (Immersive Dossier)
        ════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <span className="h-px w-10 bg-emerald-500"></span>
            <span className="text-xs font-mono tracking-[0.2em] text-emerald-500 uppercase">03 / Stratégie</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-12 leading-tight">
            Programmes structurants
          </h2>

          <div className={`relative grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 rounded-3xl border border-[#C8C1B5] bg-gradient-to-br ${currentPillar.bg} to-[#FAF9F6] backdrop-blur-xl transition-all duration-700 ease-in-out overflow-hidden ${currentPillar.glow}`}>
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(26,31,28,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(26,31,28,0.10) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute -bottom-1/3 -right-1/4 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none transition-colors duration-700" style={{ backgroundColor: `${currentPillar.color}15` }}></div>

            {/* Left Navigation */}
            <div className="lg:col-span-4 relative z-10 flex flex-col justify-center gap-2" onMouseLeave={() => setIsPillarHovered(false)}>
              {pillarNames.map((pillar) => (
                <button
                  key={pillar}
                  onClick={() => setActivePillar(pillar)}
                  onMouseEnter={() => {
                    setIsPillarHovered(true);
                    setActivePillar(pillar);
                  }}
                  className={`group text-left p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                    activePillar === pillar 
                      ? "text-ink"
                      : "bg-transparent text-slate-600 hover:bg-white/40 hover:text-ink border-black/10"
                  }`}
                  style={activePillar === pillar ? { backgroundColor: `${pillars[pillar].color}18`, borderColor: `${pillars[pillar].color}40`, boxShadow: `0 0 30px ${pillars[pillar].color}10` } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-medium">{pillar}</span>
                    <div 
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ backgroundColor: activePillar === pillar ? pillars[pillar].color : 'rgba(26,31,28,0.18)', boxShadow: activePillar === pillar ? `0 0 10px ${pillars[pillar].color}` : 'none' }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-8 relative z-10 min-h-[280px] flex flex-col justify-center">
              
              <div key={activePillar} className="animate-fade-blur-in">
                <h3 className="font-serif text-5xl md:text-6xl font-bold text-ink mb-8 tracking-tight">
                  {activePillar}
                </h3>
                
                <p className="text-xl text-slate-700 leading-[1.6] mb-10 font-light max-w-2xl">
                  {currentPillar.text}
                </p>
                
                {/* Accreditation & Implementation Tags */}
                <div className="flex flex-wrap gap-3">
                  {currentPillar.tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-white/55 border border-black/10 rounded-full text-xs font-mono uppercase tracking-widest text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentPillar.color }} />
                      {tag}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Custom Keyframe Animations ── */}
      <style>{`
        @keyframes fade-blur-in {
          0% { opacity: 0; filter: blur(8px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        .animate-fade-blur-in {
          animation: fade-blur-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
}
