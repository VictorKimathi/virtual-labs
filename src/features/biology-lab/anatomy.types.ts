export type AnatomyGroup =
  "all" | "muscular" | "skeletal" | "organs" | "nervous" | "lymphatic";

export type AnatomyView = "front" | "back" | "side" | "perspective";

export type AnatomyPart = {
  id: string;
  name: string;
  system: string;
};

export function anatomyGroupFor(system: string): Exclude<AnatomyGroup, "all"> {
  if (system === "muscular") return "muscular";
  if (system === "skeletal") return "skeletal";
  if (system === "nervous") return "nervous";
  if (system === "lymphatic") return "lymphatic";
  return "organs";
}
