import type { LocalizedText } from "../../workbench/workbench.types";
import type {
  ChemExperiment,
  ChemGoal,
  ChemGoalContext,
  ChemKind,
  ChemPart,
} from "../chemistry.types";
import { AMBIENT, molarity, phOf, totalVolume } from "../engine/contents";
import { conditionIndex } from "../engine/operations";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

const goal = (
  id: string,
  en: string,
  sw: string,
  check: (context: ChemGoalContext) => boolean,
): ChemGoal => ({ id, label: t(en, sw), check });

const ofKind = (context: ChemGoalContext, kinds: ChemKind[]) =>
  context.parts.filter((part) => kinds.includes(part.kind));

const worn = (context: ChemGoalContext, kind: ChemKind) =>
  context.parts.some((part) => part.kind === kind && part.params.worn === 1);

const used = (part: ChemPart, reagent: ChemKind) =>
  part.contents.ledger[reagent];

const recorded = (context: ChemGoalContext, measureId: string) =>
  context.records.flatMap((record) =>
    record.readings
      .filter((reading) => reading.measureId === measureId)
      .map((reading) => reading.value),
  );

const noIncident = (context: ChemGoalContext, kinds: string[]) =>
  !context.incidents.some((incident) => kinds.includes(incident.kind));

const dressed = goal(
  "dressed",
  "Wear a lab coat and safety goggles",
  "Vaa koti la maabara na miwani ya usalama",
  (context) => worn(context, "lab-coat") && worn(context, "safety-goggles"),
);

const flasks: ChemKind[] = [
  "conical-flask",
  "beaker",
  "flat-bottom-flask",
  "round-bottom-flask",
];
const tubes: ChemKind[] = [
  "test-tube",
  "boiling-tube",
  "beaker",
  "conical-flask",
  "microscale-kit",
];

const titration: ChemExperiment = {
  id: "acid-base-titration",
  section: "glassware",
  title: t("Acid–base titration", "Titrasheni ya asidi na besi"),
  summary: t(
    "Find the concentration of hydrochloric acid Solution A by titrating it against 0.1 mol/dm³ sodium hydroxide with phenolphthalein.",
    "Tafuta mkusanyiko wa asidi ya haidrokloriki Myeyusho A kwa kuutitrati dhidi ya sodiamu hidroksidi 0.1 mol/dm³ kwa fenolftaleini.",
  ),
  equipment: [
    "lab-coat",
    "safety-goggles",
    "burette",
    "burette-stand",
    "volumetric-pipette",
    "pipette-filler",
    "conical-flask",
    "sodium-hydroxide",
    "hydrochloric-acid",
    "phenolphthalein",
    "waste-container",
  ],
  steps: [
    t(
      "Put on a lab coat and goggles from the Safety tab.",
      "Vaa koti la maabara na miwani kutoka kichupo cha Usalama.",
    ),
    t(
      "Set the sodium hydroxide bottle to 0.1 mol/dm³ and the hydrochloric acid bottle to Solution A.",
      "Weka chupa ya sodiamu hidroksidi kuwa 0.1 mol/dm³ na chupa ya asidi ya haidrokloriki kuwa Myeyusho A.",
    ),
    t(
      "Burette: choose the sodium hydroxide under 'Add from', press Rinse, then add 50 mL.",
      "Biureti: chagua sodiamu hidroksidi kwenye 'Ongeza kutoka', bonyeza Suuza, kisha ongeza mL 50.",
    ),
    t(
      "Run 1 mL through the tip to remove the air bubble, then record the initial reading.",
      "Toa mL 1 kupitia ncha kuondoa kiputo cha hewa, kisha rekodi kipimo cha mwanzo.",
    ),
    t(
      "Pipette: draw from Solution A, press Rinse, draw again with the meniscus on the mark, and release into the conical flask. Leave the last drop in the tip.",
      "Pipeti: vuta kutoka Myeyusho A, bonyeza Suuza, vuta tena uso ukiwa kwenye alama, na uachilie kwenye chupa ya koni. Acha tone la mwisho kwenye ncha.",
    ),
    t(
      "Add 2–3 drops of phenolphthalein to the flask.",
      "Ongeza matone 2–3 ya fenolftaleini kwenye chupa.",
    ),
    t(
      "Run in the alkali, 1 mL at a time, then 0.05 mL near the end, until the first permanent pale pink.",
      "Toa alikali, mL 1 kwa wakati, kisha mL 0.05 karibu na mwisho, hadi rangi ya waridi hafifu ya kwanza inayodumu.",
    ),
    t(
      "Record the final reading and press Record in the notebook. Repeat until two titres agree within 0.10 cm³.",
      "Rekodi kipimo cha mwisho na ubonyeze Rekodi kwenye daftari. Rudia hadi titre mbili zilingane ndani ya 0.10 cm³.",
    ),
    t(
      "Work out the concentration: moles of NaOH = 0.1 × titre ÷ 1000; this equals the moles of HCl in 25.0 cm³.",
      "Kokotoa mkusanyiko: moli za NaOH = 0.1 × titre ÷ 1000; hizi ni sawa na moli za HCl ndani ya 25.0 cm³.",
    ),
  ],
  goals: [
    dressed,
    goal(
      "rinse-burette",
      "Rinse the burette with the alkali before filling it",
      "Suuza biureti kwa alikali kabla ya kuijaza",
      (context) =>
        ofKind(context, ["burette"]).some(
          (part) =>
            part.params.cond === conditionIndex("sodium-hydroxide") &&
            totalVolume(part.contents) > 1,
        ),
    ),
    goal(
      "bubble",
      "Remove the air bubble and record the initial reading",
      "Ondoa kiputo cha hewa na urekodi kipimo cha mwanzo",
      (context) =>
        ofKind(context, ["burette"]).some(
          (part) => part.params.bubble === 0 && part.params.hasInit === 1,
        ),
    ),
    goal(
      "pipette",
      "Pipette exactly 25.0 cm³ of Solution A with a pipette filler",
      "Tumia pipeti kupima 25.0 cm³ kamili za Myeyusho A kwa kijazaji",
      (context) =>
        noIncident(context, ["swallowed"]) &&
        ofKind(context, flasks).some((part) => {
          const acid = used(part, "hydrochloric-acid");
          return acid !== undefined && Math.abs(acid.volume - 25) <= 0.1;
        }),
    ),
    goal(
      "indicator",
      "Add phenolphthalein to the flask",
      "Ongeza fenolftaleini kwenye chupa",
      (context) =>
        ofKind(context, flasks).some(
          (part) => part.contents.indicator?.id === "phenolphthalein",
        ),
    ),
    goal(
      "end-point",
      "Stop at the end point: the first permanent pale pink",
      "Simama kwenye mwisho: waridi hafifu ya kwanza inayodumu",
      (context) =>
        ofKind(context, flasks).some((part) => {
          const ph = phOf(part.contents);
          return (
            part.contents.indicator?.id === "phenolphthalein" &&
            used(part, "sodium-hydroxide") !== undefined &&
            ph !== null &&
            ph >= 8.2 &&
            ph <= 10.5
          );
        }),
    ),
    goal(
      "record",
      "Record a titre in the notebook",
      "Rekodi titre kwenye daftari",
      (context) => recorded(context, "titre").length > 0,
    ),
    goal(
      "concordant",
      "Get two titres within 0.10 cm³ of each other",
      "Pata titre mbili zinazotofautiana kwa 0.10 cm³ au chini",
      (context) => {
        const titres = recorded(context, "titre");
        return titres.some((first, index) =>
          titres.some(
            (second, other) =>
              other !== index && Math.abs(first - second) <= 0.1,
          ),
        );
      },
    ),
  ],
};

