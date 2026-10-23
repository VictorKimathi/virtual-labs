import { initializeApp } from "firebase-admin/app";
import {
  FieldValue,
  Timestamp,
  getFirestore,
  type DocumentReference,
} from "firebase-admin/firestore";
import { logger, setGlobalOptions } from "firebase-functions";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import {
  fetchPaymentStatus,
  payheroPassword,
  payheroUsername,
  sendStkPush,
  type PaymentStatus,
} from "./payhero.js";
import {
  parseSubscriptionRequest,
  priceFor,
  toLocalPhone,
} from "./subscription.js";

setGlobalOptions({ region: "us-central1", maxInstances: 10 });
initializeApp();

const db = getFirestore();
const SUBSCRIPTIONS_COLLECTION = "schoolSubscriptions";
const THROTTLES_COLLECTION = "paymentThrottles";

// One STK push per phone number per minute stops the endpoint being used to
// spam someone's phone with payment prompts.
const PUSH_COOLDOWN_MS = 60_000;

// Give the PayHero callback a head start before the status poll checks PayHero.
const RECONCILE_AFTER_MS = 15_000;

const secrets = [payheroUsername, payheroPassword];

async function claimPushSlot(localPhone: string) {
  const ref = db.collection(THROTTLES_COLLECTION).doc(localPhone);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const last = snapshot.get("lastAttemptAt");
    if (
      last instanceof Timestamp &&
      Date.now() - last.toMillis() < PUSH_COOLDOWN_MS
    ) {
      throw new HttpsError(
        "resource-exhausted",
        "A payment prompt was sent to this number a moment ago.",
      );
    }
    transaction.set(ref, { lastAttemptAt: FieldValue.serverTimestamp() });
  });
}

async function settlePayment(
  ref: DocumentReference,
  reference: string,
): Promise<PaymentStatus> {
  const status = await fetchPaymentStatus(reference);
  if (status === "pending") return status;
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.get("status");
    if (current !== "pending") return current as PaymentStatus;
    transaction.update(ref, {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return status;
  });
}

export const createSubscriptionPayment = onCall({ secrets }, async (event) => {
  const request = parseSubscriptionRequest(event.data);
  const localPhone = toLocalPhone(request.phone);
  await claimPushSlot(localPhone);

  const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc();
  await ref.set({
    ...request,
    amount: priceFor(request.plan),
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  try {
    const push = await sendStkPush({
      amount: priceFor(request.plan),
      phoneNumber: localPhone,
      customerName: request.contactName,
      externalReference: ref.id,
    });
    await ref.update({
      payheroReference: push.reference,
      checkoutRequestId: push.checkoutRequestId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logger.error("STK push failed", { subscriptionId: ref.id, error });
    await ref.update({
      status: "failed",
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw new HttpsError(
      "unavailable",
      "The payment prompt could not be sent.",
    );
  }
  return { id: ref.id };
});

export const getSubscriptionPaymentStatus = onCall(
  { secrets },
  async (event) => {
    const id: unknown = (event.data as { id?: unknown } | null)?.id;
    if (typeof id !== "string" || id.length === 0 || id.length > 40) {
      throw new HttpsError("invalid-argument", "Invalid request");
    }
    const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new HttpsError("not-found", "Not found");

    const status = snapshot.get("status") as PaymentStatus;
    const reference: unknown = snapshot.get("payheroReference");
    const createdAt: unknown = snapshot.get("createdAt");
    if (
      status !== "pending" ||
      typeof reference !== "string" ||
      !(createdAt instanceof Timestamp) ||
      Date.now() - createdAt.toMillis() < RECONCILE_AFTER_MS
    ) {
      return { status };
    }
    try {
      return { status: await settlePayment(ref, reference) };
    } catch (error) {
      logger.error("Payment status check failed", {
        subscriptionId: id,
        error,
      });
      return { status };
    }
  },
);

export const payheroCallback = onRequest({ secrets }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const body: unknown = req.body;
  const payload =
    typeof body === "object" && body !== null
      ? (body as { response?: { ExternalReference?: unknown } })
      : null;
  const id = payload?.response?.ExternalReference;
  if (typeof id !== "string" || id.length === 0 || id.length > 40) {
    res.status(400).end();
    return;
  }
  const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc(id);
  const snapshot = await ref.get();
  const reference: unknown = snapshot.get("payheroReference");
  if (!snapshot.exists || typeof reference !== "string") {
    res.status(404).end();
    return;
  }
  try {
    await settlePayment(ref, reference);
    res.status(200).json({ ok: true });
  } catch (error) {
    logger.error("PayHero callback failed", { subscriptionId: id, error });
    res.status(500).end();
  }
});
