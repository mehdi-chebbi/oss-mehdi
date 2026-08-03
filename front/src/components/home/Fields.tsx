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
}

const FieldCard = React.forwardRef<HTMLDivElement, FieldCardProps>(
  ({ className, imageUrl, location, description, href = '#', themeHue, ...props }, ref) => {
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
          className="relative block w-full h-full rounded-2xl overflow-hidden shadow-lg
                     transition-all duration-500 ease-in-out
                     group-hover:scale-105 group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]"
          aria-label={`Explore details for ${location}`}
          style={{
            boxShadow: `0 0 40px -15px hsl(var(--theme-color) / 0.5)`,
          }}
        >
          {/* Background Image with Parallax Zoom */}
          <div
            className="absolute inset-0 bg-cover bg-center
                       transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />

          {/* Themed Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, hsl(var(--theme-color) / 0.9), hsl(var(--theme-color) / 0.6) 30%, transparent 60%)`,
            }}
          />

          {/* Content */}
          <div className="relative flex flex-col justify-end items-center text-center h-full p-6 text-white">
            <h3 className="text-3xl font-bold tracking-tight">
              {location}
            </h3>
            {description && (
              <p className="text-sm text-white/80 mt-1 font-medium">{description}</p>
            )}

            {/* Explorer Button */}
            <div className="mt-8 flex items-center justify-center gap-2 bg-[hsl(var(--theme-color)/0.2)] backdrop-blur-md border border-[hsl(var(--theme-color)/0.3)]
                           rounded-lg px-4 py-3
                           transition-all duration-300
                           group-hover:bg-[hsl(var(--theme-color)/0.4)] group-hover:border-[hsl(var(--theme-color)/0.5)]">
              <span className="text-sm font-semibold tracking-wide">Explorer</span>
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
    <section id="nos-domaines" className="bg-bone pt-20 lg:pt-28 pb-4 lg:pb-6">
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
            <div key={f.id} className="w-full h-[450px]">
              <FieldCard
                imageUrl={f.image}
                location={localized(f, 'title', locale)}
                description={localized(f, 'description', locale)}
                themeHue={f.gradient_hue}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
