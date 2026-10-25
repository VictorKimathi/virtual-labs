import type { LiquidView } from "../../chemistry-bench/chemistry.types";
import type { LocalizedText } from "../../workbench/workbench.types";
import type { TubeContents } from "../biology.types";

export const substances = [
  "glucose",
  "sucrose",
  "starch",
  "protein",
  "lipid",
  "vitaminC",
  "benedicts",
  "reduced",
  "iodine",
  "biuret",
  "sudan",
  "ethanol",
  "dcpip",
  "acid",
  "alkali",
  "amylase",
  "catalase",
  "pepsin",
  "peroxide",
] as const;

export type Substance = (typeof substances)[number];

export const ROOM = 22;

const t = (en: string, sw: string): LocalizedText => ({ en, sw });

export function emptyTube(): TubeContents {
  return {
    volume: 0,
    items: {},
    at: 0,
    hot: 0,
    denatured: false,
    stopped: false,
    foam: 0,
    notes: [],
  };
}

export const amount = (c: TubeContents, id: Substance) => c.items[id] ?? 0;

/** One millilitre of Benedict's solution reacts with about 2 mg of reducing sugar. */
const BENEDICT_CAPACITY = 2;
/** One millilitre of DCPIP is decolourised by 0.5 mg of vitamin C. */
const DCPIP_CAPACITY = 0.5;

export type FoodSample = {
  name: LocalizedText;
  /** Milligrams of each nutrient in 1 mL. */
  per: Partial<Record<Substance, number>>;
  colour: [number, number, number, number];
};

export const foodSamples: FoodSample[] = [
  {
    name: t("Glucose solution", "Myeyusho wa glukosi"),
    per: { glucose: 10 },
    colour: [230, 240, 250, 0.3],
  },
  {
    name: t("Starch suspension", "Mchanganyiko wa wanga"),
    per: { starch: 10 },
    colour: [240, 240, 235, 0.55],
  },
  {
    name: t("Egg albumen", "Ute wa yai"),
    per: { protein: 50 },
    colour: [245, 240, 220, 0.7],
  },
  {
    name: t("Cooking oil", "Mafuta ya kupikia"),
    per: { lipid: 900 },
    colour: [235, 200, 80, 0.8],
  },
  {
    name: t("Sucrose solution", "Myeyusho wa sukrosi"),
    per: { sucrose: 10 },
    colour: [230, 240, 250, 0.3],
  },
  {
    name: t("Milk", "Maziwa"),
    per: { glucose: 5, protein: 33, lipid: 35 },
    colour: [250, 250, 245, 0.95],
  },
  {
    name: t("Orange juice", "Juisi ya machungwa"),
    per: { glucose: 20, sucrose: 30, vitaminC: 0.5 },
    colour: [245, 160, 40, 0.8],
  },
  {
    name: t("Vitamin C standard (1 mg/mL)", "Kiwango cha vitamini C (mg 1/mL)"),
    per: { vitaminC: 1 },
    colour: [235, 240, 245, 0.3],
  },
  {
    name: t("Distilled water", "Maji yaliyosafishwa"),
    per: {},
    colour: [220, 235, 245, 0.3],
  },
  {
    name: t("Unknown food X", "Chakula kisichojulikana X"),
    per: {},
    colour: [235, 225, 205, 0.6],
  },
];

/** The hidden make-up of "Unknown food X": different for every bottle. */
export function unknownFood(seed: number): Partial<Record<Substance, number>> {
  const mixes: Partial<Record<Substance, number>>[] = [
    { starch: 8, protein: 20 },
    { glucose: 10, lipid: 40 },
    { sucrose: 10, protein: 15 },
    { starch: 6, glucose: 6 },
    { protein: 30, lipid: 60 },
  ];
  return mixes[Math.abs(seed) % mixes.length];
}

export type Ingredient = {
  volume: number;
  items: Partial<Record<Substance, number>>;
};

