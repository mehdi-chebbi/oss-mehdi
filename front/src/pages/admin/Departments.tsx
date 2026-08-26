import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listAllDepartments,
  deleteDepartment,
  type DepartmentData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil, Building2 } from "lucide-react";

export default function AdminDepartments() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DepartmentData | null>(null);

  const { data: departments = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["departments"],
    queryFn: () => listAllDepartments(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Départements</h2>
          <p className="text-ink/50 text-sm mt-1">
            Regroupez les projets par département sur la page /projects.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/departments/new")}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter un département
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {departments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          Aucun département. Cliquez sur « Ajouter un département » pour en créer un.
        </div>
      )}

      <div className="space-y-3">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl shadow-sm border border-ink/5 p-4 flex items-center gap-4"
          >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0 flex items-center justify-center">
              {dept.image ? (
                <img
                  src={dept.image}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Building2 className="w-5 h-5 text-ink/20" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">
                {dept.title_fr}
              </p>
              <p className="text-sm text-ink/50 truncate">
                {dept.title_en}
              </p>
              <p className="text-xs text-ink/40 mt-0.5">
                /projects/{dept.slug}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={() => navigate(`/admin/departments/${dept.id}`)}
              className="flex items-center gap-1 text-sm text-ink/60 hover:text-[#489e42] font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Modifier
            </button>
            <button
              onClick={() => setDeleteTarget(dept)}
              className="text-ink/30 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        message="Voulez-vous vraiment supprimer ce département ?"
        itemName={deleteTarget?.title_fr}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
