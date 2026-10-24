import type { Glyph, PartKind } from "../../workbench.types";
import { electricityGlyphs } from "./electricityGlyphs";
import { fluidsGlyphs } from "./fluidsGlyphs";
import { heatGlyphs } from "./heatGlyphs";
import { magnetismGlyphs } from "./magnetismGlyphs";
import { measurementGlyphs } from "./measurementGlyphs";
import { mechanicsGlyphs } from "./mechanicsGlyphs";
import { modernGlyphs } from "./modernGlyphs";
import { opticsGlyphs } from "./opticsGlyphs";
import { wavesGlyphs } from "./wavesGlyphs";

export const glyphs: Record<PartKind, Glyph> = {
  ...measurementGlyphs,
  ...mechanicsGlyphs,
  ...fluidsGlyphs,
  ...heatGlyphs,
  ...opticsGlyphs,
  ...wavesGlyphs,
  ...electricityGlyphs,
  ...magnetismGlyphs,
  ...modernGlyphs,
};
