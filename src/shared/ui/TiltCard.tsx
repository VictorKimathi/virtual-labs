import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  to: string;
  className: string;
  wrapperClassName?: string;
  children: ReactNode;
};

const MAX_TILT = 10;

export function TiltCard({ to, className, wrapperClassName, children }: Props) {
  const reducedMotion = useReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 220, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 220, damping: 18 });
  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    tiltY.set(((event.clientX - box.left) / box.width - 0.5) * MAX_TILT * 2);
    tiltX.set(-((event.clientY - box.top) / box.height - 0.5) * MAX_TILT * 2);
  }
  function reset() {
    tiltX.set(0);
    tiltY.set(0);
  }
  return (
    <div className={`h-full perspective-distant ${wrapperClassName ?? ""}`}>
      <motion.div
        style={{ rotateX, rotateY }}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        whileTap={{ scale: 0.98 }}
        className="h-full transform-3d"
      >
        <Link to={to} className={className}>
          {children}
        </Link>
      </motion.div>
    </div>
  );
}
