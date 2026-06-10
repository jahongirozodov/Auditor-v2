"use client";

import { useTranslations } from "next-intl";
import { Sev } from "@/components/ui/Sev";
import type { TopologyAnalysis } from "@/lib/analysis/topology/types";

interface TopologyAiResultProps {
  analysis: TopologyAnalysis | null;
  loading: boolean;
  degraded: boolean;
  onSelectNode?: (nodeId: string) => void;
}

/**
 * Renders the AI topology analysis: overall risk + summary, critical-node cards
 * (click to focus the node), attack paths, segmentation issues, recommendations.
 * Plain-text only; tokens/classes only.
 */
export function TopologyAiResult({
  analysis,
  loading,
  degraded,
  onSelectNode,
}: TopologyAiResultProps) {
  const t = useTranslations("topology");

  if (loading) {
    return (
      <p className="ai-card__body" aria-live="polite">
        {t("aiAnalyzing")}
      </p>
    );
  }
  if (degraded) {
    return (
      <p className="ai-card__body" style={{ color: "var(--status-danger-fg)" }} role="alert">
        {t("aiUnreachable")}
      </p>
    );
  }
  if (!analysis) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="ai-card__body">
        <span className="stat__label" style={{ marginRight: 6 }}>
          {t("aiOverallRisk")}
        </span>
        <Sev level={analysis.overallRisk} />
      </div>

      {analysis.summary ? (
        <p className="ai-card__body" style={{ whiteSpace: "pre-wrap" }}>
          {analysis.summary}
        </p>
      ) : null}

      {analysis.criticalNodes.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="stat__label">{t("aiCriticalNodes")}</span>
          {analysis.criticalNodes.map((n, i) => (
            <div
              key={i}
              className="card"
              role={onSelectNode ? "button" : undefined}
              tabIndex={onSelectNode ? 0 : undefined}
              onClick={() => onSelectNode?.(n.nodeId)}
              onKeyDown={(e) => e.key === "Enter" && onSelectNode?.(n.nodeId)}
              style={{ padding: 12, cursor: onSelectNode ? "pointer" : undefined }}
            >
              <strong style={{ color: "var(--text-primary)" }}>{n.label ?? n.nodeId}</strong>
              {n.reason ? <p className="ai-card__body">{n.reason}</p> : null}
              {n.recommendation ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiRecommendations")}
                  </span>
                  {n.recommendation}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {analysis.attackPaths.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="stat__label">{t("aiAttackPaths")}</span>
          {analysis.attackPaths.map((p, i) => (
            <div key={i} className="ai-card__body" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Sev level={p.severity} />
              <span className="font-mono">{p.nodes.join(" → ")}</span>
              {p.risk ? <span className="text-sm text-muted">— {p.risk}</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      {analysis.segmentationIssues.length > 0 ? (
        <div className="ai-card__body">
          <span className="stat__label">{t("aiSegmentation")}</span>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {analysis.segmentationIssues.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {analysis.recommendations.length > 0 ? (
        <div className="ai-card__body">
          <span className="stat__label">{t("aiRecommendations")}</span>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {analysis.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
