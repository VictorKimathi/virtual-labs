import { useLanguage } from "../../../app/useLanguage";

const placeholders = Array.from({ length: 8 }, (_, index) => index);

export function CatalogSkeleton() {
  const { tr } = useLanguage();
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">
        {tr("Loading simulations…", "Inapakia uigaji…")}
      </span>
      <ul
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-hidden="true"
      >
        {placeholders.map((index) => (
          <li
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="aspect-3/2 bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
