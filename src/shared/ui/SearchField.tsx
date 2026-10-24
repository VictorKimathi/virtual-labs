import { Search } from "lucide-react";

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({ label, placeholder, value, onChange }: Props) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">{label}</span>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-kenya-green focus:bg-white focus:ring-4 focus:ring-kenya-green/20 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950"
      />
    </label>
  );
}
