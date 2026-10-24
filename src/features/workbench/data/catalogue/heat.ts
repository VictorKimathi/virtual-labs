import { elementState } from "../../circuit/solution";
import type { BenchEnv, PartSpec, PlacedPart } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  button,
  choice,
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

type HeatKind = (typeof sectionKinds.heat)[number];

const WATER_HEAT_CAPACITY = 4.2;
const CALORIMETER_HEAT_CAPACITY = 40;
const ROOM = 20;

const media = [
  {
    name: ["Melting ice", "Barafu inayoyeyuka"] as [string, string],
    temperature: 0,
  },
  {
    name: ["Room-temperature water", "Maji ya kawaida"] as [string, string],
    temperature: 24,
  },
  {
    name: ["Warm water", "Maji ya uvuguvugu"] as [string, string],
    temperature: 45,
  },
  { name: ["Hot water", "Maji moto"] as [string, string], temperature: 70 },
  {
    name: ["Steam over boiling water", "Mvuke juu ya maji yanayochemka"] as [
      string,
      string,
    ],
    temperature: 100,
  },
];

const patients = [36.4, 37.8, 39.2, 40.6];

const hintToggle = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

function heaterPower(calorimeter: PlacedPart, env: BenchEnv) {
  return env
    .over(calorimeter, ["immersion-heater"])
    .reduce(
      (sum, heater) => sum + elementState(env.solution, heater.id).power,
      0,
    );
}

/** Temperature of the water in a calorimeter after its chosen heating time. */
export function calorimeterTemperature(calorimeter: PlacedPart, env: BenchEnv) {
  const { water, time, lagging } = calorimeter.params;
  const efficiency = lagging === 1 ? 0.97 : 0.85;
  const rise =
    (efficiency * heaterPower(calorimeter, env) * time) /
    (water * WATER_HEAT_CAPACITY + CALORIMETER_HEAT_CAPACITY);
  return ROOM + rise;
}

