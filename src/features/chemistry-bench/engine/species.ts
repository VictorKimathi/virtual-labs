import type { LocalizedText } from "../../workbench/workbench.types";
import { hex } from "../../chemistry-lab/chem/color";
import type { Rgba } from "../../chemistry-lab/chemistry.types";

export const speciesIds = [
  "H",
  "Na",
  "K",
  "NH4",
  "Ca",
  "Mg",
  "Zn",
  "Fe2",
  "Fe3",
  "Cu",
  "Pb",
  "Ag",
  "Ba",
  "Mn2",
  "OH",
  "Cl",
  "SO4",
  "NO3",
  "CO3",
  "AcO",
  "MnO4",
  "I",
  "NH3",
  "AcOH",
  "H2O2",
  "I2",
  "EtOH",
  "zincate",
  "plumbite",
  "cuammine",
] as const;

export type SpeciesId = (typeof speciesIds)[number];

export const gasIds = ["H2", "CO2", "O2", "Cl2", "NO2"] as const;
export type GasId = (typeof gasIds)[number];

export const solidIds = [
  "mg",
  "zn",
  "znp",
  "fe",
  "cu",
  "na",
  "ag",
  "pb",
  "marble",
  "caco3",
  "mno2",
  "mgo",
  "cuo",
  "agcl",
  "agi",
  "ag2o",
  "baso4",
  "baco3",
  "pbcl2",
  "pbso4",
  "pbi2",
  "pboh2",
  "cuoh2",
  "znoh2",
  "mgoh2",
  "feoh2",
  "feoh3",
  "cuso4s",
  "cuso4anh",
  "nacls",
  "pbno3s",
  "kmno4s",
  "agno3s",
  "bacl2s",
  "feso4s",
  "na2co3s",
  "kis",
] as const;

export type SolidId = (typeof solidIds)[number];

export type Absorber = { epsilon: number; peak: number; width: number };

export type SpeciesInfo = {
  name: LocalizedText;
  label: string;
  charge: number;
  /** Molar conductivity in S cm² per mol; 0 for neutral molecules. */
  lambda: number;
  colour?: Rgba;
  absorber?: Absorber;
};

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

