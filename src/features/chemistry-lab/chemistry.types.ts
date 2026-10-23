import type { Language } from "../../app/languageContext";

export type Localized = Record<Language, string>;

export type Rgba = readonly [number, number, number, number];
export type ColorStop = readonly [number, Rgba];

export type IndicatorId =
  "universal" | "cabbage" | "phenolphthalein" | "methyl-orange";

export type ColourBand = { upTo: number; name: Localized };

export type Indicator = {
  id: IndicatorId;
  name: Localized;
  stops: readonly ColorStop[];
  bands: readonly ColourBand[];
  endpointPh: number;
};

export type SampleKind = "acid" | "neutral" | "base";

export type Sample = {
  id: string;
  name: Localized;
  ph: number;
  tint: Rgba;
};
