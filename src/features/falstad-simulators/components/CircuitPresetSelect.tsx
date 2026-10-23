import { useLanguage } from "../../../app/useLanguage";
import { circuitPresetGroups } from "../data/circuitPresets";

type Props = { selectedFile: string; onSelect: (file: string) => void };

export function CircuitPresetSelect({ selectedFile, onSelect }: Props) {
  const { language, tr } = useLanguage();
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-slate-600 dark:text-slate-300">
        {tr("Example circuit", "Sakiti ya mfano")}
      </span>
      <select
        value={selectedFile}
        onChange={(event) => onSelect(event.target.value)}
        className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950"
      >
        {circuitPresetGroups.map((group) => (
          <optgroup
            key={group.id}
            label={language === "en" ? group.title.en : group.title.sw}
          >
            {group.presets.map((preset) => (
              <option key={preset.file} value={preset.file}>
                {preset.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
