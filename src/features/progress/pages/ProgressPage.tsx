import {
  Award,
  BookOpenCheck,
  Lock,
  Medal,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { SubjectIcon } from "../../../shared/ui/SubjectIcon";
import { labs, subjects } from "../../catalog/data/catalog";
import { portalStyles } from "../../catalog/hero.config";
import { ProgressBar } from "../components/ProgressBar";
import { ProgressRing } from "../components/ProgressRing";

const sampleCompleted = new Set(["plant-cells"]);

function percent(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export default function ProgressPage() {
  const { language, tr } = useLanguage();
  const totalDone = labs.filter((lab) => sampleCompleted.has(lab.id)).length;
  const overall = percent(totalDone, labs.length);
  return (
    <div className="space-y-8">
      <PageHeader
        icon={TrendingUp}
        eyebrow={tr("Your learning", "Mafunzo yako")}
        title={tr("Progress", "Maendeleo")}
        description={tr(
          "See what you have explored and where to go next.",
          "Ona ulichojifunza na hatua inayofuata.",
        )}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProgressRing percent={overall} />
          <div>
            <p className="text-lg font-extrabold">
              {totalDone} / {labs.length}{" "}
              {tr("lessons completed", "masomo yamekamilika")}
            </p>
            <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {tr("Sample learner data", "Takwimu za mfano")}
            </span>
          </div>
        </div>
      </PageHeader>

      <section aria-labelledby="completed-heading">
        <h2 id="completed-heading" className="mb-4 text-xl font-black">
          {tr("Completed labs by subject", "Maabara zilizokamilika kwa somo")}
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {subjects.map((subject) => {
            const total = labs.filter(
              (lab) => lab.subject === subject.id,
            ).length;
            const done = labs.filter(
              (lab) =>
                lab.subject === subject.id && sampleCompleted.has(lab.id),
            ).length;
            const style = portalStyles[subject.id];
            return (
              <div
                key={subject.id}
                className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span
                  aria-hidden="true"
                  className={`absolute -right-10 -top-10 -z-10 size-40 rounded-full blur-3xl ${style.glow}`}
                />
                <span
                  className={`flex size-12 items-center justify-center rounded-2xl ${subject.lightClass} ${subject.colorClass}`}
                >
                  <SubjectIcon icon={subject.icon} className="size-6" />
                </span>
                <h3 className="mt-4 font-extrabold">
                  {language === "en" ? subject.name : subject.nameSw}
                </h3>
                <p className="mt-1 text-3xl font-black">
                  {done}
                  <span className="text-lg font-semibold text-slate-400">
                    {" "}
                    / {total}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr("labs complete", "maabara zimekamilika")}
                </p>
                <ProgressBar
                  percent={percent(done, total)}
                  tone="bg-kenya-green"
                  className="mt-4"
                />
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="scores-heading"
        className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300">
            <BookOpenCheck className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="scores-heading" className="text-xl font-black">
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
          <ScoreRow
            label={tr("Before lab", "Kabla ya maabara")}
            score={40}
            tone="bg-subject-physics"
          />
          <ScoreRow
            label={tr("After lab", "Baada ya maabara")}
            score={80}
            tone="bg-kenya-green"
          />
        </div>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-extrabold text-kenya-green dark:bg-green-950 dark:text-green-300">
          <TrendingUp className="size-4" aria-hidden="true" />
          {tr("You improved by 40 points.", "Umeongeza alama 40.")}
        </p>
      </section>

      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="mb-4 text-xl font-black">
          {tr("Achievement badges", "Beji za mafanikio")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Badge
            icon={<Star className="size-8" />}
            title={tr("First Lab", "Maabara ya Kwanza")}
            detail={tr("Earned", "Imepatikana")}
            earned
          />
          <Badge
            icon={<Medal className="size-8" />}
            title={tr("Curious Mind", "Akili Dadisi")}
            detail={tr("Next badge", "Beji inayofuata")}
          />
          <Badge
            icon={<Award className="size-8" />}
            title={tr("Lab Explorer", "Mgunduzi wa Maabara")}
            detail={tr("Next badge", "Beji inayofuata")}
          />
        </div>
      </section>

      <Link
        to="/labs"
        className="inline-flex min-h-12 items-center rounded-2xl bg-kenya-green px-6 text-sm font-extrabold text-white shadow-lg shadow-kenya-green/25 transition-transform hover:-translate-y-0.5"
      >
        {tr("Explore more lessons", "Chunguza masomo zaidi")}
      </Link>
    </div>
  );
}

function ScoreRow({
  label,
  score,
  tone,
}: {
  label: string;
  score: number;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-sm font-bold">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <ProgressBar percent={score} tone={tone} size="lg" />
    </div>
  );
}

function Badge({
  icon,
  title,
  detail,
  earned = false,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  earned?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-3xl border p-4 text-center ${earned ? "border-yellow-300 bg-linear-to-br from-yellow-50 to-amber-100 text-yellow-800 shadow-lg shadow-yellow-400/20 dark:border-yellow-800 dark:from-yellow-950 dark:to-amber-950 dark:text-yellow-200" : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"}`}
    >
      {!earned && (
        <Lock
          className="absolute right-4 top-4 size-4 text-slate-400"
          aria-hidden="true"
        />
      )}
      <span
        className={`flex size-16 items-center justify-center rounded-full ${earned ? "bg-white/70 dark:bg-black/20" : "bg-slate-200 dark:bg-slate-800"}`}
      >
        {icon}
      </span>
      <p className="mt-3 font-extrabold leading-4">{title}</p>
      <p className="mt-1 text-xs font-semibold">{detail}</p>
    </motion.div>
  );
}
