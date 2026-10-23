# Virtual Labs roadmap

This is an initialization checklist, not a plan to build a full learning platform at once. Complete one useful lab per subject before adding accounts, progress tracking, or a content backend.

## Shared foundation

- [x] Set up typed, lazy routes for overview, subject, lesson, lab introduction, and simulation runner.
- [x] Add Tailwind styling, responsive navigation, and light/dark themes.
- [x] Configure Firebase web SDK, local environment example, Hosting rewrite, and deny-all Firestore starter rules.
- [x] Add one curated PhET activity in each subject and provider-site fallbacks.
- [ ] Decide age range, curriculum, and whether the site is strictly non-commercial before expanding PhET use.
- [ ] Review the supplied Firebase project's existing rules and deploy collection-specific rules only when user data is introduced.
- [ ] Check embedded simulation behavior on phone, tablet, keyboard, and slow networks.

## Chemistry

- [ ] Review and expand the acids/bases introduction with diagrams and a short prediction prompt.
- [ ] Write an observation sheet for pH, concentration, and conductivity.
- [ ] Add a second activity on reaction balancing or concentration.
- [ ] Evaluate ChemCollective wet-lab activities and link suitable ones with correct attribution.

## Physics

- [ ] Expand the force and motion lesson with a balanced/unbalanced force example.
- [ ] Add a simple evidence prompt for friction and net force observations.
- [ ] Add an energy or circuits activity after the first lab is reviewed.
- [ ] Check PhET sim controls and accessibility for each selected activity.

## Biology

- [ ] Review natural selection wording and add a before/after population observation prompt.
- [ ] Add a cells or genetics activity after the first lab is reviewed.
- [ ] Evaluate Learn.Genetics DNA and PCR labs, plus HHMI BioInteractive resources, for linking and usage terms.
- [ ] Make sure learners can explain evidence from the simulation without implying individuals evolve during a run.

## Later, only if needed

- [ ] Add Firebase Auth and saved progress once there is a clear user journey that needs persistence.
- [ ] Add a content management workflow when editing the local catalog becomes a bottleneck.
- [ ] Add analytics only after defining useful events and a privacy notice.
- [ ] Addd swahili and voice speak.