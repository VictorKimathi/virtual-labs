import type {
  PhysicshubDifficulty,
  PhysicshubLevel,
} from "../physicshub.types";

type Labelled<Id extends string> = { id: Id; en: string; sw: string };

export const levels: Labelled<PhysicshubLevel>[] = [
  { id: "elementary", en: "Primary", sw: "Msingi" },
  { id: "lowerSecondary", en: "Grades 7–9", sw: "Gredi 7–9" },
  { id: "upperSecondary", en: "Grades 10–12", sw: "Gredi 10–12" },
  { id: "undergraduate", en: "University", sw: "Chuo kikuu" },
];

export const difficulties: Labelled<PhysicshubDifficulty>[] = [
  { id: "core", en: "Core", sw: "Msingi" },
  { id: "extended", en: "Extended", sw: "Iliyopanuliwa" },
  { id: "advanced", en: "Advanced", sw: "Ya juu" },
];
