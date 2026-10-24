import { useSyncExternalStore } from "react";
import type { PlacedPart } from "../workbench.types";

const TICK_MS = 50;
/** How long a timed run keeps the clock ticking after it was started. */
const RUN_MS = 15000;

const clock = { value: Date.now() };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  clock.value = Date.now();
  for (const listener of listeners) listener();
}

function subscribeTicking(listener: () => void) {
  listeners.add(listener);
  clock.value = Date.now();
  timer ??= setInterval(tick, TICK_MS);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function subscribeIdle() {
  return () => undefined;
}

/**
 * A millisecond clock for the stopwatch and for released trolleys. It only
 * ticks while something on the bench is running.
 */
export function useBenchClock(parts: PlacedPart[]) {
  const active = parts.some(
    (part) =>
      part.params.running === 1 ||
      (part.params.releasedAt > 0 &&
        clock.value - part.params.releasedAt < RUN_MS),
  );
  return useSyncExternalStore(
    active ? subscribeTicking : subscribeIdle,
    () => clock.value,
  );
}
