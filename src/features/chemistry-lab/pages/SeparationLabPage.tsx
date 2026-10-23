import {
  Check,
  Droplets,
  Filter,
  Flame,
  Magnet,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { GoalList, type Goal } from "../components/GoalList";
import { LabHeader } from "../components/LabHeader";
import { SeparationStage } from "../components/SeparationStage";
import { grains, type GrainKind } from "../components/separationGrains";
import type { Localized } from "../chemistry.types";
import {
  SCENE_MS,
  methodInfo,
  methodOrder,
  wrongChoiceHints,
  type MethodId,
} from "../data/separation";

const methodIcons: Record<MethodId, typeof Magnet> = {
  magnet: Magnet,
  dissolve: Droplets,
  filter: Filter,
  evaporate: Flame,
};

const ingredients: {
  kind: GrainKind;
  name: Localized;
  property: Localized;
}[] = [
  {
    kind: "iron",
    name: { en: "Iron filings", sw: "Vumbi la chuma" },
    property: { en: "Magnetic", sw: "Lina sumaku" },
  },
  {
    kind: "sand",
    name: { en: "Sand", sw: "Mchanga" },
    property: {
      en: "Does not dissolve in water",
      sw: "Haiyeyuki majini",
    },
  },
  {
    kind: "salt",
    name: { en: "Salt", sw: "Chumvi" },
    property: {
      en: "Dissolves in water",
      sw: "Huyeyuka majini",
    },
  },
];

const recovery: Record<GrainKind, MethodId> = {
  iron: "magnet",
  sand: "filter",
  salt: "evaporate",
};

function GrainSwatch({ kind }: { kind: GrainKind }) {
  const sample = grains.filter((grain) => grain.kind === kind).slice(0, 14);
  return (
    <svg viewBox="-60 -34 120 40" aria-hidden="true" className="h-8 w-full">
      {sample.map((grain, index) => {
        const x = ((index % 7) - 3) * 14;
        const y = -Math.floor(index / 7) * 12 - 6;
        return kind === "salt" ? (
          <rect
            key={grain.id}
            x={x - 4}
            y={y - 4}
            width={8}
            height={8}
            rx={1}
            fill={grain.shade}
            stroke="#94a3b8"
          />
        ) : (
          <circle
            key={grain.id}
            cx={x}
            cy={y}
            r={kind === "iron" ? 5 : 4.4}
            fill={grain.shade}
            stroke={kind === "iron" ? "#1e293b" : "#a07c45"}
          />
        );
      })}
    </svg>
  );
}

export default function SeparationLabPage() {
  const { language, tr } = useLanguage();
  const [done, setDone] = useState<MethodId[]>([]);
  const [running, setRunning] = useState<MethodId | null>(null);
  const [notice, setNotice] = useState<Localized | null>(null);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setDone((current) => [...current, running]);
      setRunning(null);
    }, SCENE_MS);
    return () => window.clearTimeout(timer);
  }, [running]);

  const lastDone = done[done.length - 1];
  const scene = running ?? lastDone ?? "idle";
  const captionMethod = running ?? lastDone;
  const finished = done.length === methodOrder.length;

  function choose(method: MethodId) {
    if (running) return;
    if (method === methodOrder[done.length]) {
      setNotice(null);
      setRunning(method);
      return;
    }
    setNotice(
      wrongChoiceHints[method][done.length] ?? {
        en: "That method is already complete.",
        sw: "Mbinu hiyo imeshakamilika.",
      },
    );
  }

  function restart() {
    setDone([]);
    setRunning(null);
    setNotice(null);
  }

  const goals: Goal[] = [
    {
      id: "iron",
      text: { en: "Remove the iron filings", sw: "Ondoa vumbi la chuma" },
      done: done.includes("magnet"),
    },
    {
      id: "sand",
      text: { en: "Recover the sand", sw: "Pata mchanga" },
      done: done.includes("filter"),
    },
    {
      id: "salt",
      text: { en: "Recover the salt", sw: "Pata chumvi" },
      done: done.includes("evaporate"),
    },
  ];

  return (
    <div className="space-y-4">
      <LabHeader
        title={{
          en: "Separating a mixture",
          sw: "Kutenganisha mchanganyiko",
        }}
        lessonId="separation"
        actions={
          <button
            type="button"
            onClick={restart}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {tr("Start again", "Anza upya")}
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("The mixture", "Mchanganyiko")}
            </h2>
            <ul className="mt-3 space-y-2">
              {ingredients.map((item) => (
                <li
                  key={item.kind}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 dark:bg-slate-800"
                >
                  <span className="w-16 shrink-0">
                    <GrainSwatch kind={item.kind} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold">
                      {item.name[language]}
                    </span>
                    <span className="block text-xs text-slate-600 dark:text-slate-300">
                      {item.property[language]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("Choose a method", "Chagua mbinu")}
            </h2>
            <ul className="mt-3 space-y-2">
              {methodOrder.map((method) => {
                const Icon = methodIcons[method];
                const complete = done.includes(method);
                const active = running === method;
                return (
                  <li key={method}>
                    <button
                      type="button"
                      onClick={() => choose(method)}
                      disabled={complete || (running !== null && !active)}
                      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-3 text-left transition-colors disabled:opacity-50 ${active ? "border-orange-500 bg-orange-50 dark:bg-orange-950" : complete ? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950" : "border-slate-200 hover:border-orange-400 dark:border-slate-700"}`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${complete ? "bg-kenya-green text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
                      >
                        {complete ? (
                          <Check className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold">
                          {methodInfo[method].name[language]}
                        </span>
                        <span className="block text-xs text-slate-600 dark:text-slate-300">
                          {methodInfo[method].detail[language]}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="order-1 space-y-3 lg:order-2 lg:col-span-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-b from-sky-50 to-slate-100 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
            <SeparationStage scene={scene} />
            <p
              aria-live="polite"
              className="border-t border-slate-200/70 bg-white/60 px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
            >
              {captionMethod
                ? methodInfo[captionMethod].caption[language]
                : tr(
                    "Iron filings, sand and salt are mixed together. Can you get all three back?",
                    "Vumbi la chuma, mchanga na chumvi vimechanganyika. Unaweza kuvipata vyote vitatu?",
                  )}
            </p>
          </section>
          {notice && (
            <motion.p
              key={notice.en}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-100"
            >
              <TriangleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {notice[language]}
            </motion.p>
          )}
        </div>

        <div className="order-3 space-y-4 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("Collected", "Vilivyokusanywa")}
            </h2>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {ingredients.map((item) => {
                const collected = done.includes(recovery[item.kind]);
                return (
                  <li
                    key={item.kind}
                    className={`relative flex min-h-24 flex-col items-center justify-center rounded-xl border-2 p-2 text-center ${collected ? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950" : "border-dashed border-slate-300 dark:border-slate-700"}`}
                  >
                    {collected ? (
                      <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 16,
                        }}
                        className="w-full"
                      >
                        <GrainSwatch kind={item.kind} />
                      </motion.div>
                    ) : (
                      <span className="text-2xl font-black text-slate-300 dark:text-slate-600">
                        ?
                      </span>
                    )}
                    <span className="mt-1 text-xs font-bold">
                      {item.name[language]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
          <GoalList
            title={{
              en: "Recover all three",
              sw: "Pata vitu vyote vitatu",
            }}
            steps={[
              {
                en: "Look at how each substance behaves.",
                sw: "Angalia jinsi kila dutu inavyofanya kazi.",
              },
              {
                en: "Choose the method that suits the next separation.",
                sw: "Chagua mbinu inayofaa utengaji unaofuata.",
              },
              {
                en: "Keep going until nothing is left mixed.",
                sw: "Endelea hadi hakuna kilichobaki kimechanganyika.",
              },
            ]}
            goals={goals}
            finish={{
              en: "Each method used a different property: magnetism, solubility, particle size and boiling point.",
              sw: "Kila mbinu ilitumia sifa tofauti: sumaku, uyeyukaji, ukubwa wa chembe na kiwango cha kuchemka.",
            }}
          />
          {finished && (
            <p className="sr-only" role="status">
              {tr(
                "All three substances recovered.",
                "Vitu vyote vitatu vimepatikana.",
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
