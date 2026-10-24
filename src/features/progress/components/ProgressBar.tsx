import { motion } from "motion/react";

type Props = {
  percent: number;
  tone: string;
  size?: "md" | "lg";
  className?: string;
};

export function ProgressBar({ percent, tone, size = "md", className }: Props) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${size === "lg" ? "h-4" : "h-2.5"} ${className ?? ""}`}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        className={`h-full rounded-full ${tone}`}
      />
    </div>
  );
}
