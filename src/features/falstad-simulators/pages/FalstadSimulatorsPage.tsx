import { ExternalLink } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { EmbeddedSimulation } from "../../../shared/ui/EmbeddedSimulation";
import { CircuitPresetSelect } from "../components/CircuitPresetSelect";
import { SimulatorPicker } from "../components/SimulatorPicker";
import { CIRCUITJS_SOURCE_URL, FALSTAD_HOME_URL } from "../falstad.config";
import { buildSimulatorUrl } from "../falstad.urls";
import { useFalstadSelection } from "../hooks/useFalstadSelection";

const linkClass = "font-bold underline";

export default function FalstadSimulatorsPage() {
  const { language, tr } = useLanguage();
  const { simulator, preset, selectSimulator, selectPreset } =
    useFalstadSelection();
  const src = buildSimulatorUrl(simulator, preset);
  const title = language === "en" ? simulator.title.en : simulator.title.sw;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("Falstad circuits & waves", "Mizunguko na mawimbi ya Falstad")}
        </h1>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
          {tr(
            "Free circuit and wave simulators by Paul Falstad. Pick one, then experiment: everything runs live in your browser.",
            "Viigaji vya bure vya sakiti na mawimbi na Paul Falstad. Chagua kimoja kisha ujaribu: kila kitu kinaendeshwa moja kwa moja kwenye kivinjari chako.",
          )}
        </p>
      </div>

      <SimulatorPicker selectedId={simulator.id} onSelect={selectSimulator} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {simulator.hasPresets && preset && (
            <CircuitPresetSelect
              selectedFile={preset.file}
              onSelect={selectPreset}
            />
          )}
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold dark:border-slate-700"
          >
            {tr("Open on Falstad", "Fungua kwenye Falstad")}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <EmbeddedSimulation key={src} title={title} src={src} />

      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {tr("Simulators by ", "Viigaji na ")}
        <a
          href={FALSTAD_HOME_URL}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          Paul Falstad
        </a>
        {tr(
          ", shown unmodified from falstad.com. The circuit simulator is open source (GPL-2.0): ",
          ", vinaonyeshwa bila mabadiliko kutoka falstad.com. Kiigaji cha sakiti ni chanzo huria (GPL-2.0): ",
        )}
        <a
          href={CIRCUITJS_SOURCE_URL}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {tr("source code", "msimbo chanzo")}
        </a>
        .
      </p>
    </div>
  );
}
