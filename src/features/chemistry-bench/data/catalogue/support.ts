import type { ChemPartSpec } from "../../chemistry.types";
import { issue, readout, t } from "../../../workbench/data/catalogue/helpers";
import { partsOver } from "../../engine/operations";
import { slider, toggle } from "./controls";

type SupportKind =
  | "retort-stand"
  | "clamp-boss"
  | "test-tube-rack"
  | "test-tube-holder"
  | "tongs"
  | "spatula"
  | "deflagrating-spoon"
  | "beehive-shelf"
  | "trough";

const tubes = ["test-tube", "boiling-tube"] as const;

export const supportParts: Record<SupportKind, ChemPartSpec> = {
  "retort-stand": {
    name: t("Retort stand", "Stendi ya retoti"),
    description: t(
      "A heavy base and an upright rod. Clamp apparatus to it with a boss and clamp, close to the rod so it does not tip.",
      "Msingi mzito na fimbo wima. Bana vifaa kwake kwa kiunganishi na kibano, karibu na fimbo ili isiangushe.",
    ),
    width: 120,
    height: 330,
    analyse: ({ part, env }) => {
      const held = partsOver(env, part, ["clamp-boss", "burette"]);
      return {
        readouts: [
          readout(["Items clamped", "Vitu vilivyobanwa"], String(held.length)),
        ],
      };
    },
  },
  "clamp-boss": {
    name: t("Clamp and boss", "Kibano na kiunganishi"),
    description: t(
      "Grips glassware on a retort stand. Too loose and it slips, too tight and glass cracks.",
      "Hushika vyombo vya kioo kwenye stendi ya retoti. Kilegevu huteleza, kigumu sana hupasua kioo.",
    ),
    width: 110,
    height: 60,
    controls: [
      slider("grip", ["Screw tightness", "Ukazaji wa skrubu"], 0, 10, 1, 5),
    ],
    state: { grip: 5 },
    analyse: ({ p }) => {
      const state =
        p("grip") < 3 ? "slips" : p("grip") > 7 ? "cracks" : "holds";
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
                    ? "Tighten the screw until the glass is firm."
                    : "Ease the screw: tight clamps crack glass.",
                  state === "slips"
                    ? "Kaza skrubu hadi kioo kishike."
                    : "Legeza skrubu: kibano kigumu hupasua kioo.",
                ]),
              ],
      };
    },
  },
  "test-tube-rack": {
    name: t("Test-tube rack", "Rafu ya mirija ya majaribio"),
    description: t(
      "Keeps test tubes upright so they do not tip over. Hold tubes over it, not over your lap.",
      "Huweka mirija ya majaribio wima isiangushe. Weka mirija juu yake, si mapajani.",
    ),
    width: 240,
    height: 100,
    analyse: ({ part, env }) => {
      const held = partsOver(env, part, [...tubes]);
      return {
        readouts: [
          readout(
            ["Tubes in the rack", "Mirija kwenye rafu"],
            `${held.length} of 6`,
          ),
        ],
      };
    },
  },
  "test-tube-holder": {
    name: t("Test-tube holder", "Kishikio cha mrija wa majaribio"),
    description: t(
      "A spring clip that holds a test tube away from your fingers while heating. Hold the tube at an angle, mouth pointing away from everyone.",
      "Kibano cha chemchemi kinachoshikilia mrija mbali na vidole wakati wa kupasha. Shikilia mrija kwa mwelekeo, mdomo ukielekea mbali na kila mtu.",
    ),
    width: 140,
    height: 40,
    analyse: () => ({
      issues: [
        issue("use", "tip", [
          "Shake the tube gently while heating so the liquid does not shoot out.",
          "Tikisa mrija taratibu wakati wa kupasha ili kioevu kisirushwe nje.",
        ]),
      ],
    }),
  },
  tongs: {
    name: t("Tongs", "Koleo"),
    description: t(
      "For lifting hot crucibles and evaporating dishes. Let them cool a little first.",
      "Za kuinua vikombe vya kuchomea na sahani za kuvukiza vilivyo moto. Viache vipoe kidogo kwanza.",
    ),
    width: 150,
    height: 40,
    analyse: () => ({
      issues: [
        issue("hot", "tip", [
          "Never touch hot glass or porcelain with bare fingers.",
          "Kamwe usiguse kioo au kauri moto kwa vidole vitupu.",
        ]),
      ],
    }),
  },
  spatula: {
    name: t("Spatula", "Kijiko cha kuchota vigumu"),
    description: t(
      "For lifting small amounts of solids. Wipe it clean between reagents so they do not contaminate each other.",
      "Cha kuchota kiasi kidogo cha vigumu. Kifute kati ya vitendanishi ili visichafuane.",
    ),
    width: 130,
    height: 24,
    analyse: () => ({
      issues: [
        issue("clean", "tip", [
          "Use a clean, dry spatula for each reagent.",
          "Tumia kijiko safi na kikavu kwa kila kitendanishi.",
        ]),
      ],
    }),
  },
  "deflagrating-spoon": {
    name: t("Deflagrating spoon", "Kijiko cha kuchoma"),
    description: t(
      "A long-handled spoon for burning small amounts of a substance in a jar of gas. Heat it in a flame first.",
      "Kijiko chenye mpini mrefu cha kuchoma kiasi kidogo cha dutu ndani ya mtungi wa gesi. Kipashe motoni kwanza.",
    ),
    width: 150,
    height: 40,
    controls: [
      toggle(
        "hot",
        ["Spoon", "Kijiko"],
        ["Heated in a flame", "Kimepashwa motoni"],
        ["Cold", "Baridi"],
      ),
    ],
    state: { hot: 0 },
    analyse: ({ p }) => ({
      readouts: [
        readout(
          ["Spoon", "Kijiko"],
          p("hot") === 1 ? "Hot" : "Cold",
          p("hot") === 1 ? "warn" : undefined,
        ),
      ],
    }),
  },
  "beehive-shelf": {
    name: t("Beehive shelf", "Rafu ya mzinga"),
    description: t(
      "A ceramic dome with a hole on top, placed in a trough so a gas jar can be filled with a gas over water.",
      "Kuba la kauri lenye tundu juu, linawekwa kwenye birika ili mtungi wa gesi ujazwe gesi juu ya maji.",
    ),
    width: 110,
    height: 70,
    analyse: ({ part, env }) => {
      const trough = partsOver(env, part, ["trough"]).length > 0;
      return {
        readouts: [
          readout(
            ["In a trough", "Kwenye birika"],
            trough ? "Yes" : "No",
            trough ? "ok" : undefined,
          ),
        ],
      };
    },
  },
  trough: {
    name: t("Trough", "Birika"),
    description: t(
      "A shallow tank of water for collecting gases that do not dissolve in water, by displacing the water from a jar.",
      "Tanki isiyo na kina la maji la kukusanya gesi zisizoyeyuka majini, kwa kuondoa maji kutoka kwenye mtungi.",
    ),
    width: 220,
    height: 90,
    controls: [
      toggle(
        "filled",
        ["Water", "Maji"],
        ["Filled", "Yamejazwa"],
        ["Empty", "Tupu"],
        1,
      ),
    ],
    state: { filled: 1 },
    analyse: ({ p }) => ({
      readouts: [
        readout(["Water", "Maji"], p("filled") === 1 ? "Filled" : "Empty"),
      ],
    }),
  },
};
