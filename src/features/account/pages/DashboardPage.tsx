import { LogOut } from "lucide-react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { StudentClassView } from "../../classroom/components/StudentClassView";
import {
  ErrorPanel,
  LoadingPanel,
} from "../../classroom/components/StatusPanels";
import { secondaryButton } from "../../classroom/components/styles";
import { LabShowcase } from "../../workbench/components/LabShowcase";
import { signOutAccount } from "../account.api";
import { useAccount } from "../hooks/useAccount";

/** Home for signed-in students and personal accounts: their class work and the labs. */
export default function DashboardPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const account = useAccount();

  if (account.status === "loading")
    return (
      <LoadingPanel
        label={tr("Loading your dashboard…", "Inapakia dashibodi yako…")}
      />
    );
  if (account.status === "error") return <ErrorPanel error={account.error} />;
  if (!account.data) return <Navigate to="/login" replace />;
  if (account.data.profile?.role === "teacher")
    return <Navigate to="/teacher" replace />;

  const me = account.data;
  const firstName = (me.profile?.name ?? me.name ?? "").split(" ")[0];
  const personal = me.profile?.role === "personal";

  const labs = (
    <section aria-labelledby="labs-heading" className="space-y-4">
      <h2 id="labs-heading" className="text-xl font-black tracking-tight">
        {tr("Your labs", "Maabara zako")}
      </h2>
      <LabShowcase />
    </section>
  );
  const classWork = (
    <section aria-labelledby="class-heading" className="space-y-4">
      <h2 id="class-heading" className="text-xl font-black tracking-tight">
        {tr("My class", "Darasa langu")}
      </h2>
      <StudentClassView uid={me.uid} initialCode={params.get("code") ?? ""} />
    </section>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {firstName
              ? tr(`Hi, ${firstName}!`, `Habari, ${firstName}!`)
              : tr("Welcome!", "Karibu!")}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {tr(
              "Pick a lab and start experimenting.",
              "Chagua maabara uanze kufanya majaribio.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOutAccount().then(() => navigate("/"))}
          className={secondaryButton}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {tr("Sign out", "Toka")}
        </button>
      </div>
      {personal ? (
        <>
          {labs}
          {classWork}
        </>
      ) : (
        <>
          {classWork}
          {labs}
        </>
      )}
    </div>
  );
}
