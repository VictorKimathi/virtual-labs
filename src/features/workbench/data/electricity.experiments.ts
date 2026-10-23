import {
  bulbBrightness,
  LIT_BRIGHTNESS,
  meterReading,
  solveCircuit,
  terminalKey,
} from "../circuit/solveCircuit";
import type {
  Experiment,
  GoalContext,
  PartKind,
  PlacedPart,
} from "../workbench.types";
import { partDefinitions } from "./equipment";

const SOURCES: PartKind[] = ["cell", "battery", "power-supply"];

function partsOf(context: GoalContext, kind: PartKind) {
  return context.parts.filter((part) => part.kind === kind);
}

function litBulbs(context: GoalContext) {
  return partsOf(context, "bulb").filter(
    (bulb) => bulbBrightness(context.solution, bulb.id) > LIT_BRIGHTNESS,
  );
}

function current(context: GoalContext, part: PlacedPart) {
  return context.solution.parts.get(part.id)?.current ?? 0;
}

function voltage(context: GoalContext, part: PlacedPart) {
  return context.solution.parts.get(part.id)?.voltage ?? 0;
}

function potentials(context: GoalContext, part: PlacedPart) {
  return partDefinitions[part.kind].terminals.map(
    (terminal) =>
      context.solution.potentials.get(
        terminalKey({ partId: part.id, terminal: terminal.name }),
      ) ?? 0,
  );
}

function inParallel(
  context: GoalContext,
  first: PlacedPart,
  second: PlacedPart,
) {
  const [a1, b1] = potentials(context, first);
  const [a2, b2] = potentials(context, second);
  const near = (x: number, y: number) => Math.abs(x - y) < 0.01;
  return (near(a1, a2) && near(b1, b2)) || (near(a1, b2) && near(b1, a2));
}

function pairs<T>(items: T[]) {
  return items.flatMap((first, i) =>
    items.slice(i + 1).map((second) => [first, second] as const),
  );
}

function measuresCurrentOf(context: GoalContext, kind: PartKind) {
  return partsOf(context, "ammeter").some((meter) => {
    const reading = meterReading(context.solution, meter);
    return (
      reading > 0.005 &&
      partsOf(context, kind).some(
        (part) => Math.abs(Math.abs(current(context, part)) - reading) < 0.002,
      )
    );
  });
}

function measuresVoltageAcross(context: GoalContext, kind: PartKind) {
  return partsOf(context, "voltmeter").some((meter) => {
    const reading = meterReading(context.solution, meter);
    return (
      reading > 0.1 &&
      partsOf(context, kind).some((part) => inParallel(context, meter, part))
    );
  });
}

