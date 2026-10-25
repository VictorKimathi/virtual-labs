import { CircleCheck, Circle, PartyPopper, Wrench } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import type { LocalizedText } from "../workbench.types";

/** What the panel needs from an experiment on any bench. */
export type ExperimentSummary = {
  id: string;
  section: string;
  title: LocalizedText;
  summary: LocalizedText;
  steps: LocalizedText[];
  goals: { id: string; label: LocalizedText }[];
};

type ExperimentPanelProps = {
  experiments: ExperimentSummary[];
  experiment: ExperimentSummary | undefined;
  /** The sections to group experiments under, in order. */
  sections: { id: string; name: LocalizedText }[];
  achieved: string[];
  onChoose: (id: string | null) => void;
};

export function ExperimentPanel({
  experiments,
  experiment,
  sections,
  achieved,
  onChoose,
}: ExperimentPanelProps) {
  const { language, tr } = useLanguage();
  const complete = experiment
    ? achieved.length === experiment.goals.length
    : false;

  return (
    <div>
      <label className="block">
        <span className="text-sm font-bold">
          {tr("Choose an experiment", "Chagua jaribio")}
        </span>
        <select
          value={experiment?.id ?? ""}
          onChange={(event) => onChoose(event.target.value || null)}
          className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">{tr("Free build", "Unda huru")}</option>
          {sections.map((section) => {
            const group = experiments.filter(
              (item) => item.section === section.id,
            );
            return group.length === 0 ? null : (
              <optgroup key={section.id} label={section.name[language]}>
                {group.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title[language]}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </label>

      {!experiment ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <Wrench className="h-4 w-4" />
            {tr("Free build", "Unda huru")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {tr(
              "Use any equipment you like. Choose an experiment above for steps and goals that check your set-up.",
              "Tumia vifaa vyovyote. Chagua jaribio hapo juu kupata hatua na malengo yanayokagua mpangilio wako.",
            )}
          </p>
        </div>
      ) : (
        <section className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("Experiment", "Jaribio")}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold dark:bg-slate-800">
              {achieved.length}/{experiment.goals.length}
            </span>
          </div>
          <p className="mt-2 text-lg font-bold">{experiment.title[language]}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {experiment.summary[language]}
          </p>
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
      )}
    </div>
  );
}
