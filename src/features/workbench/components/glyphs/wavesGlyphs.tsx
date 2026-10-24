import { waveValue } from "../../data/catalogue/helpers";
import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Label } from "./shapes";
import { ink, inkFill, inkSoft, opacityClass, tone } from "./tones";

type WavesKind = (typeof sectionKinds.waves)[number];

const rippleTank: Glyph = ({ part, p, v, still }) => {
  const wavelength = Math.max(4, v("wavelength") * 6);
  const barrier = v("barrier");
  const apparent = v("apparent");
  const strobing = v("strobe") === 1;
  const frozen = strobing && Math.abs(apparent) < 0.05;
  const rate = strobing ? Math.min(Math.abs(apparent), 3) : 3;
  const forward = apparent >= 0;
  const id = `ripple-${part.id}`;
  const stop = barrier === 0 ? 316 : 220;
  const count = Math.ceil((stop - 64) / wavelength) + 2;
  const front = (offset: number) =>
    Array.from({ length: count }, (_, k) => (
      <path
        key={k}
        d={`M26 ${offset + 64 + k * wavelength} H434`}
        strokeWidth="2"
        className="stroke-sky-100 dark:stroke-sky-200"
      />
    ));
  const gap = barrier === 2 ? 26 : 110;
  const gapX = 230 - gap / 2;
  return (
    <>
      <clipPath id={id}>
        <rect x="24" y="64" width="412" height={stop - 64} />
      </clipPath>
      <rect
        x="20"
        y="40"
        width="420"
        height="284"
        rx="8"
        strokeWidth="3"
        className={tone.glass}
      />
      <rect
        x="24"
        y="64"
        width="412"
        height="256"
        className="fill-sky-500/70 dark:fill-sky-700/80"
      />
      <rect
        x="100"
        y="48"
        width="260"
        height="8"
        rx="3"
        className={tone.dark}
      />
      {[130, 190, 250, 310].map((x) => (
        <circle key={x} cx={x} cy="60" r="4" className="fill-slate-300" />
      ))}
      <g clipPath={`url(#${id})`}>
        <g>
          {front(0)}
          {!still && !frozen && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values={forward ? `0 0;0 ${wavelength}` : `0 ${wavelength};0 0`}
              dur={`${1 / Math.max(rate, 0.2)}s`}
              repeatCount="indefinite"
            />
          )}
        </g>
      </g>
      {barrier === 1 && (
        <>
          <path
            d="M120 236 L340 212"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-slate-700 dark:stroke-slate-300"
          />
          {Array.from({ length: 4 }, (_, k) => (
            <path
              key={k}
              d={`M${130 + k * 4} ${180 - k * wavelength * 0.9} L${330 + k * 4} ${156 - k * wavelength * 0.9}`}
              strokeWidth="2"
              className="stroke-sky-100 opacity-60"
            />
          ))}
        </>
      )}
      {barrier >= 2 && (
        <>
          <path
            d={`M26 224 H${gapX} M${gapX + gap} 224 H434`}
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-slate-700 dark:stroke-slate-300"
          />
          {barrier === 2
            ? Array.from({ length: 4 }, (_, k) => (
                <path
                  key={k}
                  d={`M${230 - (k + 1) * wavelength} 224 A${(k + 1) * wavelength} ${(k + 1) * wavelength} 0 0 0 ${230 + (k + 1) * wavelength} 224`}
                  fill="none"
                  strokeWidth="2"
                  className="stroke-sky-100 opacity-70"
                />
              ))
            : Array.from({ length: 4 }, (_, k) => (
                <path
                  key={k}
                  d={`M${gapX} ${240 + k * wavelength} H${gapX + gap}`}
                  strokeWidth="2"
                  className="stroke-sky-100 opacity-70"
                />
              ))}
        </>
      )}
      <Label x={230} y={34} size={11}>
        {p("freq")} Hz{strobing ? ` · strobe ${p("strobe")} Hz` : ""}
      </Label>
    </>
  );
};

