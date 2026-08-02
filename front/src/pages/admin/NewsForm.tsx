import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  getNews,
  createNews,
  updateNews,
} from "../../api/auth";
import MultiImageUpload from "../../components/admin/MultiImageUpload";
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
  title_fr: "",
  title_en: "",
  body_fr: "",
  body_en: "",
  images: [] as string[],
  thumbnail_index: 0,
  date: new Date().toISOString().slice(0, 10),
  is_published: false,
};

export default function NewsForm() {
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

  const loadArticle = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const article = await getNews(token, Number(id));
      if (article) {
        setForm({
          title_fr: article.title_fr || "",
          title_en: article.title_en || "",
          body_fr: article.body_fr || "",
          body_en: article.body_en || "",
          images: Array.isArray(article.images) ? article.images : [],
          thumbnail_index: article.thumbnail_index ?? 0,
          date: article.date ? new Date(article.date).toISOString().slice(0, 10) : emptyForm.date,
          is_published: article.is_published ?? false,
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
      loadArticle();
    }
  }, [loadArticle, isEditing]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (isEditing && id) {
        await updateNews(token, Number(id), form);
      } else {
        await createNews(token, form);
      }
      setSuccess("Article saved successfully!");
      setTimeout(() => navigate("/admin/news"), 800);
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
          onClick={() => navigate("/admin/news")}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to News
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Edit Article" : "New Article"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing
            ? "Update this news article"
            : "Add a new news article — it will be available at /news/:slug once published"}
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

          {/* Body */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Body ({lang.toUpperCase()}) — plain text, blank line separates paragraphs
            </label>
            <textarea
              value={lang === "fr" ? form.body_fr : form.body_en}
              onChange={(e) => set(lang === "fr" ? "body_fr" : "body_en", e.target.value)}
              rows={10}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-y font-mono text-sm"
              placeholder="Write the full article here…"
            />
          </div>
        </div>

        {/* Image & settings */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Image & Settings
          </h4>

          <MultiImageUpload
            value={form.images}
            thumbnailIndex={form.thumbnail_index}
            onChange={(urls, thumbIdx) => {
              set("images", urls);
              set("thumbnail_index", thumbIdx);
            }}
            section="news"
            label="Article images"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Publication date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>
        </div>

        {/* Slug info (only when editing) */}
        {isEditing && (
          <div className="border-t border-ink/5 pt-5">
            <div className="flex items-start gap-2 text-sm text-ink/50 bg-ink/5 px-4 py-3 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink/70">URL slug</p>
                <p className="mt-0.5">
                  The article is available at <code className="bg-white px-1.5 py-0.5 rounded text-xs">/news/:slug</code>.
                  The slug is auto-generated and cannot be changed (stable URLs for SEO).
                </p>
              </div>
            </div>
          </div>
        )}

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
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
