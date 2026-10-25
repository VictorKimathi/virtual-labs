import type { ChemPart, ChemPartSpec } from "../../chemistry.types";
import {
  contentsMass,
  GAS_ML_PER_MMOL,
  gasReleased,
} from "../../engine/contents";
import { overlaps, replacePart } from "../../engine/operations";
import {
  fixed,
  issue,
  measure,
  pick,
  readout,
  seeded,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import { button, link, slider, toggle } from "./controls";

type MeasurementKind =
  "electronic-balance" | "thermometer" | "stopwatch" | "gas-syringe";

const hint = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

export function formatClock(milliseconds: number) {
  const total = Math.max(0, milliseconds) / 1000;
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, "0")}:${(total - minutes * 60).toFixed(2).padStart(5, "0")}`;
}

/** Vessels standing on a part, such as the pan of a balance. */
export function standingOn(part: ChemPart, parts: ChemPart[]) {
  return parts.filter(
    (other) =>
      other.vessel !== null && other.id !== part.id && overlaps(part, other),
  );
}

const syringeZero = [2, 1, 3, 2, 4];
const thermometerZero = [0.5, -0.5, 1, -1, 0.5];

export const measurementParts: Record<MeasurementKind, ChemPartSpec> = {
  "electronic-balance": {
    name: t(
      "Electronic balance (0.001 g)",
      "Mizani ya kielektroniki (0.001 g)",
    ),
    description: t(
      "Weighs to 0.001 g. Level it, close the draught shield, press Tare with the empty container on the pan, then add what you are weighing.",
      "Hupima hadi 0.001 g. Isawazishe, funga kinga ya upepo, bonyeza Tare chombo tupu kikiwa kwenye sahani, kisha ongeza unachopima.",
    ),
    width: 200,
    height: 130,
    controls: [
      toggle(
        "level",
        ["Balance", "Mizani"],
        ["Levelled (bubble centred)", "Imesawazishwa (kiputo katikati)"],
        ["Not levelled", "Haijasawazishwa"],
      ),
      toggle(
        "door",
        ["Draught shield", "Kinga ya upepo"],
        ["Closed", "Imefungwa"],
        ["Open", "Iko wazi"],
      ),
      button("tare", ["Tare (zero)", "Tare (sifuri)"], ({ state, part }) => {
        const total = standingOn(part, state.parts).reduce(
          (sum, vessel) =>
            sum + (vessel.vessel?.tare ?? 0) + contentsMass(vessel.contents),
          0,
        );
        return replacePart(state, {
          ...part,
          params: {
            ...part.params,
            tare: total,
            zeroed: total === 0 ? 1 : part.params.zeroed,
          },
        });
      }),
      hint,
    ],
    state: { tare: 0, zeroed: 0 },
    analyse: ({ part, p, env }) => {
      const sitting = standingOn(part, env.parts);
      const total = sitting.reduce(
        (sum, vessel) =>
          sum + (vessel.vessel?.tare ?? 0) + contentsMass(vessel.contents),
        0,
      );
      const drift = p("zeroed") === 1 ? 0 : 0.012;
      const level = p("level") === 1 ? 0 : 0.009;
      const noise =
        p("door") === 1
          ? 0
          : (seeded(part.id, Math.floor(env.now / 400)) - 0.5) * 0.012;
      const shown = total - p("tare") + drift + level + noise;
      const contents = sitting.reduce(
        (sum, vessel) => sum + contentsMass(vessel.contents),
        0,
      );
      return {
        visual: { shown, level: p("level"), door: p("door") },
        readouts: [readout(["Display", "Onyesho"], `${fixed(shown, 3)} g`)],
        issues: [
          ...(p("level") === 0
            ? [
                issue("level", "warn", [
                  "The bubble is off centre, so the balance reads slightly wrong. Level the feet.",
                  "Kiputo kiko pembeni, kwa hiyo mizani inasoma vibaya kidogo. Sawazisha miguu.",
                ]),
              ]
            : []),
          ...(p("door") === 0
            ? [
                issue("door", "warn", [
                  "Air currents make the reading jump. Close the draught shield.",
                  "Upepo hufanya kipimo kuruka. Funga kinga ya upepo.",
                ]),
              ]
            : []),
          ...(p("zeroed") === 0
            ? [
                issue("zero", "tip", [
                  "With the pan empty, press Tare so the display reads exactly zero.",
                  "Sahani ikiwa tupu, bonyeza Tare ili onyesho lisome sifuri kabisa.",
                ]),
              ]
            : []),
          ...(p("tare") === 0 && sitting.length > 0 && contents > 0
            ? [
                issue("tare", "tip", [
                  "Press Tare with the empty container on the pan so its mass is not counted.",
                  "Bonyeza Tare chombo tupu kikiwa kwenye sahani ili uzito wake usihesabiwe.",
                ]),
              ]
            : []),
        ],
        tasks:
          contents > 0.0005
            ? [
                task(
                  `mass-${contents.toFixed(3)}`,
                  ["Mass of the contents", "Uzito wa vilivyomo"],
                  "g",
                  contents,
                  0.006,
                  [
                    "Level the balance, close the shield and tare the empty container first.",
                    "Sawazisha mizani, funga kinga na uweke tare chombo tupu kwanza.",
                  ],
                ),
              ]
            : [],
        measures: [measure("mass", ["Mass", "Uzito"], "g", shown, 3)],
      };
    },
  },
  thermometer: {
    name: t("Thermometer (−10 to 110 °C)", "Kipimajoto (−10 hadi 110 °C)"),
    description: t(
      "Check the zero in melting ice first. Stand it in the liquid without touching the glass wall, and read it with your eye level.",
      "Kagua sifuri kwenye barafu inayoyeyuka kwanza. Kiweke ndani ya kioevu bila kugusa ukuta wa kioo, na usome jicho likiwa usawa.",
    ),
    width: 40,
    height: 220,
    controls: [
      toggle(
        "ice",
        ["Bulb placed in", "Balbu imewekwa kwenye"],
        ["Melting ice (zero check)", "Barafu inayoyeyuka (kagua sifuri)"],
        ["The vessel it stands in", "Chombo ilichowekwa"],
      ),
      toggle(
        "touch",
        ["Bulb", "Balbu"],
        ["Touching the glass wall", "Inagusa ukuta wa kioo"],
        ["In the middle of the liquid", "Katikati ya kioevu"],
      ),
      slider(
        "eye",
        ["Viewing angle", "Pembe ya kuangalia"],
        -40,
        40,
        1,
        0,
        "°",
      ),
      hint,
    ],
    state: { ice: 0, touch: 0, eye: 0 },
    analyse: ({ part, p, env }) => {
      const zero = pick(part.id, 5, thermometerZero);
      const vessel = standingOn(part, env.parts).find(
        (item) => item.contents.volume > 0,
      );
      const actual = p("ice") === 1 ? 0 : (vessel?.contents.temperature ?? 22);
      const wall =
        p("touch") === 1 && p("ice") === 0 ? 0.1 * Math.abs(actual - 22) : 0;
      const reading = actual + zero + p("eye") * 0.025 + wall;
      return {
        visual: { reading },
        readouts:
          p("hint") === 1
            ? [readout(["Reading", "Kipimo"], `${fixed(reading, 1)} °C`)]
            : [],
        issues: [
          ...(p("touch") === 1 && vessel
            ? [
                issue("wall", "warn", [
                  "Touching the wall reads the glass, not the liquid. Hold the thermometer in the middle.",
                  "Kugusa ukuta kunasoma kioo, si kioevu. Shikilia kipimajoto katikati.",
                ]),
              ]
            : []),
          ...(Math.abs(p("eye")) > 6
            ? [
                issue("parallax", "warn", [
                  "Parallax: look straight at the liquid level.",
                  "Mchepuko: tazama moja kwa moja kiwango cha kioevu.",
                ]),
              ]
            : []),
          ...(p("ice") === 1 && Math.abs(zero) > 0.2
            ? [
                issue("zero", "warn", [
                  "In melting ice it should read 0 °C. The difference is the zero error.",
                  "Kwenye barafu inayoyeyuka inapaswa kusoma 0 °C. Tofauti ni kosa la sifuri.",
                ]),
              ]
            : []),
          ...(p("ice") === 0 && !vessel
            ? [
                issue("stand", "tip", [
                  "Stand the thermometer in a vessel that holds liquid.",
                  "Simamisha kipimajoto kwenye chombo chenye kioevu.",
                ]),
              ]
            : []),
        ],
        tasks:
          p("ice") === 1
            ? [
                task(
                  "zero",
                  [
                    "Zero error at the ice point",
                    "Kosa la sifuri kwenye barafu",
                  ],
                  "°C",
                  zero,
                  0.3,
                ),
              ]
            : vessel
              ? [
                  task(
                    `temp-${actual.toFixed(1)}-${p("eye")}-${p("touch")}`,
                    ["True temperature of the liquid", "Joto halisi la kioevu"],
                    "°C",
                    actual,
                    0.6,
                    [
                      "Correct for the zero error you found in ice.",
                      "Sahihisha kwa kosa la sifuri ulilopata kwenye barafu.",
                    ],
                  ),
                ]
              : [],
        measures:
          p("hint") === 1 && vessel
            ? [
                measure(
                  "temperature",
                  ["Temperature", "Joto"],
                  "°C",
                  reading,
                  1,
                ),
              ]
            : [],
      };
    },
  },
  stopwatch: {
    name: t("Stopwatch", "Saa ya kupimia muda"),
    description: t(
      "Reads to 0.01 s, but your reaction time adds about 0.2 s at each press. Reset before every timing.",
      "Husoma hadi 0.01 s, lakini muda wako wa kuitikia huongeza takriban 0.2 s kila unapobonyeza. Weka upya kabla ya kila kipimo.",
    ),
    width: 120,
    height: 150,
    state: { running: 0, startedAt: 0, elapsed: 0, startedFrom: 0 },
    controls: [
      button(
        "toggle",
        ["Start / stop", "Anza / simamisha"],
        ({ state, part, now }) =>
          replacePart(state, {
            ...part,
            params:
              part.params.running === 1
                ? {
                    ...part.params,
                    running: 0,
                    elapsed:
                      part.params.elapsed + (now - part.params.startedAt),
                  }
                : {
                    ...part.params,
                    running: 1,
                    startedAt: now,
                    startedFrom: part.params.elapsed,
                  },
          }),
      ),
      button("reset", ["Reset to zero", "Weka sifuri"], ({ state, part }) =>
        replacePart(state, {
          ...part,
          params: { ...part.params, running: 0, elapsed: 0, startedFrom: 0 },
        }),
      ),
    ],
    analyse: ({ p, env }) => {
      const elapsed =
        p("elapsed") +
        (p("running") === 1 ? Math.max(0, env.now - p("startedAt")) : 0);
      return {
        visual: { elapsed },
        readouts: [readout(["Display", "Onyesho"], formatClock(elapsed))],
        issues:
          p("running") === 1 && p("startedFrom") > 0
            ? [
                issue("reset", "bad", [
                  "The watch did not start from zero. Stop it, press Reset, then time again.",
                  "Saa haikuanza kwa sifuri. Isimamishe, bonyeza Weka sifuri, kisha pima tena.",
                ]),
              ]
            : [],
        measures: [measure("time", ["Time", "Muda"], "s", elapsed / 1000, 2)],
      };
    },
  },
  "gas-syringe": {
    name: t("Gas syringe (100 mL)", "Sirinji ya gesi (mL 100)"),
    description: t(
      "Collects and measures gas from a reaction, for rates of reaction. Check the plunger reads zero and moves freely.",
      "Hukusanya na kupima gesi kutoka kwenye athari, kwa kasi za athari. Hakikisha kijiti kinasoma sifuri na kinasogea kwa urahisi.",
    ),
    width: 220,
    height: 70,
    controls: [
      link(
        "from",
        ["Gas comes from", "Gesi inatoka"],
        ["Choose a vessel", "Chagua chombo"],
        (candidate, self) =>
          candidate.id !== self.id && candidate.vessel !== null,
      ),
      toggle(
        "lube",
        ["Plunger", "Kijiti"],
        [
          "Moves freely (lubricated)",
          "Kinasogea kwa urahisi (kimepakwa mafuta)",
        ],
        ["Sticks", "Kinakwama"],
      ),
      button(
        "zero",
        [
          "Push the plunger fully in (zero)",
          "Sukuma kijiti kikamilifu (sifuri)",
        ],
        ({ state, part }) =>
          replacePart(state, {
            ...part,
            params: { ...part.params, zeroed: 1 },
          }),
      ),
      hint,
    ],
    state: { from: 0, zeroed: 0 },
    analyse: ({ part, p, env }) => {
      const vessel = env.part(p("from"));
      const collected = vessel
        ? vessel.contents.gas.reduce(
            (sum, event) =>
              sum + gasReleased([event], env.now) * GAS_ML_PER_MMOL,
            0,
          )
        : 0;
      const offset = p("zeroed") === 1 ? 0 : pick(part.id, 6, syringeZero);
      const true_ = Math.min(100, collected);
      const read =
        p("lube") === 1
          ? true_ + offset
          : Math.floor((true_ + offset) / 10) * 10;
      return {
        visual: { volume: read, full: collected >= 100 ? 1 : 0 },
        readouts: [
          readout(["Plunger reads", "Kijiti kinasoma"], `${fixed(read, 0)} mL`),
        ],
        issues: [
          ...(p("zeroed") === 0
            ? [
                issue("zero", "tip", [
                  "Push the plunger fully in first so it reads zero, otherwise every reading is too high.",
                  "Sukuma kijiti kikamilifu kwanza kisome sifuri, la sivyo kila kipimo kitakuwa juu mno.",
                ]),
              ]
            : []),
          ...(p("lube") === 0
            ? [
                issue("stick", "warn", [
                  "The plunger sticks and jumps in steps. Lubricate it so it moves freely.",
                  "Kijiti kinakwama na kuruka kwa hatua. Kipake mafuta kisogee kwa urahisi.",
                ]),
              ]
            : []),
          ...(collected >= 100
            ? [
                issue("full", "bad", [
                  "The syringe is full: the plunger would be pushed out. Use a bigger syringe or less reactant.",
                  "Sirinji imejaa: kijiti kingesukumwa nje. Tumia sirinji kubwa au kitendanishi kidogo.",
                ]),
              ]
            : []),
          ...(!vessel
            ? [
                issue("link", "tip", [
                  "Choose the vessel the gas comes from.",
                  "Chagua chombo ambacho gesi inatoka.",
                ]),
              ]
            : []),
        ],
        measures:
          p("hint") === 1 || vessel
            ? [
                measure(
                  "volume",
                  ["Gas volume", "Ujazo wa gesi"],
                  "mL",
                  read,
                  0,
                ),
              ]
            : [],
        tasks:
          collected > 3 && p("zeroed") === 1 && p("lube") === 1
            ? [
                task(
                  `syringe-${Math.round(true_)}`,
                  ["Volume of gas collected", "Ujazo wa gesi uliokusanywa"],
                  "mL",
                  true_,
                  1.5,
                ),
              ]
            : [],
      };
    },
  },
};
