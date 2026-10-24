import type { ReactNode } from "react";
import type { Language } from "../../app/languageContext";
import type { CircuitSolution } from "./circuit/solution";
import type { PartKind, SectionId } from "./data/kinds";

export type { PartKind, SectionId };

export type LocalizedText = Record<Language, string>;

export type TerminalName = "pos" | "neg" | "a" | "b" | "c" | "d" | "e" | "s";

export type TerminalRef = { partId: string; terminal: TerminalName };

/** Every adjustable setting of a part is a number, so benches stay serialisable. */
export type Params = Record<string, number>;

export type PlacedPart = {
  id: string;
  kind: PartKind;
  x: number;
  y: number;
  params: Params;
};

export type Wire = { id: string; from: TerminalRef; to: TerminalRef };

export type TerminalDefinition = {
  name: TerminalName;
  x: number;
  y: number;
  polarity?: "+" | "-";
};

export type Control =
  | {
      type: "slider";
      id: string;
      label: LocalizedText;
      unit?: string;
      min: number;
      max: number;
      step: number;
      default: number;
      when?: (params: Params) => boolean;
    }
  | {
      type: "select";
      id: string;
      label: LocalizedText;
      options: LocalizedText[];
      default: number;
      when?: (params: Params) => boolean;
    }
  | {
      type: "toggle";
      id: string;
      label: LocalizedText;
      on: LocalizedText;
      off: LocalizedText;
      default: 0 | 1;
      when?: (params: Params) => boolean;
    }
  | {
      type: "button";
      id: string;
      label: LocalizedText;
      apply: (params: Params, now: number) => Params;
      when?: (params: Params) => boolean;
    };

/** A circuit element contributed by a part; terminals refer to the part's own. */
export type ElectricalElement =
  | { type: "resistor"; a: TerminalName; b: TerminalName; resistance: number }
  | {
      type: "source";
      a: TerminalName;
      b: TerminalName;
      voltage: number;
      internalResistance: number;
      ac?: { frequency: number; wave: number };
      currentLimit?: number;
    }
  | {
      type: "diode";
      a: TerminalName;
      b: TerminalName;
      forward: number;
      resistance: number;
    }
  | {
      type: "transformer";
      a: TerminalName;
      b: TerminalName;
      c: TerminalName;
      d: TerminalName;
      primaryResistance: number;
      secondaryResistance: number;
      ratio: number;
    }
  | {
      /** Conducts only while the diode at index `gate` of the same part is on. */
      type: "gated";
      a: TerminalName;
      b: TerminalName;
      resistance: number;
      gate: number;
    }
  | { type: "ohmmeter"; a: TerminalName; b: TerminalName };

export type Tone = "ok" | "warn" | "bad";

export type Readout = { label: LocalizedText; value: string; tone?: Tone };

export type Issue = { id: string; tone: Tone | "tip"; text: LocalizedText };

/** A number a student can write into the notebook and plot. */
export type Measure = {
  id: string;
  label: LocalizedText;
  unit: string;
  value: number;
  digits: number;
};

/** A value the student must read from the instrument and type in. */
export type ReadingTask = {
  id: string;
  label: LocalizedText;
  unit: string;
  expected: number;
  tolerance: number;
  hint?: LocalizedText;
};

export type Outcome = {
  readouts?: Readout[];
  issues?: Issue[];
  measures?: Measure[];
  tasks?: ReadingTask[];
  /** Numbers shared between a part's analysis and its drawing. */
  visual?: Record<string, number>;
};

export type BenchEnv = {
  parts: PlacedPart[];
  wires: Wire[];
  solution: CircuitSolution;
  /** Milliseconds on the bench clock; advances while something is timing. */
  now: number;
  /** Parts of the given kinds whose bodies overlap this part on the bench. */
  over: (part: PlacedPart, kinds: PartKind[]) => PlacedPart[];
};

export type AnalysisInput = {
  part: PlacedPart;
  env: BenchEnv;
  /** Reads one of the part's settings. */
  p: (id: string) => number;
};

export type PartDefinition = {
  kind: PartKind;
  section: SectionId;
  name: LocalizedText;
  description: LocalizedText;
  width: number;
  height: number;
  terminals: TerminalDefinition[];
  controls: Control[];
  defaults: Params;
  /** Tapping the item on the bench flips this setting. */
  tapToggles?: string;
  electrical?: (part: PlacedPart) => ElectricalElement[];
  analyse?: (input: AnalysisInput) => Outcome;
  /** Permanent change a solved circuit causes, such as a fuse blowing. */
  react?: (input: AnalysisInput) => Params | undefined;
};

export type PartSpec = Omit<
  PartDefinition,
  "kind" | "section" | "defaults" | "terminals" | "controls"
> & {
  terminals?: TerminalDefinition[];
  controls?: Control[];
  /** Hidden state that is not a control, such as a stored charge. */
  state?: Params;
};

export type GlyphProps = {
  part: PlacedPart;
  outcome: Outcome;
  env: BenchEnv;
  /** Reads one of the part's settings. */
  p: (id: string) => number;
  /** Reads a number the part's analysis shared for drawing. */
  v: (id: string) => number;
  still: boolean;
};

export type Glyph = (props: GlyphProps) => ReactNode;

export type Selection = { type: "part" | "wire"; id: string };

export type MeterReading = {
  partId: string;
  measureId: string;
  label: string;
  unit: string;
  digits: number;
  value: number;
};

export type NotebookRecord = { id: string; readings: MeterReading[] };

export type GoalContext = {
  parts: PlacedPart[];
  wires: Wire[];
  solution: CircuitSolution;
  records: NotebookRecord[];
  outcomes: Map<string, Outcome>;
};

export type ExperimentGoal = {
  id: string;
  label: LocalizedText;
  check: (context: GoalContext) => boolean;
};

export type Experiment = {
  id: string;
  section: SectionId;
  title: LocalizedText;
  summary: LocalizedText;
  equipment: PartKind[];
  steps: LocalizedText[];
  goals: ExperimentGoal[];
};

export type Topic = {
  id: string;
  name: LocalizedText;
  summary: LocalizedText;
  equipment: PartKind[];
  experiments: Experiment[];
};
