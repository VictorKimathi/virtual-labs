import { physicshubSimulations } from "./data/physicshubSimulations";
import type {
  PhysicshubFilters,
  PhysicshubSimulation,
} from "./physicshub.types";

export const physicshubTopics = [
  ...new Set(physicshubSimulations.flatMap((simulation) => simulation.topics)),
].sort((a, b) => a.localeCompare(b));

export function findPhysicshubSimulation(id: string | undefined) {
  return physicshubSimulations.find((simulation) => simulation.id === id);
}

export function filterPhysicshubSimulations(
  filters: PhysicshubFilters,
): PhysicshubSimulation[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  return physicshubSimulations.filter((simulation) => {
    if (
      filters.level &&
      simulation.level !== filters.level &&
      !simulation.alsoFor.includes(filters.level)
    ) {
      return false;
    }
    if (filters.topic && !simulation.topics.includes(filters.topic)) {
      return false;
    }
    if (filters.difficulty && simulation.difficulty !== filters.difficulty) {
      return false;
    }
    if (terms.length === 0) return true;
    const haystack =
      `${simulation.title} ${simulation.description} ${simulation.topics.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