function slinkyPath(
  type: number,
  wavelength: number,
  length: number,
  phase: number,
) {
  let d = "";
  const rings = Math.floor(length / 9);
  for (let i = 0; i < rings; i++) {
    const x = 30 + i * 9;
    const wave = Math.sin((2 * Math.PI * (i * 9)) / wavelength - phase);
    if (type === 0)
      d += `M${x} ${80 + wave * 22} v34 M${x} ${80 + wave * 22} v-34 `;
    else d += `M${x + wave * 8} 46 v68 `;
  }
  return d;
}

const slinky: Glyph = ({ v, still }) => {
  const length = Math.min(420, v("stretch") * 100);
  const wavelength = Math.max(40, v("wavelength") * 100);
  const frames = Array.from({ length: 9 }, (_, k) =>
    slinkyPath(v("type"), wavelength, length, (2 * Math.PI * k) / 8),
  );
  return (
    <>
      <rect x="6" y="40" width="16" height="80" rx="3" className={tone.dark} />
      <rect
        x={30 + length + 4}
        y="30"
        width="14"
        height="100"
        rx="3"
        className={tone.dark}
      />
      <path
        d={frames[0]}
        fill="none"
        strokeWidth="2.5"
        className="stroke-slate-500 dark:stroke-slate-300"
      >
        {!still && (
          <animate
            attributeName="d"
            values={frames.join(";")}
            dur={`${1 / v("freq")}s`}
            repeatCount="indefinite"
          />
        )}
      </path>
      <Label x={240} y={170} size={11}>
        {v("type") === 0 ? "transverse wave" : "longitudinal wave"} · λ ={" "}
        {(wavelength / 100).toFixed(2)} m
      </Label>
    </>
  );
};

const forkGlyph: Glyph = ({ v, still }) => (
  <>
    <path
      d="M52 186 Q52 200 70 200 Q88 200 88 186"
      fill="none"
      strokeWidth="9"
      className="stroke-slate-500 dark:stroke-slate-300"
    />
    <rect x="65" y="198" width="10" height="64" rx="3" className={tone.steel} />
    {[52, 88].map((x, i) => (
      <g key={x}>
        <rect
          x={x - 5}
          y="40"
          width="10"
          height="150"
          rx="3"
          className={tone.steel}
        />
        {!still && v("struck") === 1 && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`${i === 0 ? -2 : 2} ${x} 190;${i === 0 ? 2 : -2} ${x} 190;${i === 0 ? -2 : 2} ${x} 190`}
            dur="0.14s"
            repeatCount="indefinite"
          />
        )}
      </g>
    ))}
    {v("struck") === 1 &&
      [14, 26].map((r) => (
        <g key={r}>
          <path
            d={`M${30 - r} 70 q-${r / 2} 14 0 ${r * 1.6}`}
            fill="none"
            strokeWidth="1.5"
            className={inkSoft}
          />
          <path
            d={`M${110 + r} 70 q${r / 2} 14 0 ${r * 1.6}`}
            fill="none"
            strokeWidth="1.5"
            className={inkSoft}
          />
        </g>
      ))}
    <Label x={70} y={24} size={12}>
      {v("freq")} Hz
    </Label>
  </>
);

