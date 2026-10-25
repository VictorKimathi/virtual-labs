const line = "stroke-slate-700 dark:stroke-slate-300";
const glass =
  "fill-sky-100/70 stroke-sky-500 dark:fill-sky-900/40 dark:stroke-sky-300";
const bench = "fill-slate-300 dark:fill-slate-700";

/** A small physics bench: a cell, a glowing bulb, a meter and a lens bending light. */
export function PhysicsScene() {
  return (
    <svg viewBox="0 0 400 220" aria-hidden="true" className="h-full w-full">
      <rect x="0" y="190" width="400" height="30" className={bench} />

      <path
        d="M40 150 V70 H200 M200 70 V150 H40"
        fill="none"
        strokeWidth="4"
        strokeLinejoin="round"
        className="stroke-blue-500 dark:stroke-blue-400"
      />
      <path
        d="M40 150 V70 H200 V150 Z"
        fill="none"
        strokeWidth="2"
        strokeDasharray="4 8"
        className="animate-current-flow stroke-white motion-reduce:animate-none"
      />

      <rect
        x="24"
        y="140"
        width="32"
        height="50"
        rx="5"
        strokeWidth="2"
        className={`fill-slate-800 ${line}`}
      />
      <rect
        x="32"
        y="134"
        width="16"
        height="8"
        rx="2"
        className="fill-red-500"
      />
      <text
        x="40"
        y="172"
        textAnchor="middle"
        fontSize="12"
        className="fill-white font-black"
      >
        +
      </text>

      <circle
        cx="120"
        cy="56"
        r="34"
        className="animate-flicker fill-yellow-300/40 motion-reduce:animate-none"
      />
      <circle
        cx="120"
        cy="56"
        r="18"
        strokeWidth="2"
        className="fill-yellow-200 stroke-yellow-600"
      />
      <path
        d="M112 60 Q120 44 128 60"
        fill="none"
        strokeWidth="2"
        className="stroke-orange-500"
      />
      <rect
        x="112"
        y="70"
        width="16"
        height="10"
        rx="2"
        className="fill-slate-500"
      />

      <rect
        x="164"
        y="120"
        width="72"
        height="70"
        rx="8"
        strokeWidth="2"
        className={`fill-white dark:fill-slate-800 ${line}`}
      />
      <path
        d="M176 160 A24 24 0 0 1 224 160"
        fill="none"
        strokeWidth="1.5"
        className={line}
      />
      <path
        d="M200 162 L214 140"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-red-500"
      />
      <text
        x="200"
        y="182"
        textAnchor="middle"
        fontSize="11"
        className="fill-slate-700 font-black dark:fill-slate-200"
      >
        V
      </text>

      <path
        d="M262 110 L312 96 M262 130 L312 130 M262 150 L312 164"
        strokeWidth="2.5"
        className="stroke-amber-500 dark:stroke-amber-300"
      />
      <path
        d="M312 96 L378 130 M312 130 L378 130 M312 164 L378 130"
        strokeWidth="2.5"
        className="stroke-amber-500 dark:stroke-amber-300"
      />
      <ellipse
        cx="312"
        cy="130"
        rx="9"
        ry="44"
        strokeWidth="2"
        className={glass}
      />
      <circle cx="378" cy="130" r="5" className="fill-amber-400" />
      <rect x="306" y="174" width="12" height="16" className="fill-slate-500" />
    </svg>
  );
}

