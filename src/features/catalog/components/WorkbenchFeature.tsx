import { Play } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { BrandMark } from "./BrandMark";
import { FeatureRail } from "./FeatureRail";
import { section, sectionHeading } from "./landing.styles";

/** What a lab bench does, beside a sample task card. */
export function WorkbenchFeature() {
  const { tr } = useLanguage();
  const features = [
    {
      title: tr("The full equipment list", "Orodha kamili ya vifaa"),
      text: tr(
        "Drag cells, meters, beakers and microscopes onto the bench, just like the school lab.",
        "Buruta seli, mita, bika na hadubini kwenye meza, kama maabara ya shule.",
      ),
    },
    {
      title: tr("Live readings", "Vipimo vya moja kwa moja"),
      text: tr(
        "Meters and instruments respond as you build, so every result is one you measured.",
        "Mita na vifaa vinajibu unapounda, kwa hivyo kila tokeo ni ulilopima mwenyewe.",
      ),
    },
    {
      title: tr("Guided tasks", "Kazi za kuongozwa"),
      text: tr(
        "Step-by-step tasks tell students what to record and check their readings.",
        "Kazi za hatua kwa hatua zinawaambia wanafunzi cha kurekodi na kukagua vipimo vyao.",
      ),
    },
    {
      title: tr("Safety built in", "Usalama umejengwa ndani"),
      text: tr(
        "Learn the safety rules for each practical before anything can go wrong.",
        "Jifunze kanuni za usalama za kila jaribio kabla jambo lolote halijaharibika.",
      ),
    },
  ];
  return (
    <section
      aria-labelledby="bench-heading"
      className={`${section} py-16 lg:py-30`}
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <div className="order-2 max-w-lg lg:order-1">
          <h2 id="bench-heading" className={`mb-12 ${sectionHeading}`}>
            {tr(
              "Real equipment. Real readings.",
              "Vifaa halisi. Vipimo halisi.",
            )}
          </h2>
          <FeatureRail items={features} />
        </div>
        <div className="order-1 flex h-112 items-center justify-center rounded-4xl border border-stone-200/60 bg-linear-to-tr from-sky-100 to-blue-100 p-6 shadow-inner sm:p-8 lg:order-2 lg:h-175 dark:border-stone-800/60 dark:from-stone-900 dark:to-blue-950">
          <div className="w-full max-w-lg rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-stone-900/80">
            <div className="mb-6 flex items-center gap-3">
              <BrandMark className="size-6" iconClassName="size-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {tr("Physics lab", "Maabara ya fizikia")}
              </span>
            </div>
            <p className="mb-6 rounded-xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-stone-950/40">
              {tr(
                "Connect a cell, a bulb and an ammeter in series. Record the current, then add a second cell and record it again.",
                "Unganisha seli, balbu na ammita kwa mfululizo. Rekodi mkondo, kisha ongeza seli ya pili na urekodi tena.",
              )}
            </p>
            <div className="flex justify-end">
              <span className="flex size-9 animate-pulse items-center justify-center rounded-full bg-linear-to-r from-kenya-green to-emerald-500 text-white shadow-md motion-reduce:animate-none">
                <Play className="size-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
