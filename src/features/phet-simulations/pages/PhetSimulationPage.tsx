import { ArrowLeft, ExternalLink, MonitorPlay, SearchX } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { EmbeddedSimulation } from "../../../shared/ui/EmbeddedSimulation";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { CatalogError } from "../components/CatalogError";
import { CatalogSkeleton } from "../components/CatalogSkeleton";
import { usePhetCatalog } from "../hooks/usePhetCatalog";

const backLinkClass =
  "group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold transition-colors hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900";

export default function PhetSimulationPage() {
  const { simName } = useParams();
  const navigate = useNavigate();
  const { tr } = useLanguage();
  const { state, retry } = usePhetCatalog();
  const simulation =
    state.status === "success"
      ? state.catalog.simulations.find((item) => item.name === simName)
      : undefined;

  return (
    <div className="space-y-5">
      <Link to="/simulations" className={backLinkClass}>
        <ArrowLeft
          className="size-4 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        {tr("All simulations", "Uigaji wote")}
      </Link>
      {state.status === "loading" && <CatalogSkeleton />}
      {state.status === "error" && (
        <CatalogError error={state.error} onRetry={retry} />
      )}
      {state.status === "success" && !simulation && (
        <EmptyState
          icon={SearchX}
          title={tr("Simulation not found", "Uigaji haujapatikana")}
          actionLabel={tr("Browse simulations", "Vinjari uigaji")}
          onAction={() => navigate("/simulations")}
        />
      )}
      {simulation && (
        <>
          <PageHeader
            icon={MonitorPlay}
            accent="blue"
            title={simulation.title}
            description={simulation.description || undefined}
            actions={
              <a
                href={simulation.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold transition-colors hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900"
              >
                {tr("Open on PhET", "Fungua kwenye PhET")}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            }
          />
          <EmbeddedSimulation
            key={simulation.name}
            title={simulation.title}
            src={simulation.runUrl}
          />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {tr(
              "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC-BY 4.0.",
              "Uigaji na PhET Interactive Simulations, Chuo Kikuu cha Colorado Boulder, kwa leseni ya CC-BY 4.0.",
            )}
          </p>
        </>
      )}
    </div>
  );
}
