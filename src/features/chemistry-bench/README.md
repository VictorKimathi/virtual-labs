# Chemistry virtual lab

`/workbench/chemistry` is a 2D chemistry bench with 125 items in nine sections: glassware, heating, holding and support, separation, measurement, electrochemistry, reagents and indicators, safety, and modern instruments. It uses the Practice bench layout: a sandbox column on the left and the bench on the right.

## Layout

- **Equipment**: searchable list by section. Drag onto the bench or click to add.
- **Inspector**: a close-up, "What you see", settings, notes about mistakes, readouts, plots and "Your reading" boxes.
- **Safety**: protective clothing, the incident log with advice, and buttons to respond with the right safety equipment.
- **Experiment**: steps and goals that check what is on the bench. `?experiment=<id>` opens one directly. Acid–base titration is first.
- Under the bench: live readings, a graph of any two recorded quantities, and a notebook.

## How parts work together

There are no wires. Parts are linked through settings ("Add from", "Pour into", "Heated by", "Run into", "Sample") that store the other part's `num`, or by overlapping them on the bench (a thermometer in a beaker, filter paper in a funnel, electrodes in a beaker, a vessel in the fume cupboard).

## Engine

`engine/` holds the chemistry. Contents are millilitres of water and oil plus millimoles of dissolved species and solids, so titrations and yields give real answers.

- `reactions.ts` runs the rules in a fixed order: dissolving, sodium with water, metals with acid (hydrogen at a rate), carbonates, neutralisation with weak acids and bases, precipitation by solubility product, dissolving in excess (zincate, plumbite, tetraamminecopper), displacement, and redox with manganate(VII), iodide and hydrogen peroxide.
- `contents.ts` gives pH, conductivity, absorbance and what the liquid looks like: colour, cloudiness, sediment, bubbles and boiling.
- `heating.ts`, `electrolysis.ts` and `cells.ts` cover heating, boiling, igniting solids and electrolysis by Faraday's law.
- `operations.ts` is every bench action: adding, pouring, rinsing, emptying, heating, filtering and draining. Safety rules raise incidents here.
- Gas is given off over time on the bench clock, which runs three times faster than real time.

## Set-up traps

- pH meter: hidden slope and offset errors until calibrated at pH 7, then pH 4 or 10. Carry-over if the probe is not rinsed.
- Balance: level, draught shield and tare.
- Burette: rinse with the solution, air bubble in the tip, meniscus parallax, initial and final readings.
- Pipette: rinse, fill to the mark, use a filler, do not blow out.
- Volumetric flask: make up to the mark with fine additions.
- Thermometer: zero error in ice, touching the wall, parallax.
- Conductivity meter: calibration with the standard, temperature compensation.
- Colorimeter: blank at each wavelength, cuvette faces, absorbance above 2.
- Bunsen burner: air hole for a blue flame. A luminous flame hides flame-test colours.
- Gas syringe: zero, sticking plunger, full syringe.
- Wet glassware dilutes the solution unless it is rinsed with that solution.

## Safety

Incidents include swallowing from a pipette, eye splashes without goggles, burns from concentrated reagents, water added to concentrated acid, heating a stoppered vessel, fires with ethanol near a flame, sodium fires, toxic gases outside the fume cupboard, spills and wrong disposal. Each has advice and the remedies that work. A wrong remedy explains why it fails, for example water or CO₂ on a metal fire.

## Adding equipment

Add the kind to `data/kinds.ts`, its definition to the section file in `data/catalogue/`, and its drawing to `components/glyphs/`. TypeScript fails the build if a kind has no definition or drawing. Reagents are defined once in `data/reagents.ts`, and their bottles are built from that.

## Limits

- Solutions are treated as ideal, and pH uses simple strong, weak and buffer formulas.
- The melting point block and the instruments' samples (GC, MS, IR) use built-in data rather than bench contents, except that the GC can analyse ethanol and water from a vessel.
- Heating uses a heating-time setting rather than the running clock.
