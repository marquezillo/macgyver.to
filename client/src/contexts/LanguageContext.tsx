import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language } from "@/lib/translations";

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage && ["es", "en", "pt"].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem("language", language);
    // Update document language attribute for accessibility
    document.documentElement.lang = language === "es" ? "es" : language === "pt" ? "pt" : "en";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        let fallbackValue: any = translations["en"];
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key;
          }
        }
        return typeof fallbackValue === "string" ? fallbackValue : key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
