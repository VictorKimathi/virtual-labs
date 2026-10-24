import { partDefinitions } from "../data/equipment";
import type {
  ElectricalElement,
  PlacedPart,
  TerminalName,
  Wire,
} from "../workbench.types";
import {
  terminalKey,
  type CircuitSolution,
  type ElementState,
} from "./solution";

const WIRE_RESISTANCE = 0.01;
const GROUND_LEAK = 1e-9;
const SHORT_CIRCUIT_CURRENT = 2;
const MAX_PASSES = 40;
const PROBE_CURRENT = 1e-3;
const OPEN_OHMS = 1e7;

type SolveOptions = {
  /** Replace every source by its internal resistance, as for an ohmmeter. */
  deenergise?: boolean;
  /** Push a test current through one pair of terminals. */
  probe?: { partId: string; a: TerminalName; b: TerminalName };
};

type Flat = {
  part: PlacedPart;
  index: number;
  key: string;
  element: ElectricalElement;
  a: number;
  b: number;
  c: number;
  d: number;
};

/**
 * Nodal analysis: every terminal is a node, wires are small resistors and
 * sources are Norton equivalents. Diodes, current limits and transformers are
 * resolved by repeating the solve until their on/off states settle. A tiny
 * leak to ground keeps floating sub-circuits solvable.
 */
