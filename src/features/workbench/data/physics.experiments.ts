import { elementState } from "../circuit/solution";
import type {
  Experiment,
  ExperimentGoal,
  GoalContext,
  LocalizedText,
  PartKind,
  PlacedPart,
} from "../workbench.types";
import { partDefinitions } from "./equipment";

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

function partsOf(context: GoalContext, kind: PartKind) {
  return context.parts.filter((part) => part.kind === kind);
}

function visual(context: GoalContext, part: PlacedPart, key: string) {
  return context.outcomes.get(part.id)?.visual?.[key] ?? 0;
}

function overlaps(a: PlacedPart, b: PlacedPart) {
  const first = partDefinitions[a.kind];
  const second = partDefinitions[b.kind];
  return (
    a.x < b.x + second.width &&
    b.x < a.x + first.width &&
    a.y < b.y + second.height &&
    b.y < a.y + first.height
  );
}

/** Distinct values of one measurement that were recorded from parts of one kind. */
function recorded(context: GoalContext, kind: PartKind, measureId: string) {
  const pattern = new RegExp(`^${kind}-\\d+$`);
  return new Set(
    context.records.flatMap((record) =>
      record.readings
        .filter(
          (reading) =>
            pattern.test(reading.partId) && reading.measureId === measureId,
        )
        .map((reading) => reading.value.toFixed(reading.digits)),
    ),
  );
}

function goal(
  id: string,
  en: string,
  sw: string,
  check: (context: GoalContext) => boolean,
): ExperimentGoal {
  return { id, label: t(en, sw), check };
}

const placed = (kind: PartKind, en: string, sw: string): ExperimentGoal =>
  goal(`place-${kind}`, en, sw, (context) => partsOf(context, kind).length > 0);

const anyParam = (
  context: GoalContext,
  kind: PartKind,
  test: (params: PlacedPart["params"]) => boolean,
) => partsOf(context, kind).some((part) => test(part.params));

