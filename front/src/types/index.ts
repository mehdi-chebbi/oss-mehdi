// ---- Navigation ----

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// ---- Social ----

export interface SocialLink {
  name: string;
  href: string;
  path: string;
}

// ---- Contact ----

export interface ContactInfo {
  icon: string; // lucide icon name
  label: string;
  value: string;
}

// ---- Stats ----

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

// ---- Fields ----

export interface FieldData {
  imageUrl: string;
  location: string;
  href: string;
  themeColor: string;
}

// ---- Tools ----

export interface ToolSlide {
  title: string;
  desc: string;
  image: string;
  imgPosition?: boolean;
  link: string;
}

// ---- Partners ----

export interface Partner {
  name: string;
  logo: string;
}

// ---- News ----

export interface NewsArticle {
  title: string;
  href: string;
  imageUrl: string;
  dek?: string;
  date?: string;
}
