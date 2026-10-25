import { useSyncExternalStore } from "react";
import type { ChemPart } from "../chemistry.types";
import { CLOCK_SPEED } from "../engine/contents";

const TICK_MS = 100;
/** A reaction gives off gas until about six time constants have passed. */
const GAS_LIFETIMES = 6;

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

function isActive(part: ChemPart, now: number) {
  if (part.params.running === 1) return true;
  return part.contents.gas.some(
    (event) =>
      ((now - event.at) / 1000) * CLOCK_SPEED * event.rate < GAS_LIFETIMES,
  );
}

/**
 * A millisecond clock for gas given off, timers, electrolysis and the melting
 * point block. It only ticks while something on the bench is changing.
 */
export function useChemClock(parts: ChemPart[]) {
  const active = parts.some((part) => isActive(part, clock.value));
  return useSyncExternalStore(
    active ? subscribeTicking : subscribeIdle,
    () => clock.value,
  );
}

/** The time to stamp on an action. */
export const benchNow = () => Date.now();
