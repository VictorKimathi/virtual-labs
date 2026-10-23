import { CircleDot, Droplets, Microscope, ScanLine } from "lucide-react";
import type { BiologyEquipmentKind } from "./equipment.types";

export const biologyEquipment = [
  {
    kind: "microscope",
    en: "Microscope",
    sw: "Hadubini",
    detail: "Magnifies a specimen on a prepared slide.",
    detailSw: "Hukuza sampuli iliyo kwenye slaidi iliyoandaliwa.",
    icon: Microscope,
  },
  {
    kind: "slide",
    en: "Plant slide",
    sw: "Slaidi ya mmea",
    detail: "A prepared plant tissue sample for observation.",
    detailSw: "Sampuli ya tishu ya mmea kwa uchunguzi.",
    icon: ScanLine,
  },
  {
    kind: "petri-dish",
    en: "Petri dish",
    sw: "Sahani ya Petri",
    detail: "Holds a sample on the bench.",
    detailSw: "Hushikilia sampuli kwenye benchi.",
    icon: CircleDot,
  },
  {
    kind: "dropper",
    en: "Dropper",
    sw: "Kidondosho",
    detail: "Adds a drop of water to a sample.",
    detailSw: "Huongeza tone la maji kwenye sampuli.",
    icon: Droplets,
  },
] as const satisfies ReadonlyArray<{
  kind: BiologyEquipmentKind;
  en: string;
  sw: string;
  detail: string;
  detailSw: string;
  icon: typeof Microscope;
}>;
