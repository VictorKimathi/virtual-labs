import type { LocalizedText } from "../../workbench/workbench.types";
import type { BioKind } from "./kinds";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

/** An organ: its name, colour and the ellipses that draw it, shown from a stage on. */
export type Organ = {
  id: string;
  name: LocalizedText;
  fill: string;
  shapes: [number, number, number, number][];
  from: number;
};

export type DissectionStep = {
  action: LocalizedText;
  tools: BioKind[];
  /** Bench seconds that must pass after this step before the next one. */
  wait?: number;
};

export type Specimen = {
  kind: BioKind;
  preserved: boolean;
  steps: DissectionStep[];
  organs: Organ[];
};

const rat: Specimen = {
  kind: "rat",
  preserved: true,
  steps: [
    {
      action: t(
        "Pin it out on the board, belly up",
        "Ibandike ubaoni, tumbo juu",
      ),
      tools: ["dissecting-board", "dissecting-pins"],
    },
    {
      action: t(
        "Lift the skin with forceps and cut along the midline",
        "Inua ngozi kwa koleo na ukate katikati",
      ),
      tools: ["forceps", "dissecting-scissors"],
    },
    {
      action: t("Pin back the skin", "Bandika ngozi nyuma"),
      tools: ["dissecting-pins"],
    },
    {
      action: t("Cut through the body wall", "Kata ukuta wa mwili"),
      tools: ["dissecting-scissors"],
    },
    {
      action: t(
        "Cut through the ribs to open the chest",
        "Kata mbavu kufungua kifua",
      ),
      tools: ["dissecting-scissors"],
    },
    {
      action: t(
        "Move the gut aside with a mounting needle",
        "Sogeza utumbo pembeni kwa sindano",
      ),
      tools: ["mounting-needle"],
    },
  ],
  organs: [
    {
      id: "liver",
      name: t("Liver", "Ini"),
      fill: "fill-red-900",
      shapes: [[86, 80, 16, 30]],
      from: 4,
    },
    {
      id: "stomach",
      name: t("Stomach", "Tumbo"),
      fill: "fill-amber-200",
      shapes: [[104, 64, 12, 9]],
      from: 4,
    },
    {
      id: "small-intestine",
      name: t("Small intestine", "Utumbo mdogo"),
      fill: "fill-pink-300",
      shapes: [
        [134, 86, 24, 20],
        [128, 72, 10, 8],
      ],
      from: 4,
    },
    {
      id: "large-intestine",
      name: t("Large intestine", "Utumbo mpana"),
      fill: "fill-amber-700",
      shapes: [[166, 70, 11, 17]],
      from: 4,
    },
    {
      id: "bladder",
      name: t("Bladder", "Kibofu"),
      fill: "fill-yellow-200",
      shapes: [[190, 80, 7, 7]],
      from: 4,
    },
    {
      id: "heart",
      name: t("Heart", "Moyo"),
      fill: "fill-red-600",
      shapes: [[55, 82, 9, 11]],
      from: 5,
    },
    {
      id: "lungs",
      name: t("Lungs", "Mapafu"),
      fill: "fill-pink-300",
      shapes: [
        [52, 64, 13, 8],
        [52, 100, 13, 8],
      ],
      from: 5,
    },
    {
      id: "kidneys",
      name: t("Kidneys", "Figo"),
      fill: "fill-red-800",
      shapes: [
        [140, 62, 6, 9],
        [140, 100, 6, 9],
      ],
      from: 6,
    },
  ],
};

