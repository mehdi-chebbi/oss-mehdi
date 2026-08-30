import { useLoaderData, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CircleDot,
  Download,
  FileText,
  MapPinned,
  Wallet,
} from 'lucide-react';
import { statusLabel } from '@/api/auth';
import type { Locale } from '@/context/locale';
import type { ProjectDetailLoaderData } from '@/loaders/public';
import BrandBands from '@/components/shared/BrandBands';

function renderDescription(body: string): React.ReactNode {
  if (!body) return null;
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => (
    <p
      key={i}
      className="mb-6 text-[16.5px] leading-[1.8] text-ink/70 last:mb-0 sm:text-[17px]"
    >
      {p}
    </p>
  ));
}

function renderSidebarDescription(body: string): React.ReactNode {
  if (!body) return null;
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => (
    <p key={i} className="mb-4 text-sm leading-[1.7] text-ink/65 last:mb-0">
      {p}
    </p>
  ));
}

function formatDuration(
  start: number | null,
  end: number | null,
  locale: Locale,
): string {
  if (start === null && end === null) {
    return locale === 'fr' ? 'Non précisée' : 'Not specified';
  }
  if (start === null) {
    return locale === 'fr' ? `Jusqu’en ${end}` : `Until ${end}`;
  }
  if (end === null) {
    return `${start} - ${locale === 'fr' ? 'présent' : 'present'}`;
  }
  return start === end ? String(start) : `${start} - ${end}`;
}

