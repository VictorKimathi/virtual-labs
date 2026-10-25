import { useLanguage } from "../../../app/useLanguage";
import { LabInspector } from "../../workbench/components/LabInspector";
import type { Selection } from "../../workbench/workbench.types";
import type { BioEnv, BioOutcome, BioPart } from "../biology.types";
import {
  bioDefinitions,
  bioParamReader,
  bioPartLabel,
} from "../data/equipment";
import { BioPartGraphic } from "./BioPartGraphic";
import { MicroscopeView } from "./MicroscopeView";

type BioInspectorProps = {
  parts: BioPart[];
  selection: Selection | null;
  env: BioEnv;
  outcomes: Map<string, BioOutcome>;
  onSetParam: (id: string, param: string, value: number) => void;
  onPress: (id: string, control: string) => void;
  onRemove: () => void;
};

export function BioInspector({
  parts,
  selection,
  env,
  outcomes,
  onSetParam,
  onPress,
  onRemove,
}: BioInspectorProps) {
  const { language, tr } = useLanguage();
  const part =
    selection?.type === "part"
      ? parts.find((item) => item.id === selection.id)
      : undefined;
  const definition = part ? bioDefinitions[part.kind] : undefined;
  const outcome = part ? (outcomes.get(part.id) ?? {}) : {};
  const labelOf = (item: BioPart) =>
    bioPartLabel(parts, item, bioDefinitions[item.kind].name[language]);
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
        part ? <BioPartGraphic part={part} env={env} outcome={outcome} /> : null
      }
      extra={
        outcome.view ? (
          <figure className="mt-3">
            <figcaption className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("Through the eyepiece", "Kupitia kioo cha jicho")}
            </figcaption>
            <svg
              viewBox="0 0 320 320"
              role="img"
              aria-label={tr("Microscope view", "Mwonekano wa hadubini")}
              className="mx-auto mt-2 w-full max-w-xs"
            >
              <MicroscopeView view={outcome.view} cx={160} cy={160} r={150} />
            </svg>
          </figure>
        ) : undefined
      }
      controls={
        part && definition
          ? definition.controls.filter(
              (control) => !control.when || control.when(part, env),
            )
          : []
      }
      outcome={outcome}
      accent="green"
      valueOf={part ? bioParamReader(part) : () => 0}
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
