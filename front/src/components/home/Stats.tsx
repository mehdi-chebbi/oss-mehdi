import { useParams } from 'react-router-dom';
import { stats } from '@/data/stats';
import type { Locale } from '@/context/locale';

export default function Stats() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  return (
    <section className="bg-oss-paper" aria-label={locale === 'en' ? 'OSS key figures' : 'L’OSS en chiffres'}>
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 px-6 sm:px-8 lg:grid-cols-4 lg:px-12">
        {stats.map((stat, index) => (
          <div
            key={stat.label_en}
            className={`relative py-8 sm:py-10 ${index % 2 === 0 ? 'pr-5' : 'border-l border-oss-line pl-5'} ${index > 1 ? 'border-t lg:border-t-0' : ''} lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0`}
          >
            <div className="text-3xl font-bold leading-none text-oss-blue sm:text-4xl">{stat.value}</div>
            <div className="mt-2 max-w-[15rem] text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark/65 sm:text-sm">
              {locale === 'en' ? stat.label_en : stat.label_fr}
            </div>
            <span className={`absolute bottom-0 left-0 h-1 w-12 ${index % 3 === 0 ? 'bg-oss-blue' : index % 3 === 1 ? 'bg-oss-green' : 'bg-oss-ochre'}`} aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
