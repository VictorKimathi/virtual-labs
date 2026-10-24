import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Dial, HScale, Label, VScale } from "./shapes";
import { ink, inkFill, inkSoft, opacityClass, tone } from "./tones";

type HeatKind = (typeof sectionKinds.heat)[number];

const flame = (
  x: number,
  y: number,
  scale: number,
  blue: boolean,
  still: boolean,
) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M0 0 C-14 -14 -12 -34 0 -62 C12 -34 14 -14 0 0 Z"
      className={blue ? "fill-blue-400/80" : "fill-amber-400/90"}
    />
    <path
      d="M0 0 C-7 -8 -6 -20 0 -34 C6 -20 7 -8 0 0 Z"
      className={blue ? "fill-sky-200" : "fill-yellow-200"}
    />
    {!still && (
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1 1;1 1.08;1 0.95;1 1"
        dur="0.5s"
        additive="sum"
        repeatCount="indefinite"
      />
    )}
  </g>
);

const liquidThermometer: Glyph = ({ v }) => {
  const reading = Math.max(-12, Math.min(112, v("reading")));
  const top = 350 - (reading + 10) * 2.5;
  return (
    <>
      <rect
        x="34"
        y="14"
        width="22"
        height="350"
        rx="8"
        strokeWidth="2"
        className={tone.glass}
      />
      <circle cx="45" cy="378" r="15" strokeWidth="2" className={tone.glass} />
      <circle cx="45" cy="378" r="11" className="fill-red-500" />
      <rect
        x="42"
        y={top}
        width="6"
        height={378 - top}
        className="fill-red-500"
      />
      <VScale
        x={56}
        y={350}
        from={-10}
        to={110}
        perUnit={2.5}
        minor={1}
        mid={5}
        major={10}
        labelEvery={1}
      />
      <Label x={45} y={10} size={10}>
        °C
      </Label>
    </>
  );
};

const clinical: Glyph = ({ v }) => {
  const reading = Math.max(34.5, Math.min(42.5, v("reading")));
  const edge = 60 + (reading - 35) * 38;
  return (
    <>
      <circle cx="30" cy="54" r="16" strokeWidth="2" className={tone.glass} />
      <circle cx="30" cy="54" r="12" className="fill-slate-400" />
      <rect
        x="44"
        y="42"
        width="300"
        height="24"
        rx="10"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="44"
        y="50"
        width={edge - 44}
        height="8"
        className="fill-slate-400"
      />
      <path d="M52 50 v8" strokeWidth="3" className="stroke-white" />
      <HScale
        x={60}
        y={42}
        from={35}
        to={42}
        perUnit={38}
        minor={0.1}
        mid={0.5}
        major={1}
        flip
        format={(n) => String(n)}
      />
      <path d={`M${edge} 42 V66`} strokeWidth="2" className="stroke-red-600" />
      <Label x={190} y={86} size={10}>
        °C
      </Label>
    </>
  );
};

const digital: Glyph = ({ v }) => (
  <>
    <rect
      x="30"
      y="8"
      width="60"
      height="170"
      rx="12"
      strokeWidth="2"
      className={tone.light}
    />
    <rect x="38" y="20" width="44" height="30" rx="3" className={tone.screen} />
    <text
      x="60"
      y="42"
      textAnchor="middle"
      fontSize="13"
      className="fill-green-400 font-mono font-bold"
    >
      {v("reading").toFixed(1)}
    </text>
    <circle cx="60" cy="72" r="8" strokeWidth="1.5" className={tone.blue} />
    <rect
      x="56"
      y="178"
      width="8"
      height="92"
      rx="3"
      strokeWidth="1.5"
      className={tone.steel}
    />
  </>
);

const thermocouple: Glyph = ({ p }) => (
  <>
    <path
      d="M40 128 V70 Q40 42 100 40"
      fill="none"
      strokeWidth="4"
      className="stroke-orange-500"
    />
    <path
      d="M150 128 V70 Q150 42 100 40"
      fill="none"
      strokeWidth="4"
      className="stroke-slate-500 dark:stroke-slate-300"
    />
    <circle cx="100" cy="40" r="7" className={tone.red} strokeWidth="1.5" />
    <Label x={100} y={20} size={11}>
      hot junction {p("hot")} °C
    </Label>
    <Label x={95} y={152} size={10}>
      cold: {["0 °C (ice)", "24 °C"][p("cold")]}
    </Label>
  </>
);

