# Biology Lab

`/workbench/biology` is a 2D biology bench with 103 items in nine sections: microscopy, dissection, food tests and enzymes, physiology, ecology and fieldwork, genetics and classification, microbiology, safety, and modern instruments. A link in the header opens the 3D human anatomy model at `/biology/anatomy` (the `biology-lab` feature).

## What is different from the other labs

- **Bench clock.** Living processes run on bench time. The time bar above the bench pauses the clock or speeds it up from real time to one day per second, so germination or a three-day culture takes seconds. `engine/time.ts` holds the speeds, and `hooks/useBioClock.ts` moves the clock on.
- **Microscope.** `engine/microscope.ts` works out the view from the objective, the coarse and fine focus, the light, the diaphragm, the slide and the stain. `components/MicroscopeView.tsx` draws the specimen to scale in micrometres, blurred when out of focus, with air bubbles, a cracked slide and the eyepiece graticule. Each microscope has a slightly different true graticule scale, so students must calibrate it with the stage micrometer before measuring cells.
- **Virtual dissection.** `data/specimens.ts` lists the steps, tools and organs of each specimen. Students work through the steps with the right tools, then name the marked organs.
- **Variables and controls.** Experiments compare a test with a control: boiled and active enzyme, seeds with and without water or oxygen, light and dark, with and without a control tube.

## Engine

- `engine/food.ts` keeps nutrients in mg and reagents in mL in each tube. It brings a tube up to date at a steady temperature: amylase and pepsin digest at rates that depend on temperature and pH, Benedict's reacts only when hot and not acidic, acid splits sucrose, and catalase froths. `tubeLook` turns the contents into a colour and the student's observations.
- `engine/operations.ts` holds adding and pouring between tubes, water bath temperatures that warm up and cool down, incidents and remedies.
- Timed parts such as the potometer, respirometer and pondweed keep the rate before a change and ease towards the new rate, so readings taken too soon after a change are wrong, as in a real lab.

## Set-up traps

- Microscope: start on low power, coarse then fine focus, never coarse focus on high power (the slide cracks), light and diaphragm, calibrate the graticule.
- Wet mounts: one or two drops, the right stain, lower the cover slip at an angle with a mounting needle.
- Potometer: cut the shoot under water, seal the joints, one bubble, reset with the reservoir, wait for a steady rate.
- Respirometer: soda lime, a control tube, ten minutes to settle before closing the clip.
- Water bath: let it reach the set temperature before adding tubes; check it with a thermometer.
- Micropipette: volume within range, a fresh tip, first stop to draw.
- Colorimeter and data logger: zero with a blank, calibrate gas probes.
- Electronic balance: level, draught shield, tare.
- Quadrats: random coordinates; one placed by hand is flagged as biased.
- Microbiology: sterile agar, flamed and cooled loop, two strips of tape, 25–30 °C, never open after incubation.

## Adding equipment

Add the kind to `data/kinds.ts`, its definition to the section file in `data/catalogue/`, and its drawing to `components/glyphs/`. TypeScript fails the build if a kind has no definition or drawing.

## Limits

- Tube temperature is taken as steady between actions, so changing a water bath's setting while a tube is in it is approximate.
- Field plots, specimens and instruments use built-in data seeded per item rather than a full ecological or genetic model.
