import type { Outcome, PartSpec } from "../../workbench.types";
import type { sectionKinds } from "../kinds";
import {
  choice,
  clamp,
  fixed,
  issue,
  measure,
  readout,
  slider,
  t,
  task,
  toggle,
} from "./helpers";

type OpticsKind = (typeof sectionKinds.optics)[number];

const DEGREES = Math.PI / 180;

const hintToggle = toggle(
  "hint",
  ["Reading help", "Msaada wa kusoma"],
  ["Shown", "Imeonyeshwa"],
  ["Hidden", "Imefichwa"],
);

const focalLengths: [string, string][] = [
  ["f = 10 cm", "f = 10 cm"],
  ["f = 15 cm", "f = 15 cm"],
  ["f = 20 cm", "f = 20 cm"],
];
const focalValues = [10, 15, 20];

/** Image of a real object by a thin lens or mirror: positive v is a real image. */
function image(u: number, f: number) {
  const atFocus = Math.abs(u - f) < 0.05;
  const v = atFocus ? Infinity : (u * f) / (u - f);
  return { v, magnification: atFocus ? Infinity : -v / u, atFocus };
}

function describeImage(v: number, magnification: number, atFocus: boolean) {
  if (atFocus) return "Image at infinity";
  const size =
    Math.abs(magnification) > 1.02
      ? "magnified"
      : Math.abs(magnification) < 0.98
        ? "diminished"
        : "same size";
  return `${v > 0 ? "Real, inverted" : "Virtual, upright"}, ${size}`;
}

function curvedAnalysis(
  u: number,
  f: number,
  unit: "mirror" | "lens",
  hint: boolean,
): Outcome {
  const { v, magnification, atFocus } = image(u, f);
  const nature = describeImage(v, magnification, atFocus);
  return {
    visual: { u, f, v: atFocus ? 1e3 : v, m: atFocus ? 0 : magnification },
    readouts: [
      readout(["Image", "Taswira"], nature),
      ...(hint && !atFocus
        ? [
            readout(
              ["Image distance v", "Umbali wa taswira v"],
              `${fixed(Math.abs(v), 1)} cm`,
            ),
            readout(
              ["Magnification", "Ukuzaji"],
              fixed(Math.abs(magnification), 2),
            ),
          ]
        : []),
    ],
    issues:
      f > 0 && Math.abs(u - 2 * f) < 0.6
        ? [
            issue("radius", "tip", [
              unit === "mirror"
                ? "The object is at the centre of curvature: image the same size, inverted, at C."
                : "The object is at 2f: image the same size, inverted, at 2f.",
              unit === "mirror"
                ? "Kitu kiko katikati ya mviringo: taswira ya ukubwa sawa, imepinduka, kwenye C."
                : "Kitu kiko 2f: taswira ya ukubwa sawa, imepinduka, kwenye 2f.",
            ]),
          ]
        : [],
    tasks: atFocus
      ? []
      : [
          task(
            `curved-${unit}-${u}-${f}`,
            ["Image distance", "Umbali wa taswira"],
            "cm",
            Math.abs(v),
            Math.max(0.6, Math.abs(v) * 0.02),
            [
              "Use 1/f = 1/u + 1/v (real-is-positive convention).",
              "Tumia 1/f = 1/u + 1/v (halisi ni chanya).",
            ],
          ),
        ],
    measures: atFocus
      ? []
      : [
          measure("u", ["Object distance u", "Umbali wa kitu u"], "cm", u, 1),
          measure(
            "v",
            ["Image distance v", "Umbali wa taswira v"],
            "cm",
            Math.abs(v),
            1,
          ),
        ],
  };
}

const prismGlasses: [string, string][] = [
  ["Crown glass (n = 1.52)", "Kioo cha crown (n = 1.52)"],
  ["Flint glass (n = 1.62)", "Kioo cha flint (n = 1.62)"],
];
const prismIndices = [1.52, 1.62];

