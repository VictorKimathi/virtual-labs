import {
  LabPalette,
  type PaletteSection,
} from "../../workbench/components/LabPalette";
import { chemDefinitions } from "../data/equipment";
import {
  chemSectionKinds,
  chemSectionNames,
  chemSectionOrder,
  type ChemKind,
} from "../data/kinds";
import { CHEM_DRAG_TYPE } from "./ChemCanvas";
import { ChemPartPreview } from "./ChemPartGraphic";

const sections: PaletteSection<ChemKind>[] = chemSectionOrder.map((id) => ({
  id,
  name: chemSectionNames[id],
  kinds: chemSectionKinds[id],
}));
const nameOf = (kind: ChemKind) => chemDefinitions[kind].name;
const descriptionOf = (kind: ChemKind) => chemDefinitions[kind].description;
const sizeOf = (kind: ChemKind) => chemDefinitions[kind];
const preview = (kind: ChemKind) => <ChemPartPreview kind={kind} />;

type ChemPaletteProps = {
  needed: readonly ChemKind[];
  onAdd: (kind: ChemKind) => void;
};

export function ChemPalette({ needed, onAdd }: ChemPaletteProps) {
  return (
    <LabPalette
      sections={sections}
      needed={needed}
      dragType={CHEM_DRAG_TYPE}
      accent="orange"
      nameOf={nameOf}
      descriptionOf={descriptionOf}
      sizeOf={sizeOf}
      preview={preview}
      onAdd={onAdd}
    />
  );
}
