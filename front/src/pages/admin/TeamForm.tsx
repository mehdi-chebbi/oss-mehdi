import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  getTeamMember,
  createTeamMember,
  updateTeamMember,
} from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import { Loader2, ArrowLeft } from "lucide-react";

const DEPARTMENTS = [
  { key: "direction", label: "Direction" },
  { key: "technique", label: "Technique" },
  { key: "administratif", label: "Administratif" },
  { key: "appui", label: "Appui" },
] as const;

const emptyForm = {
  name: "",
  title_fr: "",
  title_en: "",
  diplomas_fr: "",
  diplomas_en: "",
  nationality_fr: "",
  nationality_en: "",
  image: "",
  department: "direction",
};

export default function TeamForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMember = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const member = await getTeamMember(token, Number(id));
      if (member) {
        setForm({
          name: member.name,
          title_fr: member.title_fr,
          title_en: member.title_en,
          diplomas_fr: member.diplomas_fr,
          diplomas_en: member.diplomas_en,
          nationality_fr: member.nationality_fr,
          nationality_en: member.nationality_en,
          image: member.image,
          department: member.department,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (isEditing) loadMember();
  }, [loadMember, isEditing]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (isEditing && id) {
        await updateTeamMember(token, Number(id), form);
      } else {
        await createTeamMember(token, form);
      }
      setSuccess("Membre de l’équipe enregistré avec succès !");
      setTimeout(() => navigate("/admin/team"), 800);
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

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/team")}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l’équipe
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Modifier le membre" : "Nouveau membre"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing ? "Mettre à jour ce membre de l’équipe" : "Ajouter un nouveau membre à l’équipe"}
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
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Nom
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Département
          </label>
          <select
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Photo */}
        <ImageUpload
          value={form.image}
          onChange={(url) => set("image", url)}
          section="team"
          label="Photo"
          placeholder="https://..."
          accept="image/jpeg,image/png,image/gif,image/webp"
        />

        {/* Bilingual fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Fonction (FR)
            </label>
            <input
              type="text"
              value={form.title_fr}
              onChange={(e) => set("title_fr", e.target.value)}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Fonction (EN)
            </label>
            <input
              type="text"
              value={form.title_en}
              onChange={(e) => set("title_en", e.target.value)}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Diplômes / qualifications (FR)
          </label>
          <textarea
            value={form.diplomas_fr}
            onChange={(e) => set("diplomas_fr", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Diplômes / qualifications (EN)
          </label>
          <textarea
            value={form.diplomas_en}
            onChange={(e) => set("diplomas_en", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Nationalité (FR)
            </label>
            <input
              type="text"
              value={form.nationality_fr}
              onChange={(e) => set("nationality_fr", e.target.value)}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Nationalité (EN)
            </label>
            <input
              type="text"
              value={form.nationality_en}
              onChange={(e) => set("nationality_en", e.target.value)}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>
        </div>

        {/* Actions */}
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
            onClick={() => navigate("/admin/team")}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
