import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  FileText,
  FolderKanban,
  Mail,
} from "lucide-react";
import { getDashboardStats } from "../../api/auth";
import { useAuth } from "../../context/auth";

const metrics = [
  {
    key: "news",
    label: "Actualités",
    description: "Articles publiés sur le site",
    icon: BookOpen,
  },
  {
    key: "projects",
    label: "Projets",
    description: "Projets présentés au public",
    icon: FolderKanban,
  },
  {
    key: "resources",
    label: "Ressources",
    description: "Documents disponibles au téléchargement",
    icon: FileText,
  },
  {
    key: "newsletter_subscribers",
    label: "Abonnés newsletter",
    description: "Abonnements actuellement actifs",
    icon: Mail,
  },
] as const;

const numberFormatter = new Intl.NumberFormat("fr-FR");

export default function AdminDashboard() {
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink">Vue d’ensemble</h2>
        <p className="mt-1 text-sm text-ink/55">
          Les principaux indicateurs de contenu de la plateforme OSS.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de charger les statistiques. Veuillez réessayer.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <section
            key={metric.key}
            className="rounded-xl border border-ink/10 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink/60">{metric.label}</p>
                {isLoading ? (
                  <div className="mt-3 h-9 w-20 animate-pulse rounded-md bg-ink/10" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#12355b]">
                    {numberFormatter.format(data?.[metric.key] ?? 0)}
                  </p>
                )}
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f2f7] text-[#0079bc]">
                <metric.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink/45">{metric.description}</p>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e8f2f7] text-[#0079bc]">
              <AlertCircle className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Signalements reçus</h3>
              <p className="mt-1 text-sm text-ink/50">Ensemble des signalements enregistrés</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-ink/10 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <div>
              <p className="text-xs font-semibold text-ink/45">Total</p>
              {isLoading ? (
                <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-ink/10" />
              ) : (
                <p className="mt-1 text-2xl font-bold text-[#12355b]">
                  {numberFormatter.format(data?.reports_total ?? 0)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-ink/45">30 derniers jours</p>
              {isLoading ? (
                <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-ink/10" />
              ) : (
                <p className="mt-1 text-2xl font-bold text-[#2f7d4a]">
                  {numberFormatter.format(data?.reports_last_30_days ?? 0)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
