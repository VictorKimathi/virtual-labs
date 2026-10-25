import { useLanguage } from "../../../app/useLanguage";
import { LabInspector } from "../../workbench/components/LabInspector";
import type { Selection } from "../../workbench/workbench.types";
import type { ChemEnv, ChemOutcome, ChemPart } from "../chemistry.types";
import {
  chemDefinitions,
  chemParamReader,
  chemPartLabel,
} from "../data/equipment";
import { ChemPartGraphic } from "./ChemPartGraphic";

type ChemInspectorProps = {
  parts: ChemPart[];
  selection: Selection | null;
  env: ChemEnv;
  outcomes: Map<string, ChemOutcome>;
  onSetParam: (id: string, param: string, value: number) => void;
  onPress: (id: string, control: string) => void;
  onRemove: () => void;
};

export function ChemInspector({
  parts,
  selection,
  env,
  outcomes,
  onSetParam,
  onPress,
  onRemove,
}: ChemInspectorProps) {
  const { language, tr } = useLanguage();
  const part =
    selection?.type === "part"
      ? parts.find((item) => item.id === selection.id)
      : undefined;
  const definition = part ? chemDefinitions[part.kind] : undefined;
  const outcome = part ? (outcomes.get(part.id) ?? {}) : {};
  const labelOf = (item: ChemPart) =>
    chemPartLabel(parts, item, chemDefinitions[item.kind].name[language]);
  return (
    <LabInspector
      part={part}
      parts={parts}
      title={part ? labelOf(part) : ""}
      description={definition?.description ?? { en: "", sw: "" }}
      viewBox={
        definition
          ? `-8 -8 ${definition.width + 16} ${definition.height + 16}`
          : "0 0 1 1"
      }
      closeUp={
        part ? (
          <ChemPartGraphic part={part} env={env} outcome={outcome} />
        ) : null
      }
      controls={
        part && definition
          ? definition.controls.filter(
              (control) => !control.when || control.when(part, env),
            )
          : []
      }
      outcome={outcome}
      accent="orange"
      valueOf={part ? chemParamReader(part) : () => 0}
      labelOf={labelOf}
      emptyHint={tr(
        "Click a piece of equipment to see its settings, what you can observe and its readings.",
        "Bofya kifaa kuona mipangilio yake, unachoweza kuona na vipimo vyake.",
      )}
      onSetParam={onSetParam}
      onPress={onPress}
      onRemove={onRemove}
    />
  );
}
