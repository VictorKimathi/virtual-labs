import {
  analysePart,
  makeEnv,
  paramReader,
  partDefinitions,
} from "../data/equipment";
import { emptySolution } from "../circuit/solution";
import type { BenchEnv, Outcome, PlacedPart } from "../workbench.types";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { glyphs } from "./glyphs";

type PartGraphicProps = {
  part: PlacedPart;
  env: BenchEnv;
  outcome: Outcome;
};

/** Visual body and terminal screws of a part, drawn in its own local space. */
export function PartGraphic({ part, env, outcome }: PartGraphicProps) {
  const definition = partDefinitions[part.kind];
  const still = usePrefersReducedMotion();
  const p = paramReader(part);
  const v = (id: string) => outcome.visual?.[id] ?? 0;
  return (
    <>
      {glyphs[part.kind]({ part, outcome, env, p, v, still })}
      {definition.terminals.map((terminal) => (
        <g key={terminal.name}>
          <circle
            cx={terminal.x}
            cy={terminal.y}
            r="7"
            strokeWidth="2"
            className={`fill-amber-400 ${terminal.polarity === "+" ? "stroke-red-600" : terminal.polarity === "-" ? "stroke-slate-900" : "stroke-amber-700"}`}
          />
          <circle
            cx={terminal.x}
            cy={terminal.y}
            r="2.5"
            className="fill-amber-700"
          />
        </g>
      ))}
    </>
  );
}

const previewEnv = (part: PlacedPart) => makeEnv([part], [], emptySolution, 0);

/** A part drawn at its default settings, for the equipment list. */
export function PartPreview({ part }: { part: PlacedPart }) {
  const env = previewEnv(part);
  return <PartGraphic part={part} env={env} outcome={analysePart(part, env)} />;
}
