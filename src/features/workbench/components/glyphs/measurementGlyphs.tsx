import { formatClock } from "../../data/catalogue/measurement";
import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import type { ReactNode } from "react";
import { Eye, HScale, Label, VScale } from "./shapes";
import { ink, inkFill, inkSoft, tone } from "./tones";

type MeasurementKind = (typeof sectionKinds.measurement)[number];

function rulerGlyph(width: number): Glyph {
  return ({ v }) => {
    const capacity = v("capacity");
    const perMm = (width - 24) / capacity;
    const minor = perMm >= 1.4 ? 1 : perMm >= 0.5 ? 5 : 10;
    const labelEvery = perMm * 10 >= 14 ? 1 : perMm * 10 >= 7 ? 5 : 10;
    const x0 = 12;
    const objectStart = x0 + v("start") * perMm;
    const objectEnd = x0 + v("end") * perMm;
    return (
      <>
        <rect
          x="0"
          y="4"
          width={width}
          height="36"
          rx="3"
          strokeWidth="1.5"
          className={tone.wood}
        />
        <HScale
          x={x0}
          y={4}
          from={0}
          to={capacity}
          perUnit={perMm}
          minor={minor}
          mid={minor === 1 ? 5 : undefined}
          major={10}
          labelEvery={labelEvery}
          format={(mm) => String(mm / 10)}
        />
        <rect
          x={objectStart}
          y="46"
          width={Math.max(2, objectEnd - objectStart)}
          height="14"
          rx="2"
          strokeWidth="1.5"
          className={tone.copper}
        />
        <path
          d={`M${objectStart} 4 V46 M${objectEnd} 4 V46`}
          strokeWidth="1"
          strokeDasharray="3 3"
          className={inkSoft}
        />
        <Label x={width - 14} y={34} anchor="end" size={10}>
          cm
        </Label>
      </>
    );
  };
}

const MAIN = 6;
const MAIN_X = 26;

const vernier: Glyph = ({ p, v }) => {
  const reading = v("reading");
  const jaw = MAIN_X + reading * MAIN;
  const whole = Math.floor(reading + 1e-9);
  const coincide = Math.round((reading - whole) * 10);
  return (
    <>
      <rect
        x={MAIN_X - 14}
        y="14"
        width="420"
        height="44"
        rx="3"
        strokeWidth="1.5"
        className={tone.metal}
      />
      <rect
        x={MAIN_X - 14}
        y="14"
        width="14"
        height="104"
        rx="2"
        strokeWidth="1.5"
        className={tone.steel}
      />
      <HScale
        x={MAIN_X}
        y={58}
        from={0}
        to={60}
        perUnit={MAIN}
        minor={1}
        mid={5}
        major={10}
        format={(mm) => String(mm / 10)}
        flip
      />
      <Label x={414} y={40} anchor="end" size={10}>
        cm
      </Label>
      {p("closed") === 0 && (
        <rect
          x={MAIN_X}
          y="78"
          width={Math.max(0, jaw - MAIN_X)}
          height="32"
          rx="8"
          strokeWidth="1.5"
          className={tone.copper}
        />
      )}
      <rect
        x={jaw}
        y="58"
        width="14"
        height="60"
        rx="2"
        strokeWidth="1.5"
        className={tone.steel}
      />
      <rect
        x={jaw - 8}
        y="58"
        width="74"
        height="40"
        rx="3"
        strokeWidth="1.5"
        className={tone.light}
      />
      {Array.from({ length: 11 }, (_, j) => (
        <g key={j}>
          <path
            d={`M${jaw + j * 5.4} 58 V${j % 5 === 0 ? 74 : 68}`}
            strokeWidth={j === coincide ? 3 : 1}
            className={
              j === coincide ? "stroke-red-600 dark:stroke-red-400" : ink
            }
          />
          {j % 5 === 0 && (
            <text
              x={jaw + j * 5.4}
              y={86}
              textAnchor="middle"
              fontSize="9"
              className={`${inkFill} font-bold`}
            >
              {j}
            </text>
          )}
        </g>
      ))}
      <Label x={MAIN_X + 180} y={134} size={11}>
        {p("closed") === 1 ? "jaws closed" : ""}
      </Label>
    </>
  );
};

