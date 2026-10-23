import type { Language } from "../../../app/languageContext";

export type Text = Record<Language, string>;

export type Question = {
  prompt: Text;
  options: Text[];
  answer: number;
  hint: Text;
};

export type Assessment = { pre: Question[]; post: Question[] };
