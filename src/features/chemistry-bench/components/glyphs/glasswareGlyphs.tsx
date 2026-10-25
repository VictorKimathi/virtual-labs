import type { ReactNode } from "react";
import { Label } from "../../../workbench/components/glyphs/shapes";
import {
  ink,
  inkSoft,
  opacityClass,
  tone,
} from "../../../workbench/components/glyphs/tones";
import type { ChemGlyph, ChemGlyphProps } from "../../chemistry.types";
import type { chemSectionKinds } from "../../data/kinds";
import {
  glassFill,
  glassLine,
  glassStroke,
  piecewise,
  surfaceAt,
} from "./geometry";
import { Flame, GasHaze, Stopper, Ticks, VesselBody } from "./pieces";

type GlasswareKind = (typeof chemSectionKinds.glassware)[number];

type Shape = {
  outline: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** Where a stopper sits: the x of the mouth, its width and its y. */
  mouth?: [number, number, number];
  /** A custom surface for vessels whose width changes a lot. */
  surface?: (props: ChemGlyphProps) => number;
  extras?: (props: ChemGlyphProps) => ReactNode;
};

/** A vessel drawn from its shape, with its liquid, stopper and any fire. */
export function vessel(shape: Shape): ChemGlyph {
  return function VesselGlyph(props) {
    const { outcome, p, still } = props;
    const liquid = outcome.liquid;
    const surface = shape.surface
      ? shape.surface(props)
      : surfaceAt(liquid?.level ?? 0, shape.top, shape.bottom);
    const oilTop =
      liquid && liquid.oilLevel > 0
        ? surface - liquid.oilLevel * (shape.bottom - shape.top)
        : undefined;
    const mouth = shape.mouth;
    return (
      <>
        <VesselBody
          outline={shape.outline}
          surface={surface}
          bottom={shape.bottom}
          left={shape.left}
          right={shape.right}
          liquid={liquid}
          still={still}
          oilTop={oilTop}
          broken={p("broken") === 1}
        >
          {shape.extras?.(props)}
        </VesselBody>
        {mouth && liquid?.gas && (
          <GasHaze
            gas={liquid.gas}
            x={mouth[0]}
            y={mouth[2]}
            width={mouth[1]}
          />
        )}
        {mouth && p("stopper") === 1 && (
          <Stopper x={mouth[0]} y={mouth[2]} width={mouth[1]} />
        )}
        {mouth && p("burning") === 1 && (
          <Flame
            x={mouth[0] + mouth[1] / 2}
            y={mouth[2]}
            height={50}
            luminous
            still={still}
          />
        )}
      </>
    );
  };
}

const beaker = vessel({
  outline:
    "M10 8 Q14 12 16 14 L18 134 Q18 138 22 138 H98 Q102 138 102 134 L104 14 Q106 12 110 8 Z",
  top: 22,
  bottom: 138,
  left: 14,
  right: 106,
  mouth: [16, 88, 12],
  extras: () => (
    <Ticks x={22} from={115} to={45} count={3} labels={["", "", "", ""]} />
  ),
});

const conical = vessel({
  outline: "M48 6 H72 V52 L112 138 Q114 146 106 146 H14 Q6 146 8 138 L48 52 Z",
  top: 52,
  bottom: 146,
  left: 6,
  right: 114,
  mouth: [48, 24, 8],
});

const roundBottom = vessel({
  outline: "M52 6 H78 V64 A48 48 0 1 1 52 64 Z",
  top: 64,
  bottom: 158,
  left: 16,
  right: 114,
  mouth: [52, 26, 8],
});

const flatBottom = vessel({
  outline: "M52 6 H78 V62 C122 72 124 150 104 154 H26 C6 150 8 72 52 62 Z",
  top: 62,
  bottom: 154,
  left: 8,
  right: 122,
  mouth: [52, 26, 8],
});

const volumetricFlask = vessel({
  outline: "M44 4 H56 V122 C94 130 98 192 80 196 H20 C2 192 6 130 44 122 Z",
  top: 4,
  bottom: 196,
  left: 6,
  right: 96,
  mouth: [44, 12, 6],
  surface: ({ outcome, part }) => {
    const capacity = part.vessel?.capacity ?? 115;
    const mark = part.vessel?.mark ?? 100;
    return piecewise((outcome.liquid?.level ?? 0) * capacity, [
      [0, 196],
      [mark * 0.9, 122],
      [mark, 60],
      [capacity, 6],
    ]);
  },
  extras: () => (
    <>
      <path d="M40 60 H60" strokeWidth="1.5" className={ink} />
      <Label x={50} y={170} size={10}>
        100 mL
      </Label>
    </>
  ),
});

