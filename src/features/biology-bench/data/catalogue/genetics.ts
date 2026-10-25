import type { BioPart, BioPartSpec } from "../../biology.types";
import { note, setParams } from "../../engine/operations";
import { formatSpan } from "../../engine/time";
import {
  issue,
  measure,
  readout,
  seeded,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import { button, choice, toggle } from "./controls";

type GeneticsKind =
  | "maize-cob"
  | "germination-tray"
  | "drosophila-culture"
  | "classification-specimens";

/* --------------------------------------------------------------- maize cob */

export const KERNELS = 360;

const crosses: {
  name: [string, string];
  ratio: number[];
  labels: [string, string][];
}[] = [
  {
    name: [
      "F2 of purple × yellow (monohybrid)",
      "F2 ya zambarau × njano (monohaibridi)",
    ],
    ratio: [3, 0, 1, 0],
    labels: [
      ["Purple", "Zambarau"],
      ["", ""],
      ["Yellow", "Njano"],
      ["", ""],
    ],
  },
  {
    name: [
      "F2 of purple smooth × yellow wrinkled (dihybrid)",
      "F2 ya zambarau laini × njano iliyokunjamana (dihaibridi)",
    ],
    ratio: [9, 3, 3, 1],
    labels: [
      ["Purple smooth", "Zambarau laini"],
      ["Purple wrinkled", "Zambarau iliyokunjamana"],
      ["Yellow smooth", "Njano laini"],
      ["Yellow wrinkled", "Njano iliyokunjamana"],
    ],
  },
  {
    name: [
      "Test cross: purple (hybrid) × yellow",
      "Msalaba wa kupima: zambarau (chotara) × njano",
    ],
    ratio: [1, 0, 1, 0],
    labels: [
      ["Purple", "Zambarau"],
      ["", ""],
      ["Yellow", "Njano"],
      ["", ""],
    ],
  },
];

/** The type of every kernel on the cob: 0 purple smooth, 1 purple wrinkled, 2 yellow smooth, 3 yellow wrinkled. */
export function kernelTypes(cob: BioPart): number[] {
  const cross = crosses[cob.params.cross ?? 0] ?? crosses[0];
  const total = cross.ratio.reduce((sum, value) => sum + value, 0);
  return Array.from({ length: KERNELS }, (_, index) => {
    let roll = seeded(`${cob.id}-${cob.params.cross ?? 0}`, index) * total;
    for (let type = 0; type < 4; type++) {
      roll -= cross.ratio[type];
      if (roll < 0) return type;
    }
    return 0;
  });
}

function chiSquared(observed: number[], ratio: number[]) {
  const total = observed.reduce((sum, value) => sum + value, 0);
  const parts = ratio.reduce((sum, value) => sum + value, 0);
  return ratio.reduce((sum, value, index) => {
    if (value === 0) return sum;
    const expected = (total * value) / parts;
    return sum + (observed[index] - expected) ** 2 / expected;
  }, 0);
}

/* --------------------------------------------------------- germination tray */

const temperatures = [4, 22, 30];

export function germination(part: BioPart, time: number) {
  const p = part.params;
  if (!p.sowAt) return { percent: 0, length: 0, days: 0 };
  const days = (time - p.sowAt) / 86400;
  if (p.water !== 1 || p.oxygen !== 1) return { percent: 0, length: 0, days };
  const temp = temperatures[p.temp ?? 1];
  const lag = temp === 4 ? 6 : temp === 30 ? 1 : 1.5;
  const percent = 95 / (1 + Math.exp(-(days - lag) * 3));
  const length =
    Math.max(0, days - lag) * (temp === 4 ? 3 : 15) * (p.light === 1 ? 1 : 1.6);
  return { percent, length, days };
}

/* ----------------------------------------------------------- fruit flies */

const flyCrosses: {
  name: [string, string];
  f1: [string, string];
  f2: { label: [string, string]; share: number }[];
}[] = [
  {
    name: [
      "Normal wings × vestigial wings",
      "Mabawa ya kawaida × mabawa mafupi",
    ],
    f1: ["All normal wings", "Wote mabawa ya kawaida"],
    f2: [
      { label: ["Normal wings", "Mabawa ya kawaida"], share: 0.75 },
      { label: ["Vestigial wings", "Mabawa mafupi"], share: 0.25 },
    ],
  },
  {
    name: [
      "Red-eyed female × white-eyed male",
      "Jike jicho jekundu × dume jicho jeupe",
    ],
    f1: ["All red eyes", "Wote macho mekundu"],
    f2: [
      { label: ["Red-eyed females", "Majike macho mekundu"], share: 0.5 },
      { label: ["Red-eyed males", "Madume macho mekundu"], share: 0.25 },
      { label: ["White-eyed males", "Madume macho meupe"], share: 0.25 },
    ],
  },
];

const generationDays = (part: BioPart) =>
  (part.params.temp ?? 0) === 0 ? 10 : 19;

/* ----------------------------------------------------- classification */

const kingdoms: [string, string][] = [
  ["Animalia", "Animalia"],
  ["Plantae", "Plantae"],
  ["Fungi", "Fungi"],
];
const phyla: [string, string][] = [
  ["Arthropoda", "Arthropoda"],
  ["Chordata", "Chordata"],
  ["Annelida", "Annelida"],
  ["Bryophyta", "Bryophyta"],
  ["Pteridophyta", "Pteridophyta"],
  ["Spermatophyta", "Spermatophyta"],
  ["Basidiomycota", "Basidiomycota"],
];
const classes: [string, string][] = [
  ["Insecta", "Insecta"],
  ["Arachnida", "Arachnida"],
  ["Diplopoda", "Diplopoda"],
  ["Chilopoda", "Chilopoda"],
  ["Pisces", "Pisces"],
  ["Amphibia", "Amphibia"],
  ["Reptilia", "Reptilia"],
  ["Oligochaeta", "Oligochaeta"],
  ["Musci", "Musci"],
  ["Filicinae", "Filicinae"],
  ["Monocotyledonae", "Monocotyledonae"],
  ["Dicotyledonae", "Dicotyledonae"],
  ["Basidiomycetes", "Basidiomycetes"],
];

export const classificationSpecimens: {
  name: [string, string];
  answer: [number, number, number];
  features: [string, string];
}[] = [
  {
    name: ["Housefly", "Nzi"],
    answer: [0, 0, 0],
    features: [
      "Three body parts, six jointed legs, one pair of wings, compound eyes.",
      "Sehemu tatu za mwili, miguu sita yenye viungo, jozi moja ya mabawa, macho changamano.",
    ],
  },
  {
    name: ["Spider", "Buibui"],
    answer: [0, 0, 1],
    features: [
      "Two body parts, eight legs, no antennae, no wings.",
      "Sehemu mbili za mwili, miguu minane, hakuna vipapasio, hakuna mabawa.",
    ],
  },
  {
    name: ["Millipede", "Jongoo"],
    answer: [0, 0, 2],
    features: [
      "Many segments, two pairs of legs on most segments, rounded body.",
      "Pingili nyingi, jozi mbili za miguu kwenye pingili nyingi, mwili wa mviringo.",
    ],
  },
  {
    name: ["Centipede", "Tandu"],
    answer: [0, 0, 3],
    features: [
      "Many segments, one pair of legs per segment, flat body, poison claws.",
      "Pingili nyingi, jozi moja ya miguu kwa pingili, mwili bapa, makucha ya sumu.",
    ],
  },
  {
    name: ["Tilapia", "Tilapia"],
    answer: [0, 1, 4],
    features: [
      "Backbone, scales, fins and gills.",
      "Uti wa mgongo, magamba, mapezi na matamvua.",
    ],
  },
  {
    name: ["Frog", "Chura"],
    answer: [0, 1, 5],
    features: [
      "Backbone, moist skin without scales, webbed feet.",
      "Uti wa mgongo, ngozi nyevu bila magamba, miguu yenye utando.",
    ],
  },
  {
    name: ["Lizard", "Mjusi"],
    answer: [0, 1, 6],
    features: [
      "Backbone, dry scaly skin, lays eggs with leathery shells.",
      "Uti wa mgongo, ngozi kavu yenye magamba, hutaga mayai yenye maganda magumu.",
    ],
  },
  {
    name: ["Earthworm", "Nyungunyungu"],
    answer: [0, 2, 7],
    features: [
      "Soft ringed body, no legs, a few bristles on each segment.",
      "Mwili laini wenye pete, hakuna miguu, singa chache kwenye kila pingili.",
    ],
  },
  {
    name: ["Moss", "Kuvumwani"],
    answer: [1, 3, 8],
    features: [
      "No true roots or vascular tissue, rhizoids, spores in a capsule.",
      "Hakuna mizizi halisi wala tishu za usafirishaji, rizoidi, spora kwenye kapsuli.",
    ],
  },
  {
    name: ["Fern", "Kangaga"],
    answer: [1, 4, 9],
    features: [
      "Vascular tissue, fronds, spores in sori under the leaves.",
      "Tishu za usafirishaji, majani ya fern, spora kwenye sori chini ya majani.",
    ],
  },
  {
    name: ["Maize plant", "Mmea wa mahindi"],
    answer: [1, 5, 10],
    features: [
      "Seeds, parallel leaf veins, one cotyledon, fibrous roots.",
      "Mbegu, mishipa sambamba ya jani, kotiledoni moja, mizizi ya nyuzi.",
    ],
  },
  {
    name: ["Bean plant", "Mmea wa maharagwe"],
    answer: [1, 5, 11],
    features: [
      "Seeds, net-veined leaves, two cotyledons, tap root.",
      "Mbegu, majani yenye mishipa ya wavu, kotiledoni mbili, mzizi mkuu.",
    ],
  },
  {
    name: ["Mushroom", "Uyoga"],
    answer: [2, 6, 12],
    features: [
      "No chlorophyll, hyphae, spores on gills under the cap.",
      "Hakuna klorofili, haifa, spora kwenye matamvua chini ya kofia.",
    ],
  },
];

export const geneticsParts: Record<GeneticsKind, BioPartSpec> = {
  "maize-cob": {
    name: t("Maize cob", "Gunzi la mahindi"),
    description: t(
      "Kernels show the results of a cross. Count each type and compare with the expected ratio.",
      "Punje zinaonyesha matokeo ya msalaba. Hesabu kila aina na ulinganishe na uwiano unaotarajiwa.",
    ),
    width: 120,
    height: 220,
    controls: [
      choice(
        "cross",
        ["Cob from", "Gunzi kutoka"],
        crosses.map((cross) => cross.name),
      ),
      button(
        "count",
        ["Count the kernels row by row", "Hesabu punje safu kwa safu"],
        ({ state, part }) => setParams(state, part, { counted: 1 }),
      ),
    ],
    state: { counted: 0 },
    afterChange: ({ state, after, param }) =>
      param === "cross" ? setParams(state, after, { counted: 0 }) : state,
    analyse: ({ part, p }) => {
      const cross = crosses[p("cross")] ?? crosses[0];
      const counts = [0, 0, 0, 0];
      for (const type of kernelTypes(part)) counts[type]++;
      const purple = counts[0] + counts[1];
      const yellow = counts[2] + counts[3];
      const shown = cross.labels
        .map((label, index) => ({ label, count: counts[index] }))
        .filter((item) => item.label[0] !== "");
      return {
        visual: { cross: p("cross") },
        readouts:
          p("counted") === 1
            ? shown.map((item) => readout(item.label, String(item.count)))
            : [readout(["Kernels", "Punje"], String(KERNELS))],
        tasks:
          p("counted") === 1
            ? [
                task(
                  `ratio-${part.id}-${p("cross")}`,
                  [
                    "Ratio of purple to yellow (purple ÷ yellow)",
                    "Uwiano wa zambarau kwa njano (zambarau ÷ njano)",
                  ],
                  "",
                  purple / Math.max(1, yellow),
                  0.08,
                ),
                task(
                  `chi-${part.id}-${p("cross")}`,
                  ["Chi-squared value", "Thamani ya chi-mraba"],
                  "",
                  chiSquared(counts, cross.ratio),
                  0.2,
                  [
                    "Sum of (observed − expected)² ÷ expected for each type.",
                    "Jumla ya (iliyoonekana − inayotarajiwa)² ÷ inayotarajiwa kwa kila aina.",
                  ],
                ),
              ]
            : [],
        measures:
          p("counted") === 1
            ? shown.map((item, index) =>
                measure(`kernels-${index}`, item.label, "", item.count, 0),
              )
            : [],
      };
    },
  },
  "germination-tray": {
    name: t("Germination tray", "Trei ya kuotesha"),
    description: t(
      "Test what seeds need to germinate: water, oxygen and a suitable temperature. Change one thing at a time and keep a control.",
      "Pima mbegu zinahitaji nini kuota: maji, oksijeni na joto linalofaa. Badilisha kitu kimoja kwa wakati na uwe na kulinganisha.",
    ),
    width: 200,
    height: 110,
    controls: [
      choice(
        "seed",
        ["Seeds", "Mbegu"],
        [
          ["Maize", "Mahindi"],
          ["Bean", "Maharagwe"],
        ],
      ),
      toggle(
        "water",
        ["Cotton wool", "Pamba"],
        ["Moist", "Yenye unyevu"],
        ["Dry", "Kavu"],
        1,
      ),
      toggle(
        "oxygen",
        ["Air", "Hewa"],
        ["Available", "Ipo"],
        [
          "None (boiled water under oil)",
          "Hakuna (maji yaliyochemshwa chini ya mafuta)",
        ],
        1,
      ),
      choice(
        "temp",
        ["Kept in", "Imewekwa"],
        [
          ["Fridge (4 °C)", "Friji (4 °C)"],
          ["The room (22 °C)", "Chumbani (22 °C)"],
          ["Incubator (30 °C)", "Kiatamizi (30 °C)"],
        ],
        1,
      ),
      toggle(
        "light",
        ["Light", "Mwanga"],
        ["Light", "Mwanga"],
        ["Dark", "Giza"],
        1,
      ),
      button(
        "sow",
        ["Sow 20 seeds (start)", "Panda mbegu 20 (anza)"],
        ({ state, part, time }) => setParams(state, part, { sowAt: time }),
      ),
    ],
    state: { sowAt: 0 },
    analyse: ({ part, p, env }) => {
      const growth = germination(part, env.time);
      const sown = p("sowAt") > 0;
      return {
        visual: {
          percent: growth.percent,
          length: growth.length,
          seed: p("seed"),
          sown: sown ? 1 : 0,
        },
        readouts: sown
          ? [
              readout(
                ["Time since sowing", "Muda tangu kupanda"],
                formatSpan(env.time - p("sowAt")),
              ),
              readout(
                ["Germinated", "Zimeota"],
                `${Math.round((growth.percent / 100) * 20)} / 20`,
              ),
            ]
          : [],
        observations:
          sown && growth.days > 2 && growth.percent < 5
            ? [
                t(
                  "No seeds have germinated: something they need is missing.",
                  "Hakuna mbegu iliyoota: kitu wanachohitaji kinakosekana.",
                ),
              ]
            : sown && p("light") === 0 && growth.length > 10
              ? [
                  t(
                    "Seedlings in the dark are tall, thin and yellow (etiolated).",
                    "Miche gizani ni mirefu, myembamba na ya njano.",
                  ),
                ]
              : [],
        measures: sown
          ? [
              measure(
                "germinated",
                ["Germinated", "Zimeota"],
                "%",
                Math.round((growth.percent / 100) * 20) * 5,
                0,
              ),
              measure(
                "length",
                ["Mean shoot length", "Wastani wa urefu wa chipukizi"],
                "mm",
                growth.length,
                0,
              ),
              measure("days", ["Days", "Siku"], "d", growth.days, 1),
            ]
          : [],
      };
    },
  },
  "drosophila-culture": {
    name: t(
      "Fruit fly culture (Drosophila)",
      "Kilimo cha inzi wa matunda (Drosophila)",
    ),
    description: t(
      "Cross flies, remove the parents before the young emerge, then anaesthetise and count the offspring.",
      "Vuka inzi, ondoa wazazi kabla watoto hawajatoka, kisha wapoteze fahamu na uhesabu watoto.",
    ),
    width: 90,
    height: 160,
    controls: [
      choice(
        "cross",
        ["Parents", "Wazazi"],
        flyCrosses.map((cross) => cross.name),
      ),
      choice(
        "temp",
        ["Kept at", "Imewekwa kwenye"],
        [
          ["25 °C", "25 °C"],
          ["18 °C", "18 °C"],
        ],
      ),
      button(
        "start",
        [
          "Put the parents in a fresh bottle (start)",
          "Weka wazazi kwenye chupa mpya (anza)",
        ],
        ({ state, part, time }) =>
          setParams(state, part, {
            startedAt: time,
            removed: 0,
            f2At: 0,
            counted: 0,
          }),
      ),
      button(
        "remove",
        ["Remove the parents", "Ondoa wazazi"],
        ({ state, part, time }) => {
          const late =
            time - (part.params.startedAt ?? 0) >
            generationDays(part) * 86400 * 0.8;
          return note(
            setParams(state, part, { removed: late ? 2 : 1 }),
            part,
            late
              ? t(
                  "Too late: young flies had already hatched and mixed with the parents.",
                  "Imechelewa: inzi wachanga walikuwa wameshatoka na kuchanganyika na wazazi.",
                )
              : t(
                  "Parents removed. Only their offspring will be counted.",
                  "Wazazi wameondolewa. Watoto wao tu ndio watahesabiwa.",
                ),
          );
        },
        (part) =>
          (part.params.startedAt ?? 0) > 0 && (part.params.removed ?? 0) === 0,
      ),
      button(
        "f2",
        [
          "Cross the F1 flies with each other",
          "Vuka inzi wa F1 wenyewe kwa wenyewe",
        ],
        ({ state, part, time }) =>
          setParams(state, part, { f2At: time, counted: 0 }),
        (part) => (part.params.startedAt ?? 0) > 0 && !part.params.f2At,
      ),
      toggle(
        "asleep",
        ["Flies", "Inzi"],
        ["Anaesthetised", "Wamepoteza fahamu"],
        ["Awake", "Wako macho"],
      ),
      button(
        "count",
        ["Count the flies", "Hesabu inzi"],
        ({ state, part, time }) =>
          setParams(state, part, { counted: 1, countAt: time }),
      ),
    ],
    state: { startedAt: 0, removed: 0, f2At: 0, counted: 0, countAt: 0 },
    analyse: ({ part, p, env }) => {
      const cross = flyCrosses[p("cross")] ?? flyCrosses[0];
      const span = generationDays(part) * 86400;
      const f1Out = p("startedAt") > 0 && env.time - p("startedAt") >= span;
      const f2Out = p("f2At") > 0 && env.time - p("f2At") >= span;
      const total = Math.round(
        (p("asleep") === 1 ? 200 : 60) * (0.85 + seeded(part.id, 3) * 0.3),
      );
      const counts = f2Out
        ? cross.f2.map((group, index) => ({
            label: group.label,
            count: Math.round(
              total * group.share * (0.9 + seeded(part.id, 10 + index) * 0.2),
            ),
          }))
        : f1Out
          ? [{ label: cross.f1, count: total }]
          : [];
      return {
        visual: { flies: f2Out ? 2 : f1Out ? 1 : 0 },
        observations: part.contents.notes,
        readouts: [
          readout(
            ["Generation", "Kizazi"],
            f2Out
              ? "F2"
              : f1Out
                ? "F1"
                : p("startedAt") > 0
                  ? "eggs and larvae"
                  : "not started",
          ),
          ...(p("counted") === 1
            ? counts.map((item) => readout(item.label, String(item.count)))
            : []),
        ],
        issues: [
          ...(p("startedAt") > 0 && p("removed") === 0
            ? [
                issue("remove", "tip", [
                  "Remove the parents before the young flies hatch (about a week).",
                  "Ondoa wazazi kabla inzi wachanga hawajatoka (takriban wiki moja).",
                ]),
              ]
            : []),
          ...(p("removed") === 2
            ? [
                issue("mixed", "warn", [
                  "Parents and offspring are mixed, so counts are unreliable. Start again.",
                  "Wazazi na watoto wamechanganyika, kwa hiyo hesabu si za kuaminika. Anza upya.",
                ]),
              ]
            : []),
          ...(p("counted") === 1 && p("asleep") === 0
            ? [
                issue("escape", "warn", [
                  "Many flies escaped while you counted. Anaesthetise them first.",
                  "Inzi wengi walitoroka ulipokuwa ukihesabu. Wapoteze fahamu kwanza.",
                ]),
              ]
            : []),
        ],
        tasks:
          p("counted") === 1 && f2Out && counts.length >= 2
            ? [
                task(
                  `fly-${part.id}`,
                  [
                    "Ratio of the first group to the rest",
                    "Uwiano wa kundi la kwanza kwa wengine",
                  ],
                  "",
                  counts[0].count /
                    Math.max(
                      1,
                      counts
                        .slice(1)
                        .reduce((sum, item) => sum + item.count, 0),
                    ),
                  0.15,
                ),
              ]
            : [],
        measures:
          p("counted") === 1
            ? counts.map((item, index) =>
                measure(`flies-${index}`, item.label, "", item.count, 0),
              )
            : [],
      };
    },
  },
  "classification-specimens": {
    name: t("Specimens for classification", "Vielelezo vya uainishaji"),
    description: t(
      "Study the features, then choose the kingdom, phylum (or division) and class.",
      "Chunguza sifa, kisha chagua ufalme, faila (au divisheni) na ngeli.",
    ),
    width: 140,
    height: 120,
    controls: [
      choice(
        "specimen",
        ["Specimen", "Kielelezo"],
        classificationSpecimens.map((item) => item.name),
      ),
      choice("kingdom", ["Kingdom", "Ufalme"], kingdoms),
      choice("phylum", ["Phylum / division", "Faila / divisheni"], phyla),
      choice("klass", ["Class", "Ngeli"], classes),
      button("check", ["Check", "Kagua"], ({ state, part }) => {
        const specimen = classificationSpecimens[part.params.specimen ?? 0];
        const answer = [
          part.params.kingdom ?? 0,
          part.params.phylum ?? 0,
          part.params.klass ?? 0,
        ];
        const right = specimen.answer.every(
          (value, index) => value === answer[index],
        );
        const solved =
          (part.params.solved ?? 0) |
          (right ? 1 << (part.params.specimen ?? 0) : 0);
        return note(
          setParams(state, part, { solved }),
          part,
          right
            ? t(`Correct: ${specimen.name[0]}.`, `Sahihi: ${specimen.name[1]}.`)
            : t(
                "Not quite. Check the features again.",
                "Si sahihi. Kagua sifa tena.",
              ),
        );
      }),
    ],
    state: { solved: 0 },
    analyse: ({ part, p }) => {
      const specimen =
        classificationSpecimens[p("specimen")] ?? classificationSpecimens[0];
      let solved = 0;
      for (let index = 0; index < classificationSpecimens.length; index++)
        if ((p("solved") >> index) & 1) solved++;
      return {
        visual: { specimen: p("specimen") },
        observations: [t(...specimen.features), ...part.contents.notes],
        readouts: [
          readout(
            ["Classified correctly", "Zimeainishwa sahihi"],
            `${solved} / ${classificationSpecimens.length}`,
          ),
        ],
      };
    },
  },
};
