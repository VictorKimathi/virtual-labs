import { MonitorPlay, SearchX } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { RevealItem } from "../../../shared/ui/RevealItem";
import { CatalogError } from "../components/CatalogError";
import { CatalogSkeleton } from "../components/CatalogSkeleton";
import { SimulationCard } from "../components/SimulationCard";
import { SimulationFilters } from "../components/SimulationFilters";
import { usePhetCatalog } from "../hooks/usePhetCatalog";
import { usePhetFilters } from "../hooks/usePhetFilters";
import { buildFilterOptions, filterSimulations } from "../phet.filters";
import type { PhetCatalog } from "../phet.types";

function CatalogBrowser({ catalog }: { catalog: PhetCatalog }) {
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
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {shown.map((simulation, index) => (
            <RevealItem key={simulation.id} index={index}>
              <SimulationCard
                simulation={simulation}
                tags={options.subjects
                  .filter((subject) =>
                    simulation.categoryIds.includes(subject.id),
                  )
                  .map((subject) => subject.label)}
              />
            </RevealItem>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title={tr(
            "No simulations match these filters",
            "Hakuna uigaji unaolingana",
          )}
          actionLabel={tr("Show all simulations", "Onyesha uigaji wote")}
          onAction={clear}
        />
      )}
    </div>
  );
}

export default function PhetSimulationsPage() {
  const { tr } = useLanguage();
  const { state, retry } = usePhetCatalog();
  return (
    <div className="space-y-6">
      <PageHeader
        icon={MonitorPlay}
        accent="blue"
        eyebrow={tr("Explore · PhET", "Chunguza · PhET")}
        title={tr("3D Simulations", "Uigaji wa 3D")}
        description={tr(
          "Free interactive science and maths simulations from PhET, University of Colorado Boulder. Filter by subject, topic or level, then open one to explore.",
          "Uigaji shirikishi wa bure wa sayansi na hisabati kutoka PhET, Chuo Kikuu cha Colorado Boulder. Chuja kwa somo, mada au kiwango, kisha fungua mmoja kuchunguza.",
        )}
      />
      {state.status === "loading" && <CatalogSkeleton />}
      {state.status === "error" && (
        <CatalogError error={state.error} onRetry={retry} />
      )}
      {state.status === "success" && <CatalogBrowser catalog={state.catalog} />}
    </div>
  );
}
