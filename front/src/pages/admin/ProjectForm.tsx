import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  listAllDepartments,
  listAllProjectsByDept,
  getProject,
  createProject,
  updateProject,
  type DepartmentData,
  type ProjectResultFile,
} from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import ProjectResultsFiles from "../../components/admin/ProjectResultsFiles";
import { Globe, Loader2, ArrowLeft, Info } from "lucide-react";

type Lang = "fr" | "en";

function LangTabs({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-ink/10">
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
          lang === "fr" ? "bg-[#489e42] text-white" : "bg-white text-ink/60 hover:bg-ink/5"
        }`}
      >
        <Globe className="w-3.5 h-3.5" /> FR
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
          lang === "en" ? "bg-[#489e42] text-white" : "bg-white text-ink/60 hover:bg-ink/5"
        }`}
      >
        <Globe className="w-3.5 h-3.5" /> EN
      </button>
    </div>
  );
}

const emptyForm = {
  department_id: 0,
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  results_fr: "",
  results_en: "",
  result_files: [] as ProjectResultFile[],
  image: "",
  year_start: "" as string | number,
  year_end: "" as string | number,
  status: "en_cours" as "en_cours" | "cloture",
  budget: "",
  sort_order: 0,
};

export default function ProjectForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;

  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState<Lang>("fr");

  // Load departments (for the selector) + project (if editing)
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const depts = await listAllDepartments(token);
      setDepartments(depts);

      if (isEditing && id) {
        const project = await getProject(token, Number(id));
        if (project) {
          setForm({
            department_id: project.department_id,
            title_fr: project.title_fr || "",
            title_en: project.title_en || "",
            description_fr: project.description_fr || "",
            description_en: project.description_en || "",
            results_fr: project.results_fr || "",
            results_en: project.results_en || "",
            result_files: project.result_files || [],
            image: project.image || "",
            year_start: project.year_start ?? "",
            year_end: project.year_end ?? "",
            status: project.status || "en_cours",
            budget: project.budget || "",
            sort_order: project.sort_order ?? 0,
          });
          setSlug(project.slug || "");
        }
      } else {
        // New project: pre-select department from ?dept= query param
        const deptFromUrl = searchParams.get("dept");
        const initialDeptId =
          deptFromUrl && depts.some((d) => d.id === Number(deptFromUrl))
            ? Number(deptFromUrl)
            : depts[0]?.id ?? 0;
        setForm((f) => ({ ...f, department_id: initialDeptId }));

        // Default sort_order to next position in that department
        if (initialDeptId) {
          const existing = await listAllProjectsByDept(token, initialDeptId);
          setForm((f) => ({ ...f, sort_order: existing.length }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, id, isEditing, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!token) return;
    if (!form.department_id) {
      setError("Veuillez sélectionner un département.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        year_start: form.year_start === "" ? null : Number(form.year_start),
        year_end: form.year_end === "" ? null : Number(form.year_end),
      };
      if (isEditing && id) {
        await updateProject(token, Number(id), payload);
      } else {
        await createProject(token, payload);
      }
      setSuccess("Projet enregistré avec succès !");
      setTimeout(() => navigate(`/admin/projects?dept=${form.department_id}`), 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center">
          <p className="text-ink/50 mb-3">Aucun département n’existe encore.</p>
          <p className="text-sm text-ink/40 mb-4">
            Vous devez créer au moins un département avant d’ajouter un projet.
          </p>
          <button
            onClick={() => navigate("/admin/departments/new")}
            className="text-sm text-[#489e42] font-semibold hover:underline"
          >
            Créer un département →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/admin/projects?dept=${form.department_id || ""}`)}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux projets
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Modifier le projet" : "Nouveau projet"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing
            ? "Mettre à jour ce projet"
            : "Ajouter un nouveau projet à un département"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#489e42]/10 border border-[#489e42]/20 text-[#489e42] px-4 py-3 rounded-lg text-sm mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-6 space-y-5">
        {/* Department selector */}
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Département <span className="text-red-500">*</span>
          </label>
          <select
            value={form.department_id || ""}
            onChange={(e) => set("department_id", Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
          >
            <option value="" disabled>Sélectionner un département…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title_fr} / {d.title_en}
              </option>
            ))}
          </select>
        </div>

        {/* Language tabs */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink/70">Langue du contenu :</span>
          <LangTabs lang={lang} setLang={setLang} />
        </div>

        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Contenu {lang === "fr" ? "français" : "anglais"}
          </h4>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Titre ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={lang === "fr" ? form.title_fr : form.title_en}
              onChange={(e) => set(lang === "fr" ? "title_fr" : "title_en", e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Description ({lang.toUpperCase()})
            </label>
            <textarea
              value={lang === "fr" ? form.description_fr : form.description_en}
              onChange={(e) => set(lang === "fr" ? "description_fr" : "description_en", e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-none"
              placeholder={lang === "fr" ? "Description du projet…" : "Description du projet en anglais…"}
            />
          </div>

          {/* Results narrative */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Résultats et livrables ({lang.toUpperCase()})
            </label>
            <textarea
              value={lang === "fr" ? form.results_fr : form.results_en}
              onChange={(e) =>
                set(lang === "fr" ? "results_fr" : "results_en", e.target.value)
              }
              rows={6}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-y"
              placeholder={
                lang === "fr"
                  ? "Résultats, réalisations et livrables du projet..."
                  : "Résultats, réalisations et livrables du projet en anglais..."
              }
            />
          </div>
        </div>

        {/* Result documents */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Documents liés aux résultats
          </h4>
          <ProjectResultsFiles
            value={form.result_files}
            onChange={(files) => set("result_files", files)}
          />
        </div>

        {/* Image */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Image
          </h4>
          <ImageUpload
            value={form.image}
            onChange={(url) => set("image", url)}
            section="projects"
            label="Image du projet"
          />
        </div>

        {/* Project details */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Détails du projet
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year start */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Année de début
              </label>
              <input
                type="number"
                value={form.year_start}
                onChange={(e) => set("year_start", e.target.value)}
                placeholder="2020"
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>

            {/* Year end */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Année de fin <span className="text-ink/40 font-normal">(laisser vide si le projet est en cours)</span>
              </label>
              <input
                type="number"
                value={form.year_end}
                onChange={(e) => set("year_end", e.target.value)}
                placeholder="2023"
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Statut
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
              >
                <option value="en_cours">En cours</option>
                <option value="cloture">Clôturé</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Budget
              </label>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
                placeholder="Ex. : 1,2 M EUR, 500 000 $"
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Ordre d’affichage
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>
          </div>
        </div>

        {/* Slug info (only when editing) */}
        {isEditing && (
          <div className="border-t border-ink/5 pt-5">
            <div className="flex items-start gap-2 text-sm text-ink/50 bg-ink/5 px-4 py-3 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink/70">Identifiant d’URL</p>
                <p className="mt-0.5">
                  Le projet est accessible à l’adresse{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded text-xs">/projects/{"{dept}"}/{slug}</code>.
                  L’identifiant est généré automatiquement et ne peut pas être modifié afin de conserver une URL stable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="border-t border-ink/5 pt-5 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/projects?dept=${form.department_id || ""}`)}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
