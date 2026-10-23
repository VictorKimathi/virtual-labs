import {
  Activity,
  ArrowLeft,
  Battery,
  Cable,
  Gauge,
  Lightbulb,
  MousePointer2,
  Play,
  RotateCcw,
  Trash2,
  ToggleLeft,
} from "lucide-react";
import { lazy, Suspense, useRef, useState, type DragEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Camera } from "three";
import { useLanguage } from "../../../app/useLanguage";
import { SceneErrorBoundary } from "../../../shared/errors/SceneErrorBoundary";
import { WorkbenchFallback } from "../components/WorkbenchFallback";
import {
  isEquipmentKind,
  type EquipmentKind,
  type PlacedEquipment,
} from "../equipment.types";

const equipmentList = [
  {
    kind: "cell",
    en: "Cell",
    sw: "Seli",
    icon: Battery,
    detail: "Supplies electrical energy.",
    detailSw: "Hutoa nishati ya umeme.",
  },
  {
    kind: "bulb",
    en: "Bulb",
    sw: "Balbu",
    icon: Lightbulb,
    detail: "Lights when the sample circuit runs.",
    detailSw: "Huwaka sakiti ya mfano ikiendeshwa.",
  },
  {
    kind: "switch",
    en: "Switch",
    sw: "Swichi",
    icon: ToggleLeft,
    detail: "Opens or closes a circuit.",
    detailSw: "Hufungua au kufunga sakiti.",
  },
  {
    kind: "wire",
    en: "Wire",
    sw: "Waya",
    icon: Cable,
    detail: "Carries current between components.",
    detailSw: "Hubeba mkondo kati ya vifaa.",
  },
  {
    kind: "ammeter",
    en: "Ammeter",
    sw: "Amita",
    icon: Gauge,
    detail: "Measures electric current.",
    detailSw: "Hupima mkondo wa umeme.",
  },
  {
    kind: "voltmeter",
    en: "Voltmeter",
    sw: "Voltimita",
    icon: Activity,
    detail: "Measures potential difference.",
    detailSw: "Hupima tofauti ya uwezo.",
  },
] as const;

const starterEquipment: PlacedEquipment[] = [
  { id: "starter-cell", kind: "cell", x: -2.4, z: -1 },
  { id: "starter-bulb", kind: "bulb", x: 0, z: -1 },
  { id: "starter-switch", kind: "switch", x: 2.4, z: -1 },
  { id: "starter-wire", kind: "wire", x: 0, z: 1.3 },
];
const PhysicsScene = lazy(() =>
  import("../components/PhysicsScene").then((module) => ({
    default: module.PhysicsScene,
  })),
);

function clampToBench(x: number, z: number) {
  return {
    x: Math.max(-4.2, Math.min(4.2, x)),
    z: Math.max(-3.2, Math.min(3.2, z)),
  };
}

