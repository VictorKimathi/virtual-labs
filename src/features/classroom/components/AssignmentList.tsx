import { ClipboardList, FlaskConical, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { deleteAssignment } from "../classroom.api";
import type { Assignment, Student, Submission } from "../classroom.types";
import { findActivity } from "../data/activities";
import { useAction } from "../hooks/useAction";
import { ConfirmButton } from "./ConfirmButton";
import { ActionFeedback } from "./StatusPanels";
import { badge, badgeTones } from "./styles";

type Props = {
  classId: string;
  assignments: Assignment[];
  students: Student[];
  submissions: Submission[];
};

export function AssignmentList({
  classId,
  assignments,
  students,
  submissions,
}: Props) {
  const { language, tr } = useLanguage();
  const action = useAction("classroom-delete-assignment");
  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={tr("Nothing assigned yet", "Bado hakuna kazi iliyotolewa")}
      />
    );
  }
  const active = students.filter(
    (student) => student.status === "active",
  ).length;
  return (
    <div>
      <ActionFeedback state={action.state} />
      <ul className="space-y-3">
        {assignments.map((assignment) => {
          const activity = findActivity(assignment.activityId);
          const work = submissions.filter(
            (item) => item.assignmentId === assignment.id,
          );
          const handedIn = work.filter(
            (item) => item.status !== "draft",
          ).length;
          const toReview = work.filter(
            (item) => item.status === "submitted",
          ).length;
          return (
            <li
              key={assignment.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-black">{assignment.title}</h3>
                  {activity && (
                    <Link
                      to={activity.path}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-kenya-green hover:underline dark:text-green-400"
                    >
                      <FlaskConical className="size-4" aria-hidden="true" />
                      {activity.title[language]}
                    </Link>
                  )}
                  {assignment.instructions && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {assignment.instructions}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`${badge} ${badgeTones.slate}`}>
                      {handedIn} / {active} {tr("handed in", "zimewasilishwa")}
                    </span>
                    {toReview > 0 && (
                      <span className={`${badge} ${badgeTones.amber}`}>
                        {toReview} {tr("to review", "za kukagua")}
                      </span>
                    )}
                  </div>
                </div>
                <ConfirmButton
                  confirmLabel={tr("Delete", "Futa")}
                  disabled={action.pending}
                  onConfirm={() =>
                    void action.run(() =>
                      deleteAssignment(classId, assignment.id),
                    )
                  }
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {tr("Remove", "Ondoa")}
                </ConfirmButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
