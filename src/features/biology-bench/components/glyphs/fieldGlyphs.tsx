import { Label } from "../../../workbench/components/glyphs/shapes";
import { ink, inkSoft, tone } from "../../../workbench/components/glyphs/tones";
import { seeded } from "../../../workbench/data/catalogue/helpers";
import { glassFill } from "../../../chemistry-bench/components/glyphs/geometry";
import {
  Flame,
  Knob,
  Lamp,
  Screen,
} from "../../../chemistry-bench/components/glyphs/pieces";
import type { BioGlyph } from "../../biology.types";
import {
  FIELD_H,
  FIELD_W,
  fieldPlants,
  PX_PER_M,
  shade,
} from "../../data/catalogue/ecology";
import { kernelTypes, KERNELS } from "../../data/catalogue/genetics";
import type { bioSectionKinds } from "../../data/kinds";

type EcologyKind = (typeof bioSectionKinds.ecology)[number];
type GeneticsKind = (typeof bioSectionKinds.genetics)[number];
type MicrobiologyKind = (typeof bioSectionKinds.microbiology)[number];

const plantFill = [
  "fill-green-700 dark:fill-green-500",
  "fill-white",
  "fill-purple-600",
];

const field: BioGlyph = ({ part }) => (
  <>
    <rect
      width={FIELD_W}
      height={FIELD_H}
      rx="6"
      className="fill-lime-300 dark:fill-lime-900"
    />
    <rect
      width={FIELD_W / 3}
      height={FIELD_H}
      rx="6"
      className="fill-emerald-500/30"
    />
    <circle
      cx={shade.x}
      cy={shade.y}
      r={shade.r}
      className="fill-green-900/25"
    />
    {fieldPlants(part).map((plant, index) => (
      <circle
        key={index}
        cx={plant.x}
        cy={plant.y}
        r={plant.species === 0 ? 1.6 : plant.species === 1 ? 2.6 : 3.2}
        className={plantFill[plant.species]}
      />
    ))}
    {fieldPlants(part)
      .filter((plant) => plant.species === 1)
      .map((plant, index) => (
        <circle
          key={`c${index}`}
          cx={plant.x}
          cy={plant.y}
          r="1"
          className="fill-yellow-400"
        />
      ))}
    <circle
      cx={shade.x - 10}
      cy={shade.y - 10}
      r="22"
      className="fill-green-800 dark:fill-green-700"
    />
    <Label x={FIELD_W - 30} y={FIELD_H - 8} size={9}>
      dry
    </Label>
    <Label x={24} y={FIELD_H - 8} size={9}>
      wet
    </Label>
  </>
);

const pond: BioGlyph = () => (
  <>
    <ellipse
      cx="150"
      cy="80"
      rx="146"
      ry="76"
      className="fill-sky-500/70 stroke-sky-700"
      strokeWidth="2"
    />
    <ellipse cx="150" cy="80" rx="100" ry="48" className="fill-sky-700/40" />
    {[20, 34, 266, 280].map((x) => (
      <path
        key={x}
        d={`M${x} 90 V40`}
        strokeWidth="3"
        className="stroke-green-700"
      />
    ))}
  </>
);

const quadrat: BioGlyph = ({ v }) => (
  <rect
    x="1"
    y="1"
    width={PX_PER_M - 2}
    height={PX_PER_M - 2}
    fill="none"
    strokeWidth="2.5"
    className={v("random") === 1 ? "stroke-green-600" : "stroke-orange-500"}
  />
);

const tape: BioGlyph = () => (
  <>
    <rect
      y="4"
      width={FIELD_W}
      height="6"
      className="fill-yellow-300 stroke-yellow-600"
      strokeWidth="1"
    />
    {Array.from({ length: 13 }, (_, index) => (
      <path
        key={index}
        d={`M${index * PX_PER_M} 2 V12`}
        strokeWidth="1.5"
        className={ink}
      />
    ))}
  </>
);

