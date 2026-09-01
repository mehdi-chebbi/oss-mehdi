import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  listAllThematics,
  listAllProjectsByThematic,
  getProject,
  createProject,
  updateProject,
  getAfricanCountries,
  type ThematicData,
  type CountryData,
  type ProjectResultFile,
} from "../../api/auth";
import ImageUpload from "../../components/admin/ImageUpload";
import ProjectResultsFiles from "../../components/admin/ProjectResultsFiles";
import { Globe, Loader2, ArrowLeft, Info, MapPin, Plus, X } from "lucide-react";

type Lang = "fr" | "en";

interface CountrySelection {
  key: number;
  countryCode: string | null;
  query: string;
}

let nextCountrySelectionKey = 1;

function createCountrySelection(country?: CountryData): CountrySelection {
  return {
    key: nextCountrySelectionKey++,
    countryCode: country?.iso_code ?? null,
    query: country ? `${country.name_fr} / ${country.name_en} (${country.iso_code})` : "",
  };
}

function LangTabs({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-ink/10">
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
          lang === "fr" ? "bg-[#489e42] text-white" : "bg-white text-ink/60 hover:bg-ink/5"
        }`}
      >
        <Globe className="w-3.5 h-3.5" /> FR
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
          lang === "en" ? "bg-[#489e42] text-white" : "bg-white text-ink/60 hover:bg-ink/5"
        }`}
      >
        <Globe className="w-3.5 h-3.5" /> EN
      </button>
    </div>
  );
}

const emptyForm = {
  thematic_id: 0,
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  results_fr: "",
  results_en: "",
  result_files: [] as ProjectResultFile[],
  image: "",
  year_start: "" as string | number,
  year_end: "" as string | number,
  status: "en_cours" as "en_cours" | "cloture",
  budget: "",
  sort_order: 0,
};

