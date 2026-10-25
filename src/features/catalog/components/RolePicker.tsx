import { ArrowRight, GraduationCap, Presentation } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";

/** Student / Teacher switch on the home page; each side opens its own dashboard. */
export function RolePicker() {
  const { tr } = useLanguage();
  const roles = [
    {
      to: "/student",
      icon: GraduationCap,
      label: tr("Student", "Mwanafunzi"),
      text: tr(
        "Join your class and do your assignments",
        "Jiunge na darasa na ufanye kazi zako",
      ),
      tone: "bg-blue-100 text-subject-physics dark:bg-blue-950 dark:text-blue-300",
    },
    {
      to: "/teacher",
      icon: Presentation,
      label: tr("Teacher", "Mwalimu"),
      text: tr(
        "Create classes, assign labs and review work",
        "Unda madarasa, toa maabara na kagua kazi",
      ),
      tone: "bg-green-100 text-kenya-green dark:bg-green-950 dark:text-green-300",
    },
  ];
  return (
    <nav
      aria-label={tr("Choose your dashboard", "Chagua dashibodi yako")}
      className="rounded-3xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {roles.map(({ to, icon: Icon, label, text, tone }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${tone}`}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-black tracking-tight">
                  {label}
                </span>
                <span className="block text-sm text-slate-600 dark:text-slate-300">
                  {text}
                </span>
              </span>
              <ArrowRight
                className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
