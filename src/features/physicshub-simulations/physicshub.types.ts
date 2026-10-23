export type PhysicshubLevel =
  "elementary" | "lowerSecondary" | "upperSecondary" | "undergraduate";

export type PhysicshubDifficulty = "core" | "extended" | "advanced";

export type PhysicshubSimulation = {
  id: string;
  title: string;
  description: string;
  level: PhysicshubLevel;
  alsoFor: PhysicshubLevel[];
  difficulty: PhysicshubDifficulty;
  topics: string[];
  thumbnail: string;
};

export type PhysicshubFilters = {
  query: string;
  level: PhysicshubLevel | null;
  topic: string | null;
  difficulty: PhysicshubDifficulty | null;
};
