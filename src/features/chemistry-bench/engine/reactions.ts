import type { Contents, GasEvent } from "../chemistry.types";
import type { LocalizedText } from "../../workbench/workbench.types";
import { solidInfo, type GasId, type SolidId, type SpeciesId } from "./species";

export type ReactionEvent =
  | { type: "gas"; gas: GasId; mmol: number }
  | { type: "precipitate"; solid: SolidId }
  | { type: "warm"; delta: number }
  | { type: "toxic"; gas: GasId }
  | { type: "violent"; what: "sodium" | "peroxide"; mmol: number };

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

type Precipitation = {
  solid: SolidId;
  cation: SpeciesId;
  cations: number;
  anion: SpeciesId;
  anions: number;
  ksp: number;
};

const precipitations: Precipitation[] = [
  {
    solid: "agcl",
    cation: "Ag",
    cations: 1,
    anion: "Cl",
    anions: 1,
    ksp: 1.8e-10,
  },
  {
    solid: "agi",
    cation: "Ag",
    cations: 1,
    anion: "I",
    anions: 1,
    ksp: 8.5e-17,
  },
  {
    solid: "ag2o",
    cation: "Ag",
    cations: 2,
    anion: "OH",
    anions: 2,
    ksp: 2e-8,
  },
  {
    solid: "baso4",
    cation: "Ba",
    cations: 1,
    anion: "SO4",
    anions: 1,
    ksp: 1.1e-10,
  },
  {
    solid: "baco3",
    cation: "Ba",
    cations: 1,
    anion: "CO3",
    anions: 1,
    ksp: 2.6e-9,
  },
  {
    solid: "pbcl2",
    cation: "Pb",
    cations: 1,
    anion: "Cl",
    anions: 2,
    ksp: 1.7e-5,
  },
  {
    solid: "pbso4",
    cation: "Pb",
    cations: 1,
    anion: "SO4",
    anions: 1,
    ksp: 2.5e-8,
  },
  {
    solid: "pbi2",
    cation: "Pb",
    cations: 1,
    anion: "I",
    anions: 2,
    ksp: 9.8e-9,
  },
  {
    solid: "pboh2",
    cation: "Pb",
    cations: 1,
    anion: "OH",
    anions: 2,
    ksp: 1.4e-15,
  },
  {
    solid: "cuoh2",
    cation: "Cu",
    cations: 1,
    anion: "OH",
    anions: 2,
    ksp: 2.2e-20,
  },
  {
    solid: "znoh2",
    cation: "Zn",
    cations: 1,
    anion: "OH",
    anions: 2,
    ksp: 3e-17,
  },
  {
    solid: "mgoh2",
    cation: "Mg",
    cations: 1,
    anion: "OH",
    anions: 2,
    ksp: 5.6e-12,
  },
  {
    solid: "feoh2",
    cation: "Fe2",
    cations: 1,
    anion: "OH",
    anions: 2,
    ksp: 4.9e-17,
  },
  {
    solid: "feoh3",
    cation: "Fe3",
    cations: 1,
    anion: "OH",
    anions: 3,
    ksp: 2.8e-39,
  },
  {
    solid: "caco3",
    cation: "Ca",
    cations: 1,
    anion: "CO3",
    anions: 1,
    ksp: 3.4e-9,
  },
];

type AcidSolid = { solid: SolidId; gives: SpeciesId; acid: number };

const acidSoluble: AcidSolid[] = [
  { solid: "cuoh2", gives: "Cu", acid: 2 },
  { solid: "znoh2", gives: "Zn", acid: 2 },
  { solid: "mgoh2", gives: "Mg", acid: 2 },
  { solid: "feoh2", gives: "Fe2", acid: 2 },
  { solid: "feoh3", gives: "Fe3", acid: 3 },
  { solid: "pboh2", gives: "Pb", acid: 2 },
  { solid: "ag2o", gives: "Ag", acid: 2 },
  { solid: "mgo", gives: "Mg", acid: 2 },
  { solid: "cuo", gives: "Cu", acid: 2 },
];

