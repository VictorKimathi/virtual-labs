import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { ActionFeedback } from "../../classroom/components/StatusPanels";
import {
  fieldError,
  input,
  label,
  primaryButton,
} from "../../classroom/components/styles";
import { useAction } from "../../classroom/hooks/useAction";
import { sendPasswordReset, signInWithEmail } from "../account.api";
import { homeFor, parseLoginForm } from "../account.schema";
import type {
  AccountField,
  AccountFieldError,
  AccountRole,
} from "../account.types";

/** Email and password sign-in, with a reset link for forgotten passwords. */
export function EmailSignInForm({ role }: { role: AccountRole }) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const action = useAction("account-email-sign-in");
  const reset = useAction("account-password-reset");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<AccountField, AccountFieldError>>
  >({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseLoginForm({ email, password });
    if (!parsed.ok) return setErrors(parsed.errors);
    setErrors({});
    void action.run(async () =>
      navigate(homeFor(await signInWithEmail(parsed.data, role))),
    );
  };

  const forgot = () => {
    const parsed = parseLoginForm({ email, password: "-" });
    if (!parsed.ok) return setErrors({ email: parsed.errors.email });
    void reset.run(() => sendPasswordReset(parsed.data.email));
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="sign-in-email" className={label}>
          {tr("Email", "Barua pepe")}
        </label>
        <input
          id="sign-in-email"
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
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="sign-in-password" className={label}>
            {tr("Password", "Nenosiri")}
          </label>
          <button
            type="button"
            onClick={forgot}
            className="text-xs font-bold text-kenya-green underline dark:text-green-400"
          >
            {tr("Forgot password?", "Umesahau nenosiri?")}
          </button>
        </div>
        <input
          id="sign-in-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={errors.password !== undefined}
          className={`${input} mt-1`}
        />
        {errors.password && (
          <p className={fieldError}>
            {tr("Enter your password.", "Weka nenosiri lako.")}
          </p>
        )}
      </div>
      <ActionFeedback
        state={reset.state}
        success={tr(
          "If an account uses that email, a reset link is on its way.",
          "Kama akaunti inatumia barua pepe hiyo, kiungo cha kubadilisha kimetumwa.",
        )}
      />
      <button
        type="submit"
        disabled={action.pending}
        className={`${primaryButton} w-full rounded-full`}
      >
        {action.pending
          ? tr("Signing in…", "Inaingia…")
          : tr("Sign in", "Ingia")}
      </button>
      <ActionFeedback state={action.state} />
    </form>
  );
}
