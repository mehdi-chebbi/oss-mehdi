import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  listSocials,
  getSocial,
  createSocial,
  updateSocial,
} from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import { Loader2, ArrowLeft } from "lucide-react";

const emptyForm = {
  platform: "",
  url: "#",
  icon_svg: "",
  icon_file: "",
  sort_order: 0,
};

// Predefined SVG paths for common platforms
const presetIcons: Record<string, string> = {
  Facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  X: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  LinkedIn:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  YouTube:
    "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  Instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
};

export default function SocialForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSocial = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const social = await getSocial(token, Number(id));
      if (social) {
        setForm({
          platform: social.platform,
          url: social.url,
          icon_svg: social.icon_svg || "",
          icon_file: social.icon_file || "",
          sort_order: social.sort_order,
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
      loadSocial();
    } else {
      if (token) {
        listSocials(token).then((socials) => {
          setForm((f) => ({ ...f, sort_order: socials.length }));
        });
      }
    }
  }, [loadSocial, isEditing, token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (isEditing && id) {
        await updateSocial(token, Number(id), form);
      } else {
        await createSocial(token, form);
      }
      setSuccess("Social link saved!");
      setTimeout(() => navigate("/admin/socials"), 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  // Auto-fill icon_svg when platform matches a preset
  const handlePlatformChange = (value: string) => {
    set("platform", value);
    if (presetIcons[value] && !form.icon_svg && !form.icon_file) {
      set("icon_svg", presetIcons[value]);
    }
  };

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
          onClick={() => navigate("/admin/socials")}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Social Links
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Edit Social Link" : "New Social Link"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing ? "Update this social media link" : "Add a new social media link to the sidebar"}
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Platform
          </label>
          <input
            type="text"
            value={form.platform}
            onChange={(e) => handlePlatformChange(e.target.value)}
            required
            placeholder="e.g. Facebook, X, LinkedIn..."
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            URL
          </label>
          <input
            type="text"
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            required
            placeholder="https://..."
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
          />
        </div>

        {/* Icon: upload SVG file or use preset SVG path */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Icon
          </h4>

          <ImageUpload
            value={form.icon_file}
            onChange={(url) => set("icon_file", url)}
            section="socials"
            label="Upload SVG/Icon File"
            placeholder="/uploads/socials/icon.svg"
            accept="image/svg+xml,image/png,image/jpeg"
            contain
            previewWidth="w-12"
            previewHeight="h-12"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Or use SVG Path (preset icons auto-fill this)
            </label>
            <textarea
              value={form.icon_svg}
              onChange={(e) => set("icon_svg", e.target.value)}
              rows={3}
              placeholder="SVG path d attribute..."
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink font-mono text-xs resize-none"
            />
            {/* Live preview */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-ink/40">Preview:</span>
              <div className="w-8 h-8 flex items-center justify-center bg-[#489e42] rounded text-white">
                {form.icon_file ? (
                  <img src={form.icon_file} alt="" width="18" height="18" className="object-contain" />
                ) : form.icon_svg ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={form.icon_svg} />
                  </svg>
                ) : (
                  <span className="text-xs">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Sort Order
          </label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
            className="w-full max-w-32 px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
          />
        </div>

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
            onClick={() => navigate("/admin/socials")}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