/** A small biology bench: a microscope with onion cells in view, a petri dish and a growing seedling. */
export function BiologyScene() {
  return (
    <svg viewBox="0 0 400 220" aria-hidden="true" className="h-full w-full">
      <rect x="0" y="190" width="400" height="30" className={bench} />

      <path
        d="M40 188 H130"
        strokeWidth="8"
        strokeLinecap="round"
        className={line}
      />
      <path
        d="M112 186 V80 Q112 50 84 50"
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        className="stroke-slate-600 dark:stroke-slate-400"
      />
      <rect
        x="54"
        y="128"
        width="60"
        height="7"
        rx="2"
        className="fill-slate-700"
      />
      <rect
        x="64"
        y="40"
        width="16"
        height="64"
        rx="4"
        className="fill-slate-500"
      />
      <rect
        x="66"
        y="104"
        width="12"
        height="18"
        rx="2"
        className="fill-slate-800"
      />
      <rect
        x="65"
        y="20"
        width="14"
        height="22"
        rx="3"
        className="fill-slate-800"
      />
      <circle
        cx="72"
        cy="160"
        r="9"
        className="animate-flicker fill-yellow-200 stroke-yellow-500 motion-reduce:animate-none"
        strokeWidth="2"
      />

      <circle
        cx="200"
        cy="80"
        r="56"
        className="fill-amber-50 stroke-slate-800 dark:stroke-slate-500"
        strokeWidth="6"
      />
      {[0, 1, 2].flatMap((row) =>
        [0, 1].map((column) => (
          <g key={`${row}-${column}`}>
            <rect
              x={150 + column * 52 + (row % 2) * 26}
              y={40 + row * 28}
              width="50"
              height="26"
              className="fill-amber-100 stroke-amber-700"
              strokeWidth="2"
            />
            <circle
              cx={170 + column * 52 + (row % 2) * 26}
              cy={53 + row * 28}
              r="4"
              className="fill-amber-800"
            />
          </g>
        )),
      )}
      <circle
        cx="200"
        cy="80"
        r="56"
        fill="none"
        className="stroke-slate-800 dark:stroke-slate-500"
        strokeWidth="6"
      />

      <ellipse
        cx="200"
        cy="178"
        rx="44"
        ry="12"
        className="fill-sky-100/70 stroke-sky-500 dark:fill-sky-900/40"
        strokeWidth="2"
      />
      <ellipse cx="200" cy="178" rx="38" ry="9" className="fill-amber-100" />
      {[
        [184, 176],
        [196, 181],
        [212, 175],
        [220, 180],
        [204, 172],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.5"
          className="fill-amber-50 stroke-amber-500"
          strokeWidth="0.8"
        />
      ))}

      <rect
        x="300"
        y="160"
        width="70"
        height="30"
        rx="4"
        className="fill-amber-800/80"
      />
      <path d="M335 160 V104" strokeWidth="4" className="stroke-green-600" />
      <path
        d="M335 128 Q312 112 300 120 Q316 130 335 128 Z M335 112 Q358 96 372 104 Q356 116 335 112 Z"
        className="fill-green-500"
      />
      <path
        d="M335 160 Q328 176 322 186 M335 160 Q342 178 350 186"
        fill="none"
        strokeWidth="2"
        className="stroke-amber-100"
      />
    </svg>
  );
}

/** A human figure with the heart, lungs and brain showing. */
export function AnatomyScene() {
  return (
    <svg viewBox="0 0 400 220" aria-hidden="true" className="h-full w-full">
      <path
        d="M200 18 Q220 18 222 40 Q222 58 210 64 L236 72 Q252 78 254 98 L262 160 Q262 168 254 166 L242 106 L238 140 L240 210 H222 L214 150 H186 L178 210 H160 L162 140 L158 106 L146 166 Q138 168 138 160 L146 98 Q148 78 164 72 L190 64 Q178 58 178 40 Q180 18 200 18 Z"
        className="fill-rose-200 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500"
        strokeWidth="2"
      />
      <path
        d="M190 34 Q200 22 210 34 Q214 46 200 50 Q186 46 190 34 Z"
        className="fill-pink-300"
      />
      <path
        d="M176 84 Q184 76 194 82 L194 120 Q182 124 176 112 Z M224 84 Q216 76 206 82 L206 120 Q218 124 224 112 Z"
        className="fill-pink-400/80"
      />
      <path
        d="M198 96 Q206 86 212 96 Q212 108 200 116 Q190 106 198 96 Z"
        className="animate-flicker fill-red-600 motion-reduce:animate-none"
      />
      <path
        d="M184 128 Q200 122 216 128 Q218 140 200 142 Q182 140 184 128 Z"
        className="fill-red-900/80"
      />
      {[
        [70, 50],
        [330, 70],
        [90, 160],
        [320, 170],
        [60, 110],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="3"
          className="fill-rose-400/60"
        />
      ))}
    </svg>
  );
}

