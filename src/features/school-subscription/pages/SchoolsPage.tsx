import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { BusinessModel } from "../components/BusinessModel";
import { IncludedList } from "../components/IncludedList";
import { PlanCards } from "../components/PlanCards";
import { SubscribeForm } from "../components/SubscribeForm";
import { MONTHLY_PRICE_KES } from "../subscription.config";
import { formatKes } from "../subscription.format";
import type { BillingPeriod } from "../subscription.types";

function Section({
  title,
  intro,
  id,
  children,
}: {
  title: string;
  intro?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        {intro && (
          <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
            {intro}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function SchoolsPage() {
  const { tr } = useLanguage();
  const [plan, setPlan] = useState<BillingPeriod>("yearly");

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("Virtual labs for your school", "Maabara pepe kwa shule yako")}
        </h1>
        <p className="mt-2 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
          {tr(
            `Give every learner hands-on science, even without a physical lab. One flat subscription from ${formatKes(MONTHLY_PRICE_KES)} a month.`,
            `Wape wanafunzi wote sayansi ya vitendo, hata bila maabara halisi. Usajili mmoja kuanzia ${formatKes(MONTHLY_PRICE_KES)} kwa mwezi.`,
          )}
        </p>
      </div>

      <Section title={tr("Pricing", "Bei")}>
        <PlanCards selected={plan} onChoose={setPlan} />
      </Section>

      <Section title={tr("What your school gets", "Shule yako inapata nini")}>
        <IncludedList />
      </Section>

      <Section
        title={tr("How the subscription works", "Usajili unafanyaje kazi")}
        intro={tr(
          "A simple model: schools pay one flat fee, and everyone at the school uses the labs.",
          "Mfumo rahisi: shule hulipa ada moja, na kila mtu shuleni hutumia maabara.",
        )}
      >
        <BusinessModel />
      </Section>

      <Section
        id="subscribe"
        title={tr("Subscribe your school", "Jisajili shule yako")}
        intro={tr(
          "Tell us about your school and pay securely with M-Pesa. You will get a payment prompt on your phone.",
          "Tuambie kuhusu shule yako na ulipe kwa usalama kupitia M-Pesa. Utapokea ombi la malipo kwenye simu yako.",
        )}
      >
        <SubscribeForm plan={plan} onPlanChange={setPlan} />
      </Section>
    </div>
  );
}
