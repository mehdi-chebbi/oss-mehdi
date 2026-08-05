import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { FieldData } from '@/api/auth';
import { useLocale, localized } from '@/context/locale';

// ---- Card component ----

interface FieldCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  location: string;
  description?: string;
  href?: string;
  themeHue: number;
  actionLabel: string;
}

const FieldCard = React.forwardRef<HTMLDivElement, FieldCardProps>(
  ({ className, imageUrl, location, description, href = '#', themeHue, actionLabel, ...props }, ref) => {
    // Convert hue integer to HSL string for CSS custom property
    const themeColor = `${themeHue} 60% 35%`;

    return (
      <div
        ref={ref}
        style={{
          // @ts-ignore - CSS custom properties are valid
          '--theme-color': themeColor,
        } as React.CSSProperties}
        className={cn('group w-full h-full', className)}
        {...props}
      >
        <a
          href={href}
          className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-[#CCC6BA]
                     bg-[#FAF9F6] shadow-[0_8px_28px_rgba(35,42,38,0.06)]
                     transition-all duration-300 ease-out
                     group-hover:-translate-y-1 group-hover:border-[#B8B1A4]
                     group-hover:shadow-[0_16px_38px_rgba(35,42,38,0.11)]"
          aria-label={`Explore details for ${location}`}
        >
          <div className="relative h-52 shrink-0 overflow-hidden bg-[#E4E1D9]">
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <div
              className="absolute inset-x-0 bottom-0 h-1"
              style={{ backgroundColor: `hsl(var(--theme-color))` }}
            />
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="text-xl font-bold leading-tight tracking-tight text-ink">
              {location}
            </h3>
            {description && (
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink/55">
                {description}
              </p>
            )}

            <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-ink/75 transition-colors group-hover:text-ink">
              <span>{actionLabel}</span>
              <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </a>
      </div>
    );
  }
);
FieldCard.displayName = 'FieldCard';

// ---- Section ----

interface FieldsProps {
  items: FieldData[];
}

export default function Fields({ items: fields }: FieldsProps) {
  const { locale } = useLocale();

  if (fields.length === 0) return null;

  return (
    <section
      id="nos-domaines"
      className="border-t border-[#C9C3B7] bg-[#E5E1D8] py-20 lg:py-28"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 lg:mb-16 max-w-2xl">
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-tight">
            {locale === 'fr' ? 'Nos domaines d\u2019action' : 'Our Fields of Action'}
          </h2>
          <p className="text-ink/55 text-base lg:text-lg mt-4 leading-relaxed font-light">
            {locale === 'fr'
              ? 'Quatre piliers stratégiques au cœur de la mission de l\u2019OSS pour la résilience du Sahara et du Sahel.'
              : 'Four strategic pillars at the heart of OSS\u2019s mission for the resilience of the Sahara and Sahel.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {fields.map((f) => (
            <div key={f.id} className="h-[430px] w-full">
              <FieldCard
                imageUrl={f.image}
                location={localized(f, 'title', locale)}
                description={localized(f, 'description', locale)}
                themeHue={f.gradient_hue}
                actionLabel={locale === 'fr' ? 'Découvrir' : 'Explore'}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
