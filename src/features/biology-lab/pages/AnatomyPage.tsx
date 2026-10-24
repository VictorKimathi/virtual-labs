import {
  ArrowLeft,
  Eye,
  EyeOff,
  Layers3,
  LoaderCircle,
  MousePointerClick,
  PersonStanding,
  RotateCcw,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { SceneErrorBoundary } from "../../../shared/errors/SceneErrorBoundary";
import { FilterChip } from "../../../shared/ui/FilterChip";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { SearchField } from "../../../shared/ui/SearchField";
import {
  anatomyGroupFor,
  type AnatomyGroup,
  type AnatomyPart,
  type AnatomyView,
} from "../anatomy.types";
import anatomyParts from "../data/anatomyParts.json";

const AnatomyScene = lazy(() =>
  import("../components/AnatomyScene").then((module) => ({
    default: module.AnatomyScene,
  })),
);

const parts: AnatomyPart[] = anatomyParts;
const groups: { id: AnatomyGroup; en: string; sw: string }[] = [
  { id: "all", en: "All systems", sw: "Mifumo yote" },
  { id: "muscular", en: "Muscles", sw: "Misuli" },
  { id: "organs", en: "Organs", sw: "Viungo" },
  { id: "skeletal", en: "Skeleton", sw: "Mifupa" },
  { id: "nervous", en: "Nervous", sw: "Neva" },
  { id: "lymphatic", en: "Lymphatic", sw: "Limfu" },
];
const views: { id: AnatomyView; en: string; sw: string }[] = [
  { id: "front", en: "Front", sw: "Mbele" },
  { id: "back", en: "Back", sw: "Nyuma" },
  { id: "side", en: "Side", sw: "Pembeni" },
  { id: "perspective", en: "Perspective", sw: "Mtazamo" },
];

function initialView(value: string | null): AnatomyView {
  return views.find((view) => view.id === value)?.id ?? "front";
}

function AnatomyFallback({
  reason,
  onFailed,
}: {
  reason: "webgl-unavailable" | "scene-error";
  onFailed: () => void;
}) {
  const { tr } = useLanguage();
  useEffect(() => onFailed(), [onFailed]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
      <p className="font-extrabold">
        {reason === "webgl-unavailable"
          ? tr("3D graphics are unavailable", "Michoro ya 3D haipatikani")
          : tr(
              "The 3D model could not load",
              "Muundo wa 3D haukuweza kufunguka",
            )}
      </p>
      <p className="max-w-md text-sm text-slate-300">
        {tr(
          "You can still search and inspect the named structures in the list.",
          "Bado unaweza kutafuta na kuchunguza sehemu zenye majina kwenye orodha.",
        )}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-11 rounded-xl bg-kenya-green px-5 text-sm font-extrabold text-white"
      >
        {tr("Retry 3D", "Jaribu 3D tena")}
      </button>
    </div>
  );
}

export default function AnatomyPage() {
  const { language, tr } = useLanguage();
  const [searchParams] = useSearchParams();
  const [separation, setSeparation] = useState(0);
  const [group, setGroup] = useState<AnatomyGroup>("all");
  const [view, setView] = useState<AnatomyView>(() =>
    initialView(searchParams.get("view")),
  );
  const [showInside, setShowInside] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sceneStatus, setSceneStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const selected = parts.find((part) => part.id === selectedId);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const shownParts = parts.filter(
    (part) =>
      (group === "all" || anatomyGroupFor(part.system) === group) &&
      part.name.toLocaleLowerCase().includes(normalizedQuery),
  );
  const visibleStructures = parts.filter((part) => {
    const partGroup = anatomyGroupFor(part.system);
    if (group !== "all") return partGroup === group;
    return (
      separation > 0 ||
      (showInside ? partGroup !== "muscular" : partGroup === "muscular")
    );
  }).length;

  function selectPart(part: AnatomyPart) {
    setSelectedId(part.id);
    setSeparation(100);
  }

  function reset() {
    setSeparation(0);
    setGroup("all");
    setView("front");
    setQuery("");
    setSelectedId(null);
    setShowInside(false);
  }

  const fallback = (reason: "webgl-unavailable" | "scene-error") => (
    <AnatomyFallback reason={reason} onFailed={() => setSceneStatus("error")} />
  );
  const panelButton =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-extrabold transition-colors";

  return (
    <div className="space-y-6">
      <Link
        to="/workbench#biology"
        className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold transition-colors hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900"
      >
        <ArrowLeft
          className="size-4 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        {tr("Biology practice bench", "Benchi la mazoezi ya Biolojia")}
      </Link>
      <PageHeader
        icon={PersonStanding}
        eyebrow={tr("Biology · 3D atlas", "Biolojia · Atlasi ya 3D")}
        title={tr("Explore the human body", "Chunguza mwili wa binadamu")}
        description={tr(
          `Explore the complete body view, reveal the internal anatomy, then disassemble ${parts.length} structures into organized rows. Rotate, zoom, filter, and select a part to inspect it.`,
          `Chunguza mwili mzima, ona anatomia ya ndani, kisha tenganisha sehemu ${parts.length} katika mistari iliyopangwa. Zungusha, kuza, chuja na uchague sehemu kuichunguza.`,
        )}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <section
          aria-label={tr(
            "3D human anatomy model",
            "Muundo wa 3D wa mwili wa binadamu",
          )}
          className="relative isolate h-176 overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-b from-slate-800 via-slate-950 to-black shadow-xl shadow-slate-900/20 lg:col-span-8"
        >
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/3 -z-10 size-96 -translate-x-1/2 rounded-full bg-kenya-red/15 blur-3xl"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-linear-to-t from-slate-700/30 to-transparent"
          />
          <div className="absolute inset-0">
            <SceneErrorBoundary fallback={fallback}>
              <Suspense fallback={null}>
                <AnatomyScene
                  separation={separation}
                  group={group}
                  view={view}
                  showInside={showInside}
                  selectedId={selectedId}
                  fallback={fallback("webgl-unavailable")}
                  onSelect={setSelectedId}
                  onExplode={() => setSeparation(100)}
                  onLoaded={() => setSceneStatus("ready")}
                />
              </Suspense>
            </SceneErrorBoundary>
          </div>

          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
            <p
              aria-live="polite"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-md"
            >
              <span
                aria-hidden="true"
                className="mr-2 inline-block size-2 rounded-full bg-sky-400"
              />
              {tr("Visible structures", "Sehemu zinazoonekana")}:{" "}
              {visibleStructures.toLocaleString()}
            </p>
            <p className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md sm:inline-flex">
              <MousePointerClick className="size-4" aria-hidden="true" />
              {separation === 0
                ? tr(
                    "Drag to rotate · scroll to zoom · click to disassemble",
                    "Buruta kuzungusha · gurudumu kukuza · bofya kutenganisha",
                  )
                : tr(
                    "Ordered rows: muscles · organs · skeleton · nervous · lymphatic",
                    "Mistari: misuli · viungo · mifupa · neva · limfu",
                  )}
            </p>
          </div>

          {sceneStatus === "loading" && (
            <div
              role="status"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-slate-300"
            >
              <LoaderCircle
                className="size-8 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              {tr(
                "Loading 3D anatomy model…",
                "Inafungua muundo wa anatomia wa 3D…",
              )}
            </div>
          )}

          <div className="absolute inset-x-3 bottom-3 space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-white shadow-2xl backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label={tr("Camera view", "Mwonekano wa kamera")}
                className="flex flex-1 gap-1 rounded-xl bg-white/10 p-1"
              >
                {views.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setView(option.id)}
                    aria-pressed={view === option.id}
                    className={`min-h-9 flex-1 rounded-lg px-2 text-xs font-extrabold transition-colors ${view === option.id ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}
                  >
                    {language === "en" ? option.en : option.sw}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowInside((current) => !current)}
                aria-pressed={showInside}
                className={`${panelButton} ${showInside ? "bg-sky-400 text-slate-950" : "bg-white/10 hover:bg-white/20"}`}
              >
                {showInside ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
                {showInside
                  ? tr("Show body", "Onyesha mwili")
                  : tr("Show inside", "Onyesha ndani")}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label={tr("Reset view", "Weka upya")}
                className={`${panelButton} bg-white/10 hover:bg-white/20`}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSeparation(separation === 0 ? 100 : 0)}
                className={`${panelButton} shrink-0 bg-kenya-green px-4 hover:bg-green-700`}
              >
                <Layers3 className="size-4" aria-hidden="true" />
                {separation === 0
                  ? tr("Disassemble", "Tenganisha")
                  : tr("Assemble", "Unganisha")}
              </button>
              <label className="min-w-0 flex-1">
                <span className="mb-1 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>{tr("Assembled", "Imeunganishwa")}</span>
                  <span className="text-slate-200">
                    {tr("Spread structures apart", "Tenganisha sehemu")}:{" "}
                    {separation}%
                  </span>
                  <span>{tr("Apart", "Imetenganishwa")}</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={separation}
                  onChange={(event) =>
                    setSeparation(Number(event.target.value))
                  }
                  className="block w-full accent-sky-400"
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:col-span-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-black">
              {tr("Body systems", "Mifumo ya mwili")}
            </h2>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label={tr(
                "Filter by body system",
                "Chuja kwa mfumo wa mwili",
              )}
            >
              {groups.map((option) => (
                <FilterChip
                  key={option.id}
                  active={group === option.id}
                  onClick={() => {
                    setGroup(option.id);
                    setSelectedId(null);
                  }}
                >
                  {language === "en" ? option.en : option.sw}
                </FilterChip>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-black">
              {tr("Find a structure", "Tafuta sehemu")}
            </h2>
            <div className="mt-3 flex">
              <SearchField
                label={tr("Search structures", "Tafuta sehemu")}
                placeholder={tr("Search by name", "Tafuta kwa jina")}
                value={query}
                onChange={setQuery}
              />
            </div>
            <p
              className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400"
              aria-live="polite"
            >
              {shownParts.length}{" "}
              {tr("structures found", "sehemu zimepatikana")}
            </p>
            {shownParts.length ? (
              <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
                {shownParts.map((part) => (
                  <li key={part.id}>
                    <button
                      type="button"
                      onClick={() => selectPart(part)}
                      aria-pressed={selectedId === part.id}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${selectedId === part.id ? "bg-green-50 font-bold text-kenya-green dark:bg-green-950 dark:text-green-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      {part.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {tr(
                  "No structures match. Try another name or system.",
                  "Hakuna sehemu zinazolingana. Jaribu jina au mfumo mwingine.",
                )}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-black">
              {tr("Selected structure", "Sehemu iliyochaguliwa")}
            </h2>
            {selected ? (
              <div className="mt-3">
                <p className="text-lg font-extrabold text-kenya-green dark:text-green-300">
                  {selected.name}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {tr("System", "Mfumo")}:{" "}
                  {
                    groups.find(
                      (option) =>
                        option.id === anatomyGroupFor(selected.system),
                    )?.[language === "en" ? "en" : "sw"]
                  }
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {tr(
                  "Select a structure in the model or list.",
                  "Chagua sehemu kwenye muundo au orodha.",
                )}
              </p>
            )}
          </section>
        </aside>
      </div>

      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
        {tr(
          "Anatomical names are shown in English from the source atlas. 3D model: Z-Anatomy contributors, adapted by Vanatome, CC BY-SA 4.0.",
          "Majina ya anatomia yanaonyeshwa kwa Kiingereza kutoka atlasi ya chanzo. Muundo wa 3D: wachangiaji wa Z-Anatomy, umebadilishwa na Vanatome, CC BY-SA 4.0.",
        )}{" "}
        <a
          href="https://github.com/Z-Anatomy/Models"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Z-Anatomy
        </a>
        {" · "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {tr("License", "Leseni")}
        </a>
      </p>
    </div>
  );
}
