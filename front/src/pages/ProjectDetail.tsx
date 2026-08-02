import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Briefcase, Calendar, Wallet, CircleDot } from 'lucide-react';
import { getProjectBySlug, statusLabel, yearRange, type ProjectData } from '@/api/auth';
import type { Locale } from '@/context/locale';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SocialSidebar from '@/components/shared/SocialSidebar';

// Render plain-text description as paragraphs (split on blank lines), like news body.
function renderDescription(body: string): React.ReactNode {
  if (!body) return null;
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return paragraphs.map((p, i) => (
    <p key={i} className="mb-5 text-ink/75 leading-[1.75] text-[17px]">
      {p}
    </p>
  ));
}

export default function ProjectDetail() {
  const { lang, deptSlug, projectSlug } = useParams<{ lang: string; deptSlug: string; projectSlug: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectSlug) return;
    setLoading(true);
    setNotFound(false);
    getProjectBySlug(projectSlug)
      .then((data) => {
        setProject(data);
        // If the project's department slug doesn't match the URL, treat as 404
        if (data && deptSlug && data.department_slug && data.department_slug !== deptSlug) {
          setNotFound(true);
          setProject(null);
        }
      })
      .catch(() => {
        setProject(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [projectSlug, deptSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SocialSidebar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-bone">
          <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen flex flex-col">
        <SocialSidebar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-bone">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-ink mb-3">404</h1>
            <p className="text-ink/50 mb-6">
              {locale === 'fr' ? 'Projet introuvable.' : 'Project not found.'}
            </p>
            <Link
              to={`/${locale}/projects`}
              className="inline-flex items-center gap-1.5 text-[#489e42] font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'fr' ? 'Retour aux projets' : 'Back to projects'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = locale === 'fr' ? project.title_fr : project.title_en;
  const description = locale === 'fr' ? project.description_fr : project.description_en;
  const deptTitle = locale === 'fr' ? project.department_title_fr : project.department_title_en;
  const deptSlugValue = project.department_slug || deptSlug || '';

  return (
    <div className="min-h-screen flex flex-col">
      <SocialSidebar />
      <Navbar />
      <main className="flex-1 bg-bone pb-20">
        <article className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-ink/50 mb-8 flex-wrap">
            <Link to={`/${locale}/projects`} className="hover:text-ink transition-colors">
              {locale === 'fr' ? 'Projets' : 'Projects'}
            </Link>
            <span className="text-ink/30">/</span>
            <Link to={`/${locale}/projects/${deptSlugValue}`} className="hover:text-ink transition-colors">
              {deptTitle}
            </Link>
          </nav>

          {/* Back link */}
          <Link
            to={`/${locale}/projects/${deptSlugValue}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'fr' ? 'Tous les projets' : 'All projects'}
          </Link>

          {/* Title */}
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h1 className="font-serif font-bold text-[clamp(28px,4.5vw,48px)] leading-[1.08] text-ink mb-6">
            {title}
          </h1>

          {/* Meta row: status, year range, budget */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink/60 mb-8">
            {/* Status */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'en_cours'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-ink/5 text-ink/50'
              }`}
            >
              <CircleDot className="w-3 h-3" />
              {statusLabel(project.status, locale)}
            </span>

            {/* Year range */}
            {project.year_start !== null && project.year_start !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-ink/40" />
                {yearRange(project.year_start, project.year_end, locale)}
              </span>
            )}

            {/* Budget */}
            {project.budget && (
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-ink/40" />
                {project.budget}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-ink/10 mb-8" />

          {/* Image */}
          {project.image && (
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl mb-10">
              <img
                src={project.image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          {/* Placeholder if no image and no description */}
          {!project.image && !description && (
            <div className="flex items-center justify-center w-full aspect-[16/9] bg-ink/5 rounded-xl mb-10">
              <Briefcase className="w-12 h-12 text-ink/20" />
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="font-serif">
              {renderDescription(description)}
            </div>
          )}

          {/* Bottom divider + back link */}
          <div className="h-px bg-ink/10 mt-12 mb-8" />
          <Link
            to={`/${locale}/projects/${deptSlugValue}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-[#489e42] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'fr' ? 'Retour aux projets' : 'Back to all projects'}
          </Link>
        </article>
      </main>
      <Footer />
    </div>
  );
}
