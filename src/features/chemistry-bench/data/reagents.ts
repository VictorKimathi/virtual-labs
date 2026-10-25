import type { LocalizedText } from "../../workbench/workbench.types";
import { seeded } from "../../workbench/data/catalogue/helpers";
import type {
  ChemControl,
  ChemKind,
  ChemPart,
  IndicatorKey,
} from "../chemistry.types";
import type { Ingredient } from "../engine/contents";
import { solidInfo, type SolidId, type SpeciesId } from "../engine/species";
import { choice } from "./catalogue/controls";
import { chemSectionKinds } from "./kinds";

export type Unit = "mL" | "g" | "drops";

export type Tag =
  | "corrosive"
  | "toxic"
  | "flammable"
  | "oxidiser"
  | "water-reactive"
  | "irritant";

export type ReagentDef = {
  unit: Unit;
  /** Extra settings a bottle offers, such as concentration. */
  controls: ChemControl[];
  /** What a given amount of this reagent adds to a vessel. */
  pack: (part: ChemPart, amount: number) => Ingredient;
  /** 0 harmless to 3 severe, for the safety rules. */
  hazard: (part: ChemPart) => 0 | 1 | 2 | 3;
  tags: (part: ChemPart) => Tag[];
  /** A short label for the bottle, such as "HCl 0.1 mol/dm³". */
  label: (part: ChemPart) => string;
  name: LocalizedText;
  /** The most that can be added in one go, and the step. */
  range: { max: number; step: number; start: number };
  /** True for concentrated strong acids, which must be diluted by adding acid to water. */
  concentrated?: (part: ChemPart) => boolean;
};

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

const UNKNOWN = -1;

/** The hidden concentration of "Solution A": different for every bottle. */
export function unknownConcentration(partId: string) {
  return Math.round((0.07 + seeded(partId, 91) * 0.08) * 1000) / 1000;
}

type SolutionOptions = {
  kind: string;
  name: LocalizedText;
  symbol: string;
  gives: Partial<Record<SpeciesId, number>>;
  concentrations: number[];
  /** Concentrations at or above this are concentrated reagents. */
  strong?: number;
  unknown?: boolean;
  crystal?: SolidId;
  hazard?: (concentration: number) => 0 | 1 | 2 | 3;
  tags?: (concentration: number) => Tag[];
};

function concentrationOf(part: ChemPart, options: SolutionOptions) {
  const index = part.params.conc ?? 0;
  return index >= options.concentrations.length
    ? UNKNOWN
    : options.concentrations[index];
}

function solution(options: SolutionOptions): ReagentDef {
  const labels: [string, string][] = options.concentrations.map((value) => [
    `${value} mol/dm³`,
    `${value} mol/dm³`,
  ]);
  if (options.unknown)
    labels.push(["Solution A (unknown)", "Myeyusho A (haujulikani)"]);
  const controls: ChemControl[] = [
    choice(
      "conc",
      ["Concentration", "Mkusanyiko"],
      labels,
      Math.min(2, options.concentrations.length - 1),
    ),
  ];
  if (options.crystal)
    controls.unshift(
      choice(
        "form",
        ["Supplied as", "Inatolewa kama"],
        [
          ["Solution", "Myeyusho"],
          ["Crystals", "Fuwele"],
        ],
      ),
    );
  const asCrystals = (part: ChemPart) =>
    Boolean(options.crystal) && part.params.form === 1;
  const value = (part: ChemPart) => {
    const known = concentrationOf(part, options);
    return known === UNKNOWN ? unknownConcentration(part.id) : known;
  };
  return {
    name: options.name,
    unit: "mL",
    controls,
    range: { max: 100, step: 0.5, start: 10 },
    pack: (part, amount) => {
      if (asCrystals(part) && options.crystal) {
        const mmol = (amount * 1000) / solidInfo[options.crystal].molar;
        return {
          solids: { [options.crystal]: mmol },
          ledger: { id: options.kind, volume: 0, mmol },
        };
      }
      const concentration = value(part);
      const species: Partial<Record<SpeciesId, number>> = {};
      for (const id of Object.keys(options.gives) as SpeciesId[])
        species[id] = amount * concentration * (options.gives[id] ?? 0);
      return {
        volume: amount,
        species,
        ledger: {
          id: options.kind,
          volume: amount,
          mmol: amount * concentration,
        },
      };
    },
    hazard: (part) =>
      asCrystals(part)
        ? (options.hazard?.(1) ?? 0)
        : (options.hazard?.(value(part)) ?? 0),
    tags: (part) =>
      asCrystals(part)
        ? (options.tags?.(1) ?? [])
        : (options.tags?.(value(part)) ?? []),
    label: (part) =>
      asCrystals(part)
        ? `${options.symbol} (s)`
        : concentrationOf(part, options) === UNKNOWN
          ? `${options.symbol} (A)`
          : `${options.symbol} ${value(part)} M`,
    concentrated: (part) =>
      options.strong !== undefined &&
      !asCrystals(part) &&
      value(part) >= options.strong,
  };
}

