import {
  Battery,
  Cable,
  Gauge,
  Lightbulb,
  ToggleLeft,
  Activity,
} from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import type { EquipmentKind, PlacedEquipment } from "../equipment.types";

const icons = {
  cell: Battery,
  bulb: Lightbulb,
  switch: ToggleLeft,
  wire: Cable,
  ammeter: Gauge,
  voltmeter: Activity,
} satisfies Record<EquipmentKind, typeof Battery>;

const names = {
  cell: ["Cell", "Seli"],
  bulb: ["Bulb", "Balbu"],
  switch: ["Switch", "Swichi"],
  wire: ["Wire", "Waya"],
  ammeter: ["Ammeter", "Amita"],
  voltmeter: ["Voltmeter", "Voltimita"],
} satisfies Record<EquipmentKind, [string, string]>;

type Props = {
  equipment: PlacedEquipment[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  reason: "webgl-unavailable" | "scene-error";
};

export function WorkbenchFallback({
  equipment,
  selectedId,
  onSelect,
  reason,
}: Props) {
  const { language, tr } = useLanguage();

  return (
    <div className="flex h-full flex-col overflow-auto bg-slate-50 p-5 dark:bg-slate-950">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-extrabold">
          {reason === "webgl-unavailable"
            ? tr("WebGL 2 is unavailable", "WebGL 2 haipatikani")
            : tr("3D renderer stopped", "Michoro ya 3D imesimama")}
        </p>
        <p>
          {reason === "webgl-unavailable"
            ? tr(
                "Chrome could not start 3D graphics. Check that hardware acceleration is enabled, then restart Chrome. You can still use the equipment bench below.",
                "Chrome imeshindwa kuanzisha michoro ya 3D. Hakikisha uharakishaji wa vifaa umewashwa, kisha anzisha Chrome upya. Bado unaweza kutumia benchi ya vifaa hapa chini.",
              )
            : tr(
                "The 3D scene failed after loading. Retry the page; the equipment bench remains available below.",
                "Mwonekano wa 3D umeshindwa baada ya kufunguka. Jaribu ukurasa tena; benchi ya vifaa bado inapatikana hapa chini.",
              )}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 min-h-11 rounded-lg bg-kenya-green px-4 font-bold text-white"
        >
          {tr("Retry 3D", "Jaribu 3D tena")}
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {equipment.map((item) => {
          const Icon = icons[item.kind];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={selectedId === item.id}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 text-sm font-bold dark:bg-slate-900 ${selectedId === item.id ? "border-kenya-green text-kenya-green dark:text-green-400" : "border-slate-200 dark:border-slate-700"}`}
            >
              <Icon className="h-7 w-7" />
              {names[item.kind][language === "en" ? 0 : 1]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
