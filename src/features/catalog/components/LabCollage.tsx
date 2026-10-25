import { Gauge, Languages, MessageSquareText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { showcaseLabs } from "../../workbench/data/showcase";
import { glassCard, glassChip } from "./landing.styles";

type FloatProps = { className: string; index: number; children: ReactNode };

/** One collage piece: stacked on small screens, pinned in place on large ones. */
function Float({ className, index, children }: FloatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={`relative lg:absolute ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SceneCard({
  labId,
  children,
}: {
  labId: string;
  children?: ReactNode;
}) {
  const lab = showcaseLabs.find((item) => item.id === labId);
  if (!lab) return null;
  const { Scene } = lab;
  return (
    <div
      className={`relative h-full bg-linear-to-br ${lab.sceneClass} ${glassCard}`}
    >
      <div className="h-full p-6">
        <Scene />
      </div>
      {children}
    </div>
  );
}

/** Floating glimpses of the labs around one big line. */
export function LabCollage() {
  const { language, toggleLanguage, tr } = useLanguage();
  const swahili = language === "sw";
  return (
    <section
      aria-labelledby="collage-heading"
      className="relative mx-auto max-w-screen-2xl overflow-hidden px-4 py-24 sm:px-10 lg:min-h-350 lg:py-32"
    >
      <div className="pointer-events-none mb-12 flex justify-center lg:absolute lg:inset-0 lg:mb-0 lg:items-center">
        <h2
          id="collage-heading"
          className="text-center text-6xl font-bold leading-none tracking-tighter sm:text-8xl lg:text-9xl"
        >
          {tr("Step inside", "Ingia ndani")}
          <br />
          {tr("the lab", "ya maabara")}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:block">
        <Float
          index={0}
          className="h-64 lg:left-1/10 lg:top-1/8 lg:z-10 lg:h-65 lg:w-85"
        >
          <SceneCard labId="physics">
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/40 bg-white/30 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/60">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span>{tr("Circuit built", "Sakiti imeundwa")}</span>
                <span>3/4</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-950/10 dark:bg-white/10">
                <div className="h-1.5 w-3/4 rounded-full bg-stone-950 dark:bg-white" />
              </div>
            </div>
          </SceneCard>
        </Float>

        <Float
          index={1}
          className="h-64 lg:right-1/8 lg:top-3/20 lg:z-10 lg:h-80 lg:w-70"
        >
          <SceneCard labId="chemistry">
            <span className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-white/50 bg-white/40 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-stone-900/60">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
          </SceneCard>
        </Float>

        <Float index={2} className="lg:left-1/20 lg:top-9/20 lg:z-20 lg:w-65">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/50 bg-white/40 p-5 shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-stone-900/60">
            <div className="flex items-center justify-between gap-4">
              <span id="collage-language" className="text-xs font-semibold">
                Kiswahili
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={swahili}
                aria-labelledby="collage-language"
                onClick={toggleLanguage}
                className={`flex h-6 w-10 items-center rounded-full p-1 shadow-inner transition-colors ${swahili ? "justify-end bg-kenya-green" : "justify-start bg-stone-300 dark:bg-stone-700"}`}
              >
                <motion.span
                  layout
                  transition={{ duration: 0.2 }}
                  className="size-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-tr from-kenya-green to-emerald-500 text-white shadow-md">
                <Languages className="size-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col text-left">
                <span className="text-xs font-bold">
                  {tr("Bilingual labs", "Maabara kwa lugha mbili")}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  English · Kiswahili
                </span>
              </span>
            </div>
          </div>
        </Float>

        <Float
          index={3}
          className="h-56 lg:right-1/12 lg:top-1/2 lg:z-10 lg:h-55 lg:w-80"
        >
          <SceneCard labId="biology">
            <span className={`absolute left-4 top-4 ${glassChip}`}>
              <span className="size-2 rounded-full bg-green-500 shadow-sm shadow-green-500" />
              {tr("Safety checked", "Usalama umekaguliwa")}
            </span>
          </SceneCard>
        </Float>

        <Float
          index={4}
          className="h-64 lg:left-3/20 lg:top-7/10 lg:z-10 lg:h-65 lg:w-95"
        >
          <SceneCard labId="anatomy">
            <span className={`absolute bottom-5 left-5 ${glassChip}`}>
              {tr("3D anatomy", "Anatomia ya 3D")}
            </span>
          </SceneCard>
        </Float>

        <Float index={5} className="lg:right-3/20 lg:top-3/4 lg:z-10 lg:w-90">
          <div className="rounded-4xl border border-white/40 bg-linear-to-br from-sky-100 to-blue-100 p-6 shadow-2xl dark:border-white/10 dark:from-stone-900 dark:to-blue-950">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <Gauge className="size-4" aria-hidden="true" />
              {tr("Live readings", "Vipimo vya moja kwa moja")}
            </div>
            <dl className="grid grid-cols-2 gap-3 text-left">
              {[
                [tr("Current", "Mkondo"), "0.42 A"],
                [tr("Voltage", "Volteji"), "1.50 V"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/70 p-4 dark:bg-stone-950/50"
                >
                  <dt className="text-xs text-stone-500 dark:text-stone-400">
                    {label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Float>

        <Float index={6} className="lg:left-9/20 lg:top-9/10 lg:z-20 lg:w-max">
          <div className="flex items-center gap-4 rounded-3xl border border-white/50 bg-white/40 p-3 pr-6 shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-stone-900/60">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white dark:bg-white dark:text-stone-950">
              <MessageSquareText className="size-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col text-left">
              <span className="text-xs font-bold">
                {tr("Teacher feedback", "Maoni ya mwalimu")}
              </span>
              <span className="text-sm text-stone-700 dark:text-stone-300">
                {tr(
                  "Great work. Now try two cells.",
                  "Kazi nzuri. Sasa jaribu seli mbili.",
                )}
              </span>
            </span>
          </div>
        </Float>
      </div>
    </section>
  );
}
