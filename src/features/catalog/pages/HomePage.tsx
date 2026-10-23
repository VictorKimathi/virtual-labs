import { ArrowRight, Bolt, BookOpen, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { labs, subjects } from "../data/catalog";

export default function HomePage() {
  const { language, tr } = useLanguage();
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold text-kenya-green dark:text-green-400">
          {tr("Jambo, scientist 👋", "Jambo, mwanasayansi 👋")}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
          {tr("What will you discover today?", "Utagundua nini leo?")}
        </h1>
      </section>

      <section
        aria-labelledby="continue-heading"
        className="flex flex-col gap-4 rounded-2xl bg-kenya-green p-5 text-white sm:flex-row sm:items-center sm:gap-6"
      >
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:flex">
          <Bolt className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-green-100">
            {tr("Continue where you stopped", "Endelea ulipoishia")}
          </p>
          <h2 id="continue-heading" className="mt-1 text-xl font-extrabold">
            {tr("Ohm's Law", "Sheria ya Ohm")}{" "}
            <span className="text-sm font-semibold text-green-100">
              {tr(
                "· Grade 10 · Physics · Step 1 of 7",
                "· Gredi ya 10 · Fizikia · Hatua ya 1 kati ya 7",
              )}
            </span>
          </h2>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-1/6 rounded-full bg-white" />
          </div>
        </div>
        <Link
          to="/labs/ohms-law"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-kenya-green"
        >
          {tr("Continue", "Endelea")} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section aria-labelledby="ways-heading">
        <h2 id="ways-heading" className="mb-3 text-lg font-extrabold">
          {tr("Two ways to learn", "Njia mbili za kujifunza")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to="/labs"
            className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-extrabold">
                {tr("Guided lessons", "Masomo yenye mwongozo")}
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                {tr(
                  "Follow a lab from introduction to conclusion, with quizzes along the way.",
                  "Fuata maabara kuanzia utangulizi hadi hitimisho, na maswali njiani.",
                )}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-kenya-green dark:text-green-400">
                {tr("Browse lessons", "Tazama masomo")}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </span>
          </Link>
          <Link
            to="/workbench"
            className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-kenya-red dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-kenya-red dark:bg-red-950 dark:text-red-300">
              <FlaskConical className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-extrabold">
                {tr("Practice bench", "Benchi la mazoezi")}
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                {tr(
                  "No steps, no rules. Pick equipment, build your own experiment and watch what happens.",
                  "Hakuna hatua. Chagua vifaa, unda jaribio lako na uone matokeo.",
                )}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-kenya-red dark:text-red-300">
                {tr("Open the bench", "Fungua benchi")}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="subjects-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="subjects-heading" className="text-lg font-extrabold">
            {tr("Browse lessons by subject", "Tazama masomo kwa somo")}
          </h2>
          <Link
            to="/labs"
            className="shrink-0 text-sm font-bold text-kenya-green dark:text-green-400"
          >
            {tr("See all lessons", "Ona masomo yote")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/labs?subject=${subject.id}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${subject.lightClass} ${subject.colorClass}`}
              >
                <SubjectIcon icon={subject.icon} className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-extrabold">
                  {language === "en" ? subject.name : subject.nameSw}
                </span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">
                  {labs.filter((lab) => lab.subject === subject.id).length}{" "}
                  {tr("lessons", "masomo")}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
