import { useLanguage } from "../../../app/useLanguage";
import type { ChemPlot } from "../chemistry.types";

const WIDTH = 320;
const HEIGHT = 190;
const PAD = { left: 40, right: 10, top: 10, bottom: 30 };

const nice = (value: number) =>
  Math.abs(value) >= 100
    ? value.toFixed(0)
    : Math.abs(value) >= 10
      ? value.toFixed(1)
      : value.toFixed(2);

/** A small line or stick chart of what an instrument measured. */
export function ChemPlotView({ plot }: { plot: ChemPlot }) {
  const { language } = useLanguage();
  const xs = plot.series.flatMap((series) => series.x);
  const ys = plot.series.flatMap((series) => series.y);
  if (xs.length === 0) return null;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs, minX + 1e-6);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(...ys, minY + 1e-6);
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const px = (value: number) => {
    const fraction = (value - minX) / (maxX - minX);
    return PAD.left + (plot.reverseX ? 1 - fraction : fraction) * innerW;
  };
  const py = (value: number) =>
    PAD.top + innerH - ((value - minY) / (maxY - minY)) * innerH;
  const left = plot.reverseX ? maxX : minX;
  const right = plot.reverseX ? minX : maxX;

  return (
    <figure className="mt-4">
      <figcaption className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {plot.title[language]}
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={plot.title[language]}
        className="mt-2 w-full rounded-lg bg-slate-50 dark:bg-slate-800"
      >
        <path
          d={`M${PAD.left} ${PAD.top} V${PAD.top + innerH} H${PAD.left + innerW}`}
          fill="none"
          strokeWidth="1"
          className="stroke-slate-400 dark:stroke-slate-500"
        />
        <text
          x={PAD.left - 4}
          y={PAD.top + 8}
          textAnchor="end"
          fontSize="9"
          className="fill-slate-600 dark:fill-slate-300"
        >
          {nice(maxY)}
        </text>
        <text
          x={PAD.left - 4}
          y={PAD.top + innerH}
          textAnchor="end"
          fontSize="9"
          className="fill-slate-600 dark:fill-slate-300"
        >
          {nice(minY)}
        </text>
        <text
          x={PAD.left}
          y={HEIGHT - 16}
          fontSize="9"
          className="fill-slate-600 dark:fill-slate-300"
        >
          {nice(left)}
        </text>
        <text
          x={PAD.left + innerW}
          y={HEIGHT - 16}
          textAnchor="end"
          fontSize="9"
          className="fill-slate-600 dark:fill-slate-300"
        >
          {nice(right)}
        </text>
        <text
          x={PAD.left + innerW / 2}
          y={HEIGHT - 4}
          textAnchor="middle"
          fontSize="10"
          className="fill-slate-700 font-bold dark:fill-slate-200"
        >
          {plot.xLabel}
        </text>
        <text
          x={10}
          y={PAD.top + innerH / 2}
          textAnchor="middle"
          fontSize="10"
          transform={`rotate(-90 10 ${PAD.top + innerH / 2})`}
          className="fill-slate-700 font-bold dark:fill-slate-200"
        >
          {plot.yLabel}
        </text>
        {plot.series.map((series, index) =>
          series.sticks ? (
            <g key={index}>
              {series.x.map((value, point) => (
                <g key={point}>
                  <path
                    d={`M${px(value)} ${py(minY)} V${py(series.y[point])}`}
                    strokeWidth="3"
                    className="stroke-orange-600 dark:stroke-orange-400"
                  />
                  <text
                    x={px(value)}
                    y={py(series.y[point]) - 3}
                    textAnchor="middle"
                    fontSize="8"
                    className="fill-slate-700 dark:fill-slate-200"
                  >
                    {value}
                  </text>
                </g>
              ))}
            </g>
          ) : (
            <path
              key={index}
              d={series.x
                .map(
                  (value, point) =>
                    `${point === 0 ? "M" : "L"}${px(value).toFixed(1)} ${py(series.y[point]).toFixed(1)}`,
                )
                .join(" ")}
              fill="none"
              strokeWidth="2"
              strokeLinejoin="round"
              className="stroke-orange-600 dark:stroke-orange-400"
            />
          ),
        )}
      </svg>
    </figure>
  );
}
