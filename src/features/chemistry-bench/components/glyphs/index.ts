import type { ChemGlyph, ChemKind } from "../../chemistry.types";
import { modernGlyphs, reagentGlyphs, safetyGlyphs } from "./benchGlyphs";
import { glasswareGlyphs } from "./glasswareGlyphs";
import { heatingGlyphs, supportGlyphs } from "./heatingGlyphs";
import {
  electroGlyphs,
  measurementGlyphs,
  separationGlyphs,
} from "./labGlyphs";

export const chemGlyphs: Record<ChemKind, ChemGlyph> = {
  ...glasswareGlyphs,
  ...heatingGlyphs,
  ...supportGlyphs,
  ...separationGlyphs,
  ...measurementGlyphs,
  ...electroGlyphs,
  ...reagentGlyphs,
  ...safetyGlyphs,
  ...modernGlyphs,
};
