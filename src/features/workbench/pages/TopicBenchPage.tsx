import {
  ArrowLeft,
  Boxes,
  ClipboardList,
  RotateCcw,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { BenchCanvas } from "../components/BenchCanvas";
import { EquipmentPalette } from "../components/EquipmentPalette";
import { ExperimentPanel } from "../components/ExperimentPanel";
import { InspectorPanel } from "../components/InspectorPanel";
import { ReadingsDock } from "../components/ReadingsDock";
import { SandboxPanel } from "../components/SandboxPanel";
import {
  analyseAll,
  makeEnv,
  partDefinitions,
  sectionNames,
} from "../data/equipment";
import { sectionOrder } from "../data/kinds";
import { findTopic } from "../data/topics";
import { partLabel, useBench } from "../hooks/useBench";
import { useBenchClock } from "../hooks/useBenchClock";
import { useExperimentProgress } from "../hooks/useExperimentProgress";
import type { MeterReading, Selection } from "../workbench.types";

const sections = sectionOrder.map((id) => ({ id, name: sectionNames[id] }));

export default function TopicBenchPage() {
  const { topicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, tr } = useLanguage();
  const [bench, dispatch] = useBench();
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<"equipment" | "inspector" | "experiment">(
    searchParams.get("experiment") ? "experiment" : "equipment",
  );
  const now = useBenchClock(bench.parts);
  const topic = findTopic(topicId);
  const experiment = topic?.experiments.find(
    (item) => item.id === searchParams.get("experiment"),
  );
  const env = useMemo(
    () => makeEnv(bench.parts, bench.wires, bench.solution, now),
    [bench.parts, bench.wires, bench.solution, now],
  );
  const outcomes = useMemo(() => analyseAll(env), [env]);
  const readings: MeterReading[] = bench.parts.flatMap((part) => {
    const measures = outcomes.get(part.id)?.measures ?? [];
    const name = partLabel(
      bench.parts,
      part,
      partDefinitions[part.kind].name[language],
    );
    return measures.map((measure) => ({
      partId: part.id,
      measureId: measure.id,
      label:
        measures.length > 1 ? `${name} · ${measure.label[language]}` : name,
      unit: measure.unit,
      digits: measure.digits,
      value: measure.value,
    }));
  });
  const achieved = useExperimentProgress(
    experiment,
    {
      parts: bench.parts,
      wires: bench.wires,
      solution: bench.solution,
      records: bench.records,
      outcomes,
    },
    `${experiment?.id ?? "free"}:${attempt}`,
  );

  if (!topic)
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-black">
          {tr("Bench not found", "Benchi haikupatikana")}
        </h1>
        <Link
          to="/workbench"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-kenya-green px-5 text-sm font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr("Back to benches", "Rudi kwenye mabenchi")}
        </Link>
      </div>
    );

  function chooseExperiment(id: string | null) {
    setSearchParams(id ? { experiment: id } : {});
    if (id) setTab("experiment");
  }

  function resetBench() {
    dispatch({ type: "reset" });
    setAttempt((value) => value + 1);
  }

  function select(selection: Selection | null) {
    dispatch({ type: "select", selection });
    if (selection) setTab("inspector");
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
            {tr("Virtual labs", "Maabara pepe")}
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

      <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
        <div className="xl:sticky xl:top-4 xl:col-span-4 2xl:col-span-3">
          <SandboxPanel
            tab={tab}
            onTab={setTab}
            tabs={[
              {
                id: "equipment",
                label: tr("Equipment", "Vifaa"),
                icon: Boxes,
                content: (
                  <EquipmentPalette
                    needed={experiment?.equipment ?? []}
                    onAdd={(kind) => dispatch({ type: "add-part", kind })}
                  />
                ),
              },
              {
                id: "inspector",
                label: tr("Inspector", "Ukaguzi"),
                icon: SlidersHorizontal,
                content: (
                  <InspectorPanel
                    parts={bench.parts}
                    wires={bench.wires}
                    selection={bench.selection}
                    env={env}
                    outcomes={outcomes}
                    onSetParam={(id, param, value) =>
                      dispatch({ type: "set-param", id, param, value })
                    }
                    onPress={(id, control) =>
                      dispatch({ type: "press", id, control, now: Date.now() })
                    }
                    onRemove={() => dispatch({ type: "remove-selected" })}
                  />
                ),
              },
              {
                id: "experiment",
                label: experiment
                  ? `${tr("Experiment", "Jaribio")} ${achieved.length}/${experiment.goals.length}`
                  : tr("Experiment", "Jaribio"),
                icon: ClipboardList,
                content: (
                  <ExperimentPanel
                    experiments={topic.experiments}
                    experiment={experiment}
                    sections={sections}
                    achieved={achieved}
                    onChoose={chooseExperiment}
                  />
                ),
              },
            ]}
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-8 2xl:col-span-9">
          <BenchCanvas
            parts={bench.parts}
            wires={bench.wires}
            env={env}
            outcomes={outcomes}
            selection={bench.selection}
            pendingTerminal={bench.pendingTerminal}
            onAddPart={(kind, x, y) =>
              dispatch({ type: "add-part", kind, x, y })
            }
            onMovePart={(id, x, y) => dispatch({ type: "move-part", id, x, y })}
            onSelect={select}
            onTerminal={(terminal) => dispatch({ type: "terminal", terminal })}
            onTap={(id) => dispatch({ type: "tap", id })}
            onRemoveSelected={() => dispatch({ type: "remove-selected" })}
          />
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>
              {tr("Parts", "Vifaa")} {bench.parts.length}
            </span>
            <span>
              {tr("Wires", "Waya")} {bench.wires.length}
            </span>
            {bench.solution.ac && (
              <span className="text-sky-700 dark:text-sky-300">
                {tr("a.c.", "a.c.")}{" "}
                {Math.round(bench.solution.frequency * 10) / 10} Hz
              </span>
            )}
            {bench.solution.shortCircuit ? (
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
      </div>
    </div>
  );
}
