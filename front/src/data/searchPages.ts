import type { SearchLocale } from "@/api/search";

interface LocalizedText {
  fr: string;
  en: string;
}

interface StaticPageDefinition {
  id: string;
  path: string;
  title: LocalizedText;
  description: LocalizedText;
  searchText: LocalizedText;
}

export interface PageSearchResult {
  id: string;
  type: "page";
  title: string;
  excerpt: string;
  href: string;
  score: number;
}

const STATIC_PAGES: StaticPageDefinition[] = [
  {
    id: "home",
    path: "",
    title: { fr: "Accueil", en: "Home" },
    description: {
      fr: "Découvrez l'Observatoire du Sahara et du Sahel, ses domaines d'action, ses projets et ses actualités.",
      en: "Discover the Sahara and Sahel Observatory, its areas of action, projects and latest news.",
    },
    searchText: {
      fr: "OSS observatoire sahara sahel environnement coopération résilience pays membres accueil",
      en: "OSS observatory sahara sahel environment cooperation resilience member countries home",
    },
  },
  {
    id: "about",
    path: "/about",
    title: { fr: "À propos de l'OSS", en: "About OSS" },
    description: {
      fr: "Mandat, histoire, mission, siège social, réseau multilatéral et Stratégie 2030 de l'OSS.",
      en: "OSS mandate, history, mission, headquarters, multilateral network and 2030 Strategy.",
    },
    searchText: {
      fr: "organisation internationale vocation africaine mandat histoire mission vision stratégie 2030 programmes structurants siège social Tunis réseau multilatéral",
      en: "international African organization mandate history mission vision 2030 strategy structural programmes headquarters Tunis multilateral network",
    },
  },
  {
    id: "members",
    path: "/members",
    title: { fr: "Membres et partenaires", en: "Members and partners" },
    description: {
      fr: "Les pays et organisations membres qui composent le réseau de coopération de l'OSS.",
      en: "The member countries and organizations that make up the OSS cooperation network.",
    },
    searchText: {
      fr: "pays membres organisations partenaires coopération Afrique Maghreb Sahel réseau institutionnel",
      en: "member countries organizations partners cooperation Africa Maghreb Sahel institutional network",
    },
  },
  {
    id: "governance",
    path: "/governance",
    title: { fr: "Gouvernance", en: "Governance" },
    description: {
      fr: "Les instances de gouvernance, le Conseil d'administration, le Comité d'orientation stratégique et la direction de l'OSS.",
      en: "OSS governing bodies, Board of Directors, Strategic Advisory Committee and executive leadership.",
    },
    searchText: {
      fr: "gouvernance conseil administration comité orientation stratégique présidence vice-présidence secrétaire exécutif instances",
      en: "governance board directors strategic advisory committee chair vice chair executive secretary governing bodies",
    },
  },
  {
    id: "team",
    path: "/team",
    title: { fr: "Notre équipe", en: "Our team" },
    description: {
      fr: "Une équipe multiculturelle et multidisciplinaire qui transforme la connaissance environnementale en action.",
      en: "A multicultural and multidisciplinary team turning environmental knowledge into action.",
    },
    searchText: {
      fr: "équipe capital humain expertise direction technique administratif appui collaborateurs",
      en: "team people expertise direction technical administrative support staff",
    },
  },
  {
    id: "projects",
    path: "/projects",
    title: { fr: "Projets", en: "Projects" },
    description: {
      fr: "Consultez les projets mis en œuvre par l'OSS dans ses différents domaines d'action.",
      en: "Browse projects implemented by OSS across its different areas of action.",
    },
    searchText: {
      fr: "projets programmes initiatives activités terrain portefeuille OSS",
      en: "projects programmes initiatives field activities OSS portfolio",
    },
  },
  {
    id: "news",
    path: "/news",
    title: { fr: "Actualités", en: "News" },
    description: {
      fr: "Retrouvez les actualités, événements, partenariats et activités récentes de l'OSS.",
      en: "Find the latest OSS news, events, partnerships and activities.",
    },
    searchText: {
      fr: "actualités nouvelles événements ateliers partenariats activités institutionnelles opportunités",
      en: "news updates events workshops partnerships activities institutional opportunities",
    },
  },
  {
    id: "biodiversity",
    path: "/domains/biodiversity",
    title: { fr: "Biodiversité", en: "Biodiversity" },
    description: {
      fr: "Préserver la biodiversité, restaurer les écosystèmes et renforcer la résilience.",
      en: "Preserve biodiversity, restore ecosystems and strengthen resilience.",
    },
    searchText: {
      fr: "cadre mondial Kunming Montréal écosystèmes forêts zones humides oasis littoraux aires protégées terres agricoles ODD 15 13 2",
      en: "Kunming Montreal global framework ecosystems forests wetlands oases coasts protected areas agricultural land SDG 15 13 2",
    },
  },
  {
    id: "climate",
    path: "/domains/climate",
    title: { fr: "Climat", en: "Climate" },
    description: {
      fr: "Renforcer la résilience face au changement climatique et accompagner l'adaptation.",
      en: "Strengthen resilience to climate change and support adaptation.",
    },
    searchText: {
      fr: "changement climatique adaptation atténuation résilience Fonds vert climat Fonds adaptation CDN risques alerte précoce Accord Paris CCNUCC",
      en: "climate change adaptation mitigation resilience Green Climate Fund Adaptation Fund NDC risks early warning Paris Agreement UNFCCC",
    },
  },
  {
    id: "water",
    path: "/domains/water",
    title: { fr: "Eau", en: "Water" },
    description: {
      fr: "Garantir la sécurité hydrique, améliorer la gouvernance de l'eau et soutenir la coopération régionale.",
      en: "Ensure water security, improve water governance and support regional cooperation.",
    },
    searchText: {
      fr: "eau sécurité hydrique ressources souterraines surface aquifères partagés SASS ITTAS AMCOW RAOB bassins gouvernance",
      en: "water security groundwater surface water shared aquifers SASS ITTAS AMCOW ANBO basins governance",
    },
  },
  {
    id: "land",
    path: "/domains/land",
    title: { fr: "Terre", en: "Land" },
    description: {
      fr: "Lutter contre la désertification, restaurer les terres dégradées et bâtir la résilience.",
      en: "Combat desertification, restore degraded land and build resilience.",
    },
    searchText: {
      fr: "désertification sécheresse restauration terres dégradées Grande Muraille Verte neutralité dégradation CNULCD ODD 15.3 données satellitaires",
      en: "desertification drought land restoration degraded land Great Green Wall land degradation neutrality UNCCD SDG 15.3 satellite data",
    },
  },
  {
    id: "knowledge-sharing",
    path: "/knowledge-sharing",
    title: { fr: "Partage de connaissances", en: "Knowledge sharing" },
    description: {
      fr: "Le portail public des publications, rapports, études, guides, atlas et documents de l'OSS.",
      en: "The public portal for OSS publications, reports, studies, guides, atlases and documents.",
    },
    searchText: {
      fr: "connaissances publications rapports études guides atlas documents bibliothèque téléchargement",
      en: "knowledge publications reports studies guides atlases documents library download",
    },
  },
  {
    id: "integrity",
    path: "/integrity",
    title: { fr: "Intégrité, transparence et sauvegardes", en: "Integrity, transparency and safeguards" },
    description: {
      fr: "Le cadre institutionnel de l'OSS pour l'éthique, la conformité, les sauvegardes et la gestion fiduciaire.",
      en: "The OSS institutional framework for ethics, compliance, safeguards and fiduciary management.",
    },
    searchText: {
      fr: "intégrité éthique conformité pratiques interdites fraude corruption lanceurs alerte sauvegardes environnementales sociales genre transparence accès information communication fiduciaire marchés",
      en: "integrity ethics compliance prohibited practices fraud corruption whistleblowers environmental social gender safeguards transparency access information communication fiduciary procurement",
    },
  },
  {
    id: "report",
    path: "/report",
    title: { fr: "Déposer une plainte", en: "File a complaint" },
    description: {
      fr: "Déposez une plainte confidentielle ou anonyme auprès de l'OSS.",
      en: "Submit a confidential or anonymous complaint to OSS.",
    },
    searchText: {
      fr: "plainte signalement confidentiel anonyme inconduite fraude corruption harcèlement éthique suivi",
      en: "complaint report confidential anonymous misconduct fraud corruption harassment ethics follow up",
    },
  },
  {
    id: "contact",
    path: "#contact",
    title: { fr: "Contacter l'OSS", en: "Contact OSS" },
    description: {
      fr: "Coordonnées et formulaire pour contacter l'Observatoire du Sahara et du Sahel.",
      en: "Contact details and form for reaching the Sahara and Sahel Observatory.",
    },
    searchText: {
      fr: "contact adresse téléphone email message Tunis Tunisie observatoire",
      en: "contact address phone email message Tunis Tunisia observatory",
    },
  },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchStaticPages(query: string, locale: SearchLocale): PageSearchResult[] {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const otherLocale: SearchLocale = locale === "fr" ? "en" : "fr";

  return STATIC_PAGES.map((page) => {
    const title = normalize(page.title[locale]);
    const otherTitle = normalize(page.title[otherLocale]);
    const content = normalize(`${page.description[locale]} ${page.searchText[locale]}`);
    const otherContent = normalize(`${page.description[otherLocale]} ${page.searchText[otherLocale]}`);
    const allText = `${title} ${otherTitle} ${content} ${otherContent}`;

    if (!terms.every((term) => allText.includes(term))) return null;

    let score = 40;
    if (title === normalizedQuery) score = 100;
    else if (otherTitle === normalizedQuery) score = 95;
    else if (title.startsWith(normalizedQuery)) score = 90;
    else if (otherTitle.startsWith(normalizedQuery)) score = 85;
    else if (title.includes(normalizedQuery)) score = 80;
    else if (otherTitle.includes(normalizedQuery)) score = 75;
    else if (content.includes(normalizedQuery)) score = 50;
    else if (otherContent.includes(normalizedQuery)) score = 45;

    return {
      id: page.id,
      type: "page" as const,
      title: page.title[locale],
      excerpt: page.description[locale],
      href: `/${locale}${page.path}`,
      score,
    };
  })
    .filter((page): page is PageSearchResult => page !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, locale));
}
