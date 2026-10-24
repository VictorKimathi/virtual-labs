import { tickerDots } from "../../data/catalogue/mechanics";
import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Arrow, HScale, Label, Spring } from "./shapes";
import { ink, inkFill, inkSoft, tone } from "./tones";

type MechanicsKind = (typeof sectionKinds.mechanics)[number];

const DEGREES = Math.PI / 180;

function extensionRuler(x: number, top: number, perMm: number, maxMm: number) {
  let d = `M${x} ${top} V${top + maxMm * perMm}`;
  const labels = [];
  for (let mm = 0; mm <= maxMm; mm += 10) {
    const y = top + mm * perMm;
    d += ` M${x} ${y} h${mm % 100 === 0 ? 12 : mm % 50 === 0 ? 9 : 5}`;
    if (mm % 100 === 0)
      labels.push(
        <text
          key={mm}
          x={x + 15}
          y={y + 3}
          fontSize="9"
          className={`${inkFill} font-bold`}
        >
          {mm / 10}
        </text>,
      );
  }
  return (
    <g>
      <path d={d} fill="none" strokeWidth="1" className={ink} />
      {labels}
    </g>
  );
}

const spring: Glyph = ({ p, v }) => {
  const natural = 110;
  const end = 16 + natural + Math.min(v("extension"), 600) * 0.4;
  const grams = p("load");
  return (
    <>
      <rect x="10" y="4" width="130" height="12" rx="3" className={tone.dark} />
      <Spring x={60} top={16} bottom={end} coils={10} width={14} />
      {grams > 0 && (
        <>
          <path
            d={`M60 ${end} V${end + 12}`}
            strokeWidth="2"
            className={ink}
            fill="none"
          />
          <rect
            x={60 - 18}
            y={end + 12}
            width="36"
            height={12 + grams / 14}
            rx="3"
            strokeWidth="1.5"
            className={tone.brass}
          />
          <Label x={60} y={end + 30 + grams / 14} size={10}>
            {grams} g
          </Label>
        </>
      )}
      <g transform="translate(86 0)">
        {extensionRuler(8, 16 + natural, 0.4, 600)}
      </g>
      <path
        d={`M60 ${end} H94`}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        className="stroke-red-600 dark:stroke-red-400"
      />
      <Label x={120} y={16 + natural - 6} size={10}>
        cm
      </Label>
    </>
  );
};

const slotted: Glyph = ({ p }) => {
  const widths = [40, 52, 64, 78];
  const width = widths[p("size")];
  return (
    <>
      {Array.from({ length: p("count") }, (_, i) => (
        <g key={i}>
          <rect
            x={65 - width / 2}
            y={170 - (i + 1) * 15}
            width={width}
            height="13"
            rx="2"
            strokeWidth="1.5"
            className={tone.brass}
          />
          <path
            d={`M65 ${170 - (i + 1) * 15} v8`}
            strokeWidth="2"
            className={tone.dark}
          />
        </g>
      ))}
      <Label x={65} y={186} size={11}>
        {[10, 50, 100, 200][p("size")]} g × {p("count")}
      </Label>
    </>
  );
};

const hanger: Glyph = ({ p }) => (
  <>
    <path d="M45 4 V30" strokeWidth="3" fill="none" className={ink} />
    <circle cx="45" cy="8" r="5" strokeWidth="2" fill="none" className={ink} />
    <rect x="42" y="30" width="6" height="110" className={tone.steel} />
    <rect x="12" y="140" width="66" height="8" rx="2" className={tone.steel} />
    {Array.from({ length: p("slots") }, (_, i) => (
      <rect
        key={i}
        x="14"
        y={126 - i * 13}
        width="62"
        height="12"
        rx="2"
        strokeWidth="1.5"
        className={tone.brass}
      />
    ))}
    <Label x={45} y={166} size={10}>
      {100 + 100 * p("slots")} g
    </Label>
  </>
);

