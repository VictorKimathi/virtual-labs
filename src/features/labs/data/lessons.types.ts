import type { Language } from "../../../app/languageContext";

export type Text = Record<Language, string>;

export type Simulation = { to: string; label: Text };

export type Lesson = {
  predict: Text;
  outcomes: Text[];
  resources: Text[];
  explain: Text[];
  formula: string | null;
  callout: Text | null;
  procedure: Text[];
  simulations: Simulation[];
};
