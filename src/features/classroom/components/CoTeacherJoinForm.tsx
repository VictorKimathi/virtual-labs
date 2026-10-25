import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { joinAsCoTeacher } from "../classroom.api";
import { parseCode } from "../classroom.schema";
import type { FieldError } from "../classroom.types";
import { useAction } from "../hooks/useAction";
import { ActionFeedback } from "./StatusPanels";
import {
  card,
  fieldError,
  hint,
  input,
  label,
  secondaryButton,
  sectionTitle,
} from "./styles";

export function CoTeacherJoinForm({
  teacher,
}: {
  teacher: { uid: string; name: string };
}) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const action = useAction("classroom-join-co-teacher");
  const [code, setCode] = useState("");
  const [error, setError] = useState<FieldError | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseCode(code);
    if (!parsed.ok) {
      setError(parsed.errors.code ?? null);
      return;
    }
    setError(null);
    let classId = "";
    const joined = await action.run(async () => {
      classId = await joinAsCoTeacher(parsed.data, teacher);
    });
    if (joined) navigate(`/teacher/classes/${classId}`);
  };

  return (
    <form onSubmit={(event) => void submit(event)} className={card} noValidate>
      <h2 className={sectionTitle}>
        {tr("Join as a co-teacher", "Jiunge kama mwalimu mwenza")}
      </h2>
      <p className={hint}>
        {tr(
          "Ask the class owner for the co-teacher code in their class settings.",
          "Muulize mmiliki wa darasa msimbo wa mwalimu mwenza ulio kwenye mipangilio ya darasa.",
        )}
      </p>
      <label htmlFor="co-teacher-code" className={`${label} mt-4 block`}>
        {tr("Co-teacher code", "Msimbo wa mwalimu mwenza")}
      </label>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
        <input
          id="co-teacher-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="ABC-123"
          aria-invalid={error !== null}
          className={`${input} font-mono uppercase tracking-widest`}
        />
        <button
          type="submit"
          disabled={action.pending}
          className={secondaryButton}
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {action.pending
            ? tr("Joining…", "Inajiunga…")
            : tr("Join class", "Jiunge na darasa")}
        </button>
      </div>
      {error && (
        <p className={fieldError}>
          {error === "required"
            ? tr("Enter the code.", "Weka msimbo.")
            : tr(
                "Codes have 6 letters and numbers.",
                "Misimbo ina herufi na nambari 6.",
              )}
        </p>
      )}
      <ActionFeedback state={action.state} />
    </form>
  );
}
