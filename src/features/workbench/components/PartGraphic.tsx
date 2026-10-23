import { formatReading } from "../circuit/formatReading";
import { OVERLOAD_BRIGHTNESS } from "../circuit/solveCircuit";
import { partDefinitions } from "../data/equipment";
import type { PlacedPart } from "../workbench.types";

type PartGraphicProps = {
  part: Pick<PlacedPart, "kind" | "value" | "closed">;
  reading?: number;
  brightness?: number;
};

function glowClass(brightness: number) {
  if (brightness < 0.25) return "opacity-20";
  if (brightness < 0.5) return "opacity-40";
  if (brightness < 0.8) return "opacity-60";
  if (brightness < 1.2) return "opacity-80";
  return "opacity-100";
}

/** Visual body and terminal screws of a part, drawn in its own local space. */
export function PartGraphic({
  part,
  reading = 0,
  brightness = 0,
}: PartGraphicProps) {
  const definition = partDefinitions[part.kind];
  return (
    <>
      <PartBody part={part} reading={reading} brightness={brightness} />
      {definition.terminals.map((terminal) => (
        <g key={terminal.name}>
          <circle
            cx={terminal.x}
            cy={terminal.y}
            r="7"
            strokeWidth="2"
            className={`fill-amber-400 ${terminal.polarity === "+" ? "stroke-red-600" : terminal.polarity === "-" ? "stroke-slate-900" : "stroke-amber-700"}`}
          />
          <circle
            cx={terminal.x}
            cy={terminal.y}
            r="2.5"
            className="fill-amber-700"
          />
        </g>
      ))}
    </>
  );
}

