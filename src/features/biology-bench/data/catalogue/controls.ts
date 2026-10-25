import type {
  BioControl,
  BioEnv,
  BioPart,
  BioPressInput,
  BioState,
} from "../../biology.types";
import { t } from "../../../workbench/data/catalogue/helpers";

type When = (part: BioPart, env: BioEnv) => boolean;

export const slider = (
  id: string,
  label: [string, string],
  min: number,
  max: number,
  step: number,
  value: number,
  unit?: string,
  when?: When,
): BioControl => ({
  type: "slider",
  id,
  label: t(...label),
  unit,
  min,
  max,
  step,
  default: value,
  when,
});

export const choice = (
  id: string,
  label: [string, string],
  options: [string, string][],
  value = 0,
  when?: When,
): BioControl => ({
  type: "select",
  id,
  label: t(...label),
  options: options.map(([en, sw]) => t(en, sw)),
  default: value,
  when,
});

export const toggle = (
  id: string,
  label: [string, string],
  on: [string, string],
  off: [string, string],
  value: 0 | 1 = 0,
  when?: When,
): BioControl => ({
  type: "toggle",
  id,
  label: t(...label),
  on: t(...on),
  off: t(...off),
  default: value,
  when,
});

export const link = (
  id: string,
  label: [string, string],
  none: [string, string],
  choices: (candidate: BioPart, self: BioPart) => boolean,
  when?: When,
): BioControl => ({
  type: "link",
  id,
  label: t(...label),
  none: t(...none),
  choices,
  when,
});

export const button = (
  id: string,
  label: [string, string],
  run: (input: BioPressInput) => BioState,
  when?: When,
): BioControl => ({
  type: "button",
  id,
  label: t(...label),
  run,
  when,
});

export const hint = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

/** Starts a timed process now, on bench time. */
export const startNow =
  (key = "startedAt") =>
  ({ state, part, time }: BioPressInput): BioState => ({
    ...state,
    parts: state.parts.map((item) =>
      item.id === part.id
        ? { ...item, params: { ...item.params, [key]: time, started: 1 } }
        : item,
    ),
  });
