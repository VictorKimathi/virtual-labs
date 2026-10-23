import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Subject } from "../data/catalog.types";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";

const tones = {
  chemistry:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  physics:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  biology:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link
      to={`/${subject.id}`}
      className="group flex min-h-64 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tones[subject.id]}`}
        >
          <SubjectIcon icon={subject.icon} className="h-7 w-7" />
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600" />
      </div>
      <div className="mt-auto">
        <p className="text-xs font-bold tracking-widest text-slate-400">
          {subject.eyebrow}
        </p>
        <h3 className="mt-2 text-2xl font-bold">{subject.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {subject.summary}
        </p>
      </div>
    </Link>
  );
}
