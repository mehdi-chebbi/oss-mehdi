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
  Wallet,
} from 'lucide-react';
import { statusLabel } from '@/api/auth';
import type { Locale } from '@/context/locale';
import type { ProjectDetailLoaderData } from '@/loaders/public';

function renderDescription(body: string): React.ReactNode {
  if (!body) return null;
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => (
    <p
      key={i}
      className="mb-6 text-[16.5px] leading-[1.85] text-ink/75 last:mb-0 sm:text-[17px]"
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
    <p key={i} className="mb-4 text-sm leading-[1.75] text-ink/65 last:mb-0">
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
    return `${start}–${locale === 'fr' ? 'présent' : 'present'}`;
  }
  return start === end ? String(start) : `${start}–${end}`;
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
      <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-bone px-5 py-20">
        <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-[0_20px_55px_rgba(28,55,39,0.06)]">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-forest-700" />
          <h1 className="mb-3 font-serif text-3xl font-bold text-ink">404</h1>
          <p className="mb-7 text-ink/55">
            {locale === 'fr' ? 'Projet introuvable.' : 'Project not found.'}
          </p>
          <Link
            to={`/${locale}/projects`}
            className="inline-flex items-center gap-2 rounded-lg border border-forest-700/20 bg-forest-50 px-4 py-2.5 text-sm font-semibold text-forest-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-700/35 hover:bg-white hover:shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === 'fr' ? 'Retour aux projets' : 'Back to projects'}
          </Link>
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
  const hasResults = Boolean(results || resultFiles.length);

  return (
    <div className="relative overflow-hidden bg-bone pb-24">
      <style>{`
        @keyframes projectFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes projectFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .project-motion { animation: none !important; }
        }
      `}</style>

      {/* Quiet institutional header band */}
      <div className="border-b border-ink/8 bg-white/75">
        <div className="mx-auto max-w-6xl px-5 py-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="project-motion flex flex-wrap items-center gap-2 text-sm text-ink/45 [animation:projectFadeIn_.45s_ease-out_both]"
          >
            <Link
              to={`/${locale}/projects`}
              className="transition-colors duration-200 hover:text-forest-700"
            >
              {locale === 'fr' ? 'Projets' : 'Projects'}
            </Link>
            <span aria-hidden="true" className="text-ink/20">/</span>
            <Link
              to={`/${locale}/projects/${deptSlugValue}`}
              className="font-medium text-ink/60 transition-colors duration-200 hover:text-forest-700"
            >
              {deptTitle}
            </Link>
          </nav>
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        {/* Project heading */}
        <header className="project-motion pb-10 pt-10 sm:pb-12 sm:pt-12 [animation:projectFadeUp_.55s_ease-out_both]">
          <Link
            to={`/${locale}/projects/${deptSlugValue}`}
            className="group mb-7 inline-flex items-center gap-2 text-sm font-medium text-ink/50 transition-colors duration-200 hover:text-forest-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {locale === 'fr' ? 'Tous les projets' : 'All projects'}
          </Link>

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-forest-700" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">
              {deptTitle}
            </span>
          </div>

          <h1 className="max-w-4xl font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] text-ink">
            {title}
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1fr)_332px] lg:items-start lg:gap-12">
          {/* Main content */}
          <div className="order-2 min-w-0 lg:order-1">
            {project.image && (
              <figure className="project-motion group relative mb-10 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[0_18px_45px_rgba(35,64,46,0.07)] [animation:projectFadeUp_.6s_.08s_ease-out_both]">
                <div className="aspect-[16/9] overflow-hidden bg-ink/5">
                  <img
                    src={project.image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent opacity-60" />
              </figure>
            )}

            {!project.image && !description && (
              <div className="project-motion mb-10 flex aspect-[16/9] items-center justify-center rounded-2xl border border-ink/8 bg-white shadow-[0_18px_45px_rgba(35,64,46,0.05)] [animation:projectFadeUp_.6s_.08s_ease-out_both]">
                <div className="flex flex-col items-center gap-3 text-ink/30">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-700/50">
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
                className="project-motion rounded-2xl border border-ink/8 bg-white p-6 shadow-[0_16px_42px_rgba(35,64,46,0.05)] sm:p-8 [animation:projectFadeUp_.6s_.12s_ease-out_both]"
              >
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full bg-forest-700" />
                  <h2
                    id="project-overview"
                    className="font-serif text-2xl font-bold text-ink sm:text-[28px]"
                  >
                    {locale === 'fr' ? 'Présentation du projet' : 'Project overview'}
                  </h2>
                </div>
                <div className="font-serif">{renderDescription(description)}</div>
              </section>
            )}

            <div className="mt-10 border-t border-ink/10 pt-7">
              <Link
                to={`/${locale}/projects/${deptSlugValue}`}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition-colors duration-200 hover:text-forest-700"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                {locale === 'fr' ? 'Retour à tous les projets' : 'Back to all projects'}
              </Link>
            </div>
          </div>

          {/* Project facts */}
          <aside className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-24">
            <section className="project-motion overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_18px_48px_rgba(35,64,46,0.07)] [animation:projectFadeUp_.55s_.08s_ease-out_both]">
              <div className="border-b border-ink/8 bg-forest-700 px-6 py-5 text-white">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
                  {locale === 'fr' ? 'Fiche projet' : 'Project record'}
                </div>
                <h2 className="text-lg font-semibold">
                  {locale === 'fr' ? 'Informations du projet' : 'Project information'}
                </h2>
              </div>

              <dl className="divide-y divide-ink/8 px-6">
                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                    <CircleDot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <dt className="mb-1.5 text-xs font-medium text-ink/45">
                      {locale === 'fr' ? 'Statut' : 'Status'}
                    </dt>
                    <dd>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${
                          project.status === 'en_cours'
                            ? 'bg-forest-50 text-forest-700'
                            : 'bg-ink/[0.05] text-ink/65'
                        }`}
                      >
                        {statusLabel(project.status, locale)}
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs font-medium text-ink/45">
                      {locale === 'fr' ? 'Durée' : 'Duration'}
                    </dt>
                    <dd className="font-semibold tabular-nums text-ink">{duration}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs font-medium text-ink/45">Budget</dt>
                    <dd className="break-words font-semibold leading-snug text-ink">
                      {project.budget ||
                        (locale === 'fr' ? 'Non renseigné' : 'Not specified')}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs font-medium text-ink/45">
                      {locale === 'fr' ? 'Département' : 'Department'}
                    </dt>
                    <dd>
                      <Link
                        to={`/${locale}/projects/${deptSlugValue}`}
                        className="group inline-flex items-center gap-1.5 font-semibold leading-snug text-ink transition-colors duration-200 hover:text-forest-700"
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
                className="project-motion overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_18px_48px_rgba(35,64,46,0.07)] [animation:projectFadeUp_.55s_.14s_ease-out_both]"
              >
                <div className="border-b border-ink/8 px-6 py-5">
                  <h2 id="project-results" className="text-lg font-semibold text-ink">
                    {locale === 'fr' ? 'Résultats et livrables' : 'Results and deliverables'}
                  </h2>
                </div>

                <div className="p-6">
                  {results && <div>{renderSidebarDescription(results)}</div>}

                  {resultFiles.length > 0 && (
                    <div className={results ? 'mt-5 border-t border-ink/10 pt-5' : ''}>
                      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
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
                              className="group flex items-start gap-3 rounded-xl border border-ink/8 bg-bone/55 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-700/25 hover:bg-white hover:shadow-[0_8px_22px_rgba(35,64,46,0.07)]"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-forest-700/10 bg-white text-forest-700 shadow-sm">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-forest-700">
                                  {label}
                                </p>
                                <p className="mt-1.5 text-[11px] font-medium tracking-wide text-ink/40">
                                  {fileType(file.url, file.mime_type)}
                                  {size ? ` · ${size}` : ''}
                                </p>
                              </div>
                              <Download className="mt-1 h-4 w-4 shrink-0 text-ink/25 transition-all duration-200 group-hover:translate-y-0.5 group-hover:text-forest-700" />
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