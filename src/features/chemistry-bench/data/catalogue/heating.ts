import type { ChemPartSpec } from "../../chemistry.types";
import {
  fixed,
  issue,
  readout,
  t,
} from "../../../workbench/data/catalogue/helpers";
import { heaterOutput, partsOver } from "../../engine/operations";
import { slider, toggle } from "./controls";

type HeatingKind =
  | "bunsen-burner"
  | "spirit-lamp"
  | "tripod-stand"
  | "wire-gauze"
  | "pipe-clay-triangle"
  | "crucible-lid"
  | "hot-plate"
  | "heating-mantle"
  | "water-bath"
  | "sand-bath";

const glassKinds = [
  "beaker",
  "conical-flask",
  "round-bottom-flask",
  "flat-bottom-flask",
  "evaporating-dish",
  "test-tube",
  "boiling-tube",
  "crucible",
] as const;

const hotSurface = issue("hot", "tip", [
  "The surface stays hot after it is switched off. Take care.",
  "Uso unabaki moto hata baada ya kuzimwa. Chukua tahadhari.",
]);

export const heatingParts: Record<HeatingKind, ChemPartSpec> = {
  "bunsen-burner": {
    name: t("Bunsen burner", "Kichomeo cha Bunsen"),
    description: t(
      "Air hole closed: a cool, yellow, sooty 'safety' flame. Air hole open: a hot, blue, non-luminous flame for heating. Light it with the air hole closed.",
      "Tundu la hewa limefungwa: moto wa manjano, baridi na wenye masizi. Tundu wazi: moto wa buluu na moto zaidi wa kupasha. Uwashe tundu likiwa limefungwa.",
    ),
    width: 90,
    height: 190,
    controls: [
      toggle("lit", ["Gas", "Gesi"], ["Lit", "Inawaka"], ["Off", "Imezimwa"]),
      slider(
        "air",
        ["Air hole opening", "Ufunguzi wa tundu la hewa"],
        0,
        1,
        0.1,
        0,
      ),
    ],
    state: { lit: 0, air: 0 },
    analyse: ({ part, p }) => {
      const out = heaterOutput(part);
      return {
        visual: { lit: p("lit"), air: p("air") },
        readouts: out
          ? [
              readout(
                ["Flame", "Mwali"],
                out.luminous ? "Yellow, luminous" : "Blue, non-luminous",
                out.luminous ? "warn" : "ok",
              ),
              readout(
                ["Heat to the liquid", "Joto kwa kioevu"],
                `${fixed(out.watts, 0)} W`,
              ),
            ]
          : [],
        issues: out?.luminous
          ? [
              issue("soot", "warn", [
                "A yellow flame is cooler and leaves soot on glassware. Open the air hole for a blue flame before heating.",
                "Mwali wa manjano ni baridi na huacha masizi kwenye vyombo. Fungua tundu la hewa upate mwali wa buluu kabla ya kupasha.",
              ]),
            ]
          : p("lit") === 0 && p("air") > 0.5
            ? [
                issue("light", "tip", [
                  "Close the air hole before you light the burner.",
                  "Funga tundu la hewa kabla ya kuwasha kichomeo.",
                ]),
              ]
            : [],
      };
    },
  },
  "spirit-lamp": {
    name: t("Spirit lamp", "Taa ya spiriti"),
    description: t(
      "A gentle, nearly colourless flame for light heating. Put the cap on to put it out and never refill it while it is lit.",
      "Mwali mpole usio na rangi karibu wote wa kupasha kidogo. Funika kuuzima na usiijaze ikiwa inawaka.",
    ),
    width: 80,
    height: 130,
    controls: [
      toggle(
        "lit",
        ["Flame", "Mwali"],
        ["Lit", "Unawaka"],
        ["Capped (out)", "Imefunikwa (imezimika)"],
      ),
    ],
    state: { lit: 0 },
    analyse: ({ part, p }) => {
      const out = heaterOutput(part);
      return {
        visual: { lit: p("lit") },
        readouts: out
          ? [
              readout(
                ["Heat to the liquid", "Joto kwa kioevu"],
                `${fixed(out.watts, 0)} W`,
              ),
            ]
          : [],
        issues: [
          issue("cap", "tip", [
            "It is slow for heating a lot of liquid. For larger amounts use a Bunsen burner or hot plate.",
            "Ni polepole kupasha kioevu kingi. Kwa kiasi kikubwa tumia kichomeo cha Bunsen au sahani ya joto.",
          ]),
        ],
      };
    },
  },
  "tripod-stand": {
    name: t("Tripod stand", "Stendi ya miguu mitatu"),
    description: t(
      "Holds apparatus about 15 cm above the flame. Stand the burner under it and rest a wire gauze on top before a glass vessel.",
      "Hushikilia vifaa takriban sentimita 15 juu ya moto. Simamisha kichomeo chini yake na uweke wavu juu kabla ya chombo cha kioo.",
    ),
    width: 140,
    height: 150,
    analyse: ({ part, env }) => {
      const gauze = partsOver(env, part, ["wire-gauze"]).length > 0;
      const glass = partsOver(env, part, [...glassKinds]).length > 0;
      return {
        readouts: [
          readout(
            ["Wire gauze on top", "Wavu juu"],
            gauze ? "Yes" : "No",
            gauze ? "ok" : undefined,
          ),
        ],
        issues:
          glass && !gauze
            ? [
                issue("gauze", "warn", [
                  "Put a wire gauze between the flame and the glass so it heats evenly and does not crack.",
                  "Weka wavu kati ya moto na kioo ili kipate joto sawasawa na kisipasuke.",
                ]),
              ]
            : [],
      };
    },
  },
  "wire-gauze": {
    name: t("Wire gauze", "Wavu wa waya"),
    description: t(
      "Spreads the heat of the flame so glass is not heated at one point and cracked.",
      "Husambaza joto la moto ili kioo kisipashwe sehemu moja na kupasuka.",
    ),
    width: 110,
    height: 70,
    analyse: () => ({
      issues: [
        issue("use", "tip", [
          "Rest it on a tripod, with the glass vessel on top.",
          "Iweke juu ya tripodi, chombo cha kioo juu yake.",
        ]),
      ],
    }),
  },
  "pipe-clay-triangle": {
    name: t("Pipe-clay triangle", "Pembetatu ya udongo"),
    description: t(
      "Supports a crucible on a tripod so it can be heated strongly from below.",
      "Hushikilia kikombe cha kuchomea juu ya tripodi ili kipashwe joto kali kutoka chini.",
    ),
    width: 110,
    height: 90,
    analyse: ({ part, env }) => {
      const crucible = partsOver(env, part, ["crucible"]).length > 0;
      return {
        readouts: [
          readout(
            ["Crucible resting on it", "Kikombe kimewekwa juu yake"],
            crucible ? "Yes" : "No",
            crucible ? "ok" : undefined,
          ),
        ],
      };
    },
  },
  "crucible-lid": {
    name: t("Crucible lid", "Mfuniko wa kikombe cha kuchomea"),
    description: t(
      "Covers a crucible to keep solids in. Lift it slightly when a metal needs air to burn.",
      "Hufunika kikombe cha kuchomea kushikilia vigumu. Kiinue kidogo wakati chuma kinahitaji hewa kuwaka.",
    ),
    width: 70,
    height: 16,
    analyse: ({ part, env }) => {
      const crucible = partsOver(env, part, ["crucible"]).length > 0;
      return {
        readouts: [
          readout(
            ["On a crucible", "Juu ya kikombe"],
            crucible ? "Yes" : "No",
            crucible ? "ok" : undefined,
          ),
        ],
      };
    },
  },
  "hot-plate": {
    name: t("Hot plate", "Sahani ya joto"),
    description: t(
      "An electric heating plate. No flame, so it is safer for flammable liquids. Choose the power; it stays hot after it is switched off.",
      "Sahani ya kupasha kwa umeme. Haina moto, kwa hiyo ni salama zaidi kwa vimiminika vinavyowaka. Chagua nguvu; inabaki moto baada ya kuzimwa.",
    ),
    width: 150,
    height: 70,
    controls: [
      toggle(
        "on",
        ["Power", "Umeme"],
        ["On", "Umewashwa"],
        ["Off", "Umezimwa"],
      ),
      slider("power", ["Setting", "Mpangilio"], 0, 100, 5, 50, "%"),
    ],
    state: { on: 0, power: 50 },
    analyse: ({ part, p }) => {
      const out = heaterOutput(part);
      return {
        visual: { on: out ? 1 : 0, power: p("power") },
        readouts: out
          ? [
              readout(
                ["Plate temperature", "Joto la sahani"],
                `${fixed(25 + p("power") * 3.2, 0)} °C`,
              ),
              readout(
                ["Heat to the liquid", "Joto kwa kioevu"],
                `${fixed(out.watts, 0)} W`,
              ),
            ]
          : [],
        issues: [hotSurface],
      };
    },
  },
  "heating-mantle": {
    name: t("Heating mantle", "Mantali ya joto"),
    description: t(
      "A fabric-covered electric bowl that fits a round-bottom flask and heats it evenly without a flame.",
      "Bakuli la umeme lililofunikwa kitambaa linalotoshea chupa ya chini ya duara na kuipasha sawasawa bila moto.",
    ),
    width: 120,
    height: 100,
    controls: [
      toggle(
        "on",
        ["Power", "Umeme"],
        ["On", "Umewashwa"],
        ["Off", "Umezimwa"],
      ),
      slider("power", ["Setting", "Mpangilio"], 0, 100, 5, 50, "%"),
    ],
    state: { on: 0, power: 50 },
    analyse: ({ part, env, p }) => {
      const out = heaterOutput(part);
      const flask = partsOver(env, part, ["round-bottom-flask"]).length > 0;
      return {
        visual: { on: out ? 1 : 0 },
        readouts: out
          ? [
              readout(
                ["Heat to the liquid", "Joto kwa kioevu"],
                `${fixed(out.watts, 0)} W`,
              ),
            ]
          : [],
        issues: [
          ...(!flask
            ? [
                issue("flask", "tip", [
                  "A heating mantle is made for a round-bottom flask: place one in it.",
                  "Mantali ya joto imetengenezwa kwa chupa ya chini ya duara: weka moja ndani yake.",
                ]),
              ]
            : []),
          ...(p("on") === 1 && !flask
            ? [
                issue("empty", "warn", [
                  "Do not switch it on without a flask in it.",
                  "Usiiwashe bila chupa ndani yake.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "water-bath": {
    name: t("Water bath", "Bafu la maji"),
    description: t(
      "A thermostatic bath that never gets hotter than the set temperature, so it is safe for flammable liquids. Set it, then heat a vessel with it.",
      "Bafu la thermostati ambalo halizidi joto lililowekwa, kwa hiyo ni salama kwa vimiminika vinavyowaka. Liweke, kisha pasha chombo kwalo.",
    ),
    width: 150,
    height: 90,
    controls: [
      toggle(
        "on",
        ["Bath", "Bafu"],
        ["On", "Limewashwa"],
        ["Off", "Limezimwa"],
      ),
      slider(
        "temp",
        ["Set temperature", "Joto lililowekwa"],
        40,
        95,
        5,
        70,
        "°C",
      ),
    ],
    state: { on: 0, temp: 70 },
    analyse: ({ part, p }) => {
      const out = heaterOutput(part);
      return {
        visual: { on: out ? 1 : 0, temp: p("temp") },
        readouts: out
          ? [
              readout(
                ["Bath temperature", "Joto la bafu"],
                `${fixed(p("temp"), 0)} °C`,
              ),
              readout(
                ["Heat to the liquid", "Joto kwa kioevu"],
                `${fixed(out.watts, 0)} W (up to ${p("temp")} °C)`,
              ),
            ]
          : [],
        issues: [
          issue("cap", "tip", [
            "Liquids in a water bath cannot get hotter than the bath, and never boil away if it is set below the boiling point.",
            "Vimiminika kwenye bafu la maji haviwezi kuwa moto kuliko bafu, na havichemki ikiwa limewekwa chini ya kiwango cha kuchemka.",
          ]),
        ],
      };
    },
  },
  "sand-bath": {
    name: t("Sand bath", "Bafu la mchanga"),
    description: t(
      "A dish of sand on a heater. It heats a flask slowly and evenly, to temperatures above a water bath.",
      "Sahani ya mchanga juu ya kifaa cha joto. Hupasha chupa polepole na sawasawa, kwa joto zaidi ya bafu la maji.",
    ),
    width: 140,
    height: 80,
    controls: [
      toggle(
        "on",
        ["Power", "Umeme"],
        ["On", "Umewashwa"],
        ["Off", "Umezimwa"],
      ),
      slider("power", ["Setting", "Mpangilio"], 0, 100, 5, 50, "%"),
    ],
    state: { on: 0, power: 50 },
    analyse: ({ part, p }) => {
      const out = heaterOutput(part);
      return {
        visual: { on: out ? 1 : 0 },
        readouts: out
          ? [
              readout(
                ["Sand temperature", "Joto la mchanga"],
                `${fixed(25 + p("power") * 2.6, 0)} °C`,
              ),
            ]
          : [],
        issues: [hotSurface],
      };
    },
  },
};
