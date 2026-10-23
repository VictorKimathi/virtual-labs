import { MousePointerClick, Trash2 } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { formatReading } from "../circuit/formatReading";
import {
  bulbBrightness,
  LIT_BRIGHTNESS,
  OVERLOAD_BRIGHTNESS,
  type CircuitSolution,
} from "../circuit/solveCircuit";
import { partDefinitions } from "../data/equipment";
import { partLabel } from "../hooks/useBench";
import type { PlacedPart, Selection, Wire } from "../workbench.types";

type InspectorPanelProps = {
  parts: PlacedPart[];
  wires: Wire[];
  selection: Selection | null;
  solution: CircuitSolution;
  onSetValue: (id: string, value: number) => void;
  onToggleSwitch: (id: string) => void;
  onRemove: () => void;
};

export function InspectorPanel({
  parts,
  wires,
  selection,
  solution,
  onSetValue,
  onToggleSwitch,
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
      {tr("Remove", "Ondoa")}
    </button>
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {tr("Inspector", "Ukaguzi")}
      </h2>
      {part && renderPartDetails(part)}
      {wire && (
        <>
          <p className="mt-3 text-lg font-bold">{tr("Wire", "Waya")}</p>
          <dl>
            <Stat
              label={tr("Current", "Mkondo")}
              value={formatReading(
                Math.abs(solution.wires.get(wire.id) ?? 0),
                "A",
              )}
            />
          </dl>
          {removeButton}
        </>
      )}
      {!part && !wire && (
        <div className="mt-6 flex flex-col items-center gap-2 pb-4 text-center">
          <MousePointerClick className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-bold">
            {tr("Select something on the bench", "Chagua kitu kwenye benchi")}
          </p>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {tr(
              "Place equipment from the palette, then click two terminals to run a wire.",
              "Weka vifaa kutoka orodha, kisha bofya ncha mbili kuweka waya.",
            )}
          </p>
        </div>
      )}
    </section>
  );

  function renderPartDetails(part: PlacedPart) {
    const definition = partDefinitions[part.kind];
    const state = solution.parts.get(part.id);
    const brightness = bulbBrightness(solution, part.id);
    return (
      <>
        <p className="mt-3 text-lg font-bold">
          {partLabel(parts, part, definition.name[language])}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {definition.description[language]}
        </p>
        {definition.adjustable && (
          <label className="mt-4 block">
            <span className="flex justify-between text-sm font-bold">
              {definition.adjustable.label[language]}
              <span className="font-mono">
                {part.value} {definition.adjustable.unit}
              </span>
            </span>
            <input
              type="range"
              min={definition.adjustable.min}
              max={definition.adjustable.max}
              step={definition.adjustable.step}
              value={part.value}
              onChange={(event) =>
                onSetValue(part.id, Number(event.target.value))
              }
              className="mt-2 w-full accent-sky-600"
            />
          </label>
        )}
        {part.kind === "switch" && (
          <button
            type="button"
            onClick={() => onToggleSwitch(part.id)}
            aria-pressed={part.closed}
            className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-sky-600 px-4 text-sm font-bold text-white hover:bg-sky-700"
          >
            {part.closed
              ? tr("Open switch", "Fungua swichi")
              : tr("Close switch", "Funga swichi")}
          </button>
        )}
        {state && (
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <Stat
              label={tr("Voltage", "Volteji")}
              value={formatReading(Math.abs(state.voltage), "V")}
            />
            <Stat
              label={tr("Current", "Mkondo")}
              value={formatReading(Math.abs(state.current), "A")}
            />
          </dl>
        )}
        {part.kind === "bulb" && (
          <p
            className={`mt-3 text-sm font-bold ${brightness > OVERLOAD_BRIGHTNESS ? "text-red-700 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}`}
          >
            {brightness > OVERLOAD_BRIGHTNESS
              ? tr(
                  "Overloaded — this bulb would burn out.",
                  "Imezidiwa — balbu hii ingeungua.",
                )
              : brightness > LIT_BRIGHTNESS
                ? `${tr("Brightness", "Mwangaza")}: ${Math.round(Math.min(brightness, 1) * 100)}%`
                : tr("Not glowing", "Haiwaki")}
          </p>
        )}
        {removeButton}
      </>
    );
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
      <dt className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="font-mono text-sm font-bold">{value}</dd>
    </div>
  );
}
