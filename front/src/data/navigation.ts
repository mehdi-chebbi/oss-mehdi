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
      {
        label: 'Our fields',
        href: '#nos-domaines',
        children: [
          { label: 'Biodiversity', href: '/en/domains/biodiversity' },
          { label: 'Climate', href: '/en/domains/climate' },
          { label: 'Water', href: '/en/domains/water' },
          { label: 'Land', href: '/en/domains/land' },
        ],
      },
      { label: 'Projects', href: '/en/projects' },
      { label: 'Knowledge sharing', href: '/en/knowledge-sharing' },
      { label: 'News', href: '/en/news' },
      { label: 'Integrity', href: '/en/integrity' },
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
    {
      label: 'Nos domaines',
      href: '#nos-domaines',
      children: [
        { label: 'Biodiversité', href: '/fr/domains/biodiversity' },
        { label: 'Climat', href: '/fr/domains/climate' },
        { label: 'Eau', href: '/fr/domains/water' },
        { label: 'Terre', href: '/fr/domains/land' },
      ],
    },
    { label: 'Projets', href: '/fr/projects' },
    { label: 'Partage de connaissances', href: '/fr/knowledge-sharing' },
    { label: 'Actualités', href: '/fr/news' },
    { label: 'Intégrité', href: '/fr/integrity' },
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
