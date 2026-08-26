import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listAllNews,
  deleteNews,
  getThumbnail,
  newsCategoryLabel,
  retryNewsIndex,
  type NewsData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil, Newspaper, RotateCcw } from "lucide-react";

export default function AdminNews() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NewsData | null>(null);

  const { data: news = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["news"],
    queryFn: () => listAllNews(token!),
    enabled: !!token,
    refetchInterval: (query) => query.state.data?.some((article) => article.index_status === "pending" || article.index_status === "processing") ? 5_000 : false,
  });

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNews(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: number) => retryNewsIndex(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["news"] }),
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
          <h2 className="text-2xl font-bold text-ink">Actualités</h2>
          <p className="text-ink/50 text-sm mt-1">
            Gérez les articles d’actualité du site.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/news/new")}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter un article
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {news.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          Aucun article. Cliquez sur « Ajouter un article » pour en créer un.
        </div>
      )}

      <div className="space-y-3">
        {news.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow-sm border border-ink/5 p-4 flex items-center gap-4"
          >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0 flex items-center justify-center">
              {getThumbnail(article) ? (
                <img
                  src={getThumbnail(article)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Newspaper className="w-5 h-5 text-ink/20" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">
                {article.title_fr}
              </p>
              <p className="text-sm text-ink/50 truncate">
                {article.title_en}
              </p>
              <p className="text-xs text-ink/40 mt-0.5">
                {new Date(article.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · /news/{article.slug}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#489e42]">
                {newsCategoryLabel(article.category, "fr")}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                <span className={`font-semibold ${
                  article.index_status === "ready" ? "text-[#3d8a37]" :
                  article.index_status === "failed" ? "text-red-600" :
                  article.index_status === "processing" ? "text-[#0072bc]" : "text-amber-700"
                }`}>
                  {article.index_status === "ready" ? "Prêt pour l’IA" : article.index_status === "failed" ? "Échec de l’indexation" : article.index_status === "processing" ? "Indexation en cours" : "Indexation en attente"}
                </span>
                {article.index_error && <span className="max-w-xs truncate text-red-500" title={article.index_error}>{article.index_error}</span>}
                {(article.index_status === "failed" || article.index_status === "ready") && (
                  <button type="button" disabled={retryMutation.isPending} onClick={() => retryMutation.mutate(article.id)} className="inline-flex items-center gap-1 font-semibold text-[#0072bc] hover:underline disabled:opacity-40">
                    <RotateCcw className="h-3 w-3" /> Réindexer
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => navigate(`/admin/news/${article.id}`)}
              className="flex items-center gap-1 text-sm text-ink/60 hover:text-[#489e42] font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Modifier
            </button>
            <button
              onClick={() => setDeleteTarget(article)}
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
        message="Voulez-vous vraiment supprimer cet article ?"
        itemName={deleteTarget?.title_fr}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