export const speciesInfo: Record<SpeciesId, SpeciesInfo> = {
  H: {
    name: t("Hydrogen ions", "Ioni za hidrojeni"),
    label: "H⁺",
    charge: 1,
    lambda: 350,
  },
  Na: {
    name: t("Sodium ions", "Ioni za sodiamu"),
    label: "Na⁺",
    charge: 1,
    lambda: 50,
  },
  K: {
    name: t("Potassium ions", "Ioni za potasiamu"),
    label: "K⁺",
    charge: 1,
    lambda: 74,
  },
  NH4: {
    name: t("Ammonium ions", "Ioni za amonia"),
    label: "NH₄⁺",
    charge: 1,
    lambda: 73,
  },
  Ca: {
    name: t("Calcium ions", "Ioni za kalsiamu"),
    label: "Ca²⁺",
    charge: 2,
    lambda: 119,
  },
  Mg: {
    name: t("Magnesium ions", "Ioni za magnesiamu"),
    label: "Mg²⁺",
    charge: 2,
    lambda: 106,
  },
  Zn: {
    name: t("Zinc ions", "Ioni za zinki"),
    label: "Zn²⁺",
    charge: 2,
    lambda: 106,
  },
  Fe2: {
    name: t("Iron(II) ions", "Ioni za chuma(II)"),
    label: "Fe²⁺",
    charge: 2,
    lambda: 108,
    colour: hex("#9fd6a8", 0.5),
    absorber: { epsilon: 8, peak: 800, width: 150 },
  },
  Fe3: {
    name: t("Iron(III) ions", "Ioni za chuma(III)"),
    label: "Fe³⁺",
    charge: 3,
    lambda: 204,
    colour: hex("#d9a441", 0.7),
    absorber: { epsilon: 60, peak: 400, width: 120 },
  },
  Cu: {
    name: t("Copper(II) ions", "Ioni za shaba(II)"),
    label: "Cu²⁺",
    charge: 2,
    lambda: 107,
    colour: hex("#3b8fe6", 0.8),
    absorber: { epsilon: 12, peak: 800, width: 160 },
  },
  Pb: {
    name: t("Lead(II) ions", "Ioni za risasi(II)"),
    label: "Pb²⁺",
    charge: 2,
    lambda: 142,
  },
  Ag: {
    name: t("Silver ions", "Ioni za fedha"),
    label: "Ag⁺",
    charge: 1,
    lambda: 62,
  },
  Ba: {
    name: t("Barium ions", "Ioni za bariamu"),
    label: "Ba²⁺",
    charge: 2,
    lambda: 127,
  },
  Mn2: {
    name: t("Manganese(II) ions", "Ioni za manganizi(II)"),
    label: "Mn²⁺",
    charge: 2,
    lambda: 107,
  },
  OH: {
    name: t("Hydroxide ions", "Ioni za hidroksidi"),
    label: "OH⁻",
    charge: -1,
    lambda: 199,
  },
  Cl: {
    name: t("Chloride ions", "Ioni za kloridi"),
    label: "Cl⁻",
    charge: -1,
    lambda: 76,
  },
  SO4: {
    name: t("Sulphate ions", "Ioni za salfeti"),
    label: "SO₄²⁻",
    charge: -2,
    lambda: 160,
  },
  NO3: {
    name: t("Nitrate ions", "Ioni za naitreti"),
    label: "NO₃⁻",
    charge: -1,
    lambda: 71,
  },
  CO3: {
    name: t("Carbonate ions", "Ioni za kaboneti"),
    label: "CO₃²⁻",
    charge: -2,
    lambda: 138,
  },
  AcO: {
    name: t("Ethanoate ions", "Ioni za ethanoeti"),
    label: "CH₃COO⁻",
    charge: -1,
    lambda: 41,
  },
  MnO4: {
    name: t("Manganate(VII) ions", "Ioni za manganeti(VII)"),
    label: "MnO₄⁻",
    charge: -1,
    lambda: 61,
    colour: hex("#8a1fa8", 0.9),
    absorber: { epsilon: 2400, peak: 525, width: 45 },
  },
  I: {
    name: t("Iodide ions", "Ioni za iodidi"),
    label: "I⁻",
    charge: -1,
    lambda: 77,
  },
  NH3: { name: t("Ammonia", "Amonia"), label: "NH₃", charge: 0, lambda: 0 },
  AcOH: {
    name: t("Ethanoic acid", "Asidi ya ethanoiki"),
    label: "CH₃COOH",
    charge: 0,
    lambda: 0,
  },
  H2O2: {
    name: t("Hydrogen peroxide", "Hidrojeni peroksaidi"),
    label: "H₂O₂",
    charge: 0,
    lambda: 0,
  },
  I2: {
    name: t("Iodine", "Iodini"),
    label: "I₂",
    charge: 0,
    lambda: 0,
    colour: hex("#9a5a1f", 0.85),
    absorber: { epsilon: 700, peak: 460, width: 80 },
  },
  EtOH: {
    name: t("Ethanol", "Ethanoli"),
    label: "C₂H₅OH",
    charge: 0,
    lambda: 0,
  },
  zincate: {
    name: t("Zincate ions", "Ioni za zinkati"),
    label: "Zn(OH)₄²⁻",
    charge: -2,
    lambda: 90,
  },
  plumbite: {
    name: t("Plumbite ions", "Ioni za plumbiti"),
    label: "Pb(OH)₄²⁻",
    charge: -2,
    lambda: 90,
  },
  cuammine: {
    name: t("Tetraamminecopper(II)", "Tetraamini ya shaba(II)"),
    label: "[Cu(NH₃)₄]²⁺",
    charge: 2,
    lambda: 100,
    colour: hex("#1d3fbf", 0.92),
    absorber: { epsilon: 50, peak: 600, width: 130 },
  },
};

