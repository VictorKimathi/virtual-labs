# Virtual Labs

A React + Vite + TypeScript starter for chemistry, physics, and biology. Each subject has a distinct path through a short lesson, a lab introduction, and a simulation workspace.

## Run locally

Requires a supported Node.js version for Vite and Firebase. Run `npm install`, copy `.env.example` to `.env.local`, then run `npm run dev`. The provided Firebase web configuration is public; never put a service-account key or private API token in `VITE_` variables.

## Routes

- `/` — overview
- `/:subjectId` — subject overview
- `/:subjectId/learn/:lessonSlug` — learning content
- `/:subjectId/labs/:labSlug` — lab introduction
- `/:subjectId/labs/:labSlug/run` — embedded simulation workspace

The three subject IDs are `chemistry`, `physics`, and `biology`. Route modules load lazily. Starter metadata is in `src/features/catalog/data/catalog.ts`.

## Firebase

`src/shared/firebase/firebase.ts` provides lazy modular App, Auth, Firestore, and optional Analytics accessors. No authentication flow or Firestore reads/writes are enabled in this initialization. The provided `databaseURL` is for Realtime Database; this project is prepared for Firestore instead, so that URL is not used. `firestore.rules` denies all access until a user data model and collection-specific authorization rules are implemented. `firestore.indexes.json` has no indexes because there are no queries yet. Review existing production rules before deploying these starter files to the supplied Firebase project. Hosting has an SPA rewrite in `firebase.json`.

## Simulation providers

- **PhET** is the best first provider across all three subjects: it has HTML5 simulations with documented embedding. The starter uses one PhET sim per subject. Its current license is **CC BY-NC 4.0**, with attribution required; commercial use needs a separate license. See [embedding help](https://phet.colorado.edu/en/help-center/getting-started) and [license](https://phet.colorado.edu/en/licensing). PhET-iO is a separately licensed interoperability product, not a general free API.
- **ChemCollective** is a strong chemistry option for wet-lab problems and instructor-authored activities. Use curated activity links first, then assess integration terms and browser support before embedding. See its [instructor guide](https://chemcollective.org/teachers/teacherGuide).
- **Learn.Genetics (University of Utah)** offers biology virtual labs such as DNA extraction, PCR, and gel electrophoresis. Use direct resource links until embedding permission is confirmed. See its [virtual labs](https://learn.genetics.utah.edu/content/labs/).
- **HHMI BioInteractive** is useful for biology interactives and videos; evaluate resources individually for curriculum fit and usage terms. See [BioInteractive](https://www.biointeractive.org/).

These are content providers, not assumed JSON APIs. Provider metadata stays local for now, avoiding a backend or scraping layer that the starter does not need.

## Commands

`npm run format`, `npm run lint`, `npm run typecheck`, and `npm run build`.
