import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import { listReports, deleteReport, type ReportData } from "../../api/auth";
import { AlertCircle, Eye, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const categoryLabels: Record<string, { en: string; fr: string; color: string }> = {
  complaint: { en: "Complaint", fr: "Plainte", color: "bg-amber-100 text-amber-700" },
  misconduct: { en: "Misconduct", fr: "Inconduite", color: "bg-orange-100 text-orange-700" },
  fraud: { en: "Fraud", fr: "Fraude", color: "bg-red-100 text-red-700" },
  harassment: { en: "Harassment", fr: "Harcèlement", color: "bg-rose-100 text-rose-700" },
  other: { en: "Other", fr: "Autre", color: "bg-ink/5 text-ink/60" },
};

export default function AdminReports() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ReportData | null>(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [error, setError] = useState("");

  const { data: reports = [], isLoading: loading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => listReports(token!),
    enabled: !!token,
  });

  const sorted = [...reports].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortDesc ? -diff : diff;
  });

  const catInfo = (cat: string) => categoryLabels[cat] ?? categoryLabels.other;

  const handleDelete = async (r: ReportData) => {
    if (!token) return;
    if (!confirm(`Delete report "${r.subject}"?`)) return;
    setError("");
    try {
      await deleteReport(token, r.id);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      if (selected?.id === r.id) setSelected(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">Reports</h2>
          <p className="text-ink/50 text-sm mt-1">{reports.length} total</p>
        </div>
        <button
          onClick={() => setSortDesc(!sortDesc)}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors px-3 py-2 rounded-lg border border-ink/10 hover:border-ink/20"
        >
          {sortDesc ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          Newest first
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-ink/40">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-ink/40">No reports yet.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink/5 text-left text-sm text-ink/60">
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">From</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {sorted.map((r) => {
                const cat = catInfo(r.category);
                return (
                  <tr key={r.id} className="hover:bg-ink/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cat.color}`}>
                        {cat.en}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-ink max-w-xs truncate">
                      {r.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink/60">
                      {r.name ?? <span className="italic text-ink/35">Anonymous</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink/50">
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(r)}
                          className="p-2 text-ink/40 hover:text-[#489e42] hover:bg-[#489e42]/5 rounded-lg transition-colors"
                          title="View report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-2 text-ink/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#489e42]" />
                <h3 className="text-lg font-semibold text-ink">Report Detail</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-ink/40 hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${catInfo(selected.category).color}`}
                >
                  {catInfo(selected.category).en}
                </span>
                <span className="text-sm text-ink/40">
                  {new Date(selected.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">Subject</p>
                <p className="text-ink font-medium">{selected.subject}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">Description</p>
                <p className="text-[15px] text-ink/75 leading-relaxed whitespace-pre-wrap">
                  {selected.description}
                </p>
              </div>

              {(selected.name || selected.email) && (
                <div className="pt-3 border-t border-ink/10">
                  <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-2">Submitted by</p>
                  {selected.name && <p className="text-sm text-ink/70">{selected.name}</p>}
                  {selected.email && <p className="text-sm text-ink/50">{selected.email}</p>}
                </div>
              )}

              {!selected.name && !selected.email && (
                <div className="pt-3 border-t border-ink/10">
                  <p className="text-sm italic text-ink/35">Submitted anonymously</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
