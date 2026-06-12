import type { ReactNode } from "react";
import { CountUp } from "@/components/ui/CountUp";
import { Gauge } from "./Gauge";
import { ThreatRadar } from "./ThreatRadar";
import { LiveTicker } from "./LiveTicker";

export interface HeroMetric {
  label: string;
  value: string | number;
  tone?: "danger" | "good";
}

/** Security-posture command band (ported from wow.jsx). */
export function HeroBand({
  score = 74,
  caption,
  title,
  eyebrow,
  metrics = [],
  gauge = 89,
  gaugeCap = "Bajarildi",
}: {
  score?: number;
  caption?: ReactNode;
  title?: ReactNode;
  eyebrow?: ReactNode;
  metrics?: HeroMetric[];
  gauge?: number;
  gaugeCap?: string;
}) {
  return (
    <div className="hero-band glow-border">
      <div className="hero-band__main">
        <div className="hero-eyebrow">
          <span className="live-dot" />
          <span>{eyebrow ?? "Live · Xavfsizlik holati markazi"}</span>
        </div>
        <div className="hero-band__headline">
          <div className="hero-score">
            <CountUp value={score} />
            <sup>%</sup>
          </div>
          <div className="hero-band__caption">
            <h2>{title ?? "Tashkilot xavfsizlik koʻrsatkichi"}</h2>
            <p>{caption}</p>
          </div>
        </div>
        <div className="hero-metrics">
          {metrics.map((m, i) => (
            <div key={i} className={`hero-metric${m.tone ? ` hero-metric--${m.tone}` : ""}`}>
              <span className="hero-metric__v">
                <CountUp value={m.value} />
              </span>
              <span className="hero-metric__l">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-band__side">
        <Gauge value={gauge} cap={gaugeCap} />
        <ThreatRadar />
      </div>
      <LiveTicker />
    </div>
  );
}
