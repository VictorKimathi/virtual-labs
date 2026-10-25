import type { BioGlyph, BioKind } from "../../biology.types";
import { dissectionGlyphs } from "./dissectionGlyphs";
import {
  ecologyGlyphs,
  geneticsGlyphs,
  microbiologyGlyphs,
} from "./fieldGlyphs";
import { foodGlyphs, physiologyGlyphs } from "./foodGlyphs";
import { modernGlyphs, safetyGlyphs } from "./labGlyphs";
import { microscopyGlyphs } from "./microscopyGlyphs";

export const bioGlyphs: Record<BioKind, BioGlyph> = {
  ...microscopyGlyphs,
  ...dissectionGlyphs,
  ...foodGlyphs,
  ...physiologyGlyphs,
  ...ecologyGlyphs,
  ...geneticsGlyphs,
  ...microbiologyGlyphs,
  ...safetyGlyphs,
  ...modernGlyphs,
};
