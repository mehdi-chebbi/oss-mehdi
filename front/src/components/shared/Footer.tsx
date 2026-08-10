import { useState } from 'react';
import { Check, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { contactInfo } from '@/data/contact';
import { getFooterNavLinks, getLegalLinks } from '@/data/navigation';
import { socials } from '@/data/socials';
import type { Locale } from '@/context/locale';
import BrandBands from './BrandBands';

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

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
    setEmail('');
    window.setTimeout(() => setSubscribed(false), 4000);
  };

  const footerLink = (href: string, label: string, className: string) => href.startsWith('/')
    ? <Link to={href} className={className}>{label}</Link>
    : <a href={href} className={className}>{label}</a>;

  return (
    <footer className="font-oss mt-auto bg-oss-blue-dark text-white">
      <BrandBands />
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.8fr_1fr_1.15fr] lg:gap-12 lg:py-16">
          <div>
            <div className="inline-block bg-white p-3">
              <img src="/logo-h.webp" alt="Observatoire du Sahara et du Sahel" className="h-16 w-auto" />
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/68">
              {locale === 'en'
                ? 'The Sahara and Sahel Observatory supporting sustainable development in Africa.'
                : "L'Observatoire du Sahara et du Sahel au service du développement durable en Afrique."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a key={social.name} href={social.href} aria-label={social.name} className="grid h-9 w-9 place-items-center border border-white/25 text-white/70 transition-colors hover:border-oss-ochre hover:bg-oss-ochre hover:text-oss-blue-dark">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={social.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="border-b border-white/15 pb-3 text-sm font-bold uppercase tracking-[0.1em] text-oss-ochre">Navigation</h2>
            <ul className="mt-5 grid gap-3">
              {footerNavLinks.map((link) => (
                <li key={link.label}>{footerLink(link.href, link.label, 'text-sm text-white/70 transition-colors hover:text-white')}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="border-b border-white/15 pb-3 text-sm font-bold uppercase tracking-[0.1em] text-oss-ochre">Contact</h2>
            <ul className="mt-5 grid gap-4">
              {contactInfo.map((item) => {
                const Icon = iconMap[item.label] ?? MapPin;
                return (
                  <li key={item.label} className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-oss-blue-light" />
                    <span>{item.value}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="border-b border-white/15 pb-3 text-sm font-bold uppercase tracking-[0.1em] text-oss-ochre">Newsletter</h2>
            <p className="mt-5 text-sm leading-relaxed text-white/68">
              {locale === 'en' ? 'Receive our latest news and publications.' : 'Recevez nos dernières actualités et publications.'}
            </p>
            {subscribed ? (
              <div className="mt-4 flex items-start gap-2 border border-oss-teal/40 bg-oss-teal/10 p-3 text-sm text-white">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-oss-teal" />
                {locale === 'en' ? 'Your subscription has been registered.' : 'Votre inscription a bien été prise en compte.'}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 grid gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={locale === 'en' ? 'Your email address' : 'Votre adresse email'}
                  aria-label={locale === 'en' ? 'Email address' : 'Adresse email'}
                  className="min-h-11 border border-white/25 bg-white/8 px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-oss-ochre"
                />
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 bg-oss-ochre px-4 text-sm font-bold text-oss-blue-dark transition-colors hover:bg-white">
                  <Send className="h-4 w-4" />
                  {locale === 'en' ? 'Subscribe' : "S'abonner"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} OSS - {locale === 'en' ? 'Sahara and Sahel Observatory. All rights reserved.' : 'Observatoire du Sahara et du Sahel. Tous droits réservés.'}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <a key={link.label} href={link.href} className="transition-colors hover:text-white">{link.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
