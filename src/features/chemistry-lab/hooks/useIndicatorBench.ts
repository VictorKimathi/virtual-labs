import { useReducer } from "react";
import type { IndicatorId } from "../chemistry.types";

export const TUBE_COUNT = 6;

export type Tube = { sampleId: string; indicator: IndicatorId | null };

export type Dosing = { tube: number; token: number };

export type IndicatorBenchState = {
  tubes: (Tube | null)[];
  selected: number | null;
  dosing: Dosing | null;
};

type Action =
  | { type: "fill"; sampleId: string }
  | { type: "test"; indicator: IndicatorId }
  | { type: "empty"; index: number }
  | { type: "select"; index: number }
  | { type: "clear" };

const initialState: IndicatorBenchState = {
  tubes: Array.from({ length: TUBE_COUNT }, () => null),
  selected: null,
  dosing: null,
};

function reducer(
  state: IndicatorBenchState,
  action: Action,
): IndicatorBenchState {
  switch (action.type) {
    case "fill": {
      const slot = state.tubes.findIndex((tube) => tube === null);
      if (slot === -1) return state;
      const tubes = state.tubes.map((tube, index) =>
        index === slot ? { sampleId: action.sampleId, indicator: null } : tube,
      );
      return { ...state, tubes, selected: slot };
    }
    case "test": {
      const { selected } = state;
      if (selected === null) return state;
      const target = state.tubes[selected];
      if (!target || target.indicator) return state;
      const tubes = state.tubes.map((tube, index) =>
        index === selected ? { ...target, indicator: action.indicator } : tube,
      );
      return {
        ...state,
        tubes,
        dosing: { tube: selected, token: (state.dosing?.token ?? 0) + 1 },
      };
    }
    case "empty": {
      const tubes = state.tubes.map((tube, index) =>
        index === action.index ? null : tube,
      );
      return {
        ...state,
        tubes,
        selected: state.selected === action.index ? null : state.selected,
      };
    }
    case "select":
      return state.tubes[action.index]
        ? { ...state, selected: action.index }
        : state;
    case "clear":
      return { ...initialState, dosing: null };
  }
}

export function useIndicatorBench() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    state,
    fill: (sampleId: string) => dispatch({ type: "fill", sampleId }),
    test: (indicator: IndicatorId) => dispatch({ type: "test", indicator }),
    empty: (index: number) => dispatch({ type: "empty", index }),
    select: (index: number) => dispatch({ type: "select", index }),
    clear: () => dispatch({ type: "clear" }),
  };
}
