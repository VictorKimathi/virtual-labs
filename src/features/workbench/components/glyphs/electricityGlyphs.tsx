import { resistorValue } from "../../data/catalogue/electricity";
import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Dial, HScale, Label } from "./shapes";
import { ink, inkFill, inkSoft, opacityClass, tone } from "./tones";

type ElectricityKind = (typeof sectionKinds.electricity)[number];

function niceMajor(fullScale: number) {
  const raw = fullScale / 5;
  const power = 10 ** Math.floor(Math.log10(raw));
  return (
    [1, 2, 5, 10]
      .map((step) => step * power)
      .find((step) => step >= raw - 1e-9) ?? raw
  );
}

function meterFace(unit: string, digits: number): Glyph {
  return ({ v }) => {
    const fullScale = v("fullScale");
    const major = niceMajor(fullScale);
    const value = v("fraction") * fullScale;
    return (
      <>
        <rect
          x="0"
          y="0"
          width="110"
          height="120"
          rx="10"
          strokeWidth="2"
          className={tone.light}
        />
        <rect
          x="8"
          y="8"
          width="94"
          height="72"
          rx="6"
          className="fill-white"
        />
        <Dial
          cx={55}
          cy={72}
          r={54}
          min={0}
          max={fullScale}
          value={value}
          major={major}
          minor={major / 5}
          start={-52}
          end={52}
          format={(n) => String(Number(n.toFixed(2)))}
        />
        <text
          x="55"
          y="42"
          textAnchor="middle"
          fontSize="15"
          className="fill-slate-800 font-black"
        >
          {unit}
        </text>
        <rect
          x="16"
          y="84"
          width="78"
          height="16"
          rx="3"
          className={tone.screen}
        />
        <text
          x="55"
          y="96"
          textAnchor="middle"
          fontSize="10"
          className="fill-green-400 font-mono font-bold"
        >
          {value.toFixed(digits)} {unit}
        </text>
      </>
    );
  };
}

const galvanometer: Glyph = ({ v, p }) => {
  const fraction = v("fraction");
  const unit = ["mA", "A", "V"][p("mode")];
  return (
    <>
      <rect
        x="0"
        y="0"
        width="110"
        height="120"
        rx="10"
        strokeWidth="2"
        className={tone.light}
      />
      <rect x="8" y="8" width="94" height="72" rx="6" className="fill-white" />
      <Dial
        cx={55}
        cy={72}
        r={54}
        min={-1}
        max={1}
        value={fraction}
        major={0.5}
        minor={0.1}
        start={-52}
        end={52}
        format={(n) => String(Math.round(Math.abs(n) * 30))}
      />
      <text
        x="55"
        y="42"
        textAnchor="middle"
        fontSize="13"
        className="fill-slate-800 font-black"
      >
        G
      </text>
      <rect
        x="16"
        y="84"
        width="78"
        height="16"
        rx="3"
        className="fill-slate-700"
      />
      <text
        x="55"
        y="96"
        textAnchor="middle"
        fontSize="10"
        className="fill-white font-bold"
      >
        30 – 0 – 30 ({unit})
      </text>
    </>
  );
};

const multimeter: Glyph = ({ p, v, outcome }) => {
  const mode = v("mode");
  const off = v("off") === 1;
  const text = off ? "" : (outcome.readouts?.[0]?.value ?? "");
  const positions = [0, 1, 2, 3, 4];
  const labels = ["OFF", "V=", "V~", "A=", "Ω"];
  return (
    <>
      <rect
        x="0"
        y="0"
        width="130"
        height="190"
        rx="12"
        strokeWidth="2"
        className="fill-yellow-400 stroke-yellow-700"
      />
      <rect
        x="12"
        y="12"
        width="106"
        height="42"
        rx="4"
        className={tone.screen}
      />
      <text
        x="65"
        y="40"
        textAnchor="middle"
        fontSize={text.length > 9 ? 11 : 17}
        className="fill-green-400 font-mono font-bold"
      >
        {text}
      </text>
      <circle cx="65" cy="106" r="32" strokeWidth="2" className={tone.dark} />
      {positions.map((i) => {
        const angle = -100 + i * 50;
        return (
          <text
            key={i}
            x={65 + 46 * Math.sin((angle * Math.PI) / 180)}
            y={110 - 46 * Math.cos((angle * Math.PI) / 180) + 3}
            textAnchor="middle"
            fontSize="9"
            className="fill-slate-900 font-black"
          >
            {labels[i]}
          </text>
        );
      })}
      <path
        d="M65 106 V82"
        strokeWidth="5"
        strokeLinecap="round"
        transform={`rotate(${-100 + mode * 50} 65 106)`}
        className="stroke-white"
      />
      <Label x={40} y={156} size={9}>
        {p("mode") === 4 ? "Ω" : "V/Ω/mA"}
      </Label>
      <Label x={90} y={156} size={9}>
        COM
      </Label>
    </>
  );
};

