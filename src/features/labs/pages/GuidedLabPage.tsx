import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FlaskConical,
  Lightbulb,
  ListChecks,
  Play,
  Target,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { hasAssessment } from "../../assessment/data/questions";
import { PlantCellDiagram } from "../../biology-lab/components/PlantCellDiagram";
import { getLab, getSubject } from "../../catalog/data/catalog";
import { SeparationStage } from "../../chemistry-lab/components/SeparationStage";
import { TestTubeRack } from "../../chemistry-lab/components/TestTubeRack";
import { TitrationStage } from "../../chemistry-lab/components/TitrationStage";
import {
  phAfterAdding,
  unknownConcentration,
} from "../../chemistry-lab/chem/titration";
import { indicators } from "../../chemistry-lab/data/indicators";
import { CircuitDiagram } from "../../sandbox/components/CircuitDiagram";
import NotFoundPage from "../../../shared/ui/NotFoundPage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import type { Lab, Subject } from "../../catalog/data/catalog.types";
import { getLesson } from "../data/lessons";

const steps = [
  ["Introduction", "Utangulizi"],
  ["Learning Outcomes", "Matokeo ya Kujifunza"],
  ["Resources", "Vifaa"],
  ["Pre-Assessment", "Tathmini ya Awali"],
  ["Procedure & Experiment", "Utaratibu na Jaribio"],
  ["Post-Assessment", "Tathmini ya Mwisho"],
  ["Conclusion", "Hitimisho"],
] as const;

const rackDemo = ["hcl", "vinegar", "milk", "water", "soap", "naoh"].map(
  (sampleId) => ({ sampleId, indicator: "universal" as const }),
);
const noPour = { token: 0, amount: 0 };
const titrationDemoBase = unknownConcentration(0);

function stageFrame(content: ReactNode) {
  return (
    <div className="bg-linear-to-b from-sky-50 to-slate-100 p-2 dark:from-slate-900 dark:to-slate-950">
      {content}
    </div>
  );
}

function LessonDiagram({ lab, subject }: { lab: Lab; subject: Subject }) {
  const { language } = useLanguage();
  if (lab.id === "ohms-law") return <CircuitDiagram />;
  if (lab.id === "plant-cells") return <PlantCellDiagram />;
  if (lab.id === "acids-bases")
    return stageFrame(
      <TestTubeRack
        tubes={rackDemo}
        selected={null}
        dosing={null}
        onSelect={() => undefined}
      />,
    );
  if (lab.id === "titration")
    return stageFrame(
      <div className="mx-auto max-w-xs">
        <TitrationStage
          volume={10}
          ph={phAfterAdding(titrationDemoBase, 10)}
          indicator={indicators.phenolphthalein}
          pour={noPour}
        />
      </div>,
    );
  if (lab.id === "separation")
    return stageFrame(<SeparationStage scene="idle" />);
  return (
    <div
      className={`flex h-full min-h-48 flex-col items-center justify-center gap-3 p-6 text-center ${subject.lightClass} ${subject.colorClass}`}
    >
      <SubjectIcon icon={subject.icon} className="h-12 w-12" />
      <p className="text-lg font-extrabold">
        {language === "en" ? lab.title : lab.titleSw}
      </p>
    </div>
  );
}

