import type { Contents } from "../chemistry.types";
import { amountOf, conductivityOf, molarity } from "./contents";
import type { GasId } from "./species";

export type Electrode = "carbon" | "copper";

export type CellSetup = {
  cathode: Electrode;
  anode: Electrode;
  voltage: number;
  /** Cell constant in cm⁻¹: larger for electrodes that are far apart or small. */
  constant: number;
};

const FARADAY_MMOL = 96.485;
const DECOMPOSITION_VOLTS = 1.2;

/** Current through the cell in amperes. */
export function cellCurrent(c: Contents, cell: CellSetup) {
  if (c.volume <= 0 || cell.voltage <= 0) return 0;
  const siemens = conductivityOf(c) / 1e6;
  const resistance = cell.constant / Math.max(siemens, 1e-9);
  return Math.max(0, (cell.voltage - DECOMPOSITION_VOLTS) / resistance);
}

export type ElectrolysisResult = {
  contents: Contents;
  cathodeGas: { gas: GasId; mL: number } | null;
  anodeGas: { gas: GasId; mL: number } | null;
  /** Copper plated on the cathode, in milligrams. */
  plated: number;
  /** Copper lost from the anode, in milligrams. */
  eroded: number;
  silver: number;
  cathodeProduct: "hydrogen" | "copper" | "silver" | "lead" | "none";
  anodeProduct: "oxygen" | "chlorine" | "iodine" | "copper dissolves" | "none";
};

/** What passing a current for some bench seconds does to the electrolyte. */
export function electrolyse(
  c: Contents,
  cell: CellSetup,
  current: number,
  seconds: number,
): ElectrolysisResult {
  const species = { ...c.species };
  const solids = { ...c.solids };
  const mmolElectrons = (current * seconds) / FARADAY_MMOL;
  const result: ElectrolysisResult = {
    contents: c,
    cathodeGas: null,
    anodeGas: null,
    plated: 0,
    eroded: 0,
    silver: 0,
    cathodeProduct: "none",
    anodeProduct: "none",
  };
  if (mmolElectrons <= 0 || c.volume <= 0) return result;
  const sp = (id: keyof Contents["species"]) => amountOf(species, id);

  let remaining = mmolElectrons;
  if (sp("Ag") > 1e-6) {
    const mmol = Math.min(sp("Ag"), remaining);
    species.Ag = sp("Ag") - mmol;
    solids.ag = amountOf(solids, "ag") + mmol;
    remaining -= mmol;
    result.silver = mmol * 107.87;
    result.cathodeProduct = "silver";
  }
  if (remaining > 0 && sp("Cu") > 1e-6) {
    const mmol = Math.min(sp("Cu"), remaining / 2);
    species.Cu = sp("Cu") - mmol;
    remaining -= mmol * 2;
    result.plated = mmol * 63.55;
    result.cathodeProduct = "copper";
  }
  if (remaining > 1e-9) {
    const hydrogen = remaining / 2;
    result.cathodeGas = { gas: "H2", mL: hydrogen * 24 };
    if (result.cathodeProduct === "none") result.cathodeProduct = "hydrogen";
    if (sp("H") > 0) {
      const used = Math.min(sp("H"), remaining);
      species.H = sp("H") - used;
      species.OH = sp("OH") + (remaining - used);
    } else species.OH = sp("OH") + remaining;
  }

  const anodeElectrons = mmolElectrons;
  if (cell.anode === "copper") {
    result.eroded = (anodeElectrons / 2) * 63.55;
    species.Cu = sp("Cu") + anodeElectrons / 2;
    result.anodeProduct = "copper dissolves";
  } else {
    let left = anodeElectrons;
    if (sp("I") > 1e-6 && left > 0) {
      const mmol = Math.min(sp("I"), left);
      species.I = sp("I") - mmol;
      species.I2 = sp("I2") + mmol / 2;
      left -= mmol;
      result.anodeProduct = "iodine";
    }
    if (left > 0 && molarity(c, "Cl") >= 0.5 && sp("Cl") > 1e-6) {
      const mmol = Math.min(sp("Cl"), left);
      species.Cl = sp("Cl") - mmol;
      left -= mmol;
      result.anodeGas = { gas: "Cl2", mL: (mmol / 2) * 24 };
      result.anodeProduct = "chlorine";
    }
    if (left > 1e-9) {
      const oxygen = left / 4;
      const alkali = Math.min(sp("OH"), left);
      species.OH = sp("OH") - alkali;
      species.H = sp("H") + (left - alkali);
      const previous = result.anodeGas;
      result.anodeGas = previous ? previous : { gas: "O2", mL: oxygen * 24 };
      if (result.anodeProduct === "none") result.anodeProduct = "oxygen";
    }
  }
  result.contents = { ...c, species, solids };
  return result;
}
