import { ArrowLeft, Eye, MousePointer2, RotateCcw, Trash2 } from "lucide-react";
import { lazy, Suspense, useRef, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import type { Camera } from "three";
import { useLanguage } from "../../../app/useLanguage";
import { SceneErrorBoundary } from "../../../shared/errors/SceneErrorBoundary";
import { BiologyFallback } from "../components/BiologyFallback";
import { PlantCellDiagram } from "../components/PlantCellDiagram";
import { biologyEquipment } from "../equipment.data";
import {
  isBiologyEquipmentKind,
  type BiologyEquipmentKind,
  type PlacedBiologyEquipment,
} from "../equipment.types";

const BiologyScene = lazy(() =>
  import("../components/BiologyScene").then((module) => ({
    default: module.BiologyScene,
  })),
);

const starterEquipment: PlacedBiologyEquipment[] = [
  { id: "starter-microscope", kind: "microscope", x: -1.7, z: -0.6 },
  { id: "starter-slide", kind: "slide", x: 1.2, z: -0.7 },
  { id: "starter-petri-dish", kind: "petri-dish", x: 1.6, z: 1.3 },
];

function clampToBench(x: number, z: number) {
  return {
    x: Math.max(-4.2, Math.min(4.2, x)),
    z: Math.max(-3.2, Math.min(3.2, z)),
  };
}

export default function BiologyLabPage() {
  const { language, tr } = useLanguage();
  const [items, setItems] =
    useState<PlacedBiologyEquipment[]>(starterEquipment);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [viewingSpecimen, setViewingSpecimen] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const nextId = useRef(0);
  const selected = items.find((item) => item.id === selectedId);
  const selectedDefinition = biologyEquipment.find(
    (entry) => entry.kind === selected?.kind,
  );
  const canObserve = ["microscope", "slide"].every((kind) =>
    items.some((item) => item.kind === kind),
  );

  function addEquipment(kind: BiologyEquipmentKind, x?: number, z?: number) {
    const position =
      x === undefined || z === undefined
        ? clampToBench(-2.4 + (items.length % 4) * 1.5, 1.3)
        : clampToBench(x, z);
    const id = `biology-equipment-${++nextId.current}`;
    setItems((current) => [...current, { id, kind, ...position }]);
    setSelectedId(id);
    setViewingSpecimen(false);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDropActive(false);
    const kind =
      event.dataTransfer.getData(
        "application/x-virtual-lab-biology-equipment",
      ) || event.dataTransfer.getData("text/plain");
    if (!isBiologyEquipmentKind(kind)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const camera = cameraRef.current;
    if (!camera) {
      addEquipment(
        kind,
        ((event.clientX - rect.left) / rect.width) * 8.4 - 4.2,
        ((event.clientY - rect.top) / rect.height) * 6.4 - 3.2,
      );
      return;
    }
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
      console.error("Biology equipment drop positioning failed", error);
      addEquipment(kind);
    }
  }

  function moveEquipment(id: string, x: number, z: number) {
    const position = clampToBench(x, z);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...position } : item)),
    );
  }

  function removeSelected() {
    if (!selectedId) return;
    setItems((current) => current.filter((item) => item.id !== selectedId));
    setSelectedId(null);
    setViewingSpecimen(false);
  }

  function resetBench() {
    setItems(starterEquipment);
    setSelectedId(null);
    setDraggingId(null);
    setViewingSpecimen(false);
  }

  const fallback = (reason: "webgl-unavailable" | "scene-error") => (
    <BiologyFallback
      equipment={items}
      selectedId={selectedId}
      onSelect={setSelectedId}
      reason={reason}
    />
  );

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
            {tr("Microscope station", "Kituo cha hadubini")}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/labs/plant-cells?step=4"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold dark:border-slate-700"
          >
            {tr("Open Plant Cells lesson", "Fungua somo la Seli za Mimea")}
          </Link>
          <button
            type="button"
            onClick={resetBench}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold dark:border-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            {tr("Reset bench", "Weka upya")}
          </button>
          <button
            type="button"
            onClick={() => setViewingSpecimen(true)}
            disabled={!canObserve}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-kenya-red px-4 text-sm font-extrabold text-white disabled:opacity-40"
          >
            <Eye className="h-4 w-4" />
            {tr("Observe slide", "Chunguza slaidi")}
          </button>
        </div>
      </div>
      <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {tr(
          "Place the microscope and a plant slide on the bench, then press Observe slide to see the parts of a plant cell.",
          "Weka hadubini na slaidi ya mmea kwenye benchi, kisha bonyeza Chunguza slaidi kuona sehemu za seli ya mmea.",
        )}
      </p>

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h2 className="text-base font-extrabold">
            {tr("Equipment", "Vifaa")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {tr("Drag to bench or click to add", "Buruta au bofya kuongeza")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
            {biologyEquipment.map(({ kind, en, sw, icon: Icon }) => (
              <button
                key={kind}
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/x-virtual-lab-biology-equipment",
                    kind,
                  );
                  event.dataTransfer.setData("text/plain", kind);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onDragEnd={() => setDropActive(false)}
                onClick={() => addEquipment(kind)}
                className="flex min-h-16 cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm font-bold hover:border-kenya-green hover:bg-green-50 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-green-950"
              >
                <Icon className="h-6 w-6 shrink-0 text-subject-biology" />
                {language === "en" ? en : sw}
              </button>
            ))}
          </div>
        </aside>

        <section
          aria-label={tr("3D biology workbench", "Benchi la Biolojia 3D")}
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
            className={`relative h-96 xl:h-144 ${dropActive ? "ring-4 ring-inset ring-kenya-green" : ""}`}
          >
            <SceneErrorBoundary fallback={fallback}>
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-slate-600 dark:text-slate-300">
                    {tr("Loading 3D lab…", "Inafungua maabara ya 3D…")}
                  </div>
                }
              >
                <BiologyScene
                  equipment={items}
                  selectedId={selectedId}
                  draggingId={draggingId}
                  fallback={fallback("webgl-unavailable")}
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
                <p className="mt-3 text-lg font-bold text-subject-biology">
                  {language === "en"
                    ? selectedDefinition.en
                    : selectedDefinition.sw}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {language === "en"
                    ? selectedDefinition.detail
                    : selectedDefinition.detailSw}
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
              {tr("Observation", "Uchunguzi")}
            </h2>
            {viewingSpecimen && canObserve ? (
              <div className="mt-3">
                <PlantCellDiagram />
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {tr(
                    "Illustrative view, not a live microscope simulation.",
                    "Mwonekano wa mfano, si uigaji wa moja kwa moja wa hadubini.",
                  )}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {canObserve
                  ? tr(
                      "Use Observe slide to preview the main parts of a plant cell.",
                      "Tumia Chunguza slaidi kuona sehemu kuu za seli ya mmea.",
                    )
                  : tr(
                      "Add a microscope and plant slide to observe.",
                      "Ongeza hadubini na slaidi ya mmea ili kuchunguza.",
                    )}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