const pooter: BioGlyph = ({ p }) => (
  <>
    <rect
      x="30"
      y="30"
      width="50"
      height="54"
      rx="8"
      strokeWidth="2"
      className={tone.glass}
    />
    <rect
      x="28"
      y="22"
      width="54"
      height="12"
      rx="3"
      className="fill-slate-700"
    />
    <path
      d="M44 22 Q30 4 6 6 M66 22 Q80 4 104 6"
      fill="none"
      strokeWidth="4"
      className="stroke-slate-400"
    />
    {p("gauze") === 1 && (
      <rect
        x="62"
        y="24"
        width="8"
        height="8"
        className="fill-white stroke-slate-400"
        strokeWidth="1"
      />
    )}
    {Array.from({ length: Math.min(12, p("caught")) }, (_, index) => (
      <circle
        key={index}
        cx={40 + (index % 4) * 9}
        cy={70 - Math.floor(index / 4) * 8}
        r="2"
        className="fill-slate-800"
      />
    ))}
  </>
);

const sweepNet: BioGlyph = () => (
  <>
    <path d="M60 40 L146 40" strokeWidth="5" className="stroke-amber-800" />
    <ellipse
      cx="34"
      cy="40"
      rx="28"
      ry="30"
      fill="none"
      strokeWidth="3"
      className={ink}
    />
    <path
      d="M10 50 Q30 78 56 50"
      fill="none"
      strokeWidth="1.5"
      strokeDasharray="2 2"
      className={inkSoft}
    />
  </>
);

const pitfall: BioGlyph = ({ p }) => (
  <>
    <rect x="4" y="30" width="62" height="36" className="fill-amber-800/70" />
    <rect
      x="18"
      y={p("rim") === 1 ? 30 : 22}
      width="34"
      height="40"
      rx="3"
      strokeWidth="2"
      className={tone.glass}
    />
    {p("cover") === 1 && (
      <rect
        x="10"
        y="8"
        width="50"
        height="8"
        rx="2"
        className="fill-stone-500"
      />
    )}
  </>
);

const tullgren: BioGlyph = ({ v }) => (
  <>
    {v("on") === 1 && (
      <circle cx="55" cy="16" r="18" className="fill-yellow-200/60" />
    )}
    <path d="M40 4 H70 L64 22 H46 Z" className={tone.dark} />
    <path
      d="M10 40 H100 L60 110 H50 Z"
      strokeWidth="2"
      className={`${glassFill} stroke-slate-500`}
    />
    <path d="M18 50 H92" strokeWidth="6" className="stroke-amber-800" />
    <rect
      x="36"
      y="120"
      width="38"
      height="46"
      rx="6"
      strokeWidth="2"
      className={tone.glass}
    />
    <rect x="38" y="140" width="34" height="24" className="fill-sky-100/70" />
  </>
);

const baermann: BioGlyph = () => (
  <>
    <path
      d="M6 20 H84 L50 100 H40 Z"
      strokeWidth="2"
      className={`${glassFill} stroke-slate-500`}
    />
    <path d="M10 28 H80 L48 96 H42 Z" className="fill-sky-200/60" />
    <ellipse
      cx="45"
      cy="40"
      rx="24"
      ry="12"
      className="fill-amber-800/80 stroke-stone-200"
      strokeWidth="2"
    />
    <path d="M45 100 V160" strokeWidth="6" className="stroke-slate-300" />
    <rect x="38" y="130" width="14" height="10" rx="2" className={tone.dark} />
  </>
);

const jar: BioGlyph = () => (
  <>
    <rect x="12" y="8" width="46" height="12" rx="3" className={tone.dark} />
    <rect
      x="8"
      y="20"
      width="54"
      height="66"
      rx="10"
      strokeWidth="2"
      className={tone.glass}
    />
    <path
      d="M20 66 Q30 60 40 66 M28 56 l4 -4 l4 4"
      fill="none"
      strokeWidth="1.5"
      className="stroke-slate-700"
    />
  </>
);

