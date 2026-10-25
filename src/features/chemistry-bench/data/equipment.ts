import type { Params } from "../../workbench/workbench.types";
import type {
  ChemEnv,
  ChemOutcome,
  ChemPart,
  ChemPartDefinition,
  ChemPartSpec,
  Incident,
} from "../chemistry.types";
import { emptyContents } from "../engine/contents";
import { partsOver, wearing } from "../engine/operations";
import { electroParts } from "./catalogue/electro";
import { glasswareParts } from "./catalogue/glassware";
import { heatingParts } from "./catalogue/heating";
import { measurementParts } from "./catalogue/measurement";
import { modernParts } from "./catalogue/modern";
import { reagentParts } from "./catalogue/reagentParts";
import { safetyParts } from "./catalogue/safety";
import { separationParts } from "./catalogue/separation";
import { supportParts } from "./catalogue/support";
import { vesselParts } from "./catalogue/vessels";
import {
  allChemKinds,
  chemSectionKinds,
  chemSectionOrder,
  type ChemKind,
  type ChemSection,
} from "./kinds";

const specs: Record<ChemKind, ChemPartSpec> = {
  ...vesselParts,
  ...glasswareParts,
  ...heatingParts,
  ...supportParts,
  ...separationParts,
  ...measurementParts,
  ...electroParts,
  ...reagentParts,
  ...safetyParts,
  ...modernParts,
};

const sectionOfKind = new Map<ChemKind, ChemSection>(
  chemSectionOrder.flatMap((section) =>
    chemSectionKinds[section].map((kind): [ChemKind, ChemSection] => [
      kind,
      section,
    ]),
  ),
);

function build(kind: ChemKind, spec: ChemPartSpec): ChemPartDefinition {
  const controls = spec.controls ?? [];
  const defaults: Params = {};
  for (const control of controls) {
    if (control.type === "button") continue;
    defaults[control.id] = control.type === "link" ? 0 : control.default;
  }
  return {
    ...spec,
    kind,
    section: sectionOfKind.get(kind) ?? "glassware",
    controls,
    defaults: { ...defaults, ...spec.state },
  };
}

export const chemDefinitions = Object.fromEntries(
  allChemKinds.map((kind) => [kind, build(kind, specs[kind])]),
) as Record<ChemKind, ChemPartDefinition>;

export function isChemKind(value: string): value is ChemKind {
  return value in chemDefinitions;
}

export function vesselSpecOf(kind: ChemKind, params: Params) {
  const vessel = chemDefinitions[kind].vessel;
  if (!vessel) return null;
  return typeof vessel === "function" ? vessel(params) : vessel;
}

export function createPart(
  kind: ChemKind,
  num: number,
  x: number,
  y: number,
): ChemPart {
  const definition = chemDefinitions[kind];
  const params = { ...definition.defaults };
  return {
    id: `${kind}-${num}`,
    num,
    kind,
    x,
    y,
    width: definition.width,
    height: definition.height,
    params,
    contents: definition.initial?.() ?? emptyContents(),
    vessel: vesselSpecOf(kind, params),
  };
}

export function chemParamReader(part: ChemPart) {
  const defaults = chemDefinitions[part.kind].defaults;
  return (id: string) => part.params[id] ?? defaults[id] ?? 0;
}

export function makeChemEnv(
  parts: ChemPart[],
  now: number,
  incidents: Incident[],
): ChemEnv {
  const byNum = new Map(parts.map((part) => [part.num, part]));
  return {
    parts,
    now,
    incidents,
    part: (num) => byNum.get(num),
    over: (part, kinds) => partsOver({ parts }, part, kinds),
    wearing: (kind) => wearing(parts, kind),
  };
}

export function analyseChem(part: ChemPart, env: ChemEnv): ChemOutcome {
  const analyse = chemDefinitions[part.kind].analyse;
  return analyse ? analyse({ part, env, p: chemParamReader(part) }) : {};
}

export function analyseAllChem(env: ChemEnv) {
  return new Map(env.parts.map((part) => [part.id, analyseChem(part, env)]));
}

/** "Beaker 2" when there is more than one of a kind on the bench. */
export function chemPartLabel(parts: ChemPart[], part: ChemPart, name: string) {
  const sameKind = parts.filter((item) => item.kind === part.kind);
  return sameKind.length > 1
    ? `${name} ${sameKind.findIndex((item) => item.id === part.id) + 1}`
    : name;
}
