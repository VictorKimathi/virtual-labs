import { Info } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";

type Props = { onRetry: () => void };

export function SnapshotNotice({ onRetry }: Props) {
  const { tr } = useLanguage();
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100"
    >
      <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 font-medium">
        {tr(
          "PhET is not responding, so this is a saved copy of the list. Simulations may still open normally.",
          "PhET haijibu, kwa hivyo hii ni nakala iliyohifadhiwa ya orodha. Uigaji unaweza kufunguka kama kawaida.",
        )}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-10 rounded-xl border border-blue-300 px-4 font-bold dark:border-blue-800"
      >
        {tr("Try live list again", "Jaribu orodha ya moja kwa moja")}
      </button>
    </div>
  );
}
