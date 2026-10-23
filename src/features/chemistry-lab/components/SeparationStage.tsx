import { motion } from "motion/react";
import { useId } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { SCENE_MS, type MethodId } from "../data/separation";
import { grains, type Grain } from "./separationGrains";

const DURATION = SCENE_MS / 1000;
const sandWater = "rgba(125, 211, 252, 0.4)";

function GrainShape({ grain }: { grain: Grain }) {
  if (grain.kind === "salt")
    return (
      <rect
        x={-grain.size / 2}
        y={-grain.size / 2}
        width={grain.size}
        height={grain.size}
        rx={0.6}
        fill={grain.shade}
        stroke="#94a3b8"
        strokeWidth={0.5}
      />
    );
  return (
    <circle
      r={grain.size}
      fill={grain.shade}
      stroke={grain.kind === "iron" ? "#1e293b" : "#a07c45"}
      strokeWidth={0.5}
    />
  );
}

function Dish() {
  return (
    <>
      <path
        d="M-150 -30 Q-148 12 -100 14 H100 Q148 12 150 -30 Z"
        className="fill-slate-50 stroke-slate-400 dark:fill-slate-200 dark:stroke-slate-500"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M-128 -22 Q-124 4 -96 8"
        fill="none"
        stroke="white"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.8}
      />
    </>
  );
}

function IdleScene({ withIron }: { withIron: boolean }) {
  return (
    <g transform="translate(320 322)">
      <g>
        {grains
          .filter((grain) => withIron || grain.kind !== "iron")
          .map((grain) => (
            <g key={grain.id} transform={`translate(${grain.x} ${grain.y})`}>
              <GrainShape grain={grain} />
            </g>
          ))}
      </g>
      <Dish />
      <ellipse cx={0} cy={22} rx={170} ry={7} fill="rgba(15,23,42,0.16)" />
    </g>
  );
}

function MagnetScene() {
  const iron = grains.filter((grain) => grain.kind === "iron");
  const hoverX = 320;
  const hoverY = 232;
  const endX = 486;
  const endY = 112;
  return (
    <g>
      <IdleScene withIron={false} />
      <g transform="translate(320 322)">
        {iron.map((grain, index) => {
          const dx = ((index % 5) - 2) * 6.5;
          const dy = 5 + Math.floor(index / 5) * 6;
          return (
            <motion.g
              key={grain.id}
              initial={{ x: grain.x, y: grain.y }}
              animate={{
                x: [grain.x, grain.x, hoverX - 320 + dx, endX - 320 + dx],
                y: [grain.y, grain.y, hoverY - 322 + dy, endY - 322 + dy],
              }}
              transition={{
                duration: DURATION,
                times: [0, 0.3, 0.62, 1],
                ease: "easeInOut",
              }}
            >
              <GrainShape grain={grain} />
            </motion.g>
          );
        })}
      </g>
      <motion.g
        initial={{ x: hoverX, y: 60 }}
        animate={{
          x: [hoverX, hoverX, hoverX, endX],
          y: [60, hoverY, hoverY, endY],
        }}
        transition={{
          duration: DURATION,
          times: [0, 0.3, 0.62, 1],
          ease: "easeInOut",
        }}
      >
        <rect x={-34} y={-62} width={34} height={62} className="fill-red-600" />
        <rect x={0} y={-62} width={34} height={62} className="fill-blue-600" />
        <rect
          x={-34}
          y={-62}
          width={68}
          height={62}
          rx={3}
          fill="none"
          className="stroke-slate-700 dark:stroke-slate-200"
          strokeWidth={2}
        />
        <text
          x={-17}
          y={-26}
          textAnchor="middle"
          fontSize={20}
          fontWeight={800}
          fill="white"
        >
          N
        </text>
        <text
          x={17}
          y={-26}
          textAnchor="middle"
          fontSize={20}
          fontWeight={800}
          fill="white"
        >
          S
        </text>
      </motion.g>
    </g>
  );
}

const beakerOutline = "M-95 -210 V-2 Q-95 10 -83 10 H83 Q95 10 95 -2 V-210";

