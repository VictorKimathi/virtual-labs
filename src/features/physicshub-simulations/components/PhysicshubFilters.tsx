import { Search, X } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { difficulties, levels } from "../data/filterLabels";
import { physicshubTopics } from "../physicshub.filters";
import type { PhysicshubFilters as Filters } from "../physicshub.types";

type Props = {
  filters: Filters;
  hasActiveFilters: boolean;
  onQueryChange: (query: string) => void;
  onLevelChange: (level: string | null) => void;
  onTopicChange: (topic: string | null) => void;
  onDifficultyChange: (difficulty: string | null) => void;
  onClear: () => void;
};

const chipBase =
  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold transition-colors";
const chipOn = "border-kenya-green bg-kenya-green text-white";
const chipOff =
  "border-slate-300 bg-white hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900";

type ChipGroupProps = {
  label: string;
  allLabel: string;
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

function ChipGroup({
  label,
  allLabel,
  options,
  selected,
  onSelect,
}: ChipGroupProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        className={`${chipBase} ${selected === null ? chipOn : chipOff}`}
      >
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          aria-pressed={selected === option.id}
          className={`${chipBase} ${selected === option.id ? chipOn : chipOff}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function PhysicshubFilters({
  filters,
  hasActiveFilters,
  onQueryChange,
  onLevelChange,
  onTopicChange,
  onDifficultyChange,
  onClear,
}: Props) {
  const { language, tr } = useLanguage();
  const pick = (item: { en: string; sw: string }) =>
    language === "en" ? item.en : item.sw;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <label className="relative block">
        <span className="sr-only">
          {tr("Search simulations", "Tafuta uigaji")}
        </span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={tr(
            "Search by name, topic or idea",
            "Tafuta kwa jina, mada au wazo",
          )}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950"
        />
      </label>
      <ChipGroup
        label={tr("Filter by level", "Chuja kwa kiwango")}
        allLabel={tr("All levels", "Viwango vyote")}
        options={levels.map((item) => ({ id: item.id, label: pick(item) }))}
        selected={filters.level}
        onSelect={onLevelChange}
      />
      <ChipGroup
        label={tr("Filter by topic", "Chuja kwa mada")}
        allLabel={tr("All topics", "Mada zote")}
        options={physicshubTopics.map((topic) => ({ id: topic, label: topic }))}
        selected={filters.topic}
        onSelect={onTopicChange}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ChipGroup
          label={tr("Filter by difficulty", "Chuja kwa ugumu")}
          allLabel={tr("Any difficulty", "Ugumu wowote")}
          options={difficulties.map((item) => ({
            id: item.id,
            label: pick(item),
          }))}
          selected={filters.difficulty}
          onSelect={onDifficultyChange}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-xl px-3 text-sm font-bold text-kenya-green dark:text-green-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            {tr("Clear filters", "Futa vichujio")}
          </button>
        )}
      </div>
    </div>
  );
}
