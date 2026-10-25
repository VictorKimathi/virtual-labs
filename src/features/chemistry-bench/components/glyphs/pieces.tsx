import { useId, type ReactNode } from "react";
import {
  ink,
  inkSoft,
  labelFill,
  tone,
} from "../../../workbench/components/glyphs/tones";
import type { ChemPlot, LiquidView } from "../../chemistry.types";
import { glassFill, glassStroke } from "./geometry";

type BubblesProps = {
  x1: number;
  x2: number;
  y: number;
  amount: number;
  still: boolean;
  big?: boolean;
};

const bubbleSpeeds = [
  "animate-bubble-fast",
  "animate-bubble",
  "animate-bubble-slow",
];

/** Bubbles rising from near the bottom of a liquid. */
export function Bubbles({ x1, x2, y, amount, still, big }: BubblesProps) {
  if (amount < 0.05) return null;
  const count = Math.max(2, Math.round(amount * 9));
  const width = x2 - x1;
  return (
    <g className="pointer-events-none">
      {Array.from({ length: count }, (_, index) => {
        const x = x1 + (((index * 37) % 100) / 100) * width;
        const r = (big ? 3 : 1.8) + (index % 3) * 0.7;
        return (
          <circle
            key={index}
            cx={x}
            cy={y - (index % 4) * 6}
            r={r}
            strokeWidth="0.8"
            className={`fill-white/60 stroke-white ${still ? "" : bubbleSpeeds[index % 3]}`}
          />
        );
      })}
    </g>
  );
}

type VesselBodyProps = {
  /** The outline of the glass, closed. */
  outline: string;
  /** The y of the liquid surface. */
  surface: number;
  bottom: number;
  left: number;
  right: number;
  liquid?: LiquidView;
  still: boolean;
  /** The y of the top of an oil layer, if there is one. */
  oilTop?: number;
  broken?: boolean;
  children?: ReactNode;
};

/** Glass with its contents: liquid colour, oil, sediment and bubbles, clipped to the glass. */
export function VesselBody({
  outline,
  surface,
  bottom,
  left,
  right,
  liquid,
  still,
  oilTop,
  broken,
  children,
}: VesselBodyProps) {
  const id = useId();
  const filled = liquid && liquid.level > 0.0005;
  const deposit = liquid?.deposit ?? [];
  const layers = deposit.reduce<
    { y: number; height: number; colour: string }[]
  >((list, solid) => {
    const height = 3 + solid.amount * 14;
    const top = (list[list.length - 1]?.y ?? bottom) - height;
    return [...list, { y: top, height, colour: solid.colour }];
  }, []);
  return (
    <>
      <path d={outline} className={glassFill} />
      <clipPath id={id}>
        <path d={outline} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {filled && (
          <rect
            x={left}
            y={surface}
            width={right - left}
            height={bottom - surface + 4}
            fill={liquid.colour}
          />
        )}
        {filled && (
          <path
            d={`M${left} ${surface} H${right}`}
            strokeWidth="1.5"
            className="stroke-white/70"
          />
        )}
        {oilTop !== undefined && oilTop < surface - 0.5 && (
          <rect
            x={left}
            y={oilTop}
            width={right - left}
            height={surface - oilTop}
            className="fill-amber-300/80 dark:fill-amber-500/70"
          />
        )}
        {layers.map((layer, index) => (
          <rect
            key={index}
            x={left}
            y={layer.y}
            width={right - left}
            height={layer.height + 4}
            fill={layer.colour}
          />
        ))}
        {filled && liquid && (
          <Bubbles
            x1={left + 6}
            x2={right - 6}
            y={bottom - 6}
            amount={liquid.bubbling}
            still={still}
            big={liquid.boiling}
          />
        )}
      </g>
      <path
        d={outline}
        strokeWidth="2.5"
        strokeLinejoin="round"
        className={glassStroke}
      />
      {children}
      {broken && (
        <path
          d={`M${left + 6} ${bottom - 20} L${(left + right) / 2} ${bottom - 40} L${(left + right) / 2 - 6} ${bottom - 54} L${right - 8} ${bottom - 70}`}
          fill="none"
          strokeWidth="2"
          className="stroke-red-600 dark:stroke-red-400"
        />
      )}
    </>
  );
}

/** A coloured haze of gas above a liquid, for gases that can be seen. */
export function GasHaze({
  gas,
  x,
  y,
  width,
}: {
  gas: LiquidView["gas"];
  x: number;
  y: number;
  width: number;
}) {
  if (gas !== "NO2" && gas !== "Cl2") return null;
  return (
    <ellipse
      cx={x + width / 2}
      cy={y - 14}
      rx={width / 2}
      ry="14"
      className={`pointer-events-none ${gas === "NO2" ? "fill-amber-700/50" : "fill-lime-300/50"}`}
    />
  );
}

type FlameProps = {
  x: number;
  y: number;
  height: number;
  luminous?: boolean;
  still: boolean;
};

