import type {
  BioEnv,
  BioOutcome,
  BioPart,
  BioPartSpec,
  BioState,
} from "../../biology.types";
import {
  emptyTube,
  foodSamples,
  ROOM,
  tubeLook,
  unknownFood,
  type Ingredient,
  type Substance,
} from "../../engine/food";
import {
  addIncident,
  addToTube,
  bathTemperature,
  currentContents,
  isWearing,
  note,
  partByNum,
  pourTube,
  replacePart,
  setParams,
  settleTube,
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
import type { BioKind } from "../kinds";
import { button, choice, hint, link, slider } from "./controls";

type FoodKind =
  | "test-tube"
  | "boiling-tube"
  | "test-tube-rack"
  | "water-bath"
  | "thermometer"
  | "food-sample"
  | "benedicts-solution"
  | "iodine-solution"
  | "biuret-reagent"
  | "sudan-iii"
  | "ethanol"
  | "dcpip"
  | "dilute-hcl"
  | "sodium-hydrogen-carbonate"
  | "amylase"
  | "catalase"
  | "pepsin"
  | "hydrogen-peroxide";

type Unit = "mL" | "drops" | "g";

type Bottle = {
  unit: Unit;
  pack: (bottle: BioPart, amount: number) => Ingredient;
  hazard?: boolean;
};

const per = (
  items: Partial<Record<Substance, number>>,
  amount: number,
): Partial<Record<Substance, number>> =>
  Object.fromEntries(
    Object.entries(items).map(([id, value]) => [id, (value ?? 0) * amount]),
  );

/** What each reagent bottle adds to a tube. */
export const bottles: Partial<Record<BioKind, Bottle>> = {
  "food-sample": {
    unit: "mL",
    pack: (bottle, amount) => {
      const index = bottle.params.sample ?? 0;
      const sample = foodSamples[index] ?? foodSamples[0];
      const items =
        index === foodSamples.length - 1
          ? unknownFood(Math.floor(seeded(bottle.id, 17) * 100))
          : sample.per;
      return { volume: amount, items: per(items, amount) };
    },
  },
  "benedicts-solution": {
    unit: "mL",
    pack: (_bottle, amount) => ({
      volume: amount,
      items: { benedicts: amount },
    }),
  },
  "iodine-solution": {
    unit: "drops",
    pack: (_bottle, amount) => ({
      volume: amount * 0.05,
      items: { iodine: amount * 0.05 },
    }),
  },
  "biuret-reagent": {
    unit: "mL",
    pack: (_bottle, amount) => ({ volume: amount, items: { biuret: amount } }),
  },
  "sudan-iii": {
    unit: "drops",
    pack: (_bottle, amount) => ({
      volume: amount * 0.05,
      items: { sudan: amount * 0.05 },
    }),
  },
  ethanol: {
    unit: "mL",
    pack: (_bottle, amount) => ({ volume: amount, items: { ethanol: amount } }),
    hazard: true,
  },
  dcpip: {
    unit: "mL",
    pack: (_bottle, amount) => ({ volume: amount, items: { dcpip: amount } }),
  },
  "dilute-hcl": {
    unit: "mL",
    pack: (_bottle, amount) => ({ volume: amount, items: { acid: amount } }),
    hazard: true,
  },
  "sodium-hydrogen-carbonate": {
    unit: "g",
    pack: (_bottle, amount) => ({ volume: 0, items: { alkali: amount * 4 } }),
  },
  amylase: {
    unit: "mL",
    pack: (_bottle, amount) => ({ volume: amount, items: { amylase: amount } }),
  },
  catalase: {
    unit: "mL",
    pack: (bottle, amount) => ({
      volume: amount,
      items: { catalase: amount * ((bottle.params.source ?? 0) === 1 ? 3 : 1) },
    }),
  },
  pepsin: {
    unit: "mL",
    pack: (_bottle, amount) => ({ volume: amount, items: { pepsin: amount } }),
  },
  "hydrogen-peroxide": {
    unit: "mL",
    pack: (_bottle, amount) => ({
      volume: amount,
      items: { peroxide: amount },
    }),
    hazard: true,
  },
};

const tubeKinds: BioKind[] = ["test-tube", "boiling-tube", "beaker"];
export const isTube = (part: BioPart) => tubeKinds.includes(part.kind);

const capacityOf: Partial<Record<BioKind, number>> = {
  "test-tube": 20,
  "boiling-tube": 35,
  beaker: 250,
};

const unitOf = (part: BioPart, env: BioEnv): Unit => {
  const source = env.part(part.params.source ?? 0);
  return (source && bottles[source.kind]?.unit) ?? "mL";
};

/** A test tube, boiling tube or beaker that holds liquids for food tests and enzymes. */
export function tubeSpec(
  kind: BioKind,
  name: [string, string],
  description: [string, string],
  width: number,
  height: number,
): BioPartSpec {
  const capacity = capacityOf[kind] ?? 20;
  return {
    name: t(...name),
    description: t(...description),
    width,
    height,
    holdsLiquid: true,
    controls: [
      link(
        "source",
        ["Add from", "Ongeza kutoka"],
        ["Choose a bottle or tube", "Chagua chupa au mrija"],
        (candidate, self) =>
          candidate.id !== self.id &&
          (Boolean(bottles[candidate.kind]) || isTube(candidate)),
      ),
      slider(
        "volume",
        ["Volume to add", "Ujazo wa kuongeza"],
        0.5,
        Math.min(50, capacity),
        0.5,
        2,
        "mL",
        (part, env) => unitOf(part, env) === "mL",
      ),
      slider(
        "drops",
        ["Drops to add", "Matone ya kuongeza"],
        1,
        20,
        1,
        3,
        "drops",
        (part, env) => unitOf(part, env) === "drops",
      ),
      slider(
        "mass",
        ["Spatulas to add", "Vijiko vya kuongeza"],
        0.5,
        3,
        0.5,
        1,
        "spatula",
        (part, env) => unitOf(part, env) === "g",
      ),
      button(
        "add",
        ["Add", "Ongeza"],
        ({ state, part, time }) => {
          const source = partByNum(state, part.params.source ?? 0);
          if (!source) return state;
          if (isTube(source))
            return pourTube(
              state,
              source,
              part,
              part.params.volume ?? 2,
              time,
              capacity,
            );
          const bottle = bottles[source.kind];
          if (!bottle) return state;
          const amount =
            bottle.unit === "drops"
              ? (part.params.drops ?? 3)
              : bottle.unit === "g"
                ? (part.params.mass ?? 1)
                : (part.params.volume ?? 2);
          let next = addToTube(
            state,
            part,
            bottle.pack(source, amount),
            time,
            capacity,
          );
          const after = partByNum(next, part.num);
          if (
            source.kind === "sodium-hydrogen-carbonate" &&
            after &&
            (after.contents.items.acid ?? 0) > 0
          )
            next = note(
              next,
              after,
              t(
                "It fizzes as the acid is neutralised.",
                "Inatoa povu asidi inapoondolewa.",
              ),
            );
          return next;
        },
        (part) => (part.params.source ?? 0) > 0,
      ),
      link(
        "bath",
        ["Water bath", "Bafu ya maji"],
        ["Choose a water bath", "Chagua bafu ya maji"],
        (candidate) => candidate.kind === "water-bath",
      ),
      button(
        "into",
        ["Put in the water bath", "Weka kwenye bafu ya maji"],
        ({ state, part, time }) => {
          const settled = settleTube(state, part, time);
          let next = replacePart(state, {
            ...settled,
            params: { ...settled.params, inBath: 1, bathAt: time },
          });
          const bath = partByNum(state, part.params.bath ?? 0);
          if (
            bathTemperature(bath, time) >= 90 &&
            !isWearing(state.parts, "safety-goggles")
          )
            next = addIncident(next, "eye-splash");
          return next;
        },
        (part) => (part.params.bath ?? 0) > 0 && part.params.inBath !== 1,
      ),
      button(
        "out",
        ["Take out of the water bath", "Toa kwenye bafu ya maji"],
        ({ state, part, time }) => {
          const settled = settleTube(state, part, time);
          return replacePart(state, {
            ...settled,
            params: { ...settled.params, inBath: 0 },
          });
        },
        (part) => part.params.inBath === 1,
      ),
      button(
        "empty",
        ["Empty and wash", "Mwaga na osha"],
        ({ state, part, time }) =>
          replacePart(state, {
            ...part,
            contents: { ...emptyTube(), at: time },
            params: { ...part.params, inBath: 0 },
          }),
      ),
    ],
    state: { inBath: 0, bathAt: 0 },
    analyse: ({ part, env }) => {
      const contents = currentContents(part, env.parts, env.time);
      const celsius = tubeTemperature(part, env.parts, env.time);
      const look = tubeLook(contents, capacity, celsius);
      const issues: BioOutcome["issues"] = [];
      if (
        contents.items.benedicts &&
        contents.hot === 0 &&
        part.params.inBath !== 1
      )
        issues.push(
          issue("heat", "tip", [
            "Benedict's test needs a boiling water bath for about 5 minutes.",
            "Jaribio la Benedict linahitaji bafu ya maji yanayochemka kwa takriban dakika 5.",
          ]),
        );
      if (
        contents.volume > capacity * 0.6 &&
        part.params.inBath === 1 &&
        celsius > 80
      )
        issues.push(
          issue("full", "warn", [
            "Do not heat a tube more than a third full: it can spit.",
            "Usipashe mrija uliojaa zaidi ya theluthi: unaweza kurusha.",
          ]),
        );
      const minutes =
        part.params.inBath === 1 ? env.time - (part.params.bathAt ?? 0) : 0;
      return {
        liquid: look.liquid,
        observations: look.observations,
        visual: { result: look.result.length },
        readouts: [
          readout(["Volume", "Ujazo"], `${fixed(contents.volume, 1)} mL`),
          readout(
            ["Temperature", "Joto"],
            `${fixed(celsius, 0)} °C`,
            celsius >= 60 ? "warn" : undefined,
          ),
          ...(part.params.inBath === 1
            ? [
                readout(
                  ["In the bath for", "Kwenye bafu kwa"],
                  formatSpan(minutes),
                ),
              ]
            : []),
        ],
        issues,
        measures: [
          ...(contents.items.catalase
            ? [
                measure(
                  "foam",
                  ["Froth height", "Urefu wa povu"],
                  "mm",
                  contents.foam,
                  0,
                ),
              ]
            : []),
          measure(
            "temperature",
            ["Tube temperature", "Joto la mrija"],
            "°C",
            celsius,
            0,
          ),
        ],
      };
    },
  };
}

const bottleSpec = (
  name: [string, string],
  description: [string, string],
  label: string,
  controls: BioPartSpec["controls"] = [],
): BioPartSpec => ({
  name: t(...name),
  description: t(...description),
  width: 60,
  height: 100,
  controls,
  analyse: ({ part }) => {
    const bottle = bottles[part.kind];
    return {
      readouts: [
        readout(["Label", "Lebo"], label),
        readout(["Measured in", "Hupimwa kwa"], bottle?.unit ?? "mL"),
      ],
      issues: bottle?.hazard
        ? [
            issue("care", "tip", [
              "Handle with care: wear goggles.",
              "Shika kwa uangalifu: vaa miwani.",
            ]),
          ]
        : [],
    };
  },
});

export const foodParts: Record<FoodKind, BioPartSpec> = {
  "test-tube": tubeSpec(
    "test-tube",
    ["Test tube", "Mrija wa majaribio"],
    [
      "Holds about 20 mL. Use 2 mL of sample for most food tests.",
      "Hubeba takriban mL 20. Tumia mL 2 za sampuli kwa majaribio mengi ya chakula.",
    ],
    40,
    150,
  ),
  "boiling-tube": tubeSpec(
    "boiling-tube",
    ["Boiling tube", "Mrija wa kuchemsha"],
    [
      "A wider tube for heating in a water bath.",
      "Mrija mpana wa kupasha kwenye bafu ya maji.",
    ],
    50,
    170,
  ),
  "test-tube-rack": {
    name: t("Test-tube rack", "Kishikio cha mirija"),
    description: t(
      "Holds tubes upright so they do not spill.",
      "Hushikilia mirija wima isimwagike.",
    ),
    width: 240,
    height: 100,
  },
  "water-bath": {
    name: t("Water bath", "Bafu ya maji"),
    description: t(
      "Set the temperature and wait for it to settle before putting tubes in: 37 °C for enzymes, boiling for Benedict's.",
      "Weka joto na usubiri litulie kabla ya kuweka mirija: 37 °C kwa vimeng'enya, kuchemka kwa Benedict.",
    ),
    width: 170,
    height: 100,
    controls: [
      {
        type: "toggle",
        id: "on",
        label: t("Power", "Umeme"),
        on: t("On", "Umewashwa"),
        off: t("Off", "Umezimwa"),
        default: 0,
      },
      slider("set", ["Set temperature", "Weka joto"], 20, 100, 1, 37, "°C"),
    ],
    state: { onAt: 0, startT: ROOM },
    afterChange: ({ state, before, after, time }): BioState =>
      setParams(state, after, {
        onAt: time,
        startT: bathTemperature(before, time),
      }),
    analyse: ({ part, p, env }) => {
      const celsius = bathTemperature(part, env.time);
      const settled = Math.abs(celsius - (p("on") === 1 ? p("set") : ROOM)) < 1;
      return {
        visual: { temp: celsius, on: p("on") },
        readouts: [
          readout(
            ["Water temperature", "Joto la maji"],
            `${fixed(celsius, 1)} °C`,
          ),
          readout(["Set to", "Imewekwa"], `${p("set")} °C`),
        ],
        issues:
          p("on") === 1 && !settled
            ? [
                issue("settle", "warn", [
                  "Still warming up. Wait until it reaches the set temperature before adding tubes.",
                  "Bado inapata joto. Subiri ifikie joto lililowekwa kabla ya kuweka mirija.",
                ]),
              ]
            : [],
        measures: [
          measure("bath", ["Water bath", "Bafu ya maji"], "°C", celsius, 1),
        ],
      };
    },
  },
  thermometer: {
    name: t("Thermometer", "Kipimajoto"),
    description: t(
      "Check the water bath really is at the set temperature.",
      "Hakikisha bafu ya maji kweli iko kwenye joto lililowekwa.",
    ),
    width: 40,
    height: 220,
    controls: [
      link(
        "in",
        ["Placed in", "Imewekwa kwenye"],
        ["Air", "Hewa"],
        (candidate) => candidate.kind === "water-bath" || isTube(candidate),
      ),
      hint,
    ],
    analyse: ({ p, env }) => {
      const target = env.part(p("in") ?? 0);
      const celsius = !target
        ? ROOM
        : target.kind === "water-bath"
          ? bathTemperature(target, env.time)
          : tubeTemperature(target, env.parts, env.time);
      return {
        visual: { reading: celsius },
        readouts:
          p("hint") === 1
            ? [readout(["Reading", "Kipimo"], `${fixed(celsius, 1)} °C`)]
            : [],
        tasks: [
          task(
            `temp-${Math.round(celsius)}`,
            ["Temperature", "Joto"],
            "°C",
            celsius,
            1,
          ),
        ],
        measures:
          p("hint") === 1
            ? [
                measure(
                  "temperature",
                  ["Temperature", "Joto"],
                  "°C",
                  celsius,
                  1,
                ),
              ]
            : [],
      };
    },
  },
  "food-sample": bottleSpec(
    ["Food sample", "Sampuli ya chakula"],
    [
      "Choose the food to test. Unknown food X is different every time.",
      "Chagua chakula cha kupima. Chakula X kisichojulikana ni tofauti kila mara.",
    ],
    "food",
    [
      choice(
        "sample",
        ["Sample", "Sampuli"],
        foodSamples.map((item): [string, string] => [
          item.name.en,
          item.name.sw,
        ]),
      ),
    ],
  ),
  "benedicts-solution": bottleSpec(
    ["Benedict's solution", "Myeyusho wa Benedict"],
    [
      "Tests for reducing sugars. Add an equal volume, then heat in a boiling water bath.",
      "Hupima sukari zinazopunguza. Ongeza ujazo sawa, kisha pasha kwenye bafu ya maji yanayochemka.",
    ],
    "Benedict's",
  ),
  "iodine-solution": bottleSpec(
    ["Iodine solution", "Myeyusho wa iodini"],
    [
      "Turns blue-black with starch. Also stains plant cells.",
      "Hubadilika buluu-nyeusi na wanga. Pia hutia rangi seli za mmea.",
    ],
    "I₂ / KI",
  ),
  "biuret-reagent": bottleSpec(
    ["Biuret reagent", "Kitendanishi cha Biuret"],
    ["Turns purple with protein.", "Hubadilika zambarau na protini."],
    "Biuret",
  ),
  "sudan-iii": bottleSpec(
    ["Sudan III", "Sudan III"],
    ["A red dye that stains lipids.", "Rangi nyekundu inayotia rangi lipidi."],
    "Sudan III",
  ),
  ethanol: bottleSpec(
    ["Ethanol", "Ethanoli"],
    [
      "For the emulsion test: shake the food with ethanol, then pour into water. Flammable.",
      "Kwa jaribio la mchanganyiko: tikisa chakula na ethanoli, kisha mimina kwenye maji. Huwaka.",
    ],
    "C₂H₅OH",
  ),
  dcpip: bottleSpec(
    ["DCPIP solution", "Myeyusho wa DCPIP"],
    [
      "A blue dye that vitamin C turns colourless. Add juice drop by drop to 1 mL of DCPIP.",
      "Rangi ya buluu ambayo vitamini C huifanya isiwe na rangi. Ongeza juisi tone kwa tone kwenye mL 1 ya DCPIP.",
    ],
    "DCPIP",
  ),
  "dilute-hcl": bottleSpec(
    ["Dilute hydrochloric acid", "Asidi ya haidrokloriki iliyochanganywa"],
    [
      "Boil with a sample to split sucrose into reducing sugars.",
      "Chemsha na sampuli kugawanya sukrosi kuwa sukari zinazopunguza.",
    ],
    "HCl 1 M",
  ),
  "sodium-hydrogen-carbonate": bottleSpec(
    ["Sodium hydrogen carbonate", "Sodiamu haidrojeni kaboneti"],
    [
      "Neutralises the acid before Benedict's test.",
      "Huondoa asidi kabla ya jaribio la Benedict.",
    ],
    "NaHCO₃",
  ),
  amylase: bottleSpec(
    ["Amylase solution", "Myeyusho wa amilesi"],
    [
      "An enzyme that digests starch into sugar. Works best near 37 °C.",
      "Kimeng'enya kinachomeng'enya wanga kuwa sukari. Hufanya kazi vizuri karibu na 37 °C.",
    ],
    "amylase 1%",
  ),
  catalase: bottleSpec(
    ["Catalase extract", "Dondoo ya katalesi"],
    [
      "Splits hydrogen peroxide into water and oxygen.",
      "Hugawanya haidrojeni peroksaidi kuwa maji na oksijeni.",
    ],
    "catalase",
    [
      choice(
        "source",
        ["From", "Kutoka"],
        [
          ["Potato", "Kiazi"],
          ["Liver", "Ini"],
        ],
      ),
    ],
  ),
  pepsin: bottleSpec(
    ["Pepsin solution", "Myeyusho wa pepsini"],
    [
      "A stomach enzyme that digests protein in acid.",
      "Kimeng'enya cha tumbo kinachomeng'enya protini kwenye asidi.",
    ],
    "pepsin",
  ),
  "hydrogen-peroxide": bottleSpec(
    ["Hydrogen peroxide (3%)", "Haidrojeni peroksaidi (3%)"],
    [
      "The substrate for catalase. Irritant: wear goggles.",
      "Kiini cha katalesi. Huwasha: vaa miwani.",
    ],
    "H₂O₂ 3%",
  ),
};
