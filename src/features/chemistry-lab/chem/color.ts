import type { ColorStop, Rgba } from "../chemistry.types";

export function hex(value: string, alpha = 1): Rgba {
  const channel = (start: number) =>
    parseInt(value.slice(start, start + 2), 16);
  return [channel(1), channel(3), channel(5), alpha];
}

export function toCss([r, g, b, a]: Rgba) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
}

export function mixColor(stops: readonly ColorStop[], x: number): Rgba {
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  const upper = stops.findIndex(([position]) => position >= x);
  const [fromX, from] = stops[upper - 1];
  const [toX, to] = stops[upper];
  const t = (x - fromX) / (toX - fromX);
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
    from[3] + (to[3] - from[3]) * t,
  ];
}
