import type { ChemPart, ChemPartSpec, ChemState } from "../../chemistry.types";
import { amountOf, mix, tidy, gasReleased } from "../../engine/contents";
import { heatLiquid } from "../../engine/heating";
import {
  addIncident,
  heaterOutput,
  partByNum,
  partsOver,
  replacePart,
} from "../../engine/operations";
import { GAS_ML_PER_MMOL } from "../../engine/contents";
import { gasInfo, type GasId } from "../../engine/species";
import {
  fixed,
  issue,
  readout,
  t,
} from "../../../workbench/data/catalogue/helpers";
import type { ChemKind } from "../kinds";
import { button, choice, link, slider, toggle } from "./controls";
import { heaterKinds } from "./shared";

type GlasswareKind =
  | "burette-stand"
  | "pipette-filler"
  | "glass-rod"
  | "delivery-tube"
  | "glass-tubing"
  | "gas-jar"
  | "gas-jar-lid"
  | "liebig-condenser";

const label = (part: ChemPart | undefined) =>
  part ? `${part.kind.replaceAll("-", " ")} ${part.num}` : "—";

const isVessel = (candidate: ChemPart, self: ChemPart) =>
  candidate.id !== self.id && candidate.vessel !== null;

/** The gas given off most by a vessel, with its volume in millilitres so far. */
export function collectedGas(
  vessel: ChemPart | undefined,
  now: number,
): { gas: GasId; mL: number } | null {
  if (!vessel || vessel.contents.gas.length === 0) return null;
  const totals = new Map<GasId, number>();
  for (const event of vessel.contents.gas)
    totals.set(
      event.gas,
      (totals.get(event.gas) ?? 0) + gasReleased([event], now),
    );
  let best: GasId | null = null;
  for (const [gas, mmol] of totals)
    if (best === null || mmol > (totals.get(best) ?? 0)) best = gas;
  return best === null
    ? null
    : { gas: best, mL: (totals.get(best) ?? 0) * GAS_ML_PER_MMOL };
}

const tests = [
  ["A lighted splint", "Kijiti kinachowaka"],
  ["A glowing splint", "Kijiti kinachowaka mwanga"],
  ["Limewater", "Maji ya chokaa"],
  ["Damp blue litmus paper", "Karatasi ya litmus ya bluu yenye unyevu"],
] as [string, string][];

function gasTest(gas: GasId, test: number) {
  if (test === 0)
    return gas === "H2"
      ? t(
          "The lighted splint burns with a squeaky 'pop'.",
          "Kijiti kinachowaka kinalia 'pop'.",
        )
      : gas === "O2"
        ? t(
            "The lighted splint burns more brightly.",
            "Kijiti kinachowaka kinawaka kwa mwangaza zaidi.",
          )
        : t("The lighted splint goes out.", "Kijiti kinachowaka kinazimika.");
  if (test === 1)
    return gas === "O2"
      ? t(
          "The glowing splint relights.",
          "Kijiti kinachowaka mwanga kinawaka tena.",
        )
      : t(
          "The glowing splint stays dull and goes out.",
          "Kijiti kinachowaka mwanga kinabaki hafifu na kuzimika.",
        );
  if (test === 2)
    return gas === "CO2"
      ? t(
          "The limewater turns milky.",
          "Maji ya chokaa yanakuwa meupe kama maziwa.",
        )
      : t("The limewater stays clear.", "Maji ya chokaa yanabaki wazi.");
  return gas === "Cl2"
    ? t(
        "The litmus paper turns red, then is bleached white.",
        "Karatasi ya litmus inakuwa nyekundu, kisha inapauka na kuwa nyeupe.",
      )
    : gas === "NO2"
      ? t("The litmus paper turns red.", "Karatasi ya litmus inakuwa nyekundu.")
      : gas === "CO2"
        ? t(
            "The litmus paper turns slightly red.",
            "Karatasi ya litmus inakuwa nyekundu kidogo.",
          )
        : t(
            "The litmus paper does not change.",
            "Karatasi ya litmus haibadiliki.",
          );
}

function note(
  state: ChemState,
  part: ChemPart,
  text: ReturnType<typeof t>,
): ChemState {
  return replacePart(state, {
    ...part,
    contents: {
      ...part.contents,
      notes: [...part.contents.notes, text].slice(-6),
    },
  });
}

