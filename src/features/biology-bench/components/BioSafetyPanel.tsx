import { LabSafetyPanel } from "../../workbench/components/LabSafetyPanel";
import type {
  BioIncident,
  BioKind,
  BioPart,
  BioRemedy,
} from "../biology.types";
import { bioDefinitions } from "../data/equipment";
import { incidentTitles } from "../engine/operations";

type BioSafetyPanelProps = {
  parts: BioPart[];
  incidents: BioIncident[];
  onWear: (kind: BioKind) => void;
  onUse: (remedy: BioRemedy) => void;
};

const gearKinds: BioKind[] = ["lab-coat", "safety-goggles", "gloves"];
const remedies: BioRemedy[] = [
  "first-aid-kit",
  "eye-wash",
  "disinfectant",
  "sharps-container",
  "biohazard-bag",
];

/** Protective clothing, incidents and responses for the biology bench. */
export function BioSafetyPanel({
  parts,
  incidents,
  onWear,
  onUse,
}: BioSafetyPanelProps) {
  return (
    <LabSafetyPanel
      accent="green"
      gear={gearKinds.map((kind) => ({
        id: kind,
        name: bioDefinitions[kind].name,
        worn: parts.some(
          (part) => part.kind === kind && part.params.worn === 1,
        ),
      }))}
      incidents={incidents.map((incident) => ({
        ...incident,
        title: incidentTitles[incident.kind],
      }))}
      responses={remedies.map((remedy) => ({
        id: remedy,
        name: bioDefinitions[remedy].name,
      }))}
      onWear={(id) => {
        const kind = gearKinds.find((item) => item === id);
        if (kind) onWear(kind);
      }}
      onUse={(id) => {
        const remedy = remedies.find((item) => item === id);
        if (remedy) onUse(remedy);
      }}
    />
  );
}
