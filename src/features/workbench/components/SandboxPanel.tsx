import { Boxes, ClipboardList, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "../../../app/useLanguage";

export type PanelTab = "equipment" | "inspector" | "experiment";

type SandboxPanelProps = {
  tab: PanelTab;
  onTab: (tab: PanelTab) => void;
  equipment: ReactNode;
  inspector: ReactNode;
  experiment: ReactNode;
  goalsDone: number;
  goalsTotal: number;
};

/** The sandbox column: equipment, inspector and experiment, stacked behind tabs. */
export function SandboxPanel({
  tab,
  onTab,
  equipment,
  inspector,
  experiment,
  goalsDone,
  goalsTotal,
}: SandboxPanelProps) {
  const { tr } = useLanguage();
  const tabs = [
    { id: "equipment" as const, label: tr("Equipment", "Vifaa"), icon: Boxes },
    {
      id: "inspector" as const,
      label: tr("Inspector", "Ukaguzi"),
      icon: SlidersHorizontal,
    },
    {
      id: "experiment" as const,
      label:
        goalsTotal > 0
          ? `${tr("Experiment", "Jaribio")} ${goalsDone}/${goalsTotal}`
          : tr("Experiment", "Jaribio"),
      icon: ClipboardList,
    },
  ];
  const content = { equipment, inspector, experiment }[tab];

  return (
    <aside className="flex h-160 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div
        role="tablist"
        aria-label={tr("Sandbox", "Sanduku la majaribio")}
        className="grid shrink-0 grid-cols-3 gap-1 border-b border-slate-200 p-1.5 dark:border-slate-800"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`sandbox-tab-${id}`}
            aria-selected={tab === id}
            aria-controls="sandbox-panel"
            onClick={() => onTab(id)}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-bold transition-colors ${tab === id ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="sandbox-panel"
        aria-labelledby={`sandbox-tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto p-3"
      >
        {content}
      </div>
    </aside>
  );
}
