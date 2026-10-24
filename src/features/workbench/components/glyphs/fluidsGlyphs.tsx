import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Arrow, Dial, Label, VScale } from "./shapes";
import { ink, inkSoft, tone } from "./tones";

type FluidsKind = (typeof sectionKinds.fluids)[number];

const DEGREES = Math.PI / 180;

const liquidClass = (index: number) =>
  index === 0
    ? "stroke-slate-400 dark:stroke-slate-300"
    : index === 1
      ? "stroke-sky-400"
      : "stroke-amber-400";

const manometer: Glyph = ({ p, v }) => {
  const shift = v("height") * 0.5;
  const left = 200 + shift / 2;
  const right = 200 - shift / 2;
  return (
    <>
      <path
        d="M70 60 V320 Q70 350 120 350 Q170 350 170 320 V60"
        fill="none"
        strokeWidth="22"
        strokeLinecap="round"
        className="stroke-sky-100 dark:stroke-sky-950"
      />
      <path
        d={`M70 ${left} V320 Q70 336 120 336 Q170 336 170 320 V${right}`}
        fill="none"
        strokeWidth="14"
        className={liquidClass(p("liquid"))}
      />
      <path
        d="M70 60 V320 Q70 350 120 350 Q170 350 170 320 V60"
        fill="none"
        strokeWidth="1.5"
        className={inkSoft}
      />
      <path
        d="M70 60 V30 H40 V12 H20 V50 H40"
        fill="none"
        strokeWidth="2"
        className={ink}
      />
      <ellipse
        cx="30"
        cy="30"
        rx="26"
        ry="18"
        strokeWidth="2"
        className={tone.glass}
      />
      <Label x={30} y={34} size={10}>
        gas
      </Label>
      <VScale
        x={196}
        y={350}
        from={-300}
        to={300}
        perUnit={0.5}
        minor={10}
        mid={50}
        major={100}
        labelEvery={1}
      />
      <path d="M180 200 H196" strokeWidth="2" className="stroke-red-600" />
      <Label x={120} y={374} size={10}>
        open to air
      </Label>
    </>
  );
};

const mercury: Glyph = ({ v }) => {
  const height = v("height");
  const tilt = v("tilt");
  const length = (height * 0.395) / Math.cos(tilt * DEGREES);
  return (
    <>
      <ellipse
        cx="95"
        cy="440"
        rx="62"
        ry="14"
        strokeWidth="2"
        className={tone.glass}
      />
      <ellipse cx="95" cy="436" rx="56" ry="9" className={tone.steel} />
      <g transform={`rotate(${tilt} 95 430)`}>
        <rect
          x="89"
          y={430 - length - 30}
          width="12"
          height={length + 62}
          rx="3"
          strokeWidth="1.5"
          className={tone.glass}
        />
        <rect
          x="91"
          y={430 - length}
          width="8"
          height={length + 20}
          className={tone.steel}
        />
      </g>
      <VScale
        x={140}
        y={430}
        from={0}
        to={780}
        perUnit={0.395}
        minor={10}
        mid={50}
        major={100}
        labelEvery={1}
      />
      <path
        d={`M104 ${430 - height * 0.395} H140`}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        className="stroke-red-600"
      />
      <Label x={95} y={14} size={10}>
        mm Hg
      </Label>
    </>
  );
};

const aneroid: Glyph = ({ v }) => (
  <>
    <circle cx="110" cy="112" r="100" strokeWidth="5" className={tone.brass} />
    <circle
      cx="110"
      cy="112"
      r="90"
      className="fill-white stroke-slate-300 dark:fill-slate-200"
      strokeWidth="1"
    />
    <Dial
      cx={110}
      cy={112}
      r={80}
      min={60}
      max={110}
      value={v("shown")}
      major={10}
      minor={2}
      start={-130}
      end={130}
      unit="kPa"
    />
    <circle cx="110" cy="214" r="9" strokeWidth="2" className={tone.steel} />
    <path d="M104 214 h12" strokeWidth="2" className={ink} />
  </>
);

const press: Glyph = ({ p, v }) => {
  const smallWidth = [24, 36][p("a1")];
  const largeWidth = [50, 72, 92][p("a2")];
  const smallX = 50;
  const largeX = 190;
  const smallTop = 100 + v("stroke") * 4;
  const largeTop = 130 - v("lift") * 24;
  return (
    <>
      <path
        d={`M${smallX} 110 V250 H${largeX + largeWidth} V110 M${smallX + smallWidth} 110 V230 H${largeX} V110`}
        fill="none"
        strokeWidth="2"
        className={ink}
      />
      <rect
        x={smallX}
        y={smallTop + 14}
        width={smallWidth}
        height={250 - smallTop - 14}
        className={tone.liquid}
      />
      <rect
        x={smallX + smallWidth}
        y="230"
        width={largeX - smallX - smallWidth}
        height="20"
        className={tone.liquid}
      />
      <rect
        x={largeX}
        y={largeTop + 14}
        width={largeWidth}
        height={250 - largeTop - 14}
        className={tone.liquid}
      />
      <rect
        x={smallX - 2}
        y={smallTop}
        width={smallWidth + 4}
        height="14"
        rx="2"
        className={tone.steel}
      />
      <path
        d={`M${smallX + smallWidth / 2} ${smallTop} V60`}
        strokeWidth="4"
        className={ink}
        fill="none"
      />
      <rect
        x={largeX - 2}
        y={largeTop}
        width={largeWidth + 4}
        height="14"
        rx="2"
        className={tone.steel}
      />
      <rect
        x={largeX + largeWidth / 2 - 22}
        y={largeTop - 40}
        width="44"
        height="40"
        rx="3"
        strokeWidth="1.5"
        className={tone.copper}
      />
      <Arrow
        x1={smallX + smallWidth / 2}
        y1={20}
        x2={smallX + smallWidth / 2}
        y2={58}
      />
      <Label x={smallX + smallWidth / 2} y={14} size={10}>
        {p("force")} N
      </Label>
      <Label x={smallX + smallWidth / 2} y={278} size={10}>
        {[2, 4][p("a1")]} cm²
      </Label>
      <Label x={largeX + largeWidth / 2} y={278} size={10}>
        {[40, 80, 120][p("a2")]} cm²
      </Label>
    </>
  );
};

