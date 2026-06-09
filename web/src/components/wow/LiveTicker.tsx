export interface TickerItem {
  color: string;
  title: string;
  body: string;
}

const DEFAULT_ITEMS: TickerItem[] = [
  {
    color: "var(--status-danger-fg)",
    title: "Critical finding",
    body: "FW-CORE-01 · 10.0.0.0/8 toʻliq ruxsat",
  },
  {
    color: "var(--status-success-fg)",
    title: "Vazifa bajarildi",
    body: "T-116 · Nessus skaner import",
  },
  {
    color: "var(--status-info-fg)",
    title: "EXE agent sync",
    body: "AUD-2026-014 · 6 ta yangi log",
  },
  {
    color: "var(--status-warning-fg)",
    title: "Review kutilmoqda",
    body: "T-117 · DNS tunneling tahlili",
  },
  {
    color: "var(--status-success-fg)",
    title: "Audit tasdiqlandi",
    body: "AUD-2026-013 · Soliq qoʻmitasi",
  },
];

/** Marquee of live events (CSS-animated; ported from wow.jsx). */
export function LiveTicker({ items = DEFAULT_ITEMS }: { items?: TickerItem[] }) {
  const seq = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <span className="ticker__tag">
        <span className="live-dot" />
        <span>Jonli</span>
      </span>
      <div className="ticker__win">
        <div className="ticker__track">
          {seq.map((e, i) => (
            <span key={i} className="ticker__item">
              <span className="ticker__dot" style={{ background: e.color }} />
              <b>{e.title}</b>
              <span>— {e.body}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