export default function GuidedLabPage() {
  const { labId } = useParams();
  const lab = getLab(labId);
  const subject = lab ? getSubject(lab.subject) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStep = Number(searchParams.get("step") ?? "0");
  const current =
    Number.isInteger(rawStep) && rawStep >= 0 && rawStep < steps.length
      ? rawStep
      : 0;
  const [procedureTab, setProcedureTab] = useState<"learn" | "experiment">(
    "learn",
  );
  const { language, tr } = useLanguage();
  if (!lab || !subject) return <NotFoundPage />;
  const lesson = getLesson(lab);
  const quiz = hasAssessment(lab.id);
  const stepTitle = language === "en" ? steps[current][0] : steps[current][1];
  function goTo(index: number) {
    setSearchParams({ step: String(index) });
  }
  return (
    <div className="space-y-5">
      <Link
        to="/labs"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-kenya-green dark:text-green-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {tr("All guided lessons", "Masomo yote")}
      </Link>
      <div>
        <p className={`text-sm font-bold ${subject.colorClass}`}>
          {language === "en" ? subject.name : subject.nameSw} ·{" "}
          {tr("Grade", "Gredi")} {lab.grade} ·{" "}
          {language === "en" ? lab.strand : lab.strandSw}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
          {language === "en" ? lab.title : lab.titleSw}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {tr("Guided lesson", "Somo lenye mwongozo")} · {lab.duration}
        </p>
      </div>
      <nav
        aria-label={tr("Lab steps", "Hatua za maabara")}
        className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        <ol className="flex min-w-max gap-2">
          {steps.map(([english, kiswahili], index) => (
            <li key={english}>
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-current={current === index ? "step" : undefined}
                className={`flex min-h-14 items-center gap-2 rounded-xl border-2 px-3 text-left text-xs font-bold ${current === index ? "border-kenya-green bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : index < current ? "border-green-200 bg-green-50 text-kenya-green dark:border-green-900 dark:bg-green-950 dark:text-green-300" : "border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400"}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${index <= current ? "bg-kenya-green text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
                >
                  {index < current ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="max-w-28 leading-4">
                  {language === "en" ? english : kiswahili}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <section
        aria-labelledby="step-heading"
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300">
            {current === 0 ? (
              <BookOpen className="h-5 w-5" />
            ) : current === 4 ? (
              <FlaskConical className="h-5 w-5" />
            ) : (
              <ListChecks className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {tr("Step", "Hatua")} {current + 1} {tr("of", "kati ya")} 7
            </p>
            <h2 id="step-heading" className="text-xl font-extrabold">
              {stepTitle}
            </h2>
          </div>
        </div>
        {current === 0 && (
          <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
            <div>
              <p className="text-base leading-7 text-slate-700 dark:text-slate-200">
                {language === "en" ? lab.intro : lab.introSw}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {lesson.predict[language]}
              </p>
              <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-kenya-green dark:bg-green-950 dark:text-green-300">
                <Lightbulb className="mr-2 inline h-5 w-5" />
                {tr(
                  "Think first. Test next.",
                  "Fikiri kwanza. Jaribu baadaye.",
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <LessonDiagram lab={lab} subject={subject} />
            </div>
          </div>
        )}
        {current === 1 && (
          <div className="mt-6 space-y-3 text-base leading-7">
            <p>
              {tr(
                "By the end of this lab, you should be able to:",
                "Mwisho wa maabara hii, utaweza:",
              )}
            </p>
            <ul className="space-y-3">
              {lesson.outcomes.map((item) => (
                <li key={item.en} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-kenya-green" />
                  {item[language]}
                </li>
              ))}
            </ul>
          </div>
        )}
        {current === 2 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {lesson.resources.map((item) => (
              <div
                key={item.en}
                className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 dark:border-slate-700"
              >
                <Target className="h-5 w-5 shrink-0 text-kenya-green" />
                <span className="font-semibold">{item[language]}</span>
              </div>
            ))}
          </div>
        )}
        {current === 3 && (
          <div className="mt-6">
            {quiz ? (
              <>
                <p className="leading-7 text-slate-700 dark:text-slate-200">
                  {tr(
                    "Check what you already know before starting the experiment. Your answers help you notice what you learn.",
                    "Pima unachojua kabla ya kuanza jaribio. Majibu yako yatakusaidia kuona ulichojifunza.",
                  )}
                </p>
                <Link
                  to={`/labs/${lab.id}/pre-assessment`}
                  className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 py-3 font-bold text-white"
                >
                  <ClipboardCheck className="h-5 w-5" />
                  {tr("Start pre-assessment", "Anza tathmini ya awali")}
                </Link>
              </>
            ) : (
              <p className="leading-7 text-slate-700 dark:text-slate-200">
                {tr(
                  "Write down two things you already know about this topic and one question you want answered.",
                  "Andika mambo mawili unayojua kuhusu mada hii na swali moja unalotaka lijibiwe.",
                )}
              </p>
            )}
          </div>
        )}
        {current === 4 && (
          <div className="mt-6">
            <div className="flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setProcedureTab("learn")}
                aria-pressed={procedureTab === "learn"}
                className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold ${procedureTab === "learn" ? "bg-white text-kenya-green shadow-sm dark:bg-slate-900 dark:text-green-400" : "text-slate-500"}`}
              >
                {tr("Lesson", "Somo")}
              </button>
              <button
                type="button"
                onClick={() => setProcedureTab("experiment")}
                aria-pressed={procedureTab === "experiment"}
                className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold ${procedureTab === "experiment" ? "bg-white text-kenya-green shadow-sm dark:bg-slate-900 dark:text-green-400" : "text-slate-500"}`}
              >
                {tr("Experiment", "Jaribio")}
              </button>
            </div>
            {procedureTab === "learn" ? (
              <div className="mt-5 space-y-4 leading-7 text-slate-700 dark:text-slate-200">
                {lesson.explain.map((paragraph) => (
                  <p key={paragraph.en}>{paragraph[language]}</p>
                ))}
                {lesson.callout && (
                  <p className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-kenya-green dark:bg-green-950 dark:text-green-300">
                    {lesson.callout[language]}
                  </p>
                )}
                {lesson.formula && (
                  <p className="rounded-xl bg-blue-50 p-4 font-bold text-slate-900 dark:bg-blue-950 dark:text-white">
                    {lesson.formula}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setProcedureTab("experiment")}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 py-3 font-bold text-white"
                >
                  {tr("Continue to experiment", "Endelea kwenye jaribio")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <ol className="list-inside list-decimal space-y-2 leading-7 text-slate-700 dark:text-slate-200">
                  {lesson.procedure.map((instruction) => (
                    <li key={instruction.en}>{instruction[language]}</li>
                  ))}
                </ol>
                <div className="flex flex-wrap gap-3">
                  {lesson.simulations.map((simulation) => (
                    <Link
                      key={simulation.to}
                      to={simulation.to}
                      className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-red px-5 py-3 font-extrabold text-white"
                    >
                      <Play className="h-5 w-5" />
                      {simulation.label[language]}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {current === 5 && (
          <div className="mt-6">
            <p className="leading-7 text-slate-700 dark:text-slate-200">
              {tr(
                "Compare what you know now with your first prediction. What changed, and what evidence supports your answer?",
                "Linganisha unachojua sasa na utabiri wako wa kwanza. Nini kimebadilika, na ushahidi gani unaunga mkono jibu lako?",
              )}
            </p>
            {quiz && (
              <Link
                to={`/labs/${lab.id}/post-assessment`}
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 py-3 font-bold text-white"
              >
                <ClipboardCheck className="h-5 w-5" />
                {tr("Start post-assessment", "Anza tathmini ya mwisho")}
              </Link>
            )}
          </div>
        )}
        {current === 6 && (
          <div className="mt-6">
            <p className="leading-7 text-slate-700 dark:text-slate-200">
              {tr(
                "Well done. A good scientist compares a prediction with observations and explains any difference.",
                "Hongera. Mwanasayansi mzuri hulinganisha utabiri na uchunguzi na kueleza tofauti yoyote.",
              )}
            </p>
            <Link
              to="/progress"
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 py-3 font-bold text-white"
            >
              {tr("View progress", "Angalia maendeleo")}{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, current - 1))}
          disabled={current === 0}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold disabled:opacity-40 dark:border-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          {tr("Back", "Rudi")}
        </button>
        <button
          type="button"
          onClick={() => goTo(Math.min(6, current + 1))}
          disabled={current === 6}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kenya-green px-5 py-3 font-bold text-white disabled:opacity-40"
        >
          {tr("Next", "Endelea")} <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
