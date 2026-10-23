import { useRef, useState, type DragEvent, type PointerEvent } from "react";
import { useLanguage } from "../../../app/useLanguage";
import {
  bulbBrightness,
  meterReading,
  type CircuitSolution,
} from "../circuit/solveCircuit";
import { isPartKind, partDefinitions } from "../data/equipment";
import { BENCH_HEIGHT, BENCH_WIDTH, partLabel } from "../hooks/useBench";
import type {
  PartKind,
  PlacedPart,
  Selection,
  TerminalRef,
  Wire,
} from "../workbench.types";
import { PartGraphic } from "./PartGraphic";

export const EQUIPMENT_DRAG_TYPE = "application/x-virtual-lab-part";

type Point = { x: number; y: number };

type BenchCanvasProps = {
  parts: PlacedPart[];
  wires: Wire[];
  solution: CircuitSolution;
  selection: Selection | null;
  pendingTerminal: TerminalRef | null;
  onAddPart: (kind: PartKind, x: number, y: number) => void;
  onMovePart: (id: string, x: number, y: number) => void;
  onSelect: (selection: Selection | null) => void;
  onTerminal: (terminal: TerminalRef) => void;
  onToggleSwitch: (id: string) => void;
  onRemoveSelected: () => void;
};

type DragState = { id: string; offset: Point; start: Point; moved: boolean };

function terminalPoint(parts: PlacedPart[], ref: TerminalRef): Point | null {
  const part = parts.find((item) => item.id === ref.partId);
  const terminal = part
    ? partDefinitions[part.kind].terminals.find(
        (item) => item.name === ref.terminal,
      )
    : undefined;
  return part && terminal
    ? { x: part.x + terminal.x, y: part.y + terminal.y }
    : null;
}

function wirePath(from: Point, to: Point) {
  const sag = Math.min(120, Math.hypot(to.x - from.x, to.y - from.y) * 0.3);
  return `M${from.x} ${from.y} C${from.x} ${from.y + sag} ${to.x} ${to.y + sag} ${to.x} ${to.y}`;
}

function wireColour(wire: Wire) {
  const terminals = [wire.from.terminal, wire.to.terminal];
  if (terminals.includes("pos")) return "stroke-red-500";
  if (terminals.includes("neg"))
    return "stroke-slate-900 dark:stroke-slate-400";
  return "stroke-blue-500";
}

