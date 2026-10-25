import { Label } from "../../../workbench/components/glyphs/shapes";
import {
  ink,
  opacityClass,
  tone,
} from "../../../workbench/components/glyphs/tones";
import {
  glassFill,
  glassStroke,
  surfaceAt,
} from "../../../chemistry-bench/components/glyphs/geometry";
import {
  Bubbles,
  Knob,
  Lamp,
  Screen,
  Ticks,
  Trace,
  VesselBody,
} from "../../../chemistry-bench/components/glyphs/pieces";
import type { BioGlyph } from "../../biology.types";
import { BottleArt } from "./bioPieces";
import type { bioSectionKinds } from "../../data/kinds";

type FoodKind = (typeof bioSectionKinds.food)[number];
type PhysiologyKind = (typeof bioSectionKinds.physiology)[number];

type Shape = {
  outline: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/** A tube or beaker with the liquid its analysis describes. */
function tube(shape: Shape): BioGlyph {
  return function Tube({ outcome, still }) {
    const liquid = outcome.liquid;
    const surface = surfaceAt(liquid?.level ?? 0, shape.top, shape.bottom);
    const oilTop =
      liquid && liquid.oilLevel > 0
        ? surface - liquid.oilLevel * (shape.bottom - shape.top)
        : undefined;
    return (
      <VesselBody
        outline={shape.outline}
        surface={surface}
        bottom={shape.bottom}
        left={shape.left}
        right={shape.right}
        liquid={liquid}
        still={still}
        oilTop={oilTop}
      />
    );
  };
}

const testTube = tube({
  outline: "M8 4 H32 V132 A12 12 0 0 1 8 132 Z",
  top: 12,
  bottom: 144,
  left: 8,
  right: 32,
});
const boilingTube = tube({
  outline: "M8 4 H42 V150 A17 17 0 0 1 8 150 Z",
  top: 14,
  bottom: 167,
  left: 8,
  right: 42,
});
const beaker = tube({
  outline:
    "M10 8 Q14 12 16 14 L18 134 Q18 138 22 138 H98 Q102 138 102 134 L104 14 Q106 12 110 8 Z",
  top: 22,
  bottom: 138,
  left: 14,
  right: 106,
});

const rack: BioGlyph = () => (
  <>
    <rect
      x="4"
      y="20"
      width="232"
      height="18"
      rx="3"
      strokeWidth="2"
      className={tone.wood}
    />
    <rect
      x="4"
      y="80"
      width="232"
      height="16"
      rx="3"
      strokeWidth="2"
      className={tone.wood}
    />
    <path
      d="M10 38 V80 M230 38 V80"
      strokeWidth="6"
      className="stroke-amber-700"
    />
    {[34, 74, 114, 154, 194].map((x) => (
      <ellipse
        key={x}
        cx={x}
        cy="29"
        rx="12"
        ry="5"
        className="fill-amber-900"
      />
    ))}
  </>
);

const waterBath: BioGlyph = ({ v, still }) => (
  <>
    <rect
      x="4"
      y="20"
      width="162"
      height="76"
      rx="6"
      strokeWidth="2"
      className={tone.metal}
    />
    <rect
      x="12"
      y="24"
      width="146"
      height="24"
      className="fill-sky-300/70 dark:fill-sky-700/70"
    />
    {v("temp") > 95 && (
      <Bubbles x1={20} x2={150} y={46} amount={0.8} still={still} />
    )}
    {[34, 64, 94, 124].map((x) => (
      <ellipse
        key={x}
        cx={x}
        cy="20"
        rx="13"
        ry="4"
        fill="none"
        strokeWidth="2"
        className={ink}
      />
    ))}
    <Screen
      x={16}
      y={58}
      width={70}
      height={28}
      text={`${v("temp").toFixed(0)}°C`}
    />
    <Knob x={110} y={72} />
    <Lamp x={146} y={72} on={v("on") === 1} />
  </>
);

const thermometer: BioGlyph = ({ v }) => {
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

const bottle =
  (fill: string, label: string): BioGlyph =>
  () => <BottleArt fill={fill} label={label} />;

const sampleFills = [
  "fill-sky-100/60",
  "fill-stone-100",
  "fill-amber-50",
  "fill-amber-300/80",
  "fill-sky-100/60",
  "fill-white",
  "fill-orange-400/80",
  "fill-sky-100/60",
  "fill-sky-100/50",
  "fill-stone-200",
];
const sampleLabels = [
  "glucose",
  "starch",
  "albumen",
  "oil",
  "sucrose",
  "milk",
  "juice",
  "vit C",
  "water",
  "food X",
];

const foodSample: BioGlyph = ({ p }) => (
  <BottleArt
    fill={sampleFills[p("sample")] ?? sampleFills[0]}
    label={sampleLabels[p("sample")] ?? "food"}
  />
);

export const foodGlyphs: Record<FoodKind, BioGlyph> = {
  "test-tube": testTube,
  "boiling-tube": boilingTube,
  "test-tube-rack": rack,
  "water-bath": waterBath,
  thermometer,
  "food-sample": foodSample,
  "benedicts-solution": bottle("fill-blue-500/80", "Benedict's"),
  "iodine-solution": bottle("fill-amber-700/80", "iodine"),
  "biuret-reagent": bottle("fill-sky-400/70", "Biuret"),
  "sudan-iii": bottle("fill-red-600/80", "Sudan III"),
  ethanol: bottle("fill-sky-100/50", "ethanol"),
  dcpip: bottle("fill-indigo-600/80", "DCPIP"),
  "dilute-hcl": bottle("fill-sky-100/50", "HCl"),
  "sodium-hydrogen-carbonate": bottle("fill-white", "NaHCO₃"),
  amylase: bottle("fill-amber-100/70", "amylase"),
  catalase: bottle("fill-stone-300/70", "catalase"),
  pepsin: bottle("fill-amber-100/70", "pepsin"),
  "hydrogen-peroxide": bottle("fill-sky-100/50", "H₂O₂"),
};

/* --------------------------------------------------------------- physiology */

const balance: BioGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="62"
      width="172"
      height="54"
      rx="8"
      strokeWidth="2"
      className={tone.light}
    />
    <rect
      x="30"
      y="52"
      width="120"
      height="10"
      rx="3"
      strokeWidth="2"
      className={tone.steel}
    />
    {v("door") === 1 && (
      <path
        d="M20 52 V6 H160 V52"
        fill="none"
        strokeWidth="2"
        className={glassStroke}
      />
    )}
    <Screen
      x={56}
      y={74}
      width={90}
      height={28}
      text={`${v("shown").toFixed(2)} g`}
    />
    <circle
      cx="30"
      cy="88"
      r="9"
      fill="none"
      strokeWidth="1.5"
      className={ink}
    />
    <circle
      cx={v("level") === 1 ? 30 : 34}
      cy={v("level") === 1 ? 88 : 85}
      r="3.5"
      className="fill-lime-500"
    />
  </>
);

const potometer: BioGlyph = ({ v }) => {
  const x = 40 + Math.min(100, v("position")) * 1.8;
  return (
    <>
      <path
        d="M40 150 H222"
        strokeWidth="6"
        className="stroke-sky-200 dark:stroke-sky-800"
      />
      <path d="M40 150 H222" strokeWidth="1.5" className={glassStroke} />
      {Array.from({ length: 11 }, (_, index) => (
        <path
          key={index}
          d={`M${40 + index * 18} 156 V${index % 5 === 0 ? 164 : 160}`}
          strokeWidth="1"
          className={ink}
        />
      ))}
      {v("bubble") === 1 && (
        <ellipse
          cx={x}
          cy="150"
          rx="5"
          ry="3"
          className="fill-white stroke-slate-500"
          strokeWidth="1"
        />
      )}
      <path
        d="M40 150 V70 M222 150 V120"
        strokeWidth="6"
        className="stroke-sky-200 dark:stroke-sky-800"
      />
      <rect
        x="200"
        y="80"
        width="40"
        height="40"
        rx="4"
        strokeWidth="2"
        className={tone.glass}
      />
      <path d="M40 70 V20" strokeWidth="4" className="stroke-green-800" />
      {[
        [22, 30],
        [58, 26],
        [26, 52],
        [56, 48],
      ].map(([cx, cy]) => (
        <ellipse
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          rx="14"
          ry="6"
          className="fill-green-500 stroke-green-700"
          strokeWidth="1"
        />
      ))}
      <rect
        x="32"
        y="66"
        width="16"
        height="10"
        rx="2"
        className="fill-red-800"
      />
    </>
  );
};

const respirometer: BioGlyph = ({ v }) => {
  const level = Math.min(60, v("level"));
  return (
    <>
      <rect
        x="10"
        y="20"
        width="44"
        height="110"
        rx="10"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect x="14" y="94" width="36" height="32" className="fill-amber-300" />
      <path
        d="M14 80 H50"
        strokeWidth="2"
        strokeDasharray="3 2"
        className="stroke-slate-500"
      />
      <rect x="14" y="58" width="36" height="20" className="fill-slate-100" />
      <path
        d="M54 40 H200 V120 H90"
        fill="none"
        strokeWidth="6"
        className="stroke-sky-200 dark:stroke-sky-800"
      />
      <path
        d={`M${200 - level * 1.6} 40 H200`}
        strokeWidth="5"
        className="stroke-red-500"
      />
      <rect
        x="156"
        y="8"
        width="16"
        height="22"
        rx="3"
        className={v("closed") === 1 ? tone.dark : tone.metal}
      />
      <Label x={130} y={140} size={9}>
        {"← fluid"}
      </Label>
    </>
  );
};

const bellJar: BioGlyph = ({ v }) => {
  const pull = v("pull") / 100;
  return (
    <>
      <path
        d="M20 170 V60 Q20 10 80 10 Q140 10 140 60 V170"
        strokeWidth="2.5"
        className={`${glassFill} stroke-sky-500`}
      />
      <path
        d="M80 10 V60 M80 60 L60 80 M80 60 L100 80"
        fill="none"
        strokeWidth="3"
        className={ink}
      />
      <ellipse
        cx="60"
        cy={92 + pull * 4}
        rx={12 + pull * 10}
        ry={14 + pull * 12}
        className="fill-pink-300 stroke-pink-600"
        strokeWidth="1.5"
      />
      <ellipse
        cx="100"
        cy={92 + pull * 4}
        rx={12 + pull * 10}
        ry={14 + pull * 12}
        className="fill-pink-300 stroke-pink-600"
        strokeWidth="1.5"
      />
      <path
        d={`M20 170 Q80 ${170 + pull * 26} 140 170`}
        fill="none"
        strokeWidth="3"
        className="stroke-amber-700"
      />
      <path
        d={`M80 ${170 + pull * 13} V${186 + pull * 13}`}
        strokeWidth="3"
        className={ink}
      />
    </>
  );
};

const visking: BioGlyph = ({ v }) => (
  <>
    <path
      d="M10 30 L16 154 H114 L120 30 Z"
      strokeWidth="2"
      className={tone.glass}
    />
    <path
      d="M13 60 L16 154 H114 L117 60 Z"
      className={v("started") === 1 ? "fill-sky-200/60" : "fill-transparent"}
    />
    <path
      d="M54 10 V40 Q40 80 46 130 Q65 146 84 130 Q90 80 76 40 V10"
      strokeWidth="2"
      className={
        v("black") === 1
          ? "fill-slate-900/90 stroke-slate-500"
          : "fill-stone-100/80 stroke-slate-400"
      }
    />
    <path d="M50 14 H80" strokeWidth="3" className={ink} />
  </>
);

const thistle: BioGlyph = ({ v }) => {
  const top = 120 - Math.min(100, v("height") * 1.2);
  return (
    <>
      <path
        d="M10 210 L14 140 H76 L80 210 Z"
        strokeWidth="2"
        className={tone.glass}
      />
      <path d="M12 170 L14 208 H76 L78 170 Z" className="fill-sky-200/60" />
      <path
        d="M20 180 Q45 210 70 180 Q70 160 45 150 Q20 160 20 180 Z"
        strokeWidth="2"
        className="fill-amber-100/80 stroke-slate-500"
      />
      <path
        d="M42 150 V10 M48 150 V10"
        strokeWidth="1.5"
        className={glassStroke}
      />
      <rect
        x="43"
        y={top}
        width="4"
        height={150 - top}
        className="fill-amber-200"
      />
      <Ticks
        x={50}
        from={120}
        to={20}
        count={10}
        long={5}
        labels={["0", "", "", "", "", "50", "", "", "", "", "100"]}
      />
    </>
  );
};

const corkBorer: BioGlyph = () => (
  <>
    <rect
      x="80"
      y="8"
      width="44"
      height="14"
      rx="3"
      className={tone.brass}
      strokeWidth="1.5"
    />
    <path d="M80 15 H8" strokeWidth="9" className="stroke-yellow-600" />
    <path d="M80 15 H8" strokeWidth="5" className="stroke-yellow-200" />
  </>
);

const tissue: BioGlyph = ({ v }) => {
  if (v("cut") === 0)
    return (
      <ellipse
        cx="45"
        cy="25"
        rx="40"
        ry="20"
        strokeWidth="2"
        className={
          v("tissue") === 1
            ? "fill-orange-500 stroke-orange-700"
            : "fill-amber-200 stroke-amber-700"
        }
      />
    );
  const length = 60 * (1 + v("change") * 0.4);
  const uneven = v("cut") === 2;
  return (
    <>
      <rect
        x={45 - length / 2}
        y="18"
        width={length}
        height="14"
        rx={uneven ? 2 : 6}
        strokeWidth="1.5"
        className={
          v("tissue") === 1
            ? "fill-orange-400 stroke-orange-700"
            : "fill-amber-100 stroke-amber-600"
        }
      />
      {uneven && (
        <rect
          x={45 - length / 2 + 6}
          y="34"
          width={length * 0.7}
          height="10"
          rx="2"
          strokeWidth="1.5"
          className="fill-amber-100 stroke-amber-600"
        />
      )}
    </>
  );
};

const indicatorTubes: BioGlyph = ({ v }) => {
  const shift = v("shift");
  const fill =
    shift < -0.4
      ? "fill-purple-600/80"
      : shift > 0.4
        ? "fill-yellow-400/80"
        : "fill-red-500/70";
  return (
    <>
      <path
        d="M40 10 H80 V130 A20 20 0 0 1 40 130 Z"
        strokeWidth="2"
        className={tone.glass}
      />
      <path d="M42 90 H78 V130 A18 18 0 0 1 42 130 Z" className={fill} />
      <path
        d="M44 60 H76"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        className="stroke-slate-500"
      />
      <ellipse
        cx="60"
        cy="44"
        rx="14"
        ry="6"
        className="fill-green-500 stroke-green-700"
        strokeWidth="1"
      />
      <rect
        x="36"
        y="2"
        width="48"
        height="10"
        rx="2"
        className="fill-red-800"
      />
    </>
  );
};

const limewater: BioGlyph = ({ v }) => (
  <>
    {[0, 1].map((index) => {
      const x = index === 0 ? 20 : 96;
      const milk = index === 0 ? v("a") : v("b");
      return (
        <g key={index}>
          <path
            d={`M${x} 40 H${x + 44} V130 A22 22 0 0 1 ${x} 130 Z`}
            strokeWidth="2"
            className={tone.glass}
          />
          <path
            d={`M${x + 2} 80 H${x + 42} V130 A20 20 0 0 1 ${x + 2} 130 Z`}
            className="fill-sky-100/60"
          />
          <path
            d={`M${x + 2} 80 H${x + 42} V130 A20 20 0 0 1 ${x + 2} 130 Z`}
            className={`fill-white ${opacityClass(milk)}`}
          />
          <Label x={x + 22} y={30} size={11}>
            {index === 0 ? "A" : "B"}
          </Label>
        </g>
      );
    })}
    <path
      d="M42 40 V110 M118 40 V110 M42 20 Q80 0 118 20"
      fill="none"
      strokeWidth="2"
      className={glassStroke}
    />
  </>
);

const klinostat: BioGlyph = ({ v }) => {
  const length = v("length");
  const rootAngle = (v("root") * Math.PI) / 180;
  const shootAngle = (v("shoot") * Math.PI) / 180;
  return (
    <>
      <rect
        x="10"
        y="100"
        width="70"
        height="40"
        rx="6"
        strokeWidth="2"
        className={tone.light}
      />
      <circle
        cx="110"
        cy="70"
        r="54"
        strokeWidth="2"
        className="fill-stone-100 stroke-stone-400 dark:fill-stone-700"
      />
      <path d="M80 120 H100" strokeWidth="6" className={ink} />
      {v("started") === 1 && (
        <>
          <ellipse
            cx="110"
            cy="70"
            rx="8"
            ry="6"
            className="fill-amber-200 stroke-amber-600"
            strokeWidth="1"
          />
          <path
            d={`M118 70 Q${118 + length * 0.5} 70 ${118 + length * Math.cos(rootAngle)} ${70 + length * Math.sin(rootAngle)}`}
            fill="none"
            strokeWidth="3"
            className="stroke-amber-100 dark:stroke-amber-200"
          />
          <path
            d={`M102 70 Q${102 - length * 0.5} 70 ${102 - length * Math.cos(shootAngle)} ${70 - length * Math.sin(shootAngle)}`}
            fill="none"
            strokeWidth="3"
            className="stroke-green-600"
          />
        </>
      )}
    </>
  );
};

const lamp: BioGlyph = ({ v }) => (
  <>
    {v("on") === 1 && (
      <circle cx="30" cy="40" r="28" className="fill-yellow-200/60" />
    )}
    <path
      d="M8 22 L52 22 L44 50 L16 50 Z"
      strokeWidth="2"
      className={tone.dark}
    />
    <circle
      cx="30"
      cy="54"
      r="8"
      className={v("on") === 1 ? "fill-yellow-300" : "fill-slate-300"}
    />
    <path
      d="M44 30 Q70 40 66 132"
      fill="none"
      strokeWidth="4"
      className={ink}
    />
    <rect x="44" y="128" width="40" height="8" rx="2" className={tone.dark} />
  </>
);

const pondweed: BioGlyph = ({ v, still }) => (
  <>
    <path
      d="M10 40 L14 164 H106 L110 40 Z"
      strokeWidth="2"
      className={tone.glass}
    />
    <path d="M12 56 L14 164 H106 L108 56 Z" className="fill-sky-200/60" />
    <path d="M60 160 V80" strokeWidth="3" className="stroke-green-700" />
    {[90, 104, 118, 132, 146].map((y, index) => (
      <ellipse
        key={y}
        cx={index % 2 === 0 ? 52 : 68}
        cy={y}
        rx="10"
        ry="4"
        className="fill-green-500"
      />
    ))}
    <path
      d="M54 80 V20 H66 V80"
      strokeWidth="1.5"
      className={`${glassFill} stroke-sky-500`}
    />
    <Bubbles
      x1={57}
      x2={63}
      y={78}
      amount={Math.min(1, v("rate") / 40)}
      still={still}
    />
  </>
);

const photometer: BioGlyph = ({ v }) => (
  <>
    <rect
      x="10"
      y="20"
      width="80"
      height="94"
      rx="10"
      strokeWidth="2"
      className={tone.light}
    />
    <circle
      cx="50"
      cy="12"
      r="10"
      strokeWidth="2"
      className="fill-white stroke-slate-500"
    />
    <Screen
      x={18}
      y={40}
      width={64}
      height={28}
      text={`${Math.round(v("lux"))}`}
      small="lux"
    />
  </>
);

const spirometer: BioGlyph = ({ outcome }) => (
  <>
    <rect
      x="10"
      y="40"
      width="80"
      height="100"
      rx="6"
      strokeWidth="2"
      className={tone.light}
    />
    <rect
      x="18"
      y="20"
      width="64"
      height="60"
      rx="4"
      strokeWidth="2"
      className={tone.glass}
    />
    <path
      d="M90 100 Q110 100 120 80"
      fill="none"
      strokeWidth="5"
      className="stroke-slate-500"
    />
    <Trace plot={outcome.plot} x={100} y={20} width={96} height={70} />
  </>
);

export const physiologyGlyphs: Record<PhysiologyKind, BioGlyph> = {
  beaker,
  "electronic-balance": balance,
  potometer,
  respirometer,
  "bell-jar": bellJar,
  "visking-tubing": visking,
  "thistle-funnel": thistle,
  "cork-borer": corkBorer,
  "plant-tissue": tissue,
  "hydrogencarbonate-indicator": indicatorTubes,
  limewater,
  klinostat,
  lamp,
  pondweed,
  photometer,
  spirometer,
};
