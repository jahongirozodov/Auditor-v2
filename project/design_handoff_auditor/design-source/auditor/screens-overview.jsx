/* Login screen + Departament dashboard + Audits list + My tasks (kanban). */
(function () {
  const { useState, useMemo, useEffect, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // LOGIN
  // =========================================================================
  function LoginScreen({ onLogin }) {
    const [showPass, setShowPass] = useState(false);
    return h("div", { className: "login" }, [
      h("div", { key: "s", className: "login__side" }, [
        // ---- animated atmosphere ----
        h("div", { key: "bg", className: "login__bg", "aria-hidden": "true" }, [
          h("div", { key: 1, className: "login__grid" }),
          h("div", { key: 2, className: "login__sweep" }),
          h("div", { key: 3, className: "login__blob login__blob--1" }),
          h("div", { key: 4, className: "login__blob login__blob--2" }),
          h("div", { key: 5, className: "login__blob login__blob--3" }),
          h("div", { key: 6, className: "login__scan" }),
          h("div", { key: 7, className: "login__particles" },
            Array.from({ length: 18 }).map((_, i) => h("i", { key: i, className: "login__pt", style: { left: ((i * 53) % 100) + "%", animationDelay: (i * 0.6).toFixed(1) + "s", animationDuration: (7 + (i % 5)) + "s" } }))
          ),
        ]),
        h("div", { key: "top", className: "login__brandrow", style: { display: "flex", alignItems: "center", gap: 12 } }, [
          h("div", { key: "mk", className: "login__mark-wrap" }, [
            h("span", { key: 0, className: "login__radar" }),
            h("span", { key: 1, className: "login__radar login__radar--2" }),
            h("div", { key: 2, className: "brand-mark login__mark", style: { width: 40, height: 40 } },
              h(I.ShieldCheck, { key: "i-shieldcheck", size: 22 })
            ),
          ]),
          h("div", { key: "t", className: "brand-text-wrap" }, [
            h("span", { key: 1, className: "brand-title", style: { fontSize: 16 } }, "Auditor"),
            h("span", { key: 2, className: "brand-sub" }, "Axborot xavfsizligi auditi"),
          ]),
        ]),
        h("div", { key: "hero", className: "login__hero" }, [
          h("div", { key: "c", className: "login__chip" }, [
            h("span", { key: "d", className: "dot" }),
            h("span", { key: "t" }, "Yopiq kontur · internetsiz muhit"),
          ]),
          h("h1", { key: "h", style: { marginTop: 20 } }, "Audit jarayonini boshidan oxirigacha — bitta tizimda."),
          h("p", { key: "p" }, "Auditlarni rejalashtirish, vazifalarni taqsimlash, joyida ma‘lumot yig‘ish va yakuniy hisobotlarni shakllantirish — barchasi tashkilot ichki tarmog‘ida."),
          h("div", { key: "f", className: "login__feats" }, [
            { i: I.KeyRound, t: "Audit token va EXE agent", s: "Har bir audit uchun alohida token. Xodim faqat o‘ziga biriktirilgan vazifalarni ko‘radi." },
            { i: I.Brain,    t: "Ollama lokal AI tahlil",   s: "Findinglar, konfiguratsiya va trafik tahlili bo‘yicha xulosa va remediation tavsiyalari." },
            { i: I.Trophy,   t: "KPI hisoblash",            s: "Mutaxassislar faoliyati har bir bajarilgan vazifa va tasdiqlangan zaiflik bo‘yicha avtomatik baholanadi." },
          ].map((x, i) => h("div", { key: i, className: "login__feat" }, [
            h("div", { key: "i", className: "login__feat-icon" }, h(x.i, { size: 16 })),
            h("div", { key: "t", className: "login__feat-text" }, [
              h("strong", { key: 1 }, x.t),
              h("span", { key: 2 }, x.s),
            ]),
          ]))),
        ]),
        h("div", { key: "b", style: { fontSize: 11.5, color: "var(--text-tertiary)", display: "flex", gap: 16 } }, [
          h("span", { key: 1 }, "v1.2.4 · build 8a3f12c"),
          h("span", { key: 2 }, "© 2026 Audit boshqaruvi"),
        ]),
      ]),
      h("div", { key: "m", className: "login__main" }, [
        h("form", { key: "f", className: "login__form login__form--anim", onSubmit: e => { e.preventDefault(); onLogin && onLogin(); } }, [
          h("div", { key: "h", style: { textAlign: "left" } }, [
            h("h2", { key: 1, style: { fontSize: 24, marginBottom: 6 } }, "Tizimga kirish"),
            h("p", { key: 2, className: "text-sm text-muted" }, "Domen hisobi bilan kiring. Notanish urinishlar audit logga yoziladi."),
          ]),
          h("div", { key: "u", className: "field" }, [
            h("label", { key: 1, className: "field__label" }, "Login (domen hisobi)"),
            h("div", { key: 2, className: "input-group" }, [
              h(I.User, { className: "icon-l" }),
              h("input", { className: "input", placeholder: "username@gov.uz", defaultValue: "a.yoldoshev@gov.uz" }),
            ]),
          ]),
          h("div", { key: "p", className: "field" }, [
            h("div", { key: 1, style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
              h("label", { className: "field__label", key: "l" }, "Parol"),
              h("a", { key: "f", href: "#", style: { fontSize: 12, fontWeight: 600 } }, "Parolni unutdingizmi?"),
            ]),
            h("div", { key: 2, className: "input-group" }, [
              h(I.Lock, { className: "icon-l" }),
              h("input", { className: "input", type: showPass ? "text" : "password", defaultValue: "••••••••••••", style: { paddingRight: 36 } }),
              h("button", { key: "e", type: "button", className: "iconbtn", style: { position: "absolute", right: 2, top: 1, width: 32, height: 32 }, onClick: () => setShowPass(!showPass) },
                showPass ? h(I.EyeOff, { key: "i-eyeoff", size: 16 }) : h(I.Eye, { key: "i-eye", size: 16 })
              ),
            ]),
          ]),
          h("label", { key: "c", className: "field__label", style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 13 } }, [
            h("input", { type: "checkbox", className: "checkbox", defaultChecked: true }),
            h("span", { key: "x" }, "Bu qurilmani 8 soatga eslab qol"),
          ]),
          h("button", { key: "b", type: "submit", className: "btn btn--primary btn--lg", style: { width: "100%" } }, [
            h(I.LogIn, { key: "i-login", size: 16 }),
            h("span", { key: "t" }, "Kirish"),
          ]),
          h("div", { key: "or", style: { display: "flex", alignItems: "center", gap: 12, color: "var(--text-tertiary)", fontSize: 12 } }, [
            h("span", { key: 1, style: { flex: 1, height: 1, background: "var(--border-color)" } }),
            h("span", { key: 2 }, "yoki"),
            h("span", { key: 3, style: { flex: 1, height: 1, background: "var(--border-color)" } }),
          ]),
          h("button", { key: "ad", type: "button", className: "btn btn--secondary btn--lg", style: { width: "100%" } }, [
            h(I.Shield, { key: "i-shield", size: 16 }),
            h("span", { key: "t" }, "Domen sertifikati bilan kirish (AD)"),
          ]),
          h("div", { key: "n", style: { marginTop: 16, padding: 12, background: "var(--bg-surface-2)", border: "1px solid var(--border-color)", borderRadius: 8, fontSize: 12, color: "var(--text-tertiary)", display: "flex", gap: 10 } }, [
            h(I.ShieldAlert, { key: "i", size: 16, style: { color: "var(--brand)", flexShrink: 0, marginTop: 1 } }),
            h("span", { key: "t" }, "Demo rejim: o‘ng pastdagi Tweaks panelidan rolni almashtirib, xuddi shu interfeysni har xil foydalanuvchi nuqtai nazaridan ko‘rishingiz mumkin."),
          ]),
        ]),
      ]),
    ]);
  }
  window.LoginScreen = LoginScreen;

  // =========================================================================
  // DASHBOARD (department head view)
  // =========================================================================
  function DashboardScreen({ role, setRoute, openAudit, showAI, setCreateOpen }) {
    const myAudits = D.AUDITS.filter(a => a.status !== "approved" && a.status !== "cancelled");
    const totalFindings = D.AUDITS.reduce((s, a) => s + a.findings.critical + a.findings.high + a.findings.medium + a.findings.low, 0);
    const critical = D.AUDITS.reduce((s, a) => s + a.findings.critical, 0);
    const high = D.AUDITS.reduce((s, a) => s + a.findings.high, 0);
    const medium = D.AUDITS.reduce((s, a) => s + a.findings.medium, 0);
    const low = D.AUDITS.reduce((s, a) => s + a.findings.low, 0);

    const greeting = role === "departament" ? "Departament rahbari" : role === "bolim" ? "Bo‘lim boshlig‘i" : "Mutaxassis";
    const greetingTitle = role === "departament"
      ? "Yaxshi kun, Akmal."
      : role === "bolim"
      ? "Yaxshi kun, Dilshoda."
      : role === "bosh"
      ? "Yaxshi kun, Bobur."
      : role === "yetakchi"
      ? "Yaxshi kun, Sevara."
      : "Yaxshi kun, Madina.";

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        title: greetingTitle,
        sub: role === "departament"
          ? "Bugun 4 ta audit jarayonda, 12 ta kritik finding ko‘rib chiqishni kutmoqda."
          : role === "bolim"
          ? "Bo‘limingizda 4 ta audit faol, 1 ta loyiha tasdiqlashda."
          : "Sizga 7 ta vazifa biriktirilgan. 2 tasi muddati bilan yopiladi.",
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Boshqaruv paneli CSV ko'rinishida eksport qilindi", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Eksport")]),
          (role === "departament" || role === "bolim") ?
            h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => setCreateOpen && setCreateOpen(true) }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Yangi audit")])
            : null,
        ],
      }),

      (role === "departament" || role === "bolim") ? h(window.HeroBand, {
        key: "hero",
        score: Math.round(100 - critical * 1.5 - high * 0.4),
        metrics: [
          { label: "Faol audit", value: 4 },
          { label: "Critical", value: critical, tone: "danger" },
          { label: "Bartaraf", value: "68%", tone: "good" },
          { label: "O‘rtacha CVSS", value: "6.4" },
        ],
        gauge: 89, gaugeCap: "Vazifa bajarildi",
        caption: role === "departament"
          ? "Departament bo‘yicha umumiy holat barqaror. 4 ta audit faol, kritik findinglar nazoratda."
          : "Bo‘limingiz holati barqaror — review jarayoni jadval bo‘yicha ketmoqda.",
      }) : null,

      // --- Stats row ---
      h("div", { key: "s", className: "grid", style: { gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 } }, [
        h(Stat, { key: 1, icon: I.FolderKanban, label: "Faol auditlar",    value: 4,  meta: "23 yakunlangan",         delta: 12, spark: [2, 3, 3, 4, 4, 4] }),
        h(Stat, { key: 2, icon: I.AlertTriangle, label: "Critical findings", value: critical, meta: "Bu hafta + 5",  delta: 25, deltaNeg: true, spark: [3, 4, 6, 7, 9, critical] }),
        h(Stat, { key: 3, icon: I.CheckSquare, label: "Vazifalar bajarildi", value: "118/142", meta: "Muddatida 89%", delta: 4,  bar: 83 }),
        h(Stat, { key: 4, icon: I.Trophy,      label: "Komandaga KPI",       value: 1483, meta: "May oyi, 8 mutaxassis", delta: 18, spark: [820, 940, 1080, 1190, 1320, 1483] }),
      ]),

      // --- Body grid ---
      h("div", { key: "g", className: "grid", style: { gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 } }, [

        // LEFT COL: active audits + critical findings
        h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [

          h("div", { key: "act", className: "panel" }, [
            h("div", { key: "h", className: "panel__h" }, [
              h("div", { key: "t", className: "panel__t" }, [
                h(I.FolderKanban, { key: "i", size: 15 }),
                h("span", { key: "t" }, "Faol auditlar"),
              ]),
              h("div", { key: "a", style: { display: "flex", gap: 6 } }, [
                h(window.FilterButton, { key: 1, kind: "audits", size: "xs", align: "right" }),
                h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => setRoute("audits") }, [h("span", { key: "t" }, "Barchasini ko‘rish"), h(I.ChevronRight, { key: "i-chevronright", size: 12 })]),
              ]),
            ]),
            h("div", { key: "b", className: "panel__body panel__body--flush" }, [
              h("div", { className: "tbl-scroll" },
                h("table", { className: "tbl" }, [
                  h("thead", { key: "h" }, h("tr", null, [
                    h("th", { key: 1 }, "Audit"),
                    h("th", { key: 2 }, "Tashkilot"),
                    h("th", { key: 3 }, "Holat"),
                    h("th", { key: 4 }, "Guruh rahbari"),
                    h("th", { key: 5, style: { width: 140 } }, "Progres"),
                    h("th", { key: 6 }, "Findinglar"),
                  ])),
                  h("tbody", { key: "b" }, myAudits.slice(0, 5).map(a =>
                    h("tr", { key: a.id, onClick: () => openAudit(a.id) }, [
                      h("td", { key: 1 }, h("div", { className: "cell-title" }, [
                        h("span", { key: "i", className: "icon-box" }, h(I.ShieldCheck, { key: "i-shieldcheck", size: 14 })),
                        h("div", { key: "t" }, [
                          h("div", { key: "n" }, a.title),
                          h("div", { key: 1, className: "cell-sub font-mono" }, a.code + " · " + a.type),
                        ]),
                      ])),
                      h("td", { key: 2, style: { whiteSpace: "nowrap" } }, D.orgById(a.org).name),
                      h("td", { key: 3 }, statusTag(a.status)),
                      h("td", { key: 4 }, h(Avatar, { user: a.leader })),
                      h("td", { key: 5 }, [
                        h("div", { key: 1, className: "progress" + (a.progress > 90 ? " progress--success" : "") }, h("span", { style: { width: a.progress + "%" } })),
                        h("div", { key: 2, className: "cell-sub", style: { marginTop: 4 } }, a.progress + "% · " + a.tasks.done + "/" + a.tasks.total),
                      ]),
                      h("td", { key: 6 }, h("div", { style: { display: "flex", gap: 6 } }, [
                        a.findings.critical > 0 ? h("span", { key: 1, className: "sev sev--critical" }, a.findings.critical) : null,
                        a.findings.high > 0 ? h("span", { key: 2, className: "sev sev--high" }, a.findings.high) : null,
                        a.findings.medium > 0 ? h("span", { key: 3, className: "sev sev--medium" }, a.findings.medium) : null,
                      ])),
                    ])
                  )),
                ])
              ),
            ]),
          ]),

          // Critical findings panel
          h("div", { key: "cf", className: "panel" }, [
            h("div", { key: "h", className: "panel__h" }, [
              h("div", { key: "t", className: "panel__t" }, [
                h(I.AlertTriangle, { key: "i", size: 15, style: { color: "var(--status-danger-fg)" } }),
                h("span", { key: "t" }, "E’tibor talab qiluvchi findinglar"),
              ]),
              h("button", { key: "a", className: "btn btn--ghost btn--xs", onClick: () => setRoute("findings") }, [h("span", { key: "t" }, "Barchasi"), h(I.ChevronRight, { key: "i-chevronright", size: 12 })]),
            ]),
            h("div", { key: "b", className: "panel__body", style: { padding: 0 } },
              D.FINDINGS.filter(f => f.severity === "critical" || (f.severity === "high" && f.status === "review")).slice(0, 4).map((f, i) =>
                h("div", { key: f.id, style: { padding: "12px 16px", borderBottom: i < 3 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" } }, [
                  h(Sev, { key: 1, level: f.severity }),
                  h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                    h("div", { key: 1, style: { fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" } }, f.title),
                    h("div", { key: 2, className: "cell-sub", style: { display: "flex", gap: 8, marginTop: 2 } }, [
                      h("span", { key: 1, className: "font-mono" }, f.id),
                      h("span", { key: "d" }, "·"),
                      h("span", { key: 2 }, f.asset),
                      h("span", { key: "d2" }, "·"),
                      h("span", { key: 3 }, "CVSS " + f.cvss),
                    ]),
                  ]),
                  h(Avatar, { key: 3, user: f.reportedBy }),
                  statusTag(f.status === "approved" ? "approved" : f.status === "review" ? "review" : "in_progress"),
                  h("button", { key: 5, className: "btn btn--ghost btn--xs btn--icon", onClick: () => openFinding(f.id) }, h(I.ChevronRight, { key: "i-chevronright", size: 14 })),
                ])
              )
            ),
          ]),
        ]),

        // RIGHT COL: workflow + ai
        h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          h("div", { key: "sev", className: "panel" }, [
            h("div", { key: "h", className: "panel__h" }, [
              h("div", { key: "t", className: "panel__t" }, [h(I.PieChart, { key: "i", size: 15 }), h("span", { key: "t" }, "Xavf darajalari bo‘yicha")]),
              h("button", { key: "m", className: "iconbtn", onClick: () => window.showToast("Donut grafik ma'lumotlari yangilanmoqda...", "info") }, h(I.MoreHorizontal, { key: "i-morehorizontal", size: 16 })),
            ]),
            h("div", { key: "b", className: "panel__body", style: { display: "flex", alignItems: "center", gap: 20 } }, [
              h(Donut, { key: "d", items: [
                { value: critical, color: "#f87171" },
                { value: high,     color: "#fbbf24" },
                { value: medium,   color: "#38bdf8" },
                { value: low,      color: "#94a3b8" },
              ] }),
              h("div", { key: "l", style: { flex: 1, display: "flex", flexDirection: "column", gap: 8 } }, [
                ["Critical", critical, "#f87171"],
                ["High",     high,     "#fbbf24"],
                ["Medium",   medium,   "#38bdf8"],
                ["Low",      low,      "#94a3b8"],
              ].map(([l, v, c]) => h("div", { key: l, style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
                h("span", { key: 1, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 } }, [
                  h("span", { key: "d", style: { width: 10, height: 10, borderRadius: 3, background: c } }),
                  h("span", { key: "l" }, l),
                ]),
                h("span", { key: 2, className: "font-mono font-bold", style: { fontVariant: "tabular-nums" } }, v),
              ]))),
            ]),
          ]),

          showAI ? h("div", { key: "ai", className: "ai-card" }, h("div", { className: "ai-card__inner" }, [
            h("div", { key: "h", className: "ai-card__head" }, [
              h("div", { key: "i", className: "ai-card__icon" }, h(I.Sparkles, { key: "i-sparkles", size: 15 })),
              h("span", { key: "t", className: "ai-card__title" }, "Ollama AI tavsiyasi"),
              h("span", { key: "m", className: "tag tag--brand", style: { marginLeft: "auto" } }, "qwen2.5:14b"),
            ]),
            h("p", { key: "p", className: "ai-card__body" }, "Joriy haftada 5 ta yangi critical finding aniqlandi — 80% i bitta auditdan (AUD-2026-014). Bo‘lim boshlig‘iga ushbu audit bo‘yicha qo‘shimcha resurs ajratish va review jarayonini tezlashtirishni tavsiya etaman."),
            h("div", { key: "a", style: { display: "flex", gap: 8, marginTop: 12 } }, [
              h("button", { key: 1, className: "btn btn--primary btn--sm", onClick: () => setRoute("ai") }, [h(I.Sparkles, { key: "i", size: 14 }), h("span", { key: "t" }, "AI tahlilni ochish")]),
              h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: (e) => { e.target.closest('.ai-card').style.display = 'none'; window.showToast("AI tavsiya yashirildi", "info"); } }, "Yashirish"),
            ]),
          ])) : null,

          // KPI top-3
          h("div", { key: "kpi", className: "panel" }, [
            h("div", { key: "h", className: "panel__h" }, [
              h("div", { key: "t", className: "panel__t" }, [h(I.Trophy, { key: "i", size: 15 }), h("span", { key: "t" }, "Top mutaxassislar — KPI")]),
              h("button", { key: "a", className: "btn btn--ghost btn--xs", onClick: () => setRoute("kpi") }, [h("span", { key: "t" }, "Hammasi"), h(I.ChevronRight, { key: "i-chevronright", size: 12 })]),
            ]),
            h("div", { key: "b", className: "panel__body", style: { padding: 0 } }, [
              h(window.Podium, { key: "pod", users: D.KPI_USERS.slice(0, 3) }),
              h("div", { key: "rest", style: { borderTop: "1px solid var(--border-color)" } },
                D.KPI_USERS.slice(3, 5).map((k, idx) => {
                  const rank = idx + 4;
                  return h("div", { key: k.user, style: { padding: "10px 14px", borderBottom: idx < 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 12 } }, [
                    h("span", { key: 1, style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, width: 22, color: "var(--text-tertiary)" } }, "#" + rank),
                    h(Avatar, { key: 2, user: k.user }),
                    h("div", { key: 3, style: { flex: 1, minWidth: 0 } }, [
                      h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, D.userById(k.user).name),
                      h("div", { key: 2, className: "cell-sub" }, k.audits + " audit · " + k.findings + " finding"),
                    ]),
                    h(Sparkline, { key: 4, data: k.sparkline, w: 56, h: 22 }),
                    h("span", { key: 5, className: "font-bold tabular", style: { fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-primary)", minWidth: 36, textAlign: "right" } }, k.total),
                  ]);
                })
              ),
            ]),
          ]),
        ]),
      ]),
    ]);
  }
  window.DashboardScreen = DashboardScreen;

  // =========================================================================
  // AUDITS LIST
  // =========================================================================
  function AuditsListScreen({ role, openAudit, setRoute, setCreateOpen }) {
    const [filter, setFilter] = useState("all");
    const tabs = [
      { id: "all", label: "Hammasi", count: D.AUDITS.length },
      { id: "active", label: "Faol", count: D.AUDITS.filter(a => ["in_progress", "review", "returned", "planning"].includes(a.status)).length },
      { id: "review", label: "Tekshiruvda", count: D.AUDITS.filter(a => a.status === "review" || a.status === "returned").length },
      { id: "done", label: "Yakunlangan", count: D.AUDITS.filter(a => a.status === "approved" || a.status === "completed").length },
    ];
    let rows = D.AUDITS;
    if (filter === "active") rows = rows.filter(a => ["in_progress", "review", "returned", "planning"].includes(a.status));
    if (filter === "review") rows = rows.filter(a => ["review", "returned"].includes(a.status));
    if (filter === "done") rows = rows.filter(a => ["approved", "completed"].includes(a.status));

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Auditlar" }],
        title: "Auditlar",
        sub: D.AUDITS.length + " ta audit · " + D.AUDITS.filter(a => a.status === "in_progress").length + " jarayonda · " + D.AUDITS.filter(a => a.status === "review").length + " tekshiruvda",
        actions: [
          h("div", { key: 0, className: "input-group", style: { width: 280 } }, [
            h(I.Search, { className: "icon-l" }),
            h("input", { className: "input", placeholder: "Audit, tashkilot..." }),
          ]),
          h(window.FilterButton, { key: 1, kind: "audits" }),
          (role === "departament" || role === "bolim") ?
            h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => setCreateOpen(true) }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Yangi audit")])
            : null,
        ],
      }),
      h(Tabs, { key: "t", tabs, active: filter, onChange: setFilter }),
      h("div", { key: "g", className: "tbl-wrap" },
        h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
          h("thead", { key: "h" }, h("tr", null, [
            h("th", { key: 1 }, h("label", { className: "checkbox-row", style: { gap: 0 } }, h("input", { type: "checkbox", className: "checkbox" }))),
            h("th", { key: 2 }, h("span", { className: "col-sort" }, ["Audit", h(I.ChevronsUpDown, { size: 12, key: "c" })])),
            h("th", { key: 3 }, "Tashkilot"),
            h("th", { key: 4 }, "Turi"),
            h("th", { key: 5 }, "Holat"),
            h("th", { key: 6 }, "Guruh"),
            h("th", { key: 7 }, "Boshlangan / yakun"),
            h("th", { key: 8 }, "Progres"),
            h("th", { key: 9 }, "Findinglar"),
            h("th", { key: 10, className: "cell-actions" }, ""),
          ])),
          h("tbody", { key: "b" }, rows.map(a =>
            h("tr", { key: a.id, onClick: () => openAudit(a.id) }, [
              h("td", { key: 1 }, h("input", { type: "checkbox", className: "checkbox", onClick: e => e.stopPropagation() })),
              h("td", { key: 2 }, h("div", { className: "cell-title" }, [
                h("span", { key: "i", className: "icon-box" }, h(a.type.includes("Pentest") ? I.Bug : a.type.includes("Web") ? I.Globe : I.ShieldCheck, { size: 14 })),
                h("div", { key: "t" }, [
                  h("div", { key: "n" }, a.title),
                  h("div", { key: 2, className: "cell-sub font-mono" }, a.code),
                ]),
              ])),
              h("td", { key: 3 }, D.orgById(a.org).name),
              h("td", { key: 4 }, h("span", { className: "tag tag--outline" }, a.type)),
              h("td", { key: 5 }, statusTag(a.status)),
              h("td", { key: 6 }, h(AvatarStack, { users: a.members })),
              h("td", { key: 7, className: "tabular" }, h("div", { key: "n" }, [
                h("div", { key: 1, style: { fontSize: 12.5 } }, a.startDate),
                h("div", { key: 2, className: "cell-sub" }, "→ " + a.endDate),
              ])),
              h("td", { key: 8 }, [
                h("div", { key: 1, className: "progress" + (a.progress > 90 ? " progress--success" : ""), style: { width: 80 } }, h("span", { style: { width: a.progress + "%" } })),
                h("div", { key: 2, className: "cell-sub", style: { marginTop: 4 } }, a.progress + "%"),
              ]),
              h("td", { key: 9 }, h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, [
                a.findings.critical > 0 ? h("span", { key: 1, className: "sev sev--critical" }, a.findings.critical) : null,
                a.findings.high > 0 ? h("span", { key: 2, className: "sev sev--high" }, a.findings.high) : null,
                a.findings.medium > 0 ? h("span", { key: 3, className: "sev sev--medium" }, a.findings.medium) : null,
                a.findings.low > 0 ? h("span", { key: 4, className: "sev sev--low" }, a.findings.low) : null,
                (a.findings.critical + a.findings.high + a.findings.medium + a.findings.low) === 0 ? h("span", { key: "n", className: "cell-sub" }, "—") : null,
              ])),
              h("td", { key: 10, className: "cell-actions" }, h("button", { className: "btn btn--ghost btn--xs btn--icon", onClick: e => e.stopPropagation() }, h(I.MoreHorizontal, { key: "i-morehorizontal", size: 14 }))),
            ])
          )),
        ]))
      ),
    ]);
  }
  window.AuditsListScreen = AuditsListScreen;

  // =========================================================================
  // MY TASKS — Kanban + list
  // =========================================================================
  function MyTasksScreen({ role, setRoute, openTask, setCreateTaskOpen }) {
    const [view, setView] = useState("kanban");
    const tasks = D.TASKS; // all tasks for demo; filterable by assignee in real life
    const cols = [
      { key: "new",         title: "Yangi" },
      { key: "in_progress", title: "Jarayonda" },
      { key: "review",      title: "Tekshiruvda" },
      { key: "blocked",     title: "Blok" },
      { key: "done",        title: "Bajarilgan" },
    ];

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Mening vazifalarim" }],
        title: "Mening vazifalarim",
        sub: tasks.length + " ta vazifa · " + tasks.filter(t => t.status === "in_progress").length + " jarayonda · " + tasks.filter(t => t.priority === "Yuqori").length + " yuqori ustuvor",
        actions: [
          h("div", { key: "v", style: { display: "inline-flex", background: "var(--bg-surface-2)", border: "1px solid var(--border-color)", borderRadius: 6, padding: 3 } }, [
            ["kanban", "Kanban", I.Layers], ["table", "Jadval", I.LayoutDashboard],
          ].map(([k, l, ic]) => h("button", {
            key: k, className: "btn btn--ghost btn--xs", onClick: () => setView(k),
            style: view === k ? { background: "var(--bg-surface)", color: "var(--brand)", boxShadow: "var(--shadow-xs)" } : {},
          }, [h(ic, { size: 13 }), h("span", { key: "t" }, l)]))),
          h(window.FilterButton, { key: 2, kind: "tasks" }),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => setCreateTaskOpen && setCreateTaskOpen(true) }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Vazifa")]),
        ],
      }),

      // Quick filter row
      h("div", { key: "qf", style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" } }, [
        h("span", { key: 0, className: "tag tag--brand" }, "Audit: AUD-2026-014"),
        h("span", { key: 1, className: "tag tag--outline" }, "Men uchun (8)"),
        h("span", { key: 2, className: "tag tag--outline" }, "Tugaydigan: 3 kun"),
        h("span", { key: 3, className: "tag tag--outline" }, "Yuqori ustuvor"),
      ]),

      view === "kanban" ? h(Kanban, { key: "k", cols, tasks, openTask }) : h(TaskTable, { key: "t", tasks, openTask }),
    ]);
  }
  window.MyTasksScreen = MyTasksScreen;

  function Kanban({ cols, tasks, openTask }) {
    return h("div", { className: "kanban" }, cols.map(col => {
      const colTasks = tasks.filter(t => t.status === col.key);
      const colColor = D.TASK_STATUS[col.key].color;
      return h("div", { key: col.key, className: "kanban__col" }, [
        h("div", { key: "h", className: "kanban__head" }, [
          h("span", { className: "kanban__title", key: "t" }, [
            h("span", { key: "d", className: "dot-status", style: { background: colColor } }),
            h("span", { key: "n" }, col.title),
          ]),
          h("span", { key: "c", className: "kanban__count" }, colTasks.length),
        ]),
        h("div", { key: "l", className: "kanban__list" }, colTasks.map(t =>
          h("div", { key: t.id, className: "k-card", onClick: () => openTask && openTask(t.id) }, [
            h("div", { key: "tp", className: "k-card__top" }, [
              h("span", { key: "i", className: "k-card__id" }, t.id),
              h("span", { key: "p", className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost") }, t.priority),
            ]),
            h("div", { key: "t", className: "k-card__title" }, t.title),
            h("div", { key: "tag", style: { display: "flex", gap: 6, flexWrap: "wrap" } }, [
              h("span", { key: 1, className: "tag tag--outline" }, t.type),
              t.findings ? h("span", { key: 2, className: "tag tag--danger" }, [h(I.AlertTriangle, { size: 10, style: { marginRight: 2 } }), t.findings + " finding"]) : null,
            ]),
            h("div", { key: "m", className: "k-card__meta" }, [
              h("span", { key: 1, className: "pill" }, [h(I.Calendar, { key: "i-calendar", size: 12 }), t.due]),
              h(Avatar, { key: 2, user: t.assignee }),
            ]),
          ])
        )),
        h("button", { key: "add", className: "btn btn--ghost btn--sm", style: { margin: "0 10px 10px", justifyContent: "center" }, onClick: () => window.__openCreateTask && window.__openCreateTask() }, [h(I.Plus, { key: "i", size: 13 }), "Vazifa qo‘shish"]),
      ]);
    }));
  }

  function TaskTable({ tasks, openTask }) {
    return h("div", { className: "tbl-wrap" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
      h("thead", { key: "h" }, h("tr", null, [
        h("th", { key: 1 }, "ID"),
        h("th", { key: 2 }, "Vazifa"),
        h("th", { key: 3 }, "Turi"),
        h("th", { key: 4 }, "Ustuvorlik"),
        h("th", { key: 5 }, "Holat"),
        h("th", { key: 6 }, "Mas’ul"),
        h("th", { key: 7 }, "Muddat"),
        h("th", { key: 8 }, "Findinglar"),
        h("th", { key: 9 }, "KPI"),
      ])),
      h("tbody", { key: "b" }, tasks.map(t =>
        h("tr", { key: t.id, onClick: () => openTask && openTask(t.id) }, [
          h("td", { key: 1, className: "cell-mono" }, t.id),
          h("td", { key: 2, className: "text-primary font-semi" }, t.title),
          h("td", { key: 3 }, h("span", { className: "tag tag--outline" }, t.type)),
          h("td", { key: 4 }, h("span", { className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost") }, t.priority)),
          h("td", { key: 5 }, h("span", { className: "tag tag--info" }, D.TASK_STATUS[t.status].label)),
          h("td", { key: 6 }, h(Avatar, { user: t.assignee })),
          h("td", { key: 7, className: "tabular" }, t.due),
          h("td", { key: 8, className: "tabular text-primary font-semi" }, t.findings || "—"),
          h("td", { key: 9, className: "tabular text-brand font-semi" }, t.kpi ? "+" + t.kpi : "—"),
        ])
      )),
    ])));
  }
})();