function DissolveScene() {
  const clipId = useId();
  const dissolving = grains.filter((grain) => grain.kind !== "iron");
  return (
    <g transform="translate(320 346)">
      <clipPath id={clipId}>
        <path d="M-95 -210 V-2 Q-95 10 -83 10 H83 Q95 10 95 -2 V-210 Z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x={-95}
          width={190}
          height={170}
          fill={sandWater}
          initial={{ y: 10 }}
          animate={{ y: -150 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />
      </g>
      <motion.rect
        x={-3}
        width={6}
        rx={3}
        fill="rgba(125, 211, 252, 0.85)"
        initial={{ y: -300, height: 0, opacity: 1 }}
        animate={{ y: -300, height: [0, 290, 290], opacity: [1, 1, 0] }}
        transition={{ duration: 1.4, times: [0, 0.4, 1] }}
      />
      {dissolving.map((grain, index) => {
        const lane = ((index * 37) % 150) - 75;
        const restY = -6 - (index % 6) * 2.4;
        const isSalt = grain.kind === "salt";
        const timing = { duration: 1.5, delay: 0.9 + (index % 12) * 0.05 };
        return (
          <motion.g
            key={grain.id}
            initial={{ x: lane, y: -250, opacity: 0, scale: 1 }}
            animate={{
              x: lane,
              y: restY,
              opacity: isSalt ? [0, 1, 1, 0] : [0, 1, 1],
              scale: isSalt ? [1, 1, 0.1] : 1,
            }}
            transition={{
              y: { ...timing, ease: "easeIn" },
              opacity: {
                ...timing,
                times: isSalt ? [0, 0.12, 0.6, 1] : [0, 0.12, 1],
              },
              scale: { ...timing, times: [0, 0.6, 1] },
            }}
          >
            <GrainShape grain={grain} />
          </motion.g>
        );
      })}
      <motion.g
        initial={{ x: 0, rotate: -6, opacity: 0 }}
        animate={{
          x: [-40, 30, -30, 38, -20, 0],
          rotate: [-8, 6, -8, 6, -8, -2],
          opacity: [0, 1, 1, 1, 1, 1],
        }}
        transition={{ delay: 2.2, duration: 1.5, ease: "easeInOut" }}
      >
        <rect
          x={-3}
          y={-250}
          width={6}
          height={230}
          rx={3}
          fill="rgba(226,232,240,0.9)"
          className="stroke-slate-400"
          strokeWidth={1.5}
        />
      </motion.g>
      <path
        d={beakerOutline}
        fill="rgba(255,255,255,0.08)"
        className="stroke-slate-400 dark:stroke-slate-300"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M-84 -190 V-30"
        stroke="white"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.5}
      />
      <ellipse cx={0} cy={16} rx={130} ry={6} fill="rgba(15,23,42,0.16)" />
    </g>
  );
}

const funnelPath = "M-86 70 L-10 162 V218 H10 V162 L86 70 Z";
const funnelBeaker = "M-72 250 V352 Q-72 362 -62 362 H62 Q72 362 72 352 V250";

function FilterScene() {
  const clipId = useId();
  const beakerClip = useId();
  return (
    <g transform="translate(320 0)">
      <rect
        x={-172}
        y={40}
        width={10}
        height={334}
        rx={3}
        className="fill-slate-400 dark:fill-slate-500"
      />
      <rect
        x={-166}
        y={118}
        width={78}
        height={8}
        rx={3}
        className="fill-slate-400 dark:fill-slate-500"
      />
      <ellipse
        cx={0}
        cy={122}
        rx={46}
        ry={5}
        fill="none"
        className="stroke-slate-500"
        strokeWidth={4}
      />
      <rect
        x={-210}
        y={368}
        width={140}
        height={10}
        rx={3}
        className="fill-slate-400 dark:fill-slate-500"
      />

      <clipPath id={clipId}>
        <path d={funnelPath} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x={-90}
          width={180}
          height={110}
          fill="rgba(190, 170, 130, 0.62)"
          initial={{ y: 92 }}
          animate={{ y: 166 }}
          transition={{ duration: DURATION * 0.85, ease: "easeIn" }}
        />
        <motion.rect
          x={-90}
          width={180}
          fill="#c9a56b"
          initial={{ y: 166, height: 0 }}
          animate={{ y: 128, height: 42 }}
          transition={{ duration: DURATION * 0.85, ease: "easeOut" }}
        />
      </g>
      <path
        d="M-78 72 L-8 156 H8 L78 72"
        fill="none"
        stroke="#f5e9c8"
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.9}
      />
      <path
        d={funnelPath}
        fill="rgba(255,255,255,0.12)"
        className="stroke-slate-400 dark:stroke-slate-300"
        strokeWidth={3}
        strokeLinejoin="round"
      />

      <clipPath id={beakerClip}>
        <path d={`${funnelBeaker} Z`} />
      </clipPath>
      <g clipPath={`url(#${beakerClip})`}>
        <motion.rect
          x={-72}
          width={144}
          height={120}
          fill={sandWater}
          initial={{ y: 362 }}
          animate={{ y: 300 }}
          transition={{
            duration: DURATION * 0.85,
            ease: "easeOut",
            delay: 0.4,
          }}
        />
      </g>
      <path
        d={funnelBeaker}
        fill="rgba(255,255,255,0.08)"
        className="stroke-slate-400 dark:stroke-slate-300"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <motion.circle
        cx={0}
        r={3.6}
        fill="rgba(125, 211, 252, 0.95)"
        initial={{ cy: 220, opacity: 0 }}
        animate={{ cy: [220, 300], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 0.5,
          ease: "easeIn",
          repeat: 6,
          repeatDelay: 0.1,
          delay: 0.4,
        }}
      />
      <ellipse cx={0} cy={380} rx={96} ry={5} fill="rgba(15,23,42,0.14)" />
    </g>
  );
}

