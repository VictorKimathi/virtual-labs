import type { BioPart, BioPartSpec, BioState } from "../../biology.types";
import {
  addIncident,
  note,
  overlaps,
  partByNum,
  setParams,
} from "../../engine/operations";
import { formatSpan } from "../../engine/time";
import {
  issue,
  measure,
  readout,
  t,
  task,
} from "../../../workbench/data/catalogue/helpers";
import { button, choice, link, toggle } from "./controls";

type MicrobiologyKind =
  | "petri-dish"
  | "nutrient-agar"
  | "inoculating-loop"
  | "bunsen-burner"
  | "autoclave"
  | "incubator"
  | "cotton-wool"
  | "masking-tape";

export const plateSamples: {
  name: [string, string];
  colonies: number;
  mould: boolean;
}[] = [
  {
    name: ["Nothing (control)", "Hakuna (kulinganisha)"],
    colonies: 0,
    mould: false,
  },
  {
    name: ["Unwashed fingertip", "Ncha ya kidole kisichooshwa"],
    colonies: 40,
    mould: false,
  },
  {
    name: ["Washed fingertip", "Ncha ya kidole kilichooshwa"],
    colonies: 8,
    mould: false,
  },
  { name: ["Soil", "Udongo"], colonies: 60, mould: true },
  { name: ["Yoghurt", "Mtindi"], colonies: 25, mould: false },
  {
    name: [
      "Left open to the air for 10 minutes",
      "Imeachwa wazi hewani dakika 10",
    ],
    colonies: 12,
    mould: true,
  },
];

const incubatorTemps = [25, 30, 37];
const MOLTEN_FOR = 3600;

export function coloniesOn(plate: BioPart, parts: BioPart[], time: number) {
  const p = plate.params;
  if (p.poured !== 1) return 0;
  const sample = plateSamples[p.sample ?? 0] ?? plateSamples[0];
  const fromSample = p.inoculated === 1 && p.killed !== 1 ? sample.colonies : 0;
  const total = fromSample + (p.contaminated ?? 0);
  const incubator = partByNum({ parts }, p.incubator ?? 0);
  const inside = p.inAt > 0 && incubator;
  const temp = inside ? incubatorTemps[incubator.params.temp ?? 0] : 22;
  const speed = temp >= 37 ? 1.1 : temp >= 30 ? 1 : temp >= 25 ? 0.8 : 0.5;
  const since = inside ? p.inAt : (p.pouredAt ?? time);
  const hours = Math.max(0, time - since) / 3600;
  return Math.round(total * speed * (1 - Math.exp(-hours / 18)));
}

const lit = (state: { parts: BioPart[] }) =>
  state.parts.some(
    (item) => item.kind === "bunsen-burner" && item.params.lit === 1,
  );

