import { X } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { FilterChipGroup } from "../../../shared/ui/FilterChipGroup";
import { SearchField } from "../../../shared/ui/SearchField";
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

  const toChips = (items: PhetFilterOption[]) =>
    items.map((item) => ({
      value: item.slug,
      label: item.label,
      count: item.count,
    }));

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField
          label={tr("Search simulations", "Tafuta uigaji")}
          placeholder={tr(
            "Search by name, topic or keyword",
            "Tafuta kwa jina, mada au neno kuu",
          )}
          value={filters.query}
          onChange={onQueryChange}
        />
        <label className="flex items-center gap-2 text-sm font-bold">
          <span className="shrink-0 text-slate-600 dark:text-slate-300">
            {tr("Sort by", "Panga kwa")}
          </span>
          <select
            value={filters.sort}
            onChange={(event) =>
              onSortChange(event.target.value === "newest" ? "newest" : "title")
            }
            className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-kenya-green focus:ring-4 focus:ring-kenya-green/20 dark:border-slate-700 dark:bg-slate-950 sm:flex-none"
          >
            <option value="title">{tr("Name (A–Z)", "Jina (A–Z)")}</option>
            <option value="newest">{tr("Newest first", "Mpya kwanza")}</option>
          </select>
        </label>
      </div>

      <FilterChipGroup
        heading={tr("Subject", "Somo")}
        allLabel={tr("All subjects", "Masomo yote")}
        options={toChips(options.subjects)}
        selected={filters.subject}
        onSelect={onSubjectChange}
      />

      {topics.length > 0 && (
        <FilterChipGroup
          heading={tr("Topic", "Mada")}
          allLabel={tr("All topics", "Mada zote")}
          options={toChips(topics)}
          selected={filters.topic}
          onSelect={onTopicChange}
        />
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FilterChipGroup
          heading={tr("Level", "Kiwango")}
          allLabel={tr("All levels", "Viwango vyote")}
          options={toChips(options.levels)}
          selected={filters.level}
          onSelect={onLevelChange}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-xl px-3 text-sm font-bold text-kenya-green hover:bg-green-50 dark:text-green-400 dark:hover:bg-slate-800 lg:self-end"
          >
            <X className="size-4" aria-hidden="true" />
            {tr("Clear filters", "Futa vichujio")}
          </button>
        )}
      </div>
    </div>
  );
}
