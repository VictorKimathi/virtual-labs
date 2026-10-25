import { useReducer } from "react";
import type { MeterReading, Selection } from "../../workbench/workbench.types";
import type { ChemKind, ChemPart, ChemState, Remedy } from "../chemistry.types";
import { chemDefinitions, createPart, vesselSpecOf } from "../data/equipment";

export const CHEM_BENCH_WIDTH = 1120;
export const CHEM_BENCH_HEIGHT = 630;
const GRID = 10;

type ChemAction =
  | { type: "add-part"; kind: ChemKind; x?: number; y?: number }
  | { type: "move-part"; id: string; x: number; y: number }
  | { type: "select"; selection: Selection | null }
  | { type: "set-param"; id: string; param: string; value: number }
  | { type: "press"; id: string; control: string; now: number }
  | { type: "tap"; id: string }
  | { type: "wear"; kind: ChemKind }
  | { type: "use"; kind: Remedy; now: number }
  | { type: "remove-selected" }
  | { type: "record"; readings: MeterReading[] }
  | { type: "clear-records" }
  | { type: "reset" };

const initialState: ChemState = {
  parts: [],
  selection: null,
  records: [],
  incidents: [],
  nextId: 1,
};

function placeWithinBench(kind: ChemKind, x: number, y: number) {
  const { width, height } = chemDefinitions[kind];
  const snap = (value: number) => Math.round(value / GRID) * GRID;
  return {
    x: Math.max(0, Math.min(CHEM_BENCH_WIDTH - width, snap(x))),
    y: Math.max(0, Math.min(CHEM_BENCH_HEIGHT - height, snap(y))),
  };
}

/** The first free place on the bench, scanning from the top left. */
function freeSpot(parts: ChemPart[], kind: ChemKind) {
  const { width, height } = chemDefinitions[kind];
  const gap = 16;
  for (let y = 20; y <= CHEM_BENCH_HEIGHT - height; y += GRID * 3)
    for (let x = 20; x <= CHEM_BENCH_WIDTH - width; x += GRID * 3) {
      const clear = parts.every(
        (part) =>
          x + width + gap <= part.x ||
          part.x + part.width + gap <= x ||
          y + height + gap <= part.y ||
          part.y + part.height + gap <= y,
      );
      if (clear) return { x, y };
    }
  const offset = (parts.length % 6) * 40;
  return { x: 60 + offset, y: 60 + offset };
}

/** The button on each safety item that deals with an incident. */
const remedyControl: Record<Remedy, string> = {
  "eye-wash": "use",
  "safety-shower": "use",
  "first-aid-kit": "use",
  "fire-blanket": "use",
  "sand-bucket": "use",
  "fire-extinguisher": "use",
  "fume-cupboard": "clear",
  "waste-container": "clean",
};

/** Finds a part of a kind on the bench, or puts one in a free spot. */
function ensurePart(
  state: ChemState,
  kind: ChemKind,
): { state: ChemState; part: ChemPart } {
  const found = state.parts.find((part) => part.kind === kind);
  if (found) return { state, part: found };
  const spot = freeSpot(state.parts, kind);
  const position = placeWithinBench(kind, spot.x, spot.y);
  const part = createPart(kind, state.nextId, position.x, position.y);
  return {
    state: {
      ...state,
      parts: [...state.parts, part],
      nextId: state.nextId + 1,
    },
    part,
  };
}

function update(
  state: ChemState,
  id: string,
  change: (part: ChemPart) => ChemPart,
): ChemState {
  return {
    ...state,
    parts: state.parts.map((part) => (part.id === id ? change(part) : part)),
  };
}

function chemReducer(state: ChemState, action: ChemAction): ChemState {
  switch (action.type) {
    case "add-part": {
      const spot = freeSpot(state.parts, action.kind);
      const position = placeWithinBench(
        action.kind,
        action.x ?? spot.x,
        action.y ?? spot.y,
      );
      const part = createPart(
        action.kind,
        state.nextId,
        position.x,
        position.y,
      );
      return {
        ...state,
        parts: [...state.parts, part],
        selection: { type: "part", id: part.id },
        nextId: state.nextId + 1,
      };
    }
    case "move-part":
      return update(state, action.id, (part) => ({
        ...part,
        ...placeWithinBench(part.kind, action.x, action.y),
      }));
    case "select":
      return { ...state, selection: action.selection };
    case "set-param":
      return update(state, action.id, (part) => {
        const params = { ...part.params, [action.param]: action.value };
        return { ...part, params, vessel: vesselSpecOf(part.kind, params) };
      });
    case "press": {
      const part = state.parts.find((item) => item.id === action.id);
      const control = part
        ? chemDefinitions[part.kind].controls.find(
            (item) => item.id === action.control,
          )
        : undefined;
      if (!part || control?.type !== "button") return state;
      return control.run({ state, part, now: action.now });
    }
    case "tap":
      return update(state, action.id, (part) => {
        const key = chemDefinitions[part.kind].tapToggles;
        return key
          ? {
              ...part,
              params: { ...part.params, [key]: part.params[key] === 1 ? 0 : 1 },
            }
          : part;
      });
    case "wear": {
      const { state: next, part } = ensurePart(state, action.kind);
      return update(next, part.id, (item) => ({
        ...item,
        params: { ...item.params, worn: 1 },
      }));
    }
    case "use": {
      const { state: next, part } = ensurePart(state, action.kind);
      const control = chemDefinitions[part.kind].controls.find(
        (item) => item.id === remedyControl[action.kind],
      );
      return control?.type === "button"
        ? control.run({ state: next, part, now: action.now })
        : next;
    }
    case "remove-selected": {
      const selection = state.selection;
      if (selection?.type !== "part") return state;
      const removed = state.parts.find((part) => part.id === selection.id);
      if (!removed) return state;
      // Links to the removed part point at nothing now.
      const parts = state.parts
        .filter((part) => part.id !== selection.id)
        .map((part) => {
          const links = chemDefinitions[part.kind].controls.filter(
            (control) =>
              control.type === "link" &&
              part.params[control.id] === removed.num,
          );
          if (links.length === 0) return part;
          const params = { ...part.params };
          for (const control of links) params[control.id] = 0;
          return { ...part, params };
        });
      return { ...state, parts, selection: null };
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

export function useChemBench() {
  return useReducer(chemReducer, initialState);
}
