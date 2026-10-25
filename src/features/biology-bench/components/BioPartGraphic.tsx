import { usePrefersReducedMotion } from "../../workbench/hooks/usePrefersReducedMotion";
import type { BioEnv, BioKind, BioOutcome, BioPart } from "../biology.types";
import {
  analyseBio,
  bioParamReader,
  createBioPart,
  makeBioEnv,
} from "../data/equipment";
import { bioGlyphs } from "./glyphs";

type BioPartGraphicProps = { part: BioPart; env: BioEnv; outcome: BioOutcome };

/** The drawing of a part in its own local space. */
export function BioPartGraphic({ part, env, outcome }: BioPartGraphicProps) {
  const still = usePrefersReducedMotion();
  const p = bioParamReader(part);
  const v = (id: string) => outcome.visual?.[id] ?? 0;
  return <>{bioGlyphs[part.kind]({ part, outcome, env, p, v, still })}</>;
}

/** A part drawn at its default settings, for the equipment list. */
export function BioPartPreview({ kind }: { kind: BioKind }) {
  const part = createBioPart(kind, 0, 0, 0);
  const env = makeBioEnv([part], 0);
  return (
    <BioPartGraphic part={part} env={env} outcome={analyseBio(part, env)} />
  );
}
