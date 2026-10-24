import { FilterChip } from "./FilterChip";

export type ChipOption = { value: string; label: string; count?: number };

type Props = {
  heading: string;
  allLabel: string;
  options: ChipOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
};

export function FilterChipGroup({
  heading,
  allLabel,
  options,
  selected,
  onSelect,
}: Props) {
  return (
    <div role="group" aria-label={heading} className="space-y-2">
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {heading}
      </p>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={selected === null} onClick={() => onSelect(null)}>
          {allLabel}
        </FilterChip>
        {options.map((option) => (
          <FilterChip
            key={option.value}
            active={selected === option.value}
            onClick={() => onSelect(option.value)}
            count={option.count}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