const soilThermometer: BioGlyph = ({ v }) => (
  <>
    <rect
      x="14"
      y="4"
      width="12"
      height="150"
      rx="6"
      strokeWidth="2"
      className={tone.glass}
    />
    <rect
      x="18"
      y={150 - Math.max(0, Math.min(40, v("reading"))) * 3}
      width="4"
      height={Math.max(0, Math.min(40, v("reading"))) * 3}
      className="fill-red-500"
    />
    <path d="M4 120 H36" strokeWidth="4" className="stroke-amber-800" />
  </>
);

const lightMeter: BioGlyph = ({ v }) => (
  <>
    <rect
      x="6"
      y="20"
      width="68"
      height="84"
      rx="10"
      strokeWidth="2"
      className={tone.light}
    />
    <circle
      cx="40"
      cy="14"
      r="10"
      strokeWidth="2"
      className="fill-white stroke-slate-500"
    />
    <Screen
      x={12}
      y={40}
      width={56}
      height={28}
      text={`${Math.round(v("lux") / 100) / 10}k`}
      small="lux"
    />
  </>
);

const phColours = [
  "fill-red-500",
  "fill-orange-500",
  "fill-yellow-400",
  "fill-lime-500",
  "fill-green-600",
  "fill-teal-600",
];

const soilKit: BioGlyph = ({ v }) => {
  const ph = v("ph");
  const index = Math.max(
    0,
    Math.min(phColours.length - 1, Math.round(ph - 4.5)),
  );
  return (
    <>
      <path
        d="M20 10 H44 V90 A12 12 0 0 1 20 90 Z"
        strokeWidth="2"
        className={tone.glass}
      />
      <path
        d="M22 60 H42 V90 A10 10 0 0 1 22 90 Z"
        className={ph > 0 ? phColours[index] : "fill-amber-700/60"}
      />
      {phColours.map((fill, position) => (
        <rect
          key={fill}
          x="60"
          y={14 + position * 14}
          width="20"
          height="12"
          className={fill}
        />
      ))}
      {phColours.map((_, position) => (
        <text
          key={position}
          x="86"
          y={24 + position * 14}
          fontSize="8"
          className="fill-slate-700 font-bold dark:fill-slate-200"
        >
          {4.5 + position}
        </text>
      ))}
    </>
  );
};

const secchi: BioGlyph = ({ v }) => {
  const y = 20 + Math.min(3, v("depth")) * 40;
  return (
    <>
      <path
        d={`M35 0 V${y}`}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className={ink}
      />
      <g className={v("visible") === 1 ? "" : "opacity-20"}>
        <circle
          cx="35"
          cy={y + 10}
          r="16"
          className="fill-white stroke-slate-700"
          strokeWidth="1.5"
        />
        <path
          d={`M35 ${y - 6} A16 16 0 0 1 51 ${y + 10} H35 Z M35 ${y + 26} A16 16 0 0 1 19 ${y + 10} H35 Z`}
          className="fill-slate-900"
        />
      </g>
    </>
  );
};

const keyShapes = [
  <path
    key="worm"
    d="M20 70 Q40 50 60 70 T100 70"
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    className="stroke-rose-400"
  />,
  <g key="milli">
    <path
      d="M20 70 H100"
      strokeWidth="8"
      strokeLinecap="round"
      className="stroke-stone-700"
    />
    {Array.from({ length: 14 }, (_, index) => (
      <path
        key={index}
        d={`M${24 + index * 6} 74 v8`}
        strokeWidth="1"
        className="stroke-stone-700"
      />
    ))}
  </g>,
  <g key="centi">
    <path
      d="M20 70 H100"
      strokeWidth="5"
      strokeLinecap="round"
      className="stroke-amber-700"
    />
    {Array.from({ length: 8 }, (_, index) => (
      <path
        key={index}
        d={`M${26 + index * 10} 66 l-4 -8 M${26 + index * 10} 74 l-4 8`}
        strokeWidth="1.5"
        className="stroke-amber-700"
      />
    ))}
  </g>,
  <g key="spider">
    <circle cx="60" cy="70" r="10" className="fill-slate-800" />
    <circle cx="60" cy="56" r="6" className="fill-slate-800" />
    {[-1, 1].flatMap((side) =>
      [0, 1, 2, 3].map((leg) => (
        <path
          key={`${side}-${leg}`}
          d={`M60 ${62 + leg * 4} q${side * 18} ${-10 + leg * 6} ${side * 26} ${leg * 6}`}
          fill="none"
          strokeWidth="1.5"
          className="stroke-slate-800"
        />
      )),
    )}
  </g>,
  <g key="hopper">
    <ellipse cx="60" cy="68" rx="30" ry="8" className="fill-green-600" />
    <path
      d="M70 72 L90 56 L96 80"
      fill="none"
      strokeWidth="2.5"
      className="stroke-green-700"
    />
  </g>,
  <g key="fly">
    <ellipse cx="60" cy="70" rx="14" ry="9" className="fill-slate-700" />
    <ellipse
      cx="50"
      cy="58"
      rx="12"
      ry="6"
      className="fill-sky-100/80 stroke-slate-400"
      strokeWidth="1"
    />
    <ellipse
      cx="70"
      cy="58"
      rx="12"
      ry="6"
      className="fill-sky-100/80 stroke-slate-400"
      strokeWidth="1"
    />
  </g>,
];

