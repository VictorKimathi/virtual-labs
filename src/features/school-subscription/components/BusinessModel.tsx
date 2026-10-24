import { useLanguage } from "../../../app/useLanguage";
import {
  MONTHLY_PRICE_KES,
  YEARLY_FREE_MONTHS,
  YEARLY_PRICE_KES,
  YEARLY_SAVING_KES,
} from "../subscription.config";
import { formatKes } from "../subscription.format";

export function BusinessModel() {
  const { tr } = useLanguage();
  const steps = [
    {
      title: tr("The school subscribes", "Shule inajiunga"),
      body: tr(
        `One flat fee per school: ${formatKes(MONTHLY_PRICE_KES)} a month, or a yearly plan that saves money.`,
        `Ada moja kwa shule: ${formatKes(MONTHLY_PRICE_KES)} kwa mwezi, au mpango wa mwaka unaookoa pesa.`,
      ),
    },
    {
      title: tr(
        "Learners and teachers use the labs",
        "Wanafunzi na walimu hutumia maabara",
      ),
      body: tr(
        "Guided lessons, the practice bench and hundreds of simulations, in English and Kiswahili.",
        "Masomo yenye mwongozo, benchi la mazoezi na mamia ya uigaji, kwa Kiingereza na Kiswahili.",
      ),
    },
    {
      title: tr("The subscription renews", "Usajili unarudiwa"),
      body: tr(
        "Renew monthly or once a year. Predictable costs make it easy to budget.",
        "Rudia kila mwezi au mara moja kwa mwaka. Gharama zinazotabirika hurahisisha bajeti.",
      ),
    },
  ];
  const rows = [
    {
      label: tr("Monthly plan", "Mpango wa kila mwezi"),
      perYear: MONTHLY_PRICE_KES * 12,
      perMonth: MONTHLY_PRICE_KES,
    },
    {
      label: tr("Yearly plan", "Mpango wa kila mwaka"),
      perYear: YEARLY_PRICE_KES,
      perMonth: YEARLY_PRICE_KES / 12,
    },
  ];

  return (
    <div className="space-y-6">
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-kenya-green to-emerald-700 text-sm font-black text-white shadow-md shadow-kenya-green/30">
              {index + 1}
            </span>
            <h3 className="mt-3 font-extrabold">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            {tr(
              "Monthly and yearly cost per school",
              "Gharama ya kila mwezi na mwaka kwa shule",
            )}
          </caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th scope="col" className="px-4 py-3 font-bold">
                {tr("Plan", "Mpango")}
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                {tr("Cost per year", "Gharama kwa mwaka")}
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                {tr("Effective per month", "Kwa mwezi")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                <th scope="row" className="px-4 py-3 font-bold">
                  {row.label}
                </th>
                <td className="px-4 py-3">{formatKes(row.perYear)}</td>
                <td className="px-4 py-3">{formatKes(row.perMonth)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm font-semibold text-kenya-green dark:text-green-400">
        {tr(
          `Paying yearly gives you ${YEARLY_FREE_MONTHS} months free: you save ${formatKes(YEARLY_SAVING_KES)} a year.`,
          `Kulipa kwa mwaka kunakupa miezi ${YEARLY_FREE_MONTHS} bila malipo: unaokoa ${formatKes(YEARLY_SAVING_KES)} kwa mwaka.`,
        )}
      </p>
    </div>
  );
}
