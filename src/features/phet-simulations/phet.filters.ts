import type {
  PhetCatalog,
  PhetCategory,
  PhetFilterOption,
  PhetFilterOptions,
  PhetFilters,
  PhetSimulation,
} from "./phet.types";

const NON_SUBJECT_SLUGS = new Set(["by-level", "by-device", "html"]);

function toOptions(
  categories: PhetCategory[],
  simulations: PhetSimulation[],
  compare: (a: PhetFilterOption, b: PhetFilterOption) => number,
): PhetFilterOption[] {
  return categories
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      label: category.label,
      count: simulations.filter((simulation) =>
        simulation.categoryIds.includes(category.id),
      ).length,
    }))
    .filter((option) => option.count > 0)
    .sort(compare);
}

const byId = (a: PhetFilterOption, b: PhetFilterOption) => a.id - b.id;
const byLabel = (a: PhetFilterOption, b: PhetFilterOption) =>
  a.label.localeCompare(b.label);

export function buildFilterOptions({
  simulations,
  categories,
}: PhetCatalog): PhetFilterOptions {
  const childrenOf = (parentId: number) =>
    categories.filter((category) => category.parentId === parentId);
  const root = categories.find((category) => category.parentId === null);
  const levelRoot = categories.find((category) => category.slug === "by-level");

  const subjectCategories = root
    ? childrenOf(root.id).filter(
        (category) => !NON_SUBJECT_SLUGS.has(category.slug),
      )
    : [];
  const subjects = toOptions(subjectCategories, simulations, byId);
  const levels = levelRoot
    ? toOptions(childrenOf(levelRoot.id), simulations, byId)
    : [];

  const topicsBySubject = new Map<string, PhetFilterOption[]>();
  for (const subject of subjects) {
    const topics = toOptions(childrenOf(subject.id), simulations, byLabel);
    if (topics.length > 0) topicsBySubject.set(subject.slug, topics);
  }
  return { subjects, levels, topicsBySubject };
}

export function filterSimulations(
  simulations: PhetSimulation[],
  options: PhetFilterOptions,
  filters: PhetFilters,
): PhetSimulation[] {
  const subject = options.subjects.find(
    (item) => item.slug === filters.subject,
  );
  const topic = subject
    ? options.topicsBySubject
        .get(subject.slug)
        ?.find((item) => item.slug === filters.topic)
    : undefined;
  const level = options.levels.find((item) => item.slug === filters.level);
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);

  const matches = simulations.filter((simulation) => {
    if (subject && !simulation.categoryIds.includes(subject.id)) return false;
    if (topic && !simulation.categoryIds.includes(topic.id)) return false;
    if (level && !simulation.categoryIds.includes(level.id)) return false;
    if (terms.length === 0) return true;
    const haystack =
      `${simulation.title} ${simulation.description} ${simulation.keywords.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  return matches.sort((a, b) =>
    filters.sort === "newest"
      ? b.createdAt - a.createdAt
      : a.title.localeCompare(b.title),
  );
}
