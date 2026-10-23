import type { Lab } from "../../catalog/data/catalog.types";
import type { Lesson } from "./lessons.types";

const lessons: Record<string, Lesson> = {
  "ohms-law": {
    predict: {
      en: "You will change the voltage, measure the current and look for a pattern. What do you think will happen when the voltage increases?",
      sw: "Utabadilisha volteji, kupima mkondo na kutafuta muundo. Unafikiri nini kitatokea volteji ikiongezeka?",
    },
    outcomes: [
      {
        en: "Identify the parts of a simple circuit.",
        sw: "Kutambua sehemu za sakiti rahisi.",
      },
      {
        en: "Measure voltage and current using the correct instruments.",
        sw: "Kupima volteji na mkondo kwa vifaa sahihi.",
      },
      {
        en: "Explain the relationship between voltage, current and resistance.",
        sw: "Kueleza uhusiano wa volteji, mkondo na ukinzani.",
      },
    ],
    resources: [
      { en: "Cell", sw: "Seli" },
      { en: "Bulb", sw: "Balbu" },
      { en: "Switch", sw: "Swichi" },
      { en: "Wires", sw: "Waya" },
      { en: "Ammeter", sw: "Amita" },
      { en: "Voltmeter", sw: "Voltimita" },
    ],
    explain: [
      {
        en: "In a closed circuit, a cell pushes charge through a conductor. Current is measured in amperes (A), voltage in volts (V), and resistance in ohms (Ω).",
        sw: "Katika sakiti iliyofungwa, seli husukuma chaji kupitia kondakta. Mkondo hupimwa kwa ampia (A), volteji kwa volti (V), na ukinzani kwa ohmu (Ω).",
      },
    ],
    formula: "V = I × R",
    callout: null,
    procedure: [
      {
        en: "Set up the cell, switch, bulb and meters.",
        sw: "Panga seli, swichi, balbu na mita.",
      },
      {
        en: "Run the circuit and record the readings.",
        sw: "Endesha sakiti na uandike vipimo.",
      },
      {
        en: "Change one variable and compare the result.",
        sw: "Badilisha kigezo kimoja na ulinganishe matokeo.",
      },
    ],
    simulations: [
      {
        to: "/workbench/electricity?experiment=ohms-law",
        label: { en: "Open simulation", sw: "Fungua jaribio" },
      },
    ],
  },
  "plant-cells": {
    predict: {
      en: "Read the question, make a prediction, then continue to the learning outcomes.",
      sw: "Soma swali, fanya utabiri, kisha endelea kwenye matokeo ya kujifunza.",
    },
    outcomes: [
      {
        en: "Identify the cell wall, nucleus and chloroplasts.",
        sw: "Tambua ukuta wa seli, kiini na kloroplasti.",
      },
      {
        en: "Use a microscope to observe a prepared plant slide.",
        sw: "Tumia hadubini kuchunguza slaidi ya mmea iliyoandaliwa.",
      },
    ],
    resources: [
      { en: "Microscope", sw: "Hadubini" },
      { en: "Plant slide", sw: "Slaidi ya mmea" },
      { en: "Petri dish", sw: "Sahani ya Petri" },
      { en: "Dropper", sw: "Kidondosho" },
    ],
    explain: [
      {
        en: "A plant cell has a cell wall outside its membrane. The nucleus contains genetic material; chloroplasts contain chlorophyll for photosynthesis.",
        sw: "Seli ya mmea ina ukuta wa seli nje ya utando wake. Kiini kina taarifa za urithi; kloroplasti zina klorofili kwa usanisinuru.",
      },
    ],
    formula: null,
    callout: null,
    procedure: [
      {
        en: "Place a microscope and prepared plant slide on the bench.",
        sw: "Weka hadubini na slaidi ya mmea iliyoandaliwa kwenye benchi.",
      },
      {
        en: "Open the observation preview and identify visible structures.",
        sw: "Fungua mfano wa uchunguzi na utambue miundo inayoonekana.",
      },
      {
        en: "Record what each structure does in your notes.",
        sw: "Andika kazi ya kila muundo kwenye daftari lako.",
      },
    ],
    simulations: [
      {
        to: "/sandbox/biology",
        label: {
          en: "Open microscope station",
          sw: "Fungua kituo cha hadubini",
        },
      },
    ],
  },
  "acids-bases": {
    predict: {
      en: "Which everyday liquids do you think are acids, and which are bases? Make a guess for lemon juice, soapy water and plain water.",
      sw: "Ni vimiminika gani vya kila siku unavyofikiri ni asidi, na vipi ni besi? Kisia kwa maji ya ndimu, maji ya sabuni na maji safi.",
    },
    outcomes: [
      {
        en: "Use universal indicator and red cabbage juice to test samples.",
        sw: "Kutumia kiashiria cha jumla na juisi ya kabichi nyekundu kupima sampuli.",
      },
      {
        en: "Match an indicator colour to a pH value.",
        sw: "Kulinganisha rangi ya kiashiria na thamani ya pH.",
      },
      {
        en: "Classify a sample as an acid, a base or neutral.",
        sw: "Kuainisha sampuli kama asidi, besi au isiyoegemea.",
      },
    ],
    resources: [
      { en: "Test tubes and rack", sw: "Mirija ya majaribio na rafu" },
      { en: "Universal indicator", sw: "Kiashiria cha jumla" },
      { en: "Red cabbage juice", sw: "Juisi ya kabichi nyekundu" },
      {
        en: "Ten household and lab samples",
        sw: "Sampuli kumi za nyumbani na maabara",
      },
    ],
    explain: [
      {
        en: "Acids taste sour and have a pH below 7. Bases feel slippery and have a pH above 7. Pure water is neutral, with a pH of exactly 7.",
        sw: "Asidi ina ladha chachu na pH chini ya 7. Besi huteleza na ina pH juu ya 7. Maji safi hayaegemei, pH yake ni 7 kamili.",
      },
      {
        en: "An indicator is a dye that changes colour with pH. Universal indicator shows a different colour across the whole scale, from red in strong acids to purple in strong bases.",
        sw: "Kiashiria ni rangi inayobadilika kulingana na pH. Kiashiria cha jumla huonyesha rangi tofauti katika kipimo chote, kutoka nyekundu kwenye asidi kali hadi zambarau kwenye besi kali.",
      },
    ],
    formula: null,
    callout: {
      en: "pH below 7 is acid · pH 7 is neutral · pH above 7 is base",
      sw: "pH chini ya 7 ni asidi · pH 7 haiegemei · pH juu ya 7 ni besi",
    },
    procedure: [
      {
        en: "Pour a sample into a test tube.",
        sw: "Mimina sampuli kwenye mrija wa majaribio.",
      },
      {
        en: "Add the indicator and watch the colour change.",
        sw: "Weka kiashiria na uangalie rangi ikibadilika.",
      },
      {
        en: "Match the colour to the pH chart and classify the sample.",
        sw: "Linganisha rangi na chati ya pH kisha uainishe sampuli.",
      },
    ],
    simulations: [
      {
        to: "/chemistry/indicators",
        label: { en: "Open indicator lab", sw: "Fungua maabara ya viashiria" },
      },
    ],
  },
  titration: {
    predict: {
      en: "When you add acid to an alkali, what do you expect to happen to the pH, and how will you know when the alkali has been used up?",
      sw: "Ukiongeza asidi kwenye alkali, unatarajia pH ifanyeje, na utajuaje alkali imeisha?",
    },
    outcomes: [
      {
        en: "Describe neutralisation between an acid and an alkali.",
        sw: "Kueleza kutenguana kwa asidi na alkali.",
      },
      {
        en: "Carry out a titration and read a burette.",
        sw: "Kufanya titreshini na kusoma biureti.",
      },
      {
        en: "Calculate an unknown concentration from the titre.",
        sw: "Kukokotoa uzito usiojulikana kutoka kwa titre.",
      },
    ],
    resources: [
      { en: "Burette and stand", sw: "Biureti na stendi" },
      { en: "Conical flask", sw: "Chupa ya koni" },
      { en: "Indicators", sw: "Viashiria" },
      {
        en: "Hydrochloric acid, 0.100 mol/L",
        sw: "Asidi hidrokloriki, 0.100 mol/L",
      },
    ],
    explain: [
      {
        en: "An acid and an alkali react to form a salt and water. For hydrochloric acid and sodium hydroxide, one mole of acid reacts with exactly one mole of alkali.",
        sw: "Asidi na alkali huguswa na kutoa chumvi na maji. Kwa asidi hidrokloriki na hidroksidi ya sodiamu, mole moja ya asidi huguswa na mole moja kamili ya alkali.",
      },
      {
        en: "In a titration, the burette adds acid to a measured volume of alkali until the indicator changes colour. The volume of acid used is called the titre.",
        sw: "Katika titreshini, biureti huongeza asidi kwenye ujazo uliopimwa wa alkali hadi kiashiria kibadilike rangi. Ujazo wa asidi uliotumika huitwa titre.",
      },
    ],
    formula: "c(NaOH) = 0.100 × titre ÷ 25.0",
    callout: null,
    procedure: [
      {
        en: "Choose an indicator and run a rough titration.",
        sw: "Chagua kiashiria na ufanye titreshini ya makadirio.",
      },
      {
        en: "Refill and repeat, adding drop by drop near the colour change.",
        sw: "Jaza tena na urudie, ukiongeza tone kwa tone karibu na mabadiliko ya rangi.",
      },
      {
        en: "Record two titres within 0.1 mL and calculate the concentration.",
        sw: "Andika titre mbili zenye tofauti ya chini ya mL 0.1 kisha ukokotoe uzito.",
      },
    ],
    simulations: [
      {
        to: "/chemistry/titration",
        label: { en: "Open titration lab", sw: "Fungua maabara ya titreshini" },
      },
    ],
  },
  separation: {
    predict: {
      en: "Iron filings, sand and salt are mixed in one dish. Which one would you take out first, and why?",
      sw: "Vumbi la chuma, mchanga na chumvi vimechanganyika kwenye sahani moja. Ni kipi ungeondoa kwanza, na kwa nini?",
    },
    outcomes: [
      {
        en: "Name the property each separation method relies on.",
        sw: "Kutaja sifa ambayo kila mbinu ya kutenganisha hutegemea.",
      },
      {
        en: "Plan the correct order of methods for a mixture.",
        sw: "Kupanga mpangilio sahihi wa mbinu kwa mchanganyiko.",
      },
      {
        en: "Recover each substance from a three-part mixture.",
        sw: "Kupata kila dutu kutoka mchanganyiko wa sehemu tatu.",
      },
    ],
    resources: [
      { en: "Bar magnet", sw: "Sumaku ya kijiti" },
      { en: "Beaker and stirring rod", sw: "Bika na kijiti cha kukoroga" },
      { en: "Funnel and filter paper", sw: "Faneli na karatasi ya kuchuja" },
      {
        en: "Evaporating dish and Bunsen burner",
        sw: "Sahani ya kuvukiza na kiwashio cha Bunsen",
      },
    ],
    explain: [
      {
        en: "Substances in a mixture keep their own properties, so differences between them can be used to separate them.",
        sw: "Dutu zilizo kwenye mchanganyiko hubaki na sifa zake, kwa hivyo tofauti zao zinaweza kutumika kuzitenganisha.",
      },
      {
        en: "A magnet picks out iron. Water dissolves salt but not sand. Filter paper holds back solids that are too big to pass through. Heating drives off the water and leaves the dissolved solid behind.",
        sw: "Sumaku huchukua chuma. Maji huyeyusha chumvi lakini si mchanga. Karatasi ya kuchuja hushika yabisi kubwa mno kupita. Joto hutoa maji na kuacha kigumu kilichoyeyuka.",
      },
    ],
    formula: null,
    callout: {
      en: "Magnetism, solubility, particle size and boiling point each separate a different part.",
      sw: "Sumaku, uyeyukaji, ukubwa wa chembe na kiwango cha kuchemka kila kimoja hutenganisha sehemu tofauti.",
    },
    procedure: [
      {
        en: "Look at what each substance can and cannot do.",
        sw: "Angalia kila dutu inaweza na haiwezi kufanya nini.",
      },
      {
        en: "Pick the method that separates the next substance.",
        sw: "Chagua mbinu inayotenganisha dutu inayofuata.",
      },
      {
        en: "Keep going until iron, sand and salt are all recovered.",
        sw: "Endelea hadi chuma, mchanga na chumvi vyote vipatikane.",
      },
    ],
    simulations: [
      {
        to: "/chemistry/separation",
        label: {
          en: "Open separation lab",
          sw: "Fungua maabara ya kutenganisha",
        },
      },
    ],
  },
};

export function getLesson(lab: Lab): Lesson {
  return (
    lessons[lab.id] ?? {
      predict: {
        en: "Read the question, make a prediction, then continue to the learning outcomes.",
        sw: "Soma swali, fanya utabiri, kisha endelea kwenye matokeo ya kujifunza.",
      },
      outcomes: [
        {
          en: "Describe the key idea in this activity.",
          sw: "Eleza wazo kuu katika shughuli hii.",
        },
        {
          en: "Make a prediction and compare it with evidence.",
          sw: "Fanya utabiri na ulinganishe na ushahidi.",
        },
      ],
      resources: [
        { en: "Notebook", sw: "Daftari" },
        { en: "Observation sheet", sw: "Karatasi ya uchunguzi" },
      ],
      explain: [{ en: lab.intro, sw: lab.introSw }],
      formula: null,
      callout: null,
      procedure: [
        {
          en: "Write down your prediction.",
          sw: "Andika utabiri wako.",
        },
        {
          en: "Note what you already know about the topic.",
          sw: "Andika unachojua tayari kuhusu mada hii.",
        },
      ],
      simulations: [],
    }
  );
}
