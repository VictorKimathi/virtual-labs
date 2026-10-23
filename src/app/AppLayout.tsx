import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { subjects } from "../features/catalog/data/catalog";
import { SubjectIcon } from "../shared/ui/SubjectIcon";
import { useTheme } from "./useTheme";

export function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = (
    <>
      <NavLink
        to="/"
        end
        onClick={() => setMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`
        }
      >
        Overview
      </NavLink>
      <p className="mt-8 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">
        Subjects
      </p>
      {subjects.map((subject) => (
        <NavLink
          key={subject.id}
          to={`/${subject.id}`}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`
          }
        >
          <SubjectIcon icon={subject.icon} className="h-5 w-5" />
          {subject.name}
        </NavLink>
      ))}
    </>
  );
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 text-lg font-black tracking-tight"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white">
            <FlaskConicalMark />
          </span>
          Virtual Labs
        </Link>
        <div className="mt-12 space-y-1">{nav}</div>
        <div className="mt-auto rounded-2xl bg-teal-50 p-4 text-sm text-teal-900 dark:bg-teal-950 dark:text-teal-100">
          <p className="font-bold">Explore with curiosity</p>
          <p className="mt-1 text-teal-700 dark:text-teal-200">
            Learn the idea. Preview the lab. Run the simulation.
          </p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Your science workspace
            </span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
        </header>
        {menuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="absolute z-20 w-full space-y-1 border-b border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 lg:hidden"
          >
            {nav}
          </nav>
        )}
        <main
          id="main"
          className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
        >
          <Outlet />
        </main>
        <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-6 text-xs text-slate-500 dark:border-slate-800 sm:px-8">
          <span>Virtual Labs · Learn by doing</span>
          <a
            href="https://phet.colorado.edu"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-teal-600"
          >
            Featured simulations by PhET <ArrowUpRight className="h-3 w-3" />
          </a>
        </footer>
      </div>
    </div>
  );
}

function FlaskConicalMark() {
  return (
    <span aria-hidden="true" className="text-xl">
      ✳
    </span>
  );
}
