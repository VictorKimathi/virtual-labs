import { Award, BookOpenCheck, Medal, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { labs, subjects } from "../../catalog/data/catalog";

const sampleCompleted = new Set(["plant-cells"]);

export default function ProgressPage() {
  const { language, tr } = useLanguage();
  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-bold text-kenya-green dark:text-green-400">
          {tr("YOUR LEARNING", "MAFUNZO YAKO")}
        </p>
        <h1 className="mt-2 text-3xl font-black">
          {tr("Progress", "Maendeleo")}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {tr(
            "See what you have explored and where to go next.",
            "Ona ulichojifunza na hatua inayofuata.",
          )}
        </p>
        <span className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {tr("Sample learner data", "Takwimu za mfano")}
        </span>
      </div>
      <section aria-labelledby="completed-heading">
        <h2 id="completed-heading" className="mb-4 text-xl font-extrabold">
          {tr("Completed labs by subject", "Maabara zilizokamilika kwa somo")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {subjects.map((subject) => {
            const total = labs.filter(
              (lab) => lab.subject === subject.id,
            ).length;
            const done = labs.filter(
              (lab) =>
                lab.subject === subject.id && sampleCompleted.has(lab.id),
            ).length;
            return (
              <div
                key={subject.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${subject.lightClass} ${subject.colorClass}`}
                >
                  <SubjectIcon icon={subject.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold">
                  {language === "en" ? subject.name : subject.nameSw}
                </h3>
                <p className="mt-1 text-2xl font-black">
                  {done}
                  <span className="text-base font-semibold text-slate-400">
                    {" "}
                    / {total}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr("labs complete", "maabara zimekamilika")}
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-kenya-green ${done === 0 ? "w-0" : "w-1/2"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section
        aria-labelledby="scores-heading"
        className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
      >
        <div className="flex items-start gap-3">
          <BookOpenCheck className="h-6 w-6 text-kenya-green" />
          <div>
            <h2 id="scores-heading" className="text-xl font-extrabold">
              {tr("Assessment scores", "Alama za tathmini")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {tr(
                "Plant Cells · Grade 7 Biology",
                "Seli za Mimea · Gredi ya 7 Biolojia",
              )}
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-5">
          <ScoreBar
            label={tr("Before lab", "Kabla ya maabara")}
            score={40}
            width="w-2/5"
            tone="bg-subject-physics"
          />
          <ScoreBar
            label={tr("After lab", "Baada ya maabara")}
            score={80}
            width="w-4/5"
            tone="bg-kenya-green"
          />
        </div>
        <p className="mt-5 text-sm font-semibold text-kenya-green dark:text-green-400">
          {tr("You improved by 40 points.", "Umeongeza alama 40.")}
        </p>
      </section>
      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="mb-4 text-xl font-extrabold">
          {tr("Achievement badges", "Beji za mafanikio")}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Badge
            icon={<Star className="h-7 w-7" />}
            title={tr("First Lab", "Maabara ya Kwanza")}
            detail={tr("Earned", "Imepatikana")}
            active
          />
          <Badge
            icon={<Medal className="h-7 w-7" />}
            title={tr("Curious Mind", "Akili Dadisi")}
            detail={tr("Next badge", "Beji inayofuata")}
          />
          <Badge
            icon={<Award className="h-7 w-7" />}
            title={tr("Lab Explorer", "Mgunduzi wa Maabara")}
            detail={tr("Next badge", "Beji inayofuata")}
          />
        </div>
      </section>
      <Link
        to="/labs"
        className="inline-flex min-h-12 items-center rounded-xl bg-kenya-green px-5 py-3 text-sm font-bold text-white"
      >
        {tr("Explore more lessons", "Chunguza masomo zaidi")}
      </Link>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  width,
  tone,
}: {
  label: string;
  score: number;
  width: string;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-sm font-bold">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${width} ${tone}`} />
      </div>
    </div>
  );
}
function Badge({
  icon,
  title,
  detail,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex min-h-32 flex-col items-center justify-center rounded-2xl border p-3 text-center ${active ? "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200" : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"}`}
    >
      {icon}
      <p className="mt-2 text-sm font-extrabold leading-4">{title}</p>
      <p className="mt-1 text-xs">{detail}</p>
    </div>
  );
}
