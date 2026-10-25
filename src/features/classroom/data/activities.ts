import { chemExperiments } from "../../chemistry-bench/data/chemistry.experiments";
import { topics } from "../../workbench/data/topics";
import type { Activity } from "../classroom.types";

const physics = topics.find((topic) => topic.id === "physics");

/** Every lab experiment a teacher can assign, opened at its deep link. */
export const activities: Activity[] = [
  ...(physics?.experiments ?? []).map((experiment) => ({
    id: `physics:${experiment.id}`,
    lab: "physics" as const,
    title: experiment.title,
    summary: experiment.summary,
    path: `/workbench/physics?experiment=${experiment.id}`,
  })),
  ...chemExperiments.map((experiment) => ({
    id: `chemistry:${experiment.id}`,
    lab: "chemistry" as const,
    title: experiment.title,
    summary: experiment.summary,
    path: `/workbench/chemistry?experiment=${experiment.id}`,
  })),
];

export function findActivity(id: string | null) {
  return id === null
    ? undefined
    : activities.find((activity) => activity.id === id);
}
