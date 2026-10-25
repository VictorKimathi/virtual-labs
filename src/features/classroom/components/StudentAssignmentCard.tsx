import { FlaskConical, MessageSquareText, Save, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { saveSubmission } from "../classroom.api";
import { statusLabel, statusTone } from "../classroom.format";
import { ANSWER_MAX } from "../classroom.schema";
import type { Assignment, ClassRoom, Submission } from "../classroom.types";
import { findActivity } from "../data/activities";
import { useAction } from "../hooks/useAction";
import { ActionFeedback } from "./StatusPanels";
import {
  badge,
  badgeTones,
  card,
  hint,
  label,
  primaryButton,
  secondaryButton,
  textarea,
} from "./styles";

type Props = {
  classRoom: ClassRoom;
  student: { uid: string; nickname: string };
  assignment: Assignment;
  submission: Submission | null;
};

export function StudentAssignmentCard({
  classRoom,
  student,
  assignment,
  submission,
}: Props) {
  const { language, tr } = useLanguage();
  const action = useAction("classroom-submission");
  const [answer, setAnswer] = useState(submission?.answer ?? "");
  const [shared, setShared] = useState(submission?.shared ?? false);
  const activity = findActivity(assignment.activityId);
  const canShare = classRoom.sharing === "class";
  const save = (status: "draft" | "submitted") =>
    void action.run(() =>
      saveSubmission(
        classRoom.id,
        student,
        assignment.id,
        { answer: answer.trim(), status, shared: canShare && shared },
        submission,
      ),
    );
  const fieldId = `answer-${assignment.id}`;
  return (
    <article className={card}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-black tracking-tight">
          {assignment.title}
        </h3>
        <span
          className={`${badge} ${badgeTones[submission ? statusTone(submission.status) : "slate"]}`}
        >
          {submission
            ? statusLabel(submission.status, tr)
            : tr("To do", "Ya kufanya")}
        </span>
      </div>
      {assignment.instructions && (
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
          {assignment.instructions}
        </p>
      )}
      {activity && (
        <Link to={activity.path} className={`${secondaryButton} mt-4`}>
          <FlaskConical className="size-4" aria-hidden="true" />
          {tr("Open in the lab:", "Fungua maabarani:")}{" "}
          {activity.title[language]}
        </Link>
      )}
      {submission?.feedback && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <p className="flex items-center gap-2 text-sm font-black text-kenya-green dark:text-green-300">
            <MessageSquareText className="size-4" aria-hidden="true" />
            {tr("Teacher feedback", "Maoni ya mwalimu")}
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-6">
            {submission.feedback}
          </p>
        </div>
      )}
      <label htmlFor={fieldId} className={`${label} mt-4 block`}>
        {tr("Your results and observations", "Matokeo na uchunguzi wako")}
      </label>
      <textarea
        id={fieldId}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        maxLength={ANSWER_MAX}
        className={`${textarea} mt-1`}
      />
      <p className={hint}>
        {answer.length} / {ANSWER_MAX}
      </p>
      {canShare && (
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={shared}
            onChange={(event) => setShared(event.target.checked)}
            className="size-4 accent-kenya-green"
          />
          {tr("Share with my class", "Shiriki na darasa langu")}
        </label>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save("submitted")}
          disabled={action.pending || answer.trim() === ""}
          className={primaryButton}
        >
          <Send className="size-4" aria-hidden="true" />
          {tr("Hand in", "Wasilisha")}
        </button>
        <button
          type="button"
          onClick={() => save("draft")}
          disabled={action.pending}
          className={secondaryButton}
        >
          <Save className="size-4" aria-hidden="true" />
          {tr("Save draft", "Hifadhi rasimu")}
        </button>
      </div>
      <ActionFeedback
        state={action.state}
        success={tr("Saved.", "Imehifadhiwa.")}
      />
    </article>
  );
}
