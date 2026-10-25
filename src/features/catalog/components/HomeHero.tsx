import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { useTheme } from "../../../app/useTheme";
import { SceneErrorBoundary } from "../../../shared/errors/SceneErrorBoundary";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { subjects } from "../data/catalog";
import type { SubjectId } from "../data/catalog.types";
import { orbits } from "../hero.config";
import { HeroBackdrop } from "./HeroBackdrop";
import { pillPrimary, pillSecondary } from "./landing.styles";

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

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export function HomeHero() {
  const { language, tr } = useLanguage();
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState<SubjectId | null>(null);
  const visible = useIsVisible(panel);
  const labSubjects = subjects.filter((subject) =>
    orbits.some((orbit) => orbit.subject === subject.id),
  );
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto flex max-w-screen-2xl flex-col items-center px-4 pb-16 pt-36 text-center sm:px-10 sm:pt-48 lg:pb-24 lg:pt-60"
    >
      <motion.h1
        id="hero-heading"
        {...rise(0)}
        className="max-w-4xl text-balance text-5xl font-bold leading-none tracking-tighter sm:text-7xl lg:text-8xl"
      >
        {tr("Science you can step inside", "Sayansi unayoweza kuingia ndani")}
      </motion.h1>
      <motion.p
        {...rise(0.1)}
        className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-stone-500 dark:text-stone-400"
      >
        {tr(
          "Real physics, chemistry and biology practicals. No equipment needed.",
          "Majaribio halisi ya fizikia, kemia na biolojia. Bila kuhitaji vifaa.",
        )}
      </motion.p>
      <motion.div
        {...rise(0.2)}
        className="mt-10 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row"
      >
        <Link to="/signup" className={`group ${pillPrimary}`}>
          {tr("Get started free", "Anza bure")}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
        <Link to="/login" className={pillSecondary}>
          {tr("Log in", "Ingia")}
        </Link>
      </motion.div>

      <motion.div
        ref={setPanel}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative isolate mt-16 h-112 w-full max-w-screen-2xl overflow-hidden rounded-4xl bg-linear-to-br from-sky-100 via-stone-50 to-emerald-100 shadow-2xl sm:h-144 lg:mt-24 lg:h-200 dark:from-stone-900 dark:via-stone-950 dark:to-emerald-950"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <SceneErrorBoundary fallback={() => <HeroBackdrop />}>
            <Suspense fallback={<HeroBackdrop />}>
              {panel && (
                <HeroScene
                  dark={theme === "dark"}
                  active={active}
                  eventSource={panel}
                  animate={visible && !reducedMotion}
                />
              )}
            </Suspense>
          </SceneErrorBoundary>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-stone-950/20 to-transparent"
        />
        <ul className="absolute inset-x-4 bottom-4 flex flex-wrap justify-center gap-2 sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 sm:flex-nowrap sm:rounded-full sm:border sm:border-white/40 sm:bg-white/30 sm:p-2 sm:backdrop-blur-xl dark:sm:border-white/10 dark:sm:bg-stone-900/40">
          {labSubjects.map((subject) => (
            <li key={subject.id}>
              <Link
                to={`/workbench/${subject.id}`}
                onPointerEnter={() => setActive(subject.id)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(subject.id)}
                onBlur={() => setActive(null)}
                className="flex min-h-11 items-center gap-2 rounded-full border border-white/50 bg-white/70 py-1.5 pl-2 pr-4 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-white dark:border-white/10 dark:bg-stone-900/70 dark:hover:bg-stone-900"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full ${subject.lightClass} ${subject.colorClass}`}
                >
                  <SubjectIcon icon={subject.icon} className="size-4" />
                </span>
                {language === "en" ? subject.name : subject.nameSw}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
