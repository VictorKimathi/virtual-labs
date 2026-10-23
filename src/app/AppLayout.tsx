import {
  Atom,
  BookOpen,
  ChartNoAxesColumn,
  FlaskConical,
  House,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "./useLanguage";
import { useTheme } from "./useTheme";

export function AppLayout() {
  const { language, toggleLanguage, tr } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navItems = [
    {
      to: "/",
      label: tr("Home", "Nyumbani"),
      hint: tr("Start here", "Anzia hapa"),
      icon: House,
      end: true,
    },
    {
      to: "/labs",
      label: tr("Guided lessons", "Masomo yenye mwongozo"),
      hint: tr("Step-by-step lab lessons", "Masomo ya maabara hatua kwa hatua"),
      icon: BookOpen,
      end: false,
    },
    {
      to: "/workbench",
      label: tr("Practice bench", "Benchi la mazoezi"),
      hint: tr("Build and test freely", "Unda na ujaribu huru"),
      icon: FlaskConical,
      end: false,
      alsoActive: ["/chemistry", "/sandbox"],
    },
    {
      to: "/progress",
      label: tr("My progress", "Maendeleo yangu"),
      hint: tr("Scores and badges", "Alama na beji"),
      icon: ChartNoAxesColumn,
      end: false,
    },
  ];
  const navigation = (
    <div className="space-y-1 pt-4">
      {navItems.map(({ to, label, hint, icon: Icon, end, alsoActive }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${isActive || alsoActive?.some((prefix) => pathname.startsWith(prefix)) ? "bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`
          }
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-sm font-bold">{label}</span>
            <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {hint}
            </span>
          </span>
        </NavLink>
      ))}
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
                Kenya Virtual Science Lab
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs font-semibold text-slate-500 lg:inline">
              {tr("CBE STEM workspace", "Nafasi ya CBE STEM")}
            </span>
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
