import { useLanguage } from "../../../app/useLanguage";

/** The one-paragraph reason the product exists. */
export function Manifesto() {
  const { tr } = useLanguage();
  return (
    <section className="relative mx-auto flex max-w-screen-2xl flex-col items-center px-4 py-24 text-center sm:px-10 lg:py-50">
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        fill="none"
        strokeWidth="0.5"
        className="pointer-events-none absolute right-1/10 top-0 size-64 stroke-kenya-green opacity-10 lg:size-100 dark:stroke-green-400"
      >
        <circle cx="50" cy="50" r="48" />
        <ellipse cx="50" cy="50" rx="24" ry="48" />
        <ellipse cx="50" cy="50" rx="48" ry="24" />
        <line x1="2" x2="98" y1="50" y2="50" />
        <line x1="50" x2="50" y1="2" y2="98" />
      </svg>
      <p className="relative max-w-6xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {tr(
          "Every student deserves a lab bench. Bunifu Labz brings real physics, chemistry and biology practicals to any screen, in English and Kiswahili, so no school is held back by missing equipment.",
          "Kila mwanafunzi anastahili meza ya maabara. Bunifu Labz inaleta majaribio halisi ya fizikia, kemia na biolojia kwenye skrini yoyote, kwa Kiingereza na Kiswahili, ili hakuna shule inayobaki nyuma kwa kukosa vifaa.",
        )}
      </p>
    </section>
  );
}
