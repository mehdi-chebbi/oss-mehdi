import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  listTools,
  getTool,
  createTool,
  updateTool,
} from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import { Globe, Loader2, ArrowLeft } from "lucide-react";

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
  page_id: 1,
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  image: "",
  link: "#",
  sort_order: 0,
};

export default function ToolForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState<Lang>("fr");

  const loadTool = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const tool = await getTool(token, Number(id));
      if (tool) {
        setForm({
          page_id: tool.page_id,
          title_fr: tool.title_fr,
          title_en: tool.title_en,
          description_fr: tool.description_fr,
          description_en: tool.description_en,
          image: tool.image,
          link: tool.link,
          sort_order: tool.sort_order,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (isEditing) {
      loadTool();
    } else {
      if (token) {
        listTools(token).then((tools) => {
          setForm((f) => ({ ...f, sort_order: tools.length }));
        });
      }
    }
  }, [loadTool, isEditing, token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (isEditing && id) {
        await updateTool(token, Number(id), form);
      } else {
        await createTool(token, form);
      }
      setSuccess("Outil enregistré avec succès.");
      setTimeout(() => navigate("/admin/tools"), 800);
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
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/tools")}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux outils
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Modifier l’outil" : "Nouvel outil"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing ? "Mettez à jour cet outil OSS." : "Ajoutez un outil OSS au carrousel."}
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
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-none"
            />
          </div>
        </div>

        {/* Image & Link */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Image et lien
          </h4>

          <ImageUpload
            value={form.image}
            onChange={(url) => set("image", url)}
            section="tools"
            label="Image"
            placeholder="/misland.jpg"
          />

          <div className="mt-4 mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Lien de l’outil
            </label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              placeholder="https://..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Ordre d’affichage
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
              className="w-full max-w-32 px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-ink/5 pt-5 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/tools")}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