export function solveCircuit(
  parts: PlacedPart[],
  wires: Wire[],
  options: SolveOptions = {},
): CircuitSolution {
  const energised = !options.deenergise;
  const index = new Map<string, number>();
  for (const part of parts)
    for (const terminal of partDefinitions[part.kind].terminals)
      index.set(
        terminalKey({ partId: part.id, terminal: terminal.name }),
        index.size,
      );

  const size = index.size;
  const nodeOf = (partId: string, terminal: TerminalName | undefined) =>
    terminal === undefined
      ? -1
      : (index.get(terminalKey({ partId, terminal })) ?? -1);

  const flat: Flat[] = parts.flatMap((part) =>
    (partDefinitions[part.kind].electrical?.(part) ?? []).flatMap(
      (element, position) => {
        const entry: Flat = {
          part,
          index: position,
          key: `${part.id}:${position}`,
          element,
          a: nodeOf(part.id, element.a),
          b: nodeOf(part.id, element.b),
          c: nodeOf(
            part.id,
            element.type === "transformer" ? element.c : undefined,
          ),
          d: nodeOf(
            part.id,
            element.type === "transformer" ? element.d : undefined,
          ),
        };
        const complete =
          entry.a >= 0 &&
          entry.b >= 0 &&
          (element.type !== "transformer" || (entry.c >= 0 && entry.d >= 0));
        return complete ? [entry] : [];
      },
    ),
  );

  const acSource = energised
    ? flat.find(
        (item) =>
          item.element.type === "source" &&
          item.element.ac !== undefined &&
          item.element.voltage > 0,
      )
    : undefined;
  const acElement = acSource?.element;
  const alternating = acElement?.type === "source" ? acElement.ac : undefined;

  const connectedWires = wires.flatMap((wire) => {
    const a = index.get(terminalKey(wire.from));
    const b = index.get(terminalKey(wire.to));
    return a === undefined || b === undefined ? [] : [{ wire, a, b }];
  });

  const diodeOn = new Set<string>();
  const limited = new Set<string>();
  const secondaryEmf = new Map<string, number>();
  let voltages: number[] = new Array<number>(size).fill(0);

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const matrix = Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, column) =>
        row === column ? GROUND_LEAK : 0,
      ),
    );
    const injected = new Array<number>(size).fill(0);
    const conductance = (a: number, b: number, value: number) => {
      matrix[a][a] += value;
      matrix[b][b] += value;
      matrix[a][b] -= value;
      matrix[b][a] -= value;
    };
    const norton = (a: number, b: number, resistance: number, emf: number) => {
      conductance(a, b, 1 / resistance);
      injected[a] += emf / resistance;
      injected[b] -= emf / resistance;
    };

    for (const item of flat) {
      const { element } = item;
      switch (element.type) {
        case "resistor":
          conductance(item.a, item.b, 1 / element.resistance);
          break;
        case "source":
          if (limited.has(item.part.id) && element.currentLimit !== undefined) {
            injected[item.a] += element.currentLimit;
            injected[item.b] -= element.currentLimit;
          } else
            norton(
              item.a,
              item.b,
              element.internalResistance,
              energised ? element.voltage : 0,
            );
          break;
        case "diode":
          if (diodeOn.has(item.key))
            norton(item.a, item.b, element.resistance, element.forward);
          break;
        case "gated":
          if (diodeOn.has(`${item.part.id}:${element.gate}`))
            conductance(item.a, item.b, 1 / element.resistance);
          break;
        case "transformer":
          conductance(item.a, item.b, 1 / element.primaryResistance);
          norton(
            item.c,
            item.d,
            element.secondaryResistance,
            secondaryEmf.get(item.key) ?? 0,
          );
          break;
        case "ohmmeter":
          break;
      }
    }
    for (const { a, b } of connectedWires)
      conductance(a, b, 1 / WIRE_RESISTANCE);

    if (options.probe) {
      const a = nodeOf(options.probe.partId, options.probe.a);
      const b = nodeOf(options.probe.partId, options.probe.b);
      if (a >= 0 && b >= 0) {
        injected[a] += PROBE_CURRENT;
        injected[b] -= PROBE_CURRENT;
      }
    }

    voltages = solveLinear(matrix, injected);

    let changed = false;
    for (const item of flat) {
      const { element } = item;
      const across = voltages[item.a] - voltages[item.b];
      if (element.type === "diode") {
        const on = diodeOn.has(item.key);
        if (!on && across > element.forward + 1e-6) {
          diodeOn.add(item.key);
          changed = true;
        } else if (on && (across - element.forward) / element.resistance < 0) {
          diodeOn.delete(item.key);
          changed = true;
        }
      }
      if (element.type === "source" && element.currentLimit !== undefined) {
        const unlimited =
          (element.voltage - across) / element.internalResistance;
        const isLimited = limited.has(item.part.id);
        if (!isLimited && unlimited > element.currentLimit * 1.000001) {
          limited.add(item.part.id);
          changed = true;
        } else if (isLimited && unlimited < element.currentLimit * 0.999999) {
          limited.delete(item.part.id);
          changed = true;
        }
      }
      if (element.type === "transformer") {
        const target = alternating ? element.ratio * across : 0;
        if (Math.abs(target - (secondaryEmf.get(item.key) ?? 0)) > 1e-9) {
          secondaryEmf.set(item.key, target);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  const potentials = new Map<string, number>();
  for (const [key, position] of index) potentials.set(key, voltages[position]);

  let shortCircuit = false;
  const elements = new Map<string, ElementState[]>();
  for (const item of flat) {
    const { element } = item;
    const across = voltages[item.a] - voltages[item.b];
    const states: ElementState[] = [];
    const push = (voltage: number, current: number) =>
      states.push({ voltage, current, power: Math.abs(voltage * current) });
    switch (element.type) {
      case "resistor":
        push(across, across / element.resistance);
        break;
      case "source": {
        const isLimited = limited.has(item.part.id);
        const current = isLimited
          ? (element.currentLimit ?? 0)
          : ((energised ? element.voltage : 0) - across) /
            element.internalResistance;
        if (!isLimited && Math.abs(current) > SHORT_CIRCUIT_CURRENT)
          shortCircuit = true;
        push(across, current);
        break;
      }
      case "diode":
        push(
          across,
          diodeOn.has(item.key)
            ? (across - element.forward) / element.resistance
            : 0,
        );
        break;
      case "gated":
        push(
          across,
          diodeOn.has(`${item.part.id}:${element.gate}`)
            ? across / element.resistance
            : 0,
        );
        break;
      case "transformer": {
        const secondary = voltages[item.c] - voltages[item.d];
        push(across, across / element.primaryResistance);
        push(
          secondary,
          ((secondaryEmf.get(item.key) ?? 0) - secondary) /
            element.secondaryResistance,
        );
        break;
      }
      case "ohmmeter":
        push(across, 0);
        break;
    }
    elements.set(item.part.id, [
      ...(elements.get(item.part.id) ?? []),
      ...states,
    ]);
  }

  const wireCurrents = new Map<string, number>();
  for (const { wire, a, b } of connectedWires)
    wireCurrents.set(wire.id, (voltages[a] - voltages[b]) / WIRE_RESISTANCE);

  const ohms = new Map<string, number>();
  if (energised && !options.probe)
    for (const item of flat) {
      if (item.element.type !== "ohmmeter") continue;
      const probed = solveCircuit(parts, wires, {
        deenergise: true,
        probe: {
          partId: item.part.id,
          a: item.element.a,
          b: item.element.b,
        },
      });
      const across =
        (probed.potentials.get(
          terminalKey({ partId: item.part.id, terminal: item.element.a }),
        ) ?? 0) -
        (probed.potentials.get(
          terminalKey({ partId: item.part.id, terminal: item.element.b }),
        ) ?? 0);
      const resistance = across / PROBE_CURRENT;
      ohms.set(item.part.id, resistance > OPEN_OHMS ? Infinity : resistance);
    }

  const primary = new Map<string, ElementState>();
  for (const [id, states] of elements) primary.set(id, states[0]);

  return {
    potentials,
    parts: primary,
    elements,
    wires: wireCurrents,
    shortCircuit,
    ac: alternating !== undefined,
    frequency: alternating?.frequency ?? 0,
    wave: alternating?.wave ?? 0,
    ohms,
    limited,
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