export const glasswareParts: Record<GlasswareKind, ChemPartSpec> = {
  "burette-stand": {
    name: t("Burette stand", "Stendi ya biureti"),
    description: t(
      "A retort stand with a clamp that holds a burette upright over a flask. Put a white tile under the flask to see colour changes.",
      "Stendi yenye kibano kinachoshikilia biureti wima juu ya chupa. Weka kigae cheupe chini ya chupa kuona mabadiliko ya rangi.",
    ),
    width: 120,
    height: 330,
    analyse: ({ part, env }) => {
      const held = partsOver(env, part, ["burette"]);
      return {
        readouts: [
          readout(
            ["Burette held", "Biureti imeshikwa"],
            held.length > 0 ? "Yes" : "No",
            held.length > 0 ? "ok" : "warn",
          ),
        ],
        issues:
          held.length === 0
            ? [
                issue("clamp", "tip", [
                  "Clamp the burette to the stand: slide the burette over it.",
                  "Bana biureti kwenye stendi: telezesha biureti juu yake.",
                ]),
              ]
            : [],
      };
    },
  },
  "pipette-filler": {
    name: t("Pipette filler", "Kijazaji cha pipeti"),
    description: t(
      "A rubber bulb that draws liquid into a pipette. Never pipette by mouth.",
      "Puto la mpira linalovuta kioevu ndani ya pipeti. Kamwe usitumie pipeti kwa mdomo.",
    ),
    width: 60,
    height: 110,
    analyse: () => ({
      issues: [
        issue("safe", "tip", [
          "Keep the filler on the bench when you pipette: drawing liquid by mouth is dangerous.",
          "Weka kijazaji mezani unapotumia pipeti: kuvuta kioevu kwa mdomo ni hatari.",
        ]),
      ],
    }),
  },
  "glass-rod": {
    name: t("Glass rod (stirring rod)", "Fimbo ya kioo (ya kukorogea)"),
    description: t(
      "Stirs mixtures, helps solids dissolve and guides liquid when you pour.",
      "Hukoroga mchanganyiko, husaidia vigumu kuyeyuka na huongoza kimiminika unapomimina.",
    ),
    width: 140,
    height: 24,
    analyse: () => ({
      issues: [
        issue("stir", "tip", [
          "Stir gently and do not tap the sides of the glass.",
          "Koroga taratibu na usigonge pande za kioo.",
        ]),
      ],
    }),
  },
  "delivery-tube": {
    name: t("Delivery tube", "Bomba la kupitisha gesi"),
    description: t(
      "Carries a gas from one vessel into another. Bubbling carbon dioxide into limewater turns it milky.",
      "Hubeba gesi kutoka chombo kimoja kwenda kingine. Kupitisha kaboni dioksaidi kwenye maji ya chokaa huyafanya meupe.",
    ),
    width: 220,
    height: 120,
    controls: [
      link(
        "from",
        ["Gas comes from", "Gesi inatoka"],
        ["Choose a vessel", "Chagua chombo"],
        isVessel,
      ),
      link(
        "to",
        ["Gas goes into", "Gesi inaingia"],
        ["Choose a vessel", "Chagua chombo"],
        isVessel,
      ),
    ],
    state: { from: 0, to: 0 },
    analyse: ({ part, env }) => {
      const from = env.part(part.params.from);
      const to = env.part(part.params.to);
      return {
        readouts: [
          readout(
            ["Route", "Njia"],
            `${label(from)} → ${label(to)}`,
            from && to ? "ok" : undefined,
          ),
        ],
        issues:
          from && to
            ? []
            : [
                issue("link", "tip", [
                  "Choose the vessel the gas comes from and the one it goes into.",
                  "Chagua chombo ambacho gesi inatoka na kile inachoingia.",
                ]),
              ],
      };
    },
  },
  "glass-tubing": {
    name: t("Glass tubing", "Mrija wa kioo"),
    description: t(
      "Glass tube that can be bent in a flame to make delivery tubes. Fire-polish the cut ends.",
      "Mrija wa kioo unaoweza kupindwa motoni kutengeneza mabomba ya gesi. Lainisha ncha zilizokatwa kwa moto.",
    ),
    width: 200,
    height: 90,
    controls: [
      choice(
        "shape",
        ["Shape", "Umbo"],
        [
          ["Straight", "Ulionyooka"],
          ["Right-angle bend", "Mkunjo wa pembe kodi"],
          ["U-bend", "Mkunjo wa U"],
        ],
      ),
    ],
    analyse: ({ p }) => ({ visual: { shape: p("shape") } }),
  },
  "gas-jar": {
    name: t("Gas jar", "Mtungi wa gesi"),
    description: t(
      "Collects a gas from a reacting vessel. Cover it with a lid, then test the gas.",
      "Hukusanya gesi kutoka kwenye chombo kinachoitikia. Ufunike kwa mfuniko, kisha upime gesi.",
    ),
    width: 80,
    height: 170,
    controls: [
      link(
        "from",
        ["Collect gas from", "Kusanya gesi kutoka"],
        ["Choose a vessel", "Chagua chombo"],
        isVessel,
      ),
      choice("test", ["Test with", "Pima kwa"], tests),
      button(
        "run",
        ["Test the gas", "Pima gesi"],
        ({ state, part, now }) => {
          const found = collectedGas(partByNum(state, part.params.from), now);
          if (!found || found.mL < 5)
            return note(
              state,
              part,
              t(
                "There is not enough gas in the jar to test.",
                "Hakuna gesi ya kutosha kwenye mtungi kupima.",
              ),
            );
          return note(state, part, gasTest(found.gas, part.params.test));
        },
        (part) => part.params.from > 0,
      ),
    ],
    state: { from: 0 },
    analyse: ({ part, env }) => {
      const found = collectedGas(env.part(part.params.from), env.now);
      const lid = partsOver(env, part, ["gas-jar-lid"]).length > 0;
      const kept = found
        ? lid || found.gas !== "H2"
          ? found.mL
          : found.mL * 0.3
        : 0;
      return {
        observations: part.contents.notes,
        readouts: [
          readout(
            ["Gas collected", "Gesi iliyokusanywa"],
            `${fixed(kept, 0)} mL`,
          ),
          ...(found && kept > 10
            ? [
                readout(
                  ["Looks like", "Inaonekana kama"],
                  gasInfo[found.gas].observation.en,
                ),
              ]
            : []),
        ],
        issues:
          found && !lid
            ? [
                issue("lid", "warn", [
                  "Cover the jar with a lid, or light gases like hydrogen escape.",
                  "Funika mtungi kwa mfuniko, la sivyo gesi nyepesi kama hidrojeni hutoroka.",
                ]),
              ]
            : [],
        visual: { amount: Math.min(1, kept / 200) },
        liquid: undefined,
      };
    },
  },
  "gas-jar-lid": {
    name: t("Gas jar lid", "Mfuniko wa mtungi wa gesi"),
    description: t(
      "A glass plate that covers a gas jar so the gas stays in. Slide it on, do not lift it.",
      "Bamba la kioo linalofunika mtungi wa gesi ili gesi ibaki ndani. Liteleze, usiliinue.",
    ),
    width: 100,
    height: 14,
    analyse: ({ part, env }) => {
      const jar = partsOver(env, part, ["gas-jar"]);
      return {
        readouts: [
          readout(
            ["Covering a jar", "Inafunika mtungi"],
            jar.length > 0 ? "Yes" : "No",
            jar.length > 0 ? "ok" : undefined,
          ),
        ],
      };
    },
  },
  "liebig-condenser": {
    name: t("Liebig condenser", "Kipoozaji cha Liebig"),
    description: t(
      "Cools a vapour back to liquid with cold water flowing through the outer jacket. Join it to a flask and a receiver to distil.",
      "Hupoza mvuke kuwa kioevu kwa maji baridi yanayotiririka kwenye kifuniko cha nje. Kiunganishe na chupa na kipokezi kutoa kioevu kwa kuchemsha na kupoza.",
    ),
    width: 280,
    height: 90,
    controls: [
      link(
        "flask",
        ["Distilling flask", "Chupa ya kuchemsha"],
        ["Choose a flask", "Chagua chupa"],
        isVessel,
      ),
      link(
        "receiver",
        ["Receiver", "Kipokezi"],
        ["Choose a vessel", "Chagua chombo"],
        isVessel,
      ),
      link(
        "heater",
        ["Heated by", "Inapashwa na"],
        ["Nothing", "Hakuna"],
        (candidate) => heaterKinds.includes(candidate.kind),
      ),
      toggle(
        "water",
        ["Cooling water", "Maji ya kupoza"],
        ["Flowing", "Yanatiririka"],
        ["Off", "Yamezimwa"],
      ),
      slider(
        "seconds",
        ["Distil for", "Chemsha na poza kwa"],
        10,
        180,
        10,
        60,
        "s",
      ),
      button(
        "distil",
        ["Distil", "Chemsha na poza"],
        ({ state, part }) => {
          const flask = partByNum(state, part.params.flask);
          const receiver = partByNum(state, part.params.receiver);
          const heater = partByNum(state, part.params.heater);
          if (!flask?.vessel || !receiver?.vessel || !heater) return state;
          const out = heaterOutput(heater);
          if (!out)
            return note(
              state,
              flask,
              t("The heater is switched off.", "Kifaa cha kupasha kimezimwa."),
            );
          const ethanol = amountOf(flask.contents.species, "EtOH") > 1e-6;
          if (ethanol && out.flame) {
            let next = replacePart(state, {
              ...flask,
              params: { ...flask.params, burning: 1 },
            });
            next = note(
              next,
              flask,
              t(
                "The ethanol vapour catches fire in the flame.",
                "Mvuke wa ethanoli unashika moto kwenye mwali.",
              ),
            );
            return addIncident(next, "fire", flask.num);
          }
          const heated = heatLiquid(
            flask.contents,
            out.watts,
            part.params.seconds,
            out.ceiling,
          );
          const column = state.parts.some(
            (item) => item.kind === "fractional-column",
          );
          const purity = column ? 0.95 : 0.65;
          const vapour = heated.vapour;
          const contamination =
            vapour.ethanol > 0
              ? Math.min(
                  heated.contents.volume,
                  (vapour.ethanol * (1 - purity)) / purity,
                )
              : 0;
          const lost = part.params.water === 1 ? 0 : 1;
          const collectedEthanol = vapour.ethanol * (1 - lost);
          const collectedWater = (vapour.water + contamination) * (1 - lost);
          let next = replacePart(state, {
            ...flask,
            contents: tidy({
              ...heated.contents,
              volume: heated.contents.volume - contamination,
            }),
            params: {
              ...flask.params,
              vapour:
                vapour.ethanol > 0
                  ? 78
                  : vapour.water > 0
                    ? 100
                    : heated.contents.temperature,
            },
          });
          if (collectedEthanol + collectedWater > 0) {
            const target = partByNum(next, receiver.num);
            if (target)
              next = replacePart(next, {
                ...target,
                contents: tidy(
                  mix(target.contents, {
                    volume: collectedEthanol + collectedWater,
                    species: { EtOH: collectedEthanol * 17.1 },
                    temperature: 25,
                  }),
                ),
              });
          }
          if (lost && vapour.ethanol + vapour.water > 0.05)
            next = note(
              next,
              part,
              t(
                "The vapour escapes because there is no cooling water.",
                "Mvuke unatoroka kwa sababu hakuna maji ya kupoza.",
              ),
            );
          return next;
        },
        (part) =>
          part.params.flask > 0 &&
          part.params.receiver > 0 &&
          part.params.heater > 0,
      ),
    ],
    state: { flask: 0, receiver: 0, heater: 0 },
    analyse: ({ part, env }) => {
      const flask = env.part(part.params.flask);
      const column = env.parts.some(
        (item) => item.kind === "fractional-column",
      );
      return {
        observations: part.contents.notes,
        readouts: [
          readout(
            ["Vapour temperature", "Joto la mvuke"],
            flask
              ? `${fixed(flask.params.vapour ?? flask.contents.temperature, 0)} °C`
              : "—",
          ),
          readout(
            ["Fractional column", "Safu ya kutenganisha"],
            column ? "Fitted (better separation)" : "Not fitted",
          ),
        ],
        issues: [
          ...(part.params.water === 0
            ? [
                issue("water", "warn", [
                  "Switch the cooling water on: it enters at the bottom and leaves at the top.",
                  "Washa maji ya kupoza: yanaingia chini na kutoka juu.",
                ]),
              ]
            : []),
          ...(!column
            ? [
                issue("column", "tip", [
                  "Simple distillation gives a mixed distillate. Add a fractional column to separate liquids with close boiling points.",
                  "Kuchemsha na kupoza kwa kawaida hutoa mchanganyiko. Ongeza safu ya kutenganisha kutenganisha vimiminika vyenye viwango karibu vya kuchemka.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
};

export const glasswareKinds: ChemKind[] = [
  "burette-stand",
  "pipette-filler",
  "glass-rod",
  "delivery-tube",
  "glass-tubing",
  "gas-jar",
  "gas-jar-lid",
  "liebig-condenser",
];
