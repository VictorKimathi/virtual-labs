import type {
  PartCategory,
  PartDefinition,
  PartKind,
  LocalizedText,
} from "../workbench.types";

export const BULB_RATED_POWER = 0.625;

export const partDefinitions: Record<PartKind, PartDefinition> = {
  cell: {
    kind: "cell",
    category: "sources",
    name: { en: "Dry cell", sw: "Seli kavu" },
    description: {
      en: "A 1.5 V cell. Current leaves the + terminal and returns to the − terminal.",
      sw: "Seli ya 1.5 V. Mkondo hutoka kwenye ncha + na kurudi kwenye ncha −.",
    },
    width: 120,
    height: 50,
    terminals: [
      { name: "pos", x: 112, y: 25, polarity: "+" },
      { name: "neg", x: 8, y: 25, polarity: "-" },
    ],
    defaultValue: 1.5,
    model: () => ({ type: "source", voltage: 1.5, internalResistance: 0.2 }),
  },
  battery: {
    kind: "battery",
    category: "sources",
    name: { en: "Battery holder", sw: "Kishikio cha betri" },
    description: {
      en: "Two 1.5 V cells in series give 3 V.",
      sw: "Seli mbili za 1.5 V zilizopangwa mfululizo hutoa 3 V.",
    },
    width: 140,
    height: 60,
    terminals: [
      { name: "pos", x: 132, y: 30, polarity: "+" },
      { name: "neg", x: 8, y: 30, polarity: "-" },
    ],
    defaultValue: 3,
    model: () => ({ type: "source", voltage: 3, internalResistance: 0.4 }),
  },
  "power-supply": {
    kind: "power-supply",
    category: "sources",
    name: { en: "DC power supply", sw: "Chanzo cha umeme DC" },
    description: {
      en: "An adjustable supply from 0 V to 12 V.",
      sw: "Chanzo kinachorekebishwa kutoka 0 V hadi 12 V.",
    },
    width: 140,
    height: 90,
    terminals: [
      { name: "pos", x: 96, y: 72, polarity: "+" },
      { name: "neg", x: 122, y: 72, polarity: "-" },
    ],
    adjustable: {
      label: { en: "Output voltage", sw: "Volteji ya kutoa" },
      unit: "V",
      min: 0,
      max: 12,
      step: 0.5,
    },
    defaultValue: 3,
    model: (part) => ({
      type: "source",
      voltage: part.value,
      internalResistance: 0.05,
    }),
  },
  switch: {
    kind: "switch",
    category: "switches",
    name: { en: "Knife switch", sw: "Swichi ya kisu" },
    description: {
      en: "Click it on the bench to open or close the circuit.",
      sw: "Ibofye kwenye benchi kufungua au kufunga sakiti.",
    },
    width: 120,
    height: 60,
    terminals: [
      { name: "a", x: 14, y: 47 },
      { name: "b", x: 106, y: 47 },
    ],
    defaultValue: 0,
    model: (part) =>
      part.closed ? { type: "resistor", resistance: 0.01 } : { type: "open" },
  },
  bulb: {
    kind: "bulb",
    category: "loads",
    name: { en: "Light bulb", sw: "Balbu" },
    description: {
      en: "Rated 2.5 V, 0.25 A. It glows brighter as more power reaches it.",
      sw: "Kiwango 2.5 V, 0.25 A. Huwaka zaidi nguvu zaidi inapoifikia.",
    },
    width: 90,
    height: 120,
    terminals: [
      { name: "a", x: 18, y: 96 },
      { name: "b", x: 72, y: 96 },
    ],
    defaultValue: 10,
    model: () => ({ type: "resistor", resistance: 10 }),
  },
  resistor: {
    kind: "resistor",
    category: "loads",
    name: { en: "Resistor", sw: "Kikinzani" },
    description: {
      en: "Limits current. Change its resistance in the inspector.",
      sw: "Hupunguza mkondo. Badilisha ukinzani wake kwenye ukaguzi.",
    },
    width: 120,
    height: 54,
    terminals: [
      { name: "a", x: 8, y: 16 },
      { name: "b", x: 112, y: 16 },
    ],
    adjustable: {
      label: { en: "Resistance", sw: "Ukinzani" },
      unit: "Ω",
      min: 1,
      max: 100,
      step: 1,
    },
    defaultValue: 10,
    model: (part) => ({ type: "resistor", resistance: part.value }),
  },
  ammeter: {
    kind: "ammeter",
    category: "meters",
    name: { en: "Ammeter", sw: "Amita" },
    description: {
      en: "Measures current. Connect it in series, with + towards the + of the source.",
      sw: "Hupima mkondo. Iunganishe mfululizo, + ikielekea + ya chanzo.",
    },
    width: 110,
    height: 120,
    terminals: [
      { name: "pos", x: 32, y: 106, polarity: "+" },
      { name: "neg", x: 78, y: 106, polarity: "-" },
    ],
    meter: { unit: "A", fullScale: 1 },
    defaultValue: 0,
    model: () => ({ type: "resistor", resistance: 0.01 }),
  },
  voltmeter: {
    kind: "voltmeter",
    category: "meters",
    name: { en: "Voltmeter", sw: "Voltimita" },
    description: {
      en: "Measures potential difference. Connect it in parallel across a component.",
      sw: "Hupima tofauti ya uwezo. Iunganishe sambamba na kifaa.",
    },
    width: 110,
    height: 120,
    terminals: [
      { name: "pos", x: 32, y: 106, polarity: "+" },
      { name: "neg", x: 78, y: 106, polarity: "-" },
    ],
    meter: { unit: "V", fullScale: 15 },
    defaultValue: 0,
    model: () => ({ type: "resistor", resistance: 10_000_000 }),
  },
};

export const categoryNames: Record<PartCategory, LocalizedText> = {
  sources: { en: "Sources", sw: "Vyanzo" },
  switches: { en: "Switches", sw: "Swichi" },
  meters: { en: "Meters", sw: "Mita" },
  loads: { en: "Loads", sw: "Mizigo" },
};

export const categoryOrder: PartCategory[] = [
  "sources",
  "switches",
  "meters",
  "loads",
];

export function isPartKind(value: string): value is PartKind {
  return value in partDefinitions;
}
