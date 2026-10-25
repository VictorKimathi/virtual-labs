import { Label } from "../../../workbench/components/glyphs/shapes";
import { ink, inkSoft, tone } from "../../../workbench/components/glyphs/tones";
import { glassFill } from "../../../chemistry-bench/components/glyphs/geometry";
import {
  Box,
  Knob,
  Lamp,
  Screen,
  Trace,
  WornBadge,
} from "../../../chemistry-bench/components/glyphs/pieces";
import type { BioGlyph } from "../../biology.types";
import { gelLanes } from "../../data/catalogue/modern";
import type { bioSectionKinds } from "../../data/kinds";
import { microscopyGlyphs } from "./microscopyGlyphs";

type SafetyKind = (typeof bioSectionKinds.safety)[number];
type ModernKind = (typeof bioSectionKinds.modern)[number];

const coat: BioGlyph = ({ v }) => (
  <>
    <path
      d="M30 6 L50 20 L70 6 L96 26 L86 50 L78 44 V116 H22 V44 L14 50 L4 26 Z"
      strokeWidth="2"
      className={tone.paper}
    />
    <path d="M50 20 V116" strokeWidth="1.5" className={inkSoft} />
    <WornBadge x={86} y={100} worn={v("worn") === 1} />
  </>
);

const gloves: BioGlyph = ({ v }) => (
  <>
    <path
      d="M24 96 V54 L14 34 Q12 28 18 28 L28 44 V14 Q28 8 34 8 Q40 8 40 14 V40 V10 Q40 4 46 4 Q52 4 52 10 V40 V14 Q52 8 58 8 Q64 8 64 14 V44 V22 Q64 16 70 16 Q76 16 76 22 V70 L68 96 Z"
      strokeWidth="2"
      className="fill-sky-200 stroke-sky-700 dark:fill-sky-700 dark:stroke-sky-300"
    />
    <WornBadge x={80} y={86} worn={v("worn") === 1} />
  </>
);

const goggles: BioGlyph = ({ v }) => (
  <>
    <path
      d="M4 22 Q4 8 26 8 H74 Q96 8 96 22 V30 Q96 44 74 44 Q60 44 54 36 H46 Q40 44 26 44 Q4 44 4 30 Z"
      strokeWidth="2"
      className="fill-sky-100/80 stroke-slate-700 dark:fill-sky-900/60 dark:stroke-slate-300"
    />
    <WornBadge x={90} y={10} worn={v("worn") === 1} />
  </>
);

const spray = (fill: string, label: string): BioGlyph =>
  function SprayBottle() {
    return (
      <>
        <path
          d="M22 4 H40 V18 H22 Z M40 8 H54"
          strokeWidth="2"
          className={`${tone.dark} stroke-slate-900`}
        />
        <rect
          x="12"
          y="18"
          width="38"
          height="88"
          rx="8"
          strokeWidth="2"
          className={fill}
        />
        <rect
          x="16"
          y="46"
          width="30"
          height="20"
          rx="2"
          className={tone.paper}
          strokeWidth="0.8"
        />
        <text
          x="31"
          y="59"
          textAnchor="middle"
          fontSize="7"
          className="fill-slate-900 font-black"
        >
          {label}
        </text>
      </>
    );
  };

const sharps: BioGlyph = () => (
  <>
    <path
      d="M10 30 H70 L64 96 H16 Z"
      strokeWidth="2"
      className="fill-yellow-300 stroke-yellow-700"
    />
    <rect x="6" y="20" width="68" height="12" rx="3" className="fill-red-600" />
    <Label x={40} y={70} size={9}>
      SHARPS
    </Label>
  </>
);

const firstAid: BioGlyph = () => (
  <>
    <rect
      x="6"
      y="16"
      width="88"
      height="60"
      rx="6"
      strokeWidth="2"
      className={tone.green}
    />
    <path
      d="M44 34 H56 V40 H62 V52 H56 V58 H44 V52 H38 V40 H44 Z"
      className="fill-white"
    />
  </>
);

const eyeWash: BioGlyph = () => (
  <>
    <rect
      x="10"
      y="10"
      width="70"
      height="84"
      rx="10"
      strokeWidth="2"
      className={tone.green}
    />
    <path d="M22 52 Q45 30 68 52 Q45 74 22 52 Z" className="fill-white" />
    <circle cx="45" cy="52" r="8" className="fill-green-700" />
  </>
);

