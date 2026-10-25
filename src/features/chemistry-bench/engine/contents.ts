import { toCss, mixColor, hex } from "../../chemistry-lab/chem/color";
import { indicators } from "../../chemistry-lab/data/indicators";
import type { Rgba } from "../../chemistry-lab/chemistry.types";
import type {
  Contents,
  GasEvent,
  IndicatorKey,
  LiquidView,
} from "../chemistry.types";
import {
  solidInfo,
  speciesInfo,
  speciesMass,
  type SolidId,
  type SpeciesId,
} from "./species";

export const AMBIENT = 22;
/** Bench seconds that pass for each real second, so reactions are watchable. */
export const CLOCK_SPEED = 3;
/** Millilitres of gas per millimole at room temperature. */
export const GAS_ML_PER_MMOL = 24;

export function emptyContents(): Contents {
  return {
    volume: 0,
    organic: 0,
    species: {},
    solids: {},
    indicator: null,
    starch: false,
    temperature: AMBIENT,
    fixedPh: null,
    settled: false,
    gas: [],
    ledger: {},
    notes: [],
  };
}

export const amountOf = <K extends string>(
  record: Partial<Record<K, number>>,
  id: K,
) => record[id] ?? 0;

export function totalVolume(c: Contents) {
  return c.volume + c.organic;
}

export function hasMatter(c: Contents) {
  return (
    totalVolume(c) > 1e-9 ||
    Object.values(c.solids).some((value) => (value ?? 0) > 1e-9) ||
    Object.values(c.species).some((value) => (value ?? 0) > 1e-9)
  );
}

/** Concentration in mol/dm³ of a dissolved species. */
export function molarity(c: Contents, id: SpeciesId) {
  return c.volume > 1e-9 ? amountOf(c.species, id) / c.volume : 0;
}

export function speciesTotalMass(c: Contents) {
  let grams = 0;
  for (const id of Object.keys(c.species) as SpeciesId[])
    grams += (amountOf(c.species, id) * speciesMass[id]) / 1000;
  return grams;
}

export function solidMass(c: Contents) {
  let grams = 0;
  for (const id of Object.keys(c.solids) as SolidId[])
    grams += (amountOf(c.solids, id) * solidInfo[id].molar) / 1000;
  return grams;
}

/** Mass of the contents alone, in grams. */
export function contentsMass(c: Contents) {
  return c.volume + c.organic * 0.92 + speciesTotalMass(c) + solidMass(c);
}

/** A bundle of matter to put into a vessel. */
export type Ingredient = {
  volume?: number;
  organic?: number;
  species?: Partial<Record<SpeciesId, number>>;
  solids?: Partial<Record<SolidId, number>>;
  indicator?: { id: IndicatorKey; drops: number };
  starch?: boolean;
  temperature?: number;
  fixedPh?: number;
  ledger?: { id: string; volume: number; mmol: number };
};

export function mix(c: Contents, ingredient: Ingredient): Contents {
  const addedVolume = (ingredient.volume ?? 0) + (ingredient.organic ?? 0);
  const before = totalVolume(c);
  const species = { ...c.species };
  for (const id of Object.keys(ingredient.species ?? {}) as SpeciesId[])
    species[id] = amountOf(species, id) + (ingredient.species?.[id] ?? 0);
  const solids = { ...c.solids };
  for (const id of Object.keys(ingredient.solids ?? {}) as SolidId[])
    solids[id] = amountOf(solids, id) + (ingredient.solids?.[id] ?? 0);
  const ledger = { ...c.ledger };
  if (ingredient.ledger) {
    const entry = ledger[ingredient.ledger.id] ?? { volume: 0, mmol: 0 };
    ledger[ingredient.ledger.id] = {
      volume: entry.volume + ingredient.ledger.volume,
      mmol: entry.mmol + ingredient.ledger.mmol,
    };
  }
  let indicator = c.indicator;
  if (ingredient.indicator)
    indicator =
      indicator && indicator.id === ingredient.indicator.id
        ? {
            id: indicator.id,
            drops: indicator.drops + ingredient.indicator.drops,
          }
        : { ...ingredient.indicator };
  const empty = !hasMatter(c);
  let fixedPh = c.fixedPh;
  if (ingredient.fixedPh !== undefined) {
    if (empty || c.fixedPh === ingredient.fixedPh) fixedPh = ingredient.fixedPh;
    else fixedPh = null;
  } else if (
    addedVolume > 0 ||
    Object.keys(ingredient.species ?? {}).length > 0 ||
    Object.keys(ingredient.solids ?? {}).length > 0
  )
    fixedPh = null;
  const ingredientTemperature = ingredient.temperature ?? AMBIENT;
  const temperature =
    before + addedVolume > 0 && addedVolume > 0
      ? (c.temperature * before + ingredientTemperature * addedVolume) /
        (before + addedVolume)
      : c.temperature;
  return {
    ...c,
    volume: c.volume + (ingredient.volume ?? 0),
    organic: c.organic + (ingredient.organic ?? 0),
    species,
    solids,
    indicator,
    starch: c.starch || Boolean(ingredient.starch),
    temperature,
    fixedPh,
    settled:
      c.settled &&
      addedVolume === 0 &&
      Object.keys(ingredient.solids ?? {}).length === 0,
    ledger,
  };
}