const SCALE = 8;
const ANVIL = 60;
const SLEEVE = 140;
const DATUM = 85;

const micrometer: Glyph = ({ p, v }) => {
  const reading = v("reading");
  const edge = SLEEVE + reading * SCALE;
  const sleeveReading = Math.floor((reading + 1e-9) / 0.5) * 0.5;
  const thimble = Math.round((reading - sleeveReading) * 100);
  const marks: number[] = [];
  for (let n = thimble - 8; n <= thimble + 8; n++) marks.push(n);
  return (
    <>
      <path
        d={`M${ANVIL - 10} 100 V22 H${SLEEVE + 10} V55`}
        fill="none"
        strokeWidth="14"
        strokeLinejoin="round"
        className="stroke-slate-500 dark:stroke-slate-400"
      />
      <rect
        x={ANVIL - 10}
        y="70"
        width="10"
        height="30"
        className={tone.steel}
      />
      <rect
        x={SLEEVE}
        y="52"
        width={Math.max(10, edge - SLEEVE + 4)}
        height="66"
        rx="3"
        strokeWidth="1.5"
        className={tone.metal}
      />
      <path
        d={`M${SLEEVE - 6} ${DATUM} H${Math.max(SLEEVE, edge)}`}
        strokeWidth="1.5"
        className={ink}
      />
      {Array.from({ length: 26 }, (_, i) => i)
        .filter((i) => SLEEVE + i * SCALE <= edge)
        .map((i) => (
          <g key={i}>
            <path
              d={`M${SLEEVE + i * SCALE} ${DATUM} v-${i % 5 === 0 ? 20 : 13} M${SLEEVE + (i + 0.5) * SCALE} ${DATUM} v12`}
              strokeWidth="1"
              className={ink}
            />
            {i % 5 === 0 && (
              <text
                x={SLEEVE + i * SCALE}
                y={DATUM - 24}
                textAnchor="middle"
                fontSize="9"
                className={`${inkFill} font-bold`}
              >
                {i}
              </text>
            )}
          </g>
        ))}
      <rect
        x={ANVIL}
        y="81"
        width={Math.max(0, SLEEVE - ANVIL + reading * SCALE)}
        height="8"
        className={tone.steel}
      />
      {p("closed") === 0 && (
        <rect
          x={ANVIL}
          y="68"
          width={Math.max(0, reading * SCALE)}
          height="34"
          rx="6"
          strokeWidth="1.5"
          className={tone.copper}
        />
      )}
      <rect
        x={edge}
        y="42"
        width="96"
        height="86"
        rx="6"
        strokeWidth="1.5"
        className={tone.light}
      />
      <rect
        x={edge + 96}
        y="56"
        width="42"
        height="58"
        rx="10"
        strokeWidth="1.5"
        className={tone.dark}
      />
      <path
        d={`M${edge} ${DATUM} H${edge + 18}`}
        strokeWidth="2"
        className="stroke-red-600 dark:stroke-red-400"
      />
      {marks.map((n) => {
        const y = DATUM + (n - thimble) * 5;
        if (y < 48 || y > 124) return null;
        const label = ((n % 50) + 50) % 50;
        return (
          <g key={n}>
            <path
              d={`M${edge} ${y} h${label % 5 === 0 ? 16 : 10}`}
              strokeWidth="1"
              className={ink}
            />
            {label % 5 === 0 && (
              <text
                x={edge + 20}
                y={y + 3}
                fontSize="9"
                className={`${inkFill} font-bold`}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
      <Label x={ANVIL + 100} y={156} size={11}>
        {p("turn") === 1 ? "ratchet" : "thimble"}
      </Label>
    </>
  );
};

const stopwatch: Glyph = ({ v }) => {
  const elapsed = v("elapsed");
  const seconds = (elapsed / 1000) % 60;
  const hand = seconds * 6;
  const progress = v("progress");
  return (
    <>
      <rect x="82" y="2" width="26" height="18" rx="4" className={tone.steel} />
      <rect
        x="140"
        y="22"
        width="16"
        height="12"
        rx="3"
        transform="rotate(40 148 28)"
        className={tone.steel}
      />
      <circle cx="95" cy="92" r="70" strokeWidth="4" className={tone.metal} />
      <circle
        cx="95"
        cy="92"
        r="60"
        strokeWidth="1"
        className="fill-white stroke-slate-300 dark:fill-slate-200"
      />
      {Array.from({ length: 60 }, (_, i) => (
        <path
          key={i}
          d={`M95 ${34 + (i % 5 === 0 ? 0 : 3)} v${i % 5 === 0 ? 9 : 5}`}
          strokeWidth={i % 5 === 0 ? 2 : 1}
          transform={`rotate(${i * 6} 95 92)`}
          className="stroke-slate-700"
        />
      ))}
      <rect
        x="55"
        y="104"
        width="80"
        height="28"
        rx="4"
        className={tone.screen}
      />
      <text
        x="95"
        y="124"
        textAnchor="middle"
        fontSize="16"
        className="fill-green-400 font-mono font-bold"
      >
        {formatClock(elapsed)}
      </text>
      <path
        d="M95 92 V40"
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${hand} 95 92)`}
        className="stroke-red-600"
      />
      <circle cx="95" cy="92" r="4" className="fill-slate-700" />
      <rect
        x="6"
        y="176"
        width="178"
        height="28"
        rx="6"
        className={tone.light}
        strokeWidth="1"
      />
      <circle
        cx={18 + progress * 154}
        cy="190"
        r="9"
        className={tone.red}
        strokeWidth="1.5"
      />
      <Label x={95} y={172} size={10}>
        event
      </Label>
    </>
  );
};

const meniscusEye = (x: number, surface: number, eye: number) => (
  <Eye x={x} y={surface - eye} aimX={x - 22} aimY={surface} />
);

const cylinder: Glyph = ({ v, p }) => {
  const surface = 296 - v("volume") * 2.6;
  return (
    <>
      <ellipse
        cx="58"
        cy="304"
        rx="42"
        ry="10"
        className={tone.metal}
        strokeWidth="1.5"
      />
      <rect
        x="38"
        y="20"
        width="40"
        height="282"
        rx="4"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d={`M38 ${surface - 3} Q58 ${surface + 6} 78 ${surface - 3} V300 H38 Z`}
        className={tone.liquid}
        strokeWidth="1"
      />
      <VScale
        x={38}
        y={296}
        from={0}
        to={100}
        perUnit={2.6}
        minor={1}
        mid={5}
        major={10}
        flip
      />
      <Label x={58} y={14} size={10}>
        mL
      </Label>
      {meniscusEye(100, surface, p("eye"))}
    </>
  );
};

const burette: Glyph = ({ v, p }) => {
  const level = v("level");
  const surface = 30 + level * 5.2;
  let ticks = "";
  const labels = [];
  for (let i = 0; i <= 50; i++) {
    const y = 30 + i * 5.2;
    ticks += `M36 ${y} h${i % 5 === 0 ? -14 : -7} `;
    if (i % 5 === 0)
      labels.push(
        <text
          key={i}
          x={19}
          y={y + 3}
          textAnchor="end"
          fontSize="9"
          className={`${inkFill} font-bold`}
        >
          {i}
        </text>,
      );
  }
  return (
    <>
      <rect
        x="36"
        y="14"
        width="26"
        height="284"
        rx="3"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d={`M36 ${surface - 3} Q49 ${surface + 5} 62 ${surface - 3} V296 H36 Z`}
        className={tone.liquid}
        strokeWidth="1"
      />
      <path d={ticks} fill="none" strokeWidth="1" className={ink} />
      {labels}
      <rect x="40" y="298" width="18" height="12" className={tone.steel} />
      <rect x="66" y="299" width="26" height="8" rx="3" className={tone.blue} />
      <path
        d="M44 310 L49 336 L54 310 Z"
        strokeWidth="1.5"
        className={tone.glass}
      />
      <Eye x={84} y={surface - p("eye") - 12} aimX={64} aimY={surface} />
    </>
  );
};

const pipette: Glyph = ({ v }) => {
  const mark = 70;
  const surface = mark - v("fill") * 4;
  return (
    <>
      <path
        d={`M26 10 V112 M34 10 V112`}
        fill="none"
        strokeWidth="2"
        className={ink}
      />
      <ellipse
        cx="30"
        cy="150"
        rx="20"
        ry="38"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d="M26 188 V300 L30 326 L34 300 V188"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="26"
        y={surface}
        width="8"
        height={112 - surface}
        className={tone.liquid}
      />
      <ellipse cx="30" cy="150" rx="18" ry="36" className={tone.liquid} />
      <rect x="26" y="188" width="8" height="112" className={tone.liquid} />
      <path
        d="M12 70 H48"
        strokeWidth="2"
        className="stroke-red-600 dark:stroke-red-400"
      />
      <Label x={52} y={74} anchor="start" size={10}>
        25 mL
      </Label>
    </>
  );
};

const beaker: Glyph = ({ v }) => {
  const level = 160 - v("volume") * 0.48;
  return (
    <>
      <path
        d="M20 30 V158 Q20 166 28 166 H112 Q120 166 120 158 V30 M14 26 L20 30"
        fill="none"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d={`M21 ${level} H119 V158 Q119 165 112 165 H28 Q21 165 21 158 Z`}
        className={tone.liquid}
        strokeWidth="0"
      />
      {[50, 100, 150, 200, 250].map((mark) => (
        <g key={mark}>
          <path
            d={`M100 ${160 - mark * 0.48} h16`}
            strokeWidth="1.5"
            className={ink}
          />
          <text
            x={96}
            y={163 - mark * 0.48}
            textAnchor="end"
            fontSize="9"
            className={`${inkFill} font-bold`}
          >
            {mark}
          </text>
        </g>
      ))}
    </>
  );
};

const eureka: Glyph = ({ p, v }) => {
  const level = v("primed") === 1 ? 84 : 104;
  const lowered = v("lowered") === 1;
  const collected = v("collected");
  const cup = 70;
  const cupWater = Math.min(cup, collected * 2);
  const floating = p("object") === 3;
  return (
    <>
      <rect
        x="20"
        y="64"
        width="120"
        height="140"
        rx="6"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d="M140 80 L186 98 V106 L140 92"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="21"
        y={level}
        width="118"
        height={203 - level}
        className={tone.liquid}
      />
      <path d="M140 84 L184 100" strokeWidth="2" className={tone.liquid} />
      <path d="M80 4 V40" strokeWidth="1.5" className={ink} fill="none" />
      <ellipse
        cx="80"
        cy={lowered ? (floating ? level + 6 : 150) : 52}
        rx="20"
        ry="14"
        strokeWidth="1.5"
        className={floating ? tone.wood : tone.steel}
      />
      <path
        d={`M80 40 V${lowered ? (floating ? level - 6 : 136) : 38}`}
        strokeWidth="1.5"
        fill="none"
        className={ink}
      />
      <rect
        x="176"
        y={210 - cup}
        width="34"
        height={cup}
        rx="3"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="177"
        y={209 - cupWater}
        width="32"
        height={cupWater}
        className={tone.liquid}
      />
      <Label x={193} y={226} size={11}>
        {collected} cm³
      </Label>
      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d={`M176 ${210 - i * 12} h6`}
          strokeWidth="1"
          className={ink}
        />
      ))}
    </>
  );
};

function pan(cx: number, cy: number, children?: ReactNode) {
  return (
    <g>
      <path
        d={`M${cx - 38} ${cy} Q${cx} ${cy + 18} ${cx + 38} ${cy}`}
        strokeWidth="2"
        className={tone.steel}
      />
      {children}
    </g>
  );
}

const beamBalance: Glyph = ({ p, v }) => {
  const angle = (-v("tilt") * Math.PI) / 180;
  const dx = 130 * Math.cos(angle);
  const dy = 130 * Math.sin(angle);
  const left = { x: 180 - dx, y: 58 - dy };
  const right = { x: 180 + dx, y: 58 + dy };
  const tip = { x: 180 - 70 * Math.sin(angle), y: 58 + 70 * Math.cos(angle) };
  const masses = Math.min(5, Math.ceil(p("masses") / 50));
  return (
    <>
      <rect
        x="110"
        y="186"
        width="140"
        height="16"
        rx="4"
        className={tone.dark}
      />
      <rect x="172" y="58" width="16" height="130" className={tone.steel} />
      <path
        d={`M${left.x} ${left.y} L${right.x} ${right.y}`}
        strokeWidth="8"
        strokeLinecap="round"
        className="stroke-slate-600 dark:stroke-slate-300"
      />
      <circle cx="180" cy="58" r="6" className={tone.brass} strokeWidth="1.5" />
      <path
        d={`M180 58 L${tip.x} ${tip.y}`}
        strokeWidth="2"
        className="stroke-red-600 dark:stroke-red-400"
      />
      <path
        d="M160 128 H200 M180 124 V132"
        strokeWidth="1.5"
        className={ink}
        fill="none"
      />
      {[-3, -2, -1, 1, 2, 3].map((k) => (
        <path
          key={k}
          d={`M${180 + k * 7} 126 v4`}
          strokeWidth="1"
          className={ink}
        />
      ))}
      <path
        d={`M${left.x - 30} ${left.y + 54} L${left.x} ${left.y} L${left.x + 30} ${left.y + 54} M${right.x - 30} ${right.y + 54} L${right.x} ${right.y} L${right.x + 30} ${right.y + 54}`}
        fill="none"
        strokeWidth="1"
        className={inkSoft}
      />
      {pan(
        left.x,
        left.y + 54,
        p("specimen") > 0 && (
          <ellipse
            cx={left.x}
            cy={left.y + 44}
            rx="20"
            ry="12"
            className={tone.copper}
            strokeWidth="1.5"
          />
        ),
      )}
      {pan(
        right.x,
        right.y + 54,
        Array.from({ length: masses }, (_, i) => (
          <rect
            key={i}
            x={right.x - 14 + i * 3}
            y={right.y + 44 - i * 9}
            width="28"
            height="8"
            rx="2"
            className={tone.brass}
            strokeWidth="1"
          />
        )),
      )}
    </>
  );
};

const tripleBeam: Glyph = ({ p, v }) => {
  const pointer = 112 - v("tilt") * 3;
  const rider = (row: number, value: number, range: number) => (
    <rect
      x={146 + (value / range) * 184}
      y={22 + row * 30}
      width="10"
      height="22"
      rx="2"
      className={tone.brass}
      strokeWidth="1.5"
    />
  );
  return (
    <>
      <rect
        x="20"
        y="172"
        width="340"
        height="18"
        rx="4"
        className={tone.dark}
      />
      <rect x="50" y="76" width="14" height="96" className={tone.steel} />
      <ellipse
        cx="57"
        cy="72"
        rx="46"
        ry="8"
        strokeWidth="2"
        className={tone.steel}
      />
      {p("specimen") > 0 && (
        <ellipse
          cx="57"
          cy="58"
          rx="20"
          ry="13"
          className={tone.copper}
          strokeWidth="1.5"
        />
      )}
      {[0, 1, 2].map((row) => (
        <rect
          key={row}
          x="140"
          y={42 + row * 30}
          width="200"
          height="6"
          className={tone.steel}
        />
      ))}
      {rider(0, p("hundreds"), 500)}
      {rider(1, p("tens"), 100)}
      {rider(2, p("ones"), 10)}
      <path d="M340 30 V132" strokeWidth="5" className="stroke-slate-500" />
      <path
        d={`M340 ${pointer} H372`}
        strokeWidth="3"
        className="stroke-red-600 dark:stroke-red-400"
      />
      <path d="M358 112 h14" strokeWidth="1.5" className={ink} />
      <Label x={190} y={150} size={10}>
        100 g · 10 g · 0.1 g
      </Label>
    </>
  );
};

const electronic: Glyph = ({ p, v }) => {
  const shown = v("shown");
  return (
    <>
      <rect
        x="14"
        y="112"
        width="222"
        height="66"
        rx="8"
        strokeWidth="2"
        className={tone.light}
      />
      <rect
        x="40"
        y="124"
        width="104"
        height="32"
        rx="4"
        className={tone.screen}
      />
      <text
        x="92"
        y="147"
        textAnchor="middle"
        fontSize="18"
        className="fill-green-400 font-mono font-bold"
      >
        {shown.toFixed(1)} g
      </text>
      <rect
        x="156"
        y="130"
        width="50"
        height="22"
        rx="5"
        strokeWidth="1.5"
        className={tone.blue}
      />
      <Label x={181} y={145} size={10}>
        TARE
      </Label>
      <rect x="125" y="94" width="14" height="18" className={tone.steel} />
      <rect
        x="64"
        y="84"
        width="136"
        height="12"
        rx="3"
        strokeWidth="1.5"
        className={tone.steel}
      />
      {p("container") === 1 && (
        <>
          <rect
            x="94"
            y="36"
            width="76"
            height="48"
            rx="4"
            strokeWidth="2"
            className={tone.glass}
          />
          {p("load") > 0 && (
            <rect x="95" y="62" width="74" height="21" className={tone.wood} />
          )}
        </>
      )}
      <circle
        cx="210"
        cy="168"
        r="9"
        strokeWidth="1.5"
        className={tone.glass}
      />
      <circle
        cx={p("level") === 1 ? 210 : 214}
        cy={p("level") === 1 ? 168 : 165}
        r="3"
        className="fill-green-500"
      />
    </>
  );
};

const springBalance: Glyph = ({ p, v }) => {
  const reading = Math.max(-0.2, Math.min(5.4, v("reading")));
  const grams = [0, 100, 200, 350, 500][p("load")];
  let ticks = "";
  const labels = [];
  for (let i = 0; i <= 50; i++) {
    const y = 48 + i * 8;
    ticks += `M85 ${y} h${i % 10 === 0 ? 14 : i % 5 === 0 ? 10 : 6} `;
    if (i % 10 === 0)
      labels.push(
        <text
          key={i}
          x={102}
          y={y + 3}
          fontSize="10"
          className={`${inkFill} font-bold`}
        >
          {i / 10}
        </text>,
      );
  }
  return (
    <>
      <path d="M60 4 V26" strokeWidth="3" fill="none" className={ink} />
      <circle
        cx="60"
        cy="8"
        r="6"
        strokeWidth="2"
        fill="none"
        className={ink}
      />
      <rect
        x="35"
        y="24"
        width="50"
        height="262"
        rx="8"
        strokeWidth="2"
        className={tone.light}
      />
      <path d={ticks} fill="none" strokeWidth="1" className={ink} />
      {labels}
      <path
        d={`M35 ${48 + reading * 80} h20`}
        strokeWidth="3"
        className="stroke-red-600 dark:stroke-red-400"
      />
      <Label x={60} y={300} size={10}>
        N
      </Label>
      {grams > 0 && (
        <>
          <path d="M60 286 V300" strokeWidth="2" className={ink} fill="none" />
          <rect
            x={60 - 14 - grams / 40}
            y="304"
            width={28 + grams / 20}
            height={14 + grams / 25}
            rx="3"
            strokeWidth="1.5"
            className={tone.copper}
          />
          <Label x={60} y={334} size={10}>
            {grams} g
          </Label>
        </>
      )}
    </>
  );
};

const densityBottle: Glyph = ({ v }) => (
  <>
    <path
      d="M26 56 Q10 76 10 110 V166 Q10 184 28 184 H82 Q100 184 100 166 V110 Q100 76 84 56 Z"
      strokeWidth="2"
      className={tone.glass}
    />
    {v("fill") === 1 && (
      <path
        d="M12 96 Q12 80 24 64 H86 Q98 80 98 96 V166 Q98 182 82 182 H28 Q12 182 12 166 Z"
        className={tone.liquid}
      />
    )}
    <rect
      x="34"
      y="12"
      width="42"
      height="48"
      rx="6"
      strokeWidth="2"
      className={tone.dark}
    />
    <path d="M55 12 V60" strokeWidth="2" className="stroke-white" />
    <rect
      x="22"
      y="110"
      width="66"
      height="30"
      rx="3"
      className="fill-white stroke-slate-300 dark:fill-slate-200"
    />
    <Label x={55} y={130} size={11}>
      50 cm³
    </Label>
  </>
);

export const measurementGlyphs: Record<MeasurementKind, Glyph> = {
  "metre-rule": rulerGlyph(660),
  "half-metre-rule": rulerGlyph(480),
  "ruler-30": rulerGlyph(480),
  "tape-measure": rulerGlyph(700),
  "vernier-callipers": vernier,
  micrometer,
  stopwatch,
  "measuring-cylinder": cylinder,
  burette,
  pipette,
  beaker,
  "eureka-can": eureka,
  "beam-balance": beamBalance,
  "triple-beam-balance": tripleBeam,
  "electronic-balance": electronic,
  "spring-balance": springBalance,
  "density-bottle": densityBottle,
};
