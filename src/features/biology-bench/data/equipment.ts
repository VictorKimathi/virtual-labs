import type { Params } from "../../workbench/workbench.types";
import type {
  BioEnv,
  BioOutcome,
  BioPart,
  BioPartDefinition,
  BioPartSpec,
} from "../biology.types";
import { emptyTube } from "../engine/food";
import { hasKind, isWearing, partsOver } from "../engine/operations";
import { dissectionParts } from "./catalogue/dissection";
import { ecologyParts } from "./catalogue/ecology";
import { foodParts } from "./catalogue/food";
import { geneticsParts } from "./catalogue/genetics";
import { microbiologyParts } from "./catalogue/microbiology";
import { microscopyParts } from "./catalogue/microscopy";
import { modernParts } from "./catalogue/modern";
import { physiologyParts } from "./catalogue/physiology";
import { safetyParts } from "./catalogue/safety";
import {
  allBioKinds,
  bioSectionKinds,
  bioSectionOrder,
  type BioKind,
  type BioSection,
} from "./kinds";

const specs: Record<BioKind, BioPartSpec> = {
  ...microscopyParts,
  ...dissectionParts,
  ...foodParts,
  ...physiologyParts,
  ...ecologyParts,
  ...geneticsParts,
  ...microbiologyParts,
  ...safetyParts,
  ...modernParts,
};

const sectionOfKind = new Map<BioKind, BioSection>(
  bioSectionOrder.flatMap((section) =>
    bioSectionKinds[section].map((kind): [BioKind, BioSection] => [
      kind,
      section,
    ]),
  ),
);

function build(kind: BioKind, spec: BioPartSpec): BioPartDefinition {
  const controls = spec.controls ?? [];
  const defaults: Params = {};
  for (const control of controls) {
    if (control.type === "button") continue;
    defaults[control.id] = control.type === "link" ? 0 : control.default;
  }
  return {
    ...spec,
    kind,
    section: sectionOfKind.get(kind) ?? "microscopy",
    controls,
    defaults: { ...defaults, ...spec.state },
  };
}

export const bioDefinitions = Object.fromEntries(
  allBioKinds.map((kind) => [kind, build(kind, specs[kind])]),
) as Record<BioKind, BioPartDefinition>;

export function isBioKind(value: string): value is BioKind {
  return value in bioDefinitions;
}

export function createBioPart(
  kind: BioKind,
  num: number,
  x: number,
  y: number,
  time = 0,
): BioPart {
  const definition = bioDefinitions[kind];
  return {
    id: `${kind}-${num}`,
    num,
    kind,
    x,
    y,
    width: definition.width,
    height: definition.height,
    params: { ...definition.defaults },
    contents: { ...emptyTube(), at: time },
  };
}

export function bioParamReader(part: BioPart) {
  const defaults = bioDefinitions[part.kind].defaults;
  return (id: string) => part.params[id] ?? defaults[id] ?? 0;
}

export function makeBioEnv(parts: BioPart[], time: number): BioEnv {
  const byNum = new Map(parts.map((part) => [part.num, part]));
  return {
    parts,
    time,
    part: (num) => byNum.get(num),
    over: (part, kinds) => partsOver(parts, part, kinds),
    has: (kind) => hasKind(parts, kind),
    wearing: (kind) => isWearing(parts, kind),
  };
}

export function analyseBio(part: BioPart, env: BioEnv): BioOutcome {
  const analyse = bioDefinitions[part.kind].analyse;
  return analyse ? analyse({ part, env, p: bioParamReader(part) }) : {};
}

export function analyseAllBio(env: BioEnv) {
  return new Map(env.parts.map((part) => [part.id, analyseBio(part, env)]));
}

/** "Test tube 2" when there is more than one of a kind on the bench. */
export function bioPartLabel(parts: BioPart[], part: BioPart, name: string) {
  const sameKind = parts.filter((item) => item.kind === part.kind);
  return sameKind.length > 1
    ? `${name} ${sameKind.findIndex((item) => item.id === part.id) + 1}`
    : name;
}
