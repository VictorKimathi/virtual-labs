import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import type { ReadingTask } from "../workbench.types";

type Result = "right" | "wrong" | null;

function TaskRow({ task }: { task: ReadingTask }) {
  const { language, tr } = useLanguage();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [misses, setMisses] = useState(0);
  const [revealed, setRevealed] = useState(false);

  function check() {
    const value = Number(answer);
    if (answer.trim() === "" || Number.isNaN(value)) return;
    const right = Math.abs(value - task.expected) <= task.tolerance;
    setResult(right ? "right" : "wrong");
    if (!right) setMisses((count) => count + 1);
  }

  const digits = task.tolerance < 0.01 ? 3 : task.tolerance < 0.1 ? 2 : 1;
  return (
    <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
      <label className="block text-sm font-bold">
        {task.label[language]}
        <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
          {task.unit && `(${task.unit})`}
        </span>
        <span className="mt-1 flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setResult(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") check();
            }}
            className="min-h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={check}
            className="min-h-10 shrink-0 rounded-lg bg-slate-800 px-3 text-sm font-bold text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
          >
            {tr("Check", "Hakiki")}
          </button>
        </span>
      </label>
      {result === "right" && (
        <p
          role="status"
          className="mt-2 flex items-start gap-1.5 text-sm font-bold text-green-700 dark:text-green-400"
        >
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
          {tr("Correct.", "Sahihi.")}
        </p>
      )}
      {result === "wrong" && (
        <div role="status" className="mt-2 text-sm">
          <p className="flex items-start gap-1.5 font-bold text-red-700 dark:text-red-400">
            <CircleX className="mt-0.5 h-4 w-4 shrink-0" />
            {tr("Not quite. Look again.", "Si sahihi kabisa. Angalia tena.")}
          </p>
          {task.hint && (
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {task.hint[language]}
            </p>
          )}
          {misses >= 2 && !revealed && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-1 text-xs font-bold underline"
            >
              {tr("Show the answer", "Onyesha jibu")}
            </button>
          )}
        </div>
      )}
      {revealed && (
        <p className="mt-1 font-mono text-sm font-bold">
          {tr("Answer", "Jibu")}: {task.expected.toFixed(digits)} {task.unit}
        </p>
      )}
    </li>
  );
}

export function ReadingTasks({ tasks }: { tasks: ReadingTask[] }) {
  const { tr } = useLanguage();
  if (tasks.length === 0) return null;
  return (
    <section className="mt-4">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {tr("Your reading", "Kipimo chako")}
      </h3>
      <ul className="mt-2 space-y-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
