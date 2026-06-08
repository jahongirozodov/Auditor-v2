/* Auditor — main app: hash routing + tweaks panel wiring. */
(function () {
  const { useState, useEffect, useMemo, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // ---------- Tweaks ----------
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark",
    "role": "departament",
    "density": "comfortable",
    "primary": "royal",
    "bg": "default",
    "showAI": true,
    "demoMode": false,
    "auditStatus": "in_progress"
  }/*EDITMODE-END*/;

  // Representative swatch per primary tone (shown in the color picker)
  const PRIMARY_SWATCH = { royal: "#2549EB", navy: "#4F60D1", teal: "#0F766E", forest: "#166534" };

  // ---------- Background (page) tones ----------
  // Each tone defines a light + dark page background so the chosen color
  // always stays legible regardless of the current theme. "default" mirrors
  // the token defaults from tokens.css.
  const BG_TONES = {
    default:  { label: "Standart",  light: "#F8FAFC", dark: "#0A1120" },
    slate:    { label: "Salqin",    light: "#EEF2F8", dark: "#0B1424" },
    warm:     { label: "Iliq",      light: "#F7F4EF", dark: "#14110B" },
    mint:     { label: "Yashil",    light: "#EFF6F1", dark: "#091410" },
    lavender: { label: "Lavanda",   light: "#F2F0F9", dark: "#110E1C" },
    graphite: { label: "Grafit",    light: "#F0F1F4", dark: "#101216" },
  };

  const PRIMARY_PALETTES = {
    royal: {
      label: "Royal blue",
      light: { brand: "#1E40AF", hover: "#1D3FD8", pressed: "#1E3A8A", soft: "#EFF5FF", softHover: "#E3EDFF", ring: "rgba(30,64,175,0.28)" },
      dark:  { brand: "#3B65F6", hover: "#608BFA", pressed: "#2549EB", soft: "rgba(59,101,246,0.14)", softHover: "rgba(59,101,246,0.22)", ring: "rgba(96,139,250,0.45)" },
    },
    navy: {
      label: "Navy",
      light: { brand: "#1E3A8A", hover: "#1E40AF", pressed: "#172554", soft: "#E0E7FF", softHover: "#C7D2FE", ring: "rgba(30,58,138,0.28)" },
      dark:  { brand: "#6B7FF1", hover: "#8B9EF7", pressed: "#4F60D1", soft: "rgba(107,127,241,0.14)", softHover: "rgba(107,127,241,0.22)", ring: "rgba(139,158,247,0.45)" },
    },
    teal: {
      label: "Cyber teal",
      light: { brand: "#0F766E", hover: "#0D9488", pressed: "#115E59", soft: "#E6FFFA", softHover: "#CCFBF1", ring: "rgba(15,118,110,0.28)" },
      dark:  { brand: "#2DD4BF", hover: "#5EEAD4", pressed: "#14B8A6", soft: "rgba(45,212,191,0.14)", softHover: "rgba(45,212,191,0.22)", ring: "rgba(94,234,212,0.45)" },
    },
    forest: {
      label: "Forest",
      light: { brand: "#166534", hover: "#15803D", pressed: "#14532D", soft: "#F0FDF4", softHover: "#DCFCE7", ring: "rgba(22,101,52,0.28)" },
      dark:  { brand: "#22C55E", hover: "#4ADE80", pressed: "#16A34A", soft: "rgba(34,197,94,0.14)", softHover: "rgba(34,197,94,0.22)", ring: "rgba(74,222,128,0.45)" },
    },
  };

  // ---------- Apply tweaks to :root ----------
  function applyTweaks(t) {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.theme);
    root.setAttribute("data-density", t.density);
    const pal = PRIMARY_PALETTES[t.primary] || PRIMARY_PALETTES.royal;
    const c = t.theme === "dark" ? pal.dark : pal.light;
    root.style.setProperty("--brand", c.brand);
    root.style.setProperty("--brand-hover", c.hover);
    root.style.setProperty("--brand-pressed", c.pressed);
    root.style.setProperty("--brand-soft", c.soft);
    root.style.setProperty("--brand-soft-hover", c.softHover);
    root.style.setProperty("--brand-ring", c.ring);
    root.style.setProperty("--focus-ring", "0 0 0 3px " + c.ring);
    root.style.setProperty("--text-link", c.brand);

    // Page background tone (theme-aware)
    const tone = BG_TONES[t.bg] || BG_TONES.default;
    root.style.setProperty("--bg-page", t.theme === "dark" ? tone.dark : tone.light);

    // Demo / presentation mode (amplifies cinematic effects)
    if (t.demoMode) root.setAttribute("data-demo", "on");
    else root.removeAttribute("data-demo");
  }

  // ---------- Boot skeleton (first-load shimmer) ----------
  function BootSkeleton() {
    return h("div", null, [
      h("div", { key: "hp", style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 } }, [
        h("div", { key: 1, className: "skeleton sk-line", style: { width: 260, height: 30 } }),
        h("div", { key: 2, className: "skeleton sk-line", style: { width: 440, maxWidth: "60%" } }),
      ]),
      h("div", { key: "g", className: "boot-grid" }, [1, 2, 3, 4].map(i => h("div", { key: i, className: "skeleton sk-tile" }))),
      h("div", { key: "b", className: "boot-body" }, [
        h("div", { key: 1, className: "skeleton sk-panel" }),
        h("div", { key: 2, className: "skeleton sk-panel" }),
      ]),
    ]);
  }

  // ---------- Main App ----------
  function App() {
    const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : useFallbackTweaks();

    const [route, setRoute] = useState("dashboard");
    const [auditId, setAuditId] = useState(D.AUDITS[0].id);
    const [orgId, setOrgId] = useState(null);
    const [taskId, setTaskId] = useState(D.TASKS[0].id);
    const [findingId, setFindingId] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [createAuditOpen, setCreateAuditOpen] = useState(false);
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [createFindingOpen, setCreateFindingOpen] = useState(false);
    const [createTokenOpen, setCreateTokenOpen] = useState(false);
    const [createUserOpen, setCreateUserOpen] = useState(false);
    const [createReportOpen, setCreateReportOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false); // WOW login is the entry point (after boot)
    // Cinematic boot plays once per session; refreshes skip straight to the app.
    const [booting, setBooting] = useState(() => {
      try { return sessionStorage.getItem("auditor.booted") !== "1"; } catch (e) { return true; }
    });
    function finishBoot() {
      try { sessionStorage.setItem("auditor.booted", "1"); } catch (e) {}
      setBooting(false);
    }

    // Safety cap: never let the boot overlay get stuck (e.g. if rAF/timers
    // are throttled in a background tab) — guarantees the app reveals.
    useEffect(() => {
      if (!booting) return undefined;
      const t = setTimeout(finishBoot, 4200);
      return () => clearTimeout(t);
    }, []);

    useEffect(() => {
      function onKey(e) {
        if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setPaletteOpen(o => !o); }
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Material-style ripple on every .btn (skipped under reduced-motion)
    useEffect(() => {
      const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return undefined;
      function onClick(e) {
        const btn = e.target.closest && e.target.closest(".btn");
        if (!btn || btn.disabled) return;
        const rect = btn.getBoundingClientRect();
        const d = Math.max(rect.width, rect.height);
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = d + "px";
        span.style.left = (e.clientX - rect.left) + "px";
        span.style.top = (e.clientY - rect.top) + "px";
        span.style.margin = (-d / 2) + "px 0 0 " + (-d / 2) + "px";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 620);
      }
      document.addEventListener("click", onClick);
      return () => document.removeEventListener("click", onClick);
    }, []);

    // Cursor spotlight: track pointer position into CSS vars on cards
    useEffect(() => {
      function onMove(e) {
        const el = e.target.closest && e.target.closest(".stat, .panel, .hero-band");
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      }
      document.addEventListener("pointermove", onMove, { passive: true });
      return () => document.removeEventListener("pointermove", onMove);
    }, []);

    // Expose task-modal opener globally so deep buttons can trigger it
    useEffect(() => {
      window.__openCreateTask = () => setCreateTaskOpen(true);
      window.__openCreateFinding = () => setCreateFindingOpen(true);
      window.__openCreateToken = () => setCreateTokenOpen(true);
      window.__openCreateUser = () => setCreateUserOpen(true);
      window.__openCreateReport = () => setCreateReportOpen(true);
    }, []);

    // Apply tweaks
    useEffect(() => { applyTweaks(tweaks); }, [tweaks.theme, tweaks.density, tweaks.primary, tweaks.bg, tweaks.demoMode]);

    // Mutate audit status (tweak-driven)
    const liveAudits = useMemo(() => {
      // override status of the first audit per tweak
      return D.AUDITS.map((a, i) => i === 0 ? { ...a, status: tweaks.auditStatus } : a);
    }, [tweaks.auditStatus]);
    // mutate the global so screens see it
    useEffect(() => {
      D.AUDITS[0].status = tweaks.auditStatus;
    }, [tweaks.auditStatus]);

    function openAudit(id) { setAuditId(id); setRoute("audit"); }
    function openOrg(id) { setOrgId(id); setRoute("org"); }
    function openFinding(id) { setFindingId(id); }
    function openTask(id) { setTaskId(id); setRoute("task"); }

    // Cinematic boot first, then the WOW login, then the app.
    if (booting) return h(window.BootSequence, { key: "boot", onDone: finishBoot });
    if (!loggedIn) return h(window.LoginScreen, { onLogin: () => setLoggedIn(true) });

    const shell = h("div", { className: "app", "data-collapsed": collapsed ? "true" : "false" }, [
      h(window.Topbar, { key: 1, collapsed, setCollapsed, theme: tweaks.theme, setTheme: v => setTweak("theme", v), role: tweaks.role, setRole: v => setTweak("role", v), setRoute, onLogout: () => setLoggedIn(false), onOpenSearch: () => setPaletteOpen(true) }),
      h(window.Sidebar, { key: 2, route, setRoute, role: tweaks.role, collapsed }),
      h("main", { key: 3, className: "canvas" },
        h("div", { className: "canvas__inner" },
          h("div", { className: "route-anim", key: route },
          route === "dashboard"   ? h(window.DashboardScreen,   { key: route, role: tweaks.role, setRoute, openAudit, showAI: tweaks.showAI, setCreateOpen: setCreateAuditOpen }) :
          route === "orgs"        ? h(window.OrgsScreen,        { key: route, setRoute, openAudit, openOrg }) :
          route === "org"         ? h(window.OrgDetailScreen,   { key: route + orgId, orgId, setRoute, openAudit, openOrg }) :
          route === "audits"      ? h(window.AuditsListScreen,  { key: route, role: tweaks.role, openAudit, setRoute, setCreateOpen: setCreateAuditOpen }) :
          route === "audit"       ? h(window.AuditDetailScreen, { key: route + auditId, auditId, role: tweaks.role, setRoute, openFinding, openTask, showAI: tweaks.showAI }) :
          route === "tasks"       ? h(window.MyTasksScreen,     { key: route, role: tweaks.role, setRoute, openTask, setCreateTaskOpen }) :
          route === "assign"      ? h(window.AssignScreen,      { key: route, role: tweaks.role, setRoute, openTask }) :
          route === "task"        ? h(window.TaskDetailScreen,  { key: route + taskId, taskId, role: tweaks.role, setRoute, openFinding, openAudit }) :
          route === "findings"    ? h(window.FindingsScreen,    { key: route, openFinding, setRoute }) :
          route === "scanner"     ? h(window.ScannerScreen,     { key: route, setRoute, role: tweaks.role, showAI: tweaks.showAI, initialTab: "scanner" }) :
          route === "config"      ? h(window.ScannerScreen,     { key: route, setRoute, role: tweaks.role, showAI: tweaks.showAI, initialTab: "config" }) :
          route === "traffic"     ? h(window.ScannerScreen,     { key: route, setRoute, role: tweaks.role, showAI: tweaks.showAI, initialTab: "traffic" }) :
          route === "topology"    ? h(window.TopologyScreen,    { key: route, setRoute }) :
          route === "ai"          ? h(window.AIScreen,          { key: route, setRoute, showAI: tweaks.showAI }) :
          route === "kpi"         ? h(window.KpiScreen,         { key: route, setRoute, role: tweaks.role }) :
          route === "reports"     ? h(window.ReportsScreen,     { key: route, setRoute }) :
          route === "tokens"      ? h(window.TokensScreen,      { key: route, setRoute, role: tweaks.role }) :
          route === "users"       ? h(window.UsersScreen,       { key: route, setRoute }) :
          route === "permissions" ? h(window.PermissionsScreen, { key: route, setRoute }) :
          route === "logs"        ? h(window.LogsScreen,        { key: route, setRoute }) :
          route === "agent"       ? h(window.AgentScreen,       { key: route, setRoute }) :
          route === "profile"     ? h(window.ProfileScreen,     { key: route, role: tweaks.role, setRoute }) :
          route === "settings"    ? h(window.SettingsScreen,    { key: route, setRoute, role: tweaks.role }) :
          h(window.DashboardScreen, { role: tweaks.role, setRoute, openAudit, showAI: tweaks.showAI })
          )
        )
      ),
    ]);

    return h(Fragment, null, [
      React.cloneElement(shell, { key: "shell" }),

      // Finding drawer
      findingId ? h(window.FindingDrawer, { key: "fd", findingId, onClose: () => setFindingId(null), role: tweaks.role }) : null,

      // Create audit modal
      createAuditOpen ? h(CreateAuditModal, { key: "cm", onClose: () => setCreateAuditOpen(false) }) : null,

      // Create task modal
      createTaskOpen ? h(CreateTaskModal, { key: "ct", onClose: () => setCreateTaskOpen(false) }) : null,

      // Create finding modal
      createFindingOpen ? h(CreateFindingModal, { key: "cf", onClose: () => setCreateFindingOpen(false) }) : null,

      // Create token modal
      createTokenOpen ? h(CreateTokenModal, { key: "ck", onClose: () => setCreateTokenOpen(false) }) : null,

      // Create user modal
      createUserOpen ? h(CreateUserModal, { key: "cu", onClose: () => setCreateUserOpen(false) }) : null,

      // Create report modal
      createReportOpen ? h(CreateReportModal, { key: "cr", onClose: () => setCreateReportOpen(false) }) : null,

      // Tweaks panel
      h(TweaksPanelEl, { key: "tw", tweaks, setTweak }),

      // Command palette (⌘K)
      window.CommandPalette ? h(window.CommandPalette, { key: "cmdk", open: paletteOpen, onClose: () => setPaletteOpen(false), setRoute, openAudit, openFinding, openOrg }) : null,

    ]);
  }

  // ---------- Fallback if tweaks_panel starter didn't load ----------
  function useFallbackTweaks() {
    const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
    function setTweak(k, v) {
      if (typeof k === "object") setTweaks(t => ({ ...t, ...k }));
      else setTweaks(t => ({ ...t, [k]: v }));
    }
    return [tweaks, setTweak];
  }

  // ---------- Tweaks panel ----------
  function TweaksPanelEl({ tweaks, setTweak }) {
    if (!window.TweaksPanel) return null;
    const TweaksPanel = window.TweaksPanel;
    const TweakSection = window.TweakSection;
    const TweakRadio = window.TweakRadio;
    const TweakSelect = window.TweakSelect;
    const TweakToggle = window.TweakToggle;
    const TweakColor = window.TweakColor;

    return h(TweaksPanel, { title: "Tweaks" }, [
      h(TweakSection, { label: "Ko‘rinish", key: 1 }, [
        h(TweakRadio, {
          key: 1, label: "Theme",
          value: tweaks.theme,
          options: [{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }],
          onChange: v => setTweak("theme", v),
        }),
        h(TweakRadio, {
          key: 2, label: "Density",
          value: tweaks.density,
          options: [{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Cozy" }],
          onChange: v => setTweak("density", v),
        }),
        h(TweakColor, {
          key: 3, label: "Asosiy rang",
          value: PRIMARY_SWATCH[tweaks.primary] || PRIMARY_SWATCH.royal,
          options: ["royal", "navy", "teal", "forest"].map(k => PRIMARY_SWATCH[k]),
          onChange: hex => {
            const k = Object.keys(PRIMARY_SWATCH).find(
              key => PRIMARY_SWATCH[key].toLowerCase() === String(hex).toLowerCase()
            );
            setTweak("primary", k || "royal");
          },
        }),
        (function () {
          const variant = tweaks.theme === "dark" ? "dark" : "light";
          const keys = Object.keys(BG_TONES);
          return h(TweakColor, {
            key: 4, label: "Orqa fon rangi",
            value: (BG_TONES[tweaks.bg] || BG_TONES.default)[variant],
            options: keys.map(k => BG_TONES[k][variant]),
            onChange: hex => {
              const k = keys.find(
                key => BG_TONES[key][variant].toLowerCase() === String(hex).toLowerCase()
              );
              setTweak("bg", k || "default");
            },
          });
        })(),
      ]),

      h(TweakSection, { label: "Rol almashtirish (demo)", key: 2 }, [
        h(TweakSelect, {
          key: 1, label: "Foydalanuvchi roli",
          value: tweaks.role,
          options: D.ROLES.map(r => ({ value: r.id, label: r.name })),
          onChange: v => setTweak("role", v),
        }),
      ]),

      h(TweakSection, { label: "Audit holati", key: 3 }, [
        h(TweakSelect, {
          key: 1, label: "AUD-2026-014 holati",
          value: tweaks.auditStatus,
          options: Object.entries(D.STATUS_LABELS).map(([k, v]) => ({ value: k, label: v.label })),
          onChange: v => setTweak("auditStatus", v),
        }),
      ]),

      h(TweakSection, { label: "AI", key: 4 }, [
        h(TweakToggle, {
          key: 1, label: "AI tavsiyalarini ko‘rsatish",
          value: tweaks.showAI,
          onChange: v => setTweak("showAI", v),
        }),
      ]),

      h(TweakSection, { label: "Taqdimot rejimi", key: 5 }, [
        h(TweakToggle, {
          key: 1, label: "Demo / Presentation rejimi",
          value: tweaks.demoMode,
          onChange: v => setTweak("demoMode", v),
        }),
      ]),
    ]);
  }

  // ---------- Create audit modal ----------
  function CreateAuditModal({ onClose }) {
    return h(window.Modal, {
      open: true, onClose, wide: true,
      title: h("span", null, [h(I.Plus, { size: 16, style: { marginRight: 8 } }), "Yangi audit yaratish"]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Bekor"),
        h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => { onClose(); window.showToast("Audit qoralama sifatida saqlandi", "info"); } }, [h(I.Save, { key: "i", size: 14 }), h("span", { key: "t" }, "Qoralama saqlash")]),
        h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: onClose }, [h(I.Check, { key: "i", size: 14 }), h("span", { key: "t" }, "Yaratish va davom etish")]),
      ],
    }, [
      h("div", { className: "form-grid" }, [
        h("div", { className: "field span-2", key: 1 }, [
          h("label", { className: "field__label" }, "Audit nomi"),
          h("input", { className: "input", placeholder: "Masalan: Aloqa vazirligi — yillik kompleks audit" }),
        ]),
        h("div", { className: "field", key: 2 }, [
          h("label", { className: "field__label" }, "Audit turi"),
          h("select", { className: "select" }, [
            h("option", { key: 1 }, "Kompleks audit"),
            h("option", { key: 2 }, "Texnik audit"),
            h("option", { key: 3 }, "Penetration test"),
            h("option", { key: 4 }, "Web audit"),
            h("option", { key: 5 }, "Maxsus audit"),
          ]),
        ]),
        h("div", { className: "field", key: 3 }, [
          h("label", { className: "field__label" }, "Tashkilot"),
          h("select", { className: "select" },
            D.ORGS.map(o => h("option", { key: o.id }, o.name))
          ),
        ]),
        h("div", { className: "field", key: 4 }, [
          h("label", { className: "field__label" }, "Boshlanish"),
          h("input", { className: "input", type: "date", defaultValue: "2026-06-01" }),
        ]),
        h("div", { className: "field", key: 5 }, [
          h("label", { className: "field__label" }, "Tugash"),
          h("input", { className: "input", type: "date", defaultValue: "2026-07-15" }),
        ]),
        h("div", { className: "field span-2", key: 6 }, [
          h("label", { className: "field__label" }, "Audit guruhi rahbari"),
          h("select", { className: "select" },
            D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u =>
              h("option", { key: u.id }, u.name + " — " + u.title)
            )
          ),
        ]),
        h("div", { className: "field span-2", key: 7 }, [
          h("label", { className: "field__label" }, "Auditorlar (ko‘p tanlash)"),
          h("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, padding: 10, border: "1px solid var(--border-color)", borderRadius: 6, background: "var(--bg-input)" } },
            D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map((u, i) =>
              h("span", { key: u.id, className: "tag " + (i < 3 ? "tag--brand" : "tag--outline"), style: { cursor: "pointer", padding: "4px 8px" } }, [
                i < 3 ? h(I.Check, { size: 10, key: "i" }) : null,
                h("span", { key: "n" }, u.name),
              ])
            )
          ),
        ]),
        h("div", { className: "field span-2", key: 8 }, [
          h("label", { className: "field__label" }, "Qisqacha izoh"),
          h("textarea", { className: "textarea", placeholder: "Audit doirasini qisqacha bayon qiling..." }),
        ]),
      ]),
    ]);
  }

  // ---------- Create task modal ----------
  function CreateTaskModal({ onClose }) {
    return h(window.Modal, {
      open: true, onClose, wide: true,
      title: h("span", null, [h(I.Plus, { size: 16, style: { marginRight: 8 } }), "Yangi vazifa"]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Bekor"),
        h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => { onClose(); window.showToast("Vazifa qoralama sifatida saqlandi", "info"); } }, [h(I.Save, { size: 14 }), h("span", { key: "t" }, "Qoralama")]),
        h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: onClose }, [h(I.Check, { size: 14 }), h("span", { key: "t" }, "Yaratish va biriktirish")]),
      ],
    }, [
      h("div", { className: "form-grid" }, [
        h("div", { className: "field span-2", key: 1 }, [
          h("label", { className: "field__label" }, "Vazifa nomi"),
          h("input", { className: "input", placeholder: "Masalan: Firewall qoidalari va segmentatsiyani tahlil qilish" }),
        ]),
        h("div", { className: "field", key: 2 }, [
          h("label", { className: "field__label" }, "Audit"),
          h("select", { className: "select" }, D.AUDITS.map(a => h("option", { key: a.id }, a.code + " — " + (a.title.length > 38 ? a.title.slice(0, 38) + "…" : a.title)))),
        ]),
        h("div", { className: "field", key: 3 }, [
          h("label", { className: "field__label" }, "Turi"),
          h("select", { className: "select" }, [
            h("option", { key: 1 }, "Konfiguratsiya"),
            h("option", { key: 2 }, "Skaner"),
            h("option", { key: 3 }, "Trafik"),
            h("option", { key: 4 }, "Tizim audit"),
            h("option", { key: 5 }, "Log"),
            h("option", { key: 6 }, "Hujjat"),
            h("option", { key: 7 }, "Hisobot"),
          ]),
        ]),
        h("div", { className: "field", key: 4 }, [
          h("label", { className: "field__label" }, "Ustuvorlik"),
          h("select", { className: "select", defaultValue: "O‘rta" }, [
            h("option", { key: 1 }, "Yuqori"),
            h("option", { key: 2 }, "O‘rta"),
            h("option", { key: 3 }, "Past"),
          ]),
        ]),
        h("div", { className: "field", key: 5 }, [
          h("label", { className: "field__label" }, "Muddat"),
          h("input", { className: "input", type: "date", defaultValue: "2026-05-30" }),
        ]),
        h("div", { className: "field span-2", key: 6 }, [
          h("label", { className: "field__label" }, "Mas’ul (biriktirish)"),
          h("select", { className: "select" },
            D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u =>
              h("option", { key: u.id }, u.name + " — " + u.title)
            )
          ),
        ]),
        h("div", { className: "field span-2", key: 7 }, [
          h("label", { className: "field__label" }, "Tavsif"),
          h("textarea", { className: "textarea", placeholder: "Vazifa doirasi, kutilayotgan natijalar, foydalaniladigan vositalar..." }),
        ]),
        h("div", { className: "field span-2", key: 8 }, [
          h("label", { className: "field__label" }, "Token kerakmi?"),
          h("div", { style: { display: "flex", gap: 8 } }, [
            h("label", { key: 1, style: { display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid var(--brand)", borderRadius: 6, flex: 1, background: "var(--brand-soft)" } }, [
              h("input", { type: "radio", className: "radio", name: "tok", defaultChecked: true }),
              h("div", null, [
                h("div", { key: 1, style: { fontSize: 13, fontWeight: 600 } }, "Mavjud tokenga qo‘shish"),
                h("div", { key: 2, className: "cell-sub" }, "Foydalanuvchining joriy audit tokeni ushbu vazifani ham ochadi"),
              ]),
            ]),
            h("label", { key: 2, style: { display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid var(--border-color)", borderRadius: 6, flex: 1 } }, [
              h("input", { type: "radio", className: "radio", name: "tok" }),
              h("div", null, [
                h("div", { key: 1, style: { fontSize: 13, fontWeight: 600 } }, "Token shart emas"),
                h("div", { key: 2, className: "cell-sub" }, "Faqat web tizimda bajariladigan vazifa (masalan, hisobot)"),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
  }

  // ---------- Create finding modal ----------
  function CreateFindingModal({ onClose }) {
    const [sev, setSev] = useState("high");
    const [aiOn, setAiOn] = useState(true);
    return h(window.Modal, {
      open: true, onClose, wide: true,
      title: h("span", null, [h(I.AlertTriangle, { size: 16, style: { marginRight: 8, color: "var(--status-warning-fg)" } }), "Yangi finding / zaiflik"]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Bekor"),
        h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => { onClose(); window.showToast("Finding qoralama sifatida saqlandi", "info"); } }, [h(I.Save, { size: 14 }), h("span", { key: "t" }, "Qoralama saqlash")]),
        h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: onClose }, [h(I.Send, { size: 14 }), h("span", { key: "t" }, "Yuborish")]),
      ],
    }, [
      h("div", { className: "form-grid" }, [
        h("div", { className: "field span-2", key: 1 }, [
          h("label", { className: "field__label" }, "Sarlavha"),
          h("input", { className: "input", placeholder: "Masalan: Internal segment 10.0.0.0/8 ga to‘liq ruxsat berilgan" }),
        ]),

        h("div", { className: "field", key: 2 }, [
          h("label", { className: "field__label" }, "Audit"),
          h("select", { className: "select" }, D.AUDITS.map(a => h("option", { key: a.id }, a.code))),
        ]),
        h("div", { className: "field", key: 3 }, [
          h("label", { className: "field__label" }, "Bog‘lanadigan vazifa"),
          h("select", { className: "select" }, D.TASKS.slice(0, 6).map(t => h("option", { key: t.id }, t.id + " — " + (t.title.length > 38 ? t.title.slice(0, 38) + "…" : t.title)))),
        ]),

        h("div", { className: "field span-2", key: 4 }, [
          h("label", { className: "field__label" }, "Xavf darajasi"),
          h("div", { style: { display: "flex", gap: 6 } },
            ["critical", "high", "medium", "low", "info"].map(s => h("button", {
              key: s, type: "button",
              className: "btn btn--ghost btn--sm",
              onClick: () => setSev(s),
              style: { flex: 1, padding: 12, border: sev === s ? "1.5px solid var(--brand)" : "1px solid var(--border-color)", background: sev === s ? "var(--brand-soft)" : "var(--bg-surface)" },
            }, h(window.Sev, { level: s })))
          ),
        ]),

        h("div", { className: "field", key: 5 }, [
          h("label", { className: "field__label" }, "CVSS 3.1 ball"),
          h("input", { className: "input tabular", defaultValue: sev === "critical" ? "9.1" : sev === "high" ? "7.4" : sev === "medium" ? "5.4" : "3.0" }),
        ]),
        h("div", { className: "field", key: 6 }, [
          h("label", { className: "field__label" }, "CWE"),
          h("input", { className: "input font-mono", placeholder: "CWE-284", defaultValue: "CWE-284" }),
        ]),

        h("div", { className: "field", key: 7 }, [
          h("label", { className: "field__label" }, "Asset"),
          h("input", { className: "input font-mono", placeholder: "FW-CORE-01 yoki 10.20.4.142", defaultValue: "FW-CORE-01" }),
        ]),
        h("div", { className: "field", key: 8 }, [
          h("label", { className: "field__label" }, "Toifa"),
          h("select", { className: "select" }, [
            h("option", { key: 1 }, "Konfiguratsiya kamchiligi"),
            h("option", { key: 2 }, "Tizim sozlamasi"),
            h("option", { key: 3 }, "CVE / patch"),
            h("option", { key: 4 }, "Web zaiflik"),
            h("option", { key: 5 }, "Trafik anomaliya"),
            h("option", { key: 6 }, "Operatsion kamchilik"),
          ]),
        ]),

        h("div", { className: "field span-2", key: 9 }, [
          h("label", { className: "field__label" }, "Tavsif"),
          h("textarea", { className: "textarea", style: { minHeight: 110 }, placeholder: "Kamchilik tavsifi, dalillar va kuzatish konteksti..." }),
        ]),

        h("div", { className: "field span-2", key: 10 }, [
          h("label", { className: "field__label" }, "Dalillar"),
          h("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: 14, border: "1.5px dashed var(--border-color)", borderRadius: 8, background: "var(--bg-surface-2)" } }, [
            h(I.Paperclip, { key: 0, size: 18, style: { color: "var(--brand)" } }),
            h("div", { key: 1, style: { flex: 1 } }, [
              h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, "Skrinshot, log, konfiguratsiya yoki PCAP biriktiring"),
              h("div", { key: 2, className: "cell-sub" }, "Drag & drop yoki tanlash. Har bir fayl checksum bilan saqlanadi."),
            ]),
            h("button", { key: 2, type: "button", className: "btn btn--soft btn--sm", onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info") }, [h(I.Upload, { size: 13 }), h("span", { key: "t" }, "Fayl tanlash")]),
          ]),
        ]),

        h("div", { className: "field span-2", key: 11 }, [
          h("label", { style: { display: "flex", alignItems: "center", gap: 10, padding: 10, background: aiOn ? "var(--brand-soft)" : "var(--bg-surface-2)", border: "1px solid " + (aiOn ? "var(--brand-soft-hover)" : "var(--border-color)"), borderRadius: 8, cursor: "pointer", transition: "all var(--dur-fast) var(--ease-out)" } }, [
            h("input", { type: "checkbox", className: "checkbox", checked: aiOn, onChange: e => setAiOn(e.target.checked) }),
            h(I.Sparkles, { key: 1, size: 14, style: { color: "var(--brand)" } }),
            h("span", { key: 2, style: { flex: 1, fontSize: 13, color: "var(--text-primary)", fontWeight: 500 } }, "Ollama AI orqali avtomatik remediation tavsiyasi yarat"),
            h("span", { key: 3, className: "tag tag--brand", style: { fontSize: 10 } }, "qwen2.5:14b"),
          ]),
        ]),
      ]),
    ]);
  }

  // ---------- Create token modal ----------
  function CreateTokenModal({ onClose }) {
    return h(window.Modal, {
      open: true, onClose, wide: true,
      title: h("span", null, [h(I.KeyRound, { size: 16, style: { marginRight: 8, color: "var(--brand)" } }), "Yangi audit token"]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Bekor"),
        h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: onClose }, [h(I.Check, { size: 14 }), h("span", { key: "t" }, "Token chiqarish")]),
      ],
    }, [
      h("div", { className: "form-grid" }, [
        h("div", { className: "field span-2", key: 1 }, [
          h("label", { className: "field__label" }, "Audit"),
          h("select", { className: "select" }, D.AUDITS.map(a => h("option", { key: a.id }, a.code + " — " + (a.title.length > 50 ? a.title.slice(0, 50) + "…" : a.title)))),
        ]),
        h("div", { className: "field span-2", key: 2 }, [
          h("label", { className: "field__label" }, "Xodim (token egasi)"),
          h("select", { className: "select" }, D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u => h("option", { key: u.id }, u.name + " — " + u.title))),
        ]),
        h("div", { className: "field", key: 3 }, [
          h("label", { className: "field__label" }, "Boshlanish"),
          h("input", { className: "input", type: "datetime-local", defaultValue: "2026-05-20T09:00" }),
        ]),
        h("div", { className: "field", key: 4 }, [
          h("label", { className: "field__label" }, "Tugash"),
          h("input", { className: "input", type: "datetime-local", defaultValue: "2026-05-31T18:00" }),
        ]),
        h("div", { className: "field span-2", key: 5 }, [
          h("label", { className: "field__label" }, "Token ochadigan vazifalar"),
          h("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto", padding: 8, border: "1px solid var(--border-color)", borderRadius: 6 } }, D.TASKS.slice(0, 6).map((t, i) =>
            h("label", { key: t.id, style: { display: "flex", gap: 10, alignItems: "center", padding: 6, borderRadius: 4 } }, [
              h("input", { type: "checkbox", className: "checkbox", defaultChecked: i < 3 }),
              h("span", { key: 1, className: "font-mono", style: { fontSize: 12, color: "var(--text-tertiary)" } }, t.id),
              h("span", { key: 2, style: { flex: 1, fontSize: 13 } }, t.title),
            ])
          )),
        ]),
        h("div", { className: "field span-2", key: 6 }, [
          h("label", { className: "field__label" }, "Qurilma bog‘lash"),
          h("label", { style: { display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid var(--brand)", borderRadius: 6, background: "var(--brand-soft)" } }, [
            h("input", { type: "radio", className: "radio", defaultChecked: true, name: "tok-dev" }),
            h("div", { key: 1 }, [
              h("div", { key: 1, style: { fontSize: 13, fontWeight: 600 } }, "Birinchi ulanishda qurilma bilan bog‘lash"),
              h("div", { key: 2, className: "cell-sub" }, "Agent token bilan kirgan birinchi qurilma (hostname + OS + IP) saqlanadi va keyingilari rad etiladi"),
            ]),
          ]),
        ]),
      ]),
    ]);
  }

  // ---------- Create user modal ----------
  function CreateUserModal({ onClose }) {
    return h(window.Modal, {
      open: true, onClose, wide: true,
      title: h("span", null, [h(I.UserCheck, { size: 16, style: { marginRight: 8, color: "var(--brand)" } }), "Yangi foydalanuvchi"]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Bekor"),
        h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => { onClose(); window.showToast("Email taklif yuborildi", "success"); } }, [h(I.Mail, { size: 14 }), h("span", { key: "t" }, "Email orqali taklif")]),
        h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: onClose }, [h(I.Check, { size: 14 }), h("span", { key: "t" }, "Yaratish")]),
      ],
    }, [
      h("div", { className: "form-grid" }, [
        h("div", { className: "field", key: 1 }, [
          h("label", { className: "field__label" }, "Ism va familiya"),
          h("input", { className: "input", placeholder: "Masalan: Bobur Mirzayev" }),
        ]),
        h("div", { className: "field", key: 2 }, [
          h("label", { className: "field__label" }, "Login (domen hisobi)"),
          h("input", { className: "input font-mono", placeholder: "b.mirzayev@gov.uz" }),
        ]),
        h("div", { className: "field", key: 3 }, [
          h("label", { className: "field__label" }, "Lavozim"),
          h("input", { className: "input", placeholder: "Audit bo‘limi bosh mutaxassisi" }),
        ]),
        h("div", { className: "field", key: 4 }, [
          h("label", { className: "field__label" }, "Bo‘lim"),
          h("input", { className: "input", defaultValue: "Audit bo‘limi" }),
        ]),
        h("div", { className: "field span-2", key: 5 }, [
          h("label", { className: "field__label" }, "Rol"),
          h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, D.ROLES.map((r, i) =>
            h("label", { key: r.id, style: { display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid " + (i === 2 ? "var(--brand)" : "var(--border-color)"), background: i === 2 ? "var(--brand-soft)" : "var(--bg-surface)", borderRadius: 6, flex: "1 1 calc(33% - 6px)", minWidth: 0, cursor: "pointer" } }, [
              h("input", { type: "radio", className: "radio", name: "role", defaultChecked: i === 2 }),
              h("div", { key: 1, style: { minWidth: 0 } }, [
                h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, r.short),
                h("div", { key: 2, className: "cell-sub", style: { fontSize: 11 } }, r.name),
              ]),
            ])
          )),
        ]),
        h("div", { className: "field span-2", key: 6 }, [
          h("label", { className: "field__label" }, "Boshlang‘ich parol"),
          h("div", { style: { display: "flex", gap: 8 } }, [
            h("input", { className: "input font-mono", defaultValue: "X9k!mP2nQ4vR7zL", style: { flex: 1 } }),
            h("button", { type: "button", className: "btn btn--ghost btn--sm", onClick: (e) => {
              const input = e.target.closest('.field').querySelector('input.input');
              const newPass = Array.from({length: 14}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'.charAt(Math.floor(Math.random()*60))).join('');
              input.value = newPass;
              window.showToast("Yangi parol yaratildi", "success");
            } }, [h(I.Refresh, { size: 13 }), h("span", { key: "t" }, "Yangilash")]),
            h("button", { type: "button", className: "btn btn--ghost btn--sm", onClick: (e) => {
              const input = e.target.closest('.field').querySelector('input.input');
              try { navigator.clipboard.writeText(input.value); } catch(e){}
              window.showToast("Parol buferga ko'chirildi", "success");
            } }, [h(I.Copy, { size: 13 }), h("span", { key: "t" }, "Nusxa")]),
          ]),
          h("label", { className: "field__hint", style: { display: "flex", alignItems: "center", gap: 6, marginTop: 6 } }, [
            h("input", { type: "checkbox", className: "checkbox", defaultChecked: true }),
            h("span", null, "Birinchi kirishda parolni o‘zgartirishni majburlash"),
          ]),
        ]),
      ]),
    ]);
  }

  // ---------- Create report modal ----------
  function CreateReportModal({ onClose }) {
    return h(window.Modal, {
      open: true, onClose, wide: true,
      title: h("span", null, [h(I.FileText, { size: 16, style: { marginRight: 8, color: "var(--brand)" } }), "Hisobot generatsiya qilish"]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Bekor"),
        h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: onClose }, [h(I.Sparkles, { size: 14 }), h("span", { key: "t" }, "AI orqali yaratish")]),
      ],
    }, [
      h("div", { className: "form-grid" }, [
        h("div", { className: "field span-2", key: 1 }, [
          h("label", { className: "field__label" }, "Audit"),
          h("select", { className: "select" }, D.AUDITS.map(a => h("option", { key: a.id }, a.code + " — " + (a.title.length > 50 ? a.title.slice(0, 50) + "…" : a.title)))),
        ]),
        h("div", { className: "field span-2", key: 2 }, [
          h("label", { className: "field__label" }, "Hisobot turi"),
          h("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, [
            { t: "Yakuniy audit hisoboti", d: "To‘liq texnik va boshqaruv hisoboti — 60–90 sahifa", i: I.FileText, def: true },
            { t: "Executive summary",       d: "Rahbariyat uchun 2 sahifalik qisqa xulosa",          i: I.Star },
            { t: "Remediation plan",        d: "Texnik bartaraf etish rejasi (owner + ETA)",         i: I.Target },
            { t: "Penetration test hisoboti", d: "Faqat pentest auditlari uchun",                    i: I.Bug },
            { t: "KPI hisoboti",            d: "Auditda qatnashgan mutaxassislar reytingi",          i: I.Trophy },
          ].map((r, i) =>
            h("label", { key: i, style: { display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid " + (r.def ? "var(--brand)" : "var(--border-color)"), background: r.def ? "var(--brand-soft)" : "var(--bg-surface)", borderRadius: 6, cursor: "pointer" } }, [
              h("input", { type: "radio", className: "radio", name: "rtype", defaultChecked: r.def }),
              h(r.i, { key: 1, size: 16, style: { color: "var(--brand)", flexShrink: 0 } }),
              h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, r.t),
                h("div", { key: 2, className: "cell-sub" }, r.d),
              ]),
            ])
          )),
        ]),
        h("div", { className: "field", key: 3 }, [
          h("label", { className: "field__label" }, "Til"),
          h("select", { className: "select" }, [
            h("option", { key: 1 }, "O‘zbek (lotin)"),
            h("option", { key: 2 }, "O‘zbek (kirill)"),
            h("option", { key: 3 }, "Ingliz"),
            h("option", { key: 4 }, "Rus"),
          ]),
        ]),
        h("div", { className: "field", key: 4 }, [
          h("label", { className: "field__label" }, "Formatlar"),
          h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, ["DOCX", "PDF", "XLSX", "HTML"].map((f, i) =>
            h("label", { key: f, className: "tag " + (i < 2 ? "tag--brand" : "tag--outline"), style: { cursor: "pointer", padding: "4px 10px" } }, [
              i < 2 ? h(I.Check, { size: 10, key: "i" }) : null,
              h("span", { key: "n" }, f),
            ])
          )),
        ]),
        h("div", { className: "field span-2", key: 5 }, [
          h("label", { className: "field__label" }, "Bo‘limlar"),
          h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } }, [
            "Tashkilot ma‘lumotlari", "Audit guruhi va vazifalar", "Aniqlangan findinglar (24)", "Konfiguratsiya tahlili", "Skaner natijalari", "Trafik tahlili", "AI executive summary", "Remediation plan", "KPI natijalari", "Ilovalar va dalillar",
          ].map((s, i) =>
            h("label", { key: i, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" } }, [
              h("input", { type: "checkbox", className: "checkbox", defaultChecked: i !== 9 }),
              h("span", null, s),
            ])
          )),
        ]),
      ]),
    ]);
  }

  // ---------- Mount ----------
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(h(App));
})();
