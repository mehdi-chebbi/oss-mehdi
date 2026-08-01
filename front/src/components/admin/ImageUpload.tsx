import { useRef, useState } from "react";
import { uploadFile } from "../../api/auth";
import { useAuth } from "../../context/auth";
import { Upload, X, Loader2 } from "lucide-react";

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
    <div>
      <label className="block text-sm font-medium text-ink/80 mb-1.5">
        {label}
      </label>

      {/* Preview + upload area */}
      <div className="flex items-start gap-3">
        {/* Thumbnail preview */}
        <div
          className={`${previewWidth} ${previewHeight} rounded-lg overflow-hidden bg-ink/5 flex-shrink-0 flex items-center justify-center relative group`}
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
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <span className="text-ink/20 text-xs">No img</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* File upload button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#489e42]/10 hover:bg-[#489e42]/20 text-[#489e42] font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <span className="text-xs text-ink/40">or enter URL manually</span>
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
            className="w-full px-3 py-2 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink text-sm"
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