/** Test tubes in the rack: the colour of each result and its liquid level. */
const tests: [string, number][] = [
  ["fill-blue-500", 120],
  ["fill-green-500", 106],
  ["fill-yellow-400", 132],
  ["fill-red-500", 114],
];

/** A small chemistry bench: a titration, a flame under a beaker and a rack of coloured tests. */
export function ChemistryScene() {
  return (
    <svg viewBox="0 0 400 220" aria-hidden="true" className="h-full w-full">
      <rect x="0" y="190" width="400" height="30" className={bench} />

      <rect
        x="30"
        y="184"
        width="80"
        height="8"
        rx="2"
        className="fill-slate-600"
      />
      <rect x="40" y="16" width="6" height="170" className="fill-slate-500" />
      <path d="M46 60 H72" strokeWidth="4" className={line} />
      <rect
        x="70"
        y="14"
        width="10"
        height="100"
        rx="2"
        strokeWidth="2"
        className={glass}
      />
      <rect x="71" y="40" width="8" height="73" className="fill-sky-300/70" />
      <path d="M75 114 V128" strokeWidth="2" className="stroke-sky-500" />
      <circle
        cx="75"
        cy="136"
        r="3"
        className="animate-bubble-slow fill-sky-400 motion-reduce:animate-none"
      />
      <path
        d="M68 146 H82 V156 L98 186 H52 L68 156 Z"
        strokeWidth="2"
        className={glass}
      />
      <path d="M60 170 L56 186 H94 L90 170 Z" className="fill-pink-400/80" />

      <path
        d="M150 120 H226 M156 120 L146 190 M220 120 L230 190"
        fill="none"
        strokeWidth="4"
        className={line}
      />
      <path
        d="M160 70 H216 L212 118 H164 Z"
        strokeWidth="2"
        className={glass}
      />
      <path d="M162 92 H214 L212 118 H164 Z" className="fill-blue-400/70" />
      <circle
        cx="176"
        cy="104"
        r="3"
        className="animate-bubble fill-white/80 motion-reduce:animate-none"
      />
      <circle
        cx="198"
        cy="110"
        r="2.5"
        className="animate-bubble-fast fill-white/80 motion-reduce:animate-none"
      />
      <path
        d="M188 152 C200 140 196 130 188 124 C180 130 176 140 188 152 Z"
        className="animate-flicker fill-sky-400/80 motion-reduce:animate-none"
      />
      <path
        d="M188 152 C193 146 192 140 188 136 C184 140 183 146 188 152 Z"
        className="fill-blue-700/80"
      />
      <rect x="182" y="152" width="12" height="34" className="fill-slate-500" />
      <rect
        x="170"
        y="184"
        width="36"
        height="6"
        rx="2"
        className="fill-slate-700"
      />

      <rect
        x="262"
        y="128"
        width="120"
        height="12"
        rx="3"
        className="fill-amber-300 dark:fill-amber-700"
      />
      <rect
        x="262"
        y="176"
        width="120"
        height="12"
        rx="3"
        className="fill-amber-300 dark:fill-amber-700"
      />
      {tests.map(([colour, top], index) => {
        const x = 274 + index * 28;
        return (
          <g key={x}>
            <path
              d={`M${x} ${top - 26} V170 A8 8 0 0 0 ${x + 16} 170 V${top - 26}`}
              strokeWidth="2"
              className={glass}
            />
            <path
              d={`M${x + 1} ${top + 18} V170 A7 7 0 0 0 ${x + 15} 170 V${top + 18} Z`}
              className={colour}
            />
            {index === 1 && (
              <circle
                cx={x + 8}
                cy={top + 30}
                r="2"
                className="animate-bubble fill-white/80 motion-reduce:animate-none"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
