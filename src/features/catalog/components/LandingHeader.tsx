import { Link } from "react-router-dom";
import { HeaderControls } from "../../../app/HeaderControls";
import { useLanguage } from "../../../app/useLanguage";
import { BrandMark } from "./BrandMark";

const navLink =
  "text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:text-white";

/** A floating pill: brand, page links, language and theme, and the way in. */
export function LandingHeader() {
  const { tr } = useLanguage();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <div className="pointer-events-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-white/10 bg-stone-950 px-2 text-white shadow-xl dark:bg-stone-900">
        <div className="flex min-w-0 items-center gap-6 pl-1">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 text-sm font-bold tracking-tight"
          >
            <BrandMark />
            <span className="truncate">Bunifu Labz</span>
          </Link>
          <nav
            aria-label={tr("Main", "Kuu")}
            className="hidden items-center gap-6 md:flex"
          >
            <a href="#labs" className={navLink}>
              {tr("Labs", "Maabara")}
            </a>
            <a href="#how" className={navLink}>
              {tr("Classrooms", "Madarasa")}
            </a>
            <Link to="/simulations" className={navLink}>
              {tr("Simulations", "Uigaji")}
            </Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="hidden sm:block">
            <HeaderControls tone="inverse" />
          </div>
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:text-white"
          >
            {tr("Log in", "Ingia")}
          </Link>
          <Link
            to="/signup"
            className="inline-flex min-h-10 items-center rounded-full border border-white/30 px-4 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white hover:text-stone-950"
          >
            {tr("Join", "Jiunge")}
          </Link>
        </div>
      </div>
    </header>
  );
}
