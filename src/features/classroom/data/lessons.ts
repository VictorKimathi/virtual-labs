import type { Lesson } from "../classroom.types";

const t = (en: string, sw: string) => ({ en, sw });

/** Ready-made lesson plans. Every activity id must exist in `activities.ts`. */
export const lessons: Lesson[] = [
  {
    id: "measurement-skills",
    lab: "physics",
    title: t("Measuring precisely", "Kupima kwa usahihi"),
    aim: t(
      "Use vernier callipers, a micrometer and displacement to measure length and volume, and account for zero error.",
      "Tumia kalipa ya vernia, mikromita na uhamishaji kupima urefu na ujazo, ukizingatia kosa la sifuri.",
    ),
    grade: "Form 1",
    minutes: 80,
    activityIds: [
      "physics:vernier-diameter",
      "physics:micrometer-wire",
      "physics:volume-displacement",
    ],
  },
  {
    id: "forces-and-motion",
    lab: "physics",
    title: t("Forces and oscillation", "Nguvu na mtetemo"),
    aim: t(
      "Verify Hooke's law, find what sets a pendulum's period, and balance moments.",
      "Thibitisha sheria ya Hooke, tafuta kinachoamua muda wa pendulamu, na sawazisha momenti.",
    ),
    grade: "Form 2",
    minutes: 120,
    activityIds: [
      "physics:hookes-law",
      "physics:pendulum-period",
      "physics:moments",
    ],
  },
  {
    id: "circuits-starter",
    lab: "physics",
    title: t("First circuits", "Saketi za kwanza"),
    aim: t(
      "Build a working circuit, control it with a switch, and measure current and voltage correctly.",
      "Jenga saketi inayofanya kazi, idhibiti kwa swichi, na pima mkondo na volteji kwa usahihi.",
    ),
    grade: "Form 1",
    minutes: 80,
    activityIds: [
      "physics:light-a-bulb",
      "physics:switch-control",
      "physics:measure-current",
      "physics:measure-voltage",
    ],
  },
  {
    id: "ohms-law-investigation",
    lab: "physics",
    title: t("Ohm's law investigation", "Uchunguzi wa sheria ya Ohm"),
    aim: t(
      "Record current against voltage, then compare series and parallel arrangements.",
      "Rekodi mkondo dhidi ya volteji, kisha linganisha mpangilio wa mfululizo na sambamba.",
    ),
    grade: "Form 2",
    minutes: 80,
    activityIds: ["physics:ohms-law", "physics:series-parallel"],
  },
  {
    id: "light-and-waves",
    lab: "physics",
    title: t("Light and sound", "Mwanga na sauti"),
    aim: t(
      "Find a lens's focal length, trace refraction through a block, and measure the speed of sound.",
      "Tafuta urefu fokasi wa lenzi, fuatilia mnyumbuko kwenye bloku, na pima kasi ya sauti.",
    ),
    grade: "Form 3",
    minutes: 120,
    activityIds: [
      "physics:lens-focal-length",
      "physics:refraction-block",
      "physics:speed-of-sound",
    ],
  },
  {
    id: "acids-and-bases",
    lab: "chemistry",
    title: t("Acids, bases and titration", "Asidi, besi na titresheni"),
    aim: t(
      "Prepare a standard solution, titrate it against an acid, and confirm the end point with a pH meter.",
      "Andaa myeyusho sanifu, uutitresheni dhidi ya asidi, na thibitisha kituo cha mwisho kwa mita ya pH.",
    ),
    grade: "Form 3",
    minutes: 120,
    activityIds: [
      "chemistry:standard-solution",
      "chemistry:acid-base-titration",
      "chemistry:ph-meter",
    ],
  },
  {
    id: "separating-mixtures",
    lab: "chemistry",
    title: t("Separating mixtures", "Kutenganisha michanganyiko"),
    aim: t(
      "Choose and carry out filtration, distillation and chromatography for different mixtures.",
      "Chagua na tekeleza uchujaji, ukenekaji na kromatografia kwa michanganyiko tofauti.",
    ),
    grade: "Form 1",
    minutes: 80,
    activityIds: [
      "chemistry:filtration",
      "chemistry:distillation",
      "chemistry:chromatography",
    ],
  },
  {
    id: "metals-and-ions",
    lab: "chemistry",
    title: t("Metals and ions", "Metali na ayoni"),
    aim: t(
      "Rank metals by reactivity, observe displacement, and identify cations by precipitate and flame colour.",
      "Panga metali kwa utendaji, tazama uondoaji, na tambua kationi kwa mvuto na rangi ya mwali.",
    ),
    grade: "Form 2",
    minutes: 120,
    activityIds: [
      "chemistry:metal-reactivity",
      "chemistry:displacement",
      "chemistry:cation-tests",
      "chemistry:flame-tests",
    ],
  },
  {
    id: "energy-and-rates",
    lab: "chemistry",
    title: t("Rates and energy changes", "Kasi na mabadiliko ya nishati"),
    aim: t(
      "Follow a reaction's rate with a gas syringe and measure the heat of neutralisation.",
      "Fuatilia kasi ya mmenyuko kwa sirinji ya gesi na pima joto la uneutralishaji.",
    ),
    grade: "Form 4",
    minutes: 80,
    activityIds: [
      "chemistry:rate-gas-syringe",
      "chemistry:heat-of-neutralisation",
    ],
  },
];
