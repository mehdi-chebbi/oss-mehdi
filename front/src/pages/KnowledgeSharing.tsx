import { useEffect, useState } from 'react';
import { useLoaderData, useNavigation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, FileText, Loader2, Search } from 'lucide-react';
import {
  RESOURCE_DOCUMENT_TYPES,
  RESOURCE_FIELDS,
  resourceFieldLabel,
  resourceTypeLabel,
} from '@/api/auth';
import type { Locale } from '@/context/locale';
import type { KnowledgeSharingLoaderData } from '@/loaders/public';

function formatDate(value: string, locale: Locale) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : 'en-GB',
    { day: '2-digit', month: 'long', year: 'numeric' },
  );
}

function formatSize(value: number | null) {
  if (!value) return '';
  const megabytes = value / (1024 * 1024);
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${Math.ceil(value / 1024)} KB`;
}

function truncate(value: string, maximum = 175) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= maximum) return clean;
  return `${clean.slice(0, maximum).replace(/\s+\S*$/, '')}…`;
}

export default function KnowledgeSharing() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { data, years, page, type, field, year, language, q } = useLoaderData() as KnowledgeSharingLoaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => setSearchInput(q), [q]);

  useEffect(() => {
    const nextQuery = searchInput.trim();
    if (nextQuery === q) return;

    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (nextQuery) next.set('q', nextQuery);
      else next.delete('q');
      next.delete('page');
      setSearchParams(next);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [q, searchInput, searchParams, setSearchParams]);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = Boolean(q || type || field || year || language);
  const isReloading = navigation.state === 'loading';

  return (
    <main className="font-oss relative min-h-[100dvh] bg-oss-paper pb-24 text-ink antialiased lg:pb-28">
      <header className="mx-auto max-w-[1400px] px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-20">
        <span className="mb-7 block h-1 w-16 bg-oss-green" aria-hidden="true" />
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
          {locale === 'fr' ? 'Partage de connaissances' : 'Knowledge sharing'}
        </h1>
        <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
          {locale === 'fr'
            ? 'Consultez et téléchargez les rapports, études, guides et ressources techniques de l’OSS.'
            : 'Browse and download OSS reports, studies, guides, and technical resources.'}
        </p>
      </header>

      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="mb-10 border-y border-oss-line bg-white p-4 sm:p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oss-blue/45" aria-hidden="true" />
            <label htmlFor="resource-search" className="sr-only">
              {locale === 'fr' ? 'Rechercher une ressource' : 'Search resources'}
            </label>
            <input
              id="resource-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={locale === 'fr' ? 'Rechercher par titre ou description' : 'Search by title or description'}
              className="w-full border border-oss-line bg-oss-paper py-3.5 pl-12 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-oss-blue"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1.5 text-xs font-bold text-oss-blue-dark">
              {locale === 'fr' ? 'Type de document' : 'Document type'}
              <select
                value={type || ''}
                onChange={(event) => updateParam('type', event.target.value || undefined)}
                className="border border-oss-line bg-oss-paper px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-oss-blue"
              >
                <option value="">{locale === 'fr' ? 'Tous les types' : 'All types'}</option>
                {RESOURCE_DOCUMENT_TYPES.map((option) => (
                  <option key={option} value={option}>{resourceTypeLabel(option, locale)}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-oss-blue-dark">
              {locale === 'fr' ? 'Domaine' : 'Field'}
              <select
                value={field || ''}
                onChange={(event) => updateParam('field', event.target.value || undefined)}
                className="border border-oss-line bg-oss-paper px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-oss-blue"
              >
                <option value="">{locale === 'fr' ? 'Tous les domaines' : 'All fields'}</option>
                {RESOURCE_FIELDS.map((option) => (
                  <option key={option} value={option}>{resourceFieldLabel(option, locale)}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-oss-blue-dark">
              {locale === 'fr' ? 'Année' : 'Year'}
              <select
                value={year || ''}
                onChange={(event) => updateParam('year', event.target.value || undefined)}
                className="border border-oss-line bg-oss-paper px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-oss-blue"
              >
                <option value="">{locale === 'fr' ? 'Toutes les années' : 'All years'}</option>
                {years.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-oss-blue-dark">
              {locale === 'fr' ? 'Langue disponible' : 'Available language'}
              <select
                value={language || ''}
                onChange={(event) => updateParam('language', event.target.value || undefined)}
                className="border border-oss-line bg-oss-paper px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-oss-blue"
              >
                <option value="">{locale === 'fr' ? 'Toutes les langues' : 'All languages'}</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 border border-oss-line px-4 py-2 text-sm font-bold text-ink/55 transition-colors hover:border-oss-blue/40 hover:text-oss-blue"
            >
              {locale === 'fr' ? 'Effacer les filtres' : 'Clear filters'}
            </button>
          )}
        </div>

        {data.items.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center border border-oss-line bg-white p-10 text-center">
            <FileText className="h-10 w-10 text-oss-green" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-5 text-xl font-bold text-oss-blue-dark">
              {locale === 'fr' ? 'Aucune ressource trouvée' : 'No resources found'}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/55">
              {locale === 'fr'
                ? 'Modifiez votre recherche ou effacez les filtres pour consulter les autres documents.'
                : 'Change your search or clear the filters to browse the other documents.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((resource) => {
              const title = locale === 'fr' ? resource.title_fr : resource.title_en;
              const summary = locale === 'fr' ? resource.summary_fr : resource.summary_en;

              return (
                <article key={resource.id} className="flex min-w-0 flex-col border border-oss-line bg-white">
                  <div className="aspect-[4/3] overflow-hidden bg-oss-blue-dark">
                    {resource.cover_image_path ? (
                      <img
                        src={resource.cover_image_path}
                        alt={locale === 'fr' ? `Couverture de ${title}` : `${title} cover`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-12 w-12 text-white/35" strokeWidth={1.4} aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 text-xs font-bold text-oss-blue/65">
                      <span>{resourceTypeLabel(resource.document_type, locale)}</span>
                      <time dateTime={resource.publication_date} className="text-right text-ink/42">
                        {formatDate(resource.publication_date, locale)}
                      </time>
                    </div>
                    <h2 className="mt-4 text-xl font-bold leading-snug text-oss-blue-dark">{title}</h2>
                    {summary && <p className="mt-3 text-sm leading-relaxed text-ink/58">{truncate(summary)}</p>}
                    <p className="mt-4 text-xs font-semibold leading-relaxed text-oss-green">
                      {resource.fields.map((item) => resourceFieldLabel(item, locale)).join(', ')}
                    </p>

                    <div className="mt-auto grid gap-2 border-t border-oss-line pt-5 sm:grid-cols-2">
                      {resource.file_fr_path && (
                        <a
                          href={resource.file_fr_path}
                          download={resource.file_fr_original_name || undefined}
                          className="inline-flex items-center justify-center gap-2 bg-oss-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oss-green"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          FR {formatSize(resource.file_fr_size)}
                        </a>
                      )}
                      {resource.file_en_path && (
                        <a
                          href={resource.file_en_path}
                          download={resource.file_en_original_name || undefined}
                          className="inline-flex items-center justify-center gap-2 bg-oss-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oss-blue"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          EN {formatSize(resource.file_en_size)}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => updateParam('page', page > 1 ? String(page - 1) : undefined)}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 border border-oss-line bg-white px-4 py-2.5 text-sm font-bold text-ink/60 transition-colors hover:border-oss-blue hover:text-oss-blue disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {locale === 'fr' ? 'Précédent' : 'Previous'}
            </button>
            <span className="bg-oss-blue px-4 py-2.5 text-sm font-bold text-white">{page} / {data.totalPages}</span>
            <button
              type="button"
              onClick={() => updateParam('page', String(page + 1))}
              disabled={page >= data.totalPages}
              className="inline-flex items-center gap-2 border border-oss-line bg-white px-4 py-2.5 text-sm font-bold text-ink/60 transition-colors hover:border-oss-blue hover:text-oss-blue disabled:cursor-not-allowed disabled:opacity-30"
            >
              {locale === 'fr' ? 'Suivant' : 'Next'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      {isReloading && (
        <div className="absolute inset-0 flex items-start justify-center bg-oss-paper/55 pt-32 backdrop-blur-[1px]" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin text-oss-blue" aria-label={locale === 'fr' ? 'Chargement' : 'Loading'} />
        </div>
      )}
    </main>
  );
}