const bowlPath = "M-98 -52 Q-94 -4 -52 0 H52 Q94 -4 98 -52 Z";

function EvaporateScene() {
  const clipId = useId();
  const crystals = grains.filter((grain) => grain.kind === "salt").slice(0, 26);
  return (
    <g transform="translate(320 0)">
      <rect
        x={-300}
        y={380}
        width={600}
        height={20}
        className="fill-slate-300/70 dark:fill-slate-800"
      />
      <path
        d="M-86 252 L-112 380 M86 252 L112 380 M0 252 L0 380"
        className="stroke-slate-500 dark:stroke-slate-400"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <ellipse
        cx={0}
        cy={250}
        rx={104}
        ry={9}
        fill="none"
        className="stroke-slate-500 dark:stroke-slate-400"
        strokeWidth={5}
      />
      <rect
        x={-102}
        y={247}
        width={204}
        height={6}
        rx={2}
        className="fill-slate-400/70 dark:fill-slate-500"
      />

      <g transform="translate(0 246)">
        <clipPath id={clipId}>
          <path d={bowlPath} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={-100}
            width={200}
            height={60}
            fill={sandWater}
            initial={{ y: -40 }}
            animate={{ y: 2 }}
            transition={{ duration: DURATION * 0.85, ease: "easeInOut" }}
          />
        </g>
        {crystals.map((grain, index) => (
          <motion.g
            key={grain.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 2.1 }}
            transition={{
              delay: DURATION * 0.55 + (index % 13) * 0.07,
              type: "spring",
              stiffness: 260,
              damping: 14,
            }}
          >
            <g
              transform={`translate(${grain.x * 0.62} ${-4 - (index % 3) * 4})`}
            >
              <GrainShape grain={grain} />
            </g>
          </motion.g>
        ))}
        <path
          d={bowlPath}
          className="fill-white/30 stroke-slate-400 dark:stroke-slate-300"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {[-34, 0, 34].map((offset, index) => (
          <motion.path
            key={offset}
            d={`M${offset} -62 C${offset - 12} -80 ${offset + 12} -96 ${offset} -116`}
            fill="none"
            stroke="rgba(148,163,184,0.85)"
            strokeWidth={4}
            strokeLinecap="round"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: [0, -36] }}
            transition={{
              duration: 1.2,
              repeat: 2,
              delay: 0.3 + index * 0.35,
              ease: "easeOut",
            }}
          />
        ))}
      </g>

      <rect
        x={-46}
        y={366}
        width={92}
        height={14}
        rx={6}
        className="fill-slate-700 dark:fill-slate-500"
      />
      <rect
        x={-9}
        y={298}
        width={18}
        height={70}
        className="fill-slate-500 dark:fill-slate-400"
      />
      <rect
        x={-12}
        y={332}
        width={24}
        height={14}
        rx={3}
        className="fill-slate-700 dark:fill-slate-300"
      />
      <rect
        x={9}
        y={350}
        width={50}
        height={7}
        rx={3}
        className="fill-slate-600 dark:fill-slate-400"
      />
      <motion.g
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: DURATION, times: [0, 0.88, 1] }}
      >
        <motion.path
          d="M0 298 C-16 280 -14 262 0 246 C14 262 16 280 0 298 Z"
          fill="#38bdf8"
          fillOpacity={0.85}
          animate={{
            scaleY: [1, 1.14, 0.94, 1.08, 1],
            scaleX: [1, 0.94, 1.04, 0.96, 1],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ originY: 1 }}
        />
        <motion.path
          d="M0 298 C-7 288 -6 274 0 262 C6 274 7 288 0 298 Z"
          fill="#fb923c"
          animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1] }}
          transition={{ duration: 0.4, repeat: Infinity }}
          style={{ originY: 1 }}
        />
      </motion.g>
    </g>
  );
}

type SeparationStageProps = { scene: MethodId | "idle" };

export function SeparationStage({ scene }: SeparationStageProps) {
  const { tr } = useLanguage();
  return (
    <svg
      viewBox="100 30 440 375"
      role="img"
      aria-label={tr("Laboratory apparatus", "Vifaa vya maabara")}
      className="h-auto w-full"
    >
      <motion.g
        key={scene}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {scene === "idle" && <IdleScene withIron />}
        {scene === "magnet" && <MagnetScene />}
        {scene === "dissolve" && <DissolveScene />}
        {scene === "filter" && <FilterScene />}
        {scene === "evaporate" && <EvaporateScene />}
      </motion.g>
    </svg>
  );
}
