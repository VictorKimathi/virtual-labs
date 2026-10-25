import { LabSafetyPanel } from "../../workbench/components/LabSafetyPanel";
import type { ChemKind, ChemPart, Incident, Remedy } from "../chemistry.types";
import { chemDefinitions } from "../data/equipment";
import { incidentTitles } from "../engine/incidents";

type SafetyPanelProps = {
  parts: ChemPart[];
  incidents: Incident[];
  onWear: (kind: ChemKind) => void;
  onUse: (remedy: Remedy) => void;
};

const gearKinds: ChemKind[] = ["lab-coat", "safety-goggles", "gloves"];
const remedies: Remedy[] = [
  "eye-wash",
  "safety-shower",
  "first-aid-kit",
  "fire-blanket",
  "fire-extinguisher",
  "sand-bucket",
  "fume-cupboard",
  "waste-container",
];

/** Protective clothing, incidents and responses for the chemistry bench. */
export function SafetyPanel({
  parts,
  incidents,
  onWear,
  onUse,
}: SafetyPanelProps) {
  return (
    <LabSafetyPanel
      accent="orange"
      gear={gearKinds.map((kind) => ({
        id: kind,
        name: chemDefinitions[kind].name,
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
        name: chemDefinitions[remedy].name,
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
