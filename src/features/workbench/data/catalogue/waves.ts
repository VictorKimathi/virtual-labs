import { elementState } from "../../circuit/solution";
import type { PartSpec } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  choice,
  clamp,
  fixed,
  issue,
  measure,
  peakFromRms,
  readout,
  rmsFromPeak,
  slider,
  t,
  task,
  toggle,
} from "./helpers";

type WavesKind = (typeof sectionKinds.waves)[number];

const SOUND_SPEED_AT_0C = 331;
const forks = [256, 320, 384, 512];
const forkOptions: [string, string][] = forks.map((f) => [
  `${f} Hz`,
  `${f} Hz`,
]);
const timebases = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];
const gains = [0.1, 0.2, 0.5, 1, 2, 5, 10];

const waveOptions: [string, string][] = [
  ["Sine", "Sine"],
  ["Square", "Mraba"],
  ["Triangle", "Pembetatu"],
];

const hintToggle = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

export const wavesParts: Record<WavesKind, PartSpec> = {
  "ripple-tank": {
    name: t(
      "Ripple tank with dippers and stroboscope",
      "Tangi la mawimbi lenye vichovya na stroboskopu",
    ),
    description: t(
      "Water waves from a dipper. A stroboscope flashing at the wave frequency makes the pattern seem to stand still.",
      "Mawimbi ya maji kutoka kwa kichovya. Stroboskopu inayomweka kwa masafa ya wimbi hufanya mchoro uonekane umesimama.",
    ),
    width: 460,
    height: 330,
    controls: [
      slider(
        "freq",
        ["Dipper frequency", "Masafa ya kichovya"],
        5,
        30,
        1,
        10,
        "Hz",
      ),
      choice(
        "depth",
        ["Water depth", "Kina cha maji"],
        [
          ["Shallow (5 mm)", "Kina kifupi (5 mm)"],
          ["Deep (10 mm)", "Kina kirefu (10 mm)"],
        ],
      ),
      slider("strobe", ["Stroboscope", "Stroboskopu"], 0, 32, 0.5, 0, "Hz"),
      choice(
        "barrier",
        ["Barrier", "Kizuizi"],
        [
          ["None", "Hakuna"],
          ["Plane reflector", "Kiakisi bapa"],
          ["Narrow gap", "Pengo jembamba"],
          ["Wide gap", "Pengo pana"],
        ],
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const speed = [20, 28][p("depth")];
      const wavelength = speed / p("freq");
      const strobe = p("strobe");
      const apparent =
        strobe === 0
          ? p("freq")
          : p("freq") - strobe * Math.round(p("freq") / strobe);
      return {
        visual: {
          wavelength,
          apparent,
          barrier: p("barrier"),
          strobe: strobe > 0 ? 1 : 0,
        },
        readouts: [
          ...(p("hint") === 1
            ? [
                readout(
                  ["Wavelength", "Urefu wa wimbi"],
                  `${fixed(wavelength, 1)} cm`,
                ),
                readout(
                  ["Wave speed", "Kasi ya wimbi"],
                  `${fixed(speed, 0)} cm/s`,
                ),
              ]
            : []),
          readout(
            ["Pattern", "Mchoro"],
            strobe === 0
              ? "Moving"
              : Math.abs(apparent) < 0.05
                ? "Frozen"
                : "Moving slowly",
            Math.abs(apparent) < 0.05 && strobe > 0 ? "ok" : undefined,
          ),
        ],
        issues:
          p("barrier") === 2 && wavelength < 4
            ? [
                issue("gap", "tip", [
                  "Waves spread out most when the gap is about one wavelength wide. A longer wavelength (lower frequency) shows more diffraction.",
                  "Mawimbi hutawanyika zaidi pengo likiwa na upana wa urefu mmoja wa wimbi. Wimbi refu (masafa ya chini) huonyesha mtawanyiko zaidi.",
                ]),
              ]
            : [],
        tasks: [
          task(
            `ripple-${p("freq")}-${p("depth")}`,
            ["Wavelength", "Urefu wa wimbi"],
            "cm",
            wavelength,
            Math.max(0.15, wavelength * 0.05),
            [
              "Match the stroboscope to the dipper to freeze the pattern, then measure several wavelengths and divide.",
              "Linganisha stroboskopu na kichovya kusimamisha mchoro, kisha pima urefu wa mawimbi kadhaa na ugawanye.",
            ],
          ),
        ],
        measures: [
          measure("freq", ["Frequency f", "Masafa f"], "Hz", p("freq"), 0),
          measure(
            "wavelength",
            ["Wavelength λ", "Urefu wa wimbi λ"],
            "cm",
            wavelength,
            2,
          ),
          measure(
            "speed",
            ["Speed v = fλ", "Kasi v = fλ"],
            "cm/s",
            p("freq") * wavelength,
            1,
          ),
        ],
      };
    },
  },
  slinky: {
    name: t("Slinky spring", "Chemchemi ya slinki"),
    description: t(
      "Shows transverse (sideways) and longitudinal (push-pull) waves. The wave moves faster when the slinky is stretched more.",
      "Huonyesha mawimbi mvuka (pembeni) na mawimbi ya longitudo (kusukuma-kuvuta). Wimbi hukimbia zaidi slinki ikinyooshwa zaidi.",
    ),
    width: 480,
    height: 190,
    controls: [
      choice(
        "type",
        ["Wave type", "Aina ya wimbi"],
        [
          ["Transverse", "Mvuka"],
          ["Longitudinal", "Longitudo"],
        ],
      ),
      slider(
        "stretch",
        ["Stretched length", "Urefu uliyonyooshwa"],
        1,
        4,
        0.5,
        2,
        "m",
      ),
      slider(
        "freq",
        ["Shaking frequency", "Masafa ya kutikisa"],
        0.5,
        4,
        0.5,
        1.5,
        "Hz",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const speed = 0.9 * p("stretch") + 0.3;
      const wavelength = speed / p("freq");
      return {
        visual: {
          wavelength,
          type: p("type"),
          stretch: p("stretch"),
          freq: p("freq"),
        },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Wavelength", "Urefu wa wimbi"],
                  `${fixed(wavelength, 2)} m`,
                ),
                readout(
                  ["Wave speed", "Kasi ya wimbi"],
                  `${fixed(speed, 2)} m/s`,
                ),
              ]
            : [],
        tasks: [
          task(
            `slinky-${p("stretch")}-${p("freq")}`,
            [
              "Wave speed (frequency × wavelength)",
              "Kasi ya wimbi (masafa × urefu wa wimbi)",
            ],
            "m/s",
            speed,
            0.1,
          ),
        ],
        measures: [
          measure("speed", ["Wave speed", "Kasi ya wimbi"], "m/s", speed, 2),
          measure(
            "stretch",
            ["Stretched length", "Urefu uliyonyooshwa"],
            "m",
            p("stretch"),
            1,
          ),
        ],
      };
    },
  },
  "tuning-fork": {
    name: t("Tuning fork", "Uma wa kurekebisha sauti"),
    description: t(
      "Vibrates at one fixed frequency when struck. Wavelength in air = speed of sound ÷ frequency.",
      "Hutetemeka kwa masafa moja ikipigwa. Urefu wa wimbi hewani = kasi ya sauti ÷ masafa.",
    ),
    width: 140,
    height: 280,
    controls: [
      choice("freq", ["Frequency", "Masafa"], forkOptions, 3),
      toggle(
        "struck",
        ["Fork", "Uma"],
        ["Struck", "Umepigwa"],
        ["At rest", "Umetulia"],
      ),
    ],
    analyse: ({ p }) => {
      const frequency = forks[p("freq")];
      const wavelength = 340 / frequency;
      return {
        visual: { struck: p("struck"), freq: frequency },
        readouts: [
          readout(["Period", "Kipindi"], `${fixed(1000 / frequency, 2)} ms`),
          readout(
            ["Wavelength in air", "Urefu wa wimbi hewani"],
            `${fixed(wavelength, 2)} m`,
          ),
        ],
        tasks: [
          task(
            `fork-${frequency}`,
            [
              "Wavelength in air (speed 340 m/s)",
              "Urefu wa wimbi hewani (kasi 340 m/s)",
            ],
            "m",
            wavelength,
            0.02,
            ["λ = v ÷ f.", "λ = v ÷ f."],
          ),
        ],
        measures: [
          measure("freq", ["Frequency", "Masafa"], "Hz", frequency, 0),
        ],
      };
    },
  },
  sonometer: {
    name: t("Sonometer", "Sonometa"),
    description: t(
      "A stretched wire over a hollow box: f = (1 ÷ 2L)√(T ÷ μ). A paper rider jumps off when the wire resonates with a fork.",
      "Waya uliyonyooshwa juu ya sanduku tupu: f = (1 ÷ 2L)√(T ÷ μ). Kipande cha karatasi huruka waya ukiitikia uma.",
    ),
    width: 560,
    height: 190,
    controls: [
      choice(
        "fork",
        ["Tuning fork on the box", "Uma kwenye sanduku"],
        forkOptions,
      ),
      choice(
        "wire",
        ["Wire", "Waya"],
        [
          ["Thin wire (1 g/m)", "Waya mwembamba (1 g/m)"],
          ["Thick wire (4 g/m)", "Waya mnene (4 g/m)"],
        ],
      ),
      slider(
        "mass",
        ["Mass pulling the wire", "Uzito unaovuta waya"],
        1,
        10,
        0.5,
        5,
        "kg",
      ),
      slider(
        "length",
        ["Vibrating length", "Urefu unaotetemeka"],
        20,
        100,
        1,
        50,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const mu = [0.001, 0.004][p("wire")];
      const tension = p("mass") * 10;
      const frequency = Math.sqrt(tension / mu) / (2 * (p("length") / 100));
      const fork = forks[p("fork")];
      const resonant = Math.abs(frequency - fork) / fork < 0.015;
      const matching = (Math.sqrt(tension / mu) / (2 * fork)) * 100;
      return {
        visual: { resonant: resonant ? 1 : 0, length: p("length"), frequency },
        readouts: [
          readout(
            ["Wire frequency", "Masafa ya waya"],
            `${fixed(frequency, 0)} Hz`,
          ),
          readout(
            ["Paper rider", "Karatasi"],
            resonant ? "Jumps off: resonance" : "Stays on",
            resonant ? "ok" : undefined,
          ),
        ],
        tasks:
          matching >= 20 && matching <= 100
            ? [
                task(
                  `sono-${p("fork")}-${p("wire")}-${p("mass")}`,
                  [
                    "Length that resonates with the fork",
                    "Urefu unaoitikia uma",
                  ],
                  "cm",
                  matching,
                  1.2,
                  [
                    "Slide the bridge until the paper rider jumps off the wire.",
                    "Sogeza daraja hadi karatasi iruke kutoka kwenye waya.",
                  ],
                ),
              ]
            : [],
        measures: [
          measure("length", ["Length L", "Urefu L"], "cm", p("length"), 0),
          measure("frequency", ["Frequency", "Masafa"], "Hz", frequency, 0),
          measure("inverse", ["1/L", "1/L"], "1/m", 100 / p("length"), 2),
        ],
      };
    },
  },
  "resonance-tube": {
    name: t("Resonance tube", "Mrija wa mwangwi"),
    description: t(
      "Lower the water until the air column rings loudest with a fork. Successive resonances are half a wavelength apart.",
      "Shusha maji hadi safu ya hewa ilie kwa sauti kubwa zaidi na uma. Mwangwi mfululizo uko nusu ya urefu wa wimbi.",
    ),
    width: 200,
    height: 440,
    controls: [
      choice("fork", ["Fork", "Uma"], forkOptions, 3),
      slider("temp", ["Air temperature", "Joto la hewa"], 15, 35, 1, 24, "°C"),
      slider(
        "length",
        ["Length of air column", "Urefu wa safu ya hewa"],
        5,
        100,
        0.5,
        30,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const speed = SOUND_SPEED_AT_0C + 0.6 * p("temp");
      const wavelength = speed / forks[p("fork")];
      const resonances = [0.25, 0.75, 1.25].map(
        (k) => k * wavelength * 100 - 1.2,
      );
      const loudness = resonances.reduce(
        (sum, centre) => sum + Math.exp(-(((p("length") - centre) / 1.6) ** 2)),
        0,
      );
      return {
        visual: { loudness: clamp(loudness, 0, 1), length: p("length") },
        readouts: [
          readout(
            ["Loudness", "Sauti"],
            `${fixed(clamp(loudness, 0, 1) * 100, 0)} %`,
            loudness > 0.9 ? "ok" : undefined,
          ),
        ],
        tasks: [
          task(
            `tube-${p("fork")}-${p("temp")}`,
            [
              "Speed of sound (2f × distance between resonances)",
              "Kasi ya sauti (2f × umbali kati ya mwangwi)",
            ],
            "m/s",
            speed,
            6,
            [
              "Find two successive loudest positions. v = 2 f (L₂ − L₁).",
              "Pata sehemu mbili mfululizo za sauti kubwa. v = 2 f (L₂ − L₁).",
            ],
          ),
        ],
        measures: [
          measure(
            "length",
            ["Air column", "Safu ya hewa"],
            "cm",
            p("length"),
            1,
          ),
          measure(
            "loudness",
            ["Loudness", "Sauti"],
            "%",
            clamp(loudness, 0, 1) * 100,
            0,
          ),
        ],
      };
    },
  },
  "signal-generator": {
    name: t("Signal generator", "Jenereta ya mawimbi"),
    description: t(
      "Makes an alternating voltage of any frequency, to drive a loudspeaker or to display on a CRO.",
      "Hutoa volteji mbadala ya masafa yoyote, kuendesha spika au kuonyeshwa kwenye CRO.",
    ),
    width: 240,
    height: 130,
    terminals: [
      { name: "pos", x: 180, y: 106, polarity: "+" },
      { name: "neg", x: 214, y: 106, polarity: "-" },
    ],
    controls: [
      slider("freq", ["Frequency", "Masafa"], 10, 2000, 10, 100, "Hz"),
      slider("amp", ["Peak voltage", "Volteji ya kilele"], 0, 10, 0.5, 4, "V"),
      choice("wave", ["Waveform", "Umbo la wimbi"], waveOptions),
    ],
    electrical: (part) => [
      {
        type: "source",
        a: "pos",
        b: "neg",
        voltage: rmsFromPeak(part.params.wave, part.params.amp),
        internalResistance: 1,
        ac: { frequency: part.params.freq, wave: part.params.wave },
      },
    ],
    analyse: ({ p }) => ({
      visual: { freq: p("freq"), amp: p("amp"), wave: p("wave") },
      readouts: [
        readout(
          ["Output", "Pato"],
          `${fixed(p("amp"), 1)} V peak, ${p("freq")} Hz`,
        ),
        readout(["Period", "Kipindi"], `${fixed(1000 / p("freq"), 2)} ms`),
      ],
      measures: [
        measure("freq", ["Frequency", "Masafa"], "Hz", p("freq"), 0),
        measure("amp", ["Peak voltage", "Volteji ya kilele"], "V", p("amp"), 1),
      ],
    }),
  },
  loudspeaker: {
    name: t("Loudspeaker", "Spika"),
    description: t(
      "An 8 Ω coil in a magnetic field. An alternating current moves the cone to and fro and makes sound.",
      "Koili ya 8 Ω kwenye uga wa sumaku. Mkondo mbadala husogeza koni na kutoa sauti.",
    ),
    width: 190,
    height: 190,
    terminals: [
      { name: "a", x: 40, y: 162 },
      { name: "b", x: 150, y: 162 },
    ],
    electrical: () => [{ type: "resistor", a: "a", b: "b", resistance: 8 }],
    analyse: ({ part, env }) => {
      const state = elementState(env.solution, part.id);
      const alternating = env.solution.ac;
      const frequency = alternating ? env.solution.frequency : 0;
      const audible = frequency >= 20 && frequency <= 20000;
      return {
        visual: {
          power: state.power,
          freq: frequency,
          ac: alternating ? 1 : 0,
          current: Math.abs(state.current),
        },
        readouts: [
          readout(["Power", "Nguvu"], `${fixed(state.power, 2)} W`),
          readout(
            ["Sound", "Sauti"],
            state.power < 0.005
              ? "None"
              : !alternating
                ? "Only a click: DC does not make a tone"
                : audible
                  ? `${fixed(frequency, 0)} Hz tone`
                  : "Outside the audible range",
          ),
        ],
        issues:
          state.power > 5
            ? [
                issue("burn", "bad", [
                  "More than the 5 W rating: the voice coil would burn out.",
                  "Zaidi ya 5 W iliyokadiriwa: koili ya sauti ingeungua.",
                ]),
              ]
            : [],
      };
    },
  },
  cro: {
    name: t(
      "Cathode ray oscilloscope (CRO)",
      "Oskiloskopu ya miale ya katodi (CRO)",
    ),
    description: t(
      "Draws voltage against time. Turn it on, raise the brightness, sharpen the focus, centre the trace, then set the time base and Y-gain to read it.",
      "Huchora volteji dhidi ya muda. Iwashe, ongeza mwangaza, rekebisha ukali, weka mstari katikati, kisha weka msingi wa muda na kipaza cha Y kusoma.",
    ),
    width: 360,
    height: 330,
    terminals: [
      { name: "a", x: 80, y: 306 },
      { name: "b", x: 140, y: 306 },
    ],
    controls: [
      toggle(
        "power",
        ["Power", "Umeme"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
      ),
      slider("bright", ["Brightness", "Mwangaza"], 0, 1, 0.05, 0.1),
      slider("focus", ["Focus", "Ukali"], 0, 1, 0.05, 0.1),
      slider("xshift", ["X shift", "Kuhama X"], -4, 4, 0.1, 0, "div"),
      slider("yshift", ["Y shift", "Kuhama Y"], -4, 4, 0.1, 2.1, "div"),
      choice(
        "timebase",
        ["Time base", "Msingi wa muda"],
        timebases.map((value) => [`${value} ms/div`, `${value} ms/div`]),
        8,
      ),
      choice(
        "gain",
        ["Y-gain", "Kipaza Y"],
        gains.map((value) => [`${value} V/div`, `${value} V/div`]),
        6,
      ),
      choice(
        "couple",
        ["Input", "Pembejeo"],
        [
          ["DC", "DC"],
          ["AC", "AC"],
        ],
      ),
      hintToggle,
    ],
    electrical: () => [{ type: "resistor", a: "a", b: "b", resistance: 1e6 }],
    analyse: ({ part, p, env }) => {
      const across = elementState(env.solution, part.id).voltage;
      const alternating = env.solution.ac;
      const wave = env.solution.wave;
      const amplitude = alternating ? peakFromRms(wave, Math.abs(across)) : 0;
      const offset = !alternating && p("couple") === 0 ? across : 0;
      const frequency = alternating ? env.solution.frequency : 0;
      const timebase = timebases[p("timebase")];
      const gain = gains[p("gain")];
      const power = p("power") === 1;
      const visible =
        power &&
        p("bright") >= 0.3 &&
        Math.abs(p("yshift")) <= 3.5 &&
        Math.abs(p("xshift")) <= 3.5;
      const sharp = Math.abs(p("focus") - 0.5) <= 0.2;
      const centred = Math.abs(p("yshift")) <= 0.6;
      const period = frequency > 0 ? 1000 / frequency : 0;
      const cycles = period > 0 ? (10 * timebase) / period : 0;
      const readable =
        visible &&
        sharp &&
        centred &&
        (frequency === 0 || (cycles >= 1 && cycles <= 8));
      return {
        visual: {
          power: power ? 1 : 0,
          bright: p("bright"),
          focus: p("focus"),
          xshift: p("xshift"),
          yshift: p("yshift"),
          timebase,
          gain,
          amplitude,
          offset,
          frequency,
          wave,
          signal: Math.abs(across) > 1e-6 || amplitude > 0 ? 1 : 0,
        },
        readouts:
          p("hint") === 1 && frequency > 0
            ? [
                readout(
                  ["Cycles on screen", "Mizunguko kwenye skrini"],
                  fixed(cycles, 1),
                ),
              ]
            : [],
        issues: [
          ...(!power
            ? [
                issue("power", "bad", [
                  "The CRO is off. Switch it on.",
                  "CRO imezimwa. Iwashe.",
                ]),
              ]
            : []),
          ...(power && p("bright") < 0.3
            ? [
                issue("bright", "warn", [
                  "No trace is visible. Turn the brightness up.",
                  "Hakuna mstari unaoonekana. Ongeza mwangaza.",
                ]),
              ]
            : []),
          ...(power && !sharp
            ? [
                issue("focus", "warn", [
                  "The trace is fuzzy. Adjust the focus for the thinnest line.",
                  "Mstari umefifia. Rekebisha ukali upate mstari mwembamba.",
                ]),
              ]
            : []),
          ...(power &&
          (Math.abs(p("yshift")) > 3.5 || Math.abs(p("xshift")) > 3.5)
            ? [
                issue("centre", "warn", [
                  "The trace has moved off the screen. Use the X and Y shift to centre it.",
                  "Mstari umeondoka kwenye skrini. Tumia kuhama X na Y kuuweka katikati.",
                ]),
              ]
            : []),
          ...(visible && !centred
            ? [
                issue("zero", "tip", [
                  "Move the trace so its zero line sits on the centre of the screen before you read voltages.",
                  "Hamisha mstari uweke mstari wake wa sifuri katikati ya skrini kabla ya kusoma volteji.",
                ]),
              ]
            : []),
          ...(visible && frequency > 0 && cycles > 8
            ? [
                issue("fast", "tip", [
                  "Too many cycles are packed in. Use a shorter time base (smaller ms/div).",
                  "Mizunguko mingi imebanana. Tumia msingi mfupi wa muda (ms/div ndogo).",
                ]),
              ]
            : []),
          ...(visible && frequency > 0 && cycles < 1
            ? [
                issue("slow", "tip", [
                  "Less than one cycle is showing. Use a longer time base.",
                  "Chini ya mzunguko mmoja unaonekana. Tumia msingi mrefu wa muda.",
                ]),
              ]
            : []),
          ...(visible && amplitude > 0 && amplitude / gain > 3.5
            ? [
                issue("tall", "tip", [
                  "The trace runs off the top of the screen. Use a larger V/div.",
                  "Mstari unatoka juu ya skrini. Tumia V/div kubwa zaidi.",
                ]),
              ]
            : []),
        ],
        tasks: readable
          ? alternating
            ? [
                task(
                  `cro-period-${timebase}-${frequency}`,
                  ["Period of the wave", "Kipindi cha wimbi"],
                  "ms",
                  period,
                  Math.max(0.04 * period, 0.2 * timebase),
                  [
                    "Period = (divisions for one cycle) × time base.",
                    "Kipindi = (migawanyo ya mzunguko mmoja) × msingi wa muda.",
                  ],
                ),
                task(
                  `cro-peak-${gain}-${amplitude.toFixed(2)}`,
                  ["Peak voltage", "Volteji ya kilele"],
                  "V",
                  amplitude,
                  Math.max(0.05 * amplitude, 0.2 * gain),
                  [
                    "Peak voltage = (divisions from the centre line to the peak) × V/div.",
                    "Volteji ya kilele = (migawanyo kutoka mstari wa kati hadi kilele) × V/div.",
                  ],
                ),
              ]
            : Math.abs(across) > 0.01
              ? [
                  task(
                    `cro-dc-${gain}-${across.toFixed(2)}`,
                    ["DC voltage", "Volteji ya DC"],
                    "V",
                    across,
                    Math.max(0.05 * Math.abs(across), 0.2 * gain),
                  ),
                ]
              : []
          : [],
        measures: alternating
          ? [
              measure("freq", ["Frequency", "Masafa"], "Hz", frequency, 0),
              measure(
                "peak",
                ["Peak voltage", "Volteji ya kilele"],
                "V",
                amplitude,
                2,
              ),
            ]
          : [],
      };
    },
  },
};
