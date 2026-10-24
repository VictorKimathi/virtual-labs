import { useLanguage } from "../../../app/useLanguage";
import { HScale } from "./glyphs/shapes";
import { tone } from "./glyphs/tones";

const SPAN = 20;
const PER_MM = 16;

function Window({
  centre,
  edge,
  side,
  label,
}: {
  centre: number;
  edge: number;
  side: "left" | "right";
  label: string;
}) {
  const from = Math.round(centre - SPAN / 2);
  const x = (edge - from) * PER_MM + 4;
  const width = SPAN * PER_MM + 8;
  return (
    <figure>
      <figcaption className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </figcaption>
      <svg
        viewBox={`0 0 ${width} 70`}
        role="img"
        aria-label={label}
        className="mt-1 w-full"
      >
        <rect
          x="0"
          y="0"
          width={width}
          height="36"
          className={tone.wood}
          strokeWidth="1.5"
        />
        <HScale
          x={4}
          y={0}
          from={from}
          to={from + SPAN}
          perUnit={PER_MM}
          minor={1}
          mid={5}
          major={10}
          format={(n) => String(n)}
          size={11}
        />
        {side === "left" ? (
          <rect
            x={x}
            y="42"
            width={Math.max(0, width - x)}
            height="22"
            className={tone.copper}
            strokeWidth="1.5"
          />
        ) : (
          <rect
            x="0"
            y="42"
            width={Math.max(0, x)}
            height="22"
            className={tone.copper}
            strokeWidth="1.5"
          />
        )}
      </svg>
    </figure>
  );
}

type RulerZoomProps = { start: number; seen: number };

/** Close-ups of the two ends of an object against a millimetre scale. */
export function RulerZoom({ start, seen }: RulerZoomProps) {
  const { tr } = useLanguage();
  return (
    <section className="mt-4 space-y-2">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {tr("Close-up of the scale (mm)", "Karibu ya kipimo (mm)")}
      </h3>
      <Window
        centre={start}
        edge={start}
        side="left"
        label={tr("Start of the object", "Mwanzo wa kitu")}
      />
      <Window
        centre={seen}
        edge={seen}
        side="right"
        label={tr("End of the object", "Mwisho wa kitu")}
      />
    </section>
  );
}
