import { Pause, Play, Timer } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { formatBenchTime, speedLabels } from "../engine/time";

type TimeBarProps = {
  time: number;
  speed: number;
  running: boolean;
  onSpeed: (speed: number) => void;
  onRunning: (running: boolean) => void;
};

/** The bench clock: living processes run on it, sped up as much as you like. */
export function TimeBar({
  time,
  speed,
  running,
  onSpeed,
  onRunning,
}: TimeBarProps) {
  const { language, tr } = useLanguage();
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
      <button
        type="button"
        onClick={() => onRunning(!running)}
        aria-label={
          running
            ? tr("Pause the clock", "Simamisha saa")
            : tr("Start the clock", "Anzisha saa")
        }
        className="flex size-9 items-center justify-center rounded-lg bg-green-700 text-white hover:bg-green-800"
      >
        {running ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <span
        className="inline-flex items-center gap-1.5 font-mono text-sm font-bold"
        aria-live="off"
      >
        <Timer
          className="size-4 text-green-700 dark:text-green-400"
          aria-hidden="true"
        />
        {formatBenchTime(time)}
      </span>
      <div
        role="radiogroup"
        aria-label={tr("Clock speed", "Kasi ya saa")}
        className="ml-auto flex flex-wrap gap-1"
      >
        {speedLabels.map((label, index) => (
          <button
            key={label.en}
            type="button"
            role="radio"
            aria-checked={speed === index}
            onClick={() => onSpeed(index)}
            className={`min-h-8 rounded-lg px-2.5 text-xs font-bold transition-colors ${speed === index ? "bg-green-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
          >
            {label[language]}
          </button>
        ))}
      </div>
    </div>
  );
}
