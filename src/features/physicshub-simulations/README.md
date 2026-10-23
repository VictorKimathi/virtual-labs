# PhysicsHub simulations

Browse and run simulations from [PhysicsHub](https://physicshub.github.io) (MIT licence). `/physicshub` lists them with filters (search, level, topic, difficulty kept in the URL); `/physicshub/:simId` runs one in an iframe using PhysicsHub's `?embed=1` mode, which hides its site navigation.

- **Catalog** — `data/physicshubSimulations.ts` was generated from `app/(core)/data/chapters.js` in the PhysicsHub repo (the internal benchmark tool is left out). Add new simulations there when PhysicsHub publishes them.
- **Filters** — `physicshub.filters.ts` filters in memory; a level matches a simulation's main level or any level it is also suitable for. Unknown URL values are ignored.
- **States** — empty results and unknown simulation ids have their own messages; the shared `EmbeddedSimulation` frame shows loading and a timeout error.
