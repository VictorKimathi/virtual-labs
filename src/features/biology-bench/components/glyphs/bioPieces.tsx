import { tone } from "../../../workbench/components/glyphs/tones";
import { visibleOrgans, type Specimen } from "../../data/specimens";

/** A labelled reagent bottle with coloured contents. */
export function BottleArt({ fill, label }: { fill: string; label: string }) {
  return (
    <>
      <rect
        x="20"
        y="4"
        width="20"
        height="14"
        rx="3"
        strokeWidth="2"
        className={tone.dark}
      />
      <path
        d="M21 18 H39 V26 Q56 30 56 46 V96 H4 V46 Q4 30 21 26 Z"
        strokeWidth="2"
        className={tone.glass}
      />
      <path d="M6 54 H54 V94 H6 Z" className={fill} />
      <rect
        x="8"
        y="58"
        width="44"
        height="18"
        rx="2"
        className={tone.paper}
        strokeWidth="0.8"
      />
      <text
        x="30"
        y="70"
        textAnchor="middle"
        fontSize={label.length > 8 ? 6 : 8}
        className="fill-slate-900 font-black"
      >
        {label}
      </text>
    </>
  );
}

/** The organs of a specimen that can be seen at this stage, with labels and the quiz marker. */
export function Organs({
  specimen,
  stage,
  target,
  labels,
}: {
  specimen: Specimen;
  stage: number;
  target: number;
  labels: boolean;
}) {
  const visible = visibleOrgans(specimen, stage);
  return (
    <>
      {visible.map((organ) => (
        <g key={organ.id}>
          {organ.shapes.map(([cx, cy, rx, ry], index) => (
            <ellipse
              key={index}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              strokeWidth="1"
              className={`${organ.fill} stroke-black/30`}
            />
          ))}
          {specimen.organs.indexOf(organ) === target && (
            <ellipse
              cx={organ.shapes[0][0]}
              cy={organ.shapes[0][1]}
              rx={organ.shapes[0][2] + 5}
              ry={organ.shapes[0][3] + 5}
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              className="stroke-sky-500"
            />
          )}
          {labels && (
            <text
              x={organ.shapes[0][0]}
              y={organ.shapes[0][1] + 3}
              textAnchor="middle"
              fontSize="8"
              className="fill-slate-900 font-bold"
            >
              {organ.name.en}
            </text>
          )}
        </g>
      ))}
    </>
  );
}
