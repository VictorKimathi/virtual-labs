import type { Lab, Level, Subject, SubjectId } from "./catalog.types";

export const subjects: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    nameSw: "Fizikia",
    icon: "atom",
    colorClass: "text-subject-physics",
    lightClass: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameSw: "Kemia",
    icon: "flask",
    colorClass: "text-subject-chemistry",
    lightClass: "bg-orange-50 dark:bg-orange-950",
  },
  {
    id: "biology",
    name: "Biology",
    nameSw: "Biolojia",
    icon: "dna",
    colorClass: "text-subject-biology",
    lightClass: "bg-green-50 dark:bg-green-950",
  },
  {
    id: "agriculture",
    name: "Agriculture",
    nameSw: "Kilimo",
    icon: "sprout",
    colorClass: "text-subject-agriculture",
    lightClass: "bg-yellow-50 dark:bg-yellow-950",
  },
];

export const labs: Lab[] = [
  {
    id: "ohms-law",
    title: "Ohm's Law",
    titleSw: "Sheria ya Ohm",
    subject: "physics",
    grade: 10,
    strand: "Electricity",
    strandSw: "Umeme",
    duration: "25 min",
    intro:
      "Build a simple circuit and investigate how voltage, current and resistance are connected.",
    introSw:
      "Unda sakiti rahisi na uchunguze uhusiano wa volteji, mkondo na ukinzani.",
    available: true,
  },
  {
    id: "forces-motion",
    title: "Forces & Motion",
    titleSw: "Nguvu na Mwendo",
    subject: "physics",
    grade: 8,
    strand: "Motion",
    strandSw: "Mwendo",
    duration: "20 min",
    intro: "Explore how a push or pull changes an object’s motion.",
    introSw: "Chunguza jinsi msukumo au mvuto hubadilisha mwendo wa kitu.",
    available: false,
  },
  {
    id: "acids-bases",
    title: "Acids & Bases",
    titleSw: "Asidi na Besi",
    subject: "chemistry",
    grade: 9,
    strand: "Matter",
    strandSw: "Maada",
    duration: "20 min",
    intro: "Compare solutions using indicators and the pH scale.",
    introSw: "Linganisha miyeyusho kwa kutumia viashiria na kipimo cha pH.",
    available: false,
  },
  {
    id: "separation",
    title: "Separating Mixtures",
    titleSw: "Kutenganisha Michanganyiko",
    subject: "chemistry",
    grade: 10,
    strand: "Mixtures",
    strandSw: "Michanganyiko",
    duration: "20 min",
    intro: "Choose methods to separate materials based on their properties.",
    introSw: "Chagua mbinu za kutenganisha vitu kulingana na sifa zake.",
    available: false,
  },
  {
    id: "plant-cells",
    title: "Plant Cells",
    titleSw: "Seli za Mimea",
    subject: "biology",
    grade: 7,
    strand: "Cells",
    strandSw: "Seli",
    duration: "15 min",
    intro: "Identify the main structures of a plant cell.",
    introSw: "Tambua sehemu kuu za seli ya mmea.",
    available: true,
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis",
    titleSw: "Usanisinuru",
    subject: "biology",
    grade: 10,
    strand: "Nutrition",
    strandSw: "Lishe",
    duration: "20 min",
    intro: "Explore the conditions plants need to make food.",
    introSw: "Chunguza hali ambazo mimea huhitaji kutengeneza chakula.",
    available: false,
  },
  {
    id: "soil-testing",
    title: "Soil Testing",
    titleSw: "Upimaji wa Udongo",
    subject: "agriculture",
    grade: 8,
    strand: "Soils",
    strandSw: "Udongo",
    duration: "20 min",
    intro: "Compare soil samples and the conditions they support.",
    introSw: "Linganisha sampuli za udongo na hali zinazosaidia mimea.",
    available: false,
  },
  {
    id: "seed-germination",
    title: "Seed Germination",
    titleSw: "Uotaji wa Mbegu",
    subject: "agriculture",
    grade: 10,
    strand: "Crop Production",
    strandSw: "Uzalishaji wa Mazao",
    duration: "20 min",
    intro: "Observe what a seed needs to germinate.",
    introSw: "Chunguza mahitaji ya mbegu ili iote.",
    available: false,
  },
];

export function getSubject(id: SubjectId) {
  return subjects.find((subject) => subject.id === id);
}
export function getLab(id: string | undefined) {
  return labs.find((lab) => lab.id === id);
}
export function getLabLevel(lab: Lab): Level {
  return lab.grade <= 9 ? "junior" : "senior";
}
