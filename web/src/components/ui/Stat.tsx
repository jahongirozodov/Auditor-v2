import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CountUp } from "./CountUp";
import { Sparkline } from "./Sparkline";

/** KPI stat tile over the `.stat` classes (ported from chrome.jsx). */
export function Stat({
  icon,
  label,
  value,
  delta,
  deltaNeg = false,
  meta,
  spark,
  bar,
}: {
  icon?: ReactNode;
  label: string;
  value: string | number;
  delta?: number;
  deltaNeg?: boolean;
  meta?: string;
  spark?: number[];
  bar?: number;
}) {
  return (
    <div className="stat">
      <div className="stat__row">
        <span className="stat__label">{label}</span>
        {icon ? <span className="stat__icon">{icon}</span> : null}
      </div>
      <div className="stat__row">
        <span className="stat__value tabular">
          <CountUp value={value} />
        </span>
        {spark ? (
          <span>
            <Sparkline data={spark} />
          </span>
        ) : null}
      </div>
      {delta != null || meta ? (
        <div className="stat__row">
          {meta ? <span className="stat__meta">{meta}</span> : <span />}
          {delta != null ? (
            <span className={`stat__delta${deltaNeg ? " stat__delta--neg" : ""}`}>
              {deltaNeg ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              <span>
                {delta > 0 ? "+" : ""}
                {delta}
                {Math.abs(delta) < 100 ? "%" : ""}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
      {bar != null ? (
        <div className="stat__bar">
          <span style={{ width: `${bar}%` }} />
        </div>
      ) : null}
    </div>
  );
}
