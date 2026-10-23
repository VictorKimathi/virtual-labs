import { ArrowLeft, ExternalLink, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSubject } from "../../catalog/data/catalog";
import NotFoundPage from "../../../shared/ui/NotFoundPage";

export default function LabRunPage() {
  const { subjectId, labSlug } = useParams();
  const subject = getSubject(subjectId);
  const lab = subject?.labs.find((item) => item.slug === labSlug);
  const [loaded, setLoaded] = useState(false);
  if (!subject || !lab) return <NotFoundPage />;
  return (
    <div>
      <Link
        to={`/${subject.id}/labs/${lab.slug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" /> Lab introduction
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            Simulation workspace
          </p>
          <h1 className="mt-2 text-3xl font-black">{lab.title}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {lab.question}
          </p>
        </div>
        <a
          href={lab.providerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Maximize2 className="h-4 w-4" /> Open on provider site{" "}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800">
          <span>{lab.provider}</span>
          <span>{loaded ? "Simulation ready" : "Loading simulation…"}</span>
        </div>
        <div className="relative aspect-video min-h-80 bg-slate-100 dark:bg-slate-900">
          {!loaded && (
            <div
              role="status"
              className="absolute inset-0 flex items-center justify-center text-sm text-slate-500"
            >
              Loading interactive lab…
            </div>
          )}
          <iframe
            title={`${lab.title} simulation`}
            src={lab.embedUrl}
            onLoad={() => setLoaded(true)}
            className="relative h-full w-full"
            allowFullScreen
          />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        {lab.attribution} If the simulation does not load, use “Open on provider
        site.”
      </p>
    </div>
  );
}
