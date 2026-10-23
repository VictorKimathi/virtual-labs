import { AppError, logError, toAppError } from "../../shared/errors/appError";
import { PHET_CATALOG_URL } from "./phet.config";
import { parsePhetCatalog } from "./phet.schema";
import type { PhetCatalog } from "./phet.types";

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1500;
const ATTEMPT_TIMEOUT_MS = 10000;

let cachedCatalog: PhetCatalog | null = null;

export function readCachedCatalog() {
  return cachedCatalog;
}

export function clearCachedCatalog() {
  cachedCatalog = null;
}

async function loadSnapshot(): Promise<PhetCatalog> {
  const { default: snapshot } = await import("./data/phetSnapshot.json");
  return parsePhetCatalog(snapshot, "snapshot");
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

async function requestCatalog(signal: AbortSignal): Promise<PhetCatalog> {
  const response = await fetch(PHET_CATALOG_URL, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)]),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new AppError("server", `PhET catalog responded ${response.status}`);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new AppError("invalid-data", "PhET catalog is not valid JSON", {
      cause,
    });
  }
  return parsePhetCatalog(body, "live");
}

export async function fetchPhetCatalog(
  signal: AbortSignal,
): Promise<PhetCatalog> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      cachedCatalog = await requestCatalog(signal);
      return cachedCatalog;
    } catch (error) {
      if (signal.aborted) throw error;
      const appError = toAppError(error);
      if (!appError.retryable) throw appError;
      if (attempt >= MAX_ATTEMPTS) {
        logError("phet-catalog", appError);
        cachedCatalog = await loadSnapshot();
        return cachedCatalog;
      }
      await wait(RETRY_DELAY_MS * attempt, signal);
    }
  }
}
