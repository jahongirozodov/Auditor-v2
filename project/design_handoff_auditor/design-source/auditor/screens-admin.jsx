/* Admin screens: global Tokens, Users, Permissions matrix, Logs, Reports. */
(function () {
  const { useState, useMemo, useEffect, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // GLOBAL TOKENS SCREEN
  // =========================================================================
  function TokensScreen({ setRoute, role }) {
    const [showCreate, setShowCreate] = useState(false);
    const [showInfo, setShowInfo] = useState(null);

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Audit tokenlar" }],
        title: "Audit tokenlar boshqaruvi",
        sub: D.TOKENS.filter(t => t.status === "active").length + " aktiv · " + D.TOKENS.filter(t => t.status === "expired").length + " muddati o‘tgan · " + D.TOKENS.filter(t => t.status === "revoked").length + " bekor qilingan",
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Tokenlar XLSX formatda eksport qilindi", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Eksport")]),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => setShowCreate(true) }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Token chiqarish")]),
        ],
      }),

      // Stats
      h("div", { key: "s", className: "grid", style: { gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 } }, [
        h(Stat, { key: 1, icon: I.KeyRound, label: "Aktiv tokenlar",    value: D.TOKENS.filter(t => t.status === "active").length, meta: "4 ta auditda" }),
        h(Stat, { key: 2, icon: I.Smartphone, label: "Bog‘langan qurilmalar", value: D.TOKENS.length, meta: "Windows 100%" }),
        h(Stat, { key: 3, icon: I.Activity,   label: "24h sync",         value: 142, delta: 8, meta: "Muvaffaqiyatli" }),
        h(Stat, { key: 4, icon: I.ShieldAlert, label: "Anomaliya",       value: 0, meta: "Notanish qurilma yo‘q" }),
      ]),

      h(window.TokenManagement, { key: "t", tokens: D.TOKENS, scope: "global" }),

      h(window.Modal, {
        open: showCreate,
        onClose: () => setShowCreate(false),
        title: h("span", null, [h(I.KeyRound, { size: 16, style: { marginRight: 8 } }), "Yangi audit token"]),
        wide: true,
        footer: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => setShowCreate(false) }, "Bekor"),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => setShowCreate(false) }, [h(I.Check, { key: "i", size: 14 }), h("span", { key: "t" }, "Token chiqarish")]),
        ],
      }, [
        h("div", { className: "form-grid" }, [
          h("div", { className: "field span-2", key: 1 }, [
            h("label", { className: "field__label" }, "Audit"),
            h("select", { className: "select" }, D.AUDITS.map(a => h("option", { key: a.id, value: a.id }, a.code + " — " + a.title))),
          ]),
          h("div", { className: "field span-2", key: 2 }, [
            h("label", { className: "field__label" }, "Xodim (token egasi)"),
            h("select", { className: "select" }, D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u => h("option", { key: u.id }, u.name + " — " + u.title))),
          ]),
          h("div", { className: "field", key: 3 }, [
            h("label", { className: "field__label" }, "Boshlanish vaqti"),
            h("input", { className: "input", type: "datetime-local", defaultValue: "2026-05-20T09:00" }),
          ]),
          h("div", { className: "field", key: 4 }, [
            h("label", { className: "field__label" }, "Tugash vaqti"),
            h("input", { className: "input", type: "datetime-local", defaultValue: "2026-05-31T18:00" }),
          ]),
          h("div", { className: "field span-2", key: 5 }, [
            h("label", { className: "field__label" }, "Token ochadigan vazifalar (xodimga biriktirilganlar ichidan)"),
            h("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, D.TASKS.slice(0, 5).map((t, i) =>
              h("label", { key: t.id, style: { display: "flex", gap: 10, alignItems: "center", padding: 8, background: "var(--bg-surface-2)", borderRadius: 6 } }, [
                h("input", { type: "checkbox", className: "checkbox", defaultChecked: i < 3 }),
                h("span", { key: 1, className: "font-mono", style: { fontSize: 12 } }, t.id),
                h("span", { key: 2, style: { flex: 1, fontSize: 13 } }, t.title),
              ])
            )),
          ]),
          h("div", { className: "field span-2", key: 6 }, [
            h("label", { className: "field__label" }, "Qurilma bog‘lash"),
            h("div", { style: { display: "flex", gap: 8 } }, [
              h("label", { className: "radio-row", style: { display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid var(--brand)", borderRadius: 6, flex: 1, background: "var(--brand-soft)" } }, [
                h("input", { type: "radio", className: "radio", defaultChecked: true, name: "dev" }),
                h("div", { key: 1 }, [
                  h("div", { key: 1, style: { fontSize: 13, fontWeight: 600 } }, "Birinchi ulanishda bog‘lash"),
                  h("div", { key: 2, className: "cell-sub" }, "Agent birinchi marta tokenni ishlatganda qurilma ID bog‘lanadi"),
                ]),
              ]),
              h("label", { className: "radio-row", style: { display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid var(--border-color)", borderRadius: 6, flex: 1 } }, [
                h("input", { type: "radio", className: "radio", name: "dev" }),
                h("div", { key: 1 }, [
                  h("div", { key: 1, style: { fontSize: 13, fontWeight: 600 } }, "Aniq qurilmaga bog‘lash"),
                  h("div", { key: 2, className: "cell-sub" }, "Mavjud qurilmani tanlang"),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
  }
  window.TokensScreen = TokensScreen;

  // =========================================================================
  // USERS SCREEN
  // =========================================================================
  function UsersScreen({ setRoute }) {
    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Foydalanuvchilar" }],
        title: "Foydalanuvchilar",
        sub: D.USERS.length + " ta foydalanuvchi · " + D.ROLES.length + " ta rol",
        actions: [
          h("div", { key: 0, className: "input-group", style: { width: 240 } }, [
            h(I.Search, { className: "icon-l" }),
            h("input", { className: "input", placeholder: "Ism, lavozim..." }),
          ]),
          h(window.FilterButton, { key: 1, kind: "users" }),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.__openCreateUser && window.__openCreateUser() }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Yangi foydalanuvchi")]),
        ],
      }),

      // Stats
      h("div", { key: "s", className: "grid", style: { gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 } },
        D.ROLES.map(r => {
          const count = D.USERS.filter(u => u.role === r.id).length;
          return h("div", { key: r.id, className: "card card__pad-sm", style: { display: "flex", flexDirection: "column", gap: 4 } }, [
            h("div", { key: 1, className: "cell-sub", style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 } }, r.short),
            h("div", { key: 2, style: { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text-primary)" } }, count),
          ]);
        })
      ),

      h("div", { key: "t", className: "tbl-wrap" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
        h("thead", { key: "h" }, h("tr", null, [
          h("th", { key: 0 }, h("input", { className: "checkbox", type: "checkbox" })),
          h("th", { key: 1 }, "Foydalanuvchi"),
          h("th", { key: 2 }, "Rol"),
          h("th", { key: 3 }, "Bo‘lim"),
          h("th", { key: 4 }, "Faol auditlar"),
          h("th", { key: 5 }, "KPI"),
          h("th", { key: 6 }, "Oxirgi kirish"),
          h("th", { key: 7 }, "Holat"),
          h("th", { key: 8, className: "cell-actions" }, ""),
        ])),
        h("tbody", { key: "b" }, D.USERS.map((u, i) => {
          const kpi = D.KPI_USERS.find(k => k.user === u.id);
          return h("tr", { key: u.id }, [
            h("td", { key: 0 }, h("input", { className: "checkbox", type: "checkbox" })),
            h("td", { key: 1 }, h("div", { className: "cell-title" }, [
              h(Avatar, { user: u, key: 1, size: "lg" }),
              h("div", null, [
                h("div", { key: 1 }, u.name),
                h("div", { key: 2, className: "cell-sub" }, "@" + u.id + " · " + u.title),
              ]),
            ])),
            h("td", { key: 2 }, h("span", { className: "tag " + (u.role === "departament" ? "tag--brand" : u.role === "bolim" ? "tag--info" : "tag--outline") }, u.title)),
            h("td", { key: 3 }, u.dept),
            h("td", { key: 4 }, h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, [
              h("span", { key: 1, className: "tabular text-primary font-semi" }, kpi ? kpi.audits : 0),
              kpi && kpi.audits > 0 ? h(AvatarStack, { key: 2, users: ["o1", "o2", "o3"].slice(0, Math.min(kpi.audits, 3)).map(() => u.id) }) : null,
            ])),
            h("td", { key: 5, className: "tabular text-primary font-semi" }, kpi ? kpi.total : "—"),
            h("td", { key: 6, className: "tabular cell-sub" }, ["2 daqiqa", "10 daqiqa", "1 soat", "Bugun 09:42", "2 kun", "Kecha"][i % 6]),
            h("td", { key: 7 }, h("span", { className: "tag tag--success" }, [h("span", { className: "dot", style: { width: 6, height: 6 } }), "Faol"])),
            h("td", { key: 8, className: "cell-actions" }, h("div", { style: { display: "inline-flex", gap: 4, alignItems: "center" } }, [
              h("button", {
                key: 1,
                className: "btn btn--ghost btn--xs btn--icon",
                title: "Tahrirlash",
                onClick: () => window.__openCreateUser && window.__openCreateUser(),
              }, h(I.Edit3, { key: "i-edit3", size: 13 })),
              h("button", {
                key: 2,
                className: "btn btn--ghost btn--xs btn--icon",
                title: "Bloklash",
                onClick: async () => {
                  const ok = await window.confirmAction({
                    title: "Foydalanuvchini bloklash",
                    body: u.name + " (" + u.title + ") hisobini bloklamoqchimisiz? U tizimga kira olmaydi, lekin barcha auditlar saqlanadi.",
                    confirmLabel: "Bloklash",
                    danger: true,
                  });
                  if (ok) window.showToast(u.name + " bloklandi", "warning");
                },
              }, h(I.Lock, { key: "i-lock", size: 13 })),
              h(window.MoreMenu, {
                key: 3,
                items: [
                  { label: "Profilni ko'rish",    icon: I.Eye,         onClick: () => window.showToast("Profil ochilmoqda...", "info") },
                  { label: "Parolni qayta tiklash", icon: I.Key,        onClick: () => window.showToast("Tiklash linki email'ga yuborildi", "success") },
                  { label: "Rolni o'zgartirish",  icon: I.UserCheck,    onClick: () => window.__openCreateUser && window.__openCreateUser() },
                  { label: "KPI hisoboti",        icon: I.BarChart3,    onClick: () => window.showToast("KPI hisoboti tayyorlanmoqda...", "info") },
                  { sep: true },
                  { label: "Hisobni o'chirish",   icon: I.Trash2,       danger: true, onClick: async () => {
                    const ok = await window.confirmAction({
                      title: "Hisobni o'chirish",
                      body: u.name + " hisobini butunlay o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi.",
                      confirmLabel: "O'chirish",
                      danger: true,
                    });
                    if (ok) window.showToast(u.name + " o'chirildi", "danger");
                  }},
                ],
              }),
            ])),
          ]);
        })),
      ]))),
    ]);
  }
  window.UsersScreen = UsersScreen;

  // =========================================================================
  // PERMISSIONS MATRIX
  // =========================================================================
  function PermissionsScreen({ setRoute }) {
    const [editMode, setEditMode] = useState(false);
    const [overrides, setOverrides] = useState({}); // { "moduleId:col": value }
    const [dirty, setDirty] = useState(false);

    const cycle = ["no", "read", "own", "full"];

    function cellValue(m, col) {
      const key = m.id + ":" + col;
      return overrides[key] != null ? overrides[key] : m[col];
    }
    function cycleCell(m, col) {
      const key = m.id + ":" + col;
      const cur = cellValue(m, col);
      const idx = cycle.indexOf(cur);
      const next = cycle[(idx + 1) % cycle.length];
      setOverrides(o => ({ ...o, [key]: next }));
      setDirty(true);
    }
    function discard() {
      setOverrides({});
      setDirty(false);
      setEditMode(false);
    }
    function save() {
      // In a real app, would POST to server. Here we just exit edit mode.
      setDirty(false);
      setEditMode(false);
    }

    const changedCount = Object.keys(overrides).filter(k => {
      const [mid, col] = k.split(":");
      const m = D.PERM_MODULES.find(x => x.id === mid);
      return m && overrides[k] !== m[col];
    }).length;

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Rollar va ruxsatlar" }],
        title: "Rollar va ruxsatlar matritsasi",
        sub: "5 ta tizim roli. Vaqtinchalik audit vazifalari (rahbar, auditor, tahlilchi) audit konteksti sifatida ishlaydi va alohida rol emas.",
        actions: editMode ? [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: discard }, [h(I.X, { key: "i", size: 14 }), h("span", { key: "t" }, "Bekor qilish")]),
          h("button", {
            key: 2,
            className: "btn btn--primary btn--sm",
            onClick: save,
            disabled: !dirty,
            style: !dirty ? { opacity: 0.55, cursor: "not-allowed" } : {},
          }, [h(I.Check, { key: "i", size: 14 }), h("span", { key: "t" }, "Saqlash" + (changedCount > 0 ? " (" + changedCount + ")" : ""))]),
        ] : [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Ruxsatlar matritsasi XLSX formatda eksport qilindi", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Eksport")]),
          h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => setEditMode(true) }, [h(I.Edit3, { key: "i", size: 14 }), h("span", { key: "t" }, "Tahrir rejimi")]),
        ],
      }),

      // Edit-mode banner
      editMode ? h("div", { key: "bn", className: "edit-banner" }, [
        h("span", { key: 0, className: "edit-banner__icon" }, h(I.Edit3, { size: 14 })),
        h("div", { key: 1, style: { flex: 1, minWidth: 0 } }, [
          h("div", { key: 1, className: "edit-banner__title" }, "Tahrir rejimi yoqilgan"),
          h("div", { key: 2, className: "edit-banner__sub" }, "Ruxsat yacheykasini bosing — qiymat ketma-ket aylanadi: Yo'q → Ko'rish → O'ziga tegishli → To'liq. O'zgarishlar saqlanguncha vaqtinchalik."),
        ]),
        changedCount > 0 ? h("span", { key: 2, className: "tag tag--brand" }, changedCount + " o'zgarish") : null,
      ]) : null,

      // Legend
      h("div", { key: "lg", className: "card card__pad-sm", style: { marginBottom: 14, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" } }, [
        h("span", { key: "l", className: "text-sm font-bold text-muted", style: { textTransform: "uppercase", letterSpacing: "0.08em" } }, "Ko‘rsatkichlar:"),
        ...[
          { v: "full", l: "To‘liq" },
          { v: "read", l: "Ko‘rish" },
          { v: "own", l: "O‘ziga tegishli" },
          { v: "no", l: "Yo‘q" },
        ].map(x => h("span", { key: x.v, style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" } }, [
          h("span", { key: 1, className: "perm " + D.PERM_VALUES[x.v].className },
            x.v === "full" ? h(I.Check, { key: "i-check", size: 14 }) :
            x.v === "read" ? h(I.Eye, { key: "i-eye", size: 14 }) :
            x.v === "own" ? h(I.User, { key: "i-user", size: 14 }) :
            h(I.X, { key: "i-x", size: 14 })
          ),
          h("span", { key: 2 }, x.l),
        ])),
      ]),

      h("div", { key: "m", className: "tbl-wrap" + (editMode ? " matrix-wrap--edit" : "") }, h("div", { className: "tbl-scroll" },
        h("table", { className: "matrix" }, [
          h("thead", { key: "h" }, h("tr", null, [
            h("th", { key: 1, style: { textAlign: "left" } }, "Modul / Funksiya"),
            ...D.ROLES.map(r => h("th", { key: r.id }, h("div", { style: { display: "flex", flexDirection: "column", gap: 2, alignItems: "center" } }, [
              h(r.id === "departament" ? I.ShieldCheck : r.id === "bolim" ? I.Briefcase : r.id === "bosh" ? I.Star : r.id === "yetakchi" ? I.User : I.UserCheck, { size: 16, key: 1, style: { color: "var(--brand)" } }),
              h("span", { key: 2 }, r.short),
            ]))),
          ])),
          h("tbody", { key: "b" }, D.PERM_MODULES.map(m =>
            h("tr", { key: m.id }, [
              h("th", { key: 1 }, m.name),
              ...["d", "b", "bs", "y", "t1"].map((col, i) => {
                const v = cellValue(m, col);
                const pv = D.PERM_VALUES[v];
                const icon = v === "full" ? I.Check : v === "read" ? I.Eye : v === "own" ? I.User : I.X;
                const origVal = m[col];
                const changed = editMode && v !== origVal;
                return h("td", { key: i },
                  h("span", {
                    className: "perm " + pv.className + (editMode ? " perm--editable" : "") + (changed ? " perm--changed" : ""),
                    title: editMode ? pv.label + " — bosing: keyingi qiymat" : pv.label,
                    role: editMode ? "button" : undefined,
                    tabIndex: editMode ? 0 : undefined,
                    onClick: editMode ? () => cycleCell(m, col) : undefined,
                    onKeyDown: editMode ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cycleCell(m, col); } } : undefined,
                  }, h(icon, { size: 14 }))
                );
              }),
            ])
          )),
        ])
      )),
    ]);
  }
  window.PermissionsScreen = PermissionsScreen;

  // =========================================================================
  // LOGS SCREEN
  // =========================================================================
  function LogsScreen({ setRoute, embedded }) {
    return h("div", null, [
      embedded ? null : h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Audit loglar" }],
        title: "Audit loglar",
        sub: D.LOGS.length + " ta hodisa · oxirgi 24 soat · login, finding, token, sync, AI, KPI",
        actions: [
          h("div", { key: 0, className: "input-group", style: { width: 240 } }, [
            h(I.Search, { className: "icon-l" }),
            h("input", { className: "input", placeholder: "Action, IP, user..." }),
          ]),
          h(window.FilterButton, { key: 1, kind: "logs" }),
          h("button", { key: 2, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Audit loglari CSV formatda yuklab olindi (" + D.LOGS.length + " yozuv)", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Eksport")]),
        ],
      }),

      embedded ? null : h("div", { key: "qf", style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" } }, [
        h("span", { key: 0, className: "tag tag--brand" }, "Hammasi · " + D.LOGS.length),
        h("span", { key: 1, className: "tag tag--outline" }, "Login · " + D.LOGS.filter(l => l.action.startsWith("auth")).length),
        h("span", { key: 2, className: "tag tag--outline" }, "Finding · " + D.LOGS.filter(l => l.action.startsWith("finding")).length),
        h("span", { key: 3, className: "tag tag--outline" }, "Token · " + D.LOGS.filter(l => l.action.startsWith("token")).length),
        h("span", { key: 4, className: "tag tag--outline" }, "Agent · " + D.LOGS.filter(l => l.action.startsWith("agent")).length),
        h("span", { key: 5, className: "tag tag--warning" }, "Xato · " + D.LOGS.filter(l => l.level === "warn").length),
      ]),

      h("div", { key: "t", className: "tbl-wrap" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
        h("thead", { key: "h" }, h("tr", null, [
          h("th", { key: 1 }, "Vaqt"),
          h("th", { key: 2 }, "Daraja"),
          h("th", { key: 3 }, "Foydalanuvchi"),
          h("th", { key: 4 }, "Action"),
          h("th", { key: 5 }, "Entity"),
          h("th", { key: 6 }, "IP / qurilma"),
        ])),
        h("tbody", { key: "b" }, D.LOGS.map((l, i) => {
          const u = D.userById(l.user);
          return h("tr", { key: i }, [
            h("td", { key: 1, className: "tabular font-mono cell-sub" }, l.time),
            h("td", { key: 2 }, l.level === "warn" ? h("span", { className: "tag tag--warning" }, "WARN") : h("span", { className: "tag tag--ghost" }, "INFO")),
            h("td", { key: 3 }, h("div", { className: "cell-title" }, [
              h(Avatar, { user: u, key: 1 }),
              h("div", null, [
                h("div", { key: 1, style: { fontSize: 13 } }, u.name),
                h("div", { key: 2, className: "cell-sub" }, "@" + l.user),
              ]),
            ])),
            h("td", { key: 4 }, h("span", { className: "font-mono tag " + (l.action.includes("approve") || l.action.includes("create") ? "tag--success" : l.action.includes("fail") ? "tag--danger" : "tag--info") }, l.action)),
            h("td", { key: 5, className: "font-mono cell-sub" }, l.entity),
            h("td", { key: 6 }, h("div", null, [
              h("div", { key: 1, className: "font-mono", style: { fontSize: 12.5, color: "var(--text-primary)" } }, l.ip),
              h("div", { key: 2, className: "cell-sub font-mono" }, l.device),
            ])),
          ]);
        })),
      ]))),
    ]);
  }
  window.LogsScreen = LogsScreen;

  // =========================================================================
  // REPORTS SCREEN
  // =========================================================================
  function ReportsScreen({ setRoute }) {
    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Hisobotlar" }],
        title: "Hisobotlar",
        sub: D.REPORTS.length + " ta hisobot · " + D.REPORTS.filter(r => r.status === "draft").length + " qoralama · " + D.REPORTS.filter(r => r.status === "approved").length + " tasdiqlangan",
        actions: [
          h("div", { key: 0, className: "input-group", style: { width: 240 } }, [
            h(I.Search, { className: "icon-l" }),
            h("input", { className: "input", placeholder: "Hisobot, audit..." }),
          ]),
          h(window.FilterButton, { key: 1, kind: "reports" }),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.__openCreateReport && window.__openCreateReport() }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Hisobot generatsiya")]),
        ],
      }),

      h("div", { key: "g", className: "grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 } },
        D.REPORTS.map(r => h("div", { key: r.id, className: "card card--hover" }, [
          h("div", { key: 1, style: { padding: "16px 18px 12px", display: "flex", alignItems: "flex-start", gap: 12 } }, [
            h("div", { key: 1, style: { width: 48, height: 56, background: "linear-gradient(180deg, var(--bg-surface) 0%, var(--brand-soft) 100%)", border: "1px solid var(--border-color)", borderRadius: "6px 6px 6px 14px", display: "grid", placeItems: "center", color: "var(--brand)", position: "relative" } }, [
              h(I.FileText, { size: 20, key: 1 }),
              h("span", { key: 2, className: "font-mono", style: { position: "absolute", bottom: 4, fontSize: 8, fontWeight: 700, color: "var(--brand)" } }, r.format[0]),
            ]),
            h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
              h("div", { key: 1, style: { fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 } }, r.title),
              h("div", { key: 2, className: "cell-sub", style: { marginTop: 4 } }, r.type),
            ]),
            h(window.MoreMenu, {
              key: 3,
              items: [
                { label: "Hisobotni tahrirlash",  icon: I.Edit3,    onClick: () => window.showToast("Hisobot tahrirlash oynasi ochilmoqda...", "info") },
                { label: "PDF preview",             icon: I.Eye,      onClick: () => window.showToast("PDF preview ochilmoqda...", "info") },
                { label: "Email orqali yuborish",   icon: I.Send,     onClick: () => window.showToast("Hisobot email orqali yuborildi", "success") },
                { label: "AI orqali qayta yaratish", icon: I.Sparkles, onClick: () => window.showToast("AI orqali qayta yaratish boshlandi (qwen2.5:14b)", "info") },
                { sep: true },
                { label: "Hisobotni o'chirish",     icon: I.Trash2,   danger: true, onClick: async () => {
                  const ok = await window.confirmAction({
                    title: "Hisobotni o'chirish",
                    body: r.title + " hisobotini o'chirmoqchimisiz?",
                    confirmLabel: "O'chirish",
                    danger: true,
                  });
                  if (ok) window.showToast("Hisobot o'chirildi", "warning");
                }},
              ],
            }),
          ]),
          h("div", { key: 2, style: { padding: "0 18px 12px", display: "flex", gap: 6, flexWrap: "wrap" } }, [
            h("span", { key: 1, className: "font-mono cell-sub" }, r.audit),
            ...r.format.map(f => h("span", { key: f, className: "tag tag--outline" }, f)),
          ]),
          h("div", { key: 3, style: { padding: "12px 18px", borderTop: "1px solid var(--border-color)", background: "var(--bg-surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
            h("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 8 } }, [
              h(Avatar, { user: r.author, key: 1 }),
              h("div", { key: 2 }, [
                h("div", { key: 1, className: "cell-sub", style: { fontSize: 11 } }, r.generated === "—" ? "Hali yaratilmagan" : r.generated),
                h("div", { key: 2, className: "cell-sub", style: { fontSize: 11 } }, r.size),
              ]),
            ]),
            h("div", { key: 2, style: { display: "flex", gap: 6, alignItems: "center" } }, [
              h("span", { key: 1, className: "tag " + (r.status === "draft" ? "tag--warning" : r.status === "approved" ? "tag--success" : "tag--info") }, r.status === "draft" ? "Qoralama" : r.status === "approved" ? "Tasdiqlangan" : "Tekshiruvda"),
              h("button", {
                key: 2,
                className: "btn btn--ghost btn--xs btn--icon",
                title: "Yuklash",
                onClick: () => window.showToast(r.title + " yuklab olinmoqda... (" + r.format[0] + ")", "success"),
              }, h(I.Download, { key: "i-download", size: 13 })),
            ]),
          ]),
        ]))
      ),
    ]);
  }
  window.ReportsScreen = ReportsScreen;

})();
