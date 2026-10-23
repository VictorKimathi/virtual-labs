export const ACID_CONCENTRATION = 0.1;
export const FLASK_VOLUME = 25;
export const BURETTE_CAPACITY = 50;

const unknownConcentrations = [0.08, 0.09, 0.11, 0.12, 0.15] as const;

export function unknownConcentration(attempt: number) {
  return unknownConcentrations[attempt % unknownConcentrations.length];
}

export function equivalenceVolume(baseConcentration: number) {
  return (baseConcentration * FLASK_VOLUME) / ACID_CONCENTRATION;
}

export function phAfterAdding(baseConcentration: number, volume: number) {
  const baseMoles = baseConcentration * FLASK_VOLUME;
  const acidMoles = ACID_CONCENTRATION * volume;
  const total = FLASK_VOLUME + volume;
  const excess = acidMoles - baseMoles;
  if (Math.abs(excess) < 1e-9) return 7;
  const ph =
    excess > 0 ? -Math.log10(excess / total) : 14 + Math.log10(-excess / total);
  return Math.min(13.4, Math.max(0.6, ph));
}

export function titreConcentration(titre: number) {
  return (ACID_CONCENTRATION * titre) / FLASK_VOLUME;
}
