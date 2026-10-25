import type { ReactNode } from "react";
import type {
  Issue,
  LocalizedText,
  Measure,
  NotebookRecord,
  Params,
  Readout,
  ReadingTask,
  Selection,
} from "../workbench/workbench.types";
import type { GasId, SolidId, SpeciesId } from "./engine/species";
import type { ChemKind, ChemSection } from "./data/kinds";

export type { ChemKind, ChemSection };

export type IndicatorKey =
  "universal" | "phenolphthalein" | "methyl-orange" | "litmus";

export type GasEvent = {
  gas: GasId;
  mmol: number;
  /** Bench clock time when the reaction started, in milliseconds. */
  at: number;
  /** Fraction of the gas released per second of bench time. */
  rate: number;
};

/** What is inside a vessel. Amounts of dissolved and solid matter are in millimoles. */
export type Contents = {
  /** Aqueous liquid, in mL. */
  volume: number;
  /** A layer of oil that does not mix, in mL. */
  organic: number;
  species: Partial<Record<SpeciesId, number>>;
  solids: Partial<Record<SolidId, number>>;
  indicator: { id: IndicatorKey; drops: number } | null;
  starch: boolean;
  temperature: number;
  /** Set while the vessel holds only a buffer solution. */
  fixedPh: number | null;
  /** Solids have been left to stand or spun down. */
  settled: boolean;
  gas: GasEvent[];
  /** What was added from each reagent: millilitres and millimoles of solute. */
  ledger: Record<string, { volume: number; mmol: number }>;
  /** What the student has seen happen, newest last. */
  notes: LocalizedText[];
};

export type ChemPart = {
  id: string;
  /** The number in the id; link settings store this. */
  num: number;
  kind: ChemKind;
  x: number;
  y: number;
  width: number;
  height: number;
  params: Params;
  contents: Contents;
  /** Set when the part holds liquid: its capacity in mL and empty mass in grams. */
  vessel: VesselSpec | null;
};

export type IncidentKind =
  | "swallowed"
  | "eye-splash"
  | "skin-burn"
  | "splash"
  | "burst"
  | "fire"
  | "metal-fire"
  | "toxic-fumes"
  | "spill"
  | "bad-disposal";

export type Remedy =
  | "eye-wash"
  | "safety-shower"
  | "first-aid-kit"
  | "fire-blanket"
  | "sand-bucket"
  | "fire-extinguisher"
  | "fume-cupboard"
  | "waste-container";

export type Incident = {
  id: string;
  kind: IncidentKind;
  vessel?: number;
  text: LocalizedText;
  advice: LocalizedText;
  remedies: Remedy[];
  resolved: boolean;
  /** What happened when the student tried a remedy that did not work. */
  feedback?: LocalizedText;
};

export type ChemState = {
  parts: ChemPart[];
  selection: Selection | null;
  records: NotebookRecord[];
  incidents: Incident[];
  nextId: number;
};

export type ChemEnv = {
  parts: ChemPart[];
  /** Milliseconds on the bench clock. */
  now: number;
  part: (num: number) => ChemPart | undefined;
  /** Parts of the given kinds whose bodies overlap this part. */
  over: (part: ChemPart, kinds: ChemKind[]) => ChemPart[];
  /** Safety equipment the student has put on. */
  wearing: (kind: ChemKind) => boolean;
  incidents: Incident[];
};

type Visibility = (part: ChemPart, env: ChemEnv) => boolean;

export type ChemControl =
  | {
      type: "slider";
      id: string;
      label: LocalizedText;
      unit?: string;
      min: number;
      max: number;
      step: number;
      default: number;
      when?: Visibility;
    }
  | {
      type: "select";
      id: string;
      label: LocalizedText;
      options: LocalizedText[];
      default: number;
      when?: Visibility;
    }
  | {
      type: "toggle";
      id: string;
      label: LocalizedText;
      on: LocalizedText;
      off: LocalizedText;
      default: 0 | 1;
      when?: Visibility;
    }
  | {
      /** Picks another part on the bench. The setting holds its number, or 0. */
      type: "link";
      id: string;
      label: LocalizedText;
      none: LocalizedText;
      choices: (candidate: ChemPart, self: ChemPart) => boolean;
      when?: Visibility;
    }
  | {
      type: "button";
      id: string;
      label: LocalizedText;
      run: (input: PressInput) => ChemState;
      when?: Visibility;
    };

