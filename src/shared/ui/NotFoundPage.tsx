import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="font-bold text-teal-600">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-slate-500">
        The page you requested does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white"
      >
        Go to overview
      </Link>
    </div>
  );
}
