import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { categories, simulators } from "../data/simulators";
import type { FalstadCategory } from "../falstad.types";

type Props = { selectedId: string; onSelect: (id: string) => void };

const chipBase =
  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold transition-colors";
const chipOn = "border-kenya-green bg-kenya-green text-white";
const chipOff =
  "border-slate-300 bg-white hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900";

export function SimulatorPicker({ selectedId, onSelect }: Props) {
  const { language, tr } = useLanguage();
  const [category, setCategory] = useState<FalstadCategory | "all">("all");
  const shown = simulators.filter(
    (item) => category === "all" || item.category === category,
  );

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label={tr("Filter by type", "Chuja kwa aina")}
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          onClick={() => setCategory("all")}
          aria-pressed={category === "all"}
          className={`${chipBase} ${category === "all" ? chipOn : chipOff}`}
        >
          {tr("All", "Zote")}
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            aria-pressed={category === item.id}
            className={`${chipBase} ${category === item.id ? chipOn : chipOff}`}
          >
            {language === "en" ? item.title.en : item.title.sw}
          </button>
        ))}
      </div>
      {shown.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={selectedId === item.id}
                className={`h-full w-full rounded-2xl border p-4 text-left transition-colors ${selectedId === item.id ? "border-kenya-green bg-green-50 dark:bg-green-950" : "border-slate-200 bg-white hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"}`}
              >
                <span className="block font-extrabold">
                  {language === "en" ? item.title.en : item.title.sw}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {language === "en" ? item.summary.en : item.summary.sw}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center font-bold dark:border-slate-700">
          {tr(
            "No simulators in this group",
            "Hakuna kiigaji katika kundi hili",
          )}
        </p>
      )}
    </div>
  );
}
