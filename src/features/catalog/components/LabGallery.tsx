import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { showcaseLabs } from "../../workbench/data/showcase";
import { section, sectionHeading } from "./landing.styles";

/** The four labs as large cards, with links to the rest of the product. */
export function LabGallery() {
  const { language, tr } = useLanguage();
  const index = language === "en" ? 0 : 1;
  const more = [
    { to: "/workbench", label: tr("All labs", "Maabara zote") },
    { to: "/simulations", label: tr("Simulations", "Uigaji") },
    { to: "/labs", label: tr("Guided lessons", "Masomo ya kuongozwa") },
    { to: "/schools", label: tr("School plans", "Mipango ya shule") },
  ];
  return (
    <section
      id="labs"
      aria-labelledby="labs-heading"
      className={`${section} flex scroll-mt-28 flex-col items-center py-24 lg:py-40`}
    >
      <h2 id="labs-heading" className={`mb-10 text-center ${sectionHeading}`}>
        {tr("Choose your lab.", "Chagua maabara yako.")}
      </h2>
      <nav
        aria-label={tr("Explore", "Gundua")}
        className="mb-14 flex flex-wrap justify-center gap-3"
      >
        {more.map((link, linkIndex) => (
          <Link
            key={link.to}
            to={link.to}
            className={`rounded-full px-6 py-2 text-sm font-semibold shadow-sm transition-colors ${linkIndex === 0 ? "bg-stone-950 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200" : "bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800"}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <ul className="grid w-full gap-6 md:grid-cols-2 lg:gap-8">
        {showcaseLabs.map(({ Scene, ...lab }) => (
          <li key={lab.id}>
            <Link
              to={lab.to}
              className={`group relative flex h-100 flex-col justify-end overflow-hidden rounded-4xl border border-stone-200/40 bg-linear-to-br p-8 shadow-sm dark:border-stone-800/40 ${lab.sceneClass}`}
            >
              <span className="absolute inset-x-0 top-0 bottom-24 p-8 transition-transform duration-500 group-hover:scale-105">
                <Scene />
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-stone-950/20 to-transparent"
              />
              <span className="relative flex items-end justify-between gap-4 text-white">
                <span>
                  <span className="mb-2 block text-2xl font-bold">
                    {lab.name[index]}
                  </span>
                  <span className="block text-white/80">
                    {lab.tagline[index]}
                  </span>
                </span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-stone-950">
                  <ArrowRight className="size-5" aria-hidden="true" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
