import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { labs, subjects } from "../data/catalog";
import { portalStyles } from "../hero.config";
import { TiltCard } from "../../../shared/ui/TiltCard";

export function SubjectPortals() {
  const { language, tr } = useLanguage();
  return (
    <section aria-labelledby="subjects-heading">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2
          id="subjects-heading"
          className="text-2xl font-black tracking-tight"
        >
          {tr("Pick a subject", "Chagua somo")}
        </h2>
        <Link
          to="/labs"
          className="shrink-0 text-sm font-bold text-kenya-green dark:text-green-400"
        >
          {tr("See all lessons", "Ona masomo yote")}
        </Link>
      </div>
      {subjects.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          {tr(
            "No subjects yet. Check back soon.",
            "Hakuna masomo bado. Rudi hivi karibuni.",
          )}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => {
            const style = portalStyles[subject.id];
            const lessons = labs.filter((lab) => lab.subject === subject.id);
            const ready = lessons.filter((lab) => lab.available).length;
            return (
              <TiltCard
                key={subject.id}
                to={`/labs?subject=${subject.id}`}
                wrapperClassName="sm:max-xl:last:col-span-2"
                className={`group relative isolate flex h-full min-h-56 flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-colors dark:border-slate-800 dark:bg-slate-900 ${style.border}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-16 -right-16 -z-10 size-64 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125 ${style.glow}`}
                />
                <SubjectIcon
                  icon={subject.icon}
                  className={`size-20 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110 ${style.text}`}
                />
                <span className="block">
                  <span className="block text-2xl font-black tracking-tight sm:text-3xl">
                    {language === "en" ? subject.name : subject.nameSw}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <span>
                      {lessons.length} {tr("lessons", "masomo")} · {ready}{" "}
                      {tr("ready", "tayari")}
                    </span>
                    <ArrowRight
                      className="size-5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </TiltCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
