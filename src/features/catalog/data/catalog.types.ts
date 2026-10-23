export type SubjectId = "chemistry" | "physics" | "biology";

export type Lab = {
  slug: string;
  title: string;
  topic: string;
  duration: string;
  summary: string;
  question: string;
  objectives: string[];
  provider: string;
  providerUrl: string;
  embedUrl: string;
  attribution: string;
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  duration: string;
  keyIdeas: string[];
  labSlug: string;
};

export type Subject = {
  id: SubjectId;
  name: string;
  eyebrow: string;
  summary: string;
  icon: "flask" | "atom" | "dna";
  lessons: Lesson[];
  labs: Lab[];
};
