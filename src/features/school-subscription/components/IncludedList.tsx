import { Check } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";

export function IncludedList() {
  const { tr } = useLanguage();
  const items = [
    tr(
      "Guided CBE lessons with before-and-after quizzes",
      "Masomo ya CBE yenye mwongozo na maswali ya kabla na baada",
    ),
    tr(
      "Practice bench: circuits, titration, indicators and separation labs",
      "Benchi la mazoezi: sakiti, titration, viashiria na maabara ya utenganishaji",
    ),
    tr(
      "3D microscope station for biology",
      "Kituo cha darubini cha 3D cha biolojia",
    ),
    tr(
      "Simulations from PhET, Falstad and PhysicsHub",
      "Uigaji kutoka PhET, Falstad na PhysicsHub",
    ),
    tr("English and Kiswahili", "Kiingereza na Kiswahili"),
    tr("Progress and badges for learners", "Maendeleo na beji za wanafunzi"),
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-kenya-green dark:bg-green-950 dark:text-green-300">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium leading-6">{item}</span>
        </li>
      ))}
    </ul>
  );
}
