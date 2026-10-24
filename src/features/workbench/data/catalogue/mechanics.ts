import type { Outcome, PartSpec } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  G,
  button,
  choice,
  clamp,
  fixed,
  issue,
  measure,
  pick,
  progressFrom,
  readout,
  slider,
  t,
  task,
  toggle,
} from "./helpers";

type MechanicsKind = (typeof sectionKinds.mechanics)[number];

const springs: [string, string][] = [
  ["Soft spring (20 N/m)", "Chemchemi laini (20 N/m)"],
  ["Stiff spring (50 N/m)", "Chemchemi ngumu (50 N/m)"],
];
const springConstants = [20, 50];
const ELASTIC_LIMIT = 4;

/** Extension in millimetres for a load in newtons, with a permanent set past the limit. */
function springExtension(force: number, k: number) {
  const within = Math.min(force, ELASTIC_LIMIT) / k;
  const beyond = Math.max(0, force - ELASTIC_LIMIT) / (k / 4);
  return (within + beyond) * 1000;
}

const hintToggle = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

type Motion = "uniform" | "accelerating" | "decelerating";

/** Positions of the first 21 ticker dots in centimetres, 0.02 s apart. */
export function tickerDots(motion: number) {
  const kind: Motion = (["uniform", "accelerating", "decelerating"] as const)[
    motion
  ];
  return Array.from({ length: 21 }, (_, n) => {
    const time = n / 50;
    if (kind === "uniform") return 60 * time;
    if (kind === "accelerating") return 200 * time * time;
    return 100 * (1.2 * time - 1.5 * time * time);
  });
}

const motionOptions: [string, string][] = [
  ["Constant speed", "Kasi isiyobadilika"],
  ["Speeding up", "Inaongeza kasi"],
  ["Slowing down", "Inapunguza kasi"],
];

function tickerAnalysis(motion: number, hint: boolean) {
  const dots = tickerDots(motion);
  const speed = (dots[10] - dots[5]) / (5 / 50);
  return {
    visual: { motion },
    readouts: hint
      ? [
          readout(
            ["Distance, dot 5 to dot 10", "Umbali, nukta 5 hadi 10"],
            `${fixed(dots[10] - dots[5], 2)} cm`,
          ),
        ]
      : [],
    issues: [
      issue("tick", "tip", [
        "The timer makes 50 dots every second, so the gap between dots is 0.02 s.",
        "Kipima muda hutoa nukta 50 kila sekunde, kwa hiyo pengo kati ya nukta ni 0.02 s.",
      ]),
    ],
    tasks: [
      task(
        `ticker-${motion}`,
        [
          "Average speed between dot 5 and dot 10",
          "Kasi wastani kati ya nukta 5 na nukta 10",
        ],
        "cm/s",
        speed,
        Math.max(3, speed * 0.04),
        [
          "Speed = distance between the dots ÷ (5 gaps × 0.02 s).",
          "Kasi = umbali kati ya nukta ÷ (mapengo 5 × 0.02 s).",
        ],
      ),
    ],
    measures: [
      measure("speed", ["Average speed", "Kasi wastani"], "cm/s", speed, 1),
    ],
  };
}

function collision(
  m1: number,
  m2: number,
  u1: number,
  u2: number,
  mode: number,
  loss: number,
) {
  const sticky = mode === 1;
  const v1 = sticky
    ? (m1 * u1 + m2 * u2) / (m1 + m2)
    : ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2);
  const v2 = sticky ? v1 : ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2);
  const keep = 1 - loss;
  const f1 = v1 * keep;
  const f2 = v2 * keep;
  return {
    v1: f1,
    v2: f2,
    before: m1 * u1 + m2 * u2,
    after: m1 * f1 + m2 * f2,
    keBefore: 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2,
    keAfter: 0.5 * m1 * f1 * f1 + 0.5 * m2 * f2 * f2,
  };
}

const masses15: [string, string][] = [
  ["0.5 kg", "kg 0.5"],
  ["1.0 kg", "kg 1.0"],
  ["1.5 kg", "kg 1.5"],
];
const massValues = [0.5, 1, 1.5];

function collisionControls() {
  return [
    choice("m1", ["Trolley A mass", "Uzito wa toroli A"], masses15, 1),
    choice("m2", ["Trolley B mass", "Uzito wa toroli B"], masses15, 1),
    slider("u1", ["Trolley A speed", "Kasi ya toroli A"], 0, 2, 0.1, 1, "m/s"),
    slider("u2", ["Trolley B speed", "Kasi ya toroli B"], -1, 1, 0.1, 0, "m/s"),
    choice(
      "mode",
      ["On collision", "Wakati wa mgongano"],
      [
        ["Spring bumpers (bounce)", "Chemchemi (hurudi nyuma)"],
        ["Velcro (stick together)", "Velcro (hushikana)"],
      ],
    ),
  ];
}

