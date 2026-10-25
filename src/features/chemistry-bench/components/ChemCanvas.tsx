import { useLanguage } from "../../../app/useLanguage";
import { LabCanvas } from "../../workbench/components/LabCanvas";
import type { Selection } from "../../workbench/workbench.types";
import type {
  ChemEnv,
  ChemKind,
  ChemOutcome,
  ChemPart,
  Incident,
} from "../chemistry.types";
import { chemDefinitions, chemPartLabel, isChemKind } from "../data/equipment";
import { incidentTitles } from "../engine/incidents";
import { CHEM_BENCH_HEIGHT, CHEM_BENCH_WIDTH } from "../hooks/useChemBench";
import { ChemPartGraphic } from "./ChemPartGraphic";

export const CHEM_DRAG_TYPE = "application/x-chemistry-bench-part";

type ChemCanvasProps = {
  parts: ChemPart[];
  env: ChemEnv;
  outcomes: Map<string, ChemOutcome>;
  incidents: Incident[];
  selection: Selection | null;
  onAddPart: (kind: ChemKind, x: number, y: number) => void;
  onMovePart: (id: string, x: number, y: number) => void;
  onSelect: (selection: Selection | null) => void;
  onTap: (id: string) => void;
  onRemoveSelected: () => void;
  onOpenSafety: () => void;
};

/** The chemistry bench. */
export function ChemCanvas({
  parts,
  env,
  outcomes,
  incidents,
  onOpenSafety,
  ...actions
}: ChemCanvasProps) {
  const { language, tr } = useLanguage();
  const open = incidents.filter((item) => !item.resolved);
  const latest = open[open.length - 1];
  return (
    <LabCanvas
      {...actions}
      width={CHEM_BENCH_WIDTH}
      height={CHEM_BENCH_HEIGHT}
      label={tr("Chemistry bench", "Benchi la kemia")}
      accent="orange"
      surface="fill-stone-100 dark:fill-stone-950"
      edge="fill-stone-300 dark:fill-stone-800"
      parts={parts}
      dragType={CHEM_DRAG_TYPE}
      isKind={isChemKind}
      sizeOf={(kind) => chemDefinitions[kind]}
      labelOf={(part) =>
        chemPartLabel(parts, part, chemDefinitions[part.kind].name[language])
      }
      tappable={(part) => Boolean(chemDefinitions[part.kind].tapToggles)}
      renderPart={(part) => (
        <ChemPartGraphic
          part={part}
          env={env}
          outcome={outcomes.get(part.id) ?? {}}
        />
      )}
      issuesOf={(part) => outcomes.get(part.id)?.issues ?? []}
      emptyTip={tr(
        "Tip: put on a lab coat and goggles first.",
        "Kidokezo: vaa koti la maabara na miwani kwanza.",
      )}
      alert={
        latest
          ? `${incidentTitles[latest.kind][language]} · ${tr("open the Safety tab", "fungua kichupo cha Usalama")}`
          : undefined
      }
      onAlert={onOpenSafety}
    />
  );
}
