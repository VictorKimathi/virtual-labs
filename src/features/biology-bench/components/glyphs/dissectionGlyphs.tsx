import type { ReactNode } from "react";
import { ink, tone } from "../../../workbench/components/glyphs/tones";
import type { BioGlyph } from "../../biology.types";
import type { bioSectionKinds } from "../../data/kinds";
import { specimens } from "../../data/specimens";
import { Organs } from "./bioPieces";

type DissectionKind = (typeof bioSectionKinds.dissection)[number];

const skin =
  "fill-stone-300 stroke-stone-500 dark:fill-stone-500 dark:stroke-stone-300";
const cavity =
  "fill-rose-200 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500";

const pins = (points: [number, number][]) =>
  points.map(([x, y], index) => (
    <g key={index}>
      <circle cx={x} cy={y} r="3" className="fill-red-500" />
    </g>
  ));

function specimenGlyph(
  kind: DissectionKind,
  body: (stage: number) => ReactNode,
): BioGlyph {
  const specimen = specimens[kind];
  return function SpecimenGlyph({ v }) {
    if (!specimen) return null;
    const stage = v("stage");
    return (
      <>
        {body(stage)}
        <Organs
          specimen={specimen}
          stage={stage}
          target={v("target")}
          labels={v("labels") === 1}
        />
      </>
    );
  };
}

const rat = specimenGlyph("rat", (stage) => (
  <>
    <path
      d="M212 80 Q218 100 220 140"
      fill="none"
      strokeWidth="3"
      className="stroke-rose-300"
    />
    <path
      d="M30 80 Q36 26 120 28 Q210 30 212 80 Q210 130 120 132 Q36 134 30 80 Z"
      strokeWidth="2"
      className={skin}
    />
    <path d="M30 80 L6 70 L6 90 Z" strokeWidth="2" className={skin} />
    {[
      [60, 30],
      [60, 130],
      [180, 32],
      [180, 128],
    ].map(([x, y]) => (
      <ellipse
        key={`${x}-${y}`}
        cx={x}
        cy={y + (y < 80 ? -6 : 6)}
        rx="8"
        ry="5"
        className={skin}
      />
    ))}
    {stage >= 2 && (
      <path
        d="M40 80 Q40 42 120 40 Q200 42 202 80 Q200 118 120 120 Q40 118 40 80 Z"
        strokeWidth="1.5"
        className="fill-stone-100 stroke-stone-400 dark:fill-stone-600"
      />
    )}
    {stage >= 4 && (
      <path
        d={`M${stage >= 5 ? 34 : 70} 80 Q${stage >= 5 ? 36 : 72} 46 120 46 Q196 48 198 80 Q196 114 120 114 Q${stage >= 5 ? 36 : 72} 114 ${stage >= 5 ? 34 : 70} 80 Z`}
        strokeWidth="1.5"
        className={cavity}
      />
    )}
    {stage >= 1 && stage < 4 && (
      <path
        d="M40 80 H202"
        strokeWidth="1.5"
        strokeDasharray="5 3"
        className={ink}
      />
    )}
    {stage >= 1 &&
      pins([
        [30, 80],
        [212, 80],
        [60, 26],
        [60, 134],
        [180, 28],
        [180, 132],
      ])}
  </>
));

const frog = specimenGlyph("frog", (stage) => (
  <>
    <path
      d="M60 50 L20 20 M60 110 L20 140 M170 60 Q210 40 214 10 M170 100 Q210 120 214 150"
      fill="none"
      strokeWidth="9"
      strokeLinecap="round"
      className="stroke-lime-600 dark:stroke-lime-500"
    />
    <ellipse
      cx="115"
      cy="80"
      rx="75"
      ry="48"
      strokeWidth="2"
      className="fill-lime-300 stroke-lime-700 dark:fill-lime-700"
    />
    <ellipse
      cx="48"
      cy="80"
      rx="22"
      ry="26"
      strokeWidth="2"
      className="fill-lime-300 stroke-lime-700 dark:fill-lime-700"
    />
    {stage >= 3 && (
      <ellipse
        cx="115"
        cy="80"
        rx="58"
        ry="34"
        strokeWidth="1.5"
        className={cavity}
      />
    )}
    {stage >= 1 && stage < 3 && (
      <path
        d="M60 80 H180"
        strokeWidth="1.5"
        strokeDasharray="5 3"
        className={ink}
      />
    )}
    {stage >= 1 &&
      pins([
        [20, 20],
        [20, 140],
        [214, 10],
        [214, 150],
      ])}
  </>
));

