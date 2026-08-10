import { ArrowRight } from 'lucide-react';
import type { FieldData } from '@/api/auth';
import { localized, useLocale } from '@/context/locale';

interface FieldsProps {
  items: FieldData[];
}

const accents = ['bg-oss-blue', 'bg-oss-green', 'bg-oss-ochre', 'bg-oss-teal'];

export default function Fields({ items: fields }: FieldsProps) {
  const { locale } = useLocale();
  if (fields.length === 0) return null;

  return (
    <section id="nos-domaines" className="bg-oss-paper pb-10 pt-20 lg:pb-12 lg:pt-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="mb-12 max-w-3xl">
          <p className="oss-kicker mb-4">{locale === 'fr' ? 'Notre mandat' : 'Our mandate'}</p>
          <h2 className="oss-section-title">
            {locale === 'fr' ? 'Nos domaines d’action' : 'Our fields of action'}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/65 lg:text-lg">
            {locale === 'fr'
              ? 'Des connaissances partagées et des actions coordonnées au service de la résilience du Sahara et du Sahel.'
              : 'Shared knowledge and coordinated action supporting resilience across the Sahara and Sahel.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          {fields.map((field, index) => (
            <article
              key={field.id}
              className={`${index < 2 ? 'lg:col-span-6' : 'lg:col-span-6'} group relative min-h-[360px] overflow-hidden bg-oss-blue-dark`}
            >
              <img
                src={field.image}
                alt={localized(field, 'title', locale)}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-oss-blue-dark via-oss-blue-dark/55 to-transparent" />
              <span className={`absolute inset-x-0 top-0 h-1.5 ${accents[index % accents.length]}`} aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h3 className="max-w-lg text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {localized(field, 'title', locale)}
                </h3>
                <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/78 sm:text-base">
                  {localized(field, 'description', locale)}
                </p>
                <a href="#" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-oss-ochre transition-colors hover:text-white">
                  {locale === 'fr' ? 'Découvrir' : 'Explore'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
