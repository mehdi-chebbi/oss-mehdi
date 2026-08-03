import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPublishedTeam, type TeamMemberData } from "@/api/auth";
import { Loader2 } from "lucide-react";

const DEPARTMENTS = [
  { key: "direction", label: "Direction", labelEn: "Direction" },
  { key: "technique", label: "Technique", labelEn: "Technical" },
  { key: "administratif", label: "Administratif", labelEn: "Administrative" },
  { key: "appui", label: "Appui", labelEn: "Support" },
] as const;

function MemberCard({ m, locale }: { m: TeamMemberData; locale: "fr" | "en" }) {
  const title = locale === "en" ? m.title_en : m.title_fr;
  const diplomas = locale === "en" ? m.diplomas_en : m.diplomas_fr;
  const nationality = locale === "en" ? m.nationality_en : m.nationality_fr;

  return (
    <div className="bg-white rounded-xl border border-ink/[0.08] overflow-hidden hover:shadow-md transition-shadow duration-200 w-full max-w-[280px]">
      <div className="flex justify-center pt-6 px-6">
        <div className="w-[200px] h-[234px] rounded-lg overflow-hidden bg-ink/[0.04]">
          {m.image ? (
            <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-ink/15 text-5xl font-bold font-serif">{m.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-5 text-center">
        <h3 className="text-base font-bold text-ink mb-1">{m.name}</h3>
        {title && <p className="text-sm font-medium text-ink/70 mb-1">{title}</p>}
        {nationality && <p className="text-xs font-medium text-forest-700 mb-1.5">{nationality}</p>}
        {diplomas && <p className="text-xs text-ink/60 leading-relaxed">{diplomas}</p>}
      </div>
    </div>
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
    getPublishedTeam(activeDept)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [activeDept]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:px-8">
      <h1 className="text-3xl font-bold text-ink mb-8 font-serif">
        {locale === "en" ? "Our Team" : "Notre équipe"}
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-10 border-b border-ink/10">
        {DEPARTMENTS.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDept(d.key)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeDept === d.key
                ? "border-forest-700 text-forest-700"
                : "border-transparent text-ink/50 hover:text-ink/70"
            }`}
          >
            {locale === "en" ? d.labelEn : d.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <p className="text-ink/40 text-center py-16">
          {locale === "en" ? "No members yet." : "Aucun membre pour le moment."}
        </p>
      ) : (
        <>
          {/* Direction: first member centered, rest in 3-col grid */}
          {activeDept === "direction" && members.length > 0 && (
            <div className="flex justify-center mb-6">
              <MemberCard
                m={members[0]}
                locale={locale}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeDept === "direction" ? members.slice(1) : members).map((m) => (
              <MemberCard key={m.id} m={m} locale={locale} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
