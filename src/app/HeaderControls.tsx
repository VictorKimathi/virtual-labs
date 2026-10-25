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

const tones = {
  default: {
    language:
      "min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-extrabold transition-colors hover:border-kenya-green hover:bg-green-50 dark:border-slate-700 dark:hover:bg-slate-800",
    theme: iconButton,
    on: "text-kenya-green dark:text-green-400",
    off: "text-slate-400",
    divider: "text-slate-300",
  },
  inverse: {
    language:
      "min-h-10 rounded-full border border-white/20 px-3 text-xs font-extrabold transition-colors hover:bg-white/10",
    theme:
      "flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10",
    on: "text-white",
    off: "text-white/40",
    divider: "text-white/30",
  },
};

type Props = { tone?: keyof typeof tones };

/** Language and theme switches shared by every layout's header. */
export function HeaderControls({ tone = "default" }: Props) {
  const { language, toggleLanguage, tr } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const styles = tones[tone];
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={tr("Switch language", "Badilisha lugha")}
        className={styles.language}
      >
        <span className={language === "en" ? styles.on : styles.off}>EN</span>
        <span className={`mx-1 ${styles.divider}`}>/</span>
        <span className={language === "sw" ? styles.on : styles.off}>SW</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={tr(
          `Switch to ${theme === "light" ? "dark" : "light"} theme`,
          "Badilisha mandhari",
        )}
        className={styles.theme}
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
