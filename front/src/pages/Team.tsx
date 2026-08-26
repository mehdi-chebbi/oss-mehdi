import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPublicTeam, type TeamMemberData } from "@/api/auth";
import { Loader2 } from "lucide-react";

const DEPARTMENTS = [
  { key: "direction", label: "Direction", labelEn: "Direction" },
  { key: "technique", label: "Technique", labelEn: "Technical" },
  { key: "administratif", label: "Administratif", labelEn: "Administrative" },
  { key: "appui", label: "Appui", labelEn: "Support" },
] as const;

function MemberCard({ m, locale, featured = false }: { m: TeamMemberData; locale: "fr" | "en"; featured?: boolean }) {
  const title = locale === "en" ? m.title_en : m.title_fr;
  const diplomas = locale === "en" ? m.diplomas_en : m.diplomas_fr;
  const nationality = locale === "en" ? m.nationality_en : m.nationality_fr;

  return (
    <article className={`group relative w-full overflow-hidden border border-oss-line bg-white transition-colors duration-300 hover:border-oss-blue/35 hover:bg-oss-blue/5 ${featured ? 'max-w-[340px]' : ''}`}>
      <span className={`absolute inset-x-0 top-0 z-10 h-1.5 ${featured ? 'bg-oss-ochre' : 'bg-oss-blue'}`} aria-hidden="true" />
      <div className={`overflow-hidden bg-oss-paper ${featured ? 'aspect-[1/1.08]' : 'aspect-[1/1.12]'}`}>
        {m.image ? (
          <img src={m.image} alt={m.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-oss-blue-dark">
            <span className="text-6xl font-bold text-white/18">{m.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="min-h-40 p-5 sm:p-6">
        <h3 className="text-lg font-bold leading-tight text-oss-blue-dark">{m.name}</h3>
        {title && <p className="mt-2 text-sm font-medium leading-snug text-ink/68">{title}</p>}
        {nationality && <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.07em] text-oss-blue">{nationality}</p>}
        {diplomas && <p className="mt-3 border-t border-oss-line pt-3 text-xs leading-relaxed text-ink/52">{diplomas}</p>}
      </div>
    </article>
  );
}

export default function Team() {
  const { lang } = useParams<{ lang: string }>();
  const locale = lang === "en" ? "en" : "fr";
  const [activeDept, setActiveDept] = useState<string>("direction");
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPublicTeam(activeDept)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [activeDept]);

  return (
    <div className="font-oss min-h-screen overflow-hidden bg-oss-paper text-ink antialiased selection:bg-oss-blue selection:text-white">
      <section className="mx-auto max-w-[1400px] px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-20">
        <div>
          <p className="oss-kicker mb-5">{locale === "en" ? "People and expertise" : "Capital humain & expertise"}</p>
          <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
            {locale === "en" ? "Our Team" : "Notre équipe"}
          </h1>
          <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
            {locale === "en"
              ? "A multicultural and multidisciplinary team working alongside member countries to turn environmental knowledge into action."
              : "Une équipe multiculturelle et multidisciplinaire qui accompagne les pays membres pour transformer la connaissance environnementale en action."}
          </p>
        </div>

      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-2 sm:px-8 lg:px-12 lg:pb-28">
        <div className="mb-10 grid border border-oss-line bg-white sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label={locale === "en" ? "Team departments" : "Départements de l'équipe"}>
          {DEPARTMENTS.map((department, index) => (
            <button
              key={department.key}
              type="button"
              role="tab"
              aria-selected={activeDept === department.key}
              onClick={() => setActiveDept(department.key)}
              className={`relative min-h-16 px-5 py-4 text-left text-sm font-bold transition-colors duration-300 lg:border-l lg:first:border-l-0 ${activeDept === department.key ? "bg-oss-blue text-white" : "border-oss-line text-ink/52 hover:bg-oss-blue/5 hover:text-oss-blue-dark"}`}
            >
              <span className={`mr-3 text-xs ${activeDept === department.key ? 'text-oss-ochre' : 'text-oss-blue/48'}`}>0{index + 1}</span>
              {locale === "en" ? department.labelEn : department.label}
              {activeDept === department.key && <span className="absolute inset-x-0 bottom-0 h-1 bg-oss-ochre" aria-hidden="true" />}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-oss-blue" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center bg-white px-6 text-center text-ink/42">
            {locale === "en" ? "No members yet." : "Aucun membre pour le moment."}
          </div>
        ) : (
          <div key={activeDept} className="animate-[team-grid-in_500ms_cubic-bezier(0.16,1,0.3,1)]">
            {activeDept === "direction" && members.length > 0 && (
              <div className="mb-8 flex justify-center">
                <MemberCard m={members[0]} locale={locale} featured />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(activeDept === "direction" ? members.slice(1) : members).map((member) => (
                <MemberCard key={member.id} m={member} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </section>

      <style>{`
        @keyframes team-grid-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
