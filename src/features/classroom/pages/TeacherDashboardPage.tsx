import { Presentation } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { AuthScreen } from "../components/AuthScreen";
import { ErrorPanel, LoadingPanel } from "../components/StatusPanels";
import { TeacherHome } from "../components/TeacherHome";
import { TeacherSignIn } from "../components/TeacherSignIn";
import { useAuthUser } from "../hooks/useAuthUser";

export default function TeacherDashboardPage() {
  const { tr } = useLanguage();
  const user = useAuthUser();
  if (user.status === "loading") {
    return <LoadingPanel label={tr("Loading…", "Inapakia…")} />;
  }
  if (user.status === "error") return <ErrorPanel error={user.error} />;
  if (!user.data || user.data.anonymous) {
    return (
      <AuthScreen role="teacher">
        <TeacherSignIn />
      </AuthScreen>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Presentation}
        eyebrow={tr("Educator", "Mwalimu")}
        title={tr("Teacher dashboard", "Dashibodi ya mwalimu")}
        description={tr(
          "Create classes, assign lab work, review what students hand in and teach with colleagues.",
          "Unda madarasa, toa kazi za maabara, kagua kazi za wanafunzi na fundisha pamoja na wenzako.",
        )}
      />
      <TeacherHome
        teacher={{
          uid: user.data.uid,
          name: user.data.displayName ?? tr("Teacher", "Mwalimu"),
        }}
      />
    </div>
  );
}
