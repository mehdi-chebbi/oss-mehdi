import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  FilePlus2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  RESOURCE_DOCUMENT_TYPES,
  RESOURCE_FIELDS,
  createResource,
  deleteResource,
  listAllResources,
  resourceFieldLabel,
  resourceTypeLabel,
  retryResourceIndex,
  type ResourceData,
  type ResourceDocumentType,
  type ResourceField,
  type ResourceLanguage,
} from "../../api/auth";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { useAuth } from "../../context/auth";

type PendingUpload = {
  clientId: string;
  primaryFile: File;
  primaryLanguage: ResourceLanguage | "";
  translationFile: File | null;
  coverFile: File | null;
  title_fr: string;
  title_en: string;
  summary_fr: string;
  summary_en: string;
  document_type: ResourceDocumentType;
  fields: ResourceField[];
  publication_date: string;
  saving: boolean;
  error: string;
};

const inputClass = "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-[#489e42] focus:ring-2 focus:ring-[#489e42]/15";

function createPendingUpload(file: File): PendingUpload {
  return {
    clientId: crypto.randomUUID(),
    primaryFile: file,
    primaryLanguage: "",
    translationFile: null,
    coverFile: null,
    title_fr: "",
    title_en: "",
    summary_fr: "",
    summary_en: "",
    document_type: "report",
    fields: [],
    publication_date: new Date().toISOString().slice(0, 10),
    saving: false,
    error: "",
  };
}

function buildFormData(upload: PendingUpload) {
  if (!upload.primaryLanguage) throw new Error("Choisissez la langue du PDF sélectionné.");
  if (!upload.title_fr.trim() || !upload.title_en.trim()) throw new Error("Les titres français et anglais sont obligatoires.");
  if (!upload.publication_date) throw new Error("La date de publication est obligatoire.");
  if (upload.fields.length === 0) throw new Error("Sélectionnez au moins un domaine.");

  const data = new FormData();
  data.set("title_fr", upload.title_fr.trim());
  data.set("title_en", upload.title_en.trim());
  data.set("summary_fr", upload.summary_fr.trim());
  data.set("summary_en", upload.summary_en.trim());
  data.set("document_type", upload.document_type);
  data.set("fields", JSON.stringify(upload.fields));
  data.set("publication_date", upload.publication_date);
  data.set(upload.primaryLanguage === "fr" ? "file_fr" : "file_en", upload.primaryFile);
  if (upload.translationFile) {
    data.set(upload.primaryLanguage === "fr" ? "file_en" : "file_fr", upload.translationFile);
  }
  if (upload.coverFile) data.set("cover", upload.coverFile);
  return data;
}

