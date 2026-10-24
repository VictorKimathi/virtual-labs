import { motion } from "motion/react";
import type { ReactNode } from "react";

const MAX_STAGGER_STEPS = 8;
const STAGGER_SECONDS = 0.05;

type Props = { index: number; children: ReactNode };

export function RevealItem({ index, children }: Props) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        delay: Math.min(index, MAX_STAGGER_STEPS) * STAGGER_SECONDS,
      }}
    >
      {children}
    </motion.li>
  );
}
