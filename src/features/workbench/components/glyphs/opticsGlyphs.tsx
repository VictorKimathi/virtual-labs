import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Arrow, HScale, Label } from "./shapes";
import { ink, inkSoft, opacityClass, rayStroke, tone } from "./tones";

type OpticsKind = (typeof sectionKinds.optics)[number];

const DEGREES = Math.PI / 180;
const AXIS = 110;
const OBJECT_HEIGHT = 36;

type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  faint?: boolean;
};

function drawLines(lines: Line[], map: (x: number) => number) {
  return lines.map((line, i) => (
    <path
      key={i}
      d={`M${map(line.x1)} ${line.y1} L${map(line.x2)} ${line.y2}`}
      fill="none"
      strokeWidth="1.8"
      strokeDasharray={line.dashed ? "5 4" : undefined}
      className={`${rayStroke} ${line.faint ? opacityClass(0.4) : ""}`}
    />
  ));
}

/** Principal-ray diagram for a thin lens, or a mirror drawn "unfolded" about its surface. */
function curved(kind: "lens" | "mirror"): Glyph {
  return ({ part, v }) => {
    const mirror = kind === "mirror";
    const clipId = `rays-${part.id}`;
    const S = mirror ? 300 : 230;
    const width = 460;
    const s = 4;
    const f = v("f");
    const u = v("u");
    const atFocus = v("v") >= 1e3;
    const imageDistance = v("v");
    const m = v("m");
    const objectX = S - u * s;
    const tipY = AXIS - OBJECT_HEIGHT;
    const endX = mirror ? 2 * S - 10 : width - 10;
    const map = (x: number) => (mirror ? 2 * S - x : x);
    const lines: Line[] = [
      { x1: objectX, y1: tipY, x2: S, y2: tipY },
      { x1: objectX, y1: tipY, x2: S, y2: AXIS },
    ];
    const direction = { x: Math.abs(f) * s, y: Math.sign(f) * OBJECT_HEIGHT };
    const through = { x: S - objectX, y: AXIS - tipY };
    const reach = (dx: number, x0: number) => (endX - x0) / dx;
    const tA = reach(direction.x, S);
    const tB = reach(through.x, S);
    const afterA = { x: S + direction.x * tA, y: tipY + direction.y * tA };
    const afterB = { x: S + through.x * tB, y: AXIS + through.y * tB };
    const imageX = S + imageDistance * s;
    const imageY = AXIS - m * OBJECT_HEIGHT;
    const real = !atFocus && imageDistance > 0;
    if (atFocus) {
      lines.push({ x1: S, y1: tipY, x2: afterA.x, y2: afterA.y });
      lines.push({ x1: S, y1: AXIS, x2: afterB.x, y2: afterB.y });
    } else if (real) {
      lines.push({ x1: S, y1: tipY, x2: imageX, y2: imageY });
      lines.push({ x1: S, y1: AXIS, x2: imageX, y2: imageY });
      lines.push({
        x1: imageX,
        y1: imageY,
        x2: afterA.x,
        y2: afterA.y,
        faint: true,
      });
      lines.push({
        x1: imageX,
        y1: imageY,
        x2: afterB.x,
        y2: afterB.y,
        faint: true,
      });
    } else {
      lines.push({ x1: S, y1: tipY, x2: afterA.x, y2: afterA.y });
      lines.push({ x1: S, y1: AXIS, x2: afterB.x, y2: afterB.y });
      lines.push({ x1: S, y1: tipY, x2: imageX, y2: imageY, dashed: true });
      lines.push({ x1: S, y1: AXIS, x2: imageX, y2: imageY, dashed: true });
    }
    const imageVisible = !atFocus && map(imageX) > 4 && map(imageX) < width - 4;
    const focusAt = mirror ? S - f * s : S + f * s;
    const focusMarks = mirror
      ? [focusAt]
      : [S - Math.abs(f) * s, S + Math.abs(f) * s];
    return (
      <>
        <path
          d={`M8 ${AXIS} H${width - 8}`}
          strokeWidth="1"
          className={inkSoft}
        />
        {mirror ? (
          <>
            <path
              d={`M${S} 40 Q${S + (f > 0 ? 18 : -18)} ${AXIS} ${S} 180`}
              fill="none"
              strokeWidth="5"
              className="stroke-slate-500 dark:stroke-slate-300"
            />
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                d={`M${S + (f > 0 ? 10 : -2)} ${48 + i * 16} l8 8`}
                strokeWidth="1"
                className={inkSoft}
              />
            ))}
          </>
        ) : (
          <path
            d={
              f > 0
                ? `M${S} 40 Q${S + 22} ${AXIS} ${S} 180 Q${S - 22} ${AXIS} ${S} 40 Z`
                : `M${S - 14} 40 H${S + 14} Q${S} ${AXIS} ${S + 14} 180 H${S - 14} Q${S} ${AXIS} ${S - 14} 40 Z`
            }
            strokeWidth="2"
            className={tone.glass}
          />
        )}
        {focusMarks.map((x, i) => (
          <g key={i}>
            <path
              d={`M${x} ${AXIS - 5} V${AXIS + 5}`}
              strokeWidth="2"
              className={ink}
            />
            <Label x={x} y={AXIS + 18} size={10}>
              F
            </Label>
          </g>
        ))}
        {mirror && f > 0 && (
          <>
            <path
              d={`M${S - 2 * f * s} ${AXIS - 5} V${AXIS + 5}`}
              strokeWidth="2"
              className={ink}
            />
            <Label x={S - 2 * f * s} y={AXIS + 18} size={10}>
              C
            </Label>
          </>
        )}
        <Arrow
          x1={objectX}
          y1={AXIS}
          x2={objectX}
          y2={tipY}
          className="stroke-blue-600 dark:stroke-blue-400"
        />
        <g clipPath={`url(#${clipId})`}>{drawLines(lines, map)}</g>
        {imageVisible && (
          <Arrow
            x1={map(imageX)}
            y1={AXIS}
            x2={map(imageX)}
            y2={imageY}
            className={
              real
                ? "stroke-red-600 dark:stroke-red-400"
                : "stroke-red-500 opacity-60"
            }
          />
        )}
        <Label x={objectX} y={AXIS + 34} size={10}>
          object
        </Label>
        {atFocus && (
          <Label x={width / 2} y={26} size={11}>
            image at infinity
          </Label>
        )}
        {!atFocus && !imageVisible && (
          <Label x={width / 2} y={26} size={11}>
            image off the page
          </Label>
        )}
      </>
    );
  };
}

