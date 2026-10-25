import { Ban, ChevronRight, RotateCcw, UserMinus, Users } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { removeStudent, setStudentStatus } from "../classroom.api";
import type { Assignment, Student, Submission } from "../classroom.types";
import { useAction } from "../hooks/useAction";
import { ConfirmButton } from "./ConfirmButton";
import { ActionFeedback } from "./StatusPanels";
import { badge, badgeTones, secondaryButton } from "./styles";

type Props = {
  classId: string;
  students: Student[];
  assignments: Assignment[];
  submissions: Submission[];
  selectedId: string | null;
  onSelect: (studentId: string) => void;
};

export function RosterPanel({
  classId,
  students,
  assignments,
  submissions,
  selectedId,
  onSelect,
}: Props) {
  const { tr } = useLanguage();
  const action = useAction("classroom-roster");
  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={tr(
          "No students yet. Share the class code from Settings.",
          "Bado hakuna wanafunzi. Shiriki msimbo wa darasa kutoka Mipangilio.",
        )}
      />
    );
  }
  const assignmentIds = new Set(assignments.map((item) => item.id));
  return (
    <div>
      <ActionFeedback state={action.state} />
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {students.map((student) => {
          const work = submissions.filter(
            (item) =>
              item.studentId === student.id &&
              assignmentIds.has(item.assignmentId),
          );
          const handedIn = work.filter(
            (item) => item.status !== "draft",
          ).length;
          const toReview = work.filter(
            (item) => item.status === "submitted",
          ).length;
          const blocked = student.status === "blocked";
          const selected = student.id === selectedId;
          return (
            <li
              key={student.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${selected ? "bg-green-50 dark:bg-green-950" : ""}`}
            >
              <button
                type="button"
                onClick={() => onSelect(student.id)}
                aria-pressed={selected}
                className="group flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black uppercase dark:bg-slate-800">
                  {student.nickname.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">
                    {student.nickname}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <span className={`${badge} ${badgeTones.slate}`}>
                      {handedIn} / {assignments.length}{" "}
                      {tr("handed in", "zimewasilishwa")}
                    </span>
                    {toReview > 0 && (
                      <span className={`${badge} ${badgeTones.amber}`}>
                        {toReview} {tr("to review", "za kukagua")}
                      </span>
                    )}
                    {blocked && (
                      <span className={`${badge} ${badgeTones.red}`}>
                        {tr("Blocked", "Amezuiwa")}
                      </span>
                    )}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={action.pending}
                  onClick={() =>
                    void action.run(() =>
                      setStudentStatus(
                        classId,
                        student.id,
                        blocked ? "active" : "blocked",
                      ),
                    )
                  }
                  className={secondaryButton}
                >
                  {blocked ? (
                    <RotateCcw className="size-4" aria-hidden="true" />
                  ) : (
                    <Ban className="size-4" aria-hidden="true" />
                  )}
                  {blocked
                    ? tr("Restore access", "Rejesha ufikiaji")
                    : tr("Block", "Zuia")}
                </button>
                <ConfirmButton
                  confirmLabel={tr("Remove student", "Ondoa mwanafunzi")}
                  disabled={action.pending}
                  onConfirm={() =>
                    void action.run(() => removeStudent(classId, student.id))
                  }
                >
                  <UserMinus className="size-4" aria-hidden="true" />
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
