import { useLanguage } from "../../../app/useLanguage";
import { LabShowcase } from "../components/LabShowcase";

export default function WorkbenchTopicsPage() {
  const { tr } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("Virtual labs", "Maabara pepe")}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          {tr(
            "Every KCSE practical, on your screen.",
            "Kila jaribio la KCSE, kwenye skrini yako.",
          )}
        </p>
      </div>
      <LabShowcase />
    </div>
  );
}
