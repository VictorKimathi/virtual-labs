import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { TiltCard } from "../../../shared/ui/TiltCard";

type Path = {
  to: string;
  icon: LucideIcon;
  title: [string, string];
  body: [string, string];
  cta: [string, string];
  glow: string;
  accent: string;
  hover: string;
};

const paths: Path[] = [
  {
    to: "/labs",
    icon: BookOpen,
    title: ["Guided lessons", "Masomo yenye mwongozo"],
    body: [
      "Follow a lab from introduction to conclusion, with quizzes along the way.",
      "Fuata maabara kuanzia utangulizi hadi hitimisho, na maswali njiani.",
    ],
    cta: ["Browse lessons", "Tazama masomo"],
    glow: "bg-kenya-green/25",
    accent:
      "bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300",
    hover: "hover:border-kenya-green",
  },
  {
    to: "/workbench",
    icon: FlaskConical,
    title: ["Practice bench", "Benchi la mazoezi"],
    body: [
      "No steps, no rules. Pick equipment, build your own experiment and watch what happens.",
      "Hakuna hatua. Chagua vifaa, unda jaribio lako na uone matokeo.",
    ],
    cta: ["Open the bench", "Fungua benchi"],
    glow: "bg-kenya-red/25",
    accent: "bg-red-50 text-kenya-red dark:bg-red-950 dark:text-red-300",
    hover: "hover:border-kenya-red",
  },
  {
    to: "/simulations",
    icon: MonitorPlay,
    title: ["Simulation playground", "Uwanja wa uigaji"],
    body: [
      "Play with PhET, circuit and physics simulations. Change anything and see it respond instantly.",
      "Cheza na uigaji wa PhET, sakiti na fizikia. Badilisha chochote na uone kikijibu papo hapo.",
    ],
    cta: ["Explore simulations", "Chunguza uigaji"],
    glow: "bg-subject-physics/25",
    accent:
      "bg-blue-50 text-subject-physics dark:bg-blue-950 dark:text-blue-300",
    hover: "hover:border-subject-physics",
  },
];

export function LearningPaths() {
  const { language, tr } = useLanguage();
  const index = language === "en" ? 0 : 1;
  return (
    <section aria-labelledby="ways-heading">
      <h2 id="ways-heading" className="mb-4 text-2xl font-black tracking-tight">
        {tr("Three ways to learn", "Njia tatu za kujifunza")}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {paths.map((path) => (
          <TiltCard
            key={path.to}
            to={path.to}
            wrapperClassName="sm:max-xl:last:col-span-2"
            className={`group relative isolate flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-colors dark:border-slate-800 dark:bg-slate-900 ${path.hover}`}
          >
            <span
              aria-hidden="true"
              className={`absolute -right-12 -top-12 -z-10 size-48 rounded-full blur-3xl transition-opacity group-hover:opacity-100 sm:opacity-60 ${path.glow}`}
            />
            <span
              className={`flex size-14 items-center justify-center rounded-2xl ${path.accent}`}
            >
              <path.icon className="size-7" aria-hidden="true" />
            </span>
            <span className="block text-xl font-extrabold">
              {path.title[index]}
            </span>
            <span className="block flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {path.body[index]}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold">
              {path.cta[index]}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
