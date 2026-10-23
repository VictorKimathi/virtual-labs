import type {
  FieldError,
  FieldName,
  FormValues,
  ParseResult,
} from "./subscription.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KENYAN_PHONE_PATTERN = /^(?:\+?254|0)([17]\d{8})$/;
const MAX_LEARNERS = 100000;

function checkName(value: string, max: number): FieldError | null {
  if (value === "") return "required";
  return value.length < 2 || value.length > max ? "invalid" : null;
}

export function parseSubscriptionForm(values: FormValues): ParseResult {
  const schoolName = values.schoolName.trim().replace(/\s+/g, " ");
  const contactName = values.contactName.trim().replace(/\s+/g, " ");
  const email = values.email.trim().toLowerCase();
  const phoneDigits = values.phone.replace(/[\s-]/g, "");
  const learnersText = values.learners.trim();

  const errors: Partial<Record<FieldName, FieldError>> = {};
  const schoolError = checkName(schoolName, 120);
  if (schoolError) errors.schoolName = schoolError;
  const contactError = checkName(contactName, 80);
  if (contactError) errors.contactName = contactError;

  if (email === "") errors.email = "required";
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "invalid";
  }

  const phoneMatch = KENYAN_PHONE_PATTERN.exec(phoneDigits);
  if (phoneDigits === "") errors.phone = "required";
  else if (!phoneMatch) errors.phone = "invalid";

  const learners = Number(learnersText);
  if (learnersText === "") errors.learners = "required";
  else if (
    !Number.isInteger(learners) ||
    learners < 1 ||
    learners > MAX_LEARNERS
  ) {
    errors.learners = "invalid";
  }

  if (Object.keys(errors).length > 0 || !phoneMatch) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: {
      schoolName,
      contactName,
      email,
      phone: `+254${phoneMatch[1]}`,
      learners,
    },
  };
}
