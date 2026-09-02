import { ArrowRight, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import Fields from './components/home/Fields';
import Hero from './components/home/Hero';
import News from './components/home/News';
import Partners from './components/home/Partners';
import Stats from './components/home/Stats';
import Tools from './components/home/Tools';
import { useLocale } from './context/locale';
import type { HomeLoaderData } from './loaders/public';
import type { HomepagePublicationData, HomepageVideoData } from './api/auth';

function HomepagePublicationCard({
  publication,
  locale,
}: {
  publication: HomepagePublicationData;
  locale: 'fr' | 'en';
}) {
  const title = locale === 'fr' ? publication.title_fr : publication.title_en;
  const description = locale === 'fr' ? publication.description_fr : publication.description_en;
  const link = locale === 'fr'
    ? publication.url_fr || publication.url_en
    : publication.url_en || publication.url_fr;

  return (
    <article className="grid min-h-[390px] bg-oss-blue-dark md:grid-cols-[0.72fr_1fr]">
      <div className="flex items-center justify-center bg-oss-blue/20 p-8">
        <img
          src={publication.image_url}
          alt={title}
          className="max-h-72 w-auto object-contain shadow-[0_20px_45px_rgba(0,0,0,0.25)]"
        />
      </div>
      <div className="flex flex-col justify-center p-8 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-oss-ochre">
          {locale === 'fr' ? 'Publication récente' : 'Latest publication'}
        </p>
        <h3 className="mt-4 text-3xl font-bold leading-tight">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-white/72">{description}</p>
        {link && (
          <a
            href={link}
            className="mt-7 inline-flex w-fit items-center gap-2 bg-oss-ochre px-5 py-3 text-sm font-bold text-oss-blue-dark transition-colors hover:bg-white"
          >
            {locale === 'fr' ? 'Consulter' : 'Read publication'}
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}

function HomepageVideoCard({
  video,
  locale,
}: {
  video: HomepageVideoData;
  locale: 'fr' | 'en';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const title = locale === 'fr' ? video.title_fr : video.title_en;

  const startPlayback = () => {
    void videoRef.current?.play();
  };

  return (
    <article className="relative min-h-[390px] overflow-hidden bg-oss-blue-dark">
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.poster_url || undefined}
        controls={hasStarted}
        playsInline
        preload="metadata"
        onPlay={() => setHasStarted(true)}
        onEnded={() => setHasStarted(false)}
        className="absolute inset-0 h-full w-full bg-oss-blue-dark object-contain"
      />
      <button
        type="button"
        onClick={startPlayback}
        aria-label={locale === 'fr' ? `Lire la vidéo : ${title}` : `Play video: ${title}`}
        className={`absolute inset-0 flex cursor-pointer items-end text-left transition-opacity duration-500 motion-reduce:transition-none ${
          hasStarted ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <span className="absolute inset-0 bg-gradient-to-t from-oss-blue-dark via-oss-blue-dark/45 to-transparent" />
        <span className="relative block p-8 sm:p-10">
          <span className="grid h-12 w-12 place-items-center bg-oss-ochre text-oss-blue-dark">
            <Play className="h-5 w-5 fill-current" />
          </span>
          <span className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-oss-ochre">
            {locale === 'fr' ? 'Vidéo' : 'Video'}
          </span>
          <span className="mt-2 block text-2xl font-bold leading-tight text-white sm:text-3xl">
            {title}
          </span>
        </span>
      </button>
    </article>
  );
}

export default function HomePage() {
  const {
    hero,
    fields,
    latestNews,
    tools,
    partners,
    homepageVideo,
    homepagePublication,
  } = useLoaderData() as HomeLoaderData;
  const { locale } = useLocale();

  return (
    <>
      <Hero data={hero} />
      <Stats />
      <Fields items={fields} />
      <News articles={latestNews} />
      <Tools items={tools} />

      {(homepagePublication || homepageVideo) && (
        <section className="bg-oss-paper py-10 lg:py-12">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
            <div className="mb-12 max-w-3xl">
              <h2 className="oss-section-title">
                {locale === 'fr' ? 'Publications et vidéos' : 'Publications and videos'}
              </h2>
            </div>

            <div
              className={`grid gap-5 ${
                homepagePublication && homepageVideo
                  ? 'lg:grid-cols-[1.15fr_0.85fr]'
                  : 'lg:grid-cols-[minmax(0,820px)]'
              }`}
            >
              {homepagePublication && (
                <HomepagePublicationCard publication={homepagePublication} locale={locale} />
              )}

              {homepageVideo && (
                <HomepageVideoCard video={homepageVideo} locale={locale} />
              )}
            </div>
          </div>
        </section>
      )}

      <Partners items={partners} />
    </>
  );
}
