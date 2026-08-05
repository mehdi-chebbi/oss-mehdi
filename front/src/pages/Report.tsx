import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import type { Locale } from '@/context/locale';
import { submitReport } from '@/api/auth';

const t = {
  en: {
    title: 'File a complaint',
    subtitle: 'Use this form to file a confidential complaint with OSS.',
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
      <div className="max-w-2xl mx-auto px-6 py-16 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#489e42]/10 mb-6">
          <AlertCircle className="h-7 w-7 text-[#489e42]" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-ink mb-3">{l.success}</h1>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/40 focus:border-[#489e42] focus:outline-none focus:ring-1 focus:ring-[#489e42] transition-colors';
  const labelCls = 'block text-[14px] font-medium text-ink/80 mb-1.5';

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:px-8">
      <h1 className="text-3xl font-bold font-serif text-ink mb-3">{l.title}</h1>
      <p className="text-[15px] text-ink/65 leading-relaxed mb-10">{l.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className={labelCls}>
            {l.categoryLabel} <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            <option value="">—</option>
            {l.categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className={labelCls}>
            {l.subjectLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={l.subjectPlaceholder}
            className={inputCls}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelCls}>
            {l.descriptionLabel} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={l.descriptionPlaceholder}
            className={inputCls + ' resize-y'}
          />
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className={labelCls}>
              {l.nameLabel}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={l.namePlaceholder}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>
              {l.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={l.emailPlaceholder}
              className={inputCls}
            />
          </div>
        </div>

        {/* Anonymous note */}
        <p className="text-[13px] text-ink/50 italic leading-relaxed">{l.anonymousNote}</p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-[#489e42] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#3d7e38] transition-colors duration-200 disabled:opacity-50"
        >
          {submitting ? '…' : l.submit}
        </button>
      </form>
    </div>
  );
}
