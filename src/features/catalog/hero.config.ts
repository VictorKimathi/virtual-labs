import type { SubjectId } from "./data/catalog.types";

type ThemeColors = { light: string; dark: string };

export type OrbitConfig = {
  subject: SubjectId;
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: ThemeColors;
};

export const orbits: OrbitConfig[] = [
  {
    subject: "physics",
    radius: 2.1,
    tilt: [1.15, 0.2, 0],
    speed: 1.1,
    color: { light: "#2563eb", dark: "#60a5fa" },
  },
  {
    subject: "chemistry",
    radius: 2.75,
    tilt: [0.35, 0.9, 0.5],
    speed: 0.8,
    color: { light: "#ea580c", dark: "#fb923c" },
  },
  {
    subject: "biology",
    radius: 3.4,
    tilt: [-0.6, -0.7, 0.2],
    speed: 0.55,
    color: { light: "#15803d", dark: "#4ade80" },
  },
];

export const scenePalette = {
  light: {
    proton: "#bb0000",
    neutron: "#475569",
    shell: "#475569",
    dust: "#64748b",
  },
  dark: {
    proton: "#f87171",
    neutron: "#cbd5e1",
    shell: "#94a3b8",
    dust: "#cbd5e1",
  },
} satisfies Record<"light" | "dark", Record<string, string>>;

type PortalStyle = { glow: string; text: string; border: string };

export const portalStyles: Record<SubjectId, PortalStyle> = {
  physics: {
    glow: "bg-subject-physics/30",
    text: "text-subject-physics dark:text-blue-300",
    border: "hover:border-subject-physics",
  },
  chemistry: {
    glow: "bg-subject-chemistry/30",
    text: "text-subject-chemistry dark:text-orange-300",
    border: "hover:border-subject-chemistry",
  },
  biology: {
    glow: "bg-subject-biology/30",
    text: "text-subject-biology dark:text-green-300",
    border: "hover:border-subject-biology",
  },
  agriculture: {
    glow: "bg-subject-agriculture/30",
    text: "text-subject-agriculture dark:text-yellow-300",
    border: "hover:border-subject-agriculture",
  },
};