const retort: Glyph = ({ p, v }) => {
  const tipping = v("tipping") === 1;
  const arm = 24 + v("arm") * 3;
  const hang = 10 + p("load") / 60;
  return (
    <g transform={tipping ? "rotate(14 160 394)" : undefined}>
      <rect
        x="10"
        y="380"
        width="150"
        height="14"
        rx="3"
        className={tone.dark}
      />
      <rect x="36" y="30" width="8" height="350" className={tone.steel} />
      <rect
        x="28"
        y="136"
        width="24"
        height="22"
        rx="3"
        className={tone.brass}
        strokeWidth="1.5"
      />
      <rect
        x="44"
        y="140"
        width={arm}
        height="6"
        rx="2"
        className={tone.steel}
      />
      <path
        d={`M${44 + arm} 146 V${190}`}
        strokeWidth="1.5"
        className={ink}
        fill="none"
      />
      <rect
        x={44 + arm - hang / 2}
        y="190"
        width={hang}
        height={hang}
        rx="2"
        strokeWidth="1.5"
        className={tone.copper}
      />
      <Label x={44 + arm} y={206 + hang} size={10}>
        {p("load")} g
      </Label>
    </g>
  );
};

const clamp: Glyph = ({ p, v }) => {
  const grip = v("grip");
  const gap = Math.max(0, (10 - grip) * 1.1);
  const glass = p("holding") !== 2;
  const cracked = glass && grip > 7;
  const widths = [26, 10, 12];
  const width = widths[p("holding")];
  return (
    <>
      <rect
        x="10"
        y="24"
        width="44"
        height="44"
        rx="4"
        className={tone.brass}
        strokeWidth="1.5"
      />
      <rect x="54" y="38" width="62" height="7" rx="2" className={tone.steel} />
      <rect
        x="54"
        y={45 + gap}
        width="62"
        height="7"
        rx="2"
        className={tone.steel}
      />
      <circle cx="40" cy="46" r="8" className={tone.dark} />
      <path
        d="M40 46 v-8"
        strokeWidth="2"
        transform={`rotate(${grip * 36} 40 46)`}
        className="stroke-white"
      />
      <rect
        x={96 - width / 2}
        y={grip < 3 ? 12 : 6}
        width={width}
        height="98"
        rx="4"
        strokeWidth="2"
        className={glass ? tone.glass : tone.steel}
      />
      {cracked && (
        <path
          d="M90 36 L100 48 L92 56 L102 66"
          fill="none"
          strokeWidth="2"
          className="stroke-red-600"
        />
      )}
    </>
  );
};

const singlePulley: Glyph = ({ p }) => {
  const block = 20 + p("load") / 3;
  return (
    <>
      <rect x="30" y="4" width="90" height="10" rx="3" className={tone.dark} />
      <path d="M75 14 V40" strokeWidth="3" className={ink} fill="none" />
      <circle cx="75" cy="70" r="34" strokeWidth="3" className={tone.metal} />
      <circle cx="75" cy="70" r="6" className={tone.dark} />
      <path
        d="M41 70 V200 M109 70 V230"
        strokeWidth="2.5"
        fill="none"
        className="stroke-amber-700 dark:stroke-amber-400"
      />
      <rect
        x={41 - block / 2}
        y="200"
        width={block}
        height={block}
        rx="3"
        strokeWidth="1.5"
        className={tone.copper}
      />
      <Label x={41} y={224 + block} size={10}>
        load {p("load")} N
      </Label>
      <Arrow x1={109} y1={232} x2={109} y2={268} />
    </>
  );
};

