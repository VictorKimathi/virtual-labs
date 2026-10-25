import type {
  ChemPartSpec,
  ChemOutcome,
  ChemPart,
} from "../../chemistry.types";
import {
  emptyContents,
  totalVolume,
  takeFraction,
  tidy,
} from "../../engine/contents";
import {
  addFrom,
  drainAqueous,
  filterInto,
  filmOf,
  partByNum,
  partsOver,
  replacePart,
  addIncident,
  conditionIndex,
  rinseVessel,
  transfer,
} from "../../engine/operations";
import {
  fixed,
  issue,
  measure,
  readout,
  task,
  t,
} from "../../../workbench/data/catalogue/helpers";
import type { ChemKind } from "../kinds";
import { reagents } from "../reagents";
import { button, choice, link, slider, toggle } from "./controls";
import { vesselControls, vesselOutcome, vesselState } from "./shared";

type VesselKind =
  | "beaker"
  | "conical-flask"
  | "round-bottom-flask"
  | "flat-bottom-flask"
  | "volumetric-flask"
  | "measuring-cylinder"
  | "burette"
  | "volumetric-pipette"
  | "graduated-pipette"
  | "test-tube"
  | "boiling-tube"
  | "filter-funnel"
  | "separating-funnel"
  | "thistle-funnel"
  | "watch-glass"
  | "evaporating-dish"
  | "crucible"
  | "dropping-bottle"
  | "reagent-bottle"
  | "wash-bottle"
  | "desiccator"
  | "cuvette"
  | "microscale-kit";

const sizes = (list: number[]): [string, string][] =>
  list.map((value) => [
    value >= 1000 ? `${value / 1000} L` : `${value} mL`,
    value >= 1000 ? `L ${value / 1000}` : `mL ${value}`,
  ]);

const hint = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);
const eye = slider(
  "eye",
  ["Eye height above the meniscus", "Urefu wa jicho juu ya uso wa kioevu"],
  -30,
  30,
  1,
  18,
  "mm",
);

function withExtras(
  c: ChemOutcome,
  readouts: ChemOutcome["readouts"] = [],
  issues: ChemOutcome["issues"] = [],
): ChemOutcome {
  return {
    ...c,
    readouts: [...(c.readouts ?? []), ...readouts],
    issues: [...(c.issues ?? []), ...issues],
  };
}

/** Draws liquid into a pipette from a bottle or vessel. */
function draw(
  part: ChemPart,
  state: Parameters<typeof transfer>[0],
  volume: number,
  now: number,
) {
  const source = partByNum(state, part.params.source);
  if (!source) return state;
  const filler = state.parts.some((item) => item.kind === "pipette-filler");
  let next = state;
  if (!filler) next = addIncident(next, "swallowed", part.num);
  const empty = partByNum(next, part.num);
  if (!empty) return next;
  next = replacePart(next, { ...empty, contents: emptyContents() });
  // A wet pipette is still filled to the mark, so the water film takes up part of the volume.
  const film =
    empty.params.film > 0 && empty.params.cond !== conditionIndex(source.kind)
      ? empty.params.film
      : 0;
  return reagents[source.kind]
    ? addFrom(next, part.num, source.num, volume - film, now)
    : transfer(next, source.num, part.num, volume, now);
}

const pipetteReleaseControls = [
  link(
    "into",
    ["Release into", "Achia kwenye"],
    ["Choose a vessel", "Chagua chombo"],
    (candidate, self) =>
      candidate.id !== self.id &&
      candidate.vessel !== null &&
      candidate.kind !== "pipette-filler",
  ),
  button(
    "release",
    ["Release into the vessel", "Achia kwenye chombo"],
    ({ state, part, now }) => {
      if (part.params.into <= 0) return state;
      const total = totalVolume(part.contents);
      const extra = part.params.blow === 1 ? 0.05 : 0;
      const next = transfer(state, part.num, part.params.into, total, now);
      const target = partByNum(next, part.params.into);
      if (target && extra > 0 && target.contents.volume > 0) {
        const mixed = {
          ...target.contents,
          volume: target.contents.volume + extra,
        };
        return replacePart(next, { ...target, contents: mixed });
      }
      return next;
    },
    (part) => part.params.into > 0,
  ),
];

