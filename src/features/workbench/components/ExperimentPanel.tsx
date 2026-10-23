import { CircleCheck, Circle, PartyPopper, Wrench } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import type { Experiment } from "../workbench.types";

type ExperimentPanelProps = {
  experiment: Experiment | undefined;
  achieved: string[];
};

export function ExperimentPanel({
  experiment,
  achieved,
}: ExperimentPanelProps) {
  const { language, tr } = useLanguage();

  if (!experiment)
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <Wrench className="h-4 w-4" />
          {tr("Free build", "Unda huru")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {tr(
            "Build any circuit you like. Choose an experiment above for steps and goals.",
            "Unda sakiti yoyote. Chagua jaribio hapo juu kupata hatua na malengo.",
          )}
        </p>
      </section>
    );

  const complete = achieved.length === experiment.goals.length;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {tr("Experiment", "Jaribio")}
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold dark:bg-slate-800">
          {achieved.length}/{experiment.goals.length}
        </span>
      </div>
      <p className="mt-2 text-lg font-bold">{experiment.title[language]}</p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {experiment.steps.map((step) => (
          <li key={step.en}>{step[language]}</li>
        ))}
      </ol>
      <h3 className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {tr("Goals", "Malengo")}
      </h3>
      <ul className="mt-2 space-y-2">
        {experiment.goals.map((goal) => {
          const done = achieved.includes(goal.id);
          return (
            <li key={goal.id} className="flex items-start gap-2 text-sm">
              {done ? (
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              )}
              <span
                className={
                  done
                    ? "text-slate-500 line-through dark:text-slate-400"
                    : "font-semibold"
                }
              >
                {goal.label[language]}
                <span className="sr-only">
                  {done ? tr(" (done)", " (imekamilika)") : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {complete && (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800 dark:bg-green-950 dark:text-green-300"
        >
          <PartyPopper className="h-4 w-4 shrink-0" />
          {tr(
            "Experiment complete. Well done!",
            "Jaribio limekamilika. Hongera!",
          )}
        </p>
      )}
    </section>
  );
}
