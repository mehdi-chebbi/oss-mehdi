import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  listFields,
  deleteField,
  type FieldData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

const MAX_FIELDS = 4;

export default function AdminFields() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<FieldData | null>(null);

  const loadFields = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listFields(token);
      setFields(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    try {
      await deleteField(token, deleteTarget.id);
      setFields((prev) => prev.filter((f) => f.id !== deleteTarget.id));
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

  const atMax = fields.length >= MAX_FIELDS;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Fields</h2>
          <p className="text-ink/50 text-sm mt-1">
            Manage the domain field cards on the home page
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/fields/new")}
          disabled={atMax}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add Field
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {atMax && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm mb-6">
          Maximum of {MAX_FIELDS} fields reached. Remove one to add a new one.
        </div>
      )}

      {fields.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          No fields yet. Click "Add Field" to create one.
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field) => (
          <div
            key={field.id}
            className="bg-white rounded-xl shadow-sm border border-ink/5 p-4 flex items-center gap-4"
          >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0">
              <img
                src={field.image}
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
                {field.title_fr}
              </p>
              <p className="text-sm text-ink/50 truncate">
                {field.title_en}
              </p>
            </div>

            {/* Hue indicator */}
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: `hsl(${field.gradient_hue}, 60%, 45%)` }}
              title={`Hue: ${field.gradient_hue}`}
            />

            {/* Published badge */}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                field.is_published
                  ? "bg-[#489e42]/10 text-[#489e42]"
                  : "bg-ink/5 text-ink/40"
              }`}
            >
              {field.is_published ? "Published" : "Draft"}
            </span>

            {/* Actions */}
            <button
              onClick={() => navigate(`/admin/fields/${field.id}`)}
              className="flex items-center gap-1 text-sm text-ink/60 hover:text-[#489e42] font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setDeleteTarget(field)}
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
        message="Are you sure you want to delete this field?"
        itemName={deleteTarget?.title_fr}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
