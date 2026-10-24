import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { newPart, partDefinitions, sectionNames } from "../data/equipment";
import { sectionKinds, sectionOrder, type SectionId } from "../data/kinds";
import type { PartKind } from "../workbench.types";
import { EQUIPMENT_DRAG_TYPE } from "./BenchCanvas";
import { PartPreview } from "./PartGraphic";

type EquipmentPaletteProps = {
  needed: PartKind[];
  onAdd: (kind: PartKind) => void;
};

export function EquipmentPalette({ needed, onAdd }: EquipmentPaletteProps) {
  const { language, tr } = useLanguage();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<SectionId[]>(["measurement"]);
  const search = query.trim().toLowerCase();

  const sections = sectionOrder
    .map((section) => ({
      section,
      kinds: sectionKinds[section].filter(
        (kind) =>
          !search ||
          partDefinitions[kind].name[language].toLowerCase().includes(search),
      ),
    }))
    .filter((entry) => entry.kinds.length > 0);

  function toggle(section: SectionId) {
    setOpen((current) =>
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section],
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="relative block">
        <span className="sr-only">
          {tr("Search equipment", "Tafuta vifaa")}
        </span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tr("Search equipment", "Tafuta vifaa")}
          className="min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </label>
      <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
        {tr(
          "Drag to the bench, or click an item to add it.",
          "Buruta kwenye benchi, au bofya kifaa kukiongeza.",
        )}
      </p>
      {sections.length === 0 && (
        <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
          {tr("No equipment matches.", "Hakuna kifaa kinacholingana.")}
        </p>
      )}
      {sections.map(({ section, kinds }) => {
        const expanded = Boolean(search) || open.includes(section);
        return (
          <section key={section}>
            <h2>
              <button
                type="button"
                onClick={() => toggle(section)}
                aria-expanded={expanded}
                className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 text-left text-sm font-extrabold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <span>
                  {sectionNames[section][language]}{" "}
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    ({kinds.length})
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h2>
            {expanded && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {kinds.map((kind) => {
                  const definition = partDefinitions[kind];
                  return (
                    <button
                      key={kind}
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(EQUIPMENT_DRAG_TYPE, kind);
                        event.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => onAdd(kind)}
                      title={definition.description[language]}
                      className={`relative flex cursor-grab flex-col items-center gap-1 rounded-xl border bg-slate-50 p-2 text-center text-xs font-bold transition-colors hover:border-sky-500 active:cursor-grabbing dark:bg-slate-800 ${needed.includes(kind) ? "border-sky-400 dark:border-sky-600" : "border-slate-200 dark:border-slate-700"}`}
                    >
                      {needed.includes(kind) && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-500" />
                      )}
                      <svg
                        viewBox={`-6 -6 ${definition.width + 12} ${definition.height + 12}`}
                        aria-hidden="true"
                        className="h-14 w-full"
                      >
                        <PartPreview
                          part={newPart(kind, `preview-${kind}`, 0, 0)}
                        />
                      </svg>
                      {definition.name[language]}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