const vase: Glyph = ({ part, v }) => {
  const level = 290 - v("fill") * 7;
  const probe = level + v("depth") * 7;
  const id = `vase-${part.id}`;
  const tubes = [
    "M42 80 V290 M58 80 V290",
    "M100 80 V290 M148 80 V290",
    "M196 80 L210 290 M250 80 L240 290",
    "M276 130 Q256 160 276 190 L282 290 M306 130 Q326 160 306 190 L300 290",
    "M330 80 L352 290 M346 80 L366 290",
  ];
  return (
    <>
      <clipPath id={id}>
        <rect x="0" y={level} width="380" height={300 - level} />
      </clipPath>
      <rect
        x="20"
        y="288"
        width="350"
        height="22"
        rx="4"
        className={tone.glass}
        strokeWidth="2"
      />
      <g clipPath={`url(#${id})`}>
        <path
          d="M42 80 H58 V290 H42 Z M100 80 H148 V290 H100 Z M196 80 H250 L240 290 H210 Z M276 130 Q256 160 276 190 L282 290 H300 L306 190 Q326 160 306 130 Z M330 80 H346 L366 290 H352 Z"
          className={tone.liquid}
        />
        <rect x="20" y="288" width="350" height="22" className={tone.liquid} />
      </g>
      <path d={tubes.join(" ")} fill="none" strokeWidth="2" className={ink} />
      <path
        d={`M14 ${level} H370`}
        strokeWidth="1.5"
        strokeDasharray="5 4"
        className="stroke-sky-600"
      />
      <path d={`M14 ${probe} H40`} strokeWidth="2" className="stroke-red-600" />
      <circle cx="14" cy={probe} r="4" className="fill-red-600" />
      <Label x={190} y={326} size={10}>
        same level in every tube
      </Label>
    </>
  );
};

const hydrometer: Glyph = ({ v }) => {
  const gravity = v("gravity");
  const surface = 130;
  const top = surface - (gravity - 0.7) * 150;
  const marks = [];
  for (let g = 70; g <= 130; g += 2) {
    const y = top + (g / 100 - 0.7) * 150;
    marks.push(
      <g key={g}>
        <path
          d={`M75 ${y} h${g % 10 === 0 ? 10 : 6}`}
          strokeWidth="1"
          className={ink}
        />
        {g % 10 === 0 && (
          <text
            x={90}
            y={y + 3}
            fontSize="9"
            className="fill-slate-700 font-bold dark:fill-slate-200"
          >
            {(g / 100).toFixed(2)}
          </text>
        )}
      </g>,
    );
  }
  return (
    <>
      <rect
        x="20"
        y="100"
        width="100"
        height="230"
        rx="6"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="21"
        y={surface}
        width="98"
        height={329 - surface}
        className={tone.liquid}
        opacity="0.55"
      />
      <rect
        x="64"
        y={top - 8}
        width="12"
        height="106"
        rx="3"
        strokeWidth="1.5"
        className={tone.glass}
      />
      <ellipse
        cx="70"
        cy={top + 120}
        rx="20"
        ry="32"
        strokeWidth="1.5"
        className={tone.glass}
      />
      <ellipse cx="70" cy={top + 130} rx="14" ry="14" className={tone.steel} />
      {marks}
      <path
        d={`M14 ${surface} H126`}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className="stroke-red-600"
      />
    </>
  );
};

const bourdon: Glyph = ({ p, v }) => (
  <>
    <circle cx="110" cy="110" r="100" strokeWidth="5" className={tone.steel} />
    <circle
      cx="110"
      cy="110"
      r="90"
      strokeWidth="1"
      className="fill-white stroke-slate-300 dark:fill-slate-200"
    />
    <path
      d="M60 84 A64 64 0 0 1 160 84"
      fill="none"
      strokeWidth="6"
      className="stroke-slate-200"
    />
    <Dial
      cx={110}
      cy={110}
      r={80}
      min={0}
      max={600}
      value={v("shown")}
      major={100}
      minor={20}
      start={-130}
      end={130}
      unit="kPa"
    />
    <rect
      x="98"
      y="206"
      width="24"
      height="24"
      rx="3"
      className={tone.brass}
      strokeWidth="1.5"
    />
    {p("vent") === 1 ? (
      <Label x={110} y={246} size={10}>
        open to air
      </Label>
    ) : (
      <path d="M110 230 V248" strokeWidth="5" className={ink} />
    )}
  </>
);

export const fluidsGlyphs: Record<FluidsKind, Glyph> = {
  "u-tube-manometer": manometer,
  "mercury-barometer": mercury,
  "aneroid-barometer": aneroid,
  "hydraulic-press": press,
  "pascals-vase": vase,
  hydrometer,
  "bourdon-gauge": bourdon,
};
