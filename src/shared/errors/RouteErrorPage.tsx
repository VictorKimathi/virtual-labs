import { Link, useRouteError } from "react-router-dom";
import { useLanguage } from "../../app/useLanguage";

export function RouteErrorPage() {
  const error = useRouteError();
  const { tr } = useLanguage();
  console.error("Route error", error);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-kenya-red dark:bg-red-950">
        !
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
        className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-kenya-green px-5 font-bold text-white"
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
