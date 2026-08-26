import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  listFields,
  getField,
  createField,
  updateField,
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
  gradient_hue: 120,
  sort_order: 0,
};

export default function FieldForm() {
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

  const loadField = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const field = await getField(token, Number(id));
      if (field) {
        setForm({
          page_id: field.page_id,
          title_fr: field.title_fr,
          title_en: field.title_en,
          description_fr: field.description_fr,
          description_en: field.description_en,
          image: field.image,
          gradient_hue: field.gradient_hue,
          sort_order: field.sort_order,
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
      loadField();
    } else {
      // Set default sort_order based on current count
      if (token) {
        listFields(token).then((fields) => {
          setForm((f) => ({ ...f, sort_order: fields.length }));
        });
      }
    }
  }, [loadField, isEditing, token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (isEditing && id) {
        await updateField(token, Number(id), form);
      } else {
        await createField(token, form);
      }
      setSuccess("Domaine enregistré avec succès.");
      setTimeout(() => navigate("/admin/fields"), 800);
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
          onClick={() => navigate("/admin/fields")}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux domaines
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Modifier le domaine" : "Nouveau domaine"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing ? "Mettez à jour cette carte de domaine." : "Ajoutez une carte de domaine à la page d’accueil."}
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

        {/* Image & settings */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Image et paramètres
          </h4>

          <ImageUpload
            value={form.image}
            onChange={(url) => set("image", url)}
            section="fields"
            label="Image"
            placeholder="/terre.jpg"
          />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Couleur du dégradé
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 h-10 rounded-lg overflow-hidden border border-ink/10 cursor-pointer">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to right, hsl(0,60%,45%), hsl(60,60%,45%), hsl(120,60%,45%), hsl(180,60%,45%), hsl(240,60%,45%), hsl(300,60%,45%), hsl(360,60%,45%))",
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={form.gradient_hue}
                    onChange={(e) => set("gradient_hue", Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1.5 -translate-x-1/2 pointer-events-none"
                    style={{
                      left: `${(form.gradient_hue / 360) * 100}%`,
                      backgroundColor: "white",
                      boxShadow: "0 0 0 2px rgba(0,0,0,0.3), 0 0 6px rgba(0,0,0,0.2)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 border-2 border-white shadow-md"
                  style={{ backgroundColor: `hsl(${form.gradient_hue}, 60%, 45%)` }}
                />
              </div>
            </div>
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
            onClick={() => navigate("/admin/fields")}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
