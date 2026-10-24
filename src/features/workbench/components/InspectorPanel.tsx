import { MousePointerClick, Trash2 } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { partDefinitions, paramReader } from "../data/equipment";
import { partLabel } from "../hooks/useBench";
import type {
  BenchEnv,
  Outcome,
  PlacedPart,
  Selection,
  Tone,
  Wire,
} from "../workbench.types";
import { ControlField } from "./ControlField";
import { PartGraphic } from "./PartGraphic";
import { ReadingTasks } from "./ReadingTasks";
import { RulerZoom } from "./RulerZoom";

type InspectorPanelProps = {
  parts: PlacedPart[];
  wires: Wire[];
  selection: Selection | null;
  env: BenchEnv;
  outcomes: Map<string, Outcome>;
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

export function InspectorPanel({
  parts,
  wires,
  selection,
  env,
  outcomes,
  onSetParam,
  onPress,
  onRemove,
}: InspectorPanelProps) {
  const { language, tr } = useLanguage();
  const part =
    selection?.type === "part"
      ? parts.find((item) => item.id === selection.id)
      : undefined;
  const wire =
    selection?.type === "wire"
      ? wires.find((item) => item.id === selection.id)
      : undefined;

  const removeButton = (
    <button
      type="button"
      onClick={onRemove}
      className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
    >
      <Trash2 className="h-4 w-4" />
      {tr("Remove from bench", "Ondoa kwenye benchi")}
    </button>
  );

  if (part) {
    const definition = partDefinitions[part.kind];
    const outcome = outcomes.get(part.id) ?? {};
    const p = paramReader(part);
    return (
      <div>
        <p className="text-lg font-bold">
          {partLabel(parts, part, definition.name[language])}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {definition.description[language]}
        </p>
        <svg
          viewBox={`-8 -8 ${definition.width + 16} ${definition.height + 16}`}
          role="img"
          aria-label={tr("Close-up", "Karibu")}
          className="mt-3 max-h-56 w-full rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
        >
          <PartGraphic part={part} env={env} outcome={outcome} />
        </svg>

        {definition.controls.length > 0 && (
          <div className="mt-4 space-y-3">
            {definition.controls
              .filter((control) => !control.when || control.when(part.params))
              .map((control) => (
                <ControlField
                  key={control.id}
                  control={control}
                  value={p(control.id)}
                  onChange={(value) => onSetParam(part.id, control.id, value)}
                  onPress={() => onPress(part.id, control.id)}
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

        {outcome.visual?.ruler === 1 && (
          <RulerZoom start={outcome.visual.start} seen={outcome.visual.seen} />
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
                  className={`font-mono text-sm font-bold ${item.tone === "bad" ? "text-red-700 dark:text-red-400" : item.tone === "warn" ? "text-amber-700 dark:text-amber-400" : item.tone === "ok" ? "text-green-700 dark:text-green-400" : ""}`}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <ReadingTasks tasks={outcome.tasks ?? []} />
        {removeButton}
      </div>
    );
  }

  if (wire) {
    return (
      <div>
        <p className="text-lg font-bold">{tr("Wire", "Waya")}</p>
        <dl className="mt-2">
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
            <dt className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {tr("Current", "Mkondo")}
            </dt>
            <dd className="font-mono text-sm font-bold">
              {Math.abs(env.solution.wires.get(wire.id) ?? 0).toFixed(3)} A
            </dd>
          </div>
        </dl>
        {removeButton}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2 pb-4 text-center">
      <MousePointerClick className="h-8 w-8 text-slate-400" />
      <p className="text-sm font-bold">
        {tr("Select something on the bench", "Chagua kitu kwenye benchi")}
      </p>
      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
        {tr(
          "Click a piece of equipment to see its settings and readings. Click two terminals to run a wire.",
          "Bofya kifaa kuona mipangilio na vipimo vyake. Bofya ncha mbili kuweka waya.",
        )}
      </p>
    </div>
  );
}
