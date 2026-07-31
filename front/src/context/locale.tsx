import { createContext, useContext } from "react";
import { useParams } from "react-router-dom";

export type Locale = "fr" | "en";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "fr",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>();
  const locale = lang === "en" ? "en" : "fr";

  return (
    <LocaleContext.Provider value={{ locale, setLocale: () => {} }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

// Helper: pick the right field based on locale
export function localized<T extends Record<string, any>, K extends string>(
  obj: T,
  field: K,
  locale: Locale,
): string {
  const key = `${field}_${locale}` as keyof T;
  return (obj[key] as string) || (obj[`${field}_fr}` as keyof T] as string) || "";
}
