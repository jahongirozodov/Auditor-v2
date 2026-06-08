/* EXE desktop agent — Windows-style window with internal nav. */
(function () {
  const { useState, useEffect, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  function AgentScreen({ setRoute }) {
    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "EXE agent (demo)" }],
        title: "Windows EXE desktop agent",
        sub: "Xodim kompyuteriga o‘rnatiladigan ilova. Audit token bilan kiradi, vazifalarni ochadi, offline ishlaydi va serverga sinxronlanadi.",
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("AuditorAgent_v1.2.4.exe (28.4 MB) yuklab olinmoqda...", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "EXE yuklab olish")]),
          h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("Versiyalar tarixi oynasi ochilmoqda...", "info") }, [h(I.History, { key: "i", size: 14 }), h("span", { key: "t" }, "Versiyalar")]),
        ],
      }),

      // Mock window with internal nav
      h("div", { key: "w", style: { display: "flex", justifyContent: "center", padding: "8px 0 32px" } },
        h(AgentWindow)
      ),

      // Info card
      h("div", { key: "i", className: "grid", style: { gridTemplateColumns: "repeat(3, 1fr)", gap: 14, maxWidth: 920, margin: "0 auto" } }, [
        { i: I.KeyRound, t: "Token orqali kirish",   d: "Login-parol + audit token kombinatsiyasi. Token faqat shu auditdagi vazifalarni ochadi." },
        { i: I.WifiOff,  t: "Offline rejim",          d: "Lokal shifrlangan SQLite bazasi. Tarmoq bo‘lsa avtomatik sinxronlash, yo‘qolsa navbatga olinadi." },
        { i: I.ShieldCheck, t: "Qurilma bog‘lanishi", d: "Birinchi ulanishda qurilma hostname + OS + agent versiyasi token bilan bog‘lanadi." },
      ].map((c, i) => h("div", { key: i, className: "card card__pad-sm", style: { display: "flex", flexDirection: "column", gap: 8 } }, [
        h("div", { key: 1, className: "stat__icon", style: { width: 36, height: 36 } }, h(c.i, { size: 16 })),
        h("div", { key: 2, style: { fontSize: 14, fontWeight: 700, color: "var(--text-primary)" } }, c.t),
        h("div", { key: 3, className: "text-sm text-muted", style: { lineHeight: 1.55 } }, c.d),
      ]))),
    ]);
  }
  window.AgentScreen = AgentScreen;

  // ---------- Agent Window ----------
  function AgentWindow() {
    const [view, setView] = useState("tasks"); // login -> token -> tasks/findings/sync
    const [loggedIn, setLoggedIn] = useState(true);
    const [tokenEntered, setTokenEntered] = useState(true);

    const navItems = [
      { id: "tasks",    label: "Mening vazifalarim", icon: I.CheckSquare,   count: 6 },
      { id: "findings", label: "Findinglar (lokal)", icon: I.AlertTriangle, count: 9 },
      { id: "files",    label: "Fayllar",             icon: I.Folder },
      { id: "sync",     label: "Sinxronlash",         icon: I.Refresh,       count: 3 },
      { id: "log",      label: "Lokal log",           icon: I.History },
      { id: "settings", label: "Sozlamalar",          icon: I.Settings },
    ];

    let body;
    if (!loggedIn) body = h(AgentLogin, { onNext: () => setLoggedIn(true) });
    else if (!tokenEntered) body = h(AgentToken, { onNext: () => setTokenEntered(true) });
    else if (view === "tasks") body = h(AgentTasks);
    else if (view === "findings") body = h(AgentFinding);
    else if (view === "files") body = h(AgentFiles);
    else if (view === "sync") body = h(AgentSync);
    else if (view === "log") body = h(AgentLog);
    else body = h(AgentSettings, { onLogout: () => { setLoggedIn(false); setTokenEntered(false); } });

    return h("div", { className: "win" }, [
      // Title bar
      h("div", { className: "win__title", key: 1 }, [
        h(I.ShieldCheck, { size: 14, key: 1 }),
        h("span", { className: "win__title-text", key: 2 }, "Auditor Agent — v1.2.4 · Bobur Mirzayev · AUD-2026-014"),
        h("div", { className: "win__btns", key: 3 }, [
          h("button", { key: 1, className: "win__btn" }, h("svg", { width: 12, height: 12, viewBox: "0 0 12 12" }, h("path", { d: "M2 6h8", stroke: "currentColor", strokeWidth: 1 }))),
          h("button", { key: 2, className: "win__btn" }, h("svg", { width: 12, height: 12, viewBox: "0 0 12 12" }, h("path", { d: "M2 2h8v8H2z", fill: "none", stroke: "currentColor", strokeWidth: 1 }))),
          h("button", { key: 3, className: "win__btn win__btn--close" }, h(I.X, { key: "i-x", size: 12 })),
        ]),
      ]),

      // Body
      h("div", { className: "win__body", key: 2 }, [
        loggedIn && tokenEntered ? h("aside", { className: "win__nav", key: 1 }, [
          h("div", { key: "tk", style: { padding: "10px", border: "1px solid var(--border-color)", borderRadius: 6, background: "var(--bg-surface)", marginBottom: 10 } }, [
            h("div", { key: 1, className: "cell-sub", style: { fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 } }, "Audit token"),
            h("div", { key: 2, className: "font-mono", style: { fontSize: 11, color: "var(--text-primary)", fontWeight: 600, marginTop: 4 } }, "tk_a91x…c47e"),
            h("div", { key: 3, className: "cell-sub", style: { fontSize: 10, marginTop: 2 } }, "31.05.2026 18:00 gacha"),
          ]),
          ...navItems.map(n => h("button", {
            key: n.id, className: "navitem" + (view === n.id ? " is-active" : ""),
            onClick: () => setView(n.id),
          }, [
            h(n.icon, { key: 1, size: 14 }),
            h("span", { className: "label", key: 2 }, n.label),
            n.count ? h("span", { className: "count", key: 3 }, n.count) : null,
          ])),
        ]) : null,
        h("section", { className: "win__main", key: 2 }, body),
      ]),

      // Status bar
      h("div", { className: "win__status", key: 3 }, [
        h("span", { key: 1, className: "seg" }, [
          h("span", { key: 1, className: "dot", style: { background: "var(--green-500)" } }),
          loggedIn && tokenEntered ? "Onlayn · server bilan aloqada" : "Avtorizatsiyada...",
        ]),
        h("span", { key: 2, className: "seg" }, "Sync: 12 daqiqa oldin"),
        h("span", { key: 3, className: "seg" }, "Qoralama: 0"),
        h("span", { key: 4, className: "seg" }, "Yuborilmagan: 3"),
        h("span", { key: 5, className: "seg", style: { marginLeft: "auto" } }, "Bobur Mirzayev · 10.20.4.142"),
        h("span", { key: 6, className: "seg" }, "v1.2.4"),
      ]),
    ]);
  }

  function AgentLogin({ onNext }) {
    return h("div", { style: { maxWidth: 360, margin: "20px auto" } }, [
      h("div", { key: 1, style: { textAlign: "center", marginBottom: 24 } }, [
        h("div", { key: 1, className: "brand-mark", style: { width: 48, height: 48, margin: "0 auto 12px" } }, h(I.ShieldCheck, { key: "i-shieldcheck", size: 26 })),
        h("h3", { key: 2, style: { fontSize: 18 } }, "Auditor Agent"),
        h("p", { key: 3, className: "cell-sub", style: { fontSize: 12, marginTop: 4 } }, "Lokal akkaunt bilan kiring"),
      ]),
      h("form", { key: 2, onSubmit: e => { e.preventDefault(); onNext(); }, style: { display: "flex", flexDirection: "column", gap: 12 } }, [
        h("label", { key: 1, className: "field__label", style: { fontSize: 12 } }, "Login"),
        h("input", { key: 2, className: "input", defaultValue: "b.mirzayev" }),
        h("label", { key: 3, className: "field__label", style: { fontSize: 12 } }, "Parol"),
        h("input", { key: 4, className: "input", type: "password", defaultValue: "••••••••••" }),
        h("button", { key: 5, type: "submit", className: "btn btn--primary", style: { marginTop: 8 } }, [h(I.LogIn, { key: "i", size: 14 }), h("span", { key: "t" }, "Kirish")]),
      ]),
    ]);
  }

  function AgentToken({ onNext }) {
    return h("div", { style: { maxWidth: 420, margin: "20px auto", textAlign: "center" } }, [
      h(I.KeyRound, { size: 36, key: 1, style: { color: "var(--brand)", margin: "0 auto 12px" } }),
      h("h3", { key: 2, style: { fontSize: 16 } }, "Audit tokenni kiriting"),
      h("p", { key: 3, className: "text-sm text-muted", style: { marginTop: 6 } }, "Token web tizimda audit kartasidan olinadi. Token faqat shu audit doirasidagi vazifalarni ochadi."),
      h("input", { key: 4, className: "input font-mono", style: { marginTop: 16, textAlign: "center", fontSize: 14, letterSpacing: "0.12em" }, defaultValue: "tk_a91x...c47e" }),
      h("button", { key: 5, className: "btn btn--primary", style: { marginTop: 16, width: "100%" }, onClick: onNext }, [h(I.Check, { key: "i", size: 14 }), h("span", { key: "t" }, "Tasdiqlash va vazifalarni yuklash")]),
    ]);
  }

  function AgentTasks() {
    return h("div", null, [
      h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 } }, [
        h("div", null, [
          h("h3", { key: 1, style: { fontSize: 17 } }, "Mening vazifalarim"),
          h("p", { key: 2, className: "cell-sub", style: { marginTop: 4 } }, "6 ta vazifa · 2 jarayonda · 3 yangi · oxirgi yangilash 12 daqiqa oldin"),
        ]),
        h("button", { className: "btn btn--soft btn--sm", onClick: () => window.showToast("Server bilan sinxronlash boshlandi...", "info") }, [h(I.Refresh, { key: "i", size: 13 }), h("span", { key: "t" }, "Sync")]),
      ]),

      h("div", { key: "l", style: { display: "flex", flexDirection: "column", gap: 8 } }, D.TASKS.filter(t => t.assignee === "u6" || t.assignee === "u3").slice(0, 6).map(t =>
        h("div", { key: t.id, className: "lrow" }, [
          h("input", { key: 1, type: "checkbox", className: "checkbox", defaultChecked: t.status === "done" }),
          h("div", { key: 2, className: "lrow__body" }, [
            h("div", { key: 1, className: "lrow__title" }, t.title),
            h("div", { key: 2, className: "lrow__sub" }, [
              h("span", { key: 1, className: "font-mono" }, t.id),
              " · " + t.type + " · ",
              h("span", { key: 2, style: { color: t.priority === "Yuqori" ? "var(--status-danger-fg)" : "var(--text-tertiary)" } }, t.priority),
            ]),
          ]),
          h("div", { key: 3, className: "lrow__meta" }, [
            h("span", { key: 1, className: "tag " + (t.status === "done" ? "tag--success" : t.status === "in_progress" ? "tag--info" : t.status === "blocked" ? "tag--danger" : "tag--ghost") }, D.TASK_STATUS[t.status].label),
            t.findings ? h("span", { key: 2, className: "cell-sub" }, [h(I.AlertTriangle, { size: 11, style: { marginRight: 3, verticalAlign: -1 } }), t.findings]) : null,
            h(I.ChevronRight, { size: 14, key: 3, style: { color: "var(--text-tertiary)" } }),
          ]),
        ])
      )),
    ]);
  }

  function AgentFinding() {
    return h("div", null, [
      h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 } }, [
        h("div", null, [
          h("h3", { key: 1, style: { fontSize: 17 } }, "Yangi finding"),
          h("p", { key: 2, className: "cell-sub", style: { marginTop: 4 } }, "T-114 · Firewall qoidalari va segmentatsiyani tahlil qilish"),
        ]),
        h("span", { className: "tag tag--warning" }, [h(I.WifiOff, { key: "i", size: 11 }), "Lokal qoralama"]),
      ]),
      h("div", { key: "f", style: { display: "flex", flexDirection: "column", gap: 10 } }, [
        h("div", { key: 1, className: "field" }, [
          h("label", { className: "field__label", style: { fontSize: 12 } }, "Sarlavha"),
          h("input", { className: "input", defaultValue: "Internal segment 10.0.0.0/8 ga to‘liq ruxsat berilgan" }),
        ]),
        h("div", { key: 2, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } }, [
          h("div", { className: "field", key: 1 }, [
            h("label", { className: "field__label", style: { fontSize: 12 } }, "Xavf darajasi"),
            h("select", { className: "select" }, [
              h("option", { key: 1 }, "Critical"),
              h("option", { key: 2 }, "High"),
              h("option", { key: 3 }, "Medium"),
              h("option", { key: 4 }, "Low"),
            ]),
          ]),
          h("div", { className: "field", key: 2 }, [
            h("label", { className: "field__label", style: { fontSize: 12 } }, "CVSS 3.1"),
            h("input", { className: "input tabular", defaultValue: "9.1" }),
          ]),
          h("div", { className: "field", key: 3 }, [
            h("label", { className: "field__label", style: { fontSize: 12 } }, "CWE"),
            h("input", { className: "input font-mono", defaultValue: "CWE-284" }),
          ]),
        ]),
        h("div", { key: 3, className: "field" }, [
          h("label", { className: "field__label", style: { fontSize: 12 } }, "Asset"),
          h("input", { className: "input font-mono", defaultValue: "FW-CORE-01" }),
        ]),
        h("div", { key: 4, className: "field" }, [
          h("label", { className: "field__label", style: { fontSize: 12 } }, "Tavsif"),
          h("textarea", { className: "textarea", defaultValue: "Asosiy firewall qoidalarida 10.0.0.0/8 manzilidan barcha portlarga TCP+UDP ruxsat berilgan. Segmentatsiya prinsiplari buzilgan.", style: { minHeight: 70 } }),
        ]),
        h("div", { key: 5, className: "field" }, [
          h("label", { className: "field__label", style: { fontSize: 12 } }, "Dalillar (3)"),
          h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, [
            h("span", { key: 1, className: "tag tag--ghost" }, [h(I.Image, { key: "i", size: 11 }), "screenshot-1.png"]),
            h("span", { key: 2, className: "tag tag--ghost" }, [h(I.FileText, { key: "i", size: 11 }), "fw-config.txt"]),
            h("span", { key: 3, className: "tag tag--ghost" }, [h(I.Activity, { key: "i", size: 11 }), "tcpdump.pcap"]),
            h("button", { key: 4, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info") }, [h(I.Paperclip, { key: "i", size: 12 }), h("span", { key: "t" }, "Biriktirish")]),
          ]),
        ]),
        h("div", { key: 6, style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 } }, [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Finding qoralamasi bekor qilindi", "info") }, "Bekor"),
          h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => window.showToast("Finding lokal saqlandi — sinxronlash kutilmoqda", "info") }, [h(I.Save, { key: "i", size: 13 }), h("span", { key: "t" }, "Lokal saqlash")]),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Finding serverga yuborildi (F-2026-0348)", "success") }, [h(I.Send, { key: "i", size: 13 }), h("span", { key: "t" }, "Yuborish")]),
        ]),
      ]),
    ]);
  }

  function AgentFiles() {
    return h("div", null, [
      h("h3", { key: 1, style: { fontSize: 17, marginBottom: 14 } }, "Lokal fayllar"),
      h("p", { key: 2, className: "cell-sub", style: { marginBottom: 14 } }, "Lokal shifrlangan SQLite + fayl bazasida saqlanadi. Tarmoq tiklangach avtomatik yuboriladi."),
      h("div", { key: 3, className: "tile-grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" } }, [
        { n: "fw-rule-perm.png",   m: "1.2 MB · synced",     ico: I.Image, color: "info" },
        { n: "fw-core-01.cfg",     m: "412 KB · synced",     ico: I.Server, color: "brand" },
        { n: "telnet-banners.png", m: "880 KB · pending",    ico: I.Image, color: "warning" },
        { n: "nessus-internal.csv", m: "1.4 MB · synced",    ico: I.Bug, color: "warning" },
        { n: "tcpdump-dns.pcap",   m: "94 MB · uploading",   ico: I.Activity, color: "info" },
        { n: "ad-policy.txt",      m: "2.1 KB · queued",     ico: I.FileText, color: "ghost" },
      ].map((f, i) => h("div", { key: i, className: "tile" }, [
        h("div", { key: 1, className: "tile__thumb" }, h(f.ico, { size: 24, style: { color: "var(--text-tertiary)" } })),
        h("div", { key: 2, className: "tile__body" }, [
          h("div", { key: 1, className: "tile__name font-mono" }, f.n),
          h("div", { key: 2, className: "tile__meta" }, f.m),
        ]),
      ]))),
    ]);
  }

  function AgentSync() {
    return h("div", null, [
      h("div", { key: 1, style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, [
        h("div", null, [
          h("h3", { key: 1, style: { fontSize: 17 } }, "Sinxronlash"),
          h("p", { key: 2, className: "cell-sub" }, "Server bilan ma‘lumotlarni almashtirish navbati"),
        ]),
        h("button", { className: "btn btn--primary btn--sm", onClick: () => window.showToast("Sinxronlash boshlandi — 6 vazifa server bilan ulashilmoqda", "info") }, [h(I.Refresh, { key: "i", size: 13 }), h("span", { key: "t" }, "Hozir sinxronla")]),
      ]),

      // Status banner
      h("div", { key: 2, className: "card card__pad-sm", style: { background: "var(--status-success-bg)", border: "1px solid rgba(16, 185, 129, 0.3)", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 } }, [
        h("div", { key: 1, style: { width: 28, height: 28, borderRadius: "50%", background: "var(--green-500)", display: "grid", placeItems: "center", color: "white" } }, h(I.Wifi, { key: "i-wifi", size: 14 })),
        h("div", { key: 2, style: { flex: 1 } }, [
          h("div", { key: 1, style: { fontSize: 13, fontWeight: 700, color: "var(--status-success-fg)" } }, "Onlayn · server bilan aloqada"),
          h("div", { key: 2, className: "cell-sub" }, "Oxirgi muvaffaqiyatli sinxronlash: 12 daqiqa oldin · 4 finding, 2 fayl yuborildi"),
        ]),
      ]),

      // Queue
      h("div", { key: 3, className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, [
          h("div", { className: "panel__t" }, [h(I.Upload, { key: "i", size: 14 }), h("span", { key: "t" }, "Yuborish navbati (3)")]),
          h("span", { className: "cell-sub", key: 2 }, "AUD-2026-014"),
        ]),
        h("div", { className: "panel__body panel__body--flush", key: 2 },
          [
            { item: "F-LOCAL-3a92 — RDP NLA off, 3 server", status: "uploading", progress: 64, size: "12 KB" },
            { item: "screenshot-fw-rule.png",               status: "queued",    progress: 0,  size: "1.2 MB" },
            { item: "Vazifa T-118 — status: bajarilgan",    status: "queued",    progress: 0,  size: "1 KB" },
          ].map((q, i, arr) => h("div", { key: i, style: { padding: "10px 14px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none" } }, [
            h("div", { key: 1, style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, [
              h("span", { key: 1, style: { fontSize: 13, color: "var(--text-primary)" } }, q.item),
              h("span", { key: 2, className: "tag " + (q.status === "uploading" ? "tag--info" : "tag--ghost"), style: { fontSize: 10 } }, q.status === "uploading" ? "Yuborilmoqda " + q.progress + "%" : "Navbatda"),
            ]),
            h("div", { key: 2, style: { marginTop: 6, display: "flex", gap: 8, alignItems: "center" } }, [
              h("div", { key: 1, className: "progress", style: { flex: 1, height: 4 } }, h("span", { style: { width: q.progress + "%" } })),
              h("span", { key: 2, className: "cell-sub tabular" }, q.size),
            ]),
          ])),
        ),
      ]),

      h("div", { key: 4, style: { marginTop: 14 } }, h("h4", { style: { fontSize: 13, marginBottom: 6 } }, "Oxirgi sinxronlash loglari")),
      h("pre", { key: 5, className: "code-block" }, [
        "[10:28:12] INFO  Sync session started",
        "[10:28:12] INFO  Server reachable (200ms)",
        "[10:28:13] INFO  Auth check — token tk_a91x...c47e OK",
        "[10:28:13] INFO  Pulling task updates (3 changed)",
        "[10:28:14] INFO  Uploading findings (4 new)",
        "[10:28:18] INFO  Uploading evidence files (2)",
        "[10:28:23] INFO  Sync session completed in 11.4s",
      ].join("\n")),
    ]);
  }

  function AgentLog() {
    return h("div", null, [
      h("h3", { key: 1, style: { fontSize: 17, marginBottom: 14 } }, "Lokal log"),
      h("pre", { key: 2, className: "code-block" }, [
        "[10:42:14] INFO  Finding F-LOCAL-3a92 created (RDP NLA off)",
        "[10:39:01] INFO  Task T-118 status changed: new → in_progress",
        "[10:35:48] INFO  Evidence attached: screenshot-fw-rule.png",
        "[10:28:23] INFO  Sync session completed (success)",
        "[10:28:12] INFO  Sync session started",
        "[10:11:42] WARN  Network unreachable — entering offline mode",
        "[10:11:08] INFO  User authenticated locally",
        "[10:10:55] INFO  Audit token validated (tk_a91x...c47e)",
        "[10:10:42] INFO  Application started — v1.2.4",
        "[10:10:42] INFO  Local DB integrity check: OK (checksum match)",
      ].join("\n")),
    ]);
  }

  function AgentSettings({ onLogout }) {
    return h("div", null, [
      h("h3", { key: 1, style: { fontSize: 17, marginBottom: 14 } }, "Sozlamalar"),
      h("div", { key: 2, style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h(SettingRow, { label: "Server manzili",      value: "https://audit.gov.uz:8443" }),
        h(SettingRow, { label: "Sinxronlash davri",    value: "Har 5 daqiqada" }),
        h(SettingRow, { label: "Lokal shifrlash",      value: "AES-256-GCM (yoqilgan)", success: true }),
        h(SettingRow, { label: "Agent versiyasi",      value: "v1.2.4 (eng so‘nggi)", success: true }),
        h(SettingRow, { label: "Avtomatik yangilanish", value: "Yoqilgan" }),
      ]),
      h("div", { key: 3, style: { marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border-color)" } }, [
        h("button", { key: 1, className: "btn btn--danger btn--sm", onClick: onLogout }, [h(I.LogOut, { key: "i", size: 13 }), h("span", { key: "t" }, "Logout & token bekor qilish")]),
        h("span", { className: "cell-sub", key: 2 }, "© 2026 Audit boshqaruvi"),
      ]),
    ]);
  }
  function SettingRow({ label, value, success }) {
    return h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid var(--border-color)" } }, [
      h("span", { key: 1, style: { fontSize: 13, color: "var(--text-secondary)" } }, label),
      h("span", { key: 2, style: { fontSize: 13, fontWeight: 600, color: success ? "var(--status-success-fg)" : "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: 6 } }, [
        success ? h(I.Check, { size: 13, key: "i" }) : null,
        h("span", { key: "v" }, value),
      ]),
    ]);
  }

})();