/** A flame standing on (x, y): blue and roaring, or yellow and luminous. */
export function Flame({ x, y, height, luminous, still }: FlameProps) {
  const w = height * 0.32;
  const outer = `M${x} ${y - height} C${x + w} ${y - height * 0.55} ${x + w} ${y - 4} ${x} ${y} C${x - w} ${y - 4} ${x - w} ${y - height * 0.55} ${x} ${y - height} Z`;
  const inner = `M${x} ${y - height * 0.5} C${x + w * 0.5} ${y - height * 0.3} ${x + w * 0.45} ${y - 3} ${x} ${y} C${x - w * 0.45} ${y - 3} ${x - w * 0.5} ${y - height * 0.3} ${x} ${y - height * 0.5} Z`;
  return (
    <g className={`pointer-events-none ${still ? "" : "animate-flicker"}`}>
      <path
        d={outer}
        className={luminous ? "fill-amber-400/90" : "fill-sky-400/60"}
      />
      <path
        d={inner}
        className={luminous ? "fill-yellow-200" : "fill-blue-600/80"}
      />
    </g>
  );
}

/** A rubber bung in the mouth of a vessel. */
export function Stopper({
  x,
  y,
  width,
}: {
  x: number;
  y: number;
  width: number;
}) {
  return (
    <path
      d={`M${x - 3} ${y - 9} H${x + width + 3} L${x + width} ${y + 7} H${x} Z`}
      strokeWidth="1.5"
      className="fill-red-800 stroke-red-950 dark:fill-red-900 dark:stroke-red-700"
    />
  );
}

/** Tick marks up the side of a vessel. */
export function Ticks({
  x,
  from,
  to,
  count,
  long = 8,
  labels,
}: {
  x: number;
  from: number;
  to: number;
  count: number;
  long?: number;
  labels?: string[];
}) {
  return (
    <g className="pointer-events-none">
      {Array.from({ length: count + 1 }, (_, index) => {
        const y = from + ((to - from) * index) / count;
        const major =
          labels !== undefined &&
          labels[index] !== undefined &&
          labels[index] !== "";
        return (
          <g key={index}>
            <path
              d={`M${x} ${y} h${major ? long : long * 0.55}`}
              strokeWidth="1"
              className={ink}
            />
            {major && (
              <text
                x={x + long + 2}
                y={y + 3}
                fontSize="8"
                className={`${labelFill} font-bold`}
              >
                {labels[index]}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** An instrument display with text. */
export function Screen({
  x,
  y,
  width,
  height,
  text,
  small,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  small?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="4"
        strokeWidth="1.5"
        className={tone.screen}
      />
      <text
        x={x + width - 6}
        y={y + height / 2 + (small ? 2 : 5)}
        textAnchor="end"
        fontSize={Math.min(18, height * 0.55)}
        className="fill-lime-300 font-mono font-bold"
      >
        {text}
      </text>
      {small && (
        <text
          x={x + width - 6}
          y={y + height - 4}
          textAnchor="end"
          fontSize="8"
          className="fill-lime-500 font-mono"
        >
          {small}
        </text>
      )}
    </g>
  );
}

/** A small picture of a plot, for the screens of instruments. */
export function Trace({
  plot,
  x,
  y,
  width,
  height,
}: {
  plot?: ChemPlot;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const series = plot?.series[0];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="4"
        strokeWidth="1.5"
        className={tone.screen}
      />
      {series &&
        series.x.length > 1 &&
        (() => {
          const xs = series.x;
          const ys = series.y;
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(0, ...ys);
          const maxY = Math.max(...ys, minY + 1e-6);
          const px = (value: number) => {
            const fraction = (value - minX) / Math.max(1e-9, maxX - minX);
            return (
              x + 4 + (plot?.reverseX ? 1 - fraction : fraction) * (width - 8)
            );
          };
          const py = (value: number) =>
            y + height - 4 - ((value - minY) / (maxY - minY)) * (height - 8);
          if (series.sticks)
            return xs.map((value, index) => (
              <path
                key={index}
                d={`M${px(value)} ${y + height - 4} V${py(ys[index])}`}
                strokeWidth="2"
                className="stroke-lime-300"
              />
            ));
          return (
            <path
              d={xs
                .map(
                  (value, index) =>
                    `${index === 0 ? "M" : "L"}${px(value).toFixed(1)} ${py(ys[index]).toFixed(1)}`,
                )
                .join(" ")}
              fill="none"
              strokeWidth="1.5"
              className="stroke-lime-300"
            />
          );
        })()}
    </g>
  );
}

/** A labelled box for an instrument body. */
export function Box({
  x,
  y,
  width,
  height,
  className = tone.light,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx="8"
      strokeWidth="2"
      className={className}
    />
  );
}

export function Knob({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} strokeWidth="1.5" className={tone.dark} />
      <path
        d={`M${x} ${y} V${y - r + 2}`}
        strokeWidth="1.5"
        className="stroke-white"
      />
    </g>
  );
}

export function Lamp({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <circle
      cx={x}
      cy={y}
      r="4"
      strokeWidth="1"
      className={
        on ? "fill-lime-400 stroke-lime-700" : `fill-slate-400 ${inkSoft}`
      }
    />
  );
}

export function Hazard({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x} ${y - 9} L${x + 9} ${y} L${x} ${y + 9} L${x - 9} ${y} Z`}
        strokeWidth="1.5"
        className="fill-white stroke-red-600"
      />
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fontSize="10"
        className="fill-slate-900 font-black"
      >
        !
      </text>
    </g>
  );
}

export function WornBadge({
  x,
  y,
  worn,
}: {
  x: number;
  y: number;
  worn: boolean;
}) {
  if (!worn) return null;
  return (
    <g>
      <circle cx={x} cy={y} r="10" className="fill-green-600" />
      <path
        d={`M${x - 5} ${y} l3.5 4 l6 -8`}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-white"
      />
    </g>
  );
}
