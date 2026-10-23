import type { Localized } from "../chemistry.types";

export type MethodId = "magnet" | "dissolve" | "filter" | "evaporate";

export const SCENE_MS = 3800;

export const methodOrder: MethodId[] = [
  "magnet",
  "dissolve",
  "filter",
  "evaporate",
];

export const methodInfo: Record<
  MethodId,
  { name: Localized; detail: Localized; caption: Localized }
> = {
  magnet: {
    name: { en: "Use a magnet", sw: "Tumia sumaku" },
    detail: {
      en: "Pull out anything magnetic.",
      sw: "Vuta kitu chochote chenye sumaku.",
    },
    caption: {
      en: "Iron is magnetic, so the magnet lifts every filing out of the mixture.",
      sw: "Chuma kina sumaku, kwa hivyo sumaku huinua kila vumbi la chuma.",
    },
  },
  dissolve: {
    name: { en: "Add water and stir", sw: "Ongeza maji na koroga" },
    detail: {
      en: "Dissolve what dissolves.",
      sw: "Yeyusha kinachoyeyuka.",
    },
    caption: {
      en: "Salt dissolves in water and disappears. Sand does not, so it sinks to the bottom.",
      sw: "Chumvi huyeyuka majini na kutoweka. Mchanga haufanyi hivyo, kwa hivyo huzama chini.",
    },
  },
  filter: {
    name: { en: "Filter", sw: "Chuja" },
    detail: {
      en: "Catch solids on paper.",
      sw: "Shika yabisi kwenye karatasi.",
    },
    caption: {
      en: "The sand is too big to pass through the paper. The salt solution drips through.",
      sw: "Mchanga ni mkubwa mno kupita kwenye karatasi. Myeyusho wa chumvi hudondoka.",
    },
  },
  evaporate: {
    name: { en: "Evaporate", sw: "Vukiza" },
    detail: {
      en: "Heat until the water is gone.",
      sw: "Pasha joto hadi maji yaishe.",
    },
    caption: {
      en: "Water turns to steam and escapes. The salt cannot, so it stays behind as crystals.",
      sw: "Maji hugeuka mvuke na kutoka. Chumvi haiwezi, kwa hivyo hubaki kama fuwele.",
    },
  },
};

export const wrongChoiceHints: Record<MethodId, (Localized | null)[]> = {
  magnet: [
    null,
    {
      en: "The iron has already been removed.",
      sw: "Chuma tayari kimeondolewa.",
    },
    {
      en: "The iron has already been removed.",
      sw: "Chuma tayari kimeondolewa.",
    },
    {
      en: "The iron has already been removed.",
      sw: "Chuma tayari kimeondolewa.",
    },
  ],
  dissolve: [
    {
      en: "Iron is magnetic. Take it out while the mixture is still dry.",
      sw: "Chuma kina sumaku. Kiondoe wakati mchanganyiko bado ni mkavu.",
    },
    null,
    { en: "You have already added water.", sw: "Umeshaongeza maji." },
    { en: "You have already added water.", sw: "Umeshaongeza maji." },
  ],
  filter: [
    {
      en: "Nothing is dissolved yet, so the solids would stay mixed on the paper.",
      sw: "Hakuna kilichoyeyuka bado, kwa hivyo yabisi zingebaki zimechanganyika kwenye karatasi.",
    },
    {
      en: "Salt and sand are both still solid. Dissolve the salt first.",
      sw: "Chumvi na mchanga bado ni yabisi. Yeyusha chumvi kwanza.",
    },
    null,
    {
      en: "The sand has already been filtered out.",
      sw: "Mchanga tayari umechujwa.",
    },
  ],
  evaporate: [
    {
      en: "There is no salt solution to heat yet.",
      sw: "Bado hakuna myeyusho wa chumvi wa kupasha joto.",
    },
    {
      en: "There is no salt solution to heat yet.",
      sw: "Bado hakuna myeyusho wa chumvi wa kupasha joto.",
    },
    {
      en: "The sand would stay mixed with the salt. Filter it out first.",
      sw: "Mchanga ungebaki umechanganyika na chumvi. Uchuje kwanza.",
    },
    null,
  ],
};