export const physicsExperiments: Experiment[] = [
  {
    id: "vernier-diameter",
    section: "measurement",
    title: t("Vernier callipers: a diameter", "Kalipa ya vernia: kipenyo"),
    summary: t(
      "Find the zero error, then measure an object's diameter to 0.1 mm.",
      "Pata kosa la sifuri, kisha pima kipenyo cha kitu hadi 0.1 mm.",
    ),
    equipment: ["vernier-callipers"],
    steps: [
      t(
        "Place the vernier callipers and select it.",
        "Weka kalipa ya vernia na uichague.",
      ),
      t(
        "Close the jaws and read the zero error, with its sign.",
        "Funga taya na usome kosa la sifuri, pamoja na ishara.",
      ),
      t(
        "Put the jaws round the object, read main scale + vernier, then correct for the zero error.",
        "Weka taya kuzunguka kitu, soma kipimo kikuu + vernia, kisha sahihisha kosa la sifuri.",
      ),
    ],
    goals: [
      placed(
        "vernier-callipers",
        "Place the vernier callipers",
        "Weka kalipa ya vernia",
      ),
      goal(
        "zero",
        "Close the jaws to check the zero error",
        "Funga taya kukagua kosa la sifuri",
        (c) => anyParam(c, "vernier-callipers", (p) => p.closed === 1),
      ),
      goal(
        "measure",
        "Measure an object with the jaws open",
        "Pima kitu taya zikiwa wazi",
        (c) => anyParam(c, "vernier-callipers", (p) => p.closed === 0),
      ),
    ],
  },
  {
    id: "micrometer-wire",
    section: "measurement",
    title: t("Micrometer: thickness of a wire", "Maikromita: unene wa waya"),
    summary: t(
      "Use the ratchet, check the zero error and measure to 0.01 mm.",
      "Tumia ratchet, kagua kosa la sifuri na upime hadi 0.01 mm.",
    ),
    equipment: ["micrometer"],
    steps: [
      t(
        "Close the micrometer with the ratchet and read the zero error.",
        "Funga maikromita kwa ratchet na usome kosa la sifuri.",
      ),
      t(
        "Place the wire between the anvil and spindle and tighten with the ratchet only.",
        "Weka waya kati ya kigingi na kipenyo na ukaze kwa ratchet pekee.",
      ),
      t(
        "Read the sleeve and the thimble, then subtract the zero error.",
        "Soma mkono na kidole, kisha toa kosa la sifuri.",
      ),
    ],
    goals: [
      placed("micrometer", "Place the micrometer", "Weka maikromita"),
      goal(
        "zero",
        "Check the zero error with the gauge closed",
        "Kagua kosa la sifuri maikromita ikiwa imefungwa",
        (c) => anyParam(c, "micrometer", (p) => p.closed === 1),
      ),
      goal(
        "ratchet",
        "Measure using the ratchet",
        "Pima kwa kutumia ratchet",
        (c) => anyParam(c, "micrometer", (p) => p.closed === 0 && p.turn === 1),
      ),
    ],
  },
  {
    id: "volume-displacement",
    section: "measurement",
    title: t("Volume of an irregular solid", "Ujazo wa kitu kisicho na umbo"),
    summary: t(
      "Use a Eureka can and a measuring cylinder to find the volume of a stone.",
      "Tumia kopo la Eureka na silinda ya kupimia kupata ujazo wa jiwe.",
    ),
    equipment: ["eureka-can", "measuring-cylinder"],
    steps: [
      t(
        "Fill the Eureka can until it drips from the spout.",
        "Jaza kopo la Eureka hadi lidondoke mdomoni.",
      ),
      t(
        "Lower the stone in and catch the overflow.",
        "Shusha jiwe ndani na ukusanye kinachofurika.",
      ),
      t(
        "Pour the water into the measuring cylinder and read it with your eye level with the meniscus.",
        "Mimina maji kwenye silinda ya kupimia na usome jicho likiwa usawa na uso wa kioevu.",
      ),
    ],
    goals: [
      goal(
        "primed",
        "Fill the can to the spout first",
        "Jaza kopo hadi mdomoni kwanza",
        (c) => anyParam(c, "eureka-can", (p) => p.primed === 1),
      ),
      goal(
        "lowered",
        "Lower an object in and collect water",
        "Shusha kitu ndani na ukusanye maji",
        (c) =>
          partsOf(c, "eureka-can").some(
            (can) => visual(c, can, "collected") > 0,
          ),
      ),
      goal(
        "eye",
        "Read the cylinder with your eye level",
        "Soma silinda jicho likiwa usawa",
        (c) => anyParam(c, "measuring-cylinder", (p) => Math.abs(p.eye) <= 4),
      ),
    ],
  },
  {
    id: "weighing",
    section: "measurement",
    title: t(
      "Weighing with an electronic balance",
      "Kupima kwa mizani ya kielektroniki",
    ),
    summary: t(
      "Level the balance and tare the container to find the mass of a powder.",
      "Sawazisha mizani na uweke tare chombo kupata uzito wa unga.",
    ),
    equipment: ["electronic-balance"],
    steps: [
      t(
        "Level the balance until the bubble is centred.",
        "Sawazisha mizani hadi kiputo kiwe katikati.",
      ),
      t(
        "Put the empty container on the pan and press Tare.",
        "Weka chombo tupu kwenye sahani na ubonyeze Tare.",
      ),
      t(
        "Add the sand and read the display.",
        "Ongeza mchanga na usome onyesho.",
      ),
    ],
    goals: [
      placed("electronic-balance", "Place the balance", "Weka mizani"),
      goal("level", "Level the balance", "Sawazisha mizani", (c) =>
        anyParam(c, "electronic-balance", (p) => p.level === 1),
      ),
      goal(
        "tare",
        "Tare with the container on the pan",
        "Weka tare chombo kikiwa kwenye sahani",
        (c) => anyParam(c, "electronic-balance", (p) => p.tare > 0),
      ),
      goal("load", "Weigh the contents", "Pima vilivyomo", (c) =>
        anyParam(c, "electronic-balance", (p) => p.tare > 0 && p.load > 0),
      ),
    ],
  },
  {
    id: "reaction-time",
    section: "measurement",
    title: t(
      "Stopwatch and reaction time",
      "Saa ya kupimia na muda wa kuitikia",
    ),
    summary: t(
      "Time an event several times and compare with its true time.",
      "Pima muda wa tukio mara kadhaa na ulinganishe na muda wake halisi.",
    ),
    equipment: ["stopwatch"],
    steps: [
      t(
        "Press Reset, then choose an event.",
        "Bonyeza Weka sifuri, kisha uchague tukio.",
      ),
      t(
        "Press 'Start the event' and start the watch as it begins; stop it as it ends.",
        "Bonyeza 'Anza tukio' na uanze saa linapoanza; isimamishe linapoisha.",
      ),
      t(
        "Repeat three times and record each time. Average them.",
        "Rudia mara tatu na urekodi kila muda. Uchukue wastani.",
      ),
    ],
    goals: [
      placed("stopwatch", "Place the stopwatch", "Weka saa ya kupimia"),
      goal("event", "Start an event", "Anza tukio", (c) =>
        anyParam(c, "stopwatch", (p) => p.releasedAt > 0),
      ),
      goal(
        "times",
        "Record three different timings",
        "Rekodi vipimo vitatu tofauti vya muda",
        (c) => recorded(c, "stopwatch", "time").size >= 3,
      ),
    ],
  },
  {
    id: "hookes-law",
    section: "mechanics",
    title: t("Hooke's law", "Sheria ya Hooke"),
    summary: t(
      "Add masses to a spring, record the extension and find the spring constant.",
      "Ongeza vipimo kwenye chemchemi, rekodi urefu ulioongezeka na upate kisia cha chemchemi.",
    ),
    equipment: ["hooke-apparatus"],
    steps: [
      t(
        "Record the pointer reading with no load.",
        "Rekodi kipimo cha kielekezi bila mzigo.",
      ),
      t(
        "Add 50 g at a time and record each time.",
        "Ongeza 50 g kila mara na urekodi.",
      ),
      t(
        "Plot force against extension on the Graph tab; the gradient is k.",
        "Chora nguvu dhidi ya urefu kwenye kichupo cha Grafu; mwinuko ni k.",
      ),
    ],
    goals: [
      placed(
        "hooke-apparatus",
        "Place the Hooke's law apparatus",
        "Weka kifaa cha sheria ya Hooke",
      ),
      goal(
        "records",
        "Record at least 5 different loads",
        "Rekodi angalau mizigo 5 tofauti",
        (c) => recorded(c, "hooke-apparatus", "force").size >= 5,
      ),
      goal(
        "elastic",
        "Keep every load inside the elastic limit",
        "Weka kila mzigo ndani ya kikomo cha unyumbufu",
        (c) => {
          const forces = c.records.flatMap((record) =>
            record.readings.filter(
              (r) =>
                /^hooke-apparatus-\d+$/.test(r.partId) &&
                r.measureId === "force",
            ),
          );
          return (
            forces.length >= 3 && forces.every((reading) => reading.value <= 4)
          );
        },
      ),
    ],
  },
  {
    id: "pendulum-period",
    section: "mechanics",
    title: t("The simple pendulum", "Pendulamu rahisi"),
    summary: t(
      "Find how the period depends on the length and plot T² against L.",
      "Pata jinsi kipindi kinavyotegemea urefu na uchore T² dhidi ya L.",
    ),
    equipment: ["pendulum", "stopwatch"],
    steps: [
      t(
        "Keep the swing small (under 15°).",
        "Weka mzunguko mdogo (chini ya 15°).",
      ),
      t(
        "Change the length and record L and T each time.",
        "Badilisha urefu na urekodi L na T kila mara.",
      ),
      t(
        "Plot T² against L: the gradient is 4π² ÷ g.",
        "Chora T² dhidi ya L: mwinuko ni 4π² ÷ g.",
      ),
    ],
    goals: [
      placed("pendulum", "Place the pendulum", "Weka pendulamu"),
      goal(
        "small",
        "Use a small starting angle",
        "Tumia pembe ndogo ya kuanzia",
        (c) => anyParam(c, "pendulum", (p) => p.amp <= 15),
      ),
      goal(
        "records",
        "Record 5 different lengths",
        "Rekodi urefu 5 tofauti",
        (c) => recorded(c, "pendulum", "length").size >= 5,
      ),
    ],
  },
  {
    id: "moments",
    section: "mechanics",
    title: t("The principle of moments", "Kanuni ya kasi ya mzunguko"),
    summary: t(
      "Balance a metre rule on a pivot with two masses.",
      "Sawazisha rula ya mita kwenye egemeo kwa vipimo viwili.",
    ),
    equipment: ["knife-edge"],
    steps: [
      t(
        "Put the pivot at the 50 cm mark.",
        "Weka egemeo kwenye alama ya 50 cm.",
      ),
      t(
        "Adjust a mass or its distance until the rule balances.",
        "Rekebisha wingi au umbali wake hadi rula isawazike.",
      ),
      t(
        "Check that the clockwise and anticlockwise moments are equal.",
        "Hakikisha kasi za saa na kinyume cha saa ni sawa.",
      ),
    ],
    goals: [
      placed("knife-edge", "Place the pivot and rule", "Weka egemeo na rula"),
      goal(
        "centre",
        "Put the pivot at 50 cm",
        "Weka egemeo kwenye 50 cm",
        (c) => anyParam(c, "knife-edge", (p) => p.pivot === 50),
      ),
      goal("balanced", "Balance the rule", "Sawazisha rula", (c) =>
        partsOf(c, "knife-edge").some(
          (part) =>
            Math.abs(visual(c, part, "tilt")) < 0.3 && part.params.pivot === 50,
        ),
      ),
    ],
  },
  {
    id: "inclined-plane",
    section: "mechanics",
    title: t("Acceleration down a slope", "Kuongeza kasi kwenye mteremko"),
    summary: t(
      "Release a trolley at different angles and compare the accelerations.",
      "Achilia toroli kwa pembe tofauti na ulinganishe kuongeza kasi.",
    ),
    equipment: ["inclined-plane"],
    steps: [
      t(
        "Set an angle and release the trolley.",
        "Weka pembe na uachilie toroli.",
      ),
      t(
        "Record the angle, acceleration and time.",
        "Rekodi pembe, kuongeza kasi na muda.",
      ),
      t("Repeat for at least three angles.", "Rudia kwa angalau pembe tatu."),
    ],
    goals: [
      placed("inclined-plane", "Place the inclined plane", "Weka mteremko"),
      goal("release", "Release the trolley", "Achilia toroli", (c) =>
        anyParam(c, "inclined-plane", (p) => p.releasedAt > 0),
      ),
      goal(
        "angles",
        "Record 3 different angles",
        "Rekodi pembe 3 tofauti",
        (c) => recorded(c, "inclined-plane", "angle").size >= 3,
      ),
    ],
  },
  {
    id: "momentum",
    section: "mechanics",
    title: t("Conservation of momentum", "Uhifadhi wa kasi-misa"),
    summary: t(
      "Collide gliders on an air track and check that momentum is conserved.",
      "Gongesha vitelezi kwenye njia ya hewa na ukague kwamba kasi-misa huhifadhiwa.",
    ),
    equipment: ["air-track"],
    steps: [
      t(
        "Switch the air blower on so friction is removed.",
        "Washa feni ya hewa ili msuguano uondolewe.",
      ),
      t(
        "Try a bounce collision, then a stick-together collision.",
        "Jaribu mgongano wa kurudi, kisha wa kushikana.",
      ),
      t(
        "Compare the total momentum before and after.",
        "Linganisha kasi-misa jumla kabla na baada.",
      ),
    ],
    goals: [
      placed("air-track", "Place the air track", "Weka njia ya hewa"),
      goal("blower", "Switch the blower on", "Washa feni", (c) =>
        anyParam(c, "air-track", (p) => p.blower === 1),
      ),
      goal(
        "bounce",
        "Run a bounce collision",
        "Fanya mgongano wa kurudi",
        (c) =>
          anyParam(
            c,
            "air-track",
            (p) => p.blower === 1 && p.mode === 0 && p.u1 > 0,
          ),
      ),
      goal(
        "stick",
        "Run a stick-together collision",
        "Fanya mgongano wa kushikana",
        (c) =>
          anyParam(
            c,
            "air-track",
            (p) => p.blower === 1 && p.mode === 1 && p.u1 > 0,
          ),
      ),
    ],
  },
  {
    id: "liquid-pressure",
    section: "fluids",
    title: t("Pressure in a liquid", "Shinikizo kwenye kioevu"),
    summary: t(
      "Show that pressure grows with depth and does not depend on the shape of the vessel.",
      "Onyesha kwamba shinikizo huongezeka na kina na halitegemei umbo la chombo.",
    ),
    equipment: ["pascals-vase"],
    steps: [
      t(
        "Fill the vase and note the level in every tube.",
        "Jaza chombo na uone kiwango kwenye kila bomba.",
      ),
      t(
        "Move the pressure probe to different depths and record.",
        "Sogeza kipimo cha shinikizo kwenye kina tofauti na urekodi.",
      ),
      t("Plot pressure against depth.", "Chora shinikizo dhidi ya kina."),
    ],
    goals: [
      placed("pascals-vase", "Place Pascal's vase", "Weka chombo cha Pascal"),
      goal(
        "depths",
        "Record 4 different depths",
        "Rekodi kina 4 tofauti",
        (c) => recorded(c, "pascals-vase", "depth").size >= 4,
      ),
    ],
  },
  {
    id: "atmospheric-pressure",
    section: "fluids",
    title: t(
      "Atmospheric pressure and altitude",
      "Shinikizo la angahewa na mwinuko",
    ),
    summary: t(
      "Read a mercury barometer at several altitudes and tilt the tube.",
      "Soma barometa ya zebaki kwenye miinuko kadhaa na uinamishe bomba.",
    ),
    equipment: ["mercury-barometer"],
    steps: [
      t("Record the height at sea level.", "Rekodi urefu usawa wa bahari."),
      t(
        "Raise the altitude and record again.",
        "Ongeza mwinuko na urekodi tena.",
      ),
      t(
        "Tilt the tube: the vertical height does not change.",
        "Inamisha bomba: urefu wima haubadiliki.",
      ),
    ],
    goals: [
      placed("mercury-barometer", "Place the barometer", "Weka barometa"),
      goal(
        "altitudes",
        "Record 3 different altitudes",
        "Rekodi miinuko 3 tofauti",
        (c) => recorded(c, "mercury-barometer", "altitude").size >= 3,
      ),
      goal("tilt", "Tilt the tube", "Inamisha bomba", (c) =>
        anyParam(c, "mercury-barometer", (p) => p.tilt > 0),
      ),
    ],
  },
  {
    id: "thermometer-fixed-points",
    section: "heat",
    title: t("Checking a thermometer", "Kukagua kipimajoto"),
    summary: t(
      "Test the ice point and steam point to find any zero error.",
      "Jaribu kiwango cha barafu na cha mvuke kupata kosa lolote la sifuri.",
    ),
    equipment: ["liquid-thermometer"],
    steps: [
      t(
        "Put the bulb in melting ice and read it.",
        "Weka balbu kwenye barafu inayoyeyuka na uisome.",
      ),
      t(
        "Put it in steam above boiling water and read it.",
        "Iweke kwenye mvuke juu ya maji yanayochemka na uisome.",
      ),
      t(
        "Look straight at the liquid level, not from the side.",
        "Tazama moja kwa moja kiwango cha kioevu, si kutoka pembeni.",
      ),
    ],
    goals: [
      placed("liquid-thermometer", "Place the thermometer", "Weka kipimajoto"),
      goal("ice", "Test the ice point", "Jaribu kiwango cha barafu", (c) =>
        anyParam(c, "liquid-thermometer", (p) => p.medium === 0),
      ),
      goal("steam", "Test the steam point", "Jaribu kiwango cha mvuke", (c) =>
        anyParam(c, "liquid-thermometer", (p) => p.medium === 4),
      ),
      goal(
        "eye",
        "Read with your eye straight on",
        "Soma jicho likiwa moja kwa moja",
        (c) => anyParam(c, "liquid-thermometer", (p) => Math.abs(p.eye) <= 6),
      ),
    ],
  },
  {
    id: "heating-water",
    section: "heat",
    title: t("Heating water electrically", "Kupasha maji kwa umeme"),
    summary: t(
      "Heat water in a lagged calorimeter and relate the energy supplied to the temperature rise.",
      "Pasha maji kwenye kalorimita yenye kinga na uhusishe nishati iliyotolewa na ongezeko la joto.",
    ),
    equipment: [
      "power-supply",
      "immersion-heater",
      "calorimeter",
      "switch",
      "liquid-thermometer",
    ],
    steps: [
      t(
        "Place the immersion heater over the calorimeter.",
        "Weka hita ya kuzamisha juu ya kalorimita.",
      ),
      t(
        "Wire the heater to the 12 V supply through a switch.",
        "Unganisha hita na chanzo cha 12 V kupitia swichi.",
      ),
      t(
        "Increase the heating time and record temperature and energy.",
        "Ongeza muda wa kupasha na urekodi joto na nishati.",
      ),
    ],
    goals: [
      goal(
        "inside",
        "Put the heater inside the calorimeter",
        "Weka hita ndani ya kalorimita",
        (c) =>
          partsOf(c, "immersion-heater").some((heater) =>
            partsOf(c, "calorimeter").some((cal) => overlaps(heater, cal)),
          ),
      ),
      goal("powered", "Power the heater", "Washa hita", (c) =>
        partsOf(c, "immersion-heater").some(
          (heater) => elementState(c.solution, heater.id).power > 5,
        ),
      ),
      goal("lagging", "Fit the lagging", "Weka kinga ya joto", (c) =>
        anyParam(c, "calorimeter", (p) => p.lagging === 1),
      ),
      goal("heated", "Heat for some time", "Pasha kwa muda", (c) =>
        anyParam(c, "calorimeter", (p) => p.time > 0),
      ),
    ],
  },
  {
    id: "boyles-law",
    section: "heat",
    title: t("Boyle's law", "Sheria ya Boyle"),
    summary: t(
      "Change the volume of trapped air and show that P × V is constant.",
      "Badilisha ujazo wa hewa iliyonaswa na uonyeshe kwamba P × V ni thabiti.",
    ),
    equipment: ["boyle-apparatus"],
    steps: [
      t(
        "Read the pressure at several volumes.",
        "Soma shinikizo kwenye ujazo kadhaa.",
      ),
      t("Record V and P each time.", "Rekodi V na P kila mara."),
      t(
        "Plot P against 1/V: a straight line through the origin.",
        "Chora P dhidi ya 1/V: mstari ulionyooka kupitia asili.",
      ),
    ],
    goals: [
      placed("boyle-apparatus", "Place the apparatus", "Weka kifaa"),
      goal(
        "records",
        "Record 5 different volumes",
        "Rekodi ujazo 5 tofauti",
        (c) => recorded(c, "boyle-apparatus", "volume").size >= 5,
      ),
    ],
  },
  {
    id: "lens-focal-length",
    section: "optics",
    title: t("Focal length of a lens", "Urefu wa kitovu wa lenzi"),
    summary: t(
      "Focus an image on a screen and use 1/f = 1/u + 1/v.",
      "Lenga taswira kwenye skrini na utumie 1/f = 1/u + 1/v.",
    ),
    equipment: ["optical-bench"],
    steps: [
      t("Set an object distance.", "Weka umbali wa kitu."),
      t(
        "Slide the screen until the image is sharp.",
        "Sogeza skrini hadi taswira iwe wazi.",
      ),
      t(
        "Record u and v, then repeat for other values of u.",
        "Rekodi u na v, kisha rudia kwa thamani zingine za u.",
      ),
    ],
    goals: [
      placed(
        "optical-bench",
        "Place the optical bench",
        "Weka benchi ya macho",
      ),
      goal(
        "sharp",
        "Get a sharp image on the screen",
        "Pata taswira wazi kwenye skrini",
        (c) =>
          partsOf(c, "optical-bench").some(
            (bench) => visual(c, bench, "sharpness") > 0.9,
          ),
      ),
      goal(
        "records",
        "Record 3 different object distances",
        "Rekodi umbali 3 tofauti wa kitu",
        (c) => recorded(c, "optical-bench", "u").size >= 3,
      ),
    ],
  },
  {
    id: "refraction-block",
    section: "optics",
    title: t(
      "Refraction through a glass block",
      "Kuvunjika kupitia kipande cha kioo",
    ),
    summary: t(
      "Measure i and r and show that sin i ÷ sin r is constant.",
      "Pima i na r na uonyeshe kwamba sin i ÷ sin r ni thabiti.",
    ),
    equipment: ["glass-block"],
    steps: [
      t(
        "Choose an angle of incidence and read the angle of refraction.",
        "Chagua pembe ya kuingia na usome pembe ya kuvunja.",
      ),
      t("Record at least four angles.", "Rekodi angalau pembe nne."),
      t(
        "Plot sin i against sin r: the gradient is the refractive index.",
        "Chora sin i dhidi ya sin r: mwinuko ni kielezo cha kuvunja.",
      ),
    ],
    goals: [
      placed("glass-block", "Place the glass block", "Weka kipande cha kioo"),
      goal(
        "records",
        "Record 4 different angles",
        "Rekodi pembe 4 tofauti",
        (c) => recorded(c, "glass-block", "i").size >= 4,
      ),
    ],
  },
  {
    id: "speed-of-sound",
    section: "waves",
    title: t("Speed of sound by resonance", "Kasi ya sauti kwa mwangwi"),
    summary: t(
      "Find two successive resonances in a tube and calculate v = 2f(L₂ − L₁).",
      "Pata mwangwi mbili mfululizo kwenye mrija na uhesabu v = 2f(L₂ − L₁).",
    ),
    equipment: ["resonance-tube"],
    steps: [
      t(
        "Choose a fork and start with a short air column.",
        "Chagua uma na uanze na safu fupi ya hewa.",
      ),
      t(
        "Slowly lengthen the column and listen for the loudest sound.",
        "Refusha safu polepole na usikilize sauti kubwa zaidi.",
      ),
      t("Record both resonance lengths.", "Rekodi urefu wote wa mwangwi."),
    ],
    goals: [
      placed(
        "resonance-tube",
        "Place the resonance tube",
        "Weka mrija wa mwangwi",
      ),
      goal(
        "two",
        "Record two different resonances",
        "Rekodi mwangwi mbili tofauti",
        (c) => {
          const lengths = new Set<string>();
          for (const record of c.records) {
            const loud = record.readings.find(
              (r) =>
                /^resonance-tube-\d+$/.test(r.partId) &&
                r.measureId === "loudness",
            );
            const length = record.readings.find(
              (r) =>
                /^resonance-tube-\d+$/.test(r.partId) &&
                r.measureId === "length",
            );
            if (loud && length && loud.value >= 90)
              lengths.add(length.value.toFixed(0));
          }
          return lengths.size >= 2;
        },
      ),
    ],
  },
  {
    id: "using-cro",
    section: "waves",
    title: t("Using a CRO", "Kutumia CRO"),
    summary: t(
      "Display a signal and measure its period and peak voltage.",
      "Onyesha ishara na upime kipindi chake na volteji ya kilele.",
    ),
    equipment: ["signal-generator", "cro", "connecting-lead"],
    steps: [
      t(
        "Connect the signal generator to the CRO's Y input.",
        "Unganisha jenereta ya mawimbi na pembejeo ya Y ya CRO.",
      ),
      t(
        "Switch on, raise the brightness, focus and centre the trace.",
        "Washa, ongeza mwangaza, rekebisha ukali na uweke mstari katikati.",
      ),
      t(
        "Set the time base and Y-gain so about two cycles fill the screen, then read T and Vₚ.",
        "Weka msingi wa muda na kipaza Y ili mizunguko miwili ijaze skrini, kisha usome T na Vₚ.",
      ),
    ],
    goals: [
      placed("cro", "Place the CRO", "Weka CRO"),
      goal("on", "Switch the CRO on", "Washa CRO", (c) =>
        anyParam(c, "cro", (p) => p.power === 1),
      ),
      goal(
        "readable",
        "Get a clear, centred trace you can read",
        "Pata mstari ulio wazi na katikati unaoweza kusoma",
        (c) =>
          partsOf(c, "cro").some(
            (cro) => (c.outcomes.get(cro.id)?.tasks?.length ?? 0) > 0,
          ),
      ),
    ],
  },
  {
    id: "rheostat-control",
    section: "electricity",
    title: t(
      "Controlling current with a rheostat",
      "Kudhibiti mkondo kwa rheostati",
    ),
    summary: t(
      "Vary the current through a bulb with a rheostat, starting at maximum resistance.",
      "Badilisha mkondo kupitia balbu kwa rheostati, ukianza na ukinzani mkubwa zaidi.",
    ),
    equipment: ["power-supply", "rheostat", "bulb", "ammeter", "switch"],
    steps: [
      t(
        "Connect the supply, rheostat (one end and the slider), bulb and ammeter in series.",
        "Unganisha chanzo, rheostati (ncha moja na kiteleza), balbu na amita mfululizo.",
      ),
      t(
        "Start with the slider at the maximum-resistance end.",
        "Anza na kiteleza upande wa ukinzani mkubwa zaidi.",
      ),
      t(
        "Move the slider and record the current each time.",
        "Sogeza kiteleza na urekodi mkondo kila mara.",
      ),
    ],
    goals: [
      placed("rheostat", "Place a rheostat", "Weka rheostati"),
      goal(
        "series",
        "Light the bulb through the rheostat",
        "Washa balbu kupitia rheostati",
        (c) =>
          partsOf(c, "bulb").some(
            (bulb) => elementState(c.solution, bulb.id).power > 0.01,
          ) &&
          partsOf(c, "rheostat").some(
            (rheostat) =>
              Math.abs(elementState(c.solution, rheostat.id).current) > 0.01,
          ),
      ),
      goal(
        "records",
        "Record 3 different currents",
        "Rekodi mikondo 3 tofauti",
        (c) => recorded(c, "ammeter", "reading").size >= 3,
      ),
    ],
  },
  {
    id: "metre-bridge",
    section: "electricity",
    title: t(
      "Metre bridge: an unknown resistance",
      "Daraja la mita: ukinzani usiojulikana",
    ),
    summary: t(
      "Balance the bridge so the galvanometer reads zero, then R ÷ X = l ÷ (100 − l).",
      "Sawazisha daraja ili galvanomita isome sifuri, kisha R ÷ X = l ÷ (100 − l).",
    ),
    equipment: [
      "metre-bridge",
      "dry-cell",
      "galvanometer",
      "resistor",
      "resistance-box",
      "switch",
    ],
    steps: [
      t(
        "Put a resistance box in one gap and the unknown resistor in the other.",
        "Weka sanduku la ukinzani kwenye pengo moja na kikinzani kisichojulikana kwenye lingine.",
      ),
      t(
        "Connect the cell across the wire and the galvanometer between the middle post and the jockey.",
        "Unganisha seli kwenye waya na galvanomita kati ya nguzo ya kati na kiteleza.",
      ),
      t(
        "Slide the jockey until the galvanometer reads zero.",
        "Sogeza kiteleza hadi galvanomita isome sifuri.",
      ),
    ],
    goals: [
      placed("metre-bridge", "Place the metre bridge", "Weka daraja la mita"),
      goal(
        "powered",
        "Connect a cell across the wire",
        "Unganisha seli kwenye waya",
        (c) =>
          partsOf(c, "metre-bridge").some(
            (bridge) =>
              Math.abs(elementState(c.solution, bridge.id).voltage) > 0.3,
          ),
      ),
      goal("null", "Find the balance point", "Pata sehemu ya usawa", (c) => {
        const balanced = c.parts.some(
          (bridge) =>
            bridge.kind === "metre-bridge" &&
            bridge.params.pos > 10 &&
            bridge.params.pos < 90 &&
            Math.abs(elementState(c.solution, bridge.id).voltage) > 0.3,
        );
        return (
          balanced &&
          partsOf(c, "galvanometer").some(
            (meter) =>
              Math.abs(visual(c, meter, "fraction")) < 0.03 &&
              c.wires.some(
                (wire) =>
                  wire.from.partId === meter.id || wire.to.partId === meter.id,
              ),
          )
        );
      }),
    ],
  },
  {
    id: "fuse-protection",
    section: "electricity",
    title: t("A fuse protects a circuit", "Fyuzi hulinda sakiti"),
    summary: t(
      "Overload a circuit so the fuse blows, then find out why.",
      "Zidisha mzigo wa sakiti ili fyuzi iungue, kisha ugundue sababu.",
    ),
    equipment: ["dry-cell", "fuse", "bulb", "switch", "power-supply"],
    steps: [
      t(
        "Wire a supply, a fuse and a bulb in series.",
        "Unganisha chanzo, fyuzi na balbu mfululizo.",
      ),
      t(
        "Raise the voltage or short out the bulb until the current exceeds the fuse rating.",
        "Ongeza volteji au fupisha balbu hadi mkondo upite kiwango cha fyuzi.",
      ),
      t(
        "Fit a new fuse after fixing the fault.",
        "Weka fyuzi mpya baada ya kurekebisha hitilafu.",
      ),
    ],
    goals: [
      placed("fuse", "Place a fuse", "Weka fyuzi"),
      goal(
        "works",
        "Light a bulb through the fuse",
        "Washa balbu kupitia fyuzi",
        (c) =>
          partsOf(c, "bulb").some(
            (bulb) => elementState(c.solution, bulb.id).power > 0.01,
          ) && partsOf(c, "fuse").length > 0,
      ),
      goal("blown", "Blow the fuse", "Ungua fyuzi", (c) =>
        anyParam(c, "fuse", (p) => p.blown === 1),
      ),
    ],
  },
  {
    id: "multimeter-resistance",
    section: "electricity",
    title: t(
      "Measuring resistance with a multimeter",
      "Kupima ukinzani kwa mita mchanganyiko",
    ),
    summary: t(
      "Zero the ohmmeter and measure a resistor with the power off.",
      "Weka sifuri ohmita na upime kikinzani umeme ukiwa umezimwa.",
    ),
    equipment: ["multimeter", "resistor"],
    steps: [
      t(
        "Turn the dial to Ω and touch the probes together; press REL if it does not read zero.",
        "Geuza kitufe hadi Ω na ugusanishe probu; bonyeza REL isiposoma sifuri.",
      ),
      t(
        "Connect the probes across the resistor.",
        "Unganisha probu kwenye kikinzani.",
      ),
      t(
        "Read the resistance and compare with the colour bands.",
        "Soma ukinzani na ulinganishe na mikanda ya rangi.",
      ),
    ],
    goals: [
      placed("multimeter", "Place the multimeter", "Weka mita mchanganyiko"),
      goal("ohms", "Select the ohms mode", "Chagua hali ya ohm", (c) =>
        anyParam(c, "multimeter", (p) => p.mode === 4),
      ),
      goal("zero", "Zero it with REL", "Iweke sifuri kwa REL", (c) =>
        anyParam(c, "multimeter", (p) => p.mode === 4 && p.rel > 0),
      ),
      goal("read", "Read a resistor", "Soma kikinzani", (c) =>
        partsOf(c, "multimeter").some(
          (meter) =>
            (c.outcomes.get(meter.id)?.measures?.length ?? 0) > 0 &&
            meter.params.mode === 4 &&
            (c.solution.ohms.get(meter.id) ?? Infinity) > 0.5 &&
            (c.solution.ohms.get(meter.id) ?? Infinity) < 1e5,
        ),
      ),
    ],
  },
  {
    id: "bar-magnet-field",
    section: "magnetism",
    title: t("The field of a bar magnet", "Uga wa sumaku ya fimbo"),
    summary: t(
      "Map the field with a plotting compass and iron filings.",
      "Chora uga kwa dira ya kuchora na vumbi la chuma.",
    ),
    equipment: ["bar-magnet", "plotting-compass", "iron-filings"],
    steps: [
      t(
        "Place the magnet and put the compass beside it.",
        "Weka sumaku na uweke dira kando yake.",
      ),
      t(
        "Move the compass around the magnet and watch the needle.",
        "Sogeza dira kuzunguka sumaku na utazame sindano.",
      ),
      t(
        "Put the iron filings over the magnet and tap the paper.",
        "Weka vumbi la chuma juu ya sumaku na upige karatasi.",
      ),
    ],
    goals: [
      placed("bar-magnet", "Place a bar magnet", "Weka sumaku ya fimbo"),
      goal(
        "compass",
        "Pull the compass needle off north",
        "Vuta sindano ya dira mbali na kaskazini",
        (c) =>
          partsOf(c, "plotting-compass").some(
            (compass) => Math.abs(visual(c, compass, "heading")) > 5,
          ),
      ),
      goal(
        "filings",
        "Tap the filings into a pattern",
        "Piga vumbi la chuma lipate mchoro",
        (c) => anyParam(c, "iron-filings", (p) => p.tapped === 1),
      ),
    ],
  },
  {
    id: "electromagnet-strength",
    section: "magnetism",
    title: t("Strength of an electromagnet", "Nguvu ya sumaku-umeme"),
    summary: t(
      "See how current and turns change how many paper clips an electromagnet holds.",
      "Ona jinsi mkondo na mizunguko inavyobadilisha idadi ya klipu zinazoshikiliwa.",
    ),
    equipment: ["electromagnet", "power-supply", "ammeter", "switch"],
    steps: [
      t(
        "Connect the electromagnet to the supply through an ammeter.",
        "Unganisha sumaku-umeme na chanzo kupitia amita.",
      ),
      t(
        "Raise the voltage in steps and record the current and clips.",
        "Ongeza volteji kwa hatua na urekodi mkondo na klipu.",
      ),
      t("Repeat with more turns.", "Rudia kwa mizunguko zaidi."),
    ],
    goals: [
      placed("electromagnet", "Place the electromagnet", "Weka sumaku-umeme"),
      goal(
        "clips",
        "Make it hold 3 or more clips",
        "Ifanye ishike klipu 3 au zaidi",
        (c) =>
          partsOf(c, "electromagnet").some(
            (magnet) => visual(c, magnet, "clips") >= 3,
          ),
      ),
      goal(
        "records",
        "Record 3 different currents",
        "Rekodi mikondo 3 tofauti",
        (c) => recorded(c, "electromagnet", "current").size >= 3,
      ),
    ],
  },
  {
    id: "transformer-ratio",
    section: "magnetism",
    title: t("A transformer", "Transfoma"),
    summary: t(
      "Show that Vs ÷ Vp = Ns ÷ Np on an a.c. supply.",
      "Onyesha kwamba Vs ÷ Vp = Ns ÷ Np kwenye chanzo cha a.c.",
    ),
    equipment: ["transformer", "power-supply", "voltmeter", "multimeter"],
    steps: [
      t(
        "Set the power supply to a.c. and connect it to the primary.",
        "Weka chanzo kuwa a.c. na ukiunganishe na msingi.",
      ),
      t(
        "Measure Vp and Vs with an a.c. voltmeter (multimeter on V~).",
        "Pima Vp na Vs kwa voltimita ya a.c. (mita mchanganyiko kwenye V~).",
      ),
      t(
        "Change the number of secondary turns and repeat.",
        "Badilisha idadi ya mizunguko ya upili na urudie.",
      ),
    ],
    goals: [
      placed("transformer", "Place the transformer", "Weka transfoma"),
      goal(
        "ac",
        "Drive the primary with a.c.",
        "Endesha msingi kwa a.c.",
        (c) =>
          c.solution.ac &&
          partsOf(c, "transformer").some(
            (tr) => Math.abs(elementState(c.solution, tr.id).voltage) > 0.5,
          ),
      ),
      goal(
        "records",
        "Record 3 different secondary voltages",
        "Rekodi volteji 3 tofauti za upili",
        (c) => recorded(c, "transformer", "vs").size >= 3,
      ),
    ],
  },
  {
    id: "led-resistor",
    section: "modern",
    title: t("Protect an LED", "Linda LED"),
    summary: t(
      "Light an LED safely with a series resistor.",
      "Washa LED kwa usalama kwa kikinzani mfululizo.",
    ),
    equipment: ["dry-cell", "cell-holder", "resistor", "led", "switch"],
    steps: [
      t(
        "Connect the supply, a resistor and the LED in series, with the LED's + towards the + of the supply.",
        "Unganisha chanzo, kikinzani na LED mfululizo, + ya LED ikielekea + ya chanzo.",
      ),
      t(
        "Choose a resistor so the current is about 10–20 mA.",
        "Chagua kikinzani ili mkondo uwe takriban 10–20 mA.",
      ),
      t(
        "Try the LED without a resistor on a spare one to see why you need it.",
        "Jaribu LED bila kikinzani kwenye ya ziada uone kwa nini unahitaji.",
      ),
    ],
    goals: [
      placed("led", "Place an LED", "Weka LED"),
      goal("lit", "Make the LED glow", "Fanya LED iwake", (c) =>
        partsOf(c, "led").some(
          (led) => visual(c, led, "brightness") > 0.2 && led.params.burnt === 0,
        ),
      ),
      goal(
        "burn",
        "See an LED burn out without a resistor",
        "Ona LED ikiungua bila kikinzani",
        (c) => anyParam(c, "led", (p) => p.burnt === 1),
      ),
    ],
  },
  {
    id: "ldr-light",
    section: "modern",
    title: t("Light and an LDR", "Mwanga na LDR"),
    summary: t(
      "Measure how the resistance of an LDR falls as the light gets brighter.",
      "Pima jinsi ukinzani wa LDR unavyopungua mwanga ukiongezeka.",
    ),
    equipment: ["ldr", "power-supply", "ammeter", "voltmeter"],
    steps: [
      t(
        "Connect the LDR to a supply with an ammeter and voltmeter.",
        "Unganisha LDR na chanzo pamoja na amita na voltimita.",
      ),
      t(
        "Change the light level and record V and I.",
        "Badilisha kiwango cha mwanga na urekodi V na I.",
      ),
      t(
        "Calculate R = V ÷ I and plot R against light.",
        "Hesabu R = V ÷ I na uchore R dhidi ya mwanga.",
      ),
    ],
    goals: [
      placed("ldr", "Place an LDR", "Weka LDR"),
      goal(
        "records",
        "Record 4 different light levels",
        "Rekodi viwango 4 tofauti vya mwanga",
        (c) => recorded(c, "ldr", "light").size >= 4,
      ),
    ],
  },
  {
    id: "radiation-absorbers",
    section: "modern",
    title: t("Types of radiation", "Aina za mionzi"),
    summary: t(
      "Find what stops alpha, beta and gamma radiation.",
      "Gundua kinachosimamisha mionzi ya alfa, beta na gamma.",
    ),
    equipment: ["radiation-kit"],
    steps: [
      t(
        "Count the background with no source.",
        "Hesabu mionzi ya mazingira bila chanzo.",
      ),
      t(
        "Put paper, aluminium and lead between each source and the tube and count.",
        "Weka karatasi, alumini na risasi kati ya kila chanzo na mrija na uhesabu.",
      ),
      t(
        "Subtract the background from every count.",
        "Toa mionzi ya mazingira kwenye kila hesabu.",
      ),
    ],
    goals: [
      placed(
        "radiation-kit",
        "Place the radiation kit",
        "Weka kifaa cha mionzi",
      ),
      goal(
        "background",
        "Count the background",
        "Hesabu mionzi ya mazingira",
        (c) => anyParam(c, "radiation-kit", (p) => p.source === 0 && p.run > 0),
      ),
      goal(
        "alpha",
        "Test alpha behind paper",
        "Jaribu alfa nyuma ya karatasi",
        (c) =>
          anyParam(
            c,
            "radiation-kit",
            (p) => p.source === 1 && p.absorber === 1 && p.run > 0,
          ),
      ),
      goal(
        "beta",
        "Test beta behind aluminium",
        "Jaribu beta nyuma ya alumini",
        (c) =>
          anyParam(
            c,
            "radiation-kit",
            (p) => p.source === 2 && p.absorber === 2 && p.run > 0,
          ),
      ),
      goal(
        "gamma",
        "Test gamma behind lead",
        "Jaribu gamma nyuma ya risasi",
        (c) =>
          anyParam(
            c,
            "radiation-kit",
            (p) => p.source === 3 && p.absorber === 3 && p.run > 0,
          ),
      ),
    ],
  },
];
