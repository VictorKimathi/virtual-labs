import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { TiltCard } from "../../../shared/ui/TiltCard";
import { showcaseLabs } from "../data/showcase";

/** The virtual labs, as big cards with a picture of each one. */
export function LabShowcase() {
  const { language, tr } = useLanguage();
  const index = language === "en" ? 0 : 1;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {showcaseLabs.map(({ Scene, ...lab }) => (
        <TiltCard
          key={lab.id}
          to={lab.to}
          className={`group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900 ${lab.border}`}
        >
          <span
            className={`block h-56 bg-linear-to-br p-4 sm:h-64 ${lab.sceneClass}`}
          >
            <Scene />
          </span>
          <span className="flex flex-1 flex-col gap-4 p-6">
            <span className="block">
              <span className="block text-3xl font-black tracking-tight sm:text-4xl">
                {lab.name[index]}
              </span>
              <span className="mt-1 block text-base font-semibold text-slate-600 dark:text-slate-300">
                {lab.tagline[index]}
              </span>
            </span>
            <span className="flex flex-wrap gap-2">
              {lab.topics.map(({ icon: Icon, label }) => (
                <span
                  key={label[0]}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${lab.accent}`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label[index]}
                </span>
              ))}
            </span>
            <span className="mt-auto flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {lab.detail[index]}
              </span>
              <span
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white transition-colors ${lab.button}`}
              >
                {tr("Enter lab", "Ingia")}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </span>
          </span>
        </TiltCard>
      ))}
    </div>
  );
}
