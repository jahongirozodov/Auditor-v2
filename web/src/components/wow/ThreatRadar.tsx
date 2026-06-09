const BLIPS = [
  { x: 64, y: 30, c: "crit", color: "var(--status-danger-fg)", d: "0s" },
  { x: 78, y: 62, c: "high", color: "var(--status-warning-fg)", d: "0.6s" },
  { x: 38, y: 70, c: "med", color: "var(--status-info-fg)", d: "1.1s" },
  { x: 30, y: 42, c: "high", color: "var(--status-warning-fg)", d: "1.5s" },
  { x: 70, y: 80, c: "med", color: "var(--status-info-fg)", d: "0.3s" },
];

/** Decorative threat radar (CSS-animated; ported from wow.jsx). */
export function ThreatRadar() {
  return (
    <div className="radar" aria-hidden="true">
      <div className="radar__grid">
        <div className="radar__ring" />
        <div className="radar__ring r2" />
        <div className="radar__ring r3" />
        <div className="radar__ring r4" />
        <div className="radar__cross h" />
        <div className="radar__cross v" />
      </div>
      <div className="radar__sweep" />
      {BLIPS.map((b, i) => (
        <span
          key={i}
          className={`radar__blip ${b.c}`}
          style={{ left: `${b.x}%`, top: `${b.y}%`, color: b.color, animationDelay: b.d }}
        />
      ))}
    </div>
  );
}
