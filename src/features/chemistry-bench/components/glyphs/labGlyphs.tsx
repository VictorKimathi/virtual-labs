import { Label } from "../../../workbench/components/glyphs/shapes";
import {
  ink,
  inkSoft,
  opacityClass,
  tone,
} from "../../../workbench/components/glyphs/tones";
import type { ChemGlyph } from "../../chemistry.types";
import { formatClock } from "../../data/catalogue/measurement";
import { chromatogram } from "../../data/catalogue/separation";
import type { chemSectionKinds } from "../../data/kinds";
import { glassFill, glassStroke, surfaceAt } from "./geometry";
import { Bubbles, Knob, Lamp, Screen, Ticks, VesselBody } from "./pieces";

type SeparationKind = (typeof chemSectionKinds.separation)[number];
type MeasurementKind = (typeof chemSectionKinds.measurement)[number];
type ElectroKind = (typeof chemSectionKinds.electrochemistry)[number];

const dyeFill: Record<string, string> = {
  yellow: "fill-yellow-400",
  red: "fill-red-500",
  blue: "fill-blue-500",
};

const filterPaper: ChemGlyph = ({ p }) =>
  p("fold") === 1 ? (
    <path d="M6 6 H84 L45 64 Z" strokeWidth="1.5" className={tone.paper} />
  ) : (
    <circle cx="45" cy="35" r="32" strokeWidth="1.5" className={tone.paper} />
  );

const column: ChemGlyph = () => (
  <>
    <rect x="18" y="4" width="24" height="212" rx="4" className={glassFill} />
    {Array.from({ length: 30 }, (_, index) => (
      <circle
        key={index}
        cx={23 + (index % 3) * 7}
        cy={30 + Math.floor(index / 3) * 18}
        r="3"
        strokeWidth="0.8"
        className={tone.glass}
      />
    ))}
    <rect
      x="18"
      y="4"
      width="24"
      height="212"
      rx="4"
      strokeWidth="2.5"
      className={glassStroke}
    />
  </>
);

const PX_PER_CM = 18;
const PAPER_BOTTOM = 236;

const chromatographyTank: ChemGlyph = ({ v, p }) => {
  const run = chromatogram(v("ink"), v("solvent"), v("base"), p("time"));
  const y = (cm: number) => PAPER_BOTTOM - cm * PX_PER_CM;
  const started = p("time") > 0;
  return (
    <>
      <rect
        x="10"
        y="10"
        width="120"
        height="234"
        rx="4"
        className={glassFill}
      />
      <rect
        x="12"
        y={y(1.5)}
        width="116"
        height={244 - y(1.5)}
        className={
          v("solvent") === 0 ? "fill-sky-300/60" : "fill-violet-200/70"
        }
      />
      <rect
        x="50"
        y="20"
        width="40"
        height={PAPER_BOTTOM - 20}
        strokeWidth="1"
        className={tone.paper}
      />
      {started && !run.washed && (
        <rect
          x="50"
          y={y(run.front)}
          width="40"
          height={PAPER_BOTTOM - y(run.front)}
          className="fill-sky-200/50"
        />
      )}
      <path
        d={`M50 ${y(v("base"))} H90`}
        strokeWidth="1"
        strokeDasharray="3 2"
        className={inkSoft}
      />
      {started && !run.washed && (
        <path
          d={`M50 ${y(run.front)} H90`}
          strokeWidth="1"
          className="stroke-sky-600"
        />
      )}
      {run.washed ? (
        <rect
          x="52"
          y={y(1.5) - 4}
          width="36"
          height="8"
          className="fill-violet-500/40"
        />
      ) : (
        run.spots.map((spot, index) => (
          <ellipse
            key={index}
            cx="70"
            cy={y(started ? spot.position : v("base"))}
            rx={started ? 8 : 5}
            ry={started ? 5 : 4}
            className={
              started
                ? (dyeFill[spot.colour] ?? "fill-slate-500")
                : "fill-slate-800 dark:fill-slate-200"
            }
          />
        ))
      )}
      <rect
        x="10"
        y="10"
        width="120"
        height="234"
        rx="4"
        strokeWidth="2.5"
        className={glassStroke}
      />
      <rect
        x="4"
        y="4"
        width="132"
        height="8"
        rx="2"
        strokeWidth="2"
        className={tone.glass}
      />
    </>
  );
};