export default function ProjectForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;

  const [thematics, setThematics] = useState<ThematicData[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [countrySelections, setCountrySelections] = useState<CountrySelection[]>([
    createCountrySelection(),
  ]);
  const [form, setForm] = useState(emptyForm);
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState<Lang>("fr");

  // Load thematic areas (for the selector) + project (if editing)
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [thematicOptions, countryOptions] = await Promise.all([
        listAllThematics(token),
        getAfricanCountries(),
      ]);
      setThematics(thematicOptions);
      setCountries(countryOptions);

      if (isEditing && id) {
        const project = await getProject(token, Number(id));
        if (project) {
          setForm({
            thematic_id: project.thematic_id,
            title_fr: project.title_fr || "",
            title_en: project.title_en || "",
            description_fr: project.description_fr || "",
            description_en: project.description_en || "",
            results_fr: project.results_fr || "",
            results_en: project.results_en || "",
            result_files: project.result_files || [],
            image: project.image || "",
            year_start: project.year_start ?? "",
            year_end: project.year_end ?? "",
            status: project.status || "en_cours",
            budget: project.budget || "",
            sort_order: project.sort_order ?? 0,
          });
          setSlug(project.slug || "");
          setCountrySelections(
            project.countries?.length
              ? project.countries.map((country) => createCountrySelection(country))
              : [createCountrySelection()],
          );
        }
      } else {
        // New project: pre-select thematic area from ?thematic= query param
        const thematicFromUrl = searchParams.get("thematic");
        const initialThematicId =
          thematicFromUrl && thematicOptions.some((item) => item.id === Number(thematicFromUrl))
            ? Number(thematicFromUrl)
            : thematicOptions[0]?.id ?? 0;
        setForm((f) => ({ ...f, thematic_id: initialThematicId }));

        // Default sort_order to next position in that thematic area
        if (initialThematicId) {
          const existing = await listAllProjectsByThematic(token, initialThematicId);
          setForm((f) => ({ ...f, sort_order: existing.length }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, id, isEditing, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!token) return;
    if (!form.thematic_id) {
      setError("Veuillez sélectionner une thématique.");
      return;
    }
    const selectedCountryCodes = countrySelections
      .map((selection) => selection.countryCode)
      .filter((countryCode): countryCode is string => countryCode !== null);
    if (
      selectedCountryCodes.length !== countrySelections.length ||
      selectedCountryCodes.length === 0
    ) {
      setError("Veuillez sélectionner au moins un pays bénéficiaire valide.");
      return;
    }
    if (new Set(selectedCountryCodes).size !== selectedCountryCodes.length) {
      setError("Un pays bénéficiaire ne peut être sélectionné qu’une seule fois.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        country_codes: selectedCountryCodes,
        year_start: form.year_start === "" ? null : Number(form.year_start),
        year_end: form.year_end === "" ? null : Number(form.year_end),
      };
      if (isEditing && id) {
        await updateProject(token, Number(id), payload);
      } else {
        await createProject(token, payload);
      }
      setSuccess("Projet enregistré avec succès !");
      setTimeout(() => navigate(`/admin/projects?thematic=${form.thematic_id}`), 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const countryLabel = (country: CountryData) =>
    `${country.name_fr} / ${country.name_en} (${country.iso_code})`;

  const updateCountrySelection = (key: number, query: string) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const match = countries.find((country) => {
      const values = [
        countryLabel(country),
        country.name_fr,
        country.name_en,
        country.iso_code,
      ];
      return values.some((value) => value.toLocaleLowerCase() === normalizedQuery);
    });

    setCountrySelections((selections) =>
      selections.map((selection) =>
        selection.key === key
          ? { ...selection, query, countryCode: match?.iso_code ?? null }
          : selection,
      ),
    );
  };

  const addCountrySelection = () => {
    setCountrySelections((selections) => [...selections, createCountrySelection()]);
  };

  const removeCountrySelection = (key: number) => {
    setCountrySelections((selections) =>
      selections.length === 1
        ? selections
        : selections.filter((selection) => selection.key !== key),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
      </div>
    );
  }

  if (thematics.length === 0) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-8 text-center">
          <p className="text-ink/50 mb-3">Aucune thématique n’existe encore.</p>
          <p className="text-sm text-ink/40 mb-4">
            Vous devez créer au moins une thématique avant d’ajouter un projet.
          </p>
          <button
            onClick={() => navigate("/admin/thematics/new")}
            className="text-sm text-[#489e42] font-semibold hover:underline"
          >
            Créer une thématique →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/admin/projects?thematic=${form.thematic_id || ""}`)}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux projets
        </button>
        <h2 className="text-2xl font-bold text-ink">
          {isEditing ? "Modifier le projet" : "Nouveau projet"}
        </h2>
        <p className="text-ink/50 text-sm mt-1">
          {isEditing
            ? "Mettre à jour ce projet"
            : "Ajouter un nouveau projet à une thématique"}
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
        {/* Thematic selector */}
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1.5">
            Thématique <span className="text-red-500">*</span>
          </label>
          <select
            value={form.thematic_id || ""}
            onChange={(e) => set("thematic_id", Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
          >
            <option value="" disabled>Sélectionner une thématique…</option>
            {thematics.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title_fr} / {d.title_en}
              </option>
            ))}
          </select>
        </div>

        {/* Beneficiary countries */}
        <div className="border-t border-ink/5 pt-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-ink/70">
                <MapPin className="h-4 w-4 text-[#489e42]" aria-hidden="true" />
                Pays bénéficiaires <span className="text-red-500">*</span>
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-ink/45">
                Saisissez quelques lettres, puis choisissez un pays africain dans la liste.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {countrySelections.map((selection, index) => {
              const listId = `beneficiary-country-options-${selection.key}`;
              const selectedElsewhere = new Set(
                countrySelections
                  .filter((item) => item.key !== selection.key)
                  .map((item) => item.countryCode)
                  .filter((countryCode): countryCode is string => countryCode !== null),
              );

              return (
                <div key={selection.key} className="flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="mb-1.5 block text-xs font-medium text-ink/60">
                      Pays {index + 1}
                    </span>
                    <input
                      type="text"
                      list={listId}
                      value={selection.query}
                      onChange={(event) =>
                        updateCountrySelection(selection.key, event.target.value)
                      }
                      placeholder="Rechercher un pays..."
                      autoComplete="off"
                      aria-invalid={Boolean(selection.query && !selection.countryCode)}
                      className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-[#489e42]"
                    />
                    <datalist id={listId}>
                      {countries
                        .filter(
                          (country) =>
                            country.iso_code === selection.countryCode ||
                            !selectedElsewhere.has(country.iso_code),
                        )
                        .map((country) => (
                          <option key={country.iso_code} value={countryLabel(country)} />
                        ))}
                    </datalist>
                  </label>

                  {countrySelections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCountrySelection(selection.key)}
                      aria-label={`Supprimer le pays ${index + 1}`}
                      className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50 active:-translate-y-px"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addCountrySelection}
            disabled={countrySelections.length >= countries.length}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#489e42]/30 bg-[#489e42]/5 px-4 py-2.5 text-sm font-semibold text-[#3d8a37] transition-colors hover:border-[#489e42]/50 hover:bg-[#489e42]/10 active:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un pays
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink/70">Langue du contenu :</span>
          <LangTabs lang={lang} setLang={setLang} />
        </div>

        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Contenu {lang === "fr" ? "français" : "anglais"}
          </h4>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Titre ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={lang === "fr" ? form.title_fr : form.title_en}
              onChange={(e) => set(lang === "fr" ? "title_fr" : "title_en", e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Description ({lang.toUpperCase()})
            </label>
            <textarea
              value={lang === "fr" ? form.description_fr : form.description_en}
              onChange={(e) => set(lang === "fr" ? "description_fr" : "description_en", e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-none"
              placeholder={lang === "fr" ? "Description du projet…" : "Description du projet en anglais…"}
            />
          </div>

          {/* Results narrative */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">
              Résultats et livrables ({lang.toUpperCase()})
            </label>
            <textarea
              value={lang === "fr" ? form.results_fr : form.results_en}
              onChange={(e) =>
                set(lang === "fr" ? "results_fr" : "results_en", e.target.value)
              }
              rows={6}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink resize-y"
              placeholder={
                lang === "fr"
                  ? "Résultats, réalisations et livrables du projet..."
                  : "Résultats, réalisations et livrables du projet en anglais..."
              }
            />
          </div>
        </div>

        {/* Result documents */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Documents liés aux résultats
          </h4>
          <ProjectResultsFiles
            value={form.result_files}
            onChange={(files) => set("result_files", files)}
          />
        </div>

        {/* Image */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Image
          </h4>
          <ImageUpload
            value={form.image}
            onChange={(url) => set("image", url)}
            section="projects"
            label="Image du projet"
          />
        </div>

        {/* Project details */}
        <div className="border-t border-ink/5 pt-5">
          <h4 className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-3">
            Détails du projet
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year start */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Année de début
              </label>
              <input
                type="number"
                value={form.year_start}
                onChange={(e) => set("year_start", e.target.value)}
                placeholder="2020"
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>

            {/* Year end */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Année de fin <span className="text-ink/40 font-normal">(laisser vide si le projet est en cours)</span>
              </label>
              <input
                type="number"
                value={form.year_end}
                onChange={(e) => set("year_end", e.target.value)}
                placeholder="2023"
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Statut
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
              >
                <option value="en_cours">En cours</option>
                <option value="cloture">Clôturé</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1.5">
                Budget
              </label>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
                placeholder="Ex. : 1,2 M EUR, 500 000 $"
                className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              />
            </div>

            {/* Sort order */}
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
        </div>

        {/* Slug info (only when editing) */}
        {isEditing && (
          <div className="border-t border-ink/5 pt-5">
            <div className="flex items-start gap-2 text-sm text-ink/50 bg-ink/5 px-4 py-3 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink/70">Identifiant d’URL</p>
                <p className="mt-0.5">
                  Le projet est accessible à l’adresse{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded text-xs">/projects/{"{thematic}"}/{slug}</code>.
                  L’identifiant est généré automatiquement et ne peut pas être modifié afin de conserver une URL stable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="border-t border-ink/5 pt-5 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/projects?thematic=${form.thematic_id || ""}`)}
            className="px-6 py-2.5 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
