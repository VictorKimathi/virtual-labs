import type { BioOutcome, BioPartSpec, BioState } from "../../biology.types";
import {
  addIncident,
  isWearing,
  note,
  overlaps,
  setParams,
} from "../../engine/operations";
import { formatSpan } from "../../engine/time";
import { issue, readout, t } from "../../../workbench/data/catalogue/helpers";
import type { BioKind } from "../kinds";
import { specimens, visibleOrgans, type Specimen } from "../specimens";
import { button, choice, toggle } from "./controls";

type DissectionKind =
  | "dissecting-board"
  | "scalpel"
  | "razor-blade"
  | "dissecting-scissors"
  | "dissecting-pins"
  | "rat"
  | "frog"
  | "fish"
  | "flower"
  | "bean-seed";

const bladeKinds: BioKind[] = ["scalpel", "razor-blade"];

const toolNames: Partial<Record<BioKind, string>> = {
  "dissecting-board": "dissecting board",
  "dissecting-pins": "pins",
  forceps: "forceps",
  "dissecting-scissors": "dissecting scissors",
  "mounting-needle": "mounting needle",
  scalpel: "scalpel",
  "razor-blade": "razor blade",
  beaker: "beaker of water",
};

function specimenSpec(
  specimen: Specimen,
  name: [string, string],
  description: [string, string],
  width: number,
  height: number,
): BioPartSpec {
  const organNames = specimen.organs.map((organ): [string, string] => [
    organ.name.en,
    organ.name.sw,
  ]);
  return {
    name: t(...name),
    description: t(...description),
    width,
    height,
    controls: [
      button(
        "step",
        ["Do the next step", "Fanya hatua inayofuata"],
        ({ state, part, time }) => {
          const stage = part.params.stage ?? 0;
          const step = specimen.steps[stage];
          if (!step) return state;
          const waitFor = stage > 0 ? (specimen.steps[stage - 1].wait ?? 0) : 0;
          if (waitFor > 0 && time - (part.params.stepAt ?? 0) < waitFor)
            return note(
              state,
              part,
              t(
                `Wait: it needs ${formatSpan(waitFor)}. Speed up the clock if you like.`,
                `Subiri: inahitaji ${formatSpan(waitFor)}. Ongeza kasi ya saa ukipenda.`,
              ),
            );
          const missing = step.tools.filter(
            (kind) => !state.parts.some((item) => item.kind === kind),
          );
          if (missing.length > 0)
            return note(
              state,
              part,
              t(
                `You need: ${missing.map((kind) => toolNames[kind] ?? kind).join(", ")}.`,
                `Unahitaji: ${missing.map((kind) => toolNames[kind] ?? kind).join(", ")}.`,
              ),
            );
          let next: BioState = state;
          if (specimen.preserved && !isWearing(state.parts, "gloves"))
            next = addIncident(next, "irritation");
          const onBoard = state.parts.some(
            (item) => item.kind === "dissecting-board" && overlaps(item, part),
          );
          if (step.tools.some((kind) => bladeKinds.includes(kind)) && !onBoard)
            next = addIncident(next, "cut");
          if (step.tools.includes("dissecting-board") && !onBoard)
            return note(
              next,
              part,
              t(
                "Drag the specimen onto the dissecting board first.",
                "Buruta kielelezo juu ya ubao wa upasuaji kwanza.",
              ),
            );
          next = setParams(next, part, {
            stage: stage + 1,
            stepAt: time,
            target: 0,
          });
          return note(
            next,
            part,
            t(
              `Done: ${step.action.en.toLowerCase()}.`,
              `Imefanyika: ${step.action.sw.toLowerCase()}.`,
            ),
          );
        },
        (part) => (part.params.stage ?? 0) < specimen.steps.length,
      ),
      toggle(
        "labels",
        ["Labels", "Lebo"],
        ["Shown", "Zimeonyeshwa"],
        ["Hidden", "Zimefichwa"],
      ),
      choice(
        "answer",
        ["The marked organ is", "Kiungo kilichowekwa alama ni"],
        organNames,
        0,
        (part) => visibleOrgans(specimen, part.params.stage ?? 0).length > 0,
      ),
      button(
        "check",
        ["Check my answer", "Kagua jibu langu"],
        ({ state, part }) => {
          const visible = visibleOrgans(specimen, part.params.stage ?? 0);
          const target =
            visible[(part.params.target ?? 0) % Math.max(1, visible.length)];
          if (!target) return state;
          const right =
            specimen.organs[part.params.answer ?? 0]?.id === target.id;
          const next = setParams(
            state,
            part,
            right
              ? {
                  correct: (part.params.correct ?? 0) + 1,
                  target: (part.params.target ?? 0) + 1,
                }
              : { wrong: (part.params.wrong ?? 0) + 1 },
          );
          return note(
            next,
            part,
            right
              ? t(
                  `Correct: the ${target.name.en.toLowerCase()}.`,
                  `Sahihi: ${target.name.sw.toLowerCase()}.`,
                )
              : t(
                  "Not quite. Look at its shape, colour and position.",
                  "Si sahihi. Angalia umbo, rangi na mahali pake.",
                ),
          );
        },
        (part) => visibleOrgans(specimen, part.params.stage ?? 0).length > 0,
      ),
    ],
    state: { stage: 0, stepAt: 0, target: 0, correct: 0, wrong: 0 },
    analyse: ({ part, p, env }) => {
      const stage = p("stage");
      const visible = visibleOrgans(specimen, stage);
      const target = visible[p("target") % Math.max(1, visible.length)];
      const nextStep = specimen.steps[stage];
      const issues: BioOutcome["issues"] = [];
      if (specimen.preserved && !env.wearing("gloves"))
        issues.push(
          issue("gloves", "warn", [
            "Preserved specimens are kept in an irritant fluid. Put on gloves.",
            "Vielelezo vilivyohifadhiwa vimo kwenye kimiminika kinachowasha. Vaa glavu.",
          ]),
        );
      if (nextStep)
        issues.push(
          issue("next", "tip", [
            `Next: ${nextStep.action.en}.`,
            `Ifuatayo: ${nextStep.action.sw}.`,
          ]),
        );
      return {
        visual: {
          stage,
          target: target ? specimen.organs.indexOf(target) : -1,
          labels: p("labels"),
        },
        observations: part.contents.notes,
        readouts: [
          readout(
            ["Steps done", "Hatua zilizofanywa"],
            `${stage} / ${specimen.steps.length}`,
          ),
          readout(
            ["Organs named", "Viungo vilivyotajwa"],
            `${p("correct")} / ${specimen.organs.length}`,
            p("correct") >= visible.length && visible.length > 0
              ? "ok"
              : undefined,
          ),
        ],
        issues,
      };
    },
  };
}

