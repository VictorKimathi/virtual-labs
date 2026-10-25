import type {
  ChemControl,
  ChemEnv,
  ChemOutcome,
  ChemPart,
} from "../../chemistry.types";
import {
  addFrom,
  emptyVessel,
  heatVessel,
  partByNum,
  replacePart,
  rinseVessel,
  settleVessel,
  transfer,
} from "../../engine/operations";
import {
  conductivityOf,
  liquidView,
  molarity,
  phOf,
  solidMass,
  totalVolume,
} from "../../engine/contents";
import { speciesInfo, type SpeciesId } from "../../engine/species";
import {
  fixed,
  issue,
  readout,
} from "../../../workbench/data/catalogue/helpers";
import type { ChemKind } from "../kinds";
import { reagents, type Unit } from "../reagents";
import { button, link, slider, toggle } from "./controls";

export const heaterKinds: ChemKind[] = [
  "bunsen-burner",
  "spirit-lamp",
  "hot-plate",
  "heating-mantle",
  "water-bath",
  "sand-bath",
  "magnetic-stirrer",
];

export const isReagentPart = (part: ChemPart) => Boolean(reagents[part.kind]);

export function sourceUnit(part: ChemPart, env: ChemEnv): Unit {
  const source = env.part(part.params.source);
  return (source && reagents[source.kind]?.unit) || "mL";
}

export type VesselFeatures = {
  add?: boolean;
  pour?: boolean;
  rinse?: boolean;
  empty?: boolean;
  heat?: boolean;
  stopper?: boolean;
  settle?: boolean;
  /** Offer fine steps when adding, as for making up to a mark. */
  fine?: boolean;
};

const ALL: VesselFeatures = {
  add: true,
  pour: true,
  rinse: true,
  empty: true,
  heat: true,
  stopper: true,
  settle: true,
};

/** The controls shared by everything that holds liquid. */
export function vesselControls(features: VesselFeatures = ALL): ChemControl[] {
  const controls: ChemControl[] = [];
  if (features.add) {
    controls.push(
      link(
        "source",
        ["Add from", "Ongeza kutoka"],
        ["Choose a bottle or vessel", "Chagua chupa au chombo"],
        (candidate, self) =>
          candidate.id !== self.id &&
          (isReagentPart(candidate) ||
            (candidate.vessel !== null && candidate.params.broken !== 1)),
      ),
      slider(
        "volume",
        ["Volume to add", "Ujazo wa kuongeza"],
        features.fine ? 0.05 : 0.5,
        100,
        features.fine ? 0.05 : 0.5,
        10,
        "mL",
        (part, env) => sourceUnit(part, env) === "mL",
      ),
      slider(
        "mass",
        ["Mass to add", "Uzito wa kuongeza"],
        0.05,
        10,
        0.05,
        1,
        "g",
        (part, env) => sourceUnit(part, env) === "g",
      ),
      slider(
        "drops",
        ["Drops to add", "Matone ya kuongeza"],
        1,
        20,
        1,
        3,
        "drops",
        (part, env) => sourceUnit(part, env) === "drops",
      ),
      button(
        "add",
        ["Add", "Ongeza"],
        ({ state, part, now }) => {
          const source = partByNum(state, part.params.source);
          if (!source) return state;
          const unit = reagents[source.kind]?.unit ?? "mL";
          const amount =
            unit === "g"
              ? part.params.mass
              : unit === "drops"
                ? part.params.drops
                : part.params.volume;
          const before = totalVolume(part.contents);
          let next = addFrom(state, part.num, source.num, amount, now);
          const after = partByNum(next, part.num);
          if (
            after &&
            part.kind === "burette" &&
            before < 5 &&
            totalVolume(after.contents) > 5
          )
            next = replacePart(next, {
              ...after,
              params: { ...after.params, bubble: 1 },
            });
          return next;
        },
        (part) => part.params.source > 0,
      ),
    );
  }
  if (features.pour) {
    controls.push(
      link(
        "into",
        ["Pour into", "Mimina kwenye"],
        ["Choose a vessel", "Chagua chombo"],
        (candidate, self) =>
          candidate.id !== self.id &&
          candidate.vessel !== null &&
          candidate.params.broken !== 1,
      ),
      slider(
        "pour",
        ["Volume to pour", "Ujazo wa kumimina"],
        0.5,
        100,
        0.5,
        10,
        "mL",
        (part) => part.params.into > 0,
      ),
      button(
        "pourNow",
        ["Pour", "Mimina"],
        ({ state, part, now }) =>
          part.params.into > 0
            ? transfer(state, part.num, part.params.into, part.params.pour, now)
            : state,
        (part) => part.params.into > 0,
      ),
    );
  }
  if (features.rinse)
    controls.push(
      button(
        "rinse",
        [
          "Rinse (with the chosen bottle, or distilled water)",
          "Suuza (kwa chupa iliyochaguliwa, au maji yaliyosafishwa)",
        ],
        ({ state, part }) =>
          rinseVessel(state, part.num, part.params.source ?? 0),
      ),
    );
  if (features.empty)
    controls.push(
      link(
        "waste",
        ["Waste container", "Chombo cha taka"],
        ["Down the sink", "Kwenye sinki"],
        (candidate) => candidate.kind === "waste-container",
      ),
      button("empty", ["Empty the vessel", "Mwaga chombo"], ({ state, part }) =>
        emptyVessel(state, part.num, part.params.waste ?? 0),
      ),
    );
  if (features.heat)
    controls.push(
      link(
        "heater",
        ["Heated by", "Inapashwa na"],
        ["Nothing", "Hakuna"],
        (candidate) => heaterKinds.includes(candidate.kind),
      ),
      slider(
        "seconds",
        ["Heating time", "Muda wa kupasha"],
        5,
        120,
        5,
        30,
        "s",
        (part) => part.params.heater > 0,
      ),
      button(
        "heat",
        ["Heat", "Pasha joto"],
        ({ state, part, now }) =>
          heatVessel(
            state,
            part.num,
            part.params.heater,
            part.params.seconds,
            now,
          ),
        (part) => part.params.heater > 0,
      ),
    );
  if (features.stopper)
    controls.push(
      toggle(
        "stopper",
        ["Stopper", "Kizibo"],
        ["Fitted", "Kimewekwa"],
        ["Off", "Hakijawekwa"],
      ),
    );
  if (features.settle)
    controls.push(
      button("settle", ["Leave to settle", "Acha itue"], ({ state, part }) =>
        settleVessel(state, part.num),
      ),
    );
  controls.push(
    toggle(
      "teacher",
      [
        "Teacher view (show what is inside)",
        "Mwonekano wa mwalimu (onyesha kilichomo)",
      ],
      ["On", "Imewashwa"],
      ["Off", "Imezimwa"],
    ),
  );
  return controls;
}