const key: BioGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="4"
      width="122"
      height="102"
      rx="8"
      strokeWidth="2"
      className={tone.paper}
    />
    <text x="12" y="22" fontSize="10" className="fill-slate-900 font-black">
      {`Animal ${"ABCDEF"[v("animal")] ?? "A"}`}
    </text>
    {keyShapes[v("animal")] ?? keyShapes[0]}
  </>
);

export const ecologyGlyphs: Record<EcologyKind, BioGlyph> = {
  "field-plot": field,
  pond,
  quadrat,
  "tape-measure": tape,
  pooter,
  "sweep-net": sweepNet,
  "pitfall-trap": pitfall,
  "tullgren-funnel": tullgren,
  "baermann-funnel": baermann,
  "specimen-jar": jar,
  "soil-thermometer": soilThermometer,
  "light-meter": lightMeter,
  "soil-test-kit": soilKit,
  "secchi-disc": secchi,
  "identification-key": key,
};

/* ------------------------------------------------------------------ genetics */

const kernelFill = [
  "fill-purple-700",
  "fill-purple-400",
  "fill-yellow-400",
  "fill-yellow-200",
];

const cob: BioGlyph = ({ part }) => {
  const kernels = kernelTypes(part);
  const columns = 9;
  const rows = Math.ceil(KERNELS / 4 / columns);
  return (
    <>
      <path
        d="M60 210 Q20 200 18 110 Q20 14 60 8 Q100 14 102 110 Q100 200 60 210 Z"
        className="fill-amber-100 stroke-amber-700"
        strokeWidth="2"
      />
      {Array.from({ length: rows * columns }, (_, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const y = 20 + row * (186 / rows);
        const halfWidth = 38 * Math.sin((Math.PI * (y - 8)) / 202);
        const x = 60 - halfWidth + ((column + 0.5) * (halfWidth * 2)) / columns;
        return (
          <ellipse
            key={index}
            cx={x}
            cy={y}
            rx={Math.max(1, halfWidth / columns - 0.6)}
            ry="4.5"
            className={kernelFill[kernels[index] ?? 0]}
          />
        );
      })}
    </>
  );
};

const tray: BioGlyph = ({ v }) => {
  const grown = Math.round((v("percent") / 100) * 10);
  const length = Math.min(70, v("length"));
  return (
    <>
      <rect
        x="4"
        y="70"
        width="192"
        height="36"
        rx="4"
        strokeWidth="2"
        className={tone.light}
      />
      <rect
        x="10"
        y="72"
        width="180"
        height="10"
        className="fill-stone-100 dark:fill-stone-500"
      />
      {v("sown") === 1 &&
        Array.from({ length: 10 }, (_, index) => {
          const x = 20 + index * 18;
          const up = index < grown;
          return (
            <g key={index}>
              <ellipse
                cx={x}
                cy="78"
                rx="5"
                ry="3.5"
                className={
                  v("seed") === 1 ? "fill-rose-200" : "fill-yellow-300"
                }
              />
              {up && (
                <path
                  d={`M${x} 76 V${76 - length}`}
                  strokeWidth="2"
                  className="stroke-green-600"
                />
              )}
              {up && v("seed") === 1 && length > 10 && (
                <ellipse
                  cx={x}
                  cy={76 - length}
                  rx="6"
                  ry="3"
                  className="fill-amber-200"
                />
              )}
              {up && v("seed") === 0 && length > 10 && (
                <path
                  d={`M${x} ${76 - length} q6 6 2 14`}
                  fill="none"
                  strokeWidth="2"
                  className="stroke-green-600"
                />
              )}
            </g>
          );
        })}
    </>
  );
};

