import { createContext } from "react";

export type Language = "en" | "sw";
export type LanguageContextValue = {
  language: Language;
  toggleLanguage: () => void;
  tr: (english: string, kiswahili: string) => string;
};
export const LanguageContext = createContext<LanguageContextValue | null>(null);