/** Metals from most to least reactive, with the ion each one forms. */
const reactivity: { solid: SolidId; ion: SpeciesId; charge: number }[] = [
  { solid: "mg", ion: "Mg", charge: 2 },
  { solid: "zn", ion: "Zn", charge: 2 },
  { solid: "znp", ion: "Zn", charge: 2 },
  { solid: "fe", ion: "Fe2", charge: 2 },
  { solid: "pb", ion: "Pb", charge: 2 },
  { solid: "cu", ion: "Cu", charge: 2 },
  { solid: "ag", ion: "Ag", charge: 1 },
];

const rank = (ion: SpeciesId) => {
  const order: SpeciesId[] = ["Mg", "Zn", "Fe2", "Pb", "Cu", "Ag"];
  return order.indexOf(ion);
};

const depositOf: Partial<Record<SpeciesId, SolidId>> = {
  Zn: "zn",
  Fe2: "fe",
  Pb: "pb",
  Cu: "cu",
  Ag: "ag",
};

const SPECIFIC_HEAT = 4.18;
const VESSEL_HEAT_ML = 5;

const metalRate: Record<string, { rate: number; ion: SpeciesId }> = {
  mg: { rate: 0.25, ion: "Mg" },
  zn: { rate: 0.05, ion: "Zn" },
  znp: { rate: 0.3, ion: "Zn" },
  fe: { rate: 0.01, ion: "Fe2" },
};

const carbonateRate: Record<string, number> = {
  marble: 0.04,
  caco3: 0.25,
  baco3: 0.25,
};

function temperatureFactor(celsius: number) {
  return 2 ** ((celsius - 20) / 10);
}

/** Gives the amount of an entry in a record that may be missing. */
const get = <K extends string>(record: Partial<Record<K, number>>, id: K) =>
  record[id] ?? 0;

/**
 * Runs the reactions that follow from what is in a vessel. Reactions finish
 * straight away; gas is released over time, which the events describe.
 */
