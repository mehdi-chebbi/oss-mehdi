import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import {
  listAllThematics,
  listAllProjectsByThematic,
  deleteProject,
  statusLabel,
  yearRange,
  type ProjectData,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { Loader2, Plus, Trash2, Pencil, Briefcase, Tags } from "lucide-react";

export default function AdminProjects() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedThematic, setSelectedThematic] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);

  const {
    data: thematics = [],
    isLoading: loadingThematics,
    error: thematicsQueryError,
  } = useQuery({
    queryKey: ["thematics"],
    queryFn: () => listAllThematics(token!),
    enabled: !!token,
  });

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: projectsQueryError,
  } = useQuery({
    queryKey: ["projects", selectedThematic],
    queryFn: () => listAllProjectsByThematic(token!, selectedThematic!),
    enabled: !!token && !!selectedThematic,
  });

  // Initialize selected thematic area from URL (or default to first) once loaded.
  useEffect(() => {
    if (selectedThematic !== null || thematics.length === 0) return;
    const fromUrl = searchParams.get("thematic");
    const initial =
      fromUrl && thematics.some((item) => item.id === Number(fromUrl))
        ? Number(fromUrl)
        : thematics[0]?.id ?? null;
    setSelectedThematic(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thematics]);

  useEffect(() => {
    if (thematicsQueryError) setError((thematicsQueryError as Error).message);
    else if (projectsQueryError) setError((projectsQueryError as Error).message);
  }, [thematicsQueryError, projectsQueryError]);

  // Keep ?thematic= in sync so the "Add Project" flow can read it.
  const handleThematicChange = (id: number) => {
    setSelectedThematic(id);
    const next = new URLSearchParams(searchParams);
    next.set("thematic", String(id));
    setSearchParams(next, { replace: true });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProject(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", selectedThematic] });
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

  if (loadingThematics) {
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
          <h2 className="text-2xl font-bold text-ink">Projets</h2>
          <p className="text-ink/50 text-sm mt-1">
            Gérez les projets regroupés par thématique.
          </p>
        </div>
        <button
          onClick={() =>
            navigate(
              selectedThematic
                ? `/admin/projects/new?thematic=${selectedThematic}`
                : "/admin/projects/new",
            )
          }
          disabled={!selectedThematic}
          className="flex items-center gap-2 px-4 py-2 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          title={selectedThematic ? "" : "Sélectionnez d’abord une thématique"}
        >
          <Plus className="w-4 h-4" /> Ajouter un projet
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Thematic selector */}
      {thematics.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center">
          <Tags className="w-8 h-8 text-ink/20 mx-auto mb-3" />
          <p className="text-ink/50 mb-1">Aucune thématique n’existe encore.</p>
          <p className="text-sm text-ink/40">
            Créez d’abord une thématique avant d’ajouter des projets.
          </p>
          <button
            onClick={() => navigate("/admin/thematics/new")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#489e42] font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Nouvelle thématique
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink/70 mb-1.5">
              Thématique
            </label>
            <select
              value={selectedThematic ?? ""}
              onChange={(e) => handleThematicChange(Number(e.target.value))}
              className="w-full max-w-md px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
            >
              {thematics.map((d) => (
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
              Aucun projet dans cette thématique. Cliquez sur « Ajouter un projet » pour en créer un.
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
                      {yearRange(project.year_start, project.year_end, "fr")}
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
                    {statusLabel(project.status, "fr")}
                  </span>

                  {/* Actions */}
                  <button
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                    className="flex items-center gap-1 text-sm text-ink/60 hover:text-[#489e42] font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="text-ink/30 hover:text-red-500 transition-colors"
                    title="Supprimer"
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
        message="Voulez-vous vraiment supprimer ce projet ?"
        itemName={deleteTarget?.title_fr}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
