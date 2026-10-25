import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { ActionFeedback } from "../../classroom/components/StatusPanels";
import {
  fieldError,
  hint,
  input,
  label,
  primaryButton,
} from "../../classroom/components/styles";
import { useAction } from "../../classroom/hooks/useAction";
import { signUpWithEmail } from "../account.api";
import {
  homeFor,
  NAME_MAX,
  parseSignupForm,
  PASSWORD_MIN,
} from "../account.schema";
import type {
  AccountField,
  AccountFieldError,
  AccountRole,
} from "../account.types";

/** Creates an email account with the chosen role. */
export function SignupForm({ role }: { role: AccountRole }) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const action = useAction("account-sign-up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<AccountField, AccountFieldError>>
  >({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseSignupForm({ name, email, password, role });
    if (!parsed.ok) return setErrors(parsed.errors);
    setErrors({});
    void action.run(async () =>
      navigate(homeFor(await signUpWithEmail(parsed.data))),
    );
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="sign-up-name" className={label}>
          {role === "student"
            ? tr("First name or nickname", "Jina la kwanza au la utani")
            : tr("Name", "Jina")}
        </label>
        <input
          id="sign-up-name"
          autoComplete="name"
          maxLength={NAME_MAX}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={errors.name !== undefined}
          className={`${input} mt-1`}
        />
        {errors.name && (
          <p className={fieldError}>
            {errors.name === "required"
              ? tr("Enter your name.", "Weka jina lako.")
              : tr(
                  `Use at most ${NAME_MAX} characters.`,
                  `Tumia herufi zisizozidi ${NAME_MAX}.`,
                )}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="sign-up-email" className={label}>
          {tr("Email", "Barua pepe")}
        </label>
        <input
          id="sign-up-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={errors.email !== undefined}
          className={`${input} mt-1`}
        />
        {errors.email && (
          <p className={fieldError}>
            {errors.email === "required"
              ? tr("Enter your email.", "Weka barua pepe yako.")
              : tr(
                  "That does not look like an email address.",
                  "Hiyo haionekani kama barua pepe.",
                )}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="sign-up-password" className={label}>
          {tr("Password", "Nenosiri")}
        </label>
        <input
          id="sign-up-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={errors.password !== undefined}
          className={`${input} mt-1`}
        />
        <p className={hint}>
          {tr(
            `At least ${PASSWORD_MIN} characters.`,
            `Angalau herufi ${PASSWORD_MIN}.`,
          )}
        </p>
        {errors.password && (
          <p className={fieldError}>
            {errors.password === "required"
              ? tr("Choose a password.", "Chagua nenosiri.")
              : tr(
                  `Use at least ${PASSWORD_MIN} characters.`,
                  `Tumia angalau herufi ${PASSWORD_MIN}.`,
                )}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={action.pending}
        className={`${primaryButton} w-full rounded-full`}
      >
        {action.pending
          ? tr("Creating your account…", "Inaunda akaunti yako…")
          : tr("Create account", "Unda akaunti")}
      </button>
      <ActionFeedback state={action.state} />
    </form>
  );
}