const bunsen: Glyph = ({ v, still }) => {
  const lit = v("lit") === 1;
  const air = v("air");
  return (
    <>
      <ellipse cx="60" cy="236" rx="46" ry="12" className={tone.dark} />
      <rect
        x="53"
        y="110"
        width="14"
        height="120"
        rx="2"
        className={tone.steel}
        strokeWidth="1.5"
      />
      <rect
        x="46"
        y="186"
        width="28"
        height="26"
        rx="3"
        className={tone.brass}
        strokeWidth="1.5"
      />
      <ellipse cx="60" cy="199" rx="4" ry={1 + air * 9} className={tone.dark} />
      <path d="M50 224 H70" strokeWidth="3" className={tone.dark} />
      {lit && flame(60, 112, 0.9 + air * 0.5, air >= 0.4, still)}
    </>
  );
};

const spiritLamp: Glyph = ({ v, still }) => (
  <>
    <ellipse
      cx="55"
      cy="140"
      rx="44"
      ry="40"
      strokeWidth="2"
      className={tone.glass}
    />
    <ellipse
      cx="55"
      cy="150"
      rx="38"
      ry="28"
      className={tone.liquid}
      opacity="0.6"
    />
    <rect
      x="44"
      y="84"
      width="22"
      height="22"
      rx="3"
      className={tone.brass}
      strokeWidth="1.5"
    />
    <rect
      x="52"
      y={86 - v("wick") * 2}
      width="6"
      height={v("wick") * 2 + 6}
      className="fill-slate-700"
    />
    {v("lit") === 1 ? (
      flame(55, 84 - v("wick") * 2, 0.7, false, still)
    ) : (
      <rect
        x="42"
        y="56"
        width="26"
        height="30"
        rx="4"
        className={tone.steel}
        strokeWidth="1.5"
      />
    )}
  </>
);

const tripod: Glyph = () => (
  <>
    <ellipse
      cx="85"
      cy="40"
      rx="62"
      ry="12"
      fill="none"
      strokeWidth="6"
      className="stroke-slate-600 dark:stroke-slate-300"
    />
    <path
      d="M32 46 L16 182 M138 46 L154 182 M85 52 L85 182"
      strokeWidth="6"
      strokeLinecap="round"
      className="stroke-slate-600 dark:stroke-slate-300"
      fill="none"
    />
  </>
);

const gauze: Glyph = ({ v }) => (
  <g className={v("placed") === 1 ? undefined : opacityClass(0.4)}>
    <rect
      x="20"
      y="20"
      width="100"
      height="62"
      rx="2"
      strokeWidth="2"
      className="fill-slate-300/40 stroke-slate-500"
    />
    {Array.from({ length: 11 }, (_, i) => (
      <path
        key={i}
        d={`M${20 + i * 10} 20 V82`}
        strokeWidth="1"
        className={inkSoft}
      />
    ))}
    {Array.from({ length: 7 }, (_, i) => (
      <path
        key={i}
        d={`M20 ${20 + i * 10} H120`}
        strokeWidth="1"
        className={inkSoft}
      />
    ))}
    <circle
      cx="70"
      cy="51"
      r="22"
      className="fill-stone-200 stroke-stone-400 dark:fill-stone-400"
      strokeWidth="1.5"
    />
  </g>
);

