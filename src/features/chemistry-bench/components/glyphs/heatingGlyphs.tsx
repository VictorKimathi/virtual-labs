import { Label } from "../../../workbench/components/glyphs/shapes";
import { ink, inkSoft, tone } from "../../../workbench/components/glyphs/tones";
import type { ChemGlyph } from "../../chemistry.types";
import type { chemSectionKinds } from "../../data/kinds";
import { vessel } from "./glasswareGlyphs";
import { Flame, Knob, Lamp, Screen } from "./pieces";

type HeatingKind = (typeof chemSectionKinds.heating)[number];
type SupportKind = (typeof chemSectionKinds.support)[number];

const glow = (on: boolean) =>
  on ? "fill-red-500/80 stroke-red-700" : tone.steel;

const bunsen: ChemGlyph = ({ v, still }) => {
  const lit = v("lit") === 1;
  const open = v("air") >= 0.4;
  return (
    <>
      {lit && (
        <Flame
          x={45}
          y={84}
          height={open ? 70 : 80}
          luminous={!open}
          still={still}
        />
      )}
      <rect
        x="36"
        y="84"
        width="18"
        height="84"
        rx="2"
        strokeWidth="2"
        className={tone.steel}
      />
      <rect
        x="32"
        y="138"
        width="26"
        height="14"
        rx="3"
        strokeWidth="2"
        className={tone.brass}
      />
      <rect
        x="40"
        y="141"
        width={4 + v("air") * 8}
        height="8"
        rx="1"
        className="fill-slate-900"
      />
      <path
        d="M8 180 Q45 166 82 180 V186 H8 Z"
        strokeWidth="2"
        className={tone.dark}
      />
      <path
        d="M58 172 H84"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-orange-500"
      />
    </>
  );
};

const spiritLamp: ChemGlyph = ({ v, still }) => (
  <>
    {v("lit") === 1 && (
      <Flame x={40} y={46} height={42} luminous still={still} />
    )}
    <rect
      x="35"
      y="44"
      width="10"
      height="20"
      className="fill-slate-100 stroke-slate-400"
      strokeWidth="1"
    />
    <path
      d="M30 62 H50 L54 70 Q74 82 72 104 Q70 126 40 126 Q10 126 8 104 Q6 82 26 70 Z"
      strokeWidth="2"
      className={tone.glass}
    />
    <path
      d="M12 100 Q40 92 68 100 Q66 122 40 122 Q14 122 12 100 Z"
      className="fill-sky-300/60"
    />
  </>
);

const tripod: ChemGlyph = () => (
  <>
    <ellipse
      cx="70"
      cy="14"
      rx="60"
      ry="8"
      fill="none"
      strokeWidth="5"
      className={ink}
    />
    <path
      d="M16 18 L6 146 M70 22 V146 M124 18 L134 146"
      strokeWidth="5"
      strokeLinecap="round"
      className={ink}
    />
  </>
);

const gauze: ChemGlyph = () => (
  <>
    <rect
      x="4"
      y="20"
      width="102"
      height="30"
      rx="2"
      strokeWidth="2"
      className={tone.metal}
    />
    {Array.from({ length: 12 }, (_, index) => (
      <path
        key={index}
        d={`M${10 + index * 8} 22 V48`}
        strokeWidth="0.7"
        className={inkSoft}
      />
    ))}
    <ellipse
      cx="55"
      cy="35"
      rx="26"
      ry="11"
      className="fill-slate-100 dark:fill-slate-300"
    />
  </>
);

const pipeClay: ChemGlyph = () => (
  <>
    <path d="M55 8 L104 84 H6 Z" fill="none" strokeWidth="2" className={ink} />
    <path
      d="M42 30 L30 50 M68 30 L80 50 M36 84 H74"
      strokeWidth="9"
      strokeLinecap="round"
      className="stroke-stone-100 dark:stroke-stone-300"
    />
  </>
);

const crucible = vessel({
  outline: "M6 6 H54 L46 50 Q44 54 40 54 H20 Q16 54 14 50 Z",
  top: 8,
  bottom: 54,
  left: 6,
  right: 54,
  mouth: [6, 48, 6],
});

const crucibleLid: ChemGlyph = () => (
  <>
    <path d="M2 14 Q35 0 68 14 Z" strokeWidth="2" className={tone.light} />
    <circle cx="35" cy="5" r="3" className={tone.light} />
  </>
);

const hotPlate: ChemGlyph = ({ v }) => (
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
      className={glow(v("on") === 1)}
    />
    <Knob x={30} y={44} />
    <Lamp x={120} y={44} on={v("on") === 1} />
    <Label x={75} y={48} size={9}>
      {v("on") === 1 ? `${v("power")}%` : "off"}
    </Label>
  </>
);

const mantle: ChemGlyph = ({ v }) => (
  <>
    <path
      d="M6 14 Q60 120 114 14 Z"
      strokeWidth="2"
      className={
        v("on") === 1
          ? "fill-orange-300 stroke-orange-700 dark:fill-orange-800"
          : tone.light
      }
    />
    <rect
      x="20"
      y="78"
      width="80"
      height="20"
      rx="4"
      strokeWidth="2"
      className={tone.dark}
    />
    <Lamp x={90} y={88} on={v("on") === 1} />
  </>
);

