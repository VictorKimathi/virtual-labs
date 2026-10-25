import {
  ArrowRight,
  GraduationCap,
  Presentation,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { isRole } from "../account.schema";
import type { AccountRole } from "../account.types";
import { AccountCard } from "../components/AccountCard";
import { GoogleButton, OrDivider } from "../components/GoogleButton";
import { SignupForm } from "../components/SignupForm";

/** Join Bunifu Labs: pick the kind of account, then create it. */
export default function SignupPage() {
  const { tr } = useLanguage();
  const [params, setParams] = useSearchParams();
  const wanted = params.get("role");
  const role = isRole(wanted) ? wanted : null;
  const loginLink = (
    <>
      {tr("Already have an account?", "Tayari una akaunti?")}{" "}
      <Link
        to="/login"
        className="font-extrabold text-kenya-green underline dark:text-green-400"
      >
        {tr("Log in", "Ingia")}
      </Link>
    </>
  );

  if (!role) {
    const options: {
      role: AccountRole;
      icon: LucideIcon;
      title: string;
      text: string;
      tone: string;
    }[] = [
      {
        role: "teacher",
        icon: Presentation,
        title: tr("I'm an educator", "Mimi ni mwalimu"),
        text: tr(
          "Teach classes and assign labs",
          "Fundisha madarasa na toa maabara",
        ),
        tone: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
      },
      {
        role: "student",
        icon: GraduationCap,
        title: tr("I'm a student", "Mimi ni mwanafunzi"),
        text: tr("Do lab work for school", "Fanya kazi za maabara za shule"),
        tone: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
      },
      {
        role: "personal",
        icon: UserRound,
        title: tr("On my own", "Peke yangu"),
        text: tr("Explore the labs for fun", "Chunguza maabara kwa raha"),
        tone: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
      },
    ];
    return (
      <AccountCard
        title={tr("Join Bunifu Labs", "Jiunge na Bunifu Labs")}
        subtitle={tr("Who are you?", "Wewe ni nani?")}
        footer={loginLink}
      >
        <ul className="space-y-3">
          {options.map(({ role: option, icon: Icon, title, text, tone }) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => setParams({ role: option })}
                className="group flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 p-4 text-left transition-colors hover:border-kenya-green dark:border-slate-700"
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black">{title}</span>
                  <span className="block text-sm text-slate-600 dark:text-slate-300">
                    {text}
                  </span>
                </span>
                <ArrowRight
                  className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          {tr("Have a class code?", "Una msimbo wa darasa?")}{" "}
          <Link
            to="/login/class"
            className="font-extrabold text-kenya-green underline dark:text-green-400"
          >
            {tr("Join your class", "Jiunge na darasa lako")}
          </Link>
        </p>
      </AccountCard>
    );
  }

  const titles: Record<AccountRole, string> = {
    teacher: tr("Create an educator account", "Unda akaunti ya mwalimu"),
    student: tr("Create a student account", "Unda akaunti ya mwanafunzi"),
    personal: tr("Create a personal account", "Unda akaunti binafsi"),
  };
  return (
    <AccountCard
      title={titles[role]}
      footer={
        <div className="space-y-3">
          <p>{loginLink}</p>
          <button
            type="button"
            onClick={() => setParams({})}
            className="font-bold text-slate-600 underline dark:text-slate-300"
          >
            {tr(
              "Choose a different account type",
              "Chagua aina nyingine ya akaunti",
            )}
          </button>
        </div>
      }
    >
      <GoogleButton role={role} />
      <OrDivider />
      <SignupForm role={role} />
    </AccountCard>
  );
}
