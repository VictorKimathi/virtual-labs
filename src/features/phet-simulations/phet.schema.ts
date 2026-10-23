import { AppError } from "../../shared/errors/appError";
import { PHET_ORIGIN } from "./phet.config";
import type { PhetCatalog, PhetCategory, PhetSimulation } from "./phet.types";

type RawRecord = Record<string, unknown>;

const SIM_NAME_PATTERN = /^[\w-]+$/;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: RawRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(record: RawRecord, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readNumbers(record: RawRecord, key: string): number[] {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number")
    : [];
}

function resolvePhetUrl(path: string): string | null {
  try {
    const url = new URL(path, PHET_ORIGIN);
    return url.origin === new URL(PHET_ORIGIN).origin ? url.href : null;
  } catch {
    return null;
  }
}

function readEnglish(strings: unknown): string | null {
  if (isRecord(strings)) return readString(strings, "en");
  if (Array.isArray(strings)) {
    for (const item of strings) {
      if (isRecord(item) && readString(item, "en"))
        return readString(item, "en");
    }
  }
  return null;
}

function parseCategories(raw: unknown): {
  categories: PhetCategory[];
  simulationIdsByCategory: Map<number, number[]>;
} {
  if (!isRecord(raw)) {
    throw new AppError("invalid-data", "PhET categories are missing");
  }
  const categories: PhetCategory[] = [];
  const simulationIdsByCategory = new Map<number, number[]>();
  for (const value of Object.values(raw)) {
    if (!isRecord(value)) continue;
    const id = readNumber(value, "id");
    const slug = readString(value, "name");
    if (id === null || slug === null) continue;
    categories.push({
      id,
      slug,
      label: readEnglish(value.strings) ?? slug,
      parentId: readNumber(value, "parent"),
    });
    simulationIdsByCategory.set(id, readNumbers(value, "simulationIds"));
  }
  return { categories, simulationIdsByCategory };
}

function parseKeywords(raw: unknown): Map<number, string> {
  const keywords = new Map<number, string>();
  if (!isRecord(raw)) return keywords;
  for (const value of Object.values(raw)) {
    if (!isRecord(value)) continue;
    const id = readNumber(value, "id");
    const label = readEnglish(value.strings);
    if (id !== null && label !== null) keywords.set(id, label);
  }
  return keywords;
}

function buildCategoryIndex(
  categories: PhetCategory[],
  simulationIdsByCategory: Map<number, number[]>,
): Map<number, Set<number>> {
  const parentById = new Map(
    categories.map((category) => [category.id, category.parentId]),
  );
  const categoryIdsBySimulation = new Map<number, Set<number>>();
  for (const [categoryId, simulationIds] of simulationIdsByCategory) {
    for (const simulationId of simulationIds) {
      const ids = categoryIdsBySimulation.get(simulationId) ?? new Set();
      let current: number | null | undefined = categoryId;
      while (current !== null && current !== undefined && !ids.has(current)) {
        ids.add(current);
        current = parentById.get(current);
      }
      categoryIdsBySimulation.set(simulationId, ids);
    }
  }
  return categoryIdsBySimulation;
}

function parseSimulation(
  raw: unknown,
  categoryIdsBySimulation: Map<number, Set<number>>,
  keywordLabels: Map<number, string>,
): PhetSimulation | null {
  if (!isRecord(raw)) return null;
  const id = readNumber(raw, "id");
  const name = readString(raw, "name");
  const localized = isRecord(raw.localizedSimulations)
    ? raw.localizedSimulations.en
    : null;
  if (id === null || name === null || !isRecord(localized)) return null;
  if (!SIM_NAME_PATTERN.test(name)) return null;

  const title = readString(localized, "title");
  const runPath = readString(localized, "runUrl");
  const pagePath = readString(localized, "simPageUrl");
  if (title === null || runPath === null || pagePath === null) return null;
  const runUrl = resolvePhetUrl(runPath);
  const pageUrl = resolvePhetUrl(pagePath);
  if (runUrl === null || pageUrl === null) return null;

  return {
    id,
    name,
    title,
    description: readString(localized, "description") ?? "",
    runUrl,
    pageUrl,
    thumbnailUrl: `${PHET_ORIGIN}/sims/html/${name}/latest/${name}-600.png`,
    categoryIds: [...(categoryIdsBySimulation.get(id) ?? [])],
    keywords: readNumbers(raw, "keywordIds").flatMap((keywordId) => {
      const label = keywordLabels.get(keywordId);
      return label ? [label] : [];
    }),
    isNew: (readNumber(raw, "isNew") ?? 0) > 0,
    createdAt: readNumber(raw, "createTime") ?? 0,
  };
}

export function parsePhetCatalog(
  raw: unknown,
  source: PhetCatalog["source"],
): PhetCatalog {
  if (!isRecord(raw) || !Array.isArray(raw.projects)) {
    throw new AppError("invalid-data", "PhET catalog has no projects");
  }
  const { categories, simulationIdsByCategory } = parseCategories(
    raw.categories,
  );
  const categoryIdsBySimulation = buildCategoryIndex(
    categories,
    simulationIdsByCategory,
  );
  const keywordLabels = parseKeywords(raw.keywords);

  const simulations: PhetSimulation[] = [];
  for (const project of raw.projects) {
    if (!isRecord(project) || !Array.isArray(project.simulations)) continue;
    for (const item of project.simulations) {
      const simulation = parseSimulation(
        item,
        categoryIdsBySimulation,
        keywordLabels,
      );
      if (simulation) simulations.push(simulation);
    }
  }
  if (raw.projects.length > 0 && simulations.length === 0) {
    throw new AppError(
      "invalid-data",
      "PhET catalog has no usable simulations",
    );
  }
  return { source, simulations, categories };
}
