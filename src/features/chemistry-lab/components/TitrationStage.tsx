import { motion } from "motion/react";
import { useId } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { mixColor, toCss } from "../chem/color";
import { BURETTE_CAPACITY, FLASK_VOLUME } from "../chem/titration";
import type { Indicator } from "../chemistry.types";

const CENTER = 264;
const ZERO_Y = 70;
const MARK_PITCH = 4.8;
const BURETTE_BOTTOM = 318;
const TIP_Y = 352;
const FLASK_BASE = 494;

const flaskPath =
  "M246 390 V430 L196 488 Q190 498 204 498 H324 Q338 498 332 488 L282 430 V390";

type TitrationStageProps = {
  volume: number;
  ph: number;
  indicator: Indicator;
  pour: { token: number; amount: number };
};

export function TitrationStage({
  volume,
  ph,
  indicator,
  pour,
}: TitrationStageProps) {
  const { tr } = useLanguage();
  const clipId = useId();
  const buretteSurface = ZERO_Y + volume * MARK_PITCH;
  const flaskSurface = Math.max(
    410,
    FLASK_BASE - ((FLASK_VOLUME + volume) / 100) * 80,
  );
  const liquid = toCss(mixColor(indicator.stops, ph));
  const stream = pour.amount >= 1;

  return (
    <svg
      viewBox="40 10 320 535"
      role="img"
      aria-label={tr(
        "Burette above a conical flask on a white tile",
        "Biureti juu ya chupa ya koni kwenye kigae cheupe",
      )}
      className="mx-auto h-auto w-full max-w-md"
    >
      <defs>
        <linearGradient id="steel" x1="0" x2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="0.5" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="tile-glow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      <rect
        x={0}
        y={512}
        width={520}
        height={28}
        className="fill-slate-300/70 dark:fill-slate-800"
      />
      <rect x={44} y={504} width={206} height={12} rx={4} fill="url(#steel)" />
      <rect x={66} y={16} width={12} height={492} rx={4} fill="url(#steel)" />
      <rect x={72} y={106} width={178} height={9} rx={4} fill="url(#steel)" />
      <rect x={72} y={222} width={178} height={9} rx={4} fill="url(#steel)" />
      <rect
        x={244}
        y={96}
        width={40}
        height={28}
        rx={6}
        className="fill-slate-500 dark:fill-slate-400"
      />
      <rect
        x={244}
        y={212}
        width={40}
        height={28}
        rx={6}
        className="fill-slate-500 dark:fill-slate-400"
      />

      <rect
        x={250}
        y={30}
        width={28}
        height={BURETTE_BOTTOM - 30}
        rx={6}
        fill="rgba(255,255,255,0.14)"
        className="stroke-slate-400 dark:stroke-slate-300"
        strokeWidth={2.5}
      />
      <motion.rect
        x={252}
        width={24}
        fill="rgba(125, 211, 252, 0.55)"
        initial={false}
        animate={{ y: buretteSurface, height: BURETTE_BOTTOM - buretteSurface }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
      />
      {Array.from({ length: BURETTE_CAPACITY + 1 }, (_, mark) => {
        const y = ZERO_Y + mark * MARK_PITCH;
        const major = mark % 5 === 0;
        return (
          <g key={mark}>
            <line
              x1={250}
              x2={major ? 264 : 257}
              y1={y}
              y2={y}
              className="stroke-slate-600 dark:stroke-slate-300"
              strokeWidth={major ? 1.4 : 0.8}
            />
            {mark % 10 === 0 && (
              <text
                x={284}
                y={y + 3}
                fontSize={10}
                fontWeight={700}
                className="fill-slate-600 dark:fill-slate-300"
              >
                {mark}
              </text>
            )}
          </g>
        );
      })}
      <motion.path
        d="M0 0 L-9 -5 V5 Z"
        className="fill-orange-500"
        initial={false}
        animate={{ x: 304, y: buretteSurface }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
      />

      <rect
        x={256}
        y={BURETTE_BOTTOM}
        width={16}
        height={14}
        rx={3}
        className="fill-slate-500 dark:fill-slate-400"
      />
      <path
        d={`M259 ${BURETTE_BOTTOM + 14} L${CENTER - 1.5} ${TIP_Y} h3 L269 ${BURETTE_BOTTOM + 14} Z`}
        fill="rgba(255,255,255,0.3)"
        className="stroke-slate-400"
        strokeWidth={1.5}
      />
      <motion.g
        key={pour.token}
        initial={{ rotate: 0 }}
        animate={{ rotate: pour.amount > 0 ? [0, 90, 90, 0] : 0 }}
        transition={{ duration: stream ? 1.2 : 0.7, times: [0, 0.2, 0.8, 1] }}
      >
        <g transform={`translate(${CENTER} ${BURETTE_BOTTOM + 7})`}>
          <rect
            x={-22}
            y={-3.5}
            width={44}
            height={7}
            rx={3.5}
            className="fill-orange-500"
          />
        </g>
      </motion.g>

      {pour.amount > 0 && (
        <motion.g key={`pour-${pour.token}`} pointerEvents="none">
          {stream ? (
            <motion.rect
              x={CENTER - 1.8}
              y={TIP_Y}
              width={3.6}
              rx={1.8}
              fill="rgba(125, 211, 252, 0.8)"
              initial={{ height: 0, opacity: 1 }}
              animate={{
                height: [0, flaskSurface - TIP_Y, flaskSurface - TIP_Y],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.1, times: [0, 0.25, 1] }}
            />
          ) : (
            <motion.circle
              cx={CENTER}
              r={4}
              fill="rgba(125, 211, 252, 0.9)"
              initial={{ cy: TIP_Y, opacity: 1 }}
              animate={{ cy: flaskSurface, opacity: [1, 1, 0] }}
              transition={{ duration: 0.5, ease: "easeIn" }}
            />
          )}
        </motion.g>
      )}

      <rect
        x={168}
        y={498}
        width={192}
        height={14}
        rx={4}
        fill="url(#tile-glow)"
      />

      <motion.g
        key={`swirl-${pour.token}`}
        animate={{ rotate: pour.amount > 0 ? [0, 1.6, -1.6, 0.8, 0] : 0 }}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        <clipPath id={clipId}>
          <path d={`${flaskPath} Z`} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={180}
            width={170}
            height={120}
            fill="rgba(125, 211, 252, 0.42)"
            initial={false}
            animate={{ y: flaskSurface }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />
          <motion.rect
            x={180}
            width={170}
            height={120}
            initial={false}
            animate={{ y: flaskSurface, fill: liquid }}
            transition={{
              y: { type: "spring", stiffness: 90, damping: 18 },
              fill: { duration: 0.6 },
            }}
          />
          <motion.ellipse
            cx={CENTER}
            rx={34}
            ry={3.5}
            fill="rgba(255,255,255,0.45)"
            initial={false}
            animate={{ cy: flaskSurface }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />
        </g>
        <path
          d={flaskPath}
          fill="rgba(255,255,255,0.1)"
          className="stroke-slate-400 dark:stroke-slate-300"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <rect
          x={241}
          y={385}
          width={46}
          height={7}
          rx={3.5}
          className="fill-slate-300/80 stroke-slate-400 dark:fill-slate-600"
          strokeWidth={1.5}
        />
        <path
          d="M214 478 L240 440"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}
