import { useLanguage } from "../../../app/useLanguage";
import { BrandMark } from "./BrandMark";

/** A short statement of what the team believes. */
export function MissionQuote() {
  const { tr } = useLanguage();
  return (
    <figure className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-10 lg:py-40">
      <blockquote className="mb-16 max-w-5xl text-balance text-4xl font-medium leading-tight tracking-tight md:text-6xl">
        {tr(
          "“Science is learnt by doing. We built Bunifu Labz so every student can run the experiment, not just read about it.”",
          "“Sayansi hujifunzwa kwa vitendo. Tuliunda Bunifu Labz ili kila mwanafunzi afanye jaribio, si kusoma tu kulihusu.”",
        )}
      </blockquote>
      <figcaption className="flex items-center gap-4">
        <BrandMark className="size-14" iconClassName="size-7" />
        <span className="text-left">
          <span className="block text-sm font-bold">Bunifu Labz</span>
          <span className="block text-xs text-stone-500 dark:text-stone-400">
            {tr("Our promise", "Ahadi yetu")}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
