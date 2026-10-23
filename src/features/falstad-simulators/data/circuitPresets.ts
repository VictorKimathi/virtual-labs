import type { CircuitPresetGroup } from "../falstad.types";

export const circuitPresetGroups: CircuitPresetGroup[] = [
  {
    id: "basics",
    title: { en: "Basics", sw: "Misingi" },
    presets: [
      { file: "ohms.txt", title: "Ohm's Law" },
      { file: "resistors.txt", title: "Resistors" },
      { file: "cap.txt", title: "Capacitor" },
      { file: "induct.txt", title: "Inductor" },
      { file: "lrc.txt", title: "LRC Circuit" },
      { file: "lrc-critical.txt", title: "Critically Damped LRC" },
      { file: "voltdivide.txt", title: "Voltage Divider" },
      { file: "pot.txt", title: "Potentiometer" },
      { file: "thevenin.txt", title: "Thevenin's Theorem" },
      { file: "norton.txt", title: "Norton's Theorem" },
      { file: "wheatstone.txt", title: "Wheatstone Bridge" },
      { file: "3way.txt", title: "3-Way Light Switches" },
    ],
  },
  {
    id: "ac",
    title: { en: "A/C circuits", sw: "Sakiti za A/C" },
    presets: [
      { file: "capac.txt", title: "Capacitor (AC)" },
      { file: "inductac.txt", title: "Inductor (AC)" },
      { file: "res-series.txt", title: "Series Resonance" },
      { file: "res-par.txt", title: "Parallel Resonance" },
    ],
  },
  {
    id: "filters",
    title: { en: "Filters", sw: "Vichujio" },
    presets: [
      { file: "filt-hipass.txt", title: "High-Pass Filter (RC)" },
      { file: "filt-lopass.txt", title: "Low-Pass Filter (RC)" },
      { file: "bandpass.txt", title: "Band-pass Filter" },
      { file: "notch.txt", title: "Notch Filter" },
      { file: "crossover.txt", title: "Crossover" },
    ],
  },
  {
    id: "transformers",
    title: { en: "Transformers", sw: "Vibadilishi" },
    presets: [
      { file: "transformer.txt", title: "Transformer" },
      { file: "transformerup.txt", title: "Step-Up Transformer" },
      { file: "transformerdown.txt", title: "Step-Down Transformer" },
      { file: "longdist.txt", title: "Long-Distance Power Transmission" },
    ],
  },
  {
    id: "diodes",
    title: { en: "Diodes", sw: "Diodi" },
    presets: [
      { file: "rectify.txt", title: "Half-Wave Rectifier" },
      { file: "fullrect.txt", title: "Full-Wave Rectifier" },
      { file: "fullrectf.txt", title: "Full-Wave Rectifier w/ Filter" },
      { file: "zenerref.txt", title: "Zener Voltage Reference" },
      { file: "voltdouble.txt", title: "Voltage Doubler" },
    ],
  },
  {
    id: "amplifiers",
    title: { en: "Amplifiers", sw: "Vikuza sauti" },
    presets: [
      { file: "amp-invert.txt", title: "Inverting Amplifier" },
      { file: "amp-noninvert.txt", title: "Noninverting Amplifier" },
      { file: "amp-follower.txt", title: "Follower" },
      { file: "amp-sum.txt", title: "Summing Amplifier" },
    ],
  },
];

export const defaultPresetFile = "lrc.txt";

export function findPreset(file: string | null) {
  for (const group of circuitPresetGroups) {
    const preset = group.presets.find((item) => item.file === file);
    if (preset) return preset;
  }
  return undefined;
}
