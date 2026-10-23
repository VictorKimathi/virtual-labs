import { ArrowRight, BookOpen, Play, Telescope } from "lucide-react";
import { Link } from "react-router-dom";
import { SubjectCard } from "../components/SubjectCard";
import { subjects } from "../data/catalog";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-slate-900 p-8 text-white dark:bg-slate-800 sm:p-12">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-200">
            <Telescope className="h-4 w-4" /> Science, hands on
          </p>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Curiosity starts here.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Learn a concept, get ready for the experiment, then test your ideas
            in an interactive simulation.
          </p>
          <Link
            to="/chemistry"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 hover:bg-teal-300"
          >
            Explore subjects <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Choose your path
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Three subjects. Endless questions.
            </h2>
          </div>
          <span className="text-sm text-slate-500">
            Starter activities available
          </span>
        </div>
        {subjects.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border p-6 text-slate-500">
            Subjects are coming soon.
          </p>
        )}
      </section>
      <section className="grid gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:grid-cols-3">
        <Step
          icon={<BookOpen className="h-5 w-5" />}
          number="01"
          title="Preview"
          detail="See the lab goals and guiding question."
        />
        <Step
          icon={<Telescope className="h-5 w-5" />}
          number="02"
          title="Learn"
          detail="Read the lesson immediately before the simulation."
        />
        <Step
          icon={<Play className="h-5 w-5" />}
          number="03"
          title="Experiment"
          detail="Change variables, observe, and explain what happened."
        />
      </section>
    </div>
  );
}
function Step({
  icon,
  number,
  title,
  detail,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400">{number}</p>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {detail}
        </p>
      </div>
    </div>
  );
}