const blockTackle: Glyph = ({ v, p }) => {
  const strings = v("strings");
  const top = Math.ceil(strings / 2);
  const bottom = Math.floor(strings / 2);
  const xs = Array.from(
    { length: strings },
    (_, i) => 40 + (i * 90) / Math.max(1, strings - 1),
  );
  return (
    <>
      <rect x="20" y="4" width="130" height="14" rx="3" className={tone.dark} />
      {Array.from({ length: top }, (_, i) => (
        <circle
          key={`t${i}`}
          cx={40 + i * 40}
          cy="40"
          r="14"
          strokeWidth="2"
          className={tone.metal}
        />
      ))}
      <rect
        x="30"
        y="236"
        width="120"
        height="14"
        rx="3"
        className={tone.steel}
      />
      {Array.from({ length: bottom }, (_, i) => (
        <circle
          key={`b${i}`}
          cx={60 + i * 40}
          cy="224"
          r="14"
          strokeWidth="2"
          className={tone.metal}
        />
      ))}
      {xs.map((x, i) => (
        <path
          key={i}
          d={`M${x} 40 V${i % 2 === 0 ? 224 : 236}`}
          strokeWidth="1.5"
          className="stroke-amber-700 dark:stroke-amber-400"
          fill="none"
        />
      ))}
      <path d="M90 250 V280" strokeWidth="2" className={ink} fill="none" />
      <rect
        x="62"
        y="280"
        width="56"
        height="44"
        rx="4"
        strokeWidth="1.5"
        className={tone.copper}
      />
      <Label x={90} y={346} size={10}>
        load {p("load")} N · VR {strings}
      </Label>
      <Arrow
        x1={xs[strings - 1] + 6}
        y1={60}
        x2={xs[strings - 1] + 6}
        y2={120}
      />
    </>
  );
};

const stringGlyph: Glyph = ({ v }) => {
  const snapped = v("snapped") === 1;
  return snapped ? (
    <>
      <path
        d="M8 50 q20 -14 40 0 t14 6 M80 54 q20 14 40 0"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-amber-700 dark:stroke-amber-400"
      />
      <path
        d="M62 56 l6 -8 M68 48 l-2 10"
        strokeWidth="1.5"
        className="stroke-amber-700"
      />
      <Label x={65} y={84} size={11}>
        snapped
      </Label>
    </>
  ) : (
    <path
      d="M8 50 q16 -16 32 0 t32 0 t32 0 t26 0"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      className="stroke-amber-700 dark:stroke-amber-400"
    />
  );
};

const incline: Glyph = ({ v }) => {
  const angle = v("angle");
  const theta = angle * DEGREES;
  const length = angle > 0 ? Math.min(400, 215 / Math.sin(theta)) : 400;
  const bottom = { x: 30, y: 250 };
  const top = {
    x: 30 + length * Math.cos(theta),
    y: 250 - length * Math.sin(theta),
  };
  const along = v("pos");
  const point = {
    x: top.x + (bottom.x - top.x) * along,
    y: top.y + (bottom.y - top.y) * along,
  };
  return (
    <>
      <path
        d={`M${bottom.x} ${bottom.y} L${top.x} ${top.y} V${bottom.y} Z`}
        strokeWidth="2"
        className={tone.wood}
      />
      <g
        transform={`translate(${point.x - 14 * Math.sin(theta)} ${point.y - 14 * Math.cos(theta)}) rotate(${-angle})`}
      >
        <rect
          x="-26"
          y="-12"
          width="52"
          height="20"
          rx="3"
          strokeWidth="1.5"
          className={tone.blue}
        />
        <circle cx="-14" cy="10" r="5" className={tone.dark} />
        <circle cx="14" cy="10" r="5" className={tone.dark} />
      </g>
      <path
        d={`M${bottom.x + 60} ${bottom.y} A60 60 0 0 0 ${bottom.x + 60 * Math.cos(theta)} ${bottom.y - 60 * Math.sin(theta)}`}
        fill="none"
        strokeWidth="1.5"
        className={ink}
      />
      <Label x={bottom.x + 78} y={bottom.y - 6} anchor="start" size={12}>
        {angle}°
      </Label>
      <Label x={top.x + 12} y={bottom.y + 18} size={10}>
        1.0 m
      </Label>
    </>
  );
};