const fish = specimenGlyph("fish", (stage) => (
  <>
    <path
      d="M196 80 L218 52 V108 Z"
      strokeWidth="2"
      className="fill-slate-400 stroke-slate-600"
    />
    <ellipse
      cx="110"
      cy="80"
      rx="92"
      ry="42"
      strokeWidth="2"
      className="fill-slate-300 stroke-slate-600 dark:fill-slate-500"
    />
    <circle cx="36" cy="72" r="6" className="fill-slate-900" />
    {stage < 2 && (
      <path
        d="M60 50 Q70 80 60 110"
        fill="none"
        strokeWidth="2"
        className="stroke-slate-600"
      />
    )}
    {stage >= 2 && (
      <path
        d="M50 54 Q74 80 50 106"
        fill="none"
        strokeWidth="2"
        className="stroke-red-700"
      />
    )}
    {stage >= 4 && (
      <path
        d="M66 60 Q110 46 168 64 Q174 82 166 102 Q110 112 66 102 Z"
        strokeWidth="1.5"
        className={cavity}
      />
    )}
    {stage === 3 && (
      <path
        d="M168 100 Q110 110 66 100"
        fill="none"
        strokeWidth="1.5"
        strokeDasharray="5 3"
        className={ink}
      />
    )}
  </>
));

const flower = specimenGlyph("flower", (stage) => (
  <>
    <path d="M80 126 V138" strokeWidth="6" className="stroke-green-700" />
    {stage >= 1 && (
      <path
        d="M80 20 V126"
        strokeWidth="1"
        strokeDasharray="4 3"
        className={ink}
      />
    )}
  </>
));

const bean = specimenGlyph("bean-seed", (stage) => (
  <>
    {stage >= 2 && stage < 3 && (
      <ellipse
        cx="60"
        cy="50"
        rx="44"
        ry="28"
        strokeWidth="2"
        className="fill-amber-100 stroke-amber-600"
      />
    )}
    {stage >= 1 && stage < 2 && (
      <ellipse cx="60" cy="50" rx="50" ry="33" className="fill-sky-200/40" />
    )}
    {stage >= 3 && (
      <path d="M60 24 V76" strokeWidth="1.5" className="stroke-amber-700" />
    )}
  </>
));

const board: BioGlyph = () => (
  <>
    <rect
      x="4"
      y="4"
      width="252"
      height="182"
      rx="8"
      strokeWidth="2"
      className="fill-amber-100 stroke-amber-700 dark:fill-amber-900 dark:stroke-amber-500"
    />
    <rect
      x="14"
      y="14"
      width="232"
      height="162"
      rx="4"
      className="fill-amber-50 dark:fill-amber-950"
    />
  </>
);

const scalpel: BioGlyph = () => (
  <>
    <rect
      x="50"
      y="11"
      width="76"
      height="9"
      rx="3"
      className={tone.steel}
      strokeWidth="1.5"
    />
    <path
      d="M50 12 L14 15 Q6 18 14 20 L50 19 Z"
      className="fill-slate-200 stroke-slate-500"
      strokeWidth="1.5"
    />
  </>
);

const razor: BioGlyph = () => (
  <>
    <rect
      x="6"
      y="6"
      width="58"
      height="18"
      rx="2"
      className="fill-slate-200 stroke-slate-500"
      strokeWidth="1.5"
    />
    <rect
      x="24"
      y="12"
      width="22"
      height="6"
      rx="3"
      className="fill-white stroke-slate-400"
      strokeWidth="1"
    />
  </>
);

const scissors: BioGlyph = () => (
  <>
    <circle cx="96" cy="12" r="9" fill="none" strokeWidth="3" className={ink} />
    <circle cx="96" cy="28" r="9" fill="none" strokeWidth="3" className={ink} />
    <path
      d="M88 14 L8 22 M88 26 L8 18"
      strokeWidth="3"
      strokeLinecap="round"
      className="stroke-slate-500"
    />
  </>
);

const pinBox: BioGlyph = () => (
  <>
    <rect
      x="6"
      y="14"
      width="58"
      height="22"
      rx="3"
      className={tone.light}
      strokeWidth="1.5"
    />
    {[16, 28, 40, 52].map((x) => (
      <g key={x}>
        <path
          d={`M${x} 26 V4`}
          strokeWidth="1.5"
          className="stroke-slate-500"
        />
        <circle cx={x} cy="4" r="3" className="fill-red-500" />
      </g>
    ))}
  </>
);

export const dissectionGlyphs: Record<DissectionKind, BioGlyph> = {
  "dissecting-board": board,
  scalpel,
  "razor-blade": razor,
  "dissecting-scissors": scissors,
  "dissecting-pins": pinBox,
  rat,
  frog,
  fish,
  flower,
  "bean-seed": bean,
};
