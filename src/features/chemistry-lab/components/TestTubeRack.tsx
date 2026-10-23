import { motion } from "motion/react";
import { useId } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { mixColor, toCss } from "../chem/color";
import { indicators } from "../data/indicators";
import { findSample } from "../data/samples";
import type { Dosing, Tube } from "../hooks/useIndicatorBench";

const TUBE_WIDTH = 48;
const TUBE_HEIGHT = 170;
const TUBE_BOTTOM = 262;
const TUBE_TOP = TUBE_BOTTOM - TUBE_HEIGHT;
const FILL_LEVEL = 0.62;
const SURFACE_Y = TUBE_BOTTOM - TUBE_HEIGHT * FILL_LEVEL;

function slotCenter(index: number) {
  return 70 + index * 100;
}

const tubePath = `M0 0 V${TUBE_HEIGHT - 24} A24 24 0 0 0 ${TUBE_WIDTH} ${TUBE_HEIGHT - 24} V0`;

type TestTubeProps = {
  tube: Tube;
  selected: boolean;
  onSelect: () => void;
  label: string;
};

function TestTube({ tube, selected, onSelect, label }: TestTubeProps) {
  const clipId = useId();
  const sample = findSample(tube.sampleId);
  if (!sample) return null;
  const indicator = tube.indicator ? indicators[tube.indicator] : null;
  const dyed = indicator ? toCss(mixColor(indicator.stops, sample.ph)) : null;
  const localSurface = TUBE_HEIGHT * (1 - FILL_LEVEL);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="cursor-pointer outline-none"
    >
      {selected && (
        <motion.rect
          x={-12}
          y={-14}
          width={TUBE_WIDTH + 24}
          height={TUBE_HEIGHT + 26}
          rx={18}
          className="fill-orange-500/10 stroke-orange-500"
          strokeWidth={2}
          strokeDasharray="6 5"
        />
      )}
      <clipPath id={clipId}>
        <path d={`${tubePath} Z`} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x={0}
          width={TUBE_WIDTH}
          height={TUBE_HEIGHT}
          initial={{ y: TUBE_HEIGHT }}
          animate={{ y: localSurface }}
          transition={{ type: "spring", stiffness: 70, damping: 16 }}
          fill={toCss(sample.tint)}
        />
        {dyed && (
          <motion.rect
            x={0}
            y={localSurface}
            width={TUBE_WIDTH}
            fill={dyed}
            initial={{ height: 0 }}
            animate={{ height: TUBE_HEIGHT - localSurface }}
            transition={{ delay: 0.9, duration: 1.4, ease: "easeInOut" }}
          />
        )}
        <motion.ellipse
          cx={TUBE_WIDTH / 2}
          rx={TUBE_WIDTH / 2}
          ry={3.5}
          fill="rgba(255,255,255,0.45)"
          initial={{ cy: TUBE_HEIGHT }}
          animate={{ cy: localSurface }}
          transition={{ type: "spring", stiffness: 70, damping: 16 }}
        />
      </g>
      <path
        d={tubePath}
        fill="rgba(255,255,255,0.08)"
        className="stroke-slate-400 dark:stroke-slate-300"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect
        x={-4}
        y={-5}
        width={TUBE_WIDTH + 8}
        height={7}
        rx={3.5}
        className="fill-slate-300/80 stroke-slate-400 dark:fill-slate-600 dark:stroke-slate-400"
        strokeWidth={1.5}
      />
      <rect
        x={9}
        y={14}
        width={4}
        height={TUBE_HEIGHT - 60}
        rx={2}
        fill="rgba(255,255,255,0.55)"
      />
    </g>
  );
}

type DropperProps = { dosing: Dosing; color: string; bottleColor: string };

function Dropper({ dosing, color, bottleColor }: DropperProps) {
  const cx = slotCenter(dosing.tube);
  return (
    <motion.g
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: [0, 1, 1, 0], y: [-40, 0, 0, -40] }}
      transition={{ duration: 2.1, times: [0, 0.18, 0.8, 1] }}
      pointerEvents="none"
    >
      <path
        d={`M${cx - 9} 16 h18 l-2 28 h-14 z`}
        fill={bottleColor}
        className="stroke-slate-600"
        strokeWidth={1.5}
      />
      <rect
        x={cx - 11}
        y={4}
        width={22}
        height={14}
        rx={5}
        className="fill-slate-700"
      />
      <path
        d={`M${cx - 3} 44 h6 l-1.5 12 h-3 z`}
        className="fill-slate-300 stroke-slate-500"
        strokeWidth={1}
      />
      {[0, 1, 2].map((drop) => (
        <motion.circle
          key={drop}
          cx={cx}
          r={4}
          fill={color}
          initial={{ cy: 60, opacity: 0 }}
          animate={{ cy: [60, SURFACE_Y], opacity: [1, 1, 0] }}
          transition={{
            delay: 0.4 + drop * 0.28,
            duration: 0.34,
            ease: "easeIn",
          }}
        />
      ))}
    </motion.g>
  );
}

