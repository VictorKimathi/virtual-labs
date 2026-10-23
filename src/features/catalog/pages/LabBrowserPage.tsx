import { ArrowRight, Check, Clock3 } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { getLabLevel, getSubject, labs, subjects } from "../data/catalog";
import type { Level, SubjectId } from "../data/catalog.types";

const sampleCompleted = new Set(["plant-cells"]);

type SubjectFilter = SubjectId | "all";
type LevelFilter = Level | "all";

const levelOptions: {
  id: LevelFilter;
  en: string;
  sw: string;
}[] = [
  { id: "all", en: "All grades", sw: "Gredi zote" },
  { id: "junior", en: "Grades 7–9", sw: "Gredi 7–9" },
  { id: "senior", en: "Grades 10–12", sw: "Gredi 10–12" },
];

const chipBase =
  "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors";
const chipOn = "border-kenya-green bg-kenya-green text-white";
const chipOff =
  "border-slate-300 bg-white hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900";

export default function LabBrowserPage() {
  const [searchParams] = useSearchParams();
  const initialSubject = subjects.find(
    (subject) => subject.id === searchParams.get("subject"),
  )?.id;
  const [subjectId, setSubjectId] = useState<SubjectFilter>(
    initialSubject ?? "all",
  );
  const [level, setLevel] = useState<LevelFilter>("all");
  const { language, tr } = useLanguage();
  const shownLabs = labs.filter(
    (lab) =>
      (subjectId === "all" || lab.subject === subjectId) &&
      (level === "all" || getLabLevel(lab) === level),
  );

  function clearFilters() {
    setSubjectId("all");
    setLevel("all");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("Guided lessons", "Masomo yenye mwongozo")}
        </h1>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
          {tr(
            "Each lesson walks you through a lab in seven steps: introduction, outcomes, resources, quiz, experiment, quiz and conclusion. Want to experiment without steps? Open the ",
            "Kila somo linakuongoza kupitia maabara kwa hatua saba. Unataka kujaribu bila hatua? Fungua ",
          )}
          <Link
            to="/workbench"
            className="font-bold text-kenya-green underline dark:text-green-400"
          >
            {tr("Practice bench", "Benchi la mazoezi")}
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label={tr("Filter by subject", "Chuja kwa somo")}
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setSubjectId("all")}
            aria-pressed={subjectId === "all"}
            className={`${chipBase} ${subjectId === "all" ? chipOn : chipOff}`}
          >
            {tr("All subjects", "Masomo yote")}
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => setSubjectId(subject.id)}
              aria-pressed={subjectId === subject.id}
              className={`${chipBase} ${subjectId === subject.id ? chipOn : chipOff}`}
            >
              <SubjectIcon
                icon={subject.icon}
                className={`h-4 w-4 ${subjectId === subject.id ? "text-white" : subject.colorClass}`}
              />
              {language === "en" ? subject.name : subject.nameSw}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label={tr("Filter by grade", "Chuja kwa gredi")}
          className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        >
          {levelOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setLevel(option.id)}
              aria-pressed={level === option.id}
              className={`min-h-9 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-bold transition-colors ${level === option.id ? "bg-white text-kenya-green shadow-sm dark:bg-slate-900 dark:text-green-400" : "text-slate-600 dark:text-slate-300"}`}
            >
              {language === "en" ? option.en : option.sw}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {shownLabs.length} {tr("lessons", "masomo")}
      </p>

      {shownLabs.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shownLabs.map((lab) => {
            const subject = getSubject(lab.subject);
            const completed = sampleCompleted.has(lab.id);
            return (
              <li key={lab.id}>
                <Link
                  to={`/labs/${lab.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="flex items-start justify-between gap-3">
                    {subject && (
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${subject.lightClass} ${subject.colorClass}`}
                      >
                        <SubjectIcon icon={subject.icon} className="h-6 w-6" />
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${completed ? "bg-green-100 text-kenya-green dark:bg-green-950 dark:text-green-300" : lab.available ? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                    >
                      {completed && <Check className="h-3 w-3" />}
                      {completed
                        ? tr("Completed", "Imekamilika")
                        : lab.available
                          ? tr("Ready", "Iko tayari")
                          : tr("Preview only", "Muhtasari tu")}
                    </span>
                  </span>
                  <span className="mt-4 block text-lg font-extrabold">
                    {language === "en" ? lab.title : lab.titleSw}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {language === "en" ? lab.intro : lab.introSw}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        {subject &&
                          (language === "en" ? subject.name : subject.nameSw)}
                        {" · "}
                        {language === "en" ? lab.strand : lab.strandSw}
                      </span>
                      <span>
                        {tr("Grade", "Gredi")} {lab.grade}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                        {lab.duration}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="font-bold">
            {tr(
              "No lessons match these filters",
              "Hakuna masomo yanayolingana",
            )}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-kenya-green px-4 text-sm font-bold text-white"
          >
            {tr("Show all lessons", "Onyesha masomo yote")}
          </button>
        </div>
      )}
    </div>
  );
}
