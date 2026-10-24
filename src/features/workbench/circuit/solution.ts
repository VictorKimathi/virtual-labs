import type { TerminalRef } from "../workbench.types";

export type ElementState = { voltage: number; current: number; power: number };

export type CircuitSolution = {
  /** Potential of every terminal, by `terminalKey`. */
  potentials: Map<string, number>;
  /** The first electrical element of each part. */
  parts: Map<string, ElementState>;
  /** All electrical elements of each part, in definition order. */
  elements: Map<string, ElementState[]>;
  wires: Map<string, number>;
  shortCircuit: boolean;
  /** True when an alternating source is delivering power. */
  ac: boolean;
  frequency: number;
  /** 0 sine, 1 square, 2 triangle. */
  wave: number;
  /** Resistance read by each multimeter in ohm mode. */
  ohms: Map<string, number>;
  /** Supplies that have reached their current limit. */
  limited: Set<string>;
};

export const emptySolution: CircuitSolution = {
  potentials: new Map(),
  parts: new Map(),
  elements: new Map(),
  wires: new Map(),
  shortCircuit: false,
  ac: false,
  frequency: 0,
  wave: 0,
  ohms: new Map(),
  limited: new Set(),
};

export function terminalKey(ref: TerminalRef) {
  return `${ref.partId}:${ref.terminal}`;
}

const idle: ElementState = { voltage: 0, current: 0, power: 0 };

export function elementState(
  solution: CircuitSolution,
  partId: string,
  index = 0,
): ElementState {
  return solution.elements.get(partId)?.[index] ?? idle;
}

export function potentialOf(solution: CircuitSolution, ref: TerminalRef) {
  return solution.potentials.get(terminalKey(ref)) ?? 0;
}
