import { TriangleAlert } from "lucide-react";
import {
  useRef,
  useState,
  type DragEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { Issue, Selection } from "../workbench.types";
import { BenchEmptyGuide } from "./BenchEmptyGuide";

type Point = { x: number; y: number };

type BenchPart<Kind extends string> = {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  width: number;
  height: number;
};

const accents = {
  orange: { ring: "ring-orange-500", stroke: "stroke-orange-500" },
  green: { ring: "ring-green-600", stroke: "stroke-green-600" },
};

type LabCanvasProps<Kind extends string, Part extends BenchPart<Kind>> = {
  width: number;
  height: number;
  label: string;
  accent: keyof typeof accents;
  /** Classes for the bench top and the strip along the front edge. */
  surface: string;
  edge: string;
  parts: Part[];
  selection: Selection | null;
  dragType: string;
  isKind: (value: string) => value is Kind;
  sizeOf: (kind: Kind) => { width: number; height: number };
  labelOf: (part: Part) => string;
  tappable: (part: Part) => boolean;
  renderPart: (part: Part) => ReactNode;
  issuesOf: (part: Part) => Issue[];
  emptyTip: string;
  /** A message shown over the bench, such as an unresolved safety incident. */
  alert?: string;
  onAlert?: () => void;
  onAddPart: (kind: Kind, x: number, y: number) => void;
  onMovePart: (id: string, x: number, y: number) => void;
  onSelect: (selection: Selection | null) => void;
  onTap: (id: string) => void;
  onRemoveSelected: () => void;
};

type DragState = { id: string; offset: Point; start: Point; moved: boolean };

function IssueBadge({ x, issues }: { x: number; issues: Issue[] }) {
  const worst = issues.some((item) => item.tone === "bad")
    ? "bad"
    : issues.some((item) => item.tone === "warn")
      ? "warn"
      : undefined;
  if (!worst) return null;
  return (
    <g transform={`translate(${x} -4)`} className="pointer-events-none">
      <circle
        r="11"
        className={worst === "bad" ? "fill-red-600" : "fill-amber-500"}
      />
      <text
        textAnchor="middle"
        y="5"
        fontSize="15"
        className="fill-white font-black"
      >
        !
      </text>
    </g>
  );
}

/** A wire-free lab bench: drag parts about and overlap them to use them together. */
export function LabCanvas<Kind extends string, Part extends BenchPart<Kind>>(
  props: LabCanvasProps<Kind, Part>,
) {
  const {
    width,
    height,
    parts,
    selection,
    onSelect,
    onMovePart,
    onTap,
    onRemoveSelected,
  } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const accent = accents[props.accent];

  function toBench(clientX: number, clientY: number): Point {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(clientX, clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: point.x, y: point.y };
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDropActive(false);
    const kind = event.dataTransfer.getData(props.dragType);
    if (!props.isKind(kind)) return;
    const point = toBench(event.clientX, event.clientY);
    const size = props.sizeOf(kind);
    props.onAddPart(kind, point.x - size.width / 2, point.y - size.height / 2);
  }

  function startDrag(event: PointerEvent<SVGGElement>, part: Part) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toBench(event.clientX, event.clientY);
    setDrag({
      id: part.id,
      offset: { x: point.x - part.x, y: point.y - part.y },
      start: point,
      moved: false,
    });
  }

  function moveDrag(event: PointerEvent<SVGGElement>) {
    if (!drag) return;
    const point = toBench(event.clientX, event.clientY);
    const moved =
      drag.moved ||
      Math.hypot(point.x - drag.start.x, point.y - drag.start.y) > 4;
    if (moved !== drag.moved) setDrag({ ...drag, moved });
    if (moved)
      onMovePart(drag.id, point.x - drag.offset.x, point.y - drag.offset.y);
  }

  function endDrag(part: Part) {
    if (!drag) return;
    if (!drag.moved && props.tappable(part)) onTap(part.id);
    onSelect({ type: "part", id: part.id });
    setDrag(null);
  }

  // The part being dragged is drawn last so it shows on top.
  const ordered = drag
    ? [
        ...parts.filter((part) => part.id !== drag.id),
        ...parts.filter((part) => part.id === drag.id),
      ]
    : parts;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setDropActive(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setDropActive(false);
      }}
      onDrop={handleDrop}
      className={`relative aspect-video w-full ${dropActive ? `ring-4 ring-inset ${accent.ring}` : ""}`}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="application"
        aria-label={props.label}
        tabIndex={-1}
        onPointerDown={() => onSelect(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onSelect(null);
        }}
        className="h-full w-full touch-none select-none"
      >
        <rect width={width} height={height} className={props.surface} />
        <rect
          y={height - 14}
          width={width}
          height="14"
          className={props.edge}
        />

        {ordered.map((part) => {
          const selected =
            selection?.type === "part" && selection.id === part.id;
          return (
            <g key={part.id} transform={`translate(${part.x} ${part.y})`}>
              <g
                role="button"
                tabIndex={0}
                aria-label={props.labelOf(part)}
                aria-pressed={selected}
                onPointerDown={(event) => startDrag(event, part)}
                onPointerMove={moveDrag}
                onPointerUp={() => endDrag(part)}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={(event) => {
                  const step = {
                    ArrowLeft: [-10, 0],
                    ArrowRight: [10, 0],
                    ArrowUp: [0, -10],
                    ArrowDown: [0, 10],
                  }[event.key];
                  if (step) {
                    event.preventDefault();
                    onMovePart(part.id, part.x + step[0], part.y + step[1]);
                  } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (props.tappable(part)) onTap(part.id);
                    onSelect({ type: "part", id: part.id });
                  } else if (
                    event.key === "Delete" ||
                    event.key === "Backspace"
                  ) {
                    onSelect({ type: "part", id: part.id });
                    onRemoveSelected();
                  }
                }}
                className={`outline-none ${drag?.id === part.id && drag.moved ? "cursor-grabbing" : "cursor-grab"}`}
              >
                <rect
                  x="-8"
                  y="-8"
                  width={part.width + 16}
                  height={part.height + 16}
                  rx="10"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className={`fill-transparent ${selected ? accent.stroke : "stroke-transparent"}`}
                />
                {props.renderPart(part)}
                <IssueBadge x={part.width} issues={props.issuesOf(part)} />
              </g>
            </g>
          );
        })}
      </svg>

      {parts.length === 0 && <BenchEmptyGuide tip={props.emptyTip} />}
      {props.alert && (
        <button
          type="button"
          onClick={props.onAlert}
          className="absolute left-1/2 top-3 inline-flex max-w-md -translate-x-1/2 items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-red-700"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="truncate">{props.alert}</span>
        </button>
      )}
    </div>
  );
}
