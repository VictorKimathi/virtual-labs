import type { Contents } from "../chemistry.types";
import type { LocalizedText } from "../../workbench/workbench.types";
import { amountOf, boilingPoint } from "./contents";
import { solidInfo, type SolidId, type SpeciesId } from "./species";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

const SPECIFIC_HEAT = 4.18;
const VESSEL_HEAT_ML = 5;
const LATENT_WATER = 2260;
const LATENT_ETHANOL = 670;
const ETHANOL_MMOL_PER_ML = 17.1;

export type Vapour = { water: number; ethanol: number };

/** Crystallises dissolved salts that no longer fit in the liquid. */
export function crystallise(c: Contents): Contents {
  const species: Partial<Record<SpeciesId, number>> = { ...c.species };
  const solids: Partial<Record<SolidId, number>> = { ...c.solids };
  let formed = false;
  for (const id of Object.keys(solidInfo) as SolidId[]) {
    const info = solidInfo[id];
    if (!info.salt || id === "cuso4anh") continue;
    const gives = info.salt.gives;
    const ions = Object.keys(gives) as SpeciesId[];
    const mmol = Math.min(
      ...ions.map((ion) => amountOf(species, ion) / (gives[ion] ?? 1)),
    );
    if (!Number.isFinite(mmol) || mmol < 1e-7) continue;
    const limit = ((info.salt.solubility * c.volume) / 100 / info.molar) * 1000;
    const excess = c.volume < 0.05 ? mmol : mmol - limit;
    if (excess < 1e-7) continue;
    for (const ion of ions)
      species[ion] = amountOf(species, ion) - excess * (gives[ion] ?? 1);
    solids[id] = amountOf(solids, id) + excess;
    formed = true;
  }
  return formed
    ? {
        ...c,
        species,
        solids,
        notes: [
          ...c.notes,
          t(
            "Crystals form as the liquid evaporates.",
            "Fuwele zinaundwa kioevu kinapovukiza.",
          ),
        ].slice(-6),
      }
    : c;
}

/**
 * Warms a liquid with a source of the given power, boiling some of it away
 * once it reaches its boiling point. `ceiling` is the hottest the source can
 * make it, as for a water bath.
 */
export function heatLiquid(
  c: Contents,
  watts: number,
  seconds: number,
  ceiling = Infinity,
): { contents: Contents; vapour: Vapour } {
  const vapour: Vapour = { water: 0, ethanol: 0 };
  if (c.volume <= 0) return { contents: c, vapour };
  let energy = watts * seconds;
  let temperature = c.temperature;
  let volume = c.volume;
  const species = { ...c.species };
  const notes = [...c.notes];
  const capacity = (extra = 0) =>
    SPECIFIC_HEAT * (volume + VESSEL_HEAT_ML + extra);
  const point = Math.min(boilingPoint({ ...c, species, volume }), ceiling);
  if (temperature < point) {
    const need = capacity() * (point - temperature);
    if (energy <= need) {
      temperature += energy / capacity();
      energy = 0;
    } else {
      temperature = point;
      energy -= need;
    }
  }
  if (
    energy > 0 &&
    temperature >= Math.min(point, ceiling) &&
    ceiling >= point
  ) {
    const ethanolMl = amountOf(species, "EtOH") / ETHANOL_MMOL_PER_ML;
    if (ethanolMl > 0 && point < 90) {
      const boiled = Math.min(ethanolMl, energy / LATENT_ETHANOL);
      vapour.ethanol += boiled;
      species.EtOH = amountOf(species, "EtOH") - boiled * ETHANOL_MMOL_PER_ML;
      volume -= boiled;
      notes.push(
        t(
          "The ethanol boils at about 78 °C.",
          "Ethanoli inachemka kwa takriban 78 °C.",
        ),
      );
      if (boiled >= ethanolMl - 1e-9) temperature = 100;
    } else {
      const boiled = Math.min(volume, energy / LATENT_WATER);
      vapour.water += boiled;
      volume -= boiled;
      if (boiled > 0.01)
        notes.push(
          t(
            "The liquid boils and some turns to steam.",
            "Kioevu kinachemka na sehemu inakuwa mvuke.",
          ),
        );
    }
  }
  const next: Contents = {
    ...c,
    volume: Math.max(0, volume),
    species,
    temperature,
    notes: notes.slice(-6),
    indicator: volume <= 1e-6 ? null : c.indicator,
  };
  return { contents: crystallise(next), vapour };
}

export type IgnitionResult = {
  contents: Contents;
  flash: boolean;
  steam: boolean;
};

/** Strong heating of solids in a crucible or tube. */
export function ignite(
  c: Contents,
  strong: boolean,
  seconds: number,
  lidOn: boolean,
): IgnitionResult {
  const solids: Partial<Record<SolidId, number>> = { ...c.solids };
  const notes = [...c.notes];
  let flash = false;
  let steam = false;
  const mg = amountOf(solids, "mg");
  if (mg > 0 && strong) {
    const burned = mg * Math.min(1, (seconds / 8) * (lidOn ? 0.4 : 1));
    solids.mg = mg - burned;
    solids.mgo = amountOf(solids, "mgo") + burned;
    flash = burned > 0;
    notes.push(
      t(
        "The magnesium burns with a dazzling white flame and leaves a white ash.",
        "Magnesiamu inawaka kwa mwali mweupe unaong'aa na kuacha jivu jeupe.",
      ),
    );
  }
  const cu = amountOf(solids, "cu");
  if (cu > 0 && strong) {
    const oxidised = cu * Math.min(0.6, seconds / 40);
    solids.cu = cu - oxidised;
    solids.cuo = amountOf(solids, "cuo") + oxidised;
    notes.push(
      t(
        "The copper turns black on the surface.",
        "Shaba inakuwa nyeusi juu yake.",
      ),
    );
  }
  const crystals = amountOf(solids, "cuso4s");
  if (crystals > 0 && strong && seconds >= 10) {
    solids.cuso4s = 0;
    solids.cuso4anh = amountOf(solids, "cuso4anh") + crystals;
    steam = true;
    notes.push(
      t(
        "The blue crystals turn white and drops of water form on the cool glass.",
        "Fuwele za bluu zinakuwa nyeupe na matone ya maji yanaundwa kwenye kioo baridi.",
      ),
    );
  }
  return { contents: { ...c, solids, notes: notes.slice(-6) }, flash, steam };
}
