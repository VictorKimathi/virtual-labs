import type { LocalizedText } from "../../workbench/workbench.types";
import { allChemKinds, type ChemKind } from "../data/kinds";
import { reagents } from "../data/reagents";
import type {
  ChemPart,
  ChemState,
  Contents,
  IncidentKind,
} from "../chemistry.types";
import {
  amountOf,
  emptyContents,
  merge,
  mix,
  molarity,
  phOf,
  takeFraction,
  tidy,
  totalVolume,
} from "./contents";
import { heatLiquid, ignite } from "./heating";
import { createIncident } from "./incidents";
import { absorbGas, react, type ReactionEvent } from "./reactions";
import { gasInfo, type GasId } from "./species";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

export const partByNum = (state: ChemState, num: number) =>
  state.parts.find((part) => part.num === num);

export function replacePart(state: ChemState, next: ChemPart): ChemState {
  return {
    ...state,
    parts: state.parts.map((part) => (part.id === next.id ? next : part)),
  };
}

export function overlaps(a: ChemPart, b: ChemPart) {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

export function partsOver(
  state: { parts: ChemPart[] },
  part: ChemPart,
  kinds: ChemKind[],
) {
  return state.parts.filter(
    (other) =>
      other.id !== part.id &&
      kinds.includes(other.kind) &&
      overlaps(part, other),
  );
}

export const conditionIndex = (kind: ChemKind) =>
  allChemKinds.indexOf(kind) + 1;

export function wearing(parts: ChemPart[], kind: ChemKind) {
  return parts.some((part) => part.kind === kind && part.params.worn === 1);
}

export function addIncident(
  state: ChemState,
  kind: IncidentKind,
  vessel?: number,
  options: { resolved?: boolean; text?: LocalizedText } = {},
): ChemState {
  const incident = createIncident(
    `incident-${state.nextId}`,
    kind,
    vessel,
    options,
  );
  return {
    ...state,
    incidents: [...state.incidents, incident],
    nextId: state.nextId + 1,
  };
}

function withNote(contents: Contents, note: LocalizedText): Contents {
  return { ...contents, notes: [...contents.notes, note].slice(-6) };
}

/** True when this vessel stands inside a fume cupboard. */
export const insideFumeCupboard = (state: ChemState, part: ChemPart) =>
  partsOver(state, part, ["fume-cupboard"]).length > 0;

function hasDeliveryTube(state: ChemState, vessel: ChemPart) {
  return state.parts.some(
    (part) => part.kind === "delivery-tube" && part.params.from === vessel.num,
  );
}

function routeGas(
  state: ChemState,
  vessel: ChemPart,
  events: ReactionEvent[],
  now: number,
): ChemState {
  let next = state;
  const tubes = state.parts.filter(
    (part) =>
      part.kind === "delivery-tube" &&
      part.params.from === vessel.num &&
      part.params.to > 0,
  );
  for (const event of events) {
    if (event.type !== "gas") continue;
    for (const tube of tubes) {
      const target = partByNum(next, tube.params.to);
      if (!target?.vessel) continue;
      next = replacePart(next, {
        ...target,
        contents: absorbGas(target.contents, event.gas, event.mmol, now),
      });
    }
  }
  return next;
}

function toxicGas(events: ReactionEvent[]): GasId | null {
  for (const event of events) if (event.type === "toxic") return event.gas;
  return null;
}

function applyReaction(
  state: ChemState,
  vessel: ChemPart,
  contents: Contents,
  now: number,
): ChemState {
  const reacted = react(contents, now);
  const gassing = reacted.events.some((event) => event.type === "gas");
  let next = replacePart(state, {
    ...vessel,
    contents: tidy(reacted.contents),
    params: gassing ? { ...vessel.params, releasedAt: now } : vessel.params,
  });
  next = routeGas(next, vessel, reacted.events, now);
  const toxic = toxicGas(reacted.events);
  if (toxic && !insideFumeCupboard(next, vessel))
    next = addIncident(next, "toxic-fumes", vessel.num, {
      text: t(
        `${gasInfo[toxic].name.en} escaped into the room.`,
        `${gasInfo[toxic].name.sw} ilitoroka ndani ya chumba.`,
      ),
    });
  const sodium = reacted.events.find(
    (event) => event.type === "violent" && event.what === "sodium",
  );
  if (
    sodium &&
    sodium.type === "violent" &&
    (sodium.mmol * 22.99) / 1000 >= 0.4
  )
    next = addIncident(next, "metal-fire", vessel.num);
  return next;
}

const FILM_ML: Partial<Record<ChemKind, number>> = {
  burette: 0.4,
  "volumetric-pipette": 0.2,
  "graduated-pipette": 0.2,
};

export const filmOf = (kind: ChemKind) => FILM_ML[kind] ?? 0.5;

/** Puts an amount of a reagent, or of another vessel's contents, into a vessel. */
export function addFrom(
  state: ChemState,
  targetNum: number,
  sourceNum: number,
  amount: number,
  now: number,
): ChemState {
  const target = partByNum(state, targetNum);
  const source = partByNum(state, sourceNum);
  if (!target?.vessel || !source || target.id === source.id) return state;
  if (target.params.broken === 1) return state;
  if (source.vessel && !reagents[source.kind])
    return transfer(state, sourceNum, targetNum, amount, now);
  const reagent = reagents[source.kind];
  if (!reagent) return state;

  let next = state;
  const goggles = wearing(state.parts, "safety-goggles");
  const gloves =
    wearing(state.parts, "gloves") && wearing(state.parts, "lab-coat");
  const hazard = reagent.hazard(source);
  const tags = reagent.tags(source);

  let ingredient = reagent.pack(source, amount);
  const condition = conditionIndex(source.kind);
  let film = 0;
  let params = target.params;
  if (reagent.unit === "mL" && (target.params.film ?? 0) > 0) {
    if (target.params.cond !== condition) film = target.params.film;
    params = { ...params, film: 0, cond: condition };
  } else if (reagent.unit === "mL") params = { ...params, cond: condition };
  if (film > 0)
    ingredient = { ...ingredient, volume: (ingredient.volume ?? 0) + film };

  const before = target.contents;
  const room = target.vessel.capacity - totalVolume(before);
  const incoming = (ingredient.volume ?? 0) + (ingredient.organic ?? 0);
  let overflow = false;
  if (incoming > room + 1e-9) {
    overflow = true;
    const keep = Math.max(0, room) / incoming;
    ingredient = {
      ...ingredient,
      volume: (ingredient.volume ?? 0) * keep,
      organic: (ingredient.organic ?? 0) * keep,
    };
  }

  // Safety.
  if (hazard >= 2 && !goggles)
    next = addIncident(next, "eye-splash", target.num);
  if (hazard >= 3 && !gloves) next = addIncident(next, "skin-burn", target.num);
  const concentratedBefore = before.volume > 0 && molarity(before, "H") >= 6;
  if (
    concentratedBefore &&
    !reagent.concentrated?.(source) &&
    reagent.unit !== "drops"
  )
    next = addIncident(next, "splash", target.num, {
      resolved: goggles && gloves,
      text:
        goggles && gloves
          ? t(
              "Water was added to concentrated acid and it spat. Your goggles, gloves and coat protected you this time.",
              "Maji yaliongezwa kwenye asidi kali na ikarusha. Miwani, glavu na koti vilikulinda mara hii.",
            )
          : undefined,
    });
  if (overflow) next = addIncident(next, "spill", target.num);

  let merged = mix(before, ingredient);
  if (reagent.concentrated?.(source) && before.volume > 0)
    merged = {
      ...merged,
      temperature: Math.min(
        85,
        merged.temperature + (60 * amount) / (merged.volume + 1),
      ),
    };
  if (
    source.kind === "sodium-metal" &&
    before.volume > 0 &&
    !tags.includes("flammable")
  )
    merged = withNote(
      merged,
      t("Sodium is added to water.", "Sodiamu inaongezwa kwenye maji."),
    );
  const vessel = { ...target, params };
  return applyReaction(next, vessel, merged, now);
}

/** Moves some of one vessel's liquid into another. */
export function transfer(
  state: ChemState,
  fromNum: number,
  toNum: number,
  millilitres: number,
  now: number,
): ChemState {
  const from = partByNum(state, fromNum);
  const to = partByNum(state, toNum);
  if (!from?.vessel || !to?.vessel || from.id === to.id) return state;
  if (to.params.broken === 1 || from.params.broken === 1) return state;
  const available = totalVolume(from.contents);
  if (available <= 1e-9 || millilitres <= 0) return state;
  const room = to.vessel.capacity - totalVolume(to.contents);
  const amount = Math.min(millilitres, available);
  const fits = Math.min(amount, Math.max(0, room));
  const { taken, left } = takeFraction(from.contents, fits / available);
  let next = replacePart(state, { ...from, contents: tidy(left) });
  const wet = to.params.film ?? 0;
  const fromCondition = from.params.cond ?? 0;
  let incoming = taken;
  let params = to.params;
  if (wet > 0 && fits > 0) {
    if (to.params.cond !== fromCondition || fromCondition === 0)
      incoming = { ...incoming, volume: incoming.volume + wet };
    params = { ...params, film: 0, cond: fromCondition };
  }
  if (amount > fits + 1e-9) next = addIncident(next, "spill", to.num);
  const merged = merge(to.contents, incoming);
  return applyReaction(next, { ...to, params }, merged, now);
}

/** Empties a vessel into a waste container, or down the sink. */
export function emptyVessel(
  state: ChemState,
  vesselNum: number,
  wasteNum: number,
): ChemState {
  const vessel = partByNum(state, vesselNum);
  if (!vessel?.vessel) return state;
  const c = vessel.contents;
  const ph = phOf(c);
  const heavy = ["Pb", "Ag", "Cu", "Ba", "MnO4", "cuammine"].some(
    (id) => amountOf(c.species, id as keyof Contents["species"]) > 1e-6,
  );
  const organic = c.organic > 0 || amountOf(c.species, "EtOH") > 1e-6;
  const extreme = ph !== null && (ph < 4 || ph > 10);
  const waste = wasteNum > 0 ? partByNum(state, wasteNum) : undefined;
  const label = waste?.params.label ?? -1;
  let wrong = "";
  if (heavy && label !== 1) wrong = "heavy metals";
  else if (!heavy && organic && label !== 2) wrong = "organic liquid";
  else if (!heavy && !organic && extreme && label !== 0)
    wrong = "strong acid or alkali";
  else if (!heavy && !organic && !extreme && label === 1)
    wrong = "harmless liquid";
  let next = replacePart(state, {
    ...vessel,
    contents: emptyContents(),
    params: {
      ...vessel.params,
      film: filmOf(vessel.kind),
      cond: 0,
      stopper: 0,
    },
  });
  if (totalVolume(c) > 0 && wrong)
    next = addIncident(next, "bad-disposal", vessel.num, {
      text: t(
        `Waste containing ${wrong} went ${waste ? "in the wrong container" : "down the sink"}.`,
        `Taka zenye ${wrong} ziliwekwa ${waste ? "kwenye chombo kisicho sahihi" : "kwenye sinki"}.`,
      ),
    });
  if (waste)
    next = replacePart(next, {
      ...waste,
      params: {
        ...waste.params,
        filled: (waste.params.filled ?? 0) + totalVolume(c),
      },
    });
  return next;
}

/** Rinses a vessel, leaving it wet or conditioned with a solution. */
export function rinseVessel(
  state: ChemState,
  vesselNum: number,
  sourceNum: number,
): ChemState {
  const vessel = partByNum(state, vesselNum);
  const source = partByNum(state, sourceNum);
  if (!vessel?.vessel) return state;
  const conditioned =
    !source || source.kind === "distilled-water"
      ? 0
      : source.vessel
        ? (source.params.cond ?? 0)
        : conditionIndex(source.kind);
  return replacePart(state, {
    ...vessel,
    contents: emptyContents(),
    params: {
      ...vessel.params,
      film: conditioned > 0 ? 0 : filmOf(vessel.kind),
      cond: conditioned,
    },
  });
}

export type HeaterOutput = {
  /** Heat reaching the liquid, in watts. */
  watts: number;
  /** The hottest this source can make the liquid. */
  ceiling: number;
  flame: boolean;
  luminous: boolean;
};

export function heaterOutput(part: ChemPart): HeaterOutput | null {
  const p = part.params;
  switch (part.kind) {
    case "bunsen-burner":
      if (p.lit !== 1) return null;
      return p.air >= 0.4
        ? { watts: 130, ceiling: Infinity, flame: true, luminous: false }
        : { watts: 70, ceiling: Infinity, flame: true, luminous: true };
    case "spirit-lamp":
      return p.lit === 1
        ? { watts: 55, ceiling: Infinity, flame: true, luminous: false }
        : null;
    case "hot-plate":
    case "magnetic-stirrer":
      return p.on === 1 && p.power > 0
        ? {
            watts: p.power * 1.6,
            ceiling: Infinity,
            flame: false,
            luminous: false,
          }
        : null;
    case "heating-mantle":
      return p.on === 1 && p.power > 0
        ? {
            watts: p.power * 1.2,
            ceiling: Infinity,
            flame: false,
            luminous: false,
          }
        : null;
    case "sand-bath":
      return p.on === 1 && p.power > 0
        ? {
            watts: p.power * 1.3,
            ceiling: Infinity,
            flame: false,
            luminous: false,
          }
        : null;
    case "water-bath":
      return p.on === 1
        ? { watts: 140, ceiling: p.temp, flame: false, luminous: false }
        : null;
    default:
      return null;
  }
}

/** Heats the contents of a vessel with a heater for some bench seconds. */
export function heatVessel(
  state: ChemState,
  vesselNum: number,
  heaterNum: number,
  seconds: number,
  now: number,
): ChemState {
  const vessel = partByNum(state, vesselNum);
  const heater = partByNum(state, heaterNum);
  if (!vessel?.vessel || !heater || vessel.params.broken === 1) return state;
  const output = heaterOutput(heater);
  if (!output)
    return replacePart(state, {
      ...vessel,
      contents: withNote(
        vessel.contents,
        t("The heater is switched off.", "Kifaa cha kupasha kimezimwa."),
      ),
    });
  const goggles = wearing(state.parts, "safety-goggles");
  const gloves = goggles && wearing(state.parts, "gloves");
  let next = state;
  const c = vessel.contents;

  if (vessel.params.stopper === 1 && !hasDeliveryTube(state, vessel)) {
    next = replacePart(next, {
      ...vessel,
      contents: withNote(
        emptyContents(),
        t("The vessel burst.", "Chombo kilipasuka."),
      ),
      params: { ...vessel.params, broken: 1, stopper: 0 },
    });
    return addIncident(next, "burst", vessel.num, {
      resolved: goggles && gloves,
    });
  }
  const flammable = c.organic > 0 || amountOf(c.species, "EtOH") > 1e-6;
  if (flammable && output.flame) {
    next = replacePart(next, {
      ...vessel,
      contents: withNote(
        c,
        t(
          "The flammable liquid catches fire.",
          "Kimiminika kinachowaka kinashika moto.",
        ),
      ),
      params: { ...vessel.params, burning: 1 },
    });
    return addIncident(next, "fire", vessel.num);
  }

  let contents: Contents;
  if (c.volume > 0) {
    contents = heatLiquid(c, output.watts, seconds, output.ceiling).contents;
    if (contents.temperature >= 99 && !goggles)
      next = addIncident(next, "eye-splash", vessel.num, {
        text: t(
          "Hot liquid spat into your eyes while heating. You were not wearing goggles.",
          "Kioevu moto kilirushwa machoni mwako wakati wa kupasha. Hukuwa umevaa miwani.",
        ),
      });
  } else {
    const lidOn = partsOver(state, vessel, ["crucible-lid"]).length > 0;
    contents = ignite(c, output.watts >= 100, seconds, lidOn).contents;
  }
  if (output.luminous)
    contents = withNote(
      contents,
      t(
        "The yellow flame leaves black soot on the glass.",
        "Mwali wa manjano unaacha masizi meusi kwenye kioo.",
      ),
    );
  return applyReaction(next, vessel, contents, now);
}

/** Lets solids settle, or spins them down in a centrifuge. */
export function settleVessel(state: ChemState, vesselNum: number): ChemState {
  const vessel = partByNum(state, vesselNum);
  if (!vessel?.vessel) return state;
  return replacePart(state, {
    ...vessel,
    contents: withNote(
      { ...vessel.contents, settled: true },
      t("The solid settles at the bottom.", "Kigumu kinatua chini."),
    ),
  });
}

/** Removes a solid from a vessel by decanting or filtering: the liquid goes, the solid stays. */
export function filterInto(
  state: ChemState,
  fromNum: number,
  funnelNum: number,
  toNum: number,
  now: number,
): ChemState {
  const from = partByNum(state, fromNum);
  const funnel = partByNum(state, funnelNum);
  const to = partByNum(state, toNum);
  if (!from?.vessel || !funnel?.vessel || !to?.vessel) return state;
  const c = from.contents;
  const liquid = { ...c, solids: {} as Contents["solids"] };
  const residue: Contents = { ...emptyContents(), solids: { ...c.solids } };
  const room = to.vessel.capacity - totalVolume(to.contents);
  const poured = Math.min(room, totalVolume(liquid));
  const { taken, left } = takeFraction(
    liquid,
    totalVolume(liquid) > 0 ? poured / totalVolume(liquid) : 0,
  );
  let next = replacePart(state, {
    ...from,
    contents: tidy({ ...left, solids: {}, settled: false }),
  });
  next = replacePart(next, {
    ...funnel,
    contents: tidy(merge(funnel.contents, { ...residue, notes: [] })),
  });
  return applyReaction(
    next,
    to,
    merge(to.contents, { ...taken, solids: {} }),
    now,
  );
}

/** Runs off the lower (water) layer of a separating funnel, leaving the oil. */
export function drainAqueous(
  state: ChemState,
  fromNum: number,
  toNum: number,
  millilitres: number,
  now: number,
): ChemState {
  const from = partByNum(state, fromNum);
  const to = partByNum(state, toNum);
  if (!from?.vessel || !to?.vessel || from.id === to.id) return state;
  const c = from.contents;
  if (c.volume <= 1e-9) return state;
  const room = to.vessel.capacity - totalVolume(to.contents);
  const amount = Math.min(millilitres, c.volume, Math.max(0, room));
  const { taken, left } = takeFraction({ ...c, organic: 0 }, amount / c.volume);
  let next = replacePart(state, {
    ...from,
    contents: tidy({ ...left, organic: c.organic }),
  });
  next = applyReaction(next, to, merge(to.contents, taken), now);
  return next;
}
