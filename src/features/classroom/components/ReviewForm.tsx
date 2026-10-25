import { CircleCheck, EyeOff, Undo2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { hideSubmission, reviewSubmission } from "../classroom.api";
import { FEEDBACK_MAX } from "../classroom.schema";
import type { Submission } from "../classroom.types";
import { useAction } from "../hooks/useAction";
import { ActionFeedback } from "./StatusPanels";
import { label, primaryButton, secondaryButton, textarea } from "./styles";

type Props = { classId: string; submission: Submission; reviewer: string };

export function ReviewForm({ classId, submission, reviewer }: Props) {
  const { tr } = useLanguage();
  const action = useAction("classroom-review");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const send = (status: "reviewed" | "draft") =>
    void action.run(() =>
      reviewSubmission(classId, submission.id, {
        feedback: feedback.trim(),
        status,
        reviewer,
      }),
    );
  const fieldId = `feedback-${submission.id}`;
  return (
    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
      <label htmlFor={fieldId} className={label}>
        {tr("Feedback", "Maoni")}
      </label>
      <textarea
        id={fieldId}
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        maxLength={FEEDBACK_MAX}
        className={`${textarea} mt-1`}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => send("reviewed")}
          disabled={action.pending}
          className={primaryButton}
        >
          <CircleCheck className="size-4" aria-hidden="true" />
          {tr("Mark reviewed", "Weka imekaguliwa")}
        </button>
        <button
          type="button"
          onClick={() => send("draft")}
          disabled={action.pending}
          className={secondaryButton}
        >
          <Undo2 className="size-4" aria-hidden="true" />
          {tr("Return for revision", "Rudisha kwa marekebisho")}
        </button>
        {submission.shared && (
          <button
            type="button"
            onClick={() =>
              void action.run(() => hideSubmission(classId, submission.id))
            }
            disabled={action.pending}
            className={secondaryButton}
          >
            <EyeOff className="size-4" aria-hidden="true" />
            {tr("Hide from class gallery", "Ficha kwenye maonyesho ya darasa")}
          </button>
        )}
      </div>
      <ActionFeedback
        state={action.state}
        success={tr("Saved.", "Imehifadhiwa.")}
      />
    </div>
  );
}
