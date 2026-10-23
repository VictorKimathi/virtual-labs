import { motion } from "motion/react";
import { useMemo } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { BURETTE_CAPACITY, phAfterAdding } from "../chem/titration";

const WIDTH = 340;
const HEIGHT = 210;
const LEFT = 36;
const RIGHT = 12;
const TOP = 12;
const BOTTOM = 34;
const plotW = WIDTH - LEFT - RIGHT;
const plotH = HEIGHT - TOP - BOTTOM;

const xAt = (volume: number) => LEFT + (volume / BURETTE_CAPACITY) * plotW;
const yAt = (ph: number) => TOP + (1 - ph / 14) * plotH;

type TitrationCurveProps = {
  base: number;
  volume: number;
  equivalence: number | null;
};

export function TitrationCurve({
  base,
  volume,
  equivalence,
}: TitrationCurveProps) {
  const { tr } = useLanguage();
  const path = useMemo(() => {
    const steps = Math.round(volume / 0.1);
    return Array.from({ length: steps + 1 }, (_, step) => {
      const v = step * 0.1;
      return `${step === 0 ? "M" : "L"}${xAt(v).toFixed(1)} ${yAt(phAfterAdding(base, v)).toFixed(1)}`;
    }).join(" ");
  }, [base, volume]);
  const currentPh = phAfterAdding(base, volume);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={tr(
        "pH against volume of acid added",
        "pH dhidi ya ujazo wa asidi",
      )}
      className="h-auto w-full"
    >
      {[0, 2, 4, 6, 8, 10, 12, 14].map((ph) => (
        <g key={ph}>
          <line
            x1={LEFT}
            x2={WIDTH - RIGHT}
            y1={yAt(ph)}
            y2={yAt(ph)}
            className="stroke-slate-200 dark:stroke-slate-800"
          />
          <text
            x={LEFT - 6}
            y={yAt(ph) + 3}
            textAnchor="end"
            fontSize={10}
            className="fill-slate-500 dark:fill-slate-400"
          >
            {ph}
          </text>
        </g>
      ))}
      {[0, 10, 20, 30, 40, 50].map((v) => (
        <text
          key={v}
          x={xAt(v)}
          y={HEIGHT - 18}
          textAnchor="middle"
          fontSize={10}
          className="fill-slate-500 dark:fill-slate-400"
        >
          {v}
        </text>
      ))}
      <text
        x={LEFT + plotW / 2}
        y={HEIGHT - 4}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        className="fill-slate-600 dark:fill-slate-300"
      >
        {tr("Volume of acid added (mL)", "Ujazo wa asidi (mL)")}
      </text>
      <line
        x1={LEFT}
        x2={WIDTH - RIGHT}
        y1={yAt(7)}
        y2={yAt(7)}
        strokeDasharray="4 4"
        className="stroke-green-600/60"
      />
      {equivalence !== null && (
        <motion.line
          x1={xAt(equivalence)}
          x2={xAt(equivalence)}
          y1={TOP}
          y2={TOP + plotH}
          strokeDasharray="4 4"
          className="stroke-orange-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      {volume > 0 && (
        <path
          d={path}
          fill="none"
          className="stroke-orange-600"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      <motion.circle
        r={5.5}
        className="fill-orange-600 stroke-white dark:stroke-slate-900"
        strokeWidth={2}
        initial={false}
        animate={{ cx: xAt(volume), cy: yAt(currentPh) }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
      />
    </svg>
  );
}
