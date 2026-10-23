import { Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import {
  categoryNames,
  categoryOrder,
  partDefinitions,
} from "../data/equipment";
import type { PartKind } from "../workbench.types";
import { EQUIPMENT_DRAG_TYPE } from "./BenchCanvas";
import { PartGraphic } from "./PartGraphic";

type EquipmentPaletteProps = {
  equipment: PartKind[];
  needed: PartKind[];
  onAdd: (kind: PartKind) => void;
};

export function EquipmentPalette({
  equipment,
  needed,
  onAdd,
}: EquipmentPaletteProps) {
  const { language, tr } = useLanguage();
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const visible = equipment
    .map((kind) => partDefinitions[kind])
    .filter((definition) =>
      definition.name[language].toLowerCase().includes(search),
    );

  return (
    <aside className="absolute inset-0 flex flex-col gap-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <label className="relative block">
        <span className="sr-only">
          {tr("Search equipment", "Tafuta vifaa")}
        </span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tr("Search", "Tafuta")}
          className="min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </label>
      {visible.length === 0 && (
        <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
          {tr("No equipment matches.", "Hakuna kifaa kinacholingana.")}
        </p>
      )}
      {categoryOrder.map((category) => {
        const items = visible.filter((item) => item.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h2 className="mb-2 px-1 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {categoryNames[category][language]}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {items.map((definition) => (
                <button
                  key={definition.kind}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      EQUIPMENT_DRAG_TYPE,
                      definition.kind,
                    );
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onAdd(definition.kind)}
                  title={definition.description[language]}
                  className={`relative flex cursor-grab flex-col items-center gap-1 rounded-xl border bg-slate-50 p-2 text-center text-xs font-bold transition-colors hover:border-sky-500 active:cursor-grabbing dark:bg-slate-800 ${needed.includes(definition.kind) ? "border-sky-400 dark:border-sky-600" : "border-slate-200 dark:border-slate-700"}`}
                >
                  {needed.includes(definition.kind) && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-500" />
                  )}
                  <svg
                    viewBox={`-10 -10 ${definition.width + 20} ${definition.height + 20}`}
                    aria-hidden="true"
                    className="h-12 w-full"
                  >
                    <PartGraphic
                      part={{
                        kind: definition.kind,
                        value: definition.defaultValue,
                        closed: false,
                      }}
                    />
                  </svg>
                  {definition.name[language]}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </aside>
  );
}
