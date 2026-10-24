import type { PartSpec } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  G,
  button,
  choice,
  clamp,
  fixed,
  issue,
  measure,
  pick,
  readout,
  slider,
  t,
  task,
  toggle,
} from "./helpers";

type MeasurementKind = (typeof sectionKinds.measurement)[number];

type Specimen = { name: [string, string]; value: number };

const lengthSpecimens: Specimen[] = [
  { name: ["Pencil", "Penseli"], value: 147.5 },
  { name: ["Exercise book width", "Upana wa daftari"], value: 203 },
  { name: ["Wooden block", "Kipande cha mbao"], value: 62.5 },
  { name: ["Iron nail", "Msumari"], value: 76 },
];

const hintToggle = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

function ruler(capacity: number, extra: Specimen[] = []): Partial<PartSpec> {
  const list = [...lengthSpecimens, ...extra];
  return {
    controls: [
      choice(
        "specimen",
        ["Object to measure", "Kitu cha kupima"],
        list.map((item) => item.name),
      ),
      choice(
        "align",
        ["Place the object at", "Weka kitu kwenye"],
        [
          ["The 0 mm end", "Mwisho wa 0 mm"],
          ["The 10 mm mark", "Alama ya 10 mm"],
        ],
      ),
      slider("eye", ["Eye position", "Mahali pa jicho"], -40, 40, 1, 0, "°"),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const length = list[Math.min(p("specimen"), list.length - 1)].value;
      const start = p("align") === 1 ? 10 : 0;
      const shift = 2 * Math.tan((p("eye") * Math.PI) / 180);
      const seen = start + length + shift;
      const tilted = Math.abs(p("eye")) > 6;
      return {
        visual: { capacity, start, end: start + length, seen, ruler: 1 },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Start mark", "Alama ya mwanzo"],
                  `${fixed(start, 1)} mm`,
                ),
                readout(
                  ["End mark as seen", "Alama ya mwisho kama inavyoonekana"],
                  `${fixed(seen, 1)} mm`,
                  tilted ? "warn" : undefined,
                ),
              ]
            : [],
        issues: [
          ...(tilted
            ? [
                issue("parallax", "warn", [
                  "Parallax: your eye is not directly above the mark, so the reading is shifted.",
                  "Mchepuko: jicho lako haliko moja kwa moja juu ya alama, kwa hiyo kipimo kimehama.",
                ]),
              ]
            : []),
          ...(start > 0
            ? [
                issue("start", "tip", [
                  "Starting at 10 mm avoids a worn end. Subtract the start reading from the end reading.",
                  "Kuanzia 10 mm kunaepuka ncha iliyochakaa. Toa kipimo cha mwanzo kwenye cha mwisho.",
                ]),
              ]
            : []),
        ],
        tasks: [
          task(
            `length-${p("specimen")}-${p("align")}`,
            ["Length of the object", "Urefu wa kitu"],
            "mm",
            length,
            0.6,
            [
              "Length = end reading − start reading.",
              "Urefu = kipimo cha mwisho − kipimo cha mwanzo.",
            ],
          ),
        ],
        measures:
          p("hint") === 1
            ? [measure("length", ["Length", "Urefu"], "mm", seen - start, 1)]
            : [],
      };
    },
  };
}

const zeroErrors = [0.2, 0.1, -0.1, 0.3, 0.1, -0.2];
const microZeroErrors = [0.02, -0.03, 0.01, 0.03, -0.02, 0.02];

const vernierSpecimens: Specimen[] = [
  { name: ["Steel ball", "Mpira wa chuma"], value: 12.4 },
  { name: ["Pipe, outside", "Bomba, nje"], value: 21.7 },
  { name: ["Coin", "Sarafu"], value: 25.3 },
  { name: ["Test tube", "Mrija wa majaribio"], value: 16.8 },
];

const micrometerSpecimens: Specimen[] = [
  { name: ["Copper wire", "Waya wa shaba"], value: 0.71 },
  { name: ["Metal sheet", "Karatasi ya chuma"], value: 1.24 },
  { name: ["Ball bearing", "Mpira wa fani"], value: 6.35 },
  { name: ["Glass slide", "Slaidi ya kioo"], value: 1.06 },
];

const cylinderEye = slider(
  "eye",
  ["Eye height above the meniscus", "Urefu wa jicho juu ya uso wa kioevu"],
  -30,
  30,
  1,
  18,
  "mm",
);

const eurekaObjects = [
  { name: ["Stone", "Jiwe"] as [string, string], volume: 18, displaced: 18 },
  {
    name: ["Steel ball", "Mpira wa chuma"] as [string, string],
    volume: 8,
    displaced: 8,
  },
  {
    name: ["Brass cylinder", "Silinda ya shaba"] as [string, string],
    volume: 31,
    displaced: 31,
  },
  {
    name: ["Cork (floats)", "Kizibo (huelea)"] as [string, string],
    volume: 14,
    displaced: 6,
  },
];

const balanceSpecimens = [
  { name: ["Empty pan", "Sahani tupu"] as [string, string], mass: 0 },
  { name: ["Stone", "Jiwe"] as [string, string], mass: 87.4 },
  {
    name: ["Brass block", "Kipande cha shaba"] as [string, string],
    mass: 152.8,
  },
  {
    name: ["Wooden block", "Kipande cha mbao"] as [string, string],
    mass: 41.2,
  },
];

