import { Atom, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { useLanguage } from "./useLanguage";
import { useTheme } from "./useTheme";

export const iconButton =
  "flex size-11 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:border-kenya-green hover:bg-green-50 dark:border-slate-700 dark:hover:bg-slate-800";

export function BrandLink() {
  return (
    <Link to="/" className="group flex min-w-0 items-center gap-2.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-kenya-green to-emerald-600 text-white shadow-md shadow-kenya-green/30 transition-transform duration-500 group-hover:rotate-180">
        <Atom className="size-6" aria-hidden="true" />
      </span>
      <span className="truncate text-base font-black tracking-tight sm:text-lg">
        Bunifu Labz
      </span>
    </Link>
  );
}

/** Language and theme switches shared by every layout's header. */
export function HeaderControls() {
  const { language, toggleLanguage, tr } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={tr("Switch language", "Badilisha lugha")}
        className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-extrabold transition-colors hover:border-kenya-green hover:bg-green-50 dark:border-slate-700 dark:hover:bg-slate-800"
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
        className={iconButton}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {theme === "light" ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
