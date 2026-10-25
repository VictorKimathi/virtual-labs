import { CircleCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import type { LocalizedText } from "../workbench.types";

type Gear = { id: string; name: LocalizedText; worn: boolean };
type LoggedIncident = {
  id: string;
  title: LocalizedText;
  text: LocalizedText;
  advice: LocalizedText;
  resolved: boolean;
  feedback?: LocalizedText;
};
type Response = { id: string; name: LocalizedText };

type LabSafetyPanelProps = {
  gear: Gear[];
  incidents: LoggedIncident[];
  responses: Response[];
  accent: "orange" | "green";
  onWear: (id: string) => void;
  onUse: (id: string) => void;
};

const accents = {
  orange: "bg-orange-700 hover:bg-orange-800",
  green: "bg-green-700 hover:bg-green-800",
};

/** Protective clothing, the incident log and the safety equipment to respond with. */
export function LabSafetyPanel({
  gear,
  incidents,
  responses,
  accent,
  onWear,
  onUse,
}: LabSafetyPanelProps) {
  const { language, tr } = useLanguage();
  const open = incidents.filter((incident) => !incident.resolved);
  const newestFirst = [...incidents].reverse();

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {tr("Protective clothing", "Mavazi ya kujikinga")}
        </h2>
        <ul className="mt-2 space-y-2">
          {gear.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                {item.worn ? (
                  <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
                {item.name[language]}
              </span>
              {item.worn ? (
                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                  {tr("Wearing", "Umevaa")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onWear(item.id)}
                  className={`min-h-9 rounded-lg px-3 text-xs font-bold text-white ${accents[accent]}`}
                >
                  {tr("Put on", "Vaa")}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {tr("Incidents", "Matukio")}
        </h2>
        {incidents.length === 0 ? (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800 dark:bg-green-950 dark:text-green-300">
            <CircleCheck className="h-4 w-4 shrink-0" />
            {tr(
              "No incidents so far. Keep working safely.",
              "Hakuna matukio hadi sasa. Endelea kufanya kazi kwa usalama.",
            )}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {newestFirst.map((incident) => (
              <li
                key={incident.id}
                role={incident.resolved ? undefined : "alert"}
                className={`rounded-lg p-3 text-sm leading-5 ${incident.resolved ? "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200"}`}
              >
                <p className="flex items-center justify-between gap-2 font-extrabold">
                  {incident.title[language]}
                  {incident.resolved && (
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">
                      {tr("Dealt with", "Imeshughulikiwa")}
                    </span>
                  )}
                </p>
                <p className="mt-1">{incident.text[language]}</p>
                <p className="mt-1 font-semibold">
                  {incident.advice[language]}
                </p>
                {incident.feedback && !incident.resolved && (
                  <p className="mt-2 rounded-md bg-white/70 p-2 font-bold dark:bg-black/30">
                    {incident.feedback[language]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {open.length > 0 && (
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {tr("Respond", "Chukua hatua")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {tr(
              "Choose the right safety equipment. It is placed on the bench if it is not there yet.",
              "Chagua kifaa sahihi cha usalama. Kinawekwa mezani kama bado hakipo.",
            )}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {responses.map((response) => (
              <button
                key={response.id}
                type="button"
                onClick={() => onUse(response.id)}
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900"
              >
                {response.name[language]}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
