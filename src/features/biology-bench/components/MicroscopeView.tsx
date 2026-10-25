import { useId, type ReactNode } from "react";
import { opacityClass } from "../../workbench/components/glyphs/tones";
import { seeded } from "../../workbench/data/catalogue/helpers";
import type { MicroscopeImage, StainId } from "../engine/microscope";

type MicroscopeViewProps = {
  view: MicroscopeImage;
  cx: number;
  cy: number;
  r: number;
};

const AREA = 3200;

function scatter(seed: number, count: number, spread: number) {
  return Array.from({ length: count }, (_, index) => ({
    x: (seeded(`v${seed}`, index * 3) - 0.5) * spread * 2,
    y: (seeded(`v${seed}`, index * 3 + 1) - 0.5) * spread * 2,
    turn: seeded(`v${seed}`, index * 3 + 2) * 180,
  }));
}

const onionTone = (stain: StainId) =>
  stain === "iodine"
    ? {
        cell: "fill-amber-100",
        wall: "stroke-amber-700",
        nucleus: "fill-amber-800",
      }
    : stain === "methylene-blue"
      ? {
          cell: "fill-sky-100",
          wall: "stroke-sky-600",
          nucleus: "fill-blue-700",
        }
      : {
          cell: "fill-slate-50",
          wall: "stroke-slate-300",
          nucleus: "fill-slate-300",
        };

