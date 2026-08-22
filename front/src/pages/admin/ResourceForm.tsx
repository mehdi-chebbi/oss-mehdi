import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Download, FileText, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  RESOURCE_DOCUMENT_TYPES,
  RESOURCE_FIELDS,
  getResource,
  resourceFieldLabel,
  resourceTypeLabel,
  updateResource,
  type ResourceDocumentType,
  type ResourceField,
} from "../../api/auth";
import { useAuth } from "../../context/auth";

type EditForm = {
  title_fr: string;
  title_en: string;
  summary_fr: string;
  summary_en: string;
  document_type: ResourceDocumentType;
  fields: ResourceField[];
  publication_date: string;
  is_published: boolean;
  file_fr_path: string | null;
  file_fr_original_name: string | null;
  file_en_path: string | null;
  file_en_original_name: string | null;
  cover_image_path: string;
  cover_is_custom: boolean;
};

const emptyForm: EditForm = {
  title_fr: "",
  title_en: "",
  summary_fr: "",
  summary_en: "",
  document_type: "report",
  fields: [],
  publication_date: "",
  is_published: false,
  file_fr_path: null,
  file_fr_original_name: null,
  file_en_path: null,
  file_en_original_name: null,
  cover_image_path: "",
  cover_is_custom: false,
};

const inputClass = "w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-[#489e42] focus:ring-2 focus:ring-[#489e42]/15";

