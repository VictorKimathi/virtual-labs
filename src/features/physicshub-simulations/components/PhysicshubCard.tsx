import { Link } from "react-router-dom";
import { RemoteThumbnail } from "../../../shared/ui/RemoteThumbnail";
import { PHYSICSHUB_ORIGIN } from "../physicshub.config";
import type { PhysicshubSimulation } from "../physicshub.types";

type Props = { simulation: PhysicshubSimulation };

export function PhysicshubCard({ simulation }: Props) {
  return (
    <Link
      to={`/physicshub/${simulation.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"
    >
      <RemoteThumbnail src={`${PHYSICSHUB_ORIGIN}${simulation.thumbnail}`} />
      <span className="flex flex-1 flex-col p-4">
        <span className="text-lg font-extrabold leading-snug">
          {simulation.title}
        </span>
        <span className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {simulation.description}
        </span>
        <span className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {simulation.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {topic}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
