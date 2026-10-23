import { hex } from "../chem/color";
import type { Sample, SampleKind } from "../chemistry.types";

export const samples: Sample[] = [
  {
    id: "hcl",
    name: { en: "Hydrochloric acid", sw: "Asidi hidrokloriki" },
    ph: 1,
    tint: hex("#e0f2fe", 0.35),
  },
  {
    id: "lemon",
    name: { en: "Lemon juice", sw: "Maji ya ndimu" },
    ph: 2.2,
    tint: hex("#fde68a", 0.55),
  },
  {
    id: "vinegar",
    name: { en: "Vinegar", sw: "Siki" },
    ph: 2.9,
    tint: hex("#e2e8f0", 0.4),
  },
  {
    id: "tomato",
    name: { en: "Tomato juice", sw: "Maji ya nyanya" },
    ph: 4.3,
    tint: hex("#fca5a5", 0.55),
  },
  {
    id: "milk",
    name: { en: "Milk", sw: "Maziwa" },
    ph: 6.6,
    tint: hex("#f8fafc", 0.85),
  },
  {
    id: "water",
    name: { en: "Distilled water", sw: "Maji safi" },
    ph: 7,
    tint: hex("#bae6fd", 0.3),
  },
  {
    id: "baking-soda",
    name: { en: "Baking soda solution", sw: "Myeyusho wa soda ya kuokea" },
    ph: 8.4,
    tint: hex("#e0f2fe", 0.35),
  },
  {
    id: "soap",
    name: { en: "Soapy water", sw: "Maji ya sabuni" },
    ph: 10,
    tint: hex("#bfdbfe", 0.45),
  },
  {
    id: "ash",
    name: { en: "Wood ash solution", sw: "Myeyusho wa majivu" },
    ph: 11.2,
    tint: hex("#cbd5e1", 0.5),
  },
  {
    id: "naoh",
    name: { en: "Sodium hydroxide", sw: "Hidroksidi ya sodiamu" },
    ph: 13,
    tint: hex("#e0f2fe", 0.35),
  },
];

export function findSample(id: string) {
  return samples.find((sample) => sample.id === id);
}

export function sampleKind(ph: number): SampleKind {
  if (ph < 6.95) return "acid";
  if (ph > 7.05) return "base";
  return "neutral";
}
