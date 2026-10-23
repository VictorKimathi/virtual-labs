import { useLanguage } from "../../../app/useLanguage";

export function PlantCellDiagram() {
  const { tr } = useLanguage();
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
      <p className="text-xs font-extrabold uppercase tracking-widest text-kenya-green dark:text-green-300">
        {tr("Illustrative plant cell", "Seli ya mmea ya mfano")}
      </p>
      <div className="mx-auto mt-4 flex h-40 max-w-64 items-center justify-center rounded-3xl border-8 border-green-700 bg-green-200 p-3 dark:border-green-500 dark:bg-green-900">
        <div className="relative flex h-full w-full items-center justify-center rounded-2xl border-4 border-green-500 bg-lime-100 dark:bg-green-800">
          <span className="absolute left-4 top-4 h-5 w-9 rotate-45 rounded-full bg-green-600" />
          <span className="absolute right-4 top-7 h-5 w-9 -rotate-45 rounded-full bg-green-600" />
          <span className="absolute bottom-4 left-7 h-5 w-9 rounded-full bg-green-600" />
          <span className="h-12 w-12 rounded-full border-4 border-purple-500 bg-purple-300 dark:bg-purple-700" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
        <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">
          {tr("Cell wall", "Ukuta wa seli")}
        </span>
        <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">
          {tr("Nucleus", "Kiini")}
        </span>
        <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">
          {tr("Chloroplasts", "Kloroplasti")}
        </span>
      </div>
    </div>
  );
}