const blade = (
  name: [string, string],
  description: [string, string],
  width: number,
): BioPartSpec => ({
  name: t(...name),
  description: t(...description),
  width,
  height: 30,
  controls: [
    button(
      "dispose",
      [
        "Put the used blade in the sharps container",
        "Weka wembe uliotumika kwenye chombo cha vitu vikali",
      ],
      ({ state, part }) =>
        state.parts.some((item) => item.kind === "sharps-container")
          ? setParams(state, part, { disposed: 1 })
          : note(
              state,
              part,
              t(
                "Add a sharps container to the bench first.",
                "Ongeza chombo cha vitu vikali mezani kwanza.",
              ),
            ),
    ),
  ],
  state: { disposed: 0 },
  analyse: ({ part, p }) => ({
    observations: part.contents.notes,
    readouts: [
      readout(
        ["Blade", "Wembe"],
        p("disposed") === 1 ? "in the sharps container" : "on the bench",
        p("disposed") === 1 ? "ok" : undefined,
      ),
    ],
  }),
});

const required = (kind: BioKind) => {
  const specimen = specimens[kind];
  if (!specimen) throw new Error(`No specimen data for ${kind}`);
  return specimen;
};

export const dissectionParts: Record<DissectionKind, BioPartSpec> = {
  "dissecting-board": {
    name: t("Dissecting board", "Ubao wa upasuaji"),
    description: t(
      "A soft board to pin specimens to. Always cut on the board, away from your hand.",
      "Ubao laini wa kubandika vielelezo. Kata kila mara ubaoni, mbali na mkono wako.",
    ),
    width: 260,
    height: 190,
  },
  scalpel: blade(
    ["Scalpel", "Kisu cha upasuaji"],
    [
      "A very sharp blade. Cut away from yourself, on the board.",
      "Wembe mkali sana. Kata mbali na mwili wako, ubaoni.",
    ],
    130,
  ),
  "razor-blade": blade(
    ["Razor blade", "Wembe"],
    [
      "For thin sections through flowers, stems and leaves.",
      "Kwa vipande vyembamba vya maua, mashina na majani.",
    ],
    70,
  ),
  "dissecting-scissors": {
    name: t("Dissecting scissors", "Mkasi wa upasuaji"),
    description: t(
      "Fine scissors for cutting skin and body wall.",
      "Mkasi mwembamba wa kukata ngozi na ukuta wa mwili.",
    ),
    width: 120,
    height: 40,
  },
  "dissecting-pins": {
    name: t("Dissecting pins", "Pini za upasuaji"),
    description: t(
      "Pins to hold the specimen and skin in place on the board.",
      "Pini za kushikilia kielelezo na ngozi ubaoni.",
    ),
    width: 70,
    height: 40,
  },
  rat: specimenSpec(
    required("rat"),
    ["Rat (preserved)", "Panya (aliyehifadhiwa)"],
    [
      "A virtual dissection: no animal is harmed. Follow the steps, then name each organ.",
      "Upasuaji pepe: hakuna mnyama anayeumizwa. Fuata hatua, kisha taja kila kiungo.",
    ],
    220,
    160,
  ),
  frog: specimenSpec(
    required("frog"),
    ["Frog (preserved)", "Chura (aliyehifadhiwa)"],
    [
      "A virtual dissection: no animal is harmed. Follow the steps, then name each organ.",
      "Upasuaji pepe: hakuna mnyama anayeumizwa. Fuata hatua, kisha taja kila kiungo.",
    ],
    220,
    160,
  ),
  fish: specimenSpec(
    required("fish"),
    ["Fish (tilapia)", "Samaki (tilapia)"],
    [
      "Lift the gill cover to see the gills, then open the body cavity.",
      "Inua kifuniko cha matamvua uone matamvua, kisha fungua tumbo.",
    ],
    220,
    160,
  ),
  flower: specimenSpec(
    required("flower"),
    ["Flower", "Ua"],
    [
      "Cut a half flower to see the male and female parts.",
      "Kata nusu ya ua kuona sehemu za kiume na za kike.",
    ],
    160,
    140,
  ),
  "bean-seed": specimenSpec(
    required("bean-seed"),
    ["Bean seed", "Mbegu ya maharagwe"],
    [
      "Soak it, peel the seed coat and split it to find the embryo.",
      "Iloweke, menya ganda na uigawanye kupata kiinitete.",
    ],
    120,
    100,
  ),
};