const cylinder = vessel({
  outline: "M28 8 H62 V210 H28 Z",
  top: 30,
  bottom: 210,
  left: 28,
  right: 62,
  mouth: [28, 34, 10],
  surface: ({ outcome, part }) =>
    210 -
    ((outcome.liquid?.level ?? 0) * (part.vessel?.capacity ?? 100) * 180) / 100,
  extras: () => (
    <>
      <Ticks
        x={30}
        from={210}
        to={30}
        count={20}
        labels={[
          "0",
          "",
          "10",
          "",
          "20",
          "",
          "30",
          "",
          "40",
          "",
          "50",
          "",
          "60",
          "",
          "70",
          "",
          "80",
          "",
          "90",
          "",
          "100",
        ]}
      />
      <path
        d="M14 222 H76 L70 210 H20 Z"
        strokeWidth="2"
        className={tone.glass}
      />
    </>
  ),
});

const burette: ChemGlyph = ({ outcome, v, still }) => {
  const reading = v("reading");
  const surface = 20 + Math.max(0, Math.min(50, reading)) * 4.4;
  const liquid = outcome.liquid;
  const filled = liquid && liquid.level > 0;
  return (
    <>
      <VesselBody
        outline="M32 4 H48 V250 H32 Z"
        surface={surface}
        bottom={250}
        left={32}
        right={48}
        liquid={liquid}
        still={still}
      >
        <Ticks
          x={33}
          from={20}
          to={240}
          count={50}
          long={7}
          labels={Array.from({ length: 51 }, (_, index) =>
            index % 10 === 0 ? String(index) : "",
          )}
        />
      </VesselBody>
      <path
        d="M36 250 V262 L39 294 H41 L44 262 V250"
        strokeWidth="2"
        className={`${filled ? "" : glassFill} ${glassLine}`}
        fill={filled ? liquid.colour : undefined}
      />
      <rect
        x="22"
        y="252"
        width="36"
        height="8"
        rx="3"
        strokeWidth="1.5"
        className={tone.dark}
      />
      {v("bubble") === 1 && (
        <circle
          cx="40"
          cy="276"
          r="2.5"
          strokeWidth="1"
          className="fill-white stroke-slate-500"
        />
      )}
    </>
  );
};

const burretteStand: ChemGlyph = () => (
  <>
    <rect
      x="4"
      y="306"
      width="112"
      height="20"
      rx="4"
      strokeWidth="2"
      className={tone.dark}
    />
    <rect
      x="56"
      y="10"
      width="8"
      height="300"
      rx="3"
      strokeWidth="1.5"
      className={tone.steel}
    />
    <path
      d="M40 60 H80 M40 60 Q30 66 40 72 M80 60 Q90 66 80 72"
      fill="none"
      strokeWidth="3"
      className={ink}
    />
    <rect
      x="50"
      y="54"
      width="20"
      height="14"
      rx="3"
      strokeWidth="1.5"
      className={tone.metal}
    />
  </>
);

const volumetricPipette = vessel({
  outline:
    "M22 2 H28 V104 C42 112 42 168 28 176 V252 L26 258 H24 L22 252 V176 C8 168 8 112 22 104 Z",
  top: 2,
  bottom: 258,
  left: 8,
  right: 42,
  surface: ({ outcome, part }) =>
    piecewise((outcome.liquid?.level ?? 0) * (part.vessel?.capacity ?? 28), [
      [0, 256],
      [0.8, 176],
      [24, 104],
      [25, 40],
      [28, 4],
    ]),
  extras: () => <path d="M17 40 H33" strokeWidth="1.5" className={ink} />,
});

const graduatedPipette = vessel({
  outline: "M16 2 H24 V246 L21 256 H19 L16 246 Z",
  top: 20,
  bottom: 256,
  left: 16,
  right: 24,
  surface: ({ outcome, part }) =>
    230 - (outcome.liquid?.level ?? 0) * (part.vessel?.capacity ?? 10.5) * 21,
  extras: () => (
    <Ticks
      x={24}
      from={20}
      to={230}
      count={10}
      long={6}
      labels={["0", "", "2", "", "4", "", "6", "", "8", "", "10"]}
    />
  ),
});

const pipetteFiller: ChemGlyph = () => (
  <>
    <ellipse
      cx="30"
      cy="40"
      rx="24"
      ry="30"
      strokeWidth="2"
      className="fill-red-500 stroke-red-800 dark:fill-red-700 dark:stroke-red-400"
    />
    <rect
      x="22"
      y="70"
      width="16"
      height="36"
      rx="4"
      strokeWidth="2"
      className="fill-red-700 stroke-red-900"
    />
    {["A", "S", "E"].map((letter, index) => (
      <text
        key={letter}
        x={30}
        y={index === 0 ? 20 : index === 1 ? 84 : 98}
        textAnchor="middle"
        fontSize="9"
        className="fill-white font-black"
      >
        {letter}
      </text>
    ))}
  </>
);