/** Pours one lot of contents into another. */
export function merge(into: Contents, add: Contents): Contents {
  let result = mix(into, {
    volume: add.volume,
    organic: add.organic,
    species: add.species,
    solids: add.solids,
    indicator: add.indicator ?? undefined,
    starch: add.starch,
    temperature: add.temperature,
    fixedPh: add.fixedPh ?? undefined,
  });
  const ledger = { ...into.ledger };
  for (const id of Object.keys(add.ledger)) {
    const entry = ledger[id] ?? { volume: 0, mmol: 0 };
    ledger[id] = {
      volume: entry.volume + add.ledger[id].volume,
      mmol: entry.mmol + add.ledger[id].mmol,
    };
  }
  result = { ...result, ledger };
  return result;
}

/** Splits off a fraction of the liquid; dense lumps and settled solids stay behind. */
export function takeFraction(
  c: Contents,
  fraction: number,
): { taken: Contents; left: Contents } {
  const f = Math.max(0, Math.min(1, fraction));
  const scale = <K extends string>(
    record: Partial<Record<K, number>>,
    by: number,
    keep?: (id: K) => boolean,
  ) => {
    const out: Partial<Record<K, number>> = {};
    for (const id of Object.keys(record) as K[]) {
      const value = record[id] ?? 0;
      out[id] = keep && !keep(id) ? 0 : value * by;
    }
    return out;
  };
  const moves = (id: SolidId) => !solidInfo[id].lump && !c.settled;
  const takenSolids = scale(c.solids, f, moves);
  const leftSolids: Partial<Record<SolidId, number>> = {};
  for (const id of Object.keys(c.solids) as SolidId[])
    leftSolids[id] = amountOf(c.solids, id) - amountOf(takenSolids, id);
  const takenSpecies = scale(c.species, f);
  const leftSpecies: Partial<Record<SpeciesId, number>> = {};
  for (const id of Object.keys(c.species) as SpeciesId[])
    leftSpecies[id] = amountOf(c.species, id) * (1 - f);
  const drops = c.indicator ? c.indicator.drops : 0;
  const takenLedger: Contents["ledger"] = {};
  const leftLedger: Contents["ledger"] = {};
  for (const id of Object.keys(c.ledger)) {
    const entry = c.ledger[id];
    takenLedger[id] = { volume: entry.volume * f, mmol: entry.mmol * f };
    leftLedger[id] = {
      volume: entry.volume * (1 - f),
      mmol: entry.mmol * (1 - f),
    };
  }
  return {
    taken: {
      ...emptyContents(),
      volume: c.volume * f,
      organic: c.organic * f,
      species: takenSpecies,
      solids: takenSolids,
      indicator:
        c.indicator && drops * f > 0.05
          ? { id: c.indicator.id, drops: drops * f }
          : null,
      starch: c.starch,
      temperature: c.temperature,
      fixedPh: c.fixedPh,
      ledger: takenLedger,
    },
    left: {
      ...c,
      volume: c.volume * (1 - f),
      organic: c.organic * (1 - f),
      species: leftSpecies,
      solids: leftSolids,
      indicator:
        c.indicator && drops * (1 - f) > 0.05
          ? { id: c.indicator.id, drops: drops * (1 - f) }
          : null,
      ledger: leftLedger,
    },
  };
}

/** Removes numerically empty entries so records stay small. */
export function tidy(c: Contents): Contents {
  const clean = <K extends string>(record: Partial<Record<K, number>>) => {
    const out: Partial<Record<K, number>> = {};
    for (const id of Object.keys(record) as K[]) {
      const value = record[id] ?? 0;
      if (value > 1e-7) out[id] = value;
    }
    return out;
  };
  return {
    ...c,
    volume: c.volume < 1e-7 ? 0 : c.volume,
    organic: c.organic < 1e-7 ? 0 : c.organic,
    species: clean(c.species),
    solids: clean(c.solids),
    indicator: c.volume < 1e-7 ? null : c.indicator,
  };
}

