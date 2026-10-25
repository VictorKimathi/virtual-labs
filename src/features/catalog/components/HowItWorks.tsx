import { CheckCircle2, KeyRound } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { getSubject, labs } from "../data/catalog";
import { FeatureRail } from "./FeatureRail";
import { section, sectionHeading } from "./landing.styles";

const assigned = labs.filter((lab) => lab.available).slice(0, 4);

/** From a teacher's class to marked lab work, beside a sample class. */
export function HowItWorks() {
  const { language, tr } = useLanguage();
  const steps = [
    {
      title: tr("Teachers create a class", "Walimu wanaunda darasa"),
      text: tr(
        "Set up a class in a minute and assign the lab experiments you want done.",
        "Unda darasa kwa dakika moja na utoe majaribio ya maabara unayotaka yafanywe.",
      ),
    },
    {
      title: tr("Students join with a code", "Wanafunzi wanajiunga kwa msimbo"),
      text: tr(
        "No email needed. Students type the class code and start straight away.",
        "Hakuna barua pepe. Wanafunzi wanaandika msimbo wa darasa na kuanza mara moja.",
      ),
    },
    {
      title: tr("Work is handed in", "Kazi inakabidhiwa"),
      text: tr(
        "Results come back to the teacher to review, with feedback for every student.",
        "Matokeo yanarudi kwa mwalimu kukagua, pamoja na maoni kwa kila mwanafunzi.",
      ),
    },
  ];
  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className={`${section} scroll-mt-28 py-16 lg:py-30`}
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <div className="flex h-112 items-center justify-center rounded-4xl border border-stone-200/60 bg-linear-to-br from-stone-100 to-stone-200 p-6 shadow-sm sm:p-8 lg:h-175 dark:border-stone-800/60 dark:from-stone-900 dark:to-stone-950">
          <div className="w-full max-w-md rounded-2xl border border-stone-200/40 bg-white p-6 shadow-xl dark:border-stone-700/40 dark:bg-stone-900">
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="text-sm font-bold">
                {tr("Form 3 Science", "Kidato cha 3 Sayansi")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold tabular-nums dark:bg-stone-800">
                <KeyRound className="size-3.5" aria-hidden="true" />
                K7Q2
              </span>
            </div>
            <ul className="space-y-2">
              {assigned.map((lab, index) => {
                const subject = getSubject(lab.subject);
                return (
                  <li
                    key={lab.id}
                    className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    {subject && (
                      <span className={subject.colorClass}>
                        <SubjectIcon icon={subject.icon} className="size-5" />
                      </span>
                    )}
                    <span className="flex-1 font-medium">
                      {language === "en" ? lab.title : lab.titleSw}
                    </span>
                    {index < 2 && (
                      <CheckCircle2
                        className="size-5 text-kenya-green dark:text-green-400"
                        aria-label={tr("Handed in", "Imekabidhiwa")}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="max-w-lg">
          <h2 id="how-heading" className={`mb-12 ${sectionHeading}`}>
            {tr("Built for classrooms.", "Imeundwa kwa madarasa.")}
          </h2>
          <FeatureRail items={steps} />
        </div>
      </div>
    </section>
  );
}
