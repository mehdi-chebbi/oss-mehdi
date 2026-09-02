import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listAllTeam,
  deleteTeamMember,
  type TeamMemberData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

const DEPARTMENTS = [
  { key: "direction", label: "Direction" },
  { key: "technique", label: "Technique" },
  { key: "administratif", label: "Administratif" },
  { key: "audit", label: "Audit" },
  { key: "appui", label: "Appui" },
] as const;

const departmentBadgeColor: Record<string, string> = {
  direction: "bg-forest-700/10 text-forest-700",
  technique: "bg-sand-200/60 text-sand-800",
  administratif: "bg-ink/5 text-ink/50",
  appui: "bg-ink/5 text-ink/50",
  audit: "bg-forest-700/10 text-forest-700",
};

export default function AdminTeam() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [activeDept, setActiveDept] = useState<string>("direction");
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberData | null>(null);

  const { data: members = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["team", activeDept],
    queryFn: () => listAllTeam(token!, activeDept),
    enabled: !!token,
  });

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTeamMember(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setError("");
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Équipe</h2>
          <p className="text-ink/50 text-sm mt-1">
            Gérez les membres de l’équipe par département.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/team/new")}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter un membre
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Department tabs */}
      <div className="flex gap-1 mb-6 border-b border-ink/10">
        {DEPARTMENTS.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDept(d.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeDept === d.key
                ? "border-[#489e42] text-[#489e42]"
                : "border-transparent text-ink/50 hover:text-ink/70"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          Aucun membre dans « {DEPARTMENTS.find((d) => d.key === activeDept)?.label} ». Cliquez sur « Ajouter un membre » pour en créer un.
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl shadow-sm border border-ink/5 p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0 flex items-center justify-center">
                {m.image ? (
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-ink/20 text-xs">Aucune image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm truncate">{m.name}</p>
                <p className="text-ink/50 text-xs truncate">{m.title_fr || m.title_en}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  departmentBadgeColor[m.department] || departmentBadgeColor.appui
                }`}
              >
                {DEPARTMENTS.find((d) => d.key === m.department)?.label || m.department}
              </span>
              <button
                onClick={() => navigate(`/admin/team/${m.id}`)}
                className="flex items-center gap-1 text-xs text-ink/60 hover:text-[#489e42] font-medium transition-colors"
              >
                <Pencil className="w-3 h-3" /> Modifier
              </button>
              <button
                onClick={() => setDeleteTarget(m)}
                className="text-ink/30 hover:text-red-500 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        open={!!deleteTarget}
        message="Voulez-vous vraiment supprimer ce membre de l’équipe ?"
        itemName={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
