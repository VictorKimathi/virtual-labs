import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  icon: LucideIcon;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  actionLabel,
  onAction,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center dark:border-slate-700 dark:bg-slate-900/60"
    >
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-extrabold">{title}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-kenya-green px-5 text-sm font-bold text-white shadow-lg shadow-kenya-green/25 transition-transform hover:-translate-y-0.5"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