function metal(
  name: LocalizedText,
  symbol: string,
  solid: SolidId,
  formOptions?: { solid: SolidId; label: [string, string] }[],
  hazard: 0 | 1 | 2 | 3 = 0,
  tags: Tag[] = [],
): ReagentDef {
  const controls: ChemControl[] = formOptions
    ? [
        choice(
          "form",
          ["Form", "Umbo"],
          formOptions.map((option) => option.label),
        ),
      ]
    : [];
  const solidOf = (part: ChemPart) =>
    formOptions?.[part.params.form ?? 0]?.solid ?? solid;
  return {
    name,
    unit: "g",
    controls,
    range: { max: 10, step: 0.05, start: 1 },
    pack: (part, amount) => {
      const id = solidOf(part);
      const mmol = (amount * 1000) / solidInfo[id].molar;
      return { solids: { [id]: mmol } };
    },
    hazard: () => hazard,
    tags: () => tags,
    label: () => symbol,
  };
}

function indicator(name: LocalizedText, id: IndicatorKey): ReagentDef {
  return {
    name,
    unit: "drops",
    controls: [],
    range: { max: 20, step: 1, start: 3 },
    pack: (_part, amount) => ({
      volume: amount * 0.05,
      indicator: { id, drops: amount },
    }),
    hazard: () => 0,
    tags: () => [],
    label: () => name.en,
  };
}

const flat = (hazards: (c: number) => 0 | 1 | 2 | 3) => hazards;

export type ReagentKind =
  | (typeof chemSectionKinds.reagents)[number]
  | "buffer-solution"
  | "standard-solution";

