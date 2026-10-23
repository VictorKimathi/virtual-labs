import { hex } from "../chem/color";
import type { Indicator, IndicatorId } from "../chemistry.types";

const clear = hex("#ffffff", 0.14);

export const indicators: Record<IndicatorId, Indicator> = {
  universal: {
    id: "universal",
    name: { en: "Universal indicator", sw: "Kiashiria cha jumla" },
    stops: [
      [0, hex("#d7191c", 0.92)],
      [3, hex("#ef4423", 0.92)],
      [4.5, hex("#f68b1f", 0.92)],
      [5.5, hex("#f9c423", 0.92)],
      [6.5, hex("#b7d433", 0.92)],
      [7, hex("#3fae49", 0.92)],
      [8, hex("#1aa58c", 0.92)],
      [9.5, hex("#2b6cb0", 0.92)],
      [11, hex("#5b3a9e", 0.92)],
      [14, hex("#6b1f8f", 0.92)],
    ],
    bands: [
      { upTo: 3.5, name: { en: "Red", sw: "Nyekundu" } },
      { upTo: 5, name: { en: "Orange", sw: "Chungwa" } },
      { upTo: 6.5, name: { en: "Yellow", sw: "Njano" } },
      { upTo: 7.5, name: { en: "Green", sw: "Kijani" } },
      { upTo: 10.5, name: { en: "Blue", sw: "Buluu" } },
      { upTo: 15, name: { en: "Purple", sw: "Zambarau" } },
    ],
    endpointPh: 7,
  },
  cabbage: {
    id: "cabbage",
    name: { en: "Red cabbage juice", sw: "Juisi ya kabichi nyekundu" },
    stops: [
      [0, hex("#d6204f", 0.92)],
      [3, hex("#e0357a", 0.92)],
      [5, hex("#c25fb0", 0.92)],
      [7, hex("#7c4dab", 0.92)],
      [9, hex("#4562c4", 0.92)],
      [10.5, hex("#2c9fae", 0.92)],
      [12, hex("#52b86a", 0.92)],
      [14, hex("#d2d63a", 0.92)],
    ],
    bands: [
      { upTo: 3.5, name: { en: "Red", sw: "Nyekundu" } },
      { upTo: 5.5, name: { en: "Pink", sw: "Waridi" } },
      { upTo: 7.5, name: { en: "Purple", sw: "Zambarau" } },
      { upTo: 9.5, name: { en: "Blue", sw: "Buluu" } },
      { upTo: 11.5, name: { en: "Green", sw: "Kijani" } },
      { upTo: 15, name: { en: "Yellow", sw: "Njano" } },
    ],
    endpointPh: 7,
  },
  phenolphthalein: {
    id: "phenolphthalein",
    name: { en: "Phenolphthalein", sw: "Fenolftaleini" },
    stops: [
      [0, clear],
      [8.2, clear],
      [9.6, hex("#d6246e", 0.9)],
      [14, hex("#c4175f", 0.95)],
    ],
    bands: [
      { upTo: 8.2, name: { en: "Colourless", sw: "Haina rangi" } },
      { upTo: 15, name: { en: "Pink", sw: "Waridi" } },
    ],
    endpointPh: 8.2,
  },
  "methyl-orange": {
    id: "methyl-orange",
    name: { en: "Methyl orange", sw: "Methili ya chungwa" },
    stops: [
      [0, hex("#e11d2e", 0.92)],
      [3.1, hex("#ee4a22", 0.92)],
      [3.8, hex("#f6921e", 0.92)],
      [4.4, hex("#f7c929", 0.92)],
      [14, hex("#f7c929", 0.92)],
    ],
    bands: [
      { upTo: 3.1, name: { en: "Red", sw: "Nyekundu" } },
      { upTo: 4.4, name: { en: "Orange", sw: "Chungwa" } },
      { upTo: 15, name: { en: "Yellow", sw: "Njano" } },
    ],
    endpointPh: 4.4,
  },
};

export function colourName(indicator: Indicator, ph: number) {
  return (
    indicator.bands.find((band) => ph < band.upTo) ??
    indicator.bands[indicator.bands.length - 1]
  ).name;
}