/** The specimen drawn in micrometres around the centre of the slide. */
function Specimen({
  view,
  id,
}: {
  view: MicroscopeImage;
  id: string;
}): ReactNode {
  const { specimen, stain, seed } = view;
  switch (specimen) {
    case "onion": {
      const tone = onionTone(stain);
      return (
        <>
          <defs>
            <pattern
              id={`${id}-onion`}
              width="260"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              {[0, 1].map((row) => (
                <g key={row} transform={`translate(${row * 130} ${row * 60})`}>
                  <rect
                    x="2"
                    y="2"
                    width="256"
                    height="56"
                    className={`${tone.cell} ${tone.wall}`}
                    strokeWidth="4"
                  />
                  <rect
                    x="-128"
                    y="2"
                    width="256"
                    height="56"
                    className={`${tone.cell} ${tone.wall}`}
                    strokeWidth="4"
                  />
                  <ellipse
                    cx="80"
                    cy="30"
                    rx="11"
                    ry="9"
                    className={tone.nucleus}
                  />
                </g>
              ))}
            </pattern>
          </defs>
          <rect
            x={-AREA}
            y={-AREA}
            width={AREA * 2}
            height={AREA * 2}
            fill={`url(#${id}-onion)`}
          />
        </>
      );
    }
    case "cheek": {
      const blue = stain === "methylene-blue";
      return (
        <>
          {scatter(seed, 70, 1600).map((cell, index) => (
            <g
              key={index}
              transform={`translate(${cell.x} ${cell.y}) rotate(${cell.turn})`}
            >
              <path
                d="M-32 -6 Q-26 -26 0 -24 Q30 -26 32 -2 Q34 24 4 26 Q-28 26 -32 -6 Z"
                strokeWidth="1.5"
                className={
                  blue
                    ? "fill-sky-100 stroke-sky-500"
                    : "fill-slate-50 stroke-slate-300"
                }
              />
              <circle
                r="5"
                className={blue ? "fill-blue-800" : "fill-slate-300"}
              />
            </g>
          ))}
        </>
      );
    }
    case "blood":
      return (
        <>
          <defs>
            <pattern
              id={`${id}-blood`}
              width="9"
              height="9"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="4.5"
                cy="4.5"
                r="3.7"
                className="fill-red-300 stroke-red-400"
                strokeWidth="0.6"
              />
              <circle cx="4.5" cy="4.5" r="1.4" className="fill-red-200" />
            </pattern>
          </defs>
          <rect
            x={-AREA}
            y={-AREA}
            width={AREA * 2}
            height={AREA * 2}
            fill={`url(#${id}-blood)`}
          />
          {scatter(seed, 40, 600).map((cell, index) => (
            <g key={index} transform={`translate(${cell.x} ${cell.y})`}>
              <circle
                r="6.5"
                className="fill-violet-100 stroke-violet-300"
                strokeWidth="0.6"
              />
              <path
                d="M-3 -2 Q0 -5 3 -2 Q1 1 3 3 Q0 5 -3 3 Q-1 0 -3 -2 Z"
                className="fill-violet-700"
              />
            </g>
          ))}
        </>
      );
    case "leaf": {
      const iodine = stain === "iodine";
      return (
        <>
          <defs>
            <pattern
              id={`${id}-leaf`}
              width="90"
              height="70"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0 Q12 10 22 0 Q34 -8 45 0 Q56 10 68 0 Q80 -8 90 0 V35 Q78 45 68 35 Q56 26 45 35 Q34 45 22 35 Q12 26 0 35 Z"
                fill="none"
                strokeWidth="2"
                className={iodine ? "stroke-amber-700" : "stroke-slate-300"}
              />
              <path
                d="M0 35 Q12 45 22 35 Q34 26 45 35 Q56 45 68 35 Q80 26 90 35 V70"
                fill="none"
                strokeWidth="2"
                className={iodine ? "stroke-amber-700" : "stroke-slate-300"}
              />
              <ellipse
                cx="45"
                cy="52"
                rx="10"
                ry="6"
                className="fill-green-300 stroke-green-700"
                strokeWidth="1.5"
              />
              <path
                d="M36 52 H54"
                strokeWidth="1.5"
                className="stroke-green-900"
              />
            </pattern>
          </defs>
          <rect
            x={-AREA}
            y={-AREA}
            width={AREA * 2}
            height={AREA * 2}
            fill={`url(#${id}-leaf)`}
          />
        </>
      );
    }
    case "stem":
      return (
        <>
          <circle
            r="1500"
            className="fill-lime-50 stroke-green-700"
            strokeWidth="30"
          />
          <circle r="1300" className="fill-lime-100" />
          <circle r="700" className="fill-amber-50" />
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index / 8) * Math.PI * 2;
            return (
              <g
                key={index}
                transform={`translate(${Math.cos(angle) * 1000} ${Math.sin(angle) * 1000}) rotate(${(angle * 180) / Math.PI})`}
              >
                <ellipse
                  rx="230"
                  ry="150"
                  className="fill-green-200 stroke-green-600"
                  strokeWidth="8"
                />
                <ellipse
                  cx="90"
                  rx="80"
                  ry="110"
                  className="fill-emerald-400/60"
                />
                {[-60, 0, 60].map((y) => (
                  <circle
                    key={y}
                    cx="-80"
                    cy={y}
                    r="32"
                    className="fill-white stroke-red-700"
                    strokeWidth="10"
                  />
                ))}
              </g>
            );
          })}
        </>
      );
    case "root-tip":
      return (
        <>
          <defs>
            <pattern
              id={`${id}-root`}
              width="66"
              height="66"
              patternUnits="userSpaceOnUse"
            >
              {Array.from({ length: 9 }, (_, index) => {
                const x = (index % 3) * 22;
                const y = Math.floor(index / 3) * 22;
                return (
                  <g key={index} transform={`translate(${x} ${y})`}>
                    <rect
                      x="1"
                      y="1"
                      width="20"
                      height="20"
                      strokeWidth="1"
                      className="fill-rose-50 stroke-rose-300"
                    />
                    {index === 4 ? (
                      <path
                        d="M6 11 H16 M7 9 H15 M7 13 H15"
                        strokeWidth="1.6"
                        className="stroke-red-700"
                      />
                    ) : index === 7 ? (
                      <path
                        d="M5 6 L9 9 M5 16 L9 13 M17 6 L13 9 M17 16 L13 13"
                        strokeWidth="1.6"
                        className="stroke-red-700"
                      />
                    ) : (
                      <circle cx="11" cy="11" r="4" className="fill-red-400" />
                    )}
                  </g>
                );
              })}
            </pattern>
          </defs>
          <rect
            x={-AREA}
            y={-AREA}
            width={AREA * 2}
            height={AREA * 2}
            fill={`url(#${id}-root)`}
          />
        </>
      );
    case "pond":
      return (
        <>
          {scatter(seed, 10, 1400).map((cell, index) => (
            <g
              key={index}
              transform={`translate(${cell.x} ${cell.y}) rotate(${cell.turn})`}
            >
              {index % 3 === 0 ? (
                <ellipse
                  rx="100"
                  ry="32"
                  strokeWidth="3"
                  className="fill-amber-100 stroke-amber-600"
                />
              ) : index % 3 === 1 ? (
                <ellipse
                  rx="28"
                  ry="9"
                  className="fill-green-400 stroke-green-700"
                  strokeWidth="2"
                />
              ) : (
                <path
                  d="M-60 0 Q-50 -50 0 -40 Q60 -50 50 10 Q40 60 -10 40 Q-70 40 -60 0 Z"
                  strokeWidth="3"
                  className="fill-slate-100 stroke-slate-400"
                />
              )}
            </g>
          ))}
        </>
      );
    case "micrometer":
      return (
        <>
          <path d="M-500 0 H500" strokeWidth="2" className="stroke-slate-900" />
          {Array.from({ length: 101 }, (_, index) => (
            <path
              key={index}
              d={`M${-500 + index * 10} 0 V${index % 10 === 0 ? -60 : index % 5 === 0 ? -42 : -28}`}
              strokeWidth="1.5"
              className="stroke-slate-900"
            />
          ))}
        </>
      );
    default:
      return null;
  }
}