const trolley: Glyph = ({ p, v }) => {
  const pos = v("pos");
  const left = 20 + pos * 230;
  return (
    <>
      <rect
        x="10"
        y="108"
        width="330"
        height="8"
        rx="2"
        className={tone.dark}
      />
      <rect
        x={left}
        y="66"
        width="80"
        height="34"
        rx="4"
        strokeWidth="1.5"
        className={tone.blue}
      />
      <circle cx={left + 16} cy="104" r="6" className={tone.dark} />
      <circle cx={left + 64} cy="104" r="6" className={tone.dark} />
      <Label x={left + 40} y={88} size={10}>
        {fixedMass(p("mass"))} kg
      </Label>
      <path
        d={`M${left + 80} 84 H362 V${112 + pos * 30}`}
        fill="none"
        strokeWidth="1.5"
        className={ink}
      />
      <circle cx="362" cy="84" r="9" strokeWidth="2" className={tone.metal} />
      <rect
        x="350"
        y={112 + pos * 30}
        width="24"
        height={14 + p("hang") / 30}
        rx="3"
        strokeWidth="1.5"
        className={tone.copper}
      />
      <Label x={362} y={142 + pos * 30 + p("hang") / 30} size={10}>
        {p("hang")} g
      </Label>
    </>
  );
};

function fixedMass(value: number) {
  return value.toFixed(1);
}

const runway: Glyph = ({ p, v }) => {
  const tilt = v("angle") * 3;
  const state = v("state");
  return (
    <>
      <g transform={`rotate(${tilt} 20 150)`}>
        <rect
          x="20"
          y="150"
          width="420"
          height="12"
          rx="3"
          className={tone.wood}
          strokeWidth="1.5"
        />
        <g transform="translate(70 118)">
          <rect
            x="0"
            y="0"
            width="70"
            height="26"
            rx="4"
            strokeWidth="1.5"
            className={tone.blue}
          />
          <circle cx="14" cy="28" r="5" className={tone.dark} />
          <circle cx="56" cy="28" r="5" className={tone.dark} />
        </g>
        <HScale
          x={30}
          y={162}
          from={0}
          to={100}
          perUnit={4}
          minor={10}
          major={50}
          labelEvery={1}
          format={(n) => `${n} cm`}
        />
      </g>
      <path d="M20 168 L20 198" strokeWidth="6" className={tone.steel} />
      <Label x={380} y={40} size={12}>
        {p("hint") === 1
          ? ["slows down", "constant speed", "speeds up"][state + 1]
          : `${v("angle").toFixed(1)}°`}
      </Label>
    </>
  );
};

function tape(
  width: number,
  perCm: number,
  motion: number,
  x0: number,
  y: number,
) {
  const dots = tickerDots(motion);
  const end = x0 + dots[20] * perCm;
  return (
    <>
      <rect
        x={x0 - 14}
        y={y}
        width={width - x0 + 6}
        height="26"
        rx="2"
        className="fill-amber-100 stroke-amber-300 dark:fill-amber-200"
        strokeWidth="1"
      />
      {dots.map((cm, n) => (
        <circle
          key={n}
          cx={x0 + cm * perCm}
          cy={y + 13}
          r="2.6"
          className="fill-slate-900"
        />
      ))}
      <HScale
        x={x0}
        y={y + 34}
        from={0}
        to={Math.ceil(dots[20])}
        perUnit={perCm}
        minor={1}
        mid={5}
        major={5}
        format={(n) => `${n}`}
      />
      <Label x={end} y={y + 62} size={10}>
        cm
      </Label>
    </>
  );
}

const tickerTimer: Glyph = ({ v, still }) => (
  <>
    <rect
      x="330"
      y="10"
      width="76"
      height="106"
      rx="6"
      strokeWidth="2"
      className={tone.dark}
    />
    <rect x="340" y="20" width="56" height="30" rx="3" className={tone.light} />
    <g>
      <rect x="352" y="56" width="6" height="44" className={tone.steel} />
      {!still && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-4 355 100;4 355 100;-4 355 100"
          dur="0.12s"
          repeatCount="indefinite"
        />
      )}
    </g>
    <circle cx="355" cy="102" r="5" className="fill-red-600" />
    {tape(330, 7, v("motion"), 40, 108)}
    <Label x={368} y={134} size={10}>
      50 Hz
    </Label>
  </>
);

