// Saves a trimmed copy of the PhET catalog used when the live API is unavailable.
// Usage: node scripts/update-phet-snapshot.mjs
import { writeFile } from "node:fs/promises";

const SOURCE =
  "https://phet.colorado.edu/services/metadata/1.3/simulations?format=json&type=html&locale=en";
const TARGET = "src/features/phet-simulations/data/phetSnapshot.json";

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`PhET responded ${response.status}`);
const raw = await response.json();

const snapshot = {
  categories: raw.categories,
  keywords: raw.keywords,
  projects: raw.projects.map((project) => ({
    simulations: project.simulations.map((simulation) => {
      const { title, description, runUrl, simPageUrl } =
        simulation.localizedSimulations.en;
      return {
        id: simulation.id,
        name: simulation.name,
        createTime: simulation.createTime,
        isNew: simulation.isNew,
        keywordIds: simulation.keywordIds,
        localizedSimulations: {
          en: { title, description, runUrl, simPageUrl },
        },
      };
    }),
  })),
};
await writeFile(TARGET, `${JSON.stringify(snapshot)}\n`);
console.log(`Saved ${snapshot.projects.length} projects to ${TARGET}`);
