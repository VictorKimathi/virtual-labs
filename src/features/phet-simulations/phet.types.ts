export type PhetCategory = {
  id: number;
  slug: string;
  label: string;
  parentId: number | null;
};

export type PhetSimulation = {
  id: number;
  name: string;
  title: string;
  description: string;
  runUrl: string;
  pageUrl: string;
  thumbnailUrl: string;
  categoryIds: number[];
  keywords: string[];
  isNew: boolean;
  createdAt: number;
};

export type PhetCatalog = {
  source: "live" | "snapshot";
  simulations: PhetSimulation[];
  categories: PhetCategory[];
};

export type PhetSort = "title" | "newest";

export type PhetFilters = {
  query: string;
  subject: string | null;
  topic: string | null;
  level: string | null;
  sort: PhetSort;
};

export type PhetFilterOption = {
  id: number;
  slug: string;
  label: string;
  count: number;
};

export type PhetFilterOptions = {
  subjects: PhetFilterOption[];
  levels: PhetFilterOption[];
  topicsBySubject: Map<string, PhetFilterOption[]>;
};
