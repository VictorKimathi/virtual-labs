import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../../app/useLanguage";
import { getUserMessage, type AppError } from "../../../shared/errors/appError";
import type { ActionState } from "../hooks/useAction";
import { card, secondaryButton } from "./styles";

export function LoadingPanel({ label }: { label: string }) {
  return (
    <div
      role="status"
      className={`${card} flex items-center justify-center gap-3 py-10 text-sm font-bold text-slate-500 dark:text-slate-400`}
    >
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorPanel({
  error,
  onRetry,
}: {
  error: AppError;
  onRetry?: () => void;
}) {
  const { language, tr } = useLanguage();
  return (
    <div
      role="alert"
      className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950"
    >
      <TriangleAlert
        className="mx-auto size-8 text-kenya-red dark:text-red-300"
        aria-hidden="true"
      />
      <p className="mt-3 font-bold text-red-900 dark:text-red-200">
        {getUserMessage(error)[language]}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`${secondaryButton} mt-4`}
        >
          {tr("Try again", "Jaribu tena")}
        </button>
      )}
    </div>
  );
}

/** Inline feedback under a form or button: the error, or a short success note. */
export function ActionFeedback({
  state,
  success,
}: {
  state: ActionState;
  success?: string;
}) {
  const { language } = useLanguage();
  const message =
    state.status === "error"
      ? getUserMessage(state.error)[language]
      : state.status === "done"
        ? success
        : undefined;
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key={state.status}
          role={state.status === "error" ? "alert" : "status"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`mt-2 flex items-start gap-1.5 text-sm font-bold ${state.status === "error" ? "text-kenya-red dark:text-red-300" : "text-kenya-green dark:text-green-400"}`}
        >
          {state.status === "error" ? (
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <CircleCheck
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
          )}
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
