import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "../../../app/useLanguage";

export type SandboxTab<Id extends string> = {
  id: Id;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
  /** Draws attention to the tab, for example when something needs dealing with. */
  alert?: boolean;
};

type SandboxPanelProps<Id extends string> = {
  tab: Id;
  onTab: (tab: Id) => void;
  tabs: SandboxTab<Id>[];
};

const columns: Record<number, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** The sandbox column: equipment, inspector, experiment and more, stacked behind tabs. */
export function SandboxPanel<Id extends string>({
  tab,
  onTab,
  tabs,
}: SandboxPanelProps<Id>) {
  const { tr } = useLanguage();
  const current = tabs.find((item) => item.id === tab) ?? tabs[0];

  return (
    <aside className="flex h-160 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div
        role="tablist"
        aria-label={tr("Sandbox", "Sanduku la majaribio")}
        className={`grid shrink-0 gap-1 border-b border-slate-200 p-1.5 dark:border-slate-800 ${columns[tabs.length] ?? "grid-cols-3"}`}
      >
        {tabs.map(({ id, label, icon: Icon, alert }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`sandbox-tab-${id}`}
            aria-selected={current.id === id}
            aria-controls="sandbox-panel"
            onClick={() => onTab(id)}
            className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-bold transition-colors ${current.id === id ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
            {alert && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="sandbox-panel"
        aria-labelledby={`sandbox-tab-${current.id}`}
        className="min-h-0 flex-1 overflow-y-auto p-3"
      >
        {current.content}
      </div>
    </aside>
  );
}
