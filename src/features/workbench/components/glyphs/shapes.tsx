import type { ReactNode } from "react";
import { ink, inkFill, inkSoft, labelFill } from "./tones";

type LabelProps = {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
};

export function Label({
  x,
  y,
  children,
  anchor = "middle",
  size = 12,
}: LabelProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      className={`${labelFill} font-bold`}
    >
      {children}
    </text>
  );
}

type ScaleProps = {
  /** Where the scale starts on the page. */
  x: number;
  y: number;
  from: number;
  to: number;
  perUnit: number;
  minor: number;
  mid?: number;
  major: number;
  /** Label every n-th major tick. */
  labelEvery?: number;
  flip?: boolean;
  format?: (value: number) => string;
  size?: number;
};

function tickLengths(
  value: number,
  minor: number,
  mid: number | undefined,
  major: number,
) {
  const index = Math.round(value / minor);
  const isMajor = Math.abs(value / major - Math.round(value / major)) < 1e-6;
  const isMid =
    mid !== undefined && Math.abs(value / mid - Math.round(value / mid)) < 1e-6;
  return { index, isMajor, isMid, length: isMajor ? 14 : isMid ? 10 : 6 };
}

/** A horizontal scale: ticks hang below the line, or above when flipped. */
export function HScale({
  x,
  y,
  from,
  to,
  perUnit,
  minor,
  mid,
  major,
  labelEvery = 1,
  flip,
  format = (value) => String(value),
  size = 10,
}: ScaleProps) {
  const sign = flip ? -1 : 1;
  const start = Math.ceil(from / minor - 1e-9);
  const end = Math.floor(to / minor + 1e-9);
  let d = `M${x} ${y} H${x + (to - from) * perUnit}`;
  const labels: ReactNode[] = [];
  for (let i = start; i <= end; i++) {
    const value = i * minor;
    const position = x + (value - from) * perUnit;
    const { isMajor, length } = tickLengths(value, minor, mid, major);
    d += ` M${position} ${y} V${y + sign * length}`;
    const majorIndex = Math.round(value / major);
    if (isMajor && majorIndex % labelEvery === 0)
      labels.push(
        <text
          key={i}
          x={position}
          y={y + sign * (length + 11)}
          textAnchor="middle"
          fontSize={size}
          className={`${inkFill} font-bold`}
        >
          {format(value)}
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

/** A vertical scale: ticks stick out to the right, or the left when flipped. */
export function VScale({
  x,
  y,
  from,
  to,
  perUnit,
  minor,
  mid,
  major,
  labelEvery = 1,
  flip,
  format = (value) => String(value),
  size = 10,
}: ScaleProps) {
  const sign = flip ? -1 : 1;
  const start = Math.ceil(from / minor - 1e-9);
  const end = Math.floor(to / minor + 1e-9);
  let d = `M${x} ${y} V${y - (to - from) * perUnit}`;
  const labels: ReactNode[] = [];
  for (let i = start; i <= end; i++) {
    const value = i * minor;
    const position = y - (value - from) * perUnit;
    const { isMajor, length } = tickLengths(value, minor, mid, major);
    d += ` M${x} ${position} H${x + sign * length}`;
    const majorIndex = Math.round(value / major);
    if (isMajor && majorIndex % labelEvery === 0)
      labels.push(
        <text
          key={i}
          x={x + sign * (length + 3)}
          y={position + 3}
          textAnchor={flip ? "end" : "start"}
          fontSize={size}
          className={`${inkFill} font-bold`}
        >
          {format(value)}
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

type DialProps = {
  cx: number;
  cy: number;
  r: number;
  min: number;
  max: number;
  value: number;
  major: number;
  minor: number;
  start?: number;
  end?: number;
  unit?: string;
  format?: (value: number) => string;
  needle?: string;
};

function onCircle(cx: number, cy: number, r: number, degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
}

/** A round meter face with a scale and a needle. Angles run clockwise from straight up. */
export function Dial({
  cx,
  cy,
  r,
  min,
  max,
  value,
  major,
  minor,
  start = -120,
  end = 120,
  unit,
  format = (n) => String(n),
  needle = "stroke-red-600",
}: DialProps) {
  const toAngle = (v: number) =>
    start + ((v - min) / (max - min)) * (end - start);
  let ticks = "";
  const labels: ReactNode[] = [];
  const steps = Math.round((max - min) / minor);
  for (let i = 0; i <= steps; i++) {
    const v = min + i * minor;
    const isMajor =
      Math.abs((v - min) / major - Math.round((v - min) / major)) < 1e-6;
    const outer = onCircle(cx, cy, r, toAngle(v));
    const inner = onCircle(cx, cy, r - (isMajor ? 9 : 5), toAngle(v));
    ticks += `M${outer.x} ${outer.y} L${inner.x} ${inner.y} `;
    if (isMajor) {
      const at = onCircle(cx, cy, r - 19, toAngle(v));
      labels.push(
        <text
          key={i}
          x={at.x}
          y={at.y + 3}
          textAnchor="middle"
          fontSize="9"
          className={`${inkFill} font-bold`}
        >
          {format(v)}
        </text>,
      );
    }
  }
  const arcStart = onCircle(cx, cy, r, start);
  const arcEnd = onCircle(cx, cy, r, end);
  const tip = onCircle(
    cx,
    cy,
    r - 6,
    toAngle(
      Math.max(
        min - (max - min) * 0.1,
        Math.min(max + (max - min) * 0.1, value),
      ),
    ),
  );
  return (
    <g>
      <path
        d={`M${arcStart.x} ${arcStart.y} A${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none"
        strokeWidth="1.5"
        className={ink}
      />
      <path d={ticks} fill="none" strokeWidth="1" className={ink} />
      {labels}
      {unit && (
        <text
          x={cx}
          y={cy + r * 0.45}
          textAnchor="middle"
          fontSize="12"
          className={`${inkFill} font-black`}
        >
          {unit}
        </text>
      )}
      <path
        d={`M${cx} ${cy} L${tip.x} ${tip.y}`}
        strokeWidth="2"
        strokeLinecap="round"
        className={needle}
      />
      <circle
        cx={cx}
        cy={cy}
        r="4"
        className="fill-slate-700 dark:fill-slate-200"
      />
    </g>
  );
}

type SpringProps = {
  x: number;
  top: number;
  bottom: number;
  coils: number;
  width: number;
};

/** A vertical coil spring drawn as a zig-zag. */
export function Spring({ x, top, bottom, coils, width }: SpringProps) {
  const step = (bottom - top - 16) / (coils * 2);
  let d = `M${x} ${top} V${top + 8}`;
  for (let i = 0; i < coils * 2; i++)
    d += ` L${x + (i % 2 === 0 ? width : -width)} ${top + 8 + step * (i + 0.5)}`;
  d += ` L${x} ${bottom - 8} V${bottom}`;
  return (
    <path
      d={d}
      fill="none"
      strokeWidth="2.5"
      strokeLinejoin="round"
      className={ink}
    />
  );
}

type ArrowProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  className?: string;
  width?: number;
};

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  className = "stroke-red-600 dark:stroke-red-400",
  width = 2.5,
}: ArrowProps) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 8;
  const left = angle + Math.PI - 0.45;
  const right = angle + Math.PI + 0.45;
  return (
    <path
      d={`M${x1} ${y1} L${x2} ${y2} M${x2} ${y2} L${x2 + head * Math.cos(left)} ${y2 + head * Math.sin(left)} M${x2} ${y2} L${x2 + head * Math.cos(right)} ${y2 + head * Math.sin(right)}`}
      fill="none"
      strokeWidth={width}
      strokeLinecap="round"
      className={className}
    />
  );
}

export function Eye({
  x,
  y,
  aimX,
  aimY,
}: {
  x: number;
  y: number;
  aimX: number;
  aimY: number;
}) {
  return (
    <g>
      <path
        d={`M${x - 10} ${y} Q${x} ${y - 9} ${x + 10} ${y} Q${x} ${y + 9} ${x - 10} ${y}`}
        strokeWidth="1.5"
        className={`${ink} fill-white dark:fill-slate-700`}
      />
      <circle
        cx={x + 2}
        cy={y}
        r="3"
        className="fill-slate-800 dark:fill-slate-100"
      />
      <path
        d={`M${x + 10} ${y} L${aimX} ${aimY}`}
        strokeWidth="1"
        strokeDasharray="4 3"
        fill="none"
        className={inkSoft}
      />
    </g>
  );
}

export function Table({
  x,
  y,
  width,
}: {
  x: number;
  y: number;
  width: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height="6"
      rx="2"
      className="fill-amber-700 dark:fill-amber-600"
    />
  );
}
