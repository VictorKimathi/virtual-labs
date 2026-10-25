import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { AuthScreen } from "../components/AuthScreen";
import { ErrorPanel, LoadingPanel } from "../components/StatusPanels";
import { StudentClassView } from "../components/StudentClassView";
import { StudentJoinForm } from "../components/StudentJoinForm";
import { useAuthUser } from "../hooks/useAuthUser";

export default function StudentDashboardPage() {
  const { tr } = useLanguage();
  const user = useAuthUser();
  const [params] = useSearchParams();
  const initialCode = params.get("code") ?? "";
  if (user.status === "loading") {
    return <LoadingPanel label={tr("Loading…", "Inapakia…")} />;
  }
  if (user.status === "error") return <ErrorPanel error={user.error} />;
  if (!user.data) {
    return (
      <AuthScreen role="student">
        <StudentJoinForm initialCode={initialCode} />
      </AuthScreen>
    );
  }
  return <StudentClassView uid={user.data.uid} initialCode={initialCode} />;
}
