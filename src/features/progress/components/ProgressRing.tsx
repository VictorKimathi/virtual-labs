import { motion } from "motion/react";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="relative size-32 shrink-0"
    >
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{
            strokeDashoffset: CIRCUMFERENCE * (1 - percent / 100),
          }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="stroke-kenya-green dark:stroke-green-400"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-black">
        {percent}%
      </span>
    </div>
  );
}
