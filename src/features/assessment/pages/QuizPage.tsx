import { ArrowLeft, ArrowRight, CheckCircle2, CircleX } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { getLab } from "../../catalog/data/catalog";
import NotFoundPage from "../../../shared/ui/NotFoundPage";
import type { Lab } from "../../catalog/data/catalog.types";
import { getQuestions, type Phase } from "../data/questions";
import type { Question } from "../data/questions.types";

export default function QuizPage() {
  const { labId } = useParams();
  const { pathname } = useLocation();
  const lab = getLab(labId);
  const phase: Phase = pathname.endsWith("post-assessment") ? "post" : "pre";
  const questions = lab ? getQuestions(lab.id, phase) : null;
  if (!lab || !questions) return <NotFoundPage />;
  return (
    <Quiz
      key={`${lab.id}:${phase}`}
      lab={lab}
      phase={phase}
      questions={questions}
    />
  );
}

type QuizProps = { lab: Lab; phase: Phase; questions: Question[] };

function Quiz({ lab, phase, questions }: QuizProps) {
  const { language, tr } = useLanguage();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [missed, setMissed] = useState<number[]>([]);

  const backStep = phase === "pre" ? 3 : 5;
  const nextStep = phase === "pre" ? 4 : 6;
  const question = questions[index];
  const correct = selected === question.answer;
  const last = index === questions.length - 1;
  const score = questions.length - missed.length;

  function choose(optionIndex: number) {
    setSelected(optionIndex);
    if (optionIndex !== question.answer && !missed.includes(index))
      setMissed((current) => [...current, index]);
  }

  function move(next: number) {
    setIndex(next);
    setSelected(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={`/labs/${lab.id}?step=${backStep}`}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kenya-green dark:text-green-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {tr("Back to lesson", "Rudi kwenye somo")}
      </Link>
      <div>
        <p className="text-sm font-bold uppercase text-kenya-green dark:text-green-400">
          {phase === "pre"
            ? tr("Pre-assessment", "Tathmini ya awali")
            : tr("Post-assessment", "Tathmini ya mwisho")}
        </p>
        <h1 className="mt-1 text-3xl font-black">
          {language === "en" ? lab.title : lab.titleSw}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {tr(
            "Choose one answer. You can try again.",
            "Chagua jibu moja. Unaweza kujaribu tena.",
          )}
        </p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-extrabold text-kenya-green dark:text-green-400">
            {tr("Question", "Swali")} {index + 1} {tr("of", "kati ya")}{" "}
            {questions.length}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {questions.map((item, position) => (
            <span
              key={item.prompt.en}
              className={`h-2 flex-1 rounded-full ${position <= index ? "bg-kenya-green" : "bg-slate-100 dark:bg-slate-800"}`}
            />
          ))}
        </div>
        <h2 className="mt-7 text-xl font-extrabold leading-8">
          {question.prompt[language]}
        </h2>
        <div className="mt-6 space-y-3">
          {question.options.map((option, optionIndex) => {
            const chosen = selected === optionIndex;
            return (
              <button
                key={option.en}
                type="button"
                onClick={() => choose(optionIndex)}
                aria-pressed={chosen}
                className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition-colors ${chosen ? (correct ? "border-kenya-green bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "border-kenya-red bg-red-50 text-kenya-red dark:bg-red-950 dark:text-red-300") : "border-slate-200 hover:border-slate-400 dark:border-slate-700"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="flex-1">{option[language]}</span>
                {chosen &&
                  (correct ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <CircleX className="h-5 w-5" />
                  ))}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div
            role="status"
            className={`mt-5 flex items-center gap-3 rounded-xl p-4 text-sm font-bold ${correct ? "bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-kenya-red dark:bg-red-950 dark:text-red-300"}`}
          >
            {correct ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <CircleX className="h-5 w-5 shrink-0" />
            )}
            {correct
              ? last
                ? tr(
                    `Correct! You got ${score} of ${questions.length} on the first try.`,
                    `Sahihi! Umepata ${score} kati ya ${questions.length} kwa jaribio la kwanza.`,
                  )
                : tr("Correct! Well done.", "Sahihi! Hongera.")
              : `${tr("Try again.", "Jaribu tena.")} ${question.hint[language]}`}
          </div>
        )}
      </div>
      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => move(Math.max(0, index - 1))}
          disabled={index === 0}
          className="min-h-12 rounded-xl border border-slate-300 px-5 font-bold disabled:opacity-40 dark:border-slate-700"
        >
          {tr("Back", "Rudi")}
        </button>
        {!last ? (
          <button
            type="button"
            onClick={() => move(index + 1)}
            disabled={!correct}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 font-bold text-white disabled:opacity-40"
          >
            {tr("Next question", "Swali linalofuata")}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <Link
            to={`/labs/${lab.id}?step=${nextStep}`}
            aria-disabled={!correct}
            className={`inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 font-bold text-white ${!correct ? "pointer-events-none opacity-40" : ""}`}
          >
            {phase === "pre"
              ? tr("Continue lesson", "Endelea na somo")
              : tr("Finish lesson", "Maliza somo")}{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
