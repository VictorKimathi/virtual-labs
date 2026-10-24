import { elementState } from "../../circuit/solution";
import type { PartSpec } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  button,
  choice,
  clamp,
  fixed,
  issue,
  measure,
  readout,
  seeded,
  slider,
  t,
  task,
} from "./helpers";

type ModernKind = (typeof sectionKinds.modern)[number];

const OPEN = 1e9;

const diodeTypes = [
  {
    name: ["Silicon diode (0.7 V)", "Diodi ya silikoni (0.7 V)"] as [
      string,
      string,
    ],
    forward: 0.7,
  },
  {
    name: ["Germanium diode (0.3 V)", "Diodi ya germanium (0.3 V)"] as [
      string,
      string,
    ],
    forward: 0.3,
  },
];

const ledColours = [
  { name: ["Red", "Nyekundu"] as [string, string], forward: 1.8 },
  { name: ["Green", "Kijani"] as [string, string], forward: 2.1 },
  { name: ["Blue", "Buluu"] as [string, string], forward: 3 },
];

export function ldrResistance(lux: number) {
  return 100000 / (1 + lux / 5);
}

export function thermistorResistance(celsius: number) {
  return 1000 * Math.exp(3500 * (1 / (273 + celsius) - 1 / 298));
}

const sources = [
  {
    name: ["None (background only)", "Hakuna (mionzi ya mazingira tu)"] as [
      string,
      string,
    ],
    rate: 0,
  },
  { name: ["Alpha source", "Chanzo cha alfa"] as [string, string], rate: 40 },
  { name: ["Beta source", "Chanzo cha beta"] as [string, string], rate: 25 },
  { name: ["Gamma source", "Chanzo cha gamma"] as [string, string], rate: 12 },
];

const absorbers = [
  { name: ["None", "Hakuna"] as [string, string], pass: [1, 1, 1] },
  {
    name: ["Sheet of paper", "Karatasi"] as [string, string],
    pass: [0, 0.8, 1],
  },
  {
    name: ["3 mm aluminium", "Alumini 3 mm"] as [string, string],
    pass: [0, 0.03, 0.97],
  },
  {
    name: ["5 mm lead", "Risasi 5 mm"] as [string, string],
    pass: [0, 0, 0.75],
  },
];

const BACKGROUND_RATE = 0.5;

/** Counts per second at a distance, behind an absorber. */
function countRate(source: number, absorber: number, distance: number) {
  if (source === 0) return BACKGROUND_RATE;
  const kind = source - 1;
  const reach = kind === 0 ? 5 : Infinity;
  if (distance > reach) return BACKGROUND_RATE;
  return (
    BACKGROUND_RATE +
    sources[source].rate * (10 / distance) ** 2 * absorbers[absorber].pass[kind]
  );
}

function gaussian(id: string, salt: number) {
  const a = Math.max(seeded(id, salt), 1e-9);
  const b = seeded(id, salt + 1);
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
}

