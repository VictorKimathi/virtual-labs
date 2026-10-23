import type { Topic } from "../workbench.types";
import { electricityExperiments } from "./electricity.experiments";

export const topics: Topic[] = [
  {
    id: "electricity",
    name: { en: "Electricity", sw: "Umeme" },
    summary: {
      en: "Build circuits with cells, switches, bulbs, resistors and meters.",
      sw: "Unda sakiti kwa seli, swichi, balbu, vikinzani na mita.",
    },
    equipment: [
      "cell",
      "battery",
      "power-supply",
      "switch",
      "ammeter",
      "voltmeter",
      "bulb",
      "resistor",
    ],
    experiments: electricityExperiments,
  },
  {
    id: "magnetism",
    name: { en: "Magnetism", sw: "Sumaku" },
    summary: {
      en: "Magnets, compasses and electromagnets.",
      sw: "Sumaku, dira na sumaku-umeme.",
    },
    equipment: [],
    experiments: [],
  },
  {
    id: "light",
    name: { en: "Light", sw: "Mwanga" },
    summary: {
      en: "Mirrors, lenses, and how light reflects and refracts.",
      sw: "Vioo, lenzi, na jinsi mwanga unavyoakisi na kupinda.",
    },
    equipment: [],
    experiments: [],
  },
];

export function findTopic(id: string | undefined) {
  return topics.find((topic) => topic.id === id);
}
