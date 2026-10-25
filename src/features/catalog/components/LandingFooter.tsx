import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { BrandMark } from "./BrandMark";

/** A dark footer with the brand and every way into the product. */
export function LandingFooter() {
  const { tr } = useLanguage();
  const columns = [
    {
      title: tr("Labs", "Maabara"),
      links: [
        { to: "/workbench/physics", label: tr("Physics", "Fizikia") },
        { to: "/workbench/chemistry", label: tr("Chemistry", "Kemia") },
        { to: "/workbench/biology", label: tr("Biology", "Biolojia") },
        { to: "/biology/anatomy", label: tr("Human anatomy", "Anatomia") },
      ],
    },
    {
      title: tr("Explore", "Gundua"),
      links: [
        { to: "/simulations", label: tr("Simulations", "Uigaji") },
        { to: "/labs", label: tr("Guided lessons", "Masomo ya kuongozwa") },
        { to: "/schools", label: tr("School plans", "Mipango ya shule") },
      ],
    },
    {
      title: tr("Account", "Akaunti"),
      links: [
        { to: "/login", label: tr("Log in", "Ingia") },
        { to: "/signup", label: tr("Create an account", "Unda akaunti") },
      ],
    },
  ];
  return (
    <footer className="relative rounded-t-4xl bg-stone-950 px-4 pb-16 pt-24 text-white sm:px-10 lg:rounded-t-5xl lg:pt-32 dark:border-t dark:border-white/10 dark:bg-black">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-24 grid gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-24">
          <div className="flex flex-col gap-8">
            <BrandMark className="size-10 text-white/60" />
            <p className="max-w-xs text-white/50">
              {tr(
                "Virtual physics, chemistry and biology labs for Kenyan classrooms.",
                "Maabara pepe za fizikia, kemia na biolojia kwa madarasa ya Kenya.",
              )}
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="border-t border-white/10 pt-8 text-xs text-white/40">
          © Bunifu Labz
        </p>
      </div>
    </footer>
  );
}
