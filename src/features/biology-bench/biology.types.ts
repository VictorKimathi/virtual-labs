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
import type { ChemPlot, LiquidView } from "../chemistry-bench/chemistry.types";
import type { Substance } from "./engine/food";
import type { MicroscopeImage } from "./engine/microscope";
import type { BioKind, BioSection } from "./data/kinds";

export type { BioKind, BioSection };

/** What is in a test tube, boiling tube or beaker. Nutrients in mg, reagents in mL. */
export type TubeContents = {
  /** Liquid volume in mL. */
  volume: number;
  items: Partial<Record<Substance, number>>;
  /** Bench time, in seconds, that the contents were last brought up to date. */
  at: number;
  /** Seconds spent above 80 °C. */
  hot: number;
  /** Enzymes in the tube have been destroyed by heat. */
  denatured: boolean;
  /** Iodine has been added, which stops amylase working. */
  stopped: boolean;
  /** Froth from oxygen, in mm. */
  foam: number;
  /** What the student has seen happen, newest last. */
  notes: LocalizedText[];
};

export type BioPart = {
  id: string;
  /** The number in the id; link settings store this. */
  num: number;
  kind: BioKind;
  x: number;
  y: number;
  width: number;
  height: number;
  params: Params;
  contents: TubeContents;
};

export type BioIncidentKind =
  | "cut"
  | "eye-splash"
  | "burn"
  | "biohazard"
  | "broken-slide"
  | "inhaled"
  | "irritation";

export type BioRemedy =
  | "first-aid-kit"
  | "eye-wash"
  | "disinfectant"
  | "sharps-container"
  | "biohazard-bag";

export type BioIncident = {
  id: string;
  kind: BioIncidentKind;
  text: LocalizedText;
  advice: LocalizedText;
  remedies: BioRemedy[];
  resolved: boolean;
};

export type BioState = {
  parts: BioPart[];
  selection: Selection | null;
  records: NotebookRecord[];
  incidents: BioIncident[];
  nextId: number;
  /** Bench time in seconds. */
  time: number;
  /** Index into the speed choices. */
  speed: number;
  running: boolean;
};

export type BioEnv = {
  parts: BioPart[];
  /** Bench time in seconds. */
  time: number;
  part: (num: number) => BioPart | undefined;
  /** Parts of the given kinds whose bodies overlap this part. */
  over: (part: BioPart, kinds: readonly BioKind[]) => BioPart[];
  has: (kind: BioKind) => boolean;
  wearing: (kind: BioKind) => boolean;
};

type Visibility = (part: BioPart, env: BioEnv) => boolean;

export type BioPressInput = { state: BioState; part: BioPart; time: number };

export type BioControl =
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
      type: "link";
      id: string;
      label: LocalizedText;
      none: LocalizedText;
      choices: (candidate: BioPart, self: BioPart) => boolean;
      when?: Visibility;
    }
  | {
      type: "button";
      id: string;
      label: LocalizedText;
      run: (input: BioPressInput) => BioState;
      when?: Visibility;
    };

export type BioOutcome = {
  observations?: LocalizedText[];
  plot?: ChemPlot;
  readouts?: Readout[];
  issues?: Issue[];
  measures?: Measure[];
  tasks?: ReadingTask[];
  visual?: Record<string, number>;
  liquid?: LiquidView;
  /** What is seen down a microscope. */
  view?: MicroscopeImage;
};

export type BioAnalysisInput = {
  part: BioPart;
  env: BioEnv;
  p: (id: string) => number;
};

/** Runs after a setting changes, with the part before and after the change. */
export type BioAfterChange = (input: {
  state: BioState;
  before: BioPart;
  after: BioPart;
  param: string;
  time: number;
}) => BioState;

export type BioPartDefinition = {
  kind: BioKind;
  section: BioSection;
  name: LocalizedText;
  description: LocalizedText;
  width: number;
  height: number;
  controls: BioControl[];
  defaults: Params;
  tapToggles?: string;
  /** True for parts that hold liquid in their contents. */
  holdsLiquid?: boolean;
  afterChange?: BioAfterChange;
  analyse?: (input: BioAnalysisInput) => BioOutcome;
};

export type BioPartSpec = Omit<
  BioPartDefinition,
  "kind" | "section" | "defaults" | "controls"
> & {
  controls?: BioControl[];
  state?: Params;
};

export type BioGlyphProps = {
  part: BioPart;
  outcome: BioOutcome;
  env: BioEnv;
  p: (id: string) => number;
  v: (id: string) => number;
  still: boolean;
};

export type BioGlyph = (props: BioGlyphProps) => ReactNode;

export type BioGoalContext = {
  parts: BioPart[];
  records: NotebookRecord[];
  incidents: BioIncident[];
  time: number;
};

export type BioGoal = {
  id: string;
  label: LocalizedText;
  check: (context: BioGoalContext) => boolean;
};

export type BioExperiment = {
  id: string;
  section: BioSection;
  title: LocalizedText;
  summary: LocalizedText;
  equipment: BioKind[];
  steps: LocalizedText[];
  goals: BioGoal[];
};
