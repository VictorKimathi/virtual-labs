import { LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { signOutAccount } from "../account.api";
import { homeFor } from "../account.schema";
import { useAccount } from "../hooks/useAccount";

/** The header's account corner: who is signed in, or a way to sign in. */
export function AccountMenu() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const account = useAccount();
  if (account.status !== "ready") return null;
  const me = account.data;
  if (!me)
    return (
      <Link
        to="/login"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-kenya-green px-4 text-sm font-extrabold text-white hover:bg-green-800"
      >
        <LogIn className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{tr("Log in", "Ingia")}</span>
      </Link>
    );
  const name = me.profile?.name ?? me.name ?? tr("Student", "Mwanafunzi");
  return (
    <div className="flex items-center gap-1">
      <Link
        to={homeFor(me.profile?.role ?? null)}
        title={name}
        className="flex size-11 items-center justify-center rounded-xl bg-green-100 text-sm font-black uppercase text-kenya-green dark:bg-green-950 dark:text-green-300"
      >
        {name.slice(0, 1)}
      </Link>
      <button
        type="button"
        onClick={() => void signOutAccount().then(() => navigate("/"))}
        aria-label={tr("Sign out", "Toka")}
        className="flex size-11 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:border-kenya-green hover:bg-green-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <LogOut className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
