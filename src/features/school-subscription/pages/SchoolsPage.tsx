import { School } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { PageHeader } from "../../../shared/ui/PageHeader";
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
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
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
    <div className="space-y-10">
      <PageHeader
        icon={School}
        accent="red"
        eyebrow={tr("For schools", "Kwa shule")}
        title={tr(
          "Virtual labs for your school",
          "Maabara pepe kwa shule yako",
        )}
        description={tr(
          `Give every learner hands-on science, even without a physical lab. One flat subscription from ${formatKes(MONTHLY_PRICE_KES)} a month.`,
          `Wape wanafunzi wote sayansi ya vitendo, hata bila maabara halisi. Usajili mmoja kuanzia ${formatKes(MONTHLY_PRICE_KES)} kwa mwezi.`,
        )}
        actions={
          <a
            href="#subscribe"
            className="inline-flex min-h-12 items-center rounded-2xl bg-kenya-green px-6 text-sm font-extrabold text-white shadow-lg shadow-kenya-green/25 transition-transform hover:-translate-y-0.5"
          >
            {tr("Subscribe now", "Jisajili sasa")}
          </a>
        }
      />

      <div className="grid items-start gap-10 xl:grid-cols-3">
        <div className="space-y-10 xl:col-span-2">
          <Section title={tr("Pricing", "Bei")}>
            <PlanCards selected={plan} onChoose={setPlan} />
          </Section>

          <Section
            title={tr("What your school gets", "Shule yako inapata nini")}
          >
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
        </div>
        <div className="xl:sticky xl:top-24">
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
      </div>
    </div>
  );
}