export function addTo(c: TubeContents, ingredient: Ingredient): TubeContents {
  const items = { ...c.items };
  for (const id of Object.keys(ingredient.items) as Substance[])
    items[id] = (items[id] ?? 0) + (ingredient.items[id] ?? 0);
  const stopped = c.stopped || (ingredient.items.iodine ?? 0) > 0;
  return { ...c, volume: c.volume + ingredient.volume, items, stopped };
}

/** Takes a fraction of the contents out, for pouring into another tube. */
export function splitTube(
  c: TubeContents,
  fraction: number,
): { taken: TubeContents; left: TubeContents } {
  const f = Math.max(0, Math.min(1, fraction));
  const taken: Partial<Record<Substance, number>> = {};
  const left: Partial<Record<Substance, number>> = {};
  for (const id of Object.keys(c.items) as Substance[]) {
    taken[id] = (c.items[id] ?? 0) * f;
    left[id] = (c.items[id] ?? 0) * (1 - f);
  }
  return {
    taken: { ...c, volume: c.volume * f, items: taken, foam: 0, notes: [] },
    left: {
      ...c,
      volume: c.volume * (1 - f),
      items: left,
      foam: f >= 1 ? 0 : c.foam,
    },
  };
}

export function phOfTube(c: TubeContents) {
  const acid = amount(c, "acid");
  const alkali = amount(c, "alkali");
  if (acid > alkali + 0.01) return 2;
  if (alkali > acid + 0.01) return 8.5;
  return 7;
}

/** How fast an enzyme works at a temperature, from 0 to 1: best near 37 °C, destroyed above 60 °C. */
export function temperatureFactor(celsius: number, denatured: boolean) {
  if (denatured || celsius >= 65) return 0;
  const rising = Math.pow(2, (celsius - 37) / 10);
  const falling = celsius > 45 ? Math.max(0, 1 - (celsius - 45) / 20) : 1;
  return Math.max(0, Math.min(1, rising) * falling);
}

const phFactor = (ph: number, best: number) =>
  Math.exp(-((ph - best) ** 2) / 4);

/** Brings the contents up to a bench time at a steady temperature: enzymes, heating tests and hydrolysis. */
export function advanceTube(
  c: TubeContents,
  to: number,
  celsius: number,
): TubeContents {
  const dt = Math.max(0, to - c.at);
  if (dt <= 0 || c.volume <= 0) return { ...c, at: Math.max(c.at, to) };
  const items = { ...c.items };
  const get = (id: Substance) => items[id] ?? 0;
  const ph = phOfTube(c);
  const hotSeconds = celsius >= 80 ? dt : 0;
  const denatured = c.denatured || (celsius >= 65 && dt >= 30);
  const working = temperatureFactor(celsius, denatured);

  if (get("amylase") > 0 && get("starch") > 0 && !c.stopped) {
    const k = 0.01 * get("amylase") * working * phFactor(ph, 7);
    const digested = get("starch") * (1 - Math.exp(-k * dt));
    items.starch = get("starch") - digested;
    items.glucose = get("glucose") + digested;
  }
  if (get("pepsin") > 0 && get("protein") > 0) {
    const k = 0.004 * get("pepsin") * working * phFactor(ph, 2);
    items.protein = get("protein") * Math.exp(-k * dt);
  }
  let foam = c.foam;
  if (get("catalase") > 0 && get("peroxide") > 0) {
    const k = 0.05 * get("catalase") * working;
    const used = get("peroxide") * (1 - Math.exp(-k * dt));
    items.peroxide = get("peroxide") - used;
    foam = Math.min(120, foam + used * 12);
  }
  if (get("sucrose") > 0 && ph < 4 && celsius >= 80) {
    const split = get("sucrose") * (1 - Math.exp(-dt / 90));
    items.sucrose = get("sucrose") - split;
    items.glucose = get("glucose") + split;
  }
  if (get("benedicts") > 0 && celsius >= 80 && ph >= 6) {
    const room = get("benedicts") * BENEDICT_CAPACITY - get("reduced");
    const react =
      Math.max(0, Math.min(room, get("glucose"))) * (1 - Math.exp(-dt / 45));
    items.reduced = get("reduced") + react;
    items.glucose = get("glucose") - react;
  }
  return { ...c, items, at: to, hot: c.hot + hotSeconds, denatured, foam };
}

