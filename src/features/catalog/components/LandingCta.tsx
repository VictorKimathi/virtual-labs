import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { BrandMark } from "./BrandMark";
import { pillPrimary, pillSecondary } from "./landing.styles";

/** The closing call to sign up. */
export function LandingCta() {
  const { tr } = useLanguage();
  return (
    <section className="flex flex-col items-center px-4 py-24 text-center sm:px-10 lg:py-40">
      <BrandMark className="mb-12 size-12" iconClassName="size-6" />
      <h2 className="mb-12 max-w-4xl text-balance text-5xl font-bold leading-none tracking-tighter md:text-7xl">
        {tr("Ready to experiment?", "Uko tayari kufanya majaribio?")}
      </h2>
      <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
        <Link to="/signup" className={pillPrimary}>
          {tr("Create a free account", "Unda akaunti bure")}
        </Link>
        <Link to="/schools" className={pillSecondary}>
          {tr("Plans for schools", "Mipango ya shule")}
        </Link>
      </div>
    </section>
  );
}
