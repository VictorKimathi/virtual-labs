# Lab Bench

A 2D circuit bench organised by topic. `/workbench` is the Practice bench hub, grouped into Physics, Chemistry, and Biology. It links to the electricity circuit bench, three chemistry practicals, the 3D microscope station (`/sandbox/biology`), and the human anatomy station (`/biology/anatomy`). The hub has subject shortcuts, a text search, and a control to show or hide upcoming benches. `/workbench/:topicId` shows that topic's equipment palette, its experiments (`?experiment=<id>`), the bench, an inspector, and a readings dock with live readings, a V–I graph and a notebook.

- **Equipment** — `data/equipment.ts` defines each part's size, terminals, adjustable value and electrical model.
- **Experiments** — `data/*.experiments.ts` hold steps and goals. Goals are checks against the solved circuit and stay ticked once met.
- **Circuit** — `circuit/solveCircuit.ts` runs nodal analysis on the placed parts and wires: wires and ammeters are 0.01 Ω, voltmeters 10 MΩ, and sources have internal resistance. Bulb brightness is power over the rated 0.625 W.
- **Interaction** — drag from the palette, or click an item to add it. Drag parts to move them (arrow keys also work). Click two terminals to run a wire. Click a switch to toggle it. Use Delete to remove the selected item.

Only Electricity has equipment so far; Magnetism and Light show as coming soon.