function deviation(incidence: number, n: number, apex: number) {
  const r1 = Math.asin(Math.sin(incidence * DEGREES) / n);
  const r2 = apex * DEGREES - r1;
  const s = n * Math.sin(r2);
  if (s > 1 || r2 < -1.5) return { emerges: false, deviation: 0, exit: 0 };
  const exit = Math.asin(s) / DEGREES;
  return { emerges: true, deviation: incidence + exit - apex, exit };
}

export const opticsParts: Record<OpticsKind, PartSpec> = {
  "plane-mirror": {
    name: t("Plane mirror", "Kioo bapa"),
    description: t(
      "Angle of reflection = angle of incidence. The image is as far behind the mirror as the object is in front.",
      "Pembe ya kuakisi = pembe ya kuingia. Taswira iko nyuma ya kioo umbali sawa na kitu mbele yake.",
    ),
    width: 320,
    height: 240,
    controls: [
      slider(
        "incidence",
        ["Angle of incidence", "Pembe ya kuingia"],
        0,
        80,
        1,
        40,
        "°",
      ),
      slider(
        "distance",
        ["Object distance", "Umbali wa kitu"],
        5,
        40,
        1,
        15,
        "cm",
      ),
    ],
    analyse: ({ p }) => ({
      visual: { incidence: p("incidence"), distance: p("distance") },
      readouts: [
        readout(
          ["Angle of reflection", "Pembe ya kuakisi"],
          `${p("incidence")}°`,
        ),
        readout(
          ["Image distance behind mirror", "Umbali wa taswira nyuma ya kioo"],
          `${p("distance")} cm`,
        ),
        readout(
          ["Image", "Taswira"],
          "Virtual, upright, same size, laterally inverted",
        ),
      ],
      tasks: [
        task(
          `plane-${p("incidence")}`,
          ["Angle of reflection", "Pembe ya kuakisi"],
          "°",
          p("incidence"),
          1,
          [
            "Measure both angles from the normal, not from the mirror.",
            "Pima pembe zote kutoka kwenye wima, si kioo.",
          ],
        ),
      ],
      measures: [
        measure(
          "i",
          ["Angle of incidence i", "Pembe ya kuingia i"],
          "°",
          p("incidence"),
          0,
        ),
        measure(
          "r",
          ["Angle of reflection r", "Pembe ya kuakisi r"],
          "°",
          p("incidence"),
          0,
        ),
      ],
    }),
  },
  "concave-mirror": {
    name: t("Concave mirror", "Kioo kinachokusanya"),
    description: t(
      "Converging mirror: the image depends on how far the object is from the focus and centre of curvature.",
      "Kioo kinachokusanya: taswira hutegemea umbali wa kitu kutoka kwenye kitovu na kitovu cha mviringo.",
    ),
    width: 360,
    height: 220,
    controls: [
      choice("f", ["Focal length", "Urefu wa kitovu"], focalLengths, 1),
      slider("u", ["Object distance", "Umbali wa kitu"], 5, 60, 1, 40, "cm"),
      hintToggle,
    ],
    analyse: ({ p }) =>
      curvedAnalysis(p("u"), focalValues[p("f")], "mirror", p("hint") === 1),
  },
  "convex-mirror": {
    name: t("Convex mirror", "Kioo kinachotawanya"),
    description: t(
      "Diverging mirror: always a smaller, upright, virtual image, giving a wide field of view.",
      "Kioo kinachotawanya: taswira ndogo, wima na ya kufikirika kila mara, yenye mwonekano mpana.",
    ),
    width: 360,
    height: 220,
    controls: [
      choice("f", ["Focal length", "Urefu wa kitovu"], focalLengths, 1),
      slider("u", ["Object distance", "Umbali wa kitu"], 5, 60, 1, 30, "cm"),
      hintToggle,
    ],
    analyse: ({ p }) =>
      curvedAnalysis(p("u"), -focalValues[p("f")], "mirror", p("hint") === 1),
  },
  "converging-lens": {
    name: t("Converging (convex) lens", "Lenzi inayokusanya"),
    description: t(
      "Brings parallel rays to a focus. A real object beyond f gives a real image; inside f a magnified virtual image.",
      "Hukusanya miale sambamba kwenye kitovu. Kitu zaidi ya f hutoa taswira halisi; ndani ya f taswira kubwa ya kufikirika.",
    ),
    width: 360,
    height: 220,
    controls: [
      choice("f", ["Focal length", "Urefu wa kitovu"], focalLengths, 1),
      slider("u", ["Object distance", "Umbali wa kitu"], 5, 60, 1, 40, "cm"),
      hintToggle,
    ],
    analyse: ({ p }) =>
      curvedAnalysis(p("u"), focalValues[p("f")], "lens", p("hint") === 1),
  },
  "diverging-lens": {
    name: t("Diverging (concave) lens", "Lenzi inayotawanya"),
    description: t(
      "Spreads parallel rays apart. Always a virtual, upright, diminished image.",
      "Hutawanya miale sambamba. Taswira ya kufikirika, wima na ndogo kila mara.",
    ),
    width: 360,
    height: 220,
    controls: [
      choice("f", ["Focal length", "Urefu wa kitovu"], focalLengths, 1),
      slider("u", ["Object distance", "Umbali wa kitu"], 5, 60, 1, 30, "cm"),
      hintToggle,
    ],
    analyse: ({ p }) =>
      curvedAnalysis(p("u"), -focalValues[p("f")], "lens", p("hint") === 1),
  },
  "lens-holder": {
    name: t("Lens holder", "Kishikio cha lenzi"),
    description: t(
      "Keeps a lens upright. The centres of the lens, object and screen must all be at the same height.",
      "Hushikilia lenzi wima. Vitovu vya lenzi, kitu na skrini lazima viwe kwenye urefu sawa.",
    ),
    width: 140,
    height: 170,
    controls: [
      slider(
        "height",
        ["Lens centre height error", "Kosa la urefu wa kitovu cha lenzi"],
        -20,
        20,
        1,
        8,
        "mm",
      ),
    ],
    analyse: ({ p }) => {
      const aligned = Math.abs(p("height")) <= 3;
      return {
        visual: { height: p("height") },
        readouts: [
          readout(
            ["Alignment", "Mpangilio"],
            aligned ? "On the axis" : "Off the axis",
            aligned ? "ok" : "warn",
          ),
        ],
        issues: aligned
          ? []
          : [
              issue("axis", "warn", [
                "The lens is not on the principal axis, so the image is distorted. Adjust the holder.",
                "Lenzi haiko kwenye mhimili mkuu, kwa hiyo taswira imepotoka. Rekebisha kishikio.",
              ]),
            ],
      };
    },
  },
  "glass-block": {
    name: t("Glass block", "Kipande cha kioo"),
    description: t(
      "Light bends towards the normal entering and away leaving. The ray comes out parallel but shifted sideways.",
      "Mwanga hupinda kuelekea wima ukiingia na mbali ukitoka. Mwale hutoka sambamba lakini umehama upande.",
    ),
    width: 360,
    height: 240,
    controls: [
      choice(
        "material",
        ["Material", "Kitu"],
        [
          ["Glass (n = 1.50)", "Kioo (n = 1.50)"],
          ["Perspex (n = 1.49)", "Perspeksi (n = 1.49)"],
          ["Water (n = 1.33)", "Maji (n = 1.33)"],
        ],
      ),
      slider(
        "incidence",
        ["Angle of incidence", "Pembe ya kuingia"],
        0,
        85,
        1,
        45,
        "°",
      ),
      hintToggle,
    ],
    analyse: ({ p }) => {
      const n = [1.5, 1.49, 1.33][p("material")];
      const i = p("incidence") * DEGREES;
      const r = Math.asin(Math.sin(i) / n);
      const shift = (6 * Math.sin(i - r)) / Math.cos(r);
      return {
        visual: { incidence: p("incidence"), refraction: r / DEGREES, shift },
        readouts:
          p("hint") === 1
            ? [
                readout(
                  ["Angle of refraction", "Pembe ya kuvunja"],
                  `${fixed(r / DEGREES, 1)}°`,
                ),
                readout(
                  ["Lateral shift", "Kuhama upande"],
                  `${fixed(shift, 2)} cm`,
                ),
              ]
            : [],
        tasks:
          p("incidence") > 0
            ? [
                task(
                  `block-${p("material")}-${p("incidence")}`,
                  ["Angle of refraction", "Pembe ya kuvunja"],
                  "°",
                  r / DEGREES,
                  1,
                  [
                    "Measure from the normal. Then n = sin i ÷ sin r.",
                    "Pima kutoka wima. Kisha n = sin i ÷ sin r.",
                  ],
                ),
              ]
            : [],
        measures: [
          measure("i", ["Angle i", "Pembe i"], "°", p("incidence"), 0),
          measure("r", ["Angle r", "Pembe r"], "°", r / DEGREES, 1),
          measure("sini", ["sin i", "sin i"], "", Math.sin(i), 3),
          measure("sinr", ["sin r", "sin r"], "", Math.sin(r), 3),
        ],
      };
    },
  },
  "glass-prism": {
    name: t("Glass prism", "Prizimu ya kioo"),
    description: t(
      "A 60° prism bends light twice and splits white light into colours. Deviation is smallest when the ray passes symmetrically.",
      "Prizimu ya 60° hupinda mwanga mara mbili na kugawanya mwanga mweupe kuwa rangi. Mpindo ni mdogo zaidi mwale ukipita ulinganifu.",
    ),
    width: 360,
    height: 260,
    controls: [
      choice("glass", ["Glass", "Kioo"], prismGlasses),
      slider(
        "incidence",
        ["Angle of incidence", "Pembe ya kuingia"],
        20,
        85,
        1,
        50,
        "°",
      ),
      toggle(
        "white",
        ["Light", "Mwanga"],
        ["White (splits)", "Mweupe (hugawanyika)"],
        ["Single colour", "Rangi moja"],
        1,
      ),
    ],
    analyse: ({ p }) => {
      const n = prismIndices[p("glass")];
      const middle = deviation(p("incidence"), n, 60);
      const red = deviation(p("incidence"), n - 0.01, 60);
      const violet = deviation(p("incidence"), n + 0.02, 60);
      const spread =
        red.emerges && violet.emerges ? violet.deviation - red.deviation : 0;
      return {
        visual: {
          incidence: p("incidence"),
          deviation: middle.deviation,
          exit: middle.exit,
          emerges: middle.emerges ? 1 : 0,
          spread: p("white") === 1 ? spread : 0,
        },
        readouts: [
          readout(
            ["Angle of deviation", "Pembe ya mpindo"],
            middle.emerges
              ? `${fixed(middle.deviation, 1)}°`
              : "Total internal reflection",
            middle.emerges ? undefined : "warn",
          ),
          ...(p("white") === 1 && spread > 0
            ? [
                readout(
                  [
                    "Violet bends more than red by",
                    "Zambarau hupinda zaidi ya nyekundu kwa",
                  ],
                  `${fixed(spread, 1)}°`,
                ),
              ]
            : []),
        ],
        issues: middle.emerges
          ? []
          : [
              issue("tir", "tip", [
                "The ray hits the second face beyond the critical angle and reflects inside the prism.",
                "Mwale unagonga uso wa pili zaidi ya pembe muhimu na kuakisi ndani ya prizimu.",
              ]),
            ],
        tasks: middle.emerges
          ? [
              task(
                `prism-${p("glass")}-${p("incidence")}`,
                ["Angle of deviation", "Pembe ya mpindo"],
                "°",
                middle.deviation,
                1.5,
                [
                  "D = i + e − A, where e is the angle the ray leaves the prism.",
                  "D = i + e − A, ambapo e ni pembe mwale unapotoka kwenye prizimu.",
                ],
              ),
            ]
          : [],
        measures: middle.emerges
          ? [
              measure("i", ["Angle i", "Pembe i"], "°", p("incidence"), 0),
              measure(
                "d",
                ["Deviation D", "Mpindo D"],
                "°",
                middle.deviation,
                1,
              ),
            ]
          : [],
      };
    },
  },
  "ray-box": {
    name: t("Ray box", "Kisanduku cha miale"),
    description: t(
      "A lamp behind slits makes thin rays of light for tracing reflection and refraction.",
      "Taa nyuma ya mianya hutengeneza miale myembamba ya kufuatilia kuakisi na kuvunja.",
    ),
    width: 200,
    height: 130,
    controls: [
      toggle(
        "lamp",
        ["Lamp", "Taa"],
        ["On", "Imewashwa"],
        ["Off", "Imezimwa"],
        1,
      ),
      choice(
        "rays",
        ["Slits", "Mianya"],
        [
          ["One ray", "Mwale mmoja"],
          ["Three rays", "Miale mitatu"],
        ],
      ),
      choice(
        "colour",
        ["Filter", "Kichujio"],
        [
          ["White", "Nyeupe"],
          ["Red", "Nyekundu"],
          ["Green", "Kijani"],
          ["Blue", "Buluu"],
        ],
      ),
    ],
    analyse: ({ p }) => ({
      visual: { lamp: p("lamp"), rays: p("rays"), colour: p("colour") },
      readouts: [
        readout(
          ["Wavelength", "Urefu wa wimbi"],
          ["400–700 nm (all)", "≈ 700 nm", "≈ 550 nm", "≈ 450 nm"][p("colour")],
        ),
      ],
      issues: [
        issue("trace", "tip", [
          "Use one thin ray for tracing; mark it with two pins or two dots well apart.",
          "Tumia mwale mmoja mwembamba kufuatilia; uweke alama kwa pini mbili au nukta mbili zilizo mbali.",
        ]),
      ],
    }),
  },
  pins: {
    name: t("Pins", "Pini"),
    description: t(
      "Used to mark where a ray goes. Sight along two pins to find the line of the ray.",
      "Hutumika kuweka alama mahali mwale unapopita. Tazama kupitia pini mbili kupata mstari wa mwale.",
    ),
    width: 190,
    height: 130,
    controls: [
      slider(
        "spacing",
        ["Gap between pins", "Pengo kati ya pini"],
        2,
        10,
        1,
        3,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const accuracy = Math.atan(0.05 / p("spacing")) / DEGREES;
      return {
        visual: { spacing: p("spacing") },
        readouts: [
          readout(
            ["Direction accuracy", "Usahihi wa mwelekeo"],
            `± ${fixed(accuracy, 1)}°`,
            accuracy > 1 ? "warn" : "ok",
          ),
        ],
        issues:
          accuracy > 1
            ? [
                issue("wide", "tip", [
                  "Pins close together give a poorly defined line. Space them at least 6 cm apart.",
                  "Pini zilizo karibu hutoa mstari usioeleweka. Zipange angalau sentimita 6 kutoka kwa nyingine.",
                ]),
              ]
            : [],
      };
    },
  },
  "drawing-board": {
    name: t("Drawing board", "Ubao wa kuchorea"),
    description: t(
      "Holds the paper flat for ray tracing. Pin the paper down or it will slip.",
      "Hushikilia karatasi tambarare kwa kufuatilia miale. Ibane karatasi la sivyo itateleza.",
    ),
    width: 300,
    height: 210,
    controls: [
      toggle(
        "paper",
        ["White paper", "Karatasi nyeupe"],
        ["Pinned down", "Imebanwa"],
        ["Loose", "Haijabanwa"],
        1,
      ),
    ],
    analyse: ({ p }) => ({
      visual: { paper: p("paper") },
      readouts: [
        readout(
          ["Paper", "Karatasi"],
          p("paper") === 1 ? "Secure" : "May slip",
          p("paper") === 1 ? "ok" : "warn",
        ),
      ],
      issues:
        p("paper") === 0
          ? [
              issue("slip", "warn", [
                "Loose paper moves while you work, spoiling the traced lines. Fix it with drawing pins.",
                "Karatasi isiyobanwa husogea ukifanya kazi na kuharibu mistari. Ibane kwa pini za kuchorea.",
              ]),
            ]
          : [],
    }),
  },
  screen: {
    name: t("Screen", "Skrini"),
    description: t(
      "A white card on which a real image can be caught. A virtual image cannot be shown on a screen.",
      "Kadi nyeupe ambayo taswira halisi inaweza kunaswa. Taswira ya kufikirika haionekani kwenye skrini.",
    ),
    width: 140,
    height: 220,
    controls: [
      choice(
        "surface",
        ["Surface", "Uso"],
        [
          ["White card", "Kadi nyeupe"],
          ["Black card", "Kadi nyeusi"],
        ],
      ),
    ],
    analyse: ({ p }) => ({
      visual: { surface: p("surface") },
      readouts: [
        readout(
          ["Light reflected", "Mwanga unaoakisiwa"],
          p("surface") === 0 ? "≈ 85 %" : "≈ 5 %",
        ),
      ],
      issues:
        p("surface") === 1
          ? [
              issue("black", "tip", [
                "Black absorbs most light, so an image on it is hard to see. Use white card.",
                "Nyeusi hufyonza mwanga mwingi, kwa hiyo taswira juu yake ni vigumu kuona. Tumia kadi nyeupe.",
              ]),
            ]
          : [],
    }),
  },
  "optical-bench": {
    name: t("Optical bench", "Benchi ya macho"),
    description: t(
      "A lit object, a lens and a screen on a metre scale. Slide the screen until the image is sharp, then 1/f = 1/u + 1/v.",
      "Kitu chenye mwanga, lenzi na skrini kwenye kipimo cha mita. Sogeza skrini hadi taswira iwe wazi, kisha 1/f = 1/u + 1/v.",
    ),
    width: 700,
    height: 200,
    controls: [
      choice("f", ["Lens", "Lenzi"], focalLengths, 1),
      slider("u", ["Object to lens", "Kitu hadi lenzi"], 18, 70, 1, 40, "cm"),
      slider(
        "screen",
        ["Lens to screen", "Lenzi hadi skrini"],
        10,
        100,
        0.5,
        30,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const f = focalValues[p("f")];
      const { v, magnification } = image(p("u"), f);
      const miss = Math.abs(p("screen") - v);
      const sharpness = clamp(1 - miss / (0.12 * v + 1.5), 0, 1);
      const sharp = sharpness > 0.9;
      return {
        visual: {
          f,
          u: p("u"),
          screen: p("screen"),
          v,
          sharpness,
          m: magnification,
        },
        readouts: [
          readout(
            ["Image on the screen", "Taswira kwenye skrini"],
            sharp ? "Sharp" : sharpness > 0.4 ? "Slightly blurred" : "Blurred",
            sharp ? "ok" : "warn",
          ),
          readout(
            ["Size of the image", "Ukubwa wa taswira"],
            `${fixed(Math.abs(magnification), 2)} × object`,
          ),
        ],
        issues: sharp
          ? []
          : [
              issue("focus", "tip", [
                "Slide the screen slowly backwards and forwards until the image is as sharp as you can make it.",
                "Sogeza skrini polepole mbele na nyuma hadi taswira iwe wazi kadri iwezekanavyo.",
              ]),
            ],
        tasks: sharp
          ? [
              task(
                `bench-${p("f")}-${p("u")}-${p("screen")}`,
                ["Focal length of the lens", "Urefu wa kitovu wa lenzi"],
                "cm",
                f,
                0.8,
                [
                  "1/f = 1/u + 1/v, or f = uv ÷ (u + v).",
                  "1/f = 1/u + 1/v, au f = uv ÷ (u + v).",
                ],
              ),
            ]
          : [],
        measures: [
          measure(
            "u",
            ["Object distance u", "Umbali wa kitu u"],
            "cm",
            p("u"),
            1,
          ),
          measure(
            "v",
            ["Image distance v", "Umbali wa taswira v"],
            "cm",
            p("screen"),
            1,
          ),
          measure(
            "f",
            ["uv/(u+v)", "uv/(u+v)"],
            "cm",
            (p("u") * p("screen")) / (p("u") + p("screen")),
            1,
          ),
        ],
      };
    },
  },
  "pinhole-camera": {
    name: t("Pinhole camera", "Kamera ya tundu"),
    description: t(
      "Light travels in straight lines, so a tiny hole forms an inverted image. A bigger hole is brighter but blurrier.",
      "Mwanga husafiri kwa mistari iliyonyooka, kwa hiyo tundu dogo hutoa taswira iliyopinduka. Tundu kubwa ni angavu lakini si wazi.",
    ),
    width: 380,
    height: 190,
    controls: [
      slider(
        "object",
        ["Height of object", "Urefu wa kitu"],
        10,
        100,
        5,
        50,
        "cm",
      ),
      slider(
        "distance",
        ["Object to pinhole", "Kitu hadi tundu"],
        20,
        200,
        5,
        100,
        "cm",
      ),
      slider(
        "box",
        ["Pinhole to screen", "Tundu hadi skrini"],
        10,
        40,
        1,
        20,
        "cm",
      ),
      slider(
        "hole",
        ["Size of pinhole", "Ukubwa wa tundu"],
        0.5,
        5,
        0.5,
        1,
        "mm",
      ),
    ],
    analyse: ({ p }) => {
      const height = (p("object") * p("box")) / p("distance");
      const blur = p("hole") * (1 + p("box") / p("distance")) * 0.1;
      return {
        visual: { height, blur, hole: p("hole") },
        readouts: [
          readout(
            ["Image height", "Urefu wa taswira"],
            `${fixed(height, 1)} cm, inverted`,
          ),
          readout(
            ["Blur", "Ukungu"],
            `${fixed(blur, 2)} cm`,
            blur > 0.4 ? "warn" : "ok",
          ),
          readout(
            ["Brightness", "Mwangaza"],
            `${fixed(p("hole") ** 2 * 100, 0)} %`,
          ),
        ],
        tasks: [
          task(
            `pinhole-${p("object")}-${p("distance")}-${p("box")}`,
            ["Height of the image", "Urefu wa taswira"],
            "cm",
            height,
            0.3,
            [
              "Similar triangles: image height ÷ object height = screen distance ÷ object distance.",
              "Pembetatu zinazofanana: urefu wa taswira ÷ urefu wa kitu = umbali wa skrini ÷ umbali wa kitu.",
            ],
          ),
        ],
        measures: [
          measure(
            "distance",
            ["Object distance", "Umbali wa kitu"],
            "cm",
            p("distance"),
            0,
          ),
          measure(
            "height",
            ["Image height", "Urefu wa taswira"],
            "cm",
            height,
            1,
          ),
        ],
      };
    },
  },
  "light-source": {
    name: t(
      "Light source (bulb / candle)",
      "Chanzo cha mwanga (balbu / mshumaa)",
    ),
    description: t(
      "Brightness on a surface falls with the square of the distance: E = I ÷ d².",
      "Mwangaza kwenye uso hupungua kwa mraba wa umbali: E = I ÷ d².",
    ),
    width: 140,
    height: 230,
    controls: [
      choice(
        "type",
        ["Source", "Chanzo"],
        [
          ["Candle (1 cd)", "Mshumaa (1 cd)"],
          ["Lamp (25 cd)", "Taa (25 cd)"],
        ],
      ),
      slider(
        "distance",
        ["Distance to a screen", "Umbali hadi skrini"],
        10,
        200,
        5,
        50,
        "cm",
      ),
    ],
    analyse: ({ p }) => {
      const intensity = [1, 25][p("type")];
      const lux = intensity / (p("distance") / 100) ** 2;
      return {
        visual: { type: p("type") },
        readouts: [
          readout(
            ["Illuminance on the screen", "Mwangaza kwenye skrini"],
            `${fixed(lux, 1)} lx`,
          ),
        ],
        tasks: [
          task(
            `light-${p("type")}-${p("distance")}`,
            ["Illuminance on the screen", "Mwangaza kwenye skrini"],
            "lx",
            lux,
            Math.max(0.5, lux * 0.02),
            ["E = I ÷ d², with d in metres.", "E = I ÷ d², d kwa mita."],
          ),
        ],
        measures: [
          measure("d", ["Distance", "Umbali"], "cm", p("distance"), 0),
          measure("lux", ["Illuminance", "Mwangaza"], "lx", lux, 1),
          measure(
            "inverse",
            ["1/d²", "1/d²"],
            "1/m²",
            1 / (p("distance") / 100) ** 2,
            2,
          ),
        ],
      };
    },
  },
};
