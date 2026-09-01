import { useState } from 'react';
import { useLoaderData, useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Briefcase } from 'lucide-react';
import { statusLabel, yearRange } from '@/api/auth';
import type { Locale } from '@/context/locale';
import type { ProjectsListLoaderData } from '@/loaders/public';

function truncate(text: string, max = 130): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export default function ProjectsList() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { thematics } = useLoaderData() as ProjectsListLoaderData;
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = (slug: string) => {
    setOpenSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="font-oss min-h-screen overflow-hidden bg-oss-paper pb-24 text-ink antialiased selection:bg-oss-blue selection:text-white lg:pb-28">
      <section className="mx-auto max-w-[1400px] px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-20">
        <div>
          <p className="oss-kicker mb-5">{locale === 'fr' ? 'Portefeuille d’intervention' : 'Intervention portfolio'}</p>
          <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
            {locale === 'fr' ? 'Nos projets' : 'Our projects'}
          </h1>
          <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">
            {locale === 'fr'
              ? 'Découvrez les projets portés par l’OSS, organisés par thématique.'
              : 'Explore OSS projects, organized by thematic area.'}
          </p>
        </div>

      </section>

      <section className="mx-auto max-w-[1400px] px-6 pt-2 sm:px-8 lg:px-12">
        <div className="mb-9 max-w-2xl">
          <p className="oss-kicker mb-3">{locale === 'fr' ? 'Explorer le portefeuille' : 'Explore the portfolio'}</p>
          <h2 className="oss-section-title">{locale === 'fr' ? 'Projets par thématique' : 'Projects by thematic area'}</h2>
        </div>

        {thematics.length === 0 && (
          <div className="flex min-h-64 items-center justify-center bg-white p-10 text-center text-ink/42">
            {locale === 'fr' ? 'Aucune thématique pour le moment.' : 'No thematic areas yet.'}
          </div>
        )}

        <div className="space-y-3">
          {thematics.map(({ thematic, projects }) => {
            const title = locale === 'fr' ? thematic.title_fr : thematic.title_en;
            const desc = locale === 'fr' ? thematic.description_fr : thematic.description_en;
            const isOpen = openSlug === thematic.slug;

            return (
              <div
                key={thematic.id}
                className={`overflow-hidden border bg-white transition-colors duration-300 ${isOpen ? 'border-oss-blue/35' : 'border-oss-line'}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(thematic.slug)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-300 sm:px-7 ${isOpen ? 'bg-oss-blue-dark text-white' : 'hover:bg-oss-blue/5'}`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className={`h-8 w-1 shrink-0 ${isOpen ? 'bg-oss-ochre' : 'bg-oss-blue'}`} aria-hidden="true" />
                    <h3 className={`truncate text-lg font-bold ${isOpen ? 'text-white' : 'text-oss-blue-dark'}`}>
                      {title}
                    </h3>
                    <span className={`shrink-0 px-2.5 py-1 text-xs font-bold ${isOpen ? 'bg-white/10 text-oss-blue-light' : 'bg-oss-paper text-ink/42'}`}>
                      {String(projects.length).padStart(2, '0')}
                    </span>
                  </div>
                  <ChevronDown
                    className={`ml-4 h-5 w-5 shrink-0 transition-transform duration-500 ${
                      isOpen ? 'rotate-180' : ''
                    } ${isOpen ? 'text-oss-ochre' : 'text-oss-blue/55'}`}
                  />
                </button>

                <div
                  className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  {desc && (
                    <p className="border-b border-oss-line bg-oss-blue/5 px-6 py-5 text-sm leading-relaxed text-ink/62 sm:px-7">
                      {desc}
                    </p>
                  )}

                  <div className="bg-oss-paper p-4 sm:p-6">
                    {projects.length === 0 ? (
                      <p className="py-8 text-center text-sm text-ink/40">
                        {locale === 'fr'
                          ? 'Aucun projet.'
                          : 'No projects.'}
                      </p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => {
                          const pTitle = locale === 'fr' ? project.title_fr : project.title_en;
                          const pDesc = locale === 'fr' ? project.description_fr : project.description_en;
                          const yrs = yearRange(project.year_start, project.year_end, locale);

                          return (
                            <Link
                              key={project.id}
                              to={`/${locale}/projects/${thematic.slug}/${project.slug}`}
                              className="group block overflow-hidden border border-oss-line bg-white transition-colors duration-300 hover:border-oss-blue/40"
                            >
                              <div className="relative aspect-[16/9] w-full overflow-hidden bg-oss-blue-dark">
                                {project.image ? (
                                  <img
                                    src={project.image}
                                    alt={pTitle}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Briefcase className="h-8 w-8 text-white/22" />
                                  </div>
                                )}
                                <span
                                  className={`absolute left-3 top-3 inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${
                                    project.status === 'en_cours'
                                      ? 'bg-oss-blue text-white'
                                      : 'bg-white text-oss-blue-dark'
                                  }`}
                                >
                                  {statusLabel(project.status, locale)}
                                </span>
                                <span className="absolute inset-x-0 bottom-0 h-1 bg-oss-ochre" aria-hidden="true" />
                              </div>

                              <div className="flex min-h-[210px] flex-col p-5">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-oss-blue/58">
                                  {yrs}
                                  {project.budget ? ` · ${project.budget}` : ''}
                                </p>
                                <h4 className="text-base font-bold leading-snug text-oss-blue-dark transition-colors group-hover:text-oss-blue">
                                  {pTitle}
                                </h4>
                                {pDesc && (
                                  <p className="mt-3 text-xs leading-relaxed text-ink/55">
                                    {truncate(pDesc)}
                                  </p>
                                )}
                                <div className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-bold text-oss-blue">
                                  {locale === 'fr' ? 'Voir le projet' : 'View project'}
                                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