const PH_MIN = -1.2;

/** pH of the aqueous liquid, or null when there is none. */
export function phOf(c: Contents): number | null {
  if (c.volume < 1e-6) return null;
  if (c.fixedPh !== null) return c.fixedPh;
  const v = c.volume;
  const h = amountOf(c.species, "H");
  const oh = amountOf(c.species, "OH");
  const net = h - oh;
  if (net / v > 1e-7) return Math.max(PH_MIN, -Math.log10(net / v));
  if (-net / v > 1e-7) return Math.min(15, 14 + Math.log10(-net / v));
  const acid = amountOf(c.species, "AcOH");
  const acetate = amountOf(c.species, "AcO");
  const ammonia = amountOf(c.species, "NH3");
  const ammonium = amountOf(c.species, "NH4");
  const carbonate = amountOf(c.species, "CO3");
  if (acid / v > 1e-6) {
    return acetate / v > 1e-6
      ? 4.76 + Math.log10(acetate / acid)
      : 0.5 * (4.76 - Math.log10(acid / v));
  }
  if (acetate / v > 1e-6 && ammonium / v < 1e-6)
    return 7 + 0.5 * (4.76 + Math.log10(acetate / v));
  if (ammonia / v > 1e-6)
    return ammonium / v > 1e-6
      ? 9.25 + Math.log10(ammonia / ammonium)
      : 14 - 0.5 * (4.75 - Math.log10(ammonia / v));
  if (ammonium / v > 1e-6) return 0.5 * (9.25 - Math.log10(ammonium / v));
  if (carbonate / v > 1e-6)
    return 14 - 0.5 * (3.67 - Math.log10(carbonate / v));
  const acidic =
    (amountOf(c.species, "Cu") +
      amountOf(c.species, "Fe3") +
      amountOf(c.species, "Zn")) /
    v;
  if (acidic > 1e-4) return Math.min(6.6, 4.5 + 0.5 * Math.log10(0.1 / acidic));
  return 7;
}

/** Conductivity at 25 °C in µS/cm. */
export function conductivityOf(c: Contents): number {
  if (c.volume < 1e-6) return 0;
  let total = 1.5;
  for (const id of Object.keys(c.species) as SpeciesId[])
    total += speciesInfo[id].lambda * molarity(c, id) * 1000;
  const acid = molarity(c, "AcOH");
  if (acid > 0) total += (350 + 41) * Math.sqrt(1.74e-5 * acid) * 1000;
  const ammonia = molarity(c, "NH3");
  if (ammonia > 0) total += (73 + 199) * Math.sqrt(1.78e-5 * ammonia) * 1000;
  if (c.fixedPh !== null) total += 1500;
  return total;
}

/** Absorbance per centimetre of path at a wavelength in nanometres. */
export function absorbanceOf(c: Contents, wavelength: number): number {
  if (c.volume < 1e-6) return 0;
  let total = 0;
  for (const id of Object.keys(c.species) as SpeciesId[]) {
    const absorber = speciesInfo[id].absorber;
    if (!absorber) continue;
    const spread = (wavelength - absorber.peak) / absorber.width;
    total += absorber.epsilon * Math.exp(-spread * spread) * molarity(c, id);
  }
  return total;
}

const litmus = {
  stops: [
    [0, hex("#d7263d", 0.9)],
    [4.5, hex("#d7263d", 0.9)],
    [6, hex("#7b3fa0", 0.9)],
    [8.3, hex("#7b3fa0", 0.9)],
    [9, hex("#3a5bd9", 0.9)],
    [14, hex("#3a5bd9", 0.9)],
  ],
} as const;

function indicatorColour(id: IndicatorKey, ph: number): Rgba {
  const stops = id === "litmus" ? litmus.stops : indicators[id].stops;
  return mixColor(stops, Math.max(0, Math.min(14, ph)));
}

export function indicatorColourName(id: IndicatorKey, ph: number) {
  if (id === "litmus")
    return ph < 5
      ? { en: "red", sw: "nyekundu" }
      : ph < 8
        ? { en: "purple", sw: "zambarau" }
        : { en: "blue", sw: "buluu" };
  const bands = indicators[id].bands;
  return (bands.find((band) => ph < band.upTo) ?? bands[bands.length - 1]).name;
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  if (alpha <= 0) return [255, 255, 255, 0];
  const channel = (index: 0 | 1 | 2) =>
    (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) / alpha;
  return [channel(0), channel(1), channel(2), alpha];
}

