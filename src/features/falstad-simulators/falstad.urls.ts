import { FALSTAD_ORIGIN } from "./falstad.config";
import type { CircuitPreset, FalstadSimulator } from "./falstad.types";

export function buildSimulatorUrl(
  simulator: FalstadSimulator,
  preset: CircuitPreset | undefined,
) {
  const url = new URL(simulator.path, FALSTAD_ORIGIN);
  if (simulator.hasPresets && preset) {
    url.searchParams.set("startCircuit", preset.file);
  }
  return url.href;
}