export const electricityExperiments: Experiment[] = [
  {
    id: "light-a-bulb",
    title: { en: "Light a bulb", sw: "Washa balbu" },
    summary: {
      en: "Build a complete circuit so current can flow through a bulb.",
      sw: "Unda sakiti kamili ili mkondo upite kwenye balbu.",
    },
    equipment: ["cell", "bulb"],
    steps: [
      {
        en: "Drag a dry cell and a light bulb onto the bench.",
        sw: "Buruta seli kavu na balbu hadi kwenye benchi.",
      },
      {
        en: "Click the + terminal of the cell, then a bulb terminal, to run a wire.",
        sw: "Bofya ncha + ya seli, kisha ncha ya balbu, kuweka waya.",
      },
      {
        en: "Wire the other bulb terminal back to the − terminal.",
        sw: "Unganisha ncha nyingine ya balbu na ncha − ya seli.",
      },
    ],
    goals: [
      {
        id: "source",
        label: {
          en: "Place a cell on the bench",
          sw: "Weka seli kwenye benchi",
        },
        check: (context) =>
          context.parts.some((part) => SOURCES.includes(part.kind)),
      },
      {
        id: "bulb",
        label: {
          en: "Place a bulb on the bench",
          sw: "Weka balbu kwenye benchi",
        },
        check: (context) => partsOf(context, "bulb").length > 0,
      },
      {
        id: "lit",
        label: {
          en: "Close the circuit so the bulb glows",
          sw: "Kamilisha sakiti ili balbu iwake",
        },
        check: (context) => litBulbs(context).length > 0,
      },
    ],
  },
  {
    id: "switch-control",
    title: {
      en: "Control a bulb with a switch",
      sw: "Dhibiti balbu kwa swichi",
    },
    summary: {
      en: "Add a switch in series and use it to turn the bulb on and off.",
      sw: "Ongeza swichi mfululizo na uitumie kuwasha na kuzima balbu.",
    },
    equipment: ["cell", "switch", "bulb"],
    steps: [
      {
        en: "Build the bulb circuit with a knife switch in the loop.",
        sw: "Unda sakiti ya balbu ikiwa na swichi ya kisu kwenye mzunguko.",
      },
      {
        en: "Click the switch on the bench to close and open it.",
        sw: "Bofya swichi kwenye benchi kuifunga na kuifungua.",
      },
    ],
    goals: [
      {
        id: "switch",
        label: { en: "Place a knife switch", sw: "Weka swichi ya kisu" },
        check: (context) => partsOf(context, "switch").length > 0,
      },
      {
        id: "closed-lit",
        label: {
          en: "Light the bulb with the switch closed",
          sw: "Washa balbu swichi ikiwa imefungwa",
        },
        check: (context) =>
          partsOf(context, "switch").some((part) => part.closed) &&
          litBulbs(context).length > 0,
      },
      {
        id: "controls",
        label: {
          en: "Opening the switch turns the bulb off",
          sw: "Kufungua swichi huzima balbu",
        },
        check: (context) =>
          partsOf(context, "switch").some((target) => {
            const withSwitch = (closed: boolean) =>
              solveCircuit(
                context.parts.map((part) =>
                  part.id === target.id ? { ...part, closed } : part,
                ),
                context.wires,
              );
            const closed = withSwitch(true);
            const open = withSwitch(false);
            return partsOf(context, "bulb").some(
              (bulb) =>
                bulbBrightness(closed, bulb.id) > LIT_BRIGHTNESS &&
                bulbBrightness(open, bulb.id) <= LIT_BRIGHTNESS,
            );
          }),
      },
    ],
  },
  {
    id: "measure-current",
    title: { en: "Measure current", sw: "Pima mkondo" },
    summary: {
      en: "Use an ammeter in series to measure the current through a bulb.",
      sw: "Tumia amita mfululizo kupima mkondo unaopita kwenye balbu.",
    },
    equipment: ["cell", "bulb", "ammeter"],
    steps: [
      {
        en: "Break the bulb circuit and insert the ammeter into the loop.",
        sw: "Fungua sakiti ya balbu na uweke amita kwenye mzunguko.",
      },
      {
        en: "Wire the ammeter + terminal towards the + of the cell.",
        sw: "Unganisha ncha + ya amita kuelekea + ya seli.",
      },
    ],
    goals: [
      {
        id: "lit",
        label: { en: "The bulb glows", sw: "Balbu inawaka" },
        check: (context) => litBulbs(context).length > 0,
      },
      {
        id: "series",
        label: {
          en: "The ammeter reads the bulb current",
          sw: "Amita inasoma mkondo wa balbu",
        },
        check: (context) => measuresCurrentOf(context, "bulb"),
      },
    ],
  },
  {
    id: "measure-voltage",
    title: { en: "Measure voltage", sw: "Pima volteji" },
    summary: {
      en: "Connect a voltmeter across a glowing bulb.",
      sw: "Unganisha voltimita sambamba na balbu inayowaka.",
    },
    equipment: ["cell", "bulb", "voltmeter"],
    steps: [
      {
        en: "Light a bulb with a cell.",
        sw: "Washa balbu kwa seli.",
      },
      {
        en: "Wire the voltmeter terminals to the two bulb terminals.",
        sw: "Unganisha ncha za voltimita na ncha mbili za balbu.",
      },
    ],
    goals: [
      {
        id: "lit",
        label: { en: "The bulb glows", sw: "Balbu inawaka" },
        check: (context) => litBulbs(context).length > 0,
      },
      {
        id: "across",
        label: {
          en: "The voltmeter is across the bulb with a positive reading",
          sw: "Voltimita iko sambamba na balbu na inasoma chanya",
        },
        check: (context) => measuresVoltageAcross(context, "bulb"),
      },
    ],
  },
  {
    id: "ohms-law",
    title: { en: "Ohm's law", sw: "Sheria ya Ohm" },
    summary: {
      en: "Vary the voltage across a resistor and plot V against I.",
      sw: "Badilisha volteji kwenye kikinzani na uchore V dhidi ya I.",
    },
    equipment: ["power-supply", "resistor", "ammeter", "voltmeter"],
    steps: [
      {
        en: "Connect the power supply, ammeter and resistor in series.",
        sw: "Unganisha chanzo, amita na kikinzani mfululizo.",
      },
      {
        en: "Connect the voltmeter across the resistor.",
        sw: "Unganisha voltimita sambamba na kikinzani.",
      },
      {
        en: "Select the power supply, change its voltage, and press Record each time.",
        sw: "Chagua chanzo, badilisha volteji yake, na ubonyeze Rekodi kila mara.",
      },
      {
        en: "Open the Graph tab. The gradient of V against I is the resistance.",
        sw: "Fungua kichupo cha Grafu. Mwinuko wa V dhidi ya I ni ukinzani.",
      },
    ],
    goals: [
      {
        id: "series",
        label: {
          en: "The ammeter reads the resistor current",
          sw: "Amita inasoma mkondo wa kikinzani",
        },
        check: (context) => measuresCurrentOf(context, "resistor"),
      },
      {
        id: "across",
        label: {
          en: "The voltmeter is across the resistor",
          sw: "Voltimita iko sambamba na kikinzani",
        },
        check: (context) => measuresVoltageAcross(context, "resistor"),
      },
      {
        id: "records",
        label: {
          en: "Record readings at 5 different voltages",
          sw: "Rekodi vipimo kwa volteji 5 tofauti",
        },
        check: (context) =>
          new Set(
            context.records.flatMap((record) =>
              record.readings
                .filter((reading) => reading.unit === "V")
                .slice(0, 1)
                .map((reading) => reading.value.toFixed(1)),
            ),
          ).size >= 5,
      },
    ],
  },
  {
    id: "series-parallel",
    title: {
      en: "Series and parallel bulbs",
      sw: "Balbu mfululizo na sambamba",
    },
    summary: {
      en: "Compare how brightly two bulbs glow in series and in parallel.",
      sw: "Linganisha mwangaza wa balbu mbili mfululizo na sambamba.",
    },
    equipment: ["battery", "bulb"],
    steps: [
      {
        en: "Connect two bulbs one after the other with a battery holder.",
        sw: "Unganisha balbu mbili moja baada ya nyingine na kishikio cha betri.",
      },
      {
        en: "Rewire them so each bulb connects directly across the battery.",
        sw: "Ziunganishe upya ili kila balbu iunganike moja kwa moja na betri.",
      },
      {
        en: "Which arrangement makes the bulbs brighter? Why?",
        sw: "Mpangilio upi hufanya balbu kung'aa zaidi? Kwa nini?",
      },
    ],
    goals: [
      {
        id: "series",
        label: {
          en: "Two bulbs glow in series",
          sw: "Balbu mbili zinawaka mfululizo",
        },
        check: (context) =>
          pairs(litBulbs(context)).some(
            ([first, second]) =>
              !inParallel(context, first, second) &&
              Math.abs(
                Math.abs(current(context, first)) -
                  Math.abs(current(context, second)),
              ) < 0.001,
          ),
      },
      {
        id: "parallel",
        label: {
          en: "Two bulbs glow in parallel",
          sw: "Balbu mbili zinawaka sambamba",
        },
        check: (context) =>
          pairs(litBulbs(context)).some(
            ([first, second]) =>
              inParallel(context, first, second) &&
              Math.abs(voltage(context, first)) > 0.1,
          ),
      },
    ],
  },
];
