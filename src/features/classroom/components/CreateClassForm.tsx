import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { createClass } from "../classroom.api";
import { subjectLabel } from "../classroom.format";
import { CLASS_NAME_MAX, parseClassForm } from "../classroom.schema";
import type { ClassSubject, FieldError } from "../classroom.types";
import { useAction } from "../hooks/useAction";
import { ActionFeedback } from "./StatusPanels";
import {
  card,
  fieldError,
  input,
  label,
  primaryButton,
  sectionTitle,
} from "./styles";

const SUBJECTS: ClassSubject[] = ["physics", "chemistry", "mixed"];

export function CreateClassForm({
  teacher,
}: {
  teacher: { uid: string; name: string };
}) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const action = useAction("classroom-create-class");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState<ClassSubject>("physics");
  const [error, setError] = useState<FieldError | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseClassForm({ name, subject });
    if (!parsed.ok) {
      setError(parsed.errors.name ?? null);
      return;
    }
    setError(null);
    let classId = "";
    const created = await action.run(async () => {
      classId = await createClass(parsed.data, teacher);
    });
    if (created) navigate(`/teacher/classes/${classId}`);
  };

  return (
    <form onSubmit={(event) => void submit(event)} className={card} noValidate>
      <h2 className={sectionTitle}>{tr("Create a class", "Unda darasa")}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="class-name" className={label}>
            {tr("Class name", "Jina la darasa")}
          </label>
          <input
            id="class-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={CLASS_NAME_MAX}
            placeholder={tr("Form 2 East", "Kidato 2 Mashariki")}
            aria-invalid={error !== null}
            aria-describedby={error ? "class-name-error" : undefined}
            className={`${input} mt-1`}
          />
          {error && (
            <p id="class-name-error" className={fieldError}>
              {error === "required"
                ? tr("Give the class a name.", "Lipe darasa jina.")
                : tr(
                    `Use 2 to ${CLASS_NAME_MAX} characters.`,
                    `Tumia herufi 2 hadi ${CLASS_NAME_MAX}.`,
                  )}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="class-subject" className={label}>
            {tr("Subject", "Somo")}
          </label>
          <select
            id="class-subject"
            value={subject}
            onChange={(event) => {
              const next = SUBJECTS.find((item) => item === event.target.value);
              if (next) setSubject(next);
            }}
            className={`${input} mt-1`}
          >
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {subjectLabel(item, tr)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={action.pending}
        className={`${primaryButton} mt-4`}
      >
        <Plus className="size-4" aria-hidden="true" />
        {action.pending
          ? tr("Creating…", "Inaunda…")
          : tr("Create class", "Unda darasa")}
      </button>
      <ActionFeedback state={action.state} />
    </form>
  );
}
