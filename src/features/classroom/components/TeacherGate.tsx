import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { signOutAccount } from "../../account/account.api";
import { useAccount } from "../../account/hooks/useAccount";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { ErrorPanel, LoadingPanel } from "./StatusPanels";
import { secondaryButton } from "./styles";

type Teacher = { uid: string; name: string };

/** Shows the teacher area to educators only; everyone else is sent to sign in. */
export function TeacherGate({
  children,
}: {
  children: (teacher: Teacher) => ReactNode;
}) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const account = useAccount();
  if (account.status === "loading")
    return <LoadingPanel label={tr("Loading…", "Inapakia…")} />;
  if (account.status === "error") return <ErrorPanel error={account.error} />;
  const me = account.data;
  if (!me) return <Navigate to="/login/educator" replace />;
  // Educators who signed up before profiles existed have no profile, and are still educators.
  const educator =
    !me.anonymous && (me.profile === null || me.profile.role === "teacher");
  if (!educator)
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 py-10">
        <EmptyState
          icon={ShieldAlert}
          title={tr(
            "This area is for educators. You are signed in with a student or personal account.",
            "Eneo hili ni la walimu. Umeingia kwa akaunti ya mwanafunzi au binafsi.",
          )}
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/dashboard" className={secondaryButton}>
            {tr("Go to my dashboard", "Nenda kwenye dashibodi yangu")}
          </Link>
          <button
            type="button"
            onClick={() =>
              void signOutAccount().then(() => navigate("/login/educator"))
            }
            className={secondaryButton}
          >
            {tr(
              "Sign out and use an educator account",
              "Toka na utumie akaunti ya mwalimu",
            )}
          </button>
        </div>
      </div>
    );
  return (
    <>
      {children({
        uid: me.uid,
        name: me.profile?.name ?? me.name ?? tr("Teacher", "Mwalimu"),
      })}
    </>
  );
}
