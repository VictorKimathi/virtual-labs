import { Check } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import {
  MONTHLY_PRICE_KES,
  YEARLY_FREE_MONTHS,
  YEARLY_PRICE_KES,
  YEARLY_SAVING_KES,
} from "../subscription.config";
import { formatKes } from "../subscription.format";
import type { BillingPeriod } from "../subscription.types";

type Props = {
  selected: BillingPeriod;
  onChoose: (plan: BillingPeriod) => void;
};

const cardBase =
  "relative flex flex-col rounded-2xl border p-6 transition-colors";

export function PlanCards({ selected, onChoose }: Props) {
  const { tr } = useLanguage();
  const plans: {
    id: BillingPeriod;
    name: string;
    price: number;
    unit: string;
    note: string;
    badge?: string;
  }[] = [
    {
      id: "monthly",
      name: tr("Monthly", "Kila mwezi"),
      price: MONTHLY_PRICE_KES,
      unit: tr("per month", "kwa mwezi"),
      note: tr(
        "Pay month by month. The easiest way to start.",
        "Lipa mwezi kwa mwezi. Njia rahisi ya kuanza.",
      ),
    },
    {
      id: "yearly",
      name: tr("Yearly", "Kila mwaka"),
      price: YEARLY_PRICE_KES,
      unit: tr("per year", "kwa mwaka"),
      note: tr(
        `Pay once a year and get ${YEARLY_FREE_MONTHS} months free (save ${formatKes(YEARLY_SAVING_KES)}).`,
        `Lipa mara moja kwa mwaka upate miezi ${YEARLY_FREE_MONTHS} bila malipo (okoa ${formatKes(YEARLY_SAVING_KES)}).`,
      ),
      badge: tr("Best value", "Thamani bora"),
    },
  ];

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => {
        const active = selected === plan.id;
        return (
          <li key={plan.id}>
            <div
              className={`${cardBase} h-full ${active ? "border-kenya-green bg-green-50 dark:bg-green-950" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
            >
              {plan.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-kenya-green px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-extrabold">{plan.name}</h3>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">
                  {formatKes(plan.price)}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {plan.unit}
                </span>
              </p>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {plan.note}
              </p>
              <a
                href="#subscribe"
                onClick={() => onChoose(plan.id)}
                aria-pressed={active}
                className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold ${active ? "bg-kenya-green text-white" : "border border-kenya-green text-kenya-green dark:text-green-400"}`}
              >
                {active && <Check className="h-4 w-4" aria-hidden="true" />}
                {tr(
                  `Choose ${plan.name.toLowerCase()}`,
                  `Chagua ${plan.name.toLowerCase()}`,
                )}
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