export function BenchCanvas({
  parts,
  wires,
  solution,
  selection,
  pendingTerminal,
  onAddPart,
  onMovePart,
  onSelect,
  onTerminal,
  onToggleSwitch,
  onRemoveSelected,
}: BenchCanvasProps) {
  const { language, tr } = useLanguage();
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const pendingPoint = pendingTerminal
    ? terminalPoint(parts, pendingTerminal)
    : null;

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
    const kind = event.dataTransfer.getData(EQUIPMENT_DRAG_TYPE);
    if (!isPartKind(kind)) return;
    const point = toBench(event.clientX, event.clientY);
    const { width, height } = partDefinitions[kind];
    onAddPart(kind, point.x - width / 2, point.y - height / 2);
  }

  function startPartDrag(event: PointerEvent<SVGGElement>, part: PlacedPart) {
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

  function movePart(event: PointerEvent<SVGGElement>) {
    if (!drag) return;
    const point = toBench(event.clientX, event.clientY);
    const moved =
      drag.moved ||
      Math.hypot(point.x - drag.start.x, point.y - drag.start.y) > 4;
    if (moved !== drag.moved) setDrag({ ...drag, moved });
    if (moved)
      onMovePart(drag.id, point.x - drag.offset.x, point.y - drag.offset.y);
  }

  function endPartDrag(part: PlacedPart) {
    if (!drag) return;
    if (!drag.moved && part.kind === "switch") onToggleSwitch(part.id);
    onSelect({ type: "part", id: part.id });
    setDrag(null);
  }

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
      className={`relative aspect-video w-full ${dropActive ? "ring-4 ring-inset ring-sky-500" : ""}`}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${BENCH_WIDTH} ${BENCH_HEIGHT}`}
        role="application"
        aria-label={tr("Circuit bench", "Benchi la sakiti")}
        tabIndex={-1}
        onPointerMove={(event) => {
          if (pendingTerminal) setCursor(toBench(event.clientX, event.clientY));
        }}
        onPointerDown={() => onSelect(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onSelect(null);
        }}
        className="h-full w-full touch-none select-none"
      >
        <defs>
          <pattern
            id="bench-dots"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="10"
              cy="10"
              r="1.2"
              className="fill-slate-300 dark:fill-slate-700"
            />
          </pattern>
        </defs>
        <rect
          width={BENCH_WIDTH}
          height={BENCH_HEIGHT}
          className="fill-slate-50 dark:fill-slate-950"
        />
        <rect
          width={BENCH_WIDTH}
          height={BENCH_HEIGHT}
          fill="url(#bench-dots)"
        />

        {wires.map((wire) => {
          const from = terminalPoint(parts, wire.from);
          const to = terminalPoint(parts, wire.to);
          if (!from || !to) return null;
          const current = solution.wires.get(wire.id) ?? 0;
          const flowing = Math.abs(current) > 0.001;
          const selected =
            selection?.type === "wire" && selection.id === wire.id;
          const path = wirePath(from, to);
          return (
            <g
              key={wire.id}
              onPointerDown={(event) => {
                event.stopPropagation();
                onSelect({ type: "wire", id: wire.id });
              }}
              className="cursor-pointer"
            >
              {selected && (
                <path
                  d={path}
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="stroke-sky-400 opacity-60"
                />
              )}
              <path
                d={path}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                className={wireColour(wire)}
              />
              {flowing && (
                <path
                  d={current > 0 ? path : wirePath(to, from)}
                  fill="none"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  className="animate-current-flow stroke-white motion-reduce:animate-none"
                />
              )}
              <path
                d={path}
                fill="none"
                strokeWidth="16"
                className="stroke-transparent"
              />
            </g>
          );
        })}

        {parts.map((part) => {
          const definition = partDefinitions[part.kind];
          const name = partLabel(parts, part, definition.name[language]);
          const selected =
            selection?.type === "part" && selection.id === part.id;
          return (
            <g key={part.id} transform={`translate(${part.x} ${part.y})`}>
              <g
                role="button"
                tabIndex={0}
                aria-label={name}
                aria-pressed={selected}
                onPointerDown={(event) => startPartDrag(event, part)}
                onPointerMove={movePart}
                onPointerUp={() => endPartDrag(part)}
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
                    if (part.kind === "switch") onToggleSwitch(part.id);
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
                  width={definition.width + 16}
                  height={definition.height + 16}
                  rx="10"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className={`fill-transparent ${selected ? "stroke-sky-500" : "stroke-transparent"}`}
                />
                <PartGraphic
                  part={part}
                  reading={meterReading(solution, part)}
                  brightness={bulbBrightness(solution, part.id)}
                />
              </g>
              {definition.terminals.map((terminal) => {
                const ref = { partId: part.id, terminal: terminal.name };
                const pending =
                  pendingTerminal?.partId === part.id &&
                  pendingTerminal.terminal === terminal.name;
                const polarity =
                  terminal.polarity === "+"
                    ? tr("positive terminal", "ncha chanya")
                    : terminal.polarity === "-"
                      ? tr("negative terminal", "ncha hasi")
                      : tr("terminal", "ncha");
                return (
                  <g
                    key={terminal.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`${name} ${polarity}`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      onTerminal(ref);
                      setCursor(toBench(event.clientX, event.clientY));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onTerminal(ref);
                      }
                    }}
                    className="group cursor-crosshair outline-none"
                  >
                    <circle
                      cx={terminal.x}
                      cy={terminal.y}
                      r="13"
                      fill="none"
                      strokeWidth="3"
                      className={
                        pending
                          ? "stroke-sky-500"
                          : "stroke-transparent group-hover:stroke-sky-400 group-focus-visible:stroke-sky-400"
                      }
                    />
                    <circle
                      cx={terminal.x}
                      cy={terminal.y}
                      r="13"
                      className="fill-transparent"
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {pendingPoint && cursor && (
          <path
            d={wirePath(pendingPoint, cursor)}
            fill="none"
            strokeWidth="3"
            strokeDasharray="8 6"
            className="pointer-events-none stroke-sky-500"
          />
        )}
      </svg>

      {parts.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
          <div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">
              {tr("Your bench is empty", "Benchi lako ni tupu")}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {tr(
                "Drag equipment from the left, or click an item to add it.",
                "Buruta vifaa kutoka kushoto, au bofya kifaa kukiongeza.",
              )}
            </p>
          </div>
        </div>
      )}
      {pendingTerminal && (
        <p className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold text-white shadow">
          {tr(
            "Now click another terminal to connect · Esc to cancel",
            "Sasa bofya ncha nyingine kuunganisha · Esc kughairi",
          )}
        </p>
      )}
    </div>
  );
}
