import { useLanguage } from "../../../app/useLanguage";
import { biologyEquipment } from "../equipment.data";
import type { PlacedBiologyEquipment } from "../equipment.types";

type Props = {
  equipment: PlacedBiologyEquipment[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  reason: "webgl-unavailable" | "scene-error";
};

export function BiologyFallback({
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
          {tr(
            "You can still add and inspect biology equipment here. Enable graphics acceleration in Chrome if needed, then retry 3D.",
            "Bado unaweza kuongeza na kukagua vifaa vya Biolojia hapa. Washa uharakishaji wa michoro kwenye Chrome ikihitajika, kisha jaribu 3D tena.",
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
          const definition = biologyEquipment.find(
            (entry) => entry.kind === item.kind,
          );
          if (!definition) return null;
          const Icon = definition.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={selectedId === item.id}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 text-sm font-bold dark:bg-slate-900 ${selectedId === item.id ? "border-kenya-green text-kenya-green dark:text-green-400" : "border-slate-200 dark:border-slate-700"}`}
            >
              <Icon className="h-7 w-7" />
              {language === "en" ? definition.en : definition.sw}
            </button>
          );
        })}
      </div>
    </div>
  );
}
