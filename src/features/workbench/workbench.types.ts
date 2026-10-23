import type { Language } from "../../app/languageContext";
import type { CircuitSolution } from "./circuit/solveCircuit";

export type LocalizedText = Record<Language, string>;

export type PartKind =
  | "cell"
  | "battery"
  | "power-supply"
  | "switch"
  | "bulb"
  | "resistor"
  | "ammeter"
  | "voltmeter";

export type PartCategory = "sources" | "switches" | "meters" | "loads";

export type TerminalName = "pos" | "neg" | "a" | "b";

export type TerminalRef = { partId: string; terminal: TerminalName };

export type PlacedPart = {
  id: string;
  kind: PartKind;
  x: number;
  y: number;
  value: number;
  closed: boolean;
};

export type Wire = { id: string; from: TerminalRef; to: TerminalRef };

export type ElectricalModel =
  | { type: "source"; voltage: number; internalResistance: number }
  | { type: "resistor"; resistance: number }
  | { type: "open" };

export type PartDefinition = {
  kind: PartKind;
  category: PartCategory;
  name: LocalizedText;
  description: LocalizedText;
  width: number;
  height: number;
  terminals: [TerminalDefinition, TerminalDefinition];
  adjustable?: {
    label: LocalizedText;
    unit: "V" | "Ω";
    min: number;
    max: number;
    step: number;
  };
  defaultValue: number;
  meter?: { unit: "A" | "V"; fullScale: number };
  model: (part: PlacedPart) => ElectricalModel;
};

export type TerminalDefinition = {
  name: TerminalName;
  x: number;
  y: number;
  polarity?: "+" | "-";
};

export type Selection = { type: "part" | "wire"; id: string };

export type MeterReading = {
  partId: string;
  label: string;
  unit: "A" | "V";
  value: number;
};

export type NotebookRecord = { id: string; readings: MeterReading[] };

export type GoalContext = {
  parts: PlacedPart[];
  wires: Wire[];
  solution: CircuitSolution;
  records: NotebookRecord[];
};

export type ExperimentGoal = {
  id: string;
  label: LocalizedText;
  check: (context: GoalContext) => boolean;
};

export type Experiment = {
  id: string;
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
