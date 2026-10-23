import { ArrowLeft, BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import type { Localized } from "../chemistry.types";

type LabHeaderProps = {
  title: Localized;
  lessonId: string;
  actions?: ReactNode;
};

export function LabHeader({ title, lessonId, actions }: LabHeaderProps) {
  const { language, tr } = useLanguage();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          to="/workbench"
          className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tr("Practice bench", "Benchi la mazoezi")}
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-2xl font-black tracking-tight">
          {title[language]}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <Link
          to={`/labs/${lessonId}?step=4`}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {tr("Open lesson", "Fungua somo")}
        </Link>
      </div>
    </div>
  );
}
