import { SearchX } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { CatalogError } from "../components/CatalogError";
import { CatalogSkeleton } from "../components/CatalogSkeleton";
import { SimulationCard } from "../components/SimulationCard";
import { SimulationFilters } from "../components/SimulationFilters";
import { usePhetCatalog } from "../hooks/usePhetCatalog";
import { usePhetFilters } from "../hooks/usePhetFilters";
import { buildFilterOptions, filterSimulations } from "../phet.filters";
import type { PhetCatalog } from "../phet.types";

function CatalogBrowser({
  catalog,
}: {
  catalog: PhetCatalog;
}) {
  const { tr } = useLanguage();
  const {
    filters,
    hasActiveFilters,
    setQuery,
    setSubject,
    setTopic,
    setLevel,
    setSort,
    clear,
  } = usePhetFilters();
  const options = useMemo(() => buildFilterOptions(catalog), [catalog]);
  const shown = useMemo(
    () => filterSimulations(catalog.simulations, options, filters),
    [catalog.simulations, options, filters],
  );

  return (
    <div className="space-y-5">
      <SimulationFilters
        filters={filters}
        options={options}
        hasActiveFilters={hasActiveFilters}
        onQueryChange={setQuery}
        onSubjectChange={setSubject}
        onTopicChange={setTopic}
        onLevelChange={setLevel}
        onSortChange={setSort}
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
              <SimulationCard
                simulation={simulation}
                tags={options.subjects
                  .filter((subject) =>
                    simulation.categoryIds.includes(subject.id),
                  )
                  .map((subject) => subject.label)}
              />
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

export default function PhetSimulationsPage() {
  const { tr } = useLanguage();
  const { state, retry } = usePhetCatalog();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("3D Simulations", "Uigaji wa 3D")}
        </h1>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
          {tr(
            "Free interactive science and maths simulations from PhET, University of Colorado Boulder. Filter by subject, topic or level, then open one to explore.",
            "Uigaji shirikishi wa bure wa sayansi na hisabati kutoka PhET, Chuo Kikuu cha Colorado Boulder. Chuja kwa somo, mada au kiwango, kisha fungua mmoja kuchunguza.",
          )}
        </p>
      </div>
      {state.status === "loading" && <CatalogSkeleton />}
      {state.status === "error" && (
        <CatalogError error={state.error} onRetry={retry} />
      )}
      {state.status === "success" && (
        <CatalogBrowser catalog={state.catalog} />
      )}
    </div>
  );
}