export default function ResourceForm() {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [replacementFr, setReplacementFr] = useState<File | null>(null);
  const [replacementEn, setReplacementEn] = useState<File | null>(null);
  const [newCover, setNewCover] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
  const [removeFr, setRemoveFr] = useState(false);
  const [removeEn, setRemoveEn] = useState(false);
  const [removeCustomCover, setRemoveCustomCover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const resource = await getResource(token, id);
      setForm({
        title_fr: resource.title_fr,
        title_en: resource.title_en,
        summary_fr: resource.summary_fr,
        summary_en: resource.summary_en,
        document_type: resource.document_type,
        fields: resource.fields,
        publication_date: resource.publication_date.slice(0, 10),
        is_published: resource.is_published,
        file_fr_path: resource.file_fr_path,
        file_fr_original_name: resource.file_fr_original_name,
        file_en_path: resource.file_en_path,
        file_en_original_name: resource.file_en_original_name,
        cover_image_path: resource.cover_image_path,
        cover_is_custom: resource.cover_is_custom,
      });
    } catch (loadError: any) {
      setError(loadError.message || "Could not load this resource.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!newCover) {
      setNewCoverPreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(newCover);
    setNewCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [newCover]);

  const set = <K extends keyof EditForm>(key: K, value: EditForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const toggleField = (field: ResourceField) => {
    set("fields", form.fields.includes(field) ? form.fields.filter((item) => item !== field) : [...form.fields, field]);
  };

  const save = async () => {
    if (!token || !id) return;
    if (!form.title_fr.trim() || !form.title_en.trim()) {
      setError("French and English titles are required.");
      return;
    }
    if (!form.publication_date || form.fields.length === 0) {
      setError("Publication date and at least one field are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = new FormData();
      data.set("title_fr", form.title_fr.trim());
      data.set("title_en", form.title_en.trim());
      data.set("summary_fr", form.summary_fr.trim());
      data.set("summary_en", form.summary_en.trim());
      data.set("document_type", form.document_type);
      data.set("fields", JSON.stringify(form.fields));
      data.set("publication_date", form.publication_date);
      data.set("is_published", String(form.is_published));
      data.set("remove_file_fr", String(removeFr));
      data.set("remove_file_en", String(removeEn));
      data.set("remove_custom_cover", String(removeCustomCover));
      if (replacementFr) data.set("file_fr", replacementFr);
      if (replacementEn) data.set("file_en", replacementEn);
      if (newCover) data.set("cover", newCover);

      const updated = await updateResource(token, id, data);
      setForm((current) => ({
        ...current,
        file_fr_path: updated.file_fr_path,
        file_fr_original_name: updated.file_fr_original_name,
        file_en_path: updated.file_en_path,
        file_en_original_name: updated.file_en_original_name,
        cover_image_path: updated.cover_image_path,
        cover_is_custom: updated.cover_is_custom,
      }));
      setReplacementFr(null);
      setReplacementEn(null);
      setNewCover(null);
      setRemoveFr(false);
      setRemoveEn(false);
      setRemoveCustomCover(false);
      setSuccess("Resource saved successfully.");
    } catch (saveError: any) {
      setError(saveError.message || "Could not save this resource.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ink/30" /></div>;

  return (
    <div className="max-w-5xl p-8">
      <button type="button" onClick={() => navigate("/admin/resources")} className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to resources
      </button>
      <h1 className="text-2xl font-bold text-ink">Edit resource</h1>
      <p className="mt-1 text-sm text-ink/50">Update metadata, replace PDFs, or provide a custom cover.</p>

      {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-6 rounded-lg border border-[#489e42]/20 bg-[#489e42]/10 px-4 py-3 text-sm text-[#3d8a37]">{success}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6 rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
          <section className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-ink/75">French title *
              <input value={form.title_fr} onChange={(event) => set("title_fr", event.target.value)} className={`mt-1.5 ${inputClass}`} />
            </label>
            <label className="text-sm font-medium text-ink/75">English title *
              <input value={form.title_en} onChange={(event) => set("title_en", event.target.value)} className={`mt-1.5 ${inputClass}`} />
            </label>
            <label className="text-sm font-medium text-ink/75">French summary
              <textarea rows={5} value={form.summary_fr} onChange={(event) => set("summary_fr", event.target.value)} className={`mt-1.5 resize-y ${inputClass}`} />
            </label>
            <label className="text-sm font-medium text-ink/75">English summary
              <textarea rows={5} value={form.summary_en} onChange={(event) => set("summary_en", event.target.value)} className={`mt-1.5 resize-y ${inputClass}`} />
            </label>
          </section>

          <section className="grid gap-4 border-t border-ink/10 pt-5 md:grid-cols-2">
            <label className="text-sm font-medium text-ink/75">Document type *
              <select value={form.document_type} onChange={(event) => set("document_type", event.target.value as ResourceDocumentType)} className={`mt-1.5 ${inputClass}`}>
                {RESOURCE_DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{resourceTypeLabel(type, "en")}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-ink/75">Publication date *
              <input type="date" value={form.publication_date} onChange={(event) => set("publication_date", event.target.value)} className={`mt-1.5 ${inputClass}`} />
            </label>
            <fieldset className="md:col-span-2">
              <legend className="mb-2 text-sm font-medium text-ink/75">Fields *</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {RESOURCE_FIELDS.map((field) => (
                  <label key={field} className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm text-ink/65">
                    <input type="checkbox" checked={form.fields.includes(field)} onChange={() => toggleField(field)} className="accent-[#489e42]" />
                    {resourceFieldLabel(field, "en")}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="grid gap-5 border-t border-ink/10 pt-5 md:grid-cols-2">
            {(["fr", "en"] as const).map((language) => {
              const currentPath = language === "fr" ? form.file_fr_path : form.file_en_path;
              const currentName = language === "fr" ? form.file_fr_original_name : form.file_en_original_name;
              const replacement = language === "fr" ? replacementFr : replacementEn;
              const removing = language === "fr" ? removeFr : removeEn;
              return (
                <div key={language} className="rounded-lg border border-ink/10 p-4">
                  <h3 className="text-sm font-bold text-ink">{language === "fr" ? "French PDF" : "English PDF"}</h3>
                  {currentPath && !removing ? (
                    <a href={currentPath} download className="mt-2 flex items-center gap-2 break-all text-xs font-semibold text-[#0072bc] hover:underline"><Download className="h-3.5 w-3.5 flex-shrink-0" /> {currentName}</a>
                  ) : <p className="mt-2 text-xs text-ink/40">No current file</p>}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="mt-3 block w-full text-xs text-ink/55 file:mr-2 file:rounded file:border-0 file:bg-ink/5 file:px-2 file:py-1.5 file:text-xs file:font-semibold"
                    onChange={(event) => language === "fr" ? setReplacementFr(event.target.files?.[0] || null) : setReplacementEn(event.target.files?.[0] || null)}
                  />
                  {replacement && <p className="mt-2 truncate text-xs text-[#489e42]">Replacement: {replacement.name}</p>}
                  {currentPath && (
                    <label className="mt-3 flex items-center gap-2 text-xs text-red-600">
                      <input type="checkbox" checked={removing} onChange={(event) => language === "fr" ? setRemoveFr(event.target.checked) : setRemoveEn(event.target.checked)} /> Remove current file
                    </label>
                  )}
                </div>
              );
            })}
          </section>

          <label className="flex items-center gap-2 border-t border-ink/10 pt-5 text-sm font-medium text-ink/70">
            <input type="checkbox" checked={form.is_published} onChange={(event) => set("is_published", event.target.checked)} className="accent-[#489e42]" />
            Published and visible in the public library
          </label>
        </div>

        <aside className="h-fit rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink"><ImageIcon className="h-4 w-4 text-[#0072bc]" /> Cover image</h2>
          <div className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-[#103b5c]">
            {newCoverPreview ? <img src={newCoverPreview} alt="New cover preview" className="h-full w-full object-contain" /> : form.cover_image_path ? <img src={form.cover_image_path} alt="Current cover" className="h-full w-full object-contain" /> : <FileText className="h-9 w-9 text-white/30" />}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink/45">{form.cover_is_custom ? "A custom cover is currently in use." : "This cover was generated from the first available PDF page."}</p>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setNewCover(event.target.files?.[0] || null); setRemoveCustomCover(false); }} className="mt-4 block w-full text-xs text-ink/55 file:mr-2 file:rounded file:border-0 file:bg-ink/5 file:px-2 file:py-1.5 file:text-xs file:font-semibold" />
          {form.cover_is_custom && (
            <label className="mt-3 flex items-center gap-2 text-xs text-red-600">
              <input type="checkbox" checked={removeCustomCover} onChange={(event) => { setRemoveCustomCover(event.target.checked); if (event.target.checked) setNewCover(null); }} /> Remove custom cover and regenerate
            </label>
          )}
        </aside>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#489e42] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3d8a37] disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
