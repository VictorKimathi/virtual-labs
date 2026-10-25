import { AppError } from "../../shared/errors/appError";
import type {
  AccountField,
  AccountFieldError,
  AccountRole,
  LoginForm,
  Profile,
  SignupForm,
} from "./account.types";

export const NAME_MAX = 60;
export const PASSWORD_MIN = 8;

const roles: AccountRole[] = ["teacher", "student", "personal"];

export const isRole = (value: unknown): value is AccountRole =>
  typeof value === "string" && (roles as string[]).includes(value);

/** Parses a `users/{uid}` profile document. */
export function parseProfile(data: unknown): Profile {
  if (typeof data !== "object" || data === null)
    throw new AppError("invalid-data", "Profile is not an object");
  const record = data as Record<string, unknown>;
  if (!isRole(record.role) || typeof record.name !== "string")
    throw new AppError("invalid-data", "Profile has an unexpected shape");
  return { role: record.role, name: record.name };
}

type Errors = Partial<Record<AccountField, AccountFieldError>>;
type Parsed<T> = { ok: true; data: T } | { ok: false; errors: Errors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(email: string): AccountFieldError | undefined {
  if (!email) return "required";
  return EMAIL.test(email) ? undefined : "invalid";
}

export function parseLoginForm(values: LoginForm): Parsed<LoginForm> {
  const email = values.email.trim();
  const errors: Errors = {};
  const emailProblem = emailError(email);
  if (emailProblem) errors.email = emailProblem;
  if (!values.password) errors.password = "required";
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, data: { email, password: values.password } };
}

export function parseSignupForm(values: SignupForm): Parsed<SignupForm> {
  const name = values.name.trim();
  const email = values.email.trim();
  const errors: Errors = {};
  if (!name) errors.name = "required";
  else if (name.length > NAME_MAX) errors.name = "too-long";
  const emailProblem = emailError(email);
  if (emailProblem) errors.email = emailProblem;
  if (!values.password) errors.password = "required";
  else if (values.password.length < PASSWORD_MIN) errors.password = "too-short";
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, data: { ...values, name, email } };
}

/** Where each kind of account lands after signing in. */
export const homeFor = (role: AccountRole | null) =>
  role === "teacher" ? "/teacher" : "/dashboard";
