import { ArrowLeft, ExternalLink, Orbit, SearchX } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { EmbeddedSimulation } from "../../../shared/ui/EmbeddedSimulation";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { findPhysicshubSimulation } from "../physicshub.filters";
import { PHYSICSHUB_ORIGIN, PHYSICSHUB_SOURCE_URL } from "../physicshub.config";

const backLinkClass =
  "group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold transition-colors hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900";

export default function PhysicshubSimulationPage() {
  const { simId } = useParams();
  const navigate = useNavigate();
  const { tr } = useLanguage();
  const simulation = findPhysicshubSimulation(simId);

  return (
    <div className="space-y-5">
      <Link to="/physicshub" className={backLinkClass}>
        <ArrowLeft
          className="size-4 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        {tr("All simulations", "Uigaji wote")}
      </Link>
      {simulation ? (
        <>
          <PageHeader
            icon={Orbit}
            accent="orange"
            title={simulation.title}
            description={simulation.description}
            actions={
              <a
                href={`${PHYSICSHUB_ORIGIN}/simulations/${simulation.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold transition-colors hover:border-kenya-green dark:border-slate-700 dark:bg-slate-900"
              >
                {tr("Open on PhysicsHub", "Fungua kwenye PhysicsHub")}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            }
          />
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
        <EmptyState
          icon={SearchX}
          title={tr("Simulation not found", "Uigaji haujapatikana")}
          actionLabel={tr("Browse simulations", "Vinjari uigaji")}
          onAction={() => navigate("/physicshub")}
        />
      )}
    </div>
  );
}
