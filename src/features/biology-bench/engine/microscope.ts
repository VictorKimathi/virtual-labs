import { seeded } from "../../workbench/data/catalogue/helpers";
import type { LocalizedText } from "../../workbench/workbench.types";
import type { BioPart } from "../biology.types";

export type SpecimenId =
  | "onion"
  | "cheek"
  | "blood"
  | "leaf"
  | "stem"
  | "root-tip"
  | "pond"
  | "micrometer";

export const stains = [
  "none",
  "iodine",
  "methylene-blue",
  "eosin",
  "acetocarmine",
] as const;
export type StainId = (typeof stains)[number];

export const objectives = [4, 10, 40] as const;

/** What is seen down the microscope, in numbers the drawing uses. */
export type MicroscopeImage = {
  specimen: SpecimenId | null;
  stain: StainId;
  objective: number;
  /** Diameter of the field of view in micrometres. */
  field: number;
  /** Blur in pixels on a 300-pixel view. */
  blur: number;
  brightness: number;
  contrast: number;
  bubbles: number;
  graticule: boolean;
  /** True length of one eyepiece unit in micrometres at this objective. */
  umPerUnit: number;
  offsetX: number;
  offsetY: number;
  broken: boolean;
  /** No liquid under the cover slip: cells shrivel. */
  dry: boolean;
  seed: number;
};

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

export const wetMountSpecimens: {
  id: SpecimenId | null;
  name: LocalizedText;
}[] = [
  { id: null, name: t("Nothing yet", "Bado hakuna") },
  { id: "onion", name: t("Onion epidermis", "Ngozi ya kitunguu") },
  { id: "cheek", name: t("Cheek cells", "Seli za shavu") },
  { id: "leaf", name: t("Leaf epidermis peel", "Ganda la ngozi ya jani") },
  { id: "pond", name: t("A drop of pond water", "Tone la maji ya bwawa") },
];

export const preparedSpecimens: { id: SpecimenId; name: LocalizedText }[] = [
  { id: "blood", name: t("Human blood smear", "Paka la damu ya binadamu") },
  { id: "stem", name: t("Dicot stem T.S.", "Shina la dikoti T.S.") },
  {
    id: "root-tip",
    name: t("Onion root tip (mitosis)", "Ncha ya mzizi wa kitunguu (mitosisi)"),
  },
  {
    id: "leaf",
    name: t("Leaf epidermis with stomata", "Ngozi ya jani yenye vinyweleo"),
  },
  { id: "pond", name: t("Pond organisms", "Viumbe wa bwawa") },
  {
    id: "onion",
    name: t("Onion epidermis (stained)", "Ngozi ya kitunguu (iliyotiwa rangi)"),
  },
];

/** The stain that shows each specimen best. */
export const bestStain: Partial<Record<SpecimenId, StainId>> = {
  onion: "iodine",
  cheek: "methylene-blue",
  "root-tip": "acetocarmine",
  leaf: "iodine",
};

/** Typical sizes in micrometres, varied a little for every slide. */
export function cellSize(specimen: SpecimenId, seed: string) {
  const vary = 0.85 + seeded(seed, 41) * 0.3;
  const base: Record<SpecimenId, number> = {
    onion: 250,
    cheek: 60,
    blood: 7.5,
    leaf: 70,
    stem: 40,
    "root-tip": 20,
    pond: 180,
    micrometer: 10,
  };
  return base[specimen] * vary;
}

const depthOfField: Record<number, number> = { 4: 0.08, 10: 0.02, 40: 0.004 };
const dimming: Record<number, number> = { 4: 1, 10: 0.85, 40: 0.6 };

/** Where the slide is in perfect focus, in mm of stage height. */
export function bestFocus(slide: BioPart, objective: number) {
  const thick =
    slide.kind === "glass-slide" && slide.params.drops > 3 ? 0.1 : 0;
  const parfocal = objective === 4 ? 0 : objective === 10 ? 0.004 : 0.008;
  return 12 + (seeded(slide.id, 7) - 0.5) * 0.1 + thick + parfocal;
}

/** The focus position: coarse plus fine. */
export const stageHeight = (scope: BioPart) =>
  (scope.params.coarse ?? 0) + (scope.params.fine ?? 0);

/** How far past focus the stage can rise before the lens hits the slide. */
export const workingClearance: Record<number, number> = {
  4: 6,
  10: 2,
  40: 0.25,
};

export function specimenOf(slide: BioPart | undefined): {
  specimen: SpecimenId | null;
  stain: StainId;
  bubbles: number;
  dry: boolean;
} {
  if (!slide) return { specimen: null, stain: "none", bubbles: 0, dry: false };
  if (slide.kind === "stage-micrometer")
    return { specimen: "micrometer", stain: "none", bubbles: 0, dry: false };
  if (slide.kind === "prepared-slide") {
    const chosen =
      preparedSpecimens[slide.params.type ?? 0] ?? preparedSpecimens[0];
    const stain: StainId =
      chosen.id === "root-tip"
        ? "acetocarmine"
        : chosen.id === "onion"
          ? "iodine"
          : chosen.id === "blood"
            ? "eosin"
            : "none";
    return { specimen: chosen.id, stain, bubbles: 0, dry: false };
  }
  const specimen = wetMountSpecimens[slide.params.specimen ?? 0]?.id ?? null;
  const covered = slide.params.cover ?? 0;
  return {
    specimen,
    stain: stains[slide.params.stain ?? 0] ?? "none",
    bubbles: covered === 2 ? 6 : 0,
    dry: specimen !== null && (slide.params.drops ?? 0) === 0,
  };
}

function stainContrast(specimen: SpecimenId, stain: StainId) {
  if (
    specimen === "micrometer" ||
    specimen === "stem" ||
    specimen === "blood" ||
    specimen === "pond"
  )
    return 0.9;
  if (bestStain[specimen] === stain) return 1;
  return stain === "none" ? 0.3 : 0.6;
}

/** Works out the view down a microscope from its settings and the slide on the stage. */
export function microscopeImage(
  scope: BioPart,
  slide: BioPart | undefined,
): MicroscopeImage {
  const p = scope.params;
  const objective = objectives[p.objective ?? 0] ?? 4;
  const { specimen, stain, bubbles, dry } = specimenOf(slide);
  const focusError = slide
    ? Math.abs(stageHeight(scope) - bestFocus(slide, objective))
    : 0;
  const blur = slide
    ? Math.min(14, (focusError / depthOfField[objective]) * 1.2)
    : 0;
  const lamp = (p.lamp ?? 0) / 100;
  const diaphragm = (p.diaphragm ?? 100) / 100;
  const brightness = Math.min(
    1,
    lamp * (0.25 + 0.75 * diaphragm) * dimming[objective] * 1.4,
  );
  const base = specimen ? stainContrast(specimen, stain) : 1;
  const contrast = Math.min(1, base + (1 - diaphragm) * 0.6 * (1 - base));
  const factor = 0.95 + seeded(scope.id, 13) * 0.1;
  return {
    specimen,
    stain,
    objective,
    field: 18000 / objective,
    blur,
    brightness,
    contrast,
    bubbles,
    graticule: p.graticule === 1,
    umPerUnit: (100 / objective) * factor,
    offsetX: p.x ?? 0,
    offsetY: p.y ?? 0,
    broken: p.broken === 1,
    dry,
    seed: slide ? Math.floor(seeded(slide.id, 3) * 1000) : 0,
  };
}
