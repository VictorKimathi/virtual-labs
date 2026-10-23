export type EquipmentKind =
  "cell" | "bulb" | "switch" | "wire" | "ammeter" | "voltmeter";

export type PlacedEquipment = {
  id: string;
  kind: EquipmentKind;
  x: number;
  z: number;
};

export function isEquipmentKind(value: string): value is EquipmentKind {
  return ["cell", "bulb", "switch", "wire", "ammeter", "voltmeter"].includes(
    value,
  );
}