export const heatParts: Record<HeatKind, PartSpec> = {
  "liquid-thermometer": {
    name: t("Liquid-in-glass thermometer", "Kipimajoto cha kioevu kwenye kioo"),
    description: t(
      "−10 to 110 °C in 1 °C steps. Check the ice point (0 °C) for a zero error and read with your eye level.",
      "−10 hadi 110 °C kwa hatua za 1 °C. Kagua kiwango cha barafu (0 °C) kwa kosa la sifuri na usome jicho likiwa usawa.",
    ),
    width: 90,
    height: 400,
    controls: [
      choice(
        "medium",
        ["Bulb placed in", "Balbu imewekwa kwenye"],
        media.map((item) => item.name),
      ),
      slider(
        "eye",
        ["Viewing angle", "Pembe ya kuangalia"],
        -40,
        40,
        1,
        0,
        "°",
      ),
      hintToggle,
    ],
    analyse: ({ part, p, env }) => {
      const zero = pick(part.id, 10, [0.5, -0.5, 1, -1, 0.5]);
      const inside = env.over(part, ["calorimeter"])[0];
      const actual = inside
        ? calorimeterTemperature(inside, env)
        : media[p("medium")].temperature;
      const parallax = p("eye") * 0.025;
      const reading = actual + zero + parallax;
      const iceTest = !inside && p("medium") === 0;
      return {
        visual: { reading },
        readouts:
          p("hint") === 1
            ? [readout(["Reading", "Kipimo"], `${fixed(reading, 1)} °C`)]
            : inside
              ? [readout(["Inside", "Ndani ya"], "Calorimeter")]
              : [],
        issues: [
          ...(Math.abs(p("eye")) > 6
            ? [
                issue("parallax", "warn", [
                  "Parallax: look straight at the liquid level, not from the side.",
                  "Mchepuko: tazama moja kwa moja kiwango cha kioevu, si kutoka pembeni.",
                ]),
              ]
            : []),
          ...(iceTest && Math.abs(zero) > 0.2
            ? [
                issue("zero", "warn", [
                  "In melting ice it should read 0 °C. The difference is the zero error: apply it to every reading.",
                  "Kwenye barafu inayoyeyuka inapaswa kusoma 0 °C. Tofauti ni kosa la sifuri: litumie kwenye kila kipimo.",
                ]),
              ]
            : []),
        ],
        tasks: iceTest
          ? [
              task(
                "zero",
                ["Zero error at the ice point", "Kosa la sifuri kwenye barafu"],
                "°C",
                zero,
                0.3,
              ),
            ]
          : [
              task(
                `thermo-${p("medium")}-${inside ? inside.id : "free"}-${p("eye")}`,
                [
                  "True temperature (zero error corrected)",
                  "Joto halisi (kosa la sifuri limesahihishwa)",
                ],
                "°C",
                actual,
                0.6,
                [
                  "Find the zero error in ice first, then subtract it.",
                  "Pata kosa la sifuri kwenye barafu kwanza, kisha uliondoe.",
                ],
              ),
            ],
        measures:
          p("hint") === 1
            ? [
                measure(
                  "temperature",
                  ["Temperature", "Joto"],
                  "°C",
                  reading,
                  1,
                ),
              ]
            : [],
      };
    },
  },
  "clinical-thermometer": {
    name: t("Clinical thermometer", "Kipimajoto cha hospitali"),
    description: t(
      "Reads 35–42 °C and holds the highest value. Shake it down below 35 °C before each patient.",
      "Husoma 35–42 °C na hushikilia thamani ya juu zaidi. Kitikise hadi chini ya 35 °C kabla ya kila mgonjwa.",
    ),
    width: 360,
    height: 90,
    state: { peak: 35 },
    controls: [
      choice(
        "patient",
        ["Patient", "Mgonjwa"],
        patients.map((value) => [`${value} °C`, `${value} °C`]),
        1,
      ),
      button(
        "hold",
        ["Hold under the tongue", "Shikilia chini ya ulimi"],
        (params) => ({
          ...params,
          peak: Math.max(params.peak, patients[params.patient]),
        }),
      ),
      button("shake", ["Shake down", "Tikisa chini"], (params) => ({
        ...params,
        peak: 35,
      })),
    ],
    analyse: ({ p }) => {
      const patient = patients[p("patient")];
      const stale = p("peak") > patient + 0.05;
      return {
        visual: { reading: p("peak") },
        readouts: [
          readout(
            ["Reading", "Kipimo"],
            `${fixed(p("peak"), 1)} °C`,
            stale ? "warn" : undefined,
          ),
        ],
        issues: stale
          ? [
              issue("shake", "bad", [
                "The reading is higher than this patient's temperature: it still shows the last patient. Shake it down first.",
                "Kipimo ni cha juu kuliko joto la mgonjwa huyu: bado kinaonyesha mgonjwa wa mwisho. Kitikise kwanza.",
              ]),
            ]
          : [],
        tasks:
          p("peak") > 35
            ? [
                task(
                  `clinical-${p("patient")}-${p("peak")}`,
                  ["Temperature of this patient", "Joto la mgonjwa huyu"],
                  "°C",
                  patient,
                  0.15,
                ),
              ]
            : [],
        measures: [
          measure("temperature", ["Temperature", "Joto"], "°C", p("peak"), 1),
        ],
      };
    },
  },
  "digital-thermometer": {
    name: t("Digital thermometer", "Kipimajoto cha dijitali"),
    description: t(
      "Reads to 0.1 °C. Give it time to settle before you read.",
      "Husoma hadi 0.1 °C. Kipe muda kutulia kabla ya kusoma.",
    ),
    width: 120,
    height: 280,
    controls: [
      choice(
        "medium",
        ["Probe placed in", "Kipimo kimewekwa kwenye"],
        media.map((item) => item.name),
        3,
      ),
      toggle(
        "settled",
        ["Reading", "Kipimo"],
        ["Settled (waited)", "Imetulia (nimesubiri)"],
        ["Still changing", "Bado inabadilika"],
      ),
    ],
    analyse: ({ p }) => {
      const actual = media[p("medium")].temperature;
      const shown = p("settled") === 1 ? actual : 24 + 0.6 * (actual - 24);
      return {
        visual: { reading: shown },
        readouts: [readout(["Display", "Onyesho"], `${fixed(shown, 1)} °C`)],
        issues:
          p("settled") === 0
            ? [
                issue("wait", "warn", [
                  "The display is still rising or falling. Wait until it stops changing.",
                  "Onyesho bado linapanda au kushuka. Subiri hadi litulie.",
                ]),
              ]
            : [],
        tasks:
          p("settled") === 1
            ? [
                task(
                  `digital-${p("medium")}`,
                  ["Temperature", "Joto"],
                  "°C",
                  actual,
                  0.15,
                ),
              ]
            : [],
        measures: [
          measure("temperature", ["Temperature", "Joto"], "°C", shown, 1),
        ],
      };
    },
  },
  thermocouple: {
    name: t("Thermocouple", "Thermokapoli"),
    description: t(
      "Two metals joined: the voltage grows with the temperature difference between hot and cold junctions (about 0.041 mV per °C).",
      "Metali mbili zilizounganishwa: volteji huongezeka kwa tofauti ya joto kati ya makutano ya moto na baridi (takriban 0.041 mV kwa °C).",
    ),
    width: 190,
    height: 160,
    terminals: [
      { name: "pos", x: 150, y: 128, polarity: "+" },
      { name: "neg", x: 40, y: 128, polarity: "-" },
    ],
    controls: [
      slider("hot", ["Hot junction", "Makutano ya moto"], 0, 400, 5, 100, "°C"),
      choice(
        "cold",
        ["Cold junction in", "Makutano ya baridi kwenye"],
        [
          ["Melting ice (0 °C)", "Barafu inayoyeyuka (0 °C)"],
          ["Room (24 °C)", "Chumba (24 °C)"],
        ],
      ),
    ],
    electrical: (part) => [
      {
        type: "source",
        a: "pos",
        b: "neg",
        voltage: 0.041e-3 * (part.params.hot - [0, 24][part.params.cold]),
        internalResistance: 5,
      },
    ],
    analyse: ({ p }) => {
      const emf = 0.041 * (p("hot") - [0, 24][p("cold")]);
      return {
        visual: { hot: p("hot") },
        readouts: [
          readout(
            ["Voltage produced", "Volteji inayozalishwa"],
            `${fixed(emf, 2)} mV`,
          ),
        ],
        measures: [
          measure(
            "hot",
            ["Hot junction", "Makutano ya moto"],
            "°C",
            p("hot"),
            0,
          ),
          measure("emf", ["Voltage", "Volteji"], "mV", emf, 2),
        ],
      };
    },
  },
  "bunsen-burner": {
    name: t("Bunsen burner", "Kichomeo cha Bunsen"),
    description: t(
      "Air hole shut: a cool, yellow, sooty flame. Air hole open: a hot, blue flame for heating.",
      "Tundu la hewa limefungwa: moto wa manjano, baridi na wenye masizi. Tundu wazi: moto wa buluu, moto zaidi wa kupasha.",
    ),
    width: 120,
    height: 250,
    controls: [
      toggle(
        "gas",
        ["Gas", "Gesi"],
        ["On and lit", "Imewashwa"],
        ["Off", "Imezimwa"],
        1,
      ),
      slider(
        "air",
        ["Air hole opening", "Ufunguzi wa tundu la hewa"],
        0,
        1,
        0.1,
        0.2,
      ),
    ],
    analyse: ({ p }) => {
      const lit = p("gas") === 1;
      const blue = p("air") >= 0.4;
      const temperature = 900 + 600 * p("air");
      return {
        visual: { lit: lit ? 1 : 0, air: p("air") },
        readouts: lit
          ? [
              readout(
                ["Flame", "Mwali"],
                blue ? "Blue, non-luminous" : "Yellow, luminous",
                blue ? "ok" : "warn",
              ),
              readout(
                ["Flame temperature", "Joto la mwali"],
                `≈ ${fixed(temperature, 0)} °C`,
              ),
            ]
          : [],
        issues: lit
          ? blue
            ? []
            : [
                issue("soot", "warn", [
                  "A yellow flame is cooler and leaves soot on glassware. Open the air hole to heat.",
                  "Moto wa manjano ni baridi zaidi na huacha masizi kwenye vyombo. Fungua tundu la hewa kupasha.",
                ]),
              ]
          : [],
      };
    },
  },
  "spirit-lamp": {
    name: t("Spirit lamp", "Taa ya spiriti"),
    description: t(
      "A gentler flame than a Bunsen burner. Put the cap on to put it out; never refill while lit.",
      "Moto mpole kuliko kichomeo cha Bunsen. Funika kuuzima; usijaze ikiwa inawaka.",
    ),
    width: 110,
    height: 190,
    controls: [
      toggle(
        "lit",
        ["Flame", "Mwali"],
        ["Lit", "Unawaka"],
        ["Capped (out)", "Imefunikwa (imezimika)"],
        1,
      ),
      slider("wick", ["Wick length", "Urefu wa utambi"], 1, 6, 1, 3, "mm"),
    ],
    analyse: ({ p }) => ({
      visual: { lit: p("lit"), wick: p("wick") },
      readouts:
        p("lit") === 1
          ? [
              readout(
                ["Flame temperature", "Joto la mwali"],
                `≈ ${550 + 30 * p("wick")} °C`,
              ),
            ]
          : [],
      issues:
        p("wick") > 4 && p("lit") === 1
          ? [
              issue("wick", "warn", [
                "The wick is long and the flame smokes. Trim it.",
                "Utambi ni mrefu na moto unatoa moshi. Ufupishe.",
              ]),
            ]
          : [],
    }),
  },
  tripod: {
    name: t("Tripod stand", "Stendi ya miguu mitatu"),
    description: t(
      "Holds a gauze and beaker about 15 cm above the flame.",
      "Hushikilia wavu na bikari takriban sentimita 15 juu ya moto.",
    ),
    width: 170,
    height: 190,
    analyse: () => ({
      issues: [
        issue("use", "tip", [
          "Stand it on a heat-proof mat and rest a wire gauze on top before a beaker.",
          "Isimamishe kwenye mkeka usiopasuka kwa joto na uweke wavu juu kabla ya bikari.",
        ]),
      ],
    }),
  },
  "wire-gauze": {
    name: t("Wire gauze", "Wavu wa waya"),
    description: t(
      "Spreads the flame's heat so glass is not heated at one point and cracked.",
      "Husambaza joto la moto ili kioo kisipashwe sehemu moja na kupasuka.",
    ),
    width: 140,
    height: 90,
    controls: [
      toggle(
        "placed",
        ["Between flame and glass", "Kati ya moto na kioo"],
        ["Yes", "Ndiyo"],
        ["No", "Hapana"],
        1,
      ),
      slider(
        "flame",
        ["Flame temperature", "Joto la mwali"],
        400,
        1500,
        50,
        1400,
        "°C",
      ),
    ],
    analyse: ({ p }) => {
      const cracks = p("placed") === 0 && p("flame") > 1100;
      return {
        visual: { placed: p("placed") },
        readouts: [
          readout(
            ["Heat at the glass", "Joto kwenye kioo"],
            p("placed") === 1 ? "Spread evenly" : "Concentrated in one spot",
            cracks ? "bad" : "ok",
          ),
        ],
        issues: cracks
          ? [
              issue("crack", "bad", [
                "A direct hot flame on glass makes one spot expand more than the rest, and the glass cracks. Use the gauze.",
                "Moto mkali moja kwa moja kwenye kioo hufanya sehemu moja kupanuka zaidi, na kioo hupasuka. Tumia wavu.",
              ]),
            ]
          : [],
      };
    },
  },
  calorimeter: {
    name: t(
      "Calorimeter with stirrer and lagging",
      "Kalorimita yenye kikorogeo na kinga ya joto",
    ),
    description: t(
      "Water heated by an immersion heater placed over it. Lagging reduces heat loss; stirring evens out the temperature.",
      "Maji yanayopashwa na hita iliyowekwa juu yake. Kinga hupunguza upotevu wa joto; kukoroga husawazisha joto.",
    ),
    width: 190,
    height: 210,
    controls: [
      slider(
        "water",
        ["Mass of water", "Wingi wa maji"],
        50,
        250,
        10,
        150,
        "g",
      ),
      toggle(
        "lagging",
        ["Lagging", "Kinga ya joto"],
        ["Fitted", "Imewekwa"],
        ["None", "Hakuna"],
      ),
      toggle(
        "stirrer",
        ["Stirring", "Kukoroga"],
        ["Stirred", "Inakorogwa"],
        ["Not stirred", "Haikorogwi"],
        1,
      ),
      slider("time", ["Heating time", "Muda wa kupasha"], 0, 600, 10, 0, "s"),
    ],
    analyse: ({ part, p, env }) => {
      const power = heaterPower(part, env);
      const temperature = calorimeterTemperature(part, env);
      const energy = power * p("time");
      const near =
        temperature + (p("stirrer") === 1 ? 0 : 0.12 * (temperature - ROOM));
      return {
        visual: { temperature, water: p("water"), power },
        readouts: [
          readout(
            ["Heater inside", "Hita ndani"],
            power > 0 ? `${fixed(power, 1)} W` : "None or off",
            power > 0 ? "ok" : "warn",
          ),
          readout(
            ["Energy supplied", "Nishati iliyotolewa"],
            `${fixed(energy, 0)} J`,
          ),
          readout(
            ["Water temperature", "Joto la maji"],
            `${fixed(near, 1)} °C`,
          ),
        ],
        issues: [
          ...(env.over(part, ["immersion-heater"]).length === 0
            ? [
                issue("heater", "tip", [
                  "Place an immersion heater over the calorimeter and connect it to a power supply.",
                  "Weka hita ya kuzamisha juu ya kalorimita na uiunganishe na chanzo cha umeme.",
                ]),
              ]
            : []),
          ...(p("stirrer") === 0 && p("time") > 0
            ? [
                issue("stir", "warn", [
                  "Without stirring the water near the heater is hotter than the rest.",
                  "Bila kukoroga maji karibu na hita ni moto zaidi kuliko mengine.",
                ]),
              ]
            : []),
          ...(p("lagging") === 0 && p("time") > 0
            ? [
                issue("loss", "tip", [
                  "Without lagging about 15% of the heat escapes to the room.",
                  "Bila kinga takriban 15% ya joto hutoroka kwenda chumbani.",
                ]),
              ]
            : []),
        ],
        measures: [
          measure("time", ["Time", "Muda"], "s", p("time"), 0),
          measure("temperature", ["Temperature", "Joto"], "°C", near, 1),
          measure(
            "energy",
            ["Energy supplied", "Nishati iliyotolewa"],
            "J",
            energy,
            0,
          ),
        ],
        tasks: [
          ...(power > 0 && p("time") > 0
            ? [
                task(
                  `cal-${part.id}-${p("water")}-${p("time")}-${p("lagging")}-${power.toFixed(1)}`,
                  [
                    "Rise in temperature of the water",
                    "Ongezeko la joto la maji",
                  ],
                  "°C",
                  temperature - ROOM,
                  0.4,
                  [
                    "Energy = power × time = (m c + calorimeter) × rise, allowing for heat lost.",
                    "Nishati = nguvu × muda = (m c + kalorimita) × ongezeko, ukizingatia joto lililopotea.",
                  ],
                ),
              ]
            : []),
        ],
      };
    },
  },
  "immersion-heater": {
    name: t("Immersion heater (12 V)", "Hita ya kuzamisha (12 V)"),
    description: t(
      "A 4 Ω heating coil (36 W at 12 V). Put it in water before switching on.",
      "Koili ya kupasha ya 4 Ω (36 W kwa 12 V). Iweke majini kabla ya kuwasha.",
    ),
    width: 130,
    height: 190,
    terminals: [
      { name: "a", x: 30, y: 16 },
      { name: "b", x: 100, y: 16 },
    ],
    electrical: () => [{ type: "resistor", a: "a", b: "b", resistance: 4 }],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      const wet =
        env.over(part, ["calorimeter", "beaker", "round-bottom-flask"]).length >
        0;
      return {
        visual: { power: state.power },
        readouts: [
          readout(["Power", "Nguvu"], `${fixed(state.power, 1)} W`),
          readout(
            ["Voltage", "Volteji"],
            `${fixed(Math.abs(state.voltage), 1)} V`,
          ),
        ],
        issues:
          state.power > 1 && !wet
            ? [
                issue("dry", "bad", [
                  "The heater is on in air and would burn out. Lower it into water.",
                  "Hita imewaka hewani na ingeungua. Iteremshe majini.",
                ]),
              ]
            : state.voltage > 14
              ? [
                  issue("over", "bad", [
                    "More than the 12 V rating: the element would burn out.",
                    "Zaidi ya 12 V iliyokadiriwa: koili ingeungua.",
                  ]),
                ]
              : [],
        measures: [measure("power", ["Power", "Nguvu"], "W", state.power, 1)],
      };
    },
  },
  "bimetallic-strip": {
    name: t("Bimetallic strip", "Utepe wa metali mbili"),
    description: t(
      "Two metals bonded together expand by different amounts, so the strip bends. Used as a thermostat switch.",
      "Metali mbili zilizounganishwa hupanuka kwa viwango tofauti, kwa hiyo utepe hupinda. Hutumika kama swichi ya thermostati.",
    ),
    width: 300,
    height: 200,
    terminals: [
      { name: "a", x: 24, y: 168 },
      { name: "b", x: 266, y: 168 },
    ],
    controls: [
      choice(
        "pair",
        ["Metals", "Metali"],
        [
          ["Brass and iron", "Shaba na chuma"],
          ["Brass and invar", "Shaba na invar"],
        ],
      ),
      slider(
        "temp",
        ["Temperature of the strip", "Joto la utepe"],
        20,
        300,
        5,
        20,
        "°C",
      ),
      slider(
        "set",
        ["Thermostat contact set at", "Mawasiliano yamewekwa kwa"],
        60,
        200,
        5,
        100,
        "°C",
      ),
    ],
    electrical: (part) => [
      part.params.temp >= part.params.set
        ? { type: "resistor", a: "a", b: "b", resistance: 0.01 }
        : { type: "resistor", a: "a", b: "b", resistance: 1e9 },
    ],
    analyse: ({ p }) => {
      const rate = [0.035, 0.09][p("pair")];
      const deflection = rate * (p("temp") - 20);
      const closed = p("temp") >= p("set");
      return {
        visual: { bend: deflection, closed: closed ? 1 : 0 },
        readouts: [
          readout(["Deflection", "Mpindo"], `${fixed(deflection, 1)} mm`),
          readout(
            ["Contact", "Mawasiliano"],
            closed ? "Closed (circuit on)" : "Open",
            closed ? "ok" : undefined,
          ),
          readout(
            ["Bends towards", "Hupinda kuelekea"],
            p("pair") === 0 ? "the iron side" : "the invar side",
          ),
        ],
        measures: [
          measure("temp", ["Temperature", "Joto"], "°C", p("temp"), 0),
          measure("bend", ["Deflection", "Mpindo"], "mm", deflection, 1),
        ],
      };
    },
  },
  "ball-and-ring": {
    name: t("Ball and ring apparatus", "Kifaa cha mpira na pete"),
    description: t(
      "A steel ball just passes through the ring when cold. Heat the ball and it no longer fits; heat the ring too and it does again.",
      "Mpira wa chuma hupita kwenye pete ukiwa baridi. Ukipasha mpira haupiti; pasha pete pia na hupita tena.",
    ),
    width: 300,
    height: 230,
    controls: [
      slider(
        "ball",
        ["Temperature of the ball", "Joto la mpira"],
        20,
        300,
        5,
        20,
        "°C",
      ),
      slider(
        "ring",
        ["Temperature of the ring", "Joto la pete"],
        20,
        300,
        5,
        20,
        "°C",
      ),
    ],
    analyse: ({ p }) => {
      const alpha = 1.2e-5;
      const ball = 20 * (1 + alpha * (p("ball") - 20));
      const ring = 20.02 * (1 + alpha * (p("ring") - 20));
      const fits = ball <= ring - 0.0005;
      return {
        visual: { ball: p("ball"), ring: p("ring"), fits: fits ? 1 : 0 },
        readouts: [
          readout(
            ["Ball diameter", "Kipenyo cha mpira"],
            `${fixed(ball, 3)} mm`,
          ),
          readout(
            ["Ring diameter", "Kipenyo cha pete"],
            `${fixed(ring, 3)} mm`,
          ),
          readout(
            ["Ball passes through", "Mpira unapita"],
            fits ? "Yes" : "No",
            fits ? "ok" : "warn",
          ),
        ],
      };
    },
  },
  "boyle-apparatus": {
    name: t("Boyle's law apparatus", "Kifaa cha sheria ya Boyle"),
    description: t(
      "Trapped air in a tube with a pressure gauge. Squeeze it slowly so the temperature stays constant: P × V stays the same.",
      "Hewa iliyonaswa kwenye bomba yenye kipimo cha shinikizo. Ibane polepole joto libaki sawa: P × V haibadiliki.",
    ),
    width: 220,
    height: 360,
    controls: [
      slider(
        "volume",
        ["Volume of trapped air", "Ujazo wa hewa iliyonaswa"],
        10,
        50,
        1,
        30,
        "cm³",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const pressure = 3000 / p("volume");
      return {
        visual: { volume: p("volume"), pressure },
        readouts:
          p("hint") === 1
            ? [readout(["Gauge", "Kipimo"], `${fixed(pressure, 0)} kPa`)]
            : [],
        tasks: [
          task(
            `boyle-${p("volume")}`,
            ["Pressure of the trapped air", "Shinikizo la hewa iliyonaswa"],
            "kPa",
            pressure,
            Math.max(2, pressure * 0.02),
            [
              "Read the gauge. Then check that P × V is constant.",
              "Soma kipimo. Kisha hakikisha P × V ni sawa.",
            ],
          ),
        ],
        measures: [
          measure("volume", ["Volume V", "Ujazo V"], "cm³", p("volume"), 0),
          measure(
            "pressure",
            ["Pressure P", "Shinikizo P"],
            "kPa",
            pressure,
            0,
          ),
          measure("inverse", ["1/V", "1/V"], "1/cm³", 1 / p("volume"), 3),
        ],
      };
    },
  },
  "charles-apparatus": {
    name: t("Charles's law apparatus", "Kifaa cha sheria ya Charles"),
    description: t(
      "A column of air trapped by a thread of acid in a capillary tube, in a water bath. Length grows steadily with temperature.",
      "Safu ya hewa iliyonaswa na asidi kwenye mrija mwembamba ndani ya maji. Urefu huongezeka sawia na joto.",
    ),
    width: 380,
    height: 200,
    controls: [
      slider(
        "bath",
        ["Water bath temperature", "Joto la maji"],
        0,
        100,
        5,
        20,
        "°C",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const length = (200 * (273 + p("bath"))) / 293;
      return {
        visual: { length },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Air column", "Safu ya hewa"],
                  `${fixed(length, 0)} mm`,
                ),
              ]
            : [],
        tasks: [
          task(
            `charles-${p("bath")}`,
            ["Length of the air column", "Urefu wa safu ya hewa"],
            "mm",
            length,
            1.5,
          ),
        ],
        measures: [
          measure("temp", ["Temperature", "Joto"], "°C", p("bath"), 0),
          measure(
            "length",
            ["Air column length", "Urefu wa hewa"],
            "mm",
            length,
            0,
          ),
        ],
      };
    },
  },
  "pressure-law-apparatus": {
    name: t("Pressure law apparatus", "Kifaa cha sheria ya shinikizo"),
    description: t(
      "Air sealed in a flask at constant volume with a gauge. Pressure rises steadily as the temperature rises.",
      "Hewa iliyofungwa kwenye chupa yenye ujazo usiobadilika na kipimo. Shinikizo hupanda sawia na joto.",
    ),
    width: 320,
    height: 280,
    controls: [
      slider(
        "bath",
        ["Water bath temperature", "Joto la maji"],
        20,
        100,
        5,
        20,
        "°C",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const pressure = (100 * (273 + p("bath"))) / 293;
      return {
        visual: { pressure },
        readouts:
          p("hint") === 1
            ? [readout(["Gauge", "Kipimo"], `${fixed(pressure, 1)} kPa`)]
            : [],
        tasks: [
          task(
            `pressure-law-${p("bath")}`,
            [
              "Pressure shown by the gauge",
              "Shinikizo linaloonyeshwa na kipimo",
            ],
            "kPa",
            pressure,
            1.2,
          ),
        ],
        measures: [
          measure("temp", ["Temperature", "Joto"], "°C", p("bath"), 0),
          measure("pressure", ["Pressure", "Shinikizo"], "kPa", pressure, 1),
        ],
      };
    },
  },
  "round-bottom-flask": {
    name: t("Round-bottom flask", "Chupa ya chini ya duara"),
    description: t(
      "Heats evenly. Fill no more than two-thirds, and clamp it before heating.",
      "Hupashwa sawasawa. Usijaze zaidi ya theluthi mbili, na uibane kabla ya kupasha.",
    ),
    width: 170,
    height: 200,
    controls: [
      slider(
        "volume",
        ["Liquid in the flask", "Kioevu kwenye chupa"],
        0,
        500,
        25,
        200,
        "mL",
      ),
    ],
    analyse: ({ p }) => ({
      visual: { fill: p("volume") / 500 },
      readouts: [
        readout(
          ["Filled", "Imejaa"],
          `${fixed((p("volume") / 500) * 100, 0)} %`,
          p("volume") > 333 ? "warn" : "ok",
        ),
      ],
      issues:
        p("volume") > 333
          ? [
              issue("full", "warn", [
                "More than two-thirds full: the liquid could boil over when heated.",
                "Imejaa zaidi ya theluthi mbili: kioevu kinaweza kufurika kikipashwa.",
              ]),
            ]
          : [],
    }),
  },
  "glass-tubing": {
    name: t("Glass tubing", "Mrija wa kioo"),
    description: t(
      "Carries gases or liquids between vessels. Bends are made by softening the glass in a flame.",
      "Hubeba gesi au vimiminika kati ya vyombo. Mikunjo hutengenezwa kwa kulainisha kioo motoni.",
    ),
    width: 220,
    height: 110,
    controls: [
      choice(
        "shape",
        ["Shape", "Umbo"],
        [
          ["Straight", "Ulionyooka"],
          ["Right-angle bend", "Mkunjo wa pembe kodi"],
          ["U-bend", "Mkunjo wa U"],
        ],
      ),
    ],
    analyse: ({ p }) => ({
      visual: { shape: p("shape") },
      readouts: [
        readout(
          ["Use", "Matumizi"],
          [
            "Connecting vessels",
            "Delivery tube for gases",
            "Trap or manometer",
          ][p("shape")],
        ),
      ],
    }),
  },
};