function collisionAnalysis(
  p: (id: string) => number,
  blower: boolean,
): Outcome {
  const outcome = collision(
    massValues[p("m1")],
    massValues[p("m2")],
    p("u1"),
    p("u2"),
    p("mode"),
    blower ? 0 : 0.12,
  );
  return {
    visual: {
      u1: p("u1"),
      u2: p("u2"),
      v1: outcome.v1,
      v2: outcome.v2,
      sticky: p("mode"),
    },
    readouts: [
      readout(
        ["Momentum before", "Kasi-misa kabla"],
        `${fixed(outcome.before, 2)} kg m/s`,
      ),
      readout(
        ["Momentum after", "Kasi-misa baada"],
        `${fixed(outcome.after, 2)} kg m/s`,
        Math.abs(outcome.before - outcome.after) < 0.02 ? "ok" : "warn",
      ),
      readout(
        ["Kinetic energy before", "Nishati ya mwendo kabla"],
        `${fixed(outcome.keBefore, 2)} J`,
      ),
      readout(
        ["Kinetic energy after", "Nishati ya mwendo baada"],
        `${fixed(outcome.keAfter, 2)} J`,
      ),
    ],
    issues: !blower
      ? [
          issue("friction", "warn", [
            "Friction with the track takes momentum away, so the total after is lower than before. An air track removes it.",
            "Msuguano na njia huondoa kasi-misa, kwa hiyo jumla baada ni ndogo. Njia ya hewa huuondoa.",
          ]),
        ]
      : p("mode") === 1
        ? [
            issue("inelastic", "tip", [
              "Momentum is conserved but kinetic energy is not: the trolleys stick together.",
              "Kasi-misa huhifadhiwa lakini nishati ya mwendo haihifadhiwi: toroli hushikana.",
            ]),
          ]
        : [],
    tasks: [
      task(
        `collision-${p("m1")}-${p("m2")}-${p("u1")}-${p("u2")}-${p("mode")}-${blower}`,
        ["Velocity of A after impact", "Kasi ya A baada ya mgongano"],
        "m/s",
        outcome.v1,
        0.05,
        [
          "Use conservation of momentum: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.",
          "Tumia uhifadhi wa kasi-misa: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.",
        ],
      ),
    ],
    measures: [
      measure(
        "v1",
        ["Velocity of A after", "Kasi ya A baada"],
        "m/s",
        outcome.v1,
        2,
      ),
      measure(
        "p",
        ["Momentum after", "Kasi-misa baada"],
        "kg m/s",
        outcome.after,
        2,
      ),
    ],
  };
}

