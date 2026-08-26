import { useRef, useState } from "react";
import { uploadFile } from "../../api/auth";
import { useAuth } from "../../context/auth";
import { Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  /** Current image URL/path (from form state) */
  value: string;
  /** Called when a new image URL is set (after upload) */
  onChange: (url: string) => void;
  /** Upload section: hero, fields, tools, partners, socials */
  section: string;
  /** Label text */
  label?: string;
  /** Placeholder text for the URL input */
  placeholder?: string;
  /** Accept attribute for the file input */
  accept?: string;
  /** Whether to show object-contain instead of object-cover (for logos) */
  contain?: boolean;
  /** Preview width class */
  previewWidth?: string;
  /** Preview height class */
  previewHeight?: string;
}

export default function ImageUpload({
  value,
  onChange,
  section,
  label = "Image",
  placeholder = "/hero.jpg",
  accept = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml",
  contain = false,
  previewWidth = "w-24",
  previewHeight = "h-16",
}: ImageUploadProps) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setError("");
    try {
      const result = await uploadFile(token, section, file);
      onChange(result.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="admin-upload-field">
      <label className="mb-2 block text-sm font-medium text-ink/80">
        {label}
      </label>

      <div className="admin-upload-control">
        <div
          className={`admin-upload-preview ${previewWidth} ${previewHeight} group`}
        >
          {value ? (
            <>
              <img
                src={value}
                alt=""
                className={`w-full h-full ${contain ? "object-contain p-1" : "object-cover"}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-[#12355b]/85 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="Supprimer l’image"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-[11px] text-ink/35"><ImageIcon className="h-5 w-5" strokeWidth={1.6} />Aucune image</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="admin-upload-button"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? "Importation..." : "Importer"}
            </button>
            <span className="admin-upload-hint">ou saisir une URL</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Manual URL input */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="admin-upload-url"
            placeholder={placeholder}
          />

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
