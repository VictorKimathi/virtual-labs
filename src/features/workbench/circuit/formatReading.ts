export function formatReading(value: number, unit: "A" | "V") {
  return `${value.toFixed(unit === "A" ? 3 : 2)} ${unit}`;
}
