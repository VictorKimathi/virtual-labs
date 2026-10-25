import { useReducer } from "react";
import type { MeterReading, Selection } from "../../workbench/workbench.types";
import type { BioKind, BioPart, BioRemedy, BioState } from "../biology.types";
import { bioDefinitions, createBioPart } from "../data/equipment";

export const BIO_BENCH_WIDTH = 1120;
export const BIO_BENCH_HEIGHT = 630;
const GRID = 10;

type BioAction =
  | { type: "add-part"; kind: BioKind; x?: number; y?: number }
  | { type: "move-part"; id: string; x: number; y: number }
  | { type: "select"; selection: Selection | null }
  | { type: "set-param"; id: string; param: string; value: number }
  | { type: "press"; id: string; control: string }
  | { type: "tap"; id: string }
  | { type: "wear"; kind: BioKind }
  | { type: "use"; kind: BioRemedy }
  | { type: "remove-selected" }
  | { type: "record"; readings: MeterReading[] }
  | { type: "clear-records" }
  | { type: "tick"; seconds: number }
  | { type: "speed"; speed: number }
  | { type: "run"; running: boolean }
  | { type: "reset" };

const initialState: BioState = {
  parts: [],
  selection: null,
  records: [],
  incidents: [],
  nextId: 1,
  time: 0,
  speed: 0,
  running: true,
};

function placeWithinBench(kind: BioKind, x: number, y: number) {
  const { width, height } = bioDefinitions[kind];
  const snap = (value: number) => Math.round(value / GRID) * GRID;
  return {
    x: Math.max(0, Math.min(BIO_BENCH_WIDTH - width, snap(x))),
    y: Math.max(0, Math.min(BIO_BENCH_HEIGHT - height, snap(y))),
  };
}

/** The first free place on the bench, scanning from the top left. */
function freeSpot(parts: BioPart[], kind: BioKind) {
  const { width, height } = bioDefinitions[kind];
  const gap = 16;
  for (let y = 20; y <= BIO_BENCH_HEIGHT - height; y += GRID * 3)
    for (let x = 20; x <= BIO_BENCH_WIDTH - width; x += GRID * 3) {
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

function addPart(state: BioState, kind: BioKind, x?: number, y?: number) {
  const spot = freeSpot(state.parts, kind);
  const position = placeWithinBench(kind, x ?? spot.x, y ?? spot.y);
  const part = createBioPart(
    kind,
    state.nextId,
    position.x,
    position.y,
    state.time,
  );
  return {
    state: {
      ...state,
      parts: [...state.parts, part],
      nextId: state.nextId + 1,
    },
    part,
  };
}

function ensurePart(state: BioState, kind: BioKind) {
  const found = state.parts.find((part) => part.kind === kind);
  return found ? { state, part: found } : addPart(state, kind);
}

const update = (
  state: BioState,
  id: string,
  change: (part: BioPart) => BioPart,
): BioState => ({
  ...state,
  parts: state.parts.map((part) => (part.id === id ? change(part) : part)),
});

function bioReducer(state: BioState, action: BioAction): BioState {
  switch (action.type) {
    case "add-part": {
      const { state: next, part } = addPart(
        state,
        action.kind,
        action.x,
        action.y,
      );
      return { ...next, selection: { type: "part", id: part.id } };
    }
    case "move-part":
      return update(state, action.id, (part) => ({
        ...part,
        ...placeWithinBench(part.kind, action.x, action.y),
        // A quadrat moved by hand is no longer at random coordinates.
        params:
          part.params.random === 1
            ? { ...part.params, random: 0 }
            : part.params,
      }));
    case "select":
      return { ...state, selection: action.selection };
    case "set-param": {
      const before = state.parts.find((part) => part.id === action.id);
      if (!before) return state;
      const after = {
        ...before,
        params: { ...before.params, [action.param]: action.value },
      };
      const next = update(state, action.id, () => after);
      const hook = bioDefinitions[before.kind].afterChange;
      return hook
        ? hook({
            state: next,
            before,
            after,
            param: action.param,
            time: state.time,
          })
        : next;
    }
    case "press": {
      const part = state.parts.find((item) => item.id === action.id);
      const control = part
        ? bioDefinitions[part.kind].controls.find(
            (item) => item.id === action.control,
          )
        : undefined;
      if (!part || control?.type !== "button") return state;
      return control.run({ state, part, time: state.time });
    }
    case "tap":
      return update(state, action.id, (part) => {
        const key = bioDefinitions[part.kind].tapToggles;
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
      const control = bioDefinitions[part.kind].controls.find(
        (item) => item.id === "use",
      );
      return control?.type === "button"
        ? control.run({ state: next, part, time: state.time })
        : next;
    }
    case "remove-selected": {
      const selection = state.selection;
      if (selection?.type !== "part") return state;
      const removed = state.parts.find((part) => part.id === selection.id);
      if (!removed) return state;
      // Links to the removed part now point at nothing.
      const parts = state.parts
        .filter((part) => part.id !== removed.id)
        .map((part) => {
          const links = bioDefinitions[part.kind].controls.filter(
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
    case "tick":
      return { ...state, time: state.time + action.seconds };
    case "speed":
      return { ...state, speed: action.speed };
    case "run":
      return { ...state, running: action.running };
    case "reset":
      return initialState;
  }
}

export function useBioBench() {
  return useReducer(bioReducer, initialState);
}
