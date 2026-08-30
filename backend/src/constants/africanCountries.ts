export interface AfricanCountry {
  iso_code: string;
  name_fr: string;
  name_en: string;
}

// Fixed reference catalogue. Projects persist only these ISO 3166-1 alpha-2 codes.
export const AFRICAN_COUNTRIES: readonly AfricanCountry[] = [
  { iso_code: "ZA", name_fr: "Afrique du Sud", name_en: "South Africa" },
  { iso_code: "DZ", name_fr: "Algérie", name_en: "Algeria" },
  { iso_code: "AO", name_fr: "Angola", name_en: "Angola" },
  { iso_code: "BJ", name_fr: "Bénin", name_en: "Benin" },
  { iso_code: "BW", name_fr: "Botswana", name_en: "Botswana" },
  { iso_code: "BF", name_fr: "Burkina Faso", name_en: "Burkina Faso" },
  { iso_code: "BI", name_fr: "Burundi", name_en: "Burundi" },
  { iso_code: "CM", name_fr: "Cameroun", name_en: "Cameroon" },
  { iso_code: "CV", name_fr: "Cabo Verde", name_en: "Cabo Verde" },
  { iso_code: "KM", name_fr: "Comores", name_en: "Comoros" },
  { iso_code: "CG", name_fr: "Congo", name_en: "Republic of the Congo" },
  { iso_code: "CI", name_fr: "Côte d'Ivoire", name_en: "Côte d'Ivoire" },
  { iso_code: "DJ", name_fr: "Djibouti", name_en: "Djibouti" },
  { iso_code: "EG", name_fr: "Égypte", name_en: "Egypt" },
  { iso_code: "ER", name_fr: "Érythrée", name_en: "Eritrea" },
  { iso_code: "SZ", name_fr: "Eswatini", name_en: "Eswatini" },
  { iso_code: "ET", name_fr: "Éthiopie", name_en: "Ethiopia" },
  { iso_code: "GA", name_fr: "Gabon", name_en: "Gabon" },
  { iso_code: "GM", name_fr: "Gambie", name_en: "Gambia" },
  { iso_code: "GH", name_fr: "Ghana", name_en: "Ghana" },
  { iso_code: "GN", name_fr: "Guinée", name_en: "Guinea" },
  { iso_code: "GQ", name_fr: "Guinée équatoriale", name_en: "Equatorial Guinea" },
  { iso_code: "GW", name_fr: "Guinée-Bissau", name_en: "Guinea-Bissau" },
  { iso_code: "KE", name_fr: "Kenya", name_en: "Kenya" },
  { iso_code: "LS", name_fr: "Lesotho", name_en: "Lesotho" },
  { iso_code: "LR", name_fr: "Liberia", name_en: "Liberia" },
  { iso_code: "LY", name_fr: "Libye", name_en: "Libya" },
  { iso_code: "MG", name_fr: "Madagascar", name_en: "Madagascar" },
  { iso_code: "MW", name_fr: "Malawi", name_en: "Malawi" },
  { iso_code: "ML", name_fr: "Mali", name_en: "Mali" },
  { iso_code: "MA", name_fr: "Maroc", name_en: "Morocco" },
  { iso_code: "MU", name_fr: "Maurice", name_en: "Mauritius" },
  { iso_code: "MR", name_fr: "Mauritanie", name_en: "Mauritania" },
  { iso_code: "MZ", name_fr: "Mozambique", name_en: "Mozambique" },
  { iso_code: "NA", name_fr: "Namibie", name_en: "Namibia" },
  { iso_code: "NE", name_fr: "Niger", name_en: "Niger" },
  { iso_code: "NG", name_fr: "Nigeria", name_en: "Nigeria" },
  { iso_code: "UG", name_fr: "Ouganda", name_en: "Uganda" },
  { iso_code: "CD", name_fr: "République démocratique du Congo", name_en: "Democratic Republic of the Congo" },
  { iso_code: "CF", name_fr: "République centrafricaine", name_en: "Central African Republic" },
  { iso_code: "RW", name_fr: "Rwanda", name_en: "Rwanda" },
  { iso_code: "ST", name_fr: "Sao Tomé-et-Principe", name_en: "Sao Tome and Principe" },
  { iso_code: "SN", name_fr: "Sénégal", name_en: "Senegal" },
  { iso_code: "SC", name_fr: "Seychelles", name_en: "Seychelles" },
  { iso_code: "SL", name_fr: "Sierra Leone", name_en: "Sierra Leone" },
  { iso_code: "SO", name_fr: "Somalie", name_en: "Somalia" },
  { iso_code: "SD", name_fr: "Soudan", name_en: "Sudan" },
  { iso_code: "SS", name_fr: "Soudan du Sud", name_en: "South Sudan" },
  { iso_code: "TZ", name_fr: "Tanzanie", name_en: "Tanzania" },
  { iso_code: "TD", name_fr: "Tchad", name_en: "Chad" },
  { iso_code: "TG", name_fr: "Togo", name_en: "Togo" },
  { iso_code: "TN", name_fr: "Tunisie", name_en: "Tunisia" },
  { iso_code: "ZM", name_fr: "Zambie", name_en: "Zambia" },
  { iso_code: "ZW", name_fr: "Zimbabwe", name_en: "Zimbabwe" },
];

const COUNTRY_BY_CODE = new Map(
  AFRICAN_COUNTRIES.map((country) => [country.iso_code, country]),
);

export function getAfricanCountry(isoCode: string) {
  return COUNTRY_BY_CODE.get(isoCode);
}

export function isAfricanCountryCode(value: string): boolean {
  return COUNTRY_BY_CODE.has(value);
}
