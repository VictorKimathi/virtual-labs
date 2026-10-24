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
  // Agriculture is currently hidden until its lab content is ready.
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
    intro:
      "Test everyday liquids with indicators and place them on the pH scale.",
    introSw:
      "Jaribu vimiminika vya kila siku kwa viashiria na uviweke kwenye kipimo cha pH.",
    available: true,
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
    intro:
      "Choose the right methods to recover iron, sand and salt from one mixture.",
    introSw:
      "Chagua mbinu sahihi za kupata chuma, mchanga na chumvi kutoka mchanganyiko mmoja.",
    available: true,
  },
  {
    id: "titration",
    title: "Acid–Base Titration",
    titleSw: "Titreshini ya Asidi na Besi",
    subject: "chemistry",
    grade: 11,
    strand: "Acids, Bases and Salts",
    strandSw: "Asidi, Besi na Chumvi",
    duration: "25 min",
    intro:
      "Neutralise an unknown alkali with acid and calculate its concentration.",
    introSw: "Tengua alkali isiyojulikana kwa asidi kisha ukokotoe uzito wake.",
    available: true,
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
  // Agriculture labs are currently hidden until their content is ready.
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
