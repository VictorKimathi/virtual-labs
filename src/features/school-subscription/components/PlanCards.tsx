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
  "relative flex flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-300";

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
    <ul className="grid gap-5 md:grid-cols-2">
      {plans.map((plan) => {
        const active = selected === plan.id;
        return (
          <li key={plan.id}>
            <div
              className={`${cardBase} h-full ${active ? "border-kenya-green bg-linear-to-br from-kenya-green to-emerald-700 text-white shadow-xl shadow-kenya-green/30" : "border-slate-200 bg-white hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"}`}
            >
              {plan.badge && (
                <span
                  className={`absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-extrabold ${active ? "bg-white text-kenya-green" : "bg-kenya-green text-white"}`}
                >
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-black">{plan.name}</h3>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">
                  {formatKes(plan.price)}
                </span>
                <span
                  className={`text-sm font-semibold ${active ? "text-green-100" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {plan.unit}
                </span>
              </p>
              <p
                className={`mt-3 flex-1 text-sm leading-6 ${active ? "text-green-50" : "text-slate-600 dark:text-slate-300"}`}
              >
                {plan.note}
              </p>
              <a
                href="#subscribe"
                onClick={() => onChoose(plan.id)}
                aria-pressed={active}
                className={`mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold transition-transform hover:-translate-y-0.5 ${active ? "bg-white text-kenya-green" : "border border-kenya-green text-kenya-green dark:text-green-400"}`}
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
