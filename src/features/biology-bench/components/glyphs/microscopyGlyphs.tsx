import { Label } from "../../../workbench/components/glyphs/shapes";
import { ink, inkSoft, tone } from "../../../workbench/components/glyphs/tones";
import type { ReactNode } from "react";
import { glassFill } from "../../../chemistry-bench/components/glyphs/geometry";
import { Lamp } from "../../../chemistry-bench/components/glyphs/pieces";
import type { BioGlyph } from "../../biology.types";
import type { bioSectionKinds } from "../../data/kinds";
import { MicroscopeView } from "../MicroscopeView";

type MicroscopyKind = (typeof bioSectionKinds.microscopy)[number];

const stainFill = [
  "fill-slate-200",
  "fill-amber-400",
  "fill-blue-500",
  "fill-pink-400",
  "fill-red-600",
];

const microscope: BioGlyph = ({ v, outcome, part }) => {
  const digital = v("digital") === 1;
  const w = part.width;
  return (
    <>
      <path
        d={`M20 ${part.height - 8} H${w - 20}`}
        strokeWidth="10"
        strokeLinecap="round"
        className={ink}
      />
      <path
        d={`M${w - 40} ${part.height - 12} V60 Q${w - 40} 30 ${w - 70} 30`}
        fill="none"
        strokeWidth="14"
        strokeLinecap="round"
        className="stroke-slate-700 dark:stroke-slate-400"
      />
      <rect
        x={w / 2 - 38}
        y={part.height - 80}
        width="76"
        height="8"
        rx="2"
        className={tone.dark}
      />
      <rect
        x={w / 2 - 22}
        y={part.height - 90}
        width="44"
        height="6"
        rx="1"
        className={tone.glass}
      />
      <circle
        cx={w / 2}
        cy={part.height - 40}
        r="12"
        className={
          v("lamp") > 0 ? "fill-yellow-200 stroke-yellow-500" : tone.metal
        }
        strokeWidth="2"
      />
      <rect
        x={w / 2 - 9}
        y="34"
        width="18"
        height="70"
        rx="4"
        className={tone.steel}
        strokeWidth="1.5"
      />
      <rect
        x={w / 2 - 6}
        y="104"
        width="12"
        height={18 + v("objective") * 6}
        rx="2"
        className={tone.dark}
      />
      <rect
        x={w / 2 - 7}
        y="10"
        width="14"
        height="26"
        rx="3"
        className={tone.dark}
      />
      <circle
        cx={w - 40}
        cy={part.height - 60}
        r="11"
        strokeWidth="2"
        className={tone.metal}
      />
      <circle cx={w - 40} cy={part.height - 60} r="5" className={tone.dark} />
      {digital && (
        <>
          <rect
            x="4"
            y="18"
            width="70"
            height="56"
            rx="4"
            className={tone.screen}
            strokeWidth="2"
          />
          {outcome.view && (
            <MicroscopeView view={outcome.view} cx={39} cy={46} r={24} />
          )}
        </>
      )}
      <Lamp x={w - 16} y={part.height - 22} on={v("lamp") > 0} />
    </>
  );
};

const handLens: BioGlyph = () => (
  <>
    <path
      d="M52 34 L86 54"
      strokeWidth="8"
      strokeLinecap="round"
      className="stroke-amber-800"
    />
    <circle
      cx="32"
      cy="24"
      r="21"
      strokeWidth="4"
      className={`${glassFill} stroke-slate-600 dark:stroke-slate-300`}
    />
    <path
      d="M20 16 Q26 10 34 10"
      fill="none"
      strokeWidth="2"
      className="stroke-white"
    />
  </>
);

const slideBase = (children: ReactNode) => (
  <>
    <rect
      x="2"
      y="8"
      width="116"
      height="28"
      rx="2"
      strokeWidth="1.5"
      className={tone.glass}
    />
    {children}
  </>
);

const glassSlide: BioGlyph = ({ v }) =>
  slideBase(
    <>
      {v("specimen") > 0 && (
        <ellipse
          cx="60"
          cy="22"
          rx="16"
          ry="8"
          className={stainFill[v("stain")] ?? stainFill[0]}
        />
      )}
      {v("drops") > 0 && (
        <ellipse
          cx="60"
          cy="22"
          rx={10 + Math.min(4, v("drops")) * 3}
          ry={6 + Math.min(4, v("drops"))}
          className="fill-sky-300/40"
        />
      )}
      {v("cover") > 0 && (
        <rect
          x="42"
          y="10"
          width="36"
          height="24"
          strokeWidth="1"
          className="fill-white/40 stroke-sky-500"
        />
      )}
      {v("cover") === 2 &&
        [0, 1, 2].map((index) => (
          <circle
            key={index}
            cx={50 + index * 9}
            cy={16 + (index % 2) * 10}
            r="2.5"
            fill="none"
            strokeWidth="1"
            className="stroke-slate-800"
          />
        ))}
    </>,
  );

