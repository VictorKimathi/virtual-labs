import { useEffect, type Dispatch } from "react";
import { speeds } from "../engine/time";

const TICK_MS = 250;

/** Moves bench time forward while the clock is running, at the chosen speed. */
export function useBioClock(
  running: boolean,
  speed: number,
  dispatch: Dispatch<{ type: "tick"; seconds: number }>,
) {
  useEffect(() => {
    if (!running) return;
    const rate = speeds[speed] ?? 1;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      dispatch({ type: "tick", seconds: ((now - last) / 1000) * rate });
      last = now;
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [running, speed, dispatch]);
}