const biohazard: BioGlyph = () => (
  <>
    <path
      d="M14 30 Q45 18 76 30 L84 104 H6 Z"
      strokeWidth="2"
      className="fill-orange-400 stroke-orange-700"
    />
    <circle
      cx="45"
      cy="66"
      r="14"
      fill="none"
      strokeWidth="4"
      className="stroke-slate-900"
    />
    <circle cx="45" cy="66" r="4" className="fill-slate-900" />
  </>
);

export const safetyGlyphs: Record<SafetyKind, BioGlyph> = {
  "lab-coat": coat,
  gloves,
  "safety-goggles": goggles,
  disinfectant: spray("fill-sky-200 stroke-sky-600", "DISINFECT"),
  "sharps-container": sharps,
  "first-aid-kit": firstAid,
  "eye-wash": eyeWash,
  "biohazard-bag": biohazard,
};

/* -------------------------------------------------------------------- modern */

const logger: BioGlyph = ({ outcome, v }) => (
  <>
    <Box x={4} y={4} width={162} height={122} />
    <Trace plot={outcome.plot} x={14} y={14} width={142} height={70} />
    <Label x={84} y={108} size={11}>
      {v("value").toFixed(1)}
    </Label>
  </>
);

const colorimeter: BioGlyph = ({ v }) => (
  <>
    <Box x={4} y={24} width={182} height={102} />
    <rect
      x="140"
      y="6"
      width="26"
      height="30"
      rx="2"
      strokeWidth="2"
      className={tone.dark}
    />
    <Screen
      x={16}
      y={36}
      width={110}
      height={34}
      text={v("shown") < -5 ? "– – –" : v("shown").toFixed(3)}
      small={`A @ ${v("wavelength")} nm`}
    />
    {[
      "fill-violet-500",
      "fill-blue-500",
      "fill-cyan-400",
      "fill-green-500",
      "fill-yellow-400",
      "fill-orange-500",
      "fill-red-600",
    ].map((fill, index) => (
      <rect
        key={fill}
        x={20 + index * 20}
        y="88"
        width="20"
        height="10"
        className={fill}
      />
    ))}
    <path
      d={`M${20 + ((v("wavelength") - 400) / 300) * 140} 84 V104`}
      strokeWidth="2"
      className={ink}
    />
  </>
);

const centrifuge: BioGlyph = ({ v }) => (
  <>
    <rect
      x="6"
      y="34"
      width="128"
      height="72"
      rx="10"
      strokeWidth="2"
      className={tone.light}
    />
    <ellipse
      cx="70"
      cy="34"
      rx="58"
      ry="18"
      strokeWidth="2"
      className={tone.metal}
    />
    <ellipse
      cx="70"
      cy="34"
      rx="36"
      ry="10"
      fill="none"
      strokeWidth="1.5"
      className={inkSoft}
    />
    {v("spun") === 1 && (
      <path
        d="M104 74 h16 v20 h-16 z"
        className={v("sample") === 0 ? "fill-red-700" : "fill-green-700"}
      />
    )}
    <Knob x={30} y={80} />
  </>
);

const pcr: BioGlyph = ({ v }) => (
  <>
    <Box x={4} y={30} width={162} height={86} />
    <rect
      x="20"
      y="10"
      width="130"
      height="26"
      rx="6"
      strokeWidth="2"
      className={tone.metal}
    />
    <Screen
      x={16}
      y={50}
      width={90}
      height={28}
      text={v("running") === 1 ? "RUN" : "PCR"}
    />
    <Lamp x={146} y={64} on={v("running") === 1} />
  </>
);

