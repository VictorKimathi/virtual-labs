import type { LocalizedText } from "../../workbench/workbench.types";
import type {
  BioExperiment,
  BioGoal,
  BioGoalContext,
  BioKind,
  BioPart,
} from "../biology.types";
import { tubeLook } from "../engine/food";
import { microscopeImage } from "../engine/microscope";
import {
  currentContents,
  partByNum,
  tubeTemperature,
} from "../engine/operations";
import { pcrResult } from "./catalogue/modern";
import { germination } from "./catalogue/genetics";
import { coloniesOn } from "./catalogue/microbiology";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });
const goal = (
  id: string,
  en: string,
  sw: string,
  check: (context: BioGoalContext) => boolean,
): BioGoal => ({ id, label: t(en, sw), check });

const ofKind = (context: BioGoalContext, kinds: BioKind[]) =>
  context.parts.filter((part) => kinds.includes(part.kind));
const worn = (context: BioGoalContext, kind: BioKind) =>
  context.parts.some((part) => part.kind === kind && part.params.worn === 1);
const recorded = (context: BioGoalContext, measureId: string) =>
  context.records.filter((record) =>
    record.readings.some((reading) => reading.measureId === measureId),
  );
const noIncident = (context: BioGoalContext, kinds: string[]) =>
  !context.incidents.some((incident) => kinds.includes(incident.kind));

const tubes: BioKind[] = ["test-tube", "boiling-tube", "beaker"];

function tubeResult(context: BioGoalContext, part: BioPart) {
  const contents = currentContents(part, context.parts, context.time);
  return {
    contents,
    result: tubeLook(
      contents,
      20,
      tubeTemperature(part, context.parts, context.time),
    ).result,
  };
}

const anyTube = (context: BioGoalContext, test: (part: BioPart) => boolean) =>
  ofKind(context, tubes).some(test);
const resultIs = (context: BioGoalContext, result: string) =>
  anyTube(context, (part) => tubeResult(context, part).result === result);

function sharpAt(
  context: BioGoalContext,
  objective: number,
  specimen?: string,
) {
  return ofKind(context, ["light-microscope", "digital-microscope"]).some(
    (scope) => {
      const slide = partByNum(context, scope.params.slide ?? 0);
      const view = microscopeImage(scope, slide);
      return (
        slide !== undefined &&
        view.objective === objective &&
        view.blur < 1.5 &&
        !view.broken &&
        view.brightness >= 0.25 &&
        (!specimen || view.specimen === specimen)
      );
    },
  );
}

const dressed = goal(
  "dressed",
  "Wear a lab coat and goggles",
  "Vaa koti la maabara na miwani",
  (context) => worn(context, "lab-coat") && worn(context, "safety-goggles"),
);

