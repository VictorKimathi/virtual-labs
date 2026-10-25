import type { Params } from "../../../workbench/workbench.types";
import type { BioAfterChange, BioPart, BioPartSpec } from "../../biology.types";
import { ROOM } from "../../engine/food";
import { note, overlaps, partByNum, setParams } from "../../engine/operations";
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
import { button, choice, hint, link, slider, toggle } from "./controls";
import { tubeSpec } from "./food";

type PhysiologyKind =
  | "beaker"
  | "electronic-balance"
  | "potometer"
  | "respirometer"
  | "bell-jar"
  | "visking-tubing"
  | "thistle-funnel"
  | "cork-borer"
  | "plant-tissue"
  | "hydrogencarbonate-indicator"
  | "limewater"
  | "klinostat"
  | "lamp"
  | "pondweed"
  | "photometer"
  | "spirometer";

const TAU = 180;

/** Distance moved when a rate changes from r0 to r1 at segment start, in rate × minutes. */
function rampDistance(r0: number, r1: number, seconds: number) {
  const minutes = Math.max(0, seconds) / 60;
  const tauMin = TAU / 60;
  return r1 * minutes + (r0 - r1) * tauMin * (1 - Math.exp(-minutes / tauMin));
}

const rampRate = (r0: number, r1: number, seconds: number) =>
  r1 + (r0 - r1) * Math.exp(-Math.max(0, seconds) / TAU);

/* ---------------------------------------------------------------- potometer */

export function potometerRate(p: Params) {
  if (p.cut !== 1) return 0;
  const leak = p.sealed === 1 ? 1 : 0.4;
  const light = 0.3 + 0.7 * ((p.light ?? 50) / 100);
  const wind = p.fan === 1 ? 1.8 : 1;
  const humid = p.bag === 1 ? 0.4 : 1;
  const warm = Math.pow(2, ((p.temp ?? 25) - 25) / 10);
  return 4 * leak * light * wind * humid * warm;
}

function potometerPosition(p: Params, time: number) {
  if (p.bubble !== 1) return 0;
  return Math.min(
    100,
    (p.basePos ?? 0) +
      rampDistance(p.prevRate ?? 0, potometerRate(p), time - (p.segStart ?? 0)),
  );
}

const potometerAfter: BioAfterChange = ({
  state,
  before,
  after,
  time,
  param,
}) => {
  if (param === "hint") return state;
  const r0 = rampRate(
    before.params.prevRate ?? 0,
    potometerRate(before.params),
    time - (before.params.segStart ?? 0),
  );
  return setParams(state, after, {
    basePos: potometerPosition(before.params, time),
    prevRate: r0,
    segStart: time,
  });
};

/* -------------------------------------------------------------- respirometer */

const organismRate = [0.08, 0.15, 0];

export function respirometerRate(p: Params) {
  const rate =
    (p.mass ?? 10) *
    organismRate[p.organism ?? 0] *
    Math.pow(2, ((p.temp ?? 25) - 25) / 10);
  return p.sodaLime === 1 ? rate : rate * 0.05;
}

function respirometerDrift(p: Params, time: number) {
  if (p.control === 1 || !p.closedAt) return 0;
  const settled = Math.exp(-Math.max(0, p.closedAt - (p.setupAt ?? 0)) / 300);
  return 4 * settled * (1 - Math.exp(-Math.max(0, time - p.closedAt) / 120));
}

function respirometerLevel(p: Params, time: number) {
  if (!p.closedAt) return 0;
  const start = Math.max(p.closedAt, p.zeroAt ?? 0);
  return Math.min(
    80,
    (respirometerRate(p) * (time - start)) / 60 +
      respirometerDrift(p, time) -
      respirometerDrift(p, start),
  );
}

/* ---------------------------------------------------------- plant tissue */

const isotonic = (part: BioPart) =>
  ((part.params.tissue ?? 0) === 0 ? 0.3 : 0.4) +
  (seeded(part.id, 23) - 0.5) * 0.06;
const sucrose = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];

export function tissueChange(part: BioPart, time: number) {
  if (!part.params.startedAt) return 0;
  const max = Math.max(
    -0.3,
    Math.min(0.25, 0.6 * (isotonic(part) - sucrose[part.params.conc ?? 0])),
  );
  return max * (1 - Math.exp(-(time - part.params.startedAt) / 1800));
}

export function tissueMass(part: BioPart, time: number) {
  const base = 2 * (0.97 + seeded(part.id, 5) * 0.06);
  const wet = part.params.startedAt && part.params.blot !== 1 ? 0.08 : 0;
  return part.params.cut ? base * (1 + tissueChange(part, time)) + wet : 0;
}

/* ---------------------------------------------------------------- pondweed */

const watts = [40, 60, 100];

export function lightAt(pondweed: BioPart, lamp: BioPart | undefined) {
  if (!lamp || lamp.params.on !== 1) return 2;
  const d = pondweed.params.distance ?? 20;
  return (watts[lamp.params.power ?? 2] * 100) / (d * d);
}

function waterTemperature(pondweed: BioPart, lamp: BioPart | undefined) {
  if (!lamp || lamp.params.on !== 1 || pondweed.params.shield === 1)
    return ROOM;
  return (
    ROOM +
    Math.min(
      18,
      (watts[lamp.params.power ?? 2] / 100) *
        15 *
        (100 / (pondweed.params.distance ?? 20) ** 2),
    )
  );
}

export function bubbleRate(pondweed: BioPart, lamp: BioPart | undefined) {
  const light = lightAt(pondweed, lamp);
  const temp = waterTemperature(pondweed, lamp);
  const warm =
    temp <= 30
      ? Math.pow(2, (temp - 25) / 10)
      : Math.max(0, 1.41 - (temp - 30) * 0.12);
  return (
    60 *
    (light / (light + 40)) *
    (pondweed.params.bicarb === 1 ? 1 : 0.5) *
    warm
  );
}

/* -------------------------------------------------------------- spirometer */

