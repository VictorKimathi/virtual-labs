export type BillingPeriod = "monthly" | "yearly";

export type PaymentStatus = "pending" | "paid" | "failed";

export type SubscriptionRequest = {
  schoolName: string;
  contactName: string;
  email: string;
  phone: string;
  learners: number;
  plan: BillingPeriod;
};

export type FieldName =
  "schoolName" | "contactName" | "email" | "phone" | "learners";

export type FieldError = "required" | "invalid";

export type FormValues = Record<FieldName, string>;

export type ParseResult =
  | { ok: true; data: Omit<SubscriptionRequest, "plan"> }
  | { ok: false; errors: Partial<Record<FieldName, FieldError>> };
