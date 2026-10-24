import type { sectionKinds } from "../../data/kinds";
import type { Glyph } from "../../workbench.types";
import { Label } from "./shapes";
import { ink, inkSoft, opacityClass, tone } from "./tones";

type ModernKind = (typeof sectionKinds.modern)[number];

const diode: Glyph = ({ v }) => (
  <>
    <rect
      x="22"
      y="10"
      width="66"
      height="30"
      rx="10"
      strokeWidth="2"
      className={
        v("on") === 1
          ? "fill-green-100 stroke-green-500 dark:fill-green-900"
          : tone.glass
      }
    />
    <path
      d="M10 25 H34 M76 25 H100"
      fill="none"
      strokeWidth="2"
      className={ink}
    />
    <path d="M38 12 V38 L68 25 Z" strokeWidth="2" className={tone.dark} />
    <path d="M70 12 V38" strokeWidth="3" className={ink} />
  </>
);

const ledColours = [
  "fill-red-500 stroke-red-700",
  "fill-green-500 stroke-green-700",
  "fill-blue-500 stroke-blue-700",
];
const ledGlow = ["fill-red-300", "fill-green-300", "fill-blue-300"];

const led: Glyph = ({ v }) => {
  const brightness = v("brightness");
  const burnt = v("burnt") === 1;
  return (
    <>
      {brightness > 0.05 && !burnt && (
        <circle
          cx="45"
          cy="42"
          r="40"
          className={`${ledGlow[v("colour")]} ${opacityClass(Math.min(1, brightness) * 0.8)}`}
        />
      )}
      <path
        d="M20 74 V42 A25 25 0 0 1 70 42 V74 Z"
        strokeWidth="2"
        className={
          burnt ? "fill-slate-600 stroke-slate-800" : ledColours[v("colour")]
        }
      />
      <rect
        x="14"
        y="74"
        width="62"
        height="6"
        rx="2"
        className={tone.light}
        strokeWidth="1"
      />
      <path d="M26 80 V96 M64 80 V96" strokeWidth="2.5" className={inkSoft} />
      <path d="M26 80 V96" strokeWidth="2.5" className={ink} />
      {burnt && (
        <path
          d="M36 30 L46 44 L40 54"
          fill="none"
          strokeWidth="2"
          className="stroke-red-300"
        />
      )}
    </>
  );
};

const transistor: Glyph = ({ v }) => (
  <>
    <path
      d="M40 16 H62 A34 34 0 0 1 62 104 H40 Z"
      strokeWidth="2"
      className={v("on") === 1 ? "fill-slate-700 stroke-green-500" : tone.dark}
    />
    <text
      x="60"
      y="66"
      textAnchor="middle"
      fontSize="12"
      className="fill-white font-bold"
    >
      NPN
    </text>
    <path
      d="M12 60 H40 M40 24 H88 V14 M40 96 H88 V106"
      fill="none"
      strokeWidth="2.5"
      className={inkSoft}
    />
    <Label x={22} y={50} size={9}>
      B
    </Label>
    <Label x={76} y={36} size={9}>
      C
    </Label>
    <Label x={76} y={90} size={9}>
      E
    </Label>
  </>
);

const ldr: Glyph = ({ v }) => (
  <>
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${8 + i * 14} 4 l8 12`}
        strokeWidth="2"
        className={`stroke-amber-400 ${opacityClass(Math.min(1, v("light") / 400) + 0.2)}`}
      />
    ))}
    <circle
      cx="50"
      cy="48"
      r="32"
      strokeWidth="2"
      className="fill-orange-100 stroke-orange-300 dark:fill-orange-200"
    />
    <path
      d="M28 40 H72 M28 48 H72 M28 56 H72 M34 36 V60 M66 36 V60"
      fill="none"
      strokeWidth="2"
      className="stroke-slate-700"
    />
    <path
      d="M16 86 V68 M84 86 V68"
      strokeWidth="2.5"
      className={inkSoft}
      fill="none"
    />
  </>
);

const thermistor: Glyph = ({ v }) => (
  <>
    <ellipse
      cx="50"
      cy="44"
      rx="22"
      ry="26"
      strokeWidth="2"
      className={v("temp") > 60 ? "fill-red-800 stroke-red-950" : tone.dark}
    />
    <path
      d="M16 86 V66 L40 54 M84 86 V66 L60 54"
      fill="none"
      strokeWidth="2.5"
      className={inkSoft}
    />
    <Label x={50} y={48} size={10}>
      {v("temp")}°
    </Label>
  </>
);

const radiation: Glyph = ({ p, v, outcome }) => {
  const source = p("source");
  const absorber = p("absorber");
  const sourceX = 240 - p("distance") * 7;
  const colours = ["", "fill-yellow-400", "fill-orange-500", "fill-green-500"];
  const slabs = ["", "fill-white", "fill-slate-400", "fill-slate-700"];
  const widths = [0, 2, 10, 16];
  const reach = source === 1 ? 5 : 1000;
  const blocked =
    (source === 1 && absorber > 0) || (source === 2 && absorber >= 2);
  return (
    <>
      <rect
        x="6"
        y="150"
        width="368"
        height="10"
        rx="3"
        className={tone.dark}
      />
      <rect
        x="240"
        y="76"
        width="64"
        height="40"
        rx="20"
        strokeWidth="2"
        className={tone.glass}
      />
      <rect x="236" y="86" width="8" height="20" className={tone.brass} />
      <rect
        x="310"
        y="40"
        width="64"
        height="76"
        rx="6"
        strokeWidth="2"
        className={tone.dark}
      />
      <rect
        x="318"
        y="50"
        width="48"
        height="26"
        rx="3"
        className={tone.screen}
      />
      <text
        x="342"
        y="69"
        textAnchor="middle"
        fontSize="12"
        className="fill-green-400 font-mono font-bold"
      >
        {outcome.readouts?.[0]?.value.replace("press Count", "—") ?? "—"}
      </text>
      <path d="M304 96 H310" strokeWidth="3" className={ink} />
      {source > 0 && (
        <>
          <rect
            x={sourceX - 14}
            y="98"
            width="28"
            height="52"
            rx="3"
            className={tone.steel}
            strokeWidth="1.5"
          />
          <circle
            cx={sourceX}
            cy="90"
            r="9"
            className={`${colours[source]} stroke-slate-800`}
            strokeWidth="1.5"
          />
          {absorber > 0 && (
            <rect
              x={(sourceX + 240) / 2 - widths[absorber] / 2}
              y="62"
              width={widths[absorber]}
              height="60"
              strokeWidth="1"
              className={`${slabs[absorber]} stroke-slate-600`}
            />
          )}
          {p("distance") <= reach && (
            <path
              d={`M${sourceX + 12} 96 H${blocked ? (sourceX + 240) / 2 - 2 : 240}`}
              fill="none"
              strokeWidth="2"
              strokeDasharray="6 5"
              className={`stroke-red-500 ${opacityClass(Math.min(1, v("rate") / 20 + 0.25))}`}
            />
          )}
        </>
      )}
      <Label x={190} y={178} size={10}>
        {["no source: background only", "alpha", "beta", "gamma"][source]} ·{" "}
        {p("distance")} cm
      </Label>
    </>
  );
};

export const modernGlyphs: Record<ModernKind, Glyph> = {
  diode,
  led,
  transistor,
  ldr,
  thermistor,
  "radiation-kit": radiation,
};
