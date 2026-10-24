import { fieldAt } from "../../data/catalogue/magnetism";
import { seeded } from "../../data/catalogue/helpers";
import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Label } from "./shapes";
import { ink, inkSoft, tone } from "./tones";

type MagnetismKind = (typeof sectionKinds.magnetism)[number];

const barMagnet: Glyph = ({ p }) => (
  <g transform={`rotate(${p("angle")} 100 30)`}>
    <rect
      x="20"
      y="8"
      width="80"
      height="44"
      strokeWidth="2"
      className={tone.blue}
    />
    <rect
      x="100"
      y="8"
      width="80"
      height="44"
      strokeWidth="2"
      className={tone.red}
    />
    <text
      x="60"
      y="38"
      textAnchor="middle"
      fontSize="22"
      className="fill-white font-black"
    >
      S
    </text>
    <text
      x="140"
      y="38"
      textAnchor="middle"
      fontSize="22"
      className="fill-white font-black"
    >
      N
    </text>
  </g>
);

const uMagnet: Glyph = ({ p }) => (
  <g transform={`rotate(${p("angle")} 65 65)`}>
    <path
      d="M32 18 V70 A33 33 0 0 0 98 70 V18"
      fill="none"
      strokeWidth="22"
      className="stroke-slate-500 dark:stroke-slate-400"
    />
    <rect x="21" y="8" width="22" height="34" className={tone.red} />
    <rect x="87" y="8" width="22" height="34" className={tone.blue} />
    <text
      x="32"
      y="30"
      textAnchor="middle"
      fontSize="14"
      className="fill-white font-black"
    >
      N
    </text>
    <text
      x="98"
      y="30"
      textAnchor="middle"
      fontSize="14"
      className="fill-white font-black"
    >
      S
    </text>
  </g>
);

const filings: Glyph = ({ part, p, env }) => {
  let d = "";
  for (let row = 0; row < 14; row++)
    for (let column = 0; column < 20; column++) {
      const x = 10 + column * 12.5;
      const y = 10 + row * 12.5;
      const field = fieldAt(env, part.x + x, part.y + y);
      const angle =
        p("tapped") === 1
          ? Math.atan2(field.y, field.x)
          : seeded(part.id, row * 20 + column) * Math.PI;
      const half = p("tapped") === 1 ? 4.5 : 3;
      d += `M${x - half * Math.cos(angle)} ${y - half * Math.sin(angle)} L${x + half * Math.cos(angle)} ${y + half * Math.sin(angle)} `;
    }
  return (
    <>
      <rect
        x="0"
        y="0"
        width="260"
        height="190"
        rx="4"
        className={tone.paper}
        strokeWidth="1.5"
      />
      <path
        d={d}
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="stroke-slate-800 dark:stroke-slate-700"
      />
    </>
  );
};

const compass: Glyph = ({ v }) => (
  <>
    <circle cx="45" cy="45" r="40" strokeWidth="3" className={tone.brass} />
    <circle
      cx="45"
      cy="45"
      r="34"
      strokeWidth="1"
      className="fill-white stroke-slate-300 dark:fill-slate-200"
    />
    <text
      x="45"
      y="20"
      textAnchor="middle"
      fontSize="9"
      className="fill-slate-600 font-bold"
    >
      N
    </text>
    <g transform={`rotate(${v("heading")} 45 45)`}>
      <path d="M45 15 L40 45 L50 45 Z" className="fill-red-600" />
      <path
        d="M45 75 L40 45 L50 45 Z"
        className="fill-slate-300 stroke-slate-500"
        strokeWidth="1"
      />
    </g>
    <circle cx="45" cy="45" r="3" className="fill-slate-700" />
  </>
);

