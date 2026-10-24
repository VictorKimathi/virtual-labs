import { ArrowRight, Bolt } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";

export function ContinueBanner() {
  const { tr } = useLanguage();
  return (
    <section
      aria-labelledby="continue-heading"
      className="relative isolate flex flex-col gap-4 overflow-hidden rounded-3xl bg-linear-to-r from-kenya-green to-emerald-700 p-6 text-white shadow-xl shadow-kenya-green/20 lg:flex-row lg:items-center lg:gap-6"
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 -z-10 size-64 rounded-full bg-white/10 blur-2xl"
      />
      <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md lg:flex">
        <Bolt className="size-7" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-green-100">
          {tr("Continue where you stopped", "Endelea ulipoishia")}
        </p>
        <h2 id="continue-heading" className="mt-1 text-xl font-extrabold">
          {tr("Ohm's Law", "Sheria ya Ohm")}{" "}
          <span className="mt-1 block text-sm font-semibold text-green-100">
            {tr(
              "Grade 10 · Physics · Step 1 of 7",
              "Gredi ya 10 · Fizikia · Hatua ya 1 kati ya 7",
            )}
          </span>
        </h2>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "16.7%" }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="h-full rounded-full bg-white"
          />
        </div>
      </div>
      <Link
        to="/labs/ohms-law"
        className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white lg:w-auto px-5 text-sm font-extrabold text-kenya-green transition-transform hover:-translate-y-0.5"
      >
        {tr("Continue", "Endelea")}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
