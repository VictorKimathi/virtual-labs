import { ArrowLeft } from "lucide-react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { StudentJoinForm } from "../../classroom/components/StudentJoinForm";
import type { AccountRole } from "../account.types";
import { AccountCard } from "../components/AccountCard";
import { EmailSignInForm } from "../components/EmailSignInForm";
import { GoogleButton, OrDivider } from "../components/GoogleButton";

const accountMethods: Record<string, AccountRole> = {
  educator: "teacher",
  student: "student",
  personal: "personal",
};

function BackLink() {
  const { tr } = useLanguage();
  return (
    <Link
      to="/login"
      className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {tr("All sign-in options", "Njia zote za kuingia")}
    </Link>
  );
}

/** Signs in one kind of account: educators, class-code students, student accounts or personal accounts. */
export default function LoginMethodPage() {
  const { method = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { tr } = useLanguage();

  if (method === "class")
    return (
      <AccountCard
        title={tr("Join your class", "Jiunge na darasa lako")}
        subtitle={tr(
          "Enter the code from your teacher. No email needed.",
          "Weka msimbo kutoka kwa mwalimu wako. Hakuna barua pepe.",
        )}
        footer={<BackLink />}
      >
        <StudentJoinForm
          initialCode={params.get("code") ?? ""}
          onJoined={() => navigate("/dashboard")}
          bare
        />
      </AccountCard>
    );

  const role = accountMethods[method];
  if (!role) return <Navigate to="/login" replace />;
  const titles: Record<AccountRole, string> = {
    teacher: tr("Educator sign in", "Kuingia kwa mwalimu"),
    student: tr("Student sign in", "Kuingia kwa mwanafunzi"),
    personal: tr("Personal sign in", "Kuingia binafsi"),
  };
  const subtitles: Record<AccountRole, string> = {
    teacher: tr(
      "Create classes, assign labs and review work.",
      "Unda madarasa, toa maabara na kagua kazi.",
    ),
    student: tr(
      "Sign in to your own student account.",
      "Ingia kwenye akaunti yako ya mwanafunzi.",
    ),
    personal: tr(
      "Learn on your own, at your own pace.",
      "Jifunze peke yako, kwa kasi yako.",
    ),
  };

  return (
    <AccountCard
      title={titles[role]}
      subtitle={subtitles[role]}
      footer={
        <div className="space-y-3">
          <p>
            {tr("New here?", "Mgeni hapa?")}{" "}
            <Link
              to={`/signup?role=${role}`}
              className="font-extrabold text-kenya-green underline dark:text-green-400"
            >
              {tr("Create an account", "Unda akaunti")}
            </Link>
          </p>
          <BackLink />
        </div>
      }
    >
      <GoogleButton role={role} />
      <OrDivider />
      <EmailSignInForm role={role} />
    </AccountCard>
  );
}
