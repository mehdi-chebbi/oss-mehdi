import type { Locale } from '@/context/locale';
import type { NavItem } from '@/types';

// Navigation is locale-aware: labels switch FR/EN, and the News item links to
// the real /:lang/news route (not a home-page anchor) so it's reachable from any page.
export function getNavItems(locale: Locale): NavItem[] {
  if (locale === 'en') {
    return [
      { label: 'About us', href: '#qui-sommes-nous' },
      { label: 'Our fields', href: '#nos-domaines' },
      { label: 'Projects', href: '#projets' },
      { label: 'Knowledge sharing', href: '#partage' },
      { label: 'News', href: '/en/news' },
      { label: 'Opportunities', href: '#opportunites' },
      { label: 'Integrity', href: '#integrite' },
    ];
  }
  return [
    { label: 'Qui sommes-nous', href: '#qui-sommes-nous' },
    { label: 'Nos domaines', href: '#nos-domaines' },
    { label: 'Projets', href: '#projets' },
    { label: 'Partage de connaissances', href: '#partage' },
    { label: 'Actualités', href: '/fr/news' },
    { label: 'Opportunités', href: '#opportunites' },
    { label: 'Intégrité', href: '#integrite' },
  ];
}

export function getFooterNavLinks(locale: Locale): NavItem[] {
  if (locale === 'en') {
    return [
      { label: 'About us', href: '#qui-sommes-nous' },
      { label: 'Our fields', href: '#nos-domaines' },
      { label: 'News', href: '/en/news' },
      { label: 'Our tools', href: '#' },
      { label: 'Partners', href: '#partenaires' },
      { label: 'Contact', href: '#contact' },
    ];
  }
  return [
    { label: 'Qui sommes-nous', href: '#qui-sommes-nous' },
    { label: 'Nos domaines', href: '#nos-domaines' },
    { label: 'Actualités', href: '/fr/news' },
    { label: 'Nos outils', href: '#' },
    { label: 'Partenaires', href: '#partenaires' },
    { label: 'Contact', href: '#contact' },
  ];
}

export function getLegalLinks(locale: Locale): NavItem[] {
  if (locale === 'en') {
    return [
      { label: 'Legal notice', href: '#' },
      { label: 'Privacy policy', href: '#' },
      { label: 'Sitemap', href: '#' },
    ];
  }
  return [
    { label: 'Mentions légales', href: '#' },
    { label: 'Politique de confidentialité', href: '#' },
    { label: 'Plan du site', href: '#' },
  ];
}
