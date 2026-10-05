// components/Constellation.tsx
// Decorative hub-and-spoke diagram for the hero. Lines draw in once on load.

const CALLERS = [
  { y: 62, label: "Router" },
  { y: 162, label: "Vault" },
  { y: 262, label: "Keeper" },
];
const CALLEES = [
  { y: 38, label: "Token" },
  { y: 118, label: "Oracle" },
  { y: 198, label: "Library" },
  { y: 278, label: "Proxy", dashed: true },
];

const HUB_Y = 176;
const INK = "#f2f3ff";

export function Constellation() {
  return (
    <svg
      viewBox="0 0 520 340"
      className="h-auto w-full max-w-[520px]"
      aria-hidden="true"
      role="presentation"
      style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
    >
      <defs>
        <marker
          id="hero-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
      </defs>

      {/* edges: callers -> hub */}
      {CALLERS.map((n, i) => (
        <line
          key={`ci-${n.label}`}
          className="draw"
          pathLength={1}
          x1={100}
          y1={n.y + 16}
          x2={194}
          y2={HUB_Y}
          stroke={INK}
          strokeOpacity={0.8}
          strokeWidth={1.5}
          markerEnd="url(#hero-arrow)"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}

      {/* edges: hub -> callees */}
      {CALLEES.map((n, i) => (
        <line
          key={`co-${n.label}`}
          className="draw"
          pathLength={1}
          x1={324}
          y1={HUB_Y}
          x2={418}
          y2={n.y + 16}
          stroke={INK}
          strokeOpacity={0.8}
          strokeWidth={1.5}
          markerEnd="url(#hero-arrow)"
          style={{ animationDelay: `${500 + i * 120}ms` }}
        />
      ))}

      {/* callers */}
      {CALLERS.map((n, i) => (
        <g key={n.label} className="pop" style={{ animationDelay: `${i * 120}ms` }}>
          <rect x={16} y={n.y} width={84} height={32} fill="none" stroke={INK} strokeWidth={1.5} />
          <text x={58} y={n.y + 17} fill={INK} fontSize={11} textAnchor="middle" dominantBaseline="middle">
            {n.label}
          </text>
        </g>
      ))}

      {/* callees */}
      {CALLEES.map((n, i) => (
        <g key={n.label} className="pop" style={{ animationDelay: `${500 + i * 120}ms` }}>
          <rect
            x={420}
            y={n.y}
            width={84}
            height={32}
            fill="none"
            stroke={INK}
            strokeWidth={1.5}
            strokeDasharray={n.dashed ? "4 3" : undefined}
          />
          <text x={462} y={n.y + 17} fill={INK} fontSize={11} textAnchor="middle" dominantBaseline="middle">
            {n.label}
          </text>
        </g>
      ))}

      {/* hub */}
      <g className="pop" style={{ animationDelay: "300ms" }}>
        <rect x={196} y={HUB_Y - 22} width={128} height={44} fill={INK} />
        <text
          x={260}
          y={HUB_Y + 1}
          fill="#00001f"
          fontSize={12}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          0xC02a…6Cc2
        </text>
      </g>

      <text x={58} y={322} fill={INK} fillOpacity={0.7} fontSize={10} textAnchor="middle">
        {"// depends on it"}
      </text>
      <text x={462} y={322} fill={INK} fillOpacity={0.7} fontSize={10} textAnchor="middle">
        {"// depends on"}
      </text>
    </svg>
  );
}
