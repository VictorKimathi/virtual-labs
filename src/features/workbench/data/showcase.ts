import {
  Apple,
  AudioWaveform,
  Battery,
  Bone,
  Brain,
  Dna,
  Flame,
  HeartPulse,
  Microscope,
  Pipette,
  Rotate3d,
  ShieldCheck,
  Sprout,
  Sun,
  Thermometer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  allChemKinds,
  chemSectionOrder,
} from "../../chemistry-bench/data/kinds";
import { allBioKinds, bioSectionOrder } from "../../biology-bench/data/kinds";
import {
  AnatomyScene,
  BiologyScene,
  ChemistryScene,
  PhysicsScene,
} from "../components/LabScenes";
import { allKinds, sectionOrder } from "./kinds";

/** The four virtual labs, as shown on the lab cards and the landing page. */
export type ShowcaseLab = {
  id: string;
  to: string;
  name: [string, string];
  tagline: [string, string];
  topics: { icon: LucideIcon; label: [string, string] }[];
  detail: [string, string];
  Scene: ComponentType;
  sceneClass: string;
  accent: string;
  button: string;
  border: string;
};

export const showcaseLabs: ShowcaseLab[] = [
  {
    id: "physics",
    to: "/workbench/physics",
    name: ["Physics Lab", "Maabara ya Fizikia"],
    tagline: [
      "Build circuits. Bend light. Measure everything.",
      "Unda sakiti. Pinda mwanga. Pima kila kitu.",
    ],
    topics: [
      { icon: Zap, label: ["Circuits", "Sakiti"] },
      { icon: Sun, label: ["Light", "Mwanga"] },
      { icon: Thermometer, label: ["Heat", "Joto"] },
      { icon: AudioWaveform, label: ["Waves", "Mawimbi"] },
    ],
    detail: [
      `${allKinds.length} items · ${sectionOrder.length} sections`,
      `Vifaa ${allKinds.length} · sehemu ${sectionOrder.length}`,
    ],
    Scene: PhysicsScene,
    sceneClass:
      "from-blue-100 via-sky-50 to-indigo-100 dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950",
    accent:
      "bg-blue-50 text-subject-physics dark:bg-blue-950 dark:text-blue-300",
    button: "bg-subject-physics group-hover:bg-blue-700",
    border: "hover:border-subject-physics",
  },
  {
    id: "chemistry",
    to: "/workbench/chemistry",
    name: ["Chemistry Lab", "Maabara ya Kemia"],
    tagline: [
      "Mix, heat and titrate. Real reactions, real results.",
      "Changanya, pasha na titrati. Athari halisi, matokeo halisi.",
    ],
    topics: [
      { icon: Pipette, label: ["Titration", "Titrasheni"] },
      { icon: Battery, label: ["Electrolysis", "Elektrolisisi"] },
      { icon: Flame, label: ["Flame tests", "Majaribio ya mwali"] },
      { icon: ShieldCheck, label: ["Lab safety", "Usalama"] },
    ],
    detail: [
      `${allChemKinds.length} items · ${chemSectionOrder.length} sections`,
      `Vifaa ${allChemKinds.length} · sehemu ${chemSectionOrder.length}`,
    ],
    Scene: ChemistryScene,
    sceneClass:
      "from-orange-100 via-amber-50 to-rose-100 dark:from-orange-950 dark:via-slate-900 dark:to-rose-950",
    accent:
      "bg-orange-50 text-subject-chemistry dark:bg-orange-950 dark:text-orange-300",
    button: "bg-orange-700 group-hover:bg-orange-800",
    border: "hover:border-subject-chemistry",
  },
  {
    id: "biology",
    to: "/workbench/biology",
    name: ["Biology Lab", "Maabara ya Biolojia"],
    tagline: [
      "Focus a microscope. Test foods. Watch life grow.",
      "Lenga hadubini. Pima vyakula. Tazama uhai ukikua.",
    ],
    topics: [
      { icon: Microscope, label: ["Microscope", "Hadubini"] },
      { icon: Apple, label: ["Food tests", "Majaribio ya chakula"] },
      { icon: Sprout, label: ["Plants", "Mimea"] },
      { icon: Dna, label: ["Genetics", "Jenetiki"] },
    ],
    detail: [
      `${allBioKinds.length} items · ${bioSectionOrder.length} sections`,
      `Vifaa ${allBioKinds.length} · sehemu ${bioSectionOrder.length}`,
    ],
    Scene: BiologyScene,
    sceneClass:
      "from-green-100 via-emerald-50 to-lime-100 dark:from-green-950 dark:via-slate-900 dark:to-emerald-950",
    accent:
      "bg-green-50 text-subject-biology dark:bg-green-950 dark:text-green-300",
    button: "bg-green-700 group-hover:bg-green-800",
    border: "hover:border-subject-biology",
  },
  {
    id: "anatomy",
    to: "/biology/anatomy",
    name: ["Human Anatomy", "Anatomia ya Binadamu"],
    tagline: [
      "Explore the body in 3D, layer by layer.",
      "Chunguza mwili katika 3D, safu kwa safu.",
    ],
    topics: [
      { icon: HeartPulse, label: ["Organs", "Viungo"] },
      { icon: Bone, label: ["Skeleton", "Mifupa"] },
      { icon: Brain, label: ["Brain", "Ubongo"] },
      { icon: Rotate3d, label: ["3D views", "Mionekano ya 3D"] },
    ],
    detail: ["3D model · 464 structures", "Kielelezo cha 3D · miundo 464"],
    Scene: AnatomyScene,
    sceneClass:
      "from-rose-100 via-pink-50 to-red-100 dark:from-rose-950 dark:via-slate-900 dark:to-red-950",
    accent: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    button: "bg-rose-700 group-hover:bg-rose-800",
    border: "hover:border-rose-600",
  },
];
