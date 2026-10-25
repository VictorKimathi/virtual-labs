import { ArrowRight, GraduationCap, Presentation } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";

type Props = { role: "student" | "teacher"; children: ReactNode };

/** Centred, login-style entry for a portal, with a link to the other role. */
export function AuthScreen({ role, children }: Props) {
  const { tr } = useLanguage();
  const student = role === "student";
  const Icon = student ? GraduationCap : Presentation;
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-6">
      <div className="text-center">
        <span
          className={`mx-auto flex size-16 items-center justify-center rounded-2xl text-white shadow-lg ${student ? "bg-subject-physics shadow-subject-physics/30" : "bg-kenya-green shadow-kenya-green/30"}`}
        >
          <Icon className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight">
          {student
            ? tr("Student sign in", "Kuingia kwa mwanafunzi")
            : tr("Teacher sign in", "Kuingia kwa mwalimu")}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {student
            ? tr(
                "Join your class with the code from your teacher.",
                "Jiunge na darasa lako kwa msimbo kutoka kwa mwalimu wako.",
              )
            : tr(
                "Manage your classes, assignments and student work.",
                "Simamia madarasa, kazi na kazi za wanafunzi wako.",
              )}
        </p>
      </div>
      <div className="mt-6">{children}</div>
      <Link
        to={student ? "/teacher" : "/student"}
        className="group mx-auto mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        {student
          ? tr("Are you a teacher? Sign in here", "Wewe ni mwalimu? Ingia hapa")
          : tr(
              "Are you a student? Join your class",
              "Wewe ni mwanafunzi? Jiunge na darasa",
            )}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
