import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Link as LinkIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  uploadFile,
  type ProjectResultFile,
} from "../../api/auth";
import { useAuth } from "../../context/auth";

interface ProjectResultsFilesProps {
  value: ProjectResultFile[];
  onChange: (files: ProjectResultFile[]) => void;
}

const ACCEPTED_FILES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".csv",
  ".txt",
  ".zip",
].join(",");

function withoutExtension(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

function formatSize(size?: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function ProjectResultsFiles({
  value,
  onChange,
}: ProjectResultsFilesProps) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const update = (
    index: number,
    key: keyof ProjectResultFile,
    nextValue: string,
  ) => {
    onChange(
      value.map((file, i) =>
        i === index ? { ...file, [key]: nextValue } : file,
      ),
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length || !token) return;

    setUploading(true);
    setError("");
    try {
      const uploaded: ProjectResultFile[] = [];
      for (const file of selected) {
        const result = await uploadFile(token, "project-results", file);
        const label = withoutExtension(result.originalName);
        uploaded.push({
          name_fr: label,
          name_en: label,
          url: result.url,
          mime_type: result.mimeType,
          size: result.size,
        });
      }
      onChange([...value, ...uploaded]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addExternalFile = () => {
    onChange([
      ...value,
      {
        name_fr: "",
        name_en: "",
        url: "",
        mime_type: "",
      },
    ]);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink/80">
            Documents de résultat
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink/45">
            PDF, Word, Excel, PowerPoint, CSV, texte ou ZIP. Maximum 10 Mo par fichier.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#489e42]/10 px-3 py-2 text-sm font-medium text-[#397f35] transition-colors hover:bg-[#489e42]/20 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {uploading ? "Importation..." : "Importer des fichiers"}
          </button>
          <button
            type="button"
            onClick={addExternalFile}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-ink/65 transition-colors hover:border-ink/25 hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un lien
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILES}
        onChange={handleUpload}
        className="hidden"
      />

      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/15 px-5 py-7 text-center">
          <FileText className="mx-auto mb-2 h-5 w-5 text-ink/25" />
          <p className="text-sm text-ink/45">Aucun document de résultat ajouté.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((file, index) => (
            <div
              key={`${file.url}-${index}`}
              className="rounded-xl border border-ink/10 bg-ink/[0.015] p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-xs text-ink/45">
                  <FileText className="h-4 w-4 shrink-0 text-forest-700" />
                  <span className="truncate">
                    {file.mime_type || "Document lié"}
                    {formatSize(file.size) ? `, ${formatSize(file.size)}` : ""}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-md p-1.5 text-ink/40 hover:bg-white hover:text-ink disabled:opacity-25"
                    title="Déplacer vers le haut"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    className="rounded-md p-1.5 text-ink/40 hover:bg-white hover:text-ink disabled:opacity-25"
                    title="Déplacer vers le bas"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    className="rounded-md p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                    title="Supprimer le document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/65">
                    Nom affiché (FR)
                  </label>
                  <input
                    type="text"
                    value={file.name_fr}
                    onChange={(event) =>
                      update(index, "name_fr", event.target.value)
                    }
                    className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#489e42]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/65">
                    Nom affiché (EN)
                  </label>
                  <input
                    type="text"
                    value={file.name_en}
                    onChange={(event) =>
                      update(index, "name_en", event.target.value)
                    }
                    className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#489e42]"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-ink/65">
                  URL du fichier
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-ink/30" />
                  <input
                    type="text"
                    value={file.url}
                    onChange={(event) => update(index, "url", event.target.value)}
                    placeholder="https://... or /uploads/project-results/..."
                    className="w-full rounded-lg border border-ink/15 py-2 pr-3 pl-9 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#489e42]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
