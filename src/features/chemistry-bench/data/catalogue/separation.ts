import type { ChemPart, ChemPartSpec } from "../../chemistry.types";
import { contentsMass } from "../../engine/contents";
import {
  partByNum,
  partsOver,
  replacePart,
  settleVessel,
} from "../../engine/operations";
import {
  fixed,
  issue,
  measure,
  readout,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import { button, choice, link, slider, toggle } from "./controls";

type SeparationKind =
  | "filter-paper"
  | "fractional-column"
  | "chromatography-tank"
  | "centrifuge"
  | "sublimation-setup"
  | "magnet";

const hint = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

type Dye = {
  colour: string;
  water: number;
  ethanol: number;
  name: [string, string];
};

const inks: { name: [string, string]; dyes: Dye[] }[] = [
  {
    name: ["Black ink", "Wino mweusi"],
    dyes: [
      {
        colour: "yellow",
        water: 0.15,
        ethanol: 0.3,
        name: ["yellow dye", "rangi ya manjano"],
      },
      {
        colour: "red",
        water: 0.45,
        ethanol: 0.62,
        name: ["red dye", "rangi nyekundu"],
      },
      {
        colour: "blue",
        water: 0.78,
        ethanol: 0.85,
        name: ["blue dye", "rangi ya buluu"],
      },
    ],
  },
  {
    name: ["Green ink", "Wino wa kijani"],
    dyes: [
      {
        colour: "blue",
        water: 0.2,
        ethanol: 0.35,
        name: ["blue dye", "rangi ya buluu"],
      },
      {
        colour: "yellow",
        water: 0.55,
        ethanol: 0.7,
        name: ["yellow dye", "rangi ya manjano"],
      },
    ],
  },
  {
    name: ["Brown food colouring", "Rangi ya chakula ya kahawia"],
    dyes: [
      {
        colour: "red",
        water: 0.3,
        ethanol: 0.4,
        name: ["red dye", "rangi nyekundu"],
      },
      {
        colour: "yellow",
        water: 0.6,
        ethanol: 0.72,
        name: ["yellow dye", "rangi ya manjano"],
      },
      {
        colour: "blue",
        water: 0.88,
        ethanol: 0.9,
        name: ["blue dye", "rangi ya buluu"],
      },
    ],
  },
];

const PAPER = 12;
const SOLVENT_DEPTH = 1.5;

export function chromatogram(
  ink: number,
  solvent: number,
  base: number,
  minutes: number,
) {
  const front = Math.min(
    PAPER - 1,
    (PAPER - 1.5 - base) * (1 - Math.exp(-minutes / 6)),
  );
  const washed = base < SOLVENT_DEPTH;
  const spots = inks[ink].dyes.map((dye) => ({
    colour: dye.colour,
    name: dye.name,
    rf: solvent === 0 ? dye.water : dye.ethanol,
    position: base + front * (solvent === 0 ? dye.water : dye.ethanol),
  }));
  return { front: base + front, spots, washed };
}

function massOf(part: ChemPart | undefined) {
  return part?.vessel ? part.vessel.tare + contentsMass(part.contents) : 0;
}

function remember(part: ChemPart, text: ReturnType<typeof t>): ChemPart {
  return {
    ...part,
    contents: {
      ...part.contents,
      notes: [...part.contents.notes, text].slice(-6),
    },
  };
}

const magnetSamples = [
  [
    "Iron filings and sulphur, mixed",
    "Vumbi la chuma na salfa, vilivyochanganywa",
  ],
  [
    "Iron sulphide (iron and sulphur heated)",
    "Chuma salfaidi (chuma na salfa vilivyopashwa)",
  ],
  ["Iron filings and sand", "Vumbi la chuma na mchanga"],
] as [string, string][];

const sublimationSamples = [
  [
    "Ammonium chloride, sodium chloride and sand",
    "Amonia kloridi, sodiamu kloridi na mchanga",
  ],
  ["Ammonium chloride and sand", "Amonia kloridi na mchanga"],
] as [string, string][];

export const separationParts: Record<SeparationKind, ChemPartSpec> = {
  "filter-paper": {
    name: t("Filter paper", "Karatasi ya kuchuja"),
    description: t(
      "Porous paper that lets liquid through but traps solid. Fold it into a cone and fit it inside a funnel, then wet it so it sticks.",
      "Karatasi yenye vishimo inayopitisha kioevu lakini inashika kigumu. Ikunje kuwa koni na uitoshee ndani ya faneli, kisha iloweshe ishikamane.",
    ),
    width: 90,
    height: 70,
    controls: [
      choice(
        "fold",
        ["Fold", "Ukunjo"],
        [
          ["Cone", "Koni"],
          ["Fluted (faster)", "Yenye mikunjo (haraka zaidi)"],
        ],
      ),
    ],
    state: { fold: 0 },
    analyse: ({ part, env }) => {
      const funnel = partsOver(env, part, ["filter-funnel"]).length > 0;
      return {
        readouts: [
          readout(
            ["In a funnel", "Kwenye faneli"],
            funnel ? "Yes" : "No",
            funnel ? "ok" : undefined,
          ),
        ],
        issues: funnel
          ? []
          : [
              issue("fit", "tip", [
                "Place the paper over a filter funnel so it sits inside it.",
                "Weka karatasi juu ya faneli ya kuchuja ikae ndani yake.",
              ]),
            ],
      };
    },
  },
  "fractional-column": {
    name: t(
      "Fractional distillation column",
      "Safu ya kuchemsha na kutenganisha",
    ),
    description: t(
      "A column packed with glass beads that makes vapour condense and re-evaporate many times, separating liquids with close boiling points such as ethanol and water.",
      "Safu iliyojazwa shanga za kioo inayofanya mvuke upoe na kuvukiza mara nyingi, ikitenganisha vimiminika vyenye viwango karibu vya kuchemka kama ethanoli na maji.",
    ),
    width: 60,
    height: 220,
    analyse: ({ env }) => {
      const condenser = env.parts.some(
        (item) => item.kind === "liebig-condenser",
      );
      return {
        readouts: [
          readout(
            ["Fitted to a condenser", "Imeunganishwa na kipoozaji"],
            condenser ? "Yes" : "No",
            condenser ? "ok" : undefined,
          ),
        ],
        issues: [
          issue("use", "tip", [
            "With the column on the bench, a Liebig condenser separates ethanol from water much better.",
            "Safu ikiwa mezani, kipoozaji cha Liebig hutenganisha ethanoli na maji vizuri zaidi.",
          ]),
        ],
      };
    },
  },
  "chromatography-tank": {
    name: t(
      "Chromatography paper and tank",
      "Karatasi na tanki la kromatografia",
    ),
    description: t(
      "A solvent creeps up paper and carries the dyes in a spot of ink different distances. Draw the base line in pencil, above the solvent level. Rf = distance moved by the spot ÷ distance moved by the solvent.",
      "Kiyeyusho hupanda kwenye karatasi na kubeba rangi kwenye doa la wino umbali tofauti. Chora mstari wa msingi kwa penseli, juu ya kiwango cha kiyeyusho. Rf = umbali wa doa ÷ umbali wa kiyeyusho.",
    ),
    width: 140,
    height: 250,
    controls: [
      choice(
        "ink",
        ["Spot of", "Doa la"],
        inks.map((ink) => ink.name),
      ),
      choice(
        "solvent",
        ["Solvent", "Kiyeyusho"],
        [
          ["Water", "Maji"],
          ["Ethanol", "Ethanoli"],
        ],
      ),
      slider(
        "base",
        [
          "Base line above the bottom of the paper",
          "Mstari wa msingi juu ya chini ya karatasi",
        ],
        0.5,
        4,
        0.5,
        1,
        "cm",
      ),
      slider(
        "time",
        ["Time in the tank", "Muda kwenye tanki"],
        0,
        20,
        1,
        0,
        "min",
      ),
      hint,
    ],
    state: { ink: 0, solvent: 0, base: 1, time: 0 },
    analyse: ({ p }) => {
      const run = chromatogram(p("ink"), p("solvent"), p("base"), p("time"));
      const spots = run.spots;
      return {
        visual: {
          base: p("base"),
          front: run.front,
          ink: p("ink"),
          washed: run.washed ? 1 : 0,
          count: spots.length,
          s0: spots[0]?.position ?? 0,
          s1: spots[1]?.position ?? 0,
          s2: spots[2]?.position ?? 0,
          solvent: p("solvent"),
        },
        readouts:
          p("hint") === 1 && p("time") > 0 && !run.washed
            ? spots.map((spot) =>
                readout(
                  [`Rf of the ${spot.name[0]}`, `Rf ya ${spot.name[1]}`],
                  fixed(spot.rf, 2),
                ),
              )
            : [],
        issues: run.washed
          ? [
              issue("washed", "bad", [
                "The base line is below the solvent level, so the ink dissolves into the solvent and no spots form. Put the line above the solvent.",
                "Mstari wa msingi uko chini ya kiwango cha kiyeyusho, kwa hiyo wino unayeyuka ndani yake na madoa hayatengenezwi. Weka mstari juu ya kiyeyusho.",
              ]),
            ]
          : p("time") > 0 && p("time") < 10
            ? [
                issue("wait", "tip", [
                  "Let the solvent run until it is near the top of the paper, then mark the solvent front at once.",
                  "Acha kiyeyusho kipande hadi karibu na juu ya karatasi, kisha weka alama ya mbele ya kiyeyusho mara moja.",
                ]),
              ]
            : [],
        tasks:
          !run.washed && p("time") >= 8
            ? spots.map((spot, index) =>
                task(
                  `rf-${p("ink")}-${p("solvent")}-${index}`,
                  [`Rf of the ${spot.name[0]}`, `Rf ya ${spot.name[1]}`],
                  "",
                  spot.rf,
                  0.04,
                  [
                    "Rf = distance from the base line to the spot ÷ distance from the base line to the solvent front.",
                    "Rf = umbali kutoka mstari wa msingi hadi doa ÷ umbali kutoka mstari wa msingi hadi mbele ya kiyeyusho.",
                  ],
                ),
              )
            : [],
        measures:
          !run.washed && p("time") >= 8
            ? spots.map((spot, index) =>
                measure(
                  `rf${index}`,
                  [`Rf of the ${spot.name[0]}`, `Rf ya ${spot.name[1]}`],
                  "",
                  spot.rf,
                  2,
                ),
              )
            : [],
      };
    },
  },
  centrifuge: {
    name: t("Centrifuge", "Mashine ya kusokota"),
    description: t(
      "Spins tubes fast so solids are thrown to the bottom. Tubes must be balanced: put an equal-mass tube opposite.",
      "Huzungusha mirija kwa kasi ili vigumu vitupwe chini. Mirija lazima iwe na usawa: weka mrija wenye uzito sawa upande wa pili.",
    ),
    width: 140,
    height: 110,
    controls: [
      link(
        "tubeA",
        ["Tube A", "Mrija A"],
        ["Choose a tube", "Chagua mrija"],
        (candidate) =>
          candidate.kind === "test-tube" || candidate.kind === "boiling-tube",
      ),
      link(
        "tubeB",
        ["Tube B (balance)", "Mrija B (usawa)"],
        ["Choose a tube", "Chagua mrija"],
        (candidate, self) =>
          (candidate.kind === "test-tube" ||
            candidate.kind === "boiling-tube") &&
          candidate.num !== self.params.tubeA,
      ),
      button(
        "spin",
        ["Spin for 30 s", "Zungusha kwa sekunde 30"],
        ({ state, part }) => {
          const a = partByNum(state, part.params.tubeA);
          const b = partByNum(state, part.params.tubeB);
          if (!a || !b) return state;
          if (Math.abs(massOf(a) - massOf(b)) > 0.8)
            return replacePart(
              state,
              remember(
                part,
                t(
                  "The centrifuge shakes violently: the tubes are not balanced.",
                  "Mashine inatetemeka vikali: mirija haina usawa.",
                ),
              ),
            );
          let next = settleVessel(state, a.num);
          next = settleVessel(next, b.num);
          return replacePart(
            next,
            remember(
              part,
              t(
                "The solids are packed at the bottom of the tubes.",
                "Vigumu vimeshindiliwa chini ya mirija.",
              ),
            ),
          );
        },
        (part) => part.params.tubeA > 0 && part.params.tubeB > 0,
      ),
    ],
    state: { tubeA: 0, tubeB: 0 },
    analyse: ({ part, env }) => {
      const a = env.part(part.params.tubeA);
      const b = env.part(part.params.tubeB);
      const balanced = a && b ? Math.abs(massOf(a) - massOf(b)) <= 0.8 : null;
      return {
        observations: part.contents.notes,
        readouts:
          balanced === null
            ? []
            : [
                readout(
                  ["Balance", "Usawa"],
                  balanced
                    ? "Balanced"
                    : `Out by ${fixed(Math.abs(massOf(a) - massOf(b)), 1)} g`,
                  balanced ? "ok" : "bad",
                ),
              ],
        issues:
          balanced === false
            ? [
                issue("balance", "bad", [
                  "Add water to the lighter tube until both have the same mass.",
                  "Ongeza maji kwenye mrija mwepesi hadi yote yawe na uzito sawa.",
                ]),
              ]
            : [],
      };
    },
  },
  "sublimation-setup": {
    name: t("Sublimation set-up", "Mpangilio wa usablimishaji"),
    description: t(
      "Heat a mixture in a dish under an inverted funnel or cold glass. A solid that sublimes, such as ammonium chloride, goes straight to gas and settles on the cool surface.",
      "Pasha mchanganyiko kwenye sahani chini ya faneli iliyopinduliwa au kioo baridi. Kigumu kinachosablimisha, kama amonia kloridi, huenda moja kwa moja kuwa gesi na kutua kwenye uso baridi.",
    ),
    width: 160,
    height: 150,
    controls: [
      choice("sample", ["Mixture", "Mchanganyiko"], sublimationSamples),
      button(
        "heat",
        ["Heat for 30 s", "Pasha kwa sekunde 30"],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: { ...part.params, time: part.params.time + 30 },
          }),
      ),
      button("reset", ["Start again", "Anza upya"], ({ state, part }) =>
        replacePart(state, { ...part, params: { ...part.params, time: 0 } }),
      ),
      hint,
    ],
    state: { sample: 0, time: 0 },
    analyse: ({ p }) => {
      const nh4cl = 2.0;
      const nacl = p("sample") === 0 ? 3.0 : 0;
      const sand = 5.0;
      const sublimed = nh4cl * (1 - Math.exp(-p("time") / 60));
      return {
        visual: { sublimed: sublimed / nh4cl, time: p("time") },
        readouts: [
          readout(
            ["Left in the dish", "Kilichobaki kwenye sahani"],
            `${fixed(nh4cl - sublimed + nacl + sand, 2)} g`,
          ),
          ...(p("hint") === 1
            ? [
                readout(
                  [
                    "White solid on the cold surface",
                    "Kigumu cheupe kwenye uso baridi",
                  ],
                  `${fixed(sublimed, 2)} g`,
                ),
              ]
            : []),
        ],
        issues:
          p("time") === 0
            ? [
                issue("heat", "tip", [
                  "Heat gently. Only the ammonium chloride sublimes; sodium chloride and sand stay behind.",
                  "Pasha taratibu. Amonia kloridi pekee husablimisha; sodiamu kloridi na mchanga hubaki.",
                ]),
              ]
            : [],
        tasks:
          p("time") >= 30
            ? [
                task(
                  `sub-${p("sample")}-${p("time")}`,
                  [
                    "Mass of ammonium chloride on the cold surface",
                    "Uzito wa amonia kloridi kwenye uso baridi",
                  ],
                  "g",
                  sublimed,
                  0.08,
                ),
              ]
            : [],
        measures:
          p("time") > 0
            ? [
                measure(
                  "sublimate",
                  ["Sublimate", "Kilichosablimisha"],
                  "g",
                  sublimed,
                  2,
                ),
              ]
            : [],
      };
    },
  },
  magnet: {
    name: t("Magnet", "Sumaku"),
    description: t(
      "Attracts iron but not sulphur or sand, so it separates iron from a mixture. Iron sulphide is a new substance and is not attracted.",
      "Huvutia chuma lakini si salfa wala mchanga, kwa hiyo hutenganisha chuma kutoka kwenye mchanganyiko. Chuma salfaidi ni dutu mpya na haivutwi.",
    ),
    width: 140,
    height: 60,
    controls: [
      choice("sample", ["Sample", "Sampuli"], magnetSamples),
      button(
        "test",
        ["Bring the magnet near", "Leta sumaku karibu"],
        ({ state, part }) => {
          const text =
            part.params.sample === 1
              ? t(
                  "Nothing is attracted: iron sulphide is not magnetic. It is a new compound, not a mixture.",
                  "Hakuna kinachovutwa: chuma salfaidi si sumaku. Ni kampaundi mpya, si mchanganyiko.",
                )
              : t(
                  part.params.sample === 0
                    ? "The iron filings jump to the magnet. The yellow sulphur stays behind."
                    : "The iron filings jump to the magnet. The sand stays behind.",
                  part.params.sample === 0
                    ? "Vumbi la chuma linaruka kwenye sumaku. Salfa ya manjano inabaki."
                    : "Vumbi la chuma linaruka kwenye sumaku. Mchanga unabaki.",
                );
          return replacePart(state, remember(part, text));
        },
      ),
    ],
    state: { sample: 0 },
    analyse: ({ part, p }) => ({
      observations: part.contents.notes,
      readouts: [
        readout(
          ["Separates by", "Hutenganisha kwa"],
          p("sample") === 1 ? "Cannot separate" : "Magnetism",
          p("sample") === 1 ? "warn" : "ok",
        ),
      ],
    }),
  },
};