function formatSize(bytes: number | null | undefined) {
  if (!bytes) return "";
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${Math.ceil(bytes / 1024)} Ko`;
}

export default function AdminResources() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [pageError, setPageError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ResourceData | null>(null);

  const { data: resources = [], isLoading, error: queryError } = useQuery({
    queryKey: ["resources"],
    queryFn: () => listAllResources(token!),
    enabled: Boolean(token),
    refetchInterval: (query) => query.state.data?.some((resource) => resource.index_status === "pending" || resource.index_status === "processing") ? 5_000 : false,
  });

  useEffect(() => {
    if (queryError) setPageError((queryError as Error).message);
  }, [queryError]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResource(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => retryResourceIndex(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });

  const patchPendingUpload = (clientId: string, patch: Partial<PendingUpload>) => {
    setPendingUploads((current) => current.map((upload) => upload.clientId === clientId ? { ...upload, ...patch } : upload));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const pdfs = Array.from(files).filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    setPendingUploads((current) => [...current, ...pdfs.map(createPendingUpload)]);
    if (fileInput.current) fileInput.current.value = "";
  };

  const savePendingUpload = async (clientId: string) => {
    const upload = pendingUploads.find((item) => item.clientId === clientId);
    if (!upload || !token) return false;
    patchPendingUpload(clientId, { saving: true, error: "" });
    try {
      await createResource(token, buildFormData(upload));
      setPendingUploads((current) => current.filter((item) => item.clientId !== clientId));
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
      return true;
    } catch (error: any) {
      patchPendingUpload(clientId, { saving: false, error: error.message || "Impossible d’enregistrer cette ressource." });
      return false;
    }
  };

  const saveAll = async () => {
    for (const upload of [...pendingUploads]) {
      await savePendingUpload(upload.clientId);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setPageError("");
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } catch (error: any) {
      setPageError(error.message || "Impossible de supprimer cette ressource.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-6xl p-8">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Ressources documentaires</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/50">
            Ajoutez des rapports, études, guides et autres documents publics. Une couverture est générée depuis la première page du PDF si vous n’en fournissez pas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-[#489e42] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3d8a37]"
        >
          <FilePlus2 className="h-4 w-4" /> Sélectionner des PDF
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {pageError && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div>}

      {pendingUploads.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-ink">Importations non enregistrées ({pendingUploads.length})</h2>
              <p className="mt-0.5 text-xs text-ink/45">Les fichiers restent sur votre ordinateur jusqu’à l’enregistrement de leur formulaire.</p>
            </div>
            <button
              type="button"
              onClick={saveAll}
              disabled={pendingUploads.some((upload) => upload.saving)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#489e42]/30 bg-[#489e42]/10 px-4 py-2 text-sm font-semibold text-[#3d8a37] hover:bg-[#489e42]/15 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Tout enregistrer
            </button>
          </div>

          <div className="space-y-5">
            {pendingUploads.map((upload, index) => (
              <div key={upload.clientId} className="rounded-xl border border-ink/10 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0072bc]/10 text-[#0072bc]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{upload.primaryFile.name}</p>
                    <p className="text-xs text-ink/40">Importation {index + 1} · {formatSize(upload.primaryFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingUploads((current) => current.filter((item) => item.clientId !== upload.clientId))}
                    disabled={upload.saving}
                    className="rounded-lg p-2 text-ink/35 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    title="Fermer et annuler cette importation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/75">Langue du PDF sélectionné *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["fr", "en"] as ResourceLanguage[]).map((language) => (
                          <button
                            key={language}
                            type="button"
                            onClick={() => patchPendingUpload(upload.clientId, { primaryLanguage: language, translationFile: null })}
                            className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${upload.primaryLanguage === language ? "border-[#489e42] bg-[#489e42]/10 text-[#3d8a37]" : "border-ink/15 text-ink/55 hover:border-ink/30"}`}
                          >
                            {language === "fr" ? "Français (FR)" : "Anglais (EN)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/75">Version dans l’autre langue</label>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        disabled={!upload.primaryLanguage}
                        onChange={(event) => patchPendingUpload(upload.clientId, { translationFile: event.target.files?.[0] || null })}
                        className="block w-full text-sm text-ink/55 file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink/65 hover:file:bg-ink/10 disabled:opacity-40"
                      />
                      <p className="mt-1 text-xs text-ink/40">
                        {upload.primaryLanguage ? `Joignez ici la traduction ${upload.primaryLanguage === "fr" ? "anglaise" : "française"}.` : "Choisissez d’abord la langue du PDF sélectionné."}
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/75">Couverture personnalisée (facultative)</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => patchPendingUpload(upload.clientId, { coverFile: event.target.files?.[0] || null })}
                        className="block w-full text-sm text-ink/55 file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink/65 hover:file:bg-ink/10"
                      />
                      <p className="mt-1 flex items-center gap-1 text-xs text-ink/40"><ImageIcon className="h-3.5 w-3.5" /> Sinon, elle sera générée automatiquement depuis la première page.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-medium text-ink/75">Type de document *
                        <select value={upload.document_type} onChange={(event) => patchPendingUpload(upload.clientId, { document_type: event.target.value as ResourceDocumentType })} className={`mt-1.5 ${inputClass}`}>
                          {RESOURCE_DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{resourceTypeLabel(type, "fr")}</option>)}
                        </select>
                      </label>
                      <label className="text-sm font-medium text-ink/75">Date de publication *
                        <input type="date" value={upload.publication_date} onChange={(event) => patchPendingUpload(upload.clientId, { publication_date: event.target.value })} className={`mt-1.5 ${inputClass}`} />
                      </label>
                    </div>

                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-ink/75">Domaines *</legend>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {RESOURCE_FIELDS.map((field) => (
                          <label key={field} className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm text-ink/65">
                            <input
                              type="checkbox"
                              checked={upload.fields.includes(field)}
                              onChange={() => patchPendingUpload(upload.clientId, { fields: upload.fields.includes(field) ? upload.fields.filter((item) => item !== field) : [...upload.fields, field] })}
                              className="accent-[#489e42]"
                            />
                            {resourceFieldLabel(field, "fr")}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-ink/75">Titre français *
                      <input value={upload.title_fr} onChange={(event) => patchPendingUpload(upload.clientId, { title_fr: event.target.value })} className={`mt-1.5 ${inputClass}`} />
                    </label>
                    <label className="block text-sm font-medium text-ink/75">Résumé français
                      <textarea rows={4} value={upload.summary_fr} onChange={(event) => patchPendingUpload(upload.clientId, { summary_fr: event.target.value })} className={`mt-1.5 resize-y ${inputClass}`} />
                    </label>
                    <label className="block text-sm font-medium text-ink/75">Titre anglais *
                      <input value={upload.title_en} onChange={(event) => patchPendingUpload(upload.clientId, { title_en: event.target.value })} className={`mt-1.5 ${inputClass}`} />
                    </label>
                    <label className="block text-sm font-medium text-ink/75">Résumé anglais
                      <textarea rows={4} value={upload.summary_en} onChange={(event) => patchPendingUpload(upload.clientId, { summary_en: event.target.value })} className={`mt-1.5 resize-y ${inputClass}`} />
                    </label>
                  </div>
                </div>

                {upload.error && <div className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{upload.error}</div>}
                <div className="flex justify-end border-t border-ink/10 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => savePendingUpload(upload.clientId)}
                    disabled={upload.saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#489e42] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d8a37] disabled:opacity-50"
                  >
                    {upload.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {upload.saving ? "Importation" : "Enregistrer la ressource"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#0072bc]" />
          <h2 className="font-bold text-ink">Ressources enregistrées</h2>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ink/30" /></div>
        ) : resources.length === 0 ? (
          <div className="rounded-xl border border-ink/10 bg-white p-10 text-center text-sm text-ink/45">Aucune ressource. Sélectionnez un ou plusieurs PDF pour commencer.</div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <article key={resource.id} className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
                <div className="flex h-20 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-ink/5">
                  {resource.cover_image_path ? <img src={resource.cover_image_path} alt="" className="h-full w-full object-cover" /> : <FileText className="h-5 w-5 text-ink/20" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{resource.title_fr}</p>
                  <p className="mt-0.5 truncate text-sm text-ink/50">{resource.title_en}</p>
                  <p className="mt-1 text-xs text-ink/40">{resourceTypeLabel(resource.document_type, "fr")} · {resource.publication_date.slice(0, 10)} · {resource.fields.map((field) => resourceFieldLabel(field, "fr")).join(", ")}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${
                      resource.index_status === "ready" ? "bg-[#489e42]/10 text-[#3d8a37]" :
                      resource.index_status === "failed" ? "bg-red-50 text-red-600" :
                      resource.index_status === "processing" ? "bg-[#0072bc]/10 text-[#0072bc]" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {resource.index_status === "ready" ? "Prête pour l’IA" : resource.index_status === "failed" ? "Échec de l’indexation" : resource.index_status === "processing" ? "Indexation en cours" : "Indexation en attente"}
                    </span>
                    {resource.index_error && <span className="max-w-xl truncate text-red-500" title={resource.index_error}>{resource.index_error}</span>}
                    {(resource.index_status === "failed" || resource.index_status === "ready") && (
                      <button
                        type="button"
                        disabled={retryMutation.isPending}
                        onClick={() => retryMutation.mutate(resource.id)}
                        className="inline-flex items-center gap-1 font-semibold text-[#0072bc] hover:underline disabled:opacity-40"
                      >
                        <RotateCcw className="h-3 w-3" /> Réindexer
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2 text-xs font-semibold">
                    {resource.file_fr_path && <a href={resource.file_fr_path} download className="inline-flex items-center gap-1 text-[#0072bc] hover:underline"><Download className="h-3 w-3" /> FR {formatSize(resource.file_fr_size)}</a>}
                    {resource.file_en_path && <a href={resource.file_en_path} download className="inline-flex items-center gap-1 text-[#0072bc] hover:underline"><Download className="h-3 w-3" /> EN {formatSize(resource.file_en_size)}</a>}
                  </div>
                </div>
                <button type="button" onClick={() => navigate(`/admin/resources/${resource.id}`)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-[#489e42]"><Pencil className="h-4 w-4" /> Modifier</button>
                <button type="button" onClick={() => setDeleteTarget(resource)} className="p-2 text-ink/30 hover:text-red-500" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </article>
            ))}
          </div>
        )}
      </section>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        message="Voulez-vous vraiment supprimer cette ressource et ses fichiers importés ?"
        itemName={deleteTarget?.title_fr}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
