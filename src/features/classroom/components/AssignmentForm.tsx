import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { createAssignments } from "../classroom.api";
import {
  INSTRUCTIONS_MAX,
  TITLE_MAX,
  parseAssignmentForm,
} from "../classroom.schema";
import type { ClassSubject, FieldError } from "../classroom.types";
import { activities, findActivity } from "../data/activities";
import { useAction } from "../hooks/useAction";
import { ActionFeedback } from "./StatusPanels";
import {
  card,
  fieldError,
  hint,
  input,
  label,
  primaryButton,
  sectionTitle,
  textarea,
} from "./styles";

type Props = { classId: string; subject: ClassSubject; uid: string };

/** A teacher's own task, optionally tied to one lab experiment. */
export function AssignmentForm({ classId, subject, uid }: Props) {
  const { language, tr } = useLanguage();
  const action = useAction("classroom-create-assignment");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [activityId, setActivityId] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<"title" | "instructions", FieldError>>
  >({});
  const labs = (["physics", "chemistry"] as const).filter(
    (lab) => subject === "mixed" || lab === subject,
  );

  const chooseActivity = (id: string) => {
    setActivityId(id);
    const activity = findActivity(id);
    if (activity && title.trim() === "") setTitle(activity.title[language]);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseAssignmentForm({
      title,
      instructions,
      activityId: activityId === "" ? null : activityId,
    });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    const created = await action.run(() =>
      createAssignments(classId, uid, [parsed.data]),
    );
    if (created) {
      setTitle("");
      setInstructions("");
      setActivityId("");
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className={card} noValidate>
      <h2 className={sectionTitle}>{tr("New assignment", "Kazi mpya")}</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="assignment-activity" className={label}>
            {tr("Lab experiment (optional)", "Jaribio la maabara (si lazima)")}
          </label>
          <select
            id="assignment-activity"
            value={activityId}
            onChange={(event) => chooseActivity(event.target.value)}
            className={`${input} mt-1`}
          >
            <option value="">
              {tr(
                "No experiment: a written task",
                "Hakuna jaribio: kazi ya maandishi",
              )}
            </option>
            {labs.map((lab) => (
              <optgroup
                key={lab}
                label={
                  lab === "physics"
                    ? tr("Physics lab", "Maabara ya fizikia")
                    : tr("Chemistry lab", "Maabara ya kemia")
                }
              >
                {activities
                  .filter((activity) => activity.lab === lab)
                  .map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title[language]}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="assignment-title" className={label}>
            {tr("Title", "Kichwa")}
          </label>
          <input
            id="assignment-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={TITLE_MAX}
            aria-invalid={errors.title !== undefined}
            className={`${input} mt-1`}
          />
          {errors.title && (
            <p className={fieldError}>
              {errors.title === "required"
                ? tr("Give the assignment a title.", "Ipe kazi kichwa.")
                : tr(
                    `Use 2 to ${TITLE_MAX} characters.`,
                    `Tumia herufi 2 hadi ${TITLE_MAX}.`,
                  )}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="assignment-instructions" className={label}>
            {tr("Instructions", "Maelekezo")}
          </label>
          <textarea
            id="assignment-instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            maxLength={INSTRUCTIONS_MAX}
            placeholder={tr(
              "What should students record or answer?",
              "Wanafunzi wanapaswa kurekodi au kujibu nini?",
            )}
            className={`${textarea} mt-1`}
          />
          <p className={hint}>
            {instructions.length} / {INSTRUCTIONS_MAX}
          </p>
          {errors.instructions && (
            <p className={fieldError}>
              {tr("The instructions are too long.", "Maelekezo ni marefu mno.")}
            </p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={action.pending}
        className={`${primaryButton} mt-4`}
      >
        <Send className="size-4" aria-hidden="true" />
        {action.pending
          ? tr("Assigning…", "Inatoa…")
          : tr("Assign to class", "Toa kwa darasa")}
      </button>
      <ActionFeedback
        state={action.state}
        success={tr("Assigned to the class.", "Imetolewa kwa darasa.")}
      />
    </form>
  );
}
