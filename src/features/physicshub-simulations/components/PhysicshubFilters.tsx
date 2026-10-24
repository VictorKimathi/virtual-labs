import { X } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { FilterChipGroup } from "../../../shared/ui/FilterChipGroup";
import { SearchField } from "../../../shared/ui/SearchField";
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
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <SearchField
        label={tr("Search simulations", "Tafuta uigaji")}
        placeholder={tr(
          "Search by name, topic or idea",
          "Tafuta kwa jina, mada au wazo",
        )}
        value={filters.query}
        onChange={onQueryChange}
      />
      <FilterChipGroup
        heading={tr("Level", "Kiwango")}
        allLabel={tr("All levels", "Viwango vyote")}
        options={levels.map((item) => ({ value: item.id, label: pick(item) }))}
        selected={filters.level}
        onSelect={onLevelChange}
      />
      <FilterChipGroup
        heading={tr("Topic", "Mada")}
        allLabel={tr("All topics", "Mada zote")}
        options={physicshubTopics.map((topic) => ({
          value: topic,
          label: topic,
        }))}
        selected={filters.topic}
        onSelect={onTopicChange}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FilterChipGroup
          heading={tr("Difficulty", "Ugumu")}
          allLabel={tr("Any difficulty", "Ugumu wowote")}
          options={difficulties.map((item) => ({
            value: item.id,
            label: pick(item),
          }))}
          selected={filters.difficulty}
          onSelect={onDifficultyChange}
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
