import { useEffect, useState } from "react";
import { logError, type AppError } from "../../../shared/errors/appError";
import type { OnData, OnError, Unsubscribe } from "../classroom.api";

export type Remote<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: AppError };

export type Subscribe<T> = (onData: OnData<T>, onError: OnError) => Unsubscribe;

const LOADING = { status: "loading" } as const;

/** Follows a live query. Pass a memoised `subscribe`; null waits without loading anything. */
export function useLiveData<T>(
  subscribe: Subscribe<T> | null,
  context: string,
): Remote<T> {
  const [state, setState] = useState<{
    source: Subscribe<T>;
    value: Remote<T>;
  } | null>(null);
  useEffect(() => {
    if (!subscribe) return;
    return subscribe(
      (data) =>
        setState({ source: subscribe, value: { status: "ready", data } }),
      (error) => {
        logError(context, error);
        setState({ source: subscribe, value: { status: "error", error } });
      },
    );
  }, [subscribe, context]);
  return state && state.source === subscribe ? state.value : LOADING;
}