const tickerTape: Glyph = ({ v }) => <>{tape(460, 8, v("motion"), 40, 30)}</>;

const pendulum: Glyph = ({ v, still }) => {
  const length = v("length") * 2.2;
  const amp = v("amp");
  const period = v("period");
  return (
    <>
      <rect x="40" y="4" width="140" height="10" rx="3" className={tone.dark} />
      <path
        d={`M110 16 L${110 - Math.sin(amp * DEGREES) * (length + 14)} ${16 + Math.cos(amp * DEGREES) * (length + 14)} M110 16 L${110 + Math.sin(amp * DEGREES) * (length + 14)} ${16 + Math.cos(amp * DEGREES) * (length + 14)}`}
        fill="none"
        strokeWidth="1"
        strokeDasharray="4 4"
        className={inkSoft}
      />
      <g transform={`rotate(${amp} 110 16)`}>
        {!still && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`${amp} 110 16;${-amp} 110 16;${amp} 110 16`}
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.37 0 0.63 1;0.37 0 0.63 1"
            dur={`${period}s`}
            repeatCount="indefinite"
          />
        )}
        <path
          d={`M110 16 V${16 + length}`}
          strokeWidth="1.5"
          className={ink}
          fill="none"
        />
        <circle
          cx="110"
          cy={16 + length + 14}
          r="14"
          strokeWidth="2"
          className={tone.brass}
        />
      </g>
      <Label x={110} y={350} size={10}>
        L = {v("length")} cm · T = {period.toFixed(2)} s
      </Label>
    </>
  );
};

const knifeEdge: Glyph = ({ p, v }) => {
  const perCm = 5.2;
  const pivot = 20 + p("pivot") * perCm;
  const mass = (grams: number, cm: number, tag: string) => {
    const x = pivot + cm * perCm;
    const size = 12 + Math.sqrt(grams) * 1.1;
    return (
      <g>
        <path
          d={`M${x} 86 V108`}
          strokeWidth="1.5"
          className={ink}
          fill="none"
        />
        <rect
          x={x - size / 2}
          y="108"
          width={size}
          height={size}
          rx="2"
          strokeWidth="1.5"
          className={tone.copper}
        />
        <Label x={x} y={124 + size} size={10}>
          {grams} g
        </Label>
        <Label x={x} y={68} size={10}>
          {tag}
        </Label>
      </g>
    );
  };
  return (
    <>
      <path
        d={`M${pivot - 16} 156 L${pivot + 16} 156 L${pivot} 92 Z`}
        strokeWidth="1.5"
        className={tone.steel}
      />
      <g transform={`rotate(${v("tilt")} ${pivot} 86)`}>
        <rect
          x="20"
          y="80"
          width="520"
          height="12"
          rx="2"
          strokeWidth="1.5"
          className={tone.wood}
        />
        <HScale
          x={20}
          y={80}
          from={0}
          to={100}
          perUnit={perCm}
          minor={1}
          mid={5}
          major={10}
          flip
          format={(n) => String(n)}
          size={9}
        />
        {mass(p("m1"), -p("d1"), `${p("d1")} cm`)}
        {mass(p("m2"), p("d2"), `${p("d2")} cm`)}
      </g>
    </>
  );
};

