import { allKinds } from "./kinds";
import type { Topic } from "../workbench.types";
import { electricityExperiments } from "./electricity.experiments";
import { physicsExperiments } from "./physics.experiments";

export const topics: Topic[] = [
  {
    id: "physics",
    name: { en: "Physics Lab", sw: "Maabara ya Fizikia" },
    summary: {
      en: "A full physics practical bench: measurement, mechanics, fluids, heat, light, waves, electricity, magnetism and modern physics.",
      sw: "Benchi kamili la mazoezi ya fizikia: vipimo, mekanika, vimiminika, joto, mwanga, mawimbi, umeme, sumaku na fizikia ya kisasa.",
    },
    equipment: allKinds,
    experiments: [...physicsExperiments, ...electricityExperiments],
  },
];

export function findTopic(id: string | undefined) {
  return topics.find((topic) => topic.id === id);
}