const heavySpecimens = [
  { name: ["Empty pan", "Sahani tupu"] as [string, string], mass: 0 },
  {
    name: ["Iron cylinder", "Silinda ya chuma"] as [string, string],
    mass: 264.3,
  },
  {
    name: ["Brass block", "Kipande cha shaba"] as [string, string],
    mass: 152.8,
  },
  {
    name: ["Rock sample", "Sampuli ya mwamba"] as [string, string],
    mass: 478.6,
  },
];

const liquids = [
  { name: ["Water", "Maji"] as [string, string], density: 1 },
  { name: ["Ethanol", "Spiriti"] as [string, string], density: 0.79 },
  { name: ["Glycerine", "Glisarini"] as [string, string], density: 1.26 },
  { name: ["Brine", "Maji ya chumvi"] as [string, string], density: 1.18 },
];

const clockEvents = [
  {
    name: ["Ball rolls down a ramp", "Mpira unashuka mteremko"] as [
      string,
      string,
    ],
    seconds: 1.9,
  },
  {
    name: ["Trolley down a runway", "Toroli kwenye njia"] as [string, string],
    seconds: 4.2,
  },
  {
    name: ["Runner over 50 m", "Mkimbiaji mita 50"] as [string, string],
    seconds: 7.5,
  },
];

