import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import translations, { Language, languageLabels } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "hi" || saved === "mr") ? saved : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback(
    (key: string) => translations[language]?.[key] ?? translations.en[key] ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export { languageLabels };
export type { Language };