/** Molar masses in g/mol of the molecular species. */
export const speciesMolar: Partial<Record<SpeciesId, number>> = {
  EtOH: 46.07,
  H2O2: 34.01,
  I2: 253.8,
  NH3: 17.03,
  AcOH: 60.05,
};

export type SolidInfo = {
  name: LocalizedText;
  molar: number;
  colour: Rgba;
  /** Dense lumps stay behind when a liquid is poured off. */
  lump?: boolean;
  /** A salt that dissolves: what one mole gives, and its solubility. */
  salt?: { gives: Partial<Record<SpeciesId, number>>; solubility: number };
};

export const solidInfo: Record<SolidId, SolidInfo> = {
  mg: {
    name: t("Magnesium", "Magnesiamu"),
    molar: 24.31,
    colour: hex("#c9ced4", 0.95),
    lump: true,
  },
  zn: {
    name: t("Zinc granules", "Chembechembe za zinki"),
    molar: 65.38,
    colour: hex("#8e98a3", 0.95),
    lump: true,
  },
  znp: {
    name: t("Zinc powder", "Unga wa zinki"),
    molar: 65.38,
    colour: hex("#7d8791", 0.95),
    lump: true,
  },
  fe: {
    name: t("Iron", "Chuma"),
    molar: 55.85,
    colour: hex("#3a3f45", 0.95),
    lump: true,
  },
  cu: {
    name: t("Copper", "Shaba"),
    molar: 63.55,
    colour: hex("#c8703a", 0.95),
    lump: true,
  },
  na: {
    name: t("Sodium", "Sodiamu"),
    molar: 22.99,
    colour: hex("#d8dbe0", 0.95),
    lump: true,
  },
  ag: {
    name: t("Silver", "Fedha"),
    molar: 107.87,
    colour: hex("#b9bec6", 0.95),
    lump: true,
  },
  pb: {
    name: t("Lead", "Risasi"),
    molar: 207.2,
    colour: hex("#6b7280", 0.95),
    lump: true,
  },
  marble: {
    name: t("Marble chips", "Vipande vya marumaru"),
    molar: 100.09,
    colour: hex("#e8e4dc", 0.95),
    lump: true,
  },
  caco3: {
    name: t("Calcium carbonate", "Kalsiamu kaboneti"),
    molar: 100.09,
    colour: hex("#f5f5f0", 0.9),
  },
  mno2: {
    name: t("Manganese(IV) oxide", "Manganizi(IV) oksaidi"),
    molar: 86.94,
    colour: hex("#3b2f2a", 0.95),
  },
  mgo: {
    name: t("Magnesium oxide", "Magnesiamu oksaidi"),
    molar: 40.3,
    colour: hex("#f3f3f0", 0.95),
    lump: true,
  },
  cuo: {
    name: t("Copper(II) oxide", "Shaba(II) oksaidi"),
    molar: 79.55,
    colour: hex("#1f1f1f", 0.95),
    lump: true,
  },
  agcl: {
    name: t("Silver chloride", "Fedha kloridi"),
    molar: 143.32,
    colour: hex("#fafafa", 0.92),
  },
  agi: {
    name: t("Silver iodide", "Fedha iodidi"),
    molar: 234.77,
    colour: hex("#f0e060", 0.92),
  },
  ag2o: {
    name: t("Silver oxide", "Fedha oksaidi"),
    molar: 231.74,
    colour: hex("#7a5a3a", 0.92),
  },
  baso4: {
    name: t("Barium sulphate", "Bariamu salfeti"),
    molar: 233.39,
    colour: hex("#fafafa", 0.92),
  },
  baco3: {
    name: t("Barium carbonate", "Bariamu kaboneti"),
    molar: 197.34,
    colour: hex("#f4f4f4", 0.9),
  },
  pbcl2: {
    name: t("Lead(II) chloride", "Risasi(II) kloridi"),
    molar: 278.1,
    colour: hex("#f7f7f7", 0.92),
  },
  pbso4: {
    name: t("Lead(II) sulphate", "Risasi(II) salfeti"),
    molar: 303.26,
    colour: hex("#f7f7f7", 0.92),
  },
  pbi2: {
    name: t("Lead(II) iodide", "Risasi(II) iodidi"),
    molar: 461.0,
    colour: hex("#f2d21c", 0.95),
  },
  pboh2: {
    name: t("Lead(II) hydroxide", "Risasi(II) hidroksidi"),
    molar: 241.2,
    colour: hex("#f5f5f5", 0.9),
  },
  cuoh2: {
    name: t("Copper(II) hydroxide", "Shaba(II) hidroksidi"),
    molar: 97.56,
    colour: hex("#4f9fe8", 0.92),
  },
  znoh2: {
    name: t("Zinc hydroxide", "Zinki hidroksidi"),
    molar: 99.4,
    colour: hex("#f5f5f5", 0.9),
  },
  mgoh2: {
    name: t("Magnesium hydroxide", "Magnesiamu hidroksidi"),
    molar: 58.32,
    colour: hex("#f5f5f5", 0.9),
  },
  feoh2: {
    name: t("Iron(II) hydroxide", "Chuma(II) hidroksidi"),
    molar: 89.86,
    colour: hex("#6f9c6a", 0.92),
  },
  feoh3: {
    name: t("Iron(III) hydroxide", "Chuma(III) hidroksidi"),
    molar: 106.87,
    colour: hex("#b5651d", 0.95),
  },
  cuso4s: {
    name: t("Copper(II) sulphate crystals", "Fuwele za shaba(II) salfeti"),
    molar: 249.68,
    colour: hex("#3b8fe6", 0.9),
    salt: { gives: { Cu: 1, SO4: 1 }, solubility: 32 },
  },
  cuso4anh: {
    name: t("Anhydrous copper(II) sulphate", "Shaba(II) salfeti isiyo na maji"),
    molar: 159.61,
    colour: hex("#f4f4f0", 0.95),
    salt: { gives: { Cu: 1, SO4: 1 }, solubility: 20 },
  },
  nacls: {
    name: t("Sodium chloride crystals", "Fuwele za sodiamu kloridi"),
    molar: 58.44,
    colour: hex("#fafafa", 0.95),
    salt: { gives: { Na: 1, Cl: 1 }, solubility: 36 },
  },
  pbno3s: {
    name: t("Lead(II) nitrate crystals", "Fuwele za risasi(II) naitreti"),
    molar: 331.2,
    colour: hex("#f4f4f4", 0.95),
    salt: { gives: { Pb: 1, NO3: 2 }, solubility: 54 },
  },
  kmno4s: {
    name: t(
      "Potassium manganate(VII) crystals",
      "Fuwele za potasiamu manganeti(VII)",
    ),
    molar: 158.03,
    colour: hex("#3a1048", 0.95),
    salt: { gives: { K: 1, MnO4: 1 }, solubility: 6.4 },
  },
  agno3s: {
    name: t("Silver nitrate crystals", "Fuwele za fedha naitreti"),
    molar: 169.87,
    colour: hex("#f4f4f4", 0.95),
    salt: { gives: { Ag: 1, NO3: 1 }, solubility: 215 },
  },
  bacl2s: {
    name: t("Barium chloride crystals", "Fuwele za bariamu kloridi"),
    molar: 244.26,
    colour: hex("#f4f4f4", 0.95),
    salt: { gives: { Ba: 1, Cl: 2 }, solubility: 36 },
  },
  feso4s: {
    name: t("Iron(II) sulphate crystals", "Fuwele za chuma(II) salfeti"),
    molar: 278.01,
    colour: hex("#8fc79a", 0.95),
    salt: { gives: { Fe2: 1, SO4: 1 }, solubility: 26 },
  },
  na2co3s: {
    name: t("Sodium carbonate crystals", "Fuwele za sodiamu kaboneti"),
    molar: 105.99,
    colour: hex("#fafafa", 0.95),
    salt: { gives: { Na: 2, CO3: 1 }, solubility: 21 },
  },
  kis: {
    name: t("Potassium iodide crystals", "Fuwele za potasiamu iodidi"),
    molar: 166.0,
    colour: hex("#fafafa", 0.95),
    salt: { gives: { K: 1, I: 1 }, solubility: 144 },
  },
};