const CLEAR: Rgba = [255, 255, 255, 0.14];

/** Colour the dissolved species give the liquid, before any indicator. */
export function dissolvedColour(c: Contents): Rgba {
  let colour: Rgba = [255, 255, 255, 0];
  for (const id of Object.keys(c.species) as SpeciesId[]) {
    const info = speciesInfo[id];
    if (!info.colour || !info.absorber) continue;
    const m = molarity(c, id);
    if (m <= 0) continue;
    const scale = Math.max(0.0002, Math.min(0.06, 0.4 / info.absorber.epsilon));
    const alpha = info.colour[3] * (1 - Math.exp(-m / scale));
    colour = over(
      [info.colour[0], info.colour[1], info.colour[2], alpha],
      colour,
    );
  }
  return colour;
}

export function gasReleased(events: GasEvent[], now: number) {
  return events.reduce(
    (sum, event) =>
      sum +
      event.mmol *
        (1 -
          Math.exp(
            -event.rate * Math.max(0, ((now - event.at) / 1000) * CLOCK_SPEED),
          )),
    0,
  );
}

/** Millimoles per bench second that are leaving the liquid right now. */
export function gasRate(events: GasEvent[], now: number) {
  return events.reduce((sum, event) => {
    const seconds = Math.max(0, ((now - event.at) / 1000) * CLOCK_SPEED);
    return sum + event.mmol * event.rate * Math.exp(-event.rate * seconds);
  }, 0);
}

export function boilingPoint(c: Contents) {
  const ethanol = amountOf(c.species, "EtOH") / 17.1;
  return ethanol > 0.1 * Math.max(c.volume, 1e-6) ? 80 : 100;
}

/** Everything a drawing needs to show the liquid in a vessel. */
export function liquidView(
  c: Contents,
  capacity: number,
  now: number,
): LiquidView {
  const ph = phOf(c);
  let colour: Rgba = dissolvedColour(c);
  if (c.volume > 1e-6 && c.indicator && c.indicator.drops > 0 && ph !== null) {
    const weight = Math.min(1, 0.3 + c.indicator.drops * 0.1);
    const base = indicatorColour(c.indicator.id, ph);
    colour = over([base[0], base[1], base[2], base[3] * weight], colour);
  }
  const iodine = molarity(c, "I2");
  if (c.starch && iodine > 5e-6) colour = over([20, 20, 70, 0.95], colour);
  let cloudy = 0;
  const deposit: LiquidView["deposit"] = [];
  let cloudColour: Rgba | null = null;
  for (const id of Object.keys(c.solids) as SolidId[]) {
    const mmol = amountOf(c.solids, id);
    if (mmol < 1e-6) continue;
    const info = solidInfo[id];
    const grams = (mmol * info.molar) / 1000;
    if (info.lump || c.settled || info.salt) {
      deposit.push({
        colour: toCss(info.colour),
        amount: Math.min(1, grams / 8),
      });
    } else if (c.volume > 0) {
      const strength = 1 - Math.exp((-grams / c.volume) * 120);
      if (strength > cloudy) {
        cloudy = strength;
        cloudColour = info.colour;
      }
    }
  }
  if (cloudColour) {
    const backdrop: Rgba = [
      colour[0],
      colour[1],
      colour[2],
      Math.max(colour[3], 0.15),
    ];
    colour = over(
      [cloudColour[0], cloudColour[1], cloudColour[2], cloudy * 0.9],
      backdrop,
    );
  }
  if (colour[3] < CLEAR[3]) colour = over(colour, CLEAR);
  const rate = gasRate(c.gas, now);
  const active = c.gas.filter(
    (event) =>
      rate > 0.0005 && ((now - event.at) / 1000) * CLOCK_SPEED * event.rate < 6,
  );
  const boiling = c.volume > 0 && c.temperature >= boilingPoint(c) - 0.5;
  return {
    colour: toCss(colour),
    cloudy,
    deposit,
    bubbling: Math.min(1, rate / 0.4 + (boiling ? 0.7 : 0)),
    gas: active[active.length - 1]?.gas ?? null,
    boiling,
    level: capacity > 0 ? Math.min(1, c.volume / capacity) : 0,
    oilLevel: capacity > 0 ? Math.min(1, c.organic / capacity) : 0,
    temperature: c.temperature,
  };
}
