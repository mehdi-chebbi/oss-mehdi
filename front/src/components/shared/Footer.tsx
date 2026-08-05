import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, Check, AlertCircle } from 'lucide-react';
import { socials } from '@/data/socials';
import { getFooterNavLinks, getLegalLinks } from '@/data/navigation';
import { contactInfo } from '@/data/contact';
import type { Locale } from '@/context/locale';

// Map label to icon component (keys are locale-stable identifiers, not display labels)
const iconMap: Record<string, React.ElementType> = {
  Adresse: MapPin,
  Téléphone: Phone,
  Email: Mail,
  Horaires: Clock,
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  const footerNavLinks = getFooterNavLinks(locale);
  const legalLinks = getLegalLinks(locale);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  // Helper: render a nav link — route links use <Link>, anchors use <a>
  const renderNavLink = (href: string, label: string, className: string, onClick?: () => void) => {
    if (href.startsWith('/')) {
      return (
        <Link to={href} className={className} onClick={onClick}>
          {label}
        </Link>
      );
    }
    return (
      <a href={href} className={className} onClick={onClick}>
        {label}
      </a>
    );
  };

  return (
    <footer className="mt-auto bg-[#f3f2ec] border-t border-[#489e42]/40">
      <div className="max-w-7xl mx-auto px-6">
        {/* ---- Main grid: Brand | Navigation | Contact | Newsletter ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 py-10 lg:py-12">
          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src="/logo-h.webp"
              alt="Observatoire du Sahara et du Sahel"
              className="h-[72px] w-auto mb-5"
            />
            <p className="font-serif text-[15px] text-ink/60 leading-[1.55] mb-6 max-w-xs">
              {locale === 'en'
                ? 'The Sahara and Sahel Observatory at the service of sustainable development in Africa.'
                : "L'Observatoire du Sahara et du Sahel au service du développement durable en Afrique."}
            </p>
            <div className="flex items-center gap-1.5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="grid place-items-center h-9 w-9 rounded-full bg-ink/5 text-ink/55 hover:bg-[#489e42] hover:text-white transition-colors duration-200"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <h3 className="font-serif font-bold text-ink text-lg mb-5">
              {locale === 'en' ? 'Navigation' : 'Navigation'}
            </h3>
            <ul className="space-y-3">
              {footerNavLinks.map((l) => (
                <li key={l.label}>
                  {renderNavLink(
                    l.href,
                    l.label,
                    'text-[15px] text-ink/60 hover:text-[#489e42] transition-colors duration-150',
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h3 className="font-serif font-bold text-ink text-lg mb-5">
              {locale === 'en' ? 'Contact' : 'Contact'}
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((item) => {
                const Icon = iconMap[item.label];
                return (
                  <li key={item.label} className="flex items-start gap-3">
                    {Icon && <Icon className="h-4 w-4 mt-0.5 shrink-0 text-[#489e42]" />}
                    {item.label === 'Téléphone' ? (
                      <a href="tel:+21671206625" className="text-[14px] text-ink/65 hover:text-[#489e42] transition-colors">
                        {item.value}
                      </a>
                    ) : item.label === 'Email' ? (
                      <a href="mailto:contact@oss-online.org" className="text-[14px] text-ink/65 hover:text-[#489e42] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-[14px] text-ink/65 leading-relaxed">
                        {item.value}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4 — Newsletter */}
          <div>
            <h3 className="font-serif font-bold text-ink text-lg mb-3">
              {locale === 'en' ? 'Newsletter' : 'Newsletter'}
            </h3>
            <p className="text-[14px] text-ink/60 leading-relaxed mb-4">
              {locale === 'en'
                ? 'Stay informed about our news and latest publications.'
                : 'Restez informé de nos actualités et de nos dernières publications.'}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-md bg-[#489e42]/10 px-4 py-3 text-[#3d7e38]">
                <Check className="h-4 w-4 shrink-0" />
                <span className="text-[14px] font-medium">
                  {locale === 'en'
                    ? 'Thank you! Your subscription has been registered.'
                    : 'Merci ! Votre inscription a bien été prise en compte.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={locale === 'en' ? 'Your email address' : 'Votre adresse email'}
                  aria-label={locale === 'en' ? 'Email address' : 'Adresse email'}
                  className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink/40 focus:border-[#489e42] focus:outline-none focus:ring-1 focus:ring-[#489e42] transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#3183d4] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#2a6db8] transition-colors duration-200"
                >
                  <Send className="h-3.5 w-3.5" />
                  {locale === 'en' ? 'Subscribe' : "S'abonner"}
                </button>
              </form>
            )}
            <div className="mt-5 border-t border-ink/10 pt-4">
              <h3 className="font-serif font-bold text-ink text-base mb-1.5">
                {locale === 'en' ? 'Complaints' : 'Plaintes'}
              </h3>
              <p className="text-[13px] text-ink/60 leading-snug mb-3">
                {locale === 'en'
                  ? 'Submit a confidential complaint to OSS.'
                  : 'Déposez une plainte en toute confidentialité auprès de l’OSS.'}
              </p>
              <Link
                to={`/${locale}/report`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {locale === 'en' ? 'File a complaint' : 'Déposer une plainte'}
              </Link>
            </div>
          </div>
        </div>

        {/* ---- Bottom bar ---- */}
        <div className="border-t border-ink/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-ink/50 text-center sm:text-left">
            {locale === 'en'
              ? `© ${new Date().getFullYear()} OSS — Sahara and Sahel Observatory. All rights reserved.`
              : `© ${new Date().getFullYear()} OSS — Observatoire du Sahara et du Sahel. Tous droits réservés.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[13px] text-ink/50 hover:text-[#489e42] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