function PartBody({ part, reading, brightness }: Required<PartGraphicProps>) {
  switch (part.kind) {
    case "cell":
      return (
        <>
          <path d="M8 25 H112" strokeWidth="3" className="stroke-slate-400" />
          <rect
            x="18"
            y="8"
            width="80"
            height="34"
            rx="6"
            strokeWidth="2"
            className="fill-orange-500 stroke-orange-700"
          />
          <rect
            x="98"
            y="16"
            width="6"
            height="18"
            rx="2"
            className="fill-slate-300"
          />
          <text
            x="56"
            y="30"
            textAnchor="middle"
            className="fill-white font-mono text-sm font-black"
          >
            1.5 V
          </text>
          <text x="86" y="30" className="fill-white text-sm font-black">
            +
          </text>
        </>
      );
    case "battery":
      return (
        <>
          <rect
            x="16"
            y="6"
            width="108"
            height="48"
            rx="6"
            className="fill-slate-800 dark:fill-slate-700"
          />
          <rect
            x="24"
            y="14"
            width="44"
            height="32"
            rx="4"
            className="fill-orange-500"
          />
          <rect
            x="72"
            y="14"
            width="44"
            height="32"
            rx="4"
            className="fill-orange-500"
          />
          <text
            x="70"
            y="35"
            textAnchor="middle"
            className="fill-white font-mono text-sm font-black"
          >
            3 V
          </text>
        </>
      );
    case "power-supply":
      return (
        <>
          <rect
            x="0"
            y="0"
            width="140"
            height="90"
            rx="8"
            strokeWidth="2"
            className="fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500"
          />
          <rect
            x="12"
            y="10"
            width="88"
            height="32"
            rx="4"
            className="fill-slate-950"
          />
          <text
            x="56"
            y="32"
            textAnchor="middle"
            className="fill-green-400 font-mono text-base font-bold"
          >
            {part.value.toFixed(1)} V
          </text>
          <circle cx="120" cy="26" r="11" className="fill-slate-500" />
          <path
            d="M120 26 L120 17"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-slate-100"
          />
          <text
            x="12"
            y="77"
            className="fill-slate-600 text-xs font-bold dark:fill-slate-300"
          >
            DC
          </text>
          <text
            x="96"
            y="58"
            textAnchor="middle"
            className="fill-red-600 text-xs font-black dark:fill-red-400"
          >
            +
          </text>
          <text
            x="122"
            y="58"
            textAnchor="middle"
            className="fill-slate-800 text-xs font-black dark:fill-slate-100"
          >
            −
          </text>
        </>
      );
    case "switch":
      return (
        <>
          <rect
            x="4"
            y="38"
            width="112"
            height="18"
            rx="3"
            className="fill-amber-800"
          />
          <rect
            x="84"
            y="26"
            width="10"
            height="14"
            rx="2"
            className="fill-slate-400"
          />
          <rect
            x="26"
            y="26"
            width="10"
            height="14"
            rx="2"
            className="fill-slate-400"
          />
          <g
            transform={part.closed ? undefined : "rotate(-35 31 30)"}
            className="transition-transform"
          >
            <path
              d="M31 30 H96"
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-slate-300"
            />
            <circle cx="100" cy="30" r="5" className="fill-red-600" />
          </g>
        </>
      );
    case "bulb": {
      const lit = brightness > 0.05;
      return (
        <>
          {lit && (
            <circle
              cx="45"
              cy="38"
              r="42"
              className={`fill-amber-300 ${glowClass(brightness)}`}
            />
          )}
          <circle
            cx="45"
            cy="38"
            r="28"
            strokeWidth="2"
            className={`fill-slate-100 dark:fill-slate-300 ${brightness > OVERLOAD_BRIGHTNESS ? "stroke-red-500" : "stroke-slate-400"}`}
          />
          <path
            d="M36 58 L38 38 L42 46 L45 34 L48 46 L52 38 L54 58"
            fill="none"
            strokeWidth="2"
            className={lit ? "stroke-amber-500" : "stroke-slate-500"}
          />
          <rect
            x="33"
            y="62"
            width="24"
            height="16"
            rx="2"
            className="fill-slate-400"
          />
          <rect
            x="6"
            y="80"
            width="78"
            height="32"
            rx="6"
            className="fill-amber-800"
          />
        </>
      );
    }
    case "resistor":
      return (
        <>
          <path d="M8 16 H112" strokeWidth="3" className="stroke-slate-400" />
          <rect
            x="30"
            y="5"
            width="60"
            height="22"
            rx="8"
            strokeWidth="1.5"
            className="fill-amber-200 stroke-amber-700"
          />
          <rect x="40" y="5" width="5" height="22" className="fill-amber-900" />
          <rect x="52" y="5" width="5" height="22" className="fill-slate-900" />
          <rect x="64" y="5" width="5" height="22" className="fill-red-600" />
          <rect
            x="78"
            y="5"
            width="4"
            height="22"
            className="fill-yellow-500"
          />
          <text
            x="60"
            y="46"
            textAnchor="middle"
            className="fill-slate-700 font-mono text-xs font-bold dark:fill-slate-200"
          >
            {part.value} Ω
          </text>
        </>
      );
    case "ammeter":
    case "voltmeter": {
      const meter = partDefinitions[part.kind].meter;
      const unit = meter?.unit ?? "A";
      const fraction = Math.max(
        -0.08,
        Math.min(1.05, reading / (meter?.fullScale ?? 1)),
      );
      return (
        <>
          <rect
            x="0"
            y="0"
            width="110"
            height="120"
            rx="10"
            strokeWidth="2"
            className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
          />
          <rect
            x="10"
            y="10"
            width="90"
            height="54"
            rx="6"
            className="fill-white"
          />
          <path
            d="M21 58 A34 34 0 0 1 89 58"
            fill="none"
            strokeWidth="2"
            className="stroke-slate-400"
          />
          <text
            x="55"
            y="54"
            textAnchor="middle"
            className="fill-slate-700 text-base font-black"
          >
            {unit}
          </text>
          <path
            d="M55 58 L55 26"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${-60 + 120 * fraction} 55 58)`}
            className="stroke-red-600"
          />
          <circle cx="55" cy="58" r="3" className="fill-slate-700" />
          <rect
            x="16"
            y="70"
            width="78"
            height="20"
            rx="3"
            className="fill-slate-950"
          />
          <text
            x="55"
            y="84"
            textAnchor="middle"
            className="fill-green-400 font-mono text-xs font-bold"
          >
            {formatReading(reading, unit)}
          </text>
        </>
      );
    }
  }
}
