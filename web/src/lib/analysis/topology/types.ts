/** AI analysis of a built topology — the model's structured output, rendered as cards. */

export type TopologyRisk = "critical" | "high" | "medium" | "low";

export interface TopologyCriticalNode {
  nodeId: string;
  label?: string;
  reason: string;
  recommendation: string;
}

export interface TopologyAttackPath {
  nodes: string[];
  risk: string;
  severity: TopologyRisk;
}

export interface TopologyAnalysis {
  summary: string;
  overallRisk: TopologyRisk;
  criticalNodes: TopologyCriticalNode[];
  attackPaths: TopologyAttackPath[];
  segmentationIssues: string[];
  recommendations: string[];
}

import type { NodeKind } from "@/lib/types/entities";

/** Per-node patch returned by the enrichment AI call. */
export interface EnrichedNodePatch {
  id: string;
  kind: NodeKind;
  segment: string;
  aiLabel: string;
  aiReason: string;
}
