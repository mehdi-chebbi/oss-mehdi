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
  const { departments } = useLoaderData() as ProjectsListLoaderData;
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = (slug: string) => {
    setOpenSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="bg-bone pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="mb-10 max-w-2xl">
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            {locale === 'fr' ? 'Projets' : 'Projects'}
          </h1>
          <p className="text-ink/55 text-base lg:text-lg mt-4 leading-relaxed font-light">
            {locale === 'fr'
              ? 'Découvrez nos projets, regroupés par département.'
              : 'Explore our projects, grouped by department.'}
          </p>
        </div>

        {/* Empty state */}
        {departments.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-12 text-center text-ink/40">
            {locale === 'fr'
              ? 'Aucun département publié pour le moment.'
              : 'No departments published yet.'}
          </div>
        )}

        {/* Accordion */}
        <div className="space-y-3">
          {departments.map(({ dept, projects }) => {
            const title = locale === 'fr' ? dept.title_fr : dept.title_en;
            const desc = locale === 'fr' ? dept.description_fr : dept.description_en;
            const isOpen = openSlug === dept.slug;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-xl border border-ink/[0.08] overflow-hidden"
              >
                {/* Toggle button */}
                <button
                  onClick={() => toggle(dept.slug)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-ink/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <h3 className="font-serif font-bold text-lg text-ink truncate">
                      {title}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-ink/40 bg-ink/[0.04] px-2 py-0.5 rounded-full">
                      {projects.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-ink/40 shrink-0 ml-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Collapsible content */}
                <div
                  className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  {/* Department description */}
                  {desc && (
                    <p className="px-6 pb-4 text-sm text-ink/60 leading-relaxed border-b border-ink/5">
                      {desc}
                    </p>
                  )}

                  {/* Projects grid */}
                  <div className="p-6">
                    {projects.length === 0 ? (
                      <p className="text-ink/40 text-sm text-center py-6">
                        {locale === 'fr'
                          ? 'Aucun projet publié.'
                          : 'No published projects.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map((project) => {
                          const pTitle = locale === 'fr' ? project.title_fr : project.title_en;
                          const pDesc = locale === 'fr' ? project.description_fr : project.description_en;
                          const yrs = yearRange(project.year_start, project.year_end, locale);

                          return (
                            <Link
                              key={project.id}
                              to={`/${locale}/projects/${dept.slug}/${project.slug}`}
                              className="group block bg-bone rounded-xl border border-ink/[0.06] overflow-hidden hover:shadow-md transition-shadow"
                            >
                              {/* Image */}
                              <div className="relative w-full aspect-[16/9] overflow-hidden bg-ink/5">
                                {project.image ? (
                                  <img
                                    src={project.image}
                                    alt={pTitle}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Briefcase className="w-8 h-8 text-ink/20" />
                                  </div>
                                )}
                                <span
                                  className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur ${
                                    project.status === 'en_cours'
                                      ? 'bg-blue-50/90 text-blue-600'
                                      : 'bg-white/90 text-ink/60'
                                  }`}
                                >
                                  {statusLabel(project.status, locale)}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="p-4">
                                <p className="text-xs uppercase tracking-wider text-ink/40 mb-1.5">
                                  {yrs}
                                  {project.budget ? ` · ${project.budget}` : ''}
                                </p>
                                <h4 className="font-serif font-bold text-[15px] leading-snug text-ink mb-1.5 group-hover:text-forest-700 transition-colors">
                                  {pTitle}
                                </h4>
                                {pDesc && (
                                  <p className="text-xs text-ink/55 leading-relaxed">
                                    {truncate(pDesc)}
                                  </p>
                                )}
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#489e42]">
                                  {locale === 'fr' ? 'Voir le projet' : 'View project'}
                                  <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
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
      </div>
    </div>
  );
}