const planeMirror: Glyph = ({ p }) => {
  const angle = p("incidence") * DEGREES;
  const x = 200;
  const reach = 140;
  const start = {
    x: x - reach * Math.cos(angle),
    y: AXIS - reach * Math.sin(angle),
  };
  const end = {
    x: x - reach * Math.cos(angle),
    y: AXIS + reach * Math.sin(angle),
  };
  const d = p("distance") * 3;
  return (
    <>
      <path
        d={`M${x} 30 V190`}
        strokeWidth="5"
        className="stroke-slate-500 dark:stroke-slate-300"
      />
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d={`M${x} ${38 + i * 16} l10 8`}
          strokeWidth="1"
          className={inkSoft}
        />
      ))}
      <path
        d={`M40 ${AXIS} H${x}`}
        strokeWidth="1"
        strokeDasharray="4 4"
        className={inkSoft}
        fill="none"
      />
      <path
        d={`M${start.x} ${start.y} L${x} ${AXIS} L${end.x} ${end.y}`}
        fill="none"
        strokeWidth="2"
        className={rayStroke}
      />
      <path
        d={`M${x - 46} ${AXIS} A46 46 0 0 1 ${x - 46 * Math.cos(angle)} ${AXIS - 46 * Math.sin(angle)}`}
        fill="none"
        strokeWidth="1.5"
        className={ink}
      />
      <path
        d={`M${x - 56} ${AXIS} A56 56 0 0 0 ${x - 56 * Math.cos(angle)} ${AXIS + 56 * Math.sin(angle)}`}
        fill="none"
        strokeWidth="1.5"
        className={ink}
      />
      <Label x={x - 62} y={AXIS - 22} size={11}>
        i
      </Label>
      <Label x={x - 70} y={AXIS + 36} size={11}>
        r
      </Label>
      <Arrow
        x1={x - d}
        y1={226}
        x2={x - d}
        y2={202}
        className="stroke-blue-600 dark:stroke-blue-400"
      />
      <Arrow
        x1={x + d}
        y1={226}
        x2={x + d}
        y2={202}
        className="stroke-blue-500 opacity-50"
      />
      <Label x={x - d} y={238} size={10}>
        object
      </Label>
      <Label x={x + d} y={238} size={10}>
        image
      </Label>
    </>
  );
};

