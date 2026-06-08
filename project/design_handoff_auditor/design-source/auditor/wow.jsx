/* WOW / cinematic components — boot sequence, hero command band,
   radial gauge, threat radar, live ticker, leaderboard podium. */
(function () {
  const { useState, useEffect, useRef } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  const reducedMotion = () =>
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =========================================================================
  // CINEMATIC BOOT SEQUENCE
  // =========================================================================
  function BootSequence({ onDone }) {
    const reduce = reducedMotion();
    const lines = [
      { l: "Yopiq kontur muhiti ishga tushirilmoqda", v: "secure" },
      { l: "Ollama AI yadrosi yuklanmoqda", v: "qwen2.5:14b" },
      { l: "Audit ma'lumotlar bazasi ulanmoqda", v: "342 yozuv" },
      { l: "EXE agentlar sinxronizatsiyasi", v: "6 online" },
      { l: "Xavfsizlik telemetriyasi faollashtirildi", v: "live" },
    ];
    const [shown, setShown] = useState(reduce ? lines.length : 0);
    const [prog, setProg] = useState(reduce ? 100 : 0);
    const [out, setOut] = useState(false);

    useEffect(() => {
      if (reduce) { const t = setTimeout(onDone, 60); return () => clearTimeout(t); }
      let i = 0;
      const li = setInterval(() => { i += 1; setShown(i); if (i >= lines.length) clearInterval(li); }, 300);
      let p = 0;
      const pi = setInterval(() => {
        p += 4;
        setProg(Math.min(100, p));
        if (p >= 100) { clearInterval(pi); setOut(true); setTimeout(onDone, 560); }
      }, 90);
      return () => { clearInterval(li); clearInterval(pi); };
    }, []);

    return h("div", { className: "boot2" + (out ? " is-out" : "") },
      h("div", { className: "boot2__inner" }, [
        h("div", { key: "m", className: "boot2__mark" },
          h("svg", { viewBox: "0 0 48 52", fill: "none", stroke: "#fff", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" }, [
            h("path", { key: 1, pathLength: 1, d: "M24 3 L43 10 V25 C43 37 35 45 24 49 C13 45 5 37 5 25 V10 Z" }),
            h("path", { key: 2, pathLength: 1, d: "M15 25 l6 6 l12 -14" }),
          ])
        ),
        h("div", { key: "t", className: "boot2__title" }, ["Audit", h("span", { key: "a", className: "accent" }, "or")]),
        h("div", { key: "s", className: "boot2__sub" }, "Axborot xavfsizligi auditi"),
        h("div", { key: "log", className: "boot2__log" },
          lines.map((ln, i) => h("div", { key: i, className: "boot2__line" + (i < shown ? " show" : "") }, [
            h("span", { key: "ok", className: "ok" }, i < shown ? "✓" : "·"),
            h("span", { key: "l" }, ln.l),
            h("span", { key: "v", className: "val" }, i < shown ? ln.v : ""),
          ]))
        ),
        h("div", { key: "bar", className: "boot2__bar" }, h("i", { style: { width: prog + "%" } })),
      ])
    );
  }
  window.BootSequence = BootSequence;

  // =========================================================================
  // RADIAL GAUGE  (270° arc, gradient fill, count-up center)
  // =========================================================================
  function Gauge({ value = 0, max = 100, size = 132, stroke = 12, cap = "Posture" }) {
    const reduce = reducedMotion();
    const r = (size - stroke) / 2;
    const cx = size / 2;
    const C = 2 * Math.PI * r;
    const arc = 0.75 * C;
    const [drawn, setDrawn] = useState(reduce);
    useEffect(() => {
      if (reduce) { setDrawn(true); return undefined; }
      let raf2; const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setDrawn(true)); });
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
    }, []);
    const offset = drawn ? arc * (1 - Math.min(1, value / max)) : arc;
    return h("div", { className: "gauge", style: { width: size, height: size } }, [
      h("svg", { key: "svg", width: size, height: size, viewBox: `0 0 ${size} ${size}` }, [
        h("defs", { key: "d" },
          h("linearGradient", { id: "gaugeGrad", x1: "0", y1: "0", x2: "1", y2: "1" }, [
            h("stop", { key: 1, offset: "0%", stopColor: "var(--brand)" }),
            h("stop", { key: 2, offset: "100%", stopColor: "#38bdf8" }),
          ])
        ),
        h("circle", { key: "tr", className: "gauge__track", cx, cy: cx, r, fill: "none", strokeWidth: stroke,
          strokeDasharray: `${arc} ${C - arc}`, strokeLinecap: "round", transform: `rotate(135 ${cx} ${cx})` }),
        h("circle", { key: "fi", className: "gauge__fill", cx, cy: cx, r, fill: "none", strokeWidth: stroke,
          strokeDasharray: `${arc} ${C - arc}`, strokeDashoffset: offset, transform: `rotate(135 ${cx} ${cx})` }),
      ]),
      h("div", { key: "lab", className: "gauge__label" }, [
        h("span", { key: "n", className: "gauge__num" }, h(window.CountUp, { value })),
        h("span", { key: "c", className: "gauge__cap" }, cap),
      ]),
    ]);
  }
  window.Gauge = Gauge;

  // =========================================================================
  // THREAT RADAR
  // =========================================================================
  function ThreatRadar() {
    const blips = [
      { x: 64, y: 30, c: "crit", d: "0s" },
      { x: 78, y: 62, c: "high", d: "0.6s" },
      { x: 38, y: 70, c: "med", d: "1.1s" },
      { x: 30, y: 42, c: "high", d: "1.5s" },
      { x: 70, y: 80, c: "med", d: "0.3s" },
    ];
    return h("div", { className: "radar" }, [
      h("div", { key: "g", className: "radar__grid" }, [
        h("div", { key: 1, className: "radar__ring" }),
        h("div", { key: 2, className: "radar__ring r2" }),
        h("div", { key: 3, className: "radar__ring r3" }),
        h("div", { key: 4, className: "radar__ring r4" }),
        h("div", { key: 5, className: "radar__cross h" }),
        h("div", { key: 6, className: "radar__cross v" }),
      ]),
      h("div", { key: "sw", className: "radar__sweep" }),
      ...blips.map((b, i) => h("span", {
        key: "b" + i, className: "radar__blip " + b.c,
        style: { left: b.x + "%", top: b.y + "%", color: b.c === "crit" ? "#f87171" : b.c === "high" ? "#fbbf24" : "#38bdf8", animationDelay: b.d },
      })),
    ]);
  }
  window.ThreatRadar = ThreatRadar;

  // =========================================================================
  // LIVE EVENT TICKER
  // =========================================================================
  function LiveTicker({ items }) {
    const list = items || [
      { c: "#f87171", t: "Critical finding", b: "FW-CORE-01 · 10.0.0.0/8 to'liq ruxsat" },
      { c: "#34d399", t: "Vazifa bajarildi", b: "T-116 · Nessus skaner import" },
      { c: "#38bdf8", t: "EXE agent sync", b: "AUD-2026-014 · 6 ta yangi log" },
      { c: "#fbbf24", t: "Review kutilmoqda", b: "T-117 · DNS tunneling tahlili" },
      { c: "#34d399", t: "Audit tasdiqlandi", b: "AUD-2026-013 · Soliq qo'mitasi" },
    ];
    const seq = [...list, ...list];
    return h("div", { className: "ticker" }, [
      h("span", { key: "tag", className: "ticker__tag" }, [h("span", { key: "d", className: "live-dot" }), h("span", { key: "t" }, "Jonli")]),
      h("div", { key: "win", className: "ticker__win" },
        h("div", { className: "ticker__track" },
          seq.map((e, i) => h("span", { key: i, className: "ticker__item" }, [
            h("span", { key: "d", className: "ticker__dot", style: { background: e.c } }),
            h("b", { key: "t" }, e.t),
            h("span", { key: "b" }, "— " + e.b),
          ]))
        )
      ),
    ]);
  }
  window.LiveTicker = LiveTicker;

  // =========================================================================
  // HERO COMMAND BAND
  // =========================================================================
  function HeroBand({ score = 74, scoreTrend = 6, caption, metrics = [], gauge = 89, gaugeCap = "Bajarildi" }) {
    return h("div", { className: "hero-band glow-border" }, [
      h("div", { key: "main", className: "hero-band__main" }, [
        h("div", { key: "eb", className: "hero-eyebrow" }, [
          h("span", { key: "d", className: "live-dot" }),
          h("span", { key: "t" }, "Live · Xavfsizlik holati markazi"),
        ]),
        h("div", { key: "hl", className: "hero-band__headline" }, [
          h("div", { key: "sc", className: "hero-score" }, [h(window.CountUp, { key: "n", value: score }), h("sup", { key: "s" }, "/100")]),
          h("div", { key: "cap", className: "hero-band__caption" }, [
            h("h2", { key: 1 }, "Tashkilot xavfsizlik ko'rsatkichi"),
            h("p", { key: 2 }, caption || "Joriy chorakda umumiy holat barqaror. 4 ta audit faol, kritik findinglar kamaymoqda."),
          ]),
        ]),
        h("div", { key: "mx", className: "hero-metrics" },
          metrics.map((m, i) => h("div", { key: i, className: "hero-metric" + (m.tone ? " hero-metric--" + m.tone : "") }, [
            h("span", { key: "v", className: "hero-metric__v" }, h(window.CountUp, { value: m.value })),
            h("span", { key: "l", className: "hero-metric__l" }, m.label),
          ]))
        ),
      ]),
      h("div", { key: "side", className: "hero-band__side" }, [
        h(Gauge, { key: "g", value: gauge, cap: gaugeCap }),
        h(ThreatRadar, { key: "r" }),
      ]),
      h(LiveTicker, { key: "tk" }),
    ]);
  }
  window.HeroBand = HeroBand;

  // =========================================================================
  // LEADERBOARD PODIUM (top 3)
  // =========================================================================
  function Podium({ users }) {
    const top = (users || D.KPI_USERS).slice(0, 3);
    // visual order: 2nd, 1st, 3rd
    const order = [top[1], top[0], top[2]].filter(Boolean);
    const heights = { 0: 56, 1: 84, 2: 44 }; // by visual column
    const maxTotal = Math.max(...top.map(t => t.total), 1);
    return h("div", { className: "podium" },
      order.map((k, col) => {
        const rank = k === top[0] ? 1 : k === top[1] ? 2 : 3;
        const u = D.userById(k.user);
        const barH = 30 + (k.total / maxTotal) * 64;
        return h("div", { key: k.user, className: "podium__col podium__col--" + rank }, [
          h("div", { key: "m", className: "podium__medal podium__medal--" + rank }, rank),
          h(window.Avatar, { key: "av", user: u, size: rank === 1 ? "lg" : "md" }),
          h("div", { key: "nm", className: "podium__name" }, u.name),
          h("div", { key: "sb", className: "podium__sub" }, k.audits + " audit · " + k.findings + " finding"),
          h("div", { key: "sc", className: "podium__score" }, h(window.CountUp, { value: k.total })),
          h("div", { key: "bar", className: "podium__bar", style: { height: barH } }),
        ]);
      })
    );
  }
  window.Podium = Podium;

})();
