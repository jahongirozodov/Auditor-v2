"use client";

/* eslint-disable react-hooks/refs --
 * Imperative SVG force-directed simulation: node positions (posRef) and the
 * pan/zoom viewport (viewRef) are mutated by the animation loop and read during
 * render to draw the graph. This is the intended escape hatch for canvas-style viz. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  AlertTriangle,
  Database,
  Download,
  Globe,
  Info,
  Lock,
  Maximize2,
  Monitor,
  Network,
  Plus,
  RefreshCw,
  Save,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Sev } from "@/components/ui/Sev";
import { useToast } from "@/components/ui/Toast";
import { analyzeTopology, enrichTopology } from "@/lib/actions/topology";
import type { TopologyAnalysis } from "@/lib/analysis/topology/types";
import { TopologyAiResult } from "./TopologyAiResult";
import type { Audit, Finding, NodeKind, Severity, Topology } from "@/lib/types/entities";

const W = 940;
const H = 600;

const SEV_COLOR: Record<Severity, string> = {
  critical: "var(--status-danger-fg)",
  high: "var(--status-warning-fg)",
  medium: "var(--status-info-fg)",
  low: "var(--status-success-fg)",
  info: "var(--text-tertiary)",
};
const KIND_ICON: Record<NodeKind, LucideIcon> = {
  cloud: Globe,
  firewall: Shield,
  ips: ShieldAlert,
  vpn: Lock,
  switch: Network,
  server: Server,
  web: Globe,
  db: Database,
  wifi: Wifi,
  endpoint: Monitor,
};
const SEV_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];
const SEG_COL: Record<string, number> = {
  Tashqi: 0,
  Perimetr: 1,
  Yadro: 2,
  DMZ: 3,
  "Server farm": 3,
  "Ichki tarmoq": 2,
  Endpoint: 1,
};

interface Pos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
type PosMap = Record<string, Pos>;

function seedPositions(topo: Topology): PosMap {
  const p: PosMap = {};
  topo.nodes.forEach((n, i) => {
    const seed = (SEG_COL[n.segment] ?? 1) + 0.5;
    p[n.id] = {
      x: 120 + seed * 150 + Math.cos(i * 1.7) * 40,
      y: 90 + ((i * 97) % (H - 180)) + Math.sin(i * 2.1) * 30,
      vx: 0,
      vy: 0,
    };
  });
  return p;
}

// One iteration of the spring/charge simulation (mutates `pos`).
function simStep(topo: Topology, pos: PosMap, alpha: number, dragId: string | null) {
  const { nodes, edges } = topo;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = pos[nodes[i].id];
      const b = pos[nodes[j].id];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy || 1;
      const f = 5200 / d2;
      const d = Math.sqrt(d2);
      a.vx += (dx / d) * f;
      a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f;
      b.vy -= (dy / d) * f;
    }
  }
  edges.forEach((e) => {
    const a = pos[e.s];
    const b = pos[e.t];
    if (!a || !b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const f = (d - 132) * 0.035;
    a.vx += (dx / d) * f;
    a.vy += (dy / d) * f;
    b.vx -= (dx / d) * f;
    b.vy -= (dy / d) * f;
  });
  nodes.forEach((n) => {
    const a = pos[n.id];
    a.vx += (W / 2 - a.x) * 0.004;
    a.vy += (H / 2 - a.y) * 0.004;
    if (dragId === n.id) {
      a.vx = 0;
      a.vy = 0;
      return;
    }
    a.vx *= 0.86;
    a.vy *= 0.86;
    a.x += a.vx * alpha;
    a.y += a.vy * alpha;
    a.x = Math.max(44, Math.min(W - 44, a.x));
    a.y = Math.max(44, Math.min(H - 52, a.y));
  });
}

function settle(topo: Topology, pos: PosMap, iters: number) {
  let alpha = 1;
  for (let f = 0; f < iters && alpha > 0.02; f++) {
    simStep(topo, pos, alpha, null);
    alpha *= 0.985;
  }
}

const clampK = (n: number) => Math.max(0.4, Math.min(3, n));

export interface TopologyScreenProps {
  topology: Topology;
  findings: Finding[];
  auditCode: string;
  audits: Audit[];
  auditId: string;
  latestAi: TopologyAnalysis | null;
}

export function TopologyScreen({
  topology,
  findings,
  auditCode,
  audits,
  auditId,
  latestAi,
}: TopologyScreenProps) {
  const t = useTranslations("topology");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const toast = useToast();

  const [ai, setAi] = useState<TopologyAnalysis | null>(latestAi);
  const [aiPending, setAiPending] = useState(false);
  const [aiDegraded, setAiDegraded] = useState(false);
  const [enrichPending, setEnrichPending] = useState(false);
  const autoRan = useRef(false);

  async function runAi() {
    setAiPending(true);
    setAiDegraded(false);
    try {
      const res = await analyzeTopology({ auditId });
      if (res.ok && res.analysis) setAi(res.analysis);
      else setAiDegraded(true);
    } finally {
      setAiPending(false);
    }
  }

  async function runEnrich() {
    setEnrichPending(true);
    try {
      const r = await enrichTopology({ auditId });
      if (r.ok) {
        toast(t("aiEnrichDone"), "success");
        router.refresh();
      } else {
        toast(t("aiEnrichFailed"), "danger");
      }
    } finally {
      setEnrichPending(false);
    }
  }

  // Auto-run the AI analysis once on load when none is stored yet (graceful).
  useEffect(() => {
    if (autoRan.current || ai || topology.nodes.length === 0) return;
    autoRan.current = true;
    const raf = requestAnimationFrame(() => void runAi());
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectAudit(id: string) {
    if (id !== auditId) router.push(`/analysis/topology?audit=${encodeURIComponent(id)}`);
  }

  const svgRef = useRef<SVGSVGElement>(null);
  const posRef = useRef<PosMap | null>(null);
  const dragRef = useRef<string | null>(null);
  const viewRef = useRef({ k: 1, tx: 0, ty: 0 });
  const panRef = useRef<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  const [, setTick] = useState(0);
  const [sel, setSel] = useState(topology.nodes[0]?.id ?? "");
  const [sevFilter, setSevFilter] = useState<Partial<Record<Severity, boolean>>>({});
  const [showFlag, setShowFlag] = useState(true);

  if (posRef.current == null) posRef.current = seedPositions(topology);

  // Force simulation — animate only when motion is allowed; otherwise settle once.
  useEffect(() => {
    const pos = posRef.current;
    if (!pos) return;
    const reduced =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    let raf = 0;
    if (reduced) {
      settle(topology, pos, 260);
      // Defer the re-render out of the effect body (avoids sync setState-in-effect).
      raf = requestAnimationFrame(() => setTick((x) => x + 1));
      return () => cancelAnimationFrame(raf);
    }
    let alpha = 1;
    let frame = 0;
    const step = () => {
      simStep(topology, pos, alpha, dragRef.current);
      alpha *= 0.985;
      frame++;
      setTick((x) => x + 1);
      if (frame < 600 && alpha > 0.02) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function svgPoint(evt: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    if (!svg || typeof svg.createSVGPoint !== "function") return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function zoomAt(factor: number, cx: number, cy: number) {
    const v = viewRef.current;
    const nk = clampK(v.k * factor);
    const gx = (cx - v.tx) / v.k;
    const gy = (cy - v.ty) / v.k;
    v.k = nk;
    v.tx = cx - gx * nk;
    v.ty = cy - gy * nk;
    setTick((x) => x + 1);
  }

  // Native non-passive wheel listener so we can preventDefault for zoom.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = svgPoint(e);
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const toGraph = (sx: number, sy: number) => {
    const v = viewRef.current;
    return { x: (sx - v.tx) / v.k, y: (sy - v.ty) / v.k };
  };

  function onDown(id: string, e: React.PointerEvent) {
    e.stopPropagation();
    dragRef.current = id;
    setSel(id);
  }
  function onBgDown(e: React.PointerEvent) {
    if ((e.target as Element).closest?.(".topo-node")) return;
    const { x, y } = svgPoint(e);
    const v = viewRef.current;
    panRef.current = { sx: x, sy: y, tx: v.tx, ty: v.ty };
  }
  function onMove(e: React.PointerEvent) {
    const pos = posRef.current;
    if (!pos) return;
    if (dragRef.current) {
      const sp = svgPoint(e);
      const g = toGraph(sp.x, sp.y);
      const a = pos[dragRef.current];
      a.x = Math.max(44, Math.min(W - 44, g.x));
      a.y = Math.max(44, Math.min(H - 52, g.y));
      a.vx = 0;
      a.vy = 0;
      setTick((x) => x + 1);
      return;
    }
    if (panRef.current) {
      const p = svgPoint(e);
      const v = viewRef.current;
      v.tx = panRef.current.tx + (p.x - panRef.current.sx);
      v.ty = panRef.current.ty + (p.y - panRef.current.sy);
      setTick((x) => x + 1);
    }
  }
  function onUp() {
    dragRef.current = null;
    panRef.current = null;
  }

  function fit() {
    const pos = posRef.current;
    if (!pos) return;
    const xs = topology.nodes.map((n) => pos[n.id].x);
    const ys = topology.nodes.map((n) => pos[n.id].y);
    const minX = Math.min(...xs) - 60;
    const maxX = Math.max(...xs) + 60;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 60;
    const bw = maxX - minX;
    const bh = maxY - minY;
    const k = clampK(Math.min(W / bw, H / bh));
    const v = viewRef.current;
    v.k = k;
    v.tx = (W - bw * k) / 2 - minX * k;
    v.ty = (H - bh * k) / 2 - minY * k;
    setTick((x) => x + 1);
  }
  function resetView() {
    viewRef.current = { k: 1, tx: 0, ty: 0 };
    setTick((x) => x + 1);
  }
  function relayout() {
    const pos = posRef.current;
    if (!pos) return;
    topology.nodes.forEach((n, i) => {
      pos[n.id].x = 120 + Math.cos(i) * 200 + W / 2 - 200;
      pos[n.id].y = H / 2 + Math.sin(i * 1.3) * 180;
      pos[n.id].vx = 0;
      pos[n.id].vy = 0;
    });
    settle(topology, pos, 260);
    setTick((x) => x + 1);
    toast(t("relayouted"), "info");
  }

  const pos = posRef.current;
  const isHidden = (id: string) => {
    const n = topology.nodes.find((x) => x.id === id);
    return n ? Boolean(sevFilter[n.sev]) : true;
  };
  const selNode = topology.nodes.find((n) => n.id === sel);
  const linkedFindings = useMemo(
    () =>
      selNode
        ? findings.filter(
            (f) => f.asset && (f.asset.includes(selNode.label) || selNode.label.includes(f.asset)),
          )
        : [],
    [selNode, findings],
  );
  const sevCounts = SEV_ORDER.reduce<Record<string, number>>((m, s) => {
    m[s] = topology.nodes.filter((n) => n.sev === s).length;
    return m;
  }, {});
  const kindLabel = (k: NodeKind) => t(`kind${k.charAt(0).toUpperCase()}${k.slice(1)}`);
  const v = viewRef.current;

  const auditSelect =
    audits.length > 1 ? (
      <Select
        value={auditId}
        onChange={selectAudit}
        style={{ width: 220 }}
        options={audits.map((a) => ({ value: a.id, label: a.code }))}
      />
    ) : null;

  if (topology.nodes.length === 0) {
    return (
      <div className="route-anim">
        <PageHeader
          crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
          title={t("title")}
          sub={t("sub", { audit: auditCode, nodes: 0, edges: 0 })}
          actions={auditSelect ?? undefined}
        />
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <Network size={32} style={{ margin: "0 auto 12px", color: "var(--brand)" }} />
          <h3 style={{ fontSize: 17 }}>{t("empty")}</h3>
          <p className="text-sm text-muted" style={{ marginTop: 6 }}>
            {t("emptyHint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub", {
          audit: auditCode,
          nodes: topology.nodes.length,
          edges: topology.edges.length,
        })}
        actions={
          <>
            {auditSelect}
            <Button size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={relayout}>
              {t("relayout")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Save size={14} />}
              onClick={() => toast(t("layoutSaved"), "success")}
            >
              {t("saveLayout")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Download size={14} />}
              onClick={() => toast(t("exported"), "success")}
            >
              {t("export")}
            </Button>
          </>
        }
      />

      <div className="topo-toolbar">
        <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginRight: 2 }}>
          {t("filter")}
        </span>
        {SEV_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            className={`btn btn--sm ${sevFilter[s] ? "btn--ghost" : "btn--soft"}`}
            style={{ opacity: sevFilter[s] ? 0.5 : 1, gap: 6 }}
            onClick={() => setSevFilter((f) => ({ ...f, [s]: !f[s] }))}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 9,
                background: SEV_COLOR[s],
                display: "inline-block",
              }}
            />
            <span style={{ textTransform: "capitalize" }}>{s}</span>
            <span className="tabular" style={{ color: "var(--text-tertiary)" }}>
              {sevCounts[s]}
            </span>
          </button>
        ))}
        <button
          type="button"
          className={`btn btn--sm ${showFlag ? "btn--soft" : "btn--ghost"}`}
          style={{ marginLeft: "auto", gap: 6 }}
          onClick={() => setShowFlag((x) => !x)}
        >
          <Activity size={13} style={{ color: "var(--status-danger-fg)" }} />
          <span>{t("suspiciousFlow")}</span>
        </button>
      </div>

      <div className="ai-card" style={{ marginBottom: 16 }}>
        <div className="ai-card__inner">
          <div className="ai-card__head">
            <div className="ai-card__icon">
              <Sparkles size={14} />
            </div>
            <span className="ai-card__title">{t("aiTitle")}</span>
            <Button
              size="xs"
              variant="soft"
              icon={<RefreshCw size={12} className={aiPending ? "spin" : undefined} />}
              onClick={() => void runAi()}
              disabled={aiPending}
              style={{ marginLeft: "auto" }}
            >
              {aiPending ? t("aiAnalyzing") : t("aiAnalyze")}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              icon={<Sparkles size={12} className={enrichPending ? "spin" : undefined} />}
              onClick={() => void runEnrich()}
              disabled={enrichPending}
              style={{ marginLeft: 8 }}
            >
              {enrichPending ? t("aiEnriching") : t("aiEnrich")}
            </Button>
          </div>
          <TopologyAiResult
            analysis={ai}
            loading={aiPending}
            degraded={aiDegraded}
            onSelectNode={setSel}
          />
        </div>
      </div>

      <div className="topo-grid">
        <div className="topo-canvas">
          <svg
            ref={svgRef}
            className="topo-svg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            onPointerDown={onBgDown}
          >
            <g transform={`translate(${v.tx},${v.ty}) scale(${v.k})`}>
              <g>
                {pos &&
                  topology.edges.map((e, i) => {
                    const a = pos[e.s];
                    const b = pos[e.t];
                    if (!a || !b) return null;
                    if (e.flag && !showFlag) return null;
                    if (isHidden(e.s) || isHidden(e.t)) return null;
                    return (
                      <g key={i}>
                        <line
                          className={`topo-edge${e.flag ? " topo-edge--flag" : ""}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                        />
                        <line
                          className={`topo-flow${e.flag ? " topo-flow--flag" : ""}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                        />
                      </g>
                    );
                  })}
              </g>
              <g>
                {pos &&
                  topology.nodes.map((n) => {
                    const p = pos[n.id];
                    if (!p || isHidden(n.id)) return null;
                    const color = SEV_COLOR[n.sev];
                    const Glyph = KIND_ICON[n.kind] ?? Server;
                    const isSel = sel === n.id;
                    return (
                      <g
                        key={n.id}
                        className={`topo-node${isSel ? " topo-node--sel" : ""}`}
                        transform={`translate(${p.x},${p.y})`}
                        onPointerDown={(e) => onDown(n.id, e)}
                        onClick={() => setSel(n.id)}
                      >
                        {isSel ? (
                          <circle r={30} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />
                        ) : null}
                        {n.findings > 0 && (n.sev === "critical" || n.sev === "high") ? (
                          <circle
                            className="topo-pulse"
                            r={22}
                            fill="none"
                            stroke={color}
                            style={{ "--pc": color } as React.CSSProperties}
                          />
                        ) : null}
                        <circle className="topo-node__ring" r={22} stroke={color} />
                        <g transform="translate(-9,-9)" style={{ color }}>
                          <Glyph size={18} />
                        </g>
                        <text className="topo-node__label" y={38}>
                          {n.label}
                        </text>
                        {n.findings > 0 ? (
                          <g transform="translate(16,-16)">
                            <circle className="topo-badge" r={9} />
                            <text className="topo-badge__t" y={3}>
                              {n.findings}
                            </text>
                          </g>
                        ) : null}
                        {n.aiLabel ? (
                          <g transform="translate(-20,-17)">
                            <circle r={6} fill="var(--brand)" opacity={0.85} />
                            <text
                              style={{
                                fontSize: 8,
                                fill: "white",
                                textAnchor: "middle",
                                fontFamily: "inherit",
                              }}
                              y={3}
                            >
                              ✦
                            </text>
                          </g>
                        ) : null}
                      </g>
                    );
                  })}
              </g>
            </g>
          </svg>

          <div className="topo-ctrl">
            <button type="button" title={t("zoomIn")} onClick={() => zoomAt(1.2, W / 2, H / 2)}>
              <Plus size={16} />
            </button>
            <button
              type="button"
              title={t("zoomOut")}
              onClick={() => zoomAt(1 / 1.2, W / 2, H / 2)}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>−</span>
            </button>
            <button type="button" title={t("fit")} onClick={fit}>
              <Maximize2 size={15} />
            </button>
            <button type="button" title={t("reset")} onClick={resetView}>
              <RefreshCw size={15} />
            </button>
          </div>
          <div className="topo-zoom-label">{Math.round(v.k * 100)}%</div>
          <div className="topo-hint">{t("hint")}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <Server size={15} />
                <span>{t("nodeDetail")}</span>
              </div>
            </div>
            {selNode ? (
              <div className="panel__body">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      background: "var(--bg-surface-2)",
                      border: `1.5px solid ${SEV_COLOR[selNode.sev]}`,
                      color: SEV_COLOR[selNode.sev],
                    }}
                  >
                    {(() => {
                      const G = KIND_ICON[selNode.kind] ?? Server;
                      return <G size={20} />;
                    })()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="font-mono"
                      style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}
                    >
                      {selNode.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {kindLabel(selNode.kind)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="topo-detail__kv">
                    <span className="topo-detail__k">{t("ip")}</span>
                    <span className="topo-detail__v font-mono">{selNode.ip}</span>
                  </div>
                  <div className="topo-detail__kv">
                    <span className="topo-detail__k">{t("segment")}</span>
                    <span className="topo-detail__v">{selNode.segment}</span>
                  </div>
                  {selNode.aiLabel ? (
                    <>
                      <div className="topo-detail__kv">
                        <span className="topo-detail__k">{t("aiEnrichedLabel")}</span>
                        <span className="topo-detail__v">{selNode.aiLabel}</span>
                      </div>
                      <div className="topo-detail__kv">
                        <span className="topo-detail__k">{t("aiEnrichedReason")}</span>
                        <span
                          className="topo-detail__v"
                          style={{ color: "var(--text-tertiary)", fontSize: 12 }}
                        >
                          {selNode.aiReason}
                        </span>
                      </div>
                    </>
                  ) : null}
                  <div className="topo-detail__kv">
                    <span className="topo-detail__k">{t("topSev")}</span>
                    <span className="topo-detail__v">
                      <Sev level={selNode.sev} />
                    </span>
                  </div>
                  <div className="topo-detail__kv">
                    <span className="topo-detail__k">{t("findingsLabel")}</span>
                    <span
                      className="topo-detail__v tabular font-semi"
                      style={{
                        color: selNode.findings
                          ? "var(--status-danger-fg)"
                          : "var(--text-tertiary)",
                      }}
                    >
                      {t("findingsCount", { n: selNode.findings })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel__body" style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
                {t("selectNode")}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <AlertTriangle size={15} />
                <span>{t("linkedTitle")}</span>
              </div>
              <span className="tag tag--ghost tabular">{linkedFindings.length}</span>
            </div>
            <div className="panel__body" style={{ padding: linkedFindings.length ? 0 : 16 }}>
              {linkedFindings.length ? (
                linkedFindings.map((f, i) => (
                  <div
                    key={f.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push("/findings")}
                    onKeyDown={(e) => e.key === "Enter" && router.push("/findings")}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "12px 16px",
                      borderBottom:
                        i < linkedFindings.length - 1 ? "1px solid var(--border-color)" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <Sev level={f.severity} />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          lineHeight: 1.35,
                        }}
                      >
                        {f.title}
                      </div>
                      <div className="cell-sub">
                        <span className="font-mono">{f.id}</span> · CVSS {f.cvss}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{t("noLinked")}</span>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <Info size={15} />
                <span>{t("legend")}</span>
              </div>
            </div>
            <div className="topo-legend">
              {SEV_ORDER.map((s) => (
                <span key={s} className="topo-legend__i">
                  <span className="topo-legend__dot" style={{ background: SEV_COLOR[s] }} />
                  <span style={{ textTransform: "capitalize" }}>{s}</span>
                </span>
              ))}
              <span className="topo-legend__i">
                <span
                  style={{ width: 16, height: 0, borderTop: "2px dashed var(--status-danger-fg)" }}
                />
                <span>{t("suspiciousFlow")}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
