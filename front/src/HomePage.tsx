import { ArrowRight, Play } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import Contact from './components/home/Contact';
import Fields from './components/home/Fields';
import Hero from './components/home/Hero';
import News from './components/home/News';
import Partners from './components/home/Partners';
import Stats from './components/home/Stats';
import Tools from './components/home/Tools';
import { useLocale } from './context/locale';
import type { HomeLoaderData } from './loaders/public';

export default function HomePage() {
  const { hero, fields, latestNews, tools, partners } = useLoaderData() as HomeLoaderData;
  const { locale } = useLocale();

  return (
    <>
      <Hero data={hero} />
      <Stats />
      <Fields items={fields} />
      <News articles={latestNews} />
      <Tools items={tools} />

      <section className="bg-oss-paper py-10 lg:py-12">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <p className="oss-kicker mb-4">{locale === 'fr' ? 'Ressources' : 'Resources'}</p>
            <h2 className="oss-section-title">
              {locale === 'fr' ? 'Publications et vidéos' : 'Publications and videos'}
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="grid min-h-[390px] bg-oss-blue-dark md:grid-cols-[0.72fr_1fr]">
              <div className="flex items-center justify-center bg-oss-blue/20 p-8">
                <img src="/video-thumbnail.png" alt="Rapport d’activité 2025" className="max-h-72 w-auto object-contain shadow-[0_20px_45px_rgba(0,0,0,0.25)]" />
              </div>
              <div className="flex flex-col justify-center p-8 text-white sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-oss-ochre">
                  {locale === 'fr' ? 'Publication récente' : 'Latest publication'}
                </p>
                <h3 className="mt-4 text-3xl font-bold leading-tight">Rapport d’activité 2025</h3>
                <p className="mt-4 text-base leading-relaxed text-white/72">Programme d’activité 2026, soumis à la 33e session du Conseil d’administration de l’OSS.</p>
                <a href="#" className="mt-7 inline-flex w-fit items-center gap-2 bg-oss-ochre px-5 py-3 text-sm font-bold text-oss-blue-dark transition-colors hover:bg-white">
                  {locale === 'fr' ? 'Consulter' : 'Read publication'}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>

            <article className="group relative min-h-[390px] overflow-hidden bg-oss-blue-dark">
              <img src="/video-cover.png" alt="Présentation du projet NB-ITTAS" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-oss-blue-dark via-oss-blue-dark/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <span className="grid h-12 w-12 place-items-center bg-oss-ochre text-oss-blue-dark"><Play className="h-5 w-5 fill-current" /></span>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-oss-ochre">Vidéo</p>
                <h3 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">Présentation du projet NB-ITTAS</h3>
                <a href="#" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-oss-ochre">
                  {locale === 'fr' ? 'Visionner la vidéo' : 'Watch the video'}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Partners items={partners} />
      <Contact />
    </>
  );
}
