import { Search, X } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import type {
  PhetFilterOption,
  PhetFilterOptions,
  PhetFilters,
  PhetSort,
} from "../phet.types";

type Props = {
  filters: PhetFilters;
  options: PhetFilterOptions;
  hasActiveFilters: boolean;
  onQueryChange: (query: string) => void;
  onSubjectChange: (subject: string | null) => void;
  onTopicChange: (topic: string | null) => void;
  onLevelChange: (level: string | null) => void;
  onSortChange: (sort: PhetSort) => void;
  onClear: () => void;
};

const chipBase =
  "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors";
const chipOn = "border-kenya-green bg-kenya-green text-white";
const chipOff =
  "border-slate-300 bg-white hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900";

type ChipGroupProps = {
  label: string;
  allLabel: string;
  options: PhetFilterOption[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
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
          onClick={() => onSelect(option.slug)}
          aria-pressed={selected === option.slug}
          className={`${chipBase} ${selected === option.slug ? chipOn : chipOff}`}
        >
          {option.label}
          <span
            className={`text-xs ${selected === option.slug ? "text-green-100" : "text-slate-500 dark:text-slate-400"}`}
          >
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export function SimulationFilters({
  filters,
  options,
  hasActiveFilters,
  onQueryChange,
  onSubjectChange,
  onTopicChange,
  onLevelChange,
  onSortChange,
  onClear,
}: Props) {
  const { tr } = useLanguage();
  const topics = filters.subject
    ? (options.topicsBySubject.get(filters.subject) ?? [])
    : [];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
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
              "Search by name, topic or keyword",
              "Tafuta kwa jina, mada au neno kuu",
            )}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <span className="shrink-0 text-slate-600 dark:text-slate-300">
            {tr("Sort by", "Panga kwa")}
          </span>
          <select
            value={filters.sort}
            onChange={(event) =>
              onSortChange(event.target.value === "newest" ? "newest" : "title")
            }
            className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950 sm:flex-none"
          >
            <option value="title">{tr("Name (A–Z)", "Jina (A–Z)")}</option>
            <option value="newest">{tr("Newest first", "Mpya kwanza")}</option>
          </select>
        </label>
      </div>

      <ChipGroup
        label={tr("Filter by subject", "Chuja kwa somo")}
        allLabel={tr("All subjects", "Masomo yote")}
        options={options.subjects}
        selected={filters.subject}
        onSelect={onSubjectChange}
      />

      {topics.length > 0 && (
        <ChipGroup
          label={tr("Filter by topic", "Chuja kwa mada")}
          allLabel={tr("All topics", "Mada zote")}
          options={topics}
          selected={filters.topic}
          onSelect={onTopicChange}
        />
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ChipGroup
          label={tr("Filter by level", "Chuja kwa kiwango")}
          allLabel={tr("All levels", "Viwango vyote")}
          options={options.levels}
          selected={filters.level}
          onSelect={onLevelChange}
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
