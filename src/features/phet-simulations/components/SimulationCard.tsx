import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import type { PhetSimulation } from "../phet.types";
import { SimulationThumbnail } from "./SimulationThumbnail";

type Props = { simulation: PhetSimulation; tags: string[] };

export function SimulationCard({ simulation, tags }: Props) {
  const { tr } = useLanguage();
  return (
    <Link
      to={`/simulations/${simulation.name}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"
    >
      <SimulationThumbnail src={simulation.thumbnailUrl} />
      <span className="flex flex-1 flex-col p-4">
        <span className="flex items-start justify-between gap-2">
          <span className="text-lg font-extrabold leading-snug">
            {simulation.title}
          </span>
          {simulation.isNew && (
            <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-kenya-green dark:bg-green-950 dark:text-green-300">
              {tr("New", "Mpya")}
            </span>
          )}
        </span>
        {simulation.description && (
          <span className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {simulation.description}
          </span>
        )}
        {tags.length > 0 && (
          <span className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </span>
        )}
      </span>
    </Link>
  );
}