export const reagentTable: Record<ReagentKind, ReagentDef> = {
  "hydrochloric-acid": solution({
    kind: "hydrochloric-acid",
    name: t("Hydrochloric acid", "Asidi ya haidrokloriki"),
    symbol: "HCl",
    gives: { H: 1, Cl: 1 },
    concentrations: [0.1, 0.5, 1, 2, 12],
    strong: 6,
    unknown: true,
    hazard: flat((c) => (c >= 6 ? 3 : c >= 1 ? 1 : 0)),
    tags: (c) => (c >= 6 ? ["corrosive"] : c >= 1 ? ["irritant"] : []),
  }),
  "sulphuric-acid": solution({
    kind: "sulphuric-acid",
    name: t("Sulphuric acid", "Asidi ya salfuriki"),
    symbol: "H₂SO₄",
    gives: { H: 2, SO4: 1 },
    concentrations: [0.05, 0.5, 1, 2, 18],
    strong: 10,
    hazard: flat((c) => (c >= 10 ? 3 : c >= 1 ? 2 : 0)),
    tags: (c) => (c >= 1 ? ["corrosive"] : []),
  }),
  "nitric-acid": solution({
    kind: "nitric-acid",
    name: t("Nitric acid", "Asidi ya naitriki"),
    symbol: "HNO₃",
    gives: { H: 1, NO3: 1 },
    concentrations: [0.1, 1, 2, 16],
    strong: 10,
    hazard: flat((c) => (c >= 10 ? 3 : c >= 1 ? 2 : 0)),
    tags: (c) => (c >= 1 ? ["corrosive", "oxidiser"] : []),
  }),
  "ethanoic-acid": solution({
    kind: "ethanoic-acid",
    name: t("Ethanoic acid", "Asidi ya ethanoiki"),
    symbol: "CH₃COOH",
    gives: { AcOH: 1 },
    concentrations: [0.1, 0.5, 1],
    hazard: flat((c) => (c >= 1 ? 1 : 0)),
    tags: (c) => (c >= 1 ? ["irritant"] : []),
  }),
  "sodium-hydroxide": solution({
    kind: "sodium-hydroxide",
    name: t("Sodium hydroxide", "Sodiamu hidroksidi"),
    symbol: "NaOH",
    gives: { Na: 1, OH: 1 },
    concentrations: [0.05, 0.1, 0.5, 1, 2],
    unknown: true,
    crystal: undefined,
    hazard: flat((c) => (c >= 1 ? 2 : c >= 0.5 ? 1 : 0)),
    tags: (c) => (c >= 0.5 ? ["corrosive"] : []),
  }),
  "aqueous-ammonia": solution({
    kind: "aqueous-ammonia",
    name: t("Aqueous ammonia", "Amonia ya maji"),
    symbol: "NH₃(aq)",
    gives: { NH3: 1 },
    concentrations: [0.1, 1, 2, 15],
    strong: 10,
    hazard: flat((c) => (c >= 10 ? 3 : c >= 1 ? 1 : 0)),
    tags: (c) =>
      c >= 10 ? ["corrosive", "toxic"] : c >= 1 ? ["irritant"] : [],
  }),
  limewater: solution({
    kind: "limewater",
    name: t(
      "Limewater (calcium hydroxide)",
      "Maji ya chokaa (kalsiamu hidroksidi)",
    ),
    symbol: "Ca(OH)₂",
    gives: { Ca: 1, OH: 2 },
    concentrations: [0.02],
    hazard: flat(() => 0),
  }),
  "copper-sulphate": solution({
    kind: "copper-sulphate",
    name: t("Copper(II) sulphate", "Shaba(II) salfeti"),
    symbol: "CuSO₄",
    gives: { Cu: 1, SO4: 1 },
    concentrations: [0.01, 0.05, 0.1, 0.5, 1],
    crystal: "cuso4s",
    hazard: flat((c) => (c >= 0.5 ? 1 : 0)),
    tags: (c) => (c >= 0.5 ? ["irritant"] : []),
  }),
  "sodium-chloride": solution({
    kind: "sodium-chloride",
    name: t("Sodium chloride", "Sodiamu kloridi"),
    symbol: "NaCl",
    gives: { Na: 1, Cl: 1 },
    concentrations: [0.1, 0.5, 1, 5],
    crystal: "nacls",
    hazard: flat(() => 0),
  }),
  "lead-nitrate": solution({
    kind: "lead-nitrate",
    name: t("Lead(II) nitrate", "Risasi(II) naitreti"),
    symbol: "Pb(NO₃)₂",
    gives: { Pb: 1, NO3: 2 },
    concentrations: [0.05, 0.1, 0.5],
    crystal: "pbno3s",
    hazard: flat(() => 2),
    tags: () => ["toxic"],
  }),
  "potassium-permanganate": solution({
    kind: "potassium-permanganate",
    name: t("Potassium manganate(VII)", "Potasiamu manganeti(VII)"),
    symbol: "KMnO₄",
    gives: { K: 1, MnO4: 1 },
    concentrations: [0.002, 0.01, 0.02],
    crystal: "kmno4s",
    hazard: flat(() => 1),
    tags: () => ["oxidiser"],
  }),
  "silver-nitrate": solution({
    kind: "silver-nitrate",
    name: t("Silver nitrate", "Fedha naitreti"),
    symbol: "AgNO₃",
    gives: { Ag: 1, NO3: 1 },
    concentrations: [0.01, 0.05, 0.1],
    crystal: "agno3s",
    hazard: flat(() => 1),
    tags: () => ["irritant"],
  }),
  "barium-chloride": solution({
    kind: "barium-chloride",
    name: t("Barium chloride", "Bariamu kloridi"),
    symbol: "BaCl₂",
    gives: { Ba: 1, Cl: 2 },
    concentrations: [0.05, 0.1, 0.5],
    crystal: "bacl2s",
    hazard: flat(() => 2),
    tags: () => ["toxic"],
  }),
  "iron-sulphate": solution({
    kind: "iron-sulphate",
    name: t("Iron(II) sulphate", "Chuma(II) salfeti"),
    symbol: "FeSO₄",
    gives: { Fe2: 1, SO4: 1 },
    concentrations: [0.05, 0.1, 0.5],
    crystal: "feso4s",
    hazard: flat(() => 0),
  }),
  "sodium-carbonate": solution({
    kind: "sodium-carbonate",
    name: t("Sodium carbonate", "Sodiamu kaboneti"),
    symbol: "Na₂CO₃",
    gives: { Na: 2, CO3: 1 },
    concentrations: [0.1, 0.5, 1],
    crystal: "na2co3s",
    hazard: flat(() => 0),
  }),
  "potassium-iodide": solution({
    kind: "potassium-iodide",
    name: t("Potassium iodide", "Potasiamu iodidi"),
    symbol: "KI",
    gives: { K: 1, I: 1 },
    concentrations: [0.05, 0.1, 0.5],
    crystal: "kis",
    hazard: flat(() => 0),
  }),
  "hydrogen-peroxide": solution({
    kind: "hydrogen-peroxide",
    name: t("Hydrogen peroxide", "Hidrojeni peroksaidi"),
    symbol: "H₂O₂",
    gives: { H2O2: 1 },
    concentrations: [0.3, 0.9, 1.76],
    hazard: flat((c) => (c >= 1.5 ? 1 : 0)),
    tags: (c) => (c >= 1.5 ? ["oxidiser"] : []),
  }),
  "iodine-solution": solution({
    kind: "iodine-solution",
    name: t("Iodine solution", "Myeyusho wa iodini"),
    symbol: "I₂(aq)",
    gives: { I2: 1 },
    concentrations: [0.005, 0.01],
    hazard: flat(() => 1),
    tags: () => ["irritant"],
  }),
  phenolphthalein: indicator(
    t("Phenolphthalein", "Fenolftaleini"),
    "phenolphthalein",
  ),
  "methyl-orange": indicator(
    t("Methyl orange", "Methili ya chungwa"),
    "methyl-orange",
  ),
  litmus: indicator(t("Litmus solution", "Myeyusho wa litmus"), "litmus"),
  "universal-indicator": indicator(
    t("Universal indicator", "Kiashiria cha jumla"),
    "universal",
  ),
  "magnesium-ribbon": metal(
    t("Magnesium ribbon", "Utepe wa magnesiamu"),
    "Mg",
    "mg",
  ),
  "zinc-granules": metal(t("Zinc", "Zinki"), "Zn", "zn", [
    { solid: "zn", label: ["Granules", "Chembechembe"] },
    { solid: "znp", label: ["Powder", "Unga"] },
  ]),
  "copper-turnings": metal(
    t("Copper turnings", "Vipandikizi vya shaba"),
    "Cu",
    "cu",
  ),
  "iron-filings": metal(t("Iron filings", "Vumbi la chuma"), "Fe", "fe"),
  "sodium-metal": metal(
    t("Sodium (stored in oil)", "Sodiamu (huhifadhiwa kwenye mafuta)"),
    "Na",
    "na",
    undefined,
    3,
    ["water-reactive", "corrosive"],
  ),
  "marble-chips": metal(
    t("Marble chips", "Vipande vya marumaru"),
    "CaCO₃",
    "marble",
    [
      { solid: "marble", label: ["Chips", "Vipande"] },
      { solid: "caco3", label: ["Powder", "Unga"] },
    ],
  ),
  "manganese-dioxide": metal(
    t("Manganese(IV) oxide", "Manganizi(IV) oksaidi"),
    "MnO₂",
    "mno2",
  ),
  "distilled-water": {
    name: t("Distilled water", "Maji yaliyosafishwa"),
    unit: "mL",
    controls: [],
    range: { max: 100, step: 0.5, start: 10 },
    pack: (_part, amount) => ({ volume: amount }),
    hazard: () => 0,
    tags: () => [],
    label: () => "H₂O",
  },
  ethanol: {
    name: t("Ethanol", "Ethanoli"),
    unit: "mL",
    controls: [],
    range: { max: 100, step: 0.5, start: 10 },
    pack: (_part, amount) => ({
      volume: amount,
      species: { EtOH: amount * 17.1 },
      ledger: { id: "ethanol", volume: amount, mmol: amount * 17.1 },
    }),
    hazard: () => 1,
    tags: () => ["flammable"],
    label: () => "C₂H₅OH",
  },
  "starch-solution": {
    name: t("Starch solution", "Myeyusho wa wanga"),
    unit: "mL",
    controls: [],
    range: { max: 20, step: 0.5, start: 2 },
    pack: (_part, amount) => ({ volume: amount, starch: true }),
    hazard: () => 0,
    tags: () => [],
    label: () => "starch",
  },
  "cooking-oil": {
    name: t("Cooking oil", "Mafuta ya kupikia"),
    unit: "mL",
    controls: [],
    range: { max: 100, step: 0.5, start: 10 },
    pack: (_part, amount) => ({ organic: amount }),
    hazard: () => 0,
    tags: () => ["flammable"],
    label: () => "oil",
  },
  "buffer-solution": {
    name: t("Buffer solution", "Myeyusho wa buffer"),
    unit: "mL",
    controls: [
      choice(
        "ph",
        ["Buffer", "Buffer"],
        [
          ["pH 4.00", "pH 4.00"],
          ["pH 7.00", "pH 7.00"],
          ["pH 10.00", "pH 10.00"],
        ],
        1,
      ),
    ],
    range: { max: 100, step: 0.5, start: 30 },
    pack: (part, amount) => ({
      volume: amount,
      fixedPh: [4, 7, 10][part.params.ph ?? 1],
    }),
    hazard: () => 0,
    tags: () => [],
    label: (part) => `pH ${[4, 7, 10][part.params.ph ?? 1]}`,
  },
  "standard-solution": {
    name: t(
      "Conductivity standard (0.01 M KCl)",
      "Kiwango cha upitishaji (KCl 0.01 M)",
    ),
    unit: "mL",
    controls: [],
    range: { max: 100, step: 0.5, start: 30 },
    pack: (_part, amount) => ({
      volume: amount,
      species: { K: amount * 0.01, Cl: amount * 0.01 },
      ledger: { id: "standard-solution", volume: amount, mmol: amount * 0.01 },
    }),
    hazard: () => 0,
    tags: () => [],
    label: () => "1413 µS/cm",
  },
};

/** Looks up a reagent by any kind; undefined for equipment. */
export const reagents: Partial<Record<ChemKind, ReagentDef>> = reagentTable;
