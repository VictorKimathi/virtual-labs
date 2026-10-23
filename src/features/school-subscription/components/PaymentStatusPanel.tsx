import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../../../app/useLanguage";
import type { SubscriptionPaymentState } from "../hooks/useSubscriptionPayment";
import { formatKes } from "../subscription.format";

type Props = {
  state: Extract<
    SubscriptionPaymentState,
    { status: "awaiting" | "paid" | "failed" | "timeout" }
  >;
  amount: number;
  onRetry: () => void;
  onDone: () => void;
};

const panelClass = "rounded-2xl border p-8 text-center";
const buttonClass = "mt-4 min-h-11 rounded-xl border px-5 text-sm font-bold";
const bodyClass =
  "mx-auto mt-1 max-w-md text-sm leading-6 text-slate-700 dark:text-slate-300";

export function PaymentStatusPanel({ state, amount, onRetry, onDone }: Props) {
  const { tr } = useLanguage();
  const price = formatKes(amount);

  if (state.status === "awaiting") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${panelClass} border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900`}
      >
        <LoaderCircle
          className="mx-auto h-10 w-10 animate-spin text-kenya-green motion-reduce:animate-none dark:text-green-300"
          aria-hidden="true"
        />
        <h3 className="mt-3 text-xl font-extrabold">
          {tr("Check your phone", "Angalia simu yako")}
        </h3>
        <p className={bodyClass}>
          {tr(
            `We sent an M-Pesa prompt for ${price}. Enter your M-Pesa PIN to pay. Keep this page open until the payment is confirmed.`,
            `Tumetuma ombi la M-Pesa la ${price}. Weka PIN yako ya M-Pesa kulipa. Acha ukurasa huu wazi hadi malipo yathibitishwe.`,
          )}
        </p>
      </motion.div>
    );
  }

  if (state.status === "paid") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${panelClass} border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950`}
      >
        <CircleCheck
          className="mx-auto h-10 w-10 text-kenya-green dark:text-green-300"
          aria-hidden="true"
        />
        <h3 className="mt-3 text-xl font-extrabold">
          {tr("Payment received", "Malipo yamepokelewa")}
        </h3>
        <p className={bodyClass}>
          {tr(
            `Thank you. We received ${price} and your subscription is confirmed. We will contact you soon to get your school started.`,
            `Asante. Tumepokea ${price} na usajili wako umethibitishwa. Tutawasiliana nawe hivi karibuni kuanzisha shule yako.`,
          )}
        </p>
        <button
          type="button"
          onClick={onDone}
          className={`${buttonClass} border-kenya-green text-kenya-green dark:text-green-300`}
        >
          {tr("Subscribe another school", "Sajili shule nyingine")}
        </button>
      </motion.div>
    );
  }

  const failed = state.status === "failed";
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${panelClass} ${failed ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950" : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"}`}
    >
      <CircleAlert
        className={`mx-auto h-10 w-10 ${failed ? "text-kenya-red dark:text-red-300" : "text-amber-600 dark:text-amber-300"}`}
        aria-hidden="true"
      />
      <h3 className="mt-3 text-xl font-extrabold">
        {failed
          ? tr("Payment not completed", "Malipo hayakukamilika")
          : tr("Still waiting for payment", "Bado tunasubiri malipo")}
      </h3>
      <p className={bodyClass}>
        {failed
          ? tr(
              "The payment was cancelled or declined, so nothing was charged. Check your M-Pesa balance and try again.",
              "Malipo yalighairiwa au kukataliwa, kwa hivyo hakuna kilichokatwa. Angalia salio lako la M-Pesa kisha ujaribu tena.",
            )
          : tr(
              "We have not received confirmation yet. If M-Pesa already deducted the money, please contact us instead of paying again.",
              "Bado hatujapokea uthibitisho. Ikiwa M-Pesa tayari imekata pesa, tafadhali wasiliana nasi badala ya kulipa tena.",
            )}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={`${buttonClass} ${failed ? "border-kenya-red text-kenya-red dark:border-red-300 dark:text-red-300" : "border-amber-600 text-amber-700 dark:border-amber-300 dark:text-amber-300"}`}
      >
        {tr("Try again", "Jaribu tena")}
      </button>
    </motion.div>
  );
}
