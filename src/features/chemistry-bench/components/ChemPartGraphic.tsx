import { usePrefersReducedMotion } from "../../workbench/hooks/usePrefersReducedMotion";
import type { ChemEnv, ChemOutcome, ChemPart } from "../chemistry.types";
import {
  analyseChem,
  chemParamReader,
  createPart,
  makeChemEnv,
} from "../data/equipment";
import type { ChemKind } from "../data/kinds";
import { chemGlyphs } from "./glyphs";

type ChemPartGraphicProps = {
  part: ChemPart;
  env: ChemEnv;
  outcome: ChemOutcome;
};

/** The drawing of a part in its own local space. */
export function ChemPartGraphic({ part, env, outcome }: ChemPartGraphicProps) {
  const still = usePrefersReducedMotion();
  const p = chemParamReader(part);
  const v = (id: string) => outcome.visual?.[id] ?? 0;
  return <>{chemGlyphs[part.kind]({ part, outcome, env, p, v, still })}</>;
}

/** A part drawn at its default settings, for the equipment list. */
export function ChemPartPreview({ kind }: { kind: ChemKind }) {
  const part = createPart(kind, 0, 0, 0);
  const env = makeChemEnv([part], 0, []);
  return (
    <ChemPartGraphic part={part} env={env} outcome={analyseChem(part, env)} />
  );
}
