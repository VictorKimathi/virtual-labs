/** Tailwind class sets shared by the equipment drawings, with light and dark variants. */
export const tone = {
  metal:
    "fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400",
  steel:
    "fill-slate-400 stroke-slate-600 dark:fill-slate-500 dark:stroke-slate-300",
  dark: "fill-slate-800 stroke-slate-900 dark:fill-slate-900 dark:stroke-slate-500",
  light:
    "fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600",
  wood: "fill-amber-200 stroke-amber-700 dark:fill-amber-800 dark:stroke-amber-500",
  darkWood:
    "fill-amber-800 stroke-amber-950 dark:fill-amber-900 dark:stroke-amber-700",
  glass: "fill-sky-100 stroke-sky-400 dark:fill-sky-950 dark:stroke-sky-500",
  liquid: "fill-sky-400 stroke-sky-500 dark:fill-sky-500 dark:stroke-sky-300",
  paper:
    "fill-white stroke-slate-300 dark:fill-slate-200 dark:stroke-slate-500",
  red: "fill-red-500 stroke-red-700 dark:fill-red-500 dark:stroke-red-300",
  blue: "fill-blue-500 stroke-blue-700 dark:fill-blue-500 dark:stroke-blue-300",
  green:
    "fill-green-500 stroke-green-700 dark:fill-green-500 dark:stroke-green-300",
  brass:
    "fill-yellow-500 stroke-yellow-700 dark:fill-yellow-600 dark:stroke-yellow-300",
  copper:
    "fill-orange-400 stroke-orange-700 dark:fill-orange-500 dark:stroke-orange-300",
  screen: "fill-slate-950 stroke-slate-700",
};

export const ink = "stroke-slate-700 dark:stroke-slate-200";
export const inkSoft = "stroke-slate-400 dark:stroke-slate-500";
export const inkFill = "fill-slate-700 dark:fill-slate-200";
export const labelFill = "fill-slate-600 dark:fill-slate-300";
export const rayStroke = "stroke-amber-500 dark:stroke-amber-300";
export const noFill = "fill-none";

/** The nearest Tailwind opacity step for a fraction from 0 to 1. */
export function opacityClass(fraction: number) {
  const step = Math.round(Math.max(0, Math.min(1, fraction)) * 20) * 5;
  return `opacity-${step}`;
}