export const mechanicsParts: Record<MechanicsKind, PartSpec> = {
  spring: {
    name: t("Helical spring", "Chemchemi ya mzunguko"),
    description: t(
      "Stretches in proportion to the load until the elastic limit (4 N). Beyond it the spring is permanently stretched.",
      "Hunyooka sawia na mzigo hadi kikomo cha unyumbufu (4 N). Baada ya hapo hunyooka daima.",
    ),
    width: 150,
    height: 420,
    controls: [
      choice("spring", ["Spring", "Chemchemi"], springs),
      slider(
        "load",
        ["Load hanging", "Mzigo unaoning'inia"],
        0,
        600,
        50,
        100,
        "g",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const force = (p("load") / 1000) * G;
      const extension = springExtension(force, springConstants[p("spring")]);
      return {
        visual: { extension, force },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Extension", "Urefu ulioongezeka"],
                  `${fixed(extension, 1)} mm`,
                ),
              ]
            : [],
        issues:
          force > ELASTIC_LIMIT
            ? [
                issue("limit", "bad", [
                  "Past the elastic limit: the spring no longer returns to its length and extension is no longer proportional to load.",
                  "Umepita kikomo cha unyumbufu: chemchemi hairudi urefu wake na urefu ulioongezeka si sawia na mzigo.",
                ]),
              ]
            : [],
        tasks:
          p("load") > 0
            ? [
                task(
                  `spring-${p("spring")}-${p("load")}`,
                  [
                    "Extension of the spring",
                    "Urefu ulioongezeka wa chemchemi",
                  ],
                  "mm",
                  extension,
                  Math.max(1.5, extension * 0.02),
                  [
                    "Extension = stretched length − natural length.",
                    "Urefu ulioongezeka = urefu uliyonyoshwa − urefu wa kawaida.",
                  ],
                ),
              ]
            : [],
        measures: [
          measure("force", ["Force", "Nguvu"], "N", force, 2),
          measure(
            "extension",
            ["Extension", "Urefu ulioongezeka"],
            "mm",
            extension,
            1,
          ),
        ],
      };
    },
  },
  "slotted-masses": {
    name: t("Slotted masses", "Vipimo vya uzito vyenye mwanya"),
    description: t(
      "Standard masses that slot onto a hanger. Weight = mass × 10 N/kg.",
      "Vipimo sanifu vinavyoingizwa kwenye kishikio. Uzito = wingi × 10 N/kg.",
    ),
    width: 130,
    height: 190,
    controls: [
      choice(
        "size",
        ["Each mass", "Kila kipimo"],
        [
          ["10 g", "10 g"],
          ["50 g", "50 g"],
          ["100 g", "100 g"],
          ["200 g", "200 g"],
        ],
        2,
      ),
      slider("count", ["Number of masses", "Idadi ya vipimo"], 1, 8, 1, 3),
    ],
    analyse: ({ p }) => {
      const total = [10, 50, 100, 200][p("size")] * p("count");
      return {
        visual: { count: p("count"), size: p("size") },
        readouts: [
          readout(["Total mass", "Wingi jumla"], `${total} g`),
          readout(
            ["Total weight", "Uzito jumla"],
            `${fixed((total / 1000) * G, 2)} N`,
          ),
        ],
        measures: [
          measure("weight", ["Weight", "Uzito"], "N", (total / 1000) * G, 2),
        ],
      };
    },
  },
  "mass-hanger": {
    name: t("Mass hanger", "Kishikio cha vipimo"),
    description: t(
      "The hanger itself has a mass of 100 g. Slot masses on to load it.",
      "Kishikio chenyewe kina wingi wa 100 g. Weka vipimo juu yake kukipakia.",
    ),
    width: 90,
    height: 170,
    controls: [
      slider(
        "slots",
        ["100 g masses added", "Vipimo vya 100 g vilivyoongezwa"],
        0,
        8,
        1,
        0,
      ),
    ],
    analyse: ({ p }) => {
      const total = 100 + 100 * p("slots");
      return {
        visual: { slots: p("slots") },
        readouts: [
          readout(["Total mass", "Wingi jumla"], `${total} g`),
          readout(["Weight", "Uzito"], `${fixed((total / 1000) * G, 2)} N`),
        ],
        measures: [
          measure("weight", ["Weight", "Uzito"], "N", (total / 1000) * G, 2),
        ],
      };
    },
  },
  "retort-stand": {
    name: t("Retort stand", "Stendi ya retoti"),
    description: t(
      "A heavy base and an upright rod. A load held far out can tip it over.",
      "Msingi mzito na fimbo wima. Mzigo ulio mbali unaweza kuiangusha.",
    ),
    width: 170,
    height: 400,
    controls: [
      slider(
        "arm",
        ["Clamp arm length", "Urefu wa mkono wa kibano"],
        5,
        30,
        1,
        12,
        "cm",
      ),
      slider(
        "load",
        ["Load on the arm", "Mzigo kwenye mkono"],
        0,
        1500,
        50,
        300,
        "g",
      ),
    ],
    analyse: ({ p }) => {
      const tipping = p("load") * p("arm") > 1200 * 8;
      return {
        visual: { arm: p("arm"), tipping: tipping ? 1 : 0 },
        readouts: [
          readout(
            ["Tipping moment", "Kasi ya kuanguka"],
            `${fixed(p("load") * p("arm"), 0)} g cm`,
          ),
          readout(
            ["Stand", "Stendi"],
            tipping ? "Falls over" : "Stable",
            tipping ? "bad" : "ok",
          ),
        ],
        issues: tipping
          ? [
              issue("tip", "bad", [
                "The load's moment about the edge of the base is greater than the stand's. Shorten the arm, reduce the load or clamp a counterweight.",
                "Kasi ya mzigo kwenye ukingo wa msingi ni kubwa kuliko ya stendi. Punguza mkono, punguza mzigo au weka kipingamizi.",
              ]),
            ]
          : [],
      };
    },
  },
  "clamp-boss": {
    name: t("Clamp and boss", "Kibano na kiunganishi"),
    description: t(
      "Grips glassware on a retort stand. Too loose and it slips, too tight and glass cracks.",
      "Hushika vyombo vya kioo kwenye stendi. Kilegevu huteleza, kigumu sana hupasua kioo.",
    ),
    width: 150,
    height: 110,
    controls: [
      choice(
        "holding",
        ["Holding", "Kinashika"],
        [
          ["Boiling tube", "Mrija wa kuchemsha"],
          ["Thermometer", "Kipimajoto"],
          ["Metal rod", "Fimbo ya chuma"],
        ],
      ),
      slider("grip", ["Screw tightness", "Ukazaji wa skrubu"], 0, 10, 1, 5),
    ],
    analyse: ({ p }) => {
      const glass = p("holding") !== 2;
      const state =
        p("grip") < 3 ? "slips" : glass && p("grip") > 7 ? "cracks" : "holds";
      return {
        visual: { grip: p("grip") },
        readouts: [
          readout(
            ["Result", "Matokeo"],
            state === "holds"
              ? "Held firmly"
              : state === "slips"
                ? "Slips"
                : "Glass cracks",
            state === "holds" ? "ok" : "bad",
          ),
        ],
        issues:
          state === "holds"
            ? []
            : [
                issue("grip", "warn", [
                  state === "slips"
                    ? "Tighten the screw until the object is firm."
                    : "Ease the screw: tight clamps crack glass.",
                  state === "slips"
                    ? "Kaza skrubu hadi kitu kishike."
                    : "Legeza skrubu: kibano kigumu hupasua kioo.",
                ]),
              ],
      };
    },
  },
  "single-pulley": {
    name: t("Single fixed pulley", "Kapi moja thabiti"),
    description: t(
      "Changes the direction of the effort. Friction means the effort is a little more than the load.",
      "Hubadilisha mwelekeo wa jitihada. Msuguano hufanya jitihada kuwa kubwa kidogo kuliko mzigo.",
    ),
    width: 150,
    height: 280,
    controls: [
      slider("load", ["Load", "Mzigo"], 1, 50, 1, 20, "N"),
      choice(
        "axle",
        ["Axle", "Mhimili"],
        [
          ["Oiled", "Umepakwa mafuta"],
          ["Dry", "Mkavu"],
        ],
      ),
    ],
    analyse: ({ p }) => {
      const effort = p("load") * (p("axle") === 0 ? 1.04 : 1.18);
      return {
        visual: { load: p("load") },
        readouts: [
          readout(
            ["Effort needed", "Jitihada inayohitajika"],
            `${fixed(effort, 1)} N`,
          ),
          readout(["Velocity ratio", "Uwiano wa kasi"], "1"),
          readout(
            ["Mechanical advantage", "Faida ya kimitambo"],
            fixed(p("load") / effort, 2),
          ),
          readout(
            ["Efficiency", "Ufanisi"],
            `${fixed((p("load") / effort) * 100, 0)} %`,
          ),
        ],
        measures: [measure("effort", ["Effort", "Jitihada"], "N", effort, 1)],
      };
    },
  },
  "block-and-tackle": {
    name: t("Block and tackle", "Kapi nyingi"),
    description: t(
      "Several pulleys share the load between the supporting strings: velocity ratio = number of strings.",
      "Kapi kadhaa hugawana mzigo kati ya kamba zinazobeba: uwiano wa kasi = idadi ya kamba.",
    ),
    width: 190,
    height: 380,
    controls: [
      choice(
        "strings",
        ["Strings supporting the load", "Kamba zinazobeba mzigo"],
        [
          ["2 strings", "Kamba 2"],
          ["3 strings", "Kamba 3"],
          ["4 strings", "Kamba 4"],
          ["5 strings", "Kamba 5"],
          ["6 strings", "Kamba 6"],
        ],
        1,
      ),
      slider("load", ["Load", "Mzigo"], 5, 100, 1, 40, "N"),
    ],
    analyse: ({ p }) => {
      const strings = p("strings") + 2;
      const movable = 1.5 * strings;
      const effort = (p("load") + movable) / strings + 0.8 * strings * 0.35;
      return {
        visual: { strings },
        readouts: [
          readout(["Velocity ratio", "Uwiano wa kasi"], String(strings)),
          readout(
            ["Effort needed", "Jitihada inayohitajika"],
            `${fixed(effort, 1)} N`,
          ),
          readout(
            ["Mechanical advantage", "Faida ya kimitambo"],
            fixed(p("load") / effort, 2),
          ),
          readout(
            ["Efficiency", "Ufanisi"],
            `${fixed((p("load") / effort / strings) * 100, 0)} %`,
          ),
        ],
        tasks: [
          task(
            `tackle-${strings}-${p("load")}`,
            ["Mechanical advantage", "Faida ya kimitambo"],
            "",
            p("load") / effort,
            0.08,
            [
              "Mechanical advantage = load ÷ effort.",
              "Faida ya kimitambo = mzigo ÷ jitihada.",
            ],
          ),
        ],
        measures: [measure("effort", ["Effort", "Jitihada"], "N", effort, 1)],
      };
    },
  },
  string: {
    name: t("String", "Kamba"),
    description: t(
      "Light and inextensible, so it carries a force without stretching. It snaps past its breaking load.",
      "Nyepesi na isiyonyooka, hubeba nguvu bila kunyooka. Hukatika ikipita mzigo wake wa juu.",
    ),
    width: 130,
    height: 100,
    controls: [
      choice(
        "type",
        ["Type", "Aina"],
        [
          ["Cotton thread", "Uzi wa pamba"],
          ["Nylon thread", "Uzi wa nailoni"],
          ["Thin rope", "Kamba nyembamba"],
        ],
      ),
      slider("pull", ["Pull", "Kuvuta"], 0, 80, 1, 5, "N"),
    ],
    analyse: ({ p }) => {
      const limit = [10, 30, 60][p("type")];
      const snapped = p("pull") > limit;
      return {
        visual: { snapped: snapped ? 1 : 0 },
        readouts: [
          readout(["Breaking load", "Mzigo wa kukatika"], `${limit} N`),
          readout(
            ["String", "Kamba"],
            snapped ? "Snapped" : "Holding",
            snapped ? "bad" : "ok",
          ),
        ],
      };
    },
  },
  "inclined-plane": {
    name: t("Inclined plane", "Mteremko"),
    description: t(
      "A 1.0 m slope. The trolley accelerates at g(sin θ − μ cos θ) when released.",
      "Mteremko wa m 1.0. Toroli huongeza kasi kwa g(sin θ − μ cos θ) ikiachiliwa.",
    ),
    width: 460,
    height: 280,
    state: { releasedAt: 0 },
    controls: [
      slider(
        "angle",
        ["Angle of slope", "Pembe ya mteremko"],
        0,
        60,
        1,
        25,
        "°",
      ),
      slider("friction", ["Friction (μ)", "Msuguano (μ)"], 0, 0.6, 0.05, 0.1),
      button(
        "release",
        ["Release the trolley", "Achilia toroli"],
        (params, now) => ({
          ...params,
          releasedAt: now,
        }),
      ),
      button("reset", ["Return to the top", "Rudisha juu"], (params) => ({
        ...params,
        releasedAt: 0,
      })),
    ],
    analyse: ({ p, env }) => {
      const theta = (p("angle") * Math.PI) / 180;
      const a = Math.max(
        0,
        G * (Math.sin(theta) - p("friction") * Math.cos(theta)),
      );
      const time = a > 0 ? Math.sqrt(2 / a) : 0;
      const progress = progressFrom(env.now, p("releasedAt"), time);
      return {
        visual: { angle: p("angle"), pos: progress * progress },
        readouts: [
          readout(["Acceleration", "Kuongeza kasi"], `${fixed(a, 2)} m/s²`),
          readout(
            ["Time to slide 1.0 m", "Muda wa kuteleza m 1.0"],
            a > 0 ? `${fixed(time, 2)} s` : "does not slide",
            a > 0 ? undefined : "warn",
          ),
          readout(
            ["Ideal mechanical advantage", "Faida bora ya kimitambo"],
            p("angle") > 0 ? fixed(1 / Math.sin(theta), 2) : "—",
          ),
        ],
        issues:
          a === 0 && p("angle") > 0
            ? [
                issue("stuck", "tip", [
                  "Friction holds the trolley: increase the angle or reduce μ until tan θ is greater than μ.",
                  "Msuguano unashikilia toroli: ongeza pembe au punguza μ hadi tan θ iwe kubwa kuliko μ.",
                ]),
              ]
            : [],
        tasks:
          a > 0
            ? [
                task(
                  `incline-${p("angle")}-${p("friction")}`,
                  [
                    "Acceleration down the slope",
                    "Kuongeza kasi kwenye mteremko",
                  ],
                  "m/s²",
                  a,
                  0.12,
                  [
                    "a = g(sin θ − μ cos θ), or use 2 × length ÷ time².",
                    "a = g(sin θ − μ cos θ), au tumia 2 × urefu ÷ muda².",
                  ],
                ),
              ]
            : [],
        measures: [
          measure("angle", ["Angle", "Pembe"], "°", p("angle"), 0),
          measure("a", ["Acceleration", "Kuongeza kasi"], "m/s²", a, 2),
          measure("time", ["Time", "Muda"], "s", time, 2),
        ],
      };
    },
  },
  trolley: {
    name: t("Trolley", "Toroli"),
    description: t(
      "Pulled along the bench by a falling mass: a = (F − friction) ÷ total mass.",
      "Huvutwa mezani na uzito unaoanguka: a = (F − msuguano) ÷ wingi jumla.",
    ),
    width: 420,
    height: 150,
    state: { releasedAt: 0 },
    controls: [
      slider("mass", ["Trolley mass", "Wingi wa toroli"], 0.5, 2, 0.1, 1, "kg"),
      slider(
        "hang",
        ["Hanging mass", "Wingi unaoning'inia"],
        0,
        500,
        10,
        100,
        "g",
      ),
      button("release", ["Release", "Achilia"], (params, now) => ({
        ...params,
        releasedAt: now,
      })),
      button("reset", ["Return to the start", "Rudisha mwanzo"], (params) => ({
        ...params,
        releasedAt: 0,
      })),
    ],
    analyse: ({ p, env }) => {
      const hanging = p("hang") / 1000;
      const force = hanging * G;
      const a = Math.max(0, (force - 0.15) / (p("mass") + hanging));
      const time = a > 0 ? Math.sqrt(2 / a) : 0;
      const progress = progressFrom(env.now, p("releasedAt"), time);
      return {
        visual: { pos: progress * progress },
        readouts: [
          readout(["Pulling force", "Nguvu ya kuvuta"], `${fixed(force, 2)} N`),
          readout(["Acceleration", "Kuongeza kasi"], `${fixed(a, 2)} m/s²`),
          readout(
            ["Time to travel 1.0 m", "Muda wa kusafiri m 1.0"],
            a > 0 ? `${fixed(time, 2)} s` : "does not move",
          ),
        ],
        issues:
          a === 0
            ? [
                issue("friction", "tip", [
                  "The pull is smaller than the 0.15 N friction. Add hanging mass.",
                  "Kuvuta ni kidogo kuliko msuguano wa 0.15 N. Ongeza wingi unaoning'inia.",
                ]),
              ]
            : [],
        tasks:
          a > 0
            ? [
                task(
                  `trolley-${p("mass")}-${p("hang")}`,
                  ["Acceleration", "Kuongeza kasi"],
                  "m/s²",
                  a,
                  0.1,
                ),
              ]
            : [],
        measures: [
          measure("force", ["Pulling force", "Nguvu ya kuvuta"], "N", force, 2),
          measure("a", ["Acceleration", "Kuongeza kasi"], "m/s²", a, 2),
        ],
      };
    },
  },
  runway: {
    name: t("Runway", "Njia ya toroli"),
    description: t(
      "Tilt it until a trolley, given a push, keeps a steady speed: gravity then cancels friction.",
      "Ielekeze hadi toroli iliyosukumwa idumishe kasi sawa: uzito basi hufuta msuguano.",
    ),
    width: 460,
    height: 200,
    controls: [
      slider(
        "angle",
        ["Tilt of the runway", "Mwelekeo wa njia"],
        0,
        8,
        0.1,
        0,
        "°",
      ),
      hintToggle,
    ],
    analyse: ({ part, p }) => {
      const mu = pick(part.id, 7, [0.03, 0.05, 0.07]);
      const compensated = (Math.atan(mu) * 180) / Math.PI;
      const net =
        G *
        (Math.sin((p("angle") * Math.PI) / 180) -
          mu * Math.cos((p("angle") * Math.PI) / 180));
      const state = Math.abs(net) < 0.04 ? 0 : net > 0 ? 1 : -1;
      return {
        visual: { angle: p("angle"), state },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Trolley after a push", "Toroli baada ya kusukumwa"],
                  state === 0
                    ? "Constant speed"
                    : state > 0
                      ? "Speeds up (over-tilted)"
                      : "Slows down (under-tilted)",
                  state === 0 ? "ok" : "warn",
                ),
              ]
            : [],
        tasks: [
          task(
            "compensate",
            [
              "Tilt that compensates for friction",
              "Mwelekeo unaofidia msuguano",
            ],
            "°",
            compensated,
            0.35,
            [
              "Give the trolley a push. If it speeds up the runway is too steep.",
              "Sukuma toroli. Ikiongeza kasi, njia imeinama mno.",
            ],
          ),
        ],
      };
    },
  },
  "ticker-timer": {
    name: t("Ticker-timer", "Kipima muda cha nukta"),
    description: t(
      "Taps 50 dots a second on a tape pulled through it. Closer dots mean slower motion.",
      "Hupiga nukta 50 kwa sekunde kwenye utepe unaovutwa. Nukta zilizo karibu humaanisha mwendo polepole.",
    ),
    width: 420,
    height: 170,
    controls: [
      choice(
        "motion",
        ["Motion of the tape", "Mwendo wa utepe"],
        motionOptions,
      ),
      hintToggle,
    ],
    analyse: ({ p }) => tickerAnalysis(p("motion"), p("hint") === 1),
  },
  "ticker-tape": {
    name: t("Ticker tape", "Utepe wa nukta"),
    description: t(
      "A strip marked by a 50 Hz timer. Measure the gaps to find speed and acceleration.",
      "Utepe uliowekwa nukta na kipima muda cha 50 Hz. Pima mapengo kupata kasi na kuongeza kasi.",
    ),
    width: 460,
    height: 130,
    controls: [
      choice(
        "motion",
        ["Motion recorded", "Mwendo uliorekodiwa"],
        motionOptions,
        1,
      ),
      hintToggle,
    ],
    analyse: ({ p }) => tickerAnalysis(p("motion"), p("hint") === 1),
  },
  pendulum: {
    name: t("Pendulum bob and string", "Pendulamu na uzi"),
    description: t(
      "T = 2π√(L/g). The period depends on the length, not on the mass, and holds for small swings.",
      "T = 2π√(L/g). Kipindi hutegemea urefu, si wingi, na hufaa kwa mizunguko midogo.",
    ),
    width: 220,
    height: 360,
    controls: [
      slider("length", ["String length", "Urefu wa uzi"], 20, 120, 5, 60, "cm"),
      slider("amp", ["Starting angle", "Pembe ya kuanzia"], 2, 60, 1, 10, "°"),
      choice(
        "bob",
        ["Bob mass", "Wingi wa kifaa"],
        [
          ["20 g", "20 g"],
          ["50 g", "50 g"],
          ["100 g", "100 g"],
        ],
        1,
      ),
    ],
    analyse: ({ p }) => {
      const theta = (p("amp") * Math.PI) / 180;
      const period =
        2 *
        Math.PI *
        Math.sqrt(p("length") / 100 / G) *
        (1 + (theta * theta) / 16);
      return {
        visual: { period, amp: p("amp"), length: p("length") },
        readouts: [
          readout(["Period T", "Kipindi T"], `${fixed(period, 2)} s`),
          readout(
            ["Time for 20 oscillations", "Muda wa mizunguko 20"],
            `${fixed(period * 20, 1)} s`,
          ),
        ],
        issues:
          p("amp") > 15
            ? [
                issue("amp", "warn", [
                  "The swing is wide. The simple formula only holds for angles under about 15°.",
                  "Mzunguko ni mpana. Fomula rahisi hufaa tu kwa pembe chini ya takriban 15°.",
                ]),
              ]
            : [],
        tasks: [
          task(
            `period-${p("length")}-${p("amp")}`,
            ["Period of one oscillation", "Kipindi cha mzunguko mmoja"],
            "s",
            period,
            0.04,
            [
              "Time 20 oscillations and divide by 20.",
              "Pima mizunguko 20 kisha ugawanye kwa 20.",
            ],
          ),
        ],
        measures: [
          measure("length", ["Length L", "Urefu L"], "cm", p("length"), 0),
          measure("period", ["Period T", "Kipindi T"], "s", period, 2),
          measure("t2", ["T²", "T²"], "s²", period * period, 2),
        ],
      };
    },
  },
  "knife-edge": {
    name: t("Knife edge / pivot", "Ncha ya kisu / egemeo"),
    description: t(
      "Balance a metre rule on the pivot. Balanced when clockwise moment = anticlockwise moment.",
      "Sawazisha rula ya mita kwenye egemeo. Husawazika wakati kasi ya saa = kasi kinyume cha saa.",
    ),
    width: 560,
    height: 190,
    controls: [
      slider("pivot", ["Pivot at", "Egemeo kwenye"], 40, 60, 1, 50, "cm"),
      slider("m1", ["Left mass", "Wingi wa kushoto"], 50, 500, 10, 200, "g"),
      slider(
        "d1",
        ["Left distance from pivot", "Umbali wa kushoto kutoka egemeo"],
        5,
        45,
        1,
        20,
        "cm",
      ),
      slider("m2", ["Right mass", "Wingi wa kulia"], 50, 500, 10, 100, "g"),
      slider(
        "d2",
        ["Right distance from pivot", "Umbali wa kulia kutoka egemeo"],
        5,
        45,
        1,
        30,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const left = p("m1") * p("d1");
      const right = p("m2") * p("d2") + 100 * (50 - p("pivot"));
      const net = right - left;
      const balanced = Math.abs(net) <= 40;
      const needed = (left - 100 * (50 - p("pivot"))) / p("m2");
      return {
        visual: { tilt: clamp(net / 1500, -1, 1) * 10 },
        readouts: [
          readout(
            ["Anticlockwise moment", "Kasi kinyume cha saa"],
            `${fixed(left, 0)} g cm`,
          ),
          readout(
            ["Clockwise moment", "Kasi ya saa"],
            `${fixed(right, 0)} g cm`,
          ),
          readout(
            ["Rule", "Rula"],
            balanced
              ? "Balanced"
              : net > 0
                ? "Right side down"
                : "Left side down",
            balanced ? "ok" : undefined,
          ),
        ],
        issues:
          p("pivot") !== 50
            ? [
                issue("centre", "warn", [
                  "The pivot is not at the centre, so the rule's own 100 g weight adds a moment. Put the pivot at 50 cm.",
                  "Egemeo haliko katikati, kwa hiyo uzito wa rula (100 g) huongeza kasi. Weka egemeo 50 cm.",
                ]),
              ]
            : [],
        tasks:
          needed >= 5 && needed <= 45
            ? [
                task(
                  `moments-${p("pivot")}-${p("m1")}-${p("d1")}-${p("m2")}`,
                  [
                    "Right distance that balances the rule",
                    "Umbali wa kulia unaosawazisha rula",
                  ],
                  "cm",
                  needed,
                  1,
                  [
                    "Principle of moments: m₁d₁ = m₂d₂.",
                    "Kanuni ya kasi: m₁d₁ = m₂d₂.",
                  ],
                ),
              ]
            : [],
        measures: [
          measure(
            "left",
            ["Anticlockwise moment", "Kasi kinyume cha saa"],
            "g cm",
            left,
            0,
          ),
          measure(
            "right",
            ["Clockwise moment", "Kasi ya saa"],
            "g cm",
            right,
            0,
          ),
        ],
      };
    },
  },
  lever: {
    name: t("Lever", "Lipa"),
    description: t(
      "Effort × effort arm = load × load arm. The class depends on where the fulcrum, load and effort are.",
      "Jitihada × mkono wa jitihada = mzigo × mkono wa mzigo. Daraja hutegemea mahali pa egemeo, mzigo na jitihada.",
    ),
    width: 520,
    height: 220,
    controls: [
      choice(
        "class",
        ["Class of lever", "Daraja la lipa"],
        [
          ["Class 1 (fulcrum in the middle)", "Daraja 1 (egemeo katikati)"],
          ["Class 2 (load in the middle)", "Daraja 2 (mzigo katikati)"],
          ["Class 3 (effort in the middle)", "Daraja 3 (jitihada katikati)"],
        ],
      ),
      slider(
        "effortArm",
        ["Effort arm", "Mkono wa jitihada"],
        10,
        100,
        5,
        60,
        "cm",
      ),
      slider("loadArm", ["Load arm", "Mkono wa mzigo"], 5, 100, 5, 20, "cm"),
      slider("load", ["Load", "Mzigo"], 1, 50, 1, 20, "N"),
    ],
    analyse: ({ p }) => {
      const effort = (p("load") * p("loadArm")) / p("effortArm");
      const cls = p("class");
      const bad =
        (cls === 2 && p("effortArm") <= p("loadArm")) ||
        (cls === 3 && p("effortArm") >= p("loadArm"));
      return {
        visual: { cls, effort },
        readouts: [
          readout(
            ["Effort needed", "Jitihada inayohitajika"],
            `${fixed(effort, 1)} N`,
          ),
          readout(
            ["Mechanical advantage", "Faida ya kimitambo"],
            fixed(p("load") / effort, 2),
          ),
        ],
        issues: bad
          ? [
              issue("class", "warn", [
                cls === 3
                  ? "In a class 3 lever the effort is nearer the fulcrum than the load, so the effort arm must be shorter."
                  : "In a class 2 lever the effort is further from the fulcrum than the load, so the effort arm must be longer.",
                cls === 3
                  ? "Katika lipa ya daraja 3 jitihada iko karibu na egemeo kuliko mzigo, kwa hiyo mkono wa jitihada uwe mfupi."
                  : "Katika lipa ya daraja 2 jitihada iko mbali na egemeo kuliko mzigo, kwa hiyo mkono wa jitihada uwe mrefu.",
              ]),
            ]
          : [],
        measures: [measure("effort", ["Effort", "Jitihada"], "N", effort, 1)],
      };
    },
  },
  "wheel-axle": {
    name: t("Wheel and axle", "Gurudumu na mhimili"),
    description: t(
      "A big wheel turns a small axle. Velocity ratio = wheel radius ÷ axle radius.",
      "Gurudumu kubwa hugeuza mhimili mdogo. Uwiano wa kasi = nusu kipenyo cha gurudumu ÷ cha mhimili.",
    ),
    width: 260,
    height: 300,
    controls: [
      slider(
        "wheel",
        ["Wheel radius", "Nusu kipenyo cha gurudumu"],
        5,
        30,
        1,
        20,
        "cm",
      ),
      slider(
        "axle",
        ["Axle radius", "Nusu kipenyo cha mhimili"],
        2,
        10,
        1,
        4,
        "cm",
      ),
      slider("load", ["Load", "Mzigo"], 5, 100, 1, 50, "N"),
    ],
    analyse: ({ p }) => {
      const vr = p("wheel") / p("axle");
      const effort = p("load") / vr / 0.85;
      return {
        visual: { wheel: p("wheel"), axle: p("axle") },
        readouts: [
          readout(["Velocity ratio", "Uwiano wa kasi"], fixed(vr, 2)),
          readout(
            ["Effort needed", "Jitihada inayohitajika"],
            `${fixed(effort, 1)} N`,
          ),
          readout(
            ["Mechanical advantage", "Faida ya kimitambo"],
            fixed(p("load") / effort, 2),
          ),
          readout(["Efficiency", "Ufanisi"], "85 %"),
        ],
        measures: [measure("effort", ["Effort", "Jitihada"], "N", effort, 1)],
      };
    },
  },
  "hooke-apparatus": {
    name: t("Hooke's law apparatus", "Kifaa cha sheria ya Hooke"),
    description: t(
      "A spring on a stand with a pointer and scale. Add masses and read the pointer to test Hooke's law.",
      "Chemchemi kwenye stendi yenye kielekezi na kipimo. Ongeza vipimo na usome kielekezi kujaribu sheria ya Hooke.",
    ),
    width: 300,
    height: 460,
    controls: [
      choice("spring", ["Spring", "Chemchemi"], springs),
      slider(
        "load",
        ["Mass on the hanger", "Wingi kwenye kishikio"],
        0,
        700,
        50,
        0,
        "g",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const k = springConstants[p("spring")];
      const force = (p("load") / 1000) * G;
      const extension = springExtension(force, k);
      const pointer = 120 + extension;
      return {
        visual: { pointer, extension },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Pointer reading", "Kipimo cha kielekezi"],
                  `${fixed(pointer, 0)} mm`,
                ),
              ]
            : [],
        issues:
          force > ELASTIC_LIMIT
            ? [
                issue("limit", "bad", [
                  "Beyond the elastic limit the graph stops being a straight line.",
                  "Baada ya kikomo cha unyumbufu grafu haiwi mstari ulionyooka.",
                ]),
              ]
            : [],
        tasks:
          p("load") === 0
            ? []
            : [
                task(
                  `hooke-${p("spring")}`,
                  ["Spring constant k", "Kisia cha chemchemi k"],
                  "N/m",
                  k,
                  1.5,
                  [
                    "k = force ÷ extension. Use the gradient of force against extension.",
                    "k = nguvu ÷ urefu ulioongezeka. Tumia mwinuko wa nguvu dhidi ya urefu ulioongezeka.",
                  ],
                ),
              ],
        measures: [
          measure("force", ["Force", "Nguvu"], "N", force, 2),
          measure(
            "pointer",
            ["Pointer reading", "Kipimo cha kielekezi"],
            "mm",
            pointer,
            0,
          ),
          measure(
            "extension",
            ["Extension", "Urefu ulioongezeka"],
            "mm",
            extension,
            1,
          ),
        ],
      };
    },
  },
  "collision-trolleys": {
    name: t("Collision trolleys", "Toroli za mgongano"),
    description: t(
      "Two trolleys collide. Momentum is conserved apart from friction with the bench.",
      "Toroli mbili zinagongana. Kasi-misa huhifadhiwa isipokuwa msuguano wa meza.",
    ),
    width: 520,
    height: 200,
    controls: collisionControls(),
    analyse: ({ p }) => collisionAnalysis(p, false),
  },
  "air-track": {
    name: t("Air track", "Njia ya hewa"),
    description: t(
      "A cushion of air removes friction. Switch the blower off to see momentum 'disappear'.",
      "Mto wa hewa huondoa msuguano. Zima feni uone kasi-misa 'ikipotea'.",
    ),
    width: 560,
    height: 190,
    controls: [
      ...collisionControls(),
      toggle(
        "blower",
        ["Air blower", "Feni ya hewa"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
        1,
      ),
    ],
    analyse: ({ p }) => collisionAnalysis(p, p("blower") === 1),
  },
};
