export type BiologyEquipmentKind =
  "microscope" | "slide" | "petri-dish" | "dropper";

export type PlacedBiologyEquipment = {
  id: string;
  kind: BiologyEquipmentKind;
  x: number;
  z: number;
};

export function isBiologyEquipmentKind(
  value: string,
): value is BiologyEquipmentKind {
  return ["microscope", "slide", "petri-dish", "dropper"].includes(value);
}
