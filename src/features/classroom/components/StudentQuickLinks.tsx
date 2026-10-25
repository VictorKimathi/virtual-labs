import {
  Atom,
  ChartNoAxesColumn,
  FlaskConical,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";

export function StudentQuickLinks() {
  const { tr } = useLanguage();
  const links: { to: string; label: string; icon: LucideIcon; tone: string }[] =
    [
      {
        to: "/workbench/physics",
        label: tr("Physics Lab", "Maabara ya Fizikia"),
        icon: Atom,
        tone: "bg-blue-100 text-subject-physics dark:bg-blue-950 dark:text-blue-300",
      },
      {
        to: "/workbench/chemistry",
        label: tr("Chemistry Lab", "Maabara ya Kemia"),
        icon: FlaskConical,
        tone: "bg-orange-100 text-subject-chemistry dark:bg-orange-950 dark:text-orange-300",
      },
      {
        to: "/simulations",
        label: tr("Simulations", "Uigaji"),
        icon: MonitorPlay,
        tone: "bg-green-100 text-kenya-green dark:bg-green-950 dark:text-green-300",
      },
      {
        to: "/progress",
        label: tr("My progress", "Maendeleo yangu"),
        icon: ChartNoAxesColumn,
        tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      },
    ];
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {links.map(({ to, label, icon: Icon, tone }) => (
        <li key={to}>
          <Link
            to={to}
            className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900 dark:hover:border-green-500"
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${tone}`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 text-sm">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
