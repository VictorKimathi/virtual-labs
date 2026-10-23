import { Link } from "react-router-dom";
import { useLanguage } from "../../app/useLanguage";

export default function NotFoundPage() {
  const { tr } = useLanguage();
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="font-black text-kenya-red">404</p>
      <h1 className="mt-2 text-3xl font-black">
        {tr("Page not found", "Ukurasa haujapatikana")}
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        {tr(
          "The page you requested does not exist.",
          "Ukurasa unaoutafuta haupo.",
        )}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-kenya-green px-5 font-bold text-white"
      >
        {tr("Go home", "Nenda nyumbani")}
      </Link>
    </div>
  );
}
