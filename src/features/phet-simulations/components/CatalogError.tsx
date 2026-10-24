import { TriangleAlert } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { getUserMessage, type AppError } from "../../../shared/errors/appError";

type Props = { error: AppError; onRetry: () => void };

export function CatalogError({ error, onRetry }: Props) {
  const { language, tr } = useLanguage();
  const message = getUserMessage(error);
  return (
    <div
      role="alert"
      className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900 dark:bg-red-950"
    >
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-kenya-red shadow-sm dark:bg-red-900 dark:text-red-200">
        <TriangleAlert className="size-8" aria-hidden="true" />
      </span>
      <p className="mt-3 font-bold">
        {tr("Simulations could not be loaded", "Uigaji haukuweza kupakiwa")}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-700 dark:text-slate-300">
        {language === "en" ? message.en : message.sw}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-kenya-green px-5 text-sm font-bold text-white shadow-lg shadow-kenya-green/25 transition-transform hover:-translate-y-0.5"
      >
        {tr("Try again", "Jaribu tena")}
      </button>
    </div>
  );
}
