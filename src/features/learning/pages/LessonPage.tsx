import { ArrowLeft, ArrowRight, BookOpen, Lightbulb } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getSubject } from "../../catalog/data/catalog";
import NotFoundPage from "../../../shared/ui/NotFoundPage";

export default function LessonPage() {
  const { subjectId, lessonSlug } = useParams();
  const subject = getSubject(subjectId);
  const lesson = subject?.lessons.find((item) => item.slug === lessonSlug);
  if (!subject || !lesson) return <NotFoundPage />;
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={`/${subject.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" /> {subject.name}
      </Link>
      <div className="mt-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
          <BookOpen className="h-4 w-4" /> Learn · {lesson.duration}
        </p>
        <h1 className="mt-3 text-4xl font-black">{lesson.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-500 dark:text-slate-400">
          {lesson.summary}
        </p>
      </div>
      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold">Key ideas</h2>
        </div>
        <ul className="mt-6 space-y-5">
          {lesson.keyIdeas.map((idea, index) => (
            <li key={idea} className="flex gap-4 leading-7">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                {index + 1}
              </span>
              {idea}
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-teal-50 p-6 dark:bg-teal-950">
        <div>
          <p className="font-bold">Ready to apply this?</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Preview the lab goals and guiding question.
          </p>
        </div>
        <Link
          to={`/${subject.id}/labs/${lesson.labSlug}`}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-500"
        >
          Preview lab <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
