import type {
  FalstadCategory,
  FalstadSimulator,
  LocalizedText,
} from "../falstad.types";

export const categories: { id: FalstadCategory; title: LocalizedText }[] = [
  { id: "circuits", title: { en: "Circuits", sw: "Mizunguko" } },
  { id: "waves", title: { en: "Waves", sw: "Mawimbi" } },
  { id: "fields", title: { en: "Fields", sw: "Nyanja" } },
];

export const simulators: FalstadSimulator[] = [
  {
    id: "circuit",
    title: { en: "Circuit simulator", sw: "Kiigaji cha sakiti" },
    summary: {
      en: "Build and test analogue circuits. Watch voltage in colour and current as moving dots.",
      sw: "Unda na ujaribu sakiti. Tazama volteji kwa rangi na mkondo kama nukta zinazosogea.",
    },
    category: "circuits",
    path: "/circuit/circuitjs.html",
    hasPresets: true,
  },
  {
    id: "ripple",
    title: { en: "Ripple tank", sw: "Tangi la mawimbi" },
    summary: {
      en: "Explore wave motion, interference, diffraction and refraction in a 2-D ripple tank.",
      sw: "Chunguza mwendo wa mawimbi, uingiliano, mtawanyiko na kuvunjika katika tangi la mawimbi.",
    },
    category: "waves",
    path: "/ripple/Ripple.html",
    hasPresets: false,
  },
  {
    id: "wave2d",
    title: { en: "2-D wave diffraction", sw: "Mtawanyiko wa mawimbi" },
    summary: {
      en: "See how waves bend around obstacles and spread through openings.",
      sw: "Ona jinsi mawimbi yanavyopinda kuzunguka vizuizi na kusambaa kupitia matundu.",
    },
    category: "waves",
    path: "/wave2d/",
    hasPresets: false,
  },
  {
    id: "fourier",
    title: { en: "Fourier series", sw: "Mfululizo wa Fourier" },
    summary: {
      en: "Build square, triangle and sawtooth waves by adding sine waves together.",
      sw: "Unda mawimbi ya mraba, pembetatu na msumeno kwa kujumlisha mawimbi ya sine.",
    },
    category: "waves",
    path: "/fourier/Fourier.html",
    hasPresets: false,
  },
  {
    id: "electrostatics",
    title: { en: "Electrostatic fields", sw: "Nyanja za umeme tuli" },
    summary: {
      en: "Place charges and conductors and see the electric field and potential around them.",
      sw: "Weka chaji na vikondakta uone nyanja ya umeme na uwezo unaozizunguka.",
    },
    category: "fields",
    path: "/vector2de/vector2de.html",
    hasPresets: false,
  },
];

export const defaultSimulatorId = "circuit";
