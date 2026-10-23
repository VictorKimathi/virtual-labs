import { HttpsError } from "firebase-functions/v2/https";

// Keep in step with src/features/school-subscription/subscription.config.ts.
// The amount is always computed here so a client can never choose its price.
const MONTHLY_PRICE_KES = 5000;
const YEARLY_MONTHS_CHARGED = 10;

export type BillingPeriod = "monthly" | "yearly";

export type SubscriptionRequest = {
  schoolName: string;
  contactName: string;
  email: string;
  phone: string;
  learners: number;
  plan: BillingPeriod;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTL_PHONE_PATTERN = /^\+254([17]\d{8})$/;
const MAX_LEARNERS = 100000;

export function priceFor(plan: BillingPeriod): number {
  return plan === "yearly"
    ? MONTHLY_PRICE_KES * YEARLY_MONTHS_CHARGED
    : MONTHLY_PRICE_KES;
}

// PayHero accepts the local 07XXXXXXXX / 01XXXXXXXX form.
export function toLocalPhone(phone: string): string {
  const match = INTL_PHONE_PATTERN.exec(phone);
  if (!match) throw new HttpsError("invalid-argument", "Invalid phone number");
  return `0${match[1]}`;
}

function text(value: unknown, min: number, max: number): string {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", "Invalid request");
  }
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpsError("invalid-argument", "Invalid request");
  }
  return trimmed;
}

export function parseSubscriptionRequest(data: unknown): SubscriptionRequest {
  if (typeof data !== "object" || data === null) {
    throw new HttpsError("invalid-argument", "Invalid request");
  }
  const input = data as Record<string, unknown>;
  const email = text(input.email, 3, 254).toLowerCase();
  const phone = text(input.phone, 13, 13);
  const { learners, plan } = input;
  if (
    !EMAIL_PATTERN.test(email) ||
    !INTL_PHONE_PATTERN.test(phone) ||
    typeof learners !== "number" ||
    !Number.isInteger(learners) ||
    learners < 1 ||
    learners > MAX_LEARNERS ||
    (plan !== "monthly" && plan !== "yearly")
  ) {
    throw new HttpsError("invalid-argument", "Invalid request");
  }
  return {
    schoolName: text(input.schoolName, 2, 120),
    contactName: text(input.contactName, 2, 80),
    email,
    phone,
    learners,
    plan,
  };
}
