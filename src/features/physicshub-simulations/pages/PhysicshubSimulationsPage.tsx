import { SearchX } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { PhysicshubCard } from "../components/PhysicshubCard";
import { PhysicshubFilters } from "../components/PhysicshubFilters";
import { usePhysicshubFilters } from "../hooks/usePhysicshubFilters";
import { filterPhysicshubSimulations } from "../physicshub.filters";

export default function PhysicshubSimulationsPage() {
  const { tr } = useLanguage();
  const {
    filters,
    hasActiveFilters,
    setQuery,
    setLevel,
    setTopic,
    setDifficulty,
    clear,
  } = usePhysicshubFilters();
  const shown = useMemo(() => filterPhysicshubSimulations(filters), [filters]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("PhysicsHub simulations", "Uigaji wa PhysicsHub")}
        </h1>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
          {tr(
            "Free interactive physics simulations from PhysicsHub: motion, forces, energy, oscillations, optics and circuits. Filter by level, topic or difficulty, then open one.",
            "Uigaji shirikishi wa bure wa fizikia kutoka PhysicsHub: mwendo, nguvu, nishati, miyumbo, mwanga na sakiti. Chuja kwa kiwango, mada au ugumu, kisha fungua mmoja.",
          )}
        </p>
      </div>
      <PhysicshubFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onQueryChange={setQuery}
        onLevelChange={setLevel}
        onTopicChange={setTopic}
        onDifficultyChange={setDifficulty}
        onClear={clear}
      />
      <p
        aria-live="polite"
        className="text-sm font-semibold text-slate-500 dark:text-slate-400"
      >
        {shown.length} {tr("simulations", "uigaji")}
      </p>
      {shown.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((simulation) => (
            <li key={simulation.id}>
              <PhysicshubCard simulation={simulation} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <SearchX
            className="mx-auto h-8 w-8 text-slate-400"
            aria-hidden="true"
          />
          <p className="mt-3 font-bold">
            {tr(
              "No simulations match these filters",
              "Hakuna uigaji unaolingana",
            )}
          </p>
          <button
            type="button"
            onClick={clear}
            className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-kenya-green px-4 text-sm font-bold text-white"
          >
            {tr("Show all simulations", "Onyesha uigaji wote")}
          </button>
        </div>
      )}
    </div>
  );
}
