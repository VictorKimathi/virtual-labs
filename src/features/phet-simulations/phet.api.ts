import { parsePhetCatalog } from "./phet.schema";
import type { PhetCatalog } from "./phet.types";

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

export async function fetchPhetCatalog(): Promise<PhetCatalog> {
  cachedCatalog ??= await loadSnapshot();
  return cachedCatalog;
}