const bandFill = [
  "fill-slate-900",
  "fill-amber-900",
  "fill-red-600",
  "fill-orange-500",
  "fill-yellow-400",
  "fill-green-600",
  "fill-blue-600",
  "fill-violet-600",
  "fill-slate-400",
  "fill-white",
];

const resistorGlyph: Glyph = ({ part }) => {
  const value = resistorValue(part);
  const text = String(value);
  const small = value < 10;
  const first = small ? value : Number(text[0]);
  const second = small ? 0 : Number(text[1]);
  const multiplier = small ? "fill-yellow-600" : bandFill[text.length - 2];
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
      <rect x="40" y="5" width="5" height="22" className={bandFill[first]} />
      <rect x="51" y="5" width="5" height="22" className={bandFill[second]} />
      <rect x="62" y="5" width="5" height="22" className={multiplier} />
      <rect x="78" y="5" width="4" height="22" className="fill-yellow-600" />
      <text
        x="60"
        y="46"
        textAnchor="middle"
        fontSize="12"
        className={`${inkFill} font-mono font-bold`}
      >
        {value} Ω
      </text>
    </>
  );
};

const dryCell: Glyph = () => (
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
      fontSize="14"
      className="fill-white font-mono font-black"
    >
      1.5 V
    </text>
    <text x="86" y="30" fontSize="14" className="fill-white font-black">
      +
    </text>
  </>
);

const cellHolder: Glyph = () => (
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
      fontSize="14"
      className="fill-white font-mono font-black"
    >
      3 V
    </text>
  </>
);

const accumulator: Glyph = ({ p }) => (
  <>
    <rect
      x="14"
      y="30"
      width="112"
      height="74"
      rx="6"
      strokeWidth="2"
      className="fill-sky-200 stroke-sky-500 dark:fill-sky-900"
    />
    <rect
      x="30"
      y="40"
      width="80"
      height="56"
      className="fill-sky-100/60 dark:fill-sky-800"
    />
    <rect x="34" y="14" width="12" height="18" className={tone.dark} />
    <rect x="94" y="14" width="12" height="18" className={tone.red} />
    <Label x={70} y={74} size={14}>
      2 V
    </Label>
    <Label x={70} y={92} size={10}>
      {p("charge")} % charged
    </Label>
  </>
);

const powerSupply: Glyph = ({ p, v }) => (
  <>
    <rect
      x="0"
      y="0"
      width="160"
      height="110"
      rx="8"
      strokeWidth="2"
      className="fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500"
    />
    <rect
      x="12"
      y="10"
      width="92"
      height="34"
      rx="4"
      className="fill-slate-950"
    />
    <text
      x="58"
      y="34"
      textAnchor="middle"
      fontSize="16"
      className="fill-green-400 font-mono font-bold"
    >
      {p("on") === 1 ? p("voltage").toFixed(1) : "off"} V
    </text>
    <circle cx="132" cy="28" r="12" className="fill-slate-500" />
    <path
      d="M132 28 V18"
      strokeWidth="3"
      strokeLinecap="round"
      transform={`rotate(${(p("voltage") / 12) * 270 - 135} 132 28)`}
      className="stroke-slate-100"
    />
    <text
      x="12"
      y="62"
      fontSize="12"
      className="fill-slate-600 font-bold dark:fill-slate-300"
    >
      {p("mode") === 1 ? "AC ~" : "DC ="}
    </text>
    <circle
      cx="140"
      cy="62"
      r="5"
      className={v("limiting") === 1 ? "fill-red-500" : "fill-slate-400"}
    />
    <text
      x="104"
      y="78"
      textAnchor="middle"
      fontSize="12"
      className="fill-red-600 font-black dark:fill-red-400"
    >
      +
    </text>
    <text
      x="136"
      y="78"
      textAnchor="middle"
      fontSize="12"
      className="fill-slate-800 font-black dark:fill-slate-100"
    >
      −
    </text>
    <text
      x="12"
      y="82"
      fontSize="10"
      className="fill-slate-500 font-bold dark:fill-slate-400"
    >
      limit {p("limit")} A
    </text>
  </>
);