export const chemExperiments: ChemExperiment[] = [
  titration,
  {
    id: "standard-solution",
    section: "glassware",
    title: t("Making a standard solution", "Kutengeneza myeyusho sanifu"),
    summary: t(
      "Make 100 cm³ of 0.100 mol/dm³ sodium carbonate in a volumetric flask.",
      "Tengeneza 100 cm³ za sodiamu kaboneti 0.100 mol/dm³ ndani ya chupa ya ujazo.",
    ),
    equipment: [
      "lab-coat",
      "safety-goggles",
      "electronic-balance",
      "beaker",
      "sodium-carbonate",
      "distilled-water",
      "glass-rod",
      "volumetric-flask",
    ],
    steps: [
      t(
        "Level the balance, close the draught shield and press Tare with the pan empty.",
        "Sawazisha mizani, funga kinga ya upepo na ubonyeze Tare sahani ikiwa tupu.",
      ),
      t(
        "Stand a beaker on the pan and Tare it. Set the sodium carbonate bottle to Crystals and add 1.06 g.",
        "Weka bika kwenye sahani na uweke Tare. Weka chupa ya sodiamu kaboneti kuwa Fuwele na uongeze g 1.06.",
      ),
      t(
        "Add about 50 cm³ of distilled water and stir until it dissolves.",
        "Ongeza takriban 50 cm³ za maji yaliyosafishwa na ukoroge hadi iyeyuke.",
      ),
      t(
        "Pour it into the volumetric flask, rinse the beaker into the flask, then make up to the mark using fine additions.",
        "Imimine kwenye chupa ya ujazo, suuza bika ndani ya chupa, kisha jaza hadi alama kwa nyongeza ndogo.",
      ),
      t(
        "Stopper the flask and invert it to mix.",
        "Funga chupa kwa kizibo na uigeuze kuchanganya.",
      ),
    ],
    goals: [
      dressed,
      goal(
        "balance",
        "Level, shield and zero the balance",
        "Sawazisha, kinga na weka sifuri mizani",
        (context) =>
          ofKind(context, ["electronic-balance"]).some(
            (part) =>
              part.params.level === 1 &&
              part.params.door === 1 &&
              part.params.zeroed === 1,
          ),
      ),
      goal(
        "mass",
        "Weigh out 1.06 g of sodium carbonate (10.0 mmol)",
        "Pima g 1.06 za sodiamu kaboneti (mmol 10.0)",
        (context) =>
          context.parts.some(
            (part) =>
              Math.abs((used(part, "sodium-carbonate")?.mmol ?? 0) - 10) <= 0.3,
          ),
      ),
      goal(
        "mark",
        "Make the volumetric flask up to the mark",
        "Jaza chupa ya ujazo hadi alama",
        (context) =>
          ofKind(context, ["volumetric-flask"]).some(
            (part) =>
              used(part, "sodium-carbonate") !== undefined &&
              Math.abs(totalVolume(part.contents) - 100) <= 0.15,
          ),
      ),
      goal(
        "mix",
        "Stopper the flask to mix it",
        "Funga chupa kwa kizibo kuichanganya",
        (context) =>
          ofKind(context, ["volumetric-flask"]).some(
            (part) =>
              part.params.stopper === 1 && totalVolume(part.contents) > 99,
          ),
      ),
    ],
  },
  {
    id: "auto-titration",
    section: "modern",
    title: t(
      "Titration curve with an automatic titrator",
      "Mkunjo wa titrasheni kwa kititrati cha kujiendesha",
    ),
    summary: t(
      "Let a motor burette and a pH meter draw the pH curve of a titration and find the end point.",
      "Acha biureti ya mota na kipima pH zichore mkunjo wa pH wa titrasheni na zipate mwisho.",
    ),
    equipment: [
      "lab-coat",
      "safety-goggles",
      "ph-meter",
      "buffer-solution",
      "beaker",
      "auto-burette",
      "conical-flask",
      "volumetric-pipette",
      "pipette-filler",
      "sodium-hydroxide",
      "ethanoic-acid",
    ],
    steps: [
      t(
        "Calibrate the pH meter with the pH 7 buffer, then the pH 4 buffer.",
        "Rekebisha kipima pH kwa buffer ya pH 7, kisha buffer ya pH 4.",
      ),
      t(
        "Pipette 25.0 cm³ of 0.1 mol/dm³ ethanoic acid into the conical flask and put the pH probe in it.",
        "Weka 25.0 cm³ za asidi ya ethanoiki 0.1 mol/dm³ kwa pipeti kwenye chupa ya koni na weka kichunguzi cha pH ndani.",
      ),
      t(
        "Fill the titrator with 0.1 mol/dm³ sodium hydroxide, link the flask and the pH meter, set the end point to pH 8.7 and press Titrate.",
        "Jaza kititrati kwa sodiamu hidroksidi 0.1 mol/dm³, unganisha chupa na kipima pH, weka mwisho kuwa pH 8.7 na ubonyeze Titrati.",
      ),
      t(
        "Look at the curve: a weak acid starts near pH 3 and has its end point above 7.",
        "Angalia mkunjo: asidi dhaifu huanza karibu na pH 3 na mwisho wake uko juu ya 7.",
      ),
    ],
    goals: [
      goal(
        "calibrated",
        "Calibrate the pH meter at two points",
        "Rekebisha kipima pH kwa sehemu mbili",
        (context) =>
          ofKind(context, ["ph-meter"]).some(
            (part) => part.params.cal7 === 1 && part.params.calSlope === 1,
          ),
      ),
      goal(
        "curve",
        "Draw a titration curve",
        "Chora mkunjo wa titrasheni",
        (context) =>
          ofKind(context, ["auto-burette"]).some(
            (part) => (part.params.cn ?? 0) > 10,
          ),
      ),
      goal(
        "end",
        "Reach the end point near 25 cm³",
        "Fikia mwisho karibu na 25 cm³",
        (context) =>
          ofKind(context, ["auto-burette"]).some(
            (part) => Math.abs(part.params.dispensed - 25) <= 0.5,
          ),
      ),
    ],
  },
  {
    id: "ph-meter",
    section: "modern",
    title: t(
      "Calibrating and using a pH meter",
      "Kurekebisha na kutumia kipima pH",
    ),
    summary: t(
      "Calibrate with buffers, then compare a strong acid, a weak acid and an alkali.",
      "Rekebisha kwa buffer, kisha linganisha asidi kali, asidi dhaifu na alikali.",
    ),
    equipment: [
      "ph-meter",
      "buffer-solution",
      "beaker",
      "hydrochloric-acid",
      "ethanoic-acid",
      "sodium-hydroxide",
    ],
    steps: [
      t(
        "Add two buffer bottles, set one to pH 7 and one to pH 4, and pour each into a beaker.",
        "Ongeza chupa mbili za buffer, weka moja pH 7 na nyingine pH 4, na mimina kila moja kwenye bika.",
      ),
      t(
        "Put the probe in pH 7 and press Calibrate. Rinse, then do the same in pH 4.",
        "Weka kichunguzi kwenye pH 7 na ubonyeze Rekebisha. Suuza, kisha fanya vivyo hivyo kwenye pH 4.",
      ),
      t(
        "Measure 0.1 mol/dm³ HCl, 0.1 mol/dm³ ethanoic acid and 0.1 mol/dm³ NaOH, rinsing between each, and record each pH.",
        "Pima HCl 0.1 mol/dm³, asidi ya ethanoiki 0.1 mol/dm³ na NaOH 0.1 mol/dm³, ukisuuza kati ya kila moja, na urekodi kila pH.",
      ),
    ],
    goals: [
      goal(
        "cal7",
        "Calibrate at pH 7 first",
        "Rekebisha kwa pH 7 kwanza",
        (context) =>
          ofKind(context, ["ph-meter"]).some((part) => part.params.cal7 === 1),
      ),
      goal(
        "slope",
        "Calibrate the slope at pH 4 or 10",
        "Rekebisha mteremko kwa pH 4 au 10",
        (context) =>
          ofKind(context, ["ph-meter"]).some(
            (part) => part.params.calSlope === 1 && part.params.calBad !== 1,
          ),
      ),
      goal(
        "three",
        "Record three pH readings",
        "Rekodi vipimo vitatu vya pH",
        (context) => recorded(context, "ph").length >= 3,
      ),
    ],
  },
  {
    id: "rate-gas-syringe",
    section: "measurement",
    title: t(
      "Rate of reaction with a gas syringe",
      "Kasi ya athari kwa sirinji ya gesi",
    ),
    summary: t(
      "Follow the hydrogen given off by magnesium and hydrochloric acid, and plot volume against time.",
      "Fuatilia hidrojeni inayotolewa na magnesiamu na asidi ya haidrokloriki, na uchore ujazo dhidi ya muda.",
    ),
    equipment: [
      "lab-coat",
      "safety-goggles",
      "conical-flask",
      "gas-syringe",
      "stopwatch",
      "magnesium-ribbon",
      "hydrochloric-acid",
      "measuring-cylinder",
    ],
    steps: [
      t(
        "Zero the gas syringe and make sure the plunger moves freely. Link it to the conical flask.",
        "Weka sirinji ya gesi sifuri na hakikisha kijiti kinasogea kwa urahisi. Iunganishe na chupa ya koni.",
      ),
      t(
        "Put 50 cm³ of 1 mol/dm³ hydrochloric acid in the flask.",
        "Weka 50 cm³ za asidi ya haidrokloriki 1 mol/dm³ kwenye chupa.",
      ),
      t(
        "Reset the stopwatch. Add 0.05 g of magnesium ribbon, fit the stopper and start the stopwatch at once.",
        "Weka upya saa. Ongeza g 0.05 za utepe wa magnesiamu, weka kizibo na uanzishe saa mara moja.",
      ),
      t(
        "Press Record every 10 seconds or so, then plot volume against time in the graph.",
        "Bonyeza Rekodi kila sekunde 10 hivi, kisha chora ujazo dhidi ya muda kwenye grafu.",
      ),
    ],
    goals: [
      dressed,
      goal(
        "syringe",
        "Zero the syringe with a free-moving plunger",
        "Weka sirinji sifuri kijiti kikisogea kwa urahisi",
        (context) =>
          ofKind(context, ["gas-syringe"]).some(
            (part) =>
              part.params.zeroed === 1 &&
              part.params.lube === 1 &&
              part.params.from > 0,
          ),
      ),
      goal(
        "sealed",
        "Stopper the flask so the gas goes to the syringe",
        "Funga chupa kwa kizibo ili gesi iende kwenye sirinji",
        (context) =>
          ofKind(context, flasks).some(
            (part) => part.params.stopper === 1 && part.contents.gas.length > 0,
          ),
      ),
      goal(
        "points",
        "Record at least five volume and time readings",
        "Rekodi angalau vipimo vitano vya ujazo na muda",
        (context) =>
          context.records.filter(
            (record) =>
              record.readings.some(
                (reading) => reading.measureId === "volume",
              ) &&
              record.readings.some((reading) => reading.measureId === "time"),
          ).length >= 5,
      ),
    ],
  },
  {
    id: "metal-reactivity",
    section: "reagents",
    title: t("Reactivity of metals with acid", "Utendaji wa metali na asidi"),
    summary: t(
      "Compare how fast magnesium, zinc, iron and copper give off hydrogen with dilute hydrochloric acid.",
      "Linganisha kasi ya magnesiamu, zinki, chuma na shaba kutoa hidrojeni na asidi ya haidrokloriki iliyochanganywa.",
    ),
    equipment: [
      "safety-goggles",
      "test-tube",
      "test-tube-rack",
      "hydrochloric-acid",
      "magnesium-ribbon",
      "zinc-granules",
      "iron-filings",
      "copper-turnings",
    ],
    steps: [
      t(
        "Put 5 cm³ of 1 mol/dm³ hydrochloric acid in each of four test tubes.",
        "Weka 5 cm³ za asidi ya haidrokloriki 1 mol/dm³ kwenye kila mrija kati ya minne.",
      ),
      t(
        "Add 0.1 g of a different metal to each tube and watch the bubbles.",
        "Ongeza g 0.1 ya metali tofauti kwenye kila mrija na utazame viputo.",
      ),
      t(
        "Put the metals in order of reactivity.",
        "Panga metali kwa mpangilio wa utendaji.",
      ),
    ],
    goals: [
      goal(
        "goggles",
        "Wear safety goggles",
        "Vaa miwani ya usalama",
        (context) => worn(context, "safety-goggles"),
      ),
      goal(
        "hydrogen",
        "See hydrogen from three different metals",
        "Ona hidrojeni kutoka metali tatu tofauti",
        (context) =>
          ofKind(context, tubes).filter((part) =>
            part.contents.gas.some((event) => event.gas === "H2"),
          ).length >= 3,
      ),
      goal(
        "copper",
        "Show that copper does not react with the acid",
        "Onyesha kwamba shaba haimenyuki na asidi",
        (context) =>
          ofKind(context, tubes).some(
            (part) =>
              used(part, "hydrochloric-acid") !== undefined &&
              (part.contents.solids.cu ?? 0) > 0 &&
              part.contents.gas.length === 0,
          ),
      ),
    ],
  },
  {
    id: "cation-tests",
    section: "reagents",
    title: t("Testing for ions", "Kupima ioni"),
    summary: t(
      "Identify ions in solution from the precipitates they give with sodium hydroxide, ammonia, silver nitrate and barium chloride.",
      "Tambua ioni kwenye myeyusho kutokana na mashapo wanayotoa na sodiamu hidroksidi, amonia, fedha naitreti na bariamu kloridi.",
    ),
    equipment: [
      "safety-goggles",
      "test-tube",
      "test-tube-rack",
      "copper-sulphate",
      "iron-sulphate",
      "sodium-hydroxide",
      "aqueous-ammonia",
      "sodium-chloride",
      "silver-nitrate",
      "barium-chloride",
      "waste-container",
    ],
    steps: [
      t(
        "Add 2 cm³ of each test solution to a test tube.",
        "Ongeza 2 cm³ za kila myeyusho wa kupima kwenye mrija.",
      ),
      t(
        "Add sodium hydroxide a little at a time, then in excess. Note the colour of any precipitate.",
        "Ongeza sodiamu hidroksidi kidogo kidogo, kisha kwa wingi. Andika rangi ya mashapo yoyote.",
      ),
      t(
        "Repeat with aqueous ammonia: copper(II) gives a pale blue precipitate that dissolves in excess to a deep blue solution.",
        "Rudia kwa amonia ya maji: shaba(II) hutoa mashapo ya buluu hafifu yanayoyeyuka kwa wingi kuwa myeyusho wa buluu iliyokolea.",
      ),
      t(
        "Test for chloride with silver nitrate and for sulphate with barium chloride. Empty tubes into the right waste container.",
        "Pima kloridi kwa fedha naitreti na salfeti kwa bariamu kloridi. Mwaga mirija kwenye chombo sahihi cha taka.",
      ),
    ],
    goals: [
      goal(
        "copper",
        "Get a pale blue precipitate of copper(II) hydroxide",
        "Pata mashapo ya buluu hafifu ya shaba(II) hidroksidi",
        (context) =>
          context.parts.some((part) => (part.contents.solids.cuoh2 ?? 0) > 0),
      ),
      goal(
        "deep-blue",
        "Dissolve it in excess ammonia to a deep blue solution",
        "Yayeyushe kwa amonia nyingi kuwa myeyusho wa buluu iliyokolea",
        (context) =>
          context.parts.some(
            (part) => molarity(part.contents, "cuammine") > 0.001,
          ),
      ),
      goal(
        "iron",
        "Get a green precipitate of iron(II) hydroxide",
        "Pata mashapo ya kijani ya chuma(II) hidroksidi",
        (context) =>
          context.parts.some((part) => (part.contents.solids.feoh2 ?? 0) > 0),
      ),
      goal(
        "chloride",
        "Show chloride with a white silver chloride precipitate",
        "Onyesha kloridi kwa mashapo meupe ya fedha kloridi",
        (context) =>
          context.parts.some((part) => (part.contents.solids.agcl ?? 0) > 0),
      ),
      goal(
        "sulphate",
        "Show sulphate with a white barium sulphate precipitate",
        "Onyesha salfeti kwa mashapo meupe ya bariamu salfeti",
        (context) =>
          context.parts.some((part) => (part.contents.solids.baso4 ?? 0) > 0),
      ),
      goal(
        "waste",
        "Dispose of heavy metals safely",
        "Tupa metali nzito kwa usalama",
        (context) => noIncident(context, ["bad-disposal"]),
      ),
    ],
  },
  {
    id: "displacement",
    section: "reagents",
    title: t("Displacement of copper", "Uondoaji wa shaba"),
    summary: t(
      "Add zinc powder to copper(II) sulphate solution. The blue fades, copper forms and the mixture warms.",
      "Ongeza unga wa zinki kwenye myeyusho wa shaba(II) salfeti. Buluu inafifia, shaba inatokea na mchanganyiko unapata joto.",
    ),
    equipment: [
      "beaker",
      "copper-sulphate",
      "zinc-granules",
      "thermometer",
      "electronic-balance",
    ],
    steps: [
      t(
        "Put 25 cm³ of 0.5 mol/dm³ copper(II) sulphate in a beaker and stand a thermometer in it.",
        "Weka 25 cm³ za shaba(II) salfeti 0.5 mol/dm³ kwenye bika na usimamishe kipimajoto ndani.",
      ),
      t(
        "Read the starting temperature, then add 1.0 g of zinc powder.",
        "Soma joto la mwanzo, kisha ongeza g 1.0 ya unga wa zinki.",
      ),
      t(
        "Watch the colour and the deposit, and read the highest temperature.",
        "Tazama rangi na mashapo, na usome joto la juu zaidi.",
      ),
    ],
    goals: [
      goal(
        "copper",
        "Displace copper metal from the solution",
        "Ondoa metali ya shaba kutoka myeyusho",
        (context) =>
          context.parts.some(
            (part) =>
              used(part, "copper-sulphate") !== undefined &&
              (part.contents.solids.cu ?? 0) > 0,
          ),
      ),
      goal(
        "warm",
        "Show the reaction gives out heat",
        "Onyesha athari inatoa joto",
        (context) =>
          context.parts.some(
            (part) =>
              used(part, "copper-sulphate") !== undefined &&
              part.contents.temperature >= AMBIENT + 3,
          ),
      ),
      goal(
        "thermometer",
        "Stand a thermometer in the reaction",
        "Simamisha kipimajoto ndani ya athari",
        (context) => ofKind(context, ["thermometer"]).length > 0,
      ),
    ],
  },
  {
    id: "electrolysis",
    section: "electrochemistry",
    title: t(
      "Electrolysis of acidified water",
      "Elektrolisisi ya maji yenye asidi",
    ),
    summary: t(
      "Split water into hydrogen and oxygen in a Hofmann voltameter and compare the volumes.",
      "Gawanya maji kuwa hidrojeni na oksijeni ndani ya voltamita ya Hofmann na ulinganishe ujazo.",
    ),
    equipment: [
      "safety-goggles",
      "hofmann-voltameter",
      "sulphuric-acid",
      "dc-power-supply",
      "ammeter",
    ],
    steps: [
      t(
        "Fill the voltameter with 0.5 mol/dm³ sulphuric acid.",
        "Jaza voltamita kwa asidi ya salfuriki 0.5 mol/dm³.",
      ),
      t(
        "Link the power supply to the voltameter, switch on, set 6 V and press Start.",
        "Unganisha chanzo cha umeme na voltamita, washa, weka V 6 na ubonyeze Anza.",
      ),
      t(
        "After a while press Stop and record. Compare the gas at the cathode (−) with the gas at the anode (+).",
        "Baada ya muda bonyeza Simamisha na urekodi. Linganisha gesi kwenye katodi (−) na gesi kwenye anodi (+).",
      ),
    ],
    goals: [
      goal(
        "filled",
        "Fill the voltameter with dilute sulphuric acid",
        "Jaza voltamita kwa asidi ya salfuriki iliyochanganywa",
        (context) =>
          ofKind(context, ["hofmann-voltameter"]).some(
            (part) => used(part, "sulphuric-acid") !== undefined,
          ),
      ),
      goal(
        "gas",
        "Collect at least 5 cm³ of hydrogen",
        "Kusanya angalau 5 cm³ za hidrojeni",
        (context) =>
          ofKind(context, ["hofmann-voltameter"]).some(
            (part) => part.params.gasC >= 5,
          ),
      ),
      goal(
        "ratio",
        "Get hydrogen and oxygen in the ratio 2 : 1",
        "Pata hidrojeni na oksijeni kwa uwiano 2 : 1",
        (context) =>
          ofKind(context, ["hofmann-voltameter"]).some(
            (part) =>
              part.params.gasA > 0 &&
              Math.abs(part.params.gasC / part.params.gasA - 2) <= 0.2,
          ),
      ),
    ],
  },
  {
    id: "filtration",
    section: "separation",
    title: t("Filtration", "Uchujaji"),
    summary: t(
      "Make a precipitate of copper(II) hydroxide and separate it from the solution by filtering.",
      "Tengeneza mashapo ya shaba(II) hidroksidi na uyatenganishe na myeyusho kwa kuchuja.",
    ),
    equipment: [
      "beaker",
      "copper-sulphate",
      "sodium-hydroxide",
      "filter-funnel",
      "filter-paper",
      "conical-flask",
      "retort-stand",
    ],
    steps: [
      t(
        "Mix 20 cm³ of 0.1 mol/dm³ copper(II) sulphate with 20 cm³ of 0.1 mol/dm³ sodium hydroxide in a beaker.",
        "Changanya 20 cm³ za shaba(II) salfeti 0.1 mol/dm³ na 20 cm³ za sodiamu hidroksidi 0.1 mol/dm³ kwenye bika.",
      ),
      t(
        "Fold the filter paper into a cone and put it over the funnel. Stand the funnel over a conical flask.",
        "Kunja karatasi ya kuchuja kuwa koni na uiweke juu ya faneli. Simamisha faneli juu ya chupa ya koni.",
      ),
      t(
        "Pour the mixture through the funnel. The residue stays on the paper; the filtrate runs through.",
        "Mimina mchanganyiko kupitia faneli. Mabaki yanabaki kwenye karatasi; kilichochujwa kinapita.",
      ),
    ],
    goals: [
      goal(
        "precipitate",
        "Make a precipitate",
        "Tengeneza mashapo",
        (context) =>
          context.parts.some((part) => (part.contents.solids.cuoh2 ?? 0) > 0),
      ),
      goal(
        "paper",
        "Fold filter paper into the funnel",
        "Kunja karatasi ya kuchuja ndani ya faneli",
        (context) =>
          ofKind(context, ["filter-paper"]).some(
            (part) => part.params.fold === 1,
          ),
      ),
      goal(
        "filtrate",
        "Collect a clear filtrate",
        "Kusanya kilichochujwa angavu",
        (context) =>
          ofKind(context, flasks).some(
            (part) =>
              used(part, "copper-sulphate") !== undefined &&
              totalVolume(part.contents) > 5 &&
              Object.keys(part.contents.solids).length === 0,
          ),
      ),
    ],
  },
  {
    id: "distillation",
    section: "separation",
    title: t(
      "Fractional distillation of ethanol and water",
      "Kunereka kwa sehemu kwa ethanoli na maji",
    ),
    summary: t(
      "Separate ethanol from water. Heat with a water bath, never a flame, because ethanol catches fire.",
      "Tenganisha ethanoli na maji. Pasha kwa bafu ya maji, kamwe si mwali, kwa sababu ethanoli huwaka.",
    ),
    equipment: [
      "lab-coat",
      "safety-goggles",
      "round-bottom-flask",
      "ethanol",
      "distilled-water",
      "fractional-column",
      "liebig-condenser",
      "water-bath",
      "conical-flask",
      "thermometer",
    ],
    steps: [
      t(
        "Put 30 cm³ of ethanol and 30 cm³ of water in the round-bottom flask.",
        "Weka 30 cm³ za ethanoli na 30 cm³ za maji kwenye chupa ya chini mviringo.",
      ),
      t(
        "Link the condenser to the flask, a receiver and the water bath. Turn on the cooling water and fit the fractionating column.",
        "Unganisha kipoozi na chupa, chombo cha kupokea na bafu ya maji. Fungua maji ya kupoza na weka safu ya kutenganisha.",
      ),
      t(
        "Set the water bath to about 85 °C and distil. Collect the first fraction.",
        "Weka bafu ya maji kwa takriban 85 °C na unereke. Kusanya sehemu ya kwanza.",
      ),
    ],
    goals: [
      dressed,
      goal(
        "cooling",
        "Turn on the condenser water",
        "Fungua maji ya kipoozi",
        (context) =>
          ofKind(context, ["liebig-condenser"]).some(
            (part) => part.params.water === 1,
          ),
      ),
      goal(
        "ethanol",
        "Collect a distillate that is mostly ethanol",
        "Kusanya kilichonerekwa ambacho kwa kiasi kikubwa ni ethanoli",
        (context) =>
          ofKind(context, flasks).some((part) => {
            const volume = totalVolume(part.contents);
            return (
              volume > 2 &&
              (part.contents.species.EtOH ?? 0) / 17.1 / volume >= 0.8 &&
              used(part, "ethanol") === undefined
            );
          }),
      ),
      goal(
        "no-fire",
        "Distil without starting a fire",
        "Nereka bila kuanzisha moto",
        (context) => noIncident(context, ["fire"]),
      ),
    ],
  },
  {
    id: "chromatography",
    section: "separation",
    title: t(
      "Paper chromatography of inks",
      "Kromatografia ya karatasi ya wino",
    ),
    summary: t(
      "Separate the dyes in an ink and work out their Rf values.",
      "Tenganisha rangi ndani ya wino na ukokotoe thamani zao za Rf.",
    ),
    equipment: ["chromatography-tank"],
    steps: [
      t(
        "Choose an ink and a solvent. Draw the base line in pencil above the solvent level.",
        "Chagua wino na kiyeyusho. Chora mstari wa msingi kwa penseli juu ya kiwango cha kiyeyusho.",
      ),
      t(
        "Leave the paper in the tank for at least 10 minutes, then measure each spot and the solvent front.",
        "Acha karatasi kwenye tanki kwa angalau dakika 10, kisha pima kila doa na mstari wa kiyeyusho.",
      ),
      t(
        "Rf = distance moved by the dye ÷ distance moved by the solvent.",
        "Rf = umbali uliosogea na rangi ÷ umbali uliosogea na kiyeyusho.",
      ),
    ],
    goals: [
      goal(
        "base",
        "Keep the base line above the solvent",
        "Weka mstari wa msingi juu ya kiyeyusho",
        (context) =>
          ofKind(context, ["chromatography-tank"]).some(
            (part) => part.params.base >= 1.5 && part.params.time > 0,
          ),
      ),
      goal(
        "run",
        "Run the chromatogram for at least 10 minutes",
        "Endesha kromatogramu kwa angalau dakika 10",
        (context) =>
          ofKind(context, ["chromatography-tank"]).some(
            (part) => part.params.base >= 1.5 && part.params.time >= 10,
          ),
      ),
    ],
  },
  {
    id: "flame-tests",
    section: "modern",
    title: t("Flame tests", "Majaribio ya mwali"),
    summary: t(
      "Identify metal ions from the colour they give a hot flame. Clean the wire between tests.",
      "Tambua ioni za metali kutokana na rangi wanayotoa kwenye mwali wenye joto. Safisha waya kati ya majaribio.",
    ),
    equipment: [
      "safety-goggles",
      "bunsen-burner",
      "flame-test-kit",
      "sodium-chloride",
      "copper-sulphate",
      "potassium-iodide",
    ],
    steps: [
      t(
        "Light the Bunsen burner and open the air hole for a blue flame.",
        "Washa kichomeo cha Bunsen na ufungue tundu la hewa upate mwali wa buluu.",
      ),
      t(
        "Clean the wire until it gives no colour, then test sodium chloride.",
        "Safisha waya hadi usitoe rangi, kisha jaribu sodiamu kloridi.",
      ),
      t(
        "Clean it again, then test copper(II) sulphate and potassium iodide. Look at potassium through cobalt-blue glass.",
        "Usafishe tena, kisha jaribu shaba(II) salfeti na potasiamu iodidi. Tazama potasiamu kupitia kioo cha buluu ya kobalti.",
      ),
    ],
    goals: [
      goal(
        "sodium",
        "See the golden-yellow flame of sodium",
        "Ona mwali wa njano ya dhahabu wa sodiamu",
        (context) =>
          ofKind(context, ["flame-test-kit"]).some(
            (part) => part.params.tested === 1 && (part.params.shown & 1) !== 0,
          ),
      ),
      goal(
        "copper",
        "See the blue-green flame of copper, with a clean wire",
        "Ona mwali wa buluu-kijani wa shaba, kwa waya safi",
        (context) =>
          ofKind(context, ["flame-test-kit"]).some(
            (part) => part.params.shown === 8,
          ),
      ),
      goal(
        "potassium",
        "See potassium's lilac through cobalt glass",
        "Ona zambarau hafifu ya potasiamu kupitia kioo cha kobalti",
        (context) =>
          ofKind(context, ["flame-test-kit"]).some(
            (part) => part.params.cobalt === 1 && (part.params.shown & 2) !== 0,
          ),
      ),
    ],
  },
  {
    id: "beers-law",
    section: "modern",
    title: t(
      "Beer's law with a colorimeter",
      "Sheria ya Beer kwa kipima rangi",
    ),
    summary: t(
      "Show that absorbance is proportional to concentration, using dilutions of potassium manganate(VII).",
      "Onyesha kwamba ufyonzaji unalingana na mkusanyiko, kwa kutumia mchanganyiko wa potasiamu manganeti(VII).",
    ),
    equipment: [
      "colorimeter",
      "cuvette",
      "potassium-permanganate",
      "distilled-water",
      "graduated-pipette",
      "test-tube",
    ],
    steps: [
      t(
        "Fill a cuvette with distilled water, set 520 nm and press Zero to make a blank.",
        "Jaza kuveti kwa maji yaliyosafishwa, weka nm 520 na ubonyeze Sifuri kutengeneza sampuli tupu.",
      ),
      t(
        "Make dilutions of 0.002 mol/dm³ KMnO₄: 0.5, 1.0, 1.5 and 2.0 cm³ each made up to 10 cm³ with water.",
        "Tengeneza michanganyiko ya KMnO₄ 0.002 mol/dm³: 0.5, 1.0, 1.5 na 2.0 cm³ kila moja ikijazwa hadi 10 cm³ kwa maji.",
      ),
      t(
        "Measure each one in a clean cuvette and press Record. Plot absorbance against concentration.",
        "Pima kila moja kwenye kuveti safi na ubonyeze Rekodi. Chora ufyonzaji dhidi ya mkusanyiko.",
      ),
    ],
    goals: [
      goal(
        "blank",
        "Zero the colorimeter with a blank",
        "Weka kipima rangi sifuri kwa sampuli tupu",
        (context) =>
          ofKind(context, ["colorimeter"]).some(
            (part) =>
              part.params.blanked === 1 &&
              part.params.blankW === part.params.wavelength,
          ),
      ),
      goal(
        "clear",
        "Put the clear faces of the cuvette in the beam",
        "Weka pande angavu za kuveti kwenye mwali",
        (context) =>
          ofKind(context, ["colorimeter"]).some(
            (part) => part.params.frosted === 0 && part.params.sample > 0,
          ),
      ),
      goal(
        "four",
        "Record four absorbance readings below 2",
        "Rekodi vipimo vinne vya ufyonzaji chini ya 2",
        (context) =>
          recorded(context, "absorbance").filter(
            (value) => value > 0.02 && value < 2,
          ).length >= 4,
      ),
    ],
  },
  {
    id: "safe-dilution",
    section: "safety",
    title: t(
      "Diluting concentrated acid safely",
      "Kupunguza asidi kali kwa usalama",
    ),
    summary: t(
      "Make dilute sulphuric acid from the concentrated acid. Always add acid to water.",
      "Tengeneza asidi ya salfuriki iliyochanganywa kutoka asidi kali. Daima ongeza asidi kwenye maji.",
    ),
    equipment: [
      "lab-coat",
      "safety-goggles",
      "gloves",
      "beaker",
      "distilled-water",
      "sulphuric-acid",
      "glass-rod",
    ],
    steps: [
      t(
        "Put on a lab coat, goggles and gloves.",
        "Vaa koti la maabara, miwani na glavu.",
      ),
      t(
        "Put 90 cm³ of distilled water in a beaker first.",
        "Weka 90 cm³ za maji yaliyosafishwa kwenye bika kwanza.",
      ),
      t(
        "Set the sulphuric acid to 18 mol/dm³ and add 5 cm³ slowly to the water. Feel how hot it gets.",
        "Weka asidi ya salfuriki kuwa 18 mol/dm³ na uongeze 5 cm³ polepole kwenye maji. Hisi jinsi inavyopata joto.",
      ),
    ],
    goals: [
      goal(
        "ppe",
        "Wear a lab coat, goggles and gloves",
        "Vaa koti la maabara, miwani na glavu",
        (context) =>
          worn(context, "lab-coat") &&
          worn(context, "safety-goggles") &&
          worn(context, "gloves"),
      ),
      goal(
        "diluted",
        "Add concentrated acid to water",
        "Ongeza asidi kali kwenye maji",
        (context) =>
          context.parts.some(
            (part) =>
              used(part, "sulphuric-acid") !== undefined &&
              totalVolume(part.contents) >= 50,
          ),
      ),
      goal(
        "safe",
        "Do it without any splash or burn",
        "Fanya hivyo bila mrusho wala kuungua",
        (context) => noIncident(context, ["splash", "skin-burn", "eye-splash"]),
      ),
    ],
  },
  {
    id: "heat-of-neutralisation",
    section: "measurement",
    title: t("Heat of neutralisation", "Joto la uneutralishaji"),
    summary: t(
      "Mix equal volumes of 2 mol/dm³ acid and alkali, and use the temperature rise to find the heat of neutralisation.",
      "Changanya ujazo sawa wa asidi na alikali 2 mol/dm³, na utumie ongezeko la joto kupata joto la uneutralishaji.",
    ),
    equipment: [
      "lab-coat",
      "safety-goggles",
      "beaker",
      "measuring-cylinder",
      "hydrochloric-acid",
      "sodium-hydroxide",
      "thermometer",
    ],
    steps: [
      t(
        "Put 50 cm³ of 2 mol/dm³ hydrochloric acid in a beaker and read its temperature.",
        "Weka 50 cm³ za asidi ya haidrokloriki 2 mol/dm³ kwenye bika na usome joto lake.",
      ),
      t(
        "Add 50 cm³ of 2 mol/dm³ sodium hydroxide and read the highest temperature.",
        "Ongeza 50 cm³ za sodiamu hidroksidi 2 mol/dm³ na usome joto la juu zaidi.",
      ),
      t(
        "Heat given out = 100 g × 4.2 J/g°C × ΔT. Divide by the 0.1 mol of water formed.",
        "Joto lililotolewa = g 100 × 4.2 J/g°C × ΔT. Gawanya kwa mol 0.1 za maji zilizotokea.",
      ),
    ],
    goals: [
      dressed,
      goal(
        "mixed",
        "Mix 50 cm³ of each solution",
        "Changanya 50 cm³ za kila myeyusho",
        (context) =>
          context.parts.some(
            (part) =>
              Math.abs((used(part, "hydrochloric-acid")?.volume ?? 0) - 50) <=
                1 &&
              Math.abs((used(part, "sodium-hydroxide")?.volume ?? 0) - 50) <= 1,
          ),
      ),
      goal(
        "rise",
        "See a temperature rise of more than 10 °C",
        "Ona ongezeko la joto la zaidi ya 10 °C",
        (context) =>
          context.parts.some(
            (part) =>
              used(part, "sodium-hydroxide") !== undefined &&
              part.contents.temperature >= AMBIENT + 10,
          ),
      ),
      goal(
        "recorded",
        "Record the temperature",
        "Rekodi joto",
        (context) => recorded(context, "temperature").length > 0,
      ),
    ],
  },
];
