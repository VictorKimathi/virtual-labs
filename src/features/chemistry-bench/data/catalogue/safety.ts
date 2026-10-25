import type {
  ChemPart,
  ChemPartSpec,
  ChemState,
  Remedy,
} from "../../chemistry.types";
import {
  insideFumeCupboard,
  partByNum,
  replacePart,
} from "../../engine/operations";
import { issue, readout, t } from "../../../workbench/data/catalogue/helpers";
import { button, choice, toggle } from "./controls";

type SafetyKind =
  | "lab-coat"
  | "safety-goggles"
  | "gloves"
  | "fume-cupboard"
  | "fire-extinguisher"
  | "fire-blanket"
  | "sand-bucket"
  | "eye-wash"
  | "safety-shower"
  | "first-aid-kit"
  | "waste-container";

function resolveWith(
  state: ChemState,
  part: ChemPart,
  remedy: Remedy,
  options: {
    only?: (vessel: number | undefined) => boolean;
    wrong?: Remedy[];
  } = {},
): ChemState {
  let any = false;
  const cleared: number[] = [];
  const incidents = state.incidents.map((incident) => {
    if (incident.resolved) return incident;
    if (
      incident.remedies.includes(remedy) &&
      (options.only?.(incident.vessel) ?? true)
    ) {
      any = true;
      if (incident.vessel) cleared.push(incident.vessel);
      return { ...incident, resolved: true, feedback: undefined };
    }
    if (options.wrong?.includes(incident.kind as never)) return incident;
    return incident;
  });
  let next: ChemState = { ...state, incidents };
  for (const num of cleared) {
    const vessel = partByNum(next, num);
    if (vessel && vessel.params.burning === 1)
      next = replacePart(next, {
        ...vessel,
        params: { ...vessel.params, burning: 0 },
      });
  }
  const text = any
    ? t("That dealt with the problem.", "Hilo lilitatua tatizo.")
    : t(
        "Nothing here needs this right now.",
        "Hakuna kinachohitaji hili sasa.",
      );
  return replacePart(next, {
    ...part,
    contents: {
      ...part.contents,
      notes: [...part.contents.notes, text].slice(-4),
    },
  });
}

/** Marks a wrong-tool message on unresolved incidents that this remedy cannot fix. */
function withWrongTool(
  state: ChemState,
  kinds: string[],
  message: ReturnType<typeof t>,
): ChemState {
  return {
    ...state,
    incidents: state.incidents.map((incident) =>
      !incident.resolved && kinds.includes(incident.kind)
        ? { ...incident, feedback: message }
        : incident,
    ),
  };
}

const wearable = (
  name: [string, string],
  description: [string, string],
  width: number,
  height: number,
): ChemPartSpec => ({
  name: t(...name),
  description: t(...description),
  width,
  height,
  controls: [
    toggle(
      "worn",
      ["Put on", "Vaa"],
      ["Wearing it", "Umevaa"],
      ["Not worn", "Hujavaa"],
    ),
  ],
  tapToggles: "worn",
  state: { worn: 0 },
  analyse: ({ p }) => ({
    visual: { worn: p("worn") },
    readouts: [
      readout(
        ["Protection", "Ulinzi"],
        p("worn") === 1 ? "On" : "Not worn",
        p("worn") === 1 ? "ok" : "warn",
      ),
    ],
  }),
});

const remedyPart = (
  name: [string, string],
  description: [string, string],
  width: number,
  height: number,
  buttonLabel: [string, string],
  run: (state: ChemState, part: ChemPart) => ChemState,
): ChemPartSpec => ({
  name: t(...name),
  description: t(...description),
  width,
  height,
  controls: [button("use", buttonLabel, ({ state, part }) => run(state, part))],
  analyse: ({ part }) => ({ observations: part.contents.notes }),
});