const frog: Specimen = {
  kind: "frog",
  preserved: true,
  steps: [
    {
      action: t(
        "Pin it out on the board, belly up",
        "Ibandike ubaoni, tumbo juu",
      ),
      tools: ["dissecting-board", "dissecting-pins"],
    },
    {
      action: t(
        "Lift the skin with forceps and cut along the midline",
        "Inua ngozi kwa koleo na ukate katikati",
      ),
      tools: ["forceps", "dissecting-scissors"],
    },
    {
      action: t(
        "Cut through the muscle of the body wall",
        "Kata misuli ya ukuta wa mwili",
      ),
      tools: ["dissecting-scissors"],
    },
    {
      action: t("Pin back the body wall", "Bandika ukuta wa mwili nyuma"),
      tools: ["dissecting-pins"],
    },
    {
      action: t(
        "Move the gut aside with a mounting needle",
        "Sogeza utumbo pembeni kwa sindano",
      ),
      tools: ["mounting-needle"],
    },
  ],
  organs: [
    {
      id: "heart",
      name: t("Heart", "Moyo"),
      fill: "fill-red-600",
      shapes: [[80, 80, 8, 9]],
      from: 3,
    },
    {
      id: "lungs",
      name: t("Lungs", "Mapafu"),
      fill: "fill-pink-300",
      shapes: [
        [84, 62, 10, 7],
        [84, 98, 10, 7],
      ],
      from: 3,
    },
    {
      id: "liver",
      name: t("Liver", "Ini"),
      fill: "fill-red-900",
      shapes: [
        [102, 66, 12, 10],
        [102, 94, 12, 10],
      ],
      from: 3,
    },
    {
      id: "stomach",
      name: t("Stomach", "Tumbo"),
      fill: "fill-amber-200",
      shapes: [[118, 74, 10, 7]],
      from: 3,
    },
    {
      id: "intestine",
      name: t("Intestine", "Utumbo"),
      fill: "fill-pink-400",
      shapes: [[136, 86, 16, 13]],
      from: 3,
    },
    {
      id: "kidneys",
      name: t("Kidneys", "Figo"),
      fill: "fill-red-800",
      shapes: [
        [140, 68, 5, 10],
        [140, 92, 5, 10],
      ],
      from: 5,
    },
  ],
};

const fish: Specimen = {
  kind: "fish",
  preserved: true,
  steps: [
    {
      action: t("Lay it on its side on the board", "Ilaze ubavu kwenye ubao"),
      tools: ["dissecting-board"],
    },
    {
      action: t(
        "Lift the operculum (gill cover) with forceps",
        "Inua kifuniko cha matamvua kwa koleo",
      ),
      tools: ["forceps"],
    },
    {
      action: t(
        "Cut from the vent forwards to the gills",
        "Kata kutoka tundu la nyuma kwenda kwenye matamvua",
      ),
      tools: ["dissecting-scissors"],
    },
    {
      action: t(
        "Lift away the flap of body wall",
        "Ondoa kipande cha ukuta wa mwili",
      ),
      tools: ["forceps"],
    },
  ],
  organs: [
    {
      id: "gills",
      name: t("Gills", "Matamvua"),
      fill: "fill-red-500",
      shapes: [[58, 72, 9, 14]],
      from: 2,
    },
    {
      id: "heart",
      name: t("Heart", "Moyo"),
      fill: "fill-red-700",
      shapes: [[72, 96, 6, 6]],
      from: 4,
    },
    {
      id: "liver",
      name: t("Liver", "Ini"),
      fill: "fill-amber-800",
      shapes: [[92, 92, 12, 9]],
      from: 4,
    },
    {
      id: "swim-bladder",
      name: t("Swim bladder", "Kibofu cha hewa"),
      fill: "fill-slate-100",
      shapes: [[120, 66, 26, 9]],
      from: 4,
    },
    {
      id: "intestine",
      name: t("Intestine", "Utumbo"),
      fill: "fill-pink-300",
      shapes: [[126, 92, 18, 8]],
      from: 4,
    },
    {
      id: "gonad",
      name: t("Gonad", "Gonadi"),
      fill: "fill-yellow-300",
      shapes: [[150, 82, 12, 6]],
      from: 4,
    },
  ],
};

