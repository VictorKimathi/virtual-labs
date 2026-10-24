import {
  elementState,
  potentialOf,
  type CircuitSolution,
} from "../../circuit/solution";
import type {
  AnalysisInput,
  ElectricalElement,
  Outcome,
  PartSpec,
  PlacedPart,
} from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
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
  toggle,
} from "./helpers";

type ElectricityKind = (typeof sectionKinds.electricity)[number];

const OPEN = 1e9;

const bulbRatings = [
  {
    volts: 2.5,
    watts: 0.625,
    label: ["2.5 V, 0.25 A", "2.5 V, 0.25 A"] as [string, string],
  },
  { volts: 6, watts: 3, label: ["6 V, 3 W", "6 V, 3 W"] as [string, string] },
  {
    volts: 12,
    watts: 12,
    label: ["12 V, 12 W", "12 V, 12 W"] as [string, string],
  },
];

export function bulbRating(part: Pick<PlacedPart, "params">) {
  return bulbRatings[part.params.rating ?? 0];
}

export function bulbBrightness(
  solution: CircuitSolution,
  part: Pick<PlacedPart, "id" | "params">,
) {
  return elementState(solution, part.id).power / bulbRating(part).watts;
}

export const LIT_BRIGHTNESS = 0.05;
export const OVERLOAD_BRIGHTNESS = 2.5;

const standardResistors = [1, 2, 5, 10, 20, 47, 100, 220, 470, 1000];

export function resistorValue(part: Pick<PlacedPart, "params">) {
  return standardResistors[part.params.ohms ?? 3];
}

const wireMaterials = [
  { name: ["Nichrome", "Nikromu"] as [string, string], resistivity: 1.1e-6 },
  {
    name: ["Constantan", "Konstantani"] as [string, string],
    resistivity: 4.9e-7,
  },
  { name: ["Copper", "Shaba"] as [string, string], resistivity: 1.7e-8 },
];
const wireDiameters = [0.2, 0.3, 0.5];

export function wireResistance(part: Pick<PlacedPart, "params">) {
  const { material, gauge, length } = part.params;
  const area = Math.PI * (wireDiameters[gauge] / 2000) ** 2;
  return Math.max(
    0.01,
    (wireMaterials[material].resistivity * (length / 100)) / area,
  );
}

const acIssue = issue("ac", "warn", [
  "This d.c. meter cannot follow an alternating current, so it reads zero. Use an a.c. setting.",
  "Mita hii ya d.c. haiwezi kufuata mkondo mbadala, kwa hiyo inasoma sifuri. Tumia mpangilio wa a.c.",
]);

type MeterSpec = {
  base: "A" | "V";
  unit: string;
  scale: number;
  fullScales: number[];
  resistances: number[];
  rangeLabels: [string, string][];
  salt: number;
};

function needleMeter(
  spec: MeterSpec,
): Pick<PartSpec, "controls" | "analyse" | "electrical" | "state"> {
  return {
    controls: [
      choice(
        "range",
        ["Range", "Kiwango"],
        spec.rangeLabels,
        spec.rangeLabels.length - 1,
      ),
      slider(
        "adjust",
        ["Zero adjusting screw", "Skrubu ya kurekebisha sifuri"],
        -6,
        6,
        0.5,
        0,
        "%",
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "pos",
        b: "neg",
        resistance: spec.resistances[part.params.range],
      },
    ],
    analyse: ({ part, p, env }: AnalysisInput): Outcome => {
      const state = elementState(env.solution, part.id);
      const raw = env.solution.ac
        ? 0
        : spec.base === "A"
          ? state.current
          : state.voltage;
      const fullScale = spec.fullScales[p("range")];
      const zero = pick(part.id, spec.salt, [4, -3, 5, -2, 3]);
      const offset = zero + p("adjust");
      const fraction = clamp(raw / fullScale + offset / 100, -0.12, 1.1);
      const reading = fraction * fullScale * spec.scale;
      const resting = Math.abs(raw) < 0.003 * fullScale;
      return {
        visual: { fraction, fullScale: fullScale * spec.scale, offset },
        issues: [
          ...(env.solution.ac && Math.abs(state.voltage) > 1e-3
            ? [acIssue]
            : []),
          ...(resting && Math.abs(offset) >= 1
            ? [
                issue("zero", "warn", [
                  "The needle does not rest on zero. With the meter disconnected, turn the zero adjusting screw until it does.",
                  "Sindano haitulii sifuri. Mita ikiwa imetenganishwa, zungusha skrubu ya sifuri hadi itulie.",
                ]),
              ]
            : []),
          ...(raw < -0.01 * fullScale
            ? [
                issue("polarity", "bad", [
                  "The needle is pushed against the stop: the meter is connected the wrong way round. Swap the leads so + meets the positive side.",
                  "Sindano imesukumwa kwenye kizuizi: mita imeunganishwa kinyume. Badilisha nyaya ili + ielekee upande chanya.",
                ]),
              ]
            : []),
          ...(raw > fullScale * 1.05
            ? [
                issue("over", "bad", [
                  "Off the scale: the range is too low and the meter could be damaged. Start on the highest range.",
                  "Imepita kipimo: kiwango ni cha chini mno na mita inaweza kuharibika. Anza kwenye kiwango cha juu zaidi.",
                ]),
              ]
            : raw > 0 &&
                raw < 0.15 * fullScale &&
                spec.fullScales.length > 1 &&
                p("range") > 0
              ? [
                  issue("small", "tip", [
                    "The needle moves very little. Choose a lower range for a more accurate reading.",
                    "Sindano inasogea kidogo sana. Chagua kiwango cha chini kupata kipimo sahihi zaidi.",
                  ]),
                ]
              : []),
          ...(spec.base === "A" &&
          Math.abs(state.voltage) > 0.4 &&
          raw > fullScale
            ? [
                issue("series", "bad", [
                  "An ammeter has almost no resistance. It must go in series, never across a component or a cell.",
                  "Amita karibu haina ukinzani. Lazima iwe mfululizo, kamwe si sambamba na kifaa au seli.",
                ]),
              ]
            : []),
        ],
        measures: [
          measure(
            "reading",
            ["Reading", "Kipimo"],
            spec.unit,
            reading,
            spec.base === "A" && spec.scale === 1 ? 3 : spec.scale > 1 ? 1 : 2,
          ),
        ],
      };
    },
  };
}