const solenoid: Glyph = ({ v }) => {
  const current = v("current");
  const active = Math.abs(current) > 0.005;
  let coil = "";
  for (let i = 0; i < 12; i++) coil += `M${34 + i * 11} 34 L${42 + i * 11} 80 `;
  return (
    <>
      {v("gain") > 1 && (
        <rect
          x="22"
          y="48"
          width="156"
          height="14"
          rx="4"
          className={tone.steel}
          strokeWidth="1.5"
        />
      )}
      <path
        d={coil}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-orange-500"
      />
      <path
        d="M14 94 V57 H34 M186 94 V57 H166"
        fill="none"
        strokeWidth="3"
        className="stroke-orange-500"
      />
      {active && (
        <>
          <text
            x={current > 0 ? 184 : 16}
            y="40"
            textAnchor="middle"
            fontSize="16"
            className="fill-red-600 font-black"
          >
            N
          </text>
          <text
            x={current > 0 ? 16 : 184}
            y="40"
            textAnchor="middle"
            fontSize="16"
            className="fill-blue-600 font-black"
          >
            S
          </text>
        </>
      )}
    </>
  );
};

const core: Glyph = ({ p }) => {
  const classes = [
    tone.steel,
    "fill-slate-300 stroke-slate-500",
    tone.copper,
    "fill-sky-200 stroke-sky-400",
  ];
  return (
    <>
      <rect
        x="8"
        y="12"
        width="154"
        height="26"
        rx="6"
        strokeWidth="2"
        className={classes[p("material")]}
      />
      <Label x={85} y={30} size={11}>
        {["soft iron", "steel", "copper", "plastic"][p("material")]}
      </Label>
    </>
  );
};

const electromagnet: Glyph = ({ v }) => {
  const clips = v("clips");
  return (
    <>
      <path
        d="M50 96 V30 H150 V96"
        fill="none"
        strokeWidth="18"
        strokeLinejoin="round"
        className="stroke-slate-500 dark:stroke-slate-400"
      />
      {[50, 150].map((x) => (
        <g key={x}>
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={i}
              d={`M${x - 15} ${38 + i * 8} L${x + 15} ${44 + i * 8}`}
              strokeWidth="3.5"
              className="stroke-orange-500"
            />
          ))}
        </g>
      ))}
      <path
        d="M16 114 V100 H40 M184 114 V100 H160"
        fill="none"
        strokeWidth="3"
        className="stroke-orange-500"
      />
      {Array.from({ length: clips }, (_, i) => (
        <rect
          key={i}
          x={i % 2 === 0 ? 43 : 143}
          y={104 + Math.floor(i / 2) * 5}
          width="14"
          height="8"
          rx="3"
          fill="none"
          strokeWidth="1.5"
          className="stroke-slate-700 dark:stroke-slate-200"
        />
      ))}
    </>
  );
};

const motor: Glyph = ({ p, v, still }) => {
  const rpm = v("rpm");
  const duration = Math.max(0.5, 300 / Math.max(Math.abs(rpm), 1));
  const north = p("poles") === 0;
  return (
    <>
      {p("field") === 1 && (
        <>
          <rect
            x="6"
            y="30"
            width="34"
            height="70"
            rx="3"
            className={north ? tone.red : tone.blue}
          />
          <rect
            x="130"
            y="30"
            width="34"
            height="70"
            rx="3"
            className={north ? tone.blue : tone.red}
          />
          <text
            x="23"
            y="72"
            textAnchor="middle"
            fontSize="16"
            className="fill-white font-black"
          >
            {north ? "N" : "S"}
          </text>
          <text
            x="147"
            y="72"
            textAnchor="middle"
            fontSize="16"
            className="fill-white font-black"
          >
            {north ? "S" : "N"}
          </text>
        </>
      )}
      <g>
        <rect
          x="55"
          y="42"
          width="60"
          height="46"
          rx="4"
          fill="none"
          strokeWidth="4"
          className="stroke-orange-500"
        />
        <path d="M85 30 V100" strokeWidth="3" className={ink} />
        {!still && Math.abs(rpm) > 1 && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={rpm > 0 ? "0 85 65;360 85 65" : "360 85 65;0 85 65"}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        )}
      </g>
      <rect x="76" y="100" width="18" height="10" className={tone.copper} />
      <path
        d="M30 120 H70 V110 M140 120 H100 V110"
        fill="none"
        strokeWidth="2.5"
        className={inkSoft}
      />
    </>
  );
};

