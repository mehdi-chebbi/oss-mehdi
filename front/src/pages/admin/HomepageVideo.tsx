import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileVideo, Globe, Image, Loader2, Upload, X } from "lucide-react";
import {
  getHomepageVideo,
  saveHomepageVideo,
  uploadFile,
} from "../../api/auth";
import { useAuth } from "../../context/auth";

type Lang = "fr" | "en";

const emptyForm = {
  title_fr: "",
  title_en: "",
  video_url: "",
  poster_url: "",
};

export default function AdminHomepageVideo() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<Lang>("fr");
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["homepage-video"],
    queryFn: getHomepageVideo,
  });

  useEffect(() => {
    if (data) {
      setForm({
        title_fr: data.title_fr,
        title_en: data.title_en,
        video_url: data.video_url,
        poster_url: data.poster_url,
      });
    }
  }, [data]);

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const pickVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVideoFile(file);
    event.target.value = "";
  };

  const pickPoster = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPosterFile(file);
    event.target.value = "";
  };

  const handleSave = async () => {
    if (!token) return;
    const titleFr = form.title_fr.trim();
    const titleEn = form.title_en.trim();
    if (!titleFr || !titleEn) {
      setError("Les titres français et anglais sont obligatoires.");
      return;
    }
    if (!form.video_url && !videoFile) {
      setError("Sélectionnez une vidéo MP4 ou WebM.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let videoUrl = form.video_url;
      let posterUrl = form.poster_url;

      if (videoFile) {
        const uploadedVideo = await uploadFile(token, "videos", videoFile);
        videoUrl = uploadedVideo.url;
      }
      if (posterFile) {
        const uploadedPoster = await uploadFile(token, "videos", posterFile);
        posterUrl = uploadedPoster.url;
      }

      const saved = await saveHomepageVideo(token, {
        title_fr: titleFr,
        title_en: titleEn,
        video_url: videoUrl,
        poster_url: posterUrl,
      });
      setForm({
        title_fr: saved.title_fr,
        title_en: saved.title_en,
        video_url: saved.video_url,
        poster_url: saved.poster_url,
      });
      setVideoFile(null);
      setPosterFile(null);
      await queryClient.invalidateQueries({ queryKey: ["homepage-video"] });
      setSuccess("Vidéo de la page d’accueil enregistrée avec succès.");
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

  const activeTitle = lang === "fr" ? form.title_fr : form.title_en;

  return (
    <div className="max-w-3xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink">Vidéo de la page d’accueil</h2>
        <p className="mt-1 text-sm text-ink/50">
          Configurez la vidéo présentée dans la section Publications et vidéos.
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

        <div className="border-t border-ink/5 pt-5">
          <label className="mb-1.5 block text-sm font-medium text-ink/80">
            Titre ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={activeTitle}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                [lang === "fr" ? "title_fr" : "title_en"]: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#489e42]"
          />
        </div>

        <div className="border-t border-ink/5 pt-5">
          <label className="mb-2 block text-sm font-medium text-ink/80">Fichier vidéo</label>
          {form.video_url && !videoFile && (
            <video
              src={form.video_url}
              poster={form.poster_url || undefined}
              controls
              preload="metadata"
              className="mb-4 aspect-video w-full bg-[#12355b] object-contain"
            />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={saving}
              className="admin-upload-button"
            >
              <FileVideo className="h-4 w-4" />
              {form.video_url || videoFile ? "Remplacer la vidéo" : "Importer une vidéo"}
            </button>
            <span className="text-xs text-ink/45">MP4 ou WebM, 250 Mo maximum</span>
          </div>
          {videoFile && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-ink/[0.035] px-3 py-2 text-sm text-ink/70">
              <span className="min-w-0 truncate">{videoFile.name}</span>
              <button type="button" onClick={() => setVideoFile(null)} className="ml-3 text-ink/40 hover:text-red-600" title="Annuler la sélection">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={pickVideo} className="hidden" />
        </div>

        <div className="border-t border-ink/5 pt-5">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <label className="block text-sm font-medium text-ink/80">Image de couverture (facultative)</label>
            <span className="text-xs text-ink/45">Format recommandé : 1920 × 1080 px (16:9)</span>
          </div>
          {form.poster_url && !posterFile && (
            <img src={form.poster_url} alt="Aperçu de la couverture" className="mb-4 h-40 w-full bg-ink/[0.035] object-contain" />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              disabled={saving}
              className="admin-upload-button"
            >
              <Image className="h-4 w-4" />
              {form.poster_url || posterFile ? "Remplacer la couverture" : "Ajouter une couverture"}
            </button>
            {(form.poster_url || posterFile) && (
              <button
                type="button"
                onClick={() => {
                  setPosterFile(null);
                  setForm((current) => ({ ...current, poster_url: "" }));
                }}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Supprimer
              </button>
            )}
          </div>
          {posterFile && <p className="mt-3 truncate text-sm text-ink/70">{posterFile.name}</p>}
          <input ref={posterInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPoster} className="hidden" />
        </div>

        <div className="border-t border-ink/5 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#489e42] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#3d8a37] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