export const gasInfo: Record<
  GasId,
  {
    name: LocalizedText;
    label: string;
    toxic: boolean;
    observation: LocalizedText;
    test: LocalizedText;
  }
> = {
  H2: {
    name: t("Hydrogen", "Hidrojeni"),
    label: "H₂",
    toxic: false,
    observation: t(
      "Colourless gas bubbles off.",
      "Gesi isiyo na rangi inatoka kwa viputo.",
    ),
    test: t(
      "A lighted splint burns with a 'pop'.",
      "Kijiti kinachowaka hulia 'pop'.",
    ),
  },
  CO2: {
    name: t("Carbon dioxide", "Kaboni dioksaidi"),
    label: "CO₂",
    toxic: false,
    observation: t(
      "Colourless gas fizzes off.",
      "Gesi isiyo na rangi inatoka kwa povu.",
    ),
    test: t(
      "It turns limewater milky.",
      "Hufanya maji ya chokaa kuwa meupe kama maziwa.",
    ),
  },
  O2: {
    name: t("Oxygen", "Oksijeni"),
    label: "O₂",
    toxic: false,
    observation: t(
      "Colourless gas bubbles off.",
      "Gesi isiyo na rangi inatoka kwa viputo.",
    ),
    test: t(
      "It relights a glowing splint.",
      "Huwasha tena kijiti kinachowaka mwanga.",
    ),
  },
  Cl2: {
    name: t("Chlorine", "Klorini"),
    label: "Cl₂",
    toxic: true,
    observation: t(
      "A pale green, choking gas.",
      "Gesi ya kijani kibichi hafifu inayokosesha pumzi.",
    ),
    test: t(
      "It bleaches damp litmus paper.",
      "Hubadilisha rangi ya karatasi ya litmus yenye unyevu kuwa nyeupe.",
    ),
  },
  NO2: {
    name: t("Nitrogen dioxide", "Naitrojeni dioksaidi"),
    label: "NO₂",
    toxic: true,
    observation: t("A brown, poisonous gas.", "Gesi ya kahawia yenye sumu."),
    test: t(
      "It turns damp blue litmus red.",
      "Hubadilisha litmus ya bluu yenye unyevu kuwa nyekundu.",
    ),
  },
};

export const ionicSpecies = speciesIds.filter(
  (id) => speciesInfo[id].lambda > 0,
);

/** Molar masses in g/mol of every dissolved species, for weighing solutions. */
export const speciesMass: Record<SpeciesId, number> = {
  H: 1.008,
  Na: 22.99,
  K: 39.1,
  NH4: 18.04,
  Ca: 40.08,
  Mg: 24.31,
  Zn: 65.38,
  Fe2: 55.85,
  Fe3: 55.85,
  Cu: 63.55,
  Pb: 207.2,
  Ag: 107.87,
  Ba: 137.33,
  Mn2: 54.94,
  OH: 17.01,
  Cl: 35.45,
  SO4: 96.06,
  NO3: 62.0,
  CO3: 60.01,
  AcO: 59.04,
  MnO4: 118.94,
  I: 126.9,
  NH3: 17.03,
  AcOH: 60.05,
  H2O2: 34.01,
  I2: 253.8,
  EtOH: 46.07,
  zincate: 133.4,
  plumbite: 275.2,
  cuammine: 131.7,
};
