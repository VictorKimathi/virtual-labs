export const card =
  "rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6";

export const input =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold outline-none transition-colors focus:border-kenya-green focus:ring-2 focus:ring-kenya-green/20 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-green-400";

export const textarea = `${input} min-h-28 py-2.5 leading-6`;

export const label = "text-sm font-bold";

export const hint =
  "mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400";

export const fieldError =
  "mt-1 text-xs font-bold text-kenya-red dark:text-red-300";

export const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-kenya-green px-5 text-sm font-extrabold text-white shadow-lg shadow-kenya-green/25 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

export const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold transition-colors hover:border-kenya-green hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800";

export const dangerButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-kenya-red transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900";

export const sectionTitle = "text-lg font-black tracking-tight";

export const badge =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold";

export const badgeTones = {
  green: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  amber: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
} as const;
