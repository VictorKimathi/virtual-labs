import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { EmbeddedSimulation } from "../../../shared/ui/EmbeddedSimulation";
import { CatalogError } from "../components/CatalogError";
import { CatalogSkeleton } from "../components/CatalogSkeleton";
import { usePhetCatalog } from "../hooks/usePhetCatalog";

const backLinkClass =
  "inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-kenya-green dark:text-green-400";

export default function PhetSimulationPage() {
  const { simName } = useParams();
  const { tr } = useLanguage();
  const { state, retry } = usePhetCatalog();
  const simulation =
    state.status === "success"
      ? state.catalog.simulations.find((item) => item.name === simName)
      : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link to="/simulations" className={backLinkClass}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {tr("All simulations", "Uigaji wote")}
      </Link>
      {state.status === "loading" && <CatalogSkeleton />}
      {state.status === "error" && (
        <CatalogError error={state.error} onRetry={retry} />
      )}
      {state.status === "success" && !simulation && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="font-bold">
            {tr("Simulation not found", "Uigaji haujapatikana")}
          </p>
          <Link
            to="/simulations"
            className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-kenya-green px-4 text-sm font-bold text-white"
          >
            {tr("Browse simulations", "Vinjari uigaji")}
          </Link>
        </div>
      )}
      {simulation && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight">
                {simulation.title}
              </h1>
              {simulation.description && (
                <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
                  {simulation.description}
                </p>
              )}
            </div>
            <a
              href={simulation.pageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold dark:border-slate-700"
            >
              {tr("Open on PhET", "Fungua kwenye PhET")}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
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
