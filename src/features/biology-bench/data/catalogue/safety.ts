import type { BioPartSpec, BioRemedy, BioState } from "../../biology.types";
import { note, resolveWith, setParams } from "../../engine/operations";
import { readout, t } from "../../../workbench/data/catalogue/helpers";
import { button, toggle } from "./controls";

type SafetyKind =
  | "lab-coat"
  | "gloves"
  | "safety-goggles"
  | "disinfectant"
  | "sharps-container"
  | "first-aid-kit"
  | "eye-wash"
  | "biohazard-bag";

const wearable = (
  name: [string, string],
  description: [string, string],
  width: number,
  height: number,
): BioPartSpec => ({
  name: t(...name),
  description: t(...description),
  width,
  height,
  tapToggles: "worn",
  controls: [
    toggle(
      "worn",
      ["Put on", "Vaa"],
      ["Wearing it", "Umevaa"],
      ["Not worn", "Hujavaa"],
    ),
  ],
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

/** A safety item with a button that deals with incidents, and maybe tidies the bench. */
const remedy = (
  kind: BioRemedy,
  name: [string, string],
  description: [string, string],
  label: [string, string],
  width: number,
  height: number,
  extra?: (state: BioState) => BioState,
): BioPartSpec => ({
  name: t(...name),
  description: t(...description),
  width,
  height,
  controls: [
    button("use", label, ({ state, part }) => {
      const { state: next, helped } = resolveWith(
        extra ? extra(state) : state,
        kind,
      );
      return note(
        setParams(next, part, { used: (part.params.used ?? 0) + 1 }),
        part,
        helped
          ? t("That dealt with the problem.", "Hilo lilitatua tatizo.")
          : t("Done.", "Imefanyika."),
      );
    }),
  ],
  state: { used: 0 },
  analyse: ({ part }) => ({ observations: part.contents.notes }),
});

export const safetyParts: Record<SafetyKind, BioPartSpec> = {
  "lab-coat": wearable(
    ["Lab coat", "Koti la maabara"],
    [
      "Protects your clothes and skin from stains and spills.",
      "Hulinda nguo na ngozi yako dhidi ya rangi na kumwagika.",
    ],
    100,
    120,
  ),
  gloves: wearable(
    ["Gloves", "Glavu"],
    [
      "Wear them for preserved specimens, stains and microorganisms.",
      "Zivae kwa vielelezo vilivyohifadhiwa, rangi na vijidudu.",
    ],
    90,
    100,
  ),
  "safety-goggles": wearable(
    ["Safety goggles", "Miwani ya usalama"],
    [
      "Wear them when heating tubes and using reagents.",
      "Ivae unapopasha mirija na kutumia vitendanishi.",
    ],
    100,
    50,
  ),
  disinfectant: remedy(
    "disinfectant",
    ["Disinfectant", "Dawa ya kuua viini"],
    [
      "Wipe the bench before and after microbiology, and after any spill.",
      "Futa benchi kabla na baada ya biolojia ya vijidudu, na baada ya kumwagika.",
    ],
    ["Wipe the bench", "Futa benchi"],
    60,
    110,
  ),
  "sharps-container": remedy(
    "sharps-container",
    ["Sharps container", "Chombo cha vitu vikali"],
    [
      "For used blades, broken slides and needles.",
      "Kwa wembe uliotumika, slaidi zilizovunjika na sindano.",
    ],
    ["Put blades and broken glass in", "Weka wembe na kioo kilichovunjika"],
    80,
    100,
    (state) => ({
      ...state,
      parts: state.parts.map((item) =>
        item.kind === "scalpel" || item.kind === "razor-blade"
          ? { ...item, params: { ...item.params, disposed: 1 } }
          : item,
      ),
    }),
  ),
  "first-aid-kit": remedy(
    "first-aid-kit",
    ["First aid kit", "Sanduku la huduma ya kwanza"],
    [
      "Plasters, dressings and burn gel. Tell the teacher about any injury.",
      "Plasta, bendeji na jeli ya kuungua. Mwambie mwalimu kuhusu jeraha lolote.",
    ],
    ["Use the first aid kit", "Tumia sanduku la huduma ya kwanza"],
    100,
    80,
  ),
  "eye-wash": remedy(
    "eye-wash",
    ["Eye wash", "Kuosha macho"],
    ["Rinse the eye for 15 minutes.", "Osha jicho kwa dakika 15."],
    ["Rinse the eyes", "Osha macho"],
    90,
    100,
  ),
  "biohazard-bag": remedy(
    "biohazard-bag",
    ["Biohazard bag", "Mfuko wa taka hatari"],
    [
      "For used plates and cultures, which are autoclaved before disposal.",
      "Kwa sahani na vilimo vilivyotumika, ambavyo husafishwa kwenye otoklevu kabla ya kutupwa.",
    ],
    ["Bag all used plates", "Weka sahani zote zilizotumika kwenye mfuko"],
    90,
    110,
    (state) => ({
      ...state,
      parts: state.parts.map((item) =>
        item.kind === "petri-dish" && item.params.poured === 1
          ? { ...item, params: { ...item.params, disposed: 1 } }
          : item,
      ),
    }),
  ),
};
