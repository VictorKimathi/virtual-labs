import type { Assessment, Question } from "./questions.types";

const q = (
  prompt: [string, string],
  options: [string, string][],
  answer: number,
  hint: [string, string],
): Question => ({
  prompt: { en: prompt[0], sw: prompt[1] },
  options: options.map(([en, sw]) => ({ en, sw })),
  answer,
  hint: { en: hint[0], sw: hint[1] },
});

const assessments: Record<string, Assessment> = {
  "ohms-law": {
    pre: [
      q(
        [
          "What provides electrical energy in a simple circuit?",
          "Ni nini hutoa nishati ya umeme katika sakiti rahisi?",
        ],
        [
          ["A cell", "Seli"],
          ["A wire", "Waya"],
          ["A bulb", "Balbu"],
          ["A switch", "Swichi"],
        ],
        0,
        [
          "Think about which part stores chemical energy.",
          "Fikiria ni sehemu ipi huhifadhi nishati ya kemikali.",
        ],
      ),
      q(
        [
          "Which instrument measures electric current?",
          "Ni kifaa gani hupima mkondo wa umeme?",
        ],
        [
          ["Voltmeter", "Voltimita"],
          ["Ammeter", "Amita"],
          ["Thermometer", "Kipimajoto"],
          ["Ruler", "Rula"],
        ],
        1,
        [
          "Think about what each instrument measures.",
          "Fikiria kila kifaa hupima nini.",
        ],
      ),
      q(
        ["What is the unit of resistance?", "Kizio cha ukinzani ni nini?"],
        [
          ["Volt", "Volti"],
          ["Ampere", "Ampia"],
          ["Ohm", "Ohmu"],
          ["Watt", "Wati"],
        ],
        2,
        [
          "The law is named after the unit.",
          "Sheria hii imepewa jina la kizio hicho.",
        ],
      ),
      q(
        [
          "What happens when the switch is open?",
          "Nini hutokea swichi ikiwa wazi?",
        ],
        [
          ["Current flows faster", "Mkondo hupita haraka"],
          ["The circuit is broken", "Sakiti inakatika"],
          ["Voltage disappears", "Volteji hupotea"],
          ["The bulb gets brighter", "Balbu hung’aa zaidi"],
        ],
        1,
        [
          "Charge needs a complete path to flow.",
          "Chaji huhitaji njia kamili ili kutiririka.",
        ],
      ),
      q(
        [
          "If resistance stays constant and voltage rises, what happens to current?",
          "Ukinzani ukibaki sawa na volteji iongezeke, nini hutokea kwa mkondo?",
        ],
        [
          ["It increases", "Unaongezeka"],
          ["It decreases", "Unapungua"],
          ["It stays zero", "Unabaki sifuri"],
          ["It reverses", "Unageuka"],
        ],
        0,
        [
          "More push means more flow.",
          "Msukumo zaidi humaanisha mtiririko zaidi.",
        ],
      ),
    ],
    post: [
      q(
        [
          "A 10 Ω resistor has 5 V across it. What is the current?",
          "Kinzani cha 10 Ω kina volti 5 V. Mkondo ni upi?",
        ],
        [
          ["0.5 A", "0.5 A"],
          ["2 A", "2 A"],
          ["5 A", "5 A"],
          ["50 A", "50 A"],
        ],
        0,
        ["Use I = V ÷ R.", "Tumia I = V ÷ R."],
      ),
      q(
        [
          "A graph of voltage against current for a resistor is…",
          "Grafu ya volteji dhidi ya mkondo kwa kinzani ni…",
        ],
        [
          [
            "A straight line through the origin",
            "Mstari ulionyooka kupitia asili",
          ],
          ["A curve that levels off", "Mkunjo unaotulia"],
          ["A horizontal line", "Mstari mlalo"],
          ["A random scatter", "Mtawanyiko holela"],
        ],
        0,
        [
          "Voltage is directly proportional to current.",
          "Volteji inalingana moja kwa moja na mkondo.",
        ],
      ),
      q(
        [
          "Which meter is connected across the resistor?",
          "Ni mita ipi huunganishwa kuvuka kinzani?",
        ],
        [
          ["Voltmeter", "Voltimita"],
          ["Ammeter", "Amita"],
          ["Both", "Zote mbili"],
          ["Neither", "Hakuna"],
        ],
        0,
        [
          "Voltage is measured across a component.",
          "Volteji hupimwa kuvuka kijenzi.",
        ],
      ),
      q(
        [
          "Voltage stays the same and resistance doubles. The current…",
          "Volteji ikibaki sawa na ukinzani ukaongezeka mara mbili, mkondo…",
        ],
        [
          ["Halves", "Hupungua nusu"],
          ["Doubles", "Huongezeka mara mbili"],
          ["Stays the same", "Hubaki sawa"],
          ["Becomes zero", "Huwa sifuri"],
        ],
        0,
        [
          "Current is inversely related to resistance.",
          "Mkondo hupungua ukinzani ukiongezeka.",
        ],
      ),
    ],
  },
  "plant-cells": {
    pre: [
      q(
        [
          "Which part of a plant cell gives it a firm shape?",
          "Ni sehemu ipi ya seli ya mmea huipa umbo imara?",
        ],
        [
          ["Cell wall", "Ukuta wa seli"],
          ["Nucleus", "Kiini"],
          ["Chloroplast", "Kloroplasti"],
          ["Vacuole", "Vakuoli"],
        ],
        0,
        [
          "It is the rigid layer outside the membrane.",
          "Ni tabaka gumu nje ya utando.",
        ],
      ),
      q(
        [
          "Which instrument shows cells that are too small to see?",
          "Ni kifaa gani huonyesha seli ndogo mno kuonekana?",
        ],
        [
          ["Microscope", "Hadubini"],
          ["Telescope", "Darubini"],
          ["Hand lens only", "Kioo cha mkono pekee"],
          ["Ruler", "Rula"],
        ],
        0,
        ["It magnifies very small things.", "Hukuza vitu vidogo sana."],
      ),
      q(
        ["What do chloroplasts contain?", "Kloroplasti zina nini?"],
        [
          ["Chlorophyll", "Klorofili"],
          ["Protein only", "Protini pekee"],
          ["Water only", "Maji pekee"],
          ["Salt", "Chumvi"],
        ],
        0,
        ["It is the green pigment.", "Ni rangi ya kijani."],
      ),
    ],
    post: [
      q(
        [
          "Which structure holds the genetic material?",
          "Ni muundo upi unashikilia taarifa za urithi?",
        ],
        [
          ["Nucleus", "Kiini"],
          ["Cell wall", "Ukuta wa seli"],
          ["Chloroplast", "Kloroplasti"],
          ["Slide", "Slaidi"],
        ],
        0,
        ["It controls the cell.", "Hudhibiti seli."],
      ),
      q(
        ["Why are plant cells green?", "Kwa nini seli za mimea ni za kijani?"],
        [
          ["They contain chloroplasts", "Zina kloroplasti"],
          ["They contain water", "Zina maji"],
          ["They have a nucleus", "Zina kiini"],
          ["They are old", "Ni kongwe"],
        ],
        0,
        [
          "Look for the part that makes food.",
          "Tafuta sehemu inayotengeneza chakula.",
        ],
      ),
      q(
        [
          "Which part is found in plant cells but not animal cells?",
          "Ni sehemu ipi ipo kwenye seli za mimea lakini si za wanyama?",
        ],
        [
          ["Cell wall", "Ukuta wa seli"],
          ["Nucleus", "Kiini"],
          ["Membrane", "Utando"],
          ["Cytoplasm", "Saitoplazimu"],
        ],
        0,
        [
          "Animal cells have no rigid outer layer.",
          "Seli za wanyama hazina tabaka gumu la nje.",
        ],
      ),
    ],
  },
  "acids-bases": {
    pre: [
      q(
        ["Which of these is an acid?", "Ni kipi kati ya hivi ni asidi?"],
        [
          ["Lemon juice", "Maji ya ndimu"],
          ["Soapy water", "Maji ya sabuni"],
          ["Baking soda solution", "Myeyusho wa soda ya kuokea"],
          ["Distilled water", "Maji safi"],
        ],
        0,
        ["Acids taste sour.", "Asidi ina ladha chachu."],
      ),
      q(
        ["What does a pH of 7 mean?", "pH ya 7 inamaanisha nini?"],
        [
          ["The solution is neutral", "Myeyusho hauegemei"],
          ["The solution is a strong acid", "Myeyusho ni asidi kali"],
          ["The solution is a strong base", "Myeyusho ni besi kali"],
          ["There is no water", "Hakuna maji"],
        ],
        0,
        ["Pure water has this pH.", "Maji safi yana pH hii."],
      ),
      q(
        ["What is an indicator?", "Kiashiria ni nini?"],
        [
          [
            "A dye that changes colour with pH",
            "Rangi inayobadilika kulingana na pH",
          ],
          ["A kind of acid", "Aina ya asidi"],
          ["A type of test tube", "Aina ya mrija wa majaribio"],
          ["A thermometer", "Kipimajoto"],
        ],
        0,
        [
          "It shows information through colour.",
          "Hutoa taarifa kupitia rangi.",
        ],
      ),
      q(
        [
          "Universal indicator turns green in a sample. The sample is…",
          "Kiashiria cha jumla kinakuwa kijani kwenye sampuli. Sampuli ni…",
        ],
        [
          ["Neutral", "Isiyoegemea"],
          ["A strong acid", "Asidi kali"],
          ["A strong base", "Besi kali"],
          ["Not a liquid", "Si kimiminika"],
        ],
        0,
        [
          "Green sits in the middle of the scale.",
          "Kijani kiko katikati ya kipimo.",
        ],
      ),
    ],
    post: [
      q(
        [
          "A sample turns universal indicator purple. It is…",
          "Sampuli inabadilisha kiashiria cha jumla kuwa zambarau. Ni…",
        ],
        [
          ["A strong base", "Besi kali"],
          ["A strong acid", "Asidi kali"],
          ["Neutral", "Isiyoegemea"],
          ["A weak acid", "Asidi dhaifu"],
        ],
        0,
        [
          "Purple is at the high end of the pH scale.",
          "Zambarau iko upande wa juu wa kipimo cha pH.",
        ],
      ),
      q(
        [
          "Which pH value is the most acidic?",
          "Ni thamani ipi ya pH yenye asidi zaidi?",
        ],
        [
          ["1", "1"],
          ["7", "7"],
          ["10", "10"],
          ["13", "13"],
        ],
        0,
        [
          "The lower the pH, the stronger the acid.",
          "Kadiri pH inavyopungua, asidi inakuwa kali zaidi.",
        ],
      ),
      q(
        [
          "Which sample turned universal indicator red?",
          "Ni sampuli ipi iligeuza kiashiria cha jumla kuwa nyekundu?",
        ],
        [
          ["Hydrochloric acid", "Asidi hidrokloriki"],
          ["Distilled water", "Maji safi"],
          ["Soapy water", "Maji ya sabuni"],
          ["Wood ash solution", "Myeyusho wa majivu"],
        ],
        0,
        [
          "Look back at your observation table.",
          "Rudi kwenye jedwali lako la uchunguzi.",
        ],
      ),
      q(
        [
          "Why do scientists use indicators?",
          "Kwa nini wanasayansi hutumia viashiria?",
        ],
        [
          [
            "To show if a solution is acidic, neutral or basic",
            "Kuonyesha kama myeyusho una asidi, haiegemei au una besi",
          ],
          ["To make solutions hotter", "Kupasha myeyusho joto"],
          ["To remove acids", "Kuondoa asidi"],
          ["To measure mass", "Kupima uzito"],
        ],
        0,
        [
          "Indicators give information through colour.",
          "Viashiria hutoa taarifa kupitia rangi.",
        ],
      ),
    ],
  },
  titration: {
    pre: [
      q(
        [
          "What happens when an acid reacts with an alkali?",
          "Nini hutokea asidi inapoguswa na alkali?",
        ],
        [
          [
            "They neutralise to form a salt and water",
            "Hutenguana na kutoa chumvi na maji",
          ],
          ["They explode", "Hulipuka"],
          ["Nothing happens", "Hakuna kinachotokea"],
          ["They turn into gas only", "Hugeuka gesi pekee"],
        ],
        0,
        [
          "The name of the reaction gives the answer.",
          "Jina la mmenyuko linatoa jibu.",
        ],
      ),
      q(
        [
          "Which equipment adds acid drop by drop with accurate volumes?",
          "Ni kifaa gani huongeza asidi tone kwa tone kwa ujazo sahihi?",
        ],
        [
          ["Burette", "Biureti"],
          ["Beaker", "Bika"],
          ["Funnel", "Faneli"],
          ["Test tube", "Mrija wa majaribio"],
        ],
        0,
        [
          "It has a tap and a graduated scale.",
          "Ina bomba na kipimo chenye alama.",
        ],
      ),
      q(
        [
          "What is the endpoint of a titration?",
          "Mwisho wa titreshini ni nini?",
        ],
        [
          [
            "When the indicator changes colour",
            "Kiashiria kinapobadilika rangi",
          ],
          ["When the flask is empty", "Chupa inapokuwa tupu"],
          ["When the burette is full", "Biureti inapojaa"],
          ["When the acid is hot", "Asidi inapokuwa moto"],
        ],
        0,
        ["The indicator shows you.", "Kiashiria hukuonyesha."],
      ),
      q(
        [
          "What colour is phenolphthalein in an alkali?",
          "Fenolftaleini ina rangi gani kwenye alkali?",
        ],
        [
          ["Pink", "Waridi"],
          ["Colourless", "Haina rangi"],
          ["Yellow", "Njano"],
          ["Red", "Nyekundu"],
        ],
        0,
        [
          "It loses its colour when the alkali is used up.",
          "Hupoteza rangi alkali inapoisha.",
        ],
      ),
    ],
    post: [
      q(
        [
          "25.0 mL of NaOH needs 20.0 mL of 0.100 mol/L HCl. What is the NaOH concentration?",
          "mL 25.0 za NaOH zinahitaji mL 20.0 za HCl ya 0.100 mol/L. Uzito wa NaOH ni upi?",
        ],
        [
          ["0.080 mol/L", "0.080 mol/L"],
          ["0.125 mol/L", "0.125 mol/L"],
          ["0.020 mol/L", "0.020 mol/L"],
          ["0.100 mol/L", "0.100 mol/L"],
        ],
        0,
        ["Use 0.100 × 20.0 ÷ 25.0.", "Tumia 0.100 × 20.0 ÷ 25.0."],
      ),
      q(
        [
          "Why is a rough titration done first?",
          "Kwa nini titreshini ya makadirio hufanywa kwanza?",
        ],
        [
          [
            "To estimate the volume so you can go drop by drop near the endpoint",
            "Kukadiria ujazo ili uongeze tone kwa tone karibu na mwisho",
          ],
          ["To waste less acid", "Kupoteza asidi kidogo"],
          ["To warm the flask", "Kupasha chupa joto"],
          ["To clean the burette", "Kusafisha biureti"],
        ],
        0,
        [
          "It tells you where to slow down.",
          "Inakuonyesha mahali pa kupunguza kasi.",
        ],
      ),
      q(
        [
          "Why repeat until two titres are within 0.1 mL?",
          "Kwa nini kurudia hadi titre mbili ziwe na tofauti ya chini ya mL 0.1?",
        ],
        [
          [
            "To be confident the result is accurate",
            "Kuwa na uhakika matokeo ni sahihi",
          ],
          ["To use up the acid", "Kumaliza asidi"],
          [
            "Because the first is always wrong",
            "Kwa sababu ya kwanza huwa mbaya",
          ],
          ["To change the indicator", "Kubadilisha kiashiria"],
        ],
        0,
        [
          "Consistent results are reliable results.",
          "Matokeo thabiti ni ya kuaminika.",
        ],
      ),
      q(
        [
          "What is the pH at the equivalence point of HCl and NaOH?",
          "pH kwenye kiwango cha usawa cha HCl na NaOH ni ipi?",
        ],
        [
          ["7", "7"],
          ["1", "1"],
          ["13", "13"],
          ["0", "0"],
        ],
        0,
        [
          "Both reactants are used up exactly.",
          "Vitendanishi vyote vimeisha kikamilifu.",
        ],
      ),
    ],
  },
  separation: {
    pre: [
      q(
        [
          "Which property lets a magnet remove iron from a mixture?",
          "Ni sifa ipi huruhusu sumaku kuondoa chuma kwenye mchanganyiko?",
        ],
        [
          ["Iron is magnetic", "Chuma kina sumaku"],
          ["Iron is heavy", "Chuma ni kizito"],
          ["Iron is shiny", "Chuma kinameta"],
          ["Iron dissolves", "Chuma huyeyuka"],
        ],
        0,
        ["Magnets attract certain metals.", "Sumaku huvutia metali fulani."],
      ),
      q(
        ["Which substance dissolves in water?", "Ni dutu ipi huyeyuka majini?"],
        [
          ["Salt", "Chumvi"],
          ["Sand", "Mchanga"],
          ["Iron filings", "Vumbi la chuma"],
          ["Stones", "Mawe"],
        ],
        0,
        [
          "Think about what happens in the sea.",
          "Fikiria kinachotokea baharini.",
        ],
      ),
      q(
        ["What does filtration separate?", "Kuchuja hutenganisha nini?"],
        [
          [
            "An insoluble solid from a liquid",
            "Kigumu kisichoyeyuka kutoka kwa kimiminika",
          ],
          ["Two liquids", "Vimiminika viwili"],
          ["Two gases", "Gesi mbili"],
          [
            "A dissolved solid from water",
            "Kigumu kilichoyeyuka kutoka majini",
          ],
        ],
        0,
        [
          "The paper holds back what has not dissolved.",
          "Karatasi hushika kisichoyeyuka.",
        ],
      ),
      q(
        [
          "What is left when salt water is evaporated?",
          "Nini hubaki maji ya chumvi yanapovukizwa?",
        ],
        [
          ["Salt", "Chumvi"],
          ["Sand", "Mchanga"],
          ["Iron", "Chuma"],
          ["Nothing", "Hakuna"],
        ],
        0,
        ["Only the water escapes.", "Maji pekee hutoka."],
      ),
    ],
    post: [
      q(
        [
          "Iron has been removed. What should you do next with the sand and salt?",
          "Chuma kimeondolewa. Ufanye nini kinachofuata na mchanga na chumvi?",
        ],
        [
          ["Add water and stir", "Ongeza maji na koroga"],
          ["Evaporate straight away", "Vukiza mara moja"],
          ["Use the magnet again", "Tumia sumaku tena"],
          ["Filter while dry", "Chuja ukiwa mkavu"],
        ],
        0,
        ["Make the salt dissolve first.", "Yeyusha chumvi kwanza."],
      ),
      q(
        [
          "Why does sand stay on the filter paper?",
          "Kwa nini mchanga hubaki kwenye karatasi ya kuchuja?",
        ],
        [
          [
            "It does not dissolve and its grains are too big to pass",
            "Haiyeyuki na chembe zake ni kubwa mno kupita",
          ],
          ["It is magnetic", "Una sumaku"],
          ["It is lighter than water", "Ni mwepesi kuliko maji"],
          ["It is hot", "Ni moto"],
        ],
        0,
        ["Think about size and solubility.", "Fikiria ukubwa na uyeyukaji."],
      ),
      q(
        [
          "Which method recovers dissolved salt from water?",
          "Ni mbinu ipi hupata chumvi iliyoyeyuka kutoka majini?",
        ],
        [
          ["Evaporation", "Kuvukiza"],
          ["Filtration", "Kuchuja"],
          ["Using a magnet", "Kutumia sumaku"],
          ["Stirring", "Kukoroga"],
        ],
        0,
        [
          "Filter paper cannot hold back dissolved salt.",
          "Karatasi ya kuchuja haiwezi kushika chumvi iliyoyeyuka.",
        ],
      ),
      q(
        [
          "Why does evaporation leave the salt behind?",
          "Kwa nini kuvukiza huacha chumvi?",
        ],
        [
          [
            "Water turns to vapour but salt does not",
            "Maji hugeuka mvuke lakini chumvi haigeuki",
          ],
          ["Salt is magnetic", "Chumvi ina sumaku"],
          ["Salt is heavier than sand", "Chumvi ni nzito kuliko mchanga"],
          ["Salt melts first", "Chumvi huyeyuka kwanza"],
        ],
        0,
        [
          "Compare how easily water and salt turn to gas.",
          "Linganisha jinsi maji na chumvi zinavyogeuka gesi.",
        ],
      ),
    ],
  },
};

export type Phase = "pre" | "post";

export function getQuestions(labId: string, phase: Phase) {
  return assessments[labId]?.[phase] ?? null;
}

export function hasAssessment(labId: string) {
  return labId in assessments;
}
