# Kenya Virtual Science Lab

Desktop workspace built with React + Vite + TypeScript for Kenyan secondary school learners in the CBE STEM pathway. A persistent sidebar leads to Home, Lab Browser, Guided Lab, Sandbox, Pre-Assessment Quiz, and Progress. The app offers English/Kiswahili and light/dark themes. Tailwind provides all UI styling.

## Run locally

Run `npm install`, copy `.env.example` to `.env.local`, then run `npm run dev`. Use `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run build` before shipping.

## Routes

- `/` — home
- `/labs` — level → subject → strand → lab browser
- `/labs/ohms-law` — seven-step guided lab; `?step=0..6` opens a step
- `/labs/ohms-law/pre-assessment` — five-question quiz
- `/sandbox` — 3D Physics circuit workbench; `?mode=guided` opens guided mode
- `/sandbox/biology` — 3D Biology microscope workbench and plant cell preview
- `/progress` — sample learner progress

Route modules load lazily. Static subject and lab metadata is in `src/features/catalog/data/catalog.ts`. Ohm's Law is the detailed demo; other lab entries are previews. Physics and Biology have 3D starter benches with equipment drag and placement. Physics readouts, the Biology observation preview, and progress figures are illustrative; calculated behaviour and validated specimen imagery are planned.

## Firebase

`src/shared/firebase/firebase.ts` contains modular App, Auth, Firestore, and optional Analytics accessors using public `VITE_` configuration. No authentication or Firestore data flow is active in this UI initialization. `firestore.rules` denies all access until a data model and collection-specific authorization rules exist; `firestore.indexes.json` is empty because no queries exist. Review the supplied Firebase project's live rules before any deployment. Hosting SPA rewrite is configured in `firebase.json`.

## Content providers

The prior PhET, ChemCollective, Learn.Genetics, and HHMI research remains useful for future real lab integration. See [PhET's embedding help](https://phet.colorado.edu/en/help-center/getting-started) and [current license](https://phet.colorado.edu/en/licensing). PhET requires attribution under CC BY-NC 4.0 and separate commercial licensing. ChemCollective has [chemistry virtual lab activities](https://chemcollective.org/teachers/teacherGuide), while [Learn.Genetics](https://learn.genetics.utah.edu/content/labs/) and [HHMI BioInteractive](https://www.biointeractive.org/) have biology resources. Assess each provider's usage terms before embedding.
