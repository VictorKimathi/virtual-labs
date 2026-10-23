import { FirebaseError } from "firebase/app";
import {
  AppError,
  toAppError,
  type AppErrorCode,
} from "../../shared/errors/appError";
import { getFirebaseFunctions } from "../../shared/firebase/firebase";
import type { PaymentStatus, SubscriptionRequest } from "./subscription.types";

const FUNCTION_ERROR_CODES: Record<string, AppErrorCode> = {
  "functions/unavailable": "server",
  "functions/deadline-exceeded": "network",
  "functions/resource-exhausted": "rate-limited",
  "functions/invalid-argument": "invalid-data",
  "functions/not-found": "not-found",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function callFunction(name: string, data: unknown): Promise<unknown> {
  try {
    const { httpsCallable } = await import("firebase/functions");
    const result = await httpsCallable(
      await getFirebaseFunctions(),
      name,
    )(data);
    return result.data;
  } catch (cause) {
    if (cause instanceof FirebaseError) {
      throw new AppError(
        FUNCTION_ERROR_CODES[cause.code] ?? "unknown",
        `Subscription call ${name} failed (${cause.code})`,
        { cause },
      );
    }
    throw toAppError(cause);
  }
}

// Starts an M-Pesa STK push on the school's phone and returns the id of the
// pending subscription so its payment can be followed.
export async function startSubscriptionPayment(
  request: SubscriptionRequest,
): Promise<string> {
  const data = await callFunction("createSubscriptionPayment", request);
  if (!isRecord(data) || typeof data.id !== "string") {
    throw new AppError("invalid-data", "Unexpected payment start response");
  }
  return data.id;
}

export async function fetchPaymentStatus(id: string): Promise<PaymentStatus> {
  const data = await callFunction("getSubscriptionPaymentStatus", { id });
  if (
    !isRecord(data) ||
    (data.status !== "pending" &&
      data.status !== "paid" &&
      data.status !== "failed")
  ) {
    throw new AppError("invalid-data", "Unexpected payment status response");
  }
  return data.status;
}
