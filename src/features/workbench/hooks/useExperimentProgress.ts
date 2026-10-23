import { useState } from "react";
import type { Experiment, GoalContext } from "../workbench.types";

/** Goals stay ticked once met, until the experiment or attempt changes. */
export function useExperimentProgress(
  experiment: Experiment | undefined,
  context: GoalContext,
  attempt: string,
) {
  const [progress, setProgress] = useState({
    attempt,
    achieved: [] as string[],
  });
  const previous = progress.attempt === attempt ? progress.achieved : [];
  const achieved = (experiment?.goals ?? [])
    .filter((goal) => previous.includes(goal.id) || goal.check(context))
    .map((goal) => goal.id);
  if (progress.attempt !== attempt || achieved.length !== previous.length)
    setProgress({ attempt, achieved });
  return achieved;
}