type Rgba = [number, number, number, number];
const css = ([r, g, b, a]: Rgba) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
const mixColour = (a: Rgba, b: Rgba, f: number): Rgba => [
  a[0] + (b[0] - a[0]) * f,
  a[1] + (b[1] - a[1]) * f,
  a[2] + (b[2] - a[2]) * f,
  a[3] + (b[3] - a[3]) * f,
];

const benedictStops: [number, Rgba][] = [
  [0, [40, 110, 230, 0.8]],
  [0.12, [60, 160, 90, 0.85]],
  [0.3, [220, 200, 40, 0.9]],
  [0.55, [235, 130, 30, 0.92]],
  [1, [175, 55, 30, 0.95]],
];

function along(stops: [number, Rgba][], x: number): Rgba {
  if (x <= stops[0][0]) return stops[0][1];
  for (let index = 1; index < stops.length; index++) {
    const [x1, c1] = stops[index];
    const [x0, c0] = stops[index - 1];
    if (x <= x1) return mixColour(c0, c1, (x - x0) / (x1 - x0));
  }
  return stops[stops.length - 1][1];
}

export type TubeLook = {
  liquid: LiquidView;
  observations: LocalizedText[];
  result: string;
};

/** The colour and look of the contents, and what the student sees. */
export function tubeLook(
  c: TubeContents,
  capacity: number,
  celsius: number,
  base: Rgba = [220, 235, 245, 0.3],
): TubeLook {
  const get = (id: Substance) => amount(c, id);
  const seen: LocalizedText[] = [];
  let colour: Rgba = base;
  let cloudy = 0;
  let oil = 0;
  let result = "";
  const deposit: LiquidView["deposit"] = [];
  if (get("protein") > 5 && get("biuret") === 0)
    cloudy = Math.min(0.6, get("protein") / 400);

  if (get("dcpip") > 0) {
    const left = Math.max(0, get("dcpip") - get("vitaminC") / DCPIP_CAPACITY);
    const blue = left / get("dcpip");
    colour = mixColour(base, [40, 70, 200, 0.85], blue);
    if (blue < 0.05) {
      seen.push(
        t(
          "The blue DCPIP has turned colourless: vitamin C is present.",
          "DCPIP ya buluu imekuwa bila rangi: vitamini C ipo.",
        ),
      );
      result = "dcpip-clear";
    } else seen.push(t("The DCPIP is still blue.", "DCPIP bado ni ya buluu."));
  }
  if (get("biuret") > 0) {
    const purple = get("protein") > 1;
    colour = purple ? [125, 60, 170, 0.85] : [70, 120, 220, 0.65];
    seen.push(
      purple
        ? t(
            "The solution turns purple: protein is present.",
            "Myeyusho unakuwa zambarau: protini ipo.",
          )
        : t(
            "The solution stays blue: no protein.",
            "Myeyusho unabaki buluu: hakuna protini.",
          ),
    );
    result = purple ? "protein" : "no-protein";
  }
  if (get("benedicts") > 0) {
    const fraction = get("reduced") / (get("benedicts") * BENEDICT_CAPACITY);
    colour = along(benedictStops, fraction);
    if (fraction > 0.3)
      deposit.push({
        colour: css([175, 55, 30, 0.95]),
        amount: Math.min(1, fraction) * 0.5,
      });
    if (c.hot < 1)
      seen.push(
        t(
          "Benedict's solution is blue. It must be heated in a boiling water bath to work.",
          "Myeyusho wa Benedict ni wa buluu. Lazima upashwe kwenye bafu ya maji yanayochemka ufanye kazi.",
        ),
      );
    else if (fraction < 0.05)
      seen.push(
        t(
          "After heating it stays blue: no reducing sugar.",
          "Baada ya kupasha inabaki buluu: hakuna sukari inayopunguza.",
        ),
      );
    else
      seen.push(
        fraction > 0.55
          ? t(
              "An orange to brick-red precipitate forms: a lot of reducing sugar.",
              "Mashapo ya machungwa hadi mekundu ya tofali yanatokea: sukari nyingi inayopunguza.",
            )
          : fraction > 0.25
            ? t(
                "It turns yellow: some reducing sugar.",
                "Inakuwa ya njano: sukari kiasi inayopunguza.",
              )
            : t(
                "It turns green: a trace of reducing sugar.",
                "Inakuwa ya kijani: sukari kidogo sana inayopunguza.",
              ),
      );
    result = fraction > 0.05 ? "reducing" : c.hot > 0 ? "no-reducing" : result;
    if (phOfTube(c) < 6 && c.hot > 0)
      seen.push(
        t(
          "The tube is acidic, so Benedict's cannot react. Neutralise with sodium hydrogen carbonate first.",
          "Mrija una asidi, kwa hiyo Benedict haiwezi kumenyuka. Neutralisha kwa sodiamu haidrojeni kaboneti kwanza.",
        ),
      );
  }
  if (get("iodine") > 0) {
    const starch = get("starch") > 0.3;
    colour = starch
      ? [20, 20, 60, 0.95]
      : mixColour(
          [200, 130, 40, 0.55],
          [150, 80, 20, 0.8],
          Math.min(1, get("iodine")),
        );
    seen.push(
      starch
        ? t(
            "The iodine turns blue-black: starch is present.",
            "Iodini inakuwa buluu-nyeusi: wanga upo.",
          )
        : t(
            "The iodine stays yellow-brown: no starch.",
            "Iodini inabaki njano-kahawia: hakuna wanga.",
          ),
    );
    result = starch ? "starch" : "no-starch";
  }
  if (get("sudan") > 0) {
    if (get("lipid") > 1) {
      oil = 0.08;
      seen.push(
        t(
          "A red-stained oily layer floats on top: lipid is present.",
          "Safu ya mafuta iliyotiwa rangi nyekundu inaelea juu: lipidi ipo.",
        ),
      );
      result = "lipid";
    } else {
      colour = mixColour(colour, [220, 60, 60, 0.6], 0.5);
      seen.push(
        t(
          "The red dye stays mixed in: no lipid.",
          "Rangi nyekundu inabaki imechanganyika: hakuna lipidi.",
        ),
      );
      result = "no-lipid";
    }
  }
  if (
    get("ethanol") > 0 &&
    get("lipid") > 1 &&
    c.volume > get("ethanol") * 1.5
  ) {
    cloudy = Math.max(cloudy, 0.85);
    seen.push(
      t(
        "A milky-white emulsion forms: lipid is present.",
        "Mchanganyiko mweupe kama maziwa unatokea: lipidi ipo.",
      ),
    );
    result = "emulsion";
  }
  if (get("catalase") > 0 && c.foam > 1)
    seen.push(
      t(
        `Oxygen froths up to about ${Math.round(c.foam)} mm.`,
        `Oksijeni inatoa povu hadi takriban mm ${Math.round(c.foam)}.`,
      ),
    );
  if (cloudy > 0) colour = mixColour(colour, [245, 245, 240, 0.95], cloudy);

  const fizzing = get("catalase") > 0 && get("peroxide") > 0.2 && !c.denatured;
  const boiling = celsius >= 98;
  return {
    liquid: {
      colour: css(colour),
      cloudy,
      deposit,
      bubbling: fizzing ? 0.8 : boiling ? 0.6 : 0,
      gas: null,
      boiling,
      level: capacity > 0 ? Math.min(1, c.volume / capacity) : 0,
      oilLevel: oil,
      temperature: celsius,
    },
    observations: [...c.notes, ...seen].slice(-5),
    result,
  };
}
