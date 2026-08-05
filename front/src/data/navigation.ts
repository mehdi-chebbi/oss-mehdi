import type { Locale } from '@/context/locale';
import type { NavItem } from '@/types';

// Navigation is locale-aware: labels switch FR/EN, and the News + Projects items
// link to real /:lang/* routes (not home-page anchors) so they're reachable from any page.
export function getNavItems(locale: Locale): NavItem[] {
  if (locale === 'en') {
    return [
      {
        label: 'About us',
        href: '#qui-sommes-nous',
        children: [
          { label: 'About OSS', href: '/en/about' },
          { label: 'Members & partners', href: '/en/members' },
          { label: 'Governance', href: '/en/governance' },
          { label: 'Our team', href: '/en/team' },
        ],
      },
      { label: 'Our fields', href: '#nos-domaines' },
      { label: 'Projects', href: '/en/projects' },
      { label: 'Knowledge sharing', href: '#partage' },
      { label: 'News', href: '/en/news' },
      { label: 'Integrity', href: '#integrite' },
    ];
  }
  return [
    {
      label: 'Qui sommes-nous',
      href: '#qui-sommes-nous',
      children: [
        { label: "À propos de l'OSS", href: '/fr/about' },
        { label: 'Membres et partenaires', href: '/fr/members' },
        { label: 'Gouvernance', href: '/fr/governance' },
        { label: 'Notre équipe', href: '/fr/team' },
      ],
    },
    { label: 'Nos domaines', href: '#nos-domaines' },
    { label: 'Projets', href: '/fr/projects' },
    { label: 'Partage de connaissances', href: '#partage' },
    { label: 'Actualités', href: '/fr/news' },
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
      { label: 'Opportunities', href: '#opportunites' },
      { label: 'Contact', href: '#contact' },
    ];
  }
  return [
    { label: 'Qui sommes-nous', href: '#qui-sommes-nous' },
    { label: 'Nos domaines', href: '#nos-domaines' },
    { label: 'Actualités', href: '/fr/news' },
    { label: 'Nos outils', href: '#' },
    { label: 'Partenaires', href: '#partenaires' },
    { label: 'Opportunités', href: '#opportunites' },
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
