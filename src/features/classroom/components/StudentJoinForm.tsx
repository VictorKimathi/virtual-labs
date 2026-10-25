import { LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { joinClass, signInStudent } from "../classroom.api";
import { NICKNAME_MAX, parseJoinForm } from "../classroom.schema";
import type { FieldError } from "../classroom.types";
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
} from "./styles";

type StudentJoinFormProps = {
  initialCode: string;
  /** Runs once the student has joined. */
  onJoined?: () => void;
  /** Leave out the card and heading, for use inside another card. */
  bare?: boolean;
};

export function StudentJoinForm({
  initialCode,
  onJoined,
  bare,
}: StudentJoinFormProps) {
  const { tr } = useLanguage();
  const action = useAction("classroom-student-join");
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<"code" | "nickname", FieldError>>
  >({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseJoinForm({ code, nickname });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    void action.run(async () => {
      await joinClass(parsed.data, await signInStudent());
      onJoined?.();
    });
  };

  return (
    <form
      onSubmit={submit}
      className={bare ? "w-full" : `${card} w-full`}
      noValidate
    >
      {!bare && (
        <>
          <h2 className={sectionTitle}>
            {tr("Join your class", "Jiunge na darasa lako")}
          </h2>
          <p className={hint}>
            {tr(
              "Your teacher gives you the class code. Pick a nickname: no email or password needed.",
              "Mwalimu wako hukupa msimbo wa darasa. Chagua jina la utani: hakuna barua pepe wala nenosiri.",
            )}
          </p>
        </>
      )}
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="join-code" className={label}>
            {tr("Class code", "Msimbo wa darasa")}
          </label>
          <input
            id="join-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="ABC-123"
            aria-invalid={errors.code !== undefined}
            className={`${input} mt-1 font-mono text-lg uppercase tracking-widest`}
          />
          {errors.code && (
            <p className={fieldError}>
              {errors.code === "required"
                ? tr("Enter the class code.", "Weka msimbo wa darasa.")
                : tr(
                    "Codes have 6 letters and numbers.",
                    "Misimbo ina herufi na nambari 6.",
                  )}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="join-nickname" className={label}>
            {tr("Nickname", "Jina la utani")}
          </label>
          <input
            id="join-nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={NICKNAME_MAX}
            autoComplete="off"
            aria-invalid={errors.nickname !== undefined}
            className={`${input} mt-1`}
          />
          <p className={hint}>
            {tr(
              "Use a nickname your teacher will recognise, not your full name.",
              "Tumia jina la utani ambalo mwalimu wako atalitambua, si jina lako kamili.",
            )}
          </p>
          {errors.nickname && (
            <p className={fieldError}>
              {errors.nickname === "required"
                ? tr("Pick a nickname.", "Chagua jina la utani.")
                : tr(
                    `Use 2 to ${NICKNAME_MAX} characters.`,
                    `Tumia herufi 2 hadi ${NICKNAME_MAX}.`,
                  )}
            </p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={action.pending}
        className={`${primaryButton} mt-5 w-full`}
      >
        <LogIn className="size-4" aria-hidden="true" />
        {action.pending
          ? tr("Joining…", "Inajiunga…")
          : tr("Join class", "Jiunge na darasa")}
      </button>
      <ActionFeedback state={action.state} />
    </form>
  );
}
