import type {
  BioAfterChange,
  BioOutcome,
  BioPartSpec,
} from "../../biology.types";
import {
  bestFocus,
  cellSize,
  microscopeImage,
  objectives,
  preparedSpecimens,
  stageHeight,
  stains,
  wetMountSpecimens,
  workingClearance,
  bestStain,
} from "../../engine/microscope";
import {
  addIncident,
  note,
  partByNum,
  setParams,
} from "../../engine/operations";
import {
  fixed,
  issue,
  measure,
  readout,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import type { BioKind } from "../kinds";
import { button, choice, hint, link, slider, toggle } from "./controls";

type MicroscopyKind =
  | "light-microscope"
  | "hand-lens"
  | "glass-slide"
  | "cover-slip"
  | "prepared-slide"
  | "mounting-needle"
  | "forceps"
  | "dropper"
  | "stage-micrometer"
  | "methylene-blue"
  | "eosin"
  | "acetocarmine"
  | "onion-bulb"
  | "cheek-swab";

const slideKinds: BioKind[] = [
  "glass-slide",
  "prepared-slide",
  "stage-micrometer",
];
export const stainKinds: BioKind[] = [
  "iodine-solution",
  "methylene-blue",
  "eosin",
  "acetocarmine",
];
const stainOfKind: Partial<Record<BioKind, number>> = {
  "iodine-solution": 1,
  "methylene-blue": 2,
  eosin: 3,
  acetocarmine: 4,
};

const focusAfterChange: BioAfterChange = ({ state, after, param, time }) => {
  const slide = partByNum(state, after.params.slide ?? 0);
  if (param === "slide")
    return setParams(state, after, {
      focusedLow: 0,
      broken: 0,
      changedAt: time,
    });
  if (!slide || after.params.broken === 1) return state;
  const objective = objectives[after.params.objective ?? 0] ?? 4;
  const best = bestFocus(slide, objective);
  const height = stageHeight(after);
  if (height > best + workingClearance[objective]) {
    const next = addIncident(
      setParams(state, after, { broken: 1 }),
      "broken-slide",
    );
    return note(
      next,
      after,
      t("Crack! The lens hit the slide.", "Kra! Lenzi iligonga slaidi."),
    );
  }
  if (objective < 40 && microscopeImage(after, slide).blur < 1.5)
    return setParams(state, after, { focusedLow: 1 });
  return state;
};

/** A microscope: the light one on the bench, or a digital one with a screen. */
export function microscopeSpec(digital: boolean): BioPartSpec {
  return {
    name: digital
      ? t("Digital microscope", "Hadubini ya kidijitali")
      : t("Light microscope", "Hadubini ya mwanga"),
    description: digital
      ? t(
          "A microscope with a camera and screen, so the whole class can see. Focus and calibrate it like a light microscope.",
          "Hadubini yenye kamera na skrini, ili darasa lote lione. Ilenge na uirekebishe kama hadubini ya mwanga.",
        )
      : t(
          "Start on the lowest power. Focus with the coarse knob, then the fine knob. On high power use only the fine knob. Adjust the light and the diaphragm.",
          "Anza kwenye nguvu ndogo kabisa. Lenga kwa kifundo kikuu, kisha kifundo kidogo. Kwenye nguvu kubwa tumia kifundo kidogo tu. Rekebisha mwanga na kiwambo.",
        ),
    width: digital ? 180 : 140,
    height: digital ? 200 : 220,
    controls: [
      link(
        "slide",
        ["Slide on the stage", "Slaidi kwenye jukwaa"],
        ["Choose a slide", "Chagua slaidi"],
        (candidate) => slideKinds.includes(candidate.kind),
      ),
      choice(
        "objective",
        ["Objective lens", "Lenzi ya kitu"],
        [
          ["×4 (low power)", "×4 (nguvu ndogo)"],
          ["×10 (medium power)", "×10 (nguvu ya kati)"],
          ["×40 (high power)", "×40 (nguvu kubwa)"],
        ],
      ),
      slider(
        "coarse",
        ["Coarse focus (stage height)", "Kifundo kikuu (urefu wa jukwaa)"],
        0,
        20,
        0.1,
        5,
        "mm",
      ),
      slider(
        "fine",
        ["Fine focus", "Kifundo kidogo"],
        -0.1,
        0.1,
        0.002,
        0,
        "mm",
      ),
      slider("lamp", ["Light", "Mwanga"], 0, 100, 5, digital ? 70 : 0, "%"),
      slider(
        "diaphragm",
        ["Diaphragm (open)", "Kiwambo (wazi)"],
        0,
        100,
        5,
        100,
        "%",
      ),
      slider(
        "x",
        ["Move slide left / right", "Sogeza slaidi kushoto / kulia"],
        -2000,
        2000,
        50,
        0,
        "µm",
      ),
      slider(
        "y",
        ["Move slide up / down", "Sogeza slaidi juu / chini"],
        -2000,
        2000,
        50,
        0,
        "µm",
      ),
      toggle(
        "graticule",
        ["Eyepiece graticule", "Kipimo cha jicho"],
        ["In the eyepiece", "Kwenye kioo cha jicho"],
        ["Out", "Nje"],
      ),
      ...(digital
        ? [
            button(
              "capture",
              ["Capture an image", "Piga picha"],
              ({ state, part }) =>
                setParams(state, part, {
                  captures: (part.params.captures ?? 0) + 1,
                }),
            ),
          ]
        : []),
      hint,
    ],
    state: { slide: 0, focusedLow: 0, broken: 0, changedAt: 0, captures: 0 },
    afterChange: focusAfterChange,
    analyse: ({ part, p, env }) => {
      const slide = env.part(p("slide"));
      const view = microscopeImage(part, slide);
      const objective = view.objective;
      const sharp = view.blur < 1.5;
      const issues: BioOutcome["issues"] = [];
      if (!slide)
        issues.push(
          issue("slide", "tip", [
            "Choose a slide to put on the stage.",
            "Chagua slaidi ya kuweka kwenye jukwaa.",
          ]),
        );
      if (view.broken)
        issues.push(
          issue("broken", "bad", [
            "The slide is cracked. Put it in the sharps container and use a new one.",
            "Slaidi imepasuka. Iweke kwenye chombo cha vitu vikali na utumie mpya.",
          ]),
        );
      if (p("lamp") === 0)
        issues.push(
          issue("light", "warn", [
            "It is dark: switch on the light.",
            "Ni giza: washa mwanga.",
          ]),
        );
      else if (view.brightness < 0.25)
        issues.push(
          issue("dim", "warn", [
            "Too dark. Turn up the light or open the diaphragm.",
            "Giza mno. Ongeza mwanga au fungua kiwambo.",
          ]),
        );
      if (slide && view.contrast < 0.5 && view.brightness >= 0.25)
        issues.push(
          issue("contrast", "tip", [
            "The cells are faint. Close the diaphragm a little, or stain the specimen.",
            "Seli hazionekani vizuri. Funga kiwambo kidogo, au tia rangi kielelezo.",
          ]),
        );
      if (slide && objective === 40 && p("focusedLow") === 0)
        issues.push(
          issue("low", "warn", [
            "Always focus on low power first, then turn to high power.",
            "Lenga kwanza kwenye nguvu ndogo, kisha geuza kwenda nguvu kubwa.",
          ]),
        );
      if (slide && !sharp)
        issues.push(
          issue("focus", "tip", [
            objective === 40
              ? "Out of focus. Use only the fine focus on high power."
              : "Out of focus. Use the coarse focus, then the fine focus.",
            objective === 40
              ? "Haijalenga. Tumia kifundo kidogo tu kwenye nguvu kubwa."
              : "Haijalenga. Tumia kifundo kikuu, kisha kifundo kidogo.",
          ]),
        );
      if (view.bubbles > 0)
        issues.push(
          issue("bubbles", "warn", [
            "Black-ringed circles are air bubbles. Lower the cover slip at an angle with a mounting needle.",
            "Duara zenye pete nyeusi ni viputo vya hewa. Shusha kifuniko kwa pembe ukitumia sindano.",
          ]),
        );
      if (view.dry)
        issues.push(
          issue("dry", "warn", [
            "The specimen has dried out. Add a drop of water or stain.",
            "Kielelezo kimekauka. Ongeza tone la maji au rangi.",
          ]),
        );
      const tasks: BioOutcome["tasks"] = [];
      if (view.specimen === "micrometer" && view.graticule && sharp)
        tasks.push(
          task(
            `epu-${part.id}-${objective}`,
            [
              `Length of one eyepiece unit at ×${objective} objective`,
              `Urefu wa kipimo kimoja cha jicho kwa lenzi ×${objective}`,
            ],
            "µm",
            view.umPerUnit,
            view.umPerUnit * 0.03,
            [
              "One small division of the stage micrometer is 10 µm. Count how many line up with the eyepiece units.",
              "Kigawanyo kimoja kidogo cha kipimo cha jukwaa ni µm 10. Hesabu vingapi vinalingana na vipimo vya jicho.",
            ],
          ),
        );
      if (
        slide &&
        view.specimen &&
        view.specimen !== "micrometer" &&
        view.graticule &&
        sharp &&
        ["onion", "cheek", "blood"].includes(view.specimen)
      ) {
        const size = cellSize(view.specimen, slide.id);
        tasks.push(
          task(
            `cell-${slide.id}`,
            ["Length of one cell", "Urefu wa seli moja"],
            "µm",
            size,
            size * 0.1,
            [
              "Count eyepiece units across the cell and multiply by your calibration.",
              "Hesabu vipimo vya jicho kuvuka seli na zidisha kwa urekebishaji wako.",
            ],
          ),
        );
      }
      const readouts = [
        readout(["Magnification", "Ukuzaji"], `×${objective * 10}`),
      ];
      if (
        p("hint") === 1 &&
        slide &&
        view.specimen &&
        view.specimen !== "micrometer"
      )
        readouts.push(
          readout(
            ["One cell spans about", "Seli moja ina takriban"],
            `${fixed(cellSize(view.specimen, slide.id) / view.umPerUnit, 0)} units`,
          ),
        );
      if (p("hint") === 1)
        readouts.push(
          readout(
            ["Field of view", "Eneo la kuona"],
            `${fixed(view.field / 1000, 2)} mm`,
          ),
        );
      if (p("captures") > 0)
        readouts.push(
          readout(
            ["Images captured", "Picha zilizopigwa"],
            String(p("captures")),
          ),
        );
      return {
        view,
        visual: {
          objective: p("objective"),
          lamp: p("lamp"),
          sharp: sharp ? 1 : 0,
          digital: digital ? 1 : 0,
        },
        observations: part.contents.notes,
        readouts,
        issues,
        tasks,
        measures: [
          measure(
            "magnification",
            ["Magnification", "Ukuzaji"],
            "×",
            objective * 10,
            0,
          ),
        ],
      };
    },
  };
}

const tool = (
  name: [string, string],
  description: [string, string],
  width: number,
  height: number,
): BioPartSpec => ({
  name: t(...name),
  description: t(...description),
  width,
  height,
});

const stainBottle = (
  name: [string, string],
  description: [string, string],
): BioPartSpec => ({
  ...tool(name, description, 50, 90),
  analyse: () => ({ readouts: [readout(["Use", "Matumizi"], "1 drop")] }),
});

export const microscopyParts: Record<MicroscopyKind, BioPartSpec> = {
  "light-microscope": microscopeSpec(false),
  "hand-lens": {
    name: t("Hand lens (×10)", "Lenzi ya mkono (×10)"),
    description: t(
      "Hold the lens close to your eye and bring the specimen towards it until it is sharp.",
      "Shika lenzi karibu na jicho na usogeze kielelezo kuielekea hadi kionekane wazi.",
    ),
    width: 90,
    height: 60,
    controls: [
      link(
        "target",
        ["Looking at", "Unatazama"],
        ["Choose a specimen", "Chagua kielelezo"],
        (candidate) =>
          [
            "flower",
            "bean-seed",
            "classification-specimens",
            "maize-cob",
            "onion-bulb",
          ].includes(candidate.kind),
      ),
      slider(
        "distance",
        ["Specimen distance from the lens", "Umbali wa kielelezo kutoka lenzi"],
        10,
        80,
        1,
        50,
        "mm",
      ),
    ],
    analyse: ({ p, env }) => {
      const target = env.part(p("target"));
      const sharp = Math.abs(p("distance") - 25) <= 4;
      return {
        readouts: [readout(["Magnification", "Ukuzaji"], "×10")],
        observations:
          target && sharp
            ? [
                t(
                  "Fine detail is clear: hairs, veins and surface texture.",
                  "Maelezo madogo yako wazi: nywele, mishipa na umbo la uso.",
                ),
              ]
            : [],
        issues:
          target && !sharp
            ? [
                issue("blur", "tip", [
                  "Blurred. Move the specimen until it is about 25 mm from the lens.",
                  "Haionekani wazi. Sogeza kielelezo hadi kiwe takriban mm 25 kutoka lenzi.",
                ]),
              ]
            : [],
      };
    },
  },
  "glass-slide": {
    name: t(
      "Glass slide (wet mount)",
      "Slaidi ya kioo (kielelezo chenye maji)",
    ),
    description: t(
      "Put the specimen on the slide, add a drop of water or stain, then lower a cover slip at an angle with a mounting needle.",
      "Weka kielelezo kwenye slaidi, ongeza tone la maji au rangi, kisha shusha kifuniko kwa pembe ukitumia sindano.",
    ),
    width: 120,
    height: 44,
    controls: [
      choice(
        "specimen",
        ["Specimen", "Kielelezo"],
        wetMountSpecimens.map((item) => [item.name.en, item.name.sw]),
      ),
      link(
        "source",
        ["Drop from", "Tone kutoka"],
        ["Water", "Maji"],
        (candidate) => stainKinds.includes(candidate.kind),
      ),
      button(
        "drop",
        ["Add one drop", "Ongeza tone moja"],
        ({ state, part }) => {
          const source = partByNum(state, part.params.source ?? 0);
          const stain = source
            ? (stainOfKind[source.kind] ?? 0)
            : (part.params.stain ?? 0);
          return setParams(state, part, {
            drops: (part.params.drops ?? 0) + 1,
            stain,
          });
        },
      ),
      choice(
        "cover",
        ["Cover slip", "Kifuniko"],
        [
          ["Not yet", "Bado"],
          [
            "Lowered at an angle with a needle",
            "Kimeshushwa kwa pembe kwa sindano",
          ],
          ["Dropped flat", "Kimeangushwa sawa"],
        ],
      ),
      button("clean", ["Wash the slide", "Osha slaidi"], ({ state, part }) =>
        setParams(state, part, { specimen: 0, drops: 0, stain: 0, cover: 0 }),
      ),
    ],
    state: { drops: 0, stain: 0 },
    afterChange: ({ state, after, param }) => {
      if (
        param === "cover" &&
        after.params.cover === 1 &&
        !state.parts.some((item) => item.kind === "mounting-needle")
      )
        return note(
          setParams(state, after, { cover: 2 }),
          after,
          t(
            "Without a mounting needle the cover slip fell flat and trapped air.",
            "Bila sindano kifuniko kilianguka sawa na kunasa hewa.",
          ),
        );
      return state;
    },
    analyse: ({ part, p, env }) => {
      const specimen = wetMountSpecimens[p("specimen")]?.id ?? null;
      const stain = stains[p("stain")] ?? "none";
      const issues: BioOutcome["issues"] = [];
      if (specimen === "onion" && !env.has("onion-bulb"))
        issues.push(
          issue("onion", "tip", [
            "Add an onion and peel a thin piece of epidermis with forceps.",
            "Ongeza kitunguu na umenye kipande chembamba cha ngozi kwa koleo.",
          ]),
        );
      if (
        specimen === "cheek" &&
        !env.parts.some(
          (item) => item.kind === "cheek-swab" && item.params.used === 1,
        )
      )
        issues.push(
          issue("swab", "tip", [
            "Scrape the inside of your cheek gently with a clean cotton bud first.",
            "Kwangua ndani ya shavu lako taratibu kwa kijiti safi cha pamba kwanza.",
          ]),
        );
      if (specimen && p("drops") === 0)
        issues.push(
          issue("drop", "tip", [
            "Add a drop of water or stain so the cells do not dry out.",
            "Ongeza tone la maji au rangi ili seli zisikauke.",
          ]),
        );
      if (p("drops") > 3)
        issues.push(
          issue("flood", "warn", [
            "Too much liquid: the cover slip floats. Blot the edge with tissue paper.",
            "Kioevu kingi mno: kifuniko kinaelea. Futa ukingo kwa karatasi laini.",
          ]),
        );
      if (specimen && bestStain[specimen] && stain !== bestStain[specimen])
        issues.push(
          issue("stain", "tip", [
            specimen === "cheek"
              ? "Methylene blue shows cheek cell nuclei best."
              : "Iodine shows the nucleus and cell wall of plant cells best.",
            specimen === "cheek"
              ? "Methylene blue huonyesha vizuri viini vya seli za shavu."
              : "Iodini huonyesha vizuri kiini na ukuta wa seli za mmea.",
          ]),
        );
      if (p("cover") === 2)
        issues.push(
          issue("bubbles", "warn", [
            "Air bubbles are trapped. Wash the slide and lower the cover slip at an angle.",
            "Viputo vya hewa vimenaswa. Osha slaidi na ushushe kifuniko kwa pembe.",
          ]),
        );
      if (specimen && p("cover") === 0)
        issues.push(
          issue("cover", "tip", [
            "Lower a cover slip over the specimen.",
            "Shusha kifuniko juu ya kielelezo.",
          ]),
        );
      return {
        visual: {
          stain: p("stain"),
          specimen: p("specimen"),
          cover: p("cover"),
          drops: p("drops"),
        },
        observations: part.contents.notes,
        readouts: [
          readout(["Stain", "Rangi"], stain),
          readout(["Drops", "Matone"], String(p("drops"))),
        ],
        issues,
      };
    },
  },
  "cover-slip": tool(
    ["Cover slips", "Vifuniko vya slaidi"],
    [
      "Thin squares of glass that hold the specimen flat. Handle them by the edges.",
      "Vipande vyembamba vya kioo vinavyoshikilia kielelezo sawa. Vishike kwa kingo.",
    ],
    80,
    50,
  ),
  "prepared-slide": {
    name: t("Prepared slide", "Slaidi iliyotayarishwa"),
    description: t(
      "A permanent, stained slide made by a supplier.",
      "Slaidi ya kudumu iliyotiwa rangi, iliyotengenezwa na msambazaji.",
    ),
    width: 120,
    height: 44,
    controls: [
      choice(
        "type",
        ["Slide", "Slaidi"],
        preparedSpecimens.map((item) => [item.name.en, item.name.sw]),
      ),
    ],
    analyse: ({ p }) => ({
      visual: { type: p("type") },
      readouts: [
        readout(["Label", "Lebo"], preparedSpecimens[p("type")]?.name.en ?? ""),
      ],
    }),
  },
  "mounting-needle": tool(
    ["Mounting needle", "Sindano ya kupachika"],
    [
      "Used to lower a cover slip at an angle and to spread specimens.",
      "Hutumika kushusha kifuniko kwa pembe na kutandaza vielelezo.",
    ],
    130,
    24,
  ),
  forceps: tool(
    ["Forceps", "Koleo ndogo"],
    [
      "Fine tweezers for peeling epidermis and lifting tissues.",
      "Koleo nyembamba za kumenya ngozi na kuinua tishu.",
    ],
    120,
    30,
  ),
  dropper: tool(
    ["Dropper", "Kidondoshi"],
    [
      "Adds liquids one drop at a time.",
      "Huongeza vimiminika tone moja kwa wakati.",
    ],
    40,
    110,
  ),
  "stage-micrometer": {
    name: t("Stage micrometer", "Kipimo cha jukwaa"),
    description: t(
      "A slide with a 1 mm scale divided into 100 parts of 10 µm. Use it to calibrate the eyepiece graticule at each objective.",
      "Slaidi yenye kipimo cha mm 1 kilichogawanywa sehemu 100 za µm 10. Itumie kurekebisha kipimo cha jicho kwa kila lenzi.",
    ),
    width: 120,
    height: 44,
  },
  "methylene-blue": stainBottle(
    ["Methylene blue", "Methylene blue"],
    [
      "A blue stain for animal cells: it colours the nucleus.",
      "Rangi ya buluu kwa seli za wanyama: inapaka kiini rangi.",
    ],
  ),
  eosin: stainBottle(
    ["Eosin", "Eosini"],
    [
      "A pink stain for cytoplasm and blood cells.",
      "Rangi ya waridi kwa saitoplazimu na seli za damu.",
    ],
  ),
  acetocarmine: stainBottle(
    ["Acetocarmine", "Asetokamini"],
    [
      "A red stain for chromosomes, used on root tips to see mitosis.",
      "Rangi nyekundu kwa kromosomu, hutumika kwenye ncha za mizizi kuona mitosisi.",
    ],
  ),
  "onion-bulb": {
    name: t("Onion", "Kitunguu"),
    description: t(
      "Peel the thin skin from the inside of a scale leaf with forceps.",
      "Menya ngozi nyembamba ndani ya jani la kitunguu kwa koleo.",
    ),
    width: 90,
    height: 90,
    controls: [
      button(
        "peel",
        ["Peel a piece of epidermis", "Menya kipande cha ngozi"],
        ({ state, part }) =>
          state.parts.some((item) => item.kind === "forceps")
            ? note(
                setParams(state, part, {
                  peeled: (part.params.peeled ?? 0) + 1,
                }),
                part,
                t(
                  "A thin, see-through layer comes away.",
                  "Safu nyembamba inayoonyesha upande wa pili inatoka.",
                ),
              )
            : note(
                state,
                part,
                t(
                  "Without forceps the epidermis tears and folds. Use forceps.",
                  "Bila koleo ngozi inararuka na kukunjika. Tumia koleo.",
                ),
              ),
      ),
    ],
    analyse: ({ part }) => ({ observations: part.contents.notes }),
  },
  "cheek-swab": {
    name: t("Cotton buds (cheek swabs)", "Vijiti vya pamba (vya shavu)"),
    description: t(
      "Scrape gently inside your own cheek. Put used buds straight into disinfectant.",
      "Kwangua taratibu ndani ya shavu lako mwenyewe. Weka vijiti vilivyotumika moja kwa moja kwenye dawa ya kuua viini.",
    ),
    width: 90,
    height: 40,
    controls: [
      button(
        "scrape",
        ["Scrape inside the cheek", "Kwangua ndani ya shavu"],
        ({ state, part }) => setParams(state, part, { used: 1, disposed: 0 }),
      ),
      button(
        "dispose",
        [
          "Put the used bud in disinfectant",
          "Weka kijiti kilichotumika kwenye dawa ya kuua viini",
        ],
        ({ state, part }) =>
          state.parts.some((item) => item.kind === "disinfectant")
            ? setParams(state, part, { disposed: 1 })
            : note(
                state,
                part,
                t(
                  "Add disinfectant to the bench first.",
                  "Ongeza dawa ya kuua viini mezani kwanza.",
                ),
              ),
        (item) => item.params.used === 1,
      ),
    ],
    analyse: ({ part, p }) => ({
      observations: part.contents.notes,
      issues:
        p("used") === 1 && p("disposed") === 0
          ? [
              issue("dispose", "warn", [
                "Used swabs carry saliva. Put them in disinfectant.",
                "Vijiti vilivyotumika vina mate. Viweke kwenye dawa ya kuua viini.",
              ]),
            ]
          : [],
    }),
  },
};