const testTube = vessel({
  outline: "M8 4 H32 V132 A12 12 0 0 1 8 132 Z",
  top: 12,
  bottom: 144,
  left: 8,
  right: 32,
  mouth: [8, 24, 6],
});

const boilingTube = vessel({
  outline: "M8 4 H42 V150 A17 17 0 0 1 8 150 Z",
  top: 14,
  bottom: 167,
  left: 8,
  right: 42,
  mouth: [8, 34, 6],
});

const filterFunnel: ChemGlyph = ({ env, part }) => {
  const paper = env.over(part, ["filter-paper"]).length > 0;
  return (
    <>
      <path
        d="M6 8 H114 L66 72 V126 H54 V72 Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className={`${glassFill} stroke-sky-500 dark:stroke-sky-400`}
      />
      {paper && (
        <path d="M16 12 H104 L60 66 Z" strokeWidth="1" className={tone.paper} />
      )}
    </>
  );
};

const separatingFunnel = vessel({
  outline:
    "M40 4 H50 V16 C88 30 90 110 52 140 V148 H38 V140 C0 110 2 30 40 16 Z",
  top: 22,
  bottom: 146,
  left: 2,
  right: 88,
  mouth: [40, 10, 6],
  extras: () => (
    <>
      <rect
        x="30"
        y="150"
        width="30"
        height="8"
        rx="3"
        strokeWidth="1.5"
        className={tone.dark}
      />
      <path
        d="M42 158 V186 M48 158 V186"
        strokeWidth="2"
        className={glassStroke}
      />
    </>
  ),
});

const thistleFunnel = vessel({
  outline: "M6 6 Q35 70 64 6 Z M31 52 H39 V188 H31 Z",
  top: 52,
  bottom: 188,
  left: 6,
  right: 64,
});

const watchGlass = vessel({
  outline: "M4 10 Q55 44 106 10 Q55 30 4 10 Z",
  top: 10,
  bottom: 30,
  left: 4,
  right: 106,
});

const evaporatingDish = vessel({
  outline: "M4 8 H116 Q112 56 60 56 Q8 56 4 8 Z",
  top: 10,
  bottom: 56,
  left: 4,
  right: 116,
  extras: () => (
    <path d="M110 8 L118 4" strokeWidth="2.5" className={glassStroke} />
  ),
});

const glassRod: ChemGlyph = () => (
  <rect
    x="4"
    y="8"
    width="132"
    height="8"
    rx="4"
    strokeWidth="2"
    className={tone.glass}
  />
);

const deliveryTube: ChemGlyph = () => (
  <>
    <path
      d="M14 104 V24 Q14 12 26 12 H194 Q206 12 206 24 V112"
      fill="none"
      strokeWidth="7"
      strokeLinejoin="round"
      className="stroke-sky-300 dark:stroke-sky-800"
    />
    <path
      d="M14 104 V24 Q14 12 26 12 H194 Q206 12 206 24 V112"
      fill="none"
      strokeWidth="1.5"
      className={glassStroke}
    />
    <Stopper x={2} y={100} width={24} />
  </>
);

const glassTubing: ChemGlyph = ({ v }) => {
  const d =
    v("shape") === 1
      ? "M10 80 V20 H190"
      : v("shape") === 2
        ? "M10 45 H170 L190 40"
        : "M10 45 H190";
  return (
    <>
      <path
        d={d}
        fill="none"
        strokeWidth="7"
        strokeLinejoin="round"
        className="stroke-sky-300 dark:stroke-sky-800"
      />
      <path d={d} fill="none" strokeWidth="1.5" className={glassStroke} />
    </>
  );
};

const gasJar: ChemGlyph = ({ v }) => (
  <>
    <rect x="10" y="8" width="60" height="156" rx="4" className={glassFill} />
    <rect
      x="12"
      y="10"
      width="56"
      height="152"
      rx="3"
      className={`fill-slate-400 dark:fill-slate-300 ${opacityClass(v("amount") * 0.45)}`}
    />
    <rect
      x="10"
      y="8"
      width="60"
      height="156"
      rx="4"
      strokeWidth="2.5"
      className={glassStroke}
    />
    <path d="M4 8 H76" strokeWidth="4" className={glassStroke} />
  </>
);

const gasJarLid: ChemGlyph = () => (
  <rect
    x="2"
    y="3"
    width="96"
    height="8"
    rx="2"
    strokeWidth="2"
    className={tone.glass}
  />
);