const glassBlock: Glyph = ({ p, v }) => {
  const incidence = p("incidence") * DEGREES;
  const refraction = v("refraction") * DEGREES;
  const entry = { x: 170, y: 90 };
  const exit = { x: entry.x + 60 * Math.tan(refraction), y: 150 };
  const long = 100;
  return (
    <>
      <rect
        x="40"
        y="90"
        width="290"
        height="60"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d={`M${entry.x} 30 V120 M${exit.x} 120 V210`}
        strokeWidth="1"
        strokeDasharray="4 4"
        className={inkSoft}
        fill="none"
      />
      <path
        d={`M${entry.x - long * Math.sin(incidence)} ${entry.y - long * Math.cos(incidence)} L${entry.x} ${entry.y} L${exit.x} ${exit.y} L${exit.x + long * Math.sin(incidence)} ${exit.y + long * Math.cos(incidence)}`}
        fill="none"
        strokeWidth="2"
        className={rayStroke}
      />
      <path
        d={`M${entry.x} ${entry.y} L${entry.x + 60 * Math.tan(incidence)} 150`}
        strokeWidth="1.2"
        strokeDasharray="4 3"
        className={ink}
        fill="none"
      />
      <Label x={entry.x - 30} y={entry.y - 24} size={11}>
        i = {p("incidence")}°
      </Label>
      <Label x={entry.x + 24} y={entry.y + 34} size={11}>
        r
      </Label>
    </>
  );
};

function prismTrace(n: number, incidence: number) {
  const apex = { x: 180, y: 30 };
  const right = { x: 295, y: 230 };
  const entry = { x: 122.5, y: 130 };
  const r1 = Math.asin(Math.sin(incidence * DEGREES) / n) / DEGREES;
  const inside = (30 - r1) * DEGREES;
  const dx = Math.cos(inside);
  const dy = Math.sin(inside);
  const ax = right.x - apex.x;
  const ay = right.y - apex.y;
  const det = dx * -ay - dy * -ax;
  const t = ((apex.x - entry.x) * -ay - (apex.y - entry.y) * -ax) / det;
  const hit = { x: entry.x + t * dx, y: entry.y + t * dy };
  const s = n * Math.sin((60 - r1) * DEGREES);
  if (s > 1) return { hit, exit: null };
  const e = Math.asin(s) / DEGREES;
  const angle = (-30 + e) * DEGREES;
  return {
    hit,
    exit: {
      x: hit.x + 150 * Math.cos(angle),
      y: hit.y + 150 * Math.sin(angle),
    },
  };
}

