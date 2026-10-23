import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import NotFoundPage from "../../../shared/ui/NotFoundPage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { getSubject } from "../data/catalog";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const subject = getSubject(subjectId);
  if (!subject) return <NotFoundPage />;
  return (
    <div className="space-y-10">
      <div className="flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          <SubjectIcon icon={subject.icon} className="h-8 w-8" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-teal-600 dark:text-teal-400">
            {subject.eyebrow}
          </p>
          <h1 className="mt-1 text-4xl font-black">{subject.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            {subject.summary}
          </p>
        </div>
      </div>
      <section>
        <div className="mb-5 flex items-start gap-3">
          <span className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <FlaskConical className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold">Virtual labs</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Each lab keeps its introduction, lesson, and simulation together.
            </p>
          </div>
        </div>
        {subject.labs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {subject.labs.map((lab) => {
              const lesson = subject.lessons.find(
                (item) => item.labSlug === lab.slug,
              );
              return (
                <Link
                  key={lab.slug}
                  to={`/${subject.id}/labs/${lab.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                    {lab.topic} · {lab.duration}
                  </p>
                  <h3 className="mt-3 text-xl font-bold">{lab.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {lab.summary}
                  </p>
                  {lesson && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <BookOpen className="h-4 w-4" /> Includes lesson:{" "}
                      {lesson.title}
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400">
                    Start lab{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500 dark:border-slate-700">
            Labs are coming soon.
          </p>
        )}
      </section>
    </div>
  );
}
