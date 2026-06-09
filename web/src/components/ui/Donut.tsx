"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export interface DonutItem {
  value: number;
  color: string;
  label?: string;
}

/** Segmented donut over the `.donut` classes (SVG draw-in; ported from chrome.jsx). */
export function Donut({
  items,
  size = 120,
  thickness = 18,
  total,
}: {
  items: DonutItem[];
  size?: number;
  thickness?: number;
  total?: number;
}) {
  const reduce = useReducedMotion();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setDrawn(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const sum = total ?? items.reduce((s, it) => s + it.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const show = reduce || drawn;

  // Precompute segment lengths + cumulative offsets purely (no render mutation).
  const lengths = items.map((it) => (sum ? (it.value / sum) * c : 0));
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="var(--bg-surface-3)"
        strokeWidth={thickness}
      />
      {items.map((it, i) => {
        const len = lengths[i];
        const dash = show ? `${len} ${c - len}` : `0 ${c}`;
        const dashOffset = -offsets[i];
        return (
          <circle
            key={i}
            className="donut-seg"
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={it.color}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cx})`}
            strokeLinecap="butt"
            style={{ transitionDelay: `${i * 140}ms` }}
          />
        );
      })}
      <text
        x={cx}
        y={cx - 4}
        textAnchor="middle"
        fontSize={22}
        fontWeight={800}
        fill="var(--text-primary)"
        fontFamily="var(--font-display)"
        letterSpacing="-0.02em"
      >
        {sum}
      </text>
      <text
        x={cx}
        y={cx + 14}
        textAnchor="middle"
        fontSize={10}
        fill="var(--text-tertiary)"
        fontWeight={600}
        letterSpacing="0.08em"
      >
        JAMI
      </text>
    </svg>
  );
}