const centrifuge: ChemGlyph = ({ p }) => (
  <>
    <rect
      x="6"
      y="34"
      width="128"
      height="72"
      rx="10"
      strokeWidth="2"
      className={tone.light}
    />
    <ellipse
      cx="70"
      cy="34"
      rx="58"
      ry="18"
      strokeWidth="2"
      className={tone.metal}
    />
    <ellipse
      cx="70"
      cy="34"
      rx="36"
      ry="10"
      fill="none"
      strokeWidth="1.5"
      className={inkSoft}
    />
    <circle
      cx="44"
      cy="34"
      r="6"
      className={p("tubeA") > 0 ? "fill-sky-500" : "fill-slate-700"}
    />
    <circle
      cx="96"
      cy="34"
      r="6"
      className={p("tubeB") > 0 ? "fill-sky-500" : "fill-slate-700"}
    />
    <Knob x={110} y={78} />
  </>
);

const sublimation: ChemGlyph = ({ v }) => (
  <>
    <path
      d="M10 70 L80 6 L150 70 Z"
      strokeWidth="2"
      className={`${glassFill} stroke-sky-500`}
    />
    <path
      d="M40 46 L80 10 L120 46"
      fill="none"
      strokeWidth="6"
      className={`stroke-white ${opacityClass(v("sublimed"))}`}
    />
    <rect x="76" y="0" width="8" height="10" className={tone.paper} />
    <path
      d="M10 72 H150 Q146 118 80 118 Q14 118 10 72 Z"
      strokeWidth="2"
      className={tone.light}
    />
    <path
      d="M30 104 Q80 116 130 104 Q120 114 80 114 Q40 114 30 104 Z"
      className="fill-stone-400"
    />
    <path
      d="M40 140 H120"
      strokeWidth="6"
      strokeLinecap="round"
      className={tone.metal}
    />
  </>
);

const magnet: ChemGlyph = () => (
  <>
    <rect
      x="6"
      y="14"
      width="64"
      height="32"
      rx="3"
      strokeWidth="2"
      className={tone.red}
    />
    <rect
      x="70"
      y="14"
      width="64"
      height="32"
      rx="3"
      strokeWidth="2"
      className={tone.blue}
    />
    <Label x={38} y={35}>
      N
    </Label>
    <Label x={102} y={35}>
      S
    </Label>
  </>
);

export const separationGlyphs: Record<SeparationKind, ChemGlyph> = {
  "filter-paper": filterPaper,
  "fractional-column": column,
  "chromatography-tank": chromatographyTank,
  centrifuge,
  "sublimation-setup": sublimation,
  magnet,
};

const balance: ChemGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="70"
      width="192"
      height="56"
      rx="8"
      strokeWidth="2"
      className={tone.light}
    />
    <rect
      x="30"
      y="60"
      width="140"
      height="10"
      rx="3"
      strokeWidth="2"
      className={tone.steel}
    />
    {v("door") === 1 && (
      <path
        d="M20 60 V6 H180 V60"
        fill="none"
        strokeWidth="2"
        className={glassStroke}
      />
    )}
    <Screen
      x={62}
      y={82}
      width={96}
      height={30}
      text={`${v("shown").toFixed(3)} g`}
    />
    <circle
      cx="30"
      cy="96"
      r="9"
      fill="none"
      strokeWidth="1.5"
      className={ink}
    />
    <circle
      cx={v("level") === 1 ? 30 : 34}
      cy={v("level") === 1 ? 96 : 93}
      r="3.5"
      className="fill-lime-500"
    />
    <rect
      x="170"
      y="88"
      width="18"
      height="14"
      rx="3"
      strokeWidth="1.5"
      className={tone.dark}
    />
    <text
      x="179"
      y="98"
      textAnchor="middle"
      fontSize="7"
      className="fill-white font-bold"
    >
      T
    </text>
  </>
);

