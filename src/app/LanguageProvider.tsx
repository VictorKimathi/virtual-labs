import { useEffect, useState, type ReactNode } from "react";
import { LanguageContext, type Language } from "./languageContext";

function initialLanguage(): Language {
  return localStorage.getItem("virtual-labs-language") === "sw" ? "sw" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  useEffect(() => {
    localStorage.setItem("virtual-labs-language", language);
    document.documentElement.lang = language;
  }, [language]);
  function toggleLanguage() {
    setLanguage((current) => (current === "en" ? "sw" : "en"));
  }
  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        tr: (english, kiswahili) => (language === "en" ? english : kiswahili),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
