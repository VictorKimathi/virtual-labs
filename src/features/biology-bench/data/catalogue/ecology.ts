import type { BioOutcome, BioPart, BioPartSpec } from "../../biology.types";
import {
  addIncident,
  note,
  replacePart,
  setParams,
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
import { button, choice, hint, slider, toggle } from "./controls";

type EcologyKind =
  | "field-plot"
  | "pond"
  | "quadrat"
  | "tape-measure"
  | "pooter"
  | "sweep-net"
  | "pitfall-trap"
  | "tullgren-funnel"
  | "baermann-funnel"
  | "specimen-jar"
  | "soil-thermometer"
  | "light-meter"
  | "soil-test-kit"
  | "secchi-disc"
  | "identification-key";

export const FIELD_W = 360;
export const FIELD_H = 240;
/** Pixels per metre on the field plot. */
export const PX_PER_M = 30;

export type Plant = { x: number; y: number; species: 0 | 1 | 2 };

export const speciesNames: [string, string][] = [
  ["grass tussocks", "vichaka vya nyasi"],
  ["daisies", "maua ya daisi"],
  ["thistles", "michongoma"],
];

const cache = new Map<string, Plant[]>();

/** The plants on a field plot: grass everywhere, daisies on the dry right side, thistles in clumps on the wet left. */
export function fieldPlants(field: BioPart): Plant[] {
  const known = cache.get(field.id);
  if (known) return known;
  const plants: Plant[] = [];
  let n = 0;
  const r = () => seeded(field.id, n++);
  for (let index = 0; index < 480; index++)
    plants.push({ x: r() * FIELD_W, y: r() * FIELD_H, species: 0 });
  while (plants.filter((plant) => plant.species === 1).length < 190) {
    const x = r() * FIELD_W;
    if (r() < x / FIELD_W) plants.push({ x, y: r() * FIELD_H, species: 1 });
  }
  for (let clump = 0; clump < 6; clump++) {
    const cx = 20 + r() * FIELD_W * 0.5;
    const cy = 20 + r() * (FIELD_H - 40);
    for (let index = 0; index < 8; index++) {
      const angle = r() * Math.PI * 2;
      const distance = r() * PX_PER_M;
      plants.push({
        x: cx + Math.cos(angle) * distance,
        y: cy + Math.sin(angle) * distance,
        species: 2,
      });
    }
  }
  cache.set(field.id, plants);
  return plants;
}

/** The tree in the top-left corner shades this circle of the field. */
export const shade = { x: 50, y: 50, r: 70 };
const inShade = (x: number, y: number) =>
  Math.hypot(x - shade.x, y - shade.y) < shade.r;

/** Where a small part sits on the field, in field pixels, if it is over one. */
function onField(part: BioPart, parts: BioPart[]) {
  const field = parts.find(
    (item) =>
      item.kind === "field-plot" &&
      part.x + part.width / 2 >= item.x &&
      part.x + part.width / 2 <= item.x + item.width &&
      part.y + part.height / 2 >= item.y &&
      part.y + part.height / 2 <= item.y + item.height,
  );
  return field
    ? {
        field,
        x: part.x + part.width / 2 - field.x,
        y: part.y + part.height / 2 - field.y,
      }
    : null;
}

export function quadratCounts(quadrat: BioPart, field: BioPart) {
  const counts = [0, 0, 0];
  for (const plant of fieldPlants(field)) {
    const x = field.x + plant.x;
    const y = field.y + plant.y;
    if (
      x >= quadrat.x &&
      x < quadrat.x + quadrat.width &&
      y >= quadrat.y &&
      y < quadrat.y + quadrat.height
    )
      counts[plant.species]++;
  }
  return counts;
}

const keyQuestions: [string, string][] = [
  ["Does it have legs?", "Ina miguu?"],
  ["Does it have more than eight legs?", "Ina zaidi ya miguu minane?"],
  [
    "Are there two pairs of legs on most segments?",
    "Kuna jozi mbili za miguu kwenye pingili nyingi?",
  ],
  ["Does it have eight legs?", "Ina miguu minane?"],
  [
    "Does it have long back legs for jumping?",
    "Ina miguu mirefu ya nyuma ya kurukia?",
  ],
];
export const keyAnimals: [string, string][] = [
  ["Earthworm", "Nyungunyungu"],
  ["Millipede", "Jongoo"],
  ["Centipede", "Tandu"],
  ["Spider", "Buibui"],
  ["Grasshopper", "Panzi"],
  ["Housefly", "Nzi"],
];
/** The yes or no answer each animal gives at each question of the key. */
const keyAnswers: boolean[][] = [
  [false],
  [true, true, true],
  [true, true, false],
  [true, false, true],
  [true, false, false, true],
  [true, false, false, false],
];
/** Where the key goes after a yes or no at each question: a question number, or an animal as a negative. */
const keyNext: [number, number][] = [
  [1, -1],
  [2, 3],
  [-2, -3],
  [-4, 4],
  [-5, -6],
];

export const ecologyParts: Record<EcologyKind, BioPartSpec> = {
  "field-plot": {
    name: t("Field plot (12 m × 8 m)", "Shamba la utafiti (m 12 × m 8)"),
    description: t(
      "A piece of grassland, wetter on the left and drier on the right, with a tree in one corner. Put quadrats, a tape and meters on it.",
      "Eneo la nyasi, lenye unyevu zaidi kushoto na kavu zaidi kulia, na mti pembeni. Weka kwadrati, utepe na vipimo juu yake.",
    ),
    width: FIELD_W,
    height: FIELD_H,
    analyse: () => ({ readouts: [readout(["Area", "Eneo"], "96 m²")] }),
  },
  pond: {
    name: t("Pond", "Bwawa"),
    description: t(
      "A pond for water sampling and measuring clarity with a Secchi disc.",
      "Bwawa la kuchukua sampuli za maji na kupima uangavu kwa diski ya Secchi.",
    ),
    width: 300,
    height: 160,
  },
  quadrat: {
    name: t("Quadrat (1 m × 1 m)", "Kwadrati (m 1 × m 1)"),
    description: t(
      "Place it at random coordinates to avoid bias, count each species inside, and record it. Use at least 10 quadrats.",
      "Iweke kwenye viwianishi vya nasibu kuepuka upendeleo, hesabu kila spishi ndani, na urekodi. Tumia angalau kwadrati 10.",
    ),
    width: PX_PER_M,
    height: PX_PER_M,
    controls: [
      button(
        "random",
        ["Place at random coordinates", "Weka kwenye viwianishi vya nasibu"],
        ({ state, part, time }) => {
          const field = state.parts.find((item) => item.kind === "field-plot");
          if (!field)
            return note(
              state,
              part,
              t("Add a field plot first.", "Ongeza shamba la utafiti kwanza."),
            );
          const tries = (part.params.tries ?? 0) + 1;
          const column = Math.floor(
            seeded(`${part.id}-${tries}`, Math.floor(time) + 1) * 12,
          );
          const row = Math.floor(
            seeded(`${part.id}-${tries}`, Math.floor(time) + 2) * 8,
          );
          return replacePart(state, {
            ...part,
            x: field.x + column * PX_PER_M,
            y: field.y + row * PX_PER_M,
            params: { ...part.params, random: 1, tries, column, row },
          });
        },
      ),
      button(
        "log",
        ["Record this quadrat", "Rekodi kwadrati hii"],
        ({ state, part }) => {
          const field = state.parts.find((item) => item.kind === "field-plot");
          if (!field) return state;
          if (part.params.random !== 1)
            return note(
              state,
              part,
              t(
                "Place it at random coordinates first, or your sample is biased.",
                "Iweke kwenye viwianishi vya nasibu kwanza, la sivyo sampuli yako ina upendeleo.",
              ),
            );
          const counts = quadratCounts(part, field);
          const n = part.params.logged ?? 0;
          return setParams(state, part, {
            logged: n + 1,
            [`q${n}a`]: counts[0],
            [`q${n}b`]: counts[1],
            [`q${n}c`]: counts[2],
            random: 0,
          });
        },
      ),
      hint,
    ],
    state: { random: 0, logged: 0, tries: 0 },
    analyse: ({ part, p, env }) => {
      const field = env.parts.find(
        (item) =>
          item.kind === "field-plot" &&
          item.x <= part.x &&
          item.y <= part.y &&
          item.x + item.width >= part.x + part.width &&
          item.y + item.height >= part.y + part.height,
      );
      const counts = field ? quadratCounts(part, field) : null;
      const logged = p("logged");
      const means = [0, 1, 2].map((species) => {
        let sum = 0;
        for (let index = 0; index < logged; index++)
          sum += p(`q${index}${"abc"[species]}`);
        return logged > 0 ? sum / logged : 0;
      });
      const issues: BioOutcome["issues"] = [];
      if (!field)
        issues.push(
          issue("field", "tip", [
            "Place the quadrat fully on a field plot.",
            "Weka kwadrati yote juu ya shamba la utafiti.",
          ]),
        );
      else if (p("random") === 0)
        issues.push(
          issue("bias", "warn", [
            "You placed this by hand. Use random coordinates to avoid bias.",
            "Uliiweka kwa mkono. Tumia viwianishi vya nasibu kuepuka upendeleo.",
          ]),
        );
      if (logged > 0 && logged < 10)
        issues.push(
          issue("more", "tip", [
            `${logged} quadrats recorded. Use at least 10 for a fair estimate.`,
            `Kwadrati ${logged} zimerekodiwa. Tumia angalau 10 kwa makadirio ya haki.`,
          ]),
        );
      return {
        visual: { random: p("random") },
        observations: part.contents.notes,
        readouts: [
          ...(p("random") === 1
            ? [
                readout(
                  ["Coordinates", "Viwianishi"],
                  `x = ${p("column")} m, y = ${p("row")} m`,
                ),
              ]
            : []),
          readout(
            ["Quadrats recorded", "Kwadrati zilizorekodiwa"],
            String(logged),
          ),
          ...(p("hint") === 1 && counts
            ? speciesNames.map((name, index) =>
                readout(name, String(counts[index])),
              )
            : []),
        ],
        issues,
        tasks: [
          ...(counts
            ? [
                task(
                  `qd-${part.x}-${part.y}`,
                  ["Daisies in this quadrat", "Daisi katika kwadrati hii"],
                  "",
                  counts[1],
                  0,
                ),
                task(
                  `qt-${part.x}-${part.y}`,
                  [
                    "Thistles in this quadrat",
                    "Michongoma katika kwadrati hii",
                  ],
                  "",
                  counts[2],
                  0,
                ),
              ]
            : []),
          ...(logged >= 5
            ? [
                task(
                  `qm-${part.id}-${logged}`,
                  ["Mean number of daisies per m²", "Wastani wa daisi kwa m²"],
                  "/m²",
                  means[1],
                  Math.max(0.1, means[1] * 0.05),
                ),
              ]
            : []),
        ],
        measures: counts
          ? speciesNames.map((name, index) =>
              measure(`count-${index}`, name, "", counts[index], 0),
            )
          : [],
      };
    },
  },
  "tape-measure": {
    name: t(
      "Tape measure (line transect)",
      "Utepe wa kupimia (mstari wa kupitia)",
    ),
    description: t(
      "Lay it across the field. Record the plants touching the tape at every metre to see how they change from wet to dry ground.",
      "Ilaze kuvuka shamba. Rekodi mimea inayogusa utepe kila mita uone inavyobadilika kutoka ardhi yenye unyevu hadi kavu.",
    ),
    width: FIELD_W,
    height: 14,
    analyse: ({ part, env }) => {
      const field = env.parts.find(
        (item) =>
          item.kind === "field-plot" &&
          part.y + 7 >= item.y &&
          part.y + 7 <= item.y + item.height,
      );
      if (!field)
        return {
          issues: [
            issue("field", "tip", [
              "Lay the tape across a field plot.",
              "Laza utepe kuvuka shamba la utafiti.",
            ]),
          ],
        };
      const lineY = part.y + 7;
      const metres = Array.from({ length: 13 }, (_, index) => index);
      const series = [0, 1, 2].map((species) => ({
        x: metres,
        y: metres.map(
          (m) =>
            fieldPlants(field).filter(
              (plant) =>
                plant.species === species &&
                Math.abs(field.x + plant.x - (part.x + m * PX_PER_M)) <
                  PX_PER_M / 2 &&
                Math.abs(field.y + plant.y - lineY) < PX_PER_M / 2,
            ).length,
        ),
      }));
      return {
        plot: {
          title: t("Plants along the transect", "Mimea kando ya mstari"),
          xLabel: "m",
          yLabel: "number",
          series,
        },
        readouts: speciesNames.map((name, index) =>
          readout(
            name,
            `${series[index].y.filter((value) => value > 0).length} / 13 points`,
          ),
        ),
      };
    },
  },
  pooter: {
    name: t("Pooter", "Pooter"),
    description: t(
      "Suck gently on the mouthpiece to collect small insects into the jar. Check the gauze is over the mouthpiece tube first.",
      "Vuta taratibu kwenye mdomo kukusanya wadudu wadogo kwenye chupa. Hakikisha wavu umefunika mrija wa mdomo kwanza.",
    ),
    width: 110,
    height: 90,
    controls: [
      toggle(
        "gauze",
        ["Gauze over the mouthpiece tube", "Wavu juu ya mrija wa mdomo"],
        ["In place", "Upo"],
        ["Missing", "Haupo"],
      ),
      button(
        "suck",
        [
          "Suck up insects from the sweep net",
          "Vuta wadudu kutoka kwenye wavu",
        ],
        ({ state, part }) => {
          if (part.params.gauze !== 1) return addIncident(state, "inhaled");
          const net = state.parts.find(
            (item) =>
              item.kind === "sweep-net" && (item.params.aphids ?? 0) > 0,
          );
          if (!net)
            return note(
              state,
              part,
              t(
                "Sweep the grass with the net first.",
                "Pitisha wavu kwenye nyasi kwanza.",
              ),
            );
          return note(
            setParams(setParams(state, net, { aphids: 0 }), part, {
              caught: (part.params.caught ?? 0) + (net.params.aphids ?? 0),
            }),
            part,
            t(
              `Collected ${net.params.aphids} small insects.`,
              `Wadudu wadogo ${net.params.aphids} wamekusanywa.`,
            ),
          );
        },
      ),
    ],
    state: { caught: 0 },
    analyse: ({ part, p }) => ({
      observations: part.contents.notes,
      readouts: [
        readout(
          ["Insects in the pooter", "Wadudu kwenye pooter"],
          String(p("caught")),
        ),
      ],
    }),
  },
  "sweep-net": {
    name: t("Sweep net", "Wavu wa kufagia"),
    description: t(
      "Sweep through long grass to catch insects. Always sweep the same number of times so samples can be compared.",
      "Pitisha kwenye nyasi ndefu kukamata wadudu. Fagia idadi sawa ya mara kila wakati ili sampuli zilinganishwe.",
    ),
    width: 150,
    height: 80,
    controls: [
      button(
        "sweep",
        ["Sweep 10 times", "Fagia mara 10"],
        ({ state, part, time }) => {
          if (!onField(part, state.parts))
            return note(
              state,
              part,
              t(
                "Take the net onto the field plot.",
                "Peleka wavu kwenye shamba la utafiti.",
              ),
            );
          const r = (salt: number) =>
            seeded(part.id, Math.floor(time) * 10 + salt);
          return setParams(state, part, {
            grasshoppers: Math.floor(r(1) * 5),
            beetles: Math.floor(r(2) * 4),
            spiders: Math.floor(r(3) * 4),
            aphids: 5 + Math.floor(r(4) * 15),
            sweeps: (part.params.sweeps ?? 0) + 10,
          });
        },
      ),
    ],
    state: { sweeps: 0 },
    analyse: ({ p }) => ({
      readouts:
        p("sweeps") > 0
          ? [
              readout(["Grasshoppers", "Panzi"], String(p("grasshoppers"))),
              readout(["Beetles", "Mbawakawa"], String(p("beetles"))),
              readout(["Spiders", "Buibui"], String(p("spiders"))),
              readout(["Small insects", "Wadudu wadogo"], String(p("aphids"))),
            ]
          : [],
      measures:
        p("sweeps") > 0
          ? [
              measure(
                "grasshoppers",
                ["Grasshoppers caught", "Panzi waliokamatwa"],
                "",
                p("grasshoppers"),
                0,
              ),
            ]
          : [],
    }),
  },
  "pitfall-trap": {
    name: t("Pitfall trap", "Mtego wa shimo"),
    description: t(
      "A jar sunk with its rim level with the soil and a cover against rain. Leave it overnight, then count and release.",
      "Chupa iliyozikwa ukingo ukiwa sawa na udongo na kifuniko dhidi ya mvua. Iache usiku kucha, kisha hesabu na uachilie.",
    ),
    width: 70,
    height: 70,
    controls: [
      toggle(
        "rim",
        ["Rim", "Ukingo"],
        ["Level with the soil", "Sawa na udongo"],
        ["Sticking up", "Umechomoza"],
      ),
      toggle(
        "cover",
        ["Rain cover", "Kifuniko cha mvua"],
        ["On", "Kimewekwa"],
        ["Off", "Hakijawekwa"],
      ),
      button("set", ["Set the trap", "Tega mtego"], ({ state, part, time }) =>
        onField(part, state.parts)
          ? setParams(state, part, { setAt: time })
          : note(
              state,
              part,
              t(
                "Put the trap on the field plot.",
                "Weka mtego kwenye shamba la utafiti.",
              ),
            ),
      ),
      button(
        "empty",
        ["Count and release", "Hesabu na uachilie"],
        ({ state, part }) => setParams(state, part, { setAt: 0 }),
        (part) => (part.params.setAt ?? 0) > 0,
      ),
    ],
    state: { setAt: 0 },
    analyse: ({ part, p, env }) => {
      const hours = p("setAt") > 0 ? (env.time - p("setAt")) / 3600 : 0;
      const factor = p("rim") === 1 ? 1 : 0.2;
      const count = (salt: number, per: number) =>
        Math.floor(hours * per * factor * (0.7 + seeded(part.id, salt) * 0.6));
      return {
        readouts:
          p("setAt") > 0
            ? [
                readout(
                  ["Set for", "Imetegwa kwa"],
                  formatSpan(env.time - p("setAt")),
                ),
                readout(
                  ["Ground beetles", "Mbawakawa wa ardhini"],
                  String(count(1, 0.3)),
                ),
                readout(["Woodlice", "Chawa wa mbao"], String(count(2, 0.2))),
                readout(["Spiders", "Buibui"], String(count(3, 0.1))),
              ]
            : [],
        issues: [
          ...(p("rim") === 0
            ? [
                issue("rim", "warn", [
                  "The rim sticks up, so animals walk around it. Sink it level with the soil.",
                  "Ukingo umechomoza, kwa hiyo wanyama wanauzunguka. Uzike sawa na udongo.",
                ]),
              ]
            : []),
          ...(p("cover") === 0 && hours > 12
            ? [
                issue("rain", "warn", [
                  "Rain got into the uncovered trap and some animals drowned. Use a cover.",
                  "Mvua iliingia kwenye mtego usiofunikwa na baadhi ya wanyama walizama. Tumia kifuniko.",
                ]),
              ]
            : []),
          ...(hours > 24
            ? [
                issue("release", "tip", [
                  "Empty traps within a day and release the animals.",
                  "Mwaga mitego ndani ya siku moja na uachilie wanyama.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "tullgren-funnel": {
    name: t("Tullgren funnel", "Faneli ya Tullgren"),
    description: t(
      "A lamp slowly dries a soil sample from above, driving small animals down into a jar.",
      "Taa hukausha sampuli ya udongo polepole kutoka juu, ikiwasukuma wanyama wadogo chini kwenye chupa.",
    ),
    width: 110,
    height: 170,
    controls: [
      choice(
        "distance",
        ["Lamp height above the soil", "Urefu wa taa juu ya udongo"],
        [
          ["15 cm (gentle)", "sm 15 (taratibu)"],
          ["5 cm (very hot)", "sm 5 (joto kali)"],
        ],
      ),
      button(
        "start",
        ["Switch on the lamp (start)", "Washa taa (anza)"],
        ({ state, part, time }) => setParams(state, part, { startedAt: time }),
      ),
    ],
    state: { startedAt: 0 },
    analyse: ({ part, p, env }) => {
      const hours = p("startedAt") > 0 ? (env.time - p("startedAt")) / 3600 : 0;
      const factor = p("distance") === 1 ? 0.4 : 1;
      const mites = Math.floor(
        40 *
          factor *
          (1 - Math.exp(-hours / 12)) *
          (0.8 + seeded(part.id, 1) * 0.4),
      );
      const springtails = Math.floor(
        25 *
          factor *
          (1 - Math.exp(-hours / 12)) *
          (0.8 + seeded(part.id, 2) * 0.4),
      );
      return {
        visual: { on: p("startedAt") > 0 ? 1 : 0 },
        readouts:
          p("startedAt") > 0
            ? [
                readout(
                  ["Running for", "Inaendesha kwa"],
                  formatSpan(env.time - p("startedAt")),
                ),
                readout(["Mites", "Utitiri"], String(mites)),
                readout(["Springtails", "Kolembola"], String(springtails)),
              ]
            : [],
        issues:
          p("distance") === 1
            ? [
                issue("hot", "warn", [
                  "The lamp is too close: the soil dries so fast that many animals die before they escape.",
                  "Taa iko karibu mno: udongo unakauka haraka sana kwamba wanyama wengi wanakufa kabla ya kutoroka.",
                ]),
              ]
            : [],
      };
    },
  },
  "baermann-funnel": {
    name: t("Baermann funnel", "Faneli ya Baermann"),
    description: t(
      "Wet soil wrapped in muslin sits in water. Nematodes wriggle out and sink to the bottom.",
      "Udongo wenye unyevu uliofungwa kwenye kitambaa umekaa kwenye maji. Minyoo midogo hutoka na kuzama chini.",
    ),
    width: 90,
    height: 170,
    controls: [
      button(
        "start",
        ["Set it up (start)", "Iandae (anza)"],
        ({ state, part, time }) => setParams(state, part, { startedAt: time }),
      ),
    ],
    state: { startedAt: 0 },
    analyse: ({ part, p, env }) => {
      const hours = p("startedAt") > 0 ? (env.time - p("startedAt")) / 3600 : 0;
      return {
        readouts:
          p("startedAt") > 0
            ? [
                readout(
                  ["Running for", "Inaendesha kwa"],
                  formatSpan(env.time - p("startedAt")),
                ),
                readout(
                  ["Nematodes collected", "Minyoo waliokusanywa"],
                  String(
                    Math.floor(
                      60 *
                        (1 - Math.exp(-hours / 8)) *
                        (0.8 + seeded(part.id, 1) * 0.4),
                    ),
                  ),
                ),
              ]
            : [],
      };
    },
  },
  "specimen-jar": {
    name: t("Specimen jar", "Chupa ya vielelezo"),
    description: t(
      "Holds animals while you identify and count them. Release them where you found them.",
      "Hushikilia wanyama unapowatambua na kuwahesabu. Waachilie ulipowapata.",
    ),
    width: 70,
    height: 90,
    controls: [
      button(
        "release",
        ["Release the animals", "Achilia wanyama"],
        ({ state, part }) =>
          note(
            state,
            part,
            t(
              "Released where they were found.",
              "Wameachiliwa walipopatikana.",
            ),
          ),
      ),
    ],
    analyse: ({ part }) => ({ observations: part.contents.notes }),
  },
  "soil-thermometer": {
    name: t("Soil thermometer", "Kipimajoto cha udongo"),
    description: t(
      "Push it into the soil to the chosen depth and wait before reading.",
      "Ichomeke kwenye udongo kwa kina kilichochaguliwa na usubiri kabla ya kusoma.",
    ),
    width: 40,
    height: 160,
    controls: [
      choice(
        "depth",
        ["Depth", "Kina"],
        [
          ["5 cm", "sm 5"],
          ["10 cm", "sm 10"],
          ["20 cm", "sm 20"],
        ],
      ),
      hint,
    ],
    analyse: ({ part, p, env }) => {
      const spot = onField(part, env.parts);
      if (!spot)
        return {
          issues: [
            issue("field", "tip", [
              "Push it into the field plot.",
              "Ichomeke kwenye shamba la utafiti.",
            ]),
          ],
        };
      const shaded = inShade(spot.x, spot.y);
      const temp = (shaded ? [21, 20, 19.5] : [26, 23, 21])[p("depth")] ?? 21;
      return {
        visual: { reading: temp },
        readouts: [
          readout(
            ["Spot", "Mahali"],
            shaded ? "under the tree" : "open ground",
          ),
          ...(p("hint") === 1
            ? [readout(["Reading", "Kipimo"], `${fixed(temp, 1)} °C`)]
            : []),
        ],
        tasks: [
          task(
            `soil-${shaded}-${p("depth")}`,
            ["Soil temperature", "Joto la udongo"],
            "°C",
            temp,
            0.5,
          ),
        ],
        measures:
          p("hint") === 1
            ? [
                measure(
                  "soilTemp",
                  ["Soil temperature", "Joto la udongo"],
                  "°C",
                  temp,
                  1,
                ),
              ]
            : [],
      };
    },
  },
  "light-meter": {
    name: t("Light meter", "Kipima mwanga"),
    description: t(
      "Hold it level at the same height each time.",
      "Ishike sawa kwenye urefu uleule kila mara.",
    ),
    width: 80,
    height: 110,
    analyse: ({ part, env }) => {
      const spot = onField(part, env.parts);
      const lux = spot
        ? (inShade(spot.x, spot.y) ? 3000 : 40000) *
          (0.9 + seeded(part.id, Math.floor(spot.x / 10)) * 0.2)
        : 500;
      return {
        visual: { lux },
        readouts: [readout(["Light", "Mwanga"], `${fixed(lux, 0)} lux`)],
        measures: [
          measure("lux", ["Light intensity", "Mwangaza"], "lux", lux, 0),
        ],
      };
    },
  },
  "soil-test-kit": {
    name: t("Soil test kit (pH)", "Kifaa cha kupima udongo (pH)"),
    description: t(
      "Shake soil with water, indicator and barium sulphate, let it settle, then match the colour to the chart.",
      "Tikisa udongo na maji, kiashiria na bariamu salfeti, acha utulie, kisha linganisha rangi na chati.",
    ),
    width: 120,
    height: 110,
    controls: [
      toggle(
        "barium",
        ["Barium sulphate", "Bariamu salfeti"],
        ["Added (clears the water)", "Imeongezwa (husafisha maji)"],
        ["Not added", "Haijaongezwa"],
      ),
      button(
        "shake",
        [
          "Take a sample, shake and leave to settle",
          "Chukua sampuli, tikisa na acha itulie",
        ],
        ({ state, part, time }) => {
          const spot = onField(part, state.parts);
          if (!spot)
            return note(
              state,
              part,
              t(
                "Take the kit onto the field plot.",
                "Peleka kifaa kwenye shamba la utafiti.",
              ),
            );
          return setParams(state, part, {
            shakenAt: time,
            ph:
              5.5 +
              (spot.x / FIELD_W) * 1.6 +
              (seeded(part.id, Math.floor(spot.y)) - 0.5) * 0.3,
          });
        },
      ),
    ],
    state: { shakenAt: 0, ph: 0 },
    analyse: ({ part, p, env }) => {
      const settled = p("shakenAt") > 0 && env.time - p("shakenAt") >= 300;
      const readable = settled && p("barium") === 1;
      return {
        visual: { ph: readable ? p("ph") : 0 },
        observations: part.contents.notes,
        issues: [
          ...(p("shakenAt") > 0 && !settled
            ? [
                issue("wait", "tip", [
                  "Leave it about 5 minutes to settle.",
                  "Iache takriban dakika 5 itulie.",
                ]),
              ]
            : []),
          ...(settled && p("barium") === 0
            ? [
                issue("cloudy", "warn", [
                  "The water is too cloudy to read. Add barium sulphate to settle the clay.",
                  "Maji ni machafu mno kusoma. Ongeza bariamu salfeti kutuliza udongo wa mfinyanzi.",
                ]),
              ]
            : []),
        ],
        tasks: readable
          ? [
              task(
                `ph-${part.id}-${p("shakenAt")}`,
                ["Soil pH", "pH ya udongo"],
                "",
                p("ph"),
                0.5,
              ),
            ]
          : [],
      };
    },
  },
  "secchi-disc": {
    name: t("Secchi disc", "Diski ya Secchi"),
    description: t(
      "Lower it until it just disappears, then raise it until it reappears. The average depth measures water clarity. Read it on the shady side.",
      "Ishushe hadi ipotee, kisha iinue hadi ionekane tena. Wastani wa kina hupima uangavu wa maji. Soma upande wenye kivuli.",
    ),
    width: 70,
    height: 150,
    controls: [
      slider(
        "depth",
        ["Depth lowered", "Kina ilichoshushwa"],
        0,
        3,
        0.05,
        0.2,
        "m",
      ),
      toggle(
        "shady",
        ["Reading from", "Kusoma kutoka"],
        ["The shady side", "Upande wenye kivuli"],
        ["The sunny side (glare)", "Upande wa jua (mng'ao)"],
      ),
    ],
    analyse: ({ part, p, env }) => {
      const pond = env.parts.find(
        (item) =>
          item.kind === "pond" &&
          part.x + part.width / 2 >= item.x &&
          part.x + part.width / 2 <= item.x + item.width &&
          part.y + part.height / 2 >= item.y &&
          part.y + part.height / 2 <= item.y + item.height,
      );
      if (!pond)
        return {
          issues: [
            issue("pond", "tip", [
              "Put the disc over a pond.",
              "Weka diski juu ya bwawa.",
            ]),
          ],
        };
      const secchi = 0.6 + seeded(pond.id, 9);
      const limit = p("shady") === 1 ? secchi : secchi * 0.8;
      const visible = p("depth") < limit;
      return {
        visual: { depth: p("depth"), visible: visible ? 1 : 0 },
        observations: [
          visible
            ? t(
                "You can still see the black and white disc.",
                "Bado unaona diski nyeusi na nyeupe.",
              )
            : t("The disc has disappeared.", "Diski imepotea."),
        ],
        issues:
          p("shady") === 0
            ? [
                issue("glare", "warn", [
                  "Glare makes the disc vanish too soon. Read on the shady side.",
                  "Mng'ao hufanya diski ipotee mapema. Soma upande wenye kivuli.",
                ]),
              ]
            : [],
        tasks:
          p("shady") === 1
            ? [
                task(
                  `secchi-${pond.id}`,
                  ["Secchi depth", "Kina cha Secchi"],
                  "m",
                  secchi,
                  0.1,
                ),
              ]
            : [],
      };
    },
  },
  "identification-key": {
    name: t("Dichotomous key", "Ufunguo wa utambuzi"),
    description: t(
      "Answer yes or no at each step to name the animal.",
      "Jibu ndiyo au hapana kwa kila hatua kutaja mnyama.",
    ),
    width: 130,
    height: 110,
    controls: [
      choice(
        "animal",
        ["Animal to identify", "Mnyama wa kutambua"],
        [
          ["Animal A", "Mnyama A"],
          ["Animal B", "Mnyama B"],
          ["Animal C", "Mnyama C"],
          ["Animal D", "Mnyama D"],
          ["Animal E", "Mnyama E"],
          ["Animal F", "Mnyama F"],
        ],
      ),
      choice(
        "answer",
        ["Your answer", "Jibu lako"],
        [
          ["Yes", "Ndiyo"],
          ["No", "Hapana"],
        ],
      ),
      button("next", ["Go on", "Endelea"], ({ state, part }) => {
        const node = part.params.node ?? 0;
        if (node < 0) return state;
        const yes = (part.params.answer ?? 0) === 0;
        const truth = keyAnswers[part.params.animal ?? 0]?.[node];
        if (truth !== yes)
          return note(
            state,
            part,
            t(
              "Look at the animal again: that answer is not right.",
              "Mwangalie mnyama tena: jibu hilo si sahihi.",
            ),
          );
        const next = keyNext[node][yes ? 0 : 1];
        return setParams(
          state,
          part,
          next < 0
            ? { node: next, solved: (part.params.solved ?? 0) + 1 }
            : { node: next },
        );
      }),
      button("restart", ["Start again", "Anza upya"], ({ state, part }) =>
        setParams(state, part, { node: 0 }),
      ),
    ],
    state: { node: 0, solved: 0 },
    afterChange: ({ state, after, param }) =>
      param === "animal" ? setParams(state, after, { node: 0 }) : state,
    analyse: ({ part, p }) => {
      const node = p("node");
      const named = node < 0 ? keyAnimals[-node - 1] : null;
      return {
        visual: { animal: p("animal") },
        observations: part.contents.notes,
        readouts: [
          named
            ? readout(["It is a", "Ni"], named[0], "ok")
            : readout(["Question", "Swali"], keyQuestions[node]?.[0] ?? ""),
        ],
        issues: named
          ? []
          : [issue("q", "tip", keyQuestions[node] ?? keyQuestions[0])],
      };
    },
  },
};