const calorimeter: Glyph = ({ p, v, still }) => {
  const water = 195 - p("water") * 0.45;
  return (
    <>
      {p("lagging") === 1 && (
        <rect
          x="14"
          y="44"
          width="162"
          height="160"
          rx="10"
          className="fill-amber-100 stroke-amber-300 dark:fill-amber-200"
          strokeWidth="2"
        />
      )}
      <rect
        x="32"
        y="62"
        width="126"
        height="136"
        rx="8"
        strokeWidth="2.5"
        className={tone.copper}
      />
      <rect
        x="35"
        y={water}
        width="120"
        height={195 - water}
        className={tone.liquid}
        opacity="0.7"
      />
      <g>
        <path d="M95 30 V150" strokeWidth="2" className={ink} fill="none" />
        <ellipse
          cx="95"
          cy="150"
          rx="22"
          ry="5"
          fill="none"
          strokeWidth="2"
          className={ink}
        />
        {!still && p("stirrer") === 1 && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -14;0 0"
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
      </g>
      <Label x={95} y={24} size={11}>
        {v("temperature").toFixed(1)} °C
      </Label>
    </>
  );
};

const immersionHeater: Glyph = ({ v }) => (
  <>
    <rect x="36" y="4" width="58" height="34" rx="6" className={tone.dark} />
    <path
      d="M65 38 V130 Q65 160 85 160 Q105 160 105 130 V60"
      fill="none"
      strokeWidth="9"
      strokeLinecap="round"
      className="stroke-slate-500 dark:stroke-slate-300"
    />
    <path
      d="M65 38 V130 Q65 160 85 160 Q105 160 105 130 V60"
      fill="none"
      strokeWidth="5"
      strokeLinecap="round"
      className={`stroke-red-500 ${opacityClass(Math.min(1, v("power") / 30))}`}
    />
  </>
);

const bimetal: Glyph = ({ p, v }) => {
  const closed = v("closed") === 1;
  const sag = Math.min(60, v("bend") * 6);
  const tip = closed ? 150 : 95 + Math.min(40, sag);
  return (
    <>
      <rect x="20" y="70" width="32" height="56" rx="4" className={tone.dark} />
      <path
        d={`M50 92 Q150 92 250 ${tip - 3}`}
        fill="none"
        strokeWidth="7"
        className="stroke-yellow-600"
      />
      <path
        d={`M50 100 Q150 100 250 ${tip + 4}`}
        fill="none"
        strokeWidth="7"
        className="stroke-slate-500"
      />
      <rect x="244" y="150" width="14" height="30" className={tone.steel} />
      <circle
        cx="251"
        cy="150"
        r="4"
        className={closed ? "fill-green-500" : "fill-slate-400"}
      />
      <path
        d="M24 168 H40 V126 M266 168 H251 V180"
        fill="none"
        strokeWidth="2"
        className={ink}
      />
      <Label x={150} y={30} size={11}>
        {p("temp")} °C · {closed ? "contact closed" : "contact open"}
      </Label>
    </>
  );
};

const ballRing: Glyph = ({ p, v }) => {
  const fits = v("fits") === 1;
  const hotBall = p("ball") > 120;
  const hotRing = p("ring") > 120;
  return (
    <>
      <rect x="20" y="212" width="90" height="12" className={tone.dark} />
      <rect x="40" y="30" width="8" height="184" className={tone.steel} />
      <rect x="40" y="46" width="90" height="8" className={tone.steel} />
      <path d="M130 50 H180 V104" fill="none" strokeWidth="5" className={ink} />
      <ellipse
        cx="180"
        cy="116"
        rx="40"
        ry="12"
        fill="none"
        strokeWidth="7"
        className={
          hotRing
            ? "stroke-orange-500"
            : "stroke-slate-500 dark:stroke-slate-300"
        }
      />
      <circle
        cx="180"
        cy={fits ? 172 : 90}
        r="24"
        strokeWidth="2"
        className={hotBall ? "fill-orange-500 stroke-orange-700" : tone.steel}
      />
      <Label x={180} y={22} size={11}>
        {fits ? "passes through" : "does not fit"}
      </Label>
    </>
  );
};

const boyle: Glyph = ({ v }) => {
  const column = v("volume") * 5;
  return (
    <>
      <rect
        x="86"
        y="50"
        width="30"
        height="290"
        rx="6"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="88"
        y={52 + column}
        width="26"
        height={286 - column}
        className="fill-amber-300"
      />
      <rect
        x="88"
        y="52"
        width={26}
        height={column}
        className="fill-sky-100/60"
      />
      <rect
        x="82"
        y="38"
        width="38"
        height="14"
        rx="3"
        className={tone.steel}
      />
      <rect x="98" y="338" width="6" height="14" className={tone.steel} />
      <path d="M101 340 H101" className={ink} />
      <rect x="70" y="350" width="62" height="8" rx="3" className={tone.dark} />
      <path d="M120 44 H150 V70" fill="none" strokeWidth="3" className={ink} />
      <circle cx="152" cy="116" r="54" strokeWidth="4" className={tone.steel} />
      <circle
        cx="152"
        cy="116"
        r="48"
        className="fill-white stroke-slate-300 dark:fill-slate-200"
        strokeWidth="1"
      />
      <Dial
        cx={152}
        cy={116}
        r={42}
        min={0}
        max={300}
        value={v("pressure")}
        major={100}
        minor={20}
        start={-130}
        end={130}
        unit="kPa"
      />
    </>
  );
};

const charles: Glyph = ({ p, v }) => {
  const thread = 40 + v("length") * 1.1;
  return (
    <>
      <rect
        x="20"
        y="90"
        width="330"
        height="90"
        rx="8"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="22"
        y="100"
        width="326"
        height="78"
        className={tone.liquid}
        opacity="0.4"
      />
      <rect
        x="40"
        y="112"
        width="300"
        height="10"
        rx="4"
        strokeWidth="1.5"
        className={tone.glass}
      />
      <rect
        x="40"
        y="114"
        width={thread - 40}
        height="6"
        className="fill-sky-100"
      />
      <circle cx={thread + 4} cy="117" r="5" className="fill-blue-700" />
      <rect x="36" y="112" width="6" height="10" className={tone.dark} />
      <HScale
        x={40}
        y={134}
        from={0}
        to={270}
        perUnit={1.1}
        minor={10}
        mid={50}
        major={50}
        labelEvery={1}
        format={(n) => String(n)}
        size={9}
      />
      <Label x={190} y={78} size={11}>
        bath {p("bath")} °C · column {v("length").toFixed(0)} mm
      </Label>
    </>
  );
};

const pressureLaw: Glyph = ({ p, v }) => (
  <>
    <rect
      x="20"
      y="150"
      width="160"
      height="110"
      rx="8"
      strokeWidth="2"
      className={tone.glass}
    />
    <rect
      x="22"
      y="170"
      width="156"
      height="88"
      className={tone.liquid}
      opacity="0.4"
    />
    <circle cx="100" cy="190" r="48" strokeWidth="2" className={tone.glass} />
    <path
      d="M100 142 V80 H210 V92"
      fill="none"
      strokeWidth="3"
      className={ink}
    />
    <circle cx="240" cy="116" r="54" strokeWidth="4" className={tone.steel} />
    <circle
      cx="240"
      cy="116"
      r="48"
      strokeWidth="1"
      className="fill-white stroke-slate-300 dark:fill-slate-200"
    />
    <Dial
      cx={240}
      cy={116}
      r={42}
      min={80}
      max={160}
      value={v("pressure")}
      major={20}
      minor={5}
      start={-130}
      end={130}
      unit="kPa"
    />
    <Label x={100} y={278} size={11}>
      {p("bath")} °C
    </Label>
  </>
);

const roundFlask: Glyph = ({ part, v }) => {
  const id = `flask-${part.id}`;
  const level = 185 - v("fill") * 120;
  return (
    <>
      <clipPath id={id}>
        <rect x="0" y={level} width="170" height="200" />
      </clipPath>
      <circle
        cx="85"
        cy="125"
        r="60"
        className={tone.liquid}
        clipPath={`url(#${id})`}
      />
      <circle
        cx="85"
        cy="125"
        r="60"
        fill="none"
        strokeWidth="2.5"
        className={tone.glass}
      />
      <rect
        x="75"
        y="10"
        width="20"
        height="62"
        strokeWidth="2.5"
        className="fill-none stroke-sky-400"
      />
      <text
        x="85"
        y="130"
        textAnchor="middle"
        fontSize="11"
        className={`${inkFill} font-bold`}
      >
        {Math.round(v("fill") * 500)} mL
      </text>
    </>
  );
};

const tubing: Glyph = ({ v }) => {
  const shapes = [
    "M10 55 H210",
    "M10 80 H150 V20",
    "M10 30 H70 Q100 30 100 55 V80 Q100 100 130 100 H210",
  ];
  const shape = Math.round(v("shape"));
  return (
    <>
      <path
        d={shapes[shape]}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        className="stroke-sky-100 dark:stroke-sky-950"
      />
      <path
        d={shapes[shape]}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-sky-500"
      />
    </>
  );
};

export const heatGlyphs: Record<HeatKind, Glyph> = {
  "liquid-thermometer": liquidThermometer,
  "clinical-thermometer": clinical,
  "digital-thermometer": digital,
  thermocouple,
  "bunsen-burner": bunsen,
  "spirit-lamp": spiritLamp,
  tripod,
  "wire-gauze": gauze,
  calorimeter,
  "immersion-heater": immersionHeater,
  "bimetallic-strip": bimetal,
  "ball-and-ring": ballRing,
  "boyle-apparatus": boyle,
  "charles-apparatus": charles,
  "pressure-law-apparatus": pressureLaw,
  "round-bottom-flask": roundFlask,
  "glass-tubing": tubing,
};
