import type { ChemEnv, ChemPart } from "../chemistry.types";
import { CLOCK_SPEED } from "./contents";
import {
  cellCurrent,
  electrolyse,
  type CellSetup,
  type Electrode,
  type ElectrolysisResult,
} from "./electrolysis";
import { overlaps } from "./operations";

const BUILT_IN = ["hofmann-voltameter", "u-tube"];

/**
 * Cell constants in cm⁻¹. School cells have small electrodes several
 * centimetres apart, so the current stays well under an ampere.
 */
function constantOf(kind: string) {
  return kind === "hofmann-voltameter" ? 5 : kind === "u-tube" ? 8 : 6;
}

export function canElectrolyse(vessel: ChemPart) {
  return vessel.vessel !== null;
}

/** The electrodes in a vessel: built in, or two electrodes standing in it. */
export function electrodesOf(
  vessel: ChemPart,
  parts: ChemPart[],
): { cathode: Electrode; anode: Electrode } | null {
  if (BUILT_IN.includes(vessel.kind)) {
    const material: Electrode =
      vessel.params.electrode === 1 ? "copper" : "carbon";
    return { cathode: material, anode: material };
  }
  const inside = parts.filter(
    (part) =>
      (part.kind === "carbon-electrode" || part.kind === "copper-electrode") &&
      overlaps(part, vessel),
  );
  const cathode = inside.find((part) => part.params.terminal === 0);
  const anode = inside.find((part) => part.params.terminal === 1);
  if (!cathode || !anode) return null;
  const kind = (part: ChemPart): Electrode =>
    part.kind === "copper-electrode" ? "copper" : "carbon";
  return { cathode: kind(cathode), anode: kind(anode) };
}

export type CellState = {
  supply: ChemPart;
  setup: CellSetup | null;
  current: number;
  running: boolean;
  /** Bench seconds the current has been flowing. */
  seconds: number;
  preview: ElectrolysisResult | null;
};

/** The power supply wired to this vessel, if any, and what the cell is doing. */
export function cellOf(
  vessel: ChemPart,
  env: Pick<ChemEnv, "parts" | "now">,
): CellState | null {
  const supply = env.parts.find(
    (part) =>
      part.kind === "dc-power-supply" && part.params.cell === vessel.num,
  );
  if (!supply) return null;
  const electrodes = electrodesOf(vessel, env.parts);
  const voltage = supply.params.on === 1 ? supply.params.voltage : 0;
  const setup: CellSetup | null = electrodes
    ? { ...electrodes, voltage, constant: constantOf(vessel.kind) }
    : null;
  const current = setup ? cellCurrent(vessel.contents, setup) : 0;
  const running = supply.params.running === 1;
  const seconds = running
    ? Math.max(0, ((env.now - supply.params.startedAt) / 1000) * CLOCK_SPEED)
    : 0;
  return {
    supply,
    setup,
    current,
    running,
    seconds,
    preview:
      setup && running
        ? electrolyse(vessel.contents, setup, current, seconds)
        : null,
  };
}