export function react(
  start: Contents,
  now: number,
): { contents: Contents; events: ReactionEvent[] } {
  const species: Partial<Record<SpeciesId, number>> = { ...start.species };
  const solids: Partial<Record<SolidId, number>> = { ...start.solids };
  const events: ReactionEvent[] = [];
  const gas: GasEvent[] = [...start.gas];
  const notes: LocalizedText[] = [...start.notes];
  let heat = 0;
  let volume = start.volume;
  let settled = start.settled;

  const sp = (id: SpeciesId) => get(species, id);
  const so = (id: SolidId) => get(solids, id);
  const addSp = (id: SpeciesId, by: number) => {
    species[id] = Math.max(0, sp(id) + by);
  };
  const addSo = (id: SolidId, by: number) => {
    solids[id] = Math.max(0, so(id) + by);
  };
  const note = (en: string, sw: string) => {
    if (!notes.some((item) => item.en === en)) notes.push(t(en, sw));
  };
  const release = (gasId: GasId, mmol: number, rate: number) => {
    if (mmol < 1e-7) return;
    gas.push({ gas: gasId, mmol, at: now, rate });
    events.push({ type: "gas", gas: gasId, mmol });
  };
  const temperature = start.temperature;
  const tempFactor = temperatureFactor(temperature);

  for (let pass = 0; pass < 10; pass++) {
    let changed = false;

    // Salts dissolve in water.
    if (volume > 0)
      for (const id of Object.keys(solids) as SolidId[]) {
        const info = solidInfo[id];
        const mmol = so(id);
        if (!info.salt || mmol < 1e-9) continue;
        const grams = (mmol * info.molar) / 1000;
        const limit = (info.salt.solubility * volume) / 100;
        const dissolved = Math.min(grams, limit);
        if (dissolved < 1e-9) continue;
        const dissolvedMmol = (dissolved * 1000) / info.molar;
        addSo(id, -dissolvedMmol);
        for (const ion of Object.keys(info.salt.gives) as SpeciesId[])
          addSp(ion, dissolvedMmol * (info.salt.gives[ion] ?? 0));
        note("The crystals dissolve.", "Fuwele zinayeyuka.");
        changed = true;
      }

    // Sodium reacts violently with water.
    if (volume > 0 && so("na") > 1e-9) {
      const mmol = so("na");
      addSo("na", -mmol);
      addSp("Na", mmol);
      addSp("OH", mmol);
      release("H2", mmol / 2, 1.5);
      heat += mmol * 180;
      events.push({ type: "violent", what: "sodium", mmol });
      note(
        "The sodium skates about, fizzes and the water turns alkaline.",
        "Sodiamu inateleza, inatoa povu na maji yanakuwa ya alikali.",
      );
      changed = true;
    }

    // Metals dissolve in acid and give hydrogen.
    const acidEquivalents = () => sp("H") + sp("AcOH");
    for (const id of Object.keys(metalRate)) {
      const info = metalRate[id];
      const solid = id as SolidId;
      const available = so(solid);
      const acid = acidEquivalents();
      if (available < 1e-9 || acid < 1e-9 || volume <= 0) continue;
      const mmol = Math.min(available, acid / 2);
      const strong = Math.min(sp("H"), mmol * 2);
      addSp("H", -strong);
      addSp("AcOH", -(mmol * 2 - strong));
      addSp("AcO", mmol * 2 - strong);
      addSo(solid, -mmol);
      addSp(info.ion, mmol);
      const strength = Math.max(
        0.01,
        (sp("H") + strong) / volume + 0.1 * (sp("AcOH") / volume),
      );
      const surface = id === "mg" ? 1.5 : 1;
      release("H2", mmol, info.rate * strength ** 0.7 * tempFactor * surface);
      heat += mmol * 150;
      note(
        "Bubbles of a colourless gas are given off and the metal gets smaller.",
        "Viputo vya gesi isiyo na rangi vinatoka na chuma kinapungua.",
      );
      changed = true;
    }
    // Copper dissolves in concentrated nitric acid, giving poisonous nitrogen dioxide.
    if (
      so("cu") > 1e-9 &&
      sp("NO3") > 0 &&
      volume > 0 &&
      sp("H") / volume > 6
    ) {
      const mmol = Math.min(so("cu"), sp("H") / 4);
      addSo("cu", -mmol);
      addSp("Cu", mmol);
      addSp("H", -4 * mmol);
      addSp("NO3", -2 * mmol);
      release("NO2", 2 * mmol, 0.3);
      events.push({ type: "toxic", gas: "NO2" });
      heat += mmol * 200;
      note(
        "A brown poisonous gas is given off and the solution turns blue.",
        "Gesi ya kahawia yenye sumu inatoka na myeyusho unakuwa wa bluu.",
      );
      changed = true;
    }

    // Carbonates and acid give carbon dioxide.
    for (const id of Object.keys(carbonateRate)) {
      const solid = id as SolidId;
      const available = so(solid);
      const acid = acidEquivalents();
      if (available < 1e-9 || acid < 1e-9 || volume <= 0) continue;
      const mmol = Math.min(available, acid / 2);
      const strong = Math.min(sp("H"), mmol * 2);
      addSp("H", -strong);
      addSp("AcOH", -(mmol * 2 - strong));
      addSp("AcO", mmol * 2 - strong);
      addSo(solid, -mmol);
      addSp(solid === "baco3" ? "Ba" : "Ca", mmol);
      const strength = Math.max(0.01, (sp("H") + strong) / volume);
      release("CO2", mmol, carbonateRate[id] * strength ** 0.7 * tempFactor);
      note(
        "It fizzes: a colourless gas is given off.",
        "Inatoa povu: gesi isiyo na rangi inatoka.",
      );
      changed = true;
    }
    if (sp("CO3") > 1e-9 && sp("H") > 1e-9) {
      const mmol = Math.min(sp("CO3"), sp("H") / 2);
      addSp("CO3", -mmol);
      addSp("H", -2 * mmol);
      release("CO2", mmol, 0.6);
      note(
        "It fizzes: a colourless gas is given off.",
        "Inatoa povu: gesi isiyo na rangi inatoka.",
      );
      changed = true;
    }

    // Insoluble bases and oxides dissolve in acid.
    for (const entry of acidSoluble) {
      const available = so(entry.solid);
      if (available < 1e-9 || sp("H") < 1e-9) continue;
      const mmol = Math.min(available, sp("H") / entry.acid);
      addSo(entry.solid, -mmol);
      addSp("H", -entry.acid * mmol);
      addSp(entry.gives, mmol);
      note(
        "The solid dissolves in the acid.",
        "Kigumu kinayeyuka kwenye asidi.",
      );
      changed = true;
    }

    // Neutralisation.
    if (sp("H") > 1e-9 && sp("OH") > 1e-9) {
      const mmol = Math.min(sp("H"), sp("OH"));
      addSp("H", -mmol);
      addSp("OH", -mmol);
      heat += mmol * 57;
      changed = true;
    }
    if (sp("NH3") > 1e-9 && sp("H") > 1e-9) {
      const mmol = Math.min(sp("NH3"), sp("H"));
      addSp("NH3", -mmol);
      addSp("H", -mmol);
      addSp("NH4", mmol);
      heat += mmol * 52;
      changed = true;
    }
    if (sp("AcOH") > 1e-9 && sp("OH") > 1e-9) {
      const mmol = Math.min(sp("AcOH"), sp("OH"));
      addSp("AcOH", -mmol);
      addSp("OH", -mmol);
      addSp("AcO", mmol);
      heat += mmol * 56;
      changed = true;
    }
    if (sp("AcO") > 1e-9 && sp("H") > 1e-9) {
      const mmol = Math.min(sp("AcO"), sp("H"));
      addSp("AcO", -mmol);
      addSp("H", -mmol);
      addSp("AcOH", mmol);
      changed = true;
    }
    if (sp("NH4") > 1e-9 && sp("OH") > 1e-9) {
      const mmol = Math.min(sp("NH4"), sp("OH"));
      addSp("NH4", -mmol);
      addSp("OH", -mmol);
      addSp("NH3", mmol);
      changed = true;
    }
    if (sp("AcOH") > 1e-9 && sp("NH3") > 1e-9) {
      const mmol = Math.min(sp("AcOH"), sp("NH3"));
      addSp("AcOH", -mmol);
      addSp("NH3", -mmol);
      addSp("AcO", mmol);
      addSp("NH4", mmol);
      changed = true;
    }

    // Precipitation.
    if (volume > 0)
      for (const rule of precipitations) {
        const cations = sp(rule.cation);
        const isHydroxide = rule.anion === "OH";
        const supply = isHydroxide ? sp("OH") + sp("NH3") : sp(rule.anion);
        if (cations < 1e-9 || supply < 1e-9) continue;
        const hydroxide = isHydroxide
          ? sp("OH") / volume +
            (sp("NH3") > 0 ? Math.sqrt((1.78e-5 * sp("NH3")) / volume) : 0)
          : sp(rule.anion) / volume;
        const product = (cations / volume) ** 1 * hydroxide ** rule.anions;
        const q =
          rule.solid === "ag2o"
            ? (cations / volume) ** 2 * hydroxide ** 2
            : product;
        if (q <= rule.ksp) continue;
        const mmol = Math.min(cations / rule.cations, supply / rule.anions);
        if (mmol < 1e-8) continue;
        addSp(rule.cation, -mmol * rule.cations);
        if (isHydroxide) {
          const needed = mmol * rule.anions;
          const fromOh = Math.min(sp("OH"), needed);
          addSp("OH", -fromOh);
          addSp("NH3", -(needed - fromOh));
          addSp("NH4", needed - fromOh);
        } else addSp(rule.anion, -mmol * rule.anions);
        addSo(rule.solid, mmol);
        events.push({ type: "precipitate", solid: rule.solid });
        note(
          `A ${precipitateColourWord(rule.solid).en} precipitate forms.`,
          `Mchanga ${precipitateColourWord(rule.solid).sw} unaundwa.`,
        );
        changed = true;
      }

    // Precipitates that dissolve in excess alkali or ammonia.
    if (so("znoh2") > 1e-9 && sp("OH") >= 2 * so("znoh2")) {
      const mmol = so("znoh2");
      addSo("znoh2", -mmol);
      addSp("zincate", mmol);
      addSp("OH", -2 * mmol);
      note(
        "The white precipitate dissolves in excess alkali.",
        "Mchanga mweupe unayeyuka kwenye alikali iliyozidi.",
      );
      changed = true;
    } else if (so("znoh2") > 1e-9 && sp("NH3") >= 4 * so("znoh2")) {
      const mmol = so("znoh2");
      addSo("znoh2", -mmol);
      addSp("zincate", mmol);
      addSp("NH3", -4 * mmol);
      note(
        "The white precipitate dissolves in excess ammonia.",
        "Mchanga mweupe unayeyuka kwenye amonia iliyozidi.",
      );
      changed = true;
    }
    if (so("pboh2") > 1e-9 && sp("OH") >= 2 * so("pboh2")) {
      const mmol = so("pboh2");
      addSo("pboh2", -mmol);
      addSp("plumbite", mmol);
      addSp("OH", -2 * mmol);
      note(
        "The white precipitate dissolves in excess alkali.",
        "Mchanga mweupe unayeyuka kwenye alikali iliyozidi.",
      );
      changed = true;
    }
    if (so("cuoh2") > 1e-9 && sp("NH3") >= 4 * so("cuoh2")) {
      const mmol = so("cuoh2");
      addSo("cuoh2", -mmol);
      addSp("cuammine", mmol);
      addSp("NH3", -4 * mmol);
      note(
        "The pale blue precipitate dissolves in excess ammonia to give a deep blue solution.",
        "Mchanga wa bluu hafifu unayeyuka kwenye amonia iliyozidi na kutoa myeyusho wa bluu iliyokolea.",
      );
      changed = true;
    }

    // A more reactive metal displaces a less reactive one from solution.
    for (const metal of reactivity) {
      const available = so(metal.solid);
      if (available < 1e-9 || volume <= 0) continue;
      for (const ion of ["Zn", "Fe2", "Pb", "Cu", "Ag"] as SpeciesId[]) {
        if (rank(ion) <= rank(metal.ion) || sp(ion) < 1e-9) continue;
        const ionCharge = ion === "Ag" ? 1 : 2;
        const mmol = Math.min(
          so(metal.solid),
          (sp(ion) * ionCharge) / metal.charge,
        );
        if (mmol < 1e-9) continue;
        addSo(metal.solid, -mmol);
        addSp(metal.ion, mmol);
        addSp(ion, -(mmol * metal.charge) / ionCharge);
        const deposit = depositOf[ion];
        if (deposit) addSo(deposit, (mmol * metal.charge) / ionCharge);
        heat += mmol * 200;
        note(
          "A solid is deposited on the metal and the colour of the solution fades.",
          "Kigumu kinakusanyika kwenye chuma na rangi ya myeyusho inafifia.",
        );
        changed = true;
      }
    }

    // Manganate(VII) oxidises iron(II) and hydrogen peroxide.
    if (sp("MnO4") > 1e-9 && sp("Fe2") > 1e-9) {
      const acidic = Math.min(sp("MnO4"), sp("Fe2") / 5, sp("H") / 8);
      if (acidic > 1e-9) {
        addSp("MnO4", -acidic);
        addSp("Fe2", -5 * acidic);
        addSp("H", -8 * acidic);
        addSp("Mn2", acidic);
        addSp("Fe3", 5 * acidic);
        note(
          "The purple colour disappears as the iron(II) is oxidised.",
          "Rangi ya zambarau inatoweka chuma(II) kinapooksidishwa.",
        );
        changed = true;
      } else if (sp("H") < 1e-9) {
        const mmol = Math.min(sp("MnO4"), sp("Fe2") / 3);
        addSp("MnO4", -mmol);
        addSp("Fe2", -3 * mmol);
        addSo("mno2", mmol);
        addSp("Fe3", 3 * mmol);
        note(
          "Without acid a brown solid forms instead of a colourless solution.",
          "Bila asidi kigumu cha kahawia kinaundwa badala ya myeyusho usio na rangi.",
        );
        changed = true;
      }
    }
    if (sp("MnO4") > 1e-9 && sp("H2O2") > 1e-9 && sp("H") > 1e-9) {
      const mmol = Math.min(sp("MnO4") / 2, sp("H2O2") / 5, sp("H") / 6);
      if (mmol > 1e-9) {
        addSp("MnO4", -2 * mmol);
        addSp("H2O2", -5 * mmol);
        addSp("H", -6 * mmol);
        addSp("Mn2", 2 * mmol);
        release("O2", 5 * mmol, 0.4);
        note(
          "The purple colour fades and oxygen bubbles off.",
          "Rangi ya zambarau inafifia na oksijeni inatoka kwa viputo.",
        );
        changed = true;
      }
    }
    if (sp("H2O2") > 1e-9 && sp("I") > 1e-9 && sp("H") > 1e-9) {
      const mmol = Math.min(sp("H2O2"), sp("I") / 2, sp("H") / 2);
      if (mmol > 1e-9) {
        addSp("H2O2", -mmol);
        addSp("I", -2 * mmol);
        addSp("H", -2 * mmol);
        addSp("I2", mmol);
        note(
          "The solution turns brown as iodine is made.",
          "Myeyusho unakuwa wa kahawia iodini inapotengenezwa.",
        );
        changed = true;
      }
    }
    if (so("mno2") > 1e-9 && sp("H2O2") > 1e-9 && volume > 0) {
      const mmol = sp("H2O2");
      const catalyst = Math.min(3, ((so("mno2") * 86.94) / 1000) * 4 + 0.5);
      addSp("H2O2", -mmol);
      release("O2", mmol / 2, 0.08 * catalyst * tempFactor);
      heat += mmol * 50;
      events.push({ type: "violent", what: "peroxide", mmol });
      note(
        "Oxygen bubbles off quickly; the black powder is unchanged.",
        "Oksijeni inatoka haraka; unga mweusi haujabadilika.",
      );
      changed = true;
    }

    if (!changed) break;
  }

  if (heat > 0 && volume > 0) {
    const delta = heat / (SPECIFIC_HEAT * (volume + VESSEL_HEAT_ML));
    events.push({ type: "warm", delta });
    if (delta > 1) note("The mixture gets warm.", "Mchanganyiko unapata joto.");
  }
  volume = Math.max(0, volume);
  settled = settled && events.every((event) => event.type !== "precipitate");
  const contents: Contents = {
    ...start,
    volume,
    species,
    solids,
    gas,
    settled,
    temperature:
      heat > 0 && volume > 0
        ? temperature + heat / (SPECIFIC_HEAT * (volume + VESSEL_HEAT_ML))
        : temperature,
    notes: notes.slice(-6),
  };
  return { contents, events };
}

