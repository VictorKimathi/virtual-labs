import { useCallback, useEffect, useState } from "react";
import {
  logError,
  toAppError,
  type AppError,
} from "../../../shared/errors/appError";
import {
  clearCachedCatalog,
  fetchPhetCatalog,
  readCachedCatalog,
} from "../phet.api";
import type { PhetCatalog } from "../phet.types";

export type PhetCatalogState =
  | { status: "loading" }
  | { status: "success"; catalog: PhetCatalog }
  | { status: "error"; error: AppError };

function initialState(): PhetCatalogState {
  const catalog = readCachedCatalog();
  return catalog ? { status: "success", catalog } : { status: "loading" };
}

export function usePhetCatalog() {
  const [state, setState] = useState<PhetCatalogState>(initialState);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (readCachedCatalog()) return;
    const controller = new AbortController();
    fetchPhetCatalog().then(
      (catalog) => setState({ status: "success", catalog }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        logError("phet-catalog", error);
        setState({ status: "error", error: toAppError(error) });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    clearCachedCatalog();
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  return { state, retry };
}