export const vesselParts: Record<VesselKind, ChemPartSpec> = {
  beaker: {
    name: t("Beaker", "Bikari"),
    description: t(
      "A wide, straight-sided glass for holding, mixing and heating liquids. The marks are only rough.",
      "Kioo pana chenye pande zilizonyooka cha kushikilia, kuchanganya na kupasha vimiminika. Alama ni za kukadiria tu.",
    ),
    width: 120,
    height: 140,
    vessel: (params) => ({
      capacity: [50, 100, 250, 500, 1000][params.size],
      tare: [30, 45, 85, 140, 260][params.size],
    }),
    controls: [
      choice("size", ["Size", "Ukubwa"], sizes([50, 100, 250, 500, 1000]), 2),
      ...vesselControls(),
    ],
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "conical-flask": {
    name: t("Conical (Erlenmeyer) flask", "Chupa ya koni (Erlenmeyer)"),
    description: t(
      "Its sloping sides and narrow neck let you swirl a liquid without spilling it: ideal for titrations.",
      "Pande zake zinazoteremka na shingo nyembamba hukuwezesha kuzungusha kimiminika bila kumwagika: bora kwa titreshini.",
    ),
    width: 120,
    height: 150,
    vessel: (params) => ({
      capacity: [100, 250, 500][params.size],
      tare: [50, 85, 150][params.size],
    }),
    controls: [
      choice("size", ["Size", "Ukubwa"], sizes([100, 250, 500]), 1),
      ...vesselControls(),
    ],
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "round-bottom-flask": {
    name: t("Round-bottom flask", "Chupa ya chini ya duara"),
    description: t(
      "Heats evenly and withstands pressure changes. Needs a stand or a heating mantle because it cannot stand by itself.",
      "Hupashwa sawasawa na hustahimili mabadiliko ya shinikizo. Inahitaji stendi au mantali ya joto kwa sababu haisimami yenyewe.",
    ),
    width: 130,
    height: 160,
    vessel: (params) => ({
      capacity: [250, 500][params.size],
      tare: [95, 150][params.size],
    }),
    controls: [
      choice("size", ["Size", "Ukubwa"], sizes([250, 500]), 0),
      ...vesselControls(),
    ],
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "flat-bottom-flask": {
    name: t("Flat-bottom flask", "Chupa ya chini bapa"),
    description: t(
      "Stands on the bench by itself. Good for storing and mixing; not for strong heating.",
      "Husimama mezani yenyewe. Nzuri kwa kuhifadhi na kuchanganya; si kwa kupasha joto kali.",
    ),
    width: 130,
    height: 160,
    vessel: (params) => ({
      capacity: [250, 500][params.size],
      tare: [100, 160][params.size],
    }),
    controls: [
      choice("size", ["Size", "Ukubwa"], sizes([250, 500]), 0),
      ...vesselControls(),
    ],
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "volumetric-flask": {
    name: t("Volumetric flask", "Chupa ya ujazo"),
    description: t(
      "Holds one exact volume when the bottom of the meniscus sits on the mark. Add the last few drops carefully.",
      "Hushika ujazo mmoja kamili sehemu ya chini ya uso wa kioevu ikiwa kwenye alama. Ongeza matone ya mwisho kwa uangalifu.",
    ),
    width: 100,
    height: 200,
    vessel: (params) => {
      const mark = [100, 250][params.size];
      return { capacity: mark * 1.15, tare: [60, 105][params.size], mark };
    },
    controls: [
      choice("size", ["Size", "Ukubwa"], sizes([100, 250]), 0),
      ...vesselControls({
        add: true,
        pour: true,
        rinse: true,
        empty: true,
        stopper: true,
        fine: true,
      }),
      button(
        "mix",
        ["Stopper and invert to mix", "Funga na ugeuze kuchanganya"],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            contents: {
              ...part.contents,
              notes: [
                ...part.contents.notes,
                t(
                  "The solution is mixed by inverting the flask.",
                  "Myeyusho umechanganywa kwa kugeuza chupa.",
                ),
              ].slice(-6),
            },
          }),
      ),
    ],
    state: vesselState,
    analyse: ({ part, env }) => {
      const mark = part.vessel?.mark ?? 100;
      const volume = totalVolume(part.contents);
      const offset = (volume - mark) * (mark > 150 ? 9 : 20);
      const atMark = Math.abs(offset) <= 1.2;
      return withExtras(
        vesselOutcome(part, env),
        [
          readout(
            ["Meniscus against the mark", "Uso wa kioevu dhidi ya alama"],
            atMark
              ? "On the mark"
              : offset > 0
                ? `${fixed(offset, 0)} mm above`
                : `${fixed(-offset, 0)} mm below`,
            atMark ? "ok" : "warn",
          ),
        ],
        volume > 0 && !atMark
          ? [
              issue("mark", offset > 0 ? "bad" : "tip", [
                offset > 0
                  ? "Too much liquid: the meniscus is above the mark. Make up a fresh solution."
                  : "Not up to the mark yet. Add water drop by drop until the bottom of the meniscus sits on the line.",
                offset > 0
                  ? "Kioevu kingi mno: uso uko juu ya alama. Tengeneza myeyusho mpya."
                  : "Bado haijafika alama. Ongeza maji tone kwa tone hadi sehemu ya chini ya uso iwe kwenye mstari.",
              ]),
            ]
          : [],
      );
    },
  },
  "measuring-cylinder": {
    name: t("Measuring cylinder", "Silinda ya kupimia"),
    description: t(
      "Measures volumes quite accurately. Read the bottom of the meniscus with your eye level with it.",
      "Hupima ujazo kwa usahihi unaokubalika. Soma sehemu ya chini ya uso wa kioevu jicho likiwa usawa nao.",
    ),
    width: 90,
    height: 230,
    vessel: (params) => ({
      capacity: [10, 25, 50, 100][params.size],
      tare: [20, 45, 80, 150][params.size],
    }),
    controls: [
      choice("size", ["Size", "Ukubwa"], sizes([10, 25, 50, 100]), 3),
      ...vesselControls({ add: true, pour: true, rinse: true, empty: true }),
      eye,
      hint,
    ],
    state: vesselState,
    analyse: ({ part, p, env }) => {
      const volume = totalVolume(part.contents);
      const capacity = part.vessel?.capacity ?? 100;
      const seen = volume + p("eye") * 0.04 * (capacity / 100);
      const off = Math.abs(p("eye")) > 4;
      return withExtras(
        { ...vesselOutcome(part, env), readouts: [] },
        p("hint") === 1
          ? [
              readout(
                ["Reading from here", "Kipimo kutoka hapa"],
                `${fixed(seen, 2)} mL`,
                off ? "warn" : undefined,
              ),
            ]
          : [],
        off
          ? [
              issue("eye", "warn", [
                "Parallax: keep your eye level with the bottom of the meniscus.",
                "Mchepuko: weka jicho usawa na chini ya uso wa kioevu.",
              ]),
            ]
          : [],
      );
    },
  },
  burette: {
    name: t("Burette", "Biureti"),
    description: t(
      "Delivers a measured volume through its tap, reading downwards from 0. Rinse it with the solution, fill it, remove the air bubble from the tip, then read the meniscus at eye level.",
      "Hutoa ujazo uliopimwa kupitia bomba lake, kikisomwa kwenda chini kutoka 0. Isuuze kwa myeyusho, ijaze, ondoa kiputo cha hewa kwenye ncha, kisha usome uso wa kioevu jicho likiwa usawa.",
    ),
    width: 80,
    height: 300,
    vessel: { capacity: 50, tare: 0 },
    controls: [
      ...vesselControls({ add: true, rinse: true, empty: true }),
      link(
        "flask",
        ["Run into", "Toa kwenye"],
        ["Choose a flask", "Chagua chupa"],
        (candidate, self) =>
          candidate.id !== self.id &&
          candidate.vessel !== null &&
          candidate.kind !== "burette",
      ),
      slider(
        "run",
        ["Volume to run out", "Ujazo wa kutoa"],
        0.05,
        5,
        0.05,
        1,
        "mL",
        (part) => part.params.flask > 0,
      ),
      button(
        "runOut",
        ["Run out", "Toa"],
        ({ state, part, now }) => {
          if (part.params.flask <= 0) return state;
          const amount = Math.min(part.params.run, totalVolume(part.contents));
          const air = part.params.bubble === 1 ? Math.min(0.15, amount) : 0;
          let next = transfer(
            state,
            part.num,
            part.params.flask,
            amount - air,
            now,
          );
          const burette = partByNum(next, part.num);
          if (burette && air > 0) {
            const { left } = takeFraction(
              burette.contents,
              air / Math.max(1e-9, totalVolume(burette.contents)),
            );
            next = replacePart(next, {
              ...burette,
              contents: tidy(left),
              params: { ...burette.params, bubble: 0 },
            });
          }
          return next;
        },
        (part) => part.params.flask > 0,
      ),
      button(
        "purge",
        [
          "Run 1 mL through the tip (remove the air bubble)",
          "Toa mL 1 kupitia ncha (ondoa kiputo cha hewa)",
        ],
        ({ state, part }) => {
          const { left } = takeFraction(
            part.contents,
            1 / Math.max(1, totalVolume(part.contents)),
          );
          return replacePart(state, {
            ...part,
            contents: tidy(left),
            params: { ...part.params, bubble: 0 },
          });
        },
        (part) => part.params.bubble === 1,
      ),
      button(
        "initial",
        ["Record the initial reading", "Rekodi kipimo cha mwanzo"],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: {
              ...part.params,
              init: 50 - totalVolume(part.contents),
              hasInit: 1,
              hasFinal: 0,
            },
          }),
      ),
      button(
        "final",
        ["Record the final reading", "Rekodi kipimo cha mwisho"],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: {
              ...part.params,
              final: 50 - totalVolume(part.contents),
              hasFinal: 1,
            },
          }),
        (part) => part.params.hasInit === 1,
      ),
      eye,
      hint,
    ],
    state: {
      ...vesselState,
      film: filmOf("burette"),
      bubble: 0,
      init: 0,
      final: 0,
      hasInit: 0,
      hasFinal: 0,
    },
    analyse: ({ part, p, env }) => {
      const volume = totalVolume(part.contents);
      const reading = 50 - volume;
      const seen = reading - p("eye") * 0.004;
      const titre =
        p("hasInit") === 1 && p("hasFinal") === 1
          ? p("final") - p("init")
          : null;
      const base = vesselOutcome(part, env);
      return {
        ...base,
        readouts: [
          ...(p("hint") === 1
            ? [readout(["Reading", "Kipimo"], `${fixed(seen, 2)} mL`)]
            : []),
          ...(p("hasInit") === 1
            ? [
                readout(
                  ["Initial reading", "Kipimo cha mwanzo"],
                  `${fixed(p("init"), 2)} mL`,
                ),
              ]
            : []),
          ...(titre !== null
            ? [readout(["Titre", "Titre"], `${fixed(titre, 2)} mL`, "ok")]
            : []),
        ],
        issues: [
          ...(base.issues ?? []),
          ...(p("bubble") === 1
            ? [
                issue("bubble", "warn", [
                  "There is an air bubble in the tip. Run a little liquid through to remove it, or your readings will be wrong.",
                  "Kuna kiputo cha hewa kwenye ncha. Toa kioevu kidogo ukiondoe, la sivyo vipimo vitakuwa vibaya.",
                ]),
              ]
            : []),
          ...(p("film") > 0 && volume < 1
            ? [
                issue("rinse", "tip", [
                  "The burette is still wet with water. Rinse it with a little of the solution before you fill it.",
                  "Biureti bado ina unyevu wa maji. Isuuze kwa myeyusho kidogo kabla ya kuijaza.",
                ]),
              ]
            : []),
          ...(Math.abs(p("eye")) > 4
            ? [
                issue("eye", "warn", [
                  "Parallax: read the bottom of the meniscus with your eye level.",
                  "Mchepuko: soma chini ya uso wa kioevu jicho likiwa usawa.",
                ]),
              ]
            : []),
        ],
        tasks:
          volume > 0
            ? [
                task(
                  `burette-${reading.toFixed(2)}`,
                  ["Burette reading", "Kipimo cha biureti"],
                  "mL",
                  reading,
                  0.06,
                  [
                    "The scale runs downwards: the numbers grow towards the tap.",
                    "Kipimo kinashuka: namba huongezeka kuelekea kwenye bomba.",
                  ],
                ),
              ]
            : [],
        measures:
          titre !== null
            ? [measure("titre", ["Titre", "Titre"], "mL", titre, 2)]
            : [],
        visual: { reading, bubble: p("bubble") },
      };
    },
  },
  "volumetric-pipette": {
    name: t("Volumetric pipette (25 mL)", "Pipeti ya ujazo (mL 25)"),
    description: t(
      "Delivers exactly 25.0 mL. Rinse it with the solution, fill to the mark with a pipette filler, let it drain and do not blow out the last drop.",
      "Hutoa mL 25.0 kamili. Isuuze kwa myeyusho, ijaze hadi alama kwa kijazaji cha pipeti, iache ikauke na usipulizie tone la mwisho.",
    ),
    width: 50,
    height: 260,
    vessel: { capacity: 28, tare: 0, mark: 25 },
    controls: [
      link(
        "source",
        ["Draw from", "Vuta kutoka"],
        ["Choose a bottle or vessel", "Chagua chupa au chombo"],
        (candidate, self) =>
          candidate.id !== self.id &&
          (Boolean(reagents[candidate.kind]) || candidate.vessel !== null),
      ),
      slider(
        "level",
        ["Meniscus above the mark", "Uso wa kioevu juu ya alama"],
        -6,
        6,
        0.5,
        3,
        "mm",
      ),
      button(
        "draw",
        ["Draw up the liquid", "Vuta kioevu"],
        ({ state, part, now }) =>
          draw(part, state, 25 + part.params.level * 0.03, now),
        (part) => part.params.source > 0,
      ),
      toggle(
        "blow",
        ["Last drop", "Tone la mwisho"],
        ["Blown out", "Limepulizwa"],
        ["Left in the tip", "Limeachwa kwenye ncha"],
      ),
      ...pipetteReleaseControls,
      button(
        "rinse",
        [
          "Rinse (with the chosen bottle, or distilled water)",
          "Suuza (kwa chupa iliyochaguliwa, au maji yaliyosafishwa)",
        ],
        ({ state, part }) => rinseVessel(state, part.num, part.params.source),
      ),
    ],
    state: { ...vesselState, film: filmOf("volumetric-pipette") },
    analyse: ({ part, p, env }) => {
      const volume = totalVolume(part.contents);
      const base = vesselOutcome(part, env);
      const fine = Math.abs(p("level")) <= 0.5;
      return {
        ...base,
        issues: [
          ...(base.issues ?? []),
          ...(!env.parts.some((item) => item.kind === "pipette-filler")
            ? [
                issue("filler", "bad", [
                  "Place a pipette filler on the bench. Never pipette by mouth.",
                  "Weka kijazaji cha pipeti mezani. Kamwe usitumie pipeti kwa mdomo.",
                ]),
              ]
            : []),
          ...(volume === 0 && p("film") > 0
            ? [
                issue("rinse", "tip", [
                  "Rinse the pipette with a little of the solution first.",
                  "Suuza pipeti kwa myeyusho kidogo kwanza.",
                ]),
              ]
            : []),
          ...(volume > 0 && !fine
            ? [
                issue("mark", "warn", [
                  "The meniscus is not on the mark. Adjust it so the bottom of the meniscus touches the line.",
                  "Uso wa kioevu haupo kwenye alama. Urekebishe ili chini yake iguse mstari.",
                ]),
              ]
            : []),
          ...(p("blow") === 1
            ? [
                issue("blow", "warn", [
                  "Do not blow out the last drop: the pipette is calibrated to leave it.",
                  "Usipulizie tone la mwisho: pipeti imerekebishwa kuliacha.",
                ]),
              ]
            : []),
        ],
        readouts: [...(base.readouts ?? [])],
      };
    },
  },
  "graduated-pipette": {
    name: t("Graduated pipette (10 mL)", "Pipeti yenye alama (mL 10)"),
    description: t(
      "Delivers any volume up to 10 mL, read from the scale. Less accurate than a volumetric pipette.",
      "Hutoa ujazo wowote hadi mL 10, unaosomwa kwenye kipimo. Si sahihi kama pipeti ya ujazo.",
    ),
    width: 40,
    height: 260,
    vessel: { capacity: 10.5, tare: 0 },
    controls: [
      link(
        "source",
        ["Draw from", "Vuta kutoka"],
        ["Choose a bottle or vessel", "Chagua chupa au chombo"],
        (candidate, self) =>
          candidate.id !== self.id &&
          (Boolean(reagents[candidate.kind]) || candidate.vessel !== null),
      ),
      slider(
        "amount",
        ["Volume to draw", "Ujazo wa kuvuta"],
        0.1,
        10,
        0.1,
        5,
        "mL",
      ),
      button(
        "draw",
        ["Draw up the liquid", "Vuta kioevu"],
        ({ state, part, now }) => draw(part, state, part.params.amount, now),
        (part) => part.params.source > 0,
      ),
      ...pipetteReleaseControls,
    ],
    state: { ...vesselState, film: filmOf("graduated-pipette"), blow: 0 },
    analyse: ({ part, env }) => {
      const base = vesselOutcome(part, env);
      return {
        ...base,
        issues: [
          ...(base.issues ?? []),
          ...(!env.parts.some((item) => item.kind === "pipette-filler")
            ? [
                issue("filler", "bad", [
                  "Place a pipette filler on the bench. Never pipette by mouth.",
                  "Weka kijazaji cha pipeti mezani. Kamwe usitumie pipeti kwa mdomo.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "test-tube": {
    name: t("Test tube", "Mrija wa majaribio"),
    description: t(
      "Holds small amounts for tests. Never fill more than a third when heating, and point the mouth away from people.",
      "Hushika kiasi kidogo kwa majaribio. Kamwe usijaze zaidi ya theluthi wakati wa kupasha, na elekeza mdomo mbali na watu.",
    ),
    width: 40,
    height: 150,
    vessel: { capacity: 20, tare: 9 },
    controls: vesselControls(),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "boiling-tube": {
    name: t("Boiling tube", "Mrija wa kuchemsha"),
    description: t(
      "A larger, thicker tube that can be heated more strongly than a test tube.",
      "Mrija mkubwa na mnene zaidi unaoweza kupashwa joto kali kuliko mrija wa majaribio.",
    ),
    width: 50,
    height: 170,
    vessel: { capacity: 35, tare: 16 },
    controls: vesselControls(),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "filter-funnel": {
    name: t("Filter funnel", "Faneli ya kuchuja"),
    description: t(
      "Holds filter paper above a flask. Pour a mixture in: the liquid (filtrate) runs through and the solid (residue) stays on the paper. Without filter paper the solid goes straight through.",
      "Hushikilia karatasi ya kuchuja juu ya chupa. Mimina mchanganyiko: kioevu (kichujio) hupita na kigumu (masalio) hubaki kwenye karatasi. Bila karatasi kigumu hupita moja kwa moja.",
    ),
    width: 120,
    height: 130,
    vessel: { capacity: 100, tare: 25 },
    controls: [
      link(
        "from",
        ["Filter the mixture in", "Chuja mchanganyiko ulio kwenye"],
        ["Choose a vessel", "Chagua chombo"],
        (candidate, self) =>
          candidate.id !== self.id &&
          candidate.vessel !== null &&
          candidate.kind !== "filter-funnel",
      ),
      button(
        "filter",
        ["Pour through the funnel", "Mimina kupitia faneli"],
        ({ state, part, now }) => {
          const receiver = partsOver(state, part, [
            "conical-flask",
            "beaker",
            "round-bottom-flask",
            "flat-bottom-flask",
            "test-tube",
            "boiling-tube",
            "volumetric-flask",
          ])[0];
          if (!receiver || part.params.from <= 0) return state;
          const hasPaper = partsOver(state, part, ["filter-paper"]).length > 0;
          if (hasPaper)
            return filterInto(
              state,
              part.params.from,
              part.num,
              receiver.num,
              now,
            );
          const source = partByNum(state, part.params.from);
          return source
            ? transfer(
                state,
                source.num,
                receiver.num,
                totalVolume(source.contents),
                now,
              )
            : state;
        },
        (part) => part.params.from > 0,
      ),
      ...vesselControls({ rinse: true, empty: true }).filter(
        (control) => control.type !== "slider",
      ),
    ],
    state: vesselState,
    analyse: ({ part, env }) => {
      const base = vesselOutcome(part, env);
      const receiver = partsOver(env, part, [
        "conical-flask",
        "beaker",
        "round-bottom-flask",
        "flat-bottom-flask",
        "test-tube",
        "boiling-tube",
        "volumetric-flask",
      ])[0];
      const paper = partsOver(env, part, ["filter-paper"]).length > 0;
      return {
        ...base,
        liquid: undefined,
        issues: [
          ...(base.issues ?? []),
          ...(!receiver
            ? [
                issue("receiver", "tip", [
                  "Stand the funnel over a flask or beaker to catch the filtrate.",
                  "Simamisha faneli juu ya chupa au bikari ukamate kichujio.",
                ]),
              ]
            : []),
          ...(!paper
            ? [
                issue("paper", "warn", [
                  "There is no filter paper in the funnel. Place filter paper over it, or the solid will pass through.",
                  "Hakuna karatasi ya kuchuja kwenye faneli. Weka karatasi juu yake, la sivyo kigumu kitapita.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "separating-funnel": {
    name: t("Separating funnel", "Faneli ya kutenganisha"),
    description: t(
      "Separates liquids that do not mix, such as oil and water. The denser water is the lower layer; run it off through the tap.",
      "Hutenganisha vimiminika visivyochanganyika, kama mafuta na maji. Maji mazito ni tabaka la chini; yatoe kupitia bomba.",
    ),
    width: 90,
    height: 190,
    vessel: { capacity: 250, tare: 120 },
    controls: [
      ...vesselControls({ add: true, rinse: true, empty: true, stopper: true }),
      link(
        "into",
        ["Run the lower layer into", "Toa tabaka la chini kwenye"],
        ["Choose a vessel", "Chagua chombo"],
        (candidate, self) =>
          candidate.id !== self.id && candidate.vessel !== null,
      ),
      slider(
        "drain",
        ["Volume to run off", "Ujazo wa kutoa"],
        0.5,
        100,
        0.5,
        20,
        "mL",
        (part) => part.params.into > 0,
      ),
      button(
        "drainNow",
        ["Open the tap", "Fungua bomba"],
        ({ state, part, now }) =>
          drainAqueous(
            state,
            part.num,
            part.params.into,
            part.params.drain,
            now,
          ),
        (part) => part.params.into > 0,
      ),
    ],
    state: vesselState,
    analyse: ({ part, env }) => {
      const base = vesselOutcome(part, env);
      return {
        ...base,
        issues: [
          ...(base.issues ?? []),
          ...(part.contents.organic > 0 && part.contents.volume > 0
            ? [
                issue("layers", "tip", [
                  "Two layers: the oil floats on the water because it is less dense.",
                  "Matabaka mawili: mafuta huelea juu ya maji kwa sababu si mazito.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "thistle-funnel": {
    name: t("Thistle funnel", "Faneli ya mwiba"),
    description: t(
      "A funnel with a long stem that goes below the liquid in a flask so acid can be added without gas escaping.",
      "Faneli yenye shina refu linalofika chini ya kioevu kwenye chupa ili asidi iongezwe bila gesi kutoroka.",
    ),
    width: 70,
    height: 190,
    vessel: { capacity: 60, tare: 30 },
    controls: vesselControls({ add: true, pour: true, empty: true }),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "watch-glass": {
    name: t("Watch glass", "Kioo cha saa"),
    description: t(
      "A shallow dish for holding small amounts of solid, or for covering a beaker.",
      "Sahani isiyo na kina ya kushikilia kiasi kidogo cha kigumu, au kufunika bikari.",
    ),
    width: 110,
    height: 40,
    vessel: { capacity: 5, tare: 12 },
    controls: vesselControls({ add: true, pour: true, empty: true }),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "evaporating-dish": {
    name: t("Evaporating dish", "Sahani ya kuvukiza"),
    description: t(
      "A shallow porcelain dish. Heat a salt solution gently and crystals are left when the water evaporates.",
      "Sahani ya kauri isiyo na kina. Pasha myeyusho wa chumvi taratibu na fuwele zinabaki maji yakivukiza.",
    ),
    width: 120,
    height: 60,
    vessel: { capacity: 60, tare: 48 },
    controls: vesselControls({
      add: true,
      pour: true,
      empty: true,
      heat: true,
    }),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  crucible: {
    name: t("Crucible", "Kikombe cha kuchomea"),
    description: t(
      "A small porcelain cup for strongly heating solids. Use a pipe-clay triangle on a tripod, and tongs to move it.",
      "Kikombe kidogo cha kauri cha kupasha vigumu kwa joto kali. Tumia pembetatu ya udongo kwenye tripodi, na koleo kukihamisha.",
    ),
    width: 60,
    height: 55,
    vessel: { capacity: 15, tare: 22 },
    controls: vesselControls({ add: true, empty: true, heat: true }),
    state: vesselState,
    analyse: ({ part, env }) => {
      const base = vesselOutcome(part, env);
      const lid = partsOver(env, part, ["crucible-lid"]).length > 0;
      return {
        ...base,
        issues: [
          ...(base.issues ?? []),
          ...(lid
            ? [
                issue("lid", "tip", [
                  "The lid is on, so less air gets in. Lift it slightly while heating metals that need oxygen.",
                  "Mfuniko umewekwa, kwa hiyo hewa kidogo inaingia. Uinue kidogo wakati wa kupasha metali zinazohitaji oksijeni.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "dropping-bottle": {
    name: t("Dropping bottle", "Chupa ya matone"),
    description: t(
      "A small bottle with a dropper for adding indicators and other reagents a drop at a time.",
      "Chupa ndogo yenye kitone cha kuongeza viashiria na vitendanishi vingine tone kwa tone.",
    ),
    width: 50,
    height: 110,
    vessel: { capacity: 30, tare: 25 },
    controls: vesselControls({ add: true, pour: true, empty: true }),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "reagent-bottle": {
    name: t("Reagent bottle", "Chupa ya kitendanishi"),
    description: t(
      "A stoppered bottle for storing a solution. Always label what is inside.",
      "Chupa yenye kizibo ya kuhifadhi myeyusho. Weka lebo ya kilichomo kila mara.",
    ),
    width: 80,
    height: 140,
    vessel: { capacity: 500, tare: 220 },
    controls: vesselControls({ add: true, pour: true, empty: true }),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "wash-bottle": {
    name: t(
      "Wash bottle (distilled water)",
      "Chupa ya kuoshea (maji yaliyosafishwa)",
    ),
    description: t(
      "A squeezable bottle of distilled water, for rinsing glassware and adding the last drops to a mark.",
      "Chupa inayobanwa yenye maji yaliyosafishwa, ya kuosha vyombo na kuongeza matone ya mwisho hadi alama.",
    ),
    width: 80,
    height: 160,
    vessel: { capacity: 500, tare: 60 },
    initial: () => ({ ...emptyContents(), volume: 400 }),
    controls: vesselControls({ pour: true }),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  desiccator: {
    name: t("Desiccator", "Kikausha"),
    description: t(
      "A sealed jar with a drying agent. It keeps anhydrous solids, such as white copper(II) sulphate, from absorbing water.",
      "Mtungi uliofungwa wenye kikaushi. Huzuia vigumu visivyo na maji, kama shaba(II) salfeti nyeupe, kufyonza maji.",
    ),
    width: 140,
    height: 130,
    vessel: { capacity: 400, tare: 600 },
    controls: vesselControls({ add: true, pour: true, empty: true }),
    state: vesselState,
    analyse: ({ part, env }) => {
      const base = vesselOutcome(part, env);
      const anhydrous = (part.contents.solids.cuso4anh ?? 0) > 0;
      return {
        ...base,
        issues: [
          ...(base.issues ?? []),
          ...(anhydrous
            ? [
                issue("dry", "tip", [
                  "The anhydrous copper(II) sulphate stays white in here because the air is dry.",
                  "Shaba(II) salfeti isiyo na maji inabaki nyeupe hapa kwa sababu hewa ni kavu.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  cuvette: {
    name: t("Cuvette", "Kyuveti"),
    description: t(
      "A small clear container for a colorimeter. Handle it by the frosted sides and wipe the clear faces.",
      "Chombo kidogo kinachoonekana ndani cha kolorimita. Kishike kwa pande zenye ukungu na ufute pande zilizo wazi.",
    ),
    width: 44,
    height: 90,
    vessel: { capacity: 4, tare: 3 },
    controls: vesselControls({
      add: true,
      pour: true,
      empty: true,
      rinse: true,
    }),
    state: vesselState,
    analyse: ({ part, env }) => vesselOutcome(part, env),
  },
  "microscale-kit": {
    name: t("Microscale chemistry kit", "Kifaa cha kemia ndogo"),
    description: t(
      "A well plate and plastic dropper bottles for experiments with a few drops: cheap, quick and little waste.",
      "Sahani yenye mashimo na chupa za matone za plastiki kwa majaribio ya matone machache: nafuu, ya haraka na taka kidogo.",
    ),
    width: 150,
    height: 80,
    vessel: { capacity: 2, tare: 5 },
    controls: vesselControls({ add: true, pour: true, empty: true }),
    state: vesselState,
    analyse: ({ part, env }) =>
      withExtras(vesselOutcome(part, env), [
        readout(
          ["Reagent used", "Kitendanishi kilichotumika"],
          `${fixed(totalVolume(part.contents), 2)} mL`,
        ),
      ]),
  },
};

export const vesselKinds: ChemKind[] = [
  "beaker",
  "conical-flask",
  "round-bottom-flask",
  "flat-bottom-flask",
  "volumetric-flask",
  "measuring-cylinder",
  "burette",
  "volumetric-pipette",
  "graduated-pipette",
  "test-tube",
  "boiling-tube",
  "filter-funnel",
  "separating-funnel",
  "thistle-funnel",
  "watch-glass",
  "evaporating-dish",
  "crucible",
  "dropping-bottle",
  "reagent-bottle",
  "wash-bottle",
  "desiccator",
  "cuvette",
  "microscale-kit",
];