function precipitateColourWord(solid: SolidId) {
  const words: Partial<Record<SolidId, LocalizedText>> = {
    agcl: t("white", "mweupe"),
    agi: t("yellow", "wa manjano"),
    ag2o: t("brown", "wa kahawia"),
    pbi2: t("yellow", "wa manjano"),
    cuoh2: t("pale blue", "wa bluu hafifu"),
    feoh2: t("dirty green", "wa kijani chafu"),
    feoh3: t("rusty brown", "wa kahawia kama kutu"),
  };
  return words[solid] ?? t("white", "mweupe");
}

/** Gas bubbled into a liquid: carbon dioxide turns limewater milky, then clears it again. */
export function absorbGas(
  c: Contents,
  gas: GasId,
  mmol: number,
  now: number,
): Contents {
  if (gas !== "CO2" || c.volume <= 0 || mmol <= 0) return c;
  const species = { ...c.species };
  const solids = { ...c.solids };
  let rest = mmol;
  const hydroxide = get(species, "OH");
  const used = Math.min(rest, hydroxide / 2);
  species.OH = hydroxide - 2 * used;
  species.CO3 = get(species, "CO3") + used;
  rest -= used;
  const reacted = react({ ...c, species, solids }, now);
  const out = reacted.contents;
  if (reacted.events.some((event) => event.type === "precipitate")) {
    out.notes = [
      ...out.notes,
      t(
        "The limewater turns milky.",
        "Maji ya chokaa yanakuwa meupe kama maziwa.",
      ),
    ].slice(-6);
  }
  if (rest > 1e-9 && get(out.solids, "caco3") > 1e-9) {
    const dissolve = Math.min(rest, get(out.solids, "caco3"));
    out.solids = { ...out.solids, caco3: get(out.solids, "caco3") - dissolve };
    out.species = { ...out.species, Ca: get(out.species, "Ca") + dissolve };
    out.notes = [
      ...out.notes,
      t(
        "With more carbon dioxide the milkiness clears again.",
        "Kaboni dioksaidi ikiongezwa, weupe unatoweka tena.",
      ),
    ].slice(-6);
  }
  return out;
}
