"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import type { TrafficConversation, TrafficAnomaly } from "@/lib/analysis/traffic";

const W = 680;
const H = 400;
const MAX_NODES = 14;

interface GNode {
  id: string;
  volume: number;
  internal: boolean;
  suspicious: boolean;
}
interface GEdge {
  a: string;
  b: string;
  packets: number;
  suspicious: boolean;
}

/** RFC1918 / loopback / link-local → "internal" host. */
function isInternal(ip: string): boolean {
  if (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("127.") ||
    ip.startsWith("169.254.")
  )
    return true;
  const m = /^172\.(\d+)\./.exec(ip);
  return m ? Number(m[1]) >= 16 && Number(m[1]) <= 31 : false;
}

/** IPs named by the detected anomalies (src + any host in dstIpPort). */
function suspiciousIps(anomalies: TrafficAnomaly[]): Set<string> {
  const set = new Set<string>();
  for (const a of anomalies) {
    if (a.srcIp) set.add(a.srcIp);
    if (a.dstIpPort) {
      const host = a.dstIpPort.split(":")[0];
      if (host && host !== "-" && /^\d+\.\d+\.\d+\.\d+$/.test(host)) set.add(host);
    }
  }
  return set;
}

function buildGraph(conversations: TrafficConversation[], anomalies: TrafficAnomaly[]) {
  const sus = suspiciousIps(anomalies);
  const vol: Record<string, number> = {};
  for (const c of conversations) {
    vol[c.src] = (vol[c.src] ?? 0) + c.packets;
    vol[c.dst] = (vol[c.dst] ?? 0) + c.packets;
  }
  const nodeIds = new Set(
    Object.entries(vol)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_NODES)
      .map(([ip]) => ip),
  );
  const nodes: GNode[] = [...nodeIds].map((id) => ({
    id,
    volume: vol[id],
    internal: isInternal(id),
    suspicious: sus.has(id),
  }));

  // Merge directed conversations into undirected edges among the kept nodes.
  const edgeMap = new Map<string, GEdge>();
  for (const c of conversations) {
    if (!nodeIds.has(c.src) || !nodeIds.has(c.dst)) continue;
    const [x, y] = c.src < c.dst ? [c.src, c.dst] : [c.dst, c.src];
    const key = `${x}|${y}`;
    const e = edgeMap.get(key);
    if (e) e.packets += c.packets;
    else edgeMap.set(key, { a: x, b: y, packets: c.packets, suspicious: sus.has(x) || sus.has(y) });
  }
  return { nodes, edges: [...edgeMap.values()] };
}

/** Deterministic force-directed layout (Fruchterman-Reingold-ish, no randomness). */
function layout(nodes: GNode[], edges: GEdge[]): Record<string, { x: number; y: number }> {
  const N = nodes.length;
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const R = Math.min(W, H) * 0.36;
  const pos = nodes.map((_, i) => {
    const a = (i / N) * Math.PI * 2;
    return { x: W / 2 + Math.cos(a) * R, y: H / 2 + Math.sin(a) * R };
  });
  if (N <= 1) {
    const out: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n, i) => (out[n.id] = pos[i] ?? { x: W / 2, y: H / 2 }));
    return out;
  }
  const k = Math.sqrt((W * H) / N);
  const iterations = 320;
  let maxPkt = 1;
  for (const e of edges) if (e.packets > maxPkt) maxPkt = e.packets;

  for (let it = 0; it < iterations; it++) {
    const disp = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d = Math.hypot(dx, dy) || 0.01;
        const rep = ((k * k) / d) * 0.85;
        const ux = dx / d;
        const uy = dy / d;
        disp[i].x += ux * rep;
        disp[i].y += uy * rep;
        disp[j].x -= ux * rep;
        disp[j].y -= uy * rep;
      }
    }
    for (const e of edges) {
      const i = idx.get(e.a);
      const j = idx.get(e.b);
      if (i == null || j == null) continue;
      const dx = pos[i].x - pos[j].x;
      const dy = pos[i].y - pos[j].y;
      const d = Math.hypot(dx, dy) || 0.01;
      // Heavier conversations pull their endpoints closer (clustering).
      const att = ((d * d) / k) * 0.004 * (1 + Math.log1p(e.packets) / Math.log1p(maxPkt));
      const ux = dx / d;
      const uy = dy / d;
      disp[i].x -= ux * att;
      disp[i].y -= uy * att;
      disp[j].x += ux * att;
      disp[j].y += uy * att;
    }
    const temp = (1 - it / iterations) * (Math.min(W, H) * 0.05);
    for (let i = 0; i < N; i++) {
      disp[i].x += (W / 2 - pos[i].x) * 0.012;
      disp[i].y += (H / 2 - pos[i].y) * 0.012;
      const dl = Math.hypot(disp[i].x, disp[i].y) || 0.01;
      pos[i].x += (disp[i].x / dl) * Math.min(dl, temp);
      pos[i].y += (disp[i].y / dl) * Math.min(dl, temp);
      pos[i].x = Math.max(26, Math.min(W - 26, pos[i].x));
      pos[i].y = Math.max(26, Math.min(H - 30, pos[i].y));
    }
  }
  const out: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => (out[n.id] = pos[i]));
  return out;
}

type Hover =
  | { kind: "node"; node: GNode; xPct: number; yPct: number }
  | { kind: "edge"; edge: GEdge; xPct: number; yPct: number }
  | null;

