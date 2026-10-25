import type { ChemPartSpec } from "../../chemistry.types";
import { issue, readout, t } from "../../../workbench/data/catalogue/helpers";
import { reagentTable, type ReagentKind, type Tag } from "../reagents";

const tagText: Record<Tag, [string, string]> = {
  corrosive: [
    "Corrosive: wear goggles and gloves, and wash splashes off at once.",
    "Husababisha uharibifu: vaa miwani na glavu, na osha michirizi mara moja.",
  ],
  toxic: [
    "Toxic: do not breathe it in or get it on your skin. Dispose of it in the waste container.",
    "Sumu: usivute wala usiiguse kwa ngozi. Itupe kwenye chombo cha taka.",
  ],
  flammable: [
    "Flammable: keep it away from flames. Heat it with a water bath or hot plate.",
    "Huwaka: iweke mbali na moto. Ipashe kwa bafu ya maji au sahani ya joto.",
  ],
  oxidiser: [
    "Oxidiser: keep it away from fuels and metal powders.",
    "Kioksidishaji: kiweke mbali na mafuta na unga wa metali.",
  ],
  "water-reactive": [
    "Reacts violently with water. Use only a rice-grain-sized piece, with the teacher.",
    "Humenyuka kwa nguvu na maji. Tumia kipande kidogo kama punje ya mchele, pamoja na mwalimu.",
  ],
  irritant: [
    "Irritant: avoid contact with skin and eyes.",
    "Huwasha: epuka kugusa ngozi na macho.",
  ],
};

const unitText = {
  mL: [
    "Pour or pipette it: choose this bottle under 'Add from' on a vessel.",
    "Imimine au tumia pipeti: chagua chupa hii kwenye 'Ongeza kutoka' ya chombo.",
  ],
  g: [
    "Weigh it out: choose this jar under 'Add from' on a vessel.",
    "Ipime: chagua chupa hii kwenye 'Ongeza kutoka' ya chombo.",
  ],
  drops: [
    "Add it a few drops at a time: choose this bottle under 'Add from' on a vessel.",
    "Ongeza matone machache kwa wakati: chagua chupa hii kwenye 'Ongeza kutoka' ya chombo.",
  ],
} as const;

/** A bottle on the bench for every reagent, built from its definition. */
export const reagentParts = Object.fromEntries(
  (Object.keys(reagentTable) as ReagentKind[]).map((kind) => {
    const reagent = reagentTable[kind];
    const [en, sw] = unitText[reagent.unit];
    const spec: ChemPartSpec = {
      name: reagent.name,
      description: t(en, sw),
      width: reagent.unit === "drops" ? 50 : 70,
      height: reagent.unit === "drops" ? 90 : 110,
      controls: reagent.controls,
      analyse: ({ part }) => {
        const tags = reagent.tags(part);
        const hazard = reagent.hazard(part);
        return {
          visual: { hazard },
          readouts: [readout(["Label", "Lebo"], reagent.label(part))],
          issues: [
            ...tags.map((tag) =>
              issue(tag, hazard >= 2 ? "bad" : "warn", tagText[tag]),
            ),
            ...(reagent.concentrated?.(part)
              ? [
                  issue("dilute", "bad", [
                    "Concentrated acid: always add the acid slowly to water, never water to acid.",
                    "Asidi iliyokolea: daima ongeza asidi polepole kwenye maji, kamwe si maji kwenye asidi.",
                  ]),
                ]
              : []),
          ],
        };
      },
    };
    return [kind, spec];
  }),
) as Record<ReagentKind, ChemPartSpec>;