export default function SandboxPage() {
  const [searchParams] = useSearchParams();
  const { language, tr } = useLanguage();
  const [mode, setMode] = useState<"guided" | "free">(
    searchParams.get("mode") === "guided" ? "guided" : "free",
  );
  const [items, setItems] = useState<PlacedEquipment[]>(starterEquipment);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [running, setRunning] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const nextEquipmentId = useRef(0);
  const selected = items.find((item) => item.id === selectedId);
  const selectedDefinition = equipmentList.find(
    (item) => item.kind === selected?.kind,
  );
  const hasCircuitSet = ["cell", "bulb", "switch", "wire"].every((kind) =>
    items.some((item) => item.kind === kind),
  );
  const active = running && hasCircuitSet;

  function addEquipment(kind: EquipmentKind, x?: number, z?: number) {
    const position =
      x === undefined || z === undefined
        ? clampToBench(-2.5 + (items.length % 4) * 1.55, 1.3)
        : clampToBench(x, z);
    const id = `equipment-${++nextEquipmentId.current}`;
    setItems((current) => [...current, { id, kind, ...position }]);
    setSelectedId(id);
    setRunning(false);
  }
  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDropActive(false);
    const kind =
      event.dataTransfer.getData("application/x-virtual-lab-equipment") ||
      event.dataTransfer.getData("text/plain");
    if (!isEquipmentKind(kind)) return;
    const camera = cameraRef.current;
    if (!camera) {
      const rect = event.currentTarget.getBoundingClientRect();
      addEquipment(
        kind,
        ((event.clientX - rect.left) / rect.width) * 8.4 - 4.2,
        ((event.clientY - rect.top) / rect.height) * 6.4 - 3.2,
      );
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    try {
      const { Plane, Raycaster, Vector2, Vector3 } = await import("three");
      const pointer = new Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const point = new Vector3();
      if (
        raycaster.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), 0), point)
      )
        addEquipment(kind, point.x, point.z);
      else addEquipment(kind);
    } catch (error) {
      console.error("Equipment drop positioning failed", error);
      addEquipment(kind);
    }
  }
  function moveEquipment(id: string, x: number, z: number) {
    const position = clampToBench(x, z);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...position } : item)),
    );
  }
  function resetBench() {
    setItems(starterEquipment);
    setSelectedId(null);
    setDraggingId(null);
    setRunning(false);
  }
  function removeSelected() {
    if (!selectedId) return;
    setItems((current) => current.filter((item) => item.id !== selectedId));
    setSelectedId(null);
    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-widest text-kenya-green dark:text-green-400">
            {tr("Physics · Electricity", "Fizikia · Umeme")}
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            {tr("3D Virtual Lab", "Maabara Pepe ya 3D")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {tr(
              "Drag equipment from the left onto the bench. Click an item to add it, then drag placed items to rearrange them.",
              "Buruta vifaa kutoka kushoto hadi kwenye benchi. Bofya kuongeza kifaa, kisha buruta vifaa vilivyowekwa kuvipanga upya.",
            )}
          </p>
        </div>
        {mode === "guided" && (
          <Link
            to="/labs/ohms-law?step=4"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kenya-green dark:text-green-400"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr("Back to Ohm’s Law", "Rudi Sheria ya Ohm")}
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode("guided")}
            aria-pressed={mode === "guided"}
            className={`min-h-11 rounded-lg px-4 text-sm font-bold ${mode === "guided" ? "bg-white text-kenya-green shadow-sm dark:bg-slate-900 dark:text-green-400" : "text-slate-500"}`}
          >
            {tr("Guided", "Mwongozo")}
          </button>
          <button
            type="button"
            onClick={() => setMode("free")}
            aria-pressed={mode === "free"}
            className={`min-h-11 rounded-lg px-4 text-sm font-bold ${mode === "free" ? "bg-white text-kenya-green shadow-sm dark:bg-slate-900 dark:text-green-400" : "text-slate-500"}`}
          >
            {tr("Free build", "Unda huru")}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetBench}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold dark:border-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            {tr("Reset bench", "Weka upya")}
          </button>
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-kenya-red px-5 text-sm font-extrabold text-white"
          >
            <Play className="h-4 w-4" />
            {running ? tr("Stop", "Simamisha") : tr("Run", "Endesha")}
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-extrabold">
              {tr("Equipment", "Vifaa")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {tr("Drag to bench or click to add", "Buruta au bofya kuongeza")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {equipmentList.map(({ kind, en, sw, icon: Icon }) => (
              <button
                key={kind}
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/x-virtual-lab-equipment",
                    kind,
                  );
                  event.dataTransfer.setData("text/plain", kind);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onDragEnd={() => setDropActive(false)}
                onClick={() => addEquipment(kind)}
                className="flex min-h-16 cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm font-bold hover:border-kenya-green hover:bg-green-50 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-green-950"
              >
                <Icon className="h-6 w-6 shrink-0 text-kenya-green dark:text-green-400" />
                {language === "en" ? en : sw}
              </button>
            ))}
          </div>
        </aside>
        <section
          aria-label={tr("3D workbench", "Benchi la 3D")}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-7"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <h2 className="text-base font-extrabold">
                {tr("3D Workbench", "Benchi la 3D")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  "Drag to place · drag objects to move · scroll to zoom",
                  "Buruta kuweka · sogeza vifaa · tumia gurudumu kukuza",
                )}
              </p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-kenya-green dark:bg-green-950 dark:text-green-300">
              {items.length} {tr("items", "vifaa")}
            </span>
          </div>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setDropActive(true);
            }}
            onDragLeave={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              )
                setDropActive(false);
            }}
            onDrop={handleDrop}
            className={`relative h-96 xl:h-128 ${dropActive ? "ring-4 ring-inset ring-kenya-green" : ""}`}
          >
            <SceneErrorBoundary
              fallback={(reason) => (
                <WorkbenchFallback
                  equipment={items}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  reason={reason}
                />
              )}
            >
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-slate-600 dark:text-slate-300">
                    {tr("Loading 3D lab…", "Inafungua maabara ya 3D…")}
                  </div>
                }
              >
                <PhysicsScene
                  equipment={items}
                  selectedId={selectedId}
                  draggingId={draggingId}
                  running={active}
                  onCameraReady={(camera) => {
                    cameraRef.current = camera;
                  }}
                  onSelect={setSelectedId}
                  onDragStart={setDraggingId}
                  onMove={moveEquipment}
                  onDragEnd={() => setDraggingId(null)}
                />
              </Suspense>
            </SceneErrorBoundary>
            {dropActive && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-green-100/40">
                <span className="rounded-xl bg-kenya-green px-5 py-3 text-sm font-extrabold text-white">
                  {tr("Drop equipment here", "Weka kifaa hapa")}
                </span>
              </div>
            )}
          </div>
        </section>
        <aside className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-extrabold">
              {tr("Inspector", "Ukaguzi")}
            </h2>
            {selected && selectedDefinition ? (
              <>
                <p className="mt-3 text-lg font-bold text-kenya-green dark:text-green-400">
                  {language === "en"
                    ? selectedDefinition.en
                    : selectedDefinition.sw}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {language === "en"
                    ? selectedDefinition.detail
                    : selectedDefinition.detailSw}
                </p>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {tr(
                    "Drag this object on the bench to move it.",
                    "Buruta kifaa hiki kwenye benchi kukisogeza.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={removeSelected}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-kenya-red dark:border-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                  {tr("Remove", "Ondoa")}
                </button>
              </>
            ) : (
              <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                <MousePointer2 className="mt-1 h-4 w-4 shrink-0" />
                {tr(
                  "Select an object to inspect or remove it.",
                  "Chagua kifaa kukikagua au kukiondoa.",
                )}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-extrabold">
              {tr("Readouts", "Vipimo")}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {tr("Current", "Mkondo")}
                </p>
                <p className="mt-1 text-2xl font-black text-subject-physics">
                  {active ? "0.30" : "0.00"} <span className="text-sm">A</span>
                </p>
              </div>
              <div className="rounded-xl bg-green-50 p-3 dark:bg-green-950">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {tr("Voltage", "Volteji")}
                </p>
                <p className="mt-1 text-2xl font-black text-kenya-green dark:text-green-300">
                  {active ? "3.0" : "0.0"} <span className="text-sm">V</span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {hasCircuitSet
                ? tr(
                    "Illustrative readings for the sample equipment set.",
                    "Vipimo vya mfano kwa seti ya vifaa.",
                  )
                : tr(
                    "Add a cell, bulb, switch and wire to preview readings.",
                    "Ongeza seli, balbu, swichi na waya kuona vipimo vya mfano.",
                  )}
            </p>
          </div>
        </aside>
      </div>
      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
        {tr(
          "Equipment placement and 3D movement work now. Electrical connections and calculated circuit physics are future work.",
          "Uwekaji na usogezaji wa vifaa vya 3D vinafanya kazi sasa. Miunganisho ya umeme na hesabu za sakiti ni kazi ya baadaye.",
        )}
      </p>
    </div>
  );
}
