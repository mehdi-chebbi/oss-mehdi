import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
} from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import { Loader2, ArrowLeft } from "lucide-react";

const emptyForm = {
  page_id: 1,
  name: "",
  image: "",
  row_number: 1,
  sort_order: 0,
};

export default function PartnerForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPartner = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const partner = await getPartner(token, Number(id));
      if (partner) {
        setForm({
          page_id: partner.page_id,
          name: partner.name,
          image: partner.image,
          row_number: partner.row_number,
          sort_order: partner.sort_order,
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
      loadPartner();
    } else {
      if (token) {
        listPartners(token).then((partners) => {
          setForm((f) => ({ ...f, sort_order: partners.length }));
        });
      }
    }
  }, [loadPartner, isEditing, token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (isEditing && id) {
        await updatePartner(token, Number(id), form);
      } else {
        await createPartner(token, form);
      }
      setSuccess("Partenaire enregistré avec succès.");
      setTimeout(() => navigate("/admin/partners"), 800);
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
          onClick={() => navigate("/admin/partners")}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux partenaires
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Modifier le partenaire" : "Nouveau partenaire"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing ? "Mettez à jour ce partenaire." : "Ajoutez un partenaire aux lignes défilantes."}
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
            Nom du partenaire
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
          />
        </div>

        <ImageUpload
          value={form.image}
          onChange={(url) => set("image", url)}
          section="partners"
          label="Logo"
          placeholder="https://..."
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          contain
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Ligne de défilement
            </label>
            <select
              value={form.row_number}
              onChange={(e) => set("row_number", Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
            >
              <option value={1}>Ligne 1, défile vers la droite</option>
              <option value={2}>Ligne 2, défile vers la gauche</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Ordre d’affichage
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>
        </div>

        <div className="border-t border-ink/5 pt-5 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/partners")}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
