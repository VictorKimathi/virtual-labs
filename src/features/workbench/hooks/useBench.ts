import { useReducer } from "react";
import { solveCircuit } from "../circuit/solveCircuit";
import { emptySolution, type CircuitSolution } from "../circuit/solution";
import {
  makeEnv,
  newPart,
  partDefinitions,
  reactions,
} from "../data/equipment";
import type {
  MeterReading,
  NotebookRecord,
  PartKind,
  PlacedPart,
  Selection,
  TerminalRef,
  Wire,
} from "../workbench.types";

export const BENCH_WIDTH = 1120;
export const BENCH_HEIGHT = 630;
const GRID = 10;
const MAX_REACTION_PASSES = 4;

export type BenchState = {
  parts: PlacedPart[];
  wires: Wire[];
  solution: CircuitSolution;
  selection: Selection | null;
  pendingTerminal: TerminalRef | null;
  records: NotebookRecord[];
  nextId: number;
};

type BenchAction =
  | { type: "add-part"; kind: PartKind; x?: number; y?: number }
  | { type: "move-part"; id: string; x: number; y: number }
  | { type: "select"; selection: Selection | null }
  | { type: "set-param"; id: string; param: string; value: number }
  | { type: "press"; id: string; control: string; now: number }
  | { type: "tap"; id: string }
  | { type: "terminal"; terminal: TerminalRef }
  | { type: "remove-selected" }
  | { type: "record"; readings: MeterReading[] }
  | { type: "clear-records" }
  | { type: "reset" };

const initialState: BenchState = {
  parts: [],
  wires: [],
  solution: emptySolution,
  selection: null,
  pendingTerminal: null,
  records: [],
  nextId: 1,
};

function placeWithinBench(kind: PartKind, x: number, y: number) {
  const { width, height } = partDefinitions[kind];
  const snap = (value: number) => Math.round(value / GRID) * GRID;
  return {
    x: Math.max(0, Math.min(BENCH_WIDTH - width, snap(x))),
    y: Math.max(0, Math.min(BENCH_HEIGHT - height, snap(y))),
  };
}

/** The first free place on the bench, scanning from the top left. */
function freeSpot(parts: PlacedPart[], kind: PartKind) {
  const { width, height } = partDefinitions[kind];
  const gap = 16;
  for (let y = 20; y <= BENCH_HEIGHT - height; y += GRID * 3)
    for (let x = 20; x <= BENCH_WIDTH - width; x += GRID * 3) {
      const clear = parts.every((part) => {
        const other = partDefinitions[part.kind];
        return (
          x + width + gap <= part.x ||
          part.x + other.width + gap <= x ||
          y + height + gap <= part.y ||
          part.y + other.height + gap <= y
        );
      });
      if (clear) return { x, y };
    }
  const offset = (parts.length % 6) * 40;
  return { x: 60 + offset, y: 60 + offset };
}

function sameTerminal(a: TerminalRef, b: TerminalRef) {
  return a.partId === b.partId && a.terminal === b.terminal;
}

/** Solves the circuit, then applies permanent effects such as a blown fuse. */
function settle(parts: PlacedPart[], wires: Wire[]) {
  let current = parts;
  for (let pass = 0; pass < MAX_REACTION_PASSES; pass++) {
    const solution = solveCircuit(current, wires);
    const patches = reactions(makeEnv(current, wires, solution, 0));
    if (patches.size === 0) return { parts: current, solution };
    current = current.map((part) => {
      const patch = patches.get(part.id);
      return patch ? { ...part, params: { ...part.params, ...patch } } : part;
    });
  }
  return { parts: current, solution: solveCircuit(current, wires) };
}

function withParts(
  state: BenchState,
  change: (part: PlacedPart) => PlacedPart,
  id: string,
): BenchState {
  const parts = state.parts.map((part) =>
    part.id === id ? change(part) : part,
  );
  return { ...state, ...settle(parts, state.wires) };
}

