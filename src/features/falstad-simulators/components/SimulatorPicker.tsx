import { Check } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { FilterChipGroup } from "../../../shared/ui/FilterChipGroup";
import { RevealItem } from "../../../shared/ui/RevealItem";
import { categories, simulators } from "../data/simulators";
import type { FalstadCategory } from "../falstad.types";

type Props = { selectedId: string; onSelect: (id: string) => void };

export function SimulatorPicker({ selectedId, onSelect }: Props) {
  const { language, tr } = useLanguage();
  const [category, setCategory] = useState<FalstadCategory | null>(null);
  const shown = simulators.filter(
    (item) => category === null || item.category === category,
  );

  return (
    <div className="space-y-4">
      <FilterChipGroup
        heading={tr("Type", "Aina")}
        allLabel={tr("All", "Zote")}
        options={categories.map((item) => ({
          value: item.id,
          label: language === "en" ? item.title.en : item.title.sw,
        }))}
        selected={category}
        onSelect={(value) =>
          setCategory(categories.find((item) => item.id === value)?.id ?? null)
        }
      />
      {shown.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shown.map((item, index) => {
            const active = selectedId === item.id;
            return (
              <RevealItem key={item.id} index={index}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-pressed={active}
                  className={`group relative h-full w-full overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${active ? "border-subject-physics bg-blue-50 shadow-lg shadow-subject-physics/15 ring-4 ring-subject-physics/20 dark:bg-blue-950" : "border-slate-200 bg-white hover:border-subject-physics dark:border-slate-800 dark:bg-slate-900"}`}
                >
                  {active && (
                    <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-subject-physics text-white">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                  )}
                  <span className="block pr-8 font-extrabold">
                    {language === "en" ? item.title.en : item.title.sw}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {language === "en" ? item.summary.en : item.summary.sw}
                  </span>
                </button>
              </RevealItem>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-slate-300 p-6 text-center font-bold dark:border-slate-700">
          {tr(
            "No simulators in this group",
            "Hakuna kiigaji katika kundi hili",
          )}
        </p>
      )}
    </div>
  );
}
