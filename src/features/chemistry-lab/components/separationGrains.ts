export type GrainKind = "iron" | "sand" | "salt";

export type Grain = {
  id: number;
  kind: GrainKind;
  x: number;
  y: number;
  size: number;
  shade: string;
};

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sandShades = ["#d9bd8e", "#c9a56b", "#e4cba0", "#b98f55"];
const ironShades = ["#475569", "#334155", "#64748b"];
const saltShades = ["#ffffff", "#f1f5f9", "#e2e8f0"];

function build(): Grain[] {
  const random = seeded(7);
  const kinds: GrainKind[] = [
    ...Array<GrainKind>(16).fill("iron"),
    ...Array<GrainKind>(52).fill("sand"),
    ...Array<GrainKind>(46).fill("salt"),
  ];
  return kinds
    .map((kind) => ({ kind, order: random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ kind }, id) => {
      const x = (random() * 2 - 1) * 112;
      const height = 50 * (1 - (x / 124) ** 2);
      const shades =
        kind === "iron"
          ? ironShades
          : kind === "sand"
            ? sandShades
            : saltShades;
      return {
        id,
        kind,
        x,
        y: -3 - random() * height,
        size:
          kind === "iron"
            ? 3.4
            : kind === "sand"
              ? 2.6 + random()
              : 3 + random() * 1.2,
        shade: shades[Math.floor(random() * shades.length)],
      };
    });
}

export const grains = build();