function addTrace(params: Params, values: number[]): Params {
  const count = params.sn ?? 0;
  const next: Params = { ...params };
  values.slice(0, Math.max(0, 400 - count)).forEach((value, index) => {
    next[`sx${count + index}`] = (count + index) * 0.5;
    next[`sy${count + index}`] = value;
  });
  next.sn = Math.min(400, count + values.length);
  return next;
}

function traceOf(params: Params) {
  const x: number[] = [];
  const y: number[] = [];
  for (let index = 0; index < (params.sn ?? 0); index++) {
    x.push(params[`sx${index}`] ?? 0);
    y.push(params[`sy${index}`] ?? 0);
  }
  return { x, y };
}

const tidalVolume = (part: BioPart) => 0.4 + seeded(part.id, 31) * 0.2;
const vitalCapacity = (part: BioPart) => 3.5 + seeded(part.id, 37) * 1.3;
const RESTING = 3;
const RESERVE = 1.2;

/* ------------------------------------------------------------------- parts */

export const physiologyParts: Record<PhysiologyKind, BioPartSpec> = {
  beaker: tubeSpec(
    "beaker",
    ["Beaker (250 mL)", "Bika (mL 250)"],
    [
      "For soaking seeds, holding water and mixing larger volumes.",
      "Kwa kuloweka mbegu, kushikilia maji na kuchanganya ujazo mkubwa.",
    ],
    120,
    140,
  ),
  "electronic-balance": {
    name: t("Electronic balance (0.01 g)", "Mizani ya kielektroniki (0.01 g)"),
    description: t(
      "Level it, close the draught shield and press Tare before weighing.",
      "Isawazishe, funga kinga ya upepo na ubonyeze Tare kabla ya kupima.",
    ),
    width: 180,
    height: 120,
    controls: [
      toggle(
        "level",
        ["Balance", "Mizani"],
        ["Levelled", "Imesawazishwa"],
        ["Not levelled", "Haijasawazishwa"],
      ),
      toggle(
        "door",
        ["Draught shield", "Kinga ya upepo"],
        ["Closed", "Imefungwa"],
        ["Open", "Iko wazi"],
      ),
      button(
        "tare",
        ["Tare (zero)", "Tare (sifuri)"],
        ({ state, part, time }) => {
          const load = state.parts
            .filter(
              (item) => item.kind === "plant-tissue" && overlaps(item, part),
            )
            .reduce((sum, item) => sum + tissueMass(item, time), 0);
          return setParams(state, part, { tare: load, zeroed: 1 });
        },
      ),
    ],
    state: { tare: 0, zeroed: 0 },
    analyse: ({ part, p, env }) => {
      const load = env.parts
        .filter((item) => item.kind === "plant-tissue" && overlaps(item, part))
        .reduce((sum, item) => sum + tissueMass(item, env.time), 0);
      const error =
        (p("zeroed") === 1 ? 0 : 0.03) +
        (p("level") === 1 ? 0 : 0.02) +
        (p("door") === 1
          ? 0
          : (seeded(part.id, Math.floor(env.time)) - 0.5) * 0.04);
      const shown = load - p("tare") + error;
      return {
        visual: { shown, level: p("level"), door: p("door") },
        readouts: [readout(["Display", "Onyesho"], `${fixed(shown, 2)} g`)],
        issues: [
          ...(p("level") === 0
            ? [
                issue("level", "warn", [
                  "Level the balance so the bubble is centred.",
                  "Sawazisha mizani ili kiputo kiwe katikati.",
                ]),
              ]
            : []),
          ...(p("door") === 0
            ? [
                issue("door", "warn", [
                  "Close the draught shield: air currents make the reading jump.",
                  "Funga kinga ya upepo: upepo hufanya kipimo kuruka.",
                ]),
              ]
            : []),
          ...(p("zeroed") === 0
            ? [
                issue("tare", "tip", [
                  "Press Tare with the pan empty first.",
                  "Bonyeza Tare sahani ikiwa tupu kwanza.",
                ]),
              ]
            : []),
        ],
        measures: [measure("mass", ["Mass", "Uzito"], "g", shown, 2)],
      };
    },
  },
  potometer: {
    name: t("Potometer", "Potomita"),
    description: t(
      "Measures water uptake by a leafy shoot. Cut and fit the shoot under water, seal the joints, let in one air bubble, then wait for it to move steadily.",
      "Hupima maji yanayofyonzwa na chipukizi lenye majani. Kata na uweke chipukizi chini ya maji, ziba viungo, ingiza kiputo kimoja, kisha subiri kisogee kwa kasi sawa.",
    ),
    width: 240,
    height: 170,
    controls: [
      toggle(
        "cut",
        ["Shoot cut and fitted", "Chipukizi limekatwa na kuwekwa"],
        ["Under water", "Chini ya maji"],
        ["In air", "Hewani"],
      ),
      toggle(
        "sealed",
        ["Joints", "Viungo"],
        ["Sealed with petroleum jelly", "Vimezibwa kwa mafuta"],
        ["Not sealed", "Havijazibwa"],
      ),
      button(
        "bubble",
        ["Let in one air bubble", "Ingiza kiputo kimoja cha hewa"],
        ({ state, part, time }) =>
          setParams(state, part, {
            bubble: 1,
            basePos: 0,
            prevRate: 0,
            segStart: time,
            bubbleAt: time,
          }),
      ),
      button(
        "reset",
        ["Reset the bubble with the reservoir", "Rudisha kiputo kwa hifadhi"],
        ({ state, part, time }) =>
          setParams(state, part, {
            basePos: 0,
            prevRate: rampRate(
              part.params.prevRate ?? 0,
              potometerRate(part.params),
              time - (part.params.segStart ?? 0),
            ),
            segStart: time,
            bubbleAt: time,
          }),
        (part) => part.params.bubble === 1,
      ),
      slider("light", ["Light intensity", "Mwangaza"], 0, 100, 10, 50, "%"),
      toggle(
        "fan",
        ["Fan (wind)", "Feni (upepo)"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
      ),
      toggle(
        "bag",
        ["Plastic bag over the shoot", "Mfuko wa plastiki juu ya chipukizi"],
        ["On (humid)", "Umewekwa (unyevu)"],
        ["Off", "Haujawekwa"],
      ),
      slider(
        "temp",
        ["Room temperature", "Joto la chumba"],
        15,
        35,
        1,
        25,
        "°C",
      ),
      hint,
    ],
    state: { bubble: 0, basePos: 0, prevRate: 0, segStart: 0, bubbleAt: 0 },
    afterChange: potometerAfter,
    analyse: ({ p, part, env }) => {
      const position = potometerPosition(part.params, env.time);
      const rate = rampRate(
        p("prevRate"),
        potometerRate(part.params),
        env.time - p("segStart"),
      );
      const settling = env.time - p("segStart") < 300 && p("bubble") === 1;
      return {
        visual: { position, bubble: p("bubble") },
        readouts: [
          ...(p("bubble") === 1
            ? [
                readout(
                  ["Time since reset", "Muda tangu kurudisha"],
                  formatSpan(env.time - p("bubbleAt")),
                ),
              ]
            : []),
          ...(p("hint") === 1
            ? [
                readout(
                  ["Bubble at", "Kiputo kiko"],
                  `${fixed(position, 1)} mm`,
                ),
                readout(["Rate now", "Kasi sasa"], `${fixed(rate, 2)} mm/min`),
              ]
            : []),
        ],
        issues: [
          ...(p("cut") === 0
            ? [
                issue("cut", "bad", [
                  "Cut and fit the shoot under water, or air blocks the xylem and nothing moves.",
                  "Kata na uweke chipukizi chini ya maji, la sivyo hewa huziba zailemu na hakuna kinachosogea.",
                ]),
              ]
            : []),
          ...(p("sealed") === 0
            ? [
                issue("seal", "warn", [
                  "Seal the joints with petroleum jelly so air cannot leak in.",
                  "Ziba viungo kwa mafuta ili hewa isiingie.",
                ]),
              ]
            : []),
          ...(p("bubble") === 0
            ? [
                issue("bubble", "tip", [
                  "Let in one air bubble to measure with.",
                  "Ingiza kiputo kimoja cha hewa cha kupimia.",
                ]),
              ]
            : []),
          ...(settling
            ? [
                issue("settle", "tip", [
                  "Wait about 5 minutes after any change for the rate to settle.",
                  "Subiri takriban dakika 5 baada ya mabadiliko yoyote ili kasi itulie.",
                ]),
              ]
            : []),
          ...(position >= 100
            ? [
                issue("end", "warn", [
                  "The bubble reached the end. Reset it with the reservoir.",
                  "Kiputo kimefika mwisho. Kirudishe kwa hifadhi.",
                ]),
              ]
            : []),
        ],
        tasks:
          p("bubble") === 1 && position > 1
            ? [
                task(
                  `pot-${fixed(position, 1)}`,
                  [
                    "Bubble position on the scale",
                    "Mahali pa kiputo kwenye kipimo",
                  ],
                  "mm",
                  position,
                  0.6,
                ),
              ]
            : [],
        measures:
          p("bubble") === 1
            ? [
                measure(
                  "time",
                  ["Time", "Muda"],
                  "min",
                  (env.time - p("bubbleAt")) / 60,
                  1,
                ),
                ...(p("hint") === 1
                  ? [
                      measure(
                        "position",
                        ["Bubble position", "Mahali pa kiputo"],
                        "mm",
                        position,
                        1,
                      ),
                    ]
                  : []),
              ]
            : [],
      };
    },
  },
  respirometer: {
    name: t("Respirometer", "Respiromita"),
    description: t(
      "Measures oxygen used by living things. Soda lime absorbs carbon dioxide. Let the temperature settle, use a control tube, then close the screw clip.",
      "Hupima oksijeni inayotumiwa na viumbe hai. Soda lime hufyonza kaboni dioksidi. Acha joto litulie, tumia mrija wa kulinganisha, kisha funga kibano.",
    ),
    width: 220,
    height: 150,
    controls: [
      choice(
        "organism",
        ["Organisms", "Viumbe"],
        [
          ["Germinating seeds", "Mbegu zinazoota"],
          ["Maggots", "Funza"],
          ["Boiled seeds (dead)", "Mbegu zilizochemshwa (zimekufa)"],
        ],
      ),
      slider(
        "mass",
        ["Mass of organisms", "Uzito wa viumbe"],
        1,
        20,
        1,
        10,
        "g",
      ),
      toggle(
        "sodaLime",
        ["Soda lime", "Soda lime"],
        ["In the tube", "Ndani ya mrija"],
        ["Missing", "Haipo"],
      ),
      toggle(
        "control",
        [
          "Control tube (glass beads)",
          "Mrija wa kulinganisha (shanga za kioo)",
        ],
        ["Connected", "Umeunganishwa"],
        ["None", "Hakuna"],
      ),
      slider(
        "temp",
        ["Water bath temperature", "Joto la bafu ya maji"],
        15,
        40,
        1,
        25,
        "°C",
      ),
      button(
        "close",
        ["Close the screw clip (start)", "Funga kibano (anza)"],
        ({ state, part, time }) =>
          setParams(state, part, { closedAt: time, zeroAt: time }),
        (part) => !part.params.closedAt,
      ),
      button(
        "zero",
        [
          "Set the fluid level with the syringe",
          "Weka kiwango cha kioevu kwa sirinji",
        ],
        ({ state, part, time }) => setParams(state, part, { zeroAt: time }),
        (part) => Boolean(part.params.closedAt),
      ),
      hint,
    ],
    state: { closedAt: 0, zeroAt: 0, setupAt: 0 },
    afterChange: ({ state, after, param, time }) =>
      param === "hint"
        ? state
        : setParams(state, after, { setupAt: time, closedAt: 0 }),
    analyse: ({ p, part, env }) => {
      const level = respirometerLevel(part.params, env.time);
      const equilibrated =
        p("closedAt") > 0 && p("closedAt") - p("setupAt") >= 600;
      return {
        visual: { level, closed: p("closedAt") > 0 ? 1 : 0 },
        readouts: [
          ...(p("closedAt") > 0
            ? [
                readout(
                  ["Time since zero", "Muda tangu sifuri"],
                  formatSpan(env.time - Math.max(p("closedAt"), p("zeroAt"))),
                ),
              ]
            : [
                readout(
                  ["Settling for", "Inatulia kwa"],
                  formatSpan(env.time - p("setupAt")),
                ),
              ]),
          ...(p("hint") === 1
            ? [
                readout(
                  ["Fluid moved", "Kioevu kimesogea"],
                  `${fixed(level, 1)} mm`,
                ),
              ]
            : []),
        ],
        issues: [
          ...(p("sodaLime") === 0
            ? [
                issue("soda", "warn", [
                  "Without soda lime, carbon dioxide replaces the oxygen used and the fluid hardly moves.",
                  "Bila soda lime, kaboni dioksidi huchukua nafasi ya oksijeni iliyotumika na kioevu hakisogei.",
                ]),
              ]
            : []),
          ...(p("control") === 0
            ? [
                issue("control", "warn", [
                  "Connect a control tube so temperature and pressure changes cancel out.",
                  "Unganisha mrija wa kulinganisha ili mabadiliko ya joto na shinikizo yafutane.",
                ]),
              ]
            : []),
          ...(p("closedAt") > 0 && !equilibrated
            ? [
                issue("settle", "warn", [
                  "You closed the clip too soon. Leave it 10 minutes for the temperature to settle.",
                  "Ulifunga kibano mapema mno. Acha dakika 10 joto litulie.",
                ]),
              ]
            : []),
          ...(p("closedAt") === 0
            ? [
                issue("start", "tip", [
                  "Let it stand 10 minutes in the water bath, then close the screw clip.",
                  "Acha isimame dakika 10 kwenye bafu ya maji, kisha funga kibano.",
                ]),
              ]
            : []),
        ],
        tasks:
          level > 1
            ? [
                task(
                  `resp-${fixed(level, 1)}`,
                  ["Distance the fluid moved", "Umbali kioevu kilisogea"],
                  "mm",
                  level,
                  0.6,
                ),
              ]
            : [],
        measures:
          p("closedAt") > 0
            ? [
                measure(
                  "time",
                  ["Time", "Muda"],
                  "min",
                  (env.time - Math.max(p("closedAt"), p("zeroAt"))) / 60,
                  1,
                ),
                measure("temp", ["Temperature", "Joto"], "°C", p("temp"), 0),
                ...(p("hint") === 1
                  ? [
                      measure(
                        "level",
                        ["Fluid moved", "Kioevu kimesogea"],
                        "mm",
                        level,
                        1,
                      ),
                    ]
                  : []),
              ]
            : [],
      };
    },
  },
  "bell-jar": {
    name: t("Bell jar lung model", "Kielelezo cha mapafu cha chupa kengele"),
    description: t(
      "Pull the rubber sheet down: the volume inside rises, the pressure falls and the balloons fill, like breathing in.",
      "Vuta karatasi ya mpira chini: ujazo ndani unaongezeka, shinikizo linashuka na puto zinajaa, kama kuvuta pumzi.",
    ),
    width: 160,
    height: 200,
    controls: [
      slider(
        "pull",
        [
          "Rubber sheet (diaphragm) pulled down",
          "Karatasi ya mpira (kiwambo) imevutwa chini",
        ],
        0,
        100,
        5,
        0,
        "%",
      ),
    ],
    analyse: ({ p }) => ({
      visual: { pull: p("pull") },
      readouts: [
        readout(
          ["Pressure inside", "Shinikizo ndani"],
          `${fixed(101.3 - p("pull") * 0.02, 2)} kPa`,
        ),
        readout(
          ["Balloons", "Puto"],
          p("pull") > 10 ? "inflating" : "deflated",
        ),
      ],
      observations: [
        p("pull") > 10
          ? t(
              "Air rushes into the balloons: this is breathing in.",
              "Hewa inaingia kwa kasi kwenye puto: huku ni kuvuta pumzi.",
            )
          : t(
              "The balloons are small: this is like breathing out.",
              "Puto ni ndogo: hii ni kama kutoa pumzi.",
            ),
      ],
    }),
  },
  "visking-tubing": {
    name: t("Visking tubing", "Mrija wa Visking"),
    description: t(
      "A partly permeable membrane: small molecules like glucose pass through, starch does not.",
      "Utando unaopitisha baadhi ya vitu: molekuli ndogo kama glukosi hupita, wanga haupiti.",
    ),
    width: 130,
    height: 160,
    controls: [
      choice(
        "inside",
        ["Filled with", "Imejazwa"],
        [
          ["Starch and glucose solution", "Myeyusho wa wanga na glukosi"],
          ["Starch solution only", "Myeyusho wa wanga tu"],
          ["Glucose solution only", "Myeyusho wa glukosi tu"],
        ],
      ),
      toggle(
        "iodine",
        ["Water in the beaker", "Maji kwenye bika"],
        ["With iodine added", "Yameongezwa iodini"],
        ["Plain water", "Maji tupu"],
      ),
      button(
        "start",
        ["Put it in a beaker of water", "Iweke kwenye bika la maji"],
        ({ state, part, time }) => setParams(state, part, { startedAt: time }),
      ),
      button(
        "benedict",
        [
          "Test the water outside with Benedict's",
          "Pima maji ya nje kwa Benedict",
        ],
        ({ state, part, time }) => {
          const out =
            part.params.startedAt && (part.params.inside ?? 0) !== 1
              ? 1 - Math.exp(-(time - part.params.startedAt) / 1500)
              : 0;
          return note(
            state,
            part,
            out > 0.15
              ? t(
                  "After boiling: orange-red. Glucose has passed out through the membrane.",
                  "Baada ya kuchemsha: machungwa-nyekundu. Glukosi imepita nje kupitia utando.",
                )
              : t(
                  "After boiling: still blue. No glucose outside yet.",
                  "Baada ya kuchemsha: bado buluu. Hakuna glukosi nje bado.",
                ),
          );
        },
        (part) => Boolean(part.params.startedAt),
      ),
      button(
        "iodineTest",
        ["Test the water outside with iodine", "Pima maji ya nje kwa iodini"],
        ({ state, part }) =>
          note(
            state,
            part,
            t(
              "Yellow-brown: starch molecules are too big to pass through.",
              "Njano-kahawia: molekuli za wanga ni kubwa mno kupita.",
            ),
          ),
        (part) => Boolean(part.params.startedAt),
      ),
    ],
    state: { startedAt: 0 },
    analyse: ({ p, part, env }) => {
      const started = p("startedAt") > 0;
      const spread = started
        ? 1 - Math.exp(-(env.time - p("startedAt")) / 1500)
        : 0;
      const starchInside = p("inside") !== 2;
      const blackInside =
        started && p("iodine") === 1 && starchInside && spread > 0.1;
      return {
        visual: {
          spread,
          black: blackInside ? 1 : 0,
          started: started ? 1 : 0,
        },
        readouts: started
          ? [
              readout(
                ["Time in water", "Muda kwenye maji"],
                formatSpan(env.time - p("startedAt")),
              ),
            ]
          : [],
        observations: [
          ...part.contents.notes,
          ...(blackInside
            ? [
                t(
                  "The inside of the tubing has turned blue-black: iodine passed in and met the starch.",
                  "Ndani ya mrija kumekuwa buluu-nyeusi: iodini imeingia na kukutana na wanga.",
                ),
              ]
            : []),
        ],
        issues: !env.has("beaker")
          ? [
              issue("beaker", "tip", [
                "Add a beaker of water to stand the tubing in.",
                "Ongeza bika la maji la kusimamisha mrija.",
              ]),
            ]
          : [],
      };
    },
  },
  "thistle-funnel": {
    name: t("Thistle funnel osmometer", "Osmomita ya faneli ya mbigili"),
    description: t(
      "Sucrose solution inside, sealed with Visking membrane, standing in water. Water enters by osmosis and the level rises.",
      "Myeyusho wa sukrosi ndani, umezibwa kwa utando wa Visking, umesimama kwenye maji. Maji huingia kwa osmosisi na kiwango kinapanda.",
    ),
    width: 90,
    height: 220,
    controls: [
      choice(
        "conc",
        ["Sucrose inside", "Sukrosi ndani"],
        [
          ["0.5 M", "0.5 M"],
          ["1.0 M", "1.0 M"],
          ["2.0 M", "2.0 M"],
        ],
        1,
      ),
      toggle(
        "tied",
        ["Membrane", "Utando"],
        ["Tied on tightly", "Umefungwa vizuri"],
        ["Loose", "Umelegea"],
      ),
      button(
        "start",
        ["Stand it in water (start)", "Isimamishe kwenye maji (anza)"],
        ({ state, part, time }) => setParams(state, part, { startedAt: time }),
      ),
      hint,
    ],
    state: { startedAt: 0 },
    analyse: ({ p, env }) => {
      const conc = [0.5, 1, 2][p("conc")] ?? 1;
      const height =
        p("startedAt") > 0
          ? 40 *
            conc *
            (p("tied") === 1 ? 1 : 0.3) *
            (1 - Math.exp(-(env.time - p("startedAt")) / 1800))
          : 0;
      return {
        visual: { height },
        readouts:
          p("hint") === 1
            ? [readout(["Rise", "Kupanda"], `${fixed(height, 1)} mm`)]
            : [],
        issues:
          p("tied") === 0
            ? [
                issue("tie", "warn", [
                  "Tie the membrane on tightly, or the solution leaks out.",
                  "Funga utando vizuri, la sivyo myeyusho utavuja.",
                ]),
              ]
            : [],
        tasks:
          height > 1
            ? [
                task(
                  `thistle-${fixed(height, 0)}`,
                  ["Rise in the level", "Kupanda kwa kiwango"],
                  "mm",
                  height,
                  1,
                ),
              ]
            : [],
        measures:
          p("startedAt") > 0
            ? [
                measure(
                  "time",
                  ["Time", "Muda"],
                  "min",
                  (env.time - p("startedAt")) / 60,
                  0,
                ),
              ]
            : [],
      };
    },
  },
  "cork-borer": {
    name: t("Cork borer", "Kitobolea"),
    description: t(
      "Cuts cylinders of plant tissue that are all the same width.",
      "Hukata silinda za tishu za mmea zenye upana sawa.",
    ),
    width: 130,
    height: 30,
  },
  "plant-tissue": {
    name: t("Potato or carrot cylinder", "Silinda ya kiazi au karoti"),
    description: t(
      "Cut with a cork borer, weigh, leave in sucrose solution, then blot dry and weigh again.",
      "Kata kwa kitobolea, pima, acha kwenye myeyusho wa sukrosi, kisha kausha kwa karatasi na upime tena.",
    ),
    width: 90,
    height: 50,
    controls: [
      choice(
        "tissue",
        ["Tissue", "Tishu"],
        [
          ["Potato", "Kiazi"],
          ["Carrot", "Karoti"],
        ],
      ),
      choice(
        "conc",
        ["Sucrose solution", "Myeyusho wa sukrosi"],
        sucrose.map((value): [string, string] => [
          `${value.toFixed(1)} M`,
          `${value.toFixed(1)} M`,
        ]),
      ),
      button("cut", ["Cut a cylinder", "Kata silinda"], ({ state, part }) =>
        state.parts.some((item) => item.kind === "cork-borer")
          ? setParams(state, part, { cut: 1, startedAt: 0 })
          : note(
              setParams(state, part, { cut: 2, startedAt: 0 }),
              part,
              t(
                "Cut with a knife: the pieces are uneven, so results cannot be compared fairly. Use a cork borer.",
                "Imekatwa kwa kisu: vipande havilingani, kwa hiyo matokeo hayawezi kulinganishwa kwa haki. Tumia kitobolea.",
              ),
            ),
      ),
      button(
        "start",
        ["Put it in the sucrose solution", "Iweke kwenye myeyusho wa sukrosi"],
        ({ state, part, time }) => setParams(state, part, { startedAt: time }),
        (part) => (part.params.cut ?? 0) > 0,
      ),
      toggle(
        "blot",
        ["Before weighing", "Kabla ya kupima"],
        ["Blotted dry", "Imekaushwa"],
        ["Still wet", "Bado ina maji"],
      ),
      hint,
    ],
    state: { cut: 0, startedAt: 0 },
    analyse: ({ p, part, env }) => {
      const change = tissueChange(part, env.time);
      const started = p("startedAt") > 0;
      const initial = 2 * (0.97 + seeded(part.id, 5) * 0.06);
      return {
        visual: { change, cut: p("cut"), tissue: p("tissue") },
        observations: part.contents.notes,
        readouts: [
          ...(p("cut") > 0
            ? [
                readout(
                  ["Mass at the start", "Uzito mwanzoni"],
                  `${fixed(initial, 2)} g`,
                ),
              ]
            : []),
          ...(started
            ? [
                readout(
                  ["Time in solution", "Muda kwenye myeyusho"],
                  formatSpan(env.time - p("startedAt")),
                ),
              ]
            : []),
          ...(p("hint") === 1 && started
            ? [
                readout(
                  ["Change in mass", "Mabadiliko ya uzito"],
                  `${fixed(change * 100, 1)} %`,
                ),
              ]
            : []),
        ],
        issues: [
          ...(p("cut") === 2
            ? [
                issue("uneven", "warn", [
                  "The cylinders are uneven. Use a cork borer.",
                  "Silinda hazilingani. Tumia kitobolea.",
                ]),
              ]
            : []),
          ...(started && p("blot") === 0
            ? [
                issue("blot", "tip", [
                  "Blot it dry before weighing, or surface water adds to the mass.",
                  "Ikaushe kabla ya kupima, la sivyo maji ya juu huongeza uzito.",
                ]),
              ]
            : []),
          ...(started && env.time - p("startedAt") < 1800
            ? [
                issue("wait", "tip", [
                  "Leave it at least 30 minutes so it can reach balance.",
                  "Iache angalau dakika 30 ifikie usawa.",
                ]),
              ]
            : []),
        ],
        tasks:
          started && env.time - p("startedAt") >= 1800
            ? [
                task(
                  `osm-${part.id}-${p("conc")}`,
                  [
                    "Percentage change in mass",
                    "Asilimia ya mabadiliko ya uzito",
                  ],
                  "%",
                  change * 100,
                  1,
                ),
              ]
            : [],
        measures: [
          measure(
            "conc",
            ["Sucrose concentration", "Mkusanyiko wa sukrosi"],
            "M",
            sucrose[p("conc")] ?? 0,
            1,
          ),
        ],
      };
    },
  },
  "hydrogencarbonate-indicator": {
    name: t(
      "Hydrogencarbonate indicator tubes",
      "Mirija ya kiashiria cha haidrojenikaboneti",
    ),
    description: t(
      "Red in normal air. Turns yellow with more carbon dioxide, purple with less.",
      "Nyekundu kwenye hewa ya kawaida. Hugeuka njano na kaboni dioksidi zaidi, zambarau na kidogo.",
    ),
    width: 120,
    height: 150,
    controls: [
      choice(
        "organism",
        ["In the tube", "Ndani ya mrija"],
        [
          ["Nothing (control)", "Hakuna (kulinganisha)"],
          ["Leaf, in the light", "Jani, kwenye mwanga"],
          ["Leaf, covered with foil", "Jani, limefunikwa kwa karatasi ya bati"],
          ["Snail", "Konokono"],
        ],
      ),
      button(
        "start",
        ["Seal the tube (start)", "Funga mrija (anza)"],
        ({ state, part, time }) => setParams(state, part, { startedAt: time }),
      ),
    ],
    state: { startedAt: 0 },
    afterChange: ({ state, after, param }) =>
      param === "organism" ? setParams(state, after, { startedAt: 0 }) : state,
    analyse: ({ p, env }) => {
      const progress =
        p("startedAt") > 0
          ? 1 - Math.exp(-(env.time - p("startedAt")) / 1800)
          : 0;
      const direction = [0, -1, 1, 1][p("organism")] ?? 0;
      const shift = direction * progress;
      return {
        visual: { shift },
        observations: [
          shift < -0.4
            ? t(
                "Purple: photosynthesis took in more carbon dioxide than respiration gave out.",
                "Zambarau: usanisinuru ulichukua kaboni dioksidi zaidi kuliko upumuaji ulivyotoa.",
              )
            : shift > 0.4
              ? t(
                  "Yellow: respiration added carbon dioxide.",
                  "Njano: upumuaji uliongeza kaboni dioksidi.",
                )
              : t("Red: no change yet.", "Nyekundu: hakuna mabadiliko bado."),
        ],
        readouts:
          p("startedAt") > 0
            ? [readout(["Time", "Muda"], formatSpan(env.time - p("startedAt")))]
            : [],
      };
    },
  },
  limewater: {
    name: t(
      "Limewater tubes (inhaled and exhaled air)",
      "Mirija ya maji ya chokaa (hewa ya kuvuta na kutoa)",
    ),
    description: t(
      "Breathe in through tube A and out through tube B. Exhaled air turns limewater milky much faster.",
      "Vuta pumzi kupitia mrija A na utoe kupitia mrija B. Hewa inayotolewa hugeuza maji ya chokaa kuwa meupe haraka zaidi.",
    ),
    width: 160,
    height: 150,
    controls: [
      button(
        "in",
        ["Breathe in (air passes through A)", "Vuta pumzi (hewa inapita A)"],
        ({ state, part }) =>
          setParams(state, part, { a: (part.params.a ?? 0) + 1 }),
      ),
      button(
        "out",
        ["Breathe out (through B)", "Toa pumzi (kupitia B)"],
        ({ state, part }) =>
          setParams(state, part, { b: (part.params.b ?? 0) + 1 }),
      ),
      button(
        "reset",
        ["Fresh limewater", "Maji mapya ya chokaa"],
        ({ state, part }) => setParams(state, part, { a: 0, b: 0 }),
      ),
    ],
    state: { a: 0, b: 0 },
    analyse: ({ p }) => ({
      visual: { a: Math.min(1, p("a") / 40), b: Math.min(1, p("b") / 4) },
      readouts: [
        readout(["Breaths in (A)", "Pumzi za kuvuta (A)"], String(p("a"))),
        readout(["Breaths out (B)", "Pumzi za kutoa (B)"], String(p("b"))),
      ],
      observations:
        p("b") >= 3
          ? [
              t(
                "Tube B is milky: exhaled air has much more carbon dioxide.",
                "Mrija B ni mweupe: hewa inayotolewa ina kaboni dioksidi nyingi zaidi.",
              ),
            ]
          : [],
    }),
  },
  klinostat: {
    name: t("Klinostat", "Klinostati"),
    description: t(
      "Slowly turns a seedling so gravity acts equally on all sides. Compare with one that does not turn.",
      "Huzungusha mche polepole ili mvuto ufanye kazi sawa pande zote. Linganisha na usiozunguka.",
    ),
    width: 170,
    height: 150,
    controls: [
      toggle(
        "rotating",
        ["Motor", "Mota"],
        ["Turning", "Inazunguka"],
        ["Stopped", "Imesimama"],
      ),
      choice(
        "light",
        ["Light", "Mwanga"],
        [
          ["Dark", "Giza"],
          ["From one side", "Kutoka upande mmoja"],
        ],
      ),
      button(
        "start",
        ["Pin a seedling on its side (start)", "Bandika mche kwa ubavu (anza)"],
        ({ state, part, time }) => setParams(state, part, { startedAt: time }),
      ),
    ],
    state: { startedAt: 0 },
    analyse: ({ p, env }) => {
      const days = p("startedAt") > 0 ? (env.time - p("startedAt")) / 86400 : 0;
      const bend = (1 - Math.exp(-days / 0.8)) * 80;
      const root = p("rotating") === 1 ? 0 : bend;
      const shoot =
        p("rotating") === 1 ? (p("light") === 1 ? bend * 0.6 : 0) : bend;
      return {
        visual: {
          root,
          shoot,
          length: Math.min(60, days * 12),
          started: p("startedAt") > 0 ? 1 : 0,
        },
        readouts:
          p("startedAt") > 0
            ? [readout(["Time", "Muda"], formatSpan(env.time - p("startedAt")))]
            : [],
        observations:
          days > 0.5
            ? [
                p("rotating") === 1
                  ? t(
                      "The root grows straight: gravity acts on all sides equally.",
                      "Mzizi unakua moja kwa moja: mvuto unafanya kazi pande zote sawa.",
                    )
                  : t(
                      "The root has curved down and the shoot up: geotropism.",
                      "Mzizi umepinda chini na chipukizi juu: jiotropizimu.",
                    ),
              ]
            : [],
      };
    },
  },
  lamp: {
    name: t("Bench lamp", "Taa ya benchi"),
    description: t(
      "A light source for photosynthesis experiments. It also gives off heat.",
      "Chanzo cha mwanga kwa majaribio ya usanisinuru. Pia hutoa joto.",
    ),
    width: 90,
    height: 140,
    controls: [
      toggle("on", ["Lamp", "Taa"], ["On", "Imewashwa"], ["Off", "Imezimwa"]),
      choice(
        "power",
        ["Bulb", "Balbu"],
        [
          ["40 W", "40 W"],
          ["60 W", "60 W"],
          ["100 W", "100 W"],
        ],
        2,
      ),
    ],
    analyse: ({ p }) => ({ visual: { on: p("on") } }),
  },
  pondweed: {
    name: t(
      "Pondweed (Elodea) in a tube",
      "Gugu la maji (Elodea) ndani ya mrija",
    ),
    description: t(
      "Count the oxygen bubbles per minute at different lamp distances. Wait for the rate to settle after each change.",
      "Hesabu viputo vya oksijeni kwa dakika kwa umbali tofauti wa taa. Subiri kasi itulie baada ya kila badiliko.",
    ),
    width: 120,
    height: 170,
    controls: [
      link(
        "lamp",
        ["Lamp", "Taa"],
        ["Daylight only", "Mwanga wa mchana tu"],
        (candidate) => candidate.kind === "lamp",
      ),
      slider(
        "distance",
        ["Lamp distance", "Umbali wa taa"],
        5,
        50,
        1,
        20,
        "cm",
      ),
      toggle(
        "bicarb",
        ["Sodium hydrogen carbonate", "Sodiamu haidrojeni kaboneti"],
        ["Added (extra CO₂)", "Imeongezwa (CO₂ zaidi)"],
        ["None", "Hakuna"],
      ),
      toggle(
        "shield",
        ["Heat shield (water tank)", "Kinga ya joto (tanki la maji)"],
        ["In place", "Imewekwa"],
        ["None", "Hakuna"],
      ),
      button(
        "count",
        ["Count bubbles for 1 minute", "Hesabu viputo kwa dakika 1"],
        ({ state, part, time }) => {
          const lamp = partByNum(state, part.params.lamp ?? 0);
          const rate = rampRate(
            part.params.prevRate ?? 0,
            bubbleRate(part, lamp),
            time - (part.params.changedAt ?? 0),
          );
          const count = Math.max(
            0,
            Math.round(rate + (seeded(part.id, Math.floor(time)) - 0.5) * 4),
          );
          return setParams(state, part, { lastCount: count, counted: 1 });
        },
      ),
    ],
    state: { prevRate: 0, changedAt: 0, lastCount: 0, counted: 0 },
    afterChange: ({ state, before, after, time }) => {
      const lampBefore = partByNum(state, before.params.lamp ?? 0);
      const current = rampRate(
        before.params.prevRate ?? 0,
        bubbleRate(before, lampBefore),
        time - (before.params.changedAt ?? 0),
      );
      return setParams(state, after, { prevRate: current, changedAt: time });
    },
    analyse: ({ p, part, env }) => {
      const lamp = env.part(p("lamp"));
      const rate = rampRate(
        p("prevRate"),
        bubbleRate(part, lamp),
        env.time - p("changedAt"),
      );
      const temp = waterTemperature(part, lamp);
      const intensity = 10000 / p("distance") ** 2;
      return {
        visual: { rate, lit: lamp?.params.on === 1 ? 1 : 0 },
        readouts: [
          readout(
            ["Water temperature", "Joto la maji"],
            `${fixed(temp, 1)} °C`,
            temp > 30 ? "warn" : undefined,
          ),
          ...(p("counted") === 1
            ? [
                readout(
                  ["Last count", "Hesabu ya mwisho"],
                  `${p("lastCount")} bubbles/min`,
                ),
              ]
            : []),
        ],
        issues: [
          ...(env.time - p("changedAt") < 300
            ? [
                issue("settle", "tip", [
                  "Wait 5 minutes after changing the distance before counting.",
                  "Subiri dakika 5 baada ya kubadilisha umbali kabla ya kuhesabu.",
                ]),
              ]
            : []),
          ...(p("shield") === 0 && temp > 26
            ? [
                issue("heat", "warn", [
                  "The lamp is heating the water: temperature is changing as well as light. Use a heat shield.",
                  "Taa inapasha maji: joto linabadilika pamoja na mwanga. Tumia kinga ya joto.",
                ]),
              ]
            : []),
          ...(!lamp
            ? [
                issue("lamp", "tip", [
                  "Link a lamp to control the light.",
                  "Unganisha taa kudhibiti mwanga.",
                ]),
              ]
            : []),
        ],
        measures: [
          measure(
            "distance",
            ["Lamp distance", "Umbali wa taa"],
            "cm",
            p("distance"),
            0,
          ),
          measure(
            "intensity",
            ["Light intensity (1/d² × 10⁴)", "Mwangaza (1/d² × 10⁴)"],
            "",
            intensity,
            1,
          ),
          ...(p("counted") === 1
            ? [
                measure(
                  "bubbles",
                  ["Bubbles per minute", "Viputo kwa dakika"],
                  "/min",
                  p("lastCount"),
                  0,
                ),
              ]
            : []),
        ],
      };
    },
  },
  photometer: {
    name: t("Photometer (light meter)", "Fotomita (kipima mwanga)"),
    description: t(
      "Measures the light reaching the pondweed.",
      "Hupima mwanga unaofika kwenye gugu la maji.",
    ),
    width: 100,
    height: 120,
    controls: [
      link(
        "at",
        ["Placed at", "Imewekwa kwenye"],
        ["Bench", "Benchi"],
        (candidate) => candidate.kind === "pondweed",
      ),
    ],
    analyse: ({ p, env }) => {
      const target = env.part(p("at"));
      const lux = target
        ? lightAt(target, env.part(target.params.lamp ?? 0)) * 40
        : 300;
      return {
        visual: { lux },
        readouts: [readout(["Light", "Mwanga"], `${fixed(lux, 0)} lux`)],
        measures: [measure("lux", ["Light", "Mwanga"], "lux", lux, 0)],
      };
    },
  },
  spirometer: {
    name: t("Spirometer", "Spiromita"),
    description: t(
      "Records lung volumes. Breathe normally to see tidal volume, then breathe in fully and out fully for vital capacity.",
      "Hurekodi ujazo wa mapafu. Pumua kawaida uone ujazo wa kawaida, kisha vuta kabisa na utoe kabisa kwa uwezo wa mapafu.",
    ),
    width: 200,
    height: 150,
    controls: [
      toggle(
        "sodaLime",
        ["Soda lime", "Soda lime"],
        ["Fresh", "Mpya"],
        ["Used up", "Imeisha"],
        1,
      ),
      button(
        "normal",
        ["Breathe normally for 30 s", "Pumua kawaida kwa sekunde 30"],
        ({ state, part }) => {
          const tv = tidalVolume(part);
          const values = Array.from(
            { length: 60 },
            (_, index) =>
              RESTING + (tv / 2) * Math.sin((2 * Math.PI * index * 0.5) / 4),
          );
          return setParams(state, part, {
            ...addTrace(part.params, values),
            normalDone: 1,
          });
        },
      ),
      button(
        "deep",
        ["Breathe in fully, then out fully", "Vuta kabisa, kisha toa kabisa"],
        ({ state, part }) => {
          const vc = vitalCapacity(part);
          const top = RESTING - RESERVE + vc;
          const values = [
            ...Array.from(
              { length: 8 },
              (_, index) => RESTING + ((top - RESTING) * index) / 7,
            ),
            ...Array.from(
              { length: 10 },
              (_, index) => top - ((top - (RESTING - RESERVE)) * index) / 9,
            ),
            ...Array.from({ length: 4 }, () => RESTING),
          ];
          return setParams(state, part, {
            ...addTrace(part.params, values),
            deepDone: 1,
          });
        },
      ),
      button("clear", ["Clear the trace", "Futa mchoro"], ({ state, part }) =>
        setParams(state, part, { sn: 0, normalDone: 0, deepDone: 0 }),
      ),
    ],
    state: { sn: 0, normalDone: 0, deepDone: 0 },
    analyse: ({ p, part }) => {
      const trace = traceOf(part.params);
      return {
        visual: { points: trace.x.length },
        plot:
          trace.x.length > 1
            ? {
                title: t("Spirometer trace", "Mchoro wa spiromita"),
                xLabel: "t / s",
                yLabel: "V / L",
                series: [trace],
              }
            : undefined,
        issues:
          p("sodaLime") === 0
            ? [
                issue("soda", "warn", [
                  "The soda lime is used up, so carbon dioxide builds up. Replace it before breathing for long.",
                  "Soda lime imeisha, kwa hiyo kaboni dioksidi inaongezeka. Ibadilishe kabla ya kupumua kwa muda mrefu.",
                ]),
              ]
            : [],
        tasks: [
          ...(p("normalDone") === 1
            ? [
                task(
                  `tv-${part.id}`,
                  ["Tidal volume", "Ujazo wa kawaida wa pumzi"],
                  "L",
                  tidalVolume(part),
                  0.05,
                ),
              ]
            : []),
          ...(p("deepDone") === 1
            ? [
                task(
                  `vc-${part.id}`,
                  ["Vital capacity", "Uwezo wa mapafu"],
                  "L",
                  vitalCapacity(part),
                  0.1,
                ),
              ]
            : []),
        ],
      };
    },
  },
};
