/** Bench seconds that pass for each real second, for each speed choice. */
export const speeds = [1, 60, 600, 3600, 86400] as const;

export const speedLabels = [
  { en: "Real time", sw: "Muda halisi" },
  { en: "1 min / s", sw: "Dak 1 / s" },
  { en: "10 min / s", sw: "Dak 10 / s" },
  { en: "1 hour / s", sw: "Saa 1 / s" },
  { en: "1 day / s", sw: "Siku 1 / s" },
];

/** Bench time as "Day 2 · 04:15:30". */
export function formatBenchTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  const days = Math.floor(whole / 86400);
  const rest = whole - days * 86400;
  const hours = Math.floor(rest / 3600);
  const minutes = Math.floor((rest % 3600) / 60);
  const secs = rest % 60;
  const clock = [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  return days > 0 ? `Day ${days + 1} · ${clock}` : clock;
}

/** A length of bench time in friendly units. */
export function formatSpan(seconds: number) {
  if (seconds < 120) return `${Math.round(seconds)} s`;
  if (seconds < 7200) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 172800) return `${(seconds / 3600).toFixed(1)} h`;
  return `${(seconds / 86400).toFixed(1)} days`;
}
