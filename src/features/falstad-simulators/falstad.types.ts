export type FalstadCategory = "circuits" | "waves" | "fields";

export type LocalizedText = { en: string; sw: string };

export type FalstadSimulator = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  category: FalstadCategory;
  path: string;
  hasPresets: boolean;
};

export type CircuitPreset = { file: string; title: string };

export type CircuitPresetGroup = {
  id: string;
  title: LocalizedText;
  presets: CircuitPreset[];
};