export type PressInput = {
  state: ChemState;
  part: ChemPart;
  now: number;
};

/** The look of the liquid in a vessel, for drawing. */
export type LiquidView = {
  /** Liquid colour as a CSS colour. */
  colour: string;
  /** 0 clear to 1 opaque with suspended solid. */
  cloudy: number;
  /** Solids lying at the bottom, with their colours and relative amounts. */
  deposit: { colour: string; amount: number }[];
  /** 0 to 1: how strongly it is bubbling. */
  bubbling: number;
  /** Gas that is bubbling off, if any. */
  gas: GasId | null;
  /** True when the liquid is boiling. */
  boiling: boolean;
  /** Fraction of the vessel's capacity that is filled with liquid. */
  level: number;
  /** An oil layer as a fraction of the capacity. */
  oilLevel: number;
  /** Temperature in degrees Celsius. */
  temperature: number;
};

export type PlotSeries = {
  x: number[];
  y: number[];
  /** Draw as thin vertical sticks, as in a mass spectrum. */
  sticks?: boolean;
};

export type ChemPlot = {
  title: LocalizedText;
  xLabel: string;
  yLabel: string;
  series: PlotSeries[];
  /** Draw the x axis from high to low, as infrared spectra are. */
  reverseX?: boolean;
};

export type ChemOutcome = {
  /** What the student can see happening, in words. */
  observations?: LocalizedText[];
  plot?: ChemPlot;
  readouts?: Readout[];
  issues?: Issue[];
  measures?: Measure[];
  tasks?: ReadingTask[];
  visual?: Record<string, number>;
  liquid?: LiquidView;
};

export type ChemAnalysisInput = {
  part: ChemPart;
  env: ChemEnv;
  p: (id: string) => number;
};

export type VesselSpec = {
  /** Capacity in millilitres. */
  capacity: number;
  /** Mass of the empty vessel in grams. */
  tare: number;
  /** For a volumetric flask or pipette: the calibration mark, in millilitres. */
  mark?: number;
};

export type ChemPartDefinition = {
  kind: ChemKind;
  section: ChemSection;
  name: LocalizedText;
  description: LocalizedText;
  width: number;
  height: number;
  controls: ChemControl[];
  defaults: Params;
  tapToggles?: string;
  vessel?: VesselSpec | ((params: Params) => VesselSpec);
  /** What a new part holds, such as a full wash bottle. */
  initial?: () => Contents;
  analyse?: (input: ChemAnalysisInput) => ChemOutcome;
};

export type ChemPartSpec = Omit<
  ChemPartDefinition,
  "kind" | "section" | "defaults" | "controls"
> & {
  controls?: ChemControl[];
  state?: Params;
};

export type ChemGlyphProps = {
  part: ChemPart;
  outcome: ChemOutcome;
  env: ChemEnv;
  p: (id: string) => number;
  v: (id: string) => number;
  still: boolean;
};

export type ChemGlyph = (props: ChemGlyphProps) => ReactNode;

export type ChemGoalContext = {
  parts: ChemPart[];
  records: NotebookRecord[];
  outcomes: Map<string, ChemOutcome>;
  incidents: Incident[];
};

export type ChemGoal = {
  id: string;
  label: LocalizedText;
  check: (context: ChemGoalContext) => boolean;
};

export type ChemExperiment = {
  id: string;
  section: ChemSection;
  title: LocalizedText;
  summary: LocalizedText;
  equipment: ChemKind[];
  steps: LocalizedText[];
  goals: ChemGoal[];
};
