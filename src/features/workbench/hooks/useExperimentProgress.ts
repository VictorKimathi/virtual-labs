import { useState } from "react";

type Checkable<Context> = {
  goals: { id: string; check: (context: Context) => boolean }[];
};

/** Goals stay ticked once met, until the experiment or attempt changes. */
export function useExperimentProgress<Context>(
  experiment: Checkable<Context> | undefined,
  context: Context,
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
