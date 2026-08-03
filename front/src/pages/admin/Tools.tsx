import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listTools,
  deleteTool,
  type ToolData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil, ExternalLink } from "lucide-react";

export default function AdminTools() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ToolData | null>(null);

  const { data: tools = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["tools"],
    queryFn: () => listTools(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTool(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
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
          <h2 className="text-2xl font-bold text-ink">Tools</h2>
          <p className="text-ink/50 text-sm mt-1">
            Manage the OSS tools carousel on the home page
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/tools/new")}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Tool
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {tools.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          No tools yet. Click "Add Tool" to create one.
        </div>
      )}

      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white rounded-xl shadow-sm border border-ink/5 p-4 flex items-center gap-4"
          >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0">
              <img
                src={tool.image}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">
                {tool.title_fr}
              </p>
              <p className="text-sm text-ink/50 truncate">
                {tool.title_en}
              </p>
            </div>

            {/* Link */}
            {tool.link && tool.link !== "#" && (
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/30 hover:text-[#3183d4] transition-colors flex-shrink-0"
                title={tool.link}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Published badge */}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                tool.is_published
                  ? "bg-[#489e42]/10 text-[#489e42]"
                  : "bg-ink/5 text-ink/40"
              }`}
            >
              {tool.is_published ? "Published" : "Draft"}
            </span>

            {/* Actions */}
            <button
              onClick={() => navigate(`/admin/tools/${tool.id}`)}
              className="flex items-center gap-1 text-sm text-ink/60 hover:text-[#489e42] font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setDeleteTarget(tool)}
              className="text-ink/30 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        message="Are you sure you want to delete this tool?"
        itemName={deleteTarget?.title_fr}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
