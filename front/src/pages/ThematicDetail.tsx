import { useLoaderData, useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Briefcase, FolderOpen } from 'lucide-react';
import { statusLabel, yearRange } from '@/api/auth';
import type { Locale } from '@/context/locale';
import type { ThematicDetailLoaderData } from '@/loaders/public';

function truncate(text: string, max = 130): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export default function ThematicDetail() {
  const { lang, thematicSlug } = useParams<{ lang: string; thematicSlug: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const { thematic, projects } = useLoaderData() as ThematicDetailLoaderData;

  // 404
  if (!thematic) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bone py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ink mb-3">404</h1>
          <p className="text-ink/50 mb-6">
            {locale === 'fr' ? 'Thématique introuvable.' : 'Thematic area not found.'}
          </p>
          <Link
            to={`/${locale}/projects`}
            className="inline-flex items-center gap-1.5 text-[#489e42] font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'fr' ? 'Retour aux projets' : 'Back to projects'}
          </Link>
        </div>
      </div>
    );
  }

  const title = locale === 'fr' ? thematic.title_fr : thematic.title_en;
  const description = locale === 'fr' ? thematic.description_fr : thematic.description_en;

  return (
    <div className="bg-bone pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Back link */}
        <Link
          to={`/${locale}/projects`}
          className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'fr' ? 'Toutes les thématiques' : 'All thematic areas'}
        </Link>

        {/* Thematic header */}
        <div className="mb-10 max-w-2xl">
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-ink/55 text-base lg:text-lg mt-4 leading-relaxed font-light">
              {description}
            </p>
          )}
        </div>

        {/* Projects in this thematic area */}
        <div className="border-t border-ink/10 pt-10">
          <h2 className="font-serif font-bold text-2xl text-ink mb-6">
            {locale === 'fr' ? 'Projets dans cette thématique' : 'Projects in this thematic area'}
          </h2>

          {projects.length === 0 ? (
            /* Empty state — no projects yet */
            <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-6 h-6 text-ink/30" />
              </div>
              <p className="text-ink/50 mb-1">
                {locale === 'fr'
                  ? 'Aucun projet dans cette thématique pour le moment.'
                  : 'No projects in this thematic area yet.'}
              </p>
              <p className="text-sm text-ink/40">
                {locale === 'fr' ? 'Revenez bientôt.' : 'Check back soon.'}
              </p>
            </div>
          ) : (
            /* Projects grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {projects.map((project) => {
                const pTitle = locale === 'fr' ? project.title_fr : project.title_en;
                const pDesc = locale === 'fr' ? project.description_fr : project.description_en;
                const yrs = yearRange(project.year_start, project.year_end, locale);
                return (
                  <Link
                    key={project.id}
                    to={`/${locale}/projects/${thematicSlug}/${project.slug}`}
                    className="group block bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden hover:shadow-md transition-shadow"
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
                      {/* Status badge overlay */}
                      <span
                        className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur ${
                          project.status === 'en_cours'
                            ? 'bg-blue-50/90 text-blue-600'
                            : 'bg-white/90 text-ink/60'
                        }`}
                      >
                        {statusLabel(project.status, locale)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-wider text-ink/40 mb-2">
                        {yrs}
                        {project.budget ? ` · ${project.budget}` : ''}
                      </p>
                      <h3 className="font-serif font-bold text-lg leading-snug text-ink mb-2">
                        <span className="bg-gradient-to-r from-[#489e42] to-[#489e42] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                          {pTitle}
                        </span>
                      </h3>
                      {pDesc && (
                        <p className="text-sm text-ink/55 leading-relaxed">
                          {truncate(pDesc)}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#489e42]">
                        {locale === 'fr' ? 'Voir le projet' : 'View project'}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom back link */}
        <div className="h-px bg-ink/10 mt-12 mb-8" />
        <Link
          to={`/${locale}/projects`}
          className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-[#489e42] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'fr' ? 'Retour aux thématiques' : 'Back to all thematic areas'}
        </Link>
      </div>
    </div>
  );
}
