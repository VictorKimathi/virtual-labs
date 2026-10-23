import type { Subject, SubjectId } from "./catalog.types";

export const subjects: Subject[] = [
  {
    id: "chemistry",
    name: "Chemistry",
    eyebrow: "MATTER & REACTIONS",
    icon: "flask",
    summary:
      "Explore substances, reactions, and the evidence behind chemical change.",
    lessons: [
      {
        slug: "acids-and-bases",
        title: "Acids & bases",
        summary:
          "Get oriented with pH, concentration, and indicators before experimenting.",
        duration: "5 min read",
        keyIdeas: [
          "The pH scale describes how acidic or basic a solution is.",
          "Concentration and strength are different properties.",
          "Indicators help reveal changes you cannot see directly.",
        ],
        labSlug: "acid-base-solutions",
      },
    ],
    labs: [
      {
        slug: "acid-base-solutions",
        title: "Acid–base solutions",
        topic: "Solutions",
        duration: "15–20 min",
        summary:
          "Compare common solutions and watch how concentration changes pH and conductivity.",
        question: "How does changing concentration affect pH and conductivity?",
        objectives: [
          "Compare acids and bases using the pH meter.",
          "Change concentration and observe the result.",
          "Record a claim supported by an observation.",
        ],
        provider: "PhET Interactive Simulations",
        providerUrl:
          "https://phet.colorado.edu/en/simulations/acid-base-solutions",
        embedUrl:
          "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html",
        attribution:
          "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu).",
      },
    ],
  },
  {
    id: "physics",
    name: "Physics",
    eyebrow: "FORCES & MOTION",
    icon: "atom",
    summary: "Test how forces, energy, and motion shape the world around us.",
    lessons: [
      {
        slug: "forces-and-motion",
        title: "Forces & motion",
        summary:
          "Build an intuition for balanced forces, friction, and acceleration.",
        duration: "5 min read",
        keyIdeas: [
          "Balanced forces do not change an object’s motion.",
          "An unbalanced net force changes motion.",
          "Friction acts against sliding motion.",
        ],
        labSlug: "forces-and-motion-basics",
      },
    ],
    labs: [
      {
        slug: "forces-and-motion-basics",
        title: "Forces and motion basics",
        topic: "Mechanics",
        duration: "15–20 min",
        summary:
          "Push, pull, and change friction to see how objects respond to forces.",
        question: "When does a push change an object’s motion?",
        objectives: [
          "Identify balanced and unbalanced forces.",
          "Compare motion with and without friction.",
          "Explain one result using net force.",
        ],
        provider: "PhET Interactive Simulations",
        providerUrl:
          "https://phet.colorado.edu/en/simulations/forces-and-motion-basics",
        embedUrl:
          "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html",
        attribution:
          "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu).",
      },
    ],
  },
  {
    id: "biology",
    name: "Biology",
    eyebrow: "LIFE & SYSTEMS",
    icon: "dna",
    summary:
      "Investigate living systems, adaptation, and the patterns of life.",
    lessons: [
      {
        slug: "natural-selection",
        title: "Natural selection",
        summary:
          "Learn how traits become more or less common across generations.",
        duration: "5 min read",
        keyIdeas: [
          "Individuals in a population vary.",
          "Inherited traits can affect survival and reproduction.",
          "Populations change over generations.",
        ],
        labSlug: "natural-selection",
      },
    ],
    labs: [
      {
        slug: "natural-selection",
        title: "Natural selection",
        topic: "Evolution",
        duration: "15–20 min",
        summary:
          "Change environmental conditions and observe how a rabbit population evolves.",
        question:
          "Which traits help a population survive when its environment changes?",
        objectives: [
          "Identify a trait and an environmental pressure.",
          "Observe how trait frequency changes over time.",
          "Explain the result using natural selection.",
        ],
        provider: "PhET Interactive Simulations",
        providerUrl:
          "https://phet.colorado.edu/en/simulations/natural-selection",
        embedUrl:
          "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html",
        attribution:
          "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu).",
      },
    ],
  },
];

export function getSubject(id: string | undefined): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}

export function isSubjectId(value: string): value is SubjectId {
  return subjects.some((subject) => subject.id === value);
}