const coverSlip: BioGlyph = () => (
  <>
    <rect
      x="10"
      y="12"
      width="30"
      height="30"
      rx="1"
      strokeWidth="1.5"
      className={tone.glass}
    />
    <rect
      x="40"
      y="8"
      width="30"
      height="30"
      rx="1"
      strokeWidth="1.5"
      className={tone.glass}
    />
  </>
);

const preparedColours = [
  "fill-red-400",
  "fill-green-500",
  "fill-rose-400",
  "fill-lime-400",
  "fill-amber-300",
  "fill-amber-500",
];

const preparedSlide: BioGlyph = ({ v }) =>
  slideBase(
    <>
      <rect
        x="6"
        y="11"
        width="28"
        height="22"
        className={tone.paper}
        strokeWidth="0.8"
      />
      <path d="M10 18 H30 M10 24 H26" strokeWidth="1.5" className={inkSoft} />
      <rect
        x="48"
        y="11"
        width="40"
        height="22"
        className="fill-white/40 stroke-sky-500"
        strokeWidth="1"
      />
      <ellipse
        cx="68"
        cy="22"
        rx="14"
        ry="7"
        className={preparedColours[v("type")] ?? preparedColours[0]}
      />
    </>,
  );

const mountingNeedle: BioGlyph = () => (
  <>
    <rect
      x="70"
      y="8"
      width="56"
      height="9"
      rx="4"
      className={tone.wood}
      strokeWidth="1.5"
    />
    <path d="M70 12 H6" strokeWidth="2" className={ink} />
  </>
);

const forceps: BioGlyph = () => (
  <path
    d="M116 12 L6 14 M116 18 L6 16"
    fill="none"
    strokeWidth="3"
    strokeLinecap="round"
    className="stroke-slate-500"
  />
);

const dropper: BioGlyph = () => (
  <>
    <ellipse
      cx="20"
      cy="18"
      rx="12"
      ry="14"
      className="fill-red-500 stroke-red-800"
      strokeWidth="1.5"
    />
    <path
      d="M16 30 H24 L22 104 H18 Z"
      strokeWidth="1.5"
      className={tone.glass}
    />
  </>
);

const micrometer: BioGlyph = () =>
  slideBase(
    <>
      <circle
        cx="60"
        cy="22"
        r="11"
        fill="none"
        strokeWidth="1"
        className={inkSoft}
      />
      <path d="M52 22 H68" strokeWidth="1" className={ink} />
      <Label x={100} y={26} size={8}>
        1 mm
      </Label>
    </>,
  );

const stainBottle = (fill: string): BioGlyph =>
  function StainBottle() {
    return (
      <>
        <ellipse cx="25" cy="12" rx="8" ry="9" className="fill-slate-700" />
        <rect
          x="18"
          y="20"
          width="14"
          height="12"
          rx="2"
          className={tone.glass}
          strokeWidth="1.5"
        />
        <path
          d="M8 44 Q8 32 20 32 H30 Q42 32 42 44 V86 H8 Z"
          strokeWidth="2"
          className={tone.glass}
        />
        <path d="M10 54 H40 V84 H10 Z" className={fill} />
      </>
    );
  };

const onion: BioGlyph = () => (
  <>
    <path
      d="M45 10 Q50 30 76 50 Q88 80 45 86 Q2 80 14 50 Q40 30 45 10 Z"
      strokeWidth="2"
      className="fill-amber-200 stroke-amber-700 dark:fill-amber-700"
    />
    <path
      d="M45 20 Q35 50 45 84 M45 20 Q58 50 45 84"
      fill="none"
      strokeWidth="1.5"
      className="stroke-amber-600"
    />
  </>
);

const swab: BioGlyph = () => (
  <>
    <path d="M14 20 H78" strokeWidth="3" className="stroke-slate-300" />
    <ellipse
      cx="12"
      cy="20"
      rx="9"
      ry="6"
      className="fill-white stroke-slate-300"
      strokeWidth="1"
    />
    <ellipse
      cx="80"
      cy="20"
      rx="9"
      ry="6"
      className="fill-white stroke-slate-300"
      strokeWidth="1"
    />
  </>
);

export const microscopyGlyphs: Record<MicroscopyKind, BioGlyph> = {
  "light-microscope": microscope,
  "hand-lens": handLens,
  "glass-slide": glassSlide,
  "cover-slip": coverSlip,
  "prepared-slide": preparedSlide,
  "mounting-needle": mountingNeedle,
  forceps,
  dropper,
  "stage-micrometer": micrometer,
  "methylene-blue": stainBottle("fill-blue-600/80"),
  eosin: stainBottle("fill-pink-500/80"),
  acetocarmine: stainBottle("fill-red-700/80"),
  "onion-bulb": onion,
  "cheek-swab": swab,
};
