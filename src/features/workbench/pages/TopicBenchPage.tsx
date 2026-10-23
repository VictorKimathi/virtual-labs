import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { meterReading, solveCircuit } from "../circuit/solveCircuit";
import { BenchCanvas } from "../components/BenchCanvas";
import { EquipmentPalette } from "../components/EquipmentPalette";
import { ExperimentPanel } from "../components/ExperimentPanel";
import { InspectorPanel } from "../components/InspectorPanel";
import { ReadingsDock } from "../components/ReadingsDock";
import { partDefinitions } from "../data/equipment";
import { findTopic } from "../data/topics";
import { partLabel, useBench } from "../hooks/useBench";
import { useExperimentProgress } from "../hooks/useExperimentProgress";
import type { MeterReading } from "../workbench.types";

export default function TopicBenchPage() {
  const { topicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, tr } = useLanguage();
  const [bench, dispatch] = useBench();
  const [attempt, setAttempt] = useState(0);
  const topic = findTopic(topicId);
  const experiment = topic?.experiments.find(
    (item) => item.id === searchParams.get("experiment"),
  );
  const solution = useMemo(
    () => solveCircuit(bench.parts, bench.wires),
    [bench.parts, bench.wires],
  );
  const readings: MeterReading[] = bench.parts.flatMap((part) => {
    const meter = partDefinitions[part.kind].meter;
    return meter
      ? [
          {
            partId: part.id,
            label: partLabel(
              bench.parts,
              part,
              partDefinitions[part.kind].name[language],
            ),
            unit: meter.unit,
            value: meterReading(solution, part),
          },
        ]
      : [];
  });
  const achieved = useExperimentProgress(
    experiment,
    {
      parts: bench.parts,
      wires: bench.wires,
      solution,
      records: bench.records,
    },
    `${experiment?.id ?? "free"}:${attempt}`,
  );

  if (!topic || topic.experiments.length === 0)
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-black">
          {topic
            ? tr("This topic is coming soon", "Mada hii inakuja hivi karibuni")
            : tr("Topic not found", "Mada haikupatikana")}
        </h1>
        <Link
          to="/workbench"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-kenya-green px-5 text-sm font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr("Back to topics", "Rudi kwenye mada")}
        </Link>
      </div>
    );

  function chooseExperiment(id: string | null) {
    setSearchParams(id ? { experiment: id } : {});
  }

  function resetBench() {
    dispatch({ type: "reset" });
    setAttempt((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            to="/workbench"
            className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr("Practice bench", "Benchi la mazoezi")}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <h1 className="text-2xl font-black tracking-tight">
            {topic.name[language]}
          </h1>
        </div>
        <button
          type="button"
          onClick={resetBench}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          {tr("Clear bench", "Safisha benchi")}
        </button>
      </div>

      <nav
        aria-label={tr("Experiments", "Majaribio")}
        className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="block px-2 pb-1 pt-0.5 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {tr("Experiment", "Jaribio")}
        </span>
        <ul className="flex flex-wrap gap-1">
          {[undefined, ...topic.experiments].map((item) => {
            const active = item?.id === experiment?.id;
            return (
              <li key={item?.id ?? "free"} className="shrink-0">
                <button
                  type="button"
                  onClick={() => chooseExperiment(item?.id ?? null)}
                  aria-pressed={active}
                  title={item?.summary[language]}
                  className={`min-h-9 rounded-lg px-3 text-sm font-bold transition-colors ${active ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"}`}
                >
                  {item ? item.title[language] : tr("Free build", "Unda huru")}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="relative min-h-96 xl:col-span-2 xl:min-h-0">
          <EquipmentPalette
            equipment={topic.equipment}
            needed={experiment?.equipment ?? []}
            onAdd={(kind) => dispatch({ type: "add-part", kind })}
          />
        </div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-7">
          <BenchCanvas
            parts={bench.parts}
            wires={bench.wires}
            solution={solution}
            selection={bench.selection}
            pendingTerminal={bench.pendingTerminal}
            onAddPart={(kind, x, y) =>
              dispatch({ type: "add-part", kind, x, y })
            }
            onMovePart={(id, x, y) => dispatch({ type: "move-part", id, x, y })}
            onSelect={(selection) => dispatch({ type: "select", selection })}
            onTerminal={(terminal) => dispatch({ type: "terminal", terminal })}
            onToggleSwitch={(id) => dispatch({ type: "toggle-switch", id })}
            onRemoveSelected={() => dispatch({ type: "remove-selected" })}
          />
          <div className="flex items-center gap-4 border-t border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>
              {tr("Parts", "Vifaa")} {bench.parts.length}
            </span>
            <span>
              {tr("Wires", "Waya")} {bench.wires.length}
            </span>
            {solution.shortCircuit ? (
              <span
                role="alert"
                className="ml-auto inline-flex items-center gap-1 text-red-700 dark:text-red-400"
              >
                <TriangleAlert className="h-4 w-4" />
                {tr(
                  "Very high current — check for a short circuit",
                  "Mkondo mkubwa sana — kagua kama kuna saketi fupi",
                )}
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1.5 text-green-700 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {tr("Live", "Hai")}
              </span>
            )}
          </div>
          <ReadingsDock
            readings={readings}
            records={bench.records}
            onRecord={() => dispatch({ type: "record", readings })}
            onClearRecords={() => dispatch({ type: "clear-records" })}
          />
        </section>
        <div className="space-y-4 xl:col-span-3">
          <ExperimentPanel experiment={experiment} achieved={achieved} />
          <InspectorPanel
            parts={bench.parts}
            wires={bench.wires}
            selection={bench.selection}
            solution={solution}
            onSetValue={(id, value) =>
              dispatch({ type: "set-value", id, value })
            }
            onToggleSwitch={(id) => dispatch({ type: "toggle-switch", id })}
            onRemove={() => dispatch({ type: "remove-selected" })}
          />
        </div>
      </div>
    </div>
  );
}
