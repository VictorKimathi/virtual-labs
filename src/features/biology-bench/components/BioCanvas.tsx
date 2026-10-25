import { useLanguage } from "../../../app/useLanguage";
import { LabCanvas } from "../../workbench/components/LabCanvas";
import type { Selection } from "../../workbench/workbench.types";
import type {
  BioEnv,
  BioIncident,
  BioKind,
  BioOutcome,
  BioPart,
} from "../biology.types";
import { bioDefinitions, bioPartLabel, isBioKind } from "../data/equipment";
import { incidentTitles } from "../engine/operations";
import { BIO_BENCH_HEIGHT, BIO_BENCH_WIDTH } from "../hooks/useBioBench";
import { BioPartGraphic } from "./BioPartGraphic";

export const BIO_DRAG_TYPE = "application/x-biology-bench-part";

type BioCanvasProps = {
  parts: BioPart[];
  env: BioEnv;
  outcomes: Map<string, BioOutcome>;
  incidents: BioIncident[];
  selection: Selection | null;
  onAddPart: (kind: BioKind, x: number, y: number) => void;
  onMovePart: (id: string, x: number, y: number) => void;
  onSelect: (selection: Selection | null) => void;
  onTap: (id: string) => void;
  onRemoveSelected: () => void;
  onOpenSafety: () => void;
};

/** The biology bench. */
export function BioCanvas({
  parts,
  env,
  outcomes,
  incidents,
  onOpenSafety,
  ...actions
}: BioCanvasProps) {
  const { language, tr } = useLanguage();
  const open = incidents.filter((item) => !item.resolved);
  const latest = open[open.length - 1];
  return (
    <LabCanvas
      {...actions}
      width={BIO_BENCH_WIDTH}
      height={BIO_BENCH_HEIGHT}
      label={tr("Biology bench", "Benchi la biolojia")}
      accent="green"
      surface="fill-emerald-50 dark:fill-slate-950"
      edge="fill-emerald-200 dark:fill-emerald-950"
      parts={parts}
      dragType={BIO_DRAG_TYPE}
      isKind={isBioKind}
      sizeOf={(kind) => bioDefinitions[kind]}
      labelOf={(part) =>
        bioPartLabel(parts, part, bioDefinitions[part.kind].name[language])
      }
      tappable={(part) => Boolean(bioDefinitions[part.kind].tapToggles)}
      renderPart={(part) => (
        <BioPartGraphic
          part={part}
          env={env}
          outcome={outcomes.get(part.id) ?? {}}
        />
      )}
      issuesOf={(part) => outcomes.get(part.id)?.issues ?? []}
      emptyTip={tr(
        "Tip: start with the microscope and an onion slide.",
        "Kidokezo: anza na hadubini na slaidi ya kitunguu.",
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