/** Defaults for the hidden settings of a vessel. */
export const vesselState = {
  film: 0,
  cond: 0,
  broken: 0,
  burning: 0,
  releasedAt: 0,
};

export function vesselOutcome(part: ChemPart, env: ChemEnv): ChemOutcome {
  const c = part.contents;
  const spec = part.vessel;
  const capacity = spec?.capacity ?? 0;
  const volume = totalVolume(c);
  const readouts = [];
  const issues = [];
  if (volume > 0 || Object.keys(c.solids).length === 0)
    readouts.push(readout(["Volume", "Ujazo"], `${fixed(volume, 1)} mL`));
  if (volume > 0)
    readouts.push(
      readout(
        ["Temperature", "Joto"],
        `${fixed(c.temperature, 0)} °C`,
        c.temperature >= 60 ? "warn" : undefined,
      ),
    );
  if (part.params.teacher === 1) {
    const ph = phOf(c);
    if (ph !== null)
      readouts.push(
        readout(["pH (calculated)", "pH (iliyohesabiwa)"], fixed(ph, 2)),
      );
    if (volume > 0)
      readouts.push(
        readout(
          ["Conductivity", "Upitishaji"],
          `${fixed(conductivityOf(c), 0)} µS/cm`,
        ),
      );
    for (const id of Object.keys(c.species) as SpeciesId[]) {
      const m = molarity(c, id);
      if (m > 0.0005)
        readouts.push(
          readout(
            [speciesInfo[id].label, speciesInfo[id].label],
            `${fixed(m, m < 0.01 ? 4 : 3)} mol/dm³`,
          ),
        );
    }
    if (solidMass(c) > 0)
      readouts.push(
        readout(["Solids", "Vigumu"], `${fixed(solidMass(c), 3)} g`),
      );
  }
  if (part.params.broken === 1)
    issues.push(
      issue("broken", "bad", [
        "This vessel is broken. Take it off the bench.",
        "Chombo hiki kimevunjika. Kiondoe mezani.",
      ]),
    );
  if (part.params.burning === 1)
    issues.push(
      issue("burning", "bad", [
        "It is on fire! Put it out with the right equipment from the Safety tab.",
        "Kinawaka moto! Kizime kwa kifaa sahihi kutoka kichupo cha Usalama.",
      ]),
    );
  if (c.temperature >= 60 && volume > 0)
    issues.push(
      issue("hot", "warn", [
        "It is hot. Hold it with tongs or a test-tube holder.",
        "Ni moto. Kishike kwa koleo au kishikio cha mrija wa majaribio.",
      ]),
    );
  if (part.params.stopper === 1)
    issues.push(
      issue("stopper", "tip", [
        "It is stoppered. Never heat a sealed vessel.",
        "Kimefungwa kizibo. Kamwe usipashe chombo kilichofungwa.",
      ]),
    );
  return {
    liquid: liquidView(c, capacity, env.now),
    observations: c.notes,
    readouts,
    issues,
  };
}
