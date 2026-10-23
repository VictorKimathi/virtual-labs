# PhET simulations

Browse and run [PhET](https://phet.colorado.edu) HTML5 simulations. `/simulations` lists them with filters; `/simulations/:simName` runs one in an iframe.

- **API** — `phet.api.ts` fetches the PhET metadata API (`PHET_CATALOG_URL`), retrying busy or network failures. If it still fails, it falls back to `data/phetSnapshot.json` (a trimmed saved copy, loaded on demand) and the list page shows a notice. Refresh the snapshot with `node scripts/update-phet-snapshot.mjs`.
- **Validation** — `phet.schema.ts` validates the response and only keeps simulations whose URLs are on `VITE_PHET_ORIGIN`.
- **Filters** — `phet.filters.ts` builds subject, topic and level options from the API's categories and filters by text search. `usePhetFilters` keeps the filters in the URL (`?q=&subject=&topic=&level=&sort=`).
- **States** — loading skeleton, error with retry, empty result and the simulation list are handled on both pages.

Simulations are credited to PhET Interactive Simulations, University of Colorado Boulder (CC-BY 4.0).