const waterBath: ChemGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="20"
      width="142"
      height="66"
      rx="6"
      strokeWidth="2"
      className={tone.metal}
    />
    <rect
      x="12"
      y="24"
      width="126"
      height="20"
      className="fill-sky-300/70 dark:fill-sky-700/70"
    />
    {[30, 60, 90, 120].map((x) => (
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
      y={54}
      width={60}
      height={24}
      text={v("on") === 1 ? `${v("temp")}°C` : "– –"}
    />
    <Lamp x={128} y={66} on={v("on") === 1} />
  </>
);

const sandBath: ChemGlyph = ({ v }) => (
  <>
    <rect
      x="4"
      y="30"
      width="132"
      height="44"
      rx="4"
      strokeWidth="2"
      className={tone.light}
    />
    <path
      d="M10 16 H130 L126 32 H14 Z"
      strokeWidth="2"
      className={
        v("on") === 1
          ? "fill-amber-400 stroke-red-600"
          : "fill-amber-200 stroke-amber-600"
      }
    />
    <Lamp x={120} y={52} on={v("on") === 1} />
  </>
);

export const heatingGlyphs: Record<HeatingKind, ChemGlyph> = {
  "bunsen-burner": bunsen,
  "spirit-lamp": spiritLamp,
  "tripod-stand": tripod,
  "wire-gauze": gauze,
  "pipe-clay-triangle": pipeClay,
  crucible,
  "crucible-lid": crucibleLid,
  "hot-plate": hotPlate,
  "heating-mantle": mantle,
  "water-bath": waterBath,
  "sand-bath": sandBath,
};

const retortStand: ChemGlyph = () => (
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
      x="22"
      y="8"
      width="8"
      height="302"
      rx="3"
      strokeWidth="1.5"
      className={tone.steel}
    />
  </>
);

const clampBoss: ChemGlyph = ({ v }) => {
  const open = 6 + (10 - v("grip")) * 1.4;
  return (
    <>
      <rect
        x="4"
        y="18"
        width="24"
        height="24"
        rx="3"
        strokeWidth="2"
        className={tone.metal}
      />
      <path d="M28 30 H80" strokeWidth="5" className={ink} />
      <path
        d={`M80 30 Q92 ${30 - open} 104 ${30 - open} M80 30 Q92 ${30 + open} 104 ${30 + open}`}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className={ink}
      />
      <Knob x={16} y={10} r={5} />
    </>
  );
};

const rack: ChemGlyph = () => (
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

const holder: ChemGlyph = () => (
  <>
    <rect
      x="70"
      y="14"
      width="66"
      height="14"
      rx="5"
      strokeWidth="2"
      className={tone.wood}
    />
    <path
      d="M70 18 H20 Q6 20 8 30 M70 24 H22"
      fill="none"
      strokeWidth="2.5"
      className={ink}
    />
  </>
);

const tongs: ChemGlyph = () => (
  <path
    d="M146 16 L10 10 Q2 12 8 18 M146 24 L10 30 Q2 28 8 22"
    fill="none"
    strokeWidth="3.5"
    strokeLinecap="round"
    className={ink}
  />
);

const spatula: ChemGlyph = () => (
  <>
    <rect x="30" y="10" width="96" height="5" rx="2" className={tone.steel} />
    <ellipse
      cx="18"
      cy="12"
      rx="14"
      ry="6"
      strokeWidth="1.5"
      className={tone.steel}
    />
  </>
);

const deflagratingSpoon: ChemGlyph = () => (
  <>
    <path
      d="M146 6 V30 M146 30 H16"
      fill="none"
      strokeWidth="3"
      className={ink}
    />
    <circle cx="146" cy="6" r="4" className={tone.steel} />
    <path d="M4 28 Q16 40 28 28 Z" strokeWidth="2" className={tone.steel} />
    <ellipse
      cx="100"
      cy="30"
      rx="4"
      ry="10"
      strokeWidth="1.5"
      className={tone.metal}
    />
  </>
);

const beehive: ChemGlyph = () => (
  <>
    <path
      d="M6 66 V40 Q55 -6 104 40 V66 Z"
      strokeWidth="2"
      className="fill-orange-200 stroke-orange-700 dark:fill-orange-900 dark:stroke-orange-400"
    />
    <ellipse cx="55" cy="22" rx="8" ry="3" className="fill-slate-900" />
    <path d="M44 66 V52 H66 V66" strokeWidth="2" className="fill-slate-900" />
  </>
);

const trough: ChemGlyph = () => (
  <>
    <path d="M4 10 H216 L208 86 H12 Z" strokeWidth="2" className={tone.glass} />
    <path
      d="M7 34 H213 L208 86 H12 Z"
      className="fill-sky-300/60 dark:fill-sky-700/60"
    />
  </>
);

export const supportGlyphs: Record<SupportKind, ChemGlyph> = {
  "retort-stand": retortStand,
  "clamp-boss": clampBoss,
  "test-tube-rack": rack,
  "test-tube-holder": holder,
  tongs,
  spatula,
  "deflagrating-spoon": deflagratingSpoon,
  "beehive-shelf": beehive,
  trough,
};