const flower: Specimen = {
  kind: "flower",
  preserved: false,
  steps: [
    {
      action: t(
        "Put it on the board and cut it lengthwise with a razor blade",
        "Iweke ubaoni na uikate kwa urefu kwa wembe",
      ),
      tools: ["dissecting-board", "razor-blade"],
    },
  ],
  organs: [
    {
      id: "sepal",
      name: t("Sepal", "Sepali"),
      fill: "fill-green-500",
      shapes: [
        [50, 118, 18, 7],
        [110, 118, 18, 7],
      ],
      from: 0,
    },
    {
      id: "petal",
      name: t("Petal", "Petali"),
      fill: "fill-pink-400",
      shapes: [
        [40, 70, 16, 38],
        [120, 70, 16, 38],
      ],
      from: 0,
    },
    {
      id: "anther",
      name: t("Anther", "Chavua"),
      fill: "fill-yellow-400",
      shapes: [
        [62, 40, 6, 5],
        [98, 40, 6, 5],
      ],
      from: 1,
    },
    {
      id: "filament",
      name: t("Filament", "Uzi wa stameni"),
      fill: "fill-yellow-100",
      shapes: [
        [63, 70, 2, 28],
        [97, 70, 2, 28],
      ],
      from: 1,
    },
    {
      id: "stigma",
      name: t("Stigma", "Stigma"),
      fill: "fill-lime-500",
      shapes: [[80, 30, 8, 5]],
      from: 1,
    },
    {
      id: "style",
      name: t("Style", "Mtindo"),
      fill: "fill-lime-200",
      shapes: [[80, 62, 3, 28]],
      from: 1,
    },
    {
      id: "ovary",
      name: t("Ovary", "Ovari"),
      fill: "fill-green-300",
      shapes: [[80, 104, 14, 12]],
      from: 1,
    },
    {
      id: "ovule",
      name: t("Ovule", "Kijiyai"),
      fill: "fill-amber-100",
      shapes: [
        [76, 104, 3, 3],
        [84, 104, 3, 3],
      ],
      from: 1,
    },
    {
      id: "receptacle",
      name: t("Receptacle", "Kikalio"),
      fill: "fill-green-700",
      shapes: [[80, 126, 20, 6]],
      from: 1,
    },
  ],
};

const bean: Specimen = {
  kind: "bean-seed",
  preserved: false,
  steps: [
    {
      action: t(
        "Soak the seed in water overnight",
        "Loweka mbegu kwenye maji usiku kucha",
      ),
      tools: ["beaker"],
      wait: 43200,
    },
    {
      action: t("Peel off the seed coat", "Menya ganda la mbegu"),
      tools: ["forceps"],
    },
    {
      action: t(
        "Split the two halves apart with a scalpel on the board",
        "Tenganisha nusu mbili kwa kisu ubaoni",
      ),
      tools: ["dissecting-board", "scalpel"],
    },
  ],
  organs: [
    {
      id: "testa",
      name: t("Testa (seed coat)", "Ganda la mbegu"),
      fill: "fill-rose-800",
      shapes: [[60, 50, 46, 30]],
      from: 0,
    },
    {
      id: "hilum",
      name: t("Hilum", "Kitovu cha mbegu"),
      fill: "fill-stone-100",
      shapes: [[60, 78, 8, 3]],
      from: 0,
    },
    {
      id: "cotyledon",
      name: t("Cotyledon", "Kotiledoni"),
      fill: "fill-amber-100",
      shapes: [[60, 50, 40, 26]],
      from: 3,
    },
    {
      id: "radicle",
      name: t("Radicle", "Kimzizi"),
      fill: "fill-amber-300",
      shapes: [[34, 66, 8, 4]],
      from: 3,
    },
    {
      id: "plumule",
      name: t("Plumule", "Kichipukizi"),
      fill: "fill-lime-300",
      shapes: [[46, 60, 6, 3]],
      from: 3,
    },
  ],
};

export const specimens: Partial<Record<BioKind, Specimen>> = {
  rat,
  frog,
  fish,
  flower,
  "bean-seed": bean,
};

/** The organs that can be seen after a number of steps. */
export const visibleOrgans = (specimen: Specimen, stage: number) =>
  specimen.organs.filter(
    (organ) =>
      organ.from <= stage &&
      !(specimen.kind === "bean-seed" && stage >= 3 && organ.id === "testa"),
  );
