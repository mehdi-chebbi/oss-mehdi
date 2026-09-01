import { ArrowRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { statusLabel, type ProjectData } from '@/api/auth';
import type { Locale } from '@/context/locale';

interface DomainProjectsSectionProps {
  locale: Locale;
  projects: ProjectData[];
  thematicSlug: string;
  description: Record<Locale, string>;
}

function truncate(text: string, max = 120) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function projectYears(start: number | null, end: number | null, locale: Locale) {
  if (start === null) return '';
  if (end === null) return `${start} - ${locale === 'fr' ? 'présent' : 'present'}`;
  return start === end ? `${start}` : `${start} - ${end}`;
}

export default function DomainProjectsSection({ locale, projects, thematicSlug, description }: DomainProjectsSectionProps) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-20 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28">
      <div className="border-t border-oss-line pt-12 sm:pt-14">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-[-0.025em] text-oss-blue-dark sm:text-4xl">
            {locale === 'fr' ? 'Nos projets récents' : 'Our latest projects'}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/62 sm:text-lg">{description[locale]}</p>
        </div>

        {projects.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const title = locale === 'fr' ? project.title_fr : project.title_en;
              const projectDescription = locale === 'fr' ? project.description_fr : project.description_en;
              const years = projectYears(project.year_start, project.year_end, locale);
              return (
                <Link key={project.id} to={`/${locale}/projects/${thematicSlug}/${project.slug}`} className="group flex min-h-full flex-col overflow-hidden bg-white outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-oss-green">
                  <div className="relative aspect-[16/10] overflow-hidden bg-oss-blue-dark/5">
                    {project.image ? (
                      <img src={project.image} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Briefcase className="h-9 w-9 text-oss-blue/25" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col border-l-4 border-oss-green p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-[0.07em] text-ink/45">
                      <span>{statusLabel(project.status, locale)}</span>
                      {years && <span>{years}</span>}
                    </div>
                    <h3 className="mt-4 text-xl font-bold leading-snug text-oss-blue-dark">{title}</h3>
                    {projectDescription && <p className="mt-3 text-sm leading-relaxed text-ink/60">{truncate(projectDescription)}</p>}
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-oss-green">
                      {locale === 'fr' ? 'Voir le projet' : 'View project'}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 border-l-4 border-oss-green bg-white px-6 py-8 text-ink/60">
            {locale === 'fr' ? 'Les projets de cette thématique seront bientôt disponibles.' : 'Projects from this thematic area will be available soon.'}
          </div>
        )}

        <Link to={`/${locale}/projects/${thematicSlug}`} className="mt-10 inline-flex min-h-12 items-center gap-3 bg-oss-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oss-green focus-visible:ring-offset-2 active:translate-y-px">
          {locale === 'fr' ? 'Voir tous les projets' : 'View all projects'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
