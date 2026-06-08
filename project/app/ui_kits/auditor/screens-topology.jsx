/* Network topology — interactive force-directed graph (TZ §10.4).
   Self-contained spring/charge simulation in SVG, draggable nodes,
   severity + segment filtering, node inspector with linked findings. */
(function () {
  const { useState, useRef, useEffect, useMemo } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  const PageHeader = window.PageHeader;
  const Sev = window.Sev;

  const W = 940, H = 600;

  const SEV_COLOR = {
    critical: "var(--status-danger-fg)",
    high:     "var(--status-warning-fg)",
    medium:   "var(--status-info-fg)",
    low:      "var(--status-success-fg)",
    info:     "var(--text-tertiary)",
  };
  const KIND_ICON = {
    cloud: I.Globe, firewall: I.Shield, ips: I.ShieldAlert, vpn: I.Lock,
    switch: I.Network, server: I.Server, web: I.Globe, db: I.Database,
    wifi: I.Wifi, endpoint: I.Monitor,
  };
  const KIND_LABEL = {
    cloud: "Tashqi tarmoq", firewall: "Firewall", ips: "IDS/IPS", vpn: "VPN gateway",
    switch: "Kommutator", server: "Server", web: "Web server", db: "Ma’lumotlar bazasi",
    wifi: "Wi-Fi controller", endpoint: "Endpoint",
  };
  const SEV_ORDER = ["critical", "high", "medium", "low", "info"];

  function TopologyScreen({ setRoute }) {
    const topo = D.TOPOLOGY;
    const svgRef = useRef(null);
    const posRef = useRef(null);
    const dragRef = useRef(null);
    const viewRef = useRef({ k: 1, tx: 0, ty: 0 });
    const panRef = useRef(null);
    const [, setTick] = useState(0);
    const [sel, setSel] = useState("fw");
    const [sevFilter, setSevFilter] = useState({});   // {sev:true} = hidden
    const [showFlag, setShowFlag] = useState(true);

    // ---- init positions (seeded by segment) ----
    if (!posRef.current) {
      const segCols = { "Tashqi": 0, "Perimetr": 1, "Yadro": 2, "DMZ": 3, "Server farm": 3, "Ichki tarmoq": 2, "Endpoint": 1 };
      const p = {};
      topo.nodes.forEach((n, i) => {
        const seed = (segCols[n.segment] || 1) + 0.5;
        p[n.id] = {
          x: 120 + seed * 150 + Math.cos(i * 1.7) * 40,
          y: 90 + ((i * 97) % (H - 180)) + Math.sin(i * 2.1) * 30,
          vx: 0, vy: 0,
        };
      });
      posRef.current = p;
    }

    // ---- force simulation ----
    useEffect(() => {
      let raf, alpha = 1, frame = 0;
      const nodes = topo.nodes, edges = topo.edges, pos = posRef.current;
      function step() {
        frame++;
        // charge (repulsion)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = pos[nodes[i].id], b = pos[nodes[j].id];
            let dx = a.x - b.x, dy = a.y - b.y;
            let d2 = dx * dx + dy * dy || 1;
            const f = 5200 / d2;
            const d = Math.sqrt(d2);
            const ux = dx / d, uy = dy / d;
            a.vx += ux * f; a.vy += uy * f;
            b.vx -= ux * f; b.vy -= uy * f;
          }
        }
        // springs (edges)
        edges.forEach(e => {
          const a = pos[e.s], b = pos[e.t];
          if (!a || !b) return;
          let dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - 132) * 0.035;
          const ux = dx / d, uy = dy / d;
          a.vx += ux * f; a.vy += uy * f;
          b.vx -= ux * f; b.vy -= uy * f;
        });
        // centering + integrate
        nodes.forEach(n => {
          const a = pos[n.id];
          a.vx += (W / 2 - a.x) * 0.004;
          a.vy += (H / 2 - a.y) * 0.004;
          if (dragRef.current === n.id) { a.vx = 0; a.vy = 0; return; }
          a.vx *= 0.86; a.vy *= 0.86;
          a.x += a.vx * alpha; a.y += a.vy * alpha;
          a.x = Math.max(44, Math.min(W - 44, a.x));
          a.y = Math.max(44, Math.min(H - 52, a.y));
        });
        alpha *= 0.985;
        setTick(t => t + 1);
        if (frame < 600 && alpha > 0.02) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, []);

    function relayout() {
      const pos = posRef.current;
      topo.nodes.forEach((n, i) => {
        pos[n.id].x = 120 + Math.cos(i) * 200 + W / 2 - 200;
        pos[n.id].y = H / 2 + Math.sin(i * 1.3) * 180;
        pos[n.id].vx = (Math.random() - 0.5) * 4; pos[n.id].vy = (Math.random() - 0.5) * 4;
      });
      // re-run a short relaxation
      let a = 1, f = 0;
      (function loop() {
        f++;
        const nodes = topo.nodes, edges = topo.edges;
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
          const A = pos[nodes[i].id], B = pos[nodes[j].id];
          let dx = A.x - B.x, dy = A.y - B.y, d2 = dx * dx + dy * dy || 1, ff = 5200 / d2, d = Math.sqrt(d2);
          A.vx += dx / d * ff; A.vy += dy / d * ff; B.vx -= dx / d * ff; B.vy -= dy / d * ff;
        }
        edges.forEach(e => { const A = pos[e.s], B = pos[e.t]; if (!A || !B) return; let dx = B.x - A.x, dy = B.y - A.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ff = (d - 132) * 0.035; A.vx += dx / d * ff; A.vy += dy / d * ff; B.vx -= dx / d * ff; B.vy -= dy / d * ff; });
        nodes.forEach(n => { const A = pos[n.id]; A.vx += (W / 2 - A.x) * 0.004; A.vy += (H / 2 - A.y) * 0.004; A.vx *= 0.86; A.vy *= 0.86; A.x += A.vx * a; A.y += A.vy * a; A.x = Math.max(44, Math.min(W - 44, A.x)); A.y = Math.max(44, Math.min(H - 52, A.y)); });
        a *= 0.985; setTick(t => t + 1);
        if (f < 260 && a > 0.02) requestAnimationFrame(loop);
      })();
      window.showToast("Topologiya qayta joylashtirildi", "info");
    }

    // ---- drag ----
    function svgPoint(evt) {
      const svg = svgRef.current; if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
      const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
      const p = pt.matrixTransform(m.inverse()); return { x: p.x, y: p.y };
    }
    function onDown(id, e) { e.stopPropagation(); dragRef.current = id; setSel(id); }
    function toGraph(sx, sy) { const v = viewRef.current; return { x: (sx - v.tx) / v.k, y: (sy - v.ty) / v.k }; }
    function onBgDown(e) {
      if (e.target.closest && e.target.closest(".topo-node")) return; // node handles its own drag
      const { x, y } = svgPoint(e); const v = viewRef.current;
      panRef.current = { sx: x, sy: y, tx: v.tx, ty: v.ty };
    }
    function onMove(e) {
      if (dragRef.current) {
        const p = svgPoint(e); const g = toGraph(p.x, p.y);
        const a = posRef.current[dragRef.current];
        a.x = Math.max(44, Math.min(W - 44, g.x)); a.y = Math.max(44, Math.min(H - 52, g.y)); a.vx = 0; a.vy = 0;
        setTick(t => t + 1); return;
      }
      if (panRef.current) {
        const p = svgPoint(e); const v = viewRef.current;
        v.tx = panRef.current.tx + (p.x - panRef.current.sx);
        v.ty = panRef.current.ty + (p.y - panRef.current.sy);
        setTick(t => t + 1);
      }
    }
    function onUp() { dragRef.current = null; panRef.current = null; }

    function clampK(n) { return Math.max(0.4, Math.min(3, n)); }
    function zoomAt(factor, cx, cy) {
      const v = viewRef.current; const nk = clampK(v.k * factor);
      const gx = (cx - v.tx) / v.k, gy = (cy - v.ty) / v.k;
      v.k = nk; v.tx = cx - gx * nk; v.ty = cy - gy * nk; setTick(t => t + 1);
    }
    function fit() {
      const pos = posRef.current; const xs = topo.nodes.map(n => pos[n.id].x), ys = topo.nodes.map(n => pos[n.id].y);
      const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60, minY = Math.min(...ys) - 60, maxY = Math.max(...ys) + 60;
      const bw = maxX - minX, bh = maxY - minY;
      const k = clampK(Math.min(W / bw, H / bh));
      const v = viewRef.current; v.k = k; v.tx = (W - bw * k) / 2 - minX * k; v.ty = (H - bh * k) / 2 - minY * k; setTick(t => t + 1);
    }
    function resetView() { const v = viewRef.current; v.k = 1; v.tx = 0; v.ty = 0; setTick(t => t + 1); }

    // wheel zoom (native, non-passive so we can preventDefault)
    useEffect(() => {
      const svg = svgRef.current; if (!svg) return undefined;
      function onWheel(e) { e.preventDefault(); const p = svgPoint(e); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y); }
      svg.addEventListener("wheel", onWheel, { passive: false });
      return () => svg.removeEventListener("wheel", onWheel);
    }, []);

    const pos = posRef.current;
    const hidden = id => sevFilter[topo.nodes.find(n => n.id === id).sev];
    const selNode = topo.nodes.find(n => n.id === sel);
    const linkedFindings = useMemo(
      () => selNode ? D.FINDINGS.filter(f => f.asset && (f.asset.includes(selNode.label) || selNode.label.includes(f.asset))) : [],
      [sel]
    );
    const sevCounts = SEV_ORDER.reduce((m, s) => (m[s] = topo.nodes.filter(n => n.sev === s).length, m), {});

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Tarmoq topologiyasi" }],
        title: "Tarmoq topologiyasi",
        sub: "AUD-2026-014 · PCAP va skaner ma’lumotlaridan qurilgan aktivlar grafi · " + topo.nodes.length + " tugun · " + topo.edges.length + " bog‘lanish",
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: relayout }, [h(I.Refresh, { size: 14, key: "i" }), h("span", { key: "t" }, "Avtomatik joylashuv")]),
          h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("Topologiya layouti saqlandi", "success") }, [h(I.Save, { size: 14, key: "i" }), h("span", { key: "t" }, "Layoutni saqlash")]),
          h("button", { key: 3, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("PNG sifatida eksport qilindi", "success") }, [h(I.Download, { size: 14, key: "i" }), h("span", { key: "t" }, "Eksport")]),
        ],
      }),

      // toolbar — severity filter chips
      h("div", { key: "tb", className: "topo-toolbar" }, [
        h("span", { key: "l", style: { fontSize: 12, color: "var(--text-tertiary)", marginRight: 2 } }, "Filtr:"),
        ...SEV_ORDER.map(s => h("button", {
          key: s,
          className: "btn btn--sm " + (sevFilter[s] ? "btn--ghost" : "btn--soft"),
          style: { opacity: sevFilter[s] ? 0.5 : 1, gap: 6 },
          onClick: () => setSevFilter(f => ({ ...f, [s]: !f[s] })),
        }, [
          h("span", { key: "d", style: { width: 9, height: 9, borderRadius: 9, background: SEV_COLOR[s], display: "inline-block" } }),
          h("span", { key: "t", style: { textTransform: "capitalize" } }, s),
          h("span", { key: "n", className: "tabular", style: { color: "var(--text-tertiary)" } }, sevCounts[s]),
        ])),
        h("button", {
          key: "flag",
          className: "btn btn--sm " + (showFlag ? "btn--soft" : "btn--ghost"),
          style: { marginLeft: "auto", gap: 6 },
          onClick: () => setShowFlag(v => !v),
        }, [h(I.Activity, { size: 13, key: "i", style: { color: "var(--status-danger-fg)" } }), h("span", { key: "t" }, "Shubhali oqim")]),
      ]),

      h("div", { key: "grid", className: "topo-grid" }, [
        // ---- canvas ----
        h("div", { key: "c", className: "topo-canvas" }, [
          h("svg", {
            key: "svg",
            ref: svgRef, className: "topo-svg", viewBox: `0 0 ${W} ${H}`,
            preserveAspectRatio: "xMidYMid meet",
            onPointerMove: onMove, onPointerUp: onUp, onPointerLeave: onUp, onPointerDown: onBgDown,
          }, [
            h("g", { key: "vp", transform: `translate(${viewRef.current.tx},${viewRef.current.ty}) scale(${viewRef.current.k})` }, [
            // edges
            h("g", { key: "edges" }, topo.edges.map((e, i) => {
              const a = pos[e.s], b = pos[e.t];
              if (!a || !b) return null;
              if (e.flag && !showFlag) return null;
              if (hidden(e.s) || hidden(e.t)) return null;
              return h("g", { key: i }, [
                h("line", {
                  key: "base", className: "topo-edge" + (e.flag ? " topo-edge--flag" : ""),
                  x1: a.x, y1: a.y, x2: b.x, y2: b.y,
                }),
                // live traffic overlay (flowing packets)
                h("line", {
                  key: "flow", className: "topo-flow" + (e.flag ? " topo-flow--flag" : ""),
                  x1: a.x, y1: a.y, x2: b.x, y2: b.y,
                }),
              ]);
            })),
            // nodes
            h("g", { key: "nodes" }, topo.nodes.map(n => {
              const p = pos[n.id]; if (!p) return null;
              if (hidden(n.id)) return null;
              const color = SEV_COLOR[n.sev];
              const Glyph = KIND_ICON[n.kind] || I.Server;
              const isSel = sel === n.id;
              return h("g", {
                key: n.id, className: "topo-node" + (isSel ? " topo-node--sel" : ""),
                transform: `translate(${p.x},${p.y})`,
                onPointerDown: e => onDown(n.id, e),
                onClick: () => setSel(n.id),
              }, [
                isSel ? h("circle", { key: "halo", r: 30, fill: "none", stroke: color, strokeWidth: 1, opacity: 0.4 }) : null,
                // pulsing alert ring on nodes with critical/high findings
                (n.findings > 0 && (n.sev === "critical" || n.sev === "high"))
                  ? h("circle", { key: "pulse", className: "topo-pulse", r: 22, fill: "none", stroke: color, style: { ["--pc"]: color } })
                  : null,
                h("circle", { key: "ring", className: "topo-node__ring", r: 22, stroke: color }),
                h("g", { key: "ic", transform: "translate(-9,-9)", style: { color } }, h(Glyph, { size: 18 })),
                h("text", { key: "lab", className: "topo-node__label", y: 38 }, n.label),
                n.findings > 0 ? h("g", { key: "badge", transform: "translate(16,-16)" }, [
                  h("circle", { key: "bg", className: "topo-badge", r: 9 }),
                  h("text", { key: "t", className: "topo-badge__t", y: 3 }, n.findings),
                ]) : null,
              ]);
            })),
            ]),
          ]),
          // zoom / pan controls
          h("div", { key: "ctrl", className: "topo-ctrl" }, [
            h("button", { key: "in", title: "Kattalashtirish", onClick: () => zoomAt(1.2, W / 2, H / 2) }, h(I.Plus, { size: 16 })),
            h("button", { key: "out", title: "Kichraytirish", onClick: () => zoomAt(1 / 1.2, W / 2, H / 2) }, h("span", { style: { fontSize: 18, lineHeight: 1 } }, "\u2212")),
            h("button", { key: "fit", title: "Ekranga moslash", onClick: fit }, h(I.Maximize2, { size: 15 })),
            h("button", { key: "reset", title: "Tiklash", onClick: resetView }, h(I.Refresh, { size: 15 })),
          ]),
          h("div", { key: "zl", className: "topo-zoom-label" }, Math.round(viewRef.current.k * 100) + "%"),
          h("div", { key: "hint", className: "topo-hint" }, "Sudrab suring · g‘ildirak bilan masshtab · tugunni ushlab joylashtiring"),
        ]),

        // ---- side column ----
        h("div", { key: "side", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          // inspector
          h("div", { key: "insp", className: "panel" }, [
            h("div", { className: "panel__h", key: "h" }, h("div", { className: "panel__t" }, [h(I.Server, { size: 15, key: "i" }), h("span", { key: "t" }, "Tugun tafsiloti")])),
            selNode ? h("div", { className: "panel__body", key: "b" }, [
              h("div", { key: "top", style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 } }, [
                h("div", { key: "ic", style: { width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--bg-surface-2)", border: "1.5px solid " + SEV_COLOR[selNode.sev], color: SEV_COLOR[selNode.sev] } }, h(KIND_ICON[selNode.kind] || I.Server, { size: 20 })),
                h("div", { key: "t", style: { minWidth: 0 } }, [
                  h("div", { key: 1, className: "font-mono", style: { fontSize: 14, fontWeight: 700, color: "var(--text-primary)" } }, selNode.label),
                  h("div", { key: 2, style: { fontSize: 12, color: "var(--text-tertiary)" } }, KIND_LABEL[selNode.kind] || selNode.kind),
                ]),
              ]),
              h("div", { key: "kv" }, [
                ["IP manzil", h("span", { className: "font-mono" }, selNode.ip)],
                ["Segment", selNode.segment],
                ["Eng yuqori xavf", h(Sev, { level: selNode.sev })],
                ["Topilmalar", h("span", { className: "tabular font-semi", style: { color: selNode.findings ? "var(--status-danger-fg)" : "var(--text-tertiary)" } }, selNode.findings + " ta")],
              ].map(([k, v]) => h("div", { key: k, className: "topo-detail__kv" }, [
                h("span", { key: 1, className: "topo-detail__k" }, k),
                h("span", { key: 2, className: "topo-detail__v" }, v),
              ]))),
            ]) : h("div", { className: "panel__body", key: "b", style: { color: "var(--text-tertiary)", fontSize: 13 } }, "Tugunni tanlang."),
          ]),

          // linked findings
          h("div", { key: "lf", className: "panel" }, [
            h("div", { className: "panel__h", key: "h" }, [
              h("div", { className: "panel__t" }, [h(I.AlertTriangle, { size: 15, key: "i" }), h("span", { key: "t" }, "Bog‘liq topilmalar")]),
              h("span", { key: "c", className: "tag tag--ghost tabular" }, linkedFindings.length),
            ]),
            h("div", { className: "panel__body", key: "b", style: { padding: linkedFindings.length ? 0 : 16 } },
              linkedFindings.length
                ? linkedFindings.map((f, i) => h("div", {
                    key: f.id,
                    style: { display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", borderBottom: i < linkedFindings.length - 1 ? "1px solid var(--border-color)" : "none", cursor: "pointer" },
                    onClick: () => { setRoute("findings"); },
                  }, [
                    h(Sev, { key: "s", level: f.severity }),
                    h("div", { key: "b", style: { minWidth: 0 } }, [
                      h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35 } }, f.title),
                      h("div", { key: 2, className: "cell-sub" }, [h("span", { key: 1, className: "font-mono" }, f.id), " · CVSS " + f.cvss]),
                    ]),
                  ]))
                : h("span", { style: { color: "var(--text-tertiary)", fontSize: 13 } }, "Bu tugunda ro‘yxatga olingan topilma yo‘q.")
            ),
          ]),

          // legend
          h("div", { key: "lg", className: "panel" }, [
            h("div", { className: "panel__h", key: "h" }, h("div", { className: "panel__t" }, [h(I.Info, { size: 15, key: "i" }), h("span", { key: "t" }, "Izoh")])),
            h("div", { key: "b", className: "topo-legend" }, SEV_ORDER.map(s => h("span", { key: s, className: "topo-legend__i" }, [
              h("span", { key: "d", className: "topo-legend__dot", style: { background: SEV_COLOR[s] } }),
              h("span", { key: "t", style: { textTransform: "capitalize" } }, s),
            ])).concat([
              h("span", { key: "flag", className: "topo-legend__i" }, [
                h("span", { key: "d", style: { width: 16, height: 0, borderTop: "2px dashed var(--status-danger-fg)" } }),
                h("span", { key: "t" }, "Shubhali oqim"),
              ]),
            ])),
          ]),
        ]),
      ]),
    ]);
  }

  window.TopologyScreen = TopologyScreen;
})();
