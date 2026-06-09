"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Animates each numeric run in `value` from 0 → target on first paint (ported from
 * chrome.jsx). Non-numeric parts pass through. Honors reduced motion (renders the
 * final value immediately). Initial render is the final value (SSR-safe).
 */
export function CountUp({
  value,
  duration = 1100,
  className,
}: {
  value: string | number;
  duration?: number;
  className?: string;
}) {
  const text = String(value);
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduce) return;
    const tokens = text.match(/(\d[\d,]*\.?\d*)|([^\d]+)/g) ?? [text];
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      const eased = easeOutExpo(p);
      setDisplay(
        tokens
          .map((tok) => {
            if (!/^\d[\d,]*\.?\d*$/.test(tok)) return tok;
            const decimals = (tok.split(".")[1] ?? "").length;
            const target = parseFloat(tok.replace(/,/g, ""));
            const cur = target * eased;
            const s = decimals ? cur.toFixed(decimals) : String(Math.round(cur));
            return tok.includes(",") ? Number(s).toLocaleString("en-US") : s;
          })
          .join(""),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [text, reduce, duration]);

  return <span className={className}>{reduce ? text : display}</span>;
}
