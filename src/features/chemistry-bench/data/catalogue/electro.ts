import type {
  ChemPart,
  ChemPartSpec,
  ChemState,
  Contents,
} from "../../chemistry.types";
import { cellOf, electrodesOf } from "../../engine/cells";
import { molarity } from "../../engine/contents";
import { electrolyse } from "../../engine/electrolysis";
import {
  addIncident,
  insideFumeCupboard,
  partByNum,
  partsOver,
  replacePart,
} from "../../engine/operations";
import {
  fixed,
  issue,
  measure,
  readout,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import { button, choice, link, slider, toggle } from "./controls";
import { vesselControls, vesselOutcome, vesselState } from "./shared";

type ElectroKind =
  | "hofmann-voltameter"
  | "u-tube"
  | "carbon-electrode"
  | "copper-electrode"
  | "dc-power-supply"
  | "ammeter"
  | "salt-bridge";

const TUBE_MAX = 50;

const cathodeWords = {
  hydrogen: t(
    "Bubbles of a colourless gas form at the cathode (−): hydrogen.",
    "Viputo vya gesi isiyo na rangi vinaundwa kwenye katodi (−): hidrojeni.",
  ),
  copper: t(
    "A pink-brown layer of copper is deposited on the cathode (−).",
    "Safu ya shaba ya waridi-kahawia inawekwa kwenye katodi (−).",
  ),
  silver: t(
    "Grey crystals of silver grow on the cathode (−).",
    "Fuwele za kijivu za fedha zinakua kwenye katodi (−).",
  ),
  lead: t(
    "Lead is deposited on the cathode (−).",
    "Risasi inawekwa kwenye katodi (−).",
  ),
  none: t(
    "Nothing happens at the cathode.",
    "Hakuna kinachotokea kwenye katodi.",
  ),
};
const anodeWords = {
  oxygen: t(
    "Bubbles of a colourless gas form at the anode (+): oxygen.",
    "Viputo vya gesi isiyo na rangi vinaundwa kwenye anodi (+): oksijeni.",
  ),
  chlorine: t(
    "A pale green, choking gas forms at the anode (+): chlorine.",
    "Gesi ya kijani kibichi hafifu inayokosesha pumzi inaundwa kwenye anodi (+): klorini.",
  ),
  iodine: t(
    "The solution turns brown at the anode (+) as iodine forms.",
    "Myeyusho unakuwa wa kahawia kwenye anodi (+) iodini inapotengenezwa.",
  ),
  "copper dissolves": t(
    "The copper anode (+) gets smaller as it dissolves.",
    "Anodi ya shaba (+) inapungua inapoyeyuka.",
  ),
  none: t("Nothing happens at the anode.", "Hakuna kinachotokea kwenye anodi."),
};

function describe(part: ChemPart, env: { parts: ChemPart[]; now: number }) {
  const cell = cellOf(part, env);
  const committedC = part.params.gasC ?? 0;
  const committedA = part.params.gasA ?? 0;
  const cathode = Math.min(
    TUBE_MAX,
    committedC + (cell?.preview?.cathodeGas?.mL ?? 0),
  );
  const anode = Math.min(
    TUBE_MAX,
    committedA + (cell?.preview?.anodeGas?.mL ?? 0),
  );
  return { cell, cathode, anode };
}

function electrolysisOutcome(
  part: ChemPart,
  env: {
    parts: ChemPart[];
    now: number;
    part: (n: number) => ChemPart | undefined;
    incidents: never[];
  } & Parameters<typeof vesselOutcome>[1],
) {
  const base = vesselOutcome(part, env);
  const { cell, cathode, anode } = describe(part, env);
  const electrodes = electrodesOf(part, env.parts);
  const conducting =
    molarity(part.contents, "H") +
      molarity(part.contents, "Na") +
      molarity(part.contents, "Cu") +
      molarity(part.contents, "K") >
    0.005;
  const showGas = part.kind === "hofmann-voltameter";
  return {
    ...base,
    visual: { gasC: cathode, gasA: anode, running: cell?.running ? 1 : 0 },
    readouts: [
      ...(base.readouts ?? []),
      ...(showGas
        ? [
            readout(
              ["Gas at the cathode (−)", "Gesi kwenye katodi (−)"],
              `${fixed(cathode, 1)} mL`,
            ),
            readout(
              ["Gas at the anode (+)", "Gesi kwenye anodi (+)"],
              `${fixed(anode, 1)} mL`,
            ),
          ]
        : []),
    ],
    issues: [
      ...(base.issues ?? []),
      ...(!electrodes
        ? [
            issue("electrodes", "tip", [
              "Stand a cathode and an anode electrode in the vessel (set each electrode's terminal).",
              "Simamisha elektrodi ya katodi na ya anodi kwenye chombo (weka kituo cha kila elektrodi).",
            ]),
          ]
        : []),
      ...(part.contents.volume > 0 && !conducting
        ? [
            issue("electrolyte", "warn", [
              "Pure water hardly conducts. Add an electrolyte such as dilute sulphuric acid or copper(II) sulphate solution.",
              "Maji safi hayapitishi umeme. Ongeza elektroliti kama asidi ya salfuriki iliyopunguzwa au myeyusho wa shaba(II) salfeti.",
            ]),
          ]
        : []),
    ],
    observations: [
      ...(base.observations ?? []),
      ...(cell?.preview
        ? [
            cathodeWords[cell.preview.cathodeProduct],
            anodeWords[cell.preview.anodeProduct],
          ]
        : []),
    ],
    tasks:
      showGas && cathode > 2 && !cell?.running
        ? [
            task(
              `hofmann-c-${cathode.toFixed(0)}`,
              ["Volume of gas at the cathode", "Ujazo wa gesi kwenye katodi"],
              "mL",
              cathode,
              0.6,
              [
                "Read the bottom of the meniscus in the tube.",
                "Soma chini ya uso wa kioevu kwenye mrija.",
              ],
            ),
          ]
        : [],
    measures:
      showGas && cathode + anode > 0
        ? [
            measure(
              "cathode",
              ["Gas at the cathode", "Gesi kwenye katodi"],
              "mL",
              cathode,
              1,
            ),
            measure(
              "anode",
              ["Gas at the anode", "Gesi kwenye anodi"],
              "mL",
              anode,
              1,
            ),
          ]
        : [],
  };
}

/** The half-cell a vessel holds: a metal in a solution of its own ions. */
export function halfCell(c: Contents) {
  const table = [
    { solid: ["mg"], ion: "Mg" as const, potential: -2.37, n: 2, label: "Mg" },
    {
      solid: ["zn", "znp"],
      ion: "Zn" as const,
      potential: -0.76,
      n: 2,
      label: "Zn",
    },
    { solid: ["fe"], ion: "Fe2" as const, potential: -0.44, n: 2, label: "Fe" },
    { solid: ["pb"], ion: "Pb" as const, potential: -0.13, n: 2, label: "Pb" },
    { solid: ["cu"], ion: "Cu" as const, potential: 0.34, n: 2, label: "Cu" },
    { solid: ["ag"], ion: "Ag" as const, potential: 0.8, n: 1, label: "Ag" },
  ];
  for (const entry of table) {
    const metal = entry.solid.some(
      (id) => (c.solids[id as keyof Contents["solids"]] ?? 0) > 1e-6,
    );
    const concentration = molarity(c, entry.ion);
    if (metal && concentration > 1e-5)
      return {
        label: entry.label,
        potential:
          entry.potential + (0.0592 / entry.n) * Math.log10(concentration),
      };
  }
  return null;
}

function commit(state: ChemState, supply: ChemPart, now: number): ChemState {
  const vessel = partByNum(state, supply.params.cell);
  let next = replacePart(state, {
    ...supply,
    params: { ...supply.params, running: 0 },
  });
  if (!vessel) return next;
  const cell = cellOf(vessel, { parts: state.parts, now });
  if (!cell?.setup) return next;
  const result = electrolyse(
    vessel.contents,
    cell.setup,
    cell.current,
    cell.seconds,
  );
  const notes = [...vessel.contents.notes];
  if (cell.seconds > 5) {
    notes.push(cathodeWords[result.cathodeProduct]);
    notes.push(anodeWords[result.anodeProduct]);
  }
  next = replacePart(next, {
    ...vessel,
    contents: { ...result.contents, notes: notes.slice(-6) },
    params: {
      ...vessel.params,
      gasC: Math.min(
        TUBE_MAX,
        (vessel.params.gasC ?? 0) + (result.cathodeGas?.mL ?? 0),
      ),
      gasA: Math.min(
        TUBE_MAX,
        (vessel.params.gasA ?? 0) + (result.anodeGas?.mL ?? 0),
      ),
      plate: (vessel.params.plate ?? 0) + result.plated + result.silver,
      erode: (vessel.params.erode ?? 0) + result.eroded,
    },
  });
  if (
    result.anodeGas?.gas === "Cl2" &&
    result.anodeGas.mL > 1 &&
    !insideFumeCupboard(next, vessel)
  )
    next = addIncident(next, "toxic-fumes", vessel.num, {
      text: t(
        "Chlorine escaped into the room.",
        "Klorini ilitoroka ndani ya chumba.",
      ),
    });
  return next;
}

const electrolysisVessel = (
  kind: "hofmann-voltameter" | "u-tube",
): Pick<ChemPartSpec, "controls" | "state"> => ({
  controls: [
    choice(
      "electrode",
      ["Electrodes", "Elektrodi"],
      [
        ["Carbon (inert)", "Kaboni (haziitikii)"],
        ["Copper (active)", "Shaba (huitikia)"],
      ],
    ),
    ...vesselControls({ add: true, rinse: true, empty: true }),
    button(
      "clear",
      ["Empty the gas tubes", "Mwaga mirija ya gesi"],
      ({ state, part }) =>
        replacePart(state, {
          ...part,
          params: { ...part.params, gasC: 0, gasA: 0 },
        }),
      () => kind === "hofmann-voltameter",
    ),
  ],
  state: { ...vesselState, electrode: 0, gasC: 0, gasA: 0, plate: 0, erode: 0 },
});

export const electroParts: Record<ElectroKind, ChemPartSpec> = {
  "hofmann-voltameter": {
    name: t(
      "Electrolysis cell (Hofmann voltameter)",
      "Seli ya elektrolisisi (voltamita ya Hofmann)",
    ),
    description: t(
      "Three joined tubes with electrodes at the bottom of the two outer ones. Fill it with an electrolyte, connect a d.c. supply and watch the gases collect: at the cathode and at the anode.",
      "Mirija mitatu iliyounganishwa yenye elektrodi chini ya miwili ya nje. Ijaze elektroliti, unganisha chanzo cha d.c. na utazame gesi zikikusanyika: kwenye katodi na anodi.",
    ),
    width: 190,
    height: 250,
    vessel: { capacity: 100, tare: 300 },
    ...electrolysisVessel("hofmann-voltameter"),
    analyse: (input) => electrolysisOutcome(input.part, input.env as never),
  },
  "u-tube": {
    name: t("U-tube", "Mrija wa U"),
    description: t(
      "A U-shaped tube for electrolysis with two electrodes, one in each arm. Bubbles and deposits show what forms at each.",
      "Mrija wenye umbo la U wa elektrolisisi wenye elektrodi mbili, moja kwenye kila mkono. Viputo na viwekwa huonyesha kinachotokea kwenye kila moja.",
    ),
    width: 150,
    height: 170,
    vessel: { capacity: 80, tare: 60 },
    ...electrolysisVessel("u-tube"),
    analyse: (input) => electrolysisOutcome(input.part, input.env as never),
  },
  "carbon-electrode": {
    name: t("Carbon electrode", "Elektrodi ya kaboni"),
    description: t(
      "An inert graphite rod: it carries current but does not react. Stand it in the electrolyte and set its terminal.",
      "Fimbo ya grafiti isiyoitikia: hubeba mkondo lakini haiitikii. Isimamishe kwenye elektroliti na uweke kituo chake.",
    ),
    width: 40,
    height: 170,
    controls: [
      choice(
        "terminal",
        ["Connected to the", "Imeunganishwa na"],
        [
          ["Cathode (−)", "Katodi (−)"],
          ["Anode (+)", "Anodi (+)"],
        ],
      ),
    ],
    state: { terminal: 0 },
    analyse: ({ part, env }) => {
      const vessel = env.parts.find(
        (item) =>
          item.vessel !== null &&
          item.id !== part.id &&
          partsOver(env, part, [item.kind]).includes(item),
      );
      return {
        readouts: [
          readout(
            ["In a vessel", "Kwenye chombo"],
            vessel ? "Yes" : "No",
            vessel ? "ok" : undefined,
          ),
        ],
      };
    },
  },
  "copper-electrode": {
    name: t("Copper electrode", "Elektrodi ya shaba"),
    description: t(
      "A copper strip. As an anode it dissolves; as a cathode copper is deposited on it. Weigh it before and after to see the change.",
      "Utepe wa shaba. Ukiwa anodi huyeyuka; ukiwa katodi shaba huwekwa juu yake. Upime kabla na baada kuona mabadiliko.",
    ),
    width: 40,
    height: 170,
    controls: [
      choice(
        "terminal",
        ["Connected to the", "Imeunganishwa na"],
        [
          ["Cathode (−)", "Katodi (−)"],
          ["Anode (+)", "Anodi (+)"],
        ],
      ),
    ],
    state: { terminal: 0 },
    analyse: ({ part, p, env }) => {
      const vessel = env.parts.find(
        (item) =>
          item.vessel !== null &&
          item.id !== part.id &&
          partsOver(env, part, [item.kind]).includes(item),
      );
      const change = vessel
        ? p("terminal") === 0
          ? (vessel.params.plate ?? 0)
          : -(vessel.params.erode ?? 0)
        : 0;
      return {
        visual: { change },
        readouts: [
          readout(["Mass", "Uzito"], `${fixed(10 + change / 1000, 3)} g`),
          readout(
            ["Change", "Mabadiliko"],
            `${change >= 0 ? "+" : ""}${fixed(change, 0)} mg`,
          ),
        ],
        measures: [
          measure(
            "mass",
            ["Mass of the copper electrode", "Uzito wa elektrodi ya shaba"],
            "g",
            10 + change / 1000,
            3,
          ),
        ],
      };
    },
  },
  "dc-power-supply": {
    name: t("D.C. power supply", "Chanzo cha umeme wa d.c."),
    description: t(
      "Adjustable 0–12 V d.c. Connect it to a cell, set the voltage, switch on and start the electrolysis. The + terminal feeds the anode and the − terminal the cathode.",
      "d.c. inayorekebishwa 0–12 V. Iunganishe na seli, weka volteji, iwashe na uanze elektrolisisi. Ncha + huenda kwenye anodi na ncha − kwenye katodi.",
    ),
    width: 170,
    height: 110,
    controls: [
      link(
        "cell",
        ["Connected to the cell in", "Imeunganishwa na seli iliyo kwenye"],
        ["Choose a vessel", "Chagua chombo"],
        (candidate) => candidate.vessel !== null,
      ),
      toggle(
        "on",
        ["Output", "Pato"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
      ),
      slider("voltage", ["Voltage", "Volteji"], 0, 12, 0.5, 6, "V"),
      button(
        "start",
        ["Start the electrolysis", "Anza elektrolisisi"],
        ({ state, part, now }) =>
          replacePart(state, {
            ...part,
            params: { ...part.params, running: 1, startedAt: now },
          }),
        (part) => part.params.cell > 0 && part.params.running !== 1,
      ),
      button(
        "stop",
        ["Stop and record", "Simamisha na urekodi"],
        ({ state, part, now }) => commit(state, part, now),
        (part) => part.params.running === 1,
      ),
    ],
    state: { cell: 0, running: 0, startedAt: 0 },
    analyse: ({ p, env }) => {
      const vessel = env.part(p("cell"));
      const cell = vessel ? cellOf(vessel, env) : null;
      return {
        visual: { on: p("on"), running: p("running"), voltage: p("voltage") },
        readouts: [
          readout(
            ["Voltage", "Volteji"],
            `${p("on") === 1 ? fixed(p("voltage"), 1) : "0.0"} V`,
          ),
          readout(
            ["Current", "Mkondo"],
            `${fixed((cell?.current ?? 0) * 1000, 0)} mA`,
          ),
          ...(cell?.running
            ? [readout(["Time running", "Muda"], `${fixed(cell.seconds, 0)} s`)]
            : []),
        ],
        issues: [
          ...(vessel && !cell?.setup
            ? [
                issue("electrodes", "warn", [
                  "The cell has no electrodes: stand a cathode and an anode in it.",
                  "Seli haina elektrodi: simamisha katodi na anodi ndani yake.",
                ]),
              ]
            : []),
          ...(p("running") === 1 && p("on") === 0
            ? [
                issue("off", "warn", [
                  "The output is switched off, so no current flows.",
                  "Pato limezimwa, kwa hiyo hakuna mkondo unaotiririka.",
                ]),
              ]
            : []),
          ...(cell?.setup && cell.current < 0.002 && p("on") === 1
            ? [
                issue("weak", "tip", [
                  "Almost no current. The electrolyte is too dilute or the voltage is below about 1.2 V.",
                  "Karibu hakuna mkondo. Elektroliti imepunguzwa mno au volteji iko chini ya takriban 1.2 V.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  ammeter: {
    name: t("Ammeter", "Amita"),
    description: t(
      "Reads the current in the electrolysis circuit it is connected to. It goes in series with the cell.",
      "Husoma mkondo kwenye sakiti ya elektrolisisi iliyounganishwa nayo. Huwekwa mfululizo na seli.",
    ),
    width: 90,
    height: 100,
    controls: [
      link(
        "supply",
        ["Connected in series with", "Imeunganishwa mfululizo na"],
        ["Choose a power supply", "Chagua chanzo cha umeme"],
        (candidate) => candidate.kind === "dc-power-supply",
      ),
    ],
    state: { supply: 0 },
    analyse: ({ p, env }) => {
      const supply = env.part(p("supply"));
      const vessel = supply ? env.part(supply.params.cell) : undefined;
      const cell = vessel ? cellOf(vessel, env) : null;
      const amps = cell?.current ?? 0;
      return {
        visual: { current: amps },
        readouts: [
          readout(["Current", "Mkondo"], `${fixed(amps * 1000, 0)} mA`),
        ],
        issues: supply
          ? []
          : [
              issue("link", "tip", [
                "Choose the power supply this ammeter is in series with.",
                "Chagua chanzo cha umeme ambacho amita hii imeunganishwa mfululizo nacho.",
              ]),
            ],
        measures: [measure("current", ["Current", "Mkondo"], "A", amps, 3)],
      };
    },
  },
  "salt-bridge": {
    name: t("Salt bridge", "Daraja la chumvi"),
    description: t(
      "A strip of paper soaked in salt solution joining two half-cells. With a metal in a solution of its own ions in each beaker, the cell gives a voltage.",
      "Utepe wa karatasi uliolowekwa kwenye myeyusho wa chumvi unaounganisha nusu-seli mbili. Chuma kikiwa kwenye myeyusho wa ioni zake kwenye kila bikari, seli hutoa volteji.",
    ),
    width: 170,
    height: 60,
    controls: [
      link(
        "left",
        ["Half-cell on the left", "Nusu-seli ya kushoto"],
        ["Choose a beaker", "Chagua bikari"],
        (candidate) => candidate.vessel !== null,
      ),
      link(
        "right",
        ["Half-cell on the right", "Nusu-seli ya kulia"],
        ["Choose a beaker", "Chagua bikari"],
        (candidate, self) =>
          candidate.vessel !== null && candidate.num !== self.params.left,
      ),
    ],
    state: { left: 0, right: 0 },
    analyse: ({ p, env }) => {
      const left = env.part(p("left"));
      const right = env.part(p("right"));
      const a = left ? halfCell(left.contents) : null;
      const b = right ? halfCell(right.contents) : null;
      const emf = a && b ? Math.abs(a.potential - b.potential) : 0;
      const positive =
        a && b ? (a.potential > b.potential ? a.label : b.label) : "";
      const negative =
        a && b ? (a.potential > b.potential ? b.label : a.label) : "";
      return {
        visual: { emf },
        readouts: [
          readout(
            ["Cell voltage", "Volteji ya seli"],
            `${fixed(emf, 2)} V`,
            emf > 0 ? "ok" : undefined,
          ),
          ...(a && b && emf > 0
            ? [
                readout(
                  ["Electrons flow", "Elektroni zinatiririka"],
                  `${negative} → ${positive}`,
                ),
              ]
            : []),
        ],
        issues:
          a && b
            ? []
            : [
                issue("cells", "tip", [
                  "Each beaker needs a metal and a solution of its own ions, for example zinc in zinc sulphate... and copper in copper(II) sulphate.",
                  "Kila bikari inahitaji chuma na myeyusho wa ioni zake, kwa mfano zinki kwenye zinki salfeti na shaba kwenye shaba(II) salfeti.",
                ]),
              ],
        tasks:
          emf > 0
            ? [
                task(
                  `bridge-${emf.toFixed(2)}`,
                  ["Voltage of the cell", "Volteji ya seli"],
                  "V",
                  emf,
                  0.04,
                  [
                    "Use E° values: voltage = E(more positive) − E(less positive).",
                    "Tumia thamani za E°: volteji = E(chanya zaidi) − E(chanya kidogo).",
                  ],
                ),
              ]
            : [],
        measures:
          emf > 0
            ? [measure("emf", ["Cell voltage", "Volteji ya seli"], "V", emf, 2)]
            : [],
      };
    },
  },
};
