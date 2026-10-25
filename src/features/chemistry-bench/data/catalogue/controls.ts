import type {
  ChemControl,
  ChemEnv,
  ChemPart,
  ChemState,
  PressInput,
} from "../../chemistry.types";
import { t } from "../../../workbench/data/catalogue/helpers";

type When = (part: ChemPart, env: ChemEnv) => boolean;

export function slider(
  id: string,
  label: [string, string],
  min: number,
  max: number,
  step: number,
  value: number,
  unit?: string,
  when?: When,
): ChemControl {
  return {
    type: "slider",
    id,
    label: t(...label),
    unit,
    min,
    max,
    step,
    default: value,
    when,
  };
}

export function choice(
  id: string,
  label: [string, string],
  options: [string, string][],
  value = 0,
  when?: When,
): ChemControl {
  return {
    type: "select",
    id,
    label: t(...label),
    options: options.map(([en, sw]) => t(en, sw)),
    default: value,
    when,
  };
}

export function toggle(
  id: string,
  label: [string, string],
  on: [string, string],
  off: [string, string],
  value: 0 | 1 = 0,
  when?: When,
): ChemControl {
  return {
    type: "toggle",
    id,
    label: t(...label),
    on: t(...on),
    off: t(...off),
    default: value,
    when,
  };
}

export function link(
  id: string,
  label: [string, string],
  none: [string, string],
  choices: (candidate: ChemPart, self: ChemPart) => boolean,
  when?: When,
): ChemControl {
  return {
    type: "link",
    id,
    label: t(...label),
    none: t(...none),
    choices,
    when,
  };
}

export function button(
  id: string,
  label: [string, string],
  run: (input: PressInput) => ChemState,
  when?: When,
): ChemControl {
  return { type: "button", id, label: t(...label), run, when };
}
