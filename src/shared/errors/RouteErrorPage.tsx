import { Link, useRouteError } from "react-router-dom";

export function RouteErrorPage() {
  const error = useRouteError();
  console.error("Route error", error);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-900 dark:bg-slate-950 dark:text-white">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        This page could not be loaded. Please try again.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white"
      >
        Back to overview
      </Link>
    </main>
  );
}
