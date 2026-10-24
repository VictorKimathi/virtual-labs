import { TriangleAlert } from "lucide-react";
import { Link, useRouteError } from "react-router-dom";
import { useLanguage } from "../../app/useLanguage";

export function RouteErrorPage() {
  const error = useRouteError();
  const { tr } = useLanguage();
  console.error("Route error", error);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-kenya-red shadow-lg shadow-kenya-red/20 dark:bg-red-950">
        <TriangleAlert className="size-8" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-3xl font-black">
        {tr("Something went wrong", "Hitilafu imetokea")}
      </h1>
      <p className="mt-3 max-w-md text-slate-600 dark:text-slate-300">
        {tr(
          "This page could not be loaded. Please try again.",
          "Ukurasa huu hauwezi kufunguliwa. Tafadhali jaribu tena.",
        )}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-kenya-green px-6 font-extrabold text-white shadow-lg shadow-kenya-green/25 transition-transform hover:-translate-y-0.5"
      >
        {tr("Back to home", "Rudi nyumbani")}
      </Link>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 min-h-11 text-sm font-bold text-kenya-green dark:text-green-400"
      >
        {tr("Retry page", "Jaribu ukurasa tena")}
      </button>
    </main>
  );
}