function benchReducer(state: BenchState, action: BenchAction): BenchState {
  switch (action.type) {
    case "add-part": {
      const spot = freeSpot(state.parts, action.kind);
      const position = placeWithinBench(
        action.kind,
        action.x ?? spot.x,
        action.y ?? spot.y,
      );
      const id = `${action.kind}-${state.nextId}`;
      const part = newPart(action.kind, id, position.x, position.y);
      return {
        ...state,
        ...settle([...state.parts, part], state.wires),
        selection: { type: "part", id },
        pendingTerminal: null,
        nextId: state.nextId + 1,
      };
    }
    case "move-part":
      return {
        ...state,
        parts: state.parts.map((part) =>
          part.id === action.id
            ? { ...part, ...placeWithinBench(part.kind, action.x, action.y) }
            : part,
        ),
      };
    case "select":
      return { ...state, selection: action.selection, pendingTerminal: null };
    case "set-param":
      return withParts(
        state,
        (part) => ({
          ...part,
          params: { ...part.params, [action.param]: action.value },
        }),
        action.id,
      );
    case "press":
      return withParts(
        state,
        (part) => {
          const control = partDefinitions[part.kind].controls.find(
            (item) => item.id === action.control,
          );
          return control?.type === "button"
            ? { ...part, params: control.apply(part.params, action.now) }
            : part;
        },
        action.id,
      );
    case "tap":
      return withParts(
        state,
        (part) => {
          const key = partDefinitions[part.kind].tapToggles;
          return key
            ? {
                ...part,
                params: {
                  ...part.params,
                  [key]: part.params[key] === 1 ? 0 : 1,
                },
              }
            : part;
        },
        action.id,
      );
    case "terminal": {
      const pending = state.pendingTerminal;
      if (!pending) return { ...state, pendingTerminal: action.terminal };
      if (sameTerminal(pending, action.terminal))
        return { ...state, pendingTerminal: null };
      const duplicate = state.wires.some(
        (wire) =>
          (sameTerminal(wire.from, pending) &&
            sameTerminal(wire.to, action.terminal)) ||
          (sameTerminal(wire.to, pending) &&
            sameTerminal(wire.from, action.terminal)),
      );
      if (duplicate) return { ...state, pendingTerminal: null };
      const id = `wire-${state.nextId}`;
      const wires = [
        ...state.wires,
        { id, from: pending, to: action.terminal },
      ];
      return {
        ...state,
        wires,
        ...settle(state.parts, wires),
        selection: { type: "wire", id },
        pendingTerminal: null,
        nextId: state.nextId + 1,
      };
    }
    case "remove-selected": {
      const selection = state.selection;
      if (!selection) return state;
      if (selection.type === "wire") {
        const wires = state.wires.filter((wire) => wire.id !== selection.id);
        return {
          ...state,
          wires,
          ...settle(state.parts, wires),
          selection: null,
        };
      }
      const parts = state.parts.filter((part) => part.id !== selection.id);
      const wires = state.wires.filter(
        (wire) =>
          wire.from.partId !== selection.id && wire.to.partId !== selection.id,
      );
      return {
        ...state,
        wires,
        ...settle(parts, wires),
        selection: null,
        pendingTerminal: null,
      };
    }
    case "record":
      return {
        ...state,
        records: [
          ...state.records,
          { id: `record-${state.nextId}`, readings: action.readings },
        ],
        nextId: state.nextId + 1,
      };
    case "clear-records":
      return { ...state, records: [] };
    case "reset":
      return initialState;
  }
}

export function useBench() {
  return useReducer(benchReducer, initialState);
}

export function partLabel(parts: PlacedPart[], part: PlacedPart, name: string) {
  const sameKind = parts.filter((item) => item.kind === part.kind);
  return sameKind.length > 1
    ? `${name} ${sameKind.findIndex((item) => item.id === part.id) + 1}`
    : name;
}
