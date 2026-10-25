import { MotionConfig } from "motion/react";
import { useLanguage } from "../../../app/useLanguage";
import { LabShowcase } from "../../workbench/components/LabShowcase";
import { HomeHero } from "../components/HomeHero";
import { RolePicker } from "../components/RolePicker";

export default function HomePage() {
  const { tr } = useLanguage();
  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-10">
        <HomeHero />
        <RolePicker />
        <section aria-labelledby="labs-heading">
          <h2
            id="labs-heading"
            className="mb-4 text-2xl font-black tracking-tight"
          >
            {tr("Choose your lab", "Chagua maabara yako")}
          </h2>
          <LabShowcase />
        </section>
      </div>
    </MotionConfig>
  );
}