const prism: Glyph = ({ p, v }) => {
  const n = [1.52, 1.62][p("glass")];
  const incidence = p("incidence");
  const entry = { x: 122.5, y: 130 };
  const comingAngle = (30 - incidence) * DEGREES;
  const start = {
    x: entry.x - 130 * Math.cos(comingAngle),
    y: entry.y - 130 * Math.sin(comingAngle),
  };
  const colours =
    p("white") === 1
      ? [
          { n: n - 0.01, cls: "stroke-red-500" },
          { n, cls: "stroke-green-500" },
          { n: n + 0.02, cls: "stroke-violet-500" },
        ]
      : [{ n, cls: rayStroke }];
  return (
    <>
      <path d="M180 30 L65 230 H295 Z" strokeWidth="2" className={tone.glass} />
      <path
        d={`M${start.x} ${start.y} L${entry.x} ${entry.y}`}
        fill="none"
        strokeWidth="2.5"
        className={
          p("white") === 1 ? "stroke-slate-700 dark:stroke-white" : rayStroke
        }
      />
      {colours.map((colour) => {
        const traced = prismTrace(colour.n, incidence);
        return (
          <g key={colour.cls}>
            <path
              d={`M${entry.x} ${entry.y} L${traced.hit.x} ${traced.hit.y}`}
              fill="none"
              strokeWidth="2"
              className={colour.cls}
            />
            {traced.exit && (
              <path
                d={`M${traced.hit.x} ${traced.hit.y} L${traced.exit.x} ${traced.exit.y}`}
                fill="none"
                strokeWidth="2"
                className={colour.cls}
              />
            )}
          </g>
        );
      })}
      {v("emerges") === 0 && (
        <Label x={180} y={250} size={11}>
          total internal reflection
        </Label>
      )}
      <Label x={60} y={start.y - 8} size={11}>
        i = {incidence}°
      </Label>
    </>
  );
};

const rayBox: Glyph = ({ v }) => {
  const colours = [
    "stroke-amber-300",
    "stroke-red-500",
    "stroke-green-500",
    "stroke-blue-500",
  ];
  const on = v("lamp") === 1;
  const ys = v("rays") === 1 ? [48, 64, 80] : [64];
  return (
    <>
      <rect
        x="10"
        y="26"
        width="100"
        height="76"
        rx="6"
        strokeWidth="2"
        className={tone.dark}
      />
      <circle
        cx="40"
        cy="64"
        r="14"
        className={on ? "fill-yellow-300" : "fill-slate-500"}
      />
      <rect x="100" y="34" width="14" height="60" className={tone.steel} />
      {on &&
        ys.map((y) => (
          <path
            key={y}
            d={`M114 ${y} H196`}
            strokeWidth="2.5"
            className={colours[v("colour")]}
          />
        ))}
    </>
  );
};

const pins: Glyph = ({ v }) => {
  const gap = v("spacing") * 12;
  const first = 24;
  const second = first + gap;
  return (
    <>
      <rect
        x="6"
        y="100"
        width="178"
        height="16"
        rx="4"
        className={tone.wood}
        strokeWidth="1.5"
      />
      {[first, second].map((x) => (
        <g key={x}>
          <path
            d={`M${x} 46 V104`}
            strokeWidth="2"
            className="stroke-slate-500"
            fill="none"
          />
          <circle cx={x} cy="42" r="6" className={tone.red} strokeWidth="1.5" />
        </g>
      ))}
      <path
        d={`M${first} 76 H184`}
        strokeWidth="1"
        strokeDasharray="4 3"
        className={inkSoft}
        fill="none"
      />
      <Label x={(first + second) / 2} y={30} size={10}>
        {v("spacing")} cm
      </Label>
    </>
  );
};

const board: Glyph = ({ v }) => (
  <>
    <rect
      x="6"
      y="6"
      width="288"
      height="198"
      rx="6"
      strokeWidth="2"
      className={tone.darkWood}
    />
    <g transform={v("paper") === 1 ? undefined : "rotate(4 150 105)"}>
      <rect
        x="30"
        y="20"
        width="240"
        height="170"
        className={tone.paper}
        strokeWidth="1.5"
      />
      <path
        d="M60 60 H240 M60 100 H200 M60 140 H220"
        strokeWidth="1"
        strokeDasharray="6 4"
        className={inkSoft}
        fill="none"
      />
    </g>
    {v("paper") === 1 &&
      [
        [34, 24],
        [266, 24],
        [34, 186],
        [266, 186],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="4" className={tone.red} />
      ))}
  </>
);

