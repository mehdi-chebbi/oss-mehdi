import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { Locale } from '@/context/locale';
import { submitReport } from '@/api/auth';

const t = {
  en: {
    title: 'File a complaint',
    subtitle: 'Use this form to file a confidential complaint with OSS.',
    kicker: 'Ethics & integrity',
    privacyTitle: 'Confidentiality',
    privacyPoints: [
      { title: 'Confidential handling', text: 'The information provided is intended solely for reviewing and following up on your complaint.' },
      { title: 'Anonymous submission', text: 'No name or email address is required to submit this form.' },
      { title: 'Optional follow-up', text: 'If you provide contact details, they may be used to request clarification about your complaint.' },
    ],
    categoryLabel: 'Type of complaint',
    categories: [
      { value: 'complaint', label: 'General complaint' },
      { value: 'misconduct', label: 'Misconduct' },
      { value: 'fraud', label: 'Fraud / Corruption' },
      { value: 'harassment', label: 'Harassment' },
      { value: 'other', label: 'Other' },
    ],
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Brief summary of the issue',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Provide as much detail as possible…',
    nameLabel: 'Your name (optional)',
    namePlaceholder: 'Jane Doe',
    emailLabel: 'Your email (optional)',
    emailPlaceholder: 'jane@example.com',
    anonymousNote: 'You may file this complaint anonymously. However, providing contact information allows us to follow up.',
    submit: 'Submit complaint',
    success: 'Your complaint has been submitted. Thank you.',
    required: 'Required',
  },
  fr: {
    title: 'Déposer une plainte',
    subtitle: 'Utilisez ce formulaire pour déposer une plainte en toute confidentialité auprès de l\'OSS.',
    kicker: 'Éthique & intégrité',
    privacyTitle: 'Confidentialité',
    privacyPoints: [
      { title: 'Traitement confidentiel', text: 'Les informations transmises sont exclusivement destinées à l’examen et au suivi de votre plainte.' },
      { title: 'Dépôt anonyme', text: 'Aucun nom ni aucune adresse email ne sont exigés pour envoyer ce formulaire.' },
      { title: 'Suivi facultatif', text: 'Si vous fournissez vos coordonnées, elles pourront servir à demander des précisions sur votre plainte.' },
    ],
    categoryLabel: 'Nature de la plainte',
    categories: [
      { value: 'complaint', label: 'Plainte générale' },
      { value: 'misconduct', label: 'Inconduite' },
      { value: 'fraud', label: 'Fraude / Corruption' },
      { value: 'harassment', label: 'Harcèlement' },
      { value: 'other', label: 'Autre' },
    ],
    subjectLabel: 'Objet',
    subjectPlaceholder: 'Résumé bref du problème',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Fournissez autant de détails que possible…',
    nameLabel: 'Votre nom (facultatif)',
    namePlaceholder: 'Jean Dupont',
    emailLabel: 'Votre email (facultatif)',
    emailPlaceholder: 'jean@example.com',
    anonymousNote: 'Vous pouvez déposer cette plainte anonymement. Toutefois, fournir des coordonnées nous permet de faire un suivi.',
    submit: 'Déposer la plainte',
    success: 'Votre plainte a bien été déposée. Merci.',
    required: 'Obligatoire',
  },
} as const;

export default function Report() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const l = t[locale];

  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitReport({
        category,
        subject,
        description,
        name: name || undefined,
        email: email || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="font-oss flex min-h-[60vh] items-center justify-center bg-oss-paper px-6 py-20 text-center">
        <div className="relative w-full max-w-xl overflow-hidden border-l-4 border-oss-green bg-white p-8 sm:p-12">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center bg-oss-green/10">
            <CheckCircle2 className="h-7 w-7 text-oss-green" />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-oss-green">{l.privacyTitle}</p>
          <h1 className="text-2xl font-bold leading-snug text-oss-blue-dark sm:text-3xl">{l.success}</h1>
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full border border-oss-line bg-oss-paper px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-oss-blue focus:bg-white';
  const labelCls = 'mb-2 block text-[13px] font-bold text-oss-blue-dark';

  return (
    <div className="font-oss min-h-screen overflow-hidden bg-oss-paper pb-24 text-ink antialiased selection:bg-oss-blue selection:text-white lg:pb-28">
      <section className="mx-auto max-w-[1400px] px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-20">
        <p className="oss-kicker mb-5">{l.kicker}</p>
        <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">{l.title}</h1>
        <p className="mt-7 max-w-2xl border-l-4 border-oss-ochre pl-6 text-base leading-relaxed text-ink/68 sm:text-lg">{l.subtitle}</p>
      </section>

      <section className="mx-auto grid max-w-[1400px] px-6 sm:px-8 lg:grid-cols-[0.62fr_1.38fr] lg:px-12">
        <aside className="relative overflow-hidden bg-oss-blue-dark p-7 text-white sm:p-9 lg:p-10">
          <ShieldCheck className="h-9 w-9 text-oss-ochre" />
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.1em] text-oss-blue-light">{l.privacyTitle}</p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/70">{l.anonymousNote}</p>
          <div className="mt-9 space-y-6 border-t border-white/15 pt-7">
            {l.privacyPoints.map((point, index) => (
              <div key={point.title} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="text-xs font-bold text-oss-ochre">0{index + 1}</span>
                <div>
                  <h2 className="text-sm font-bold text-white">{point.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/58">{point.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 grid h-2 grid-cols-3" aria-hidden="true">
            <span className="bg-oss-blue" />
            <span className="bg-oss-green" />
            <span className="bg-oss-ochre" />
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-7 sm:p-9 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.07em] text-ink/38"><span className="text-red-600">*</span> {l.required}</p>

          <div>
            <label htmlFor="category" className={labelCls}>{l.categoryLabel} <span className="text-red-600">*</span></label>
            <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              <option value="">—</option>
              {l.categories.map((categoryOption) => (
                <option key={categoryOption.value} value={categoryOption.value}>{categoryOption.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className={labelCls}>{l.subjectLabel} <span className="text-red-600">*</span></label>
            <input id="subject" type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={l.subjectPlaceholder} className={inputCls} />
          </div>

          <div>
            <label htmlFor="description" className={labelCls}>{l.descriptionLabel} <span className="text-red-600">*</span></label>
            <textarea id="description" required rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={l.descriptionPlaceholder} className={`${inputCls} resize-y`} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelCls}>{l.nameLabel}</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={l.namePlaceholder} className={inputCls} />
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>{l.emailLabel}</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={l.emailPlaceholder} className={inputCls} />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center justify-center bg-oss-blue px-7 py-3 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-oss-blue-dark disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? '…' : l.submit}
          </button>
        </form>
      </section>
    </div>
  );
}
