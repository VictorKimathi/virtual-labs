import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { signOutAccount } from "../account.api";
import { homeFor } from "../account.schema";
import { AccountCard } from "../components/AccountCard";
import { useAccount } from "../hooks/useAccount";

const choice =
  "flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-extrabold transition-transform hover:-translate-y-0.5";

/** "How do you use Bunifu Labs?": the way in for every kind of account. */
export default function LoginPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const account = useAccount();
  const signedIn = account.status === "ready" && account.data;

  return (
    <AccountCard
      title={tr("Welcome back", "Karibu tena")}
      subtitle={tr("How do you use Bunifu Labs?", "Unatumiaje Bunifu Labs?")}
      footer={
        <>
          {tr("Don't have an account yet?", "Bado huna akaunti?")}{" "}
          <Link
            to="/signup"
            className="font-extrabold text-kenya-green underline dark:text-green-400"
          >
            {tr("Join Bunifu Labs", "Jiunge na Bunifu Labs")}
          </Link>
        </>
      }
    >
      {signedIn && (
        <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm dark:bg-green-950">
          <p className="font-bold text-green-900 dark:text-green-200">
            {tr("You are signed in", "Umeshaingia")}
            {signedIn.name ? ` · ${signedIn.name}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={homeFor(signedIn.profile?.role ?? null)}
              className="inline-flex min-h-10 items-center rounded-full bg-kenya-green px-4 font-bold text-white"
            >
              {tr("Go to my dashboard", "Nenda kwenye dashibodi yangu")}
            </Link>
            <button
              type="button"
              onClick={() =>
                void signOutAccount().then(() => navigate("/login"))
              }
              className="min-h-10 rounded-full border border-green-700 px-4 font-bold text-green-800 dark:text-green-300"
            >
              {tr("Sign out", "Toka")}
            </button>
          </div>
        </div>
      )}
      <p className="text-sm font-bold">{tr("In school", "Shuleni")}</p>
      <div className="mt-2 space-y-3">
        <Link
          to="/login/educator"
          className={`${choice} bg-sky-700 text-white`}
        >
          {tr("Educators", "Walimu")}
        </Link>
        <Link to="/login/class" className={`${choice} bg-green-700 text-white`}>
          {tr("Students with class code", "Wanafunzi wenye msimbo wa darasa")}
        </Link>
        <Link
          to="/login/student"
          className={`${choice} border-2 border-green-700 text-green-800 dark:text-green-300`}
        >
          {tr("Student accounts", "Akaunti za wanafunzi")}
        </Link>
      </div>
      <p className="mt-6 text-sm font-bold">{tr("On your own", "Peke yako")}</p>
      <div className="mt-2">
        <Link
          to="/login/personal"
          className={`${choice} bg-indigo-800 text-white`}
        >
          {tr("Personal accounts", "Akaunti binafsi")}
        </Link>
      </div>
    </AccountCard>
  );
}
