import { FileText, Share2, UserRound } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { statusLabel, statusTone } from "../classroom.format";
import type { Assignment, Student, Submission } from "../classroom.types";
import { ReviewForm } from "./ReviewForm";
import { badge, badgeTones, card, sectionTitle } from "./styles";

type Props = {
  classId: string;
  student: Student | undefined;
  assignments: Assignment[];
  submissions: Submission[];
  reviewer: string;
};

/** Everything one student has done in the class, with a review form for each piece. */
export function StudentWorkPanel({
  classId,
  student,
  assignments,
  submissions,
  reviewer,
}: Props) {
  const { tr } = useLanguage();
  if (!student) {
    return (
      <EmptyState
        icon={UserRound}
        title={tr(
          "Choose a student to see their work",
          "Chagua mwanafunzi kuona kazi yake",
        )}
      />
    );
  }
  return (
    <section className={card} aria-labelledby="student-work-heading">
      <h2 id="student-work-heading" className={sectionTitle}>
        {tr(`${student.nickname}'s work`, `Kazi ya ${student.nickname}`)}
      </h2>
      {assignments.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {tr(
            "Assign something to see work here.",
            "Toa kazi ili kuona kazi hapa.",
          )}
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {assignments.map((assignment) => {
            const work = submissions.find(
              (item) =>
                item.assignmentId === assignment.id &&
                item.studentId === student.id,
            );
            return (
              <li
                key={assignment.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold">{assignment.title}</h3>
                  <span className="flex flex-wrap gap-1.5">
                    {work?.shared && (
                      <span className={`${badge} ${badgeTones.blue}`}>
                        <Share2 className="size-3.5" aria-hidden="true" />
                        {tr("Shared", "Imeshirikiwa")}
                      </span>
                    )}
                    <span
                      className={`${badge} ${badgeTones[work ? statusTone(work.status) : "slate"]}`}
                    >
                      {work
                        ? statusLabel(work.status, tr)
                        : tr("Not started", "Haijaanzwa")}
                    </span>
                  </span>
                </div>
                {work ? (
                  <>
                    <p className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm leading-6 dark:bg-slate-950">
                      {work.answer || (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <FileText className="size-4" aria-hidden="true" />
                          {tr(
                            "No written answer yet.",
                            "Bado hakuna jibu la maandishi.",
                          )}
                        </span>
                      )}
                    </p>
                    <ReviewForm
                      key={`${work.id}:${work.feedback ?? ""}`}
                      classId={classId}
                      submission={work}
                      reviewer={reviewer}
                    />
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
