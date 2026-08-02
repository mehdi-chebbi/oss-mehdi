import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Loader2, Building2 } from 'lucide-react';
import { getPublishedDepartments, type DepartmentData } from '@/api/auth';
import type { Locale } from '@/context/locale';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SocialSidebar from '@/components/shared/SocialSidebar';

function truncate(text: string, max = 140): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export default function ProjectsList() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPublishedDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SocialSidebar />
      <Navbar />
      <main className="flex-1 bg-bone pb-20">
        <div className="max-w-7xl mx-auto px-6">
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

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && departments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-12 text-center text-ink/40">
              {locale === 'fr'
                ? 'Aucun département publié pour le moment.'
                : 'No departments published yet.'}
            </div>
          )}

          {/* Departments grid */}
          {!loading && departments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {departments.map((dept) => {
                const title = locale === 'fr' ? dept.title_fr : dept.title_en;
                const desc = locale === 'fr' ? dept.description_fr : dept.description_en;
                return (
                  <Link
                    key={dept.id}
                    to={`/${locale}/projects/${dept.slug}`}
                    className="group block bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-ink/5">
                      {dept.image ? (
                        <img
                          src={dept.image}
                          alt={title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-ink/20" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif font-bold text-lg leading-snug text-ink mb-2">
                        <span className="bg-gradient-to-r from-[#489e42] to-[#489e42] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px]">
                          {title}
                        </span>
                      </h3>
                      {desc && (
                        <p className="text-sm text-ink/55 leading-relaxed">
                          {truncate(desc)}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#489e42]">
                        {locale === 'fr' ? 'Voir les projets' : 'View projects'}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