const gel: BioGlyph = ({ part, env, v }) => {
  const lanes = gelLanes(part, env);
  const top = 30;
  const scale = 100 / 70;
  const band = (mm: number) => top + mm * scale;
  const visible = v("stain") === 1;
  return (
    <>
      <rect
        x="4"
        y="16"
        width="192"
        height="120"
        rx="6"
        strokeWidth="2"
        className={tone.light}
      />
      <rect
        x="20"
        y="24"
        width="160"
        height="106"
        className="fill-sky-100/60 dark:fill-sky-900/40"
      />
      <circle cx="14" cy="26" r="5" className="fill-slate-900" />
      <circle cx="14" cy="126" r="5" className="fill-red-600" />
      {[50, 100].map((x) => (
        <rect
          key={x}
          x={x - 12}
          y={top - 4}
          width="24"
          height="4"
          className="fill-slate-500"
        />
      ))}
      {visible &&
        lanes.ladder
          .filter((item) => item.mm > 0 && item.mm < 70)
          .map((item) => (
            <rect
              key={item.size}
              x="38"
              y={band(item.mm)}
              width="24"
              height="2.5"
              className="fill-orange-500"
            />
          ))}
      {visible &&
        lanes.sample
          .filter((item) => item.mm > 0 && item.mm < 70)
          .map((item) => (
            <rect
              key={item.size}
              x="88"
              y={band(item.mm)}
              width="24"
              height="3"
              className={
                item.strength > 0.5 ? "fill-orange-500" : "fill-orange-300"
              }
            />
          ))}
      {v("running") === 1 && (
        <Label x={150} y={14} size={9}>
          running
        </Label>
      )}
    </>
  );
};

const micropipette: BioGlyph = () => (
  <>
    <rect x="16" y="4" width="18" height="10" rx="3" className={tone.dark} />
    <rect
      x="12"
      y="14"
      width="26"
      height="90"
      rx="10"
      strokeWidth="2"
      className="fill-slate-200 stroke-slate-500"
    />
    <rect x="16" y="40" width="18" height="16" rx="2" className={tone.screen} />
    <path
      d="M18 104 H32 L26 160 H24 Z"
      strokeWidth="1.5"
      className={`${glassFill} stroke-sky-500`}
    />
  </>
);

const hood: BioGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="4"
      width="232"
      height="172"
      rx="6"
      strokeWidth="2"
      className={tone.light}
    />
    <rect
      x="18"
      y="40"
      width="204"
      height="110"
      rx="3"
      strokeWidth="2"
      className={`${glassFill} stroke-sky-500`}
    />
    {v("on") === 1 &&
      [60, 120, 180].map((x) => (
        <path
          key={x}
          d={`M${x} 46 V140`}
          strokeWidth="1.5"
          strokeDasharray="6 6"
          className="stroke-sky-400"
        />
      ))}
    {v("uv") === 1 && (
      <rect
        x="18"
        y="40"
        width="204"
        height="10"
        className="fill-violet-500/70"
      />
    )}
    <Lamp x={220} y={22} on={v("on") === 1} />
  </>
);

const bloodPressure: BioGlyph = ({ v }) => (
  <>
    <Box x={4} y={4} width={100} height={110} />
    <Screen
      x={12}
      y={14}
      width={84}
      height={30}
      text={v("measured") === 1 ? `${Math.round(v("sys"))}` : "– –"}
      small="SYS"
    />
    <Screen
      x={12}
      y={50}
      width={84}
      height={26}
      text={v("measured") === 1 ? `${Math.round(v("dia"))}` : "– –"}
      small="DIA"
    />
    <path
      d="M104 60 Q124 60 130 80"
      fill="none"
      strokeWidth="3"
      className="stroke-slate-500"
    />
    <rect
      x="116"
      y="76"
      width="30"
      height="40"
      rx="6"
      className="fill-sky-700"
    />
  </>
);

const oximeter: BioGlyph = ({ v }) => (
  <>
    <path
      d="M10 30 Q10 10 30 10 H70 Q86 10 86 30 V50 Q86 70 70 70 H30 Q10 70 10 50 Z"
      strokeWidth="2"
      className={tone.light}
    />
    <Screen
      x={20}
      y={22}
      width={58}
      height={34}
      text={v("spo2") > 0 ? `${Math.round(v("spo2"))}%` : "– –"}
      small={v("pulse") > 0 ? `${Math.round(v("pulse"))} bpm` : ""}
    />
  </>
);

export const modernGlyphs: Record<ModernKind, BioGlyph> = {
  "digital-microscope": microscopyGlyphs["light-microscope"],
  "data-logger": logger,
  colorimeter,
  centrifuge,
  "pcr-machine": pcr,
  "gel-electrophoresis": gel,
  micropipette,
  "laminar-flow-hood": hood,
  "blood-pressure-monitor": bloodPressure,
  "pulse-oximeter": oximeter,
};