const flies: BioGlyph = ({ v }) => (
  <>
    <rect
      x="16"
      y="20"
      width="58"
      height="134"
      rx="10"
      strokeWidth="2"
      className={tone.glass}
    />
    <rect x="18" y="120" width="54" height="32" className="fill-amber-200" />
    <rect
      x="14"
      y="8"
      width="62"
      height="14"
      rx="4"
      className="fill-stone-200 stroke-stone-400"
      strokeWidth="1"
    />
    {Array.from({ length: v("flies") * 6 + 3 }, (_, index) => (
      <circle
        key={index}
        cx={24 + ((index * 37) % 44)}
        cy={30 + ((index * 53) % 86)}
        r="1.8"
        className="fill-slate-800"
      />
    ))}
  </>
);

const specimenCard: BioGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="4"
      width="132"
      height="112"
      rx="8"
      strokeWidth="2"
      className={tone.paper}
    />
    <circle
      cx="70"
      cy="58"
      r="36"
      className={v("specimen") >= 8 ? "fill-green-200" : "fill-amber-100"}
    />
    <text
      x="70"
      y="64"
      textAnchor="middle"
      fontSize="18"
      className="fill-slate-800 font-black"
    >
      {v("specimen") + 1}
    </text>
  </>
);

export const geneticsGlyphs: Record<GeneticsKind, BioGlyph> = {
  "maize-cob": cob,
  "germination-tray": tray,
  "drosophila-culture": flies,
  "classification-specimens": specimenCard,
};

/* -------------------------------------------------------------- microbiology */

const petri: BioGlyph = ({ v, part }) => {
  const colonies = Math.min(120, v("colonies"));
  return (
    <>
      <ellipse
        cx="55"
        cy="38"
        rx="50"
        ry="28"
        strokeWidth="2"
        className={tone.glass}
      />
      {v("poured") === 1 && (
        <ellipse
          cx="55"
          cy="38"
          rx="45"
          ry="24"
          className="fill-amber-100 dark:fill-amber-200"
        />
      )}
      {Array.from({ length: colonies }, (_, index) => {
        const angle = seeded(part.id, index * 2) * Math.PI * 2;
        const distance = Math.sqrt(seeded(part.id, index * 2 + 1)) * 0.9;
        const mould = v("mould") === 1 && index % 5 === 0;
        return (
          <circle
            key={index}
            cx={55 + Math.cos(angle) * 42 * distance}
            cy={38 + Math.sin(angle) * 21 * distance}
            r={mould ? 4 : 1.8}
            className={
              mould ? "fill-emerald-600/80" : "fill-amber-50 stroke-amber-400"
            }
            strokeWidth="0.6"
          />
        );
      })}
      {v("lid") >= 1 && (
        <path
          d="M12 26 L24 18 M86 18 L98 26"
          strokeWidth="5"
          className="stroke-yellow-200"
        />
      )}
      {v("lid") === 2 && (
        <ellipse
          cx="55"
          cy="38"
          rx="50"
          ry="28"
          fill="none"
          strokeWidth="4"
          className="stroke-yellow-200"
        />
      )}
    </>
  );
};

