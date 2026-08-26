import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import { listHero, createHero, updateHero } from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import { Globe, Loader2 } from "lucide-react";

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
  subtitle_fr: "",
  subtitle_en: "",
  cta_primary_label_fr: "",
  cta_primary_label_en: "",
  cta_primary_link: "#",
  cta_secondary_label_fr: "",
  cta_secondary_label_en: "",
  cta_secondary_link: "#",
  background_image: "/hero.jpg",
};

export default function AdminHero() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState<Lang>("fr");

  const { data: heroes, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["hero"],
    queryFn: () => listHero(token!),
    enabled: !!token,
  });

  const hero = heroes?.[0] || null;

  // Populate form fields once the hero data is available.
  useEffect(() => {
    if (hero) {
      setForm({
        page_id: hero.page_id,
        title_fr: hero.title_fr,
        title_en: hero.title_en,
        subtitle_fr: hero.subtitle_fr,
        subtitle_en: hero.subtitle_en,
        cta_primary_label_fr: hero.cta_primary_label_fr,
        cta_primary_label_en: hero.cta_primary_label_en,
        cta_primary_link: hero.cta_primary_link,
        cta_secondary_label_fr: hero.cta_secondary_label_fr,
        cta_secondary_label_en: hero.cta_secondary_label_en,
        cta_secondary_link: hero.cta_secondary_link,
        background_image: hero.background_image,
      });
    }
  }, [hero]);

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (hero) {
        await updateHero(token, hero.id, form);
      } else {
        await createHero(token, form);
      }
      queryClient.invalidateQueries({ queryKey: ["hero"] });
      setSuccess("Bannière enregistrée avec succès.");
      setTimeout(() => setSuccess(""), 3000);
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink">Bannière principale</h2>
        <p className="text-ink/50 text-sm mt-1">Modifiez la bannière principale de la page d’accueil.</p>
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

          {/* Subtitle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Sous-titre ({lang.toUpperCase()})
            </label>
            <textarea
              value={lang === "fr" ? form.subtitle_fr : form.subtitle_en}
              onChange={(e) => set(lang === "fr" ? "subtitle_fr" : "subtitle_en", e.target.value)}
              required
              rows={2}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-none"
            />
          </div>

          {/* CTA Primary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Libellé du bouton principal ({lang.toUpperCase()})
              </label>
              <input
                type="text"
                value={lang === "fr" ? form.cta_primary_label_fr : form.cta_primary_label_en}
                onChange={(e) =>
                  set(lang === "fr" ? "cta_primary_label_fr" : "cta_primary_label_en", e.target.value)
                }
                required
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Lien du bouton principal
              </label>
              <input
                type="text"
                value={form.cta_primary_link}
                onChange={(e) => set("cta_primary_link", e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>
          </div>

          {/* CTA Secondary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Libellé du bouton secondaire ({lang.toUpperCase()})
              </label>
              <input
                type="text"
                value={lang === "fr" ? form.cta_secondary_label_fr : form.cta_secondary_label_en}
                onChange={(e) =>
                  set(lang === "fr" ? "cta_secondary_label_fr" : "cta_secondary_label_en", e.target.value)
                }
                required
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Lien du bouton secondaire
              </label>
              <input
                type="text"
                value={form.cta_secondary_link}
                onChange={(e) => set("cta_secondary_link", e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>
          </div>
        </div>

        {/* Background image */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Image d’arrière-plan
          </h4>
          <ImageUpload
            value={form.background_image}
            onChange={(url) => set("background_image", url)}
            section="hero"
            label="Image d’arrière-plan"
            placeholder="/hero.jpg"
          />
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
        </div>
      </div>
    </div>
  );
}
