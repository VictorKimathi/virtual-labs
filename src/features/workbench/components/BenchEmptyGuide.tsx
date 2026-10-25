import { ChartLine, MousePointerClick, PackagePlus } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";

/** Shown on an empty bench: how to start, in three steps. */
export function BenchEmptyGuide({ tip }: { tip?: string }) {
  const { tr } = useLanguage();
  const steps = [
    {
      icon: PackagePlus,
      title: tr("Add", "Ongeza"),
      text: tr("Drag equipment in", "Buruta vifaa ndani"),
    },
    {
      icon: MousePointerClick,
      title: tr("Set up", "Panga"),
      text: tr("Click it to adjust", "Bofya kurekebisha"),
    },
    {
      icon: ChartLine,
      title: tr("Measure", "Pima"),
      text: tr("Record and graph", "Rekodi na chora"),
    },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
      <div className="text-center">
        <ol className="flex items-start justify-center gap-3 sm:gap-6">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className="flex w-24 flex-col items-center gap-1 sm:w-32"
            >
              <span className="relative flex size-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-md dark:bg-slate-800 dark:text-slate-200 sm:size-16">
                <Icon className="size-6 sm:size-8" aria-hidden="true" />
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white dark:bg-white dark:text-slate-900">
                  {index + 1}
                </span>
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                {title}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {text}
              </span>
            </li>
          ))}
        </ol>
        {tip && (
          <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
            {tip}
          </p>
        )}
      </div>
    </div>
  );
}