const galvanometerModes = [
  {
    name: ["Bare galvanometer (±1 mA)", "Galvanomita ya kawaida (±1 mA)"] as [
      string,
      string,
    ],
    fullScale: 0.001,
    resistance: 50,
    unit: "mA",
    scale: 1000,
    base: "A" as const,
  },
  {
    name: ["With shunt (±1 A)", "Na shanti (±1 A)"] as [string, string],
    fullScale: 1,
    resistance: 0.05,
    unit: "A",
    scale: 1,
    base: "A" as const,
  },
  {
    name: ["With multiplier (±10 V)", "Na kizidishi (±10 V)"] as [
      string,
      string,
    ],
    fullScale: 10,
    resistance: 10000,
    unit: "V",
    scale: 1,
    base: "V" as const,
  },
];

const multimeterRanges = {
  volts: [2, 20, 200],
  amps: [0.02, 0.2, 10],
  ohms: [200, 2000, 20000, 2e6],
};

function formatDigital(value: number, fullScale: number) {
  const resolution = fullScale / 2000;
  const decimals = Math.max(0, Math.ceil(-Math.log10(resolution)));
  return value.toFixed(decimals);
}

export const electricityParts: Record<ElectricityKind, PartSpec> = {
  "dry-cell": {
    name: t("Dry cell", "Seli kavu"),
    description: t(
      "A 1.5 V cell. Current leaves the + terminal and returns to the − terminal.",
      "Seli ya 1.5 V. Mkondo hutoka kwenye ncha + na kurudi kwenye ncha −.",
    ),
    width: 120,
    height: 50,
    terminals: [
      { name: "pos", x: 112, y: 25, polarity: "+" },
      { name: "neg", x: 8, y: 25, polarity: "-" },
    ],
    electrical: () => [
      {
        type: "source",
        a: "pos",
        b: "neg",
        voltage: 1.5,
        internalResistance: 0.2,
      },
    ],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      return {
        readouts: [
          readout(
            ["Terminal voltage", "Volteji ya ncha"],
            `${fixed(state.voltage, 2)} V`,
          ),
        ],
        measures: [
          measure(
            "voltage",
            ["Terminal voltage", "Volteji ya ncha"],
            "V",
            state.voltage,
            2,
          ),
        ],
      };
    },
  },
  "cell-holder": {
    name: t("Cell holder (two cells)", "Kishikio cha seli (seli mbili)"),
    description: t(
      "Two 1.5 V cells in series give 3 V.",
      "Seli mbili za 1.5 V zilizopangwa mfululizo hutoa 3 V.",
    ),
    width: 140,
    height: 60,
    terminals: [
      { name: "pos", x: 132, y: 30, polarity: "+" },
      { name: "neg", x: 8, y: 30, polarity: "-" },
    ],
    electrical: () => [
      {
        type: "source",
        a: "pos",
        b: "neg",
        voltage: 3,
        internalResistance: 0.4,
      },
    ],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      return {
        measures: [
          measure(
            "voltage",
            ["Terminal voltage", "Volteji ya ncha"],
            "V",
            state.voltage,
            2,
          ),
        ],
      };
    },
  },
  accumulator: {
    name: t("Accumulator (lead-acid)", "Betri ya kuchajiwa (risasi-asidi)"),
    description: t(
      "A rechargeable 2 V cell with very low internal resistance. It can deliver a large current, so never short it.",
      "Seli ya 2 V inayochajiwa yenye ukinzani wa ndani mdogo sana. Inaweza kutoa mkondo mkubwa, kamwe usiifupishe.",
    ),
    width: 140,
    height: 110,
    terminals: [
      { name: "pos", x: 100, y: 22, polarity: "+" },
      { name: "neg", x: 40, y: 22, polarity: "-" },
    ],
    controls: [
      slider(
        "charge",
        ["State of charge", "Kiwango cha chaji"],
        10,
        100,
        10,
        100,
        "%",
      ),
    ],
    electrical: (part) => [
      {
        type: "source",
        a: "pos",
        b: "neg",
        voltage: 1.8 + (0.2 * part.params.charge) / 100,
        internalResistance: 0.05 + (0.25 * (100 - part.params.charge)) / 100,
      },
    ],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      return {
        readouts: [
          readout(
            ["Current delivered", "Mkondo unaotolewa"],
            `${fixed(Math.abs(state.current), 2)} A`,
          ),
        ],
        issues:
          env.solution.shortCircuit && Math.abs(state.current) > 2
            ? [
                issue("short", "bad", [
                  "A very large current: this is a short circuit. The accumulator would overheat.",
                  "Mkondo mkubwa sana: huu ni saketi fupi. Betri ingepata joto kupita kiasi.",
                ]),
              ]
            : [],
        measures: [
          measure(
            "voltage",
            ["Terminal voltage", "Volteji ya ncha"],
            "V",
            state.voltage,
            2,
          ),
        ],
      };
    },
  },
  "power-supply": {
    name: t("Power supply (power pack)", "Chanzo cha umeme"),
    description: t(
      "Adjustable 0–12 V, switchable between d.c. and a.c. (50 Hz), with a current limit. Start at 0 V and raise it slowly.",
      "Hurekebishwa 0–12 V, inabadilishwa kati ya d.c. na a.c. (50 Hz), ina kikomo cha mkondo. Anza 0 V na uongeze polepole.",
    ),
    width: 160,
    height: 110,
    terminals: [
      { name: "pos", x: 104, y: 92, polarity: "+" },
      { name: "neg", x: 136, y: 92, polarity: "-" },
    ],
    controls: [
      toggle(
        "on",
        ["Output", "Pato"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
        1,
      ),
      slider(
        "voltage",
        ["Output voltage", "Volteji ya kutoa"],
        0,
        12,
        0.5,
        3,
        "V",
      ),
      choice(
        "mode",
        ["Output type", "Aina ya pato"],
        [
          ["d.c.", "d.c."],
          ["a.c. (rms)", "a.c. (rms)"],
        ],
      ),
      slider(
        "limit",
        ["Current limit", "Kikomo cha mkondo"],
        0.1,
        3,
        0.1,
        3,
        "A",
      ),
    ],
    electrical: (part) => [
      {
        type: "source",
        a: "pos",
        b: "neg",
        voltage: part.params.on === 1 ? part.params.voltage : 0,
        internalResistance: 0.05,
        currentLimit: part.params.limit,
        ac: part.params.mode === 1 ? { frequency: 50, wave: 0 } : undefined,
      },
    ],
    analyse: ({ part, p, env }) => {
      const state = elementState(env.solution, part.id);
      const limiting = env.solution.limited.has(part.id);
      return {
        visual: { limiting: limiting ? 1 : 0 },
        readouts: [
          readout(
            ["Voltage at the terminals", "Volteji kwenye ncha"],
            `${fixed(Math.abs(state.voltage), 2)} V ${p("mode") === 1 ? "a.c." : "d.c."}`,
          ),
          readout(
            ["Current supplied", "Mkondo unaotolewa"],
            `${fixed(Math.abs(state.current), 2)} A`,
          ),
        ],
        issues: limiting
          ? [
              issue("limit", "warn", [
                "The current limit has been reached: the voltage drops so the current stays at the limit. Raise the limit or add resistance.",
                "Kikomo cha mkondo kimefikiwa: volteji hushuka ili mkondo ubaki kwenye kikomo. Ongeza kikomo au ukinzani.",
              ]),
            ]
          : [],
        measures: [
          measure(
            "voltage",
            ["Supply voltage", "Volteji ya chanzo"],
            "V",
            Math.abs(state.voltage),
            2,
          ),
        ],
      };
    },
  },
  "connecting-lead": {
    name: t(
      "Connecting lead with crocodile clips",
      "Waya wa kuunganisha wenye vibano",
    ),
    description: t(
      "A flexible copper lead with a clip on each end. It joins two terminals with almost no resistance.",
      "Waya wa shaba unaopinda wenye kibano kila upande. Huunganisha ncha mbili bila ukinzani karibu wowote.",
    ),
    width: 220,
    height: 50,
    terminals: [
      { name: "a", x: 14, y: 25 },
      { name: "b", x: 206, y: 25 },
    ],
    controls: [
      choice(
        "colour",
        ["Insulation colour", "Rangi ya insulation"],
        [
          ["Red", "Nyekundu"],
          ["Black", "Nyeusi"],
          ["Blue", "Buluu"],
          ["Green", "Kijani"],
        ],
      ),
    ],
    electrical: () => [{ type: "resistor", a: "a", b: "b", resistance: 0.02 }],
    analyse: ({ part, env }) => ({
      readouts: [
        readout(
          ["Current", "Mkondo"],
          `${fixed(Math.abs(elementState(env.solution, part.id).current), 3)} A`,
        ),
      ],
    }),
  },
  switch: {
    name: t("Knife switch", "Swichi ya kisu"),
    description: t(
      "Click it on the bench to open or close the circuit.",
      "Ibofye kwenye benchi kufungua au kufunga sakiti.",
    ),
    width: 120,
    height: 60,
    terminals: [
      { name: "a", x: 14, y: 47 },
      { name: "b", x: 106, y: 47 },
    ],
    controls: [
      toggle(
        "closed",
        ["Switch", "Swichi"],
        ["Closed", "Imefungwa"],
        ["Open", "Imefunguliwa"],
      ),
    ],
    tapToggles: "closed",
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: part.params.closed === 1 ? 0.01 : OPEN,
      },
    ],
  },
  "plug-key": {
    name: t("Plug key", "Ufunguo wa plagi"),
    description: t(
      "A brass block switch: pushing the plug in joins the two blocks and closes the circuit.",
      "Swichi ya vipande vya shaba: kusukuma plagi huunganisha vipande viwili na kufunga sakiti.",
    ),
    width: 120,
    height: 60,
    terminals: [
      { name: "a", x: 14, y: 47 },
      { name: "b", x: 106, y: 47 },
    ],
    controls: [
      toggle("closed", ["Plug", "Plagi"], ["In", "Ndani"], ["Out", "Nje"]),
    ],
    tapToggles: "closed",
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: part.params.closed === 1 ? 0.01 : OPEN,
      },
    ],
  },
  resistor: {
    name: t("Fixed resistor", "Kikinzani cha kudumu"),
    description: t(
      "Limits current. The colour bands give its value; here you can also read it below.",
      "Hupunguza mkondo. Mikanda ya rangi hutoa thamani yake; hapa unaweza kuisoma chini pia.",
    ),
    width: 120,
    height: 54,
    terminals: [
      { name: "a", x: 8, y: 16 },
      { name: "b", x: 112, y: 16 },
    ],
    controls: [
      choice(
        "ohms",
        ["Resistance", "Ukinzani"],
        standardResistors.map((value) => [`${value} Ω`, `${value} Ω`]),
        3,
      ),
    ],
    electrical: (part) => [
      { type: "resistor", a: "a", b: "b", resistance: resistorValue(part) },
    ],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      return {
        readouts: [
          readout(
            ["Voltage across it", "Volteji kwenye kifaa"],
            `${fixed(Math.abs(state.voltage), 2)} V`,
          ),
          readout(
            ["Current through it", "Mkondo kupitia"],
            `${fixed(Math.abs(state.current), 3)} A`,
          ),
          readout(["Power", "Nguvu"], `${fixed(state.power, 2)} W`),
        ],
      };
    },
  },
  rheostat: {
    name: t(
      "Rheostat (variable resistor)",
      "Rheostati (kikinzani kinachobadilika)",
    ),
    description: t(
      "A sliding contact on a coil of wire. Wire it with one end and the slider, and start with the slider at the maximum-resistance end.",
      "Kiguso kinachoteleza kwenye koili ya waya. Kiunganishe kwa ncha moja na kiteleza, na uanze kiteleza kikiwa upande wa ukinzani mkubwa.",
    ),
    width: 220,
    height: 100,
    terminals: [
      { name: "a", x: 16, y: 86 },
      { name: "b", x: 204, y: 86 },
      { name: "s", x: 110, y: 14 },
    ],
    controls: [
      choice(
        "rmax",
        ["Total resistance", "Ukinzani jumla"],
        [
          ["10 Ω (3 A)", "10 Ω (3 A)"],
          ["25 Ω (2 A)", "25 Ω (2 A)"],
          ["50 Ω (1.4 A)", "50 Ω (1.4 A)"],
        ],
        1,
      ),
      slider(
        "pos",
        ["Slider position from end A", "Mahali pa kiteleza kutoka ncha A"],
        0,
        100,
        1,
        50,
        "%",
      ),
    ],
    electrical: (part) => {
      const total = [10, 25, 50][part.params.rmax];
      const fraction = part.params.pos / 100;
      return [
        {
          type: "resistor",
          a: "a",
          b: "s",
          resistance: Math.max(0.01, total * fraction),
        },
        {
          type: "resistor",
          a: "s",
          b: "b",
          resistance: Math.max(0.01, total * (1 - fraction)),
        },
      ];
    },
    analyse: ({ part, p, env }) => {
      const total = [10, 25, 50][p("rmax")];
      const rating = [3, 2, 1.4][p("rmax")];
      const [first, second] = env.solution.elements.get(part.id) ?? [];
      const current = Math.max(
        Math.abs(first?.current ?? 0),
        Math.abs(second?.current ?? 0),
      );
      return {
        visual: { pos: p("pos") },
        readouts: [
          readout(
            ["End A to slider", "Ncha A hadi kiteleza"],
            `${fixed((total * p("pos")) / 100, 1)} Ω`,
          ),
          readout(
            ["Slider to end B", "Kiteleza hadi ncha B"],
            `${fixed((total * (100 - p("pos"))) / 100, 1)} Ω`,
          ),
        ],
        issues:
          current > rating
            ? [
                issue("hot", "bad", [
                  "The current is above the rheostat's rating and the coil would overheat. Always start with the maximum resistance in the circuit, then reduce it slowly.",
                  "Mkondo ni juu ya kiwango cha rheostati na koili ingepata joto. Anza kila mara na ukinzani mkubwa zaidi, kisha upunguze polepole.",
                ]),
              ]
            : [],
        measures: [
          measure(
            "resistance",
            ["Slider position", "Mahali pa kiteleza"],
            "%",
            p("pos"),
            0,
          ),
        ],
      };
    },
  },
  "resistance-box": {
    name: t("Resistance box", "Sanduku la ukinzani"),
    description: t(
      "Plug keys or dials select any whole-number resistance from 0 to 1111 Ω.",
      "Funguo za plagi au piga hukuchagulia ukinzani wowote wa nambari kamili kutoka 0 hadi 1111 Ω.",
    ),
    width: 220,
    height: 110,
    terminals: [
      { name: "a", x: 30, y: 96 },
      { name: "b", x: 190, y: 96 },
    ],
    controls: [
      slider("ohms", ["Resistance", "Ukinzani"], 0, 1111, 1, 100, "Ω"),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: Math.max(0.01, part.params.ohms),
      },
    ],
    analyse: ({ part, p, env }) => ({
      readouts: [
        readout(
          ["Voltage across it", "Volteji kwenye kifaa"],
          `${fixed(Math.abs(elementState(env.solution, part.id).voltage), 2)} V`,
        ),
      ],
      measures: [
        measure("resistance", ["Resistance", "Ukinzani"], "Ω", p("ohms"), 0),
      ],
    }),
  },
  ammeter: {
    name: t("Ammeter", "Amita"),
    description: t(
      "Measures current. Connect it in series, with + towards the + of the source. Zero it first and choose the right range.",
      "Hupima mkondo. Iunganishe mfululizo, + ikielekea + ya chanzo. Iweke sifuri kwanza na uchague kiwango sahihi.",
    ),
    width: 110,
    height: 120,
    terminals: [
      { name: "pos", x: 32, y: 106, polarity: "+" },
      { name: "neg", x: 78, y: 106, polarity: "-" },
    ],
    ...needleMeter({
      base: "A",
      unit: "A",
      scale: 1,
      fullScales: [1, 5],
      resistances: [0.1, 0.02],
      rangeLabels: [
        ["0–1 A", "0–1 A"],
        ["0–5 A", "0–5 A"],
      ],
      salt: 21,
    }),
  },
  milliammeter: {
    name: t("Milliammeter", "Milliamita"),
    description: t(
      "Measures small currents in milliamps. Three ranges; start with the largest.",
      "Hupima mikondo midogo kwa miliampia. Viwango vitatu; anza na kikubwa zaidi.",
    ),
    width: 110,
    height: 120,
    terminals: [
      { name: "pos", x: 32, y: 106, polarity: "+" },
      { name: "neg", x: 78, y: 106, polarity: "-" },
    ],
    ...needleMeter({
      base: "A",
      unit: "mA",
      scale: 1000,
      fullScales: [0.01, 0.1, 1],
      resistances: [5, 0.5, 0.05],
      rangeLabels: [
        ["0–10 mA", "0–10 mA"],
        ["0–100 mA", "0–100 mA"],
        ["0–1000 mA", "0–1000 mA"],
      ],
      salt: 22,
    }),
  },
  voltmeter: {
    name: t("Voltmeter", "Voltimita"),
    description: t(
      "Measures potential difference. Connect it in parallel across a component, + towards the higher potential.",
      "Hupima tofauti ya uwezo. Iunganishe sambamba na kifaa, + ikielekea uwezo wa juu.",
    ),
    width: 110,
    height: 120,
    terminals: [
      { name: "pos", x: 32, y: 106, polarity: "+" },
      { name: "neg", x: 78, y: 106, polarity: "-" },
    ],
    ...needleMeter({
      base: "V",
      unit: "V",
      scale: 1,
      fullScales: [3, 15],
      resistances: [3000, 15000],
      rangeLabels: [
        ["0–3 V", "0–3 V"],
        ["0–15 V", "0–15 V"],
      ],
      salt: 23,
    }),
  },
  galvanometer: {
    name: t("Galvanometer", "Galvanomita"),
    description: t(
      "A very sensitive centre-zero meter that shows the direction of a tiny current. Add a shunt to make an ammeter or a multiplier to make a voltmeter.",
      "Mita nyeti yenye sifuri katikati inayoonyesha mwelekeo wa mkondo mdogo. Ongeza shanti kuifanya amita au kizidishi kuifanya voltimita.",
    ),
    width: 110,
    height: 120,
    terminals: [
      { name: "pos", x: 32, y: 106, polarity: "+" },
      { name: "neg", x: 78, y: 106, polarity: "-" },
    ],
    controls: [
      choice(
        "mode",
        ["Fitted with", "Imewekwa"],
        galvanometerModes.map((mode) => mode.name),
      ),
      slider(
        "adjust",
        ["Zero adjusting screw", "Skrubu ya kurekebisha sifuri"],
        -6,
        6,
        0.5,
        0,
        "%",
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "pos",
        b: "neg",
        resistance: galvanometerModes[part.params.mode].resistance,
      },
    ],
    analyse: ({ part, p, env }) => {
      const mode = galvanometerModes[p("mode")];
      const state = elementState(env.solution, part.id);
      const raw = env.solution.ac
        ? 0
        : mode.base === "A"
          ? state.current
          : state.voltage;
      const zero = pick(part.id, 24, [3, -4, 2, -2, 5]);
      const offset = zero + p("adjust");
      const fraction = clamp(raw / mode.fullScale + offset / 100, -1.1, 1.1);
      const overload = Math.abs(raw) > mode.fullScale * 1.5;
      const resting = Math.abs(raw) < 0.003 * mode.fullScale;
      return {
        visual: { fraction },
        issues: [
          ...(resting && Math.abs(offset) >= 1
            ? [
                issue("zero", "warn", [
                  "The pointer is not at the centre zero. Turn the adjusting screw while the meter is disconnected.",
                  "Kielekezi hakiko sifuri ya katikati. Zungusha skrubu mita ikiwa imetenganishwa.",
                ]),
              ]
            : []),
          ...(overload
            ? [
                issue("over", "bad", [
                  "Far too much current for this setting. A bare galvanometer is easily ruined: use a shunt for large currents.",
                  "Mkondo mkubwa mno kwa mpangilio huu. Galvanomita ya kawaida huharibika kwa urahisi: tumia shanti kwa mikondo mikubwa.",
                ]),
              ]
            : []),
        ],
        readouts: [
          readout(
            ["Pointer", "Kielekezi"],
            Math.abs(fraction) < 0.02
              ? "At zero (null)"
              : fraction > 0
                ? "Deflected right"
                : "Deflected left",
            Math.abs(fraction) < 0.02 ? "ok" : undefined,
          ),
        ],
        measures: [
          measure(
            "reading",
            ["Reading", "Kipimo"],
            mode.unit,
            fraction * mode.fullScale * mode.scale,
            3,
          ),
        ],
      };
    },
  },
  multimeter: {
    name: t("Multimeter", "Mita mchanganyiko"),
    description: t(
      "Measures volts, amps and ohms. Choose the right mode and range first; measure resistance only with the power off, and zero it by touching the probes together.",
      "Hupima volti, ampia na ohm. Chagua hali na kiwango sahihi kwanza; pima ukinzani tu umeme ukiwa umezimwa, na uweke sifuri kwa kugusanisha probu.",
    ),
    width: 130,
    height: 190,
    terminals: [
      { name: "pos", x: 40, y: 170, polarity: "+" },
      { name: "neg", x: 90, y: 170, polarity: "-" },
    ],
    state: { rel: 0 },
    controls: [
      choice(
        "mode",
        ["Mode", "Hali"],
        [
          ["Off", "Imezimwa"],
          ["d.c. volts (V=)", "Volti d.c. (V=)"],
          ["a.c. volts (V~)", "Volti a.c. (V~)"],
          ["d.c. amps (A=)", "Ampia d.c. (A=)"],
          ["Ohms (Ω)", "Ohm (Ω)"],
        ],
        1,
      ),
      choice(
        "rangeV",
        ["Range", "Kiwango"],
        [
          ["2 V", "2 V"],
          ["20 V", "20 V"],
          ["200 V", "200 V"],
        ],
        2,
        (params) => params.mode === 1 || params.mode === 2,
      ),
      choice(
        "rangeA",
        ["Range", "Kiwango"],
        [
          ["20 mA", "20 mA"],
          ["200 mA", "200 mA"],
          ["10 A", "10 A"],
        ],
        2,
        (params) => params.mode === 3,
      ),
      choice(
        "rangeR",
        ["Range", "Kiwango"],
        [
          ["200 Ω", "200 Ω"],
          ["2 kΩ", "2 kΩ"],
          ["20 kΩ", "20 kΩ"],
          ["2 MΩ", "2 MΩ"],
        ],
        3,
        (params) => params.mode === 4,
      ),
      button(
        "rel",
        ["Zero the ohmmeter (REL)", "Weka sifuri ohmita (REL)"],
        (params) => ({ ...params, rel: 0.4 }),
        (params) => params.mode === 4,
      ),
      button(
        "clear",
        ["Clear zero", "Futa sifuri"],
        (params) => ({ ...params, rel: 0 }),
        (params) => params.mode === 4,
      ),
    ],
    electrical: (part): ElectricalElement[] => {
      switch (part.params.mode) {
        case 1:
        case 2:
          return [{ type: "resistor", a: "pos", b: "neg", resistance: 1e7 }];
        case 3:
          return [{ type: "resistor", a: "pos", b: "neg", resistance: 0.5 }];
        case 4:
          return [{ type: "ohmmeter", a: "pos", b: "neg" }];
        default:
          return [{ type: "resistor", a: "pos", b: "neg", resistance: OPEN }];
      }
    },
    analyse: ({ part, p, env }): Outcome => {
      const mode = p("mode");
      const state = elementState(env.solution, part.id);
      if (mode === 0)
        return {
          visual: { display: 0, off: 1 },
          issues: [
            issue("off", "tip", [
              "The multimeter is switched off.",
              "Mita mchanganyiko imezimwa.",
            ]),
          ],
        };
      const fullScale =
        mode === 4
          ? multimeterRanges.ohms[p("rangeR")]
          : mode === 3
            ? multimeterRanges.amps[p("rangeA")]
            : multimeterRanges.volts[p("rangeV")];
      const unit = mode === 4 ? "Ω" : mode === 3 ? "A" : "V";
      const alternating = env.solution.ac;
      const live = mode === 4 && Math.abs(state.voltage) > 0.1;
      let value = 0;
      if (mode === 1) value = alternating ? 0 : state.voltage;
      if (mode === 2) value = alternating ? Math.abs(state.voltage) : 0;
      if (mode === 3) value = alternating ? 0 : state.current;
      if (mode === 4) {
        const ohms = env.solution.ohms.get(part.id) ?? Infinity;
        value = Number.isFinite(ohms) ? ohms + 0.4 - p("rel") : Infinity;
      }
      const over = Math.abs(value) > fullScale * 1.0;
      const display = live
        ? "ERR"
        : over
          ? "1  (over range)"
          : formatDigital(value, fullScale);
      const wrongKind =
        (mode === 1 && alternating && Math.abs(state.voltage) > 0.05) ||
        (mode === 2 && !alternating && Math.abs(state.voltage) > 0.05);
      return {
        visual: {
          mode,
          display: live || over ? 0 : value,
          over: over || live ? 1 : 0,
          off: 0,
        },
        readouts: [
          readout(
            ["Display", "Onyesho"],
            live ? "ERR" : over ? "1 (over range)" : `${display} ${unit}`,
            over || live ? "warn" : undefined,
          ),
        ],
        issues: [
          ...(live
            ? [
                issue("live", "bad", [
                  "Never measure resistance in a circuit that is switched on. Disconnect the supply first.",
                  "Kamwe usipime ukinzani kwenye sakiti iliyowashwa. Tenganisha chanzo kwanza.",
                ]),
              ]
            : []),
          ...(over && !live
            ? [
                issue("range", "warn", [
                  "The reading is above this range. Choose a higher range.",
                  "Kipimo kiko juu ya kiwango hiki. Chagua kiwango cha juu.",
                ]),
              ]
            : []),
          ...(wrongKind
            ? [
                issue("kind", "warn", [
                  alternating
                    ? "The supply is alternating but the meter is on a d.c. setting. Switch to a.c. volts."
                    : "The supply is direct but the meter is on an a.c. setting. Switch to d.c. volts.",
                  alternating
                    ? "Chanzo ni mbadala lakini mita iko d.c. Badilisha hadi volti a.c."
                    : "Chanzo ni cha moja kwa moja lakini mita iko a.c. Badilisha hadi volti d.c.",
                ]),
              ]
            : []),
          ...(mode === 4 && !live && p("rel") === 0
            ? [
                issue("rel", "tip", [
                  "Touch the two probes together first. If it does not read 0.00, press REL to zero out the lead resistance.",
                  "Gusanisha probu mbili kwanza. Isiposoma 0.00, bonyeza REL kuondoa ukinzani wa nyaya.",
                ]),
              ]
            : []),
          ...(mode === 3 && Math.abs(state.voltage) > 0.4
            ? [
                issue("series", "bad", [
                  "In current mode the meter is almost a short circuit. Connect it in series only.",
                  "Katika hali ya mkondo mita ni kama saketi fupi. Iunganishe mfululizo tu.",
                ]),
              ]
            : []),
        ],
        measures:
          live || over || !Number.isFinite(value)
            ? []
            : [
                measure(
                  "reading",
                  ["Reading", "Kipimo"],
                  unit,
                  value,
                  Math.max(0, Math.ceil(-Math.log10(fullScale / 2000))),
                ),
              ],
      };
    },
  },
  bulb: {
    name: t("Bulb and holder", "Balbu na kishikio"),
    description: t(
      "Glows brighter as more power reaches it. Too much voltage burns the filament out for good.",
      "Huwaka zaidi nguvu zaidi inapoifikia. Volteji nyingi huunguza utambi moja kwa moja.",
    ),
    width: 90,
    height: 120,
    terminals: [
      { name: "a", x: 18, y: 96 },
      { name: "b", x: 72, y: 96 },
    ],
    state: { burnt: 0 },
    controls: [
      choice(
        "rating",
        ["Rating", "Kiwango"],
        bulbRatings.map((rating) => rating.label),
      ),
      button(
        "replace",
        ["Fit a new bulb", "Weka balbu mpya"],
        (params) => ({ ...params, burnt: 0 }),
        (params) => params.burnt === 1,
      ),
    ],
    electrical: (part) => {
      const rating = bulbRating(part);
      return [
        {
          type: "resistor",
          a: "a",
          b: "b",
          resistance:
            part.params.burnt === 1
              ? OPEN
              : (rating.volts * rating.volts) / rating.watts,
        },
      ];
    },
    react: ({ part, env }) =>
      part.params.burnt === 0 && bulbBrightness(env.solution, part) > 3
        ? { burnt: 1 }
        : undefined,
    analyse: ({ part, p, env }) => {
      const brightness = bulbBrightness(env.solution, part);
      const state = elementState(env.solution, part.id);
      return {
        visual: { brightness, burnt: p("burnt") },
        readouts: [
          readout(
            ["Voltage across it", "Volteji kwenye kifaa"],
            `${fixed(Math.abs(state.voltage), 2)} V`,
          ),
          readout(
            ["Current through it", "Mkondo kupitia"],
            `${fixed(Math.abs(state.current), 3)} A`,
          ),
        ],
        issues:
          p("burnt") === 1
            ? [
                issue("burnt", "bad", [
                  "The filament has burnt out. Fit a new bulb.",
                  "Utambi umeungua. Weka balbu mpya.",
                ]),
              ]
            : brightness > OVERLOAD_BRIGHTNESS
              ? [
                  issue("over", "bad", [
                    "Overloaded: this bulb is about to burn out.",
                    "Imezidiwa: balbu hii inakaribia kuungua.",
                  ]),
                ]
              : [],
        measures: [
          measure(
            "brightness",
            ["Brightness", "Mwangaza"],
            "%",
            Math.min(brightness, 2) * 100,
            0,
          ),
        ],
      };
    },
  },
  "resistance-wire": {
    name: t("Nichrome / constantan wire", "Waya wa nikromu / konstantani"),
    description: t(
      "Resistance R = ρL ÷ A: it grows with length and falls with thickness. Constantan keeps a steady resistance as it warms.",
      "Ukinzani R = ρL ÷ A: huongezeka na urefu na hupungua na unene. Konstantani hudumisha ukinzani inapopata joto.",
    ),
    width: 260,
    height: 70,
    terminals: [
      { name: "a", x: 10, y: 40 },
      { name: "b", x: 250, y: 40 },
    ],
    controls: [
      choice(
        "material",
        ["Material", "Kitu"],
        wireMaterials.map((item) => item.name),
      ),
      choice(
        "gauge",
        ["Diameter", "Kipenyo"],
        wireDiameters.map((d) => [`${d} mm`, `${d} mm`]),
      ),
      slider(
        "length",
        ["Length in circuit", "Urefu kwenye sakiti"],
        10,
        100,
        5,
        50,
        "cm",
      ),
    ],
    electrical: (part) => [
      { type: "resistor", a: "a", b: "b", resistance: wireResistance(part) },
    ],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      return {
        readouts: [
          readout(
            ["Resistance", "Ukinzani"],
            `${fixed(wireResistance(part), 2)} Ω`,
          ),
          readout(
            ["Current", "Mkondo"],
            `${fixed(Math.abs(state.current), 3)} A`,
          ),
        ],
        measures: [
          measure("length", ["Length", "Urefu"], "cm", part.params.length, 0),
          measure(
            "resistance",
            ["Resistance", "Ukinzani"],
            "Ω",
            wireResistance(part),
            2,
          ),
        ],
      };
    },
  },
  potentiometer: {
    name: t("Potentiometer (slide wire)", "Potentiomita (waya wa kuteleza)"),
    description: t(
      "A 1 m wire of 10 Ω with a sliding jockey. Connect a driver cell across the ends; the jockey taps off a fraction of the voltage.",
      "Waya wa mita 1 wa 10 Ω wenye kiteleza. Unganisha seli ya kuendesha kwenye ncha; kiteleza huchukua sehemu ya volteji.",
    ),
    width: 440,
    height: 110,
    terminals: [
      { name: "a", x: 24, y: 92 },
      { name: "b", x: 416, y: 92 },
      { name: "s", x: 220, y: 16 },
    ],
    controls: [
      slider(
        "pos",
        ["Jockey position from end A", "Mahali pa kiteleza kutoka ncha A"],
        0,
        100,
        0.5,
        50,
        "cm",
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "s",
        resistance: Math.max(0.001, 0.1 * part.params.pos),
      },
      {
        type: "resistor",
        a: "s",
        b: "b",
        resistance: Math.max(0.001, 0.1 * (100 - part.params.pos)),
      },
    ],
    analyse: ({ part, p, env }) => {
      const taken =
        potentialOf(env.solution, { partId: part.id, terminal: "a" }) -
        potentialOf(env.solution, { partId: part.id, terminal: "s" });
      return {
        visual: { pos: p("pos") },
        readouts: [
          readout(
            ["Voltage along this length", "Volteji kwenye urefu huu"],
            `${fixed(Math.abs(taken), 3)} V`,
          ),
        ],
        measures: [
          measure(
            "length",
            ["Balance length l", "Urefu wa usawa l"],
            "cm",
            p("pos"),
            1,
          ),
        ],
      };
    },
  },
  "metre-bridge": {
    name: t("Metre bridge (Wheatstone)", "Daraja la mita (Wheatstone)"),
    description: t(
      "Put a known resistance in one gap and the unknown in the other, cell across the wire, galvanometer between the middle post and the jockey. Balanced when the galvanometer reads zero: R ÷ X = l ÷ (100 − l).",
      "Weka ukinzani unaojulikana kwenye pengo moja na usiojulikana kwenye lingine, seli kwenye waya, galvanomita kati ya nguzo ya kati na kiteleza. Husawazika galvanomita ikisoma sifuri: R ÷ X = l ÷ (100 − l).",
    ),
    width: 480,
    height: 160,
    terminals: [
      { name: "a", x: 24, y: 128 },
      { name: "c", x: 240, y: 128 },
      { name: "b", x: 456, y: 128 },
      { name: "s", x: 360, y: 18 },
    ],
    controls: [
      slider(
        "pos",
        ["Jockey position from end A", "Mahali pa kiteleza kutoka ncha A"],
        0,
        100,
        0.5,
        50,
        "cm",
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "s",
        resistance: Math.max(0.001, 0.04 * part.params.pos),
      },
      {
        type: "resistor",
        a: "s",
        b: "b",
        resistance: Math.max(0.001, 0.04 * (100 - part.params.pos)),
      },
    ],
    analyse: ({ p }) => ({
      visual: { pos: p("pos") },
      readouts: [
        readout(
          ["Length l (end A)", "Urefu l (ncha A)"],
          `${fixed(p("pos"), 1)} cm`,
        ),
        readout(
          ["Length 100 − l", "Urefu 100 − l"],
          `${fixed(100 - p("pos"), 1)} cm`,
        ),
      ],
      measures: [
        measure(
          "length",
          ["Balance length l", "Urefu wa usawa l"],
          "cm",
          p("pos"),
          1,
        ),
      ],
    }),
  },
  fuse: {
    name: t("Fuse", "Fyuzi"),
    description: t(
      "A thin wire that melts if the current exceeds its rating, breaking the circuit to protect the other parts.",
      "Waya mwembamba unaoyeyuka mkondo ukipita kiwango chake, ukikata sakiti kulinda vifaa vingine.",
    ),
    width: 110,
    height: 50,
    terminals: [
      { name: "a", x: 10, y: 25 },
      { name: "b", x: 100, y: 25 },
    ],
    state: { blown: 0 },
    controls: [
      choice(
        "rating",
        ["Rating", "Kiwango"],
        [
          ["0.5 A", "0.5 A"],
          ["1 A", "1 A"],
          ["2 A", "2 A"],
          ["5 A", "5 A"],
        ],
        1,
      ),
      button(
        "replace",
        ["Fit a new fuse", "Weka fyuzi mpya"],
        (params) => ({ ...params, blown: 0 }),
        (params) => params.blown === 1,
      ),
    ],
    electrical: (part) => [
      {
        type: "resistor",
        a: "a",
        b: "b",
        resistance: part.params.blown === 1 ? OPEN : 0.05,
      },
    ],
    react: ({ part, env }) =>
      part.params.blown === 0 &&
      Math.abs(elementState(env.solution, part.id).current) >
        [0.5, 1, 2, 5][part.params.rating]
        ? { blown: 1 }
        : undefined,
    analyse: ({ part, p, env }) => ({
      visual: { blown: p("blown") },
      readouts: [
        readout(
          ["Current", "Mkondo"],
          `${fixed(Math.abs(elementState(env.solution, part.id).current), 3)} A`,
        ),
        readout(
          ["Fuse", "Fyuzi"],
          p("blown") === 1 ? "Blown" : "Intact",
          p("blown") === 1 ? "bad" : "ok",
        ),
      ],
      issues:
        p("blown") === 1
          ? [
              issue("blown", "bad", [
                "The fuse has blown because the current went above its rating. Find the fault, then fit a new fuse.",
                "Fyuzi imeungua kwa sababu mkondo ulipita kiwango chake. Tafuta hitilafu, kisha weka fyuzi mpya.",
              ]),
            ]
          : [],
    }),
  },
  capacitor: {
    name: t("Capacitor", "Kapasita"),
    description: t(
      "Stores charge. Once charged from a d.c. source no current flows, and it holds the supply voltage.",
      "Huhifadhi chaji. Ikishachajiwa kutoka chanzo cha d.c. hakuna mkondo na hushikilia volteji ya chanzo.",
    ),
    width: 90,
    height: 80,
    terminals: [
      { name: "a", x: 16, y: 66, polarity: "+" },
      { name: "b", x: 74, y: 66, polarity: "-" },
    ],
    controls: [
      choice(
        "size",
        ["Capacitance", "Uwezo"],
        [
          ["100 µF", "100 µF"],
          ["470 µF", "470 µF"],
          ["1000 µF", "1000 µF"],
        ],
        1,
      ),
    ],
    analyse: ({ part, p, env }) => {
      const across =
        potentialOf(env.solution, { partId: part.id, terminal: "a" }) -
        potentialOf(env.solution, { partId: part.id, terminal: "b" });
      const capacitance = [100, 470, 1000][p("size")] * 1e-6;
      return {
        visual: { charge: across },
        readouts: [
          readout(
            ["Voltage held", "Volteji inayoshikiliwa"],
            `${fixed(across, 2)} V`,
          ),
          readout(
            ["Charge stored", "Chaji iliyohifadhiwa"],
            `${fixed(capacitance * across * 1000, 2)} mC`,
          ),
          readout(
            ["Energy stored", "Nishati iliyohifadhiwa"],
            `${fixed(0.5 * capacitance * across * across * 1000, 2)} mJ`,
          ),
        ],
        issues:
          across < -0.5
            ? [
                issue("pol", "warn", [
                  "Electrolytic capacitors must be connected with + to the higher potential or they can be damaged.",
                  "Kapasita za elektrolaiti lazima ziunganishwe + upande wa uwezo wa juu la sivyo zinaweza kuharibika.",
                ]),
              ]
            : [],
        measures: [
          measure(
            "charge",
            ["Voltage held", "Volteji inayoshikiliwa"],
            "V",
            across,
            2,
          ),
        ],
      };
    },
  },
  electroscope: {
    name: t("Gold-leaf electroscope", "Elektroskopu ya jani la dhahabu"),
    description: t(
      "A metal cap, rod and thin gold leaf. Like charges make the leaf rise away from the rod. Try charging by contact and by induction.",
      "Kofia ya chuma, fimbo na jani jembamba la dhahabu. Chaji zinazofanana hufanya jani kuinuka. Jaribu kuchaji kwa kugusa na kwa uingizaji.",
    ),
    width: 150,
    height: 230,
    state: { q: 0 },
    controls: [
      choice(
        "rod",
        ["Charged rod", "Fimbo iliyochajiwa"],
        [
          ["None", "Hakuna"],
          ["Polythene (−)", "Polithini (−)"],
          ["Acetate (+)", "Asetati (+)"],
        ],
      ),
      toggle(
        "near",
        ["Rod", "Fimbo"],
        ["Held near the cap", "Imeshikwa karibu na kofia"],
        ["Held away", "Imeshikwa mbali"],
      ),
      button(
        "touch",
        ["Touch the rod to the cap", "Gusa kofia kwa fimbo"],
        (params) => ({
          ...params,
          q: params.rod === 0 ? params.q : (params.rod === 1 ? -1 : 1) * 0.9,
        }),
      ),
      button(
        "earth",
        ["Touch the cap with a finger", "Gusa kofia kwa kidole"],
        (params) => ({
          ...params,
          q:
            params.near === 1 && params.rod !== 0
              ? (params.rod === 1 ? 1 : -1) * 0.6
              : 0,
        }),
      ),
      button("discharge", ["Discharge fully", "Toa chaji yote"], (params) => ({
        ...params,
        q: 0,
      })),
    ],
    analyse: ({ p }) => {
      const rodCharge = p("rod") === 1 ? -1 : p("rod") === 2 ? 1 : 0;
      const leaf = p("q") + (p("near") === 1 ? rodCharge * 0.6 : 0);
      const divergence = Math.min(1, Math.abs(leaf));
      return {
        visual: { divergence },
        readouts: [
          readout(
            ["Leaf", "Jani"],
            divergence < 0.05
              ? "Hanging down"
              : `Raised ${fixed(divergence * 45, 0)}°`,
          ),
          readout(
            ["Charge on the leaf", "Chaji kwenye jani"],
            divergence < 0.05 ? "none" : leaf > 0 ? "positive" : "negative",
          ),
        ],
        issues: [
          issue("tip", "tip", [
            "Touching the cap with the rod shares its charge (same sign). Bringing it near without touching, then earthing, leaves the opposite charge.",
            "Kugusa kofia kwa fimbo hugawana chaji (ishara ileile). Kuileta karibu bila kugusa, kisha kuiunganisha ardhini, huacha chaji kinyume.",
          ]),
        ],
      };
    },
  },
  "polythene-rod": {
    name: t("Polythene rod", "Fimbo ya polithini"),
    description: t(
      "Rubbed with a cloth it gains electrons and becomes negatively charged.",
      "Ikisuguliwa kwa kitambaa hupata elektroni na kuwa na chaji hasi.",
    ),
    width: 260,
    height: 50,
    controls: [
      toggle(
        "rubbed",
        ["Rod", "Fimbo"],
        ["Rubbed with a cloth", "Imesuguliwa kwa kitambaa"],
        ["Not rubbed", "Haijasuguliwa"],
      ),
    ],
    analyse: ({ p }) => ({
      visual: { rubbed: p("rubbed") },
      readouts: [
        readout(
          ["Charge", "Chaji"],
          p("rubbed") === 1 ? "Negative (−)" : "None",
          p("rubbed") === 1 ? "ok" : undefined,
        ),
      ],
    }),
  },
  "acetate-rod": {
    name: t("Acetate rod", "Fimbo ya asetati"),
    description: t(
      "Rubbed with a cloth it loses electrons and becomes positively charged.",
      "Ikisuguliwa kwa kitambaa hupoteza elektroni na kuwa na chaji chanya.",
    ),
    width: 260,
    height: 50,
    controls: [
      toggle(
        "rubbed",
        ["Rod", "Fimbo"],
        ["Rubbed with a cloth", "Imesuguliwa kwa kitambaa"],
        ["Not rubbed", "Haijasuguliwa"],
      ),
    ],
    analyse: ({ p }) => ({
      visual: { rubbed: p("rubbed") },
      readouts: [
        readout(
          ["Charge", "Chaji"],
          p("rubbed") === 1 ? "Positive (+)" : "None",
          p("rubbed") === 1 ? "ok" : undefined,
        ),
      ],
    }),
  },
};
