import { Eye, MousePointerClick, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "../../../app/useLanguage";
import type { ChemPlot } from "../../chemistry-bench/chemistry.types";
import { ChemPlotView } from "../../chemistry-bench/components/ChemPlotView";
import type {
  Issue,
  LocalizedText,
  Readout,
  ReadingTask,
  Tone,
} from "../workbench.types";
import { LabControlField, type FieldControl } from "./LabControlField";
import { ReadingTasks } from "./ReadingTasks";

type InspectedOutcome = {
  observations?: LocalizedText[];
  issues?: Issue[];
  readouts?: Readout[];
  plot?: ChemPlot;
  tasks?: ReadingTask[];
};

type LabInspectorProps<Part extends { id: string; num: number }> = {
  part: Part | undefined;
  parts: Part[];
  title: string;
  description: LocalizedText;
  viewBox: string;
  closeUp: ReactNode;
  /** Something extra to show under the close-up, such as the view down a microscope. */
  extra?: ReactNode;
  controls: FieldControl<Part>[];
  outcome: InspectedOutcome;
  accent: "orange" | "green";
  valueOf: (id: string) => number;
  labelOf: (part: Part) => string;
  emptyHint: string;
  onSetParam: (id: string, param: string, value: number) => void;
  onPress: (id: string, control: string) => void;
  onRemove: () => void;
};

const toneClass: Record<Tone | "tip", string> = {
  ok: "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
  warn: "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  bad: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300",
  tip: "bg-sky-50 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
};

const valueTone = (tone?: Tone) =>
  tone === "bad"
    ? "text-red-700 dark:text-red-400"
    : tone === "warn"
      ? "text-amber-700 dark:text-amber-400"
      : tone === "ok"
        ? "text-green-700 dark:text-green-400"
        : "";

/** Settings, observations and readings for the selected part of a wire-free lab. */
export function LabInspector<Part extends { id: string; num: number }>(
  props: LabInspectorProps<Part>,
) {
  const { language, tr } = useLanguage();
  const { part, outcome } = props;

  if (!part)
    return (
      <div className="mt-6 flex flex-col items-center gap-2 pb-4 text-center">
        <MousePointerClick className="h-8 w-8 text-slate-400" />
        <p className="text-sm font-bold">
          {tr("Select something on the bench", "Chagua kitu kwenye benchi")}
        </p>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {props.emptyHint}
        </p>
      </div>
    );

  const observations = outcome.observations ?? [];
  return (
    <div>
      <p className="text-lg font-bold">{props.title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {props.description[language]}
      </p>
      <svg
        viewBox={props.viewBox}
        role="img"
        aria-label={tr("Close-up", "Karibu")}
        className="mt-3 max-h-56 w-full rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
      >
        {props.closeUp}
      </svg>
      {props.extra}

      {observations.length > 0 && (
        <section
          className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
          aria-live="polite"
        >
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <Eye className="h-4 w-4" />
            {tr("What you see", "Unachoona")}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
            {observations.slice(-5).map((note, index) => (
              <li key={`${index}-${note.en}`}>{note[language]}</li>
            ))}
          </ul>
        </section>
      )}

      {props.controls.length > 0 && (
        <div className="mt-4 space-y-3">
          {props.controls.map((control) => (
            <LabControlField
              key={control.id}
              control={control}
              part={part}
              parts={props.parts}
              value={props.valueOf(control.id)}
              labelOf={props.labelOf}
              accent={props.accent}
              onChange={(value) => props.onSetParam(part.id, control.id, value)}
              onPress={() => props.onPress(part.id, control.id)}
            />
          ))}
        </div>
      )}

      {outcome.issues && outcome.issues.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label={tr("Notes", "Maelezo")}>
          {outcome.issues.map((item) => (
            <li
              key={item.id}
              role={item.tone === "bad" ? "alert" : undefined}
              className={`rounded-lg p-3 text-sm leading-5 ${toneClass[item.tone]}`}
            >
              {item.text[language]}
            </li>
          ))}
        </ul>
      )}

      {outcome.readouts && outcome.readouts.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-2">
          {outcome.readouts.map((item) => (
            <div
              key={item.label.en}
              className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
            >
              <dt className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {item.label[language]}
              </dt>
              <dd
                className={`font-mono text-sm font-bold ${valueTone(item.tone)}`}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {outcome.plot && <ChemPlotView plot={outcome.plot} />}
      <ReadingTasks tasks={outcome.tasks ?? []} />

      <button
        type="button"
        onClick={props.onRemove}
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        <Trash2 className="h-4 w-4" />
        {tr("Remove from bench", "Ondoa kwenye benchi")}
      </button>
    </div>
  );
}
