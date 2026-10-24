import type { PartSpec } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  G,
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

type FluidsKind = (typeof sectionKinds.fluids)[number];

const ATMOSPHERE = 101.3;

const manometerLiquids = [
  { name: ["Mercury", "Zebaki"] as [string, string], density: 13600 },
  { name: ["Water", "Maji"] as [string, string], density: 1000 },
  { name: ["Oil", "Mafuta"] as [string, string], density: 800 },
];

const vaseLiquids = [
  { name: ["Water", "Maji"] as [string, string], density: 1000 },
  { name: ["Brine", "Maji ya chumvi"] as [string, string], density: 1180 },
  {
    name: ["Cooking oil", "Mafuta ya kupikia"] as [string, string],
    density: 920,
  },
];

const hydrometerLiquids = [
  { name: ["Petrol", "Petroli"] as [string, string], gravity: 0.74 },
  { name: ["Ethanol", "Spiriti"] as [string, string], gravity: 0.8 },
  { name: ["Pure water", "Maji safi"] as [string, string], gravity: 1 },
  { name: ["Milk", "Maziwa"] as [string, string], gravity: 1.03 },
  { name: ["Brine", "Maji ya chumvi"] as [string, string], gravity: 1.2 },
];

const hintToggle = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

/** Atmospheric pressure in kPa at an altitude in metres above sea level. */
export function pressureAtAltitude(altitude: number) {
  return ATMOSPHERE * Math.exp(-altitude / 8400);
}

