import { useLanguage } from "../../../app/useLanguage";
import { showcaseLabs } from "../../workbench/data/showcase";

const topics = showcaseLabs.flatMap((lab) => lab.topics);

/** A slow, endless strip of the topics the labs cover. */
export function TopicMarquee() {
  const { language, tr } = useLanguage();
  const index = language === "en" ? 0 : 1;
  const strip = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0">
      {topics.map(({ icon: Icon, label }) => (
        <li
          key={label[0]}
          className="flex items-center gap-3 pr-16 text-2xl font-semibold tracking-tight text-stone-400 dark:text-stone-500"
        >
          <Icon className="size-6" aria-hidden="true" />
          {label[index]}
        </li>
      ))}
    </ul>
  );
  return (
    <section
      aria-label={tr("Topics covered", "Mada zinazoshughulikiwa")}
      className="mx-auto max-w-screen-2xl overflow-hidden border-t border-stone-200/60 py-10 dark:border-stone-800/60"
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {strip(false)}
        {strip(true)}
      </div>
    </section>
  );
}
