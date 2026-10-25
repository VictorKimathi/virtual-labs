import {
  ArrowLeft,
  Boxes,
  ClipboardList,
  PersonStanding,
  RotateCcw,
  ShieldPlus,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { ExperimentPanel } from "../../workbench/components/ExperimentPanel";
import { ReadingsDock } from "../../workbench/components/ReadingsDock";
import { SandboxPanel } from "../../workbench/components/SandboxPanel";
import { useExperimentProgress } from "../../workbench/hooks/useExperimentProgress";
import type { MeterReading, Selection } from "../../workbench/workbench.types";
import type { BioKind } from "../biology.types";
import { BioCanvas } from "../components/BioCanvas";
import { BioInspector } from "../components/BioInspector";
import { BioPalette } from "../components/BioPalette";
import { BioSafetyPanel } from "../components/BioSafetyPanel";
import { TimeBar } from "../components/TimeBar";
import { bioExperiments } from "../data/biology.experiments";
import {
  analyseAllBio,
  bioDefinitions,
  bioPartLabel,
  makeBioEnv,
} from "../data/equipment";
import { bioSectionNames, bioSectionOrder } from "../data/kinds";
import { useBioBench } from "../hooks/useBioBench";
import { useBioClock } from "../hooks/useBioClock";

type Tab = "equipment" | "inspector" | "safety" | "experiment";

const sections = bioSectionOrder.map((id) => ({
  id,
  name: bioSectionNames[id],
}));
const noEquipment: BioKind[] = [];

export default function BiologyBenchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, tr } = useLanguage();
  const [bench, dispatch] = useBioBench();
  const [attempt, setAttempt] = useState(0);
  const requested = searchParams.get("experiment");
  const [tab, setTab] = useState<Tab>(requested ? "experiment" : "equipment");
  useBioClock(bench.running, bench.speed, dispatch);
  const experiment = bioExperiments.find((item) => item.id === requested);
  const env = useMemo(
    () => makeBioEnv(bench.parts, bench.time),
    [bench.parts, bench.time],
  );
  const outcomes = useMemo(() => analyseAllBio(env), [env]);
  const openIncidents = bench.incidents.filter(
    (incident) => !incident.resolved,
  ).length;
  const addPart = useCallback(
    (kind: BioKind) => dispatch({ type: "add-part", kind }),
    [dispatch],
  );

  const readings: MeterReading[] = bench.parts.flatMap((part) => {
    const measures = outcomes.get(part.id)?.measures ?? [];
    const name = bioPartLabel(
      bench.parts,
      part,
      bioDefinitions[part.kind].name[language],
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
      records: bench.records,
      incidents: bench.incidents,
      time: bench.time,
    },
    `${experiment?.id ?? "free"}:${attempt}`,
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
            {tr("Biology Lab", "Maabara ya Biolojia")}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/biology/anatomy"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <PersonStanding className="h-4 w-4" />
            {tr("Human anatomy 3D", "Anatomia ya binadamu 3D")}
          </Link>
          <button
            type="button"
            onClick={resetBench}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            {tr("Clear bench", "Safisha benchi")}
          </button>
        </div>
      </div>

      {requested && !experiment && (
        <p
          role="alert"
          className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          {tr(
            "That experiment was not found. Choose one from the Experiment tab.",
            "Jaribio hilo halikupatikana. Chagua moja kutoka kichupo cha Jaribio.",
          )}
        </p>
      )}

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
                  <BioPalette
                    needed={experiment?.equipment ?? noEquipment}
                    onAdd={addPart}
                  />
                ),
              },
              {
                id: "inspector",
                label: tr("Inspector", "Ukaguzi"),
                icon: SlidersHorizontal,
                content: (
                  <BioInspector
                    parts={bench.parts}
                    selection={bench.selection}
                    env={env}
                    outcomes={outcomes}
                    onSetParam={(id, param, value) =>
                      dispatch({ type: "set-param", id, param, value })
                    }
                    onPress={(id, control) =>
                      dispatch({ type: "press", id, control })
                    }
                    onRemove={() => dispatch({ type: "remove-selected" })}
                  />
                ),
              },
              {
                id: "safety",
                label: tr("Safety", "Usalama"),
                icon: ShieldPlus,
                alert: openIncidents > 0,
                content: (
                  <BioSafetyPanel
                    parts={bench.parts}
                    incidents={bench.incidents}
                    onWear={(kind) => dispatch({ type: "wear", kind })}
                    onUse={(kind) => dispatch({ type: "use", kind })}
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
                    experiments={bioExperiments}
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
          <TimeBar
            time={bench.time}
            speed={bench.speed}
            running={bench.running}
            onSpeed={(speed) => dispatch({ type: "speed", speed })}
            onRunning={(running) => dispatch({ type: "run", running })}
          />
          <BioCanvas
            parts={bench.parts}
            env={env}
            outcomes={outcomes}
            incidents={bench.incidents}
            selection={bench.selection}
            onAddPart={(kind, x, y) =>
              dispatch({ type: "add-part", kind, x, y })
            }
            onMovePart={(id, x, y) => dispatch({ type: "move-part", id, x, y })}
            onSelect={select}
            onTap={(id) => dispatch({ type: "tap", id })}
            onRemoveSelected={() => dispatch({ type: "remove-selected" })}
            onOpenSafety={() => setTab("safety")}
          />
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>
              {tr("Items", "Vifaa")} {bench.parts.length}
            </span>
            {openIncidents > 0 ? (
              <span
                role="alert"
                className="ml-auto inline-flex items-center gap-1 text-red-700 dark:text-red-400"
              >
                <TriangleAlert className="h-4 w-4" />
                {tr(
                  `${openIncidents} safety incident(s) to deal with`,
                  `Matukio ${openIncidents} ya usalama ya kushughulikia`,
                )}
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1.5 text-green-700 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {tr("Working safely", "Unafanya kazi kwa usalama")}
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
