import { ArrowLeft, ArrowRight, CheckCircle2, CircleX } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { getLab } from "../../catalog/data/catalog";
import NotFoundPage from "../../../shared/ui/NotFoundPage";

const questions = [
  {
    en: "What provides electrical energy in a simple circuit?",
    sw: "Ni nini hutoa nishati ya umeme katika sakiti rahisi?",
    options: [
      ["A cell", "Seli"],
      ["A wire", "Waya"],
      ["A bulb", "Balbu"],
      ["A switch", "Swichi"],
    ],
    answer: 0,
  },
  {
    en: "Which instrument measures electric current?",
    sw: "Ni kifaa gani hupima mkondo wa umeme?",
    options: [
      ["Voltmeter", "Voltimita"],
      ["Ammeter", "Amita"],
      ["Thermometer", "Kipimajoto"],
      ["Ruler", "Rula"],
    ],
    answer: 1,
  },
  {
    en: "What is the unit of resistance?",
    sw: "Kizio cha ukinzani ni nini?",
    options: [
      ["Volt", "Volti"],
      ["Ampere", "Ampia"],
      ["Ohm", "Ohmu"],
      ["Watt", "Wati"],
    ],
    answer: 2,
  },
  {
    en: "What happens when the switch is open?",
    sw: "Nini hutokea swichi ikiwa wazi?",
    options: [
      ["Current flows faster", "Mkondo hupita haraka"],
      ["The circuit is broken", "Sakiti inakatika"],
      ["Voltage disappears", "Volteji hupotea"],
      ["The bulb gets brighter", "Balbu hung’aa zaidi"],
    ],
    answer: 1,
  },
  {
    en: "If resistance stays constant and voltage rises, what happens to current?",
    sw: "Ukinzani ukibaki sawa na volteji iongezeke, nini hutokea kwa mkondo?",
    options: [
      ["It increases", "Unaongezeka"],
      ["It decreases", "Unapungua"],
      ["It stays zero", "Unabaki sifuri"],
      ["It reverses", "Unageuka"],
    ],
    answer: 0,
  },
];

export default function QuizPage() {
  const { labId } = useParams();
  const lab = getLab(labId);
  const { language, tr } = useLanguage();
  const [index, setIndex] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  if (!lab) return <NotFoundPage />;
  if (lab.id !== "ohms-law")
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold">
          {tr("Quiz coming soon", "Maswali yanakuja hivi karibuni")}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          {tr(
            "This lab is a preview. Its assessment is being prepared.",
            "Maabara hii ni muhtasari. Tathmini yake inaandaliwa.",
          )}
        </p>
        <Link
          to={`/labs/${lab.id}?step=3`}
          className="mt-5 inline-flex min-h-12 items-center text-kenya-green dark:text-green-400"
        >
          {tr("Back to lab", "Rudi maabara")}
        </Link>
      </div>
    );
  const question = questions[index];
  const correct = selected === question.answer;
  const progressWidth = ["w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"][index];
  function move(next: number) {
    setIndex(next);
    setSelected(null);
  }
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={`/labs/${lab.id}?step=3`}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kenya-green dark:text-green-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {tr("Back to guided lab", "Rudi kwenye maabara")}
      </Link>
      <div>
        <p className="text-sm font-bold text-kenya-green dark:text-green-400">
          {tr("PRE-ASSESSMENT", "TATHMINI YA AWALI")}
        </p>
        <h1 className="mt-1 text-3xl font-black">
          {tr("Ohm's Law", "Sheria ya Ohm")}
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
            {tr("Question", "Swali")} {index + 1} {tr("of", "kati ya")} 5
          </span>
          <span className="text-xs text-slate-500">
            {Math.round(((index + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full bg-kenya-green ${progressWidth}`}
          />
        </div>
        <h2 className="mt-7 text-xl font-extrabold leading-8">
          {language === "en" ? question.en : question.sw}
        </h2>
        <div className="mt-6 space-y-3">
          {question.options.map(([en, sw], optionIndex) => {
            const chosen = selected === optionIndex;
            return (
              <button
                key={en}
                type="button"
                onClick={() => setSelected(optionIndex)}
                aria-pressed={chosen}
                className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition-colors ${chosen ? (correct ? "border-kenya-green bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "border-kenya-red bg-red-50 text-kenya-red dark:bg-red-950 dark:text-red-300") : "border-slate-200 hover:border-slate-400 dark:border-slate-700"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="flex-1">{language === "en" ? en : sw}</span>
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
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <CircleX className="h-5 w-5" />
            )}
            {correct
              ? tr("Correct! Well done.", "Sahihi! Hongera.")
              : tr(
                  "Try again. Think about what each instrument measures.",
                  "Jaribu tena. Fikiria kila kifaa hupima nini.",
                )}
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
        {index < questions.length - 1 ? (
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
            to={`/labs/${lab.id}?step=4`}
            className={`inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 font-bold text-white ${!correct ? "pointer-events-none opacity-40" : ""}`}
          >
            {tr("Continue lab", "Endelea na maabara")}{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
