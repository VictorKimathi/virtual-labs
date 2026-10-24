import { Compass } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../app/useLanguage";

export default function NotFoundPage() {
  const { tr } = useLanguage();
  return (
    <div className="relative isolate flex min-h-128 flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <span
        aria-hidden="true"
        className="absolute -left-20 -top-20 -z-10 size-80 rounded-full bg-subject-physics/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-24 -right-16 -z-10 size-80 rounded-full bg-kenya-red/15 blur-3xl"
      />
      <motion.span
        animate={{ rotate: [0, 12, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="flex size-16 items-center justify-center rounded-2xl bg-kenya-green text-white shadow-lg shadow-kenya-green/30"
      >
        <Compass className="size-8" aria-hidden="true" />
      </motion.span>
      <p className="mt-4 bg-linear-to-r from-kenya-green via-subject-physics to-kenya-red bg-clip-text text-8xl font-black tracking-tighter text-transparent dark:from-green-400 dark:via-sky-400 dark:to-red-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">
        {tr("Page not found", "Ukurasa haujapatikana")}
      </h1>
      <p className="mt-3 max-w-md text-slate-600 dark:text-slate-300">
        {tr(
          "This experiment is not in our lab. Let's get you back to something that is.",
          "Jaribio hili halipo kwenye maabara yetu. Turudi kwenye kitu kilichopo.",
        )}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-12 items-center rounded-2xl bg-kenya-green px-6 text-sm font-extrabold text-white shadow-lg shadow-kenya-green/25 transition-transform hover:-translate-y-0.5"
        >
          {tr("Go home", "Nenda nyumbani")}
        </Link>
        <Link
          to="/labs"
          className="inline-flex min-h-12 items-center rounded-2xl border border-slate-300 px-6 text-sm font-extrabold transition-colors hover:border-kenya-green dark:border-slate-700"
        >
          {tr("Browse lessons", "Tazama masomo")}
        </Link>
      </div>
    </div>
  );
}
