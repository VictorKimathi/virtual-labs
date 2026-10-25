import { useParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { AuthScreen } from "../components/AuthScreen";
import { ErrorPanel, LoadingPanel } from "../components/StatusPanels";
import { TeacherClassView } from "../components/TeacherClassView";
import { TeacherSignIn } from "../components/TeacherSignIn";
import { useAuthUser } from "../hooks/useAuthUser";

export default function TeacherClassPage() {
  const { tr } = useLanguage();
  const { classId = "" } = useParams();
  const user = useAuthUser();
  if (user.status === "loading")
    return <LoadingPanel label={tr("Loading…", "Inapakia…")} />;
  if (user.status === "error") return <ErrorPanel error={user.error} />;
  if (!user.data || user.data.anonymous) {
    return (
      <AuthScreen role="teacher">
        <TeacherSignIn />
      </AuthScreen>
    );
  }
  return (
    <TeacherClassView
      key={classId}
      classId={classId}
      teacher={{
        uid: user.data.uid,
        name: user.data.displayName ?? tr("Teacher", "Mwalimu"),
      }}
    />
  );
}
