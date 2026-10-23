import { useReducer } from "react";
import { partDefinitions } from "../data/equipment";
import type {
  MeterReading,
  NotebookRecord,
  PartKind,
  PlacedPart,
  Selection,
  TerminalRef,
  Wire,
} from "../workbench.types";

export const BENCH_WIDTH = 960;
export const BENCH_HEIGHT = 540;
const GRID = 10;

export type BenchState = {
  parts: PlacedPart[];
  wires: Wire[];
  selection: Selection | null;
  pendingTerminal: TerminalRef | null;
  records: NotebookRecord[];
  nextId: number;
};

type BenchAction =
  | { type: "add-part"; kind: PartKind; x?: number; y?: number }
  | { type: "move-part"; id: string; x: number; y: number }
  | { type: "select"; selection: Selection | null }
  | { type: "set-value"; id: string; value: number }
  | { type: "toggle-switch"; id: string }
  | { type: "terminal"; terminal: TerminalRef }
  | { type: "remove-selected" }
  | { type: "record"; readings: MeterReading[] }
  | { type: "clear-records" }
  | { type: "reset" };

const initialState: BenchState = {
  parts: [],
  wires: [],
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

function sameTerminal(a: TerminalRef, b: TerminalRef) {
  return a.partId === b.partId && a.terminal === b.terminal;
}

function benchReducer(state: BenchState, action: BenchAction): BenchState {
  switch (action.type) {
    case "add-part": {
      const definition = partDefinitions[action.kind];
      const offset = (state.parts.length % 6) * 40;
      const position = placeWithinBench(
        action.kind,
        action.x ?? 60 + offset,
        action.y ?? 60 + offset,
      );
      const id = `${action.kind}-${state.nextId}`;
      return {
        ...state,
        parts: [
          ...state.parts,
          {
            id,
            kind: action.kind,
            ...position,
            value: definition.defaultValue,
            closed: action.kind !== "switch",
          },
        ],
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
    case "set-value":
      return {
        ...state,
        parts: state.parts.map((part) =>
          part.id === action.id ? { ...part, value: action.value } : part,
        ),
      };
    case "toggle-switch":
      return {
        ...state,
        parts: state.parts.map((part) =>
          part.id === action.id ? { ...part, closed: !part.closed } : part,
        ),
      };
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
      return {
        ...state,
        wires: [...state.wires, { id, from: pending, to: action.terminal }],
        selection: { type: "wire", id },
        pendingTerminal: null,
        nextId: state.nextId + 1,
      };
    }
    case "remove-selected": {
      const selection = state.selection;
      if (!selection) return state;
      if (selection.type === "wire")
        return {
          ...state,
          wires: state.wires.filter((wire) => wire.id !== selection.id),
          selection: null,
        };
      return {
        ...state,
        parts: state.parts.filter((part) => part.id !== selection.id),
        wires: state.wires.filter(
          (wire) =>
            wire.from.partId !== selection.id &&
            wire.to.partId !== selection.id,
        ),
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
