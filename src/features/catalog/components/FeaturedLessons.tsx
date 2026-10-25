import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { showcaseLabs } from "../../workbench/data/showcase";
import { labs, subjects } from "../data/catalog";
import { section, sectionHeading } from "./landing.styles";

const featured = subjects.flatMap((subject) => {
  const lab = labs.find(
    (item) => item.available && item.subject === subject.id,
  );
  const scene = showcaseLabs.find((item) => item.id === subject.id);
  return lab ? [{ lab, subject, scene }] : [];
});

/** One ready-to-run guided lesson per subject. */
export function FeaturedLessons() {
  const { language, tr } = useLanguage();
  if (featured.length === 0) return null;
  const en = language === "en";
  return (
    <section
      aria-labelledby="lessons-heading"
      className={`${section} py-16 lg:py-30`}
    >
      <div className="mb-12 flex items-end justify-between gap-4">
        <h2 id="lessons-heading" className={sectionHeading}>
          {tr("Start with a guided lesson", "Anza na somo la kuongozwa")}
        </h2>
        <Link
          to="/labs"
          className="shrink-0 border-b border-current pb-1 text-sm font-bold transition-colors hover:text-kenya-green dark:hover:text-green-400"
        >
          {tr("View all", "Tazama yote")}
        </Link>
      </div>
      <ul className="grid gap-8 md:grid-cols-3">
        {featured.map(({ lab, subject, scene }) => (
          <li key={lab.id}>
            <Link to={`/labs/${lab.id}`} className="group block">
              <span
                className={`mb-6 flex h-72 items-center justify-center overflow-hidden rounded-4xl border border-stone-200/40 p-8 shadow-xl lg:h-112 dark:border-stone-800/40 ${scene ? `bg-linear-to-br ${scene.sceneClass}` : `${subject.lightClass} ${subject.colorClass}`}`}
              >
                <span className="flex size-full items-center justify-center transition-transform duration-500 group-hover:scale-105">
                  {scene ? (
                    <scene.Scene />
                  ) : (
                    <SubjectIcon icon={subject.icon} className="size-24" />
                  )}
                </span>
              </span>
              <span className="mb-3 block text-xs text-stone-500 dark:text-stone-400">
                {en ? subject.name : subject.nameSw} ·{" "}
                {tr(`Grade ${lab.grade}`, `Gredi ${lab.grade}`)} ·{" "}
                {lab.duration}
              </span>
              <span className="block text-xl font-bold transition-colors group-hover:text-kenya-green dark:group-hover:text-green-400">
                {en ? lab.title : lab.titleSw}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
