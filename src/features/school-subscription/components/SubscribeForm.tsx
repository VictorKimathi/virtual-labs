import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { getUserMessage } from "../../../shared/errors/appError";
import { useSubscriptionPayment } from "../hooks/useSubscriptionPayment";
import { MONTHLY_PRICE_KES, YEARLY_PRICE_KES } from "../subscription.config";
import { formatKes } from "../subscription.format";
import { PaymentStatusPanel } from "./PaymentStatusPanel";
import { parseSubscriptionForm } from "../subscription.schema";
import type {
  BillingPeriod,
  FieldError,
  FieldName,
  FormValues,
} from "../subscription.types";

type Props = {
  plan: BillingPeriod;
  onPlanChange: (plan: BillingPeriod) => void;
};

const emptyValues: FormValues = {
  schoolName: "",
  contactName: "",
  email: "",
  phone: "",
  learners: "",
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950";

export function SubscribeForm({ plan, onPlanChange }: Props) {
  const { language, tr } = useLanguage();
  const { state, submit, reset } = useSubscriptionPayment();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<FieldName, FieldError>>>(
    {},
  );
  const submitting = state.status === "submitting";
  const amount = plan === "yearly" ? YEARLY_PRICE_KES : MONTHLY_PRICE_KES;

  const fields: {
    name: FieldName;
    label: string;
    type: string;
    autoComplete: string;
    placeholder: string;
  }[] = [
    {
      name: "schoolName",
      label: tr("School name", "Jina la shule"),
      type: "text",
      autoComplete: "organization",
      placeholder: tr("e.g. Nyeri High School", "mf. Shule ya Upili ya Nyeri"),
    },
    {
      name: "contactName",
      label: tr("Contact person", "Mtu wa mawasiliano"),
      type: "text",
      autoComplete: "name",
      placeholder: tr(
        "Principal, deputy or teacher",
        "Mwalimu mkuu, naibu au mwalimu",
      ),
    },
    {
      name: "email",
      label: tr("Email", "Barua pepe"),
      type: "email",
      autoComplete: "email",
      placeholder: "name@school.ac.ke",
    },
    {
      name: "phone",
      label: tr("M-Pesa phone number", "Nambari ya simu ya M-Pesa"),
      type: "tel",
      autoComplete: "tel",
      placeholder: "0712 345 678",
    },
    {
      name: "learners",
      label: tr(
        "Approximate number of learners",
        "Idadi ya wanafunzi takriban",
      ),
      type: "number",
      autoComplete: "off",
      placeholder: "400",
    },
  ];

  function errorText(error: FieldError, label: string) {
    return error === "required"
      ? tr(`${label} is required`, `${label} inahitajika`)
      : tr(
          `Check the ${label.toLowerCase()}`,
          `Angalia ${label.toLowerCase()}`,
        );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseSubscriptionForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    void submit({ ...result.data, plan });
  }

  if (
    state.status === "awaiting" ||
    state.status === "paid" ||
    state.status === "failed" ||
    state.status === "timeout"
  ) {
    return (
      <PaymentStatusPanel
        state={state}
        amount={amount}
        onRetry={reset}
        onDone={() => {
          setValues(emptyValues);
          reset();
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-bold">{tr("Plan", "Mpango")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["monthly", "yearly"] as const).map((option) => (
            <label
              key={option}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-bold ${plan === option ? "border-kenya-green bg-green-50 dark:bg-green-950" : "border-slate-300 dark:border-slate-700"}`}
            >
              <input
                type="radio"
                name="plan"
                value={option}
                checked={plan === option}
                onChange={() => onPlanChange(option)}
                className="h-4 w-4 accent-kenya-green"
              />
              {option === "monthly"
                ? `${tr("Monthly", "Kila mwezi")} · ${formatKes(MONTHLY_PRICE_KES)}`
                : `${tr("Yearly", "Kila mwaka")} · ${formatKes(YEARLY_PRICE_KES)}`}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.name];
          const errorId = `${field.name}-error`;
          return (
            <label
              key={field.name}
              className={`block text-sm font-bold ${field.name === "schoolName" ? "sm:col-span-2" : ""}`}
            >
              {field.label}
              <input
                name={field.name}
                type={field.type}
                inputMode={field.type === "number" ? "numeric" : undefined}
                min={field.type === "number" ? 1 : undefined}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(event) =>
                  setValues({ ...values, [field.name]: event.target.value })
                }
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`${inputClass} mt-1 ${error ? "border-kenya-red dark:border-red-400" : ""}`}
              />
              {error && (
                <span
                  id={errorId}
                  className="mt-1 block text-xs font-semibold text-kenya-red dark:text-red-300"
                >
                  {errorText(error, field.label)}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {language === "en"
            ? getUserMessage(state.error).en
            : getUserMessage(state.error).sw}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-kenya-green px-6 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
      >
        {submitting && (
          <LoaderCircle
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {submitting
          ? tr("Sending prompt…", "Inatuma ombi…")
          : tr(
              `Pay ${formatKes(amount)} with M-Pesa`,
              `Lipa ${formatKes(amount)} kwa M-Pesa`,
            )}
      </button>
    </form>
  );
}
