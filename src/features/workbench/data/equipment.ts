import type { CircuitSolution } from "../circuit/solution";
import type {
  BenchEnv,
  LocalizedText,
  Outcome,
  Params,
  PartDefinition,
  PartSpec,
  PlacedPart,
  Wire,
} from "../workbench.types";
import { electricityParts } from "./catalogue/electricity";
import { fluidsParts } from "./catalogue/fluids";
import { heatParts } from "./catalogue/heat";
import { magnetismParts } from "./catalogue/magnetism";
import { measurementParts } from "./catalogue/measurement";
import { mechanicsParts } from "./catalogue/mechanics";
import { modernParts } from "./catalogue/modern";
import { opticsParts } from "./catalogue/optics";
import { wavesParts } from "./catalogue/waves";
import {
  allKinds,
  sectionKinds,
  sectionOrder,
  type PartKind,
  type SectionId,
} from "./kinds";

const specs: Record<PartKind, PartSpec> = {
  ...measurementParts,
  ...mechanicsParts,
  ...fluidsParts,
  ...heatParts,
  ...opticsParts,
  ...wavesParts,
  ...electricityParts,
  ...magnetismParts,
  ...modernParts,
};

const sectionOfKind = new Map<PartKind, SectionId>(
  sectionOrder.flatMap((section) =>
    sectionKinds[section].map((kind): [PartKind, SectionId] => [kind, section]),
  ),
);

function build(kind: PartKind, spec: PartSpec): PartDefinition {
  const controls = spec.controls ?? [];
  const defaults: Params = { ...spec.state };
  for (const control of controls)
    if (control.type !== "button") defaults[control.id] = control.default;
  return {
    kind,
    section: sectionOfKind.get(kind) ?? "measurement",
    name: spec.name,
    description: spec.description,
    width: spec.width,
    height: spec.height,
    terminals: spec.terminals ?? [],
    controls,
    defaults,
    tapToggles: spec.tapToggles,
    electrical: spec.electrical,
    analyse: spec.analyse,
    react: spec.react,
  };
}

export const partDefinitions = Object.fromEntries(
  allKinds.map((kind) => [kind, build(kind, specs[kind])]),
) as Record<PartKind, PartDefinition>;

export const sectionNames: Record<SectionId, LocalizedText> = {
  measurement: { en: "Measurement", sw: "Vipimo" },
  mechanics: { en: "Forces and mechanics", sw: "Nguvu na mekanika" },
  fluids: { en: "Pressure and fluids", sw: "Shinikizo na vimiminika" },
  heat: { en: "Heat and thermal physics", sw: "Joto na fizikia ya joto" },
  optics: { en: "Light and optics", sw: "Mwanga na macho" },
  waves: { en: "Waves and sound", sw: "Mawimbi na sauti" },
  electricity: { en: "Electricity", sw: "Umeme" },
  magnetism: {
    en: "Magnetism and electromagnetism",
    sw: "Sumaku na sumaku-umeme",
  },
  modern: { en: "Modern physics", sw: "Fizikia ya kisasa" },
};

export function isPartKind(value: string): value is PartKind {
  return value in partDefinitions;
}

export function paramReader(part: PlacedPart) {
  const defaults = partDefinitions[part.kind].defaults;
  return (id: string) => part.params[id] ?? defaults[id] ?? 0;
}

function overlaps(a: PlacedPart, b: PlacedPart) {
  const first = partDefinitions[a.kind];
  const second = partDefinitions[b.kind];
  return (
    a.x < b.x + second.width &&
    b.x < a.x + first.width &&
    a.y < b.y + second.height &&
    b.y < a.y + first.height
  );
}

export function makeEnv(
  parts: PlacedPart[],
  wires: Wire[],
  solution: CircuitSolution,
  now: number,
): BenchEnv {
  return {
    parts,
    wires,
    solution,
    now,
    over: (part, kinds) =>
      parts.filter(
        (other) =>
          other.id !== part.id &&
          kinds.includes(other.kind) &&
          overlaps(part, other),
      ),
  };
}

const nothing: Outcome = {};

export function analysePart(part: PlacedPart, env: BenchEnv): Outcome {
  const definition = partDefinitions[part.kind];
  return definition.analyse?.({ part, env, p: paramReader(part) }) ?? nothing;
}

export function analyseAll(env: BenchEnv) {
  return new Map(env.parts.map((part) => [part.id, analysePart(part, env)]));
}

/** Permanent changes the solved circuit causes, keyed by part id. */
export function reactions(env: BenchEnv) {
  const patches = new Map<string, Params>();
  for (const part of env.parts) {
    const patch = partDefinitions[part.kind].react?.({
      part,
      env,
      p: paramReader(part),
    });
    if (patch) patches.set(part.id, patch);
  }
  return patches;
}

export function newPart(
  kind: PartKind,
  id: string,
  x: number,
  y: number,
): PlacedPart {
  return { id, kind, x, y, params: { ...partDefinitions[kind].defaults } };
}
