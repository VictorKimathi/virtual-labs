import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  GraduationCap,
  SearchX,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FilterChip } from "../../../shared/ui/FilterChip";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { RevealItem } from "../../../shared/ui/RevealItem";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { TiltCard } from "../../../shared/ui/TiltCard";
import { getLabLevel, getSubject, labs, subjects } from "../data/catalog";
import type { Level, SubjectId } from "../data/catalog.types";
import { portalStyles } from "../hero.config";

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

  const readyCount = labs.filter((lab) => lab.available).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        eyebrow={tr("Learn", "Jifunze")}
        title={tr("Guided lessons", "Masomo yenye mwongozo")}
        description={
          <>
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
          </>
        }
      >
        <ul className="flex flex-wrap gap-2 text-sm font-bold">
          <li className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <BookOpen className="size-4 text-kenya-green" aria-hidden="true" />
            {labs.length} {tr("lessons", "masomo")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <Check className="size-4 text-kenya-green" aria-hidden="true" />
            {readyCount} {tr("ready to run", "tayari kutumika")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <GraduationCap
              className="size-4 text-kenya-green"
              aria-hidden="true"
            />
            {tr("Grades 7–12", "Gredi 7–12")}
          </li>
        </ul>
      </PageHeader>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label={tr("Filter by subject", "Chuja kwa somo")}
          className="flex flex-wrap gap-2"
        >
          <FilterChip
            active={subjectId === "all"}
            onClick={() => setSubjectId("all")}
          >
            {tr("All subjects", "Masomo yote")}
          </FilterChip>
          {subjects.map((subject) => (
            <FilterChip
              key={subject.id}
              active={subjectId === subject.id}
              onClick={() => setSubjectId(subject.id)}
            >
              <SubjectIcon
                icon={subject.icon}
                className={`size-4 ${subjectId === subject.id ? "text-white" : subject.colorClass}`}
              />
              {language === "en" ? subject.name : subject.nameSw}
            </FilterChip>
          ))}
        </div>
        <div
          role="group"
          aria-label={tr("Filter by grade", "Chuja kwa gredi")}
          className="flex shrink-0 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800"
        >
          {levelOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setLevel(option.id)}
              aria-pressed={level === option.id}
              className={`min-h-10 flex-1 whitespace-nowrap rounded-xl px-3 text-sm font-bold transition-all ${level === option.id ? "bg-white text-kenya-green shadow-md dark:bg-slate-950 dark:text-green-400" : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"}`}
            >
              {language === "en" ? option.en : option.sw}
            </button>
          ))}
        </div>
      </div>

      <p
        aria-live="polite"
        className="text-sm font-semibold text-slate-500 dark:text-slate-400"
      >
        {shownLabs.length} {tr("lessons", "masomo")}
      </p>

      {shownLabs.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shownLabs.map((lab, index) => {
            const subject = getSubject(lab.subject);
            const completed = sampleCompleted.has(lab.id);
            const style = portalStyles[lab.subject];
            return (
              <RevealItem key={lab.id} index={index}>
                <TiltCard
                  to={`/labs/${lab.id}`}
                  className={`group relative isolate flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-colors dark:border-slate-800 dark:bg-slate-900 ${style.border} ${lab.available || completed ? "" : "opacity-80"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute -right-12 -top-12 -z-10 size-44 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-150 ${style.glow}`}
                  />
                  <span className="flex items-start justify-between gap-3">
                    {subject && (
                      <span
                        className={`flex size-14 items-center justify-center rounded-2xl ${subject.lightClass} ${subject.colorClass}`}
                      >
                        <SubjectIcon icon={subject.icon} className="size-7" />
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${completed ? "bg-green-100 text-kenya-green dark:bg-green-950 dark:text-green-300" : lab.available ? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                    >
                      {completed && <Check className="size-3" />}
                      {completed
                        ? tr("Completed", "Imekamilika")
                        : lab.available
                          ? tr("Ready", "Iko tayari")
                          : tr("Preview only", "Muhtasari tu")}
                    </span>
                  </span>
                  <span className="mt-5 block text-xl font-extrabold tracking-tight">
                    {language === "en" ? lab.title : lab.titleSw}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {language === "en" ? lab.intro : lab.introSw}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span
                        className={`rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800 ${style.text}`}
                      >
                        {language === "en" ? lab.strand : lab.strandSw}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                        {tr("Grade", "Gredi")} {lab.grade}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                        <Clock3 className="size-3" aria-hidden="true" />
                        {lab.duration}
                      </span>
                    </span>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-kenya-green group-hover:text-white dark:bg-slate-800">
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </TiltCard>
              </RevealItem>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title={tr(
            "No lessons match these filters",
            "Hakuna masomo yanayolingana",
          )}
          actionLabel={tr("Show all lessons", "Onyesha masomo yote")}
          onAction={clearFilters}
        />
      )}
    </div>
  );
}
