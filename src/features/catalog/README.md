# Catalog

`data/catalog.ts` contains the three subjects and a small, typed lesson list. The Guided lessons page (`/labs`) filters it by subject and grade band. It is no longer in the main navigation, but lessons, quizzes and progress still link to it. Ohm's Law and Plant Cells have interactive content; the other entries are labelled previews.

## Home page

`pages/HomePage.tsx` composes the landing page from `components/`:

- `HomeHero` — full-bleed hero over a lazy-loaded React Three Fiber scene (`HeroScene`): a pulsing nucleus, one orbit per subject, drifting crystals and dust, and pointer parallax. Hovering a subject chip lights up its orbit. The scene pauses when off-screen or when the user prefers reduced motion, and `HeroBackdrop` (pure CSS orbits) replaces it when WebGL is unavailable or the chunk is loading.
- `RolePicker` — the Student / Teacher picker; each opens its dashboard from the classroom feature (`/student`, `/teacher`).
- `LabShowcase` (from the workbench feature) — the two virtual labs, Physics and Chemistry, as large cards with a drawn scene of each bench. They are the main entry point; the hero buttons lead to the labs and to simulations.

`hero.config.ts` holds orbit geometry, the theme-aware 3D palette and the subject card styles used by the lessons and progress pages.

The Guided lessons page (`LabBrowserPage`) uses the shared `PageHeader`, `FilterChip`, `RevealItem`, `TiltCard` and `EmptyState` from `src/shared/ui/`.