type TestTubeRackProps = {
  tubes: (Tube | null)[];
  selected: number | null;
  dosing: Dosing | null;
  onSelect: (index: number) => void;
};

export function TestTubeRack({
  tubes,
  selected,
  dosing,
  onSelect,
}: TestTubeRackProps) {
  const { language, tr } = useLanguage();
  const dosedTube = dosing ? tubes[dosing.tube] : null;
  const dosedIndicator = dosedTube?.indicator
    ? indicators[dosedTube.indicator]
    : null;
  const dosedSample = dosedTube ? findSample(dosedTube.sampleId) : null;
  const dropColor =
    dosedIndicator && dosedSample
      ? toCss(mixColor(dosedIndicator.stops, dosedSample.ph))
      : "rgba(0,0,0,0)";

  return (
    <svg
      viewBox="0 0 640 330"
      role="group"
      aria-label={tr("Test tube rack", "Rafu ya mirija ya majaribio")}
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="rack-wood" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c08a52" />
          <stop offset="1" stopColor="#8f6234" />
        </linearGradient>
        <linearGradient id="bench-top" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#94a3b8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#94a3b8" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect
        x={0}
        y={TUBE_BOTTOM + 10}
        width={640}
        height={60}
        fill="url(#bench-top)"
      />
      <ellipse
        cx={320}
        cy={TUBE_BOTTOM + 14}
        rx={290}
        ry={9}
        fill="rgba(15,23,42,0.18)"
      />
      <rect
        x={28}
        y={TUBE_BOTTOM - 4}
        width={584}
        height={12}
        rx={4}
        fill="url(#rack-wood)"
      />
      <rect
        x={34}
        y={TUBE_BOTTOM - 130}
        width={10}
        height={130}
        rx={3}
        fill="url(#rack-wood)"
      />
      <rect
        x={596}
        y={TUBE_BOTTOM - 130}
        width={10}
        height={130}
        rx={3}
        fill="url(#rack-wood)"
      />

      {tubes.map((tube, index) => {
        const cx = slotCenter(index);
        const sample = tube ? findSample(tube.sampleId) : null;
        return (
          <g
            key={index}
            transform={`translate(${cx - TUBE_WIDTH / 2} ${TUBE_TOP})`}
          >
            {tube && sample ? (
              <TestTube
                tube={tube}
                selected={selected === index}
                onSelect={() => onSelect(index)}
                label={`${tr("Tube", "Mrija")} ${index + 1}: ${sample.name[language]}`}
              />
            ) : (
              <path
                d={tubePath}
                fill="none"
                className="stroke-slate-400/50 dark:stroke-slate-500/60"
                strokeWidth={2}
                strokeDasharray="5 6"
              />
            )}
          </g>
        );
      })}

      <rect
        x={28}
        y={TUBE_BOTTOM - 132}
        width={584}
        height={14}
        rx={5}
        fill="url(#rack-wood)"
        fillOpacity={0.92}
      />

      {tubes.map((_, index) => (
        <g key={index}>
          <circle
            cx={slotCenter(index)}
            cy={TUBE_BOTTOM + 36}
            r={13}
            className={
              selected === index
                ? "fill-orange-500"
                : "fill-slate-300 dark:fill-slate-700"
            }
          />
          <text
            x={slotCenter(index)}
            y={TUBE_BOTTOM + 41}
            textAnchor="middle"
            className={`text-xs font-extrabold ${selected === index ? "fill-white" : "fill-slate-700 dark:fill-slate-200"}`}
          >
            {index + 1}
          </text>
        </g>
      ))}

      {dosing && dosedIndicator && (
        <Dropper
          key={dosing.token}
          dosing={dosing}
          color={dropColor}
          bottleColor={dropColor}
        />
      )}
    </svg>
  );
}
