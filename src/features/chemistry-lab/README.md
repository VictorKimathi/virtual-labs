# Chemistry lab

Three animated practicals, each at its own route and linked from the Practice bench and from its guided lesson.

- **Acid–base indicators** (`/chemistry/indicators`) — pour ten samples into a six-tube rack, add universal indicator or red cabbage juice, and match the colour to the pH chart. Results fill an observation table.
- **Acid–base titration** (`/chemistry/titration`) — run a burette of 0.100 mol/L HCl into 25.0 mL of NaOH of unknown concentration. `chem/titration.ts` computes the strong acid–strong base pH, which drives the indicator colour, the pH probe and the live curve. Learners record titres and calculate the concentration.
- **Separating a mixture** (`/chemistry/separation`) — remove iron with a magnet, dissolve the salt, filter out the sand and evaporate the filtrate. Choosing a method out of order explains why it will not work yet.

Indicator colours are interpolated from pH stops in `data/indicators.ts`. Glassware is SVG animated with Motion.
