import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
};

export function FilterChip({ active, onClick, children, count }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors ${active ? "border-kenya-green bg-kenya-green text-white shadow-md shadow-kenya-green/25" : "border-slate-300 bg-white hover:border-kenya-green hover:bg-green-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"}`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
