import { Label } from "../../../workbench/components/glyphs/shapes";
import { ink, inkSoft, tone } from "../../../workbench/components/glyphs/tones";
import type { ChemGlyph } from "../../chemistry.types";
import { emptyContents, liquidView, mix } from "../../engine/contents";
import { flameColours } from "../../data/catalogue/modern";
import type { chemSectionKinds } from "../../data/kinds";
import { reagentTable, type ReagentKind } from "../../data/reagents";
import { vessel } from "./glasswareGlyphs";
import { glassFill, glassStroke } from "./geometry";
import { Box, Hazard, Knob, Lamp, Screen, Trace, WornBadge } from "./pieces";

type SafetyKind = (typeof chemSectionKinds.safety)[number];
type ModernKind = Exclude<
  (typeof chemSectionKinds.modern)[number],
  "buffer-solution" | "standard-solution"
>;

/** Kinds kept in brown glass because light breaks them down. */
const brownGlass: ReagentKind[] = [
  "silver-nitrate",
  "hydrogen-peroxide",
  "potassium-iodide",
  "iodine-solution",
  "nitric-acid",
];

function bottle(kind: ReagentKind): ChemGlyph {
  const reagent = reagentTable[kind];
  return function Bottle({ part }) {
    const contents = mix(
      emptyContents(),
      reagent.pack(
        part,
        reagent.unit === "drops" ? 20 : reagent.unit === "g" ? 6 : 50,
      ),
    );
    const look = liquidView(contents, reagent.unit === "drops" ? 1.5 : 60, 0);
    const hazard = reagent.hazard(part);
    const label = reagent.label(part);
    const brown = brownGlass.includes(kind);
    if (reagent.unit === "drops")
      return (
        <>
          <ellipse
            cx="25"
            cy="12"
            rx="8"
            ry="9"
            strokeWidth="1.5"
            className="fill-red-500 stroke-red-800"
          />
          <rect
            x="18"
            y="20"
            width="14"
            height="12"
            rx="2"
            strokeWidth="1.5"
            className={tone.glass}
          />
          <path
            d="M8 44 Q8 32 20 32 H30 Q42 32 42 44 V86 H8 Z"
            strokeWidth="2"
            className={tone.glass}
          />
          <path d="M10 56 H40 V84 H10 Z" fill={look.colour} />
          <rect
            x="10"
            y="60"
            width="30"
            height="14"
            rx="2"
            className={tone.paper}
            strokeWidth="0.8"
          />
          <text
            x="25"
            y="70"
            textAnchor="middle"
            fontSize="6"
            className="fill-slate-900 font-bold"
          >
            {label.slice(0, 10)}
          </text>
        </>
      );
    if (reagent.unit === "g") {
      const solid = look.deposit[0]?.colour ?? "rgba(200,200,200,0.9)";
      return (
        <>
          <rect
            x="10"
            y="10"
            width="50"
            height="14"
            rx="3"
            strokeWidth="2"
            className={tone.dark}
          />
          <rect
            x="6"
            y="24"
            width="58"
            height="82"
            rx="8"
            strokeWidth="2"
            className={tone.glass}
          />
          <rect x="9" y="62" width="52" height="42" rx="6" fill={solid} />
          <rect
            x="12"
            y="34"
            width="46"
            height="22"
            rx="3"
            strokeWidth="1"
            className={tone.paper}
          />
          <text
            x="35"
            y="49"
            textAnchor="middle"
            fontSize="10"
            className="fill-slate-900 font-black"
          >
            {label}
          </text>
          {hazard >= 2 && <Hazard x={52} y={92} />}
        </>
      );
    }
    return (
      <>
        <rect
          x="26"
          y="4"
          width="18"
          height="14"
          rx="3"
          strokeWidth="2"
          className={brown ? "fill-amber-900 stroke-amber-950" : tone.glass}
        />
        <path
          d="M27 18 H43 V28 Q66 34 66 52 V106 H4 V52 Q4 34 27 28 Z"
          strokeWidth="2"
          className={brown ? "fill-amber-800/80 stroke-amber-950" : tone.glass}
        />
        {!brown && <path d="M6 60 H64 V104 H6 Z" fill={look.colour} />}
        <rect
          x="9"
          y="56"
          width="52"
          height="26"
          rx="3"
          strokeWidth="1"
          className={tone.paper}
        />
        <text
          x="35"
          y="72"
          textAnchor="middle"
          fontSize={label.length > 12 ? 7 : 9}
          className="fill-slate-900 font-black"
        >
          {label}
        </text>
        {hazard >= 2 && <Hazard x={56} y={94} />}
      </>
    );
  };
}

