import type { LocalizedText } from "../../workbench/workbench.types";
import type { Incident, IncidentKind, Remedy } from "../chemistry.types";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

type Template = {
  text: LocalizedText;
  advice: LocalizedText;
  remedies: Remedy[];
};

const templates: Record<IncidentKind, Template> = {
  swallowed: {
    text: t(
      "Liquid was drawn into your mouth while pipetting.",
      "Kimiminika kilivutwa mdomoni mwako ulipokuwa unatumia pipeti.",
    ),
    advice: t(
      "Never pipette by mouth. Use a pipette filler. Rinse your mouth and use the first aid kit.",
      "Kamwe usitumie pipeti kwa mdomo. Tumia kijazaji cha pipeti. Suuza mdomo na utumie sanduku la huduma ya kwanza.",
    ),
    remedies: ["first-aid-kit"],
  },
  "eye-splash": {
    text: t(
      "Chemical splashed into your eyes. You were not wearing safety goggles.",
      "Kemikali iliruka machoni mwako. Hukuwa umevaa miwani ya usalama.",
    ),
    advice: t(
      "Rinse at the eye wash station for 15 minutes. Wear goggles whenever you handle chemicals or heat anything.",
      "Osha kwenye kituo cha kuosha macho kwa dakika 15. Vaa miwani kila unaposhika kemikali au kupasha kitu joto.",
    ),
    remedies: ["eye-wash"],
  },
  "skin-burn": {
    text: t(
      "A concentrated corrosive liquid touched your skin. You were not wearing gloves and a lab coat.",
      "Kimiminika kikali kinachoharibu kilikugusa ngozi. Hukuwa umevaa glavu na koti la maabara.",
    ),
    advice: t(
      "Wash with plenty of water under the safety shower. Wear gloves and a lab coat with concentrated acids and alkalis.",
      "Osha kwa maji mengi chini ya bafu ya usalama. Vaa glavu na koti la maabara unaposhika asidi na alikali kali.",
    ),
    remedies: ["safety-shower"],
  },
  splash: {
    text: t(
      "Water was added to concentrated acid. It heated up violently and spat acid out.",
      "Maji yaliongezwa kwenye asidi kali. Ilipata joto kali na kurusha asidi.",
    ),
    advice: t(
      "Always add acid slowly to water, never water to acid, and stir.",
      "Ongeza asidi polepole kwenye maji kila mara, kamwe si maji kwenye asidi, na ukoroge.",
    ),
    remedies: ["eye-wash"],
  },
  burst: {
    text: t(
      "A stoppered vessel was heated. Pressure built up and the glass burst.",
      "Chombo kilichofungwa kilipashwa joto. Shinikizo liliongezeka na kioo kikapasuka.",
    ),
    advice: t(
      "Never heat a sealed vessel. Leave the stopper off, or fit a delivery tube so gas can escape.",
      "Kamwe usipashe chombo kilichofungwa. Acha kizibo wazi, au weka bomba la kupitishia gesi ili itoroke.",
    ),
    remedies: ["first-aid-kit"],
  },
  fire: {
    text: t(
      "Flammable liquid was heated in a naked flame and caught fire.",
      "Kimiminika kinachowaka kilipashwa kwa moto wazi na kikashika moto.",
    ),
    advice: t(
      "Smother the fire with a fire blanket or use a fire extinguisher. Heat flammable liquids in a water bath, away from flames.",
      "Zima moto kwa blanketi la moto au kizima moto. Pasha vimiminika vinavyowaka kwenye bafu la maji, mbali na moto.",
    ),
    remedies: ["fire-blanket", "fire-extinguisher", "sand-bucket"],
  },
  "metal-fire": {
    text: t(
      "Sodium reacted violently with water and the hydrogen caught fire.",
      "Sodiamu iliitikia kwa nguvu na maji na hidrojeni ikashika moto.",
    ),
    advice: t(
      "Smother a metal fire with dry sand. Never use water. Use only a tiny piece of sodium behind a screen.",
      "Zima moto wa chuma kwa mchanga mkavu. Kamwe usitumie maji. Tumia kipande kidogo sana cha sodiamu nyuma ya kinga.",
    ),
    remedies: ["sand-bucket"],
  },
  "toxic-fumes": {
    text: t(
      "A poisonous gas escaped into the room.",
      "Gesi yenye sumu ilitoroka ndani ya chumba.",
    ),
    advice: t(
      "Do reactions that give poisonous gases inside the fume cupboard, then switch on the extraction.",
      "Fanya athari zinazotoa gesi zenye sumu ndani ya kabati la mvuke, kisha uwashe kifyonza.",
    ),
    remedies: ["fume-cupboard"],
  },
  spill: {
    text: t(
      "The vessel overflowed and liquid spilled across the bench.",
      "Chombo kilifurika na kimiminika kikamwagika mezani.",
    ),
    advice: t(
      "Mop it up and put the waste in a labelled waste container. Never fill a vessel past its mark.",
      "Kifute na uweke taka kwenye chombo cha taka chenye lebo. Kamwe usijaze chombo zaidi ya alama yake.",
    ),
    remedies: ["waste-container"],
  },
  "bad-disposal": {
    text: t(
      "Waste went into the wrong container.",
      "Taka ziliwekwa kwenye chombo kisicho sahihi.",
    ),
    advice: t(
      "Heavy metals, solvents and strong acids or alkalis each go in their own labelled container.",
      "Metali nzito, viyeyusho na asidi au alikali kali kila moja huwekwa kwenye chombo chake chenye lebo.",
    ),
    remedies: [],
  },
};

export function createIncident(
  id: string,
  kind: IncidentKind,
  vessel?: number,
  options: { resolved?: boolean; text?: LocalizedText } = {},
): Incident {
  const template = templates[kind];
  return {
    id,
    kind,
    vessel,
    text: options.text ?? template.text,
    advice: template.advice,
    remedies: template.remedies,
    resolved: options.resolved ?? kind === "bad-disposal",
  };
}

export const incidentTitles: Record<IncidentKind, LocalizedText> = {
  swallowed: t("Swallowed chemical", "Kemikali iliyomezwa"),
  "eye-splash": t("Chemical in the eyes", "Kemikali machoni"),
  "skin-burn": t("Chemical burn", "Kuungua kwa kemikali"),
  splash: t("Acid spat out", "Asidi ilirushwa"),
  burst: t("Vessel burst", "Chombo kilipasuka"),
  fire: t("Fire", "Moto"),
  "metal-fire": t("Metal fire", "Moto wa chuma"),
  "toxic-fumes": t("Poisonous gas", "Gesi yenye sumu"),
  spill: t("Spill", "Kumwagika"),
  "bad-disposal": t("Wrong waste container", "Chombo kisicho sahihi cha taka"),
};
