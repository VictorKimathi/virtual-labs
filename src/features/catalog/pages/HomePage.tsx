import { MotionConfig } from "motion/react";
import { ContinueBanner } from "../components/ContinueBanner";
import { HomeHero } from "../components/HomeHero";
import { LearningPaths } from "../components/LearningPaths";
import { SubjectPortals } from "../components/SubjectPortals";

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-12">
        <HomeHero />
        <ContinueBanner />
        <LearningPaths />
        <SubjectPortals />
      </div>
    </MotionConfig>
  );
}
