import {
  AudioWaveform,
  Atom,
  BookOpen,
  ChartNoAxesColumn,
  FlaskConical,
  House,
  Menu,
  MonitorPlay,
  Moon,
  Orbit,
  School,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "./useLanguage";
import { useTheme } from "./useTheme";

type NavItem = {
  to: string;
  label: string;
  icon: typeof House;
  alsoActive?: string[];
};

type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

export function AppLayout() {
  const { language, toggleLanguage, tr } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navSections: NavSection[] = [
    {
      id: "learn",
      label: tr("Learn", "Jifunze"),
      items: [
        {
          to: "/labs",
          label: tr("Guided lessons", "Masomo yenye mwongozo"),
          icon: BookOpen,
        },
      ],
    },
    {
      id: "practice",
      label: tr("Practice", "Fanya mazoezi"),
      items: [
        {
          to: "/workbench",
          label: tr("Practice bench", "Benchi la mazoezi"),
          icon: FlaskConical,
          alsoActive: ["/chemistry", "/sandbox"],
        },
      ],
    },
    {
      id: "explore",
      label: tr("Explore", "Chunguza"),
      items: [
        {
          to: "/simulations",
          label: tr("PhET simulations", "Uigaji wa PhET"),
          icon: MonitorPlay,
        },
        {
          to: "/falstad",
          label: tr("Circuits & waves", "Sakiti na mawimbi"),
          icon: AudioWaveform,
        },
        {
          to: "/physicshub",
          label: tr("PhysicsHub", "PhysicsHub"),
          icon: Orbit,
        },
      ],
    },
  ];
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${isActive ? "bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`;
  const navigation = (
    <div className="space-y-5 pt-4">
      <NavLink
        to="/"
        end
        onClick={() => setMenuOpen(false)}
        className={({ isActive }) => linkClass(isActive)}
      >
        <House className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate text-sm font-bold">
          {tr("Home", "Nyumbani")}
        </span>
      </NavLink>
      {navSections.map(({ id, label: sectionLabel, items }) => (
        <section key={id} aria-labelledby={`${id}-nav`}>
          <h2
            id={`${id}-nav`}
            className="px-3 text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500"
          >
            {sectionLabel}
          </h2>
          <div className="mt-1 space-y-1">
            {items.map(({ to, label, icon: Icon, alsoActive }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  linkClass(
                    isActive ||
                      Boolean(
                        alsoActive?.some((prefix) =>
                          pathname.startsWith(prefix),
                        ),
                      ),
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 truncate text-sm font-bold">
                  {label}
                </span>
              </NavLink>
            ))}
          </div>
        </section>
      ))}
      <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
        <NavLink
          to="/progress"
          end
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) => linkClass(isActive)}
        >
          <ChartNoAxesColumn className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate text-sm font-bold">
            {tr("Progress", "Maendeleo")}
          </span>
        </NavLink>
        <NavLink
          to="/schools"
          end
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) => linkClass(isActive)}
        >
          <School className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate text-sm font-bold">
            {tr("School plans", "Mipango ya shule")}
          </span>
        </NavLink>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={
                menuOpen
                  ? tr("Close menu", "Funga menyu")
                  : tr("Open menu", "Fungua menyu")
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 md:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link to="/" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kenya-green text-white">
                <Atom className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="truncate text-base font-extrabold tracking-tight sm:text-lg">
                Bunifu Labz
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={tr("Switch language", "Badilisha lugha")}
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-extrabold dark:border-slate-700"
            >
              <span
                className={
                  language === "en"
                    ? "text-kenya-green dark:text-green-400"
                    : "text-slate-400"
                }
              >
                EN
              </span>
              <span className="mx-1 text-slate-300">/</span>
              <span
                className={
                  language === "sw"
                    ? "text-kenya-green dark:text-green-400"
                    : "text-slate-400"
                }
              >
                SW
              </span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={tr(
                `Switch to ${theme === "light" ? "dark" : "light"} theme`,
                "Badilisha mandhari",
              )}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>
      <aside className="fixed inset-y-0 left-0 top-16 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <nav aria-label={tr("Main navigation", "Urambazaji mkuu")}>
          {navigation}
        </nav>
      </aside>
      {menuOpen && (
        <>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={tr("Close navigation", "Funga urambazaji")}
            className="fixed inset-0 top-16 z-20 bg-black/40 md:hidden"
          />
          <aside className="fixed inset-y-0 left-0 top-16 z-30 w-64 border-r border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
            <nav aria-label={tr("Main navigation", "Urambazaji mkuu")}>
              {navigation}
            </nav>
          </aside>
        </>
      )}
      <div className="md:pl-64">
        <main
          id="main"
          className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 sm:py-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