export const fluidsParts: Record<FluidsKind, PartSpec> = {
  "u-tube-manometer": {
    name: t("U-tube manometer", "Manometa ya bomba la U"),
    description: t(
      "Gas pressure above the atmosphere pushes one column down: P = atmospheric + hρg.",
      "Shinikizo la gesi juu ya angahewa husukuma safu moja chini: P = angahewa + hρg.",
    ),
    width: 240,
    height: 380,
    controls: [
      choice(
        "liquid",
        ["Liquid in the tube", "Kioevu kwenye bomba"],
        manometerLiquids.map((item) => item.name),
      ),
      slider(
        "pressure",
        ["Gas pressure above the air", "Shinikizo la gesi juu ya hewa"],
        -20,
        20,
        0.5,
        8,
        "kPa",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const density = manometerLiquids[p("liquid")].density;
      const height = ((p("pressure") * 1000) / (density * G)) * 1000;
      const offScale = Math.abs(height) > 300;
      return {
        visual: { height: clamp(height, -300, 300) },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Height difference h", "Tofauti ya urefu h"],
                  `${fixed(Math.abs(height), 0)} mm`,
                ),
              ]
            : [],
        issues: offScale
          ? [
              issue("scale", "bad", [
                "The liquid is pushed off the scale. Use a denser liquid such as mercury or lower the pressure.",
                "Kioevu kimesukumwa nje ya kipimo. Tumia kioevu kizito kama zebaki au punguza shinikizo.",
              ]),
            ]
          : [],
        tasks: offScale
          ? []
          : [
              task(
                `manometer-${p("liquid")}-${p("pressure")}`,
                [
                  "Gas pressure above the atmosphere",
                  "Shinikizo la gesi juu ya angahewa",
                ],
                "kPa",
                p("pressure"),
                0.4,
                [
                  "Pressure difference = h ρ g, with h in metres.",
                  "Tofauti ya shinikizo = h ρ g, h ikiwa kwa mita.",
                ],
              ),
            ],
        measures: [
          measure(
            "h",
            ["Height difference", "Tofauti ya urefu"],
            "mm",
            Math.abs(height),
            0,
          ),
          measure(
            "pressure",
            ["Gas pressure", "Shinikizo la gesi"],
            "kPa",
            ATMOSPHERE + p("pressure"),
            1,
          ),
        ],
      };
    },
  },
  "mercury-barometer": {
    name: t("Mercury barometer", "Barometa ya zebaki"),
    description: t(
      "The column's vertical height measures air pressure: about 760 mm at sea level. Tilting the tube does not change it.",
      "Urefu wima wa safu hupima shinikizo la hewa: takriban 760 mm usawa wa bahari. Kuinamisha bomba hakubadilishi.",
    ),
    width: 190,
    height: 470,
    controls: [
      slider("altitude", ["Altitude", "Mwinuko"], 0, 3000, 50, 0, "m"),
      slider(
        "tilt",
        ["Tilt of the tube", "Mwinamo wa bomba"],
        0,
        40,
        1,
        0,
        "°",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const kilopascals = pressureAtAltitude(p("altitude"));
      const height = kilopascals / 0.13332;
      return {
        visual: { height, tilt: p("tilt") },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Vertical height", "Urefu wima"],
                  `${fixed(height, 0)} mm Hg`,
                ),
                readout(
                  ["Pressure", "Shinikizo"],
                  `${fixed(kilopascals, 1)} kPa`,
                ),
              ]
            : [],
        issues:
          p("tilt") > 0
            ? [
                issue("tilt", "tip", [
                  "The mercury is longer along the slanted tube but its vertical height, which is what counts, is unchanged.",
                  "Zebaki ni ndefu kwenye bomba lililoinama lakini urefu wake wima, unaohesabiwa, haujabadilika.",
                ]),
              ]
            : [],
        tasks: [
          task(
            `mercury-${p("altitude")}`,
            ["Atmospheric pressure", "Shinikizo la angahewa"],
            "mm Hg",
            height,
            4,
            [
              "Read the vertical height from the mercury level in the dish.",
              "Soma urefu wima kutoka kiwango cha zebaki kwenye sahani.",
            ],
          ),
        ],
        measures: [
          measure(
            "pressure",
            ["Atmospheric pressure", "Shinikizo la angahewa"],
            "mm Hg",
            height,
            0,
          ),
          measure("altitude", ["Altitude", "Mwinuko"], "m", p("altitude"), 0),
        ],
      };
    },
  },
  "aneroid-barometer": {
    name: t("Aneroid barometer", "Barometa ya aneroidi"),
    description: t(
      "A sealed metal box flexes with air pressure and moves a needle. Reads lower on a mountain.",
      "Sanduku la chuma lililofungwa hupinda kwa shinikizo la hewa na kusogeza sindano. Husoma chini mlimani.",
    ),
    width: 220,
    height: 240,
    controls: [
      slider("altitude", ["Altitude", "Mwinuko"], 0, 3000, 50, 1500, "m"),
      slider(
        "adjust",
        ["Setting screw", "Skrubu ya kuweka"],
        -5,
        5,
        0.5,
        0,
        "kPa",
      ),
      hintToggle,
    ],
    analyse: ({ part, p }) => {
      const offset = pick(part.id, 8, [1.5, -2, 2.5, -1, 3]);
      const actual = pressureAtAltitude(p("altitude"));
      const shown = actual + offset + p("adjust");
      return {
        visual: { shown },
        readouts:
          p("hint") === 1
            ? [readout(["Needle", "Sindano"], `${fixed(shown, 1)} kPa`)]
            : [],
        issues:
          p("altitude") === 0 && Math.abs(offset + p("adjust")) > 0.6
            ? [
                issue("set", "tip", [
                  "At sea level the needle should show 101.3 kPa. Turn the setting screw to correct it.",
                  "Usawa wa bahari sindano inapaswa kuonyesha 101.3 kPa. Zungusha skrubu kuirekebisha.",
                ]),
              ]
            : [],
        tasks: [
          task(
            `aneroid-${p("altitude")}-${p("adjust")}`,
            [
              "Pressure shown by the needle",
              "Shinikizo linaloonyeshwa na sindano",
            ],
            "kPa",
            shown,
            0.6,
          ),
        ],
        measures: [
          measure("pressure", ["Pressure", "Shinikizo"], "kPa", shown, 1),
        ],
      };
    },
  },
  "hydraulic-press": {
    name: t("Hydraulic press model", "Mfano wa mashine ya haidroliki"),
    description: t(
      "Pressure is transmitted equally through the liquid, so a small force on a small piston gives a large force on a big one.",
      "Shinikizo husambaa sawa ndani ya kioevu, kwa hiyo nguvu ndogo kwenye pistoni ndogo hutoa nguvu kubwa kwenye kubwa.",
    ),
    width: 320,
    height: 300,
    controls: [
      choice(
        "a1",
        ["Small piston area", "Eneo la pistoni ndogo"],
        [
          ["2 cm²", "2 cm²"],
          ["4 cm²", "4 cm²"],
        ],
      ),
      choice(
        "a2",
        ["Large piston area", "Eneo la pistoni kubwa"],
        [
          ["40 cm²", "40 cm²"],
          ["80 cm²", "80 cm²"],
          ["120 cm²", "120 cm²"],
        ],
        1,
      ),
      slider(
        "force",
        ["Force on the small piston", "Nguvu kwenye pistoni ndogo"],
        5,
        200,
        5,
        50,
        "N",
      ),
      slider(
        "stroke",
        ["Small piston moves down", "Pistoni ndogo inashuka"],
        1,
        10,
        1,
        5,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const a1 = [2, 4][p("a1")];
      const a2 = [40, 80, 120][p("a2")];
      const output = (p("force") * a2) / a1;
      const lift = (p("stroke") * a1) / a2;
      return {
        visual: { stroke: p("stroke"), lift },
        readouts: [
          readout(
            ["Pressure", "Shinikizo"],
            `${fixed((p("force") / a1) * 10, 0)} kPa`,
          ),
          readout(
            ["Force from the large piston", "Nguvu ya pistoni kubwa"],
            `${fixed(output, 0)} N`,
          ),
          readout(
            ["Large piston rises", "Pistoni kubwa inapanda"],
            `${fixed(lift * 10, 1)} mm`,
          ),
        ],
        tasks: [
          task(
            `press-${p("a1")}-${p("a2")}-${p("force")}`,
            ["Force on the large piston", "Nguvu kwenye pistoni kubwa"],
            "N",
            output,
            Math.max(2, output * 0.01),
            ["F₁ ÷ A₁ = F₂ ÷ A₂.", "F₁ ÷ A₁ = F₂ ÷ A₂."],
          ),
        ],
        measures: [
          measure(
            "output",
            ["Output force", "Nguvu ya kutoka"],
            "N",
            output,
            0,
          ),
        ],
      };
    },
  },
  "pascals-vase": {
    name: t("Pascal's vase", "Chombo cha Pascal"),
    description: t(
      "Tubes of different shapes joined at the base fill to the same level. Pressure depends on depth, not on shape.",
      "Mirija ya maumbo tofauti iliyounganishwa chini hujaa kwa kiwango sawa. Shinikizo hutegemea kina, si umbo.",
    ),
    width: 360,
    height: 330,
    controls: [
      choice(
        "liquid",
        ["Liquid", "Kioevu"],
        vaseLiquids.map((item) => item.name),
      ),
      slider(
        "fill",
        ["Level of liquid", "Kiwango cha kioevu"],
        5,
        30,
        1,
        20,
        "cm",
      ),
      slider(
        "depth",
        ["Pressure probe depth", "Kina cha kipimo"],
        0,
        30,
        1,
        10,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const density = vaseLiquids[p("liquid")].density;
      const depth = Math.min(p("depth"), p("fill"));
      const pressure = (density * G * depth) / 100 / 1000;
      return {
        visual: { fill: p("fill"), depth },
        readouts: [
          readout(
            ["Level in every tube", "Kiwango kwenye kila bomba"],
            `${p("fill")} cm`,
          ),
          readout(
            ["Pressure at the probe", "Shinikizo kwenye kipimo"],
            `${fixed(pressure, 2)} kPa`,
          ),
        ],
        issues:
          p("depth") > p("fill")
            ? [
                issue("depth", "tip", [
                  "The probe is above the liquid surface, so it measures nothing extra.",
                  "Kipimo kiko juu ya uso wa kioevu, kwa hiyo hakipimi cha ziada.",
                ]),
              ]
            : [],
        tasks: [
          task(
            `vase-${p("liquid")}-${depth}`,
            [
              "Pressure at the probe (gauge)",
              "Shinikizo kwenye kipimo (kipimo cha mita)",
            ],
            "kPa",
            pressure,
            0.05,
            [
              "P = ρ g h, with h in metres and ρ in kg/m³.",
              "P = ρ g h, h kwa mita na ρ kwa kg/m³.",
            ],
          ),
        ],
        measures: [
          measure("depth", ["Depth", "Kina"], "cm", depth, 0),
          measure("pressure", ["Pressure", "Shinikizo"], "kPa", pressure, 2),
        ],
      };
    },
  },
  hydrometer: {
    name: t("Hydrometer", "Haidromita"),
    description: t(
      "Floats lower in a less dense liquid. Read the scale where the liquid surface cuts the stem.",
      "Huelea chini zaidi kwenye kioevu chenye msongamano mdogo. Soma kipimo mahali uso wa kioevu unapokata fimbo.",
    ),
    width: 140,
    height: 340,
    controls: [
      choice(
        "liquid",
        ["Liquid in the jar", "Kioevu kwenye jagi"],
        hydrometerLiquids.map((item) => item.name),
        2,
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const gravity = hydrometerLiquids[p("liquid")].gravity;
      return {
        visual: { gravity },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Relative density", "Msongamano linganishi"],
                  fixed(gravity, 3),
                ),
              ]
            : [],
        tasks: [
          task(
            `hydro-${p("liquid")}`,
            [
              "Relative density of the liquid",
              "Msongamano linganishi wa kioevu",
            ],
            "",
            gravity,
            0.006,
            [
              "Read the scale at the point where the liquid surface meets the stem.",
              "Soma kipimo mahali uso wa kioevu unapokutana na fimbo.",
            ],
          ),
        ],
        measures: [
          measure(
            "sg",
            ["Relative density", "Msongamano linganishi"],
            "",
            gravity,
            3,
          ),
        ],
      };
    },
  },
  "bourdon-gauge": {
    name: t("Bourdon gauge", "Kipimo cha Bourdon"),
    description: t(
      "A curled tube straightens as pressure rises and turns the needle. Check it reads zero when open to the air.",
      "Bomba lililoviringika hunyooka shinikizo likipanda na kugeuza sindano. Hakikisha inasoma sifuri wazi hewani.",
    ),
    width: 220,
    height: 250,
    controls: [
      toggle(
        "vent",
        ["Gauge inlet", "Mlango wa kipimo"],
        ["Open to the air (zero check)", "Wazi hewani (kagua sifuri)"],
        ["Connected to the pump", "Umeunganishwa na pampu"],
      ),
      slider(
        "pressure",
        ["Pump pressure", "Shinikizo la pampu"],
        0,
        600,
        10,
        240,
        "kPa",
        (params) => params.vent === 0,
      ),
      slider(
        "adjust",
        ["Zero setting screw", "Skrubu ya kuweka sifuri"],
        -20,
        20,
        1,
        0,
        "kPa",
      ),
      hintToggle,
    ],
    analyse: ({ part, p }) => {
      const zero = pick(part.id, 9, [10, -15, 20, 8, -10]);
      const actual = p("vent") === 1 ? 0 : p("pressure");
      const shown = clamp(actual + zero + p("adjust"), -30, 650);
      return {
        visual: { shown },
        readouts:
          p("hint") === 1
            ? [readout(["Needle", "Sindano"], `${fixed(shown, 0)} kPa`)]
            : [],
        issues:
          p("vent") === 1 && Math.abs(zero + p("adjust")) > 3
            ? [
                issue("zero", "warn", [
                  "Open to the air the needle should read zero. Note the zero error or turn the setting screw.",
                  "Wazi hewani sindano inapaswa kusoma sifuri. Andika kosa la sifuri au zungusha skrubu.",
                ]),
              ]
            : [],
        tasks:
          p("vent") === 1
            ? [
                task(
                  "zero",
                  ["Zero error", "Kosa la sifuri"],
                  "kPa",
                  zero + p("adjust"),
                  3,
                ),
              ]
            : [
                task(
                  `bourdon-${p("pressure")}-${p("adjust")}`,
                  [
                    "True pressure (after correcting zero error)",
                    "Shinikizo halisi (baada ya kusahihisha)",
                  ],
                  "kPa",
                  actual,
                  6,
                  [
                    "True pressure = reading − zero error.",
                    "Shinikizo halisi = kipimo − kosa la sifuri.",
                  ],
                ),
              ],
        measures: [
          measure(
            "pressure",
            ["Gauge reading", "Kipimo cha mita"],
            "kPa",
            shown,
            0,
          ),
        ],
      };
    },
  },
};
