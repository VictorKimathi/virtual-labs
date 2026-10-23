import { useCallback, useEffect, useState } from "react";
import {
  logError,
  toAppError,
  type AppError,
} from "../../../shared/errors/appError";
import {
  fetchPaymentStatus,
  startSubscriptionPayment,
} from "../subscription.api";
import {
  PAYMENT_POLL_INTERVAL_MS,
  PAYMENT_POLL_TIMEOUT_MS,
} from "../subscription.config";
import type { SubscriptionRequest } from "../subscription.types";

export type SubscriptionPaymentState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "awaiting"; id: string }
  | { status: "paid" }
  | { status: "failed" }
  | { status: "timeout" }
  | { status: "error"; error: AppError };

const CONTEXT = "school-subscription";

export function useSubscriptionPayment() {
  const [state, setState] = useState<SubscriptionPaymentState>({
    status: "idle",
  });

  const awaitingId = state.status === "awaiting" ? state.id : null;

  useEffect(() => {
    if (awaitingId === null) return;
    const deadline = Date.now() + PAYMENT_POLL_TIMEOUT_MS;
    let active = true;

    const timer = setInterval(() => {
      fetchPaymentStatus(awaitingId)
        .then((status) => {
          if (!active) return;
          if (status === "paid") setState({ status: "paid" });
          else if (status === "failed") setState({ status: "failed" });
          else if (Date.now() > deadline) setState({ status: "timeout" });
        })
        .catch((error: unknown) => {
          // A missed poll is not fatal: the next one retries until the deadline.
          logError(CONTEXT, error);
          if (active && Date.now() > deadline) setState({ status: "timeout" });
        });
    }, PAYMENT_POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [awaitingId]);

  const submit = useCallback(async (request: SubscriptionRequest) => {
    setState({ status: "submitting" });
    try {
      const id = await startSubscriptionPayment(request);
      setState({ status: "awaiting", id });
    } catch (error) {
      logError(CONTEXT, error);
      setState({ status: "error", error: toAppError(error) });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