export const microbiologyParts: Record<MicrobiologyKind, BioPartSpec> = {
  "petri-dish": {
    name: t("Petri dish", "Sahani ya Petri"),
    description: t(
      "Pour sterile agar, inoculate with a flamed loop, tape the lid with two strips, incubate at 25–30 °C and never open it again.",
      "Mimina agar safi, panda kwa kitanzi kilichochomwa, funga kifuniko kwa vipande viwili vya utepe, atamiza kwa 25–30 °C na usiifungue tena.",
    ),
    width: 110,
    height: 70,
    controls: [
      button(
        "pour",
        ["Pour molten agar", "Mimina agar iliyoyeyuka"],
        ({ state, part, time }) => {
          const agar = state.parts.find(
            (item) => item.kind === "nutrient-agar",
          );
          if (
            !agar ||
            !agar.params.meltedAt ||
            time - agar.params.meltedAt > MOLTEN_FOR
          )
            return note(
              state,
              part,
              t(
                "You need molten agar: sterilise it in the autoclave first.",
                "Unahitaji agar iliyoyeyuka: isafishe kwenye otoklevu kwanza.",
              ),
            );
          const hood = state.parts.some(
            (item) =>
              item.kind === "laminar-flow-hood" &&
              item.params.on === 1 &&
              overlaps(item, part),
          );
          const air = hood ? 0 : lit(state) ? 2 : 8;
          return setParams(state, part, {
            poured: 1,
            pouredAt: time,
            contaminated: (agar.params.sterile === 1 ? 0 : 30) + air,
          });
        },
        (part) => part.params.poured !== 1,
      ),
      choice(
        "sample",
        ["Sample", "Sampuli"],
        plateSamples.map((item) => item.name),
      ),
      button(
        "inoculate",
        ["Streak the sample with the loop", "Panda sampuli kwa kitanzi"],
        ({ state, part, time }) => {
          const loop = state.parts.find(
            (item) => item.kind === "inoculating-loop",
          );
          if (!loop)
            return note(
              state,
              part,
              t("Add an inoculating loop.", "Ongeza kitanzi cha kupandia."),
            );
          const flamed = loop.params.flamedAt > 0 && loop.params.used !== 1;
          const hot = flamed && time - loop.params.flamedAt < 10;
          let next: BioState = setParams(state, loop, { used: 1 });
          next = setParams(next, part, {
            inoculated: 1,
            killed: hot ? 1 : 0,
            contaminated: (part.params.contaminated ?? 0) + (flamed ? 0 : 20),
          });
          return note(
            next,
            part,
            hot
              ? t(
                  "The loop was still red hot and killed the microbes it touched. Let it cool for 10 seconds.",
                  "Kitanzi kilikuwa bado chekundu kwa joto na kikaua vijidudu. Kiache kipoe sekunde 10.",
                )
              : flamed
                ? t("Streaked across the agar.", "Imepandwa kuvuka agar.")
                : t(
                    "The loop was not flamed, so it carried other microbes in.",
                    "Kitanzi hakikuchomwa, kwa hiyo kilibeba vijidudu vingine.",
                  ),
          );
        },
        (part) => part.params.poured === 1 && part.params.inoculated !== 1,
      ),
      choice(
        "lid",
        ["Lid", "Kifuniko"],
        [
          ["Not taped", "Haijafungwa"],
          ["Two strips of tape", "Vipande viwili vya utepe"],
          ["Taped all the way round", "Imefungwa pande zote"],
        ],
      ),
      link(
        "incubator",
        ["Incubator", "Kiatamizi"],
        ["Bench (room temperature)", "Benchi (joto la chumba)"],
        (candidate) => candidate.kind === "incubator",
      ),
      button(
        "incubate",
        [
          "Put it in the incubator upside down",
          "Iweke kwenye kiatamizi juu chini",
        ],
        ({ state, part, time }) => setParams(state, part, { inAt: time }),
        (part) => (part.params.incubator ?? 0) > 0 && !part.params.inAt,
      ),
      button(
        "open",
        ["Open the lid to look closer", "Fungua kifuniko kutazama karibu"],
        ({ state, part, time }) => {
          const colonies = coloniesOn(part, state.parts, time);
          const next = setParams(state, part, { opened: 1 });
          return colonies > 0 ? addIncident(next, "biohazard") : next;
        },
        (part) => part.params.poured === 1,
      ),
      button(
        "dispose",
        [
          "Put it in a biohazard bag for the autoclave",
          "Iweke kwenye mfuko wa taka hatari kwa otoklevu",
        ],
        ({ state, part }) =>
          state.parts.some((item) => item.kind === "biohazard-bag")
            ? setParams(state, part, { disposed: 1 })
            : note(
                state,
                part,
                t(
                  "Add a biohazard bag first.",
                  "Ongeza mfuko wa taka hatari kwanza.",
                ),
              ),
        (part) => part.params.poured === 1 && part.params.disposed !== 1,
      ),
    ],
    state: {
      poured: 0,
      pouredAt: 0,
      inoculated: 0,
      killed: 0,
      contaminated: 0,
      inAt: 0,
      opened: 0,
      disposed: 0,
    },
    analyse: ({ part, p, env }) => {
      const colonies = coloniesOn(part, env.parts, env.time);
      const incubator = env.part(p("incubator"));
      const temp = incubator ? incubatorTemps[incubator.params.temp ?? 0] : 22;
      return {
        visual: {
          colonies,
          poured: p("poured"),
          mould: (plateSamples[p("sample")]?.mould ?? false) ? 1 : 0,
          lid: p("lid"),
        },
        observations: part.contents.notes,
        readouts: [
          ...(p("inAt") > 0
            ? [
                readout(
                  ["Incubated for", "Imeatamizwa kwa"],
                  formatSpan(env.time - p("inAt")),
                ),
              ]
            : []),
          readout(
            ["Colonies", "Makoloni"],
            colonies > 0 ? "visible" : "none yet",
          ),
        ],
        issues: [
          ...(p("poured") === 1 && p("lid") === 0
            ? [
                issue("tape", "warn", [
                  "Tape the lid with two strips so it cannot fall open.",
                  "Funga kifuniko kwa vipande viwili ili kisifunguke.",
                ]),
              ]
            : []),
          ...(p("lid") === 2
            ? [
                issue("seal", "bad", [
                  "Never seal all the way round: no oxygen gets in and harmful anaerobic bacteria can grow.",
                  "Kamwe usifunge pande zote: oksijeni haiingii na bakteria hatari wasiotumia oksijeni wanaweza kukua.",
                ]),
              ]
            : []),
          ...(p("inAt") > 0 && temp >= 37
            ? [
                issue("hot", "bad", [
                  "37 °C is body temperature, which suits harmful bacteria. School plates are incubated at 25–30 °C.",
                  "37 °C ni joto la mwili, linalofaa bakteria hatari. Sahani za shule huatamizwa kwa 25–30 °C.",
                ]),
              ]
            : []),
          ...(p("opened") === 1
            ? [
                issue("opened", "bad", [
                  "The lid was opened after incubation. Wipe the bench with disinfectant and bag the plate.",
                  "Kifuniko kilifunguliwa baada ya kuatamiza. Futa benchi kwa dawa ya kuua viini na weka sahani kwenye mfuko.",
                ]),
              ]
            : []),
        ],
        tasks:
          colonies > 0 && colonies <= 80
            ? [
                task(
                  `col-${part.id}-${colonies}`,
                  ["Number of colonies", "Idadi ya makoloni"],
                  "",
                  colonies,
                  Math.max(1, Math.round(colonies * 0.1)),
                ),
              ]
            : [],
        measures:
          p("poured") === 1
            ? [
                measure(
                  "time",
                  ["Time incubated", "Muda wa kuatamiza"],
                  "h",
                  p("inAt") > 0 ? (env.time - p("inAt")) / 3600 : 0,
                  1,
                ),
              ]
            : [],
      };
    },
  },
  "nutrient-agar": {
    name: t("Nutrient agar bottle", "Chupa ya agar ya virutubisho"),
    description: t(
      "Sterilise it in the autoclave, then pour it while it is still molten. Keep the cotton wool plug in.",
      "Isafishe kwenye otoklevu, kisha uimimine ikiwa bado imeyeyuka. Weka kizibo cha pamba.",
    ),
    width: 70,
    height: 110,
    state: { sterile: 0, meltedAt: 0 },
    analyse: ({ p, env }) => {
      const molten =
        p("meltedAt") > 0 && env.time - p("meltedAt") <= MOLTEN_FOR;
      return {
        visual: { molten: molten ? 1 : 0 },
        readouts: [
          readout(["State", "Hali"], molten ? "molten" : "set solid"),
          readout(
            ["Sterile", "Safi"],
            p("sterile") === 1 ? "yes" : "no",
            p("sterile") === 1 ? "ok" : "warn",
          ),
        ],
        issues: [
          ...(p("sterile") === 0
            ? [
                issue("sterile", "tip", [
                  "Stand it on the autoclave and run a cycle to sterilise and melt it.",
                  "Isimamishe kwenye otoklevu na uendeshe mzunguko kuisafisha na kuiyeyusha.",
                ]),
              ]
            : []),
          ...(!env.has("cotton-wool")
            ? [
                issue("plug", "tip", [
                  "Plug the bottle with cotton wool so microbes in the air cannot get in.",
                  "Ziba chupa kwa pamba ili vijidudu vya hewani visiingie.",
                ]),
              ]
            : []),
          ...(p("meltedAt") > 0 && !molten
            ? [
                issue("set", "warn", [
                  "The agar has set. Melt it again in the autoclave.",
                  "Agar imeganda. Iyeyushe tena kwenye otoklevu.",
                ]),
              ]
            : []),
        ],
      };
    },
  },
  "inoculating-loop": {
    name: t("Inoculating loop", "Kitanzi cha kupandia"),
    description: t(
      "Flame it until red hot before and after use, and let it cool for 10 seconds before touching the culture.",
      "Kichome hadi kiwe chekundu kabla na baada ya kutumia, na kiache kipoe sekunde 10 kabla ya kugusa kilimo.",
    ),
    width: 140,
    height: 24,
    controls: [
      button(
        "flame",
        ["Flame until red hot", "Choma hadi kiwe chekundu"],
        ({ state, part, time }) =>
          lit(state)
            ? setParams(state, part, { flamedAt: time, used: 0 })
            : note(
                state,
                part,
                t(
                  "Light a Bunsen burner first.",
                  "Washa kichomeo cha Bunsen kwanza.",
                ),
              ),
      ),
    ],
    state: { flamedAt: 0, used: 0 },
    analyse: ({ part, p, env }) => {
      const hot = p("flamedAt") > 0 && env.time - p("flamedAt") < 10;
      return {
        visual: { hot: hot ? 1 : 0 },
        observations: part.contents.notes,
        readouts: [
          readout(
            ["Loop", "Kitanzi"],
            hot
              ? "red hot"
              : p("flamedAt") > 0 && p("used") === 0
                ? "sterile"
                : "not sterile",
            p("flamedAt") > 0 && p("used") === 0 && !hot ? "ok" : "warn",
          ),
        ],
      };
    },
  },
  "bunsen-burner": {
    name: t("Bunsen burner", "Kichomeo cha Bunsen"),
    description: t(
      "For flaming loops. Working near the flame keeps airborne microbes away.",
      "Kwa kuchoma vitanzi. Kufanya kazi karibu na mwali huweka vijidudu vya hewani mbali.",
    ),
    width: 90,
    height: 180,
    tapToggles: "lit",
    controls: [
      toggle(
        "lit",
        ["Burner", "Kichomeo"],
        ["Lit", "Kinawaka"],
        ["Off", "Kimezimwa"],
      ),
      toggle(
        "air",
        ["Air hole", "Tundu la hewa"],
        ["Open (blue flame)", "Wazi (mwali wa buluu)"],
        ["Closed (yellow flame)", "Imefungwa (mwali wa njano)"],
      ),
    ],
    state: { lit: 0, air: 0 },
    analyse: ({ p }) => ({
      visual: { lit: p("lit"), air: p("air") },
      issues:
        p("lit") === 1 && p("air") === 0
          ? [
              issue("air", "tip", [
                "Open the air hole for a hot blue flame to sterilise the loop.",
                "Fungua tundu la hewa upate mwali wa buluu wenye joto kusafisha kitanzi.",
              ]),
            ]
          : [],
    }),
  },
  autoclave: {
    name: t("Autoclave (pressure cooker)", "Otoklevu (sufuria ya shinikizo)"),
    description: t(
      "Sterilises at 121 °C for 15 minutes. Stand items on it. Wait for the pressure to fall before opening.",
      "Husafisha kwa 121 °C kwa dakika 15. Simamisha vitu juu yake. Subiri shinikizo lishuke kabla ya kufungua.",
    ),
    width: 140,
    height: 130,
    controls: [
      button(
        "run",
        ["Run a cycle (121 °C, 15 min)", "Endesha mzunguko (121 °C, dak 15)"],
        ({ state, part, time }) => setParams(state, part, { cycleAt: time }),
        (part) => !part.params.cycleAt,
      ),
      button(
        "open",
        ["Open the lid", "Fungua kifuniko"],
        ({ state, part, time }) => {
          if (time - (part.params.cycleAt ?? 0) < 1800)
            return addIncident(
              note(
                state,
                part,
                t(
                  "Steam burst out: it was still under pressure.",
                  "Mvuke ulitoka kwa nguvu: bado ulikuwa na shinikizo.",
                ),
              ),
              "burn",
            );
          let next = setParams(state, part, { cycleAt: 0 });
          for (const item of state.parts.filter((other) =>
            overlaps(other, part),
          )) {
            if (item.kind === "nutrient-agar")
              next = setParams(next, item, { sterile: 1, meltedAt: time });
            if (item.kind === "petri-dish" && item.params.poured === 1)
              next = setParams(next, item, { disposed: 1 });
          }
          return note(
            next,
            part,
            t(
              "Sterilised. Anything on it is now safe.",
              "Imesafishwa. Chochote juu yake sasa ni salama.",
            ),
          );
        },
        (part) => Boolean(part.params.cycleAt),
      ),
    ],
    state: { cycleAt: 0 },
    analyse: ({ part, p, env }) => {
      const elapsed = p("cycleAt") > 0 ? env.time - p("cycleAt") : 0;
      const stage =
        p("cycleAt") === 0
          ? "ready"
          : elapsed < 900
            ? "heating at 121 °C"
            : elapsed < 1800
              ? "cooling: still under pressure"
              : "safe to open";
      return {
        visual: { running: p("cycleAt") > 0 && elapsed < 1800 ? 1 : 0 },
        observations: part.contents.notes,
        readouts: [
          readout(
            ["Status", "Hali"],
            stage,
            elapsed >= 1800 ? "ok" : p("cycleAt") > 0 ? "warn" : undefined,
          ),
          ...(p("cycleAt") > 0
            ? [readout(["Time", "Muda"], formatSpan(elapsed))]
            : []),
        ],
      };
    },
  },
  incubator: {
    name: t("Incubator", "Kiatamizi"),
    description: t(
      "Keeps plates at a steady temperature. Use 25–30 °C for school cultures.",
      "Huweka sahani kwenye joto thabiti. Tumia 25–30 °C kwa vilimo vya shule.",
    ),
    width: 140,
    height: 150,
    controls: [
      choice(
        "temp",
        ["Temperature", "Joto"],
        [
          ["25 °C", "25 °C"],
          ["30 °C", "30 °C"],
          ["37 °C", "37 °C"],
        ],
      ),
    ],
    analyse: ({ p }) => ({
      visual: { temp: incubatorTemps[p("temp")] ?? 25 },
      readouts: [
        readout(
          ["Set to", "Imewekwa"],
          `${incubatorTemps[p("temp")] ?? 25} °C`,
        ),
      ],
      issues:
        p("temp") === 2
          ? [
              issue("hot", "warn", [
                "37 °C encourages bacteria that live in the human body. Use 25–30 °C.",
                "37 °C huhimiza bakteria wanaoishi mwilini. Tumia 25–30 °C.",
              ]),
            ]
          : [],
    }),
  },
  "cotton-wool": {
    name: t("Cotton wool", "Pamba"),
    description: t(
      "Plugs bottles of sterile media so air can pass but microbes cannot.",
      "Huziba chupa za virutubisho safi ili hewa ipite lakini vijidudu visipite.",
    ),
    width: 70,
    height: 50,
  },
  "masking-tape": {
    name: t("Masking tape", "Utepe wa kufunika"),
    description: t(
      "Two strips hold a Petri dish lid on without sealing it.",
      "Vipande viwili hushikilia kifuniko cha sahani ya Petri bila kuifunga kabisa.",
    ),
    width: 70,
    height: 70,
  },
};