export const reagentGlyphs = Object.fromEntries(
  (Object.keys(reagentTable) as ReagentKind[]).map((kind) => [
    kind,
    bottle(kind),
  ]),
) as Record<ReagentKind, ChemGlyph>;

const labCoat: ChemGlyph = ({ v }) => (
  <>
    <path
      d="M30 6 L50 20 L70 6 L96 26 L86 50 L78 44 V116 H22 V44 L14 50 L4 26 Z"
      strokeWidth="2"
      className={tone.paper}
    />
    <path d="M50 20 V116" strokeWidth="1.5" className={inkSoft} />
    <WornBadge x={86} y={100} worn={v("worn") === 1} />
  </>
);

const goggles: ChemGlyph = ({ v }) => (
  <>
    <path
      d="M4 22 Q4 8 26 8 H74 Q96 8 96 22 V30 Q96 44 74 44 Q60 44 54 36 H46 Q40 44 26 44 Q4 44 4 30 Z"
      strokeWidth="2"
      className="fill-sky-100/80 stroke-slate-700 dark:fill-sky-900/60 dark:stroke-slate-300"
    />
    <WornBadge x={90} y={10} worn={v("worn") === 1} />
  </>
);

const gloves: ChemGlyph = ({ v }) => (
  <>
    <path
      d="M24 96 V54 L14 34 Q12 28 18 28 L28 44 V14 Q28 8 34 8 Q40 8 40 14 V40 V10 Q40 4 46 4 Q52 4 52 10 V40 V14 Q52 8 58 8 Q64 8 64 14 V44 V22 Q64 16 70 16 Q76 16 76 22 V70 L68 96 Z"
      strokeWidth="2"
      className="fill-violet-300 stroke-violet-700 dark:fill-violet-700 dark:stroke-violet-300"
    />
    <WornBadge x={80} y={86} worn={v("worn") === 1} />
  </>
);

const fumeCupboard: ChemGlyph = ({ p }) => (
  <>
    <rect
      x="4"
      y="4"
      width="252"
      height="202"
      rx="6"
      strokeWidth="2"
      className={tone.light}
    />
    <rect
      x="18"
      y="40"
      width="224"
      height="130"
      rx="3"
      strokeWidth="2"
      className={`${glassFill} stroke-sky-500`}
    />
    <path d="M18 100 H242" strokeWidth="3" className={ink} />
    <circle
      cx="130"
      cy="22"
      r="12"
      fill="none"
      strokeWidth="2"
      className={ink}
    />
    <path
      d="M130 10 Q138 22 130 22 Q122 22 130 34 M118 22 Q130 14 130 22 Q130 30 142 22"
      fill="none"
      strokeWidth="1.5"
      className={p("fan") === 1 ? "stroke-green-600" : inkSoft}
    />
    <Lamp x={230} y={22} on={p("fan") === 1} />
    <rect x="18" y="176" width="224" height="24" className={tone.metal} />
  </>
);

const extinguisher: ChemGlyph = () => (
  <>
    <rect
      x="16"
      y="40"
      width="40"
      height="126"
      rx="12"
      strokeWidth="2"
      className={tone.red}
    />
    <rect
      x="28"
      y="20"
      width="16"
      height="22"
      rx="2"
      strokeWidth="2"
      className={tone.dark}
    />
    <path d="M36 24 H64 V60" fill="none" strokeWidth="4" className={ink} />
    <rect x="22" y="80" width="28" height="24" rx="2" className={tone.paper} />
    <text
      x="36"
      y="96"
      textAnchor="middle"
      fontSize="8"
      className="fill-slate-900 font-black"
    >
      CO₂
    </text>
  </>
);

const blanket: ChemGlyph = () => (
  <>
    <rect
      x="10"
      y="10"
      width="80"
      height="94"
      rx="6"
      strokeWidth="2"
      className={tone.red}
    />
    <path d="M30 104 V108 M70 104 V108" strokeWidth="4" className={ink} />
    <text
      x="50"
      y="60"
      textAnchor="middle"
      fontSize="11"
      className="fill-white font-black"
    >
      FIRE
    </text>
    <text
      x="50"
      y="74"
      textAnchor="middle"
      fontSize="9"
      className="fill-white font-bold"
    >
      BLANKET
    </text>
  </>
);