function formatFileSize(size?: number) {
  if (!size) return '';
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileType(url: string, mimeType?: string) {
  const extension = url.split('?')[0].split('.').pop()?.toUpperCase();
  if (extension && extension.length <= 5) return extension;
  if (mimeType === 'application/pdf') return 'PDF';
  return 'FILE';
}

export default function ProjectDetail() {
  const { lang, deptSlug } = useParams<{ lang: string; deptSlug: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { project } = useLoaderData() as ProjectDetailLoaderData;

  if (!project) {
    return (
      <div className="font-oss flex min-h-[60vh] flex-1 items-center justify-center bg-oss-paper px-5 py-20">
        <div className="relative w-full max-w-md overflow-hidden border border-oss-line bg-white p-8 pb-11 text-center">
          <div className="mx-auto mb-5 h-1 w-10 bg-oss-ochre" />
          <h1 className="mb-3 text-4xl font-bold text-oss-blue-dark">404</h1>
          <p className="mb-7 text-ink/55">
            {locale === 'fr' ? 'Projet introuvable.' : 'Project not found.'}
          </p>
          <Link
            to={`/${locale}/projects`}
            className="inline-flex items-center gap-2 bg-oss-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === 'fr' ? 'Retour aux projets' : 'Back to projects'}
          </Link>
          <BrandBands className="absolute inset-x-0 bottom-0" />
        </div>
      </div>
    );
  }

  const title = locale === 'fr' ? project.title_fr : project.title_en;
  const description = locale === 'fr' ? project.description_fr : project.description_en;
  const deptTitle = locale === 'fr' ? project.department_title_fr : project.department_title_en;
  const deptSlugValue = project.department_slug || deptSlug || '';
  const duration = formatDuration(project.year_start, project.year_end, locale);
  const results = locale === 'fr' ? project.results_fr : project.results_en;
  const resultFiles = (project.result_files || []).filter((file) => file.url);
  const countries = project.countries || [];
  const hasResults = Boolean(results || resultFiles.length);

  return (
    <div className="font-oss relative overflow-hidden bg-oss-paper pb-24 text-ink antialiased selection:bg-oss-blue selection:text-white lg:pb-28">
      <style>{`
        @keyframes projectFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .project-motion { animation: none !important; }
        }
      `}</style>

      <article className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <header className="project-motion pb-10 pt-12 sm:pb-12 sm:pt-16 [animation:projectFadeUp_.55s_ease-out_both]">
          <h1 className="max-w-5xl text-[clamp(32px,4.2vw,56px)] font-bold leading-[1.08] tracking-[-0.03em] text-oss-blue-dark">
            {title}
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start lg:gap-10">
          {/* Main content */}
          <div className="order-2 min-w-0 lg:order-1">
            {project.image && (
              <figure className="project-motion group relative mb-8 overflow-hidden bg-oss-blue-dark [animation:projectFadeUp_.6s_.08s_ease-out_both]">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={project.image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-oss-blue-dark/55 to-transparent" />
                <BrandBands className="absolute inset-x-0 bottom-0" />
              </figure>
            )}

            {!project.image && !description && (
              <div className="project-motion mb-8 flex aspect-[16/9] items-center justify-center bg-oss-blue-dark [animation:projectFadeUp_.6s_.08s_ease-out_both]">
                <div className="flex flex-col items-center gap-3 text-white/42">
                  <div className="flex h-14 w-14 items-center justify-center border border-white/15 text-oss-blue-light">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">
                    {locale === 'fr' ? 'Aucune image disponible' : 'No image available'}
                  </span>
                </div>
              </div>
            )}

            {description && (
              <section
                aria-labelledby="project-overview"
                className="project-motion border-l-4 border-oss-ochre bg-white p-6 sm:p-8 [animation:projectFadeUp_.6s_.12s_ease-out_both]"
              >
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-8 w-1 bg-oss-blue" />
                  <h2
                    id="project-overview"
                    className="text-2xl font-bold text-oss-blue-dark sm:text-[28px]"
                  >
                    {locale === 'fr' ? 'Présentation du projet' : 'Project overview'}
                  </h2>
                </div>
                <div>{renderDescription(description)}</div>
              </section>
            )}

            <div className="mt-8 border-t border-oss-line pt-7">
              <Link
                to={`/${locale}/projects/${deptSlugValue}`}
                className="group inline-flex items-center gap-2 text-sm font-bold text-ink/55 transition-colors duration-200 hover:text-oss-blue"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                {locale === 'fr' ? 'Retour à tous les projets' : 'Back to all projects'}
              </Link>
            </div>
          </div>

          {/* Project facts */}
          <aside className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-24">
            <section className="project-motion overflow-hidden border border-oss-line bg-white [animation:projectFadeUp_.55s_.08s_ease-out_both]">
              <div className="border-b border-white/10 bg-oss-blue-dark px-6 py-5 text-white">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-oss-blue-light">
                  {locale === 'fr' ? 'Fiche projet' : 'Project record'}
                </div>
                <h2 className="text-lg font-bold">
                  {locale === 'fr' ? 'Informations du projet' : 'Project information'}
                </h2>
              </div>

              <dl className="divide-y divide-oss-line px-6">
                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-oss-blue/10 text-oss-blue">
                    <CircleDot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <dt className="mb-1.5 text-xs font-medium text-ink/45">
                      {locale === 'fr' ? 'Statut' : 'Status'}
                    </dt>
                    <dd>
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-bold uppercase tracking-[0.05em] ${
                          project.status === 'en_cours'
                            ? 'bg-oss-blue text-white'
                            : 'bg-oss-paper text-ink/65'
                        }`}
                      >
                        {statusLabel(project.status, locale)}
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-oss-blue/10 text-oss-blue">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs font-medium text-ink/45">
                      {locale === 'fr' ? 'Durée' : 'Duration'}
                    </dt>
                    <dd className="font-bold tabular-nums text-oss-blue-dark">{duration}</dd>
                  </div>
                </div>

                {countries.length > 0 && (
                  <div className="flex items-start gap-3 py-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-oss-ochre/20 text-oss-blue-dark">
                      <MapPinned className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <dt className="mb-2 text-xs font-medium text-ink/45">
                        {locale === 'fr' ? 'Pays bénéficiaires' : 'Beneficiary countries'}
                      </dt>
                      <dd className="flex flex-wrap gap-2">
                        {countries.map((country) => (
                          <span
                            key={country.iso_code}
                            className="border border-oss-blue/20 bg-oss-blue/8 px-2.5 py-1.5 text-xs font-bold leading-snug text-oss-blue-dark"
                          >
                            {locale === 'fr' ? country.name_fr : country.name_en}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-oss-ochre/20 text-oss-blue-dark">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs font-medium text-ink/45">Budget</dt>
                    <dd className="break-words font-bold leading-snug text-oss-blue-dark">
                      {project.budget ||
                        (locale === 'fr' ? 'Non renseigné' : 'Not specified')}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-oss-green/10 text-oss-green">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs font-medium text-ink/45">
                      {locale === 'fr' ? 'Département' : 'Department'}
                    </dt>
                    <dd>
                      <Link
                        to={`/${locale}/projects/${deptSlugValue}`}
                        className="group inline-flex items-center gap-1.5 font-bold leading-snug text-oss-blue-dark transition-colors duration-200 hover:text-oss-blue"
                      >
                        <span>{deptTitle}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </dd>
                  </div>
                </div>
              </dl>
            </section>

            {hasResults && (
              <section
                aria-labelledby="project-results"
                className="project-motion overflow-hidden border border-oss-line bg-white [animation:projectFadeUp_.55s_.14s_ease-out_both]"
              >
                <div className="border-b border-oss-line border-t-4 border-t-oss-ochre px-6 py-5">
                  <h2 id="project-results" className="text-lg font-bold text-oss-blue-dark">
                    {locale === 'fr' ? 'Résultats et livrables' : 'Results and deliverables'}
                  </h2>
                </div>

                <div className="p-6">
                  {results && <div>{renderSidebarDescription(results)}</div>}

                  {resultFiles.length > 0 && (
                    <div className={results ? 'mt-5 border-t border-oss-line pt-5' : ''}>
                      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-oss-blue/58">
                        {locale === 'fr' ? 'Documents associés' : 'Related documents'}
                      </h3>

                      <div className="space-y-2.5">
                        {resultFiles.map((file, index) => {
                          const label =
                            (locale === 'fr' ? file.name_fr : file.name_en) ||
                            file.name_fr ||
                            file.name_en ||
                            (locale === 'fr' ? 'Document du projet' : 'Project document');
                          const size = formatFileSize(file.size);

                          return (
                            <a
                              key={`${file.url}-${index}`}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-start gap-3 border border-oss-line bg-oss-paper p-3.5 transition-colors duration-200 hover:border-oss-blue/35 hover:bg-oss-blue/5"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-oss-blue text-white">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold leading-snug text-oss-blue-dark transition-colors duration-200 group-hover:text-oss-blue">
                                  {label}
                                </p>
                                <p className="mt-1.5 text-[11px] font-medium tracking-wide text-ink/40">
                                  {fileType(file.url, file.mime_type)}
                                  {size ? ` · ${size}` : ''}
                                </p>
                              </div>
                              <Download className="mt-1 h-4 w-4 shrink-0 text-ink/25 transition-all duration-200 group-hover:translate-y-0.5 group-hover:text-oss-blue" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </aside>
        </div>
      </article>
    </div>
  );
}
