import { useReducer } from "react";
import {
  BURETTE_CAPACITY,
  phAfterAdding,
  unknownConcentration,
} from "../chem/titration";
import { indicators } from "../data/indicators";
import type { IndicatorId } from "../chemistry.types";

export type Verdict = "correct" | "incorrect" | null;

export type TitrationState = {
  attempt: number;
  volume: number;
  indicator: IndicatorId;
  reached: boolean;
  titres: number[];
  verdict: Verdict;
  pour: { token: number; amount: number };
};

type Action =
  | { type: "add"; amount: number }
  | { type: "pick"; indicator: IndicatorId }
  | { type: "refill" }
  | { type: "new-unknown" }
  | { type: "record" }
  | { type: "check"; value: number };

const initialState: TitrationState = {
  attempt: 0,
  volume: 0,
  indicator: "phenolphthalein",
  reached: false,
  titres: [],
  verdict: null,
  pour: { token: 0, amount: 0 },
};

const roundVolume = (value: number) => Math.round(value * 100) / 100;

function reducer(state: TitrationState, action: Action): TitrationState {
  switch (action.type) {
    case "add": {
      const volume = roundVolume(
        Math.min(BURETTE_CAPACITY, state.volume + action.amount),
      );
      const amount = roundVolume(volume - state.volume);
      if (amount <= 0) return state;
      const base = unknownConcentration(state.attempt);
      const reached =
        state.reached ||
        phAfterAdding(base, volume) <= indicators[state.indicator].endpointPh;
      return {
        ...state,
        volume,
        reached,
        pour: { token: state.pour.token + 1, amount },
      };
    }
    case "pick":
      return state.volume === 0
        ? { ...state, indicator: action.indicator }
        : state;
    case "refill":
      return {
        ...state,
        volume: 0,
        pour: { token: state.pour.token + 1, amount: 0 },
      };
    case "new-unknown":
      return {
        ...initialState,
        attempt: state.attempt + 1,
        indicator: state.indicator,
        pour: { token: state.pour.token + 1, amount: 0 },
      };
    case "record":
      return state.volume > 0
        ? { ...state, titres: [...state.titres, state.volume] }
        : state;
    case "check": {
      const base = unknownConcentration(state.attempt);
      return {
        ...state,
        verdict:
          Math.abs(action.value - base) <= 0.005 ? "correct" : "incorrect",
      };
    }
  }
}

export function useTitration() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    state,
    add: (amount: number) => dispatch({ type: "add", amount }),
    pick: (indicator: IndicatorId) => dispatch({ type: "pick", indicator }),
    refill: () => dispatch({ type: "refill" }),
    newUnknown: () => dispatch({ type: "new-unknown" }),
    record: () => dispatch({ type: "record" }),
    check: (value: number) => dispatch({ type: "check", value }),
  };
}
