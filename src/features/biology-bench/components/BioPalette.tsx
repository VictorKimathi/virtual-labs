import {
  LabPalette,
  type PaletteSection,
} from "../../workbench/components/LabPalette";
import { bioDefinitions } from "../data/equipment";
import {
  bioSectionKinds,
  bioSectionNames,
  bioSectionOrder,
  type BioKind,
} from "../data/kinds";
import { BIO_DRAG_TYPE } from "./BioCanvas";
import { BioPartPreview } from "./BioPartGraphic";

const sections: PaletteSection<BioKind>[] = bioSectionOrder.map((id) => ({
  id,
  name: bioSectionNames[id],
  kinds: bioSectionKinds[id],
}));
const nameOf = (kind: BioKind) => bioDefinitions[kind].name;
const descriptionOf = (kind: BioKind) => bioDefinitions[kind].description;
const sizeOf = (kind: BioKind) => bioDefinitions[kind];
const preview = (kind: BioKind) => <BioPartPreview kind={kind} />;

type BioPaletteProps = {
  needed: readonly BioKind[];
  onAdd: (kind: BioKind) => void;
};

export function BioPalette({ needed, onAdd }: BioPaletteProps) {
  return (
    <LabPalette
      sections={sections}
      needed={needed}
      dragType={BIO_DRAG_TYPE}
      accent="green"
      nameOf={nameOf}
      descriptionOf={descriptionOf}
      sizeOf={sizeOf}
      preview={preview}
      onAdd={onAdd}
    />
  );
}