export function TrafficGraph({
  conversations,
  anomalies,
}: {
  conversations: TrafficConversation[];
  anomalies: TrafficAnomaly[];
}) {
  const t = useTranslations("traffic");
  const { nodes, edges } = useMemo(
    () => buildGraph(conversations, anomalies),
    [conversations, anomalies],
  );
  const pos = useMemo(() => layout(nodes, edges), [nodes, edges]);
  const [hover, setHover] = useState<Hover>(null);

  const maxVol = Math.max(...nodes.map((n) => n.volume), 1);
  const maxPkt = Math.max(...edges.map((e) => e.packets), 1);
  const nodeR = (v: number) => 6 + 10 * Math.sqrt(v / maxVol);
  const edgeW = (p: number) => 1 + 4 * Math.sqrt(p / maxPkt);

  return (
    <Panel
      title={t("graphTitle")}
      icon={<Share2 size={15} />}
      actions={
        <span className="cell-sub">
          {t("graphCount", { nodes: nodes.length, edges: edges.length })}
        </span>
      }
    >
      {nodes.length === 0 ? (
        <p className="text-sm text-muted" style={{ padding: "24px 4px", textAlign: "center" }}>
          {t("graphEmpty")}
        </p>
      ) : (
        <>
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 760,
              margin: "0 auto",
              aspectRatio: `${W} / ${H}`,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={t("graphTitle")}
              preserveAspectRatio="xMidYMid meet"
              style={{ display: "block" }}
              onMouseLeave={() => setHover(null)}
            >
              {edges.map((e, i) => {
                const p1 = pos[e.a];
                const p2 = pos[e.b];
                if (!p1 || !p2) return null;
                return (
                  <line
                    key={i}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={e.suspicious ? "var(--status-danger-fg)" : "var(--brand)"}
                    strokeOpacity={e.suspicious ? 0.7 : 0.35}
                    strokeWidth={edgeW(e.packets)}
                    onMouseEnter={() =>
                      setHover({
                        kind: "edge",
                        edge: e,
                        xPct: ((p1.x + p2.x) / 2 / W) * 100,
                        yPct: ((p1.y + p2.y) / 2 / H) * 100,
                      })
                    }
                  />
                );
              })}
              {nodes.map((n) => {
                const p = pos[n.id];
                if (!p) return null;
                const r = nodeR(n.volume);
                const fill = n.suspicious
                  ? "var(--status-danger-fg)"
                  : n.internal
                    ? "var(--brand)"
                    : "var(--bg-surface-1)";
                return (
                  <g
                    key={n.id}
                    onMouseEnter={() =>
                      setHover({
                        kind: "node",
                        node: n,
                        xPct: (p.x / W) * 100,
                        yPct: (p.y / H) * 100,
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r}
                      fill={fill}
                      stroke={n.suspicious ? "var(--status-danger-fg)" : "var(--brand)"}
                      strokeWidth={n.internal || n.suspicious ? 1 : 1.6}
                      strokeDasharray={n.internal || n.suspicious ? undefined : "3 2"}
                    />
                    <text
                      x={p.x}
                      y={p.y + r + 10}
                      textAnchor="middle"
                      fontSize={9}
                      fill="var(--text-secondary)"
                      style={{ fontFamily: "var(--font-mono, monospace)" }}
                    >
                      {n.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hover ? (
              <div
                style={{
                  position: "absolute",
                  left: `${hover.xPct}%`,
                  top: `${hover.yPct}%`,
                  transform: "translate(-50%, -130%)",
                  pointerEvents: "none",
                  background: "var(--bg-surface-3)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 11.5,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  boxShadow: "var(--shadow-2, 0 4px 12px rgba(0,0,0,0.3))",
                  zIndex: 2,
                }}
              >
                {hover.kind === "node" ? (
                  <>
                    <span className="font-mono" style={{ fontWeight: 700 }}>
                      {hover.node.id}
                    </span>
                    <span style={{ color: "var(--text-tertiary)" }}>
                      {" "}
                      · {hover.node.internal ? t("graphInternal") : t("graphExternal")}
                    </span>
                    <br />
                    {t("graphPackets", { n: hover.node.volume })}
                    {hover.node.suspicious ? ` · ${t("graphSuspicious")}` : ""}
                  </>
                ) : (
                  <>
                    <span className="font-mono">{hover.edge.a}</span> ↔{" "}
                    <span className="font-mono">{hover.edge.b}</span>
                    <br />
                    {t("graphPackets", { n: hover.edge.packets })}
                  </>
                )}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginTop: 12,
              fontSize: 11,
              color: "var(--text-tertiary)",
            }}
          >
            <Legend color="var(--brand)" label={t("graphInternal")} />
            <Legend color="var(--bg-surface-1)" outline label={t("graphExternal")} />
            <Legend color="var(--status-danger-fg)" label={t("graphSuspicious")} />
          </div>
        </>
      )}
    </Panel>
  );
}

function Legend({ color, label, outline }: { color: string; label: string; outline?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: outline ? "transparent" : color,
          border: `1.5px ${outline ? "dashed" : "solid"} var(--brand)`,
          boxShadow: outline ? undefined : `0 0 0 1px ${color}`,
        }}
      />
      {label}
    </span>
  );
}
