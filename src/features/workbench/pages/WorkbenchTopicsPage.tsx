import {
  ArrowRight,
  Lightbulb,
  Magnet,
  Microscope,
  Sun,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { topics } from "../data/topics";

const topicIcons: Record<string, typeof Zap> = {
  electricity: Zap,
  magnetism: Magnet,
  light: Sun,
};

type Bench = {
  id: string;
  to: string | null;
  icon: typeof Zap;
  subject: { en: string; sw: string };
  kind: { en: string; sw: string };
  name: { en: string; sw: string };
  summary: { en: string; sw: string };
  detail: { en: string; sw: string } | null;
  tone: string;
};

export default function WorkbenchTopicsPage() {
  const { language, tr } = useLanguage();
  const benches: Bench[] = [
    ...topics
      .filter((topic) => topic.experiments.length > 0)
      .map((topic) => ({
        id: topic.id,
        to: `/workbench/${topic.id}`,
        icon: topicIcons[topic.id] ?? Lightbulb,
        subject: { en: "Physics", sw: "Fizikia" },
        kind: { en: "2D circuit bench", sw: "Benchi la sakiti la 2D" },
        name: topic.name,
        summary: topic.summary,
        detail: {
          en: `${topic.equipment.length} items · ${topic.experiments.length} experiments`,
          sw: `Vifaa ${topic.equipment.length} · majaribio ${topic.experiments.length}`,
        },
        tone: "bg-blue-50 text-subject-physics dark:bg-blue-950 dark:text-blue-300",
      })),
    {
      id: "microscope",
      to: "/sandbox/biology",
      icon: Microscope,
      subject: { en: "Biology", sw: "Biolojia" },
      kind: { en: "3D bench", sw: "Benchi la 3D" },
      name: { en: "Microscope station", sw: "Kituo cha hadubini" },
      summary: {
        en: "Set up a microscope and a plant slide, then observe the parts of a plant cell.",
        sw: "Weka hadubini na slaidi ya mmea, kisha chunguza sehemu za seli ya mmea.",
      },
      detail: {
        en: "4 items · plant cell preview",
        sw: "Vifaa 4 · mfano wa seli",
      },
      tone: "bg-green-50 text-subject-biology dark:bg-green-950 dark:text-green-300",
    },
    ...topics
      .filter((topic) => topic.experiments.length === 0)
      .map((topic) => ({
        id: topic.id,
        to: null,
        icon: topicIcons[topic.id] ?? Lightbulb,
        subject: { en: "Physics", sw: "Fizikia" },
        kind: { en: "2D bench", sw: "Benchi la 2D" },
        name: topic.name,
        summary: topic.summary,
        detail: null,
        tone: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("Practice bench", "Benchi la mazoezi")}
        </h1>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
          {tr(
            "Hands-on benches where you place equipment and run your own experiments. Pick a bench to start. Prefer a step-by-step walkthrough? Try the ",
            "Mabenchi ya vitendo ambapo unaweka vifaa na kufanya majaribio yako. Chagua benchi kuanza. Unapendelea mwongozo wa hatua kwa hatua? Jaribu ",
          )}
          <Link
            to="/labs"
            className="font-bold text-kenya-green underline dark:text-green-400"
          >
            {tr("Guided lessons", "Masomo yenye mwongozo")}
          </Link>
          .
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {benches.map((bench) => {
          const Icon = bench.icon;
          const body: ReactNode = (
            <>
              <span className="flex items-center justify-between gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${bench.tone}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {bench.subject[language]} · {bench.kind[language]}
                </span>
              </span>
              <span className="mt-4 block text-xl font-extrabold">
                {bench.name[language]}
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                {bench.summary[language]}
              </span>
              <span className="mt-auto flex items-center justify-between pt-4 text-sm font-bold">
                {bench.detail ? (
                  <>
                    <span className="text-slate-500 dark:text-slate-400">
                      {bench.detail[language]}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-kenya-green transition-transform group-hover:translate-x-1 dark:text-green-400"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tr("Coming soon", "Inakuja hivi karibuni")}
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li key={bench.id}>
              {bench.to ? (
                <Link
                  to={bench.to}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex h-full flex-col rounded-2xl border border-dashed border-slate-300 bg-white p-5 opacity-70 dark:border-slate-700 dark:bg-slate-900">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
