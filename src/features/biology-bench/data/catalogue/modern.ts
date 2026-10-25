import type { Params } from "../../../workbench/workbench.types";
import type {
  BioEnv,
  BioPart,
  BioPartSpec,
  BioState,
} from "../../biology.types";
import { ROOM, tubeLook } from "../../engine/food";
import {
  bathTemperature,
  currentContents,
  note,
  overlaps,
  partByNum,
  pourTube,
  setParams,
  tubeTemperature,
} from "../../engine/operations";
import { formatSpan } from "../../engine/time";
import {
  fixed,
  issue,
  measure,
  readout,
  seeded,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import { button, choice, link, slider, toggle } from "./controls";
import { isTube } from "./food";
import { germination } from "./genetics";
import { microscopeSpec } from "./microscopy";
import {
  bubbleRate,
  lightAt,
  potometerRate,
  respirometerRate,
} from "./physiology";

type ModernKind =
  | "digital-microscope"
  | "data-logger"
  | "colorimeter"
  | "centrifuge"
  | "pcr-machine"
  | "gel-electrophoresis"
  | "micropipette"
  | "laminar-flow-hood"
  | "blood-pressure-monitor"
  | "pulse-oximeter";

/* ------------------------------------------------------------ data logger */

const sensors: [string, string][] = [
  ["Oxygen (%)", "Oksijeni (%)"],
  ["Carbon dioxide (ppm)", "Kaboni dioksidi (ppm)"],
  ["Heart rate (bpm)", "Mapigo ya moyo (kwa dakika)"],
  ["Light (lux)", "Mwanga (lux)"],
  ["Temperature (°C)", "Joto (°C)"],
  ["Humidity (%)", "Unyevu (%)"],
];
const sensorUnits = ["%", "ppm", "bpm", "lux", "°C", "%"];
const loggerTargets = [
  "respirometer",
  "pondweed",
  "potometer",
  "germination-tray",
  "water-bath",
  "test-tube",
  "boiling-tube",
  "beaker",
];

function sensorValue(logger: BioPart, env: BioEnv) {
  const p = logger.params;
  const target = env.part(p.target ?? 0);
  const minutes = Math.max(0, env.time - (p.startedAt ?? env.time)) / 60;
  const calibrated = p.cal === 1;
  switch (p.sensor ?? 0) {
    case 0: {
      let value = 20.9;
      if (target?.kind === "pondweed")
        value += Math.min(
          5,
          bubbleRate(target, env.part(target.params.lamp ?? 0)) *
            0.004 *
            minutes,
        );
      if (target?.kind === "respirometer" && target.params.closedAt)
        value -= Math.min(5, respirometerRate(target.params) * 0.03 * minutes);
      return value + (calibrated ? 0 : 1.5);
    }
    case 1: {
      let value = 420;
      if (target?.kind === "respirometer")
        value +=
          respirometerRate({ ...target.params, sodaLime: 1 }) * 30 * minutes;
      if (target?.kind === "germination-tray")
        value += germination(target, env.time).percent * 5;
      return value + (calibrated ? 0 : 150);
    }
    case 2: {
      const rest = 68 + seeded(logger.id, 4) * 10;
      return p.exercise === 1
        ? rest +
            60 * Math.exp(-Math.max(0, env.time - (p.exerciseAt ?? 0)) / 180)
        : rest;
    }
    case 3:
      return target?.kind === "pondweed"
        ? lightAt(target, env.part(target.params.lamp ?? 0)) * 40
        : 300;
    case 4:
      if (target?.kind === "water-bath")
        return bathTemperature(target, env.time);
      if (target && isTube(target))
        return tubeTemperature(target, env.parts, env.time);
      return ROOM;
    default:
      if (target?.kind === "potometer")
        return target.params.bag === 1
          ? 90
          : Math.min(85, 50 + potometerRate(target.params) * 4);
      return 50;
  }
}

function addLog(params: Params, x: number, y: number): Params {
  const n = params.ln ?? 0;
  if (n >= 80) return params;
  return { ...params, ln: n + 1, [`lx${n}`]: x, [`ly${n}`]: y };
}

function logOf(params: Params) {
  const x: number[] = [];
  const y: number[] = [];
  for (let index = 0; index < (params.ln ?? 0); index++) {
    x.push(params[`lx${index}`] ?? 0);
    y.push(params[`ly${index}`] ?? 0);
  }
  return { x, y };
}

/* -------------------------------------------------------------- colorimeter */

/** Absorbance of a tube's colour at a wavelength: coloured liquids absorb the light of the opposite colour. */
function colourAbsorbance(colour: string, wavelength: number) {
  const match = colour.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
  if (!match) return 0;
  const [r, g, b, a] = match.slice(1).map(Number);
  const weight = (centre: number) =>
    Math.exp(-(((wavelength - centre) / 60) ** 2));
  const passed =
    (r / 255) * weight(650) + (g / 255) * weight(540) + (b / 255) * weight(450);
  const total = weight(650) + weight(540) + weight(450);
  return Math.max(0, -Math.log10(Math.max(0.01, passed / total)) * a * 2);
}

const chlorophyll = (wavelength: number) =>
  1.2 * Math.exp(-(((wavelength - 430) / 30) ** 2)) +
  0.9 * Math.exp(-(((wavelength - 662) / 20) ** 2)) +
  0.05;

function rawAbsorbance(meter: BioPart, env: BioEnv, wavelength: number) {
  if ((meter.params.sample ?? 0) === 1) return chlorophyll(wavelength);
  const tube = env.part(meter.params.tube ?? 0);
  if (!tube || !isTube(tube)) return null;
  const contents = currentContents(tube, env.parts, env.time);
  if (contents.volume <= 0) return null;
  return (
    colourAbsorbance(
      tubeLook(contents, 20, tubeTemperature(tube, env.parts, env.time)).liquid
        .colour,
      wavelength,
    ) + 0.05
  );
}

/* ------------------------------------------------------------------- PCR */

const meltingPoint = (pcr: BioPart) => 55 + seeded(pcr.id, 2) * 6;
const productSize = (pcr: BioPart) =>
  Math.round((300 + seeded(pcr.id, 5) * 600) / 10) * 10;
const runLength = (p: Params) => (p.cycles ?? 30) * 180 + 300;

export function pcrResult(pcr: BioPart, time: number) {
  const p = pcr.params;
  if (!p.runAt || time - p.runAt < runLength(p))
    return { done: false, amount: 0, extra: false };
  const tm = meltingPoint(pcr);
  const anneal = p.anneal ?? 55;
  if ((p.denature ?? 95) < 92 || anneal > tm + 3 || (p.extend ?? 72) < 65)
    return { done: true, amount: 0, extra: false };
  const amount =
    Math.min(1, Math.max(0, ((p.cycles ?? 30) - 12) / 18)) *
    (p.lid === 1 ? 1 : 0.5);
  return { done: true, amount, extra: anneal < tm - 6 };
}

const ladder = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const mobility = (size: number) => 2.6 - 0.66 * Math.log10(size);

/** Distance in mm a DNA band moves along a 70 mm gel. */
export function bandDistance(gel: BioPart, size: number, time: number) {
  const p = gel.params;
  if (!p.runAt) return 0;
  const minutes =
    Math.min(Math.max(0, time - p.runAt), (p.runFor ?? 30) * 60) / 60;
  return (mobility(size) * (p.voltage ?? 100) * minutes) / 90;
}

export function gelLanes(gel: BioPart, env: BioEnv) {
  const pcr = env.part(gel.params.pcr ?? 0);
  const result = pcr
    ? pcrResult(pcr, env.time)
    : { done: false, amount: 0, extra: false };
  const size = pcr ? productSize(pcr) : 0;
  const reversed = gel.params.wells === 1;
  const bands = (sizes: number[], strength: number) =>
    sizes.map((value) => ({
      size: value,
      mm: reversed
        ? -bandDistance(gel, value, env.time)
        : bandDistance(gel, value, env.time),
      strength,
    }));
  return {
    ladder: gel.params.ladder === 1 ? bands(ladder, 0.7) : [],
    sample:
      result.amount > 0
        ? [
            ...bands([size], result.amount),
            ...(result.extra ? bands([size * 0.55, size * 1.6], 0.35) : []),
          ]
        : [],
    size,
  };
}

/* ----------------------------------------------------------- micropipette */

const pipetteRanges: [number, number][] = [
  [2, 20],
  [20, 200],
  [100, 1000],
];

/* ------------------------------------------------------------------ parts */

export const modernParts: Record<ModernKind, BioPartSpec> = {
  "digital-microscope": microscopeSpec(true),
  "data-logger": {
    name: t("Data logger with sensors", "Kirekodi data na vihisi"),
    description: t(
      "Records oxygen, carbon dioxide, heart rate, light, temperature or humidity over time. Calibrate gas probes in fresh air first.",
      "Hurekodi oksijeni, kaboni dioksidi, mapigo ya moyo, mwanga, joto au unyevu kwa muda. Rekebisha vihisi vya gesi kwenye hewa safi kwanza.",
    ),
    width: 170,
    height: 130,
    controls: [
      choice("sensor", ["Sensor", "Kihisi"], sensors),
      link(
        "target",
        ["Sensor placed in", "Kihisi kimewekwa"],
        ["The room", "Chumbani"],
        (candidate) => loggerTargets.includes(candidate.kind),
        (part) => (part.params.sensor ?? 0) !== 2,
      ),
      toggle(
        "exercise",
        ["The person", "Mtu"],
        ["Just did 2 minutes of exercise", "Amefanya mazoezi dakika 2"],
        ["At rest", "Amepumzika"],
        0,
        (part) => (part.params.sensor ?? 0) === 2,
      ),
      button(
        "cal",
        ["Calibrate in fresh air", "Rekebisha kwenye hewa safi"],
        ({ state, part }) => setParams(state, part, { cal: 1 }),
        (part) => (part.params.sensor ?? 0) <= 1,
      ),
      button(
        "start",
        ["Start (clear the log)", "Anza (futa rekodi)"],
        ({ state, part, time }) =>
          setParams(state, part, { startedAt: time, ln: 0 }),
      ),
      button(
        "log",
        ["Log a point", "Rekodi nukta"],
        ({ state, part, time }) => {
          const env: BioEnv = {
            parts: state.parts,
            time,
            part: (num) => partByNum(state, num),
            over: () => [],
            has: () => false,
            wearing: () => false,
          };
          return setParams(
            state,
            part,
            addLog(
              part.params,
              (time - (part.params.startedAt ?? time)) / 60,
              sensorValue(part, env),
            ),
          );
        },
        (part) => (part.params.startedAt ?? 0) > 0,
      ),
    ],
    state: { cal: 0, startedAt: 0, ln: 0, exerciseAt: 0 },
    afterChange: ({ state, after, param, time }) =>
      param === "exercise" || param === "sensor"
        ? setParams(state, after, {
            exerciseAt: time,
            cal: param === "sensor" ? 0 : after.params.cal,
          })
        : state,
    analyse: ({ part, p, env }) => {
      const value = sensorValue(part, env);
      const unit = sensorUnits[p("sensor")] ?? "";
      const log = logOf(part.params);
      return {
        visual: { value, sensor: p("sensor") },
        plot:
          log.x.length > 0
            ? {
                title: t("Logged data", "Data iliyorekodiwa"),
                xLabel: "t / min",
                yLabel: unit,
                series: [log],
              }
            : undefined,
        readouts: [
          readout(
            ["Live value", "Thamani ya sasa"],
            `${fixed(value, p("sensor") === 0 || p("sensor") === 4 ? 1 : 0)} ${unit}`,
          ),
          readout(
            ["Points logged", "Nukta zilizorekodiwa"],
            String(log.x.length),
          ),
        ],
        issues:
          p("sensor") <= 1 && p("cal") === 0
            ? [
                issue("cal", "warn", [
                  "The gas probe is not calibrated: readings are off. Calibrate it in fresh air.",
                  "Kihisi cha gesi hakijarekebishwa: vipimo vimekosea. Kirekebishe kwenye hewa safi.",
                ]),
              ]
            : [],
        measures: [
          measure(
            `sensor-${p("sensor")}`,
            sensors[p("sensor")] ?? sensors[0],
            unit,
            value,
            1,
          ),
        ],
      };
    },
  },
  colorimeter: {
    name: t(
      "Colorimeter / spectrophotometer",
      "Kipima rangi / spektrofotomita",
    ),
    description: t(
      "Measures how much light a coloured solution absorbs. Zero it with a blank at your chosen wavelength.",
      "Hupima kiasi cha mwanga unaofyonzwa na myeyusho wenye rangi. Iweke sifuri kwa sampuli tupu kwenye urefu wa wimbi uliouchagua.",
    ),
    width: 190,
    height: 130,
    controls: [
      choice(
        "sample",
        ["Cuvette holds", "Kuveti ina"],
        [
          ["Liquid from a tube", "Kioevu kutoka mrija"],
          ["Chlorophyll extract", "Dondoo ya klorofili"],
        ],
      ),
      link(
        "tube",
        ["Tube", "Mrija"],
        ["Choose a tube", "Chagua mrija"],
        (candidate) => isTube(candidate),
        (part) => (part.params.sample ?? 0) === 0,
      ),
      slider(
        "wavelength",
        ["Wavelength (filter)", "Urefu wa wimbi (kichujio)"],
        400,
        700,
        10,
        600,
        "nm",
      ),
      button(
        "blank",
        ["Zero with a water blank", "Weka sifuri kwa maji tupu"],
        ({ state, part }) =>
          setParams(state, part, {
            blanked: 1,
            blankW: part.params.wavelength ?? 600,
          }),
      ),
      toggle(
        "scan",
        ["Spectrum scan", "Uchunguzi wa spektra"],
        ["Show", "Onyesha"],
        ["Hide", "Ficha"],
      ),
    ],
    state: { blanked: 0, blankW: 0 },
    analyse: ({ part, p, env }) => {
      const wavelength = p("wavelength");
      const blank = p("blanked") === 1 ? 0.05 : 0;
      const raw = rawAbsorbance(part, env, wavelength);
      const shown = raw === null ? null : raw - blank;
      const xs = Array.from({ length: 61 }, (_, index) => 400 + index * 5);
      const scan =
        p("scan") === 1 && raw !== null
          ? xs.map((w) => (rawAbsorbance(part, env, w) ?? 0) - blank)
          : null;
      return {
        visual: { shown: shown ?? -9, wavelength },
        plot: scan
          ? {
              title: t("Absorption spectrum", "Spektra ya ufyonzaji"),
              xLabel: "λ / nm",
              yLabel: "A",
              series: [{ x: xs, y: scan }],
            }
          : undefined,
        readouts: [
          readout(
            ["Absorbance", "Ufyonzaji"],
            shown === null ? "– – –" : fixed(shown, 3),
          ),
          readout(["Wavelength", "Urefu wa wimbi"], `${wavelength} nm`),
        ],
        issues: [
          ...(p("blanked") === 0
            ? [
                issue("blank", "warn", [
                  "Zero it with a blank of water first.",
                  "Iweke sifuri kwa maji tupu kwanza.",
                ]),
              ]
            : []),
          ...(p("blanked") === 1 && p("blankW") !== wavelength
            ? [
                issue("reblank", "warn", [
                  "You changed the wavelength: zero it again.",
                  "Umebadilisha urefu wa wimbi: iweke sifuri tena.",
                ]),
              ]
            : []),
          ...(raw === null && p("sample") === 0
            ? [
                issue("tube", "tip", [
                  "Choose a tube with liquid in it.",
                  "Chagua mrija wenye kioevu.",
                ]),
              ]
            : []),
        ],
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
  centrifuge: {
    name: t("Centrifuge", "Sentrifuji"),
    description: t(
      "Spins tubes fast so heavy parts sink. Balance it with equal tubes opposite each other and close the lid.",
      "Huzungusha mirija kwa kasi ili sehemu nzito zizame. Isawazishe kwa mirija sawa inayokabiliana na funga kifuniko.",
    ),
    width: 140,
    height: 110,
    controls: [
      choice(
        "sample",
        ["Sample", "Sampuli"],
        [
          ["Blood", "Damu"],
          ["Leaf homogenate", "Mchanganyiko wa majani"],
        ],
      ),
      choice(
        "tubeA",
        ["Tube A", "Mrija A"],
        [
          ["Empty", "Tupu"],
          ["5 mL", "mL 5"],
          ["10 mL", "mL 10"],
        ],
        2,
      ),
      choice(
        "tubeB",
        ["Tube B (opposite)", "Mrija B (unaokabiliana)"],
        [
          ["Empty", "Tupu"],
          ["5 mL", "mL 5"],
          ["10 mL", "mL 10"],
        ],
      ),
      toggle(
        "lid",
        ["Lid", "Kifuniko"],
        ["Closed", "Kimefungwa"],
        ["Open", "Kiko wazi"],
      ),
      button(
        "spin",
        ["Spin for 5 minutes", "Zungusha kwa dakika 5"],
        ({ state, part }) => {
          if (part.params.lid !== 1)
            return note(
              state,
              part,
              t(
                "It will not start with the lid open.",
                "Haianzi kifuniko kikiwa wazi.",
              ),
            );
          if ((part.params.tubeA ?? 0) !== (part.params.tubeB ?? 0))
            return note(
              state,
              part,
              t(
                "It shakes violently: the tubes are not balanced. Stop and balance it.",
                "Inatikisika kwa nguvu: mirija haijasawazishwa. Simamisha na uisawazishe.",
              ),
            );
          return note(
            setParams(state, part, { spun: 1 }),
            part,
            (part.params.sample ?? 0) === 0
              ? t(
                  "Blood separated: pale yellow plasma on top, red cells at the bottom.",
                  "Damu imetengana: plazima ya njano hafifu juu, seli nyekundu chini.",
                )
              : t(
                  "A green pellet of chloroplasts formed at the bottom.",
                  "Kidonge cha kijani cha kloroplasti kimetokea chini.",
                ),
          );
        },
      ),
    ],
    state: { spun: 0 },
    afterChange: ({ state, after, param }) =>
      param === "sample" ? setParams(state, after, { spun: 0 }) : state,
    analyse: ({ part, p }) => ({
      visual: { spun: p("spun"), sample: p("sample") },
      observations: part.contents.notes,
      issues:
        p("tubeA") !== p("tubeB")
          ? [
              issue("balance", "warn", [
                "Put an equal tube opposite to balance the rotor.",
                "Weka mrija sawa upande wa pili kusawazisha.",
              ]),
            ]
          : [],
    }),
  },
  "pcr-machine": {
    name: t("PCR machine (thermal cycler)", "Mashine ya PCR"),
    description: t(
      "Copies a piece of DNA millions of times by cycling through three temperatures. The annealing temperature must suit the primers.",
      "Hunakili kipande cha DNA mara mamilioni kwa kupitia joto tatu. Joto la kuunganisha lazima lilingane na vianzishi.",
    ),
    width: 170,
    height: 120,
    controls: [
      slider("denature", ["Denature", "Kutenganisha"], 85, 99, 1, 95, "°C"),
      slider(
        "anneal",
        ["Anneal (primers bind)", "Kuunganisha (vianzishi vinashikana)"],
        40,
        72,
        1,
        50,
        "°C",
      ),
      slider("extend", ["Extend", "Kurefusha"], 60, 80, 1, 72, "°C"),
      slider("cycles", ["Cycles", "Mizunguko"], 10, 40, 1, 30),
      toggle(
        "lid",
        ["Heated lid", "Kifuniko chenye joto"],
        ["On", "Kimewashwa"],
        ["Off", "Kimezimwa"],
        1,
      ),
      button("run", ["Run", "Endesha"], ({ state, part, time }) =>
        setParams(state, part, { runAt: time }),
      ),
    ],
    state: { runAt: 0 },
    analyse: ({ part, p, env }) => {
      const result = pcrResult(part, env.time);
      const left =
        p("runAt") > 0
          ? Math.max(0, runLength(part.params) - (env.time - p("runAt")))
          : 0;
      return {
        visual: { running: p("runAt") > 0 && !result.done ? 1 : 0 },
        readouts: [
          readout(
            ["Status", "Hali"],
            p("runAt") === 0
              ? "ready"
              : result.done
                ? "finished"
                : `running · ${formatSpan(left)} left`,
          ),
          ...(result.done
            ? [
                readout(
                  ["Product", "Matokeo"],
                  result.amount > 0 ? "DNA copied" : "no product",
                  result.amount > 0 ? "ok" : "bad",
                ),
              ]
            : []),
        ],
        issues: [
          ...(p("denature") < 92
            ? [
                issue("denature", "warn", [
                  "Below 92 °C the DNA strands do not separate.",
                  "Chini ya 92 °C nyuzi za DNA hazitengani.",
                ]),
              ]
            : []),
          ...(p("lid") === 0
            ? [
                issue("lid", "tip", [
                  "Without a heated lid the samples evaporate onto the lid.",
                  "Bila kifuniko chenye joto sampuli huvukiza kwenye kifuniko.",
                ]),
              ]
            : []),
          ...(result.done && result.amount === 0
            ? [
                issue("none", "warn", [
                  "No product. Check the annealing temperature: too high and the primers cannot bind.",
                  "Hakuna matokeo. Kagua joto la kuunganisha: likiwa juu mno vianzishi haviwezi kushikana.",
                ]),
              ]
            : []),
          ...(result.extra
            ? [
                issue("extra", "tip", [
                  "Annealing too cool lets primers bind in the wrong places: extra bands.",
                  "Kuunganisha kwa joto la chini mno huruhusu vianzishi kushikana mahali pasipo sahihi: mikanda ya ziada.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "gel-electrophoresis": {
    name: t("Gel electrophoresis kit", "Kifaa cha elektroforesisi ya jeli"),
    description: t(
      "DNA is negative, so it moves towards the red (+) electrode. Put the wells at the black (−) end. Small pieces travel furthest.",
      "DNA ina chaji hasi, kwa hiyo husogea kuelekea elektrodi nyekundu (+). Weka visima upande mweusi (−). Vipande vidogo husafiri mbali zaidi.",
    ),
    width: 200,
    height: 140,
    controls: [
      link(
        "pcr",
        ["Sample from", "Sampuli kutoka"],
        ["Choose a PCR machine", "Chagua mashine ya PCR"],
        (candidate) => candidate.kind === "pcr-machine",
      ),
      toggle(
        "ladder",
        ["DNA ladder in lane 1", "Ngazi ya DNA kwenye mstari 1"],
        ["Loaded", "Imewekwa"],
        ["Not loaded", "Haijawekwa"],
        1,
      ),
      choice(
        "wells",
        ["Wells", "Visima"],
        [
          ["At the black (−) end", "Upande mweusi (−)"],
          ["At the red (+) end", "Upande mwekundu (+)"],
        ],
      ),
      slider("voltage", ["Voltage", "Volteji"], 50, 150, 10, 100, "V"),
      slider("runFor", ["Run time", "Muda wa kuendesha"], 10, 60, 5, 30, "min"),
      toggle(
        "stain",
        ["DNA stain", "Rangi ya DNA"],
        ["Added", "Imeongezwa"],
        ["None", "Hakuna"],
        1,
      ),
      button(
        "run",
        ["Switch on (run)", "Washa (endesha)"],
        ({ state, part, time }) => setParams(state, part, { runAt: time }),
      ),
    ],
    state: { runAt: 0 },
    analyse: ({ part, p, env }) => {
      const lanes = gelLanes(part, env);
      const finished =
        p("runAt") > 0 && env.time - p("runAt") >= p("runFor") * 60;
      const visible = p("stain") === 1;
      return {
        visual: {
          running: p("runAt") > 0 && !finished ? 1 : 0,
          stain: p("stain"),
        },
        readouts: [
          readout(
            ["Status", "Hali"],
            p("runAt") === 0 ? "ready" : finished ? "finished" : "running",
          ),
        ],
        issues: [
          ...(p("wells") === 1
            ? [
                issue("wells", "bad", [
                  "The wells are at the + end, so the DNA runs out of the gel. Put the wells at the black (−) end.",
                  "Visima viko upande wa +, kwa hiyo DNA inatoka nje ya jeli. Weka visima upande mweusi (−).",
                ]),
              ]
            : []),
          ...(!visible
            ? [
                issue("stain", "tip", [
                  "Add a DNA stain to see the bands.",
                  "Ongeza rangi ya DNA kuona mikanda.",
                ]),
              ]
            : []),
          ...(lanes.ladder.some((band) => band.mm > 70)
            ? [
                issue("long", "warn", [
                  "Small bands ran off the end. Use a shorter time or lower voltage.",
                  "Mikanda midogo imetoka mwisho. Tumia muda mfupi au volteji ya chini.",
                ]),
              ]
            : []),
        ],
        tasks:
          finished &&
          visible &&
          p("ladder") === 1 &&
          lanes.sample.length > 0 &&
          p("wells") === 0
            ? [
                task(
                  `gel-${part.id}`,
                  ["Size of the PCR product", "Ukubwa wa matokeo ya PCR"],
                  "bp",
                  lanes.size,
                  50,
                  [
                    "Compare its distance with the ladder bands.",
                    "Linganisha umbali wake na mikanda ya ngazi.",
                  ],
                ),
              ]
            : [],
      };
    },
  },
  micropipette: {
    name: t("Micropipette", "Mikropipeti"),
    description: t(
      "Set the volume within its range, fit a fresh tip, press to the first stop to draw up and the second stop to dispense.",
      "Weka ujazo ndani ya kiwango chake, weka ncha mpya, bonyeza hadi kituo cha kwanza kuvuta na kituo cha pili kutoa.",
    ),
    width: 50,
    height: 170,
    controls: [
      choice(
        "model",
        ["Model", "Aina"],
        [
          ["P20 (2–20 µL)", "P20 (2–20 µL)"],
          ["P200 (20–200 µL)", "P200 (20–200 µL)"],
          ["P1000 (100–1000 µL)", "P1000 (100–1000 µL)"],
        ],
        2,
      ),
      slider(
        "volume",
        ["Volume set", "Ujazo uliowekwa"],
        1,
        1000,
        1,
        500,
        "µL",
      ),
      choice(
        "technique",
        ["Drawing up", "Kuvuta"],
        [
          ["Press to the first stop", "Bonyeza hadi kituo cha kwanza"],
          ["Press to the second stop", "Bonyeza hadi kituo cha pili"],
        ],
      ),
      button("tip", ["Fit a fresh tip", "Weka ncha mpya"], ({ state, part }) =>
        setParams(state, part, { tip: 1 }),
      ),
      link(
        "from",
        ["Draw from", "Vuta kutoka"],
        ["Choose a tube", "Chagua mrija"],
        (candidate) => isTube(candidate),
      ),
      link(
        "to",
        ["Dispense into", "Toa kwenye"],
        ["Choose a tube", "Chagua mrija"],
        (candidate, self) =>
          isTube(candidate) && candidate.num !== self.params.from,
      ),
      button(
        "transfer",
        ["Transfer", "Hamisha"],
        ({ state, part, time }) => {
          const from = partByNum(state, part.params.from ?? 0);
          const to = partByNum(state, part.params.to ?? 0);
          if (!from || !to) return state;
          const [low, high] = pipetteRanges[part.params.model ?? 2];
          const set = Math.max(low, Math.min(high, part.params.volume ?? 500));
          const actual = set * ((part.params.technique ?? 0) === 1 ? 1.08 : 1);
          let next: BioState = pourTube(
            state,
            from,
            to,
            actual / 1000,
            time,
            to.kind === "beaker" ? 250 : to.kind === "boiling-tube" ? 35 : 20,
          );
          next = setParams(next, part, { tip: 0, moved: actual });
          if (part.params.tip !== 1)
            next = note(
              next,
              part,
              t(
                "The tip was used before, so the samples were cross-contaminated.",
                "Ncha ilikuwa imetumika, kwa hiyo sampuli zilichafuana.",
              ),
            );
          return next;
        },
        (part) => (part.params.from ?? 0) > 0 && (part.params.to ?? 0) > 0,
      ),
    ],
    state: { tip: 0, moved: 0 },
    analyse: ({ part, p }) => {
      const [low, high] = pipetteRanges[p("model")] ?? pipetteRanges[2];
      return {
        observations: part.contents.notes,
        readouts: [
          readout(["Range", "Kiwango"], `${low}–${high} µL`),
          ...(p("moved") > 0
            ? [
                readout(
                  ["Last transfer", "Uhamisho wa mwisho"],
                  `${fixed(p("moved"), 0)} µL`,
                ),
              ]
            : []),
        ],
        issues: [
          ...(p("volume") < low || p("volume") > high
            ? [
                issue("range", "bad", [
                  "The volume is outside this pipette's range: it will be wrong and can damage the pipette. Choose another model.",
                  "Ujazo uko nje ya kiwango cha pipeti hii: utakuwa si sahihi na unaweza kuiharibu. Chagua aina nyingine.",
                ]),
              ]
            : []),
          ...(p("technique") === 1
            ? [
                issue("stop", "warn", [
                  "Pressing to the second stop when drawing up takes in too much.",
                  "Kubonyeza hadi kituo cha pili unapovuta huchukua kingi mno.",
                ]),
              ]
            : []),
          ...(p("tip") === 0
            ? [
                issue("tip", "tip", [
                  "Fit a fresh tip for every liquid.",
                  "Weka ncha mpya kwa kila kioevu.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "laminar-flow-hood": {
    name: t("Laminar flow hood", "Kabati la hewa safi"),
    description: t(
      "Blows filtered air over the bench so microbes from the air do not land on plates. Switch off the UV lamp before working.",
      "Hupuliza hewa iliyochujwa juu ya benchi ili vijidudu vya hewani visitue kwenye sahani. Zima taa ya UV kabla ya kufanya kazi.",
    ),
    width: 240,
    height: 180,
    controls: [
      toggle(
        "on",
        ["Air flow", "Mtiririko wa hewa"],
        ["On", "Umewashwa"],
        ["Off", "Umezimwa"],
      ),
      toggle(
        "uv",
        ["UV lamp", "Taa ya UV"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
      ),
    ],
    analyse: ({ part, p, env }) => ({
      visual: { on: p("on"), uv: p("uv") },
      issues: [
        ...(p("uv") === 1
          ? [
              issue("uv", "bad", [
                "UV light damages eyes and skin. Switch it off before you work in the hood.",
                "Mwanga wa UV huharibu macho na ngozi. Uzime kabla ya kufanya kazi ndani ya kabati.",
              ]),
            ]
          : []),
        ...(p("on") === 1 &&
        !env.parts.some(
          (item) => item.kind === "petri-dish" && overlaps(item, part),
        )
          ? [
              issue("inside", "tip", [
                "Drag Petri dishes inside the hood before pouring.",
                "Buruta sahani za Petri ndani ya kabati kabla ya kumimina.",
              ]),
            ]
          : []),
      ],
    }),
  },
  "blood-pressure-monitor": {
    name: t("Blood pressure monitor", "Kipima shinikizo la damu"),
    description: t(
      "Wrap the cuff snugly round the upper arm at heart level, sit still and press Measure.",
      "Funga kifuko vizuri kuzunguka mkono wa juu usawa wa moyo, kaa tuli na ubonyeze Pima.",
    ),
    width: 150,
    height: 120,
    controls: [
      choice(
        "subject",
        ["The person", "Mtu"],
        [
          ["At rest", "Amepumzika"],
          ["Just after exercise", "Mara baada ya mazoezi"],
        ],
      ),
      choice(
        "cuff",
        ["Cuff", "Kifuko"],
        [
          ["Upper arm, at heart level", "Mkono wa juu, usawa wa moyo"],
          ["Arm hanging down", "Mkono umening'inia"],
          ["Too loose", "Imelegea mno"],
        ],
      ),
      button("measure", ["Measure", "Pima"], ({ state, part, time }) => {
        const noise = (salt: number) =>
          (seeded(part.id, Math.floor(time) + salt) - 0.5) * 4;
        const exercise = (part.params.subject ?? 0) === 1;
        const cuff = part.params.cuff ?? 0;
        const sys =
          112 +
          seeded(part.id, 1) * 10 +
          (exercise ? 28 : 0) +
          (cuff === 1 ? 8 : cuff === 2 ? 12 : 0) +
          noise(1);
        const dia =
          72 +
          seeded(part.id, 2) * 6 +
          (exercise ? 5 : 0) +
          (cuff === 1 ? 6 : cuff === 2 ? 8 : 0) +
          noise(2);
        const pulse =
          70 + seeded(part.id, 3) * 8 + (exercise ? 45 : 0) + noise(3);
        return setParams(state, part, { sys, dia, pulse, measured: 1 });
      }),
    ],
    state: { measured: 0 },
    afterChange: ({ state, after }) => setParams(state, after, { measured: 0 }),
    analyse: ({ p }) => ({
      visual: {
        sys: p("sys"),
        dia: p("dia"),
        pulse: p("pulse"),
        measured: p("measured"),
      },
      readouts:
        p("measured") === 1
          ? [
              readout(
                ["Blood pressure", "Shinikizo la damu"],
                `${Math.round(p("sys"))} / ${Math.round(p("dia"))} mmHg`,
              ),
              readout(["Pulse", "Mapigo"], `${Math.round(p("pulse"))} bpm`),
            ]
          : [],
      issues:
        p("cuff") === 1
          ? [
              issue("arm", "warn", [
                "With the arm hanging down the reading is too high. Rest the arm at heart level.",
                "Mkono ukining'inia kipimo kinakuwa juu mno. Pumzisha mkono usawa wa moyo.",
              ]),
            ]
          : p("cuff") === 2
            ? [
                issue("loose", "warn", [
                  "A loose cuff gives a falsely high reading.",
                  "Kifuko kilicholegea hutoa kipimo cha juu kisicho sahihi.",
                ]),
              ]
            : [],
      measures:
        p("measured") === 1
          ? [
              measure("systolic", ["Systolic", "Sistoli"], "mmHg", p("sys"), 0),
              measure(
                "diastolic",
                ["Diastolic", "Diastoli"],
                "mmHg",
                p("dia"),
                0,
              ),
              measure("pulse", ["Pulse", "Mapigo"], "bpm", p("pulse"), 0),
            ]
          : [],
    }),
  },
  "pulse-oximeter": {
    name: t("Pulse oximeter", "Kipima oksijeni ya damu"),
    description: t(
      "Clips on a finger to read blood oxygen saturation and pulse. Warm hands and no nail polish give a good reading.",
      "Hubanwa kwenye kidole kusoma kiwango cha oksijeni kwenye damu na mapigo. Mikono yenye joto na bila rangi ya kucha hutoa kipimo kizuri.",
    ),
    width: 90,
    height: 80,
    controls: [
      choice(
        "subject",
        ["Finger", "Kidole"],
        [
          ["Warm, at rest", "Chenye joto, amepumzika"],
          ["After exercise", "Baada ya mazoezi"],
          ["Cold", "Baridi"],
          ["With nail polish", "Chenye rangi ya kucha"],
        ],
      ),
    ],
    analyse: ({ part, p }) => {
      const reliable = p("subject") <= 1;
      const spo2 = 97 + seeded(part.id, 1) * 2;
      const pulse = 70 + seeded(part.id, 2) * 8 + (p("subject") === 1 ? 45 : 0);
      return {
        visual: { spo2: reliable ? spo2 : 0, pulse: reliable ? pulse : 0 },
        readouts: reliable
          ? [
              readout(["SpO₂", "SpO₂"], `${Math.round(spo2)} %`),
              readout(["Pulse", "Mapigo"], `${Math.round(pulse)} bpm`),
            ]
          : [readout(["Display", "Onyesho"], "– –")],
        issues: !reliable
          ? [
              issue("signal", "warn", [
                "No steady signal. Warm the hand or remove nail polish.",
                "Hakuna ishara thabiti. Pasha mkono joto au ondoa rangi ya kucha.",
              ]),
            ]
          : [],
        measures: reliable
          ? [
              measure(
                "spo2",
                ["Oxygen saturation", "Kiwango cha oksijeni"],
                "%",
                spo2,
                0,
              ),
              measure("pulse", ["Pulse", "Mapigo"], "bpm", pulse, 0),
            ]
          : [],
      };
    },
  },
};
