import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export type Accent = "green" | "red" | "blue" | "orange";

const accents: Record<
  Accent,
  { glow: string; secondary: string; tile: string; eyebrow: string }
> = {
  green: {
    glow: "bg-kenya-green/25",
    secondary: "bg-subject-physics/15",
    tile: "bg-kenya-green text-white shadow-kenya-green/30",
    eyebrow: "text-kenya-green dark:text-green-400",
  },
  red: {
    glow: "bg-kenya-red/20",
    secondary: "bg-subject-agriculture/15",
    tile: "bg-kenya-red text-white shadow-kenya-red/30",
    eyebrow: "text-kenya-red dark:text-red-300",
  },
  blue: {
    glow: "bg-subject-physics/25",
    secondary: "bg-subject-biology/15",
    tile: "bg-subject-physics text-white shadow-subject-physics/30",
    eyebrow: "text-subject-physics dark:text-blue-300",
  },
  orange: {
    glow: "bg-subject-chemistry/25",
    secondary: "bg-kenya-red/10",
    tile: "bg-subject-chemistry text-white shadow-subject-chemistry/30",
    eyebrow: "text-subject-chemistry dark:text-orange-300",
  },
};

type Props = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  accent?: Accent;
  actions?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  accent = "green",
  actions,
  children,
}: Props) {
  const style = accents[accent];
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
    >
      <span
        aria-hidden="true"
        className={`absolute -right-16 -top-24 -z-10 size-80 rounded-full blur-3xl ${style.glow}`}
      />
      <span
        aria-hidden="true"
        className={`absolute -bottom-28 left-1/3 -z-10 size-64 rounded-full blur-3xl ${style.secondary}`}
      />
      <Icon
        aria-hidden="true"
        className="absolute -right-6 -top-6 -z-10 hidden size-48 -rotate-12 text-slate-900/5 dark:text-white/5 sm:block"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-lg sm:size-16 ${style.tile}`}
        >
          <Icon className="size-7 sm:size-8" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className={`text-xs font-extrabold uppercase tracking-widest ${style.eyebrow}`}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-balance text-3xl font-black tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-pretty leading-7 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </motion.header>
  );
}