export function formatClock(milliseconds: number) {
  const total = Math.max(0, milliseconds) / 1000;
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, "0")}:${(total - minutes * 60).toFixed(2).padStart(5, "0")}`;
}

function balanceTilt(imbalance: number) {
  return clamp(imbalance * 5, -12, 12);
}

export const measurementParts: Record<MeasurementKind, PartSpec> = {
  "metre-rule": {
    name: t("Metre rule", "Rula ya mita"),
    description: t(
      "1 m long, marked in millimetres. Read with your eye directly above the mark.",
      "Urefu wa mita 1, ina alama za milimita. Soma jicho likiwa juu ya alama.",
    ),
    width: 660,
    height: 70,
    ...ruler(1000, [
      { name: ["Bench strip", "Kipande cha benchi"], value: 410.5 },
    ]),
  },
  "half-metre-rule": {
    name: t("Half-metre rule", "Rula ya nusu mita"),
    description: t(
      "50 cm long, marked in millimetres.",
      "Urefu wa sentimita 50, ina alama za milimita.",
    ),
    width: 480,
    height: 70,
    ...ruler(500, [{ name: ["Pen refill", "Wino wa kalamu"], value: 112 }]),
  },
  "ruler-30": {
    name: t("30 cm ruler", "Rula ya sentimita 30"),
    description: t(
      "A school ruler marked in millimetres.",
      "Rula ya shule yenye alama za milimita.",
    ),
    width: 480,
    height: 70,
    ...ruler(300),
  },
  "tape-measure": {
    name: t("Tape measure", "Utepe wa kupimia"),
    description: t(
      "A flexible tape for lengths and curved lines, in millimetres.",
      "Utepe unaopinda wa kupima urefu na mistari iliyopinda, kwa milimita.",
    ),
    width: 700,
    height: 70,
    ...ruler(1500, [
      { name: ["Desk width", "Upana wa dawati"], value: 612.5 },
      { name: ["Bench length", "Urefu wa benchi"], value: 1265 },
    ]),
  },
  "vernier-callipers": {
    name: t("Vernier callipers", "Kalipa ya vernia"),
    description: t(
      "Reads to 0.1 mm: main scale plus the vernier division that lines up. Check the zero error first.",
      "Husoma hadi 0.1 mm: kipimo kikuu pamoja na mstari wa vernia unaolingana. Angalia kosa la sifuri kwanza.",
    ),
    width: 460,
    height: 130,
    controls: [
      toggle(
        "closed",
        ["Jaws", "Taya"],
        ["Closed (zero check)", "Zimefungwa (kagua sifuri)"],
        ["Around the object", "Kuzunguka kitu"],
      ),
      choice(
        "specimen",
        ["Object to measure", "Kitu cha kupima"],
        vernierSpecimens.map((item) => item.name),
        0,
        (params) => params.closed === 0,
      ),
      hintToggle,
    ],
    analyse: ({ part, p }) => {
      const zero = pick(part.id, 1, zeroErrors);
      const size = vernierSpecimens[p("specimen")].value;
      const reading =
        Math.round(((p("closed") === 1 ? 0 : size) + zero) * 10) / 10;
      const main = Math.floor(reading + 1e-9);
      const division = Math.round((reading - main) * 10);
      return {
        visual: { reading, zero },
        readouts:
          p("hint") === 1
            ? [
                readout(["Main scale", "Kipimo kikuu"], `${main} mm`),
                readout(
                  ["Vernier division", "Mstari wa vernia"],
                  `${division} × 0.1 mm`,
                ),
                readout(["Reading", "Kipimo"], `${fixed(reading, 1)} mm`),
              ]
            : [],
        issues:
          p("closed") === 1 && zero !== 0
            ? [
                issue("zero", "warn", [
                  zero > 0
                    ? "The jaws are shut but the reading is not zero: a positive zero error. Subtract it from every reading."
                    : "The jaws are shut but the reading is below zero: a negative zero error. Add it back to every reading.",
                  zero > 0
                    ? "Taya zimefungwa lakini kipimo si sifuri: kosa chanya la sifuri. Litoe kwenye kila kipimo."
                    : "Taya zimefungwa lakini kipimo kiko chini ya sifuri: kosa hasi la sifuri. Liongeze kwenye kila kipimo.",
                ]),
              ]
            : [],
        tasks:
          p("closed") === 1
            ? [
                task(
                  "zero",
                  ["Zero error", "Kosa la sifuri"],
                  "mm",
                  zero,
                  0.05,
                  [
                    "Read the shut jaws. Zero error is that reading, with its sign.",
                    "Soma taya zilizofungwa. Kosa la sifuri ni kipimo hicho, pamoja na ishara yake.",
                  ],
                ),
              ]
            : [
                task(
                  `size-${p("specimen")}`,
                  ["Corrected diameter", "Kipenyo kilichosahihishwa"],
                  "mm",
                  size,
                  0.05,
                  [
                    "Corrected = reading − zero error.",
                    "Kilichosahihishwa = kipimo − kosa la sifuri.",
                  ],
                ),
              ],
        measures:
          p("hint") === 1
            ? [measure("reading", ["Reading", "Kipimo"], "mm", reading, 1)]
            : [],
      };
    },
  },
  micrometer: {
    name: t("Micrometer screw gauge", "Maikromita (kipimo cha skrubu)"),
    description: t(
      "Reads to 0.01 mm: sleeve scale plus thimble scale. Close with the ratchet only.",
      "Husoma hadi 0.01 mm: kipimo cha mkono pamoja na cha kidole. Funga kwa ratchet pekee.",
    ),
    width: 420,
    height: 170,
    controls: [
      toggle(
        "closed",
        ["Anvil and spindle", "Kigingi na kipenyo"],
        ["Closed (zero check)", "Vimefungwa (kagua sifuri)"],
        ["Around the object", "Kuzunguka kitu"],
      ),
      choice(
        "specimen",
        ["Object to measure", "Kitu cha kupima"],
        micrometerSpecimens.map((item) => item.name),
        0,
        (params) => params.closed === 0,
      ),
      choice(
        "turn",
        ["Tighten using", "Kaza kwa"],
        [
          ["The thimble", "Kidole cha skrubu"],
          ["The ratchet", "Ratchet"],
        ],
      ),
      hintToggle,
    ],
    analyse: ({ part, p }) => {
      const zero = pick(part.id, 2, microZeroErrors);
      const size = micrometerSpecimens[p("specimen")].value;
      const overtight = p("turn") === 0 ? 0.02 : 0;
      const reading =
        Math.round(((p("closed") === 1 ? 0 : size) + zero - overtight) * 100) /
        100;
      const sleeve = Math.floor((reading + 1e-9) / 0.5) * 0.5;
      const thimble = Math.round((reading - sleeve) * 100);
      return {
        visual: { reading },
        readouts:
          p("hint") === 1
            ? [
                readout(["Sleeve", "Mkono"], `${fixed(sleeve, 1)} mm`),
                readout(["Thimble", "Kidole"], `${thimble} × 0.01 mm`),
                readout(["Reading", "Kipimo"], `${fixed(reading, 2)} mm`),
              ]
            : [],
        issues: [
          ...(p("turn") === 0
            ? [
                issue("ratchet", "warn", [
                  "Tightening with the thimble squeezes the object. Use the ratchet until it clicks.",
                  "Kukaza kwa kidole hubana kitu. Tumia ratchet hadi ipige kelele.",
                ]),
              ]
            : []),
          ...(p("closed") === 1 && zero !== 0
            ? [
                issue("zero", "warn", [
                  "The gauge does not read zero when closed. Note the zero error and correct every reading.",
                  "Kipimo hakisomi sifuri kikiwa kimefungwa. Andika kosa la sifuri na usahihishe kila kipimo.",
                ]),
              ]
            : []),
        ],
        tasks:
          p("closed") === 1
            ? [
                task(
                  "zero",
                  ["Zero error", "Kosa la sifuri"],
                  "mm",
                  zero,
                  0.006,
                  [
                    "Zero error is the closed reading, with its sign.",
                    "Kosa la sifuri ni kipimo kikiwa kimefungwa, pamoja na ishara.",
                  ],
                ),
              ]
            : [
                task(
                  `size-${p("specimen")}`,
                  ["Corrected diameter", "Kipenyo kilichosahihishwa"],
                  "mm",
                  size,
                  0.006,
                  [
                    "Corrected = reading − zero error. Use the ratchet.",
                    "Kilichosahihishwa = kipimo − kosa la sifuri. Tumia ratchet.",
                  ],
                ),
              ],
        measures:
          p("hint") === 1
            ? [measure("reading", ["Reading", "Kipimo"], "mm", reading, 2)]
            : [],
      };
    },
  },
  stopwatch: {
    name: t("Stopwatch / stop clock", "Saa ya kupimia muda"),
    description: t(
      "Reads to 0.01 s, but your reaction time adds about 0.2 s at each press. Reset before every timing.",
      "Husoma hadi 0.01 s, lakini muda wako wa kuitikia huongeza takriban 0.2 s kila unapobonyeza. Weka upya kabla ya kila kipimo.",
    ),
    width: 190,
    height: 210,
    state: {
      running: 0,
      startedAt: 0,
      elapsed: 0,
      startedFrom: 0,
      releasedAt: 0,
    },
    controls: [
      button("toggle", ["Start / stop", "Anza / simamisha"], (params, now) =>
        params.running === 1
          ? {
              ...params,
              running: 0,
              elapsed: params.elapsed + (now - params.startedAt),
            }
          : {
              ...params,
              running: 1,
              startedAt: now,
              startedFrom: params.elapsed,
            },
      ),
      button("reset", ["Reset to zero", "Weka sifuri"], (params) => ({
        ...params,
        running: 0,
        elapsed: 0,
        startedFrom: 0,
      })),
      choice(
        "event",
        ["Event to time", "Tukio la kupima"],
        clockEvents.map((item) => item.name),
      ),
      button("release", ["Start the event", "Anza tukio"], (params, now) => ({
        ...params,
        releasedAt: now,
      })),
    ],
    analyse: ({ p, env }) => {
      const elapsed =
        p("elapsed") + (p("running") === 1 ? env.now - p("startedAt") : 0);
      const event = clockEvents[p("event")];
      const sinceRelease = env.now - p("releasedAt");
      const progress =
        p("releasedAt") === 0
          ? 0
          : clamp(sinceRelease / (event.seconds * 1000), 0, 1);
      return {
        visual: { elapsed, progress, running: p("running") },
        readouts: [
          readout(["Display", "Onyesho"], formatClock(elapsed)),
          readout(
            ["True time of the event", "Muda halisi wa tukio"],
            progress >= 1 ? `${fixed(event.seconds, 2)} s` : "?",
          ),
        ],
        issues:
          p("running") === 1 && p("startedFrom") > 0
            ? [
                issue("reset", "bad", [
                  "The watch did not start from zero. Stop it, press Reset, then time again.",
                  "Saa haikuanza kwa sifuri. Isimamishe, bonyeza Weka sifuri, kisha pima tena.",
                ]),
              ]
            : [
                issue("reaction", "tip", [
                  "Press Start when the event begins and Stop when it ends. Repeat and average to reduce reaction-time error.",
                  "Bonyeza Anza tukio linapoanza na Simamisha linapoisha. Rudia na uchukue wastani kupunguza kosa la kuitikia.",
                ]),
              ],
        tasks:
          progress >= 1
            ? [
                task(
                  `time-${p("event")}-${p("releasedAt")}`,
                  ["Time you measured", "Muda uliopima"],
                  "s",
                  event.seconds,
                  0.45,
                  [
                    "Compare with the true time. The difference is your reaction-time error.",
                    "Linganisha na muda halisi. Tofauti ni kosa lako la kuitikia.",
                  ],
                ),
              ]
            : [],
        measures: [measure("time", ["Time", "Muda"], "s", elapsed / 1000, 2)],
      };
    },
  },
  "measuring-cylinder": {
    name: t("Measuring cylinder", "Silinda ya kupimia"),
    description: t(
      "100 mL in 1 mL steps. Read the bottom of the meniscus with your eye level with it.",
      "mL 100 kwa hatua za mL 1. Soma sehemu ya chini ya uso wa kioevu jicho likiwa usawa nao.",
    ),
    width: 110,
    height: 330,
    controls: [
      slider(
        "volume",
        ["Water poured in", "Maji yaliyomwagwa"],
        0,
        100,
        0.5,
        63,
        "mL",
      ),
      cylinderEye,
      hintToggle,
    ],
    analyse: ({ p }) => {
      const parallax = p("eye") * 0.04;
      const seen = p("volume") + parallax;
      const off = Math.abs(p("eye")) > 4;
      return {
        visual: { volume: p("volume"), seen },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Reading from here", "Kipimo kutoka hapa"],
                  `${fixed(seen, 1)} mL`,
                  off ? "warn" : undefined,
                ),
              ]
            : [],
        issues: off
          ? [
              issue("eye", "warn", [
                p("eye") > 0
                  ? "Looking from above makes the reading too high. Bring your eye level with the meniscus."
                  : "Looking from below makes the reading too low. Bring your eye level with the meniscus.",
                p("eye") > 0
                  ? "Kuangalia kutoka juu hufanya kipimo kuwa juu mno. Weka jicho usawa na uso wa kioevu."
                  : "Kuangalia kutoka chini hufanya kipimo kuwa chini mno. Weka jicho usawa na uso wa kioevu.",
              ]),
            ]
          : [],
        tasks: [
          task(
            `volume-${p("volume")}`,
            ["Volume of water", "Ujazo wa maji"],
            "mL",
            p("volume"),
            0.6,
            [
              "Read the bottom of the meniscus with your eye level with it.",
              "Soma chini ya uso wa kioevu jicho likiwa usawa nao.",
            ],
          ),
        ],
        measures:
          p("hint") === 1
            ? [measure("volume", ["Volume", "Ujazo"], "mL", seen, 1)]
            : [],
      };
    },
  },
  burette: {
    name: t("Burette", "Biureti"),
    description: t(
      "50 mL in 0.1 mL steps, zero at the top. Volume delivered = final reading − initial reading.",
      "mL 50 kwa hatua za mL 0.1, sifuri juu. Ujazo uliotolewa = kipimo cha mwisho − cha mwanzo.",
    ),
    width: 90,
    height: 360,
    state: { released: 0 },
    controls: [
      button("run1", ["Run out 1 mL", "Toa mL 1"], (params) => ({
        ...params,
        released: Math.min(49, params.released + 1),
      })),
      button("run01", ["Run out 0.1 mL", "Toa mL 0.1"], (params) => ({
        ...params,
        released: Math.min(49, Math.round((params.released + 0.1) * 10) / 10),
      })),
      button("refill", ["Refill to the top", "Jaza hadi juu"], (params) => ({
        ...params,
        released: 0,
      })),
      cylinderEye,
      hintToggle,
    ],
    analyse: ({ part, p }) => {
      const start = pick(part.id, 3, [0.2, 0.3, 0.1, 0.4]);
      const level = start + p("released");
      const seen = level - p("eye") * 0.004;
      const off = Math.abs(p("eye")) > 4;
      return {
        visual: { level, start },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Initial reading", "Kipimo cha mwanzo"],
                  `${fixed(start, 2)} mL`,
                ),
                readout(["Reading now", "Kipimo sasa"], `${fixed(seen, 2)} mL`),
              ]
            : [],
        issues: off
          ? [
              issue("eye", "warn", [
                "Parallax: keep your eye level with the bottom of the meniscus.",
                "Mchepuko: weka jicho usawa na chini ya uso wa kioevu.",
              ]),
            ]
          : [],
        tasks: [
          task(
            `level-${level.toFixed(2)}`,
            ["Burette reading", "Kipimo cha biureti"],
            "mL",
            level,
            0.06,
            [
              "The scale reads downwards: the numbers grow towards the tap.",
              "Kipimo kinasomwa kwenda chini: namba huongezeka kuelekea kwenye bomba.",
            ],
          ),
        ],
        measures: [
          measure(
            "delivered",
            ["Volume delivered", "Ujazo uliotolewa"],
            "mL",
            p("released"),
            2,
          ),
        ],
      };
    },
  },
  pipette: {
    name: t("Pipette", "Bomba la kupimia (pipeti)"),
    description: t(
      "Delivers a fixed 25.0 mL when filled exactly to the mark.",
      "Hutoa mL 25.0 kamili likijazwa hadi kwenye alama.",
    ),
    width: 60,
    height: 330,
    controls: [
      slider(
        "fill",
        ["Meniscus above the mark", "Uso wa kioevu juu ya alama"],
        -4,
        4,
        0.1,
        2.5,
        "mm",
      ),
      toggle(
        "drain",
        ["After emptying", "Baada ya kumwaga"],
        ["Touched tip to the wall", "Ncha imegusa ukuta"],
        ["Left the last drop", "Imeacha tone la mwisho"],
      ),
    ],
    analyse: ({ p }) => {
      const delivered = 25 + p("fill") * 0.03 - (p("drain") === 1 ? 0 : 0.05);
      const exact = Math.abs(p("fill")) <= 0.4 && p("drain") === 1;
      return {
        visual: { fill: p("fill") },
        readouts: [
          readout(
            ["Volume delivered", "Ujazo uliotolewa"],
            `${fixed(delivered, 2)} mL`,
            exact ? "ok" : "warn",
          ),
        ],
        issues: exact
          ? []
          : [
              issue("mark", "warn", [
                "Fill until the bottom of the meniscus sits exactly on the mark, then touch the tip to the wall when emptying.",
                "Jaza hadi chini ya uso wa kioevu iwe kwenye alama, kisha gusa ncha ukutani wakati wa kumwaga.",
              ]),
            ],
        measures: [
          measure(
            "delivered",
            ["Volume delivered", "Ujazo uliotolewa"],
            "mL",
            delivered,
            2,
          ),
        ],
      };
    },
  },
  beaker: {
    name: t("Beaker", "Bikari"),
    description: t(
      "A rough container, marked every 50 mL and only accurate to about 10%.",
      "Chombo cha kukadiria, chenye alama kila mL 50 na usahihi wa takriban 10%.",
    ),
    width: 140,
    height: 170,
    controls: [
      slider(
        "volume",
        ["Liquid in the beaker", "Kioevu kwenye bikari"],
        0,
        250,
        5,
        120,
        "mL",
      ),
    ],
    analyse: ({ p }) => ({
      visual: { volume: p("volume") },
      readouts: [
        readout(
          ["Approximate volume", "Ujazo wa kukadiria"],
          `${fixed(Math.round(p("volume") / 25) * 25, 0)} ± 10 mL`,
        ),
      ],
      issues: [
        issue("rough", "tip", [
          "Beakers are for holding liquids, not measuring them. Use a measuring cylinder for accuracy.",
          "Bikari ni za kushikilia vimiminika, si kupima. Tumia silinda ya kupimia kwa usahihi.",
        ]),
      ],
      tasks: [
        task(
          `beaker-${p("volume")}`,
          ["Volume (nearest mark)", "Ujazo (alama iliyo karibu)"],
          "mL",
          p("volume"),
          12.5,
        ),
      ],
    }),
  },
  "eureka-can": {
    name: t("Eureka (displacement) can", "Kopo la Eureka"),
    description: t(
      "Fill to the spout first. A sinking object then pushes out water equal to its own volume.",
      "Jaza hadi mdomoni kwanza. Kitu kinachozama hutoa maji sawa na ujazo wake.",
    ),
    width: 220,
    height: 230,
    state: { primed: 0 },
    controls: [
      choice(
        "object",
        ["Object", "Kitu"],
        eurekaObjects.map((item) => item.name),
      ),
      button(
        "prime",
        ["Fill until it drips", "Jaza hadi idondoke"],
        (params) => ({
          ...params,
          primed: 1,
          lowered: 0,
        }),
      ),
      toggle(
        "lowered",
        ["Object", "Kitu"],
        ["Lowered into the can", "Kimeshushwa kwenye kopo"],
        ["Held above the can", "Kimeshikwa juu ya kopo"],
      ),
    ],
    analyse: ({ p }) => {
      const object = eurekaObjects[p("object")];
      const lowered = p("lowered") === 1;
      const collected = lowered
        ? p("primed") === 1
          ? object.displaced
          : Math.max(0, object.displaced - 8)
        : 0;
      return {
        visual: { collected, lowered: lowered ? 1 : 0, primed: p("primed") },
        readouts: [
          readout(
            ["Water collected", "Maji yaliyokusanywa"],
            `${fixed(collected, 0)} cm³`,
          ),
        ],
        issues: [
          ...(lowered && p("primed") === 0
            ? [
                issue("prime", "bad", [
                  "The can was not full to the spout, so some displaced water only raised the level. Refill until it drips, then try again.",
                  "Kopo halikujaa hadi mdomoni, kwa hiyo maji mengine yaliinua kiwango tu. Jaza hadi idondoke kisha jaribu tena.",
                ]),
              ]
            : []),
          ...(lowered && object.displaced < object.volume
            ? [
                issue("float", "tip", [
                  "A floating object displaces only the volume that is under water.",
                  "Kitu kinachoelea hutoa tu ujazo ulio chini ya maji.",
                ]),
              ]
            : []),
        ],
        tasks: lowered
          ? [
              task(
                `eureka-${p("object")}-${p("primed")}`,
                ["Volume of water collected", "Ujazo wa maji yaliyokusanywa"],
                "cm³",
                collected,
                1,
              ),
            ]
          : [],
        measures: [
          measure(
            "collected",
            ["Volume displaced", "Ujazo ulioondolewa"],
            "cm³",
            collected,
            0,
          ),
        ],
      };
    },
  },
  "beam-balance": {
    name: t("Beam balance", "Mizani ya mkono"),
    description: t(
      "Add standard masses until the pointer is at zero. Set the zero first with the empty pan.",
      "Ongeza mizani sanifu hadi kielekezi kiwe sifuri. Weka sifuri kwanza sahani ikiwa tupu.",
    ),
    width: 360,
    height: 220,
    controls: [
      choice(
        "specimen",
        ["Object on the left pan", "Kitu kwenye sahani ya kushoto"],
        balanceSpecimens.map((item) => item.name),
      ),
      slider(
        "masses",
        ["Standard masses on the right", "Mizani kulia"],
        0,
        200,
        0.5,
        0,
        "g",
      ),
      slider(
        "adjust",
        ["Zero adjusting screw", "Skrubu ya sifuri"],
        -2,
        2,
        0.1,
        0,
        "turn",
      ),
    ],
    analyse: ({ part, p }) => {
      const zero = pick(part.id, 4, [-0.6, 0.4, 0.8, -1, 0.2]);
      const specimen = balanceSpecimens[p("specimen")].mass;
      const imbalance = specimen - p("masses") + zero + p("adjust");
      const balanced = Math.abs(imbalance) <= 0.15;
      return {
        visual: { tilt: balanceTilt(imbalance) },
        readouts: [
          readout(
            ["Pointer", "Kielekezi"],
            balanced
              ? "0"
              : imbalance > 0
                ? "← left pan heavier"
                : "right pan heavier →",
            balanced ? "ok" : undefined,
          ),
        ],
        issues:
          specimen === 0 && !balanced && p("masses") === 0
            ? [
                issue("zero", "warn", [
                  "The empty balance does not rest at zero. Turn the zero screw until the pointer is level.",
                  "Mizani tupu haitulii sifuri. Zungusha skrubu ya sifuri hadi kielekezi kiwe sawa.",
                ]),
              ]
            : [],
        tasks:
          specimen > 0
            ? [
                task(
                  `mass-${p("specimen")}`,
                  ["Mass of the object", "Uzito wa kitu"],
                  "g",
                  specimen,
                  0.3,
                  [
                    "Balance it with the pointer at zero. Zero the empty pan first.",
                    "Isawazishe kielekezi kikiwa sifuri. Weka sifuri sahani tupu kwanza.",
                  ],
                ),
              ]
            : [],
        measures: [
          measure(
            "mass",
            ["Standard masses", "Mizani sanifu"],
            "g",
            p("masses"),
            1,
          ),
        ],
      };
    },
  },
  "triple-beam-balance": {
    name: t("Triple beam balance", "Mizani ya mihimili mitatu"),
    description: t(
      "Slide the three riders (100 g, 10 g and 0.1 g steps) until the pointer rests at zero.",
      "Sogeza vigingi vitatu (hatua za 100 g, 10 g na 0.1 g) hadi kielekezi kitulie sifuri.",
    ),
    width: 380,
    height: 200,
    controls: [
      choice(
        "specimen",
        ["Object on the pan", "Kitu kwenye sahani"],
        heavySpecimens.map((item) => item.name),
      ),
      slider(
        "hundreds",
        ["Rider: 100 g beam", "Kigingi: mhimili wa 100 g"],
        0,
        500,
        100,
        0,
        "g",
      ),
      slider(
        "tens",
        ["Rider: 10 g beam", "Kigingi: mhimili wa 10 g"],
        0,
        90,
        10,
        0,
        "g",
      ),
      slider(
        "ones",
        ["Rider: 0.1 g beam", "Kigingi: mhimili wa 0.1 g"],
        0,
        10,
        0.1,
        0,
        "g",
      ),
      slider(
        "adjust",
        ["Zero adjusting screw", "Skrubu ya sifuri"],
        -2,
        2,
        0.1,
        0,
        "turn",
      ),
    ],
    analyse: ({ part, p }) => {
      const zero = pick(part.id, 5, [0.5, -0.7, 0.3, 0.9, -0.4]);
      const specimen = heavySpecimens[p("specimen")].mass;
      const riders = p("hundreds") + p("tens") + p("ones");
      const imbalance = specimen - riders + zero + p("adjust");
      const balanced = Math.abs(imbalance) <= 0.12;
      return {
        visual: { tilt: balanceTilt(imbalance) },
        readouts: [
          readout(
            ["Riders total", "Jumla ya vigingi"],
            `${fixed(riders, 1)} g`,
          ),
          readout(
            ["Pointer", "Kielekezi"],
            balanced ? "0" : imbalance > 0 ? "below zero" : "above zero",
            balanced ? "ok" : undefined,
          ),
        ],
        issues:
          specimen === 0 && !balanced && riders === 0
            ? [
                issue("zero", "warn", [
                  "With the pan empty and riders at 0, the pointer should rest at zero. Adjust the screw first.",
                  "Sahani ikiwa tupu na vigingi sifuri, kielekezi kinapaswa kutulia sifuri. Rekebisha skrubu kwanza.",
                ]),
              ]
            : [],
        tasks:
          specimen > 0
            ? [
                task(
                  `triple-${p("specimen")}`,
                  ["Mass of the object", "Uzito wa kitu"],
                  "g",
                  specimen,
                  0.2,
                ),
              ]
            : [],
        measures: [measure("mass", ["Mass", "Uzito"], "g", riders, 1)],
      };
    },
  },
  "electronic-balance": {
    name: t("Electronic balance", "Mizani ya kielektroniki"),
    description: t(
      "Level it, then press Tare with the empty container on the pan so only the contents are weighed.",
      "Isawazishe, kisha bonyeza Tare chombo kikiwa kwenye sahani ili vilivyomo tu vipimwe.",
    ),
    width: 250,
    height: 190,
    state: { tare: 0 },
    controls: [
      toggle(
        "level",
        ["Balance feet", "Miguu ya mizani"],
        ["Levelled (bubble centred)", "Imesawazishwa (kiputo katikati)"],
        ["Not levelled", "Haijasawazishwa"],
      ),
      toggle(
        "container",
        ["Container (52.3 g)", "Chombo (52.3 g)"],
        ["On the pan", "Kiko kwenye sahani"],
        ["Not on the pan", "Hakiko kwenye sahani"],
      ),
      choice(
        "load",
        ["Added to the container", "Kilichowekwa kwenye chombo"],
        [
          ["Nothing", "Hakuna"],
          ["Sand", "Mchanga"],
          ["Salt", "Chumvi"],
          ["Iron filings", "Vumbi la chuma"],
        ],
      ),
      button("tare", ["Tare (zero)", "Tare (sifuri)"], (params) => ({
        ...params,
        tare:
          (params.container === 1 ? 52.3 : 0) +
          [0, 45.6, 20, 78.2][params.load],
      })),
    ],
    analyse: ({ p }) => {
      const load = [0, 45.6, 20, 78.2][p("load")];
      const total = (p("container") === 1 ? 52.3 : 0) + load;
      const error = p("level") === 1 ? 0 : 0.4;
      const shown = total - p("tare") + error;
      return {
        visual: { shown, level: p("level") },
        readouts: [readout(["Display", "Onyesho"], `${fixed(shown, 1)} g`)],
        issues: [
          ...(p("level") === 0
            ? [
                issue("level", "warn", [
                  "The bubble is off centre, so the balance reads slightly wrong. Level the feet.",
                  "Kiputo kiko pembeni, kwa hiyo mizani inasoma vibaya kidogo. Sawazisha miguu.",
                ]),
              ]
            : []),
          ...(p("tare") === 0 && p("container") === 1
            ? [
                issue("tare", "tip", [
                  "Press Tare now so the container's mass is not counted.",
                  "Bonyeza Tare sasa ili uzito wa chombo usihesabiwe.",
                ]),
              ]
            : []),
        ],
        tasks:
          load > 0
            ? [
                task(
                  `elec-${p("load")}`,
                  ["Mass of the contents", "Uzito wa vilivyomo"],
                  "g",
                  load,
                  0.15,
                  [
                    "Level the balance and tare the empty container first.",
                    "Sawazisha mizani na uweke tare chombo tupu kwanza.",
                  ],
                ),
              ]
            : [],
        measures: [measure("mass", ["Mass", "Uzito"], "g", shown, 1)],
      };
    },
  },
  "spring-balance": {
    name: t("Spring balance (newton meter)", "Mizani ya chemchemi"),
    description: t(
      "Reads weight in newtons (0–5 N, 0.1 N steps). Check it reads zero before you hang anything.",
      "Husoma uzito kwa newton (0–5 N, hatua 0.1 N). Hakikisha inasoma sifuri kabla ya kuning'iniza kitu.",
    ),
    width: 120,
    height: 300,
    controls: [
      choice(
        "load",
        ["Hanging from the hook", "Kinaning'inia kwenye ndoano"],
        [
          ["Nothing", "Hakuna"],
          ["100 g", "100 g"],
          ["200 g", "200 g"],
          ["350 g", "350 g"],
          ["500 g", "500 g"],
        ],
      ),
      slider(
        "adjust",
        ["Zero adjusting nut", "Nati ya sifuri"],
        -0.5,
        0.5,
        0.05,
        0,
        "N",
      ),
      hintToggle,
    ],
    analyse: ({ part, p }) => {
      const grams = [0, 100, 200, 350, 500][p("load")];
      const weight = (grams / 1000) * G;
      const zero = pick(part.id, 6, [0.2, -0.1, 0.3, 0.15, -0.2]);
      const reading = weight + zero + p("adjust");
      return {
        visual: { reading },
        readouts:
          p("hint") === 1
            ? [readout(["Reading", "Kipimo"], `${fixed(reading, 2)} N`)]
            : [],
        issues:
          p("load") === 0 && Math.abs(zero + p("adjust")) > 0.04
            ? [
                issue("zero", "warn", [
                  "With nothing hanging the pointer is not at zero. Turn the adjusting nut first.",
                  "Hakuna kinachoning'inia lakini kielekezi hakiko sifuri. Zungusha nati ya kurekebisha kwanza.",
                ]),
              ]
            : [],
        tasks:
          grams > 0
            ? [
                task(
                  `weight-${grams}`,
                  ["Weight of the load", "Uzito wa mzigo"],
                  "N",
                  weight,
                  0.06,
                  [
                    "Weight = mass × 10 N/kg. Zero the balance first.",
                    "Uzito = wingi × 10 N/kg. Weka sifuri kwanza.",
                  ],
                ),
              ]
            : [],
        measures:
          p("hint") === 1
            ? [measure("weight", ["Force", "Nguvu"], "N", reading, 2)]
            : [],
      };
    },
  },
  "density-bottle": {
    name: t("Density bottle", "Chupa ya msongamano"),
    description: t(
      "Holds exactly 50 cm³. Weigh it empty, full of water and full of the liquid to find the density.",
      "Hushika cm³ 50 kamili. Ipime tupu, ikiwa na maji na ikiwa na kioevu ili kupata msongamano.",
    ),
    width: 110,
    height: 190,
    controls: [
      choice(
        "liquid",
        ["Liquid", "Kioevu"],
        liquids.map((item) => item.name),
        1,
      ),
      choice(
        "weigh",
        ["Weighing", "Kupima"],
        [
          ["Empty bottle", "Chupa tupu"],
          ["Full of water", "Imejaa maji"],
          ["Full of the liquid", "Imejaa kioevu"],
        ],
      ),
    ],
    analyse: ({ p }) => {
      const density = liquids[p("liquid")].density;
      const masses = [25, 25 + 50, 25 + 50 * density];
      return {
        visual: { fill: p("weigh") === 0 ? 0 : 1 },
        readouts: [
          readout(
            ["Balance reads", "Mizani inasoma"],
            `${fixed(masses[p("weigh")], 1)} g`,
          ),
        ],
        tasks: [
          task(
            `density-${p("liquid")}`,
            ["Density of the liquid", "Msongamano wa kioevu"],
            "g/cm³",
            density,
            0.02,
            [
              "Density = (mass full of liquid − mass empty) ÷ (mass full of water − mass empty).",
              "Msongamano = (uzito na kioevu − uzito tupu) ÷ (uzito na maji − uzito tupu).",
            ],
          ),
        ],
        measures: [
          measure("mass", ["Mass", "Uzito"], "g", masses[p("weigh")], 1),
        ],
      };
    },
  },
};
