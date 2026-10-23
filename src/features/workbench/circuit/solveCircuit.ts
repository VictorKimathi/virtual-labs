import { BULB_RATED_POWER, partDefinitions } from "../data/equipment";
import type { PlacedPart, TerminalRef, Wire } from "../workbench.types";

const WIRE_RESISTANCE = 0.01;
const GROUND_LEAK = 1e-9;
const SHORT_CIRCUIT_CURRENT = 2;
export const LIT_BRIGHTNESS = 0.05;
export const OVERLOAD_BRIGHTNESS = 2.5;

export type PartState = { voltage: number; current: number; power: number };

export type CircuitSolution = {
  potentials: Map<string, number>;
  parts: Map<string, PartState>;
  wires: Map<string, number>;
  shortCircuit: boolean;
};

export function terminalKey(ref: TerminalRef) {
  return `${ref.partId}:${ref.terminal}`;
}

/**
 * Nodal analysis: every terminal is a node, wires are small resistors and
 * sources are Norton equivalents. A tiny leak to ground keeps floating
 * sub-circuits solvable.
 */
export function solveCircuit(
  parts: PlacedPart[],
  wires: Wire[],
): CircuitSolution {
  const index = new Map<string, number>();
  for (const part of parts)
    for (const terminal of partDefinitions[part.kind].terminals)
      index.set(
        terminalKey({ partId: part.id, terminal: terminal.name }),
        index.size,
      );

  const size = index.size;
  const matrix = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) =>
      row === column ? GROUND_LEAK : 0,
    ),
  );
  const injected = new Array<number>(size).fill(0);

  function conductance(a: number, b: number, value: number) {
    matrix[a][a] += value;
    matrix[b][b] += value;
    matrix[a][b] -= value;
    matrix[b][a] -= value;
  }

  const ends = (part: PlacedPart) => {
    const [first, second] = partDefinitions[part.kind].terminals;
    return [
      index.get(terminalKey({ partId: part.id, terminal: first.name })) ?? 0,
      index.get(terminalKey({ partId: part.id, terminal: second.name })) ?? 0,
    ] as const;
  };

  for (const part of parts) {
    const model = partDefinitions[part.kind].model(part);
    const [a, b] = ends(part);
    if (model.type === "resistor") conductance(a, b, 1 / model.resistance);
    if (model.type === "source") {
      conductance(a, b, 1 / model.internalResistance);
      injected[a] += model.voltage / model.internalResistance;
      injected[b] -= model.voltage / model.internalResistance;
    }
  }

  const connectedWires = wires.flatMap((wire) => {
    const a = index.get(terminalKey(wire.from));
    const b = index.get(terminalKey(wire.to));
    return a === undefined || b === undefined ? [] : [{ wire, a, b }];
  });
  for (const { a, b } of connectedWires) conductance(a, b, 1 / WIRE_RESISTANCE);

  const voltages = solveLinear(matrix, injected);
  const potentials = new Map<string, number>();
  for (const [key, position] of index) potentials.set(key, voltages[position]);

  let shortCircuit = false;
  const partStates = new Map<string, PartState>();
  for (const part of parts) {
    const model = partDefinitions[part.kind].model(part);
    const [a, b] = ends(part);
    const voltage = voltages[a] - voltages[b];
    let current = 0;
    if (model.type === "resistor") current = voltage / model.resistance;
    if (model.type === "source") {
      current = (model.voltage - voltage) / model.internalResistance;
      if (Math.abs(current) > SHORT_CIRCUIT_CURRENT) shortCircuit = true;
    }
    partStates.set(part.id, {
      voltage,
      current,
      power: Math.abs(voltage * current),
    });
  }

  const wireCurrents = new Map<string, number>();
  for (const { wire, a, b } of connectedWires)
    wireCurrents.set(wire.id, (voltages[a] - voltages[b]) / WIRE_RESISTANCE);

  return {
    potentials,
    parts: partStates,
    wires: wireCurrents,
    shortCircuit,
  };
}

function solveLinear(matrix: number[][], vector: number[]) {
  const size = vector.length;
  const rows = matrix.map((row, i) => [...row, vector[i]]);
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let row = column + 1; row < size; row++)
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column]))
        pivot = row;
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const lead = rows[column][column];
    if (lead === 0) continue;
    for (let row = column + 1; row < size; row++) {
      const factor = rows[row][column] / lead;
      if (factor === 0) continue;
      for (let k = column; k <= size; k++)
        rows[row][k] -= factor * rows[column][k];
    }
  }
  const result = new Array<number>(size).fill(0);
  for (let row = size - 1; row >= 0; row--) {
    let sum = rows[row][size];
    for (let k = row + 1; k < size; k++) sum -= rows[row][k] * result[k];
    result[row] = rows[row][row] === 0 ? 0 : sum / rows[row][row];
  }
  return result;
}

export function bulbBrightness(solution: CircuitSolution, partId: string) {
  return (solution.parts.get(partId)?.power ?? 0) / BULB_RATED_POWER;
}

export function meterReading(solution: CircuitSolution, part: PlacedPart) {
  const state = solution.parts.get(part.id);
  if (!state) return 0;
  return partDefinitions[part.kind].meter?.unit === "A"
    ? state.current
    : state.voltage;
}
