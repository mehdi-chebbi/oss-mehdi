import { useState } from 'react';
import { ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { contactInfo } from '@/data/contact';

// Map label to icon component
const iconMap: Record<string, React.ElementType> = {
  Adresse: MapPin,
  Téléphone: Phone,
  Email: Mail,
  Horaires: Clock,
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="bg-[#E5E1D8] pt-4 lg:pt-6 pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <div className="mb-10 lg:mb-12 max-w-2xl">
          <div className="h-1 w-12 bg-[#489e42] mb-5" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-tight">
            Contactez-nous
          </h2>
        </div>

        {/* Two-column: info + form */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
          {/* Left — contact info */}
          <div className="flex flex-col gap-8">
            <p className="font-serif text-[19px] text-ink/55 leading-[1.5]">
              Une question, une proposition de partenariat ou une demande
              d&apos;information ? Écrivez-nous, notre équipe vous répondra dans les
              meilleurs délais.
            </p>

            <ul className="flex flex-col gap-6">
              {contactInfo.map((item) => {
                const Icon = iconMap[item.label];
                return (
                  <li key={item.label} className="flex items-start gap-4">
                    <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-[#489e42]/10 text-[#489e42]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-ink/40 mb-1">
                        {item.label}
                      </div>
                      <div className="text-[15px] text-ink leading-snug">
                        {item.value}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right — form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] p-8 rounded-2xl border border-[#489e42]/20 bg-[#489e42]/5">
                <div className="w-14 h-14 rounded-full bg-[#489e42] flex items-center justify-center text-white mb-5">
                  <ArrowRight className="h-6 w-6 -rotate-45" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-ink mb-2">
                  Message envoyé
                </h3>
                <p className="text-ink/55 text-sm max-w-sm">
                  Merci pour votre message. Notre équipe vous répondra dans les
                  meilleurs délais.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="text-[12px] font-semibold tracking-wide uppercase text-ink/60"
                    >
                      Nom complet
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Votre nom"
                      className="px-4 py-3 rounded-lg border border-ink/15 bg-white text-ink placeholder:text-ink/30 text-[15px] focus:outline-none focus:border-[#489e42] focus:ring-2 focus:ring-[#489e42]/15 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-[12px] font-semibold tracking-wide uppercase text-ink/60"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="vous@exemple.com"
                      className="px-4 py-3 rounded-lg border border-ink/15 bg-white text-ink placeholder:text-ink/30 text-[15px] focus:outline-none focus:border-[#489e42] focus:ring-2 focus:ring-[#489e42]/15 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="subject"
                    className="text-[12px] font-semibold tracking-wide uppercase text-ink/60"
                  >
                    Sujet
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="Objet de votre message"
                    className="px-4 py-3 rounded-lg border border-ink/15 bg-white text-ink placeholder:text-ink/30 text-[15px] focus:outline-none focus:border-[#489e42] focus:ring-2 focus:ring-[#489e42]/15 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="message"
                    className="text-[12px] font-semibold tracking-wide uppercase text-ink/60"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Votre message..."
                    className="px-4 py-3 rounded-lg border border-ink/15 bg-white text-ink placeholder:text-ink/30 text-[15px] focus:outline-none focus:border-[#489e42] focus:ring-2 focus:ring-[#489e42]/15 transition-colors resize-y min-h-[140px]"
                  />
                </div>

                <button
                  type="submit"
                  className="group self-start inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#489e42] text-white text-[15px] font-semibold tracking-tight transition-colors hover:bg-[#3fa838] focus:outline-none focus:ring-2 focus:ring-[#489e42]/30 focus:ring-offset-2 focus:ring-offset-[#E5E1D8]"
                >
                  Envoyer le message
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
