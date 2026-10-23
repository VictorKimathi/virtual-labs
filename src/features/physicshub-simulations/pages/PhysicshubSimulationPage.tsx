import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { EmbeddedSimulation } from "../../../shared/ui/EmbeddedSimulation";
import { findPhysicshubSimulation } from "../physicshub.filters";
import { PHYSICSHUB_ORIGIN, PHYSICSHUB_SOURCE_URL } from "../physicshub.config";

const backLinkClass =
  "inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-kenya-green dark:text-green-400";

export default function PhysicshubSimulationPage() {
  const { simId } = useParams();
  const { tr } = useLanguage();
  const simulation = findPhysicshubSimulation(simId);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link to="/physicshub" className={backLinkClass}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {tr("All simulations", "Uigaji wote")}
      </Link>
      {simulation ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight">
                {simulation.title}
              </h1>
              <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
                {simulation.description}
              </p>
            </div>
            <a
              href={`${PHYSICSHUB_ORIGIN}/simulations/${simulation.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold dark:border-slate-700"
            >
              {tr("Open on PhysicsHub", "Fungua kwenye PhysicsHub")}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <EmbeddedSimulation
            key={simulation.id}
            title={simulation.title}
            src={`${PHYSICSHUB_ORIGIN}/simulations/${simulation.id}?embed=1`}
          />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {tr(
              "Simulation by PhysicsHub, an open-source project under the MIT licence: ",
              "Uigaji na PhysicsHub, mradi huria chini ya leseni ya MIT: ",
            )}
            <a
              href={PHYSICSHUB_SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline"
            >
              {tr("source code", "msimbo chanzo")}
            </a>
            .
          </p>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="font-bold">
            {tr("Simulation not found", "Uigaji haujapatikana")}
          </p>
          <Link
            to="/physicshub"
            className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-kenya-green px-4 text-sm font-bold text-white"
          >
            {tr("Browse simulations", "Vinjari uigaji")}
          </Link>
        </div>
      )}
    </div>
  );
}
