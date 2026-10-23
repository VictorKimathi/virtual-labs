import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Clock3,
  FlaskConical,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getSubject } from "../../catalog/data/catalog";
import NotFoundPage from "../../../shared/ui/NotFoundPage";
import { LabTabs } from "../components/LabTabs";

export default function LabIntroPage() {
  const { subjectId, labSlug } = useParams();
  const subject = getSubject(subjectId);
  const lab = subject?.labs.find((item) => item.slug === labSlug);
  const lesson = subject?.lessons.find((item) => item.labSlug === labSlug);
  if (!subject || !lab) return <NotFoundPage />;
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to={`/${subject.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" /> {subject.name}
      </Link>
      <LabTabs
        subject={subject}
        lab={lab}
        lesson={lesson}
        current="introduction"
      />
      <div className="mt-8 rounded-3xl bg-slate-900 p-8 text-white dark:bg-slate-800 sm:p-10">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-300">
          <FlaskConical className="h-4 w-4" /> Lab introduction · {lab.topic}
        </p>
        <h1 className="mt-4 text-4xl font-black">{lab.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          {lab.summary}
        </p>
        <p className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300">
          <Clock3 className="h-4 w-4" /> About {lab.duration}
        </p>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900">
          <CircleHelp className="h-6 w-6 text-teal-600" />
          <h2 className="mt-4 text-xl font-bold">Guiding question</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {lab.question}
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">What you’ll do</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {lab.objectives.map((goal) => (
              <li key={goal} className="flex gap-3">
                <span className="text-teal-600">✓</span>
                {goal}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Simulation provided by {lab.provider}.
        </p>
        <Link
          to={
            lesson
              ? `/${subject.id}/learn/${lesson.slug}`
              : `/${subject.id}/labs/${lab.slug}/run`
          }
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-500"
        >
          {lesson ? "Continue to lesson" : "Open simulation"}{" "}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
