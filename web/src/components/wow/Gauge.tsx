"use client";

import { useEffect, useId, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { CountUp } from "@/components/ui/CountUp";

/** 270° radial gauge with gradient fill + count-up centre (ported from wow.jsx). */
export function Gauge({
  value = 0,
  max = 100,
  size = 132,
  stroke = 12,
  cap = "Posture",
}: {
  value?: number;
  max?: number;
  size?: number;
  stroke?: number;
  cap?: string;
}) {
  const reduce = useReducedMotion();
  const gid = useId();
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const C = 2 * Math.PI * r;
  const arc = 0.75 * C;
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setDrawn(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [reduce]);

  const show = reduce || drawn;
  const offset = show ? arc * (1 - Math.min(1, value / max)) : arc;

  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--status-info-fg)" />
          </linearGradient>
        </defs>
        <circle
          className="gauge__track"
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${C - arc}`}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cx})`}
        />
        <circle
          className="gauge__fill"
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${C - arc}`}
          strokeDashoffset={offset}
          transform={`rotate(135 ${cx} ${cx})`}
        />
      </svg>
      <div className="gauge__label">
        <span className="gauge__num">
          <CountUp value={value} />
        </span>
        <span className="gauge__cap">{cap}</span>
      </div>
    </div>
  );
}
