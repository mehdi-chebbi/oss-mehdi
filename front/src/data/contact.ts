import type { Locale } from '@/context/locale';

export type ContactInfoKind = 'address' | 'phone' | 'email' | 'hours';

export interface ContactInfoItem {
  kind: ContactInfoKind;
  label: string;
  value: string;
}

export function getContactInfo(locale: Locale): ContactInfoItem[] {
  if (locale === 'en') {
    return [
      {
        kind: 'address',
        label: 'Address',
        value: 'Boulevard du Leader Yasser Arafat, BP 31, 1080 Tunis Cedex, Tunisia',
      },
      {
        kind: 'phone',
        label: 'Phone',
        value: '+216 71 206 625',
      },
      {
        kind: 'email',
        label: 'Email',
        value: 'contact@oss-online.org',
      },
      {
        kind: 'hours',
        label: 'Hours',
        value: 'Monday - Friday, 8:30 AM - 5:00 PM (CET)',
      },
    ];
  }

  return [
    {
      kind: 'address',
      label: 'Adresse',
      value: 'Boulevard du Leader Yasser Arafat, BP 31, 1080 Tunis Cedex, Tunisie',
    },
    {
      kind: 'phone',
      label: 'Téléphone',
      value: '+216 71 206 625',
    },
    {
      kind: 'email',
      label: 'Email',
      value: 'contact@oss-online.org',
    },
    {
      kind: 'hours',
      label: 'Horaires',
      value: 'Lundi - Vendredi, 8h30 - 17h00 (CET)',
    },
  ];
}
