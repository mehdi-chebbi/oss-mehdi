import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Save } from "lucide-react";
import {
  getHomepagePublication,
  saveHomepagePublication,
} from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import { useAuth } from "../../context/auth";

type Lang = "fr" | "en";

const emptyForm = {
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  image_url: "",
  url_fr: "",
  url_en: "",
};

export default function AdminHomepagePublication() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<Lang>("fr");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["homepage-publication"],
    queryFn: getHomepagePublication,
  });

  useEffect(() => {
    if (data) {
      setForm({
        title_fr: data.title_fr,
        title_en: data.title_en,
        description_fr: data.description_fr,
        description_en: data.description_en,
        image_url: data.image_url,
        url_fr: data.url_fr || "",
        url_en: data.url_en || "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const set = (key: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!token) return;

    if (
      !form.title_fr.trim() ||
      !form.title_en.trim() ||
      !form.description_fr.trim() ||
      !form.description_en.trim() ||
      !form.image_url.trim()
    ) {
      setError("Les titres, les descriptions et l’image sont obligatoires.");
      return;
    }
    if (!form.url_fr.trim() && !form.url_en.trim()) {
      setError("Ajoutez au moins un lien français ou anglais.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const saved = await saveHomepagePublication(token, {
        title_fr: form.title_fr.trim(),
        title_en: form.title_en.trim(),
        description_fr: form.description_fr.trim(),
        description_en: form.description_en.trim(),
        image_url: form.image_url.trim(),
        url_fr: form.url_fr.trim() || null,
        url_en: form.url_en.trim() || null,
      });
      setForm({
        title_fr: saved.title_fr,
        title_en: saved.title_en,
        description_fr: saved.description_fr,
        description_en: saved.description_en,
        image_url: saved.image_url,
        url_fr: saved.url_fr || "",
        url_en: saved.url_en || "",
      });
      await queryClient.invalidateQueries({ queryKey: ["homepage-publication"] });
      setSuccess("Publication récente enregistrée avec succès.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink/30" />
      </div>
    );
  }

  const titleKey = lang === "fr" ? "title_fr" : "title_en";
  const descriptionKey = lang === "fr" ? "description_fr" : "description_en";
  const urlKey = lang === "fr" ? "url_fr" : "url_en";

  return (
    <div className="max-w-3xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink">Publication récente</h2>
        <p className="mt-1 text-sm text-ink/50">
          Configurez la publication présentée à gauche de la vidéo sur la page d’accueil.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-[#489e42]/20 bg-[#489e42]/10 px-4 py-3 text-sm text-[#3d8a37]">
          {success}
        </div>
      )}

      <div className="space-y-6 rounded-xl border border-ink/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-ink/70">Langue du contenu :</span>
          <div className="flex overflow-hidden rounded-lg border border-ink/10">
            {(["fr", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLang(item)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                  lang === item
                    ? "bg-[#489e42] text-white"
                    : "bg-white text-ink/60 hover:bg-ink/5"
                }`}
              >
                <Globe className="h-3.5 w-3.5" /> {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5 border-t border-ink/5 pt-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">
              Titre ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={form[titleKey]}
              onChange={(event) => set(titleKey, event.target.value)}
              className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#489e42]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">
              Brève description ({lang.toUpperCase()})
            </label>
            <textarea
              value={form[descriptionKey]}
              onChange={(event) => set(descriptionKey, event.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-ink/15 px-4 py-2.5 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#489e42]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">
              Lien de consultation ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={form[urlKey]}
              onChange={(event) => set(urlKey, event.target.value)}
              placeholder={lang === "fr" ? "Lien vers la version française" : "Lien vers la version anglaise"}
              className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#489e42]"
            />
            <p className="mt-2 text-xs text-ink/45">
              Ce champ peut rester vide si la publication n’existe pas dans cette langue.
            </p>
          </div>
        </div>

        <div className="border-t border-ink/5 pt-5">
          <ImageUpload
            value={form.image_url}
            onChange={(url) => set("image_url", url)}
            section="publications"
            label="Image de la publication"
            placeholder="/uploads/publications/couverture.jpg"
            contain
            previewWidth="w-28"
            previewHeight="h-36"
          />
        </div>

        <div className="border-t border-ink/5 pt-5">
          <p className="mb-4 text-xs text-ink/45">
            Au moins un lien de consultation FR ou EN est obligatoire. Si la langue active n’a pas de lien, le site utilisera automatiquement l’autre version.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#489e42] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#3d8a37] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