const sonometer: Glyph = ({ p, v, still }) => {
  const bridge = 70 + p("length") * 4.4;
  const mass = 14 + p("mass") * 3;
  const resonant = v("resonant") === 1;
  return (
    <>
      <rect
        x="24"
        y="100"
        width="480"
        height="56"
        rx="4"
        strokeWidth="2"
        className={tone.wood}
      />
      <ellipse cx="200" cy="128" rx="14" ry="8" className={tone.dark} />
      <ellipse cx="400" cy="128" rx="14" ry="8" className={tone.dark} />
      <rect x="32" y="84" width="8" height="18" className={tone.steel} />
      <path
        d={`M36 86 H520 V150 L${520} 170`}
        fill="none"
        strokeWidth="1.5"
        className={ink}
      />
      <rect x="66" y="86" width="8" height="16" className={tone.brass} />
      <rect
        x={bridge - 4}
        y="86"
        width="8"
        height="16"
        className={tone.brass}
      />
      <path d={`M${bridge} 80 L${bridge} 86`} strokeWidth="1" className={ink} />
      <path
        d={`M${(70 + bridge) / 2 - 8} 82 l8 -10 l8 10`}
        fill="none"
        strokeWidth="2"
        className="stroke-red-600"
      >
        {!still && resonant && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -26;0 -52"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </path>
      <circle cx="520" cy="86" r="8" strokeWidth="2" className={tone.metal} />
      <path d="M528 86 V120" strokeWidth="1.5" className={ink} fill="none" />
      <rect
        x={528 - mass / 2}
        y="120"
        width={mass}
        height={mass}
        rx="3"
        strokeWidth="1.5"
        className={tone.copper}
      />
      <Label x={528} y={140 + mass} size={10}>
        {p("mass")} kg
      </Label>
      <Label x={(70 + bridge) / 2} y={176} size={11}>
        L = {p("length")} cm
      </Label>
    </>
  );
};

const resonanceTube: Glyph = ({ p, v }) => {
  const water = 40 + p("length") * 3.6;
  const loud = v("loudness");
  return (
    <>
      <rect
        x="80"
        y="40"
        width="40"
        height="370"
        rx="4"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect
        x="81"
        y={water}
        width="38"
        height={409 - water}
        className={tone.liquid}
      />
      <rect
        x="50"
        y="402"
        width="100"
        height="26"
        rx="4"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d="M92 16 V36 M108 16 V36"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-slate-500 dark:stroke-slate-300"
      />
      <path
        d="M100 46 H134"
        strokeWidth="1"
        strokeDasharray="3 3"
        className={inkSoft}
      />
      <path
        d={`M134 ${water} H156`}
        strokeWidth="1.5"
        className="stroke-red-600"
      />
      <rect
        x="164"
        y="40"
        width="14"
        height="140"
        rx="3"
        className={tone.light}
        strokeWidth="1"
      />
      <rect
        x="165"
        y={179 - loud * 138}
        width="12"
        height={loud * 138}
        className={loud > 0.9 ? "fill-green-500" : "fill-sky-400"}
      />
      <Label x={171} y={196} size={10}>
        loud
      </Label>
      <Label x={100} y={440} size={11}>
        L = {p("length")} cm
      </Label>
    </>
  );
};

const generator: Glyph = ({ p, v }) => (
  <>
    <rect
      x="10"
      y="10"
      width="220"
      height="104"
      rx="8"
      strokeWidth="2"
      className={tone.light}
    />
    <rect
      x="22"
      y="20"
      width="110"
      height="42"
      rx="4"
      className={tone.screen}
    />
    <text
      x="77"
      y="44"
      textAnchor="middle"
      fontSize="16"
      className="fill-green-400 font-mono font-bold"
    >
      {v("freq")} Hz
    </text>
    <path
      d={
        [
          "M30 56 q8 -10 16 0 t16 0",
          "M30 54 h8 v-6 h8 v12 h8 v-12 h8 v6",
          "M30 56 l8 -8 l8 8 l8 -8 l8 8",
        ][p("wave")]
      }
      fill="none"
      strokeWidth="1.5"
      className="stroke-green-400"
    />
    <circle cx="170" cy="40" r="14" strokeWidth="2" className={tone.steel} />
    <path
      d="M170 40 v-10"
      strokeWidth="3"
      transform={`rotate(${(v("amp") / 10) * 270 - 135} 170 40)`}
      className="stroke-white"
    />
    <Label x={170} y={70} size={10}>
      {v("amp")} V
    </Label>
    <Label x={197} y={92} size={10}>
      OUT
    </Label>
  </>
);

const speaker: Glyph = ({ v, still }) => {
  const motion = Math.min(1, Math.sqrt(v("power"))) * 0.1;
  return (
    <>
      <rect
        x="20"
        y="8"
        width="150"
        height="140"
        rx="8"
        strokeWidth="2"
        className={tone.dark}
      />
      <g>
        <circle
          cx="95"
          cy="78"
          r="54"
          strokeWidth="2"
          className="fill-slate-700 stroke-slate-500"
        />
        <circle
          cx="95"
          cy="78"
          r="36"
          strokeWidth="2"
          className="fill-slate-600 stroke-slate-400"
        />
        <circle cx="95" cy="78" r="14" className="fill-slate-400" />
        {!still && v("ac") === 1 && v("power") > 0.01 && (
          <animateTransform
            attributeName="transform"
            type="scale"
            additive="sum"
            values={`1;${1 + motion};1;${1 - motion};1`}
            dur="0.25s"
            repeatCount="indefinite"
          />
        )}
      </g>
      <Label x={95} y={172} size={10}>
        {v("ac") === 1 ? `${v("freq").toFixed(0)} Hz` : "d.c."}
      </Label>
    </>
  );
};

const GRID_X = 24;
const GRID_Y = 20;
const DIV = 24;

const cro: Glyph = ({ part, v }) => {
  const on = v("power") === 1;
  const gain = v("gain");
  const timebase = v("timebase");
  const clip = `cro-${part.id}`;
  let trace = "";
  if (on) {
    for (let px = 0; px <= 240; px += 2) {
      const phase = (v("frequency") * ((px / DIV) * timebase)) / 1000;
      const value =
        v("amplitude") *
          (v("frequency") > 0 ? waveValue(v("wave"), phase) : 0) +
        v("offset");
      const x = GRID_X + px + v("xshift") * DIV;
      const y = GRID_Y + 4 * DIV - (value / gain + v("yshift")) * DIV;
      trace += `${px === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }
  const blur = Math.abs(v("focus") - 0.5) * 8;
  return (
    <>
      <rect
        x="4"
        y="4"
        width="352"
        height="320"
        rx="14"
        strokeWidth="2"
        className={tone.light}
      />
      <rect
        x={GRID_X - 6}
        y={GRID_Y - 6}
        width="252"
        height="204"
        rx="12"
        className={tone.dark}
      />
      <clipPath id={clip}>
        <rect x={GRID_X} y={GRID_Y} width="240" height="192" />
      </clipPath>
      <rect
        x={GRID_X}
        y={GRID_Y}
        width="240"
        height="192"
        className="fill-emerald-950"
      />
      <path
        d={
          Array.from(
            { length: 11 },
            (_, i) => `M${GRID_X + i * DIV} ${GRID_Y} v192`,
          ).join(" ") +
          Array.from(
            { length: 9 },
            (_, i) => `M${GRID_X} ${GRID_Y + i * DIV} h240`,
          ).join(" ")
        }
        fill="none"
        strokeWidth="1"
        className="stroke-emerald-800"
      />
      <path
        d={`M${GRID_X} ${GRID_Y + 4 * DIV} h240 M${GRID_X + 5 * DIV} ${GRID_Y} v192`}
        fill="none"
        strokeWidth="1.5"
        className="stroke-emerald-600"
      />
      <g clipPath={`url(#${clip})`}>
        {on && (
          <>
            <path
              d={trace}
              fill="none"
              strokeWidth={2 + blur * 2}
              className={`stroke-green-400 ${opacityClass(Math.max(0.1, v("bright") * 0.4))}`}
            />
            <path
              d={trace}
              fill="none"
              strokeWidth={1.4 + blur * 0.4}
              className={`stroke-green-300 ${opacityClass(v("bright"))}`}
            />
          </>
        )}
      </g>
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx={290 + (i % 2) * 40}
          cy={48 + Math.floor(i / 2) * 60}
          r="14"
          strokeWidth="2"
          className={tone.steel}
        />
      ))}
      <circle
        cx="310"
        cy="190"
        r="9"
        className={on ? "fill-green-500" : "fill-red-600"}
      />
      <Label x={310} y={214} size={10}>
        {on ? "ON" : "OFF"}
      </Label>
      <Label x={GRID_X + 120} y={226} size={10}>
        {timebase} ms/div · {gain} V/div
      </Label>
      <text
        x={80}
        y={290}
        textAnchor="middle"
        fontSize="10"
        className={`${inkFill} font-bold`}
      >
        Y
      </text>
      <text
        x={140}
        y={290}
        textAnchor="middle"
        fontSize="10"
        className={`${inkFill} font-bold`}
      >
        ⏚
      </text>
    </>
  );
};

export const wavesGlyphs: Record<WavesKind, Glyph> = {
  "ripple-tank": rippleTank,
  slinky,
  "tuning-fork": forkGlyph,
  sonometer,
  "resonance-tube": resonanceTube,
  "signal-generator": generator,
  loudspeaker: speaker,
  cro,
};
