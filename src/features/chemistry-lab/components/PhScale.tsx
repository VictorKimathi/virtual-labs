import { motion } from "motion/react";
import { useLanguage } from "../../../app/useLanguage";
import { mixColor, toCss } from "../chem/color";
import type { Indicator } from "../chemistry.types";

export type ScaleMarker = { id: string; ph: number; label: string };

type PhScaleProps = { indicator: Indicator; markers: ScaleMarker[] };

const ticks = Array.from({ length: 15 }, (_, ph) => ph);

export function PhScale({ indicator, markers }: PhScaleProps) {
  const { language, tr } = useLanguage();
  const gradient = ticks
    .map((ph) => `${toCss(mixColor(indicator.stops, ph))} ${(ph / 14) * 100}%`)
    .join(", ");
  return (
    <section
      aria-label={tr("Colour chart", "Chati ya rangi")}
      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {tr("Colour chart", "Chati ya rangi")}
        </h2>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {indicator.name[language]}
        </span>
      </div>
      <div className="relative mt-8 pb-1">
        <div
          className="h-5 rounded-full ring-1 ring-slate-300 dark:ring-slate-600"
          style={{
            backgroundImage: `linear-gradient(to right, ${gradient})`,
          }}
        />
        {markers.map((marker) => (
          <motion.div
            key={marker.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0, left: `${(marker.ph / 14) * 100}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="absolute -top-7 flex w-0 flex-col items-center"
          >
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-extrabold text-white dark:bg-white dark:text-slate-900">
              {marker.label}
            </span>
            <span className="h-2 w-0.5 bg-slate-900 dark:bg-white" />
          </motion.div>
        ))}
        <div className="mt-1 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          {ticks.map((ph) => (
            <span key={ph} className="w-0 text-center">
              {ph}
            </span>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs font-extrabold uppercase tracking-wider">
          <span className="text-red-600 dark:text-red-400">
            {tr("Acid", "Asidi")}
          </span>
          <span className="text-green-700 dark:text-green-400">
            {tr("Neutral", "Isiyoegemea")}
          </span>
          <span className="text-violet-700 dark:text-violet-400">
            {tr("Base", "Besi")}
          </span>
        </div>
      </div>
    </section>
  );
}
