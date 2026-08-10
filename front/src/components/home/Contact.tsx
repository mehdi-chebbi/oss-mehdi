import { useState } from 'react';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { contactInfo } from '@/data/contact';
import type { Locale } from '@/context/locale';

const iconMap: Record<string, React.ElementType> = {
  Adresse: MapPin,
  Téléphone: Phone,
  Email: Mail,
  Horaires: Clock,
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  const labels = locale === 'en'
    ? { title: 'Contact us', intro: 'A question, partnership proposal or information request? Our team is ready to help.', name: 'Full name', namePlaceholder: 'Your name', subject: 'Subject', subjectPlaceholder: 'Subject of your message', message: 'Message', messagePlaceholder: 'Your message...', send: 'Send message', sent: 'Message sent', thanks: 'Thank you for your message. Our team will reply as soon as possible.' }
    : { title: 'Contactez-nous', intro: 'Une question, une proposition de partenariat ou une demande d’information ? Notre équipe est à votre écoute.', name: 'Nom complet', namePlaceholder: 'Votre nom', subject: 'Sujet', subjectPlaceholder: 'Objet de votre message', message: 'Message', messagePlaceholder: 'Votre message...', send: 'Envoyer le message', sent: 'Message envoyé', thanks: 'Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais.' };

  return (
    <section id="contact" className="bg-oss-paper pb-20 pt-10 lg:pb-24 lg:pt-12">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <p className="oss-kicker mb-4">{locale === 'en' ? 'Get in touch' : 'Échangeons'}</p>
          <h2 className="oss-section-title">{labels.title}</h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <div className="bg-oss-blue-dark p-7 text-white sm:p-9">
            <p className="border-l-4 border-oss-ochre pl-5 text-lg leading-relaxed text-white/80">{labels.intro}</p>
            <ul className="mt-9 grid gap-6">
              {contactInfo.map((item) => {
                const Icon = iconMap[item.label] ?? MapPin;
                return (
                  <li key={item.label} className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center bg-oss-blue text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-oss-ochre">{item.label}</div>
                      <div className="mt-1 text-sm leading-relaxed text-white/78">{item.value}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {submitted ? (
            <div className="flex min-h-[400px] flex-col items-start justify-center border border-oss-blue/20 bg-oss-blue/5 p-8">
              <div className="grid h-12 w-12 place-items-center bg-oss-blue text-white"><ArrowRight className="h-5 w-5 -rotate-45" /></div>
              <h3 className="mt-6 text-2xl font-bold text-oss-blue-dark">{labels.sent}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/65">{labels.thanks}</p>
            </div>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="grid gap-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark" htmlFor="name">
                  {labels.name}
                  <input id="name" name="name" type="text" required placeholder={labels.namePlaceholder} className="min-h-12 border border-oss-blue/25 bg-white px-4 text-[15px] font-normal normal-case tracking-normal text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-oss-blue focus:ring-2 focus:ring-oss-blue/10" />
                </label>
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark" htmlFor="email">
                  Email
                  <input id="email" name="email" type="email" required placeholder="vous@exemple.com" className="min-h-12 border border-oss-blue/25 bg-white px-4 text-[15px] font-normal normal-case tracking-normal text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-oss-blue focus:ring-2 focus:ring-oss-blue/10" />
                </label>
              </div>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark" htmlFor="subject">
                {labels.subject}
                <input id="subject" name="subject" type="text" required placeholder={labels.subjectPlaceholder} className="min-h-12 border border-oss-blue/25 bg-white px-4 text-[15px] font-normal normal-case tracking-normal text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-oss-blue focus:ring-2 focus:ring-oss-blue/10" />
              </label>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-oss-blue-dark" htmlFor="message">
                {labels.message}
                <textarea id="message" name="message" required rows={6} placeholder={labels.messagePlaceholder} className="min-h-36 resize-y border border-oss-blue/25 bg-white px-4 py-3 text-[15px] font-normal normal-case tracking-normal text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-oss-blue focus:ring-2 focus:ring-oss-blue/10" />
              </label>
              <button type="submit" className="inline-flex min-h-12 w-fit items-center gap-2 bg-oss-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark focus:outline-none focus:ring-2 focus:ring-oss-blue focus:ring-offset-2">
                {labels.send}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
