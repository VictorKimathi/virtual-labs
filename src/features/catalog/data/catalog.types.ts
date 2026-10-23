export type SubjectId = "physics" | "chemistry" | "biology" | "agriculture";
export type Level = "junior" | "senior";

export type Subject = {
  id: SubjectId;
  name: string;
  nameSw: string;
  icon: "atom" | "flask" | "dna" | "sprout";
  colorClass: string;
  lightClass: string;
};

export type Lab = {
  id: string;
  title: string;
  titleSw: string;
  subject: SubjectId;
  grade: number;
  strand: string;
  strandSw: string;
  duration: string;
  intro: string;
  introSw: string;
  available: boolean;
};
