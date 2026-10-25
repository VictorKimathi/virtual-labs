import type { Params } from "../../../workbench/workbench.types";
import type {
  ChemPart,
  ChemPartSpec,
  ChemPlot,
  Contents,
} from "../../chemistry.types";
import {
  absorbanceOf,
  conductivityOf,
  gasReleased,
  GAS_ML_PER_MMOL,
  liquidView,
  phOf,
  takeFraction,
  tidy,
  totalVolume,
} from "../../engine/contents";
import { crystallise } from "../../engine/heating";
import {
  heaterOutput,
  partByNum,
  replacePart,
  transfer,
} from "../../engine/operations";
import { solidInfo, type SolidId, type SpeciesId } from "../../engine/species";
import {
  fixed,
  issue,
  measure,
  pick,
  readout,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import { reagents } from "../reagents";
import { button, choice, link, slider, toggle } from "./controls";
import { vesselControls, vesselOutcome, vesselState } from "./shared";

type ModernKind =
  | "ph-meter"
  | "conductivity-meter"
  | "data-logger"
  | "colorimeter"
  | "auto-burette"
  | "magnetic-stirrer"
  | "rotary-evaporator"
  | "melting-point-apparatus"
  | "flame-test-kit"
  | "gas-chromatograph"
  | "mass-spectrometer"
  | "ir-spectrometer";

const hint = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

const holdsLiquid = (candidate: ChemPart, self: ChemPart) =>
  candidate.id !== self.id &&
  candidate.vessel !== null &&
  candidate.kind !== "auto-burette";

const MAX_POINTS = 80;

/** Reads a list of logged points stored as numbered settings. */
function pointsOf(params: Params, prefix: string) {
  const count = params[`${prefix}n`] ?? 0;
  const x: number[] = [];
  const y: number[] = [];
  for (let index = 0; index < count; index++) {
    x.push(params[`${prefix}x${index}`] ?? 0);
    y.push(params[`${prefix}y${index}`] ?? 0);
  }
  return { x, y };
}

function addPoint(
  params: Params,
  prefix: string,
  x: number,
  y: number,
): Params {
  const count = params[`${prefix}n`] ?? 0;
  if (count >= MAX_POINTS) return params;
  return {
    ...params,
    [`${prefix}n`]: count + 1,
    [`${prefix}x${count}`]: x,
    [`${prefix}y${count}`]: y,
  };
}

function clearPoints(params: Params, prefix: string): Params {
  const next: Params = {};
  for (const key of Object.keys(params))
    if (!key.startsWith(prefix)) next[key] = params[key];
  return { ...next, [`${prefix}n`]: 0 };
}

const pointState = (prefix: string) => ({ [`${prefix}n`]: 0 });

/* ------------------------------------------------------------------ pH meter */

const phSlopes = [0.92, 0.9, 0.94];
const phOffsets = [0.3, -0.25, 0.2];

/** What a pH meter shows for a sample, with its calibration errors. */
export function meterPh(
  meter: ChemPart,
  sample: ChemPart | undefined,
): number | null {
  if (!sample) return null;
  const truth = phOf(sample.contents);
  if (truth === null) return null;
  const p = meter.params;
  const slope = p.calSlope === 1 ? 1 : pick(meter.id, 7, phSlopes);
  const offset =
    p.cal7 === 1 ? (p.calBad === 1 ? 0.1 : 0) : pick(meter.id, 8, phOffsets);
  const carry = p.carry === 1 ? 0.12 : 0;
  return Math.max(0, Math.min(14, 7 + (truth - 7) * slope + offset + carry));
}

/* -------------------------------------------------------- conductivity meter */

const STANDARD = 1413;
const CELL_ERROR = 1.12;

function rawConductivity(c: Contents, compensated: boolean) {
  const at25 = conductivityOf(c);
  return compensated ? at25 : at25 * (1 + 0.02 * (c.temperature - 25));
}

const isStandard = (c: Contents) => {
  const used = Object.keys(c.ledger);
  return used.length === 1 && used[0] === "standard-solution";
};

/* ---------------------------------------------------------------- data logger */

const sensors: [string, string][] = [
  ["Temperature probe", "Kichunguzi cha joto"],
  ["pH probe", "Kichunguzi cha pH"],
  ["Pressure sensor", "Kihisi cha shinikizo"],
  ["Light sensor", "Kihisi cha mwanga"],
  ["CO₂ sensor", "Kihisi cha CO₂"],
];
const sensorUnits = ["°C", "pH", "kPa", "lux", "ppm"];

function sensorValue(sensor: number, vessel: ChemPart, now: number) {
  const c = vessel.contents;
  switch (sensor) {
    case 0:
      return c.temperature;
    case 1:
      return phOf(c) ?? 7;
    case 2: {
      if (vessel.params.stopper !== 1) return 101.3;
      const gas = gasReleased(c.gas, now) * GAS_ML_PER_MMOL;
      const space = Math.max(
        5,
        (vessel.vessel?.capacity ?? 100) - totalVolume(c),
      );
      return 101.3 * (1 + gas / space);
    }
    case 3: {
      const view = liquidView(c, vessel.vessel?.capacity ?? 100, now);
      return 1000 * 10 ** (-absorbanceOf(c, 550) * 2) * (1 - 0.8 * view.cloudy);
    }
    default: {
      const carbon = c.gas.filter((event) => event.gas === "CO2");
      return 420 + gasReleased(carbon, now) * GAS_ML_PER_MMOL * 80;
    }
  }
}

/* ---------------------------------------------------------------- colorimeter */

const CUVETTE_BACKGROUND = 0.06;
const FROSTED = 0.35;

function rawAbsorbance(
  vessel: ChemPart,
  wavelength: number,
  frosted: boolean,
  now: number,
) {
  const view = liquidView(vessel.contents, vessel.vessel?.capacity ?? 4, now);
  return (
    absorbanceOf(vessel.contents, wavelength) +
    CUVETTE_BACKGROUND +
    (frosted ? FROSTED : 0) +
    view.cloudy * 0.8
  );
}

/* -------------------------------------------------------- melting point block */

const meltingSamples: {
  name: [string, string];
  onset: number;
  clear: number;
}[] = [
  {
    name: ["Benzoic acid (pure)", "Asidi ya benzoiki (safi)"],
    onset: 121.6,
    clear: 122.4,
  },
  {
    name: ["Benzoic acid (impure)", "Asidi ya benzoiki (yenye uchafu)"],
    onset: 113.5,
    clear: 119,
  },
  { name: ["Naphthalene", "Naftalini"], onset: 79.6, clear: 80.4 },
  { name: ["Urea", "Urea"], onset: 132.6, clear: 133.4 },
  { name: ["Unknown solid X", "Kigumu kisichojulikana X"], onset: 0, clear: 0 },
];
/** The block runs twenty times faster than the bench clock so a run takes minutes, not an hour. */
const MELT_SPEED = 20;
const LAG_MINUTES = 0.4;

function meltingSample(part: ChemPart) {
  const chosen = meltingSamples[part.params.sample ?? 0] ?? meltingSamples[0];
  if (chosen.onset > 0) return chosen;
  const known = pick(part.id, 12, [
    meltingSamples[0],
    meltingSamples[2],
    meltingSamples[3],
  ]);
  return { ...chosen, onset: known.onset, clear: known.clear };
}

function blockTemperature(part: ChemPart, now: number) {
  const p = part.params;
  const elapsed =
    p.elapsed + (p.running === 1 ? Math.max(0, now - p.startedAt) : 0);
  return Math.min(250, p.from + (p.rate * elapsed * MELT_SPEED) / 60000);
}

/* ------------------------------------------------------------------ flame test */

const ions = ["Na", "K", "Ca", "Cu", "Ba", "Pb"] as const;
type FlameIon = (typeof ions)[number];
const ionBit: Record<FlameIon, number> = {
  Na: 1,
  K: 2,
  Ca: 4,
  Cu: 8,
  Ba: 16,
  Pb: 32,
};

/** Flame colours for drawing, by the index the analysis shares. */
export const flameColours = [
  "#4f7cff",
  "#ffb300",
  "#c58bff",
  "#d9412b",
  "#2fbf9f",
  "#9be36b",
  "#c9d6f2",
  "#ff6fa8",
];

const flameNames: Record<FlameIon, [string, string]> = {
  Na: [
    "a persistent golden-yellow flame (sodium)",
    "mwali wa njano ya dhahabu unaodumu (sodiamu)",
  ],
  K: ["a lilac flame (potassium)", "mwali wa zambarau hafifu (potasiamu)"],
  Ca: ["a brick-red flame (calcium)", "mwali mwekundu wa tofali (kalsiamu)"],
  Cu: ["a blue-green flame (copper)", "mwali wa buluu-kijani (shaba)"],
  Ba: ["a pale apple-green flame (barium)", "mwali wa kijani hafifu (bariamu)"],
  Pb: [
    "a pale blue-white flame (lead)",
    "mwali wa buluu-nyeupe hafifu (risasi)",
  ],
};

function ionsIn(
  species: Partial<Record<SpeciesId, number>>,
  solids: Partial<Record<SolidId, number>>,
) {
  let mask = 0;
  for (const ion of ions) if ((species[ion] ?? 0) > 1e-6) mask |= ionBit[ion];
  for (const id of Object.keys(solids) as SolidId[]) {
    const gives = solidInfo[id].salt?.gives ?? {};
    for (const ion of ions)
      if ((gives[ion] ?? 0) > 0 && (solids[id] ?? 0) > 1e-6)
        mask |= ionBit[ion];
  }
  return mask;
}

function sampleIons(sample: ChemPart) {
  const reagent = reagents[sample.kind];
  if (reagent) {
    const packed = reagent.pack(sample, 1);
    return ionsIn(packed.species ?? {}, packed.solids ?? {});
  }
  return ionsIn(sample.contents.species, sample.contents.solids);
}

function flameOf(mask: number, cobalt: boolean) {
  const has = (ion: FlameIon) => (mask & ionBit[ion]) !== 0;
  if (cobalt) return has("K") ? { index: 7, ion: "K" as const } : null;
  if (has("Na")) return { index: 1, ion: "Na" as const };
  const order: [FlameIon, number][] = [
    ["Cu", 4],
    ["Ba", 5],
    ["Ca", 3],
    ["K", 2],
    ["Pb", 6],
  ];
  const found = order.find(([ion]) => has(ion));
  return found ? { index: found[1], ion: found[0] } : null;
}

/* ------------------------------------------------------------- chromatography */

type GcPeak = { name: [string, string]; base: number; area: number };

const gcCompounds: Record<string, [string, string]> = {
  water: ["Water", "Maji"],
  methanol: ["Methanol", "Methanoli"],
  ethanol: ["Ethanol", "Ethanoli"],
  propanol: ["Propan-1-ol", "Propan-1-oli"],
  hexane: ["Hexane", "Heksani"],
  heptane: ["Heptane", "Heptani"],
  toluene: ["Methylbenzene", "Methilbenzini"],
  octane: ["Octane", "Oktani"],
};
const gcBase: Record<keyof typeof gcCompounds, number> = {
  water: 1.2,
  methanol: 1.8,
  ethanol: 2.6,
  propanol: 4.1,
  hexane: 2.1,
  heptane: 3.3,
  toluene: 4.5,
  octane: 5.4,
};
const alcohols = ["methanol", "ethanol", "propanol"] as const;

function gcPeaks(part: ChemPart, vessel: ChemPart | undefined): GcPeak[] {
  const peak = (id: string, area: number): GcPeak => ({
    name: gcCompounds[id],
    base: gcBase[id],
    area,
  });
  switch (part.params.sample ?? 0) {
    case 0: {
      if (!vessel) return [];
      const ethanol = (vessel.contents.species.EtOH ?? 0) / 17.1;
      const water = Math.max(0, totalVolume(vessel.contents) - ethanol);
      const total = ethanol + water;
      return total > 0
        ? [
            peak("water", water / total),
            peak("ethanol", ethanol / total),
          ].filter((item) => item.area > 0.001)
        : [];
    }
    case 1:
      return alcohols.map((id) => peak(id, 1 / 3));
    case 2:
      return [peak(pick(part.id, 14, [...alcohols]), 1)];
    default:
      return [
        peak("hexane", 0.2),
        peak("heptane", 0.3),
        peak("toluene", 0.15),
        peak("octane", 0.35),
      ];
  }
}

const retention = (base: number, column: number) =>
  0.4 + base * Math.exp(-(column - 80) / 60);
const peakWidth = (time: number) => 0.05 + 0.03 * time;

/* --------------------------------------------------------- mass spectrometer */

type Spectrum = {
  name: [string, string];
  peaks: [number, number][];
  element?: boolean;
};

const massSamples: Spectrum[] = [
  {
    name: ["Magnesium", "Magnesiamu"],
    peaks: [
      [24, 78.99],
      [25, 10],
      [26, 11.01],
    ],
    element: true,
  },
  {
    name: ["Chlorine (atoms)", "Klorini (atomi)"],
    peaks: [
      [35, 75.8],
      [37, 24.2],
    ],
    element: true,
  },
  {
    name: ["Copper", "Shaba"],
    peaks: [
      [63, 69.2],
      [65, 30.8],
    ],
    element: true,
  },
  {
    name: ["Ethanol", "Ethanoli"],
    peaks: [
      [46, 22],
      [45, 40],
      [31, 100],
      [29, 25],
      [27, 20],
    ],
  },
  {
    name: ["Carbon dioxide", "Kaboni dioksidi"],
    peaks: [
      [44, 100],
      [28, 10],
      [16, 9],
      [12, 8],
    ],
  },
  {
    name: ["Unknown element Y", "Elementi isiyojulikana Y"],
    peaks: [],
    element: true,
  },
];
const unknownElements: [number, number][][] = [
  [
    [20, 90.5],
    [21, 0.3],
    [22, 9.2],
  ],
  [
    [10, 19.9],
    [11, 80.1],
  ],
  [
    [6, 7.6],
    [7, 92.4],
  ],
];

function spectrumOf(part: ChemPart): Spectrum {
  const chosen = massSamples[part.params.sample ?? 0] ?? massSamples[0];
  return chosen.peaks.length > 0
    ? chosen
    : { ...chosen, peaks: pick(part.id, 15, unknownElements) };
}

function relativeMass(peaks: [number, number][]) {
  const total = peaks.reduce((sum, [, abundance]) => sum + abundance, 0);
  return (
    peaks.reduce((sum, [mass, abundance]) => sum + mass * abundance, 0) / total
  );
}

/* -------------------------------------------------------- infrared spectrometer */

type Band = { centre: number; depth: number; width: number };

const irSamples: { name: [string, string]; bands: Band[] }[] = [
  {
    name: ["Ethanol", "Ethanoli"],
    bands: [
      { centre: 3340, depth: 0.75, width: 140 },
      { centre: 2970, depth: 0.55, width: 40 },
      { centre: 1050, depth: 0.7, width: 25 },
    ],
  },
  {
    name: ["Ethanoic acid", "Asidi ya ethanoiki"],
    bands: [
      { centre: 3000, depth: 0.6, width: 300 },
      { centre: 1710, depth: 0.9, width: 30 },
      { centre: 1290, depth: 0.5, width: 30 },
    ],
  },
  {
    name: ["Propanone", "Propanoni"],
    bands: [
      { centre: 2970, depth: 0.3, width: 35 },
      { centre: 1715, depth: 0.92, width: 25 },
      { centre: 1220, depth: 0.55, width: 30 },
    ],
  },
  {
    name: ["Hexane", "Heksani"],
    bands: [
      { centre: 2930, depth: 0.85, width: 45 },
      { centre: 1465, depth: 0.45, width: 20 },
      { centre: 1378, depth: 0.3, width: 15 },
    ],
  },
  { name: ["Unknown compound Z", "Kampaundi isiyojulikana Z"], bands: [] },
];

function irSample(part: ChemPart) {
  const chosen = irSamples[part.params.sample ?? 0] ?? irSamples[0];
  return chosen.bands.length > 0
    ? chosen
    : { ...chosen, bands: pick(part.id, 16, irSamples.slice(0, 4)).bands };
}

const transmittance = (bands: Band[], wavenumber: number) =>
  100 *
  bands.reduce(
    (product, band) =>
      product *
      (1 -
        band.depth *
          Math.exp(-(((wavenumber - band.centre) / band.width) ** 2))),
    1,
  );

/* ----------------------------------------------------------------- the parts */

export const modernParts: Record<ModernKind, ChemPartSpec> = {
  "ph-meter": {
    name: t("pH meter", "Kipima pH"),
    description: t(
      "Reads pH to 0.01. Calibrate with the pH 7 buffer first, then pH 4 or 10. Rinse the probe with distilled water between samples.",
      "Husoma pH hadi 0.01. Rekebisha kwa buffer ya pH 7 kwanza, kisha pH 4 au 10. Suuza kichunguzi kwa maji yaliyosafishwa kati ya sampuli.",
    ),
    width: 150,
    height: 170,
    controls: [
      link(
        "sample",
        ["Probe goes into", "Kichunguzi kinaingia"],
        ["Choose a vessel", "Chagua chombo"],
        holdsLiquid,
      ),
      button(
        "dip",
        ["Put the probe in", "Weka kichunguzi ndani"],
        ({ state, part }) => {
          const p = part.params;
          const carry =
            p.last > 0 && p.last !== p.sample && p.rinsed === 0 ? 1 : 0;
          return replacePart(state, {
            ...part,
            params: { ...p, in: p.sample, last: p.sample, rinsed: 0, carry },
          });
        },
        (part) =>
          part.params.sample > 0 && part.params.in !== part.params.sample,
      ),
      button(
        "rinse",
        ["Take out and rinse the probe", "Toa na suuza kichunguzi"],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: { ...part.params, in: 0, rinsed: 1, carry: 0 },
          }),
        (part) => part.params.in > 0,
      ),
      button(
        "calibrate",
        ["Calibrate to this buffer", "Rekebisha kwa buffer hii"],
        ({ state, part }) => {
          const buffer =
            partByNum(state, part.params.in)?.contents.fixedPh ?? null;
          const p = part.params;
          if (buffer === 7)
            return replacePart(state, {
              ...part,
              params: { ...p, cal7: 1, calBad: p.carry, calTried: 0 },
            });
          if ((buffer === 4 || buffer === 10) && p.cal7 === 1)
            return replacePart(state, {
              ...part,
              params: { ...p, calSlope: 1, calTried: 0 },
            });
          return replacePart(state, {
            ...part,
            params: { ...p, calTried: buffer === null ? 2 : 1 },
          });
        },
        (part) => part.params.in > 0,
      ),
    ],
    state: {
      sample: 0,
      in: 0,
      last: 0,
      rinsed: 1,
      carry: 0,
      cal7: 0,
      calSlope: 0,
      calBad: 0,
      calTried: 0,
    },
    analyse: ({ part, p, env }) => {
      const sample = env.part(p("in"));
      const shown = meterPh(part, sample);
      return {
        visual: { shown: shown ?? -1, dipped: p("in") > 0 ? 1 : 0 },
        readouts: [
          readout(
            ["Display", "Onyesho"],
            shown === null ? "– – –" : fixed(shown, 2),
          ),
          readout(
            ["Calibration", "Urekebishaji"],
            p("calSlope") === 1
              ? "pH 7 + slope"
              : p("cal7") === 1
                ? "pH 7 only"
                : "none",
            p("calSlope") === 1 ? "ok" : "warn",
          ),
        ],
        issues: [
          ...(p("cal7") === 0
            ? [
                issue("cal7", "warn", [
                  "Not calibrated. Put the probe in the pH 7 buffer and press Calibrate.",
                  "Haijarekebishwa. Weka kichunguzi kwenye buffer ya pH 7 na ubonyeze Rekebisha.",
                ]),
              ]
            : []),
          ...(p("cal7") === 1 && p("calSlope") === 0
            ? [
                issue("slope", "tip", [
                  "Now calibrate the slope with the pH 4 or pH 10 buffer.",
                  "Sasa rekebisha mteremko kwa buffer ya pH 4 au pH 10.",
                ]),
              ]
            : []),
          ...(p("calTried") === 1
            ? [
                issue("order", "warn", [
                  "Calibrate at pH 7 first, then at pH 4 or 10.",
                  "Rekebisha kwa pH 7 kwanza, kisha pH 4 au 10.",
                ]),
              ]
            : []),
          ...(p("calTried") === 2
            ? [
                issue("buffer", "bad", [
                  "That is not a buffer solution. Calibrate only in a buffer of known pH.",
                  "Huo si myeyusho wa buffer. Rekebisha tu kwenye buffer yenye pH inayojulikana.",
                ]),
              ]
            : []),
          ...(p("carry") === 1
            ? [
                issue("carry", "warn", [
                  "The probe went in without rinsing, so the last sample was carried over. Rinse between samples.",
                  "Kichunguzi kiliingizwa bila kusuuzwa, kwa hiyo sampuli iliyopita imeingia. Suuza kati ya sampuli.",
                ]),
              ]
            : []),
          ...(p("calBad") === 1
            ? [
                issue("calBad", "warn", [
                  "The pH 7 buffer was contaminated when you calibrated. Rinse the probe and calibrate again.",
                  "Buffer ya pH 7 ilichafuka ulipokuwa ukirekebisha. Suuza kichunguzi na urekebishe tena.",
                ]),
              ]
            : []),
          ...(p("in") === 0
            ? [
                issue("in", "tip", [
                  "Choose a vessel and put the probe in.",
                  "Chagua chombo na uweke kichunguzi ndani.",
                ]),
              ]
            : []),
        ],
        measures:
          shown !== null ? [measure("ph", ["pH", "pH"], "", shown, 2)] : [],
      };
    },
  },
  "conductivity-meter": {
    name: t("Conductivity meter", "Kipima upitishaji"),
    description: t(
      "Measures how well a solution conducts, in µS/cm. Calibrate with the 1413 µS/cm standard and switch on temperature compensation (ATC).",
      "Hupima jinsi myeyusho unavyopitisha umeme, kwa µS/cm. Rekebisha kwa kiwango cha 1413 µS/cm na uwashe ulinganishaji wa joto (ATC).",
    ),
    width: 150,
    height: 170,
    controls: [
      link(
        "sample",
        ["Cell goes into", "Seli inaingia"],
        ["Choose a vessel", "Chagua chombo"],
        holdsLiquid,
      ),
      toggle(
        "atc",
        ["Temperature compensation (ATC)", "Ulinganishaji wa joto (ATC)"],
        ["On (reads at 25 °C)", "Imewashwa (husoma kwa 25 °C)"],
        ["Off", "Imezimwa"],
      ),
      button(
        "calibrate",
        ["Calibrate to 1413 µS/cm", "Rekebisha kwa 1413 µS/cm"],
        ({ state, part }) => {
          const sample = partByNum(state, part.params.sample);
          if (
            !sample ||
            !isStandard(sample.contents) ||
            sample.contents.volume < 1
          )
            return replacePart(state, {
              ...part,
              params: { ...part.params, wrong: 1 },
            });
          const raw = rawConductivity(sample.contents, part.params.atc === 1);
          return replacePart(state, {
            ...part,
            params: {
              ...part.params,
              factor: STANDARD / Math.max(1, raw),
              wrong: 0,
              calAtc: part.params.atc,
            },
          });
        },
        (part) => part.params.sample > 0,
      ),
    ],
    state: { sample: 0, factor: 0, wrong: 0, calAtc: 0 },
    analyse: ({ p, env }) => {
      const sample = env.part(p("sample"));
      const liquid =
        sample && sample.contents.volume > 0.5 ? sample.contents : null;
      const factor = p("factor") > 0 ? p("factor") : CELL_ERROR;
      const shown = liquid
        ? rawConductivity(liquid, p("atc") === 1) * factor
        : null;
      return {
        visual: { shown: shown ?? -1 },
        readouts: [
          readout(
            ["Display", "Onyesho"],
            shown === null ? "– – –" : `${fixed(shown, 0)} µS/cm`,
          ),
        ],
        issues: [
          ...(p("factor") === 0
            ? [
                issue("cal", "warn", [
                  "Not calibrated: the cell constant is off by about 12%. Calibrate in the 0.01 M KCl standard.",
                  "Haijarekebishwa: kipimo cha seli kimekosea kwa takriban 12%. Rekebisha kwenye kiwango cha KCl 0.01 M.",
                ]),
              ]
            : []),
          ...(p("wrong") === 1
            ? [
                issue("wrong", "bad", [
                  "Calibrate only in the conductivity standard solution.",
                  "Rekebisha tu kwenye myeyusho wa kiwango cha upitishaji.",
                ]),
              ]
            : []),
          ...(p("atc") === 0 && liquid && Math.abs(liquid.temperature - 25) > 2
            ? [
                issue("atc", "warn", [
                  "Conductivity rises about 2% per °C. Switch on ATC so readings are compared at 25 °C.",
                  "Upitishaji hupanda takriban 2% kwa kila °C. Washa ATC ili vipimo vilinganishwe kwa 25 °C.",
                ]),
              ]
            : []),
          ...(p("factor") > 0 && p("calAtc") === 0
            ? [
                issue("calAtc", "tip", [
                  "You calibrated with ATC off. Calibrate again with ATC on for the best result.",
                  "Ulirekebisha ATC ikiwa imezimwa. Rekebisha tena ATC ikiwa imewashwa kwa matokeo bora.",
                ]),
              ]
            : []),
        ],
        measures:
          shown !== null
            ? [
                measure(
                  "conductivity",
                  ["Conductivity", "Upitishaji"],
                  "µS/cm",
                  shown,
                  0,
                ),
              ]
            : [],
      };
    },
  },
  "data-logger": {
    name: t("Data logger with sensors", "Kirekodi data na vihisi"),
    description: t(
      "Records a sensor against time: temperature, pH, pressure, light or carbon dioxide. Press Start, then Log a point as the experiment runs.",
      "Hurekodi kihisi dhidi ya muda: joto, pH, shinikizo, mwanga au kaboni dioksidi. Bonyeza Anza, kisha Rekodi nukta jaribio likiendelea.",
    ),
    width: 170,
    height: 130,
    controls: [
      choice("sensor", ["Sensor", "Kihisi"], sensors),
      link(
        "sample",
        ["Sensor goes into", "Kihisi kinaingia"],
        ["Choose a vessel", "Chagua chombo"],
        holdsLiquid,
      ),
      button(
        "start",
        ["Start (clear the log)", "Anza (futa rekodi)"],
        ({ state, part, now }) =>
          replacePart(state, {
            ...part,
            params: {
              ...clearPoints(part.params, "l"),
              startedAt: now,
              started: 1,
            },
          }),
      ),
      button(
        "log",
        ["Log a point", "Rekodi nukta"],
        ({ state, part, now }) => {
          const vessel = partByNum(state, part.params.sample);
          if (!vessel) return state;
          const value = sensorValue(part.params.sensor, vessel, now);
          return replacePart(state, {
            ...part,
            params: addPoint(
              part.params,
              "l",
              (now - part.params.startedAt) / 1000,
              value,
            ),
          });
        },
        (part) => part.params.started === 1 && part.params.sample > 0,
      ),
    ],
    state: { sample: 0, startedAt: 0, started: 0, ...pointState("l") },
    analyse: ({ part, p, env }) => {
      const vessel = env.part(p("sample"));
      const unit = sensorUnits[p("sensor")] ?? "";
      const value = vessel ? sensorValue(p("sensor"), vessel, env.now) : null;
      const log = pointsOf(part.params, "l");
      const plot: ChemPlot | undefined =
        log.x.length > 0
          ? {
              title: t("Logged data", "Data iliyorekodiwa"),
              xLabel: "t / s",
              yLabel: unit,
              series: [log],
            }
          : undefined;
      return {
        visual: {
          value: value ?? 0,
          sensor: p("sensor"),
          points: log.x.length,
        },
        plot,
        readouts: [
          readout(
            ["Live value", "Thamani ya sasa"],
            value === null
              ? "– – –"
              : `${fixed(value, p("sensor") === 3 || p("sensor") === 4 ? 0 : 1)} ${unit}`,
          ),
          readout(
            ["Points logged", "Nukta zilizorekodiwa"],
            String(log.x.length),
          ),
        ],
        issues: [
          ...(!vessel
            ? [
                issue("link", "tip", [
                  "Choose the vessel the sensor goes into.",
                  "Chagua chombo ambacho kihisi kinaingia.",
                ]),
              ]
            : []),
          ...(p("sensor") === 2 && vessel && vessel.params.stopper !== 1
            ? [
                issue("open", "tip", [
                  "The vessel is open, so the pressure stays at atmospheric. Fit a stopper to see it rise.",
                  "Chombo kiko wazi, kwa hiyo shinikizo linabaki la angahewa. Weka kizibo uone likipanda.",
                ]),
              ]
            : []),
          ...(log.x.length >= MAX_POINTS
            ? [
                issue("full", "warn", [
                  "The log is full. Press Start to begin again.",
                  "Rekodi imejaa. Bonyeza Anza kuanza upya.",
                ]),
              ]
            : []),
        ],
        measures:
          value !== null
            ? [
                measure(
                  `sensor-${p("sensor")}`,
                  sensors[p("sensor")] ?? sensors[0],
                  unit,
                  value,
                  2,
                ),
              ]
            : [],
      };
    },
  },
  colorimeter: {
    name: t(
      "Colorimeter / UV-Vis spectrophotometer",
      "Kipima rangi / spektrofotomita ya UV-Vis",
    ),
    description: t(
      "Measures absorbance of a solution in a cuvette. Choose the wavelength, zero it with a blank of the solvent at that wavelength, and put the clear faces in the beam.",
      "Hupima ufyonzaji wa myeyusho ndani ya kuveti. Chagua urefu wa wimbi, iweke sifuri kwa sampuli tupu ya kiyeyusho kwa urefu huo, na uweke pande angavu kwenye mwali.",
    ),
    width: 190,
    height: 130,
    controls: [
      link(
        "sample",
        ["Cuvette in the holder", "Kuveti kwenye kishikio"],
        ["Choose a cuvette", "Chagua kuveti"],
        holdsLiquid,
      ),
      slider(
        "wavelength",
        ["Wavelength", "Urefu wa wimbi"],
        400,
        700,
        10,
        470,
        "nm",
      ),
      toggle(
        "frosted",
        ["Cuvette faces in the beam", "Pande za kuveti kwenye mwali"],
        ["Frosted faces (wrong way round)", "Pande zisizo angavu (kinyume)"],
        ["Clear faces", "Pande angavu"],
      ),
      button(
        "blank",
        ["Zero with this cuvette (blank)", "Weka sifuri kwa kuveti hii (tupu)"],
        ({ state, part, now }) => {
          const sample = partByNum(state, part.params.sample);
          if (!sample || sample.contents.volume < 0.5) return state;
          const value = rawAbsorbance(
            sample,
            part.params.wavelength,
            part.params.frosted === 1,
            now,
          );
          return replacePart(state, {
            ...part,
            params: {
              ...part.params,
              blanked: 1,
              blankA: value,
              blankW: part.params.wavelength,
            },
          });
        },
        (part) => part.params.sample > 0,
      ),
      toggle(
        "scan",
        ["Spectrum scan", "Uchunguzi wa spektra"],
        ["Show", "Onyesha"],
        ["Hide", "Ficha"],
      ),
    ],
    state: { sample: 0, frosted: 0, blanked: 0, blankA: 0, blankW: 0, scan: 0 },
    analyse: ({ p, env }) => {
      const sample = env.part(p("sample"));
      const filled = sample && sample.contents.volume >= 0.5 ? sample : null;
      const wavelength = p("wavelength");
      const blank = p("blanked") === 1 ? p("blankA") : 0;
      const shown = filled
        ? rawAbsorbance(filled, wavelength, p("frosted") === 1, env.now) - blank
        : null;
      const wavelengths: number[] = [];
      for (let w = 400; w <= 700; w += 5) wavelengths.push(w);
      const scan =
        filled && p("scan") === 1
          ? wavelengths.map(
              (w) =>
                rawAbsorbance(filled, w, p("frosted") === 1, env.now) - blank,
            )
          : null;
      const peak = scan ? wavelengths[scan.indexOf(Math.max(...scan))] : 0;
      const coloured = filled
        ? absorbanceOf(filled.contents, peak || wavelength) > 0.05
        : false;
      return {
        visual: { shown: shown ?? -9, wavelength },
        plot: scan
          ? {
              title: t("Absorption spectrum", "Spektra ya ufyonzaji"),
              xLabel: "λ / nm",
              yLabel: "A",
              series: [{ x: wavelengths, y: scan }],
            }
          : undefined,
        readouts: [
          readout(
            ["Absorbance", "Ufyonzaji"],
            shown === null ? "– – –" : fixed(shown, 3),
            shown !== null && shown > 2 ? "warn" : undefined,
          ),
          readout(["Wavelength", "Urefu wa wimbi"], `${wavelength} nm`),
        ],
        issues: [
          ...(p("blanked") === 0
            ? [
                issue("blank", "warn", [
                  "Zero the instrument with a cuvette of the solvent (a blank) first.",
                  "Weka kifaa sifuri kwa kuveti ya kiyeyusho (tupu) kwanza.",
                ]),
              ]
            : []),
          ...(p("blanked") === 1 && p("blankW") !== wavelength
            ? [
                issue("reblank", "warn", [
                  "You changed the wavelength. Zero it again with the blank at this wavelength.",
                  "Umebadilisha urefu wa wimbi. Weka sifuri tena kwa sampuli tupu kwenye urefu huu.",
                ]),
              ]
            : []),
          ...(p("frosted") === 1
            ? [
                issue("frosted", "warn", [
                  "The frosted faces scatter the light. Turn the cuvette so the clear faces are in the beam.",
                  "Pande zisizo angavu hutawanya mwanga. Geuza kuveti pande angavu ziwe kwenye mwali.",
                ]),
              ]
            : []),
          ...(sample && sample.kind !== "cuvette"
            ? [
                issue("cuvette", "tip", [
                  "Use a cuvette: a 1 cm cell made for the light path.",
                  "Tumia kuveti: seli ya sentimita 1 iliyotengenezwa kwa njia ya mwanga.",
                ]),
              ]
            : []),
          ...(sample && !filled
            ? [
                issue("fill", "tip", [
                  "Fill the cuvette about three-quarters full.",
                  "Jaza kuveti takriban robo tatu.",
                ]),
              ]
            : []),
          ...(shown !== null && shown > 2
            ? [
                issue("high", "warn", [
                  "Absorbance above 2 is unreliable. Dilute the solution.",
                  "Ufyonzaji zaidi ya 2 si wa kuaminika. Punguza mkusanyiko wa myeyusho.",
                ]),
              ]
            : []),
        ],
        tasks:
          scan && coloured
            ? [
                task(
                  `peak-${filled?.id}`,
                  [
                    "Wavelength of maximum absorbance (λmax)",
                    "Urefu wa wimbi wa ufyonzaji mkuu (λmax)",
                  ],
                  "nm",
                  peak,
                  15,
                ),
              ]
            : [],
        measures:
          shown !== null
            ? [
                measure(
                  "absorbance",
                  ["Absorbance", "Ufyonzaji"],
                  "",
                  shown,
                  3,
                ),
                measure(
                  "wavelength",
                  ["Wavelength", "Urefu wa wimbi"],
                  "nm",
                  wavelength,
                  0,
                ),
              ]
            : [],
      };
    },
  },
  "auto-burette": {
    name: t("Automatic titrator", "Kititrati cha kujiendesha"),
    description: t(
      "A motor burette that adds titrant until a linked pH meter reaches the set point, and draws the titration curve. Calibrate the pH meter first.",
      "Biureti ya mota inayoongeza kitendanishi hadi kipima pH kilichounganishwa kifikie kiwango kilichowekwa, na huchora mkunjo wa titrasheni. Rekebisha kipima pH kwanza.",
    ),
    width: 120,
    height: 230,
    vessel: { capacity: 50, tare: 0 },
    controls: [
      ...vesselControls({ add: true, rinse: true, empty: true }),
      link(
        "flask",
        ["Dispenses into", "Inatoa kwenye"],
        ["Choose a flask", "Chagua chupa"],
        holdsLiquid,
      ),
      link(
        "meter",
        ["pH meter", "Kipima pH"],
        ["Choose a pH meter", "Chagua kipima pH"],
        (candidate) => candidate.kind === "ph-meter",
      ),
      slider("setpoint", ["End point pH", "pH ya mwisho"], 3, 11, 0.1, 7),
      button(
        "titrate",
        ["Titrate to the end point", "Titrati hadi mwisho"],
        ({ state, part, now }) => {
          const meterAt = (current: typeof state) => {
            const meter = partByNum(current, part.params.meter);
            return meter
              ? meterPh(meter, partByNum(current, part.params.flask))
              : null;
          };
          const start = meterAt(state);
          if (start === null) return state;
          const target = part.params.setpoint;
          const direction = Math.sign(target - start) || 1;
          let next = state;
          let pH = start;
          let added = 0;
          let params = addPoint(
            clearPoints(part.params, "c"),
            "c",
            part.params.dispensed,
            start,
          );
          for (let step = 0; step < 400; step++) {
            const burette = partByNum(next, part.num);
            const left = burette ? totalVolume(burette.contents) : 0;
            if (left < 0.01 || (pH - target) * direction >= 0) break;
            const amount = Math.min(
              left,
              Math.abs(pH - target) > 1.5 ? 0.5 : 0.05,
            );
            next = transfer(next, part.num, part.params.flask, amount, now);
            added += amount;
            pH = meterAt(next) ?? pH;
            params = addPoint(params, "c", part.params.dispensed + added, pH);
          }
          const after = partByNum(next, part.num);
          return after
            ? replacePart(next, {
                ...after,
                params: { ...params, dispensed: part.params.dispensed + added },
              })
            : next;
        },
        (part) => part.params.flask > 0 && part.params.meter > 0,
      ),
      button(
        "zero",
        ["Reset the volume counter", "Weka sifuri kihesabu ujazo"],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: { ...clearPoints(part.params, "c"), dispensed: 0 },
          }),
      ),
    ],
    state: {
      ...vesselState,
      flask: 0,
      meter: 0,
      dispensed: 0,
      ...pointState("c"),
    },
    analyse: ({ part, p, env }) => {
      const base = vesselOutcome(part, env);
      const meter = env.part(p("meter"));
      const curve = pointsOf(part.params, "c");
      return {
        ...base,
        visual: { dispensed: p("dispensed") },
        plot:
          curve.x.length > 1
            ? {
                title: t("Titration curve", "Mkunjo wa titrasheni"),
                xLabel: "V / mL",
                yLabel: "pH",
                series: [curve],
              }
            : undefined,
        readouts: [
          ...(base.readouts ?? []),
          readout(["Dispensed", "Imetolewa"], `${fixed(p("dispensed"), 2)} mL`),
        ],
        issues: [
          ...(base.issues ?? []),
          ...(meter && meter.params.in !== p("flask")
            ? [
                issue("probe", "warn", [
                  "The pH meter's probe is not in the flask. Put the probe in the flask first.",
                  "Kichunguzi cha kipima pH hakiko kwenye chupa. Weka kichunguzi kwenye chupa kwanza.",
                ]),
              ]
            : []),
          ...(meter && meter.params.calSlope !== 1
            ? [
                issue("meter", "tip", [
                  "Calibrate the pH meter with two buffers so the end point is accurate.",
                  "Rekebisha kipima pH kwa buffer mbili ili mwisho uwe sahihi.",
                ]),
              ]
            : []),
        ],
        measures:
          p("dispensed") > 0
            ? [measure("titre", ["Titre", "Titre"], "mL", p("dispensed"), 2)]
            : [],
      };
    },
  },
  "magnetic-stirrer": {
    name: t(
      "Magnetic stirrer hot plate",
      "Sahani ya joto ya kukoroga kwa sumaku",
    ),
    description: t(
      "Spins a stirrer bar in the vessel and can heat it. Stirring mixes the titrant in at once and speeds up dissolving. Too fast splashes.",
      "Huzungusha kijiti cha sumaku ndani ya chombo na kinaweza kukipasha joto. Kukoroga huchanganya kitendanishi mara moja na huharakisha kuyeyuka. Kasi kubwa hurusha kioevu.",
    ),
    width: 150,
    height: 70,
    controls: [
      slider("stir", ["Stirring speed", "Kasi ya kukoroga"], 0, 10, 1, 4),
      toggle(
        "on",
        ["Heater", "Kipasha joto"],
        ["On", "Kimewashwa"],
        ["Off", "Kimezimwa"],
      ),
      slider(
        "power",
        ["Heater setting", "Mpangilio wa kipasha"],
        0,
        100,
        5,
        30,
        "%",
      ),
    ],
    state: { on: 0, power: 30 },
    analyse: ({ part, p }) => {
      const out = heaterOutput(part);
      return {
        visual: { stir: p("stir"), hot: out ? 1 : 0 },
        readouts: [
          readout(
            ["Stirring", "Kukoroga"],
            p("stir") > 0 ? `${p("stir")} / 10` : "off",
          ),
          readout(
            ["Heater", "Kipasha joto"],
            out ? `${fixed(out.watts, 0)} W` : "off",
          ),
        ],
        issues: [
          ...(p("stir") >= 8
            ? [
                issue("splash", "warn", [
                  "Very fast stirring throws liquid up the sides. Turn the speed down.",
                  "Kukoroga kwa kasi sana kunarusha kioevu kwenye kuta. Punguza kasi.",
                ]),
              ]
            : []),
          ...(out
            ? [
                issue("hot", "tip", [
                  "The plate stays hot after it is switched off.",
                  "Sahani inabaki moto baada ya kuzimwa.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "rotary-evaporator": {
    name: t("Rotary evaporator", "Kivukizo cha kuzunguka"),
    description: t(
      "Removes solvent quickly at low temperature: the flask turns in a warm bath under vacuum. Rotate the flask or the solution bumps; keep the condenser cold.",
      "Huondoa kiyeyusho haraka kwa joto la chini: chupa huzunguka kwenye bafu yenye joto chini ya ombwe. Zungusha chupa la sivyo myeyusho utaruka; weka kipoozi baridi.",
    ),
    width: 220,
    height: 170,
    controls: [
      link(
        "flask",
        ["Flask", "Chupa"],
        ["Choose a round-bottom flask", "Chagua chupa ya chini mviringo"],
        holdsLiquid,
      ),
      toggle(
        "vacuum",
        ["Vacuum pump", "Pampu ya ombwe"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
      ),
      toggle(
        "rotate",
        ["Flask rotation", "Kuzunguka kwa chupa"],
        ["Turning", "Inazunguka"],
        ["Stopped", "Imesimama"],
      ),
      toggle(
        "cool",
        ["Condenser water", "Maji ya kipoozi"],
        ["Flowing", "Yanatiririka"],
        ["Off", "Yamezimwa"],
      ),
      slider("bath", ["Bath temperature", "Joto la bafu"], 20, 90, 5, 40, "°C"),
      button(
        "run",
        ["Run for one minute", "Endesha kwa dakika moja"],
        ({ state, part }) => {
          const flask = partByNum(state, part.params.flask);
          if (!flask || totalVolume(flask.contents) <= 0) return state;
          const p = part.params;
          const vacuum = p.vacuum === 1;
          let c = flask.contents;
          const notes = [...c.notes];
          if (vacuum && p.rotate !== 1) {
            c = tidy(takeFraction(c, 0.8).taken);
            notes.push(
              t(
                "The solution bumped violently and some shot into the condenser. Rotate the flask.",
                "Myeyusho uliruka kwa nguvu na sehemu ikaingia kwenye kipoozi. Zungusha chupa.",
              ),
            );
          }
          const ethanolBoils = vacuum ? 25 : 78;
          const waterBoils = vacuum ? 40 : 100;
          const budget = Math.max(0, p.bath - ethanolBoils) * 1.2;
          const ethanol = (c.species.EtOH ?? 0) / 17.1;
          const ethanolGone = Math.min(ethanol, budget);
          const water = Math.max(0, c.volume - ethanol);
          const waterGone =
            p.bath > waterBoils
              ? Math.min(water, (p.bath - waterBoils) * 0.8)
              : 0;
          const species = { ...c.species };
          if (ethanolGone > 0)
            species.EtOH = Math.max(
              0,
              (species.EtOH ?? 0) - ethanolGone * 17.1,
            );
          let next: Contents = {
            ...c,
            species,
            volume: Math.max(0, c.volume - ethanolGone - waterGone),
            notes,
          };
          if (ethanolGone + waterGone > 0)
            notes.push(
              t(
                `About ${fixed(ethanolGone + waterGone, 1)} mL of solvent evaporated${p.cool === 1 ? " and condensed in the receiver" : " but the condenser was warm, so the vapour went into the pump"}.`,
                `Takriban mL ${fixed(ethanolGone + waterGone, 1)} za kiyeyusho zilivukizwa${p.cool === 1 ? " na kuganda kwenye chombo cha kupokea" : " lakini kipoozi kilikuwa na joto, kwa hiyo mvuke uliingia kwenye pampu"}.`,
              ),
            );
          else
            notes.push(
              t(
                "Nothing evaporated: the bath is too cool for this pressure.",
                "Hakuna kilichovukizwa: bafu ina joto kidogo mno kwa shinikizo hili.",
              ),
            );
          if (next.volume < 0.2) next = crystallise({ ...next, volume: 0 });
          return replacePart(state, {
            ...flask,
            contents: tidy({ ...next, notes }),
          });
        },
        (part) => part.params.flask > 0,
      ),
    ],
    state: { flask: 0, vacuum: 0, rotate: 0, cool: 0 },
    analyse: ({ p, env }) => {
      const flask = env.part(p("flask"));
      return {
        visual: { vacuum: p("vacuum"), rotate: p("rotate"), bath: p("bath") },
        readouts: [
          readout(
            ["Pressure", "Shinikizo"],
            p("vacuum") === 1 ? "7 kPa" : "101 kPa",
          ),
          readout(
            ["Flask volume", "Ujazo wa chupa"],
            flask ? `${fixed(totalVolume(flask.contents), 1)} mL` : "– – –",
          ),
        ],
        issues: [
          ...(p("vacuum") === 1 && p("rotate") === 0
            ? [
                issue("bump", "bad", [
                  "Under vacuum a still flask bumps. Start the rotation before the vacuum.",
                  "Chini ya ombwe chupa iliyosimama huruka. Anzisha kuzunguka kabla ya ombwe.",
                ]),
              ]
            : []),
          ...(p("cool") === 0
            ? [
                issue("cool", "warn", [
                  "Turn on the condenser water, or the solvent vapour goes into the pump.",
                  "Fungua maji ya kipoozi, la sivyo mvuke wa kiyeyusho utaingia kwenye pampu.",
                ]),
              ]
            : []),
          ...(flask && flask.kind !== "round-bottom-flask"
            ? [
                issue("flask", "warn", [
                  "Use a round-bottom flask: flat-bottomed glass can implode under vacuum.",
                  "Tumia chupa ya chini mviringo: kioo cha chini bapa kinaweza kuvunjika ndani chini ya ombwe.",
                ]),
              ]
            : []),
          ...(!flask
            ? [
                issue("link", "tip", [
                  "Choose the flask to evaporate.",
                  "Chagua chupa ya kuvukiza.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "melting-point-apparatus": {
    name: t("Melting point apparatus", "Kifaa cha kiwango cha kuyeyuka"),
    description: t(
      "Heats a capillary of solid in a metal block. A pure solid melts sharply over 1 °C; an impure one melts lower and over a range. Heat at 1–2 °C per minute near the melting point.",
      "Hupasha kapilari yenye kigumu ndani ya kipande cha chuma. Kigumu safi huyeyuka ghafla ndani ya 1 °C; kisicho safi huyeyuka chini na kwa upana. Pasha kwa 1–2 °C kwa dakika karibu na kiwango cha kuyeyuka.",
    ),
    width: 150,
    height: 170,
    controls: [
      choice(
        "sample",
        ["Sample", "Sampuli"],
        meltingSamples.map((item) => item.name),
      ),
      slider(
        "from",
        ["Start from (fast pre-heat)", "Anza kutoka (pasha haraka)"],
        25,
        150,
        5,
        25,
        "°C",
        (part) => part.params.running === 0,
      ),
      slider(
        "rate",
        ["Heating rate", "Kasi ya kupasha"],
        0.5,
        10,
        0.5,
        2,
        "°C/min",
      ),
      button(
        "toggle",
        ["Start / stop heating", "Anza / simamisha kupasha"],
        ({ state, part, now }) => {
          const p = part.params;
          return replacePart(state, {
            ...part,
            params:
              p.running === 1
                ? { ...p, running: 0, elapsed: p.elapsed + (now - p.startedAt) }
                : { ...p, running: 1, startedAt: now },
          });
        },
      ),
      button(
        "reset",
        ["Cool down and load a new capillary", "Poza na weka kapilari mpya"],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: {
              ...part.params,
              running: 0,
              elapsed: 0,
              onset: 0,
              clear: 0,
              hasOnset: 0,
              hasClear: 0,
            },
          }),
      ),
      button(
        "noteOnset",
        ["Note: it starts to melt", "Andika: kinaanza kuyeyuka"],
        ({ state, part, now }) =>
          replacePart(state, {
            ...part,
            params: {
              ...part.params,
              onset: blockTemperature(part, now),
              hasOnset: 1,
            },
          }),
      ),
      button(
        "noteClear",
        ["Note: it is fully melted", "Andika: kimeyeyuka kabisa"],
        ({ state, part, now }) =>
          replacePart(state, {
            ...part,
            params: {
              ...part.params,
              clear: blockTemperature(part, now),
              hasClear: 1,
            },
          }),
        (part) => part.params.hasOnset === 1,
      ),
    ],
    state: {
      running: 0,
      startedAt: 0,
      elapsed: 0,
      onset: 0,
      clear: 0,
      hasOnset: 0,
      hasClear: 0,
    },
    analyse: ({ part, p, env }) => {
      const block = blockTemperature(part, env.now);
      const sample = meltingSample(part);
      const inside = block - p("rate") * LAG_MINUTES;
      const melted =
        inside >= sample.clear
          ? 1
          : inside >= sample.onset
            ? (inside - sample.onset) /
              Math.max(0.1, sample.clear - sample.onset)
            : 0;
      const near = block > sample.onset - 15 && block < sample.clear + 5;
      const unknown = p("sample") === meltingSamples.length - 1;
      return {
        visual: { block, melted },
        readouts: [
          readout(
            ["Block temperature", "Joto la kipande"],
            `${fixed(block, 1)} °C`,
          ),
          readout(
            ["Sample", "Sampuli"],
            melted >= 1 ? "clear liquid" : melted > 0 ? "melting" : "solid",
          ),
          ...(p("hasOnset") === 1
            ? [
                readout(
                  ["Melting starts", "Kuyeyuka kunaanza"],
                  `${fixed(p("onset"), 1)} °C`,
                ),
              ]
            : []),
          ...(p("hasClear") === 1
            ? [
                readout(
                  ["Fully melted", "Kimeyeyuka kabisa"],
                  `${fixed(p("clear"), 1)} °C`,
                  "ok",
                ),
              ]
            : []),
        ],
        observations: [
          t(
            melted >= 1
              ? "The solid in the capillary has become a clear liquid."
              : melted > 0
                ? "The solid is shrinking and turning to liquid."
                : "The solid in the capillary is still white and powdery.",
            melted >= 1
              ? "Kigumu ndani ya kapilari kimekuwa kioevu angavu."
              : melted > 0
                ? "Kigumu kinasinyaa na kugeuka kioevu."
                : "Kigumu ndani ya kapilari bado ni cheupe na cha unga.",
          ),
        ],
        issues: [
          ...(p("rate") > 2 && near
            ? [
                issue("rate", "warn", [
                  "Heating too fast near the melting point: the block runs ahead of the sample and the reading is too high. Use 1–2 °C per minute.",
                  "Unapasha haraka mno karibu na kiwango cha kuyeyuka: kipande kinatangulia sampuli na kipimo kinakuwa juu mno. Tumia 1–2 °C kwa dakika.",
                ]),
              ]
            : []),
          ...(p("from") > sample.onset - 10 &&
          p("running") === 0 &&
          p("elapsed") === 0
            ? [
                issue("from", "warn", [
                  "Start at least 10 °C below the expected melting point.",
                  "Anza angalau 10 °C chini ya kiwango kinachotarajiwa cha kuyeyuka.",
                ]),
              ]
            : []),
          ...(block >= 250
            ? [
                issue("max", "bad", [
                  "The block is at its maximum temperature. Stop heating.",
                  "Kipande kimefikia joto lake la juu. Simamisha kupasha.",
                ]),
              ]
            : []),
        ],
        measures: [
          ...(p("hasOnset") === 1
            ? [
                measure(
                  "onset",
                  ["Melting starts", "Kuyeyuka kunaanza"],
                  "°C",
                  p("onset"),
                  1,
                ),
              ]
            : []),
          ...(p("hasClear") === 1
            ? [
                measure(
                  "clear",
                  ["Fully melted", "Kimeyeyuka kabisa"],
                  "°C",
                  p("clear"),
                  1,
                ),
              ]
            : []),
        ],
        tasks:
          unknown && p("hasClear") === 1
            ? [
                task(
                  `mp-${part.id}`,
                  ["Melting point of X", "Kiwango cha kuyeyuka cha X"],
                  "°C",
                  (sample.onset + sample.clear) / 2,
                  1.5,
                  [
                    "Heat slowly near the melting point, then compare with the known solids.",
                    "Pasha polepole karibu na kiwango cha kuyeyuka, kisha linganisha na vigumu vinavyojulikana.",
                  ],
                ),
              ]
            : [],
      };
    },
  },
  "flame-test-kit": {
    name: t(
      "Flame test kit (nichrome wire)",
      "Kifaa cha jaribio la mwali (waya wa nikromu)",
    ),
    description: t(
      "Dip a clean wire in the sample and hold it in a hot blue flame. Clean the wire in concentrated HCl and the flame until it gives no colour. Cobalt-blue glass hides the yellow of sodium.",
      "Chovya waya safi kwenye sampuli na uushike kwenye mwali wa buluu wenye joto. Safisha waya kwa HCl iliyokolea na mwali hadi usitoe rangi. Kioo cha buluu ya kobalti huficha njano ya sodiamu.",
    ),
    width: 150,
    height: 90,
    controls: [
      link(
        "sample",
        ["Sample", "Sampuli"],
        ["Choose a bottle or vessel", "Chagua chupa au chombo"],
        (candidate, self) =>
          candidate.id !== self.id &&
          (Boolean(reagents[candidate.kind]) || candidate.vessel !== null),
      ),
      link(
        "burner",
        ["Flame", "Mwali"],
        ["Choose a Bunsen burner", "Chagua kichomeo cha Bunsen"],
        (candidate) =>
          candidate.kind === "bunsen-burner" ||
          candidate.kind === "spirit-lamp",
      ),
      button(
        "clean",
        [
          "Clean the wire (conc. HCl, then the flame)",
          "Safisha waya (HCl iliyokolea, kisha mwali)",
        ],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: { ...part.params, residue: 0, shown: 0, tested: 0 },
          }),
        (part) => part.params.burner > 0,
      ),
      button(
        "test",
        [
          "Dip the wire and hold it in the flame",
          "Chovya waya na uushike kwenye mwali",
        ],
        ({ state, part }) => {
          const sample = partByNum(state, part.params.sample);
          if (!sample) return state;
          const mask = sampleIons(sample);
          return replacePart(state, {
            ...part,
            params: {
              ...part.params,
              shown: mask | part.params.residue,
              residue: mask,
              tested: 1,
              dirty: part.params.residue > 0 ? 1 : 0,
            },
          });
        },
        (part) => part.params.sample > 0 && part.params.burner > 0,
      ),
      toggle(
        "cobalt",
        ["Look through", "Tazama kupitia"],
        ["Cobalt-blue glass", "Kioo cha buluu ya kobalti"],
        ["Nothing (naked eye)", "Hakuna (macho tu)"],
      ),
    ],
    state: {
      residue: ionBit.Na,
      shown: 0,
      tested: 0,
      dirty: 0,
      sample: 0,
      burner: 0,
    },
    analyse: ({ p, env }) => {
      const burner = env.part(p("burner"));
      const out = burner ? heaterOutput(burner) : null;
      const lit = Boolean(out?.flame);
      const luminous = Boolean(out?.luminous);
      const flame =
        p("tested") === 1 && lit && !luminous
          ? flameOf(p("shown"), p("cobalt") === 1)
          : null;
      const seen = flame
        ? t(
            `The wire gives ${flameNames[flame.ion][0]}${p("cobalt") === 1 ? ", seen through cobalt glass" : ""}.`,
            `Waya unatoa ${flameNames[flame.ion][1]}${p("cobalt") === 1 ? ", ukitazamwa kupitia kioo cha kobalti" : ""}.`,
          )
        : p("tested") === 1 && lit && !luminous
          ? t("No clear flame colour.", "Hakuna rangi wazi ya mwali.")
          : null;
      return {
        visual: { flame: flame?.index ?? 0, lit: lit ? 1 : 0 },
        observations: seen ? [seen] : [],
        issues: [
          ...(!lit
            ? [
                issue("lit", "tip", [
                  "Choose a lit Bunsen burner.",
                  "Chagua kichomeo cha Bunsen kinachowaka.",
                ]),
              ]
            : []),
          ...(luminous
            ? [
                issue("luminous", "warn", [
                  "The yellow luminous flame hides the colours. Open the air hole for a blue flame.",
                  "Mwali wa njano unaong'aa huficha rangi. Fungua tundu la hewa upate mwali wa buluu.",
                ]),
              ]
            : []),
          ...(p("dirty") === 1
            ? [
                issue("dirty", "warn", [
                  "The wire was not cleaned, so the last substance on it shows too. Clean it before every test.",
                  "Waya haukusafishwa, kwa hiyo dutu iliyopita pia inaonekana. Usafishe kabla ya kila jaribio.",
                ]),
              ]
            : []),
          ...(p("tested") === 0 && p("residue") > 0
            ? [
                issue("clean", "tip", [
                  "The wire is dirty from the last class. Clean it first.",
                  "Waya ni mchafu kutoka kipindi kilichopita. Usafishe kwanza.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "gas-chromatograph": {
    name: t("Gas chromatograph", "Kromatografu ya gesi"),
    description: t(
      "Separates a mixture of volatile liquids in a heated column. Each compound comes out at its own retention time; the peak area shows how much there is. A hotter column is faster but peaks merge.",
      "Hutenganisha mchanganyiko wa vimiminika vinavyovukiza ndani ya safu yenye joto. Kila kampaundi hutoka kwa muda wake wa kubaki; eneo la kilele huonyesha kiasi. Safu yenye joto zaidi ni ya haraka lakini vilele huungana.",
    ),
    width: 200,
    height: 140,
    controls: [
      choice(
        "sample",
        ["Sample", "Sampuli"],
        [
          ["From a vessel on the bench", "Kutoka chombo mezani"],
          ["Alcohol standard mixture", "Mchanganyiko wa kiwango wa alkoholi"],
          ["Unknown alcohol X", "Alkoholi isiyojulikana X"],
          ["Petrol", "Petroli"],
        ],
      ),
      link(
        "vessel",
        ["Inject from", "Ingiza kutoka"],
        ["Choose a vessel", "Chagua chombo"],
        holdsLiquid,
        (part) => (part.params.sample ?? 0) === 0,
      ),
      slider(
        "column",
        ["Column temperature", "Joto la safu"],
        40,
        200,
        10,
        80,
        "°C",
      ),
      hint,
    ],
    state: { vessel: 0 },
    analyse: ({ part, p, env }) => {
      const peaks = gcPeaks(part, env.part(p("vessel")));
      const column = p("column");
      const times = peaks.map((peak) => retention(peak.base, column));
      const x: number[] = [];
      const y: number[] = [];
      for (let time = 0; time <= 8; time += 0.02) {
        x.push(time);
        y.push(
          peaks.reduce((sum, peak, index) => {
            const width = peakWidth(times[index]);
            return (
              sum +
              (peak.area / width) *
                Math.exp(-(((time - times[index]) / width) ** 2))
            );
          }, 0),
        );
      }
      const sorted = [...times].sort((a, b) => a - b);
      const merged = sorted.some(
        (time, index) =>
          index > 0 && time - sorted[index - 1] < 2 * peakWidth(time),
      );
      const ethanol = peaks.find((peak) => peak.name === gcCompounds.ethanol);
      const sample = p("sample");
      return {
        visual: { peaks: peaks.length },
        plot:
          peaks.length > 0
            ? {
                title: t("Chromatogram", "Kromatogramu"),
                xLabel: "t / min",
                yLabel: "signal",
                series: [{ x, y }],
              }
            : undefined,
        readouts:
          p("hint") === 1
            ? peaks.map((peak, index) =>
                readout(peak.name, `${fixed(times[index], 2)} min`),
              )
            : [],
        issues: [
          ...(merged
            ? [
                issue("merged", "warn", [
                  "Some peaks overlap. Lower the column temperature to separate them.",
                  "Baadhi ya vilele vinaingiliana. Punguza joto la safu uvitenganishe.",
                ]),
              ]
            : []),
          ...(peaks.length === 0
            ? [
                issue("empty", "tip", [
                  "Choose a sample or a vessel with liquid in it.",
                  "Chagua sampuli au chombo chenye kioevu.",
                ]),
              ]
            : []),
          ...(times.some((time) => time > 8)
            ? [
                issue("slow", "tip", [
                  "Some compounds take longer than 8 minutes. Raise the column temperature.",
                  "Baadhi ya kampaundi huchukua zaidi ya dakika 8. Ongeza joto la safu.",
                ]),
              ]
            : []),
        ],
        tasks: [
          ...(sample === 2 && !merged
            ? [
                task(
                  `gc-${part.id}-${column}`,
                  ["Retention time of X", "Muda wa kubaki wa X"],
                  "min",
                  times[0] ?? 0,
                  0.08,
                  [
                    "Compare it with the alcohol standard run at the same column temperature.",
                    "Linganisha na kiwango cha alkoholi kilichoendeshwa kwa joto lilelile la safu.",
                  ],
                ),
              ]
            : []),
          ...(sample === 0 && ethanol
            ? [
                task(
                  `gc-ethanol-${fixed(ethanol.area, 3)}`,
                  ["Ethanol by peak area", "Ethanoli kwa eneo la kilele"],
                  "%",
                  ethanol.area * 100,
                  2,
                ),
              ]
            : []),
        ],
        measures: ethanol
          ? [
              measure(
                "ethanol",
                ["Ethanol by area", "Ethanoli kwa eneo"],
                "%",
                ethanol.area * 100,
                1,
              ),
            ]
          : [],
      };
    },
  },
  "mass-spectrometer": {
    name: t("Mass spectrometer", "Spektromita ya uzito"),
    description: t(
      "Ionises a sample and sorts the ions by mass. For an element the peaks are its isotopes, so you can work out the relative atomic mass; for a compound the last big peak is the molecular ion.",
      "Huionisha sampuli na kupanga ioni kwa uzito. Kwa elementi vilele ni isotopu zake, kwa hiyo unaweza kukokotoa uzito atomia linganishi; kwa kampaundi kilele kikubwa cha mwisho ni ioni ya molekuli.",
    ),
    width: 200,
    height: 140,
    controls: [
      choice(
        "sample",
        ["Sample", "Sampuli"],
        massSamples.map((item) => item.name),
      ),
      hint,
    ],
    analyse: ({ part, p }) => {
      const spectrum = spectrumOf(part);
      const top = Math.max(...spectrum.peaks.map(([, abundance]) => abundance));
      const masses = spectrum.peaks.map(([mass]) => mass);
      const answer = spectrum.element
        ? relativeMass(spectrum.peaks)
        : Math.max(...masses);
      return {
        visual: { peaks: spectrum.peaks.length },
        plot: {
          title: t("Mass spectrum", "Spektra ya uzito"),
          xLabel: "m/z",
          yLabel: spectrum.element ? "%" : "relative",
          series: [
            {
              x: masses,
              y: spectrum.peaks.map(([, abundance]) =>
                spectrum.element ? abundance : (abundance / top) * 100,
              ),
              sticks: true,
            },
          ],
        },
        readouts:
          p("hint") === 1
            ? spectrum.peaks.map(([mass, abundance]) =>
                readout(
                  [`m/z ${mass}`, `m/z ${mass}`],
                  `${fixed(abundance, 1)}`,
                ),
              )
            : [],
        tasks: [
          spectrum.element
            ? task(
                `ram-${part.id}-${p("sample")}`,
                ["Relative atomic mass", "Uzito atomia linganishi"],
                "",
                answer,
                0.05,
                [
                  "Multiply each mass by its percentage, add them up and divide by 100.",
                  "Zidisha kila uzito kwa asilimia yake, jumlisha na ugawanye kwa 100.",
                ],
              )
            : task(
                `mr-${part.id}-${p("sample")}`,
                [
                  "Relative molecular mass (molecular ion)",
                  "Uzito wa molekuli linganishi (ioni ya molekuli)",
                ],
                "",
                answer,
                0.5,
              ),
        ],
      };
    },
  },
  "ir-spectrometer": {
    name: t("Infrared (IR) spectrometer", "Spektromita ya infraredi (IR)"),
    description: t(
      "Shows which bonds are in a molecule. Dips in transmittance are absorptions: O–H is broad near 3300 cm⁻¹, C=O is sharp near 1700 cm⁻¹, C–H is near 2900 cm⁻¹.",
      "Huonyesha vifungo vilivyomo kwenye molekuli. Mabonde ya upitishaji ni ufyonzaji: O–H ni pana karibu na 3300 cm⁻¹, C=O ni nyembamba karibu na 1700 cm⁻¹, C–H ni karibu na 2900 cm⁻¹.",
    ),
    width: 200,
    height: 140,
    controls: [
      choice(
        "sample",
        ["Sample", "Sampuli"],
        irSamples.map((item) => item.name),
      ),
      hint,
    ],
    analyse: ({ part, p }) => {
      const sample = irSample(part);
      const x: number[] = [];
      for (let wavenumber = 4000; wavenumber >= 500; wavenumber -= 10)
        x.push(wavenumber);
      const strongest = sample.bands.reduce(
        (best, band) => (band.depth > best.depth ? band : best),
        sample.bands[0],
      );
      return {
        visual: { bands: sample.bands.length },
        plot: {
          title: t("Infrared spectrum", "Spektra ya infraredi"),
          xLabel: "cm⁻¹",
          yLabel: "% T",
          series: [
            {
              x,
              y: x.map((wavenumber) => transmittance(sample.bands, wavenumber)),
            },
          ],
          reverseX: true,
        },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["O–H (alcohol)", "O–H (alkoholi)"],
                  "3200–3550 cm⁻¹, broad",
                ),
                readout(
                  ["O–H (acid)", "O–H (asidi)"],
                  "2500–3300 cm⁻¹, very broad",
                ),
                readout(["C–H", "C–H"], "2850–3000 cm⁻¹"),
                readout(["C=O", "C=O"], "1680–1750 cm⁻¹, strong"),
                readout(["C–O", "C–O"], "1000–1300 cm⁻¹"),
              ]
            : [],
        tasks: [
          task(
            `ir-${part.id}-${p("sample")}`,
            [
              "Wavenumber of the strongest absorption",
              "Namba ya wimbi ya ufyonzaji mkubwa zaidi",
            ],
            "cm⁻¹",
            strongest.centre,
            40,
          ),
        ],
      };
    },
  },
};
