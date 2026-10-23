# Falstad simulators

Embeds Paul Falstad's JavaScript circuit and wave simulators from falstad.com. `/falstad` shows a type filter (circuits, waves, fields), a card per simulator and the running simulator below. The selection lives in the URL (`?sim=<id>&circuit=<file>`).

- **Catalog** — `data/simulators.ts` lists the simulators and `data/circuitPresets.ts` the example circuits for the circuit simulator (file names come from Falstad's `setuplist.txt`). Unknown URL values fall back to the defaults.
- **Embedding** — `falstad.urls.ts` builds the iframe URL on `FALSTAD_ORIGIN`. The frame shows a loading state and an error with a hint if the simulator has not started after 20 seconds.
- **Licence** — Falstad allows unmodified use with credit and a link to his page; CircuitJS is GPL-2.0. The simulators are embedded unmodified and credited on the page.
