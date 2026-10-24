import type {
  Control,
  Issue,
  LocalizedText,
  Measure,
  Params,
  Readout,
  ReadingTask,
  Tone,
} from "../../workbench.types";

/** Acceleration of free fall used throughout KCSE practicals, in N/kg. */
export const G = 10;

export const t = (en: string, sw: string): LocalizedText => ({ en, sw });

export function slider(
  id: string,
  label: [string, string],
  min: number,
  max: number,
  step: number,
  value: number,
  unit?: string,
  when?: (params: Params) => boolean,
): Control {
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
  when?: (params: Params) => boolean,
): Control {
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
  when?: (params: Params) => boolean,
): Control {
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

export function button(
  id: string,
  label: [string, string],
  apply: (params: Params, now: number) => Params,
  when?: (params: Params) => boolean,
): Control {
  return { type: "button", id, label: t(...label), apply, when };
}

export function readout(
  label: [string, string],
  value: string,
  tone?: Tone,
): Readout {
  return { label: t(...label), value, tone };
}

export function issue(
  id: string,
  tone: Issue["tone"],
  text: [string, string],
): Issue {
  return { id, tone, text: t(...text) };
}

export function measure(
  id: string,
  label: [string, string],
  unit: string,
  value: number,
  digits: number,
): Measure {
  return { id, label: t(...label), unit, value, digits };
}

export function task(
  id: string,
  label: [string, string],
  unit: string,
  expected: number,
  tolerance: number,
  hint?: [string, string],
): ReadingTask {
  return {
    id,
    label: t(...label),
    unit,
    expected,
    tolerance,
    hint: hint ? t(...hint) : undefined,
  };
}

/** A repeatable pseudo-random number in [0, 1) for a part id and a salt. */
export function seeded(id: string, salt: number) {
  let hash = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 1274126177);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

/** Picks one of the values, always the same one for a given part id and salt. */
export function pick<T>(id: string, salt: number, values: T[]): T {
  return values[Math.floor(seeded(id, salt) * values.length)];
}

export function fixed(value: number, digits: number) {
  return value.toFixed(digits);
}

export function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

export function inRange(value: number, expected: number, tolerance: number) {
  return Math.abs(value - expected) <= tolerance;
}

/** How far through a timed run the bench clock is, from 0 to 1. */
export function progressFrom(now: number, startedAt: number, seconds: number) {
  return startedAt === 0 || seconds <= 0
    ? 0
    : clamp((now - startedAt) / (seconds * 1000), 0, 1);
}

/** One sample of a unit waveform: 0 sine, 1 square, 2 triangle. */
export function waveValue(wave: number, phase: number) {
  const turn = phase - Math.floor(phase);
  if (wave === 1) return turn < 0.5 ? 1 : -1;
  if (wave === 2)
    return turn < 0.25 ? 4 * turn : turn < 0.75 ? 2 - 4 * turn : 4 * turn - 4;
  return Math.sin(2 * Math.PI * turn);
}

/** Peak value of a waveform whose effective (rms) value is known. */
export function peakFromRms(wave: number, rms: number) {
  return wave === 1 ? rms : wave === 2 ? rms * Math.sqrt(3) : rms * Math.SQRT2;
}

/** Effective (rms) value of a waveform whose peak value is known. */
export function rmsFromPeak(wave: number, peak: number) {
  return wave === 1
    ? peak
    : wave === 2
      ? peak / Math.sqrt(3)
      : peak / Math.SQRT2;
}
