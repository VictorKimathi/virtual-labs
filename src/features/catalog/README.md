# Catalog

`data/catalog.ts` contains the three subjects and a small, typed lesson list. The Guided lessons page (`/labs`) filters it by subject and grade band. It is no longer in the main navigation, but lessons, quizzes and progress still link to it. Ohm's Law and Plant Cells have interactive content; the other entries are labelled previews.

## Landing page

`pages/LandingPage.tsx` is the public page at `/`, with no app sidebar. Its sections, top to bottom:

- `LandingHeader`: a floating black pill with the brand, anchor links, language and theme (`HeaderControls` with `tone="inverse"`), Log in and Join.
- `HomeHero`: a large centred headline and buttons above a big rounded panel holding the lazy-loaded React Three Fiber scene (`HeroScene`): a pulsing nucleus, one orbit per subject, drifting crystals and dust, and pointer parallax. Hovering a subject chip lights up its orbit. The scene pauses when off-screen or when the user prefers reduced motion. `HeroBackdrop` (pure CSS orbits) replaces it when WebGL is unavailable or the chunk is loading.
- `TopicMarquee`: an endless strip of lab topics, which stops for reduced motion.
- `LabCollage`: floating glass cards with the lab scenes around one big line. They stack on small screens. The Kiswahili card is a working language switch.
- `Manifesto`, `MissionQuote` and `LandingCta`: large statements and the closing sign-up call.
- `HowItWorks` and `WorkbenchFeature`: split sections with a sample card on one side and a `FeatureRail` on the other. The rail highlights the item you hover or focus.
- `LabGallery`: the four labs as large cards, plus links to simulations, lessons and school plans.
- `FeaturedLessons`: the first available guided lesson for each subject.
- `LandingFooter`: a dark footer with every way into the product.

The lab cards and topics come from `src/features/workbench/data/showcase.ts`. The shared class names are in `components/landing.styles.ts`. The page uses the stone palette, with `dark:` variants throughout.

`hero.config.ts` holds orbit geometry, the theme-aware 3D palette and the subject card styles used by the lessons and progress pages.

The Guided lessons page (`LabBrowserPage`) uses the shared `PageHeader`, `FilterChip`, `RevealItem`, `TiltCard` and `EmptyState` from `src/shared/ui/`.
