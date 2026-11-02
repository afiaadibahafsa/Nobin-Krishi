import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Language = "en" | "bn";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (bn: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const getInitialLanguage = (): Language => {
  const stored = typeof window !== "undefined" ? localStorage.getItem("nobinkrishi-language") : null;
  if (stored === "bn" || stored === "en") return stored;
  const navLang = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "en";
  return navLang.startsWith("bn") ? "bn" : "en";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem("nobinkrishi-language", language);
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (bn: string, en: string) => (language === "bn" ? bn : en),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};