const lever: Glyph = ({ p }) => {
  const scale = 3.2;
  const cls = p("class");
  const clampX = (x: number) => Math.max(24, Math.min(496, x));
  const fulcrum = cls === 0 ? 190 : 24;
  const loadX = clampX(
    cls === 0 ? fulcrum - p("loadArm") * scale : fulcrum + p("loadArm") * scale,
  );
  const effortX = clampX(fulcrum + p("effortArm") * scale);
  return (
    <>
      <path
        d={`M${fulcrum - 22} 152 L${fulcrum + 22} 152 L${fulcrum} 114 Z`}
        strokeWidth="1.5"
        className={tone.steel}
      />
      <rect
        x="14"
        y="102"
        width="492"
        height="12"
        rx="3"
        strokeWidth="1.5"
        className={tone.wood}
      />
      <Arrow x1={loadX} y1={50} x2={loadX} y2={100} />
      <Label x={loadX} y={42} size={11}>
        Load
      </Label>
      {cls === 0 ? (
        <>
          <Arrow
            x1={effortX}
            y1={50}
            x2={effortX}
            y2={100}
            className="stroke-blue-600 dark:stroke-blue-400"
          />
          <Label x={effortX} y={42} size={11}>
            Effort
          </Label>
        </>
      ) : (
        <>
          <Arrow
            x1={effortX}
            y1={176}
            x2={effortX}
            y2={118}
            className="stroke-blue-600 dark:stroke-blue-400"
          />
          <Label x={effortX} y={194} size={11}>
            Effort
          </Label>
        </>
      )}
      <Label x={fulcrum} y={172} size={11}>
        Fulcrum
      </Label>
    </>
  );
};

const wheelAxle: Glyph = ({ p }) => {
  const radius = p("wheel") * 4;
  const axle = p("axle") * 4;
  const cx = 130;
  const cy = 130;
  const block = 20 + p("load") / 3;
  return (
    <>
      <rect x="110" y="6" width="40" height="10" className={tone.dark} />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        strokeWidth="3"
        className={tone.wood}
      />
      <circle cx={cx} cy={cy} r={axle} strokeWidth="2" className={tone.steel} />
      <circle cx={cx} cy={cy} r="4" className={tone.dark} />
      <path
        d={`M${cx - radius} ${cy} V${cy + 130}`}
        strokeWidth="2"
        className="stroke-blue-600 dark:stroke-blue-400"
        fill="none"
      />
      <Arrow
        x1={cx - radius}
        y1={cy + 100}
        x2={cx - radius}
        y2={cy + 150}
        className="stroke-blue-600 dark:stroke-blue-400"
      />
      <path
        d={`M${cx + axle} ${cy} V${cy + 100}`}
        strokeWidth="2"
        className="stroke-amber-700 dark:stroke-amber-400"
        fill="none"
      />
      <rect
        x={cx + axle - block / 2}
        y={cy + 100}
        width={block}
        height={block}
        rx="3"
        strokeWidth="1.5"
        className={tone.copper}
      />
      <Label x={cx + axle} y={cy + 124 + block} size={10}>
        load {p("load")} N
      </Label>
    </>
  );
};

const hooke: Glyph = ({ p, v }) => {
  const pointer = v("pointer");
  const end = 40 + pointer * 0.4;
  const grams = p("load");
  return (
    <>
      <rect
        x="30"
        y="438"
        width="170"
        height="14"
        rx="3"
        className={tone.dark}
      />
      <rect x="64" y="20" width="8" height="418" className={tone.steel} />
      <rect
        x="64"
        y="34"
        width="110"
        height="8"
        rx="2"
        className={tone.steel}
      />
      <Spring x={150} top={42} bottom={end} coils={12} width={13} />
      <path
        d={`M150 ${end} H206`}
        strokeWidth="2"
        className="stroke-red-600 dark:stroke-red-400"
      />
      <g transform="translate(206 0)">{extensionRuler(0, 40, 0.4, 720)}</g>
      <Label x={226} y={34} size={10}>
        mm
      </Label>
      {grams > 0 && (
        <>
          <path
            d={`M150 ${end} v10`}
            strokeWidth="2"
            className={ink}
            fill="none"
          />
          <rect
            x="130"
            y={end + 10}
            width="40"
            height={10 + grams / 14}
            rx="3"
            strokeWidth="1.5"
            className={tone.brass}
          />
          <Label x={150} y={end + 28 + grams / 14} size={10}>
            {grams} g
          </Label>
        </>
      )}
    </>
  );
};

