import { BookOpen, FlaskConical, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { Lab, Lesson, Subject } from "../../catalog/data/catalog.types";

type Section = "introduction" | "lesson" | "simulation";

type Props = {
  subject: Subject;
  lab: Lab;
  lesson?: Lesson;
  current: Section;
};

export function LabTabs({ subject, lab, lesson, current }: Props) {
  const base = `/${subject.id}/labs/${lab.slug}`;
  const tabs = [
    { id: "introduction", label: "Introduction", to: base, icon: FlaskConical },
    ...(lesson
      ? [
          {
            id: "lesson",
            label: "Lesson",
            to: `/${subject.id}/learn/${lesson.slug}`,
            icon: BookOpen,
          },
        ]
      : []),
    { id: "simulation", label: "Simulation", to: `${base}/run`, icon: Play },
  ];

  return (
    <nav
      aria-label={`${lab.title} sections`}
      className="mt-7 flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800"
    >
      {tabs.map((tab, index) => (
        <Link
          key={tab.id}
          to={tab.to}
          aria-current={current === tab.id ? "page" : undefined}
          className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${current === tab.id ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
        >
          <span className="text-xs opacity-60">{index + 1}.</span>
          <tab.icon className="h-4 w-4" aria-hidden="true" />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
