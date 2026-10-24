import { Orbit, SearchX } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { RevealItem } from "../../../shared/ui/RevealItem";
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
    <div className="space-y-6">
      <PageHeader
        icon={Orbit}
        accent="orange"
        eyebrow={tr("Explore · PhysicsHub", "Chunguza · PhysicsHub")}
        title={tr("PhysicsHub simulations", "Uigaji wa PhysicsHub")}
        description={tr(
          "Free interactive physics simulations from PhysicsHub: motion, forces, energy, oscillations, optics and circuits. Filter by level, topic or difficulty, then open one.",
          "Uigaji shirikishi wa bure wa fizikia kutoka PhysicsHub: mwendo, nguvu, nishati, miyumbo, mwanga na sakiti. Chuja kwa kiwango, mada au ugumu, kisha fungua mmoja.",
        )}
      />
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
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {shown.map((simulation, index) => (
            <RevealItem key={simulation.id} index={index}>
              <PhysicshubCard simulation={simulation} />
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