function collisionDrawing(width: number, track: boolean) {
  const glyph: Glyph = ({ p, v }) => {
    const masses = [0.5, 1, 1.5];
    const arrow = (x: number, y: number, speed: number, tag: string) => (
      <>
        {Math.abs(speed) > 0.02 && (
          <Arrow
            x1={x}
            y1={y}
            x2={x + speed * 50}
            y2={y}
            className="stroke-blue-600 dark:stroke-blue-400"
          />
        )}
        <Label x={x} y={y - 10} size={10}>
          {tag} {speed.toFixed(2)} m/s
        </Label>
      </>
    );
    const body = (x: number, y: number, mass: number, name: string) => (
      <g>
        <rect
          x={x - 28}
          y={y}
          width="56"
          height="26"
          rx="4"
          strokeWidth="1.5"
          className={name === "A" ? tone.red : tone.blue}
        />
        <circle cx={x - 16} cy={y + 28} r="5" className={tone.dark} />
        <circle cx={x + 16} cy={y + 28} r="5" className={tone.dark} />
        <Label x={x} y={y + 17} size={10}>
          {name} {mass} kg
        </Label>
      </g>
    );
    const sticky = v("sticky") === 1;
    const m1 = masses[p("m1")];
    const m2 = masses[p("m2")];
    return (
      <>
        <rect
          x="10"
          y="68"
          width={width - 20}
          height="8"
          rx="2"
          className={tone.dark}
        />
        <rect
          x="10"
          y="168"
          width={width - 20}
          height="8"
          rx="2"
          className={tone.dark}
        />
        {track &&
          Array.from({ length: Math.floor((width - 40) / 18) }, (_, i) => (
            <g key={i}>
              <circle
                cx={24 + i * 18}
                cy="80"
                r="1.5"
                className={
                  p("blower") === 1 ? "fill-sky-400" : "fill-slate-400"
                }
              />
              <circle
                cx={24 + i * 18}
                cy="180"
                r="1.5"
                className={
                  p("blower") === 1 ? "fill-sky-400" : "fill-slate-400"
                }
              />
            </g>
          ))}
        <Label x={20} y={20} anchor="start" size={11}>
          Before
        </Label>
        {body(width * 0.25, 40, m1, "A")}
        {body(width * 0.7, 40, m2, "B")}
        {arrow(width * 0.25, 30, v("u1"), "u₁")}
        {arrow(width * 0.7, 30, v("u2"), "u₂")}
        <Label x={20} y={120} anchor="start" size={11}>
          After
        </Label>
        {sticky ? (
          <>
            {body(width * 0.4, 140, m1, "A")}
            {body(width * 0.4 + 58, 140, m2, "B")}
            {arrow(width * 0.4, 130, v("v1"), "v")}
          </>
        ) : (
          <>
            {body(width * 0.25, 140, m1, "A")}
            {body(width * 0.7, 140, m2, "B")}
            {arrow(width * 0.25, 130, v("v1"), "v₁")}
            {arrow(width * 0.7, 130, v("v2"), "v₂")}
          </>
        )}
      </>
    );
  };
  return glyph;
}

export const mechanicsGlyphs: Record<MechanicsKind, Glyph> = {
  spring,
  "slotted-masses": slotted,
  "mass-hanger": hanger,
  "retort-stand": retort,
  "clamp-boss": clamp,
  "single-pulley": singlePulley,
  "block-and-tackle": blockTackle,
  string: stringGlyph,
  "inclined-plane": incline,
  trolley,
  runway,
  "ticker-timer": tickerTimer,
  "ticker-tape": tickerTape,
  pendulum,
  "knife-edge": knifeEdge,
  lever,
  "wheel-axle": wheelAxle,
  "hooke-apparatus": hooke,
  "collision-trolleys": collisionDrawing(520, false),
  "air-track": collisionDrawing(560, true),
};
