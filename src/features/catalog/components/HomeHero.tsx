import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { useTheme } from "../../../app/useTheme";
import { SceneErrorBoundary } from "../../../shared/errors/SceneErrorBoundary";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { labs, subjects } from "../data/catalog";
import type { SubjectId } from "../data/catalog.types";
import { orbits } from "../hero.config";
import { HeroBackdrop } from "./HeroBackdrop";

const HeroScene = lazy(() =>
  import("./HeroScene").then((module) => ({ default: module.HeroScene })),
);

function useIsVisible(element: HTMLElement | null) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return visible;
}

export function HomeHero() {
  const { language, tr } = useLanguage();
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState<SubjectId | null>(null);
  const visible = useIsVisible(container);
  const orbitSubjects = subjects.filter((subject) =>
    orbits.some((orbit) => orbit.subject === subject.id),
  );
  return (
    <section
      ref={setContainer}
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-192 items-end overflow-hidden sm:min-h-176 rounded-3xl border border-slate-200 bg-linear-to-br from-sky-100 via-white to-emerald-100 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 lg:min-h-144 lg:items-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 -z-10 size-96 rounded-full bg-subject-physics/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 -z-10 size-96 rounded-full bg-subject-biology/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/3 top-0 -z-10 size-72 rounded-full bg-subject-chemistry/20 blur-3xl"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <SceneErrorBoundary fallback={() => <HeroBackdrop />}>
          <Suspense fallback={<HeroBackdrop />}>
            {container && (
              <HeroScene
                dark={theme === "dark"}
                active={active}
                eventSource={container}
                animate={visible && !reducedMotion}
              />
            )}
          </Suspense>
        </SceneErrorBoundary>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-white/90 via-white/50 to-transparent dark:from-slate-950/90 dark:via-slate-950/50 lg:bg-linear-to-r lg:from-white/80 lg:via-white/30 lg:to-transparent dark:lg:from-slate-950/80 dark:lg:via-slate-950/30"
      />
      <div className="relative w-full max-w-2xl p-6 sm:p-10 lg:px-14 lg:py-12">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-kenya-green backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/70 dark:text-green-300"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {tr("Virtual science labs", "Maabara pepe za sayansi")}
        </motion.span>
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-balance text-4xl font-black leading-none tracking-tighter sm:text-6xl lg:text-7xl"
        >
          {tr("Science you can ", "Sayansi unayoweza ")}
          <span className="bg-linear-to-r from-kenya-green via-subject-physics to-kenya-red bg-clip-text text-transparent dark:from-green-400 dark:via-sky-400 dark:to-red-400">
            {tr("step inside.", "kuingia ndani.")}
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-700 dark:text-slate-300 sm:text-lg"
        >
          {tr(
            "Run real experiments in Physics, Chemistry and Biology. No equipment, no limits, right from your browser.",
            "Fanya majaribio halisi ya Fizikia, Kemia na Biolojia. Bila vifaa, bila mipaka, moja kwa moja kwenye kivinjari chako.",
          )}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Link
            to="/labs"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kenya-green sm:w-auto px-6 text-sm font-extrabold text-white shadow-xl shadow-kenya-green/30 transition-transform hover:-translate-y-0.5"
          >
            {tr("Start learning", "Anza kujifunza")}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/workbench"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/70 sm:w-auto px-6 text-sm font-extrabold backdrop-blur-md transition-transform hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/70"
          >
            <FlaskConical className="size-4" aria-hidden="true" />
            {tr("Open the bench", "Fungua benchi")}
          </Link>
        </motion.div>
        <motion.ul
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {orbitSubjects.map((subject) => (
            <li key={subject.id}>
              <Link
                to={`/labs?subject=${subject.id}`}
                onPointerEnter={() => setActive(subject.id)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(subject.id)}
                onBlur={() => setActive(null)}
                className="flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white/70 py-1.5 pl-2 pr-4 text-sm font-extrabold backdrop-blur-md transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full ${subject.lightClass} ${subject.colorClass}`}
                >
                  <SubjectIcon icon={subject.icon} className="size-4" />
                </span>
                {language === "en" ? subject.name : subject.nameSw}
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {labs.filter((lab) => lab.subject === subject.id).length}
                </span>
              </Link>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
