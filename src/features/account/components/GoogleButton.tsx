import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { ActionFeedback } from "../../classroom/components/StatusPanels";
import { useAction } from "../../classroom/hooks/useAction";
import { signInWithGoogle } from "../account.api";
import { homeFor } from "../account.schema";
import type { AccountRole } from "../account.types";

/** Continues with a Google account, giving a new account the role of this screen. */
export function GoogleButton({ role }: { role: AccountRole }) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const action = useAction("account-google");
  return (
    <div>
      <button
        type="button"
        disabled={action.pending}
        onClick={() =>
          void action.run(async () => {
            const actual = await signInWithGoogle(role);
            navigate(homeFor(actual));
          })
        }
        className="flex min-h-11 w-full items-center justify-center gap-3 rounded-full border-2 border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition-colors hover:border-slate-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
      >
        <span aria-hidden="true" className="text-base font-black text-blue-600">
          G
        </span>
        {action.pending
          ? tr("Opening Google…", "Inafungua Google…")
          : tr("Continue with Google", "Endelea na Google")}
      </button>
      <ActionFeedback state={action.state} />
    </div>
  );
}

export function OrDivider() {
  const { tr } = useLanguage();
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      {tr("or", "au")}
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