const agar: BioGlyph = ({ v }) => (
  <>
    <rect
      x="20"
      y="4"
      width="30"
      height="16"
      rx="4"
      className="fill-white stroke-slate-300"
      strokeWidth="1"
    />
    <path
      d="M24 20 H46 V30 Q66 36 66 52 V106 H4 V52 Q4 36 24 30 Z"
      strokeWidth="2"
      className={tone.glass}
    />
    <path
      d="M6 62 H64 V104 H6 Z"
      className={v("molten") === 1 ? "fill-amber-200/80" : "fill-amber-300"}
    />
  </>
);

const loop: BioGlyph = ({ v }) => (
  <>
    <rect x="80" y="8" width="56" height="9" rx="4" className={tone.dark} />
    <path d="M80 12 H18" strokeWidth="1.5" className="stroke-slate-500" />
    <circle
      cx="12"
      cy="12"
      r="5"
      fill="none"
      strokeWidth="1.5"
      className={v("hot") === 1 ? "stroke-red-500" : "stroke-slate-500"}
    />
  </>
);

const bunsen: BioGlyph = ({ v, still }) => (
  <>
    {v("lit") === 1 && (
      <Flame
        x={45}
        y={84}
        height={v("air") === 1 ? 64 : 76}
        luminous={v("air") !== 1}
        still={still}
      />
    )}
    <rect
      x="36"
      y="84"
      width="18"
      height="78"
      rx="2"
      strokeWidth="2"
      className={tone.steel}
    />
    <rect
      x="32"
      y="132"
      width="26"
      height="14"
      rx="3"
      strokeWidth="2"
      className={tone.brass}
    />
    <path
      d="M8 172 Q45 158 82 172 V178 H8 Z"
      strokeWidth="2"
      className={tone.dark}
    />
  </>
);

const autoclave: BioGlyph = ({ v }) => (
  <>
    <rect
      x="10"
      y="30"
      width="120"
      height="96"
      rx="12"
      strokeWidth="2"
      className={tone.metal}
    />
    <rect
      x="20"
      y="20"
      width="100"
      height="14"
      rx="5"
      className={tone.steel}
      strokeWidth="1.5"
    />
    <circle
      cx="70"
      cy="14"
      r="10"
      strokeWidth="2"
      className="fill-white stroke-slate-600"
    />
    <path
      d={`M70 14 L${v("running") === 1 ? 77 : 63} 9`}
      strokeWidth="2"
      className="stroke-red-600"
    />
    <Lamp x={118} y={110} on={v("running") === 1} />
  </>
);

const incubator: BioGlyph = ({ v }) => (
  <>
    <rect
      x="6"
      y="6"
      width="128"
      height="138"
      rx="8"
      strokeWidth="2"
      className={tone.light}
    />
    <rect
      x="16"
      y="40"
      width="108"
      height="94"
      rx="4"
      strokeWidth="2"
      className={`${glassFill} stroke-slate-400`}
    />
    <path d="M24 80 H116 M24 110 H116" strokeWidth="2" className={inkSoft} />
    <Screen x={16} y={12} width={60} height={22} text={`${v("temp")}°C`} />
    <Knob x={110} y={23} />
  </>
);

const cottonWool: BioGlyph = () => (
  <>
    {[
      [20, 30],
      [36, 22],
      [50, 30],
      [30, 38],
      [44, 40],
    ].map(([cx, cy]) => (
      <circle
        key={`${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r="12"
        className="fill-white stroke-slate-200"
        strokeWidth="1"
      />
    ))}
  </>
);

const maskingTape: BioGlyph = () => (
  <>
    <circle
      cx="35"
      cy="35"
      r="30"
      className="fill-yellow-100 stroke-yellow-500"
      strokeWidth="2"
    />
    <circle
      cx="35"
      cy="35"
      r="14"
      className="fill-stone-100 stroke-yellow-500 dark:fill-stone-800"
      strokeWidth="2"
    />
  </>
);

export const microbiologyGlyphs: Record<MicrobiologyKind, BioGlyph> = {
  "petri-dish": petri,
  "nutrient-agar": agar,
  "inoculating-loop": loop,
  "bunsen-burner": bunsen,
  autoclave,
  incubator,
  "cotton-wool": cottonWool,
  "masking-tape": maskingTape,
};
