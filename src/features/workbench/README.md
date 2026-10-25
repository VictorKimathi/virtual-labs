# Practice bench

`/workbench` shows the virtual labs as large cards (`components/LabShowcase.tsx`, also used on the dashboard; the card data is in `data/showcase.ts` and is shared with the landing page): the **Physics Lab** at `/workbench/physics`, the **Chemistry Lab** at `/workbench/chemistry` (`src/features/chemistry-bench/`), the **Biology Lab** at `/workbench/biology` (`src/features/biology-bench/`) and the 3D **Human Anatomy** model at `/biology/anatomy`. The Physics Lab is a 2D bench with the full KCSE practical equipment list (125 items in nine sections).

The chemistry and biology labs share the wire-free bench components in `components/`: `LabCanvas`, `LabPalette`, `LabInspector`, `LabControlField` and `LabSafetyPanel`. Each lab wraps them with its own definitions and drawings. `SandboxPanel` and `ExperimentPanel` are shared by all three labs.

## Layout

A sandbox column on the left and the bench canvas on the right.

- **Equipment** tab — searchable list grouped by section. Drag an item onto the bench, or click it to drop it in the first free spot.
- **Inspector** tab — opens when a part is selected. It shows a close-up of the instrument, its settings, notes about set-up mistakes, readouts, and "Your reading" boxes that check what the student reads.
- **Experiment** tab — a list of experiments with steps and goals that check the set-up. `?experiment=<id>` opens one directly.
- Under the canvas: live readings, a graph that plots any two recorded quantities (with gradient and intercept), and a notebook.

## Equipment

`data/kinds.ts` lists every kind by section. Each section has a file in `data/catalogue/` that gives every kind a name and description in English and Kiswahili, its size, settings (`controls`), terminals, an `analyse` function and, where a solved circuit can change it for good, a `react` function (a fuse blowing, a bulb burning out). `components/glyphs/` draws each kind from the numbers `analyse` shares in `visual`. TypeScript fails the build if a kind has no definition or no drawing.

Settings are plain numbers on `part.params`, so the bench state stays serialisable.

## Set-up traps

The instruments where students can get the set-up wrong behave like the real thing:

- ammeter, voltmeter, milliammeter, galvanometer — hidden zero error and a zero screw, range choice, reversed polarity, off-scale, and a.c. on a d.c. meter
- multimeter — mode and range, a.c. against d.c., ohms only with the power off, REL to zero the leads
- power supply — voltage, d.c. or a.c., current limit
- vernier callipers and micrometer — hidden zero error, close the jaws to find it, ratchet against thimble
- beam, triple-beam and electronic balances, spring balance — zero screw, tare, levelling
- thermometers — ice point, parallax, clinical thermometer must be shaken down
- measuring cylinder, burette, pipette — eye level against the meniscus
- CRO — power, brightness, focus, centring, time base, Y-gain
- rheostat — overload warning if the circuit is not started at maximum resistance
- stopwatch — reset first; time a real event to see reaction-time error

For the scale-reading instruments (rules, vernier, micrometer, cylinder, liquid thermometer, spring balance), the reading appears in Live readings only when **Reading help** is switched on for that instrument.

## Circuit solver

`circuit/solveCircuit.ts` runs nodal analysis on the placed parts and wires: wires are 0.01 Ω and sources have internal resistance. It handles three- and four-terminal parts (rheostat, slide wire, metre bridge, transformer), diodes and LEDs (repeating the solve until the on/off states settle), a transistor used as a switch, supply current limits, an ohmmeter that reads with every source switched off, and a.c. as an effective (rms) value. `useBench` re-solves after every change and applies permanent effects before the page renders.

## Limits

- Capacitors are modelled in the d.c. steady state only. A.c. is solved at its rms value, so phase effects are not shown.
- The transformer is ideal; the transistor is a saturated switch.
- Heating in the calorimeter uses a heating-time slider rather than a running clock. Only the stopwatch and released trolleys use the live bench clock.
- Support equipment such as the lens holder, tripod, wire gauze, pins and drawing board has simple behaviour (alignment, heat spreading, accuracy) rather than a full model.
- Some equipment is placed over other equipment to work together: an immersion heater over a calorimeter, a thermometer in a calorimeter, a soft iron core over a solenoid.

## Layout

On `/workbench/*` routes `AppLayout` hides the fixed sidebar and trims the page padding so the bench uses the full width. The header menu button opens the navigation as a drawer (close it with the scrim, a link, or Escape).