const clip = (x: number, y: number, flip: boolean) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <path
      d="M0 -8 L18 -10 L22 -4 L18 0 L22 4 L18 10 L0 8 Z"
      strokeWidth="1.5"
      className={tone.steel}
    />
    <rect x="-8" y="-8" width="10" height="16" rx="3" className={tone.dark} />
  </g>
);

const lead: Glyph = ({ p }) => {
  const colours = [
    "stroke-red-600",
    "stroke-slate-900 dark:stroke-slate-300",
    "stroke-blue-600",
    "stroke-green-600",
  ];
  return (
    <>
      <path
        d="M14 25 C60 -4 160 54 206 25"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        className={colours[p("colour")]}
      />
      {clip(14, 25, false)}
      {clip(206, 25, true)}
    </>
  );
};

const knifeSwitch: Glyph = ({ p }) => (
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
    <g transform={p("closed") === 1 ? undefined : "rotate(-35 31 30)"}>
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

const plugKey: Glyph = ({ p }) => (
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
      x="14"
      y="22"
      width="34"
      height="18"
      rx="2"
      strokeWidth="1.5"
      className={tone.brass}
    />
    <rect
      x="72"
      y="22"
      width="34"
      height="18"
      rx="2"
      strokeWidth="1.5"
      className={tone.brass}
    />
    <path
      d="M48 24 L72 24 L68 34 L52 34 Z"
      className={tone.light}
      strokeWidth="1"
    />
    {p("closed") === 1 ? (
      <g>
        <path
          d="M50 30 L70 30 L66 40 L54 40 Z"
          strokeWidth="1.5"
          className={tone.brass}
        />
        <rect
          x="52"
          y="6"
          width="16"
          height="22"
          rx="4"
          className={tone.dark}
        />
      </g>
    ) : (
      <g transform="translate(0 -14)">
        <path
          d="M50 30 L70 30 L66 40 L54 40 Z"
          strokeWidth="1.5"
          className={tone.brass}
        />
        <rect
          x="52"
          y="6"
          width="16"
          height="22"
          rx="4"
          className={tone.dark}
        />
      </g>
    )}
  </>
);

const rheostat: Glyph = ({ v }) => {
  const x = 34 + (v("pos") / 100) * 150;
  return (
    <>
      <rect
        x="8"
        y="30"
        width="204"
        height="56"
        rx="6"
        strokeWidth="2"
        className="fill-orange-100 stroke-orange-300 dark:fill-orange-200"
      />
      {Array.from({ length: 28 }, (_, i) => (
        <path
          key={i}
          d={`M${22 + i * 6.7} 38 V78`}
          strokeWidth="2.5"
          className="stroke-slate-500"
        />
      ))}
      <rect
        x="20"
        y="14"
        width="180"
        height="6"
        rx="2"
        className={tone.steel}
      />
      <rect
        x={x - 9}
        y="12"
        width="18"
        height="30"
        rx="3"
        strokeWidth="1.5"
        className={tone.brass}
      />
      <path
        d={`M${x} 14 L110 14`}
        strokeWidth="1.5"
        className={inkSoft}
        fill="none"
      />
      <Label x={110} y={102} size={9}>
        A ← → B
      </Label>
    </>
  );
};

const resistanceBox: Glyph = ({ p }) => {
  const digits = String(Math.round(p("ohms")))
    .padStart(4, "0")
    .split("");
  return (
    <>
      <rect
        x="4"
        y="4"
        width="212"
        height="102"
        rx="8"
        strokeWidth="2"
        className={tone.darkWood}
      />
      <rect
        x="14"
        y="14"
        width="192"
        height="64"
        rx="4"
        className="fill-amber-100"
      />
      {digits.map((digit, i) => (
        <g key={i}>
          <circle
            cx={42 + i * 46}
            cy="46"
            r="17"
            strokeWidth="2"
            className={tone.dark}
          />
          <text
            x={42 + i * 46}
            y="52"
            textAnchor="middle"
            fontSize="16"
            className="fill-white font-mono font-bold"
          >
            {digit}
          </text>
          <text
            x={42 + i * 46}
            y="26"
            textAnchor="middle"
            fontSize="9"
            className={`${inkFill} font-bold`}
          >
            {["×1000", "×100", "×10", "×1"][i]}
          </text>
        </g>
      ))}
      <Label x={110} y={92} size={11}>
        {p("ohms")} Ω
      </Label>
    </>
  );
};

const bulb: Glyph = ({ v, p }) => {
  const brightness = v("brightness");
  const burnt = v("burnt") === 1;
  const lit = brightness > 0.05 && !burnt;
  return (
    <>
      {lit && (
        <circle
          cx="45"
          cy="38"
          r="42"
          className={`fill-amber-300 ${opacityClass(Math.min(1, brightness) * 0.9)}`}
        />
      )}
      <circle
        cx="45"
        cy="38"
        r="28"
        strokeWidth="2"
        className={`fill-slate-100 dark:fill-slate-300 ${brightness > 2.5 ? "stroke-red-500" : "stroke-slate-400"}`}
      />
      <path
        d={
          burnt
            ? "M36 58 L38 38 L42 46 M48 46 L52 38 L54 58"
            : "M36 58 L38 38 L42 46 L45 34 L48 46 L52 38 L54 58"
        }
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
      <text
        x="45"
        y="100"
        textAnchor="middle"
        fontSize="9"
        className="fill-amber-100 font-bold"
      >
        {["2.5 V", "6 V", "12 V"][p("rating")]}
      </text>
    </>
  );
};

const wireGlyph: Glyph = ({ p }) => {
  const length = p("length");
  const colours = ["stroke-slate-500", "stroke-amber-600", "stroke-orange-500"];
  return (
    <>
      <rect
        x="4"
        y="34"
        width="252"
        height="30"
        rx="4"
        strokeWidth="1.5"
        className={tone.wood}
      />
      <path
        d={`M10 40 H250`}
        strokeWidth="1"
        strokeDasharray="3 3"
        className={inkSoft}
      />
      <path
        d={`M10 40 H${10 + (length / 100) * 240}`}
        strokeWidth={1 + p("gauge") * 1.5}
        strokeLinecap="round"
        className={colours[p("material")]}
      />
      <HScale
        x={10}
        y={64}
        from={0}
        to={100}
        perUnit={2.4}
        minor={5}
        major={10}
        labelEvery={2}
        flip
        format={(n) => String(n)}
        size={8}
      />
      <Label x={130} y={22} size={10}>
        {length} cm of wire
      </Label>
    </>
  );
};

const slideWire =
  (
    width: number,
    perCm: number,
    wireY: number,
    metre: boolean,
    post: [number, number],
  ): Glyph =>
  ({ v }) => {
    const x = 24 + v("pos") * perCm;
    return (
      <>
        <rect
          x="4"
          y={wireY - 26}
          width={width - 8}
          height={metre ? 104 : 56}
          rx="6"
          strokeWidth="2"
          className={tone.wood}
        />
        <path
          d={`M24 ${wireY} H${24 + 100 * perCm}`}
          strokeWidth="3"
          className="stroke-slate-500 dark:stroke-slate-300"
        />
        <HScale
          x={24}
          y={wireY + 8}
          from={0}
          to={100}
          perUnit={perCm}
          minor={1}
          mid={5}
          major={10}
          labelEvery={1}
          format={(n) => String(n)}
          size={8}
        />
        <path
          d={`M${x} ${wireY - 22} V${wireY}`}
          strokeWidth="4"
          className="stroke-red-600"
        />
        <rect
          x={x - 7}
          y={wireY - 32}
          width="14"
          height="14"
          rx="3"
          className={tone.dark}
        />
        <path
          d={`M${x} ${wireY - 32} Q${(x + post[0]) / 2} ${post[1] - 10} ${post[0]} ${post[1]}`}
          fill="none"
          strokeWidth="2"
          className="stroke-red-600"
        />
        {metre && (
          <>
            <path
              d={`M16 ${wireY + 48} H70 M130 ${wireY + 48} H350 M410 ${wireY + 48} H${width - 16}`}
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-orange-500"
            />
            <Label x={100} y={wireY + 44} size={11}>
              R
            </Label>
            <Label x={380} y={wireY + 44} size={11}>
              X
            </Label>
          </>
        )}
      </>
    );
  };

const fuse: Glyph = ({ v }) => (
  <>
    <rect
      x="20"
      y="10"
      width="70"
      height="30"
      rx="6"
      strokeWidth="2"
      className={tone.glass}
    />
    <rect
      x="10"
      y="12"
      width="16"
      height="26"
      rx="3"
      className={tone.brass}
      strokeWidth="1.5"
    />
    <rect
      x="84"
      y="12"
      width="16"
      height="26"
      rx="3"
      className={tone.brass}
      strokeWidth="1.5"
    />
    <path
      d={v("blown") === 1 ? "M26 25 H48 M64 25 H84" : "M26 25 H84"}
      strokeWidth="1.5"
      className={ink}
      fill="none"
    />
    {v("blown") === 1 && (
      <path
        d="M50 18 l4 6 l-4 4 l4 6"
        fill="none"
        strokeWidth="1.5"
        className="stroke-red-600"
      />
    )}
  </>
);

const capacitor: Glyph = ({ p }) => (
  <>
    <rect
      x="22"
      y="6"
      width="46"
      height="62"
      rx="8"
      strokeWidth="2"
      className="fill-sky-700 stroke-sky-900"
    />
    <rect x="22" y="6" width="12" height="62" className="fill-slate-200" />
    <text
      x="49"
      y="24"
      textAnchor="middle"
      fontSize="9"
      className="fill-white font-bold"
    >
      {[100, 470, 1000][p("size")]}µF
    </text>
    <text
      x="28"
      y="40"
      textAnchor="middle"
      fontSize="12"
      className="fill-slate-700 font-black"
    >
      −
    </text>
  </>
);

const electroscope: Glyph = ({ v }) => {
  const angle = v("divergence") * 45;
  return (
    <>
      <rect
        x="18"
        y="70"
        width="114"
        height="150"
        rx="10"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="14"
        y="214"
        width="122"
        height="12"
        rx="3"
        className={tone.dark}
      />
      <rect x="72" y="26" width="6" height="110" className={tone.brass} />
      <circle cx="75" cy="22" r="13" strokeWidth="2" className={tone.brass} />
      <rect x="72" y="130" width="6" height="14" className={tone.brass} />
      <rect
        x="74"
        y="136"
        width="4"
        height="52"
        className="fill-slate-400 stroke-slate-500"
      />
      <g transform={`rotate(${angle} 76 140)`}>
        <rect
          x="75"
          y="140"
          width="3"
          height="56"
          className="fill-yellow-400 stroke-yellow-600"
        />
      </g>
    </>
  );
};

const rod =
  (plastic: string, sign: string): Glyph =>
  ({ v }) => (
    <>
      <rect
        x="30"
        y="12"
        width="220"
        height="26"
        rx="13"
        strokeWidth="2"
        className={plastic}
      />
      <rect
        x="4"
        y="16"
        width="34"
        height="18"
        rx="4"
        className="fill-slate-400"
      />
      {v("rubbed") === 1 &&
        Array.from({ length: 6 }, (_, i) => (
          <text
            key={i}
            x={70 + i * 30}
            y="31"
            textAnchor="middle"
            fontSize="14"
            className="fill-slate-800 font-black"
          >
            {sign}
          </text>
        ))}
    </>
  );

export const electricityGlyphs: Record<ElectricityKind, Glyph> = {
  "dry-cell": dryCell,
  "cell-holder": cellHolder,
  accumulator,
  "power-supply": powerSupply,
  "connecting-lead": lead,
  switch: knifeSwitch,
  "plug-key": plugKey,
  resistor: resistorGlyph,
  rheostat,
  "resistance-box": resistanceBox,
  ammeter: meterFace("A", 3),
  milliammeter: meterFace("mA", 1),
  voltmeter: meterFace("V", 2),
  galvanometer,
  multimeter,
  bulb,
  "resistance-wire": wireGlyph,
  potentiometer: slideWire(440, 3.92, 66, false, [220, 16]),
  "metre-bridge": slideWire(480, 4.32, 80, true, [360, 18]),
  fuse,
  capacitor,
  electroscope,
  "polythene-rod": rod(
    "fill-slate-100 stroke-slate-300 dark:fill-slate-300",
    "−",
  ),
  "acetate-rod": rod(
    "fill-yellow-100 stroke-yellow-300 dark:fill-yellow-200",
    "+",
  ),
};
