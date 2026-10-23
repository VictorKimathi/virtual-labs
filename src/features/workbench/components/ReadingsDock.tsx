import { Eraser, NotebookPen } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { formatReading } from "../circuit/formatReading";
import type { MeterReading, NotebookRecord } from "../workbench.types";

type Tab = "readings" | "graph" | "notebook";

type ReadingsDockProps = {
  readings: MeterReading[];
  records: NotebookRecord[];
  onRecord: () => void;
  onClearRecords: () => void;
};

export function ReadingsDock({
  readings,
  records,
  onRecord,
  onClearRecords,
}: ReadingsDockProps) {
  const { tr } = useLanguage();
  const [tab, setTab] = useState<Tab>("readings");
  const tabs: { id: Tab; label: string }[] = [
    { id: "readings", label: tr("Readings", "Vipimo") },
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
          {tr("Record", "Rekodi")}
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
          "Place a meter on the bench to take readings.",
          "Weka mita kwenye benchi kupata vipimo.",
        )}
      </EmptyState>
    );
  return (
    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {readings.map((reading) => (
        <li
          key={reading.partId}
          className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
        >
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {reading.label}
          </p>
          <p className="mt-1 font-mono text-xl font-bold">
            {formatReading(reading.value, reading.unit)}
          </p>
          {reading.value < -0.0005 && (
            <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
              {tr(
                "Negative reading: swap the meter leads.",
                "Kipimo hasi: badilisha nyaya za mita.",
              )}
            </p>
          )}
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
          "Press Record to save the current meter readings here.",
          "Bonyeza Rekodi kuhifadhi vipimo vya sasa hapa.",
        )}
      </EmptyState>
    );
  const columns = [
    ...new Map(
      records.flatMap((record) =>
        record.readings.map((reading) => [reading.partId, reading.label]),
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
              {columns.map(([id, label]) => (
                <th key={id} className="py-1 pr-4">
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
                {columns.map(([id]) => {
                  const reading = record.readings.find(
                    (item) => item.partId === id,
                  );
                  return (
                    <td key={id} className="py-1 pr-4">
                      {reading
                        ? formatReading(reading.value, reading.unit)
                        : "—"}
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
  height: 260,
  left: 56,
  right: 16,
  top: 16,
  bottom: 44,
};

function ReadingsGraph({ records }: { records: NotebookRecord[] }) {
  const { tr } = useLanguage();
  const points = records.flatMap((record) => {
    const current = record.readings.find((reading) => reading.unit === "A");
    const voltage = record.readings.find((reading) => reading.unit === "V");
    return current && voltage
      ? [{ id: record.id, current: current.value, voltage: voltage.value }]
      : [];
  });
  if (points.length < 2)
    return (
      <EmptyState>
        {tr(
          "Record at least two readings with an ammeter and a voltmeter to plot V against I.",
          "Rekodi angalau vipimo viwili vyenye amita na voltimita kuchora V dhidi ya I.",
        )}
      </EmptyState>
    );

  const maxCurrent =
    Math.max(...points.map((point) => point.current), 0.001) * 1.1;
  const maxVoltage =
    Math.max(...points.map((point) => point.voltage), 0.1) * 1.1;
  const innerWidth = PLOT.width - PLOT.left - PLOT.right;
  const innerHeight = PLOT.height - PLOT.top - PLOT.bottom;
  const x = (current: number) =>
    PLOT.left + (current / maxCurrent) * innerWidth;
  const y = (voltage: number) =>
    PLOT.top + innerHeight - (voltage / maxVoltage) * innerHeight;
  const sumIV = points.reduce(
    (sum, point) => sum + point.current * point.voltage,
    0,
  );
  const sumII = points.reduce((sum, point) => sum + point.current ** 2, 0);
  const gradient = sumII > 0 ? sumIV / sumII : 0;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <figure>
      <figcaption className="text-sm font-bold">
        {tr("Voltage against current", "Volteji dhidi ya mkondo")}
        <span className="ml-2 font-mono font-normal text-slate-500 dark:text-slate-400">
          {tr("gradient", "mwinuko")} ≈ {gradient.toFixed(1)} Ω
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label={tr(
          `Graph of voltage against current with ${points.length} points; gradient ${gradient.toFixed(1)} ohms`,
          `Grafu ya volteji dhidi ya mkondo yenye vipimo ${points.length}; mwinuko ${gradient.toFixed(1)} ohm`,
        )}
        className="mt-2 w-full"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <path
              d={`M${PLOT.left} ${y(tick * maxVoltage)} H${PLOT.width - PLOT.right}`}
              strokeWidth="1"
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <text
              x={PLOT.left - 8}
              y={y(tick * maxVoltage) + 4}
              textAnchor="end"
              className="fill-slate-500 font-mono text-xs dark:fill-slate-400"
            >
              {(tick * maxVoltage).toFixed(1)}
            </text>
            <text
              x={x(tick * maxCurrent)}
              y={PLOT.height - PLOT.bottom + 18}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-xs dark:fill-slate-400"
            >
              {(tick * maxCurrent).toFixed(2)}
            </text>
          </g>
        ))}
        <text
          x={PLOT.left + innerWidth / 2}
          y={PLOT.height - 4}
          textAnchor="middle"
          className="fill-slate-600 text-xs font-bold dark:fill-slate-300"
        >
          {tr("Current I (A)", "Mkondo I (A)")}
        </text>
        <text
          x="14"
          y={PLOT.top + innerHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PLOT.top + innerHeight / 2})`}
          className="fill-slate-600 text-xs font-bold dark:fill-slate-300"
        >
          {tr("Voltage V (V)", "Volteji V (V)")}
        </text>
        <path
          d={`M${x(0)} ${y(0)} L${x(maxCurrent)} ${y(gradient * maxCurrent)}`}
          strokeWidth="2"
          className="stroke-sky-600 opacity-50 dark:stroke-sky-400"
        />
        {points.map((point) => (
          <circle
            key={point.id}
            cx={x(point.current)}
            cy={y(point.voltage)}
            r="5"
            strokeWidth="2"
            className="fill-sky-600 stroke-white dark:fill-sky-400 dark:stroke-slate-900"
          >
            <title>
              {`${formatReading(point.current, "A")}, ${formatReading(point.voltage, "V")}`}
            </title>
          </circle>
        ))}
      </svg>
    </figure>
  );
}
