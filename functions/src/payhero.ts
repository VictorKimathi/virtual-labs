import { defineSecret, defineString } from "firebase-functions/params";

export const payheroUsername = defineSecret("PAYHERO_API_USERNAME");
export const payheroPassword = defineSecret("PAYHERO_API_PASSWORD");
const payheroChannelId = defineString("PAYHERO_CHANNEL_ID");
const payheroApiBaseUrl = defineString("PAYHERO_API_BASE_URL", {
  default: "https://backend.payhero.co.ke/api/v2",
});
export const payheroCallbackUrl = defineString("PAYHERO_CALLBACK_URL");

export type PaymentStatus = "pending" | "paid" | "failed";

export type StkPush = {
  amount: number;
  phoneNumber: string;
  customerName: string;
  externalReference: string;
};

export type StkPushResult = {
  reference: string;
  checkoutRequestId: string | null;
};

const REQUEST_TIMEOUT_MS = 20_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function payheroRequest(
  path: string,
  init?: { method: "POST"; body: unknown },
): Promise<Record<string, unknown>> {
  const credentials = Buffer.from(
    `${payheroUsername.value()}:${payheroPassword.value()}`,
  ).toString("base64");
  const response = await fetch(`${payheroApiBaseUrl.value()}/${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: init ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`PayHero ${path} responded with ${response.status}`);
  }
  const payload: unknown = await response.json();
  if (!isRecord(payload)) {
    throw new Error(`PayHero ${path} returned an unexpected payload`);
  }
  return payload;
}

export async function sendStkPush(push: StkPush): Promise<StkPushResult> {
  const payload = await payheroRequest("payments", {
    method: "POST",
    body: {
      amount: push.amount,
      phone_number: push.phoneNumber,
      channel_id: Number(payheroChannelId.value()),
      provider: "m-pesa",
      external_reference: push.externalReference,
      customer_name: push.customerName,
      callback_url: payheroCallbackUrl.value(),
    },
  });
  if (payload.success === false || typeof payload.reference !== "string") {
    throw new Error("PayHero did not accept the STK push request");
  }
  return {
    reference: payload.reference,
    checkoutRequestId:
      typeof payload.CheckoutRequestID === "string"
        ? payload.CheckoutRequestID
        : null,
  };
}

// The status comes from PayHero itself, never from a callback body, so a
// forged callback cannot mark a subscription as paid.
export async function fetchPaymentStatus(
  reference: string,
): Promise<PaymentStatus> {
  const payload = await payheroRequest(
    `transaction-status?reference=${encodeURIComponent(reference)}`,
  );
  const status =
    typeof payload.status === "string" ? payload.status.toUpperCase() : "";
  if (status === "SUCCESS") return "paid";
  if (status === "FAILED" || status === "CANCELLED") return "failed";
  return "pending";
}
