import { elementState } from "../../circuit/solution";
import type { BenchEnv, PartSpec, PlacedPart } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  choice,
  fixed,
  issue,
  measure,
  readout,
  slider,
  t,
  task,
  toggle,
} from "./helpers";

type MagnetismKind = (typeof sectionKinds.magnetism)[number];

export type Pole = { x: number; y: number; strength: number };

const PIXELS_PER_CM = 10;
const EARTH_FIELD = 0.15;
const MU0 = 4e-7 * Math.PI;

const coreGain = [20, 6, 1, 1];

function rotate(x: number, y: number, degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

function coreMultiplier(coil: PlacedPart, env: BenchEnv) {
  return env
    .over(coil, ["soft-iron-core"])
    .reduce((best, core) => Math.max(best, coreGain[core.params.material]), 1);
}

/** The magnetic poles a part contributes to the field around it. */
export function magnetPoles(part: PlacedPart, env: BenchEnv): Pole[] {
  if (part.kind === "bar-magnet") {
    const cx = part.x + 100;
    const cy = part.y + 30;
    const end = rotate(80, 0, part.params.angle);
    return [
      { x: cx + end.x, y: cy + end.y, strength: 60 },
      { x: cx - end.x, y: cy - end.y, strength: -60 },
    ];
  }
  if (part.kind === "u-magnet") {
    const cx = part.x + 65;
    const cy = part.y + 65;
    const north = rotate(-32, -50, part.params.angle);
    const south = rotate(32, -50, part.params.angle);
    return [
      { x: cx + north.x, y: cy + north.y, strength: 90 },
      { x: cx + south.x, y: cy + south.y, strength: -90 },
    ];
  }
  if (part.kind === "solenoid" || part.kind === "electromagnet") {
    const current = elementState(env.solution, part.id).current;
    const turns = [50, 100, 200][part.params.turns];
    const gain = part.kind === "electromagnet" ? 5 : coreMultiplier(part, env);
    const strength = 0.05 * turns * current * gain;
    const cx = part.x + 100;
    const cy = part.y + (part.kind === "solenoid" ? 55 : 65);
    return [
      { x: cx + 70, y: cy, strength },
      { x: cx - 70, y: cy, strength: -strength },
    ];
  }
  return [];
}

/** Field at a point of the bench, with north on the screen pointing up. */
export function fieldAt(env: BenchEnv, x: number, y: number) {
  let bx = 0;
  let by = -EARTH_FIELD;
  for (const part of env.parts)
    for (const pole of magnetPoles(part, env)) {
      const dx = x - pole.x;
      const dy = y - pole.y;
      const distance = Math.max(Math.hypot(dx, dy), 12);
      const magnitude = pole.strength / (distance / PIXELS_PER_CM) ** 2;
      bx += (magnitude * dx) / distance;
      by += (magnitude * dy) / distance;
    }
  return { x: bx, y: by };
}

const hintToggle = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

const turnOptions: [string, string][] = [
  ["50 turns", "Mizunguko 50"],
  ["100 turns", "Mizunguko 100"],
  ["200 turns", "Mizunguko 200"],
];

const angleSlider = slider(
  "angle",
  ["Turn the magnet", "Zungusha sumaku"],
  0,
  345,
  15,
  0,
  "°",
);

export const magnetismParts: Record<MagnetismKind, PartSpec> = {
  "bar-magnet": {
    name: t("Bar magnet", "Sumaku ya fimbo"),
    description: t(
      "Field lines leave the north pole and enter the south pole. Like poles repel, unlike poles attract.",
      "Mistari ya uga hutoka ncha ya kaskazini na kuingia ya kusini. Ncha zinazofanana hufukuzana, zisizofanana huvutana.",
    ),
    width: 200,
    height: 60,
    controls: [angleSlider],
    analyse: () => ({
      readouts: [
        readout(["Poles", "Ncha"], "Red end = north, blue end = south"),
      ],
      issues: [
        issue("compass", "tip", [
          "Place a plotting compass nearby to map the field, or iron filings over the magnet.",
          "Weka dira ya kuchora karibu kuchora uga, au vumbi la chuma juu ya sumaku.",
        ]),
      ],
    }),
  },
  "u-magnet": {
    name: t("U-shaped (horseshoe) magnet", "Sumaku ya U"),
    description: t(
      "Its two poles face each other, giving a strong, almost uniform field in the gap.",
      "Ncha zake mbili zinatazamana, zikitoa uga imara na karibu sawa katikati ya pengo.",
    ),
    width: 130,
    height: 130,
    controls: [angleSlider],
    analyse: () => ({
      readouts: [
        readout(["Poles", "Ncha"], "Red tip = north, blue tip = south"),
      ],
    }),
  },
  "iron-filings": {
    name: t("Iron filings", "Vumbi la chuma"),
    description: t(
      "Sprinkled on paper over a magnet and tapped, each filing becomes a tiny magnet and lines up along the field.",
      "Hunyunyiziwa kwenye karatasi juu ya sumaku na kupigwa kidogo, kila chembe huwa sumaku ndogo na hujipanga kwenye uga.",
    ),
    width: 260,
    height: 190,
    controls: [
      toggle(
        "tapped",
        ["Paper", "Karatasi"],
        ["Tapped gently", "Imepigwa kidogo"],
        ["Not tapped", "Haijapigwa"],
      ),
    ],
    analyse: ({ p }) => ({
      visual: { tapped: p("tapped") },
      issues:
        p("tapped") === 0
          ? [
              issue("tap", "tip", [
                "Tap the paper gently so the filings can turn and line up.",
                "Piga karatasi kidogo ili chembe zigeuke na kujipanga.",
              ]),
            ]
          : [],
    }),
  },
  "plotting-compass": {
    name: t("Plotting compass", "Dira ya kuchora"),
    description: t(
      "A tiny magnetised needle that points along the local field. Without magnets it points to the Earth's north.",
      "Sindano ndogo ya sumaku inayoelekea uga wa mahali. Bila sumaku huelekea kaskazini ya dunia.",
    ),
    width: 90,
    height: 90,
    controls: [hintToggle],
    analyse: ({ part, p, env }) => {
      const field = fieldAt(env, part.x + 45, part.y + 45);
      const heading = (Math.atan2(field.x, -field.y) * 180) / Math.PI;
      const wrapped = ((heading % 360) + 360) % 360;
      const offEarth = Math.abs(((wrapped + 180) % 360) - 180) > 3;
      return {
        visual: { heading },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Needle points", "Sindano inaelekea"],
                  `${fixed(wrapped, 0)}° clockwise from north`,
                ),
              ]
            : [],
        issues: [
          issue("map", "tip", [
            offEarth
              ? "The needle is pulled off north by a nearby magnet. Move the compass to map the field line, marking the needle tip each time."
              : "No magnet nearby: the needle points to the Earth's north. Bring it near a magnet.",
            offEarth
              ? "Sindano inavutwa mbali na kaskazini na sumaku iliyo karibu. Hamisha dira kuchora mstari wa uga, ukiweka alama ncha ya sindano kila mara."
              : "Hakuna sumaku karibu: sindano inaelekea kaskazini ya dunia. Ilete karibu na sumaku.",
          ]),
        ],
        measures: [
          measure(
            "heading",
            ["Needle direction", "Mwelekeo wa sindano"],
            "°",
            wrapped,
            0,
          ),
        ],
      };
    },
  },
  solenoid: {
    name: t("Solenoid", "Solenoidi"),
    description: t(
      "A long coil of wire. Current makes it a magnet like a bar magnet; reversing the current swaps the poles. A soft iron core inside makes it much stronger.",
      "Koili ndefu ya waya. Mkondo huifanya sumaku kama ya fimbo; kugeuza mkondo hubadilisha ncha. Kiini cha chuma laini ndani huiimarisha sana.",
    ),
    width: 200,
    height: 110,
    terminals: [
      { name: "a", x: 14, y: 94 },
      { name: "b", x: 186, y: 94 },
    ],
    controls: [
      choice(
        "turns",
        ["Number of turns", "Idadi ya mizunguko"],
        turnOptions,
        1,
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: [50, 100, 200][part.params.turns] / 40,
      },
    ],
    analyse: ({ part, p, env }) => {
      const current = elementState(env.solution, part.id).current;
      const gain = coreMultiplier(part, env);
      const turns = [50, 100, 200][p("turns")];
      const field = (MU0 * gain * turns * Math.abs(current)) / 0.15;
      return {
        visual: { current, gain },
        readouts: [
          readout(["Current", "Mkondo"], `${fixed(Math.abs(current), 2)} A`),
          readout(
            ["North pole", "Ncha ya kaskazini"],
            Math.abs(current) < 0.005
              ? "none"
              : current > 0
                ? "Right end"
                : "Left end",
          ),
          readout(
            ["Strength", "Nguvu"],
            `${fixed(field * 1000, 2)} mT${gain > 1 ? " (with core)" : ""}`,
          ),
        ],
        tasks: [],
        measures: [
          measure(
            "current",
            ["Current I", "Mkondo I"],
            "A",
            Math.abs(current),
            2,
          ),
          measure(
            "field",
            ["Field strength", "Nguvu ya uga"],
            "mT",
            field * 1000,
            2,
          ),
        ],
      };
    },
  },
  "soft-iron-core": {
    name: t("Soft iron core", "Kiini cha chuma laini"),
    description: t(
      "Slide it into a solenoid (place it over one). Soft iron is magnetised strongly and loses it when the current stops.",
      "Kiingize kwenye solenoidi (kiweke juu ya moja). Chuma laini hupata sumaku kali na hupoteza ikikatwa mkondo.",
    ),
    width: 170,
    height: 50,
    controls: [
      choice(
        "material",
        ["Rod of", "Fimbo ya"],
        [
          ["Soft iron", "Chuma laini"],
          ["Steel", "Chuma cha pua"],
          ["Copper", "Shaba"],
          ["Plastic", "Plastiki"],
        ],
      ),
    ],
    analyse: ({ part, p, env }) => {
      const inside = env.over(part, ["solenoid"]).length > 0;
      return {
        readouts: [
          readout(
            ["Inside a solenoid", "Ndani ya solenoidi"],
            inside ? "Yes" : "No",
            inside ? "ok" : undefined,
          ),
          readout(
            ["Field multiplied by", "Uga unazidishwa mara"],
            inside ? `× ${coreGain[p("material")]}` : "—",
          ),
        ],
      };
    },
  },
  electromagnet: {
    name: t("Electromagnet", "Sumaku-umeme"),
    description: t(
      "A coil on an iron core that is a magnet only while current flows. More turns and more current lift more paper clips.",
      "Koili kwenye kiini cha chuma ambayo ni sumaku mkondo ukipita tu. Mizunguko mingi na mkondo mkubwa huinua klipu nyingi.",
    ),
    width: 200,
    height: 130,
    terminals: [
      { name: "a", x: 16, y: 114 },
      { name: "b", x: 184, y: 114 },
    ],
    controls: [
      choice(
        "turns",
        ["Number of turns", "Idadi ya mizunguko"],
        turnOptions,
        1,
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: [50, 100, 200][part.params.turns] / 25,
      },
    ],
    analyse: ({ part, p, env }) => {
      const current = Math.abs(elementState(env.solution, part.id).current);
      const turns = [50, 100, 200][p("turns")];
      const clips = Math.min(12, Math.floor((turns * current) / 25));
      return {
        visual: { clips, current },
        readouts: [
          readout(["Current", "Mkondo"], `${fixed(current, 2)} A`),
          readout(["Paper clips held", "Klipu zilizoshikiliwa"], String(clips)),
        ],
        tasks: [
          task(
            `em-${p("turns")}-${current.toFixed(2)}`,
            ["Paper clips held", "Klipu zilizoshikiliwa"],
            "",
            clips,
            0.5,
          ),
        ],
        measures: [
          measure("current", ["Current I", "Mkondo I"], "A", current, 2),
          measure(
            "clips",
            ["Clips lifted", "Klipu zilizoinuliwa"],
            "",
            clips,
            0,
          ),
        ],
      };
    },
  },
  "motor-model": {
    name: t("Simple motor model", "Mfano wa mota rahisi"),
    description: t(
      "A coil in a magnetic field turns when current flows (Fleming's left-hand rule). Reversing the current or the magnets reverses the spin.",
      "Koili kwenye uga wa sumaku huzunguka mkondo ukipita (kanuni ya mkono wa kushoto ya Fleming). Kugeuza mkondo au sumaku hugeuza mzunguko.",
    ),
    width: 170,
    height: 140,
    terminals: [
      { name: "a", x: 30, y: 120 },
      { name: "b", x: 140, y: 120 },
    ],
    controls: [
      toggle(
        "field",
        ["Magnets", "Sumaku"],
        ["In place", "Ziko mahali"],
        ["Removed", "Zimeondolewa"],
        1,
      ),
      choice(
        "poles",
        ["Left magnet is", "Sumaku ya kushoto ni"],
        [
          ["North", "Kaskazini"],
          ["South", "Kusini"],
        ],
      ),
    ],
    electrical: () => [{ type: "resistor", a: "a", b: "b", resistance: 4 }],
    analyse: ({ part, p, env }) => {
      const current = elementState(env.solution, part.id).current;
      const direction = Math.sign(current) * (p("poles") === 0 ? 1 : -1);
      const rpm =
        p("field") === 1
          ? direction * Math.min(3000, 700 * Math.abs(current))
          : 0;
      return {
        visual: { rpm },
        readouts: [
          readout(["Speed", "Kasi"], `${fixed(Math.abs(rpm), 0)} rpm`),
          readout(
            ["Spin", "Mzunguko"],
            Math.abs(rpm) < 1
              ? "Stopped"
              : rpm > 0
                ? "Clockwise"
                : "Anticlockwise",
          ),
        ],
        issues:
          p("field") === 0
            ? [
                issue("magnets", "tip", [
                  "Without the magnets there is no field to push on the coil, so it does not turn.",
                  "Bila sumaku hakuna uga wa kusukuma koili, kwa hiyo haizunguki.",
                ]),
              ]
            : [],
        measures: [measure("rpm", ["Speed", "Kasi"], "rpm", Math.abs(rpm), 0)],
      };
    },
  },
  "generator-model": {
    name: t("Simple generator model", "Mfano wa jenereta rahisi"),
    description: t(
      "Turning the crank spins a coil in a field and induces a voltage. Slip rings give a.c.; a split-ring commutator gives d.c.",
      "Kugeuza mkono hugeuza koili kwenye uga na kuzalisha volteji. Pete za kuteleza hutoa a.c.; kigeuzi cha pete mbili hutoa d.c.",
    ),
    width: 190,
    height: 150,
    terminals: [
      { name: "pos", x: 60, y: 130, polarity: "+" },
      { name: "neg", x: 130, y: 130, polarity: "-" },
    ],
    controls: [
      choice(
        "type",
        ["Output", "Pato"],
        [
          ["a.c. (slip rings)", "a.c. (pete za kuteleza)"],
          ["d.c. (commutator)", "d.c. (kigeuzi)"],
        ],
      ),
      choice(
        "turns",
        ["Coil turns", "Mizunguko ya koili"],
        [
          ["50 turns", "Mizunguko 50"],
          ["100 turns", "Mizunguko 100"],
        ],
        1,
      ),
      slider(
        "rpm",
        ["Turning speed", "Kasi ya kugeuza"],
        0,
        300,
        10,
        120,
        "rpm",
      ),
    ],
    electrical: (part) => {
      const peak = 0.02 * part.params.rpm * ([50, 100][part.params.turns] / 50);
      return part.params.type === 0
        ? [
            {
              type: "source",
              a: "pos",
              b: "neg",
              voltage: peak / Math.SQRT2,
              internalResistance: 2,
              ac: { frequency: Math.max(part.params.rpm / 60, 0.1), wave: 0 },
            },
          ]
        : [
            {
              type: "source",
              a: "pos",
              b: "neg",
              voltage: 0.64 * peak,
              internalResistance: 2,
            },
          ];
    },
    analyse: ({ part, p, env }) => {
      const peak = 0.02 * p("rpm") * ([50, 100][p("turns")] / 50);
      const state = elementState(env.solution, part.id);
      return {
        visual: { rpm: p("rpm") },
        readouts: [
          readout(["Peak voltage", "Volteji ya kilele"], `${fixed(peak, 1)} V`),
          readout(
            ["Voltage at the terminals", "Volteji kwenye ncha"],
            `${fixed(Math.abs(state.voltage), 2)} V`,
          ),
        ],
        measures: [
          measure("rpm", ["Speed", "Kasi"], "rpm", p("rpm"), 0),
          measure("peak", ["Peak voltage", "Volteji ya kilele"], "V", peak, 1),
        ],
      };
    },
  },
  transformer: {
    name: t("Transformer", "Transfoma"),
    description: t(
      "Two coils on an iron core. An alternating voltage on the primary induces Vs = Vp × Ns ÷ Np in the secondary. It does not work on d.c.",
      "Koili mbili kwenye kiini cha chuma. Volteji mbadala kwenye msingi huzalisha Vs = Vp × Ns ÷ Np kwenye upili. Haifanyi kazi kwa d.c.",
    ),
    width: 220,
    height: 170,
    terminals: [
      { name: "a", x: 30, y: 150 },
      { name: "b", x: 80, y: 150 },
      { name: "c", x: 140, y: 150 },
      { name: "d", x: 190, y: 150 },
    ],
    controls: [
      choice(
        "np",
        ["Primary turns", "Mizunguko ya msingi"],
        [
          ["50", "50"],
          ["100", "100"],
          ["200", "200"],
        ],
        1,
      ),
      choice(
        "ns",
        ["Secondary turns", "Mizunguko ya upili"],
        [
          ["25", "25"],
          ["50", "50"],
          ["100", "100"],
          ["200", "200"],
          ["400", "400"],
        ],
        3,
      ),
    ],
    electrical: (part) => [
      {
        type: "transformer",
        a: "a",
        b: "b",
        c: "c",
        d: "d",
        primaryResistance: 20,
        secondaryResistance: 1,
        ratio:
          [25, 50, 100, 200, 400][part.params.ns] /
          [50, 100, 200][part.params.np],
      },
    ],
    analyse: ({ part, p, env }) => {
      const [primary, secondary] = env.solution.elements.get(part.id) ?? [];
      const vp = Math.abs(primary?.voltage ?? 0);
      const vs = Math.abs(secondary?.voltage ?? 0);
      const ratio = [25, 50, 100, 200, 400][p("ns")] / [50, 100, 200][p("np")];
      const pin = primary?.power ?? 0;
      const pout = secondary?.power ?? 0;
      return {
        readouts: [
          readout(
            ["Primary voltage Vp", "Volteji ya msingi Vp"],
            `${fixed(vp, 2)} V`,
          ),
          readout(
            ["Secondary voltage Vs", "Volteji ya upili Vs"],
            `${fixed(vs, 2)} V`,
          ),
          readout(["Ns ÷ Np", "Ns ÷ Np"], fixed(ratio, 2)),
          readout(
            ["Step", "Hatua"],
            ratio > 1 ? "Step-up" : ratio < 1 ? "Step-down" : "1 : 1",
          ),
          ...(pin > 0.01
            ? [
                readout(
                  ["Efficiency (ideal core)", "Ufanisi (kiini bora)"],
                  `${fixed(Math.min(1, pout / pin) * 100, 0)} %`,
                ),
              ]
            : []),
        ],
        issues:
          vp > 0.05 && !env.solution.ac
            ? [
                issue("dc", "bad", [
                  "A steady d.c. current makes no changing magnetic field, so nothing is induced in the secondary. Use an a.c. supply.",
                  "Mkondo wa d.c. thabiti haubadilishi uga wa sumaku, kwa hiyo hakuna kinachozalishwa kwenye upili. Tumia chanzo cha a.c.",
                ]),
              ]
            : [],
        tasks:
          env.solution.ac && vp > 0.2
            ? [
                task(
                  `transformer-${p("np")}-${p("ns")}-${vp.toFixed(2)}`,
                  ["Secondary voltage", "Volteji ya upili"],
                  "V",
                  vp * ratio,
                  Math.max(0.15, vp * ratio * 0.04),
                  ["Vs ÷ Vp = Ns ÷ Np.", "Vs ÷ Vp = Ns ÷ Np."],
                ),
              ]
            : [],
        measures: [
          measure("vp", ["Primary voltage", "Volteji ya msingi"], "V", vp, 2),
          measure("vs", ["Secondary voltage", "Volteji ya upili"], "V", vs, 2),
        ],
      };
    },
  },
  "electric-bell": {
    name: t("Electric bell", "Kengele ya umeme"),
    description: t(
      "An electromagnet pulls the striker to the gong, which breaks the contact; the spring pulls it back and the circuit remakes — so it rings continuously.",
      "Sumaku-umeme huvuta kigonga kwenye gongo, kikikata mawasiliano; chemchemi hukirudisha na sakiti hurejea — hivyo hulia mfululizo.",
    ),
    width: 150,
    height: 170,
    terminals: [
      { name: "a", x: 30, y: 150 },
      { name: "b", x: 120, y: 150 },
    ],
    electrical: () => [{ type: "resistor", a: "a", b: "b", resistance: 5 }],
    analyse: ({ part, env }) => {
      const current = Math.abs(elementState(env.solution, part.id).current);
      const ringing = current > 0.15;
      return {
        visual: { ringing: ringing ? 1 : 0 },
        readouts: [
          readout(["Current", "Mkondo"], `${fixed(current, 2)} A`),
          readout(
            ["Bell", "Kengele"],
            ringing ? "Ringing" : "Silent",
            ringing ? "ok" : undefined,
          ),
        ],
        issues:
          !ringing && current > 0.01
            ? [
                issue("weak", "tip", [
                  "There is not enough current to pull the striker. Raise the voltage.",
                  "Hakuna mkondo wa kutosha kuvuta kigonga. Ongeza volteji.",
                ]),
              ]
            : [],
      };
    },
  },
};
