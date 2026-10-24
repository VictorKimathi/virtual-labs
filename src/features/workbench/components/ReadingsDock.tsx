import { Eraser, NotebookPen } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import type { MeterReading, NotebookRecord } from "../workbench.types";

type Tab = "readings" | "graph" | "notebook";

type ReadingsDockProps = {
  readings: MeterReading[];
  records: NotebookRecord[];
  onRecord: () => void;
  onClearRecords: () => void;
};

const seriesKey = (reading: MeterReading) =>
  `${reading.partId}:${reading.measureId}`;

function formatValue(reading: Pick<MeterReading, "value" | "digits" | "unit">) {
  return `${reading.value.toFixed(reading.digits)}${reading.unit ? ` ${reading.unit}` : ""}`;
}

export function ReadingsDock({
  readings,
  records,
  onRecord,
  onClearRecords,
}: ReadingsDockProps) {
  const { tr } = useLanguage();
  const [tab, setTab] = useState<Tab>("readings");
  const tabs: { id: Tab; label: string }[] = [
    { id: "readings", label: tr("Live readings", "Vipimo vya sasa") },
    { id: "graph", label: tr("Graph", "Grafu") },
    {
      id: "notebook",
      label: `${tr("Notebook", "Daftari")} (${records.length})`,
    },
  ];

  return (
    <section className="border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2">
        <div
          role="tablist"
          aria-label={tr("Results", "Matokeo")}
          className="flex gap-1"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`min-h-9 rounded-lg px-3 text-xs font-bold ${tab === item.id ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRecord}
          disabled={readings.length === 0}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-sky-600 px-3 text-xs font-bold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <NotebookPen className="h-4 w-4" />
          {tr("Record in notebook", "Rekodi kwenye daftari")}
        </button>
      </div>
      <div role="tabpanel" className="min-h-40 p-3">
        {tab === "readings" && <LiveReadings readings={readings} />}
        {tab === "graph" && <ReadingsGraph records={records} />}
        {tab === "notebook" && (
          <Notebook records={records} onClear={onClearRecords} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

function LiveReadings({ readings }: { readings: MeterReading[] }) {
  const { tr } = useLanguage();
  if (readings.length === 0)
    return (
      <EmptyState>
        {tr(
          "Place a measuring instrument on the bench to take readings.",
          "Weka kifaa cha kupimia kwenye benchi kupata vipimo.",
        )}
      </EmptyState>
    );
  return (
    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {readings.map((reading) => (
        <li
          key={seriesKey(reading)}
          className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
        >
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {reading.label}
          </p>
          <p className="mt-1 font-mono text-xl font-bold">
            {formatValue(reading)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Notebook({
  records,
  onClear,
}: {
  records: NotebookRecord[];
  onClear: () => void;
}) {
  const { tr } = useLanguage();
  if (records.length === 0)
    return (
      <EmptyState>
        {tr(
          "Press Record to save the current readings here, then plot them on the Graph tab.",
          "Bonyeza Rekodi kuhifadhi vipimo vya sasa hapa, kisha vichore kwenye kichupo cha Grafu.",
        )}
      </EmptyState>
    );
  const columns = [
    ...new Map(
      records.flatMap((record) =>
        record.readings.map((reading) => [seriesKey(reading), reading.label]),
      ),
    ),
  ];
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1 pr-4">#</th>
              {columns.map(([key, label]) => (
                <th key={key} className="py-1 pr-4">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {records.map((record, index) => (
              <tr
                key={record.id}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="py-1 pr-4">{index + 1}</td>
                {columns.map(([key]) => {
                  const reading = record.readings.find(
                    (item) => seriesKey(item) === key,
                  );
                  return (
                    <td key={key} className="py-1 pr-4">
                      {reading ? formatValue(reading) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold dark:border-slate-700"
      >
        <Eraser className="h-4 w-4" />
        {tr("Clear notebook", "Futa daftari")}
      </button>
    </div>
  );
}

const PLOT = {
  width: 640,
  height: 280,
  left: 60,
  right: 16,
  top: 16,
  bottom: 44,
};

type Series = { key: string; label: string; unit: string };

function collectSeries(records: NotebookRecord[]): Series[] {
  const map = new Map<string, Series>();
  for (const record of records)
    for (const reading of record.readings)
      map.set(seriesKey(reading), {
        key: seriesKey(reading),
        label: reading.label,
        unit: reading.unit,
      });
  return [...map.values()];
}

function defaultAxes(series: Series[]) {
  const current = series.find((item) => item.unit === "A");
  const voltage = series.find((item) => item.unit === "V");
  if (current && voltage) return { x: current.key, y: voltage.key };
  return { x: series[0]?.key ?? "", y: series[1]?.key ?? series[0]?.key ?? "" };
}

function axisRange(values: number[]) {
  const low = Math.min(0, ...values);
  const high = Math.max(...values, low + 1e-6);
  return { low, high: high + (high - low) * 0.1 };
}

function ReadingsGraph({ records }: { records: NotebookRecord[] }) {
  const { tr } = useLanguage();
  const series = collectSeries(records);
  const defaults = defaultAxes(series);
  const [choice, setChoice] = useState<{ x?: string; y?: string }>({});
  const xKey = series.some((item) => item.key === choice.x)
    ? choice.x
    : defaults.x;
  const yKey = series.some((item) => item.key === choice.y)
    ? choice.y
    : defaults.y;
  const xSeries = series.find((item) => item.key === xKey);
  const ySeries = series.find((item) => item.key === yKey);

  const points = records.flatMap((record) => {
    const x = record.readings.find((reading) => seriesKey(reading) === xKey);
    const y = record.readings.find((reading) => seriesKey(reading) === yKey);
    return x && y ? [{ id: record.id, x: x.value, y: y.value }] : [];
  });

  if (series.length < 2 || !xSeries || !ySeries || points.length < 2)
    return (
      <EmptyState>
        {tr(
          "Record at least two sets of readings of two different quantities, then plot one against the other.",
          "Rekodi angalau seti mbili za vipimo vya vitu viwili tofauti, kisha chora kimoja dhidi ya kingine.",
        )}
      </EmptyState>
    );

  const xRange = axisRange(points.map((point) => point.x));
  const yRange = axisRange(points.map((point) => point.y));
  const innerWidth = PLOT.width - PLOT.left - PLOT.right;
  const innerHeight = PLOT.height - PLOT.top - PLOT.bottom;
  const px = (value: number) =>
    PLOT.left +
    ((value - xRange.low) / (xRange.high - xRange.low)) * innerWidth;
  const py = (value: number) =>
    PLOT.top +
    innerHeight -
    ((value - yRange.low) / (yRange.high - yRange.low)) * innerHeight;

  const n = points.length;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
  const sxx = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  const sxy = points.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0,
  );
  const gradient = sxx > 1e-12 ? sxy / sxx : 0;
  const intercept = meanY - gradient * meanX;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const axisLabel = (item: Series) =>
    item.unit ? `${item.label} (${item.unit})` : item.label;

  return (
    <figure>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-bold">
          {tr("Vertical axis", "Mhimili wima")}
          <select
            value={yKey}
            onChange={(event) => setChoice({ x: xKey, y: event.target.value })}
            className="mt-1 min-h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {series.map((item) => (
              <option key={item.key} value={item.key}>
                {axisLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          {tr("Horizontal axis", "Mhimili mlalo")}
          <select
            value={xKey}
            onChange={(event) => setChoice({ x: event.target.value, y: yKey })}
            className="mt-1 min-h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {series.map((item) => (
              <option key={item.key} value={item.key}>
                {axisLabel(item)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <figcaption className="mt-2 text-sm font-bold">
        {ySeries.label} {tr("against", "dhidi ya")} {xSeries.label}
        <span className="ml-2 font-mono font-normal text-slate-500 dark:text-slate-400">
          {tr("gradient", "mwinuko")} ≈ {Number(gradient.toPrecision(3))}
          {" · "}
          {tr("intercept", "kikatiza")} ≈ {Number(intercept.toPrecision(3))}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label={tr(
          `Graph of ${ySeries.label} against ${xSeries.label} with ${n} points`,
          `Grafu ya ${ySeries.label} dhidi ya ${xSeries.label} yenye vipimo ${n}`,
        )}
        className="mt-2 w-full"
      >
        {ticks.map((tick) => {
          const yValue = yRange.low + tick * (yRange.high - yRange.low);
          const xValue = xRange.low + tick * (xRange.high - xRange.low);
          return (
            <g key={tick}>
              <path
                d={`M${PLOT.left} ${py(yValue)} H${PLOT.width - PLOT.right}`}
                strokeWidth="1"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <text
                x={PLOT.left - 8}
                y={py(yValue) + 4}
                textAnchor="end"
                className="fill-slate-500 font-mono text-xs dark:fill-slate-400"
              >
                {Number(yValue.toPrecision(3))}
              </text>
              <text
                x={px(xValue)}
                y={PLOT.height - PLOT.bottom + 18}
                textAnchor="middle"
                className="fill-slate-500 font-mono text-xs dark:fill-slate-400"
              >
                {Number(xValue.toPrecision(3))}
              </text>
            </g>
          );
        })}
        <text
          x={PLOT.left + innerWidth / 2}
          y={PLOT.height - 4}
          textAnchor="middle"
          className="fill-slate-600 text-xs font-bold dark:fill-slate-300"
        >
          {axisLabel(xSeries)}
        </text>
        <text
          x="14"
          y={PLOT.top + innerHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PLOT.top + innerHeight / 2})`}
          className="fill-slate-600 text-xs font-bold dark:fill-slate-300"
        >
          {axisLabel(ySeries)}
        </text>
        <path
          d={`M${px(xRange.low)} ${py(intercept + gradient * xRange.low)} L${px(xRange.high)} ${py(intercept + gradient * xRange.high)}`}
          strokeWidth="2"
          className="stroke-sky-600 opacity-50 dark:stroke-sky-400"
        />
        {points.map((point) => (
          <circle
            key={point.id}
            cx={px(point.x)}
            cy={py(point.y)}
            r="5"
            strokeWidth="2"
            className="fill-sky-600 stroke-white dark:fill-sky-400 dark:stroke-slate-900"
          >
            <title>{`${Number(point.x.toPrecision(4))}, ${Number(point.y.toPrecision(4))}`}</title>
          </circle>
        ))}
      </svg>
    </figure>
  );
}