const sandBucket: ChemGlyph = () => (
  <>
    <path d="M10 20 H80 L72 96 H18 Z" strokeWidth="2" className={tone.red} />
    <ellipse cx="45" cy="22" rx="34" ry="6" className="fill-amber-300" />
    <path
      d="M10 20 Q45 -10 80 20"
      fill="none"
      strokeWidth="2"
      className={ink}
    />
    <text
      x="45"
      y="64"
      textAnchor="middle"
      fontSize="12"
      className="fill-white font-black"
    >
      SAND
    </text>
  </>
);

const eyeWash: ChemGlyph = () => (
  <>
    <rect
      x="10"
      y="10"
      width="80"
      height="84"
      rx="10"
      strokeWidth="2"
      className={tone.green}
    />
    <path
      d="M26 52 Q50 30 74 52 Q50 74 26 52 Z"
      strokeWidth="2"
      className="fill-white stroke-white"
    />
    <circle cx="50" cy="52" r="8" className="fill-green-700" />
  </>
);

const shower: ChemGlyph = () => (
  <>
    <path
      d="M20 186 V20 H62"
      fill="none"
      strokeWidth="6"
      className="stroke-green-700 dark:stroke-green-500"
    />
    <path d="M48 20 H82 L76 34 H54 Z" strokeWidth="2" className={tone.green} />
    <path d="M66 34 V90" strokeWidth="1.5" className={ink} />
    <path d="M58 90 H74 L66 100 Z" className={tone.green} />
  </>
);

const firstAid: ChemGlyph = () => (
  <>
    <rect
      x="6"
      y="16"
      width="88"
      height="60"
      rx="6"
      strokeWidth="2"
      className={tone.green}
    />
    <rect
      x="38"
      y="6"
      width="24"
      height="12"
      rx="3"
      fill="none"
      strokeWidth="3"
      className="stroke-green-800"
    />
    <path
      d="M44 34 H56 V40 H62 V52 H56 V58 H44 V52 H38 V40 H44 Z"
      className="fill-white"
    />
  </>
);

const wasteLabels = ["ACID / ALKALI", "HEAVY METAL", "SOLVENT", "GENERAL"];

const waste: ChemGlyph = ({ p }) => (
  <>
    <rect
      x="12"
      y="10"
      width="66"
      height="14"
      rx="3"
      strokeWidth="2"
      className={tone.dark}
    />
    <rect
      x="8"
      y="22"
      width="74"
      height="94"
      rx="6"
      strokeWidth="2"
      className="fill-yellow-300 stroke-yellow-700 dark:fill-yellow-600"
    />
    <rect x="14" y="54" width="62" height="24" rx="2" className={tone.paper} />
    <text
      x="45"
      y="64"
      textAnchor="middle"
      fontSize="7"
      className="fill-slate-900 font-black"
    >
      WASTE
    </text>
    <text
      x="45"
      y="74"
      textAnchor="middle"
      fontSize="6"
      className="fill-slate-900 font-bold"
    >
      {wasteLabels[p("label")] ?? wasteLabels[3]}
    </text>
  </>
);

export const safetyGlyphs: Record<SafetyKind, ChemGlyph> = {
  "lab-coat": labCoat,
  "safety-goggles": goggles,
  gloves,
  "fume-cupboard": fumeCupboard,
  "fire-extinguisher": extinguisher,
  "fire-blanket": blanket,
  "sand-bucket": sandBucket,
  "eye-wash": eyeWash,
  "safety-shower": shower,
  "first-aid-kit": firstAid,
  "waste-container": waste,
};

const meter = (unit: string, digits: number): ChemGlyph =>
  function Meter({ v }) {
    const shown = v("shown");
    const dipped = v("dipped") === 1;
    return (
      <>
        <Box x={4} y={30} width={96} height={130} />
        <Screen
          x={12}
          y={42}
          width={80}
          height={36}
          text={shown < 0 ? "– – –" : shown.toFixed(digits)}
          small={unit}
        />
        <Knob x={30} y={110} />
        <Knob x={72} y={110} />
        <path
          d="M100 60 Q124 40 128 20"
          fill="none"
          strokeWidth="2.5"
          className={ink}
        />
        <rect
          x="122"
          y="20"
          width="12"
          height="130"
          rx="5"
          strokeWidth="2"
          className={tone.dark}
        />
        <rect
          x="124"
          y="140"
          width="8"
          height="14"
          rx="3"
          className={dipped ? "fill-sky-400" : "fill-slate-300"}
        />
      </>
    );
  };