const thermometer: ChemGlyph = ({ v }) => {
  const y = (celsius: number) =>
    200 - (Math.max(-10, Math.min(110, celsius)) + 10) * 1.5;
  return (
    <>
      <rect
        x="14"
        y="6"
        width="12"
        height="200"
        rx="6"
        strokeWidth="2"
        className={tone.glass}
      />
      <circle
        cx="20"
        cy="208"
        r="9"
        strokeWidth="2"
        className="fill-red-500 stroke-red-700"
      />
      <rect
        x="18"
        y={y(v("reading"))}
        width="4"
        height={206 - y(v("reading"))}
        className="fill-red-500"
      />
      <Ticks
        x={26}
        from={200}
        to={20}
        count={12}
        long={6}
        labels={[
          "-10",
          "",
          "10",
          "",
          "30",
          "",
          "50",
          "",
          "70",
          "",
          "90",
          "",
          "110",
        ]}
      />
    </>
  );
};

const stopwatch: ChemGlyph = ({ v }) => (
  <>
    <rect
      x="52"
      y="4"
      width="16"
      height="14"
      rx="3"
      strokeWidth="2"
      className={tone.metal}
    />
    <circle cx="60" cy="84" r="56" strokeWidth="3" className={tone.light} />
    <Screen
      x={18}
      y={70}
      width={84}
      height={30}
      text={formatClock(v("elapsed"))}
    />
  </>
);

const syringe: ChemGlyph = ({ v }) => {
  const plunger = 20 + Math.min(100, Math.max(0, v("volume"))) * 1.6;
  return (
    <>
      <rect
        x="20"
        y="20"
        width="164"
        height="30"
        rx="3"
        className={glassFill}
      />
      <rect
        x="20"
        y="22"
        width={plunger - 20}
        height="26"
        className="fill-slate-300/40"
      />
      <rect x={plunger} y="20" width="6" height="30" className={tone.dark} />
      <path
        d={`M${plunger + 6} 35 H${plunger + 24}`}
        strokeWidth="5"
        className={ink}
      />
      <rect
        x="20"
        y="20"
        width="164"
        height="30"
        rx="3"
        strokeWidth="2.5"
        className={glassStroke}
      />
      <path d="M4 35 H20" strokeWidth="5" className={glassStroke} />
      {Array.from({ length: 11 }, (_, index) => (
        <g key={index}>
          <path
            d={`M${20 + index * 16} 50 V${index % 5 === 0 ? 58 : 55}`}
            strokeWidth="1"
            className={ink}
          />
          {index % 5 === 0 && (
            <Label x={20 + index * 16} y={68} size={8}>
              {String(index * 10)}
            </Label>
          )}
        </g>
      ))}
      {v("full") === 1 && (
        <Label x={110} y={14} size={9}>
          FULL
        </Label>
      )}
    </>
  );
};

export const measurementGlyphs: Record<MeasurementKind, ChemGlyph> = {
  "electronic-balance": balance,
  thermometer,
  stopwatch,
  "gas-syringe": syringe,
};

const tubeGas = (mL: number) => Math.min(160, (mL / 50) * 160);

const hofmann: ChemGlyph = ({ outcome, v, still }) => {
  const liquid = outcome.liquid;
  const running = v("running") === 1;
  const left = tubeGas(v("gasC"));
  const right = tubeGas(v("gasA"));
  const outline =
    "M30 30 H50 V206 H140 V30 H160 V226 H30 Z M85 6 H105 V206 H85 Z";
  return (
    <>
      <VesselBody
        outline={outline}
        surface={liquid && liquid.level > 0 ? 20 : 240}
        bottom={226}
        left={30}
        right={160}
        liquid={liquid}
        still={still}
      />
      <rect
        x="31"
        y="30"
        width="18"
        height={left}
        className="fill-slate-100 dark:fill-slate-700"
      />
      <rect
        x="141"
        y="30"
        width="18"
        height={right}
        className="fill-slate-100 dark:fill-slate-700"
      />
      <Ticks
        x={50}
        from={30}
        to={190}
        count={10}
        long={5}
        labels={["0", "", "10", "", "20", "", "30", "", "40", "", "50"]}
      />
      <rect
        x="34"
        y="18"
        width="12"
        height="12"
        rx="2"
        strokeWidth="1.5"
        className={tone.dark}
      />
      <rect
        x="144"
        y="18"
        width="12"
        height="12"
        rx="2"
        strokeWidth="1.5"
        className={tone.dark}
      />
      <path
        d="M40 226 V244 M150 226 V244"
        strokeWidth="4"
        className="stroke-slate-400"
      />
      <Label x={40} y={250} size={9}>
        −
      </Label>
      <Label x={150} y={250} size={9}>
        +
      </Label>
      {running && (
        <Bubbles x1={34} x2={46} y={200} amount={0.6} still={still} />
      )}
      {running && (
        <Bubbles x1={144} x2={156} y={200} amount={0.4} still={still} />
      )}
    </>
  );
};

