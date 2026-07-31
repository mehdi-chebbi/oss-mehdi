import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/auth";
import { listHero, createHero, updateHero, type HeroData } from "../../api/auth";
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
  is_published: true,
};

export default function AdminHero() {
  const { token } = useAuth();
  const [hero, setHero] = useState<HeroData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState<Lang>("fr");

  const loadHero = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const heroes = await listHero(token);
      const h = heroes[0] || null;
      setHero(h);
      if (h) {
        setForm({
          page_id: h.page_id,
          title_fr: h.title_fr,
          title_en: h.title_en,
          subtitle_fr: h.subtitle_fr,
          subtitle_en: h.subtitle_en,
          cta_primary_label_fr: h.cta_primary_label_fr,
          cta_primary_label_en: h.cta_primary_label_en,
          cta_primary_link: h.cta_primary_link,
          cta_secondary_label_fr: h.cta_secondary_label_fr,
          cta_secondary_label_en: h.cta_secondary_label_en,
          cta_secondary_link: h.cta_secondary_link,
          background_image: h.background_image,
          is_published: h.is_published,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHero();
  }, [loadHero]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (hero) {
        await updateHero(token, hero.id, form);
      } else {
        const created = await createHero(token, form);
        setHero(created);
      }
      setSuccess("Hero saved successfully!");
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
        <h2 className="text-2xl font-bold text-ink">Hero</h2>
        <p className="text-ink/50 text-sm mt-1">Edit the hero banner on the home page</p>
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
          <span className="text-sm font-medium text-ink/70">Content language:</span>
          <LangTabs lang={lang} setLang={setLang} />
        </div>

        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            {lang === "fr" ? "French" : "English"} Content
          </h4>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Title ({lang.toUpperCase()})
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
              Subtitle ({lang.toUpperCase()})
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
                Primary CTA Label ({lang.toUpperCase()})
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
                Primary CTA Link
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
                Secondary CTA Label ({lang.toUpperCase()})
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
                Secondary CTA Link
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
            Background Image
          </h4>
          <div className="flex items-center gap-4">
            {form.background_image && (
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0">
                <img
                  src={form.background_image}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                value={form.background_image}
                onChange={(e) => set("background_image", e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
                placeholder="/hero.jpg"
              />
            </div>
          </div>
        </div>

        {/* Published toggle */}
        <div className="border-t border-ink/5 pt-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => set("is_published", e.target.checked)}
              className="w-5 h-5 rounded border-ink/20 text-[#489e42] focus:ring-[#489e42]"
            />
            <span className="text-sm font-medium text-ink/80">
              Published (visible on site)
            </span>
          </label>
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
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