const dataLogger: ChemGlyph = ({ outcome, v }) => (
  <>
    <Box x={4} y={4} width={162} height={122} />
    <Trace plot={outcome.plot} x={14} y={14} width={142} height={70} />
    <Label x={60} y={106} size={11}>
      {`${v("value").toFixed(1)}`}
    </Label>
    <Label x={130} y={106} size={9}>
      {`${v("points")} pts`}
    </Label>
  </>
);

const cuvette = vessel({
  outline: "M8 6 H36 V86 H8 Z",
  top: 10,
  bottom: 86,
  left: 8,
  right: 36,
  extras: () => (
    <path
      d="M8 6 V86 M36 6 V86"
      strokeWidth="4"
      className="stroke-slate-300/70"
    />
  ),
});

const spectrum = [
  "fill-violet-500",
  "fill-blue-500",
  "fill-cyan-400",
  "fill-green-500",
  "fill-yellow-400",
  "fill-orange-500",
  "fill-red-600",
];

const colorimeter: ChemGlyph = ({ v }) => {
  const shown = v("shown");
  const marker = 20 + ((v("wavelength") - 400) / 300) * 140;
  return (
    <>
      <Box x={4} y={24} width={182} height={102} />
      <rect
        x="140"
        y="6"
        width="26"
        height="30"
        rx="2"
        strokeWidth="2"
        className={tone.dark}
      />
      <Screen
        x={16}
        y={36}
        width={110}
        height={34}
        text={shown < -5 ? "– – –" : shown.toFixed(3)}
        small={`A @ ${v("wavelength")} nm`}
      />
      {spectrum.map((colour, index) => (
        <rect
          key={colour}
          x={20 + index * 20}
          y="88"
          width="20"
          height="10"
          className={colour}
        />
      ))}
      <path d={`M${marker} 84 V104`} strokeWidth="2" className={ink} />
    </>
  );
};

const reservoir = vessel({
  outline: "M30 10 H90 V110 H30 Z",
  top: 12,
  bottom: 110,
  left: 30,
  right: 90,
});

const autoBurette: ChemGlyph = (props) => (
  <>
    {reservoir(props)}
    <Box x={14} y={120} width={92} height={100} />
    <Screen
      x={22}
      y={132}
      width={76}
      height={30}
      text={props.v("dispensed").toFixed(2)}
      small="mL"
    />
    <path
      d="M106 150 H116 V220"
      fill="none"
      strokeWidth="2"
      className={glassStroke}
    />
    <Knob x={40} y={192} />
    <Knob x={80} y={192} />
  </>
);

const stirrer: ChemGlyph = ({ v }) => {
  const stir = v("stir");
  return (
    <>
      <rect
        x="4"
        y="18"
        width="142"
        height="48"
        rx="6"
        strokeWidth="2"
        className={tone.light}
      />
      <rect
        x="14"
        y="8"
        width="122"
        height="12"
        rx="3"
        strokeWidth="2"
        className={
          v("hot") === 1 ? "fill-red-500/80 stroke-red-700" : tone.steel
        }
      />
      <rect
        x="62"
        y="10"
        width="26"
        height="6"
        rx="3"
        className="fill-white stroke-slate-500"
        strokeWidth="1"
      />
      <Knob x={30} y={44} />
      <Knob x={120} y={44} />
      {stir > 0 &&
        Array.from({ length: Math.ceil(stir / 3) }, (_, index) => (
          <path
            key={index}
            d={`M${60 - index * 6} ${4 - index * 2} Q75 ${-2 - index * 2} ${90 + index * 6} ${4 - index * 2}`}
            fill="none"
            strokeWidth="1.5"
            className={inkSoft}
          />
        ))}
    </>
  );
};

