# Catalog

`data/catalog.ts` contains the three subjects and a small, typed lesson list. The Guided lessons page (`/labs`) filters it by subject and grade band. Ohm's Law and Plant Cells have interactive content; the other entries are labelled previews.

## Home page

`pages/HomePage.tsx` composes the landing page from `components/`:

- `HomeHero` — full-bleed hero over a lazy-loaded React Three Fiber scene (`HeroScene`): a pulsing nucleus, one orbit per subject, drifting crystals and dust, and pointer parallax. Hovering a subject chip lights up its orbit. The scene pauses when off-screen or when the user prefers reduced motion, and `HeroBackdrop` (pure CSS orbits) replaces it when WebGL is unavailable or the chunk is loading.
- `ContinueBanner`, `LearningPaths`, `SubjectPortals` — entry points into lessons, the bench and simulations. `TiltCard` (in `src/shared/ui/`) adds pointer-driven 3D tilt (disabled for touch and reduced motion).

`hero.config.ts` holds orbit geometry and the theme-aware 3D palette.

The Guided lessons page (`LabBrowserPage`) uses the shared `PageHeader`, `FilterChip`, `RevealItem`, `TiltCard` and `EmptyState` from `src/shared/ui/`.
