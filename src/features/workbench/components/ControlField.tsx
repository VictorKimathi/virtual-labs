import { useLanguage } from "../../../app/useLanguage";
import type { Control } from "../workbench.types";

type ControlFieldProps = {
  control: Control;
  value: number;
  onChange: (value: number) => void;
  onPress: () => void;
};

const fieldClass =
  "mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800";

export function ControlField({
  control,
  value,
  onChange,
  onPress,
}: ControlFieldProps) {
  const { language } = useLanguage();
  switch (control.type) {
    case "slider":
      return (
        <label className="block">
          <span className="flex justify-between gap-2 text-sm font-bold">
            {control.label[language]}
            <span className="font-mono">
              {Number(value.toFixed(2))} {control.unit}
            </span>
          </span>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="mt-1 w-full accent-sky-600"
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
              <option key={option.en} value={index}>
                {option[language]}
              </option>
            ))}
          </select>
        </label>
      );
    case "toggle":
      return (
        <div>
          <span className="text-sm font-bold">{control.label[language]}</span>
          <button
            type="button"
            aria-pressed={value === 1}
            onClick={() => onChange(value === 1 ? 0 : 1)}
            className={`mt-1 flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm font-bold transition-colors ${value === 1 ? "border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"}`}
          >
            {value === 1 ? control.on[language] : control.off[language]}
            <span
              aria-hidden="true"
              className={`h-4 w-8 rounded-full p-0.5 ${value === 1 ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-600"}`}
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
          className="min-h-10 w-full rounded-lg bg-sky-600 px-3 text-sm font-bold text-white hover:bg-sky-700"
        >
          {control.label[language]}
        </button>
      );
  }
}
