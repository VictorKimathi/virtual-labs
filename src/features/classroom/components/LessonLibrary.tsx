import { Clock, ExternalLink, GraduationCap, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import type { ClassSubject, Lesson } from "../classroom.types";
import { findActivity } from "../data/activities";
import { lessons } from "../data/lessons";
import { badge, badgeTones, primaryButton } from "./styles";

type Props = {
  subject?: ClassSubject;
  onAssign?: (lesson: Lesson) => void;
  assigning?: boolean;
};

/** Ready-made lessons; with `onAssign`, each can be handed to the class in one step. */
export function LessonLibrary({
  subject = "mixed",
  onAssign,
  assigning,
}: Props) {
  const { language, tr } = useLanguage();
  const shown = lessons.filter(
    (lesson) => subject === "mixed" || lesson.lab === subject,
  );
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {shown.map((lesson) => (
        <li
          key={lesson.id}
          className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap gap-2">
            <span
              className={`${badge} ${lesson.lab === "physics" ? badgeTones.blue : badgeTones.amber}`}
            >
              {lesson.lab === "physics"
                ? tr("Physics", "Fizikia")
                : tr("Chemistry", "Kemia")}
            </span>
            <span className={`${badge} ${badgeTones.slate}`}>
              <GraduationCap className="size-3.5" aria-hidden="true" />
              {lesson.grade}
            </span>
            <span className={`${badge} ${badgeTones.slate}`}>
              <Clock className="size-3.5" aria-hidden="true" />
              {lesson.minutes} {tr("min", "dak")}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-black tracking-tight">
            {lesson.title[language]}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {lesson.aim[language]}
          </p>
          <ol className="mt-3 flex-1 space-y-1.5">
            {lesson.activityIds.map((id, index) => {
              const activity = findActivity(id);
              if (!activity) return null;
              return (
                <li key={id}>
                  <Link
                    to={activity.path}
                    className="group flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black dark:bg-slate-800">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {activity.title[language]}
                    </span>
                    <ExternalLink
                      className="size-4 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
          {onAssign && (
            <button
              type="button"
              onClick={() => onAssign(lesson)}
              disabled={assigning}
              className={`${primaryButton} mt-4 self-start`}
            >
              <Send className="size-4" aria-hidden="true" />
              {tr("Assign to class", "Toa kwa darasa")}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