const screen: Glyph = ({ v }) => (
  <>
    <rect
      x="20"
      y="10"
      width="100"
      height="150"
      rx="3"
      strokeWidth="2"
      className={v("surface") === 0 ? tone.paper : tone.dark}
    />
    <rect x="62" y="160" width="16" height="40" className={tone.steel} />
    <rect x="30" y="200" width="80" height="12" rx="3" className={tone.dark} />
  </>
);

const opticalBench: Glyph = ({ part, p, v }) => {
  const s = 3.8;
  const lensX = 290;
  const objectX = lensX - p("u") * s;
  const screenX = lensX + p("screen") * s;
  const sharpness = v("sharpness");
  const m = v("m");
  const id = `blur-${part.id}`;
  const tipY = 100 - OBJECT_HEIGHT;
  return (
    <>
      <filter id={id}>
        <feGaussianBlur stdDeviation={(1 - sharpness) * 7} />
      </filter>
      <rect
        x="10"
        y="150"
        width="680"
        height="12"
        rx="3"
        className={tone.dark}
      />
      <HScale
        x={lensX - 280}
        y={162}
        from={0}
        to={100}
        perUnit={3.8}
        minor={5}
        major={10}
        labelEvery={1}
        format={(n) => String(n)}
        size={9}
      />
      <rect
        x={lensX - 6}
        y="132"
        width="12"
        height="20"
        className={tone.steel}
      />
      <path
        d={`M${lensX} 50 Q${lensX + 20} 100 ${lensX} 150 Q${lensX - 20} 100 ${lensX} 50 Z`}
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x={objectX - 6}
        y="132"
        width="12"
        height="20"
        className={tone.steel}
      />
      <Arrow
        x1={objectX}
        y1={132}
        x2={objectX}
        y2={tipY}
        className="stroke-blue-600 dark:stroke-blue-400"
      />
      <circle
        cx={objectX - 10}
        cy={tipY + 14}
        r="5"
        className="fill-yellow-300"
      />
      <path
        d={`M${objectX} ${tipY} L${lensX} 100 L${screenX} ${100 + (100 - tipY) * (p("screen") / p("u"))}`}
        fill="none"
        strokeWidth="1.2"
        className={`${rayStroke} ${opacityClass(0.6)}`}
      />
      <rect
        x={screenX - 3}
        y="40"
        width="6"
        height="112"
        className={tone.paper}
        strokeWidth="1.5"
      />
      <g filter={`url(#${id})`}>
        <Arrow
          x1={screenX + 6}
          y1={100}
          x2={screenX + 6}
          y2={
            100 -
            m * OBJECT_HEIGHT * Math.min(1, p("screen") / Math.max(1, v("v")))
          }
          className="stroke-red-600 dark:stroke-red-400"
          width={3}
        />
      </g>
      <Label x={lensX} y={36} size={11}>
        f = {v("f")} cm
      </Label>
      <Label x={screenX} y={30} size={11}>
        screen
      </Label>
    </>
  );
};

