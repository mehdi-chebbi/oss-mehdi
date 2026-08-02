import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DepartmentData | null>(null);

  const loadDepartments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listAllDepartments(token);
      setDepartments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    try {
      await deleteDepartment(token, deleteTarget.id);
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
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
          <h2 className="text-2xl font-bold text-ink">Departments</h2>
          <p className="text-ink/50 text-sm mt-1">
            Group projects under departments (shown on the /projects page)
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/departments/new")}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {departments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
          No departments yet. Click “Add Department” to create one.
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

            {/* Published badge */}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                dept.is_published
                  ? "bg-[#489e42]/10 text-[#489e42]"
                  : "bg-ink/5 text-ink/40"
              }`}
            >
              {dept.is_published ? "Published" : "Draft"}
            </span>

            {/* Actions */}
            <button
              onClick={() => navigate(`/admin/departments/${dept.id}`)}
              className="flex items-center gap-1 text-sm text-ink/60 hover:text-[#489e42] font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setDeleteTarget(dept)}
              className="text-ink/30 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        message="Are you sure you want to delete this department?"
        itemName={deleteTarget?.title_fr}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
