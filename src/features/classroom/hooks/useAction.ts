import { useCallback, useState } from "react";
import {
  logError,
  toAppError,
  type AppError,
} from "../../../shared/errors/appError";

export type ActionState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "done" }
  | { status: "error"; error: AppError };

/** Tracks one write at a time; `run` resolves to whether it succeeded. */
export function useAction(context: string) {
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const run = useCallback(
    async (work: () => Promise<unknown>) => {
      setState({ status: "pending" });
      try {
        await work();
        setState({ status: "done" });
        return true;
      } catch (error) {
        logError(context, error);
        setState({ status: "error", error: toAppError(error) });
        return false;
      }
    },
    [context],
  );
  const reset = useCallback(() => setState({ status: "idle" }), []);
  return { state, run, reset, pending: state.status === "pending" };
}