const pinhole: Glyph = ({ p, v }) => {
  const boxLength = 100 + (p("box") - 10) * 4;
  const objectHeight = p("object") * 0.7;
  const imageHeight = Math.min(70, v("height") * 1.6);
  const left = 170;
  const mid = 100;
  return (
    <>
      <rect
        x={left}
        y="40"
        width={boxLength}
        height="120"
        rx="3"
        strokeWidth="2"
        className={tone.dark}
      />
      <rect
        x={left + boxLength - 4}
        y="44"
        width="4"
        height="112"
        className={tone.paper}
      />
      <circle
        cx={left}
        cy={mid}
        r={2 + p("hole") * 1.2}
        className="fill-amber-300"
      />
      <Arrow
        x1={44}
        y1={mid + objectHeight / 2}
        x2={44}
        y2={mid - objectHeight / 2}
        className="stroke-green-700 dark:stroke-green-400"
        width={4}
      />
      <path
        d={`M44 ${mid - objectHeight / 2} L${left} ${mid} L${left + boxLength} ${mid + imageHeight / 2}`}
        fill="none"
        strokeWidth="1"
        strokeDasharray="4 3"
        className={rayStroke}
      />
      <path
        d={`M44 ${mid + objectHeight / 2} L${left} ${mid} L${left + boxLength} ${mid - imageHeight / 2}`}
        fill="none"
        strokeWidth="1"
        strokeDasharray="4 3"
        className={rayStroke}
      />
      <path
        d={`M${left + boxLength - 8} ${mid + imageHeight / 2} V${mid - imageHeight / 2}`}
        strokeWidth={2 + v("blur") * 10}
        strokeLinecap="round"
        className={`stroke-green-700 dark:stroke-green-400 ${opacityClass(Math.max(0.3, 1 - v("blur") * 1.4))}`}
        fill="none"
      />
      <Label x={left + boxLength / 2} y={178} size={10}>
        inverted image
      </Label>
    </>
  );
};

const lightSource: Glyph = ({ p, still }) => (
  <>
    {Array.from({ length: 8 }, (_, i) => (
      <path
        key={i}
        d="M70 80 m0 -52 v-14"
        strokeWidth="2"
        transform={`rotate(${i * 45} 70 80)`}
        className={rayStroke}
      />
    ))}
    {p("type") === 1 ? (
      <>
        <circle
          cx="70"
          cy="80"
          r="28"
          strokeWidth="2"
          className="fill-yellow-200 stroke-amber-400"
        />
        <rect
          x="56"
          y="106"
          width="28"
          height="18"
          rx="2"
          className={tone.steel}
        />
        <rect
          x="46"
          y="124"
          width="48"
          height="28"
          rx="4"
          className={tone.dark}
        />
      </>
    ) : (
      <>
        <rect
          x="50"
          y="110"
          width="40"
          height="100"
          rx="3"
          strokeWidth="1.5"
          className="fill-amber-50 stroke-amber-300"
        />
        <path d="M70 110 V96" strokeWidth="2" className="stroke-slate-700" />
        <path
          d="M70 96 C58 84 60 66 70 50 C80 66 82 84 70 96 Z"
          className="fill-amber-400"
        />
        {!still && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-2 70 96;2 70 96;-2 70 96"
            dur="0.7s"
            repeatCount="indefinite"
          />
        )}
      </>
    )}
  </>
);

export const opticsGlyphs: Record<OpticsKind, Glyph> = {
  "plane-mirror": planeMirror,
  "concave-mirror": curved("mirror"),
  "convex-mirror": curved("mirror"),
  "converging-lens": curved("lens"),
  "diverging-lens": curved("lens"),
  "lens-holder": ({ v }) => (
    <>
      <ellipse
        cx="70"
        cy={86 + v("height")}
        rx="22"
        ry="48"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect x="62" y="120" width="16" height="26" className={tone.steel} />
      <rect
        x="30"
        y="146"
        width="80"
        height="12"
        rx="3"
        className={tone.dark}
      />
      <path
        d="M20 86 H120"
        strokeWidth="1"
        strokeDasharray="4 3"
        className={inkSoft}
        fill="none"
      />
    </>
  ),
  "glass-block": glassBlock,
  "glass-prism": prism,
  "ray-box": rayBox,
  pins,
  "drawing-board": board,
  screen,
  "optical-bench": opticalBench,
  "pinhole-camera": pinhole,
  "light-source": lightSource,
};