export const safetyParts: Record<SafetyKind, ChemPartSpec> = {
  "lab-coat": wearable(
    ["Lab coat", "Koti la maabara"],
    [
      "Protects your clothes and skin from splashes. Wear it buttoned up.",
      "Hulinda nguo na ngozi yako dhidi ya michirizo. Livae likiwa limefungwa vifungo.",
    ],
    100,
    120,
  ),
  "safety-goggles": wearable(
    ["Safety goggles", "Miwani ya usalama"],
    [
      "Protect your eyes from splashes and spitting liquids. Wear them whenever you handle chemicals or heat anything.",
      "Hulinda macho yako dhidi ya michirizo na vimiminika vinavyorushwa. Zivae kila unaposhika kemikali au kupasha kitu joto.",
    ],
    100,
    50,
  ),
  gloves: wearable(
    ["Gloves", "Glavu"],
    [
      "Protect your hands from corrosive and toxic chemicals. Take them off before touching your face.",
      "Hulinda mikono yako dhidi ya kemikali zinazoharibu na zenye sumu. Zivue kabla ya kugusa uso wako.",
    ],
    90,
    100,
  ),
  "fume-cupboard": {
    name: t("Fume cupboard", "Kabati la mvuke"),
    description: t(
      "A ventilated cabinet that sucks poisonous gases away. Stand a vessel inside it for reactions that give off chlorine, nitrogen dioxide or other harmful fumes.",
      "Kabati lenye hewa linalofyonza gesi zenye sumu. Weka chombo ndani yake kwa athari zinazotoa klorini, naitrojeni dioksaidi au mvuke mwingine hatari.",
    ),
    width: 260,
    height: 210,
    controls: [
      toggle(
        "fan",
        ["Extraction", "Kifyonza"],
        ["On", "Kimewashwa"],
        ["Off", "Kimezimwa"],
      ),
      button("clear", ["Clear the fumes", "Ondoa mvuke"], ({ state, part }) => {
        if (part.params.fan !== 1)
          return replacePart(state, {
            ...part,
            contents: {
              ...part.contents,
              notes: [
                t("Switch the extraction on first.", "Washa kifyonza kwanza."),
              ],
            },
          });
        return resolveWith(state, part, "fume-cupboard", {
          only: (vessel) => {
            const v = vessel ? partByNum(state, vessel) : undefined;
            return v ? insideFumeCupboard(state, v) : false;
          },
        });
      }),
    ],
    state: { fan: 0 },
    analyse: ({ part, p, env }) => {
      const inside = env.parts.filter(
        (other) =>
          other.vessel !== null &&
          other.id !== part.id &&
          insideFumeCupboard(
            { ...env, incidents: [], nextId: 0, records: [], selection: null },
            other,
          ),
      );
      return {
        observations: part.contents.notes,
        readouts: [
          readout(
            ["Vessels inside", "Vyombo vilivyomo"],
            String(inside.length),
          ),
          readout(
            ["Extraction", "Kifyonza"],
            p("fan") === 1 ? "On" : "Off",
            p("fan") === 1 ? "ok" : "warn",
          ),
        ],
        issues:
          p("fan") === 0
            ? [
                issue("fan", "tip", [
                  "Switch the extraction on before you start a reaction inside.",
                  "Washa kifyonza kabla ya kuanza athari ndani.",
                ]),
              ]
            : [],
      };
    },
  },
  "fire-extinguisher": remedyPart(
    ["Fire extinguisher", "Kizima moto"],
    [
      "For fires in flammable liquids. Aim at the base of the flames. Do not use it on a sodium fire.",
      "Kwa moto wa vimiminika vinavyowaka. Lenga chini ya miali. Usikitumie kwenye moto wa sodiamu.",
    ],
    70,
    170,
    ["Use the extinguisher", "Tumia kizima moto"],
    (state, part) => {
      let next = resolveWith(state, part, "fire-extinguisher");
      next = withWrongTool(
        next,
        ["metal-fire"],
        t(
          "A water or CO₂ extinguisher makes a sodium fire worse. Smother it with dry sand.",
          "Kizima moto cha maji au CO₂ hufanya moto wa sodiamu kuwa mbaya zaidi. Uzime kwa mchanga mkavu.",
        ),
      );
      return next;
    },
  ),
  "fire-blanket": remedyPart(
    ["Fire blanket", "Blanketi la moto"],
    [
      "Smothers a small fire by cutting off the air. Lay it over the flames, away from you.",
      "Hufunika moto mdogo kwa kuzuia hewa. Lilaze juu ya miali, mbali nawe.",
    ],
    100,
    110,
    ["Smother the fire", "Zima moto"],
    (state, part) =>
      withWrongTool(
        resolveWith(state, part, "fire-blanket"),
        ["metal-fire"],
        t(
          "A blanket does not control a sodium fire that is reacting with water. Use dry sand.",
          "Blanketi halidhibiti moto wa sodiamu unaoitikia na maji. Tumia mchanga mkavu.",
        ),
      ),
  ),
  "sand-bucket": remedyPart(
    ["Sand bucket", "Ndoo ya mchanga"],
    [
      "Dry sand smothers metal fires and small spills. It is the right answer for a sodium fire.",
      "Mchanga mkavu huzima moto wa chuma na kumwagika kidogo. Ni jibu sahihi kwa moto wa sodiamu.",
    ],
    90,
    100,
    ["Smother with sand", "Zima kwa mchanga"],
    (state, part) => resolveWith(state, part, "sand-bucket"),
  ),
  "eye-wash": remedyPart(
    ["Eye wash station", "Kituo cha kuosha macho"],
    [
      "Rinses chemicals from the eyes. Hold the eyelids open and rinse for at least 15 minutes.",
      "Huosha kemikali machoni. Shikilia kope wazi na uoshe kwa angalau dakika 15.",
    ],
    100,
    100,
    ["Rinse the eyes for 15 minutes", "Osha macho kwa dakika 15"],
    (state, part) => resolveWith(state, part, "eye-wash"),
  ),
  "safety-shower": remedyPart(
    ["Safety shower", "Bafu la usalama"],
    [
      "For chemicals on the body or clothes. Step under it, pull the handle and take off contaminated clothing.",
      "Kwa kemikali mwilini au nguoni. Simama chini yake, vuta mpini na uvue nguo zilizochafuka.",
    ],
    90,
    190,
    ["Wash under the shower", "Osha chini ya bafu"],
    (state, part) => resolveWith(state, part, "safety-shower"),
  ),
  "first-aid-kit": remedyPart(
    ["First aid kit", "Sanduku la huduma ya kwanza"],
    [
      "Plasters, dressings and burn gel for cuts and minor burns. Tell the teacher about every injury.",
      "Plasta, bendeji na jeli ya kuungua kwa majeraha na kuungua kidogo. Mwambie mwalimu kuhusu kila jeraha.",
    ],
    100,
    80,
    ["Treat the injury", "Tibu jeraha"],
    (state, part) => resolveWith(state, part, "first-aid-kit"),
  ),
  "waste-container": {
    name: t(
      "Waste disposal container (labelled)",
      "Chombo cha taka (chenye lebo)",
    ),
    description: t(
      "Each kind of chemical waste has its own labelled container. Pour waste into the right one using a vessel's 'Empty' control, and use it to clean up spills.",
      "Kila aina ya taka za kemikali ina chombo chake chenye lebo. Mimina taka kwenye sahihi kwa kutumia 'Mwaga' ya chombo, na uitumie kusafisha vilivyomwagika.",
    ),
    width: 90,
    height: 120,
    controls: [
      choice(
        "label",
        ["Label", "Lebo"],
        [
          ["Acids and alkalis", "Asidi na alikali"],
          ["Heavy metals", "Metali nzito"],
          ["Organic solvents", "Viyeyusho vya kikaboni"],
          ["General (harmless)", "Kawaida (zisizo na madhara)"],
        ],
      ),
      button(
        "clean",
        ["Clean up a spill", "Safisha kilichomwagika"],
        ({ state, part }) => resolveWith(state, part, "waste-container"),
      ),
    ],
    state: { label: 0, filled: 0 },
    analyse: ({ part, p }) => ({
      observations: part.contents.notes,
      readouts: [
        readout(
          ["Waste collected", "Taka zilizokusanywa"],
          `${Math.round(p("filled"))} mL`,
        ),
      ],
    }),
  },
};