const condenser: ChemGlyph = ({ p }) => {
  const water = p("water") === 1;
  return (
    <>
      <path
        d="M30 26 L250 56 L246 76 L26 46 Z"
        strokeWidth="2"
        className={
          water
            ? "fill-sky-200 stroke-sky-500 dark:fill-sky-800"
            : `${glassFill} stroke-sky-500`
        }
      />
      <path
        d="M4 33 L276 70"
        strokeWidth="5"
        className="stroke-sky-300 dark:stroke-sky-700"
      />
      <path d="M4 33 L276 70" strokeWidth="1" className={glassStroke} />
      <path
        d="M60 30 V8 M220 60 V86"
        strokeWidth="6"
        className="stroke-sky-300 dark:stroke-sky-700"
      />
      <Label x={60} y={8} size={9}>
        out
      </Label>
      <Label x={220} y={90} size={9}>
        in
      </Label>
    </>
  );
};

const desiccator = vessel({
  outline: "M10 40 H130 V110 Q130 126 114 126 H26 Q10 126 10 110 Z",
  top: 70,
  bottom: 126,
  left: 10,
  right: 130,
  extras: () => (
    <>
      <path
        d="M6 40 Q70 0 134 40 Z"
        strokeWidth="2"
        className={`${glassFill} stroke-sky-500 dark:stroke-sky-400`}
      />
      <circle cx="70" cy="12" r="7" strokeWidth="2" className={tone.glass} />
      <path
        d="M14 96 H126"
        strokeWidth="2"
        strokeDasharray="4 3"
        className={inkSoft}
      />
      <rect
        x="20"
        y="104"
        width="100"
        height="16"
        className="fill-blue-400/70"
      />
    </>
  ),
});

const droppingBottle = vessel({
  outline: "M10 40 Q10 30 20 30 H30 Q40 30 40 40 V104 H10 Z",
  top: 36,
  bottom: 104,
  left: 10,
  right: 40,
  extras: () => (
    <>
      <rect
        x="18"
        y="16"
        width="14"
        height="14"
        rx="2"
        strokeWidth="1.5"
        className={tone.glass}
      />
      <ellipse
        cx="25"
        cy="10"
        rx="7"
        ry="8"
        strokeWidth="1.5"
        className="fill-red-500 stroke-red-800"
      />
    </>
  ),
});

const reagentBottle = vessel({
  outline: "M30 18 H50 V30 Q74 34 74 54 V132 H6 V54 Q6 34 30 30 Z",
  top: 40,
  bottom: 132,
  left: 6,
  right: 74,
  extras: () => (
    <rect
      x="26"
      y="4"
      width="28"
      height="16"
      rx="4"
      strokeWidth="2"
      className={tone.glass}
    />
  ),
});

const washBottle = vessel({
  outline: "M14 40 Q14 30 26 30 H54 Q66 30 66 40 V154 H14 Z",
  top: 40,
  bottom: 154,
  left: 14,
  right: 66,
  extras: () => (
    <>
      <rect
        x="28"
        y="20"
        width="24"
        height="12"
        rx="2"
        strokeWidth="1.5"
        className={tone.light}
      />
      <path
        d="M40 20 V8 H70 L76 14"
        fill="none"
        strokeWidth="3"
        className={tone.light}
      />
      <Label x={40} y={110} size={9}>
        H₂O
      </Label>
    </>
  ),
});

export const glasswareGlyphs: Record<GlasswareKind, ChemGlyph> = {
  beaker,
  "conical-flask": conical,
  "round-bottom-flask": roundBottom,
  "flat-bottom-flask": flatBottom,
  "volumetric-flask": volumetricFlask,
  "measuring-cylinder": cylinder,
  burette,
  "burette-stand": burretteStand,
  "volumetric-pipette": volumetricPipette,
  "graduated-pipette": graduatedPipette,
  "pipette-filler": pipetteFiller,
  "test-tube": testTube,
  "boiling-tube": boilingTube,
  "filter-funnel": filterFunnel,
  "separating-funnel": separatingFunnel,
  "thistle-funnel": thistleFunnel,
  "watch-glass": watchGlass,
  "evaporating-dish": evaporatingDish,
  "glass-rod": glassRod,
  "delivery-tube": deliveryTube,
  "glass-tubing": glassTubing,
  "gas-jar": gasJar,
  "gas-jar-lid": gasJarLid,
  "liebig-condenser": condenser,
  desiccator,
  "dropping-bottle": droppingBottle,
  "reagent-bottle": reagentBottle,
  "wash-bottle": washBottle,
};