const generator: Glyph = ({ p, v, still }) => {
  const duration = Math.max(0.4, 120 / Math.max(v("rpm"), 1));
  return (
    <>
      <rect x="6" y="28" width="30" height="64" rx="3" className={tone.red} />
      <rect
        x="124"
        y="28"
        width="30"
        height="64"
        rx="3"
        className={tone.blue}
      />
      <g>
        <rect
          x="50"
          y="38"
          width="54"
          height="44"
          rx="4"
          fill="none"
          strokeWidth="4"
          className="stroke-orange-500"
        />
        <path d="M77 26 V100" strokeWidth="3" className={ink} />
        {!still && v("rpm") > 0 && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 77 60;360 77 60"
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        )}
      </g>
      <path d="M77 60 H150 V90" fill="none" strokeWidth="3" className={ink} />
      <circle cx="150" cy="96" r="9" className={tone.brass} strokeWidth="1.5" />
      {p("type") === 0 ? (
        <>
          <circle
            cx="77"
            cy="104"
            r="6"
            fill="none"
            strokeWidth="3"
            className="stroke-yellow-600"
          />
          <circle
            cx="77"
            cy="116"
            r="6"
            fill="none"
            strokeWidth="3"
            className="stroke-yellow-600"
          />
        </>
      ) : (
        <path
          d="M70 104 a8 8 0 0 1 16 0 M70 118 a8 8 0 0 0 16 0"
          fill="none"
          strokeWidth="4"
          className="stroke-yellow-600"
        />
      )}
      <path
        d="M60 130 V118 M130 130 V96"
        fill="none"
        strokeWidth="2.5"
        className={inkSoft}
      />
    </>
  );
};

const transformer: Glyph = ({ p }) => {
  const primary = [4, 6, 9][p("np")];
  const secondary = [3, 4, 6, 9, 12][p("ns")];
  const coil = (x: number, turns: number) =>
    Array.from({ length: turns }, (_, i) => (
      <path
        key={i}
        d={`M${x - 18} ${34 + (i * 72) / turns} L${x + 18} ${40 + (i * 72) / turns}`}
        strokeWidth="3.5"
        className="stroke-orange-500"
      />
    ));
  return (
    <>
      <rect
        x="20"
        y="20"
        width="180"
        height="110"
        rx="4"
        fill="none"
        strokeWidth="18"
        className="stroke-slate-500 dark:stroke-slate-400"
      />
      {coil(29, primary)}
      {coil(191, secondary)}
      <path
        d="M29 112 V150 H30 M55 112 V150 H80 M191 112 V140 H190 M165 112 V150 H140"
        fill="none"
        strokeWidth="2.5"
        className="stroke-orange-500"
      />
      <Label x={55} y={168} size={10}>
        primary {[50, 100, 200][p("np")]}
      </Label>
      <Label x={165} y={168} size={10}>
        secondary {[25, 50, 100, 200, 400][p("ns")]}
      </Label>
    </>
  );
};

const bell: Glyph = ({ v, still }) => (
  <>
    <rect
      x="10"
      y="150"
      width="130"
      height="14"
      rx="3"
      className={tone.darkWood}
    />
    <rect
      x="22"
      y="70"
      width="34"
      height="62"
      rx="4"
      className="fill-orange-500/80 stroke-orange-700"
      strokeWidth="2"
    />
    <rect x="30" y="56" width="18" height="16" className={tone.steel} />
    <path
      d="M110 24 A34 34 0 0 1 144 58 H76 A34 34 0 0 1 110 24 Z"
      strokeWidth="2"
      className={tone.brass}
    />
    <g>
      <path
        d="M62 104 H100"
        strokeWidth="4"
        className="stroke-slate-600 dark:stroke-slate-300"
      />
      <circle cx="104" cy="104" r="7" className={tone.dark} />
      {!still && v("ringing") === 1 && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 62 104;-22 62 104;0 62 104"
          dur="0.18s"
          repeatCount="indefinite"
        />
      )}
    </g>
    <path
      d="M30 150 V132 M120 150 V120 H100 V98"
      fill="none"
      strokeWidth="2.5"
      className={inkSoft}
    />
  </>
);

export const magnetismGlyphs: Record<MagnetismKind, Glyph> = {
  "bar-magnet": barMagnet,
  "u-magnet": uMagnet,
  "iron-filings": filings,
  "plotting-compass": compass,
  solenoid,
  "soft-iron-core": core,
  electromagnet,
  "motor-model": motor,
  "generator-model": generator,
  transformer,
  "electric-bell": bell,
};
