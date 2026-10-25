import { MotionConfig } from "motion/react";
import { useLanguage } from "../../../app/useLanguage";
import { FeaturedLessons } from "../components/FeaturedLessons";
import { HomeHero } from "../components/HomeHero";
import { HowItWorks } from "../components/HowItWorks";
import { LabCollage } from "../components/LabCollage";
import { LabGallery } from "../components/LabGallery";
import { LandingCta } from "../components/LandingCta";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";
import { Manifesto } from "../components/Manifesto";
import { MissionQuote } from "../components/MissionQuote";
import { TopicMarquee } from "../components/TopicMarquee";
import { WorkbenchFeature } from "../components/WorkbenchFeature";

/** The public front page at `/`. Signed-in users go on to `/dashboard`. */
export default function LandingPage() {
  const { tr } = useLanguage();
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-stone-50 text-stone-950 antialiased selection:bg-stone-950 selection:text-white dark:bg-stone-950 dark:text-stone-50 dark:selection:bg-white dark:selection:text-stone-950">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-24 focus:z-50 focus:rounded-full focus:bg-stone-950 focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        >
          {tr("Skip to content", "Ruka hadi maudhui")}
        </a>
        <LandingHeader />
        <main id="main">
          <HomeHero />
          <TopicMarquee />
          <LabCollage />
          <Manifesto />
          <HowItWorks />
          <WorkbenchFeature />
          <LabGallery />
          <MissionQuote />
          <FeaturedLessons />
          <LandingCta />
        </main>
        <LandingFooter />
      </div>
    </MotionConfig>
  );
}
