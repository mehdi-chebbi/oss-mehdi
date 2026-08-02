import { useRef, useState } from "react";
import { uploadFile } from "../../api/auth";
import { useAuth } from "../../context/auth";
import { Upload, X, Loader2, Star, Plus } from "lucide-react";

interface MultiImageUploadProps {
  /** Current array of image URLs */
  value: string[];
  /** Index of the thumbnail image (0-based) */
  thumbnailIndex: number;
  /** Called when images change OR thumbnail_index changes */
  onChange: (urls: string[], thumbnailIndex: number) => void;
  /** Upload section (folder name) */
  section: string;
  /** Label text */
  label?: string;
  /** Accept attribute for the file input */
  accept?: string;
}

/**
 * Multi-image uploader for the News form.
 * - Supports selecting multiple files at once (sequential upload).
 * - Each image can be removed (× on hover).
 * - One image is marked as the "thumbnail" (used on cards). Click the star
 *   badge on any image to set it as the thumbnail.
 * - Removing the thumbnail image resets thumbnail_index to 0.
 * - Removing an image before the thumbnail decrements thumbnail_index so the
 *   same image stays selected.
 */
export default function MultiImageUpload({
  value,
  thumbnailIndex,
  onChange,
  section,
  label = "Images",
  accept = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml",
}: MultiImageUploadProps) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !token) return;

    setUploading(true);
    setError("");
    try {
      // Upload sequentially — avoids overwhelming the server and preserves order.
      const newUrls: string[] = [];
      for (const file of files) {
        const result = await uploadFile(token, section, file);
        newUrls.push(result.url);
      }
      onChange([...value, ...newUrls], thumbnailIndex);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    let nextThumb = thumbnailIndex;
    if (index === thumbnailIndex) {
      // Removed the thumbnail — reset to 0
      nextThumb = 0;
    } else if (index < thumbnailIndex) {
      // Removed an image before the thumbnail — shift index down
      nextThumb = thumbnailIndex - 1;
    }
    onChange(next, nextThumb);
  };

  const handleSetThumbnail = (index: number) => {
    onChange(value, index);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-ink/80 mb-1.5">
        {label}
        {value.length > 0 && (
          <span className="ml-2 text-xs text-ink/40">
            {value.length} image{value.length !== 1 ? "s" : ""}
          </span>
        )}
      </label>

      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {value.map((url, i) => (
            <div
              key={i}
              className={`relative group rounded-lg overflow-hidden bg-ink/5 aspect-[4/3] flex items-center justify-center border-2 transition-colors ${
                i === thumbnailIndex
                  ? "border-[#489e42]"
                  : "border-transparent"
              }`}
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              {/* Thumbnail badge (always visible if selected, else on hover) */}
              <button
                type="button"
                onClick={() => handleSetThumbnail(i)}
                className={`absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  i === thumbnailIndex
                    ? "bg-[#489e42] text-white opacity-100"
                    : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-[#489e42]"
                }`}
                title={i === thumbnailIndex ? "Thumbnail" : "Set as thumbnail"}
              >
                <Star className="w-2.5 h-2.5" fill={i === thumbnailIndex ? "currentColor" : "none"} />
                {i === thumbnailIndex ? "Thumb" : "Set"}
              </button>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#489e42]/10 hover:bg-[#489e42]/20 text-[#489e42] font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : value.length === 0 ? (
            <Upload className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          {uploading
            ? "Uploading…"
            : value.length === 0
              ? "Upload images"
              : "Add more"}
        </button>
        {value.length === 0 && (
          <span className="text-xs text-ink/40">
            You can select multiple files at once
          </span>
        )}
        {value.length > 0 && (
          <span className="text-xs text-ink/40">
            Click <Star className="inline w-2.5 h-2.5" /> to pick the thumbnail (shown on cards)
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