const rotary: ChemGlyph = ({ v }) => (
  <>
    <rect
      x="120"
      y="110"
      width="94"
      height="54"
      rx="6"
      strokeWidth="2"
      className={tone.metal}
    />
    <rect x="126" y="116" width="82" height="26" className="fill-sky-300/70" />
    <Label x={167} y={158} size={9}>{`${v("bath")}°C`}</Label>
    <path d="M60 60 L150 110" strokeWidth="6" className={glassStroke} />
    <circle
      cx="160"
      cy="118"
      r="22"
      strokeWidth="2.5"
      className={`${glassFill} stroke-sky-500`}
    />
    <rect
      x="30"
      y="10"
      width="26"
      height="90"
      rx="6"
      strokeWidth="2"
      className={`${glassFill} stroke-sky-500`}
    />
    {Array.from({ length: 6 }, (_, index) => (
      <path
        key={index}
        d={`M34 ${22 + index * 12} Q43 ${16 + index * 12} 52 ${22 + index * 12}`}
        fill="none"
        strokeWidth="1.5"
        className="stroke-sky-600"
      />
    ))}
    <circle
      cx="43"
      cy="134"
      r="22"
      strokeWidth="2.5"
      className={`${glassFill} stroke-sky-500`}
    />
    <path d="M43 100 V112" strokeWidth="4" className={glassStroke} />
    <rect
      x="66"
      y="40"
      width="40"
      height="22"
      rx="4"
      strokeWidth="2"
      className={tone.dark}
    />
    <Lamp x={98} y={51} on={v("rotate") === 1} />
    <Lamp x={76} y={51} on={v("vacuum") === 1} />
  </>
);

const meltingPoint: ChemGlyph = ({ v }) => {
  const melted = Math.max(0, Math.min(1, v("melted")));
  return (
    <>
      <Box x={4} y={40} width={142} height={124} />
      <circle cx="40" cy="22" r="16" strokeWidth="2" className={tone.dark} />
      <circle cx="40" cy="22" r="9" className="fill-sky-200" />
      <rect
        x="20"
        y="56"
        width="40"
        height="80"
        rx="4"
        className={tone.screen}
      />
      <rect
        x="36"
        y="66"
        width="8"
        height="60"
        rx="3"
        strokeWidth="1"
        className={tone.glass}
      />
      <rect
        x="37"
        y="110"
        width="6"
        height="14"
        className={
          melted >= 1
            ? "fill-sky-100/60"
            : melted > 0
              ? "fill-slate-300"
              : "fill-white"
        }
      />
      <Screen
        x={70}
        y={60}
        width={68}
        height={30}
        text={`${v("block").toFixed(1)}`}
        small="°C"
      />
      <Knob x={90} y={130} />
      <Knob x={122} y={130} />
    </>
  );
};

const flameTest: ChemGlyph = ({ v }) => {
  const flame = v("flame");
  const lit = v("lit") === 1;
  return (
    <>
      <rect
        x="80"
        y="40"
        width="66"
        height="12"
        rx="4"
        strokeWidth="2"
        className={tone.wood}
      />
      <path d="M80 46 H30" strokeWidth="2" className="stroke-slate-500" />
      <circle
        cx="24"
        cy="46"
        r="6"
        fill="none"
        strokeWidth="2"
        className="stroke-slate-500"
      />
      {lit && flame > 0 && (
        <circle
          cx="24"
          cy="40"
          r="20"
          fill={flameColours[flame]}
          className="opacity-70"
        />
      )}
    </>
  );
};

const instrument = (title: string): ChemGlyph =>
  function Instrument({ outcome }) {
    return (
      <>
        <Box x={4} y={4} width={192} height={132} />
        <Trace plot={outcome.plot} x={14} y={14} width={172} height={84} />
        <Label x={100} y={122} size={11}>
          {title}
        </Label>
      </>
    );
  };

const microscale: ChemGlyph = ({ outcome }) => {
  const level = outcome.liquid?.level ?? 0;
  const filledWells = Math.ceil(level * 8);
  return (
    <>
      <rect
        x="4"
        y="10"
        width="142"
        height="62"
        rx="8"
        strokeWidth="2"
        className={tone.light}
      />
      {Array.from({ length: 8 }, (_, index) => (
        <circle
          key={index}
          cx={24 + (index % 4) * 34}
          cy={index < 4 ? 30 : 54}
          r="10"
          strokeWidth="1.5"
          className={
            index < filledWells
              ? "stroke-sky-500"
              : `${glassFill} stroke-sky-500`
          }
          fill={index < filledWells ? outcome.liquid?.colour : undefined}
        />
      ))}
    </>
  );
};

export const modernGlyphs: Record<ModernKind, ChemGlyph> = {
  "ph-meter": meter("pH", 2),
  "conductivity-meter": meter("µS/cm", 0),
  "data-logger": dataLogger,
  cuvette,
  colorimeter,
  "auto-burette": autoBurette,
  "magnetic-stirrer": stirrer,
  "rotary-evaporator": rotary,
  "melting-point-apparatus": meltingPoint,
  "flame-test-kit": flameTest,
  "gas-chromatograph": instrument("GC"),
  "mass-spectrometer": instrument("MS"),
  "ir-spectrometer": instrument("IR"),
  "microscale-kit": microscale,
};
