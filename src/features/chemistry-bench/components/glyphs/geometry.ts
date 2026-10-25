export const glassFill = "fill-sky-50 dark:fill-slate-900";
export const glassLine = "stroke-sky-500 dark:stroke-sky-400";
export const glassStroke = `fill-none ${glassLine}`;

/** The liquid surface height for a fraction filled, between the empty bottom and the full line. */
export const surfaceAt = (level: number, top: number, bottom: number) =>
  bottom - Math.max(0, Math.min(1, level)) * (bottom - top);

/** Maps a volume to a height through measured points, for vessels with a bulb and a neck. */
export function piecewise(volume: number, points: [number, number][]) {
  if (volume <= points[0][0]) return points[0][1];
  for (let index = 1; index < points.length; index++) {
    const [v1, y1] = points[index];
    const [v0, y0] = points[index - 1];
    if (volume <= v1) return y0 + ((volume - v0) / (v1 - v0)) * (y1 - y0);
  }
  return points[points.length - 1][1];
}