const uTube: ChemGlyph = ({ outcome, v, still }) => {
  const liquid = outcome.liquid;
  const outline =
    "M20 10 V120 A55 55 0 0 0 130 120 V10 H108 V120 A33 33 0 0 1 42 120 V10 Z";
  const running = v("running") === 1;
  return (
    <>
      <VesselBody
        outline={outline}
        surface={surfaceAt(liquid?.level ?? 0, 14, 175)}
        bottom={175}
        left={20}
        right={130}
        liquid={liquid}
        still={still}
      />
      <path
        d="M31 0 V100 M119 0 V100"
        strokeWidth="5"
        className="stroke-slate-700 dark:stroke-slate-300"
      />
      {running && (
        <Bubbles x1={26} x2={36} y={100} amount={0.6} still={still} />
      )}
      {running && (
        <Bubbles x1={114} x2={124} y={100} amount={0.4} still={still} />
      )}
    </>
  );
};

const electrode = (className: string): ChemGlyph =>
  function Electrode({ v, p }) {
    const width = 12 + Math.max(-4, Math.min(4, v("change") * 4));
    return (
      <>
        <rect
          x={20 - width / 2}
          y="20"
          width={width}
          height="146"
          rx="2"
          strokeWidth="1.5"
          className={className}
        />
        <rect
          x="12"
          y="4"
          width="16"
          height="16"
          rx="3"
          strokeWidth="1.5"
          className={p("terminal") === 1 ? tone.red : tone.dark}
        />
      </>
    );
  };

const supply: ChemGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="8"
      width="162"
      height="98"
      rx="8"
      strokeWidth="2"
      className={tone.light}
    />
    <Screen
      x={16}
      y={20}
      width={80}
      height={32}
      text={v("on") === 1 ? `${v("voltage").toFixed(1)} V` : "– –"}
    />
    <Knob x={124} y={36} r={10} />
    <Lamp x={150} y={20} on={v("on") === 1} />
    <circle cx="40" cy="82" r="9" strokeWidth="2" className={tone.red} />
    <circle cx="80" cy="82" r="9" strokeWidth="2" className={tone.dark} />
    <Label x={40} y={102} size={9}>
      +
    </Label>
    <Label x={80} y={102} size={9}>
      −
    </Label>
    {v("running") === 1 && (
      <Label x={130} y={86} size={9}>
        RUN
      </Label>
    )}
  </>
);

const ammeter: ChemGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="4"
      width="82"
      height="92"
      rx="8"
      strokeWidth="2"
      className={tone.light}
    />
    <Screen
      x={12}
      y={18}
      width={66}
      height={30}
      text={`${v("current").toFixed(2)}`}
      small="A"
    />
    <circle cx="26" cy="74" r="8" strokeWidth="2" className={tone.red} />
    <circle cx="64" cy="74" r="8" strokeWidth="2" className={tone.dark} />
  </>
);

const saltBridge: ChemGlyph = ({ v }) => (
  <>
    <path
      d="M14 58 V22 Q14 8 28 8 H142 Q156 8 156 22 V58"
      fill="none"
      strokeWidth="12"
      className="stroke-stone-100 dark:stroke-stone-300"
    />
    <path
      d="M14 58 V22 Q14 8 28 8 H142 Q156 8 156 22 V58"
      fill="none"
      strokeWidth="1.5"
      className={ink}
    />
    <Label x={85} y={34} size={10}>
      {v("emf") !== 0 ? `${v("emf").toFixed(2)} V` : "KNO₃"}
    </Label>
  </>
);

export const electroGlyphs: Record<ElectroKind, ChemGlyph> = {
  "hofmann-voltameter": hofmann,
  "u-tube": uTube,
  "carbon-electrode": electrode(tone.dark),
  "copper-electrode": electrode(tone.copper),
  "dc-power-supply": supply,
  ammeter,
  "salt-bridge": saltBridge,
};
