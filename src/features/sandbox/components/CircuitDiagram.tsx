export function CircuitDiagram({ running = false }: { running?: boolean }) {
  return (
    <svg
      viewBox="0 0 600 360"
      role="img"
      aria-label="Simple circuit with a cell, switch, bulb, ammeter and voltmeter"
      className="h-full w-full"
    >
      <defs>
        <pattern
          id="bench-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="#dbeafe"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="600" height="360" fill="#f8fafc" />
      <rect width="600" height="360" fill="url(#bench-grid)" />
      <path
        d="M140 160 V78 H450 V160 M450 200 V285 H140 V202"
        fill="none"
        stroke={running ? "#006600" : "#334155"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M140 160 V176 M140 190 V202 M118 176 H162 M126 190 H154"
        stroke="#334155"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle
        cx="450"
        cy="180"
        r="22"
        fill="white"
        stroke="#334155"
        strokeWidth="4"
      />
      <path
        d="m437 167 26 26 m0-26-26 26"
        stroke={running ? "#f59e0b" : "#64748b"}
        strokeWidth="4"
      />
      <circle
        cx="300"
        cy="78"
        r="22"
        fill="white"
        stroke="#334155"
        strokeWidth="4"
      />
      <text
        x="300"
        y="86"
        textAnchor="middle"
        fontSize="24"
        fontWeight="700"
        fill="#334155"
      >
        A
      </text>
      <path d="M280 285 H320" stroke="#f8fafc" strokeWidth="12" />
      <circle cx="278" cy="285" r="5" fill="#334155" />
      <circle cx="324" cy="285" r="5" fill="#334155" />
      <path
        d="M280 285 320 265"
        stroke="#334155"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M450 130 H525 V230 H450"
        fill="none"
        stroke="#64748b"
        strokeWidth="4"
      />
      <circle
        cx="525"
        cy="180"
        r="20"
        fill="white"
        stroke="#64748b"
        strokeWidth="4"
      />
      <text
        x="525"
        y="188"
        textAnchor="middle"
        fontSize="23"
        fontWeight="700"
        fill="#64748b"
      >
        V
      </text>
      <text x="88" y="236" fontSize="17" fontWeight="700" fill="#334155">
        CELL
      </text>
      <text x="247" y="326" fontSize="17" fontWeight="700" fill="#334155">
        SWITCH
      </text>
      <text x="414" y="238" fontSize="17" fontWeight="700" fill="#334155">
        BULB
      </text>
      {running && (
        <circle
          cx="450"
          cy="180"
          r="34"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3"
          opacity="0.7"
        />
      )}
    </svg>
  );
}
