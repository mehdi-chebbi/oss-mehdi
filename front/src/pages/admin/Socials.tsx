import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listSocials,
  deleteSocial,
  type SocialData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil, ExternalLink } from "lucide-react";

export default function AdminSocials() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<SocialData | null>(null);

  const { data: socials = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["socials"],
    queryFn: () => listSocials(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSocial(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socials"] });
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

  const renderIcon = (social: SocialData, size = 20) => {
    if (social.icon_file) {
      return <img src={social.icon_file} alt={social.platform} width={size} height={size} className="object-contain" />;
    }
    if (social.icon_svg) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d={social.icon_svg} />
        </svg>
      );
    }
    return <span className="text-xs">Indisponible</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Réseaux sociaux</h2>
          <p className="text-ink/50 text-sm mt-1">
            Gérez les liens vers les réseaux sociaux affichés sur le site.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/socials/new")}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter un réseau
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {socials.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          Aucun réseau social. Cliquez sur « Ajouter un réseau » pour en créer un.
        </div>
      )}

      <div className="space-y-2">
        {socials.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl shadow-sm border border-ink/5 p-3 flex items-center gap-3"
          >
            {/* Icon preview */}
            <div className="w-8 h-8 flex items-center justify-center text-ink/70 flex-shrink-0">
              {renderIcon(s)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink text-sm truncate">{s.platform}</p>
              <p className="text-xs text-ink/40 truncate">{s.url}</p>
            </div>

            {s.url && s.url !== "#" && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/30 hover:text-[#3183d4] transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => navigate(`/admin/socials/${s.id}`)}
              className="flex items-center gap-1 text-xs text-ink/60 hover:text-[#489e42] font-medium transition-colors"
            >
              <Pencil className="w-3 h-3" /> Modifier
            </button>
            <button
              onClick={() => setDeleteTarget(s)}
              className="text-ink/30 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        message="Voulez-vous vraiment supprimer ce lien vers un réseau social ?"
        itemName={deleteTarget?.platform}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
