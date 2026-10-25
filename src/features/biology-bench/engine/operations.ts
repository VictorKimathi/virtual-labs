import type { LocalizedText } from "../../workbench/workbench.types";
import type {
  BioIncident,
  BioIncidentKind,
  BioKind,
  BioPart,
  BioRemedy,
  BioState,
  TubeContents,
} from "../biology.types";
import { addTo, advanceTube, ROOM, splitTube, type Ingredient } from "./food";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

export const partByNum = (state: { parts: BioPart[] }, num: number) =>
  state.parts.find((part) => part.num === num);

export function replacePart(state: BioState, next: BioPart): BioState {
  return {
    ...state,
    parts: state.parts.map((part) => (part.id === next.id ? next : part)),
  };
}

export const setParams = (
  state: BioState,
  part: BioPart,
  params: Record<string, number>,
): BioState => {
  const current = state.parts.find((item) => item.id === part.id) ?? part;
  return replacePart(state, {
    ...current,
    params: { ...current.params, ...params },
  });
};

export function overlaps(a: BioPart, b: BioPart) {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

export const partsOver = (
  parts: BioPart[],
  part: BioPart,
  kinds: readonly BioKind[],
) =>
  parts.filter(
    (other) =>
      other.id !== part.id &&
      kinds.includes(other.kind) &&
      overlaps(part, other),
  );

export const hasKind = (parts: BioPart[], kind: BioKind) =>
  parts.some((part) => part.kind === kind);

export const isWearing = (parts: BioPart[], kind: BioKind) =>
  parts.some((part) => part.kind === kind && part.params.worn === 1);

/** Adds a note the student sees on a part. */
export function note(
  state: BioState,
  part: BioPart,
  text: LocalizedText,
): BioState {
  const current = state.parts.find((item) => item.id === part.id) ?? part;
  return replacePart(state, {
    ...current,
    contents: {
      ...current.contents,
      notes: [...current.contents.notes, text].slice(-5),
    },
  });
}

const templates: Record<
  BioIncidentKind,
  {
    title: LocalizedText;
    text: LocalizedText;
    advice: LocalizedText;
    remedies: BioRemedy[];
  }
> = {
  cut: {
    title: t("Cut finger", "Kidole kimekatwa"),
    text: t(
      "The blade slipped and cut a finger.",
      "Kisu kiliteleza na kukata kidole.",
    ),
    advice: t(
      "Cut on a dissecting board, away from your hand. Put blades in the sharps container. Treat the cut with the first aid kit.",
      "Kata kwenye ubao wa upasuaji, mbali na mkono wako. Weka visu kwenye chombo cha vitu vikali. Tibu jeraha kwa sanduku la huduma ya kwanza.",
    ),
    remedies: ["first-aid-kit"],
  },
  "eye-splash": {
    title: t("Chemical in the eye", "Kemikali jichoni"),
    text: t(
      "A hot or harmful liquid splashed into your eyes. You were not wearing goggles.",
      "Kioevu moto au chenye madhara kiliruka machoni mwako. Hukuwa umevaa miwani.",
    ),
    advice: t(
      "Rinse at the eye wash for 15 minutes. Wear goggles when heating tubes or using reagents.",
      "Osha kwenye kituo cha kuosha macho kwa dakika 15. Vaa miwani unapopasha mirija au kutumia vitendanishi.",
    ),
    remedies: ["eye-wash"],
  },
  burn: {
    title: t("Burn", "Kuungua"),
    text: t(
      "Hot steam or a flame burned your hand.",
      "Mvuke moto au mwali ulichoma mkono wako.",
    ),
    advice: t(
      "Cool the burn under running water and use the first aid kit. Wait for the pressure to drop before opening an autoclave.",
      "Poza jeraha chini ya maji yanayotiririka na utumie sanduku la huduma ya kwanza. Subiri shinikizo lishuke kabla ya kufungua otoklevu.",
    ),
    remedies: ["first-aid-kit"],
  },
  biohazard: {
    title: t("Possible infection", "Uwezekano wa maambukizi"),
    text: t(
      "Microorganisms that may be harmful were released.",
      "Vijidudu vinavyoweza kuwa na madhara viliachiliwa.",
    ),
    advice: t(
      "Never open an incubated plate. Wipe the bench with disinfectant and put plates in a biohazard bag.",
      "Kamwe usifungue sahani iliyoatamizwa. Futa benchi kwa dawa ya kuua viini na weka sahani kwenye mfuko wa taka hatari.",
    ),
    remedies: ["disinfectant", "biohazard-bag"],
  },
  "broken-slide": {
    title: t("Slide smashed", "Slaidi imevunjika"),
    text: t(
      "The coarse focus pushed the slide into the high-power lens and the glass cracked.",
      "Lenzi kuu ilisukuma slaidi kwenye lenzi ya nguvu kubwa na kioo kikapasuka.",
    ),
    advice: t(
      "Never use coarse focus on high power: use only fine focus. Put broken glass in the sharps container.",
      "Kamwe usitumie lenzi kuu kwenye nguvu kubwa: tumia lenzi ndogo tu. Weka kioo kilichovunjika kwenye chombo cha vitu vikali.",
    ),
    remedies: ["sharps-container"],
  },
  inhaled: {
    title: t("Insects inhaled", "Wadudu wamevutwa"),
    text: t(
      "You sucked on the pooter without the gauze, and insects came into your mouth.",
      "Ulivuta pooter bila kitambaa cha wavu, na wadudu wakaingia mdomoni.",
    ),
    advice: t(
      "Always check the gauze is over the mouthpiece tube. Rinse your mouth and use the first aid kit.",
      "Hakikisha kila mara wavu umefunika mrija wa mdomo. Suuza mdomo na utumie sanduku la huduma ya kwanza.",
    ),
    remedies: ["first-aid-kit"],
  },
  irritation: {
    title: t("Skin irritation", "Muwasho wa ngozi"),
    text: t(
      "The preserving fluid on the specimen irritated your skin. You were not wearing gloves.",
      "Kimiminika cha kuhifadhi kwenye kielelezo kiliwasha ngozi yako. Hukuwa umevaa glavu.",
    ),
    advice: t(
      "Wear gloves for preserved specimens. Wash your hands and use the first aid kit.",
      "Vaa glavu kwa vielelezo vilivyohifadhiwa. Osha mikono na utumie sanduku la huduma ya kwanza.",
    ),
    remedies: ["first-aid-kit"],
  },
};

export const incidentTitles = Object.fromEntries(
  Object.entries(templates).map(([kind, template]) => [kind, template.title]),
) as Record<BioIncidentKind, LocalizedText>;

export function addIncident(state: BioState, kind: BioIncidentKind): BioState {
  if (
    state.incidents.some(
      (incident) => incident.kind === kind && !incident.resolved,
    )
  )
    return state;
  const template = templates[kind];
  const incident: BioIncident = {
    id: `incident-${state.nextId}`,
    kind,
    text: template.text,
    advice: template.advice,
    remedies: template.remedies,
    resolved: false,
  };
  return {
    ...state,
    incidents: [...state.incidents, incident],
    nextId: state.nextId + 1,
  };
}

/** Clears the incidents that a remedy deals with. */
export function resolveWith(
  state: BioState,
  remedy: BioRemedy,
): { state: BioState; helped: boolean } {
  let helped = false;
  const incidents = state.incidents.map((incident) => {
    if (incident.resolved || !incident.remedies.includes(remedy))
      return incident;
    helped = true;
    return { ...incident, resolved: true };
  });
  return { state: { ...state, incidents }, helped };
}

/** Temperature of a water bath: it moves towards its setting, or back to room temperature, over a few minutes. */
export function bathTemperature(bath: BioPart | undefined, time: number) {
  if (!bath) return ROOM;
  const start = bath.params.startT ?? ROOM;
  const target = bath.params.on === 1 ? (bath.params.set ?? 37) : ROOM;
  return (
    target +
    (start - target) *
      Math.exp(-Math.max(0, time - (bath.params.onAt ?? 0)) / 300)
  );
}

/** The temperature inside a tube: the bath it stands in, or the room. */
export function tubeTemperature(tube: BioPart, parts: BioPart[], time: number) {
  if (tube.params.inBath !== 1) return ROOM;
  return bathTemperature(partByNum({ parts }, tube.params.bath ?? 0), time);
}

/** The tube contents brought up to the present. */
export function currentContents(
  tube: BioPart,
  parts: BioPart[],
  time: number,
): TubeContents {
  return advanceTube(tube.contents, time, tubeTemperature(tube, parts, time));
}

/** Brings a tube up to date before changing it. */
export function settleTube(
  state: BioState,
  tube: BioPart,
  time: number,
): BioPart {
  const current = state.parts.find((item) => item.id === tube.id) ?? tube;
  return { ...current, contents: currentContents(current, state.parts, time) };
}

export function addToTube(
  state: BioState,
  tube: BioPart,
  ingredient: Ingredient,
  time: number,
  capacity: number,
): BioState {
  const settled = settleTube(state, tube, time);
  const room = Math.max(0, capacity - settled.contents.volume);
  const scale =
    ingredient.volume > room && ingredient.volume > 0
      ? room / ingredient.volume
      : 1;
  const items: Ingredient["items"] = {};
  for (const [id, value] of Object.entries(ingredient.items))
    items[id as keyof Ingredient["items"]] = (value ?? 0) * scale;
  let contents = addTo(settled.contents, {
    volume: ingredient.volume * scale,
    items,
  });
  if (scale < 1)
    contents = {
      ...contents,
      notes: [
        ...contents.notes,
        t(
          "The tube is full, so the rest overflowed.",
          "Mrija umejaa, kwa hiyo kilichobaki kilimwagika.",
        ),
      ].slice(-5),
    };
  return replacePart(state, { ...settled, contents });
}

/** Pours some of one tube into another. */
export function pourTube(
  state: BioState,
  from: BioPart,
  to: BioPart,
  millilitres: number,
  time: number,
  capacity: number,
): BioState {
  const source = settleTube(state, from, time);
  if (source.contents.volume <= 0) return state;
  const fraction = Math.min(1, millilitres / source.contents.volume);
  const { taken, left } = splitTube(source.contents, fraction);
  const next = replacePart(state, { ...source, contents: left });
  const target = partByNum(next, to.num);
  return target
    ? addToTube(
        next,
        target,
        { volume: taken.volume, items: taken.items },
        time,
        capacity,
      )
    : next;
}
