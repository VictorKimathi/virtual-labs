import { LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import type { PhetSimulation } from "../phet.types";

type Props = { simulation: PhetSimulation };

export function SimulationPlayer({ simulation }: Props) {
  const { tr } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative aspect-3/2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
      <iframe
        title={simulation.title}
        src={simulation.runUrl}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full"
      />
      <AnimatePresence>
        {!loaded && (
          <motion.div
            role="status"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
          >
            <LoaderCircle
              className="h-8 w-8 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span className="text-sm font-bold">
              {tr("Starting simulation…", "Uigaji unaanza…")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
