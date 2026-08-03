import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listPartners,
  deletePartner,
  type PartnerData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

export default function AdminPartners() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<PartnerData | null>(null);

  const { data: partners = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["partners"],
    queryFn: () => listPartners(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const row1 = partners.filter((p) => p.row_number === 1);
  const row2 = partners.filter((p) => p.row_number === 2);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePartner(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
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

  const renderRow = (label: string, items: PartnerData[]) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-ink/50 uppercase tracking-wider mb-2">
        {label}
      </h3>
      {items.length === 0 ? (
        <p className="text-ink/30 text-sm">No partners in this row</p>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm border border-ink/5 p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0 flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-ink/20 text-xs">No img</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm truncate">{p.name}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  p.is_published
                    ? "bg-[#489e42]/10 text-[#489e42]"
                    : "bg-ink/5 text-ink/40"
                }`}
              >
                {p.is_published ? "Pub" : "Draft"}
              </span>
              <button
                onClick={() => navigate(`/admin/partners/${p.id}`)}
                className="flex items-center gap-1 text-xs text-ink/60 hover:text-[#489e42] font-medium transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => setDeleteTarget(p)}
                className="text-ink/30 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Partners</h2>
          <p className="text-ink/50 text-sm mt-1">
            Manage the partner logos in the marquee rows
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/partners/new")}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {partners.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          No partners yet. Click "Add Partner" to create one.
        </div>
      )}

      {renderRow("Row 1 — scrolls right", row1)}
      {renderRow("Row 2 — scrolls left", row2)}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        message="Are you sure you want to delete this partner?"
        itemName={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
