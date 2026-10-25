import { ChevronDown, Search } from "lucide-react";
import { memo, useState, type ReactNode } from "react";
import { useLanguage } from "../../../app/useLanguage";
import type { LocalizedText } from "../workbench.types";

export type PaletteSection<Kind extends string> = {
  id: string;
  name: LocalizedText;
  kinds: readonly Kind[];
};

type LabPaletteProps<Kind extends string> = {
  sections: PaletteSection<Kind>[];
  needed: readonly Kind[];
  dragType: string;
  accent: "orange" | "green";
  nameOf: (kind: Kind) => LocalizedText;
  descriptionOf: (kind: Kind) => LocalizedText;
  sizeOf: (kind: Kind) => { width: number; height: number };
  preview: (kind: Kind) => ReactNode;
  onAdd: (kind: Kind) => void;
};

const accents = {
  orange: {
    border: "hover:border-orange-500",
    needed: "border-orange-400 dark:border-orange-600",
    dot: "bg-orange-500",
  },
  green: {
    border: "hover:border-green-600",
    needed: "border-green-500 dark:border-green-600",
    dot: "bg-green-600",
  },
};

function LabPaletteInner<Kind extends string>({
  sections,
  needed,
  dragType,
  accent,
  nameOf,
  descriptionOf,
  sizeOf,
  preview,
  onAdd,
}: LabPaletteProps<Kind>) {
  const { language, tr } = useLanguage();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string[]>([sections[0]?.id ?? ""]);
  const search = query.trim().toLowerCase();
  const style = accents[accent];

  const shown = sections
    .map((section) => ({
      ...section,
      kinds: section.kinds.filter(
        (kind) =>
          !search || nameOf(kind)[language].toLowerCase().includes(search),
      ),
    }))
    .filter((section) => section.kinds.length > 0);

  function toggle(id: string) {
    setOpen((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
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
      {shown.length === 0 && (
        <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
          {tr("Nothing matches.", "Hakuna kinacholingana.")}
        </p>
      )}
      {shown.map((section) => {
        const expanded = Boolean(search) || open.includes(section.id);
        return (
          <section key={section.id}>
            <h2>
              <button
                type="button"
                onClick={() => toggle(section.id)}
                aria-expanded={expanded}
                className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 text-left text-sm font-extrabold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <span>
                  {section.name[language]}{" "}
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    ({section.kinds.length})
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
                {section.kinds.map((kind) => {
                  const size = sizeOf(kind);
                  const isNeeded = needed.includes(kind);
                  return (
                    <button
                      key={kind}
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(dragType, kind);
                        event.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => onAdd(kind)}
                      title={descriptionOf(kind)[language]}
                      className={`relative flex cursor-grab flex-col items-center gap-1 rounded-xl border bg-slate-50 p-2 text-center text-xs font-bold transition-colors active:cursor-grabbing dark:bg-slate-800 ${style.border} ${isNeeded ? style.needed : "border-slate-200 dark:border-slate-700"}`}
                    >
                      {isNeeded && (
                        <span
                          className={`absolute right-1 top-1 h-2 w-2 rounded-full ${style.dot}`}
                        />
                      )}
                      <svg
                        viewBox={`-6 -6 ${size.width + 12} ${size.height + 12}`}
                        aria-hidden="true"
                        className="h-14 w-full"
                      >
                        {preview(kind)}
                      </svg>
                      {nameOf(kind)[language]}
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

/** The equipment list for a wire-free lab, drawn once and kept while the bench clock ticks. */
export const LabPalette = memo(LabPaletteInner) as typeof LabPaletteInner;