/** What is seen down the eyepiece: drawn to scale, blurred when out of focus. */
export function MicroscopeView({ view, cx, cy, r }: MicroscopeViewProps) {
  const id = useId().replace(/:/g, "");
  const scale = (2 * r) / view.field;
  const graticule = view.umPerUnit * 100 * scale;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <filter id={`${id}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={view.blur * (r / 150)} />
        </filter>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          className="fill-amber-50"
        />
        {view.specimen && (
          <g
            filter={`url(#${id}-blur)`}
            className={opacityClass(
              view.dry ? 0.35 : 0.25 + 0.75 * view.contrast,
            )}
          >
            <g
              transform={`translate(${cx - view.offsetX * scale} ${cy - view.offsetY * scale}) scale(${scale})`}
            >
              <Specimen view={view} id={id} />
            </g>
          </g>
        )}
        {Array.from({ length: view.bubbles }, (_, index) => (
          <circle
            key={index}
            cx={cx + (seeded(`b${view.seed}`, index) - 0.5) * r * 1.4}
            cy={cy + (seeded(`b${view.seed}`, index + 9) - 0.5) * r * 1.4}
            r={r * (0.08 + seeded(`b${view.seed}`, index + 20) * 0.1)}
            fill="none"
            strokeWidth={r * 0.03}
            className="stroke-slate-900/80"
          />
        ))}
        {view.broken && (
          <path
            d={`M${cx - r} ${cy - r * 0.3} L${cx - r * 0.2} ${cy + r * 0.1} L${cx + r * 0.3} ${cy - r * 0.2} L${cx + r} ${cy + r * 0.4} M${cx - r * 0.2} ${cy + r * 0.1} L${cx - r * 0.1} ${cy + r}`}
            fill="none"
            strokeWidth={r * 0.02}
            className="stroke-slate-900"
          />
        )}
        <rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          className={`fill-black ${opacityClass(1 - view.brightness)}`}
        />
        {view.graticule && (
          <g>
            <path
              d={`M${cx - graticule / 2} ${cy + r * 0.25} H${cx + graticule / 2}`}
              strokeWidth="1"
              className="stroke-slate-900"
            />
            {Array.from({ length: 101 }, (_, index) => (
              <path
                key={index}
                d={`M${cx - graticule / 2 + (graticule * index) / 100} ${cy + r * 0.25} v${index % 10 === 0 ? -r * 0.08 : index % 5 === 0 ? -r * 0.055 : -r * 0.035}`}
                strokeWidth="0.8"
                className="stroke-slate-900"
              />
            ))}
            {Array.from({ length: 11 }, (_, index) => (
              <text
                key={index}
                x={cx - graticule / 2 + (graticule * index) / 10}
                y={cy + r * 0.25 + r * 0.09}
                textAnchor="middle"
                fontSize={r * 0.06}
                className="fill-slate-900 font-bold"
              >
                {index * 10}
              </text>
            ))}
          </g>
        )}
      </g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        strokeWidth={r * 0.06}
        className="stroke-slate-900 dark:stroke-slate-700"
      />
    </g>
  );
}
