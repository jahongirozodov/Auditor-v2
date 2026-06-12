import "server-only";
import { prisma } from "@/lib/prisma";
import { analyzeTraffic } from "@/lib/analysis/traffic";
import type { Severity, Topology, TopologyEdge, TopologyNode } from "@/lib/types/entities";
import { assetToKind, ipFromDstPort, isIp, nodeKey, segmentForIp, vendorToKind } from "./infer";

const SEV_RANK: Record<Severity, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
const raise = (a: Severity, b: Severity): Severity => (SEV_RANK[b] > SEV_RANK[a] ? b : a);

type AggRow = { critical?: number; high?: number; medium?: number };
function sevFromAgg(agg: AggRow): Severity {
  if ((agg.critical ?? 0) > 0) return "critical";
  if ((agg.high ?? 0) > 0) return "high";
  if ((agg.medium ?? 0) > 0) return "medium";
  return "info";
}

/**
 * Build a network topology for an audit from real backend data: nodes from
 * analyzed devices + finding assets + traffic IPs (merged by host/IP key), edges
 * from traffic IP-pairs. Deterministic; returns an empty graph when the audit has
 * no data. Heuristic kind/segment inference lives in ./infer (advisory).
 */
export async function buildTopology(auditId: string): Promise<Topology> {
  const nodes = new Map<string, TopologyNode>();

  const upsert = (label: string, init: Partial<TopologyNode>): TopologyNode => {
    const key = nodeKey(label);
    let n = nodes.get(key);
    if (!n) {
      n = {
        id: key,
        label,
        ip: isIp(label) ? label : "",
        kind: "server",
        segment: "Ichki tarmoq",
        sev: "info",
        findings: 0,
        ...init,
      };
      nodes.set(key, n);
    } else {
      if (!n.ip && init.ip) n.ip = init.ip;
      if (init.kind && n.kind === "server") n.kind = init.kind;
      if (init.segment && n.segment === "Ichki tarmoq") n.segment = init.segment;
      if (init.sev) n.sev = raise(n.sev, init.sev);
    }
    return n;
  };

  // 1) Analyzed devices (config uploads) → device nodes.
  const devices = await prisma.analyzedDevice.findMany({ where: { upload: { auditId } } });
  for (const d of devices) {
    upsert(d.hostname, {
      kind: vendorToKind(d.vendor),
      segment: "Server farm",
      sev: sevFromAgg((d.findingsAgg as AggRow | null) ?? {}),
    });
  }

  // 2) Finding assets → merge/add; authoritative per-node finding count + severity.
  const findings = await prisma.finding.findMany({
    where: { auditId },
    select: { asset: true, severity: true },
  });
  for (const f of findings) {
    if (!f.asset) continue;
    const n = upsert(f.asset, {
      kind: assetToKind(f.asset),
      segment: isIp(f.asset) ? segmentForIp(f.asset) : "Ichki tarmoq",
      sev: f.severity as Severity,
    });
    n.findings += 1;
  }

  // 3) Latest traffic upload → IP nodes + edges from anomaly IP-pairs.
  const edgeSet = new Map<string, TopologyEdge>();
  const traffic = await prisma.trafficUpload.findFirst({
    where: { auditId },
    orderBy: { createdAt: "desc" },
  });
  if (traffic) {
    const { anomalies } = analyzeTraffic(traffic.filename, traffic.content);
    for (const a of anomalies) {
      const src = a.srcIp && isIp(a.srcIp) ? a.srcIp : "";
      const dst = ipFromDstPort(a.dstIpPort);
      const sev = a.severity as Severity;
      if (src) upsert(src, { kind: "endpoint", segment: segmentForIp(src), sev });
      if (dst) upsert(dst, { kind: "server", segment: segmentForIp(dst), sev });
      if (src && dst) {
        const s = nodeKey(src);
        const t = nodeKey(dst);
        if (s !== t) {
          const ek = `${s}->${t}`;
          const flag = sev === "critical" || sev === "high";
          const prev = edgeSet.get(ek);
          edgeSet.set(ek, { s, t, flag: flag || prev?.flag });
        }
      }
    }
  }

  return { audit: auditId, nodes: [...nodes.values()], edges: [...edgeSet.values()] };
}
