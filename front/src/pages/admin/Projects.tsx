import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listAllDepartments,
  listAllProjectsByDept,
  deleteProject,
  statusLabel,
  yearRange,
  type ProjectData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil, Briefcase, Building2 } from "lucide-react";

export default function AdminProjects() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);

  const {
    data: departments = [],
    isLoading: loadingDepts,
    error: deptsQueryError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: () => listAllDepartments(token!),
    enabled: !!token,
  });

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: projectsQueryError,
  } = useQuery({
    queryKey: ["projects", selectedDept],
    queryFn: () => listAllProjectsByDept(token!, selectedDept!),
    enabled: !!token && !!selectedDept,
  });

  // Initialize selected department from URL (or default to first) once
  // departments have loaded.
  useEffect(() => {
    if (selectedDept !== null || departments.length === 0) return;
    const fromUrl = searchParams.get("dept");
    const initial =
      fromUrl && departments.some((d) => d.id === Number(fromUrl))
        ? Number(fromUrl)
        : departments[0]?.id ?? null;
    setSelectedDept(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments]);

  useEffect(() => {
    if (deptsQueryError) setError((deptsQueryError as Error).message);
    else if (projectsQueryError) setError((projectsQueryError as Error).message);
  }, [deptsQueryError, projectsQueryError]);

  // Keep ?dept= in sync with the selector so the "Add Project" flow can read it
  const handleDeptChange = (id: number) => {
    setSelectedDept(id);
    const next = new URLSearchParams(searchParams);
    next.set("dept", String(id));
    setSearchParams(next, { replace: true });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProject(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", selectedDept] });
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

  if (loadingDepts) {
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
          <h2 className="text-2xl font-bold text-ink">Projects</h2>
          <p className="text-ink/50 text-sm mt-1">
            Manage projects grouped by department
          </p>
        </div>
        <button
          onClick={() =>
            navigate(
              selectedDept
                ? `/admin/projects/new?dept=${selectedDept}`
                : "/admin/projects/new",
            )
          }
          disabled={!selectedDept}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          title={selectedDept ? "" : "Select a department first"}
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Department selector */}
      {departments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center">
          <Building2 className="w-8 h-8 text-ink/20 mx-auto mb-3" />
          <p className="text-ink/50 mb-1">No departments exist yet.</p>
          <p className="text-sm text-ink/40">
            Create a department first before adding projects.
          </p>
          <button
            onClick={() => navigate("/admin/departments/new")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#489e42] font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> New Department
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink/70 mb-1.5">
              Department
            </label>
            <select
              value={selectedDept ?? ""}
              onChange={(e) => handleDeptChange(Number(e.target.value))}
              className="w-full max-w-md px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title_fr} / {d.title_en}
                </option>
              ))}
            </select>
          </div>

          {/* Projects list */}
          {loadingProjects ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center text-ink/40">
              No projects in this department yet. Click “Add Project” to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-ink/5 p-4 flex items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0 flex items-center justify-center">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Briefcase className="w-5 h-5 text-ink/20" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">
                      {project.title_fr}
                    </p>
                    <p className="text-sm text-ink/50 truncate">
                      {project.title_en}
                    </p>
                    <p className="text-xs text-ink/40 mt-0.5">
                      {yearRange(project.year_start, project.year_end, "en")}
                      {project.budget ? ` · ${project.budget}` : ""}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      project.status === "en_cours"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-ink/5 text-ink/50"
                    }`}
                  >
                    {statusLabel(project.status, "en")}
                  </span>

                  {/* Published badge */}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      project.is_published
                        ? "bg-[#489e42]/10 text-[#489e42]"
                        : "bg-ink/5 text-ink/40"
                    }`}
                  >
                    {project.is_published ? "Published" : "Draft"}
                  </span>

                  {/* Actions */}
                  <button
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                    className="flex items-center gap-1 text-sm text-ink/60 hover:text-[#489e42] font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="text-ink/30 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <DeleteConfirmModal
        open={!!deleteTarget}
        message="Are you sure you want to delete this project?"
        itemName={deleteTarget?.title_fr}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