export const bioExperiments: BioExperiment[] = [
  {
    id: "onion-cells",
    section: "microscopy",
    title: t(
      "Onion cells under the microscope",
      "Seli za kitunguu kwenye hadubini",
    ),
    summary: t(
      "Make a stained wet mount, focus from low to high power, then calibrate the graticule and measure a cell.",
      "Tengeneza kielelezo chenye rangi, lenga kutoka nguvu ndogo hadi kubwa, kisha rekebisha kipimo cha jicho na upime seli.",
    ),
    equipment: [
      "light-microscope",
      "glass-slide",
      "cover-slip",
      "onion-bulb",
      "forceps",
      "mounting-needle",
      "dropper",
      "iodine-solution",
      "stage-micrometer",
    ],
    steps: [
      t(
        "Peel a thin piece of onion epidermis with forceps.",
        "Menya kipande chembamba cha ngozi ya kitunguu kwa koleo.",
      ),
      t(
        "Glass slide: choose onion epidermis, add one drop of iodine, then lower the cover slip at an angle.",
        "Slaidi: chagua ngozi ya kitunguu, ongeza tone moja la iodini, kisha shusha kifuniko kwa pembe.",
      ),
      t(
        "Microscope: put the slide on the stage, switch on the light, choose ×4 and focus with the coarse knob, then the fine knob.",
        "Hadubini: weka slaidi jukwaani, washa mwanga, chagua ×4 na ulenge kwa kifundo kikuu, kisha kidogo.",
      ),
      t(
        "Turn to ×40 and use only the fine knob.",
        "Geuza kwenda ×40 na utumie kifundo kidogo tu.",
      ),
      t(
        "Put in the graticule. Swap in the stage micrometer to work out one eyepiece unit, then measure a cell.",
        "Weka kipimo cha jicho. Badilisha kwa kipimo cha jukwaa kupata kipimo kimoja cha jicho, kisha upime seli.",
      ),
    ],
    goals: [
      goal(
        "mount",
        "Make an iodine-stained mount with no air bubbles",
        "Tengeneza kielelezo cha iodini bila viputo vya hewa",
        (context) =>
          ofKind(context, ["glass-slide"]).some(
            (part) =>
              part.params.specimen === 1 &&
              part.params.stain === 1 &&
              part.params.cover === 1 &&
              (part.params.drops ?? 0) >= 1 &&
              (part.params.drops ?? 0) <= 3,
          ),
      ),
      goal(
        "low",
        "Focus the cells on low power",
        "Lenga seli kwenye nguvu ndogo",
        (context) =>
          sharpAt(context, 4, "onion") || sharpAt(context, 10, "onion"),
      ),
      goal(
        "high",
        "See the nucleus on high power",
        "Ona kiini kwenye nguvu kubwa",
        (context) => sharpAt(context, 40, "onion"),
      ),
      goal(
        "calibrate",
        "Calibrate the graticule with the stage micrometer",
        "Rekebisha kipimo cha jicho kwa kipimo cha jukwaa",
        (context) =>
          sharpAt(context, 40, "micrometer") &&
          ofKind(context, ["light-microscope", "digital-microscope"]).some(
            (scope) => scope.params.graticule === 1,
          ),
      ),
      goal(
        "care",
        "Do it without breaking a slide",
        "Fanya hivyo bila kuvunja slaidi",
        (context) => noIncident(context, ["broken-slide"]),
      ),
    ],
  },
  {
    id: "food-tests",
    section: "food",
    title: t("Food tests", "Majaribio ya chakula"),
    summary: t(
      "Test foods for reducing sugar, starch, protein, lipid and vitamin C, and identify Unknown food X.",
      "Pima vyakula kwa sukari inayopunguza, wanga, protini, lipidi na vitamini C, na utambue chakula X.",
    ),
    equipment: [
      "safety-goggles",
      "test-tube",
      "test-tube-rack",
      "water-bath",
      "food-sample",
      "benedicts-solution",
      "iodine-solution",
      "biuret-reagent",
      "ethanol",
      "dcpip",
    ],
    steps: [
      t(
        "Put on goggles. Switch the water bath on at 100 °C and wait for it to boil.",
        "Vaa miwani. Washa bafu ya maji kwa 100 °C na usubiri ichemke.",
      ),
      t(
        "Reducing sugar: 2 mL sample + 2 mL Benedict's, heat in the water bath for 5 minutes.",
        "Sukari inayopunguza: mL 2 sampuli + mL 2 Benedict, pasha kwenye bafu ya maji dakika 5.",
      ),
      t(
        "Starch: 2 mL sample + 3 drops of iodine.",
        "Wanga: mL 2 sampuli + matone 3 ya iodini.",
      ),
      t(
        "Protein: 2 mL sample + 2 mL Biuret reagent.",
        "Protini: mL 2 sampuli + mL 2 kitendanishi cha Biuret.",
      ),
      t(
        "Lipid: 2 mL ethanol + 1 mL sample, then pour into a tube of water.",
        "Lipidi: mL 2 ethanoli + mL 1 sampuli, kisha mimina kwenye mrija wa maji.",
      ),
      t(
        "Vitamin C: add juice to 1 mL of DCPIP until the blue disappears.",
        "Vitamini C: ongeza juisi kwenye mL 1 ya DCPIP hadi buluu ipotee.",
      ),
    ],
    goals: [
      dressed,
      goal(
        "reducing",
        "Get a positive Benedict's test",
        "Pata jaribio chanya la Benedict",
        (context) => resultIs(context, "reducing"),
      ),
      goal(
        "starch",
        "Get a positive iodine test",
        "Pata jaribio chanya la iodini",
        (context) => resultIs(context, "starch"),
      ),
      goal(
        "protein",
        "Get a positive Biuret test",
        "Pata jaribio chanya la Biuret",
        (context) => resultIs(context, "protein"),
      ),
      goal(
        "lipid",
        "Get a positive emulsion test",
        "Pata jaribio chanya la mchanganyiko",
        (context) =>
          resultIs(context, "emulsion") || resultIs(context, "lipid"),
      ),
      goal(
        "vitamin",
        "Decolourise DCPIP with vitamin C",
        "Ondoa rangi ya DCPIP kwa vitamini C",
        (context) => resultIs(context, "dcpip-clear"),
      ),
    ],
  },
  {
    id: "non-reducing",
    section: "food",
    title: t("Non-reducing sugar test", "Jaribio la sukari isiyopunguza"),
    summary: t(
      "Sucrose gives no Benedict's result until it is boiled with acid and neutralised.",
      "Sukrosi haitoi matokeo ya Benedict hadi ichemshwe na asidi na kuondolewa asidi.",
    ),
    equipment: [
      "safety-goggles",
      "test-tube",
      "water-bath",
      "food-sample",
      "dilute-hcl",
      "sodium-hydrogen-carbonate",
      "benedicts-solution",
    ],
    steps: [
      t(
        "Set the food sample to sucrose solution. Show Benedict's alone stays blue.",
        "Weka sampuli kuwa myeyusho wa sukrosi. Onyesha Benedict peke yake inabaki buluu.",
      ),
      t(
        "New tube: 2 mL sucrose + 1 mL dilute HCl, boil for 2 minutes and take it out.",
        "Mrija mpya: mL 2 sukrosi + mL 1 HCl, chemsha dakika 2 na uutoe.",
      ),
      t(
        "Add sodium hydrogen carbonate until the fizzing stops, then do Benedict's test.",
        "Ongeza sodiamu haidrojeni kaboneti hadi povu likome, kisha fanya jaribio la Benedict.",
      ),
    ],
    goals: [
      dressed,
      goal(
        "blue",
        "Show sucrose alone gives a negative Benedict's test",
        "Onyesha sukrosi peke yake inatoa jaribio hasi la Benedict",
        (context) =>
          anyTube(
            context,
            (part) =>
              (part.contents.items.sucrose ?? 0) > 0 &&
              (part.contents.items.acid ?? 0) === 0 &&
              tubeResult(context, part).result === "no-reducing",
          ),
      ),
      goal(
        "positive",
        "Get a positive result after acid and neutralising",
        "Pata matokeo chanya baada ya asidi na kuondoa asidi",
        (context) =>
          anyTube(
            context,
            (part) =>
              (part.contents.items.acid ?? 0) > 0 &&
              (part.contents.items.alkali ?? 0) > 0 &&
              tubeResult(context, part).result === "reducing",
          ),
      ),
    ],
  },
  {
    id: "amylase-temperature",
    section: "food",
    title: t("Effect of temperature on amylase", "Athari ya joto kwa amilesi"),
    summary: t(
      "Compare starch digestion at body temperature with a boiled enzyme control.",
      "Linganisha umeng'enyaji wa wanga kwenye joto la mwili na kimeng'enya kilichochemshwa.",
    ),
    equipment: [
      "test-tube",
      "water-bath",
      "food-sample",
      "amylase",
      "iodine-solution",
      "thermometer",
    ],
    steps: [
      t(
        "Set one water bath to 37 °C and let it settle. Check it with a thermometer.",
        "Weka bafu moja ya maji kwa 37 °C na uiache itulie. Ikague kwa kipimajoto.",
      ),
      t(
        "Tube A: 5 mL starch + 1 mL amylase, in the 37 °C bath.",
        "Mrija A: mL 5 wanga + mL 1 amilesi, kwenye bafu ya 37 °C.",
      ),
      t(
        "Tube B: boil 1 mL amylase first, then add it to 5 mL starch at 37 °C.",
        "Mrija B: chemsha mL 1 amilesi kwanza, kisha iongeze kwenye mL 5 wanga kwa 37 °C.",
      ),
      t(
        "After 10 minutes add iodine to both. Speed up the clock if you like.",
        "Baada ya dakika 10 ongeza iodini kwa yote mawili. Ongeza kasi ya saa ukipenda.",
      ),
    ],
    goals: [
      goal(
        "digested",
        "Show amylase digests starch at 37 °C",
        "Onyesha amilesi inameng'enya wanga kwa 37 °C",
        (context) =>
          anyTube(
            context,
            (part) =>
              (part.contents.items.amylase ?? 0) > 0 &&
              !part.contents.denatured &&
              tubeResult(context, part).result === "no-starch",
          ),
      ),
      goal(
        "control",
        "Show the boiled enzyme does not",
        "Onyesha kimeng'enya kilichochemshwa hakifanyi hivyo",
        (context) =>
          anyTube(
            context,
            (part) =>
              (part.contents.items.amylase ?? 0) > 0 &&
              part.contents.denatured &&
              tubeResult(context, part).result === "starch",
          ),
      ),
    ],
  },
  {
    id: "catalase",
    section: "food",
    title: t("Catalase activity", "Utendaji wa katalesi"),
    summary: t(
      "Measure the froth of oxygen when catalase meets hydrogen peroxide, and compare with boiled catalase.",
      "Pima povu la oksijeni katalesi inapokutana na haidrojeni peroksaidi, na linganisha na katalesi iliyochemshwa.",
    ),
    equipment: [
      "safety-goggles",
      "boiling-tube",
      "catalase",
      "hydrogen-peroxide",
      "water-bath",
    ],
    steps: [
      t(
        "Put on goggles. Add 2 mL catalase to a boiling tube, then 5 mL hydrogen peroxide. Record the froth height.",
        "Vaa miwani. Ongeza mL 2 katalesi kwenye mrija wa kuchemsha, kisha mL 5 haidrojeni peroksaidi. Rekodi urefu wa povu.",
      ),
      t(
        "Boil catalase in another tube first, then add peroxide. Record again.",
        "Chemsha katalesi kwenye mrija mwingine kwanza, kisha ongeza peroksaidi. Rekodi tena.",
      ),
    ],
    goals: [
      dressed,
      goal(
        "froth",
        "Get a tall froth of oxygen",
        "Pata povu refu la oksijeni",
        (context) =>
          anyTube(
            context,
            (part) =>
              (part.contents.items.catalase ?? 0) > 0 &&
              currentContents(part, context.parts, context.time).foam > 15,
          ),
      ),
      goal(
        "boiled",
        "Show boiled catalase makes no froth",
        "Onyesha katalesi iliyochemshwa haitoi povu",
        (context) =>
          anyTube(
            context,
            (part) =>
              part.contents.denatured &&
              (part.contents.items.catalase ?? 0) > 0 &&
              (part.contents.items.peroxide ?? 0) > 0 &&
              currentContents(part, context.parts, context.time).foam < 2,
          ),
      ),
      goal(
        "record",
        "Record two froth heights",
        "Rekodi urefu wa povu mara mbili",
        (context) => recorded(context, "foam").length >= 2,
      ),
    ],
  },
  {
    id: "osmosis",
    section: "physiology",
    title: t("Osmosis in potato tissue", "Osmosisi kwenye tishu za kiazi"),
    summary: t(
      "Find the sucrose concentration that matches the potato cells by weighing cylinders before and after.",
      "Tafuta mkusanyiko wa sukrosi unaolingana na seli za kiazi kwa kupima silinda kabla na baada.",
    ),
    equipment: ["cork-borer", "plant-tissue", "electronic-balance"],
    steps: [
      t(
        "Add five tissue cylinders. Cut each with the cork borer and give each a different sucrose concentration.",
        "Ongeza silinda tano za tishu. Kata kila moja kwa kitobolea na upe kila moja mkusanyiko tofauti wa sukrosi.",
      ),
      t(
        "Put them in their solutions, then run the clock for at least 30 minutes.",
        "Ziweke kwenye miyeyusho yao, kisha endesha saa angalau dakika 30.",
      ),
      t(
        "Blot each dry, weigh it on the balance and work out the percentage change.",
        "Kausha kila moja, ipime kwenye mizani na ukokotoe asilimia ya mabadiliko.",
      ),
      t(
        "Plot the change against concentration. Where it crosses zero is the concentration of the cells.",
        "Chora mabadiliko dhidi ya mkusanyiko. Inapokata sifuri ndio mkusanyiko wa seli.",
      ),
    ],
    goals: [
      goal(
        "fair",
        "Cut every cylinder with the cork borer",
        "Kata kila silinda kwa kitobolea",
        (context) =>
          ofKind(context, ["plant-tissue"]).length >= 3 &&
          ofKind(context, ["plant-tissue"]).every(
            (part) => part.params.cut === 1,
          ),
      ),
      goal(
        "range",
        "Use at least four concentrations",
        "Tumia angalau mikusanyiko minne",
        (context) =>
          new Set(
            ofKind(context, ["plant-tissue"])
              .filter((part) => (part.params.startedAt ?? 0) > 0)
              .map((part) => part.params.conc),
          ).size >= 4,
      ),
      goal(
        "time",
        "Leave them at least 30 minutes",
        "Ziache angalau dakika 30",
        (context) =>
          ofKind(context, ["plant-tissue"]).some(
            (part) =>
              (part.params.startedAt ?? 0) > 0 &&
              context.time - part.params.startedAt >= 1800,
          ),
      ),
      goal(
        "weigh",
        "Weigh on a levelled, tared balance",
        "Pima kwenye mizani iliyosawazishwa na kuwekwa tare",
        (context) =>
          ofKind(context, ["electronic-balance"]).some(
            (part) =>
              part.params.level === 1 &&
              part.params.door === 1 &&
              part.params.zeroed === 1,
          ),
      ),
    ],
  },
  {
    id: "transpiration",
    section: "physiology",
    title: t(
      "Rate of transpiration with a potometer",
      "Kasi ya mvukizo kwa potomita",
    ),
    summary: t(
      "Measure water uptake by a shoot, then see how wind changes it.",
      "Pima maji yanayofyonzwa na chipukizi, kisha uone jinsi upepo unavyoibadilisha.",
    ),
    equipment: ["potometer"],
    steps: [
      t(
        "Fit the shoot under water and seal the joints.",
        "Weka chipukizi chini ya maji na uzibe viungo.",
      ),
      t(
        "Let in one air bubble. Wait 5 minutes, then record the bubble position every few minutes.",
        "Ingiza kiputo kimoja. Subiri dakika 5, kisha rekodi mahali pa kiputo kila dakika chache.",
      ),
      t(
        "Switch on the fan, reset the bubble, wait 5 minutes and record again.",
        "Washa feni, rudisha kiputo, subiri dakika 5 na urekodi tena.",
      ),
    ],
    goals: [
      goal(
        "setup",
        "Set it up air-tight",
        "Iandae bila kuvuja hewa",
        (context) =>
          ofKind(context, ["potometer"]).some(
            (part) =>
              part.params.cut === 1 &&
              part.params.sealed === 1 &&
              part.params.bubble === 1,
          ),
      ),
      goal(
        "readings",
        "Record four readings",
        "Rekodi vipimo vinne",
        (context) => recorded(context, "time").length >= 4,
      ),
      goal(
        "wind",
        "Measure with the fan on",
        "Pima feni ikiwa imewashwa",
        (context) =>
          ofKind(context, ["potometer"]).some(
            (part) => part.params.fan === 1 && part.params.bubble === 1,
          ),
      ),
    ],
  },
  {
    id: "photosynthesis",
    section: "physiology",
    title: t(
      "Light and the rate of photosynthesis",
      "Mwanga na kasi ya usanisinuru",
    ),
    summary: t(
      "Count the oxygen bubbles from pondweed at different lamp distances.",
      "Hesabu viputo vya oksijeni kutoka kwa gugu la maji kwa umbali tofauti wa taa.",
    ),
    equipment: ["pondweed", "lamp", "photometer"],
    steps: [
      t(
        "Link the lamp, switch it on and put the heat shield in place.",
        "Unganisha taa, iwashe na weka kinga ya joto.",
      ),
      t(
        "At each distance, wait 5 minutes, count bubbles for 1 minute and record.",
        "Kwa kila umbali, subiri dakika 5, hesabu viputo kwa dakika 1 na urekodi.",
      ),
      t(
        "Plot bubbles per minute against light intensity.",
        "Chora viputo kwa dakika dhidi ya mwangaza.",
      ),
    ],
    goals: [
      goal(
        "fair",
        "Keep the temperature steady with a heat shield",
        "Weka joto thabiti kwa kinga ya joto",
        (context) =>
          ofKind(context, ["pondweed"]).some(
            (part) => part.params.shield === 1 && (part.params.lamp ?? 0) > 0,
          ),
      ),
      goal(
        "five",
        "Record counts at five distances",
        "Rekodi hesabu kwa umbali tano",
        (context) =>
          new Set(
            recorded(context, "bubbles").map(
              (record) =>
                record.readings.find(
                  (reading) => reading.measureId === "distance",
                )?.value,
            ),
          ).size >= 5,
      ),
    ],
  },
  {
    id: "respiration",
    section: "physiology",
    title: t("Respiration rate of seeds", "Kasi ya upumuaji wa mbegu"),
    summary: t(
      "Use a respirometer with a control to measure the oxygen used by germinating seeds.",
      "Tumia respiromita yenye kulinganisha kupima oksijeni inayotumiwa na mbegu zinazoota.",
    ),
    equipment: ["respirometer"],
    steps: [
      t(
        "Use germinating seeds with soda lime, and connect the control tube.",
        "Tumia mbegu zinazoota na soda lime, na unganisha mrija wa kulinganisha.",
      ),
      t(
        "Leave it 10 minutes to settle, then close the screw clip.",
        "Iache dakika 10 itulie, kisha funga kibano.",
      ),
      t(
        "Record the distance the fluid moves every few minutes.",
        "Rekodi umbali kioevu kinasogea kila dakika chache.",
      ),
    ],
    goals: [
      goal(
        "setup",
        "Use soda lime and a control tube",
        "Tumia soda lime na mrija wa kulinganisha",
        (context) =>
          ofKind(context, ["respirometer"]).some(
            (part) => part.params.sodaLime === 1 && part.params.control === 1,
          ),
      ),
      goal(
        "settle",
        "Let it settle for 10 minutes before starting",
        "Iache itulie dakika 10 kabla ya kuanza",
        (context) =>
          ofKind(context, ["respirometer"]).some(
            (part) =>
              (part.params.closedAt ?? 0) > 0 &&
              part.params.closedAt - (part.params.setupAt ?? 0) >= 600,
          ),
      ),
      goal(
        "readings",
        "Record three readings",
        "Rekodi vipimo vitatu",
        (context) => recorded(context, "time").length >= 3,
      ),
    ],
  },
  {
    id: "rat-dissection",
    section: "dissection",
    title: t("Virtual rat dissection", "Upasuaji pepe wa panya"),
    summary: t(
      "Open the body cavity step by step and name the organs. No animal is harmed.",
      "Fungua tumbo hatua kwa hatua na utaje viungo. Hakuna mnyama anayeumizwa.",
    ),
    equipment: [
      "gloves",
      "dissecting-board",
      "dissecting-pins",
      "forceps",
      "dissecting-scissors",
      "mounting-needle",
      "rat",
    ],
    steps: [
      t(
        "Put on gloves. Drag the rat onto the dissecting board.",
        "Vaa glavu. Buruta panya juu ya ubao wa upasuaji.",
      ),
      t(
        "Do each step in order with the right tools.",
        "Fanya kila hatua kwa mpangilio kwa vifaa sahihi.",
      ),
      t("Name each marked organ.", "Taja kila kiungo kilichowekwa alama."),
    ],
    goals: [
      goal("gloves", "Wear gloves", "Vaa glavu", (context) =>
        worn(context, "gloves"),
      ),
      goal(
        "open",
        "Open the chest and abdomen",
        "Fungua kifua na tumbo",
        (context) =>
          ofKind(context, ["rat"]).some(
            (part) => (part.params.stage ?? 0) >= 6,
          ),
      ),
      goal("organs", "Name six organs", "Taja viungo sita", (context) =>
        ofKind(context, ["rat"]).some(
          (part) => (part.params.correct ?? 0) >= 6,
        ),
      ),
    ],
  },
  {
    id: "flower-structure",
    section: "dissection",
    title: t("Parts of a flower", "Sehemu za ua"),
    summary: t(
      "Cut a half flower and name its parts.",
      "Kata nusu ya ua na utaje sehemu zake.",
    ),
    equipment: [
      "dissecting-board",
      "razor-blade",
      "hand-lens",
      "flower",
      "sharps-container",
    ],
    steps: [
      t(
        "Put the flower on the board and cut it lengthwise with the razor blade.",
        "Weka ua ubaoni na ulikate kwa urefu kwa wembe.",
      ),
      t(
        "Look with the hand lens and name each part.",
        "Tazama kwa lenzi ya mkono na utaje kila sehemu.",
      ),
      t(
        "Put the used blade in the sharps container.",
        "Weka wembe uliotumika kwenye chombo cha vitu vikali.",
      ),
    ],
    goals: [
      goal(
        "cut",
        "Cut a half flower safely on the board",
        "Kata nusu ya ua kwa usalama ubaoni",
        (context) =>
          ofKind(context, ["flower"]).some(
            (part) => (part.params.stage ?? 0) >= 1,
          ) && noIncident(context, ["cut"]),
      ),
      goal("parts", "Name six parts", "Taja sehemu sita", (context) =>
        ofKind(context, ["flower"]).some(
          (part) => (part.params.correct ?? 0) >= 6,
        ),
      ),
      goal(
        "sharps",
        "Dispose of the blade safely",
        "Tupa wembe kwa usalama",
        (context) =>
          ofKind(context, ["razor-blade"]).some(
            (part) => part.params.disposed === 1,
          ),
      ),
    ],
  },
  {
    id: "quadrats",
    section: "ecology",
    title: t(
      "Estimating population with quadrats",
      "Kukadiria idadi kwa kwadrati",
    ),
    summary: t(
      "Place quadrats at random coordinates, count daisies and estimate their density.",
      "Weka kwadrati kwenye viwianishi vya nasibu, hesabu daisi na ukadirie msongamano wao.",
    ),
    equipment: ["field-plot", "quadrat", "tape-measure"],
    steps: [
      t(
        "Add a field plot and a quadrat.",
        "Ongeza shamba la utafiti na kwadrati.",
      ),
      t(
        "Place the quadrat at random coordinates, count the daisies and record. Repeat at least 10 times.",
        "Weka kwadrati kwenye viwianishi vya nasibu, hesabu daisi na urekodi. Rudia angalau mara 10.",
      ),
      t(
        "Mean per m² × 96 m² = estimated population.",
        "Wastani kwa m² × m² 96 = makadirio ya idadi.",
      ),
    ],
    goals: [
      goal(
        "random",
        "Record 10 random quadrats",
        "Rekodi kwadrati 10 za nasibu",
        (context) =>
          ofKind(context, ["quadrat"]).some(
            (part) => (part.params.logged ?? 0) >= 10,
          ),
      ),
      goal(
        "transect",
        "Lay a line transect across the field",
        "Laza mstari wa kupitia kuvuka shamba",
        (context) =>
          ofKind(context, ["tape-measure"]).some((tape) =>
            context.parts.some(
              (field) =>
                field.kind === "field-plot" &&
                tape.y + 7 >= field.y &&
                tape.y + 7 <= field.y + field.height,
            ),
          ),
      ),
    ],
  },
  {
    id: "aseptic",
    section: "microbiology",
    title: t("Growing microorganisms safely", "Kukuza vijidudu kwa usalama"),
    summary: t(
      "Compare washed and unwashed fingertips using aseptic technique.",
      "Linganisha ncha za vidole zilizooshwa na zisizooshwa kwa mbinu safi.",
    ),
    equipment: [
      "disinfectant",
      "nutrient-agar",
      "cotton-wool",
      "autoclave",
      "bunsen-burner",
      "inoculating-loop",
      "petri-dish",
      "masking-tape",
      "incubator",
      "biohazard-bag",
    ],
    steps: [
      t(
        "Wipe the bench with disinfectant. Sterilise the agar in the autoclave and wait before opening.",
        "Futa benchi kwa dawa ya kuua viini. Safisha agar kwenye otoklevu na usubiri kabla ya kufungua.",
      ),
      t(
        "Light the Bunsen. Pour the agar, flame the loop, let it cool for 10 s, and streak the sample.",
        "Washa Bunsen. Mimina agar, choma kitanzi, kiache kipoe sekunde 10, na upande sampuli.",
      ),
      t(
        "Tape the lid with two strips. Incubate at 25 °C for 3 days.",
        "Funga kifuniko kwa vipande viwili. Atamiza kwa 25 °C kwa siku 3.",
      ),
      t(
        "Count the colonies without opening the lid, then bag the plates.",
        "Hesabu makoloni bila kufungua kifuniko, kisha weka sahani kwenye mfuko.",
      ),
    ],
    goals: [
      goal(
        "clean",
        "Pour a plate with no contamination",
        "Mimina sahani bila uchafuzi",
        (context) =>
          ofKind(context, ["petri-dish"]).some(
            (part) =>
              part.params.poured === 1 && (part.params.contaminated ?? 0) <= 2,
          ),
      ),
      goal(
        "taped",
        "Tape the lid with two strips",
        "Funga kifuniko kwa vipande viwili",
        (context) =>
          ofKind(context, ["petri-dish"]).some((part) => part.params.lid === 1),
      ),
      goal(
        "safe-temp",
        "Incubate at 25–30 °C",
        "Atamiza kwa 25–30 °C",
        (context) =>
          ofKind(context, ["petri-dish"]).some(
            (part) =>
              (part.params.inAt ?? 0) > 0 &&
              (partByNum(context, part.params.incubator ?? 0)?.params.temp ??
                0) <= 1,
          ),
      ),
      goal(
        "grow",
        "Grow colonies from the sample",
        "Kuza makoloni kutoka sampuli",
        (context) =>
          ofKind(context, ["petri-dish"]).some(
            (part) =>
              part.params.killed !== 1 &&
              coloniesOn(part, context.parts, context.time) > 5,
          ),
      ),
      goal(
        "dispose",
        "Dispose of plates without opening them",
        "Tupa sahani bila kuzifungua",
        (context) =>
          ofKind(context, ["petri-dish"]).some(
            (part) => part.params.disposed === 1,
          ) && noIncident(context, ["biohazard"]),
      ),
    ],
  },
  {
    id: "germination",
    section: "genetics",
    title: t("Conditions for germination", "Mahitaji ya kuota"),
    summary: t(
      "Show that seeds need water, oxygen and warmth, using one tray as a control.",
      "Onyesha mbegu zinahitaji maji, oksijeni na joto, ukitumia trei moja kama kulinganisha.",
    ),
    equipment: ["germination-tray"],
    steps: [
      t(
        "Add three trays. Keep one with everything (control). Remove water from one and oxygen from another.",
        "Ongeza trei tatu. Moja iwe na kila kitu (kulinganisha). Ondoa maji kwa moja na oksijeni kwa nyingine.",
      ),
      t(
        "Sow all three, then run the clock for 4 days.",
        "Panda zote tatu, kisha endesha saa kwa siku 4.",
      ),
    ],
    goals: [
      goal(
        "control",
        "Germinate seeds in the control tray",
        "Otesha mbegu kwenye trei ya kulinganisha",
        (context) =>
          ofKind(context, ["germination-tray"]).some(
            (part) => germination(part, context.time).percent > 60,
          ),
      ),
      goal(
        "water",
        "Show seeds without water do not germinate",
        "Onyesha mbegu bila maji haziotei",
        (context) =>
          ofKind(context, ["germination-tray"]).some(
            (part) =>
              part.params.water === 0 &&
              germination(part, context.time).days >= 3,
          ),
      ),
      goal(
        "oxygen",
        "Show seeds without oxygen do not germinate",
        "Onyesha mbegu bila oksijeni haziotei",
        (context) =>
          ofKind(context, ["germination-tray"]).some(
            (part) =>
              part.params.oxygen === 0 &&
              germination(part, context.time).days >= 3,
          ),
      ),
    ],
  },
  {
    id: "maize-genetics",
    section: "genetics",
    title: t("Inheritance in maize", "Urithi kwenye mahindi"),
    summary: t(
      "Count kernels on a dihybrid cob and compare with the 9:3:3:1 ratio.",
      "Hesabu punje kwenye gunzi la dihaibridi na ulinganishe na uwiano 9:3:3:1.",
    ),
    equipment: ["maize-cob", "hand-lens"],
    steps: [
      t(
        "Set the cob to the dihybrid cross and count the kernels.",
        "Weka gunzi kuwa msalaba wa dihaibridi na uhesabu punje.",
      ),
      t(
        "Work out the ratio and the chi-squared value.",
        "Kokotoa uwiano na thamani ya chi-mraba.",
      ),
    ],
    goals: [
      goal(
        "count",
        "Count a dihybrid cob",
        "Hesabu gunzi la dihaibridi",
        (context) =>
          ofKind(context, ["maize-cob"]).some(
            (part) => part.params.cross === 1 && part.params.counted === 1,
          ),
      ),
    ],
  },
  {
    id: "pcr-gel",
    section: "modern",
    title: t("PCR and gel electrophoresis", "PCR na elektroforesisi ya jeli"),
    summary: t(
      "Copy DNA with PCR, then size the product on a gel against a ladder.",
      "Nakili DNA kwa PCR, kisha pima ukubwa wa matokeo kwenye jeli dhidi ya ngazi.",
    ),
    equipment: ["pcr-machine", "gel-electrophoresis", "micropipette"],
    steps: [
      t(
        "Set the PCR machine (try an annealing temperature near 55 °C) and run it.",
        "Weka mashine ya PCR (jaribu joto la kuunganisha karibu na 55 °C) na uiendeshe.",
      ),
      t(
        "Link the gel to the PCR machine, put the wells at the black (−) end and run it.",
        "Unganisha jeli na mashine ya PCR, weka visima upande mweusi (−) na uiendeshe.",
      ),
      t(
        "Compare the product band with the ladder.",
        "Linganisha mkanda wa matokeo na ngazi.",
      ),
    ],
    goals: [
      goal("pcr", "Get a PCR product", "Pata matokeo ya PCR", (context) =>
        ofKind(context, ["pcr-machine"]).some(
          (part) => pcrResult(part, context.time).amount > 0,
        ),
      ),
      goal(
        "gel",
        "Run a stained gel with a ladder",
        "Endesha jeli yenye rangi na ngazi",
        (context) =>
          ofKind(context, ["gel-electrophoresis"]).some(
            (part) =>
              part.params.wells === 0 &&
              part.params.ladder === 1 &&
              part.params.stain === 1 &&
              (part.params.runAt ?? 0) > 0 &&
              context.time - part.params.runAt >=
                (part.params.runFor ?? 30) * 60,
          ),
      ),
    ],
  },
  {
    id: "exercise",
    section: "modern",
    title: t(
      "Exercise, pulse and blood pressure",
      "Mazoezi, mapigo na shinikizo la damu",
    ),
    summary: t(
      "Measure blood pressure and pulse at rest and after exercise.",
      "Pima shinikizo la damu na mapigo ukiwa umepumzika na baada ya mazoezi.",
    ),
    equipment: ["blood-pressure-monitor", "pulse-oximeter", "data-logger"],
    steps: [
      t(
        "Fit the cuff on the upper arm at heart level and measure at rest. Record it.",
        "Funga kifuko kwenye mkono wa juu usawa wa moyo na upime ukiwa umepumzika. Rekodi.",
      ),
      t(
        "Change to 'just after exercise' and measure again. Record it.",
        "Badilisha kuwa 'mara baada ya mazoezi' na upime tena. Rekodi.",
      ),
    ],
    goals: [
      goal(
        "rest",
        "Measure correctly at rest",
        "Pima kwa usahihi ukiwa umepumzika",
        (context) =>
          ofKind(context, ["blood-pressure-monitor"]).some(
            (part) =>
              part.params.measured === 1 &&
              (part.params.subject ?? 0) === 0 &&
              (part.params.cuff ?? 0) === 0,
          ),
      ),
      goal(
        "after",
        "Measure after exercise",
        "Pima baada ya mazoezi",
        (context) =>
          ofKind(context, ["blood-pressure-monitor"]).some(
            (part) =>
              part.params.measured === 1 &&
              part.params.subject === 1 &&
              (part.params.cuff ?? 0) === 0,
          ),
      ),
      goal(
        "record",
        "Record both in the notebook",
        "Rekodi zote mbili kwenye daftari",
        (context) => recorded(context, "pulse").length >= 2,
      ),
    ],
  },
];
