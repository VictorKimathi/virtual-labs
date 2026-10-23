# Kenya Virtual Science Lab roadmap

This is a desktop workspace initialization with a responsive fallback. The detailed lab is Ohm's Law; other catalog entries and progress figures are previews. Build and review one useful experience per subject before adding a large content backend.

## Shared foundation

- [x] Build six screens: Home, Lab Browser, Guided Lab, Sandbox, Pre-Assessment Quiz, and Progress.
- [x] Add four subject cards, level/subject/strand filters, a seven-step guide, and 3D Physics and Biology starter benches with draggable equipment.
- [x] Add English/Kiswahili switching, a persistent desktop sidebar, a smaller-screen menu, and light/dark themes.
- [ ] Review wording, age suitability, and CBE alignment with Kenyan science educators.
- [ ] Check the desktop 3D lab on common laptop screens, then verify its responsive fallback and WebGL support on phones.
- [ ] Replace sample completion, scores, and badges with actual learner data after agreeing the data model.
- [ ] Review live Firebase rules before deploying collection-specific rules and required indexes.

## Physics

- [ ] Finish the Ohm's Law guided content and post-assessment, then verify circuit values against real calculations.
- [x] Connect placed apparatus with wires and calculate circuit behaviour from the resulting circuit (2D lab bench at `/workbench`).
- [ ] Add a second Physics lab for Forces & Motion after reviewing learning outcomes.

## Chemistry

- [ ] Turn Acids & Bases into a complete guided lab with safety notes, observation prompts, and assessment.
- [ ] Evaluate ChemCollective activities for a wet-lab follow-up and verify usage terms.
- [ ] Add a separation activity with learner observations.

## Biology

- [x] Add a 3D microscope bench and link it from the Plant Cells lesson.
- [ ] Complete the Plant Cells guide with a full assessment and reviewed labelled imagery.
- [ ] Replace the illustrative microscope preview with specimen images or a validated observation simulation.
- [ ] Add a Photosynthesis activity with predictions and evidence prompts.
- [ ] Evaluate Learn.Genetics and HHMI resources for suitable linked activities.

## Agriculture

- [ ] Review Soil Testing and Seed Germination with a Kenyan agriculture educator.
- [ ] Add observations that relate to local crops and growing conditions.
- [ ] Choose whether these need custom simulations or guided external resources.

## Later, when the learning flow needs it

- [ ] Add Firebase Auth and per-learner progress storage with authorization rules.
- [ ] Add analytics only after defining useful events and a privacy notice.
