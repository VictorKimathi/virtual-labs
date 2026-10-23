import { Circle, CircleCheck, PartyPopper } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../../../app/useLanguage";
import type { Localized } from "../chemistry.types";

export type Goal = { id: string; text: Localized; done: boolean };

type GoalListProps = {
  title: Localized;
  steps: Localized[];
  goals: Goal[];
  finish: Localized;
};

export function GoalList({ title, steps, goals, finish }: GoalListProps) {
  const { language, tr } = useLanguage();
  const doneCount = goals.filter((goal) => goal.done).length;
  const complete = doneCount === goals.length;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {tr("Experiment", "Jaribio")}
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold dark:bg-slate-800">
          {doneCount}/{goals.length}
        </span>
      </div>
      <p className="mt-2 text-lg font-bold">{title[language]}</p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {steps.map((step) => (
          <li key={step.en}>{step[language]}</li>
        ))}
      </ol>
      <h3 className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {tr("Goals", "Malengo")}
      </h3>
      <ul className="mt-2 space-y-2">
        {goals.map((goal) => (
          <li key={goal.id} className="flex items-start gap-2 text-sm">
            {goal.done ? (
              <motion.span
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="mt-0.5 shrink-0"
              >
                <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </motion.span>
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            )}
            <span
              className={
                goal.done
                  ? "font-semibold text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300"
              }
            >
              {goal.text[language]}
            </span>
          </li>
        ))}
      </ul>
      {complete && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mt-4 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-kenya-green dark:bg-green-950 dark:text-green-300"
        >
          <PartyPopper className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {finish[language]}
        </motion.p>
      )}
    </section>
  );
}
