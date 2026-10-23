import { LoaderCircle, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLanguage } from "../../app/useLanguage";

type Props = { title: string; src: string };

const LOAD_TIMEOUT_MS = 20000;

export function EmbeddedSimulation({ title, src }: Props) {
  const { tr } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const timer = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <div className="relative aspect-3/2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
      <iframe
        title={title}
        src={src}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full bg-white"
      />
      <AnimatePresence>
        {!loaded && (
          <motion.div
            role={timedOut ? "alert" : "status"}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-900 dark:text-slate-300"
          >
            {timedOut ? (
              <>
                <TriangleAlert
                  className="h-8 w-8 text-kenya-red dark:text-red-300"
                  aria-hidden="true"
                />
                <span className="max-w-sm text-sm font-bold">
                  {tr(
                    "This simulation is taking too long to start. Check your connection or open it on its own site.",
                    "Uigaji huu unachelewa kuanza. Angalia mtandao wako au kifungue kwenye tovuti yake.",
                  )}
                </span>
              </>
            ) : (
              <>
                <LoaderCircle
                  className="h-8 w-8 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span className="text-sm font-bold">
                  {tr("Starting simulation…", "Uigaji unaanza…")}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
