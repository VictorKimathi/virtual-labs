import { useLanguage } from "../../../app/useLanguage";
import type { LocalizedText } from "../workbench.types";

/** The settings a part can show, for any wire-free lab. */
export type FieldControl<Part> =
  | {
      type: "slider";
      id: string;
      label: LocalizedText;
      unit?: string;
      min: number;
      max: number;
      step: number;
    }
  | {
      type: "select";
      id: string;
      label: LocalizedText;
      options: LocalizedText[];
    }
  | {
      type: "toggle";
      id: string;
      label: LocalizedText;
      on: LocalizedText;
      off: LocalizedText;
    }
  | {
      type: "link";
      id: string;
      label: LocalizedText;
      none: LocalizedText;
      choices: (candidate: Part, self: Part) => boolean;
    }
  | { type: "button"; id: string; label: LocalizedText };

type LabControlFieldProps<Part extends { id: string; num: number }> = {
  control: FieldControl<Part>;
  part: Part;
  parts: Part[];
  value: number;
  labelOf: (part: Part) => string;
  accent: "orange" | "green";
  onChange: (value: number) => void;
  onPress: () => void;
};

const fieldClass =
  "mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800";

const accents = {
  orange: {
    range: "accent-orange-600",
    on: "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
    track: "bg-orange-600",
    button: "bg-orange-700 hover:bg-orange-800",
  },
  green: {
    range: "accent-green-700",
    on: "border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200",
    track: "bg-green-700",
    button: "bg-green-700 hover:bg-green-800",
  },
};

export function LabControlField<Part extends { id: string; num: number }>({
  control,
  part,
  parts,
  value,
  labelOf,
  accent,
  onChange,
  onPress,
}: LabControlFieldProps<Part>) {
  const { language, tr } = useLanguage();
  const style = accents[accent];
  switch (control.type) {
    case "slider":
      return (
        <label className="block">
          <span className="flex justify-between gap-2 text-sm font-bold">
            {control.label[language]}
            <span className="font-mono">
              {Number(value.toFixed(3))} {control.unit}
            </span>
          </span>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className={`mt-1 w-full ${style.range}`}
          />
        </label>
      );
    case "select":
      return (
        <label className="block">
          <span className="text-sm font-bold">{control.label[language]}</span>
          <select
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className={fieldClass}
          >
            {control.options.map((option, index) => (
              <option key={`${option.en}-${index}`} value={index}>
                {option[language]}
              </option>
            ))}
          </select>
        </label>
      );
    case "link": {
      const choices = parts.filter((candidate) =>
        control.choices(candidate, part),
      );
      const current = choices.some((candidate) => candidate.num === value)
        ? value
        : 0;
      return (
        <label className="block">
          <span className="text-sm font-bold">{control.label[language]}</span>
          <select
            value={current}
            onChange={(event) => onChange(Number(event.target.value))}
            className={fieldClass}
          >
            <option value={0}>{control.none[language]}</option>
            {choices.map((candidate) => (
              <option key={candidate.id} value={candidate.num}>
                {labelOf(candidate)}
              </option>
            ))}
          </select>
          {choices.length === 0 && (
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              {tr(
                "Nothing on the bench fits here yet.",
                "Hakuna kitu mezani kinachofaa hapa bado.",
              )}
            </span>
          )}
        </label>
      );
    }
    case "toggle":
      return (
        <div>
          <span className="text-sm font-bold">{control.label[language]}</span>
          <button
            type="button"
            aria-pressed={value === 1}
            onClick={() => onChange(value === 1 ? 0 : 1)}
            className={`mt-1 flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm font-bold transition-colors ${value === 1 ? style.on : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"}`}
          >
            {value === 1 ? control.on[language] : control.off[language]}
            <span
              aria-hidden="true"
              className={`h-4 w-8 rounded-full p-0.5 ${value === 1 ? style.track : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <span
                className={`block h-3 w-3 rounded-full bg-white transition-transform ${value === 1 ? "translate-x-4" : ""}`}
              />
            </span>
          </button>
        </div>
      );
    case "button":
      return (
        <button
          type="button"
          onClick={onPress}
          className={`min-h-10 w-full rounded-lg px-3 text-sm font-bold text-white ${style.button}`}
        >
          {control.label[language]}
        </button>
      );
  }
}