export const modernParts: Record<ModernKind, PartSpec> = {
  diode: {
    name: t("Semiconductor diode", "Diodi ya semikondakta"),
    description: t(
      "Lets current through one way only, once the forward voltage is exceeded. The bar marks the cathode.",
      "Huruhusu mkondo upite upande mmoja tu, volteji ya mbele ikipitwa. Mstari unaonyesha katodi.",
    ),
    width: 110,
    height: 50,
    terminals: [
      { name: "pos", x: 10, y: 25, polarity: "+" },
      { name: "neg", x: 100, y: 25, polarity: "-" },
    ],
    controls: [
      choice(
        "type",
        ["Material", "Kitu"],
        diodeTypes.map((item) => item.name),
      ),
    ],
    electrical: (part) => [
      {
        type: "diode",
        a: "pos",
        b: "neg",
        forward: diodeTypes[part.params.type].forward,
        resistance: 0.5,
      },
    ],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      const conducting = state.current > 1e-4;
      return {
        visual: { on: conducting ? 1 : 0 },
        readouts: [
          readout(
            ["State", "Hali"],
            conducting
              ? "Conducting (forward bias)"
              : state.voltage < -0.05
                ? "Blocking (reverse bias)"
                : "Not conducting",
            conducting ? "ok" : undefined,
          ),
          readout(
            ["Voltage across it", "Volteji kwenye kifaa"],
            `${fixed(state.voltage, 2)} V`,
          ),
          readout(
            ["Current", "Mkondo"],
            `${fixed(Math.max(0, state.current) * 1000, 1)} mA`,
          ),
        ],
        issues:
          conducting && state.current > 1
            ? [
                issue("limit", "bad", [
                  "No resistor limits the current: a real diode would be destroyed. Add a series resistor.",
                  "Hakuna kikinzani cha kupunguza mkondo: diodi halisi ingeharibika. Ongeza kikinzani mfululizo.",
                ]),
              ]
            : [],
        tasks: [],
        measures: [
          measure(
            "vf",
            ["Voltage across diode", "Volteji kwenye diodi"],
            "V",
            state.voltage,
            2,
          ),
          measure(
            "current",
            ["Current", "Mkondo"],
            "mA",
            Math.max(0, state.current) * 1000,
            1,
          ),
        ],
      };
    },
  },
  led: {
    name: t("Light-emitting diode (LED)", "Diodi inayotoa mwanga (LED)"),
    description: t(
      "A diode that glows when current flows the right way. It needs a series resistor: above about 30 mA it burns out.",
      "Diodi inayowaka mkondo ukipita upande sahihi. Inahitaji kikinzani mfululizo: juu ya takriban 30 mA huungua.",
    ),
    width: 90,
    height: 110,
    terminals: [
      { name: "pos", x: 22, y: 96, polarity: "+" },
      { name: "neg", x: 68, y: 96, polarity: "-" },
    ],
    state: { burnt: 0 },
    controls: [
      choice(
        "colour",
        ["Colour", "Rangi"],
        ledColours.map((item) => item.name),
      ),
      button(
        "replace",
        ["Fit a new LED", "Weka LED mpya"],
        (params) => ({ ...params, burnt: 0 }),
        (params) => params.burnt === 1,
      ),
    ],
    electrical: (part) =>
      part.params.burnt === 1
        ? [{ type: "resistor", a: "pos", b: "neg", resistance: OPEN }]
        : [
            {
              type: "diode",
              a: "pos",
              b: "neg",
              forward: ledColours[part.params.colour].forward,
              resistance: 5,
            },
          ],
    react: ({ part, env }) =>
      part.params.burnt === 0 &&
      elementState(env.solution, part.id).current > 0.03
        ? { burnt: 1 }
        : undefined,
    analyse: ({ part, p, env }) => {
      const state = elementState(env.solution, part.id);
      const brightness = clamp(state.current / 0.02, 0, 1.2);
      return {
        visual: { brightness, colour: p("colour"), burnt: p("burnt") },
        readouts: [
          readout(
            ["Current", "Mkondo"],
            `${fixed(Math.max(0, state.current) * 1000, 1)} mA`,
          ),
          readout(
            ["LED", "LED"],
            p("burnt") === 1
              ? "Burnt out"
              : brightness > 0.05
                ? "Glowing"
                : "Off",
            p("burnt") === 1 ? "bad" : brightness > 0.05 ? "ok" : undefined,
          ),
        ],
        issues:
          p("burnt") === 1
            ? [
                issue("burnt", "bad", [
                  "Too much current destroyed the LED. Always put a resistor in series, then fit a new LED.",
                  "Mkondo mwingi uliharibu LED. Weka kikinzani mfululizo kila mara, kisha weka LED mpya.",
                ]),
              ]
            : state.voltage < -0.5
              ? [
                  issue("reverse", "tip", [
                    "The LED is connected the wrong way round, so it stays dark. Swap its leads.",
                    "LED imeunganishwa kinyume, kwa hiyo haiwaki. Badilisha nyaya zake.",
                  ]),
                ]
              : [],
        measures: [
          measure(
            "current",
            ["Current", "Mkondo"],
            "mA",
            Math.max(0, state.current) * 1000,
            1,
          ),
        ],
      };
    },
  },
  transistor: {
    name: t("NPN transistor", "Transistor ya NPN"),
    description: t(
      "A small current into the base switches a much larger current from collector to emitter. Used here as an electronic switch.",
      "Mkondo mdogo kwenye besi hubadilisha mkondo mkubwa zaidi kutoka kolekta hadi emita. Hapa inatumika kama swichi ya kielektroniki.",
    ),
    width: 110,
    height: 120,
    terminals: [
      { name: "b", x: 12, y: 60 },
      { name: "c", x: 88, y: 14 },
      { name: "e", x: 88, y: 106 },
    ],
    electrical: () => [
      { type: "diode", a: "b", b: "e", forward: 0.7, resistance: 20 },
      { type: "gated", a: "c", b: "e", resistance: 5, gate: 0 },
    ],
    analyse: ({ part, env }) => {
      const [base, collector] = env.solution.elements.get(part.id) ?? [];
      const on = (base?.current ?? 0) > 1e-5;
      return {
        visual: { on: on ? 1 : 0 },
        readouts: [
          readout(
            ["Base current", "Mkondo wa besi"],
            `${fixed(Math.max(0, base?.current ?? 0) * 1000, 2)} mA`,
          ),
          readout(
            ["Collector current", "Mkondo wa kolekta"],
            `${fixed(Math.max(0, collector?.current ?? 0) * 1000, 1)} mA`,
          ),
          readout(
            ["Switch", "Swichi"],
            on ? "ON (saturated)" : "OFF",
            on ? "ok" : undefined,
          ),
        ],
        issues: [
          issue("base", "tip", [
            "The base needs about 0.7 V and a resistor in series to switch the transistor on.",
            "Besi inahitaji takriban 0.7 V na kikinzani mfululizo kuwasha transistor.",
          ]),
        ],
      };
    },
  },
  ldr: {
    name: t("Photocell (light-dependent resistor)", "Seli ya mwanga (LDR)"),
    description: t(
      "Its resistance falls as light gets brighter: about 100 kΩ in the dark and under 1 kΩ in bright light.",
      "Ukinzani wake hupungua mwanga ukiongezeka: takriban 100 kΩ gizani na chini ya 1 kΩ mwangani.",
    ),
    width: 100,
    height: 100,
    terminals: [
      { name: "a", x: 16, y: 86 },
      { name: "b", x: 84, y: 86 },
    ],
    controls: [
      slider(
        "light",
        ["Light falling on it", "Mwanga unaoangukia"],
        0,
        1000,
        10,
        100,
        "lx",
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: ldrResistance(part.params.light),
      },
    ],
    analyse: ({ p }) => ({
      visual: { light: p("light") },
      readouts: [
        readout(
          ["Resistance", "Ukinzani"],
          `${fixed(ldrResistance(p("light")), 0)} Ω`,
        ),
      ],
      tasks: [
        task(
          `ldr-${p("light")}`,
          ["Resistance (from V ÷ I)", "Ukinzani (kutoka V ÷ I)"],
          "Ω",
          ldrResistance(p("light")),
          Math.max(20, ldrResistance(p("light")) * 0.05),
        ),
      ],
      measures: [
        measure("light", ["Light", "Mwanga"], "lx", p("light"), 0),
        measure(
          "resistance",
          ["Resistance", "Ukinzani"],
          "Ω",
          ldrResistance(p("light")),
          0,
        ),
      ],
    }),
  },
  thermistor: {
    name: t("Thermistor (NTC)", "Thermista (NTC)"),
    description: t(
      "Its resistance falls quickly as it gets hotter: about 1 kΩ at 25 °C.",
      "Ukinzani wake hupungua haraka inapopata joto: takriban 1 kΩ kwa 25 °C.",
    ),
    width: 100,
    height: 100,
    terminals: [
      { name: "a", x: 16, y: 86 },
      { name: "b", x: 84, y: 86 },
    ],
    controls: [slider("temp", ["Temperature", "Joto"], 0, 100, 5, 25, "°C")],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: thermistorResistance(part.params.temp),
      },
    ],
    analyse: ({ p }) => ({
      visual: { temp: p("temp") },
      readouts: [
        readout(
          ["Resistance", "Ukinzani"],
          `${fixed(thermistorResistance(p("temp")), 0)} Ω`,
        ),
      ],
      measures: [
        measure("temp", ["Temperature", "Joto"], "°C", p("temp"), 0),
        measure(
          "resistance",
          ["Resistance", "Ukinzani"],
          "Ω",
          thermistorResistance(p("temp")),
          0,
        ),
      ],
    }),
  },
  "radiation-kit": {
    name: t(
      "Radiation demonstration kit (simulated)",
      "Kifaa cha mionzi (cha kuigiza)",
    ),
    description: t(
      "A Geiger–Müller tube and counter with safe, simulated sources. Alpha is stopped by paper, beta by aluminium, gamma only thinned by lead. Counts are random, so repeat and average.",
      "Mrija wa Geiger–Müller na kaunta zenye vyanzo salama vya kuigiza. Alfa husimamishwa na karatasi, beta na alumini, gamma hupunguzwa tu na risasi. Hesabu ni nasibu, kwa hiyo rudia na uchukue wastani.",
    ),
    width: 380,
    height: 210,
    state: { run: 0 },
    controls: [
      choice(
        "source",
        ["Source", "Chanzo"],
        sources.map((item) => item.name),
        1,
      ),
      choice(
        "absorber",
        ["Absorber between", "Kizuizi kati ya"],
        absorbers.map((item) => item.name),
      ),
      slider(
        "distance",
        ["Source to tube", "Chanzo hadi mrija"],
        1,
        30,
        1,
        5,
        "cm",
      ),
      button(
        "count",
        ["Count for 10 s", "Hesabu kwa sekunde 10"],
        (params) => ({ ...params, run: params.run + 1 }),
      ),
    ],
    analyse: ({ part, p }) => {
      const rate = countRate(p("source"), p("absorber"), p("distance"));
      const mean = rate * 10;
      const counted =
        p("run") === 0
          ? 0
          : Math.max(
              0,
              Math.round(
                mean + Math.sqrt(mean) * gaussian(part.id, p("run") * 2),
              ),
            );
      return {
        visual: { rate, source: p("source") },
        readouts: [
          readout(
            ["Last count (10 s)", "Hesabu ya mwisho (s 10)"],
            p("run") === 0 ? "press Count" : String(counted),
          ),
          readout(
            ["Count rate", "Kasi ya kuhesabu"],
            p("run") === 0 ? "—" : `${fixed(counted * 6, 0)} per minute`,
          ),
        ],
        issues: [
          issue("background", "tip", [
            "Always measure the background count with no source and subtract it from your readings.",
            "Pima kila mara hesabu ya mazingira bila chanzo na uiondoe kwenye vipimo vyako.",
          ]),
        ],
        measures:
          p("run") === 0
            ? []
            : [
                measure(
                  "counts",
                  ["Counts in 10 s", "Hesabu katika s 10"],
                  "",
                  counted,
                  0,
                ),
                measure(
                  "distance",
                  ["Distance", "Umbali"],
                  "cm",
                  p("distance"),
                  0,
                ),
              ],
      };
    },
  },
};
