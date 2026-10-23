import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { defaultPresetFile, findPreset } from "../data/circuitPresets";
import { defaultSimulatorId, simulators } from "../data/simulators";

export function useFalstadSelection() {
  const [searchParams, setSearchParams] = useSearchParams();

  const simulator = useMemo(
    () =>
      simulators.find((item) => item.id === searchParams.get("sim")) ??
      simulators.find((item) => item.id === defaultSimulatorId) ??
      simulators[0],
    [searchParams],
  );
  const preset = useMemo(
    () =>
      findPreset(searchParams.get("circuit")) ?? findPreset(defaultPresetFile),
    [searchParams],
  );

  const selectSimulator = useCallback(
    (id: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("sim", id);
        return next;
      });
    },
    [setSearchParams],
  );
  const selectPreset = useCallback(
    (file: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("circuit", file);
        return next;
      });
    },
    [setSearchParams],
  );

  return { simulator, preset, selectSimulator, selectPreset };
}
