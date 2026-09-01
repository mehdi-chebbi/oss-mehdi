import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, Check, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getContactInfo, type ContactInfoKind } from '@/data/contact';
import { getFooterNavLinks } from '@/data/navigation';
import type { Locale } from '@/context/locale';
import BrandBands from './BrandBands';
import { subscribeToNewsletter } from '@/api/mail';
import { getSocials, type SocialData } from '@/api/auth';

const iconMap: Record<ContactInfoKind, React.ElementType> = {
  address: MapPin,
  phone: Phone,
  email: Mail,
  hours: Clock,
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(false);
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const contactInfo = getContactInfo(locale);
  const footerNavLinks = getFooterNavLinks(locale);
  const { data: socials = [] } = useQuery<SocialData[]>({
    queryKey: ['socials'],
    queryFn: getSocials,
    staleTime: Infinity,
  });

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribing(true);
    setSubscriptionError(false);
    try {
      await subscribeToNewsletter(email, locale);
      setSubscribed(true);
      setEmail('');
    } catch {
      setSubscriptionError(true);
    } finally {
      setSubscribing(false);
    }
  };

  const footerLink = (href: string, label: string, className: string) => href.startsWith('/')
    ? <Link to={href} className={className}>{label}</Link>
    : <a href={href} className={className}>{label}</a>;

  return (
    <footer className="font-oss mt-auto bg-oss-blue-dark text-white">
      <BrandBands />
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.2fr_1fr_1.15fr] lg:gap-12 lg:py-16">
          <div>
            <div className="inline-block p-3">
              <img src="/logo-h.webp" alt="Observatoire du Sahara et du Sahel" className="h-16 w-auto" />
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/68">
              {locale === 'en'
                ? <>The Sahara and Sahel Observatory<br />supporting sustainable development in Africa.</>
                : <>{"L'Observatoire du Sahara et du Sahel"}<br />au service du développement durable en Afrique.</>}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a key={social.id} href={social.url} aria-label={social.platform} className="grid h-9 w-9 place-items-center border border-white/25 text-white/70 transition-colors hover:border-oss-ochre hover:bg-oss-ochre hover:text-oss-blue-dark">
                  {social.icon_file ? (
                    <img
                      src={social.icon_file}
                      alt=""
                      width="15"
                      height="15"
                      className="h-[15px] w-[15px] object-contain"
                    />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={social.icon_svg} />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="border-b border-white/15 pb-3 text-sm font-bold uppercase tracking-[0.1em] text-oss-ochre">Navigation</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
              {footerNavLinks.map((link) => (
                <li key={link.label}>{footerLink(link.href, link.label, 'text-sm text-white/70 transition-colors hover:text-white')}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="border-b border-white/15 pb-3 text-sm font-bold uppercase tracking-[0.1em] text-oss-ochre">Contact</h2>
            <ul className="mt-5 grid gap-4">
              {contactInfo.map((item) => {
                const Icon = iconMap[item.kind];
                return (
                  <li key={item.label} className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-oss-blue-light" />
                    <span>{item.value}</span>
                  </li>
                );
              })}
            </ul>
            <Link
              to={`/${locale}/contact`}
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 border border-white/30 px-4 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-oss-blue-dark active:-translate-y-px"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {locale === 'en' ? 'Contact us' : 'Nous contacter'}
            </Link>
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
                  disabled={subscribing}
                  className="min-h-11 border border-white/25 bg-white/8 px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-oss-ochre"
                />
                {subscriptionError && <p role="alert" className="text-xs font-semibold text-red-200">{locale === 'en' ? 'Subscription failed. Please try again.' : 'L’inscription a échoué. Veuillez réessayer.'}</p>}
                <button type="submit" disabled={subscribing} className="inline-flex min-h-11 items-center justify-center gap-2 bg-oss-ochre px-4 text-sm font-bold text-oss-blue-dark transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60">
                  <Send className="h-4 w-4" />
                  {subscribing ? (locale === 'en' ? 'Subscribing…' : 'Inscription…') : (locale === 'en' ? 'Subscribe' : "S'abonner")}
                </button>
              </form>
            )}
            <a
              href="https://application.oss-online.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-white/30 px-4 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-oss-blue-dark active:-translate-y-px"
            >
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              {locale === 'en' ? 'Opportunities' : 'Opportunités'}
            </a>
          </div>
        </div>

        <div className="border-t border-white/15 py-6 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} OSS - {locale === 'en' ? 'Sahara and Sahel Observatory. All rights reserved.' : 'Observatoire du Sahara et du Sahel. Tous droits réservés.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
