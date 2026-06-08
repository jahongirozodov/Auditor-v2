/* Audit card detail (multi-tab) + Findings list + Findings drawer. */
(function () {
  const { useState, useMemo, useEffect, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // AUDIT DETAIL
  // =========================================================================
  function AuditDetailScreen({ auditId, role, setRoute, openFinding, openTask, showAI }) {
    const a = D.auditById(auditId) || D.AUDITS[0];
    const [tab, setTab] = useState("overview");
    const tabs = [
      { id: "overview",   label: "Umumiy",            icon: I.LayoutDashboard },
      { id: "group",      label: "Audit guruhi",      icon: I.Users },
      { id: "project",    label: "Audit loyihasi",    icon: I.Map },
      { id: "tasks",      label: "Vazifalar",         icon: I.CheckSquare, count: a.tasks.total },
      { id: "findings",   label: "Findinglar",        icon: I.AlertTriangle, count: a.findings.critical + a.findings.high + a.findings.medium + a.findings.low },
      { id: "files",      label: "Fayllar & dalillar", icon: I.Folder },
      { id: "tokens",     label: "Tokenlar",          icon: I.KeyRound },
      { id: "ai",         label: "AI tahlil",         icon: I.Sparkles },
      { id: "kpi",        label: "KPI",               icon: I.Trophy },
      { id: "reports",    label: "Hisobotlar",        icon: I.FileText },
      { id: "log",        label: "Audit log",         icon: I.History },
    ];

    return h("div", null, [
      // Page header
      h(PageHeader, {
        key: "h",
        crumbs: [
          { label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") },
          { label: "Auditlar", onClick: () => setRoute("audits") },
          { label: a.code },
        ],
        title: a.title,
        sub: h("span", { style: { display: "inline-flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, [
          h("span", { key: "c", className: "font-mono", style: { color: "var(--text-tertiary)" } }, a.code),
          h("span", { key: "s1" }, "·"),
          statusTag(a.status),
          h("span", { key: "s2" }, "·"),
          h("span", { key: "o" }, D.orgById(a.org).name),
          h("span", { key: "s3" }, "·"),
          h("span", { key: "d" }, a.startDate + " → " + a.endDate),
        ]),
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast(a.code + " PDF + DOCX formatlarda yuklab olindi", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Eksport")]),
          h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => { setRoute && setRoute("ai"); } }, [h(I.Sparkles, { key: "i", size: 14 }), h("span", { key: "t" }, "AI hisobot")]),
          (role === "departament" || role === "bolim") && a.status === "review"
            ? h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: async () => {
              const ok = await window.confirmAction({
                title: "Auditni tasdiqlash",
                body: a.code + " auditini yakuniy tasdiqlamoqchimisiz? Tasdiqlangach hisobot tashkilotga yuboriladi.",
                confirmLabel: "Tasdiqlash",
              });
              if (ok) window.showToast(a.code + " tasdiqlandi va tashkilotga yuborildi", "success");
            } }, [h(I.Check, { key: "i", size: 14 }), h("span", { key: "t" }, "Tasdiqlash")])
            : h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Audit tekshiruvga yuborildi — bo'lim boshlig'i e'tibor beradi", "info") }, [h(I.Send, { key: "i", size: 14 }), h("span", { key: "t" }, "Tekshiruvga")]),
        ],
      }),

      // Workflow stepper
      h("div", { key: "step", className: "card card__pad-sm", style: { marginBottom: 16 } },
        h("div", { className: "stepper" },
          D.WORKFLOW.flatMap((s, i) => [
            i > 0 ? h("span", { key: "sep" + i, className: "stepper__sep" }) : null,
            h("div", {
              key: s.key,
              className: "stepper__node " + (s.n < a.stage ? "stepper__node--done" : s.n === a.stage ? "stepper__node--current" : ""),
              title: s.title,
            }, [
              h("span", { key: 1, className: "stepper__num" }, s.n),
              h("span", { key: 2 }, s.title),
            ]),
          ])
        )
      ),

      // Tabs
      h(Tabs, { key: "t", tabs, active: tab, onChange: setTab }),

      // Tab body
      tab === "overview" ? h(AuditOverview, { a, openFinding, openTask, setRoute, setTab, showAI }) :
      tab === "group"    ? h(AuditGroup,    { a, role }) :
      tab === "project"  ? h(AuditProject,  { a, role }) :
      tab === "tasks"    ? h(AuditTasks,    { a, openTask }) :
      tab === "findings" ? h(AuditFindings, { a, openFinding }) :
      tab === "files"    ? h(AuditFiles,    { a }) :
      tab === "tokens"   ? h(AuditTokens,   { a }) :
      tab === "ai"       ? h(AuditAI,       { a }) :
      tab === "kpi"      ? h(AuditKPI,      { a }) :
      tab === "reports"  ? h(AuditReports,  { a }) :
      h(AuditLog, { a }),
    ]);
  }
  window.AuditDetailScreen = AuditDetailScreen;

  // ------ Audit group tab (a'zolar + duty boshqaruvi) ------
  function AuditGroup({ a, role }) {
    const [members, setMembers] = useState(a.members);
    const [leader, setLeader] = useState(a.leader);
    const canManage = role === "departament" || role === "bolim" || role === "bosh";
    const eligible = D.USERS.filter(u => !members.includes(u.id) && ["bosh", "yetakchi", "toifa1"].includes(u.role));

    const taskCount = uid => D.TASKS.filter(t => t.auditId === a.id && t.assignee === uid).length;
    const findCount = uid => D.FINDINGS.filter(f => f.auditId === a.id && f.reportedBy === uid).length;

    function makeLead(uid) {
      if (!canManage) return window.showToast("Bu amal uchun ruxsat yo‘q", "warning");
      setLeader(uid);
      window.showToast(D.userById(uid).name + " — audit guruhi rahbari etib tayinlandi", "success");
    }
    async function remove(uid) {
      if (!canManage) return window.showToast("Bu amal uchun ruxsat yo‘q", "warning");
      if (uid === leader) return window.showToast("Avval boshqa guruh rahbarini tayinlang", "warning");
      const ok = await window.confirmAction({ title: "A’zoni chiqarish", body: D.userById(uid).name + " audit guruhidan chiqariladimi? Unga biriktirilgan vazifalar qayta taqsimlanishi kerak.", confirmLabel: "Chiqarish", danger: true });
      if (ok) { setMembers(m => m.filter(x => x !== uid)); window.showToast("A’zo guruhdan chiqarildi", "warning"); }
    }
    function add(uid) {
      setMembers(m => [...m, uid]);
      window.showToast(D.userById(uid).name + " auditor sifatida guruhga qo‘shildi", "success");
    }

    function dutyBadge(uid) {
      return uid === leader
        ? h("span", { className: "tag tag--brand" }, [h(I.Star, { size: 11, key: "i" }), "Guruh rahbari"])
        : h("span", { className: "tag tag--ghost" }, "Auditor");
    }

    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: 16 } }, [
      // LEFT — members
      h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h("div", { key: "stats", className: "grid", style: { gridTemplateColumns: "repeat(3,1fr)", gap: 12 } }, [
          [I.Users, "Guruh a’zolari", members.length], [I.Star, "Guruh rahbari", 1], [I.UserCheck, "Auditorlar", members.length - 1],
        ].map(([Ic, l, v], i) => h(window.Stat, { key: i, icon: Ic, label: l, value: v }))),

        h("div", { key: "m", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.Users, { size: 15, key: "i" }), h("span", { key: "t" }, "Guruh a’zolari")]),
            h("span", { key: 2, className: "tag tag--ghost tabular" }, members.length),
          ]),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            members.map((uid, i) => {
              const u = D.userById(uid);
              return h("div", { key: uid, className: "lrow", style: { border: "none", borderBottom: i < members.length - 1 ? "1px solid var(--border-color)" : "none", borderRadius: 0, alignItems: "center" } }, [
                h(window.Avatar, { key: 1, user: uid }),
                h("div", { key: 2, className: "lrow__body" }, [
                  h("div", { key: 1, className: "lrow__title", style: { display: "flex", alignItems: "center", gap: 8 } }, [u.name, dutyBadge(uid)]),
                  h("div", { key: 2, className: "lrow__sub" }, u.title + " · " + u.dept),
                ]),
                h("div", { key: 3, style: { display: "flex", alignItems: "center", gap: 18, marginRight: 6 } }, [
                  h("div", { key: 1, style: { textAlign: "center" } }, [h("div", { key: 1, className: "tabular font-semi", style: { color: "var(--text-primary)" } }, taskCount(uid)), h("div", { key: 2, className: "cell-sub" }, "vazifa")]),
                  h("div", { key: 2, style: { textAlign: "center" } }, [h("div", { key: 1, className: "tabular font-semi", style: { color: "var(--text-primary)" } }, findCount(uid)), h("div", { key: 2, className: "cell-sub" }, "finding")]),
                ]),
                canManage ? h("div", { key: 4, style: { display: "flex", gap: 4 } }, [
                  uid !== leader ? h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => makeLead(uid), title: "Guruh rahbari etish" }, [h(I.Star, { size: 13, key: "i" })]) : null,
                  h("button", { key: 2, className: "iconbtn", onClick: () => remove(uid), title: "Chiqarish" }, h(I.Trash2, { size: 15 })),
                ]) : null,
              ]);
            })
          ),
        ]),
      ]),

      // RIGHT — add + duty note
      h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h("div", { key: "add", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.UserCheck, { size: 15, key: "i" }), h("span", { key: "t" }, "A’zo qo‘shish (eligible)")])),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            eligible.length ? eligible.map((u, i) => h("div", { key: u.id, className: "lrow", style: { border: "none", borderBottom: i < eligible.length - 1 ? "1px solid var(--border-color)" : "none", borderRadius: 0, alignItems: "center" } }, [
              h(window.Avatar, { key: 1, user: u.id }),
              h("div", { key: 2, className: "lrow__body" }, [h("div", { key: 1, className: "lrow__title" }, u.name), h("div", { key: 2, className: "lrow__sub" }, u.title)]),
              canManage ? h("button", { key: 3, className: "btn btn--soft btn--sm", onClick: () => add(u.id) }, [h(I.Plus, { size: 13, key: "i" }), h("span", { key: "t" }, "Qo‘shish")]) : null,
            ])) : h("div", { style: { padding: 16, color: "var(--text-tertiary)", fontSize: 13 } }, "Barcha mos mutaxassislar guruhda.")
          ),
        ]),

        h("div", { key: "note", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Info, { size: 15, key: "i" }), h("span", { key: "t" }, "Duty — guruh ichidagi rol")])),
          h("div", { className: "panel__body", key: 2, style: { display: "flex", flexDirection: "column", gap: 12 } }, [
            h("div", { key: 1, style: { display: "flex", gap: 10 } }, [
              h("span", { key: 1, className: "tag tag--brand", style: { flexShrink: 0, height: "fit-content" } }, [h(I.Star, { size: 11, key: "i" }), "Guruh rahbari"]),
              h("span", { key: 2, style: { fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 } }, "Bir auditda yagona. Loyihani yuboradi, vazifalarni taqsimlaydi, topilmalarni 1-bosqich tasdiqlaydi."),
            ]),
            h("div", { key: 2, style: { display: "flex", gap: 10 } }, [
              h("span", { key: 1, className: "tag tag--ghost", style: { flexShrink: 0, height: "fit-content" } }, "Auditor"),
              h("span", { key: 2, style: { fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 } }, "Guruhning oddiy a’zosi. Vazifalarni bajaradi va topilma kiritadi."),
            ]),
          ]),
        ]),
      ]),
    ]);
  }


  // ------ Overview tab ------
  function AuditOverview({ a, openFinding, openTask, setRoute, setTab, showAI }) {
    const totFindings = a.findings.critical + a.findings.high + a.findings.medium + a.findings.low;
    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 } }, [
      // LEFT
      h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [

        // Stats
        h("div", { key: "s", className: "grid", style: { gridTemplateColumns: "repeat(4, 1fr)", gap: 12 } }, [
          h(Stat, { key: 1, icon: I.CheckSquare, label: "Vazifalar", value: a.tasks.done + "/" + a.tasks.total, meta: a.tasks.in_progress + " jarayonda · " + a.tasks.blocked + " blok", bar: Math.round((a.tasks.done / a.tasks.total) * 100) }),
          h(Stat, { key: 2, icon: I.AlertTriangle, label: "Findinglar", value: totFindings, meta: a.findings.critical + " critical · " + a.findings.high + " high" }),
          h(Stat, { key: 3, icon: I.Users, label: "Guruh", value: a.members.length, meta: "Rahbar: " + D.userById(a.leader).name }),
          h(Stat, { key: 4, icon: I.Activity, label: "Oxirgi sync", value: a.lastSync.split(" ")[0], meta: a.lastSync.split(" ").slice(1).join(" ") || "—" }),
        ]),

        // Workflow timeline (full)
        h("div", { key: "tl", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t", key: "t" }, [h(I.GitBranch, { key: "i", size: 15 }), h("span", { key: "s" }, "Audit jarayoni — 10 bosqich")]),
            h("span", { key: "s", className: "tag tag--info" }, "Bosqich " + a.stage + "/10"),
          ]),
          h("div", { className: "panel__body", key: 2 },
            h("div", { className: "timeline" },
              D.WORKFLOW.map(s =>
                h("div", {
                  key: s.key,
                  className: "timeline__item " + (s.n < a.stage ? "timeline__item--done" : s.n === a.stage ? "timeline__item--current" : ""),
                }, [
                  h("div", { key: "d", className: "timeline__dot" }, s.n < a.stage ? h(I.Check, { key: "i-check", size: 14 }) : s.n),
                  h("div", { key: "b", className: "timeline__body" }, [
                    h("div", { key: 1, className: "timeline__title" }, [
                      h("span", { key: 1 }, s.title),
                      s.n === a.stage ? h("span", { key: 2, className: "tag tag--info" }, "Joriy bosqich") : null,
                    ]),
                    h("div", { key: 2, className: "timeline__meta" }, s.who),
                    h("div", { key: 3, className: "timeline__desc" }, s.short),
                  ]),
                ])
              )
            )
          ),
        ]),

        // Critical findings preview
        h("div", { key: "cf", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t", key: "t" }, [h(I.AlertTriangle, { key: "i", size: 15, style: { color: "var(--status-danger-fg)" } }), h("span", { key: "s" }, "Yuqori xavfli findinglar")]),
            h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => setTab("findings") }, [h("span", { key: "t" }, "Hammasi"), h(I.ChevronRight, { key: "i-chevronright", size: 12 })]),
          ]),
          h("div", { className: "panel__body panel__body--flush", key: 2 },
            h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
              h("thead", { key: "h" }, h("tr", null, [
                h("th", { key: 1 }, "Severity"),
                h("th", { key: 2 }, "Finding"),
                h("th", { key: 3 }, "Asset"),
                h("th", { key: 4 }, "CVSS"),
                h("th", { key: 5 }, "Status"),
              ])),
              h("tbody", { key: "b" }, D.FINDINGS.filter(f => f.auditId === a.id).filter(f => f.severity === "critical" || f.severity === "high").slice(0, 5).map(f =>
                h("tr", { key: f.id, onClick: () => openFinding(f.id) }, [
                  h("td", { key: 1 }, h(Sev, { level: f.severity })),
                  h("td", { key: 2 }, h("div", null, [
                    h("div", { key: 1, className: "text-primary font-semi" }, f.title),
                    h("div", { key: 2, className: "cell-sub font-mono" }, f.id),
                  ])),
                  h("td", { key: 3, className: "font-mono", style: { fontSize: 12 } }, f.asset),
                  h("td", { key: 4, className: "tabular font-bold text-primary" }, f.cvss),
                  h("td", { key: 5 }, statusTag(f.status === "approved" ? "approved" : "review")),
                ])
              )),
            ]))
          ),
        ]),
      ]),

      // RIGHT
      h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [

        // Severity donut
        h("div", { key: "sev", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t", key: "t" }, [h(I.PieChart, { key: "i", size: 15 }), h("span", { key: "s" }, "Findinglar — xavf darajalari")]),
          ]),
          h("div", { className: "panel__body", key: 2, style: { display: "flex", alignItems: "center", gap: 20 } }, [
            h(Donut, { key: "d", items: [
              { value: a.findings.critical, color: "#f87171" },
              { value: a.findings.high,     color: "#fbbf24" },
              { value: a.findings.medium,   color: "#38bdf8" },
              { value: a.findings.low,      color: "#94a3b8" },
            ] }),
            h("div", { key: "l", style: { flex: 1, display: "flex", flexDirection: "column", gap: 8 } }, [
              ["Critical", a.findings.critical, "#f87171"],
              ["High",     a.findings.high,     "#fbbf24"],
              ["Medium",   a.findings.medium,   "#38bdf8"],
              ["Low",      a.findings.low,      "#94a3b8"],
            ].map(([l, v, c]) => h("div", { key: l, style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
              h("span", { key: 1, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 } }, [
                h("span", { key: "d", style: { width: 10, height: 10, borderRadius: 3, background: c } }),
                h("span", { key: "l" }, l),
              ]),
              h("span", { key: 2, className: "font-mono font-bold tabular" }, v),
            ]))),
          ]),
        ]),

        // Group
        h("div", { key: "g", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t", key: "t" }, [h(I.Users, { key: "i", size: 15 }), h("span", { key: "s" }, "Audit guruhi")]),
            h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("Foydalanuvchi tanlash oynasi ochilmoqda...", "info") }, [h(I.Plus, { key: "i", size: 12 }), h("span", { key: "t" }, "A‘zo qo‘shish")]),
          ]),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            a.members.map((uid, i) => {
              const u = D.userById(uid);
              const duty = i === 0 ? "Guruh rahbari" : i === 1 ? "Auditor · Konfiguratsiya" : i === 2 ? "Auditor · Skaner" : "Auditor · Trafik";
              return h("div", { key: uid, style: { padding: "10px 14px", borderBottom: i < a.members.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 12 } }, [
                h(Avatar, { key: 1, user: u, size: "lg" }),
                h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                  h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, u.name),
                  h("div", { key: 2, className: "cell-sub" }, u.title),
                ]),
                h("div", { key: 3, style: { textAlign: "right" } }, [
                  i === 0 ? h("span", { className: "tag tag--brand" }, "Rahbar") : h("span", { className: "tag tag--outline" }, "Auditor"),
                  h("div", { key: 2, className: "cell-sub", style: { marginTop: 4 } }, duty),
                ]),
              ]);
            })
          ),
        ]),

        showAI ? h("div", { key: "ai", className: "ai-card" }, h("div", { className: "ai-card__inner" }, [
          h("div", { className: "ai-card__head", key: 1 }, [
            h("div", { className: "ai-card__icon", key: "i" }, h(I.Sparkles, { key: "i-sparkles", size: 15 })),
            h("span", { className: "ai-card__title", key: "t" }, "AI xulosa (executive)"),
          ]),
          h("p", { className: "ai-card__body", key: 2 }, "Audit obyekti perimetri va ichki segmentatsiyada bir nechta jiddiy kamchilik aniqlandi. Eng asosiy xavf — flat tarmoq strukturasi va SQL injection imkoniyati. Ushbu ikkita findingni birinchi navbatda yopib, qolganlarini rejali ravishda yopish tavsiya etiladi."),
          h("div", { key: 3, style: { display: "flex", gap: 8, marginTop: 12 } }, [
            h("button", { key: 1, className: "btn btn--soft btn--sm", onClick: () => setTab("ai") }, [h(I.Sparkles, { key: "i", size: 14 }), h("span", { key: "t" }, "To‘liq tahlil")]),
            h("button", { key: 2, className: "btn btn--ghost btn--sm", onClick: () => { try { navigator.clipboard && navigator.clipboard.writeText("Audit obyekti perimetri va ichki segmentatsiyada bir nechta jiddiy kamchilik aniqlandi..."); } catch(e){} window.showToast("AI matni buferga ko'chirildi", "success"); } }, [h(I.Copy, { key: "i", size: 14 }), h("span", { key: "t" }, "Nusxa olish")]),
          ]),
        ])) : null,
      ]),
    ]);
  }

  // ------ Project tab ------
  function AuditProject({ a, role }) {
    const stages = [
      { n: 1, title: "Tayyorgarlik va doirani aniqlash", desc: "Tashkilot bilan kirish suhbati, qamrov hujjati, NDA va kirish ruxsatlari.", status: "done" },
      { n: 2, title: "Tarmoq va perimetr inventarizatsiyasi", desc: "Aktivlar ro‘yxati, tashqi va ichki diapazonlar, kritik tizimlar xaritasi.", status: "done" },
      { n: 3, title: "Konfiguratsiya tahlili", desc: "Firewall, switch, router, VPN gateway konfiguratsiya fayllarini tekshirish.", status: "in_progress" },
      { n: 4, title: "Skaner: avtomatlashtirilgan zaiflik aniqlash", desc: "Nessus / OpenVAS / OWASP ZAP yordamida ichki va tashqi skanerlash.", status: "in_progress" },
      { n: 5, title: "Trafik va log tahlili", desc: "PCAP / NetFlow va IDS/IPS loglar bo‘yicha shubhali harakatlar tahlili.", status: "new" },
      { n: 6, title: "Hisobot va remediation plan", desc: "Yakuniy hisobot, executive summary va texnik remediation tavsiyalari.", status: "new" },
    ];

    return h("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
      h(window.ApprovalFlow, { key: "apf", stages: D.PROJECT_APPROVAL.stages, timeline: D.PROJECT_APPROVAL.timeline, current: D.PROJECT_APPROVAL.current, role, kind: "project" }),
      h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 } }, [
      h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h("div", { key: "i", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.Map, { key: "i", size: 15 }), h("span", { key: "t" }, "Audit loyihasi")]),
            h("span", { className: "tag tag--warning", key: 2 }, [h(I.Clock, { key: "i", size: 11 }), "Tasdiqlash jarayonida"]),
          ]),
          h("div", { className: "panel__body", key: 2 }, [
            h("div", { className: "form-grid", key: "f" }, [
              h("div", { key: 1, className: "field span-2" }, [
                h("span", { className: "field__label" }, "Audit maqsadi"),
                h("p", { style: { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 } },
                  "Aloqa va kommunikatsiya vazirligi axborot tizimlarining xavfsizligi holatini baholash, ichki/tashqi perimetr, server infratuzilmasi, tarmoq qurilmalari va public web ilovalarda mavjud zaifliklarni aniqlash hamda bartaraf etish bo‘yicha tavsiyalarni shakllantirish."),
              ]),
              h("div", { key: 2, className: "field" }, [h("span", { className: "field__label" }, "Audit turi"), h("span", { className: "tag tag--brand" }, "Kompleks audit")]),
              h("div", { key: 3, className: "field" }, [h("span", { className: "field__label" }, "Metodologiya"), h("span", { style: { fontSize: 13 } }, "OWASP ASVS · NIST 800-53 · ISO 27001")]),
              h("div", { key: 4, className: "field" }, [h("span", { className: "field__label" }, "Boshlanishi"), h("span", { className: "tabular", style: { fontSize: 13 } }, "12.04.2026")]),
              h("div", { key: 5, className: "field" }, [h("span", { className: "field__label" }, "Tugashi"), h("span", { className: "tabular", style: { fontSize: 13 } }, "31.05.2026")]),
              h("div", { key: 6, className: "field span-2" }, [
                h("span", { className: "field__label" }, "Audit doirasi"),
                h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, [
                  "Tashqi perimetr", "Ichki tarmoq (10.0.0.0/8)", "Web ilovalar (portal.gov.uz)", "Server infratuzilmasi", "Active Directory domeni", "VPN gateway", "Wi-Fi corporate"
                ].map(t => h("span", { key: t, className: "tag tag--outline" }, t))),
              ]),
            ]),
          ]),
        ]),

        h("div", { key: "st", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Layers, { key: "i", size: 15 }), h("span", { key: "t" }, "Bosqichlar")])),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            stages.map((s, i) =>
              h("div", { key: s.n, style: { display: "flex", gap: 14, padding: 16, borderBottom: i < stages.length - 1 ? "1px solid var(--border-color)" : "none", alignItems: "flex-start" } }, [
                h("div", { key: 1, style: {
                  width: 36, height: 36, borderRadius: 8,
                  background: s.status === "done" ? "var(--brand-soft)" : s.status === "in_progress" ? "var(--status-warning-bg)" : "var(--bg-surface-2)",
                  color: s.status === "done" ? "var(--brand)" : s.status === "in_progress" ? "var(--status-warning-fg)" : "var(--text-tertiary)",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
                  flexShrink: 0,
                } }, s.status === "done" ? h(I.Check, { key: "i-check", size: 16 }) : s.n),
                h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                  h("div", { key: 1, style: { display: "flex", justifyContent: "space-between", gap: 10 } }, [
                    h("div", { key: 1, style: { fontSize: 14, fontWeight: 700, color: "var(--text-primary)" } }, s.title),
                    h("span", { key: 2, className: "tag " + (s.status === "done" ? "tag--success" : s.status === "in_progress" ? "tag--info" : "tag--ghost") },
                      s.status === "done" ? "Bajarilgan" : s.status === "in_progress" ? "Jarayonda" : "Yangi"),
                  ]),
                  h("p", { key: 2, style: { fontSize: 13, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.55 } }, s.desc),
                ]),
              ])
            )
          ),
        ]),
      ]),

      h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h("div", { key: "tools", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Boxes, { key: "i", size: 15 }), h("span", { key: "t" }, "Foydalaniladigan vositalar")])),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            ["Nessus 10.5",  "OpenVAS / GVM", "OWASP ZAP", "Burp Suite Pro", "Wireshark", "Nmap 7.94", "Suricata", "Hydra", "John the Ripper"]
              .map((t, i, arr) => h("div", { key: t, className: "lrow", style: { border: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", borderRadius: 0 } }, [
                h("div", { key: 1, className: "icon-box" + " " + "stat__icon" }, h(I.Code, { key: "i-code", size: 14 })),
                h("div", { key: 2, className: "lrow__body" }, [
                  h("div", { key: 1, className: "lrow__title" }, t),
                  h("div", { key: 2, className: "lrow__sub" }, "Open-source · Lokal ishga tushiriladi"),
                ]),
              ]))
          ),
        ]),
      ]),
      ]),
    ]);
  }

  // ------ Tasks tab ------
  function AuditTasks({ a, openTask }) {
    return h("div", null, [
      h("div", { style: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }, key: "f" }, [
        h("span", { key: 0, className: "tag tag--brand" }, "Hammasi (" + a.tasks.total + ")"),
        h("span", { key: 1, className: "tag tag--outline" }, "Jarayonda (" + a.tasks.in_progress + ")"),
        h("span", { key: 2, className: "tag tag--outline" }, "Bajarilgan (" + a.tasks.done + ")"),
        h("span", { key: 3, className: "tag tag--outline" }, "Blok (" + a.tasks.blocked + ")"),
        h("div", { key: "s", style: { marginLeft: "auto", display: "flex", gap: 8 } }, [
          h(window.FilterButton, { key: 1, kind: "tasks" }),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.__openCreateTask && window.__openCreateTask() }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Vazifa qo‘shish")]),
        ]),
      ]),
      h("div", { className: "tbl-wrap", key: "t" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
        h("thead", { key: "h" }, h("tr", null, [
          h("th", { key: 1, style: { width: 36 } }, h("input", { className: "checkbox", type: "checkbox" })),
          h("th", { key: 2 }, "ID"),
          h("th", { key: 3 }, "Vazifa"),
          h("th", { key: 4 }, "Turi"),
          h("th", { key: 5 }, "Ustuvorlik"),
          h("th", { key: 6 }, "Holat"),
          h("th", { key: 7 }, "Mas’ul"),
          h("th", { key: 8 }, "Muddat"),
          h("th", { key: 9 }, "Findinglar"),
          h("th", { key: 10 }, "Fayllar"),
          h("th", { key: 11 }, "KPI"),
        ])),
        h("tbody", { key: "b" }, D.TASKS.map(t =>
          h("tr", { key: t.id, onClick: () => openTask(t.id) }, [
            h("td", { key: 0 }, h("input", { className: "checkbox", type: "checkbox", onClick: e => e.stopPropagation() })),
            h("td", { key: 1, className: "cell-mono" }, t.id),
            h("td", { key: 2 }, h("div", { className: "text-primary font-semi" }, t.title)),
            h("td", { key: 3 }, h("span", { className: "tag tag--outline" }, t.type)),
            h("td", { key: 4 }, h("span", { className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost") }, t.priority)),
            h("td", { key: 5 }, h("span", { className: "tag tag--info" }, D.TASK_STATUS[t.status].label)),
            h("td", { key: 6 }, h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, [
              h(Avatar, { key: 1, user: t.assignee }),
              h("span", { key: 2, className: "text-sm" }, D.userById(t.assignee).name),
            ])),
            h("td", { key: 7, className: "tabular" }, t.due),
            h("td", { key: 8, className: "tabular text-primary font-semi" }, t.findings || "—"),
            h("td", { key: 9, className: "tabular" }, t.files || "—"),
            h("td", { key: 10, className: "tabular text-brand font-semi" }, t.kpi ? "+" + t.kpi : "—"),
          ])
        )),
      ]))),
    ]);
  }

  // ------ Findings tab ------
  function AuditFindings({ a, openFinding }) {
    const finds = D.FINDINGS.filter(f => f.auditId === a.id);
    return h(FindingsList, { findings: finds, openFinding, compact: true });
  }

  // ------ Files tab ------
  function AuditFiles({ a }) {
    const files = [
      { name: "fw-core-01.cfg",       size: "412 KB",  type: "config",  ext: "cfg",  by: "u6", at: "18.05 14:22", findings: 4 },
      { name: "ad-policy-export.xml", size: "128 KB",  type: "config",  ext: "xml",  by: "u7", at: "19.05 09:11", findings: 1 },
      { name: "nessus-internal.csv",  size: "1.4 MB",  type: "scanner", ext: "csv",  by: "u4", at: "15.05 16:30", findings: 8 },
      { name: "owasp-zap-report.json", size: "2.1 MB", type: "scanner", ext: "json", by: "u4", at: "16.05 11:45", findings: 6 },
      { name: "core-net.pcap",        size: "94 MB",   type: "traffic", ext: "pcap", by: "u3", at: "20.05 10:14", findings: 1 },
      { name: "ids-suricata.log",     size: "8.3 MB",  type: "log",     ext: "log",  by: "u6", at: "17.05 13:00", findings: 4 },
      { name: "wifi-controller.bin",  size: "640 KB",  type: "config",  ext: "bin",  by: "u6", at: "—",           findings: 0 },
      { name: "openvas-results.xml",  size: "3.2 MB",  type: "scanner", ext: "xml",  by: "u4", at: "18.05 11:32", findings: 5 },
    ];
    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 } }, [
      h("div", { key: "L", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, [
          h("div", { className: "panel__t" }, [h(I.Folder, { key: "i", size: 15 }), h("span", { key: "t" }, "Fayllar (" + files.length + ")")]),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info") }, [h(I.Upload, { key: "i", size: 14 }), h("span", { key: "t" }, "Yuklash")]),
        ]),
        h("div", { className: "panel__body panel__body--flush", key: 2 }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
          h("thead", { key: "h" }, h("tr", null, [
            h("th", { key: 1 }, "Fayl"),
            h("th", { key: 2 }, "Turi"),
            h("th", { key: 3 }, "Hajm"),
            h("th", { key: 4 }, "Findinglar"),
            h("th", { key: 5 }, "Yuklagan"),
            h("th", { key: 6 }, "Vaqt"),
          ])),
          h("tbody", { key: "b" }, files.map(f =>
            h("tr", { key: f.name }, [
              h("td", { key: 1 }, h("div", { className: "cell-title" }, [
                h("span", { key: "i", className: "icon-box", style: { background: f.type === "scanner" ? "rgba(245,158,11,0.16)" : f.type === "traffic" ? "rgba(14,165,233,0.16)" : f.type === "log" ? "rgba(96,139,250,0.16)" : "var(--brand-soft)", color: f.type === "scanner" ? "var(--status-warning-fg)" : f.type === "traffic" ? "var(--status-info-fg)" : "var(--brand)" } },
                  h(f.type === "scanner" ? I.Bug : f.type === "traffic" ? I.Activity : f.type === "log" ? I.FileText : I.Server, { size: 14 })),
                h("div", { key: "t" }, [
                  h("div", { key: 1, className: "font-mono", style: { fontSize: 13 } }, f.name),
                  h("div", { key: 2, className: "cell-sub" }, "." + f.ext),
                ]),
              ])),
              h("td", { key: 2 }, h("span", { className: "tag tag--outline" }, f.type)),
              h("td", { key: 3, className: "tabular cell-sub" }, f.size),
              h("td", { key: 4 }, f.findings ? h("span", { className: "tag tag--danger" }, f.findings) : h("span", { className: "cell-sub" }, "—")),
              h("td", { key: 5 }, h(Avatar, { user: f.by })),
              h("td", { key: 6, className: "tabular cell-sub" }, f.at),
            ])
          )),
        ]))),
      ]),

      h("div", { key: "R", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Image, { key: "i", size: 15 }), h("span", { key: "t" }, "Skrinshot dalillari")])),
        h("div", { className: "panel__body", key: 2 }, h("div", { className: "tile-grid" }, [
          { name: "fw-rule-perm.png", meta: "F-2026-0341 · 1280x720", code: false },
          { name: "ad-policy.txt", meta: "F-2026-0342 · 2.1 KB", code: true, content: "MinimumPasswordLength: 6\nPasswordHistoryCount: 0\nLockoutThreshold: 0\nLockoutDuration: 0\nMaxPasswordAge: never" },
          { name: "telnet-banners.png", meta: "F-2026-0347 · 12 hosts", code: false },
          { name: "sql-error.png", meta: "F-2026-0346 · 980x540", code: false },
          { name: "dns-tunnel-traffic.png", meta: "F-2026-0345 · timeline", code: false, graph: true },
          { name: "nessus-output.txt", meta: "F-2026-0343 · CVE list", code: true, content: "CVE-2023-25690\nCVE-2023-43622\nCVE-2024-27316\nCVE-2024-38476" },
        ].map((t, i) => h("div", { key: i, className: "tile" }, [
          h("div", { key: 1, className: "tile__thumb " + (t.code ? "tile__thumb--code" : t.graph ? "tile__thumb--graph" : "") },
            t.code ? t.content :
            t.graph ? h("svg", { width: "100%", height: "100%", viewBox: "0 0 100 60", preserveAspectRatio: "none" }, [
              h("path", { d: "M0 50 L10 48 L20 30 L30 35 L40 12 L50 18 L60 8 L70 20 L80 6 L90 4 L100 10", stroke: "var(--brand)", strokeWidth: 1.5, fill: "none" }),
            ]) : h(I.Image, null)
          ),
          h("div", { key: 2, className: "tile__body" }, [
            h("div", { key: 1, className: "tile__name" }, t.name),
            h("div", { key: 2, className: "tile__meta" }, t.meta),
          ]),
        ])))),
      ]),
    ]);
  }

  // ------ Tokens tab ------
  function AuditTokens({ a }) {
    const tokens = D.TOKENS.filter(t => t.audit === a.id);
    return h(TokenManagement, { tokens, scope: "audit" });
  }

  // ------ AI tab (delegate) ------
  function AuditAI({ a }) {
    return h(window.AIScreen, { audit: a, embedded: true });
  }

  // ------ KPI tab ------
  function AuditKPI({ a }) {
    const auditKpi = D.KPI_USERS.filter(k => a.members.includes(k.user));
    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 } }, [
      h("div", { key: "L", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Trophy, { key: "i", size: 15 }), h("span", { key: "t" }, "Mutaxassislar bo‘yicha KPI")])),
        h("div", { className: "panel__body panel__body--flush", key: 2 }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
          h("thead", { key: "h" }, h("tr", null, [
            h("th", { key: 1 }, "Mutaxassis"),
            h("th", { key: 2 }, "Rol"),
            h("th", { key: 3 }, "Vazifa"),
            h("th", { key: 4 }, "Finding"),
            h("th", { key: 5 }, "Critical"),
            h("th", { key: 6 }, "Trend"),
            h("th", { key: 7 }, "Ball"),
          ])),
          h("tbody", { key: "b" }, auditKpi.map((k, i) => {
            const u = D.userById(k.user);
            const isLeader = k.user === a.leader;
            return h("tr", { key: k.user }, [
              h("td", { key: 1 }, h("div", { className: "cell-title" }, [
                h(Avatar, { user: u, key: "a" }),
                h("div", null, [
                  h("div", { key: 1 }, u.name),
                  h("div", { key: 2, className: "cell-sub" }, u.title),
                ]),
              ])),
              h("td", { key: 2 }, isLeader ? h("span", { className: "tag tag--brand" }, "Rahbar") : h("span", { className: "tag tag--outline" }, "Auditor")),
              h("td", { key: 3, className: "tabular text-primary font-semi" }, Math.round(k.tasks / k.audits)),
              h("td", { key: 4, className: "tabular text-primary font-semi" }, Math.round(k.findings / k.audits)),
              h("td", { key: 5, className: "tabular" }, h("span", { className: "sev sev--critical" }, Math.max(0, Math.round(k.findings / k.audits / 4)))),
              h("td", { key: 6 }, h(Sparkline, { data: k.sparkline, w: 80, h: 24 })),
              h("td", { key: 7, className: "tabular", style: { fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", fontSize: 15 } }, Math.round(k.total / k.audits)),
            ]);
          })),
        ]))),
      ]),
      h("div", { key: "R", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Activity, { key: "i", size: 15 }), h("span", { key: "t" }, "KPI hodisalari oqimi")])),
        h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
          [
            { t: "10:42", u: "u4", e: "Finding kiritildi", pts: 3, ent: "F-2026-0349" },
            { t: "10:35", u: "u4", e: "Vazifa yangilandi", pts: 0, ent: "T-123" },
            { t: "10:28", u: "u6", e: "Agent sinxronlash", pts: 0, ent: "AUD-2026-014" },
            { t: "09:58", u: "u3", e: "Finding tasdiqlandi (critical)", pts: 13, ent: "F-2026-0341" },
            { t: "09:42", u: "u3", e: "Auditor sifatida qatnashish", pts: 10, ent: "AUD-2026-014" },
            { t: "09:15", u: "u4", e: "Skaner tahlili bajarildi", pts: 5, ent: "T-116" },
            { t: "08:48", u: "u6", e: "Vazifa muddatida bajarildi", pts: 10, ent: "T-122" },
            { t: "08:30", u: "u7", e: "Vazifa kechiktirildi", pts: -5, ent: "T-121" },
          ].map((e, i, arr) => h("div", { key: i, style: { padding: "10px 14px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 10 } }, [
            h("span", { key: 1, className: "cell-sub tabular", style: { width: 44 } }, e.t),
            h(Avatar, { user: e.u, key: 2 }),
            h("div", { key: 3, style: { flex: 1, minWidth: 0 } }, [
              h("div", { key: 1, style: { fontSize: 12.5, color: "var(--text-primary)" } }, e.e),
              h("div", { key: 2, className: "cell-sub font-mono" }, e.ent),
            ]),
            h("span", { key: 4, className: "font-bold tabular", style: { color: e.pts > 0 ? "var(--status-success-fg)" : e.pts < 0 ? "var(--status-danger-fg)" : "var(--text-tertiary)", fontSize: 14 } }, (e.pts > 0 ? "+" : "") + (e.pts || "—")),
          ])),
        ),
      ]),
    ]);
  }

  // ------ Reports tab ------
  function AuditReports({ a }) {
    const reps = D.REPORTS.filter(r => r.audit === a.id);
    return h("div", null, [
      h("div", { key: "h", className: "card card__pad", style: { marginBottom: 14, display: "flex", gap: 16, alignItems: "center" } }, [
        h("div", { key: 1, className: "stat__icon", style: { width: 48, height: 48 } }, h(I.FileText, { key: "i-filetext", size: 22 })),
        h("div", { key: 2, style: { flex: 1 } }, [
          h("div", { key: 1, style: { fontSize: 16, fontWeight: 700, color: "var(--text-primary)" } }, "Yakuniy hisobot tayyor"),
          h("div", { key: 2, className: "text-sm text-muted", style: { marginTop: 2 } }, "Audit ma‘lumotlari, AI xulosalari va KPI natijalari asosida 4 ta hisobot avtomatik shakllantirildi. Tasdiqlashga yuborishingiz mumkin."),
        ]),
        h("div", { key: 3, style: { display: "flex", gap: 8 } }, [
          h("button", { key: 1, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("AI hisobot qoralamasi yaratilmoqda (qwen2.5:14b)", "info") }, [h(I.Sparkles, { key: "i", size: 14 }), h("span", { key: "t" }, "AI generatsiya")]),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Hammasi yuklab olinmoqda (ZIP arxiv)...", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Hammasini yuklash")]),
        ]),
      ]),
      h("div", { key: "g", className: "grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 } },
        [
          { id: "R-A", title: "Yakuniy audit hisoboti", desc: "Tashkilot, audit guruhi, vazifalar, tasdiqlangan findinglar va remediation reja.", icon: I.FileText, formats: ["DOCX", "PDF", "HTML"], pages: 84, status: "draft" },
          { id: "R-B", title: "Executive summary",       desc: "Rahbariyat uchun 2 sahifalik qisqa xulosa, asosiy xavflar va tavsiyalar.", icon: I.Star, formats: ["PDF"], pages: 2, status: "draft" },
          { id: "R-C", title: "Remediation plan",        desc: "Texnik mutaxassislar uchun batafsil bartaraf etish rejasi (owner + ETA).", icon: I.Target, formats: ["DOCX", "XLSX"], pages: 18, status: "draft" },
          { id: "R-D", title: "KPI hisoboti",            desc: "Auditda qatnashgan mutaxassislar bo‘yicha KPI natijalari va reyting.", icon: I.Trophy, formats: ["XLSX", "PDF"], pages: 6, status: "approved" },
        ].map(r => h("div", { key: r.id, className: "card card--hover" }, [
          h("div", { key: 1, style: { padding: "18px 18px 14px", display: "flex", alignItems: "flex-start", gap: 12 } }, [
            h("div", { key: 1, className: "stat__icon", style: { width: 44, height: 44 } }, h(r.icon, { size: 20 })),
            h("div", { key: 2, style: { flex: 1 } }, [
              h("div", { key: 1, style: { fontSize: 15, fontWeight: 700, color: "var(--text-primary)" } }, r.title),
              h("div", { key: 2, className: "cell-sub", style: { marginTop: 4, lineHeight: 1.5 } }, r.desc),
            ]),
          ]),
          h("div", { key: 2, style: { padding: "0 18px", display: "flex", gap: 6, flexWrap: "wrap" } }, [
            ...r.formats.map(f => h("span", { key: f, className: "tag tag--outline" }, f)),
            h("span", { key: "p", className: "tag tag--ghost" }, r.pages + " sahifa"),
            h("span", { key: "s", className: "tag " + (r.status === "draft" ? "tag--warning" : "tag--success") }, r.status === "draft" ? "Qoralama" : "Tasdiqlangan"),
          ]),
          h("div", { key: 3, style: { padding: 14, borderTop: "1px solid var(--border-color)", marginTop: 14, display: "flex", gap: 8 } }, [
            h("button", { key: 1, className: "btn btn--ghost btn--sm", style: { flex: 1 }, onClick: () => window.showToast(r.title + " preview ochilmoqda...", "info") }, [h(I.Eye, { key: "i", size: 14 }), h("span", { key: "t" }, "Preview")]),
            h("button", { key: 2, className: "btn btn--primary btn--sm", style: { flex: 1 }, onClick: () => window.showToast(r.title + " yuklab olinmoqda...", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Yuklash")]),
          ]),
        ]))
      ),
    ]);
  }

  // ------ Log tab ------
  function AuditLog({ a }) {
    return h(window.LogsScreen, { embedded: true });
  }

  // =========================================================================
  // FINDINGS LIST (also used as a tab inside audit detail)
  // =========================================================================
  function FindingsScreen({ openFinding, setRoute }) {
    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Findinglar" }],
        title: "Findinglar va zaifliklar",
        sub: D.FINDINGS.length + " ta yozuv · " + D.FINDINGS.filter(f => f.severity === "critical").length + " critical · "
          + D.FINDINGS.filter(f => f.status === "review").length + " tekshiruvda",
        actions: [
          h("div", { key: 0, className: "input-group", style: { width: 280 } }, [
            h(I.Search, { className: "icon-l" }),
            h("input", { className: "input", placeholder: "Finding ID, asset, CVE..." }),
          ]),
          h(window.FilterButton, { key: 1, kind: "findings" }),
          h("button", { key: 2, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Findinglar XLSX formatda eksport qilindi", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "Eksport")]),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.__openCreateFinding && window.__openCreateFinding() }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Finding qo‘shish")]),
        ],
      }),
      h("div", { key: "qf", style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" } }, [
        ["Hammasi", D.FINDINGS.length, "tag--brand"],
        ["Critical", D.FINDINGS.filter(f => f.severity === "critical").length, "tag--danger"],
        ["High", D.FINDINGS.filter(f => f.severity === "high").length, "tag--warning"],
        ["Tekshiruvda", D.FINDINGS.filter(f => f.status === "review").length, "tag--info"],
        ["AI tavsiyali", D.FINDINGS.filter(f => f.ai).length, "tag--outline"],
      ].map(([l, c, cls]) => h("span", { key: l, className: "tag " + cls }, l + " · " + c))),

      h(FindingsList, { key: "L", findings: D.FINDINGS, openFinding }),
    ]);
  }
  window.FindingsScreen = FindingsScreen;

  function FindingsList({ findings, openFinding, compact }) {
    return h("div", { className: "tbl-wrap" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
      h("thead", { key: "h" }, h("tr", null, [
        h("th", { key: 1, style: { width: 36 } }, h("input", { className: "checkbox", type: "checkbox" })),
        h("th", { key: 2 }, "Sev"),
        h("th", { key: 3 }, "Finding"),
        h("th", { key: 4 }, "Asset"),
        h("th", { key: 5 }, "CVSS"),
        h("th", { key: 6 }, "Status"),
        h("th", { key: 7 }, "Dalil"),
        compact ? null : h("th", { key: 8 }, "Audit"),
        h("th", { key: 9 }, "Auditor"),
        h("th", { key: 10 }, "Vaqt"),
      ])),
      h("tbody", { key: "b" }, findings.map(f =>
        h("tr", { key: f.id, onClick: () => openFinding(f.id) }, [
          h("td", { key: 0 }, h("input", { className: "checkbox", type: "checkbox", onClick: e => e.stopPropagation() })),
          h("td", { key: 1 }, h(Sev, { level: f.severity })),
          h("td", { key: 2 }, h("div", null, [
            h("div", { key: 1, className: "text-primary font-semi" }, f.title),
            h("div", { key: 2, className: "cell-sub" }, [
              h("span", { key: 1, className: "font-mono" }, f.id),
              " · ",
              h("span", { key: 2 }, f.cwe),
              f.ai ? h("span", { key: 3, style: { marginLeft: 8, color: "var(--brand)", fontWeight: 600 } }, "✦ AI"): null,
            ]),
          ])),
          h("td", { key: 3, className: "font-mono", style: { fontSize: 12 } }, f.asset),
          h("td", { key: 4, className: "tabular font-bold text-primary" }, f.cvss),
          h("td", { key: 5 }, statusTag(f.status === "approved" ? "approved" : f.status === "review" ? "review" : f.status === "returned" ? "returned" : "in_progress")),
          h("td", { key: 6 }, h("span", { className: "cell-sub", style: { display: "inline-flex", alignItems: "center", gap: 4 } }, [
            h(I.Paperclip, { size: 12, key: "i" }), h("span", { key: "n", className: "tabular" }, f.evidence),
          ])),
          compact ? null : h("td", { key: 7, className: "cell-mono", style: { fontSize: 12 } }, f.auditId),
          h("td", { key: 8 }, h(Avatar, { user: f.reportedBy })),
          h("td", { key: 9, className: "tabular cell-sub" }, f.date),
        ])
      )),
    ])));
  }
  window.FindingsList = FindingsList;

  // =========================================================================
  // FINDING DRAWER (detail view)
  // =========================================================================
  function FindingDrawer({ findingId, onClose, role }) {
    const f = D.FINDINGS.find(x => x.id === findingId);
    if (!f) return null;
    const apprStages = [
      { key: "group_lead", title: "Guruh rahbari", who: f.reportedBy, role: "1-tasdiq" },
      { key: "head", title: "Bo‘lim boshlig‘i", who: "u2", role: "2-tasdiq" },
      { key: "dept", title: "Departament rahbari", who: "u1", role: "Yakuniy" },
    ];
    const apprTimeline = f.status === "approved"
      ? [
          { who: f.reportedBy, action: "Topilmani yaratdi", stage: "group_lead", t: f.date + " 09:02", state: "done" },
          { who: f.reportedBy, action: "Tasdiqlashga yubordi", stage: "group_lead", t: f.date + " 09:06", state: "done" },
          { who: "u3", action: "Tasdiqladi", stage: "group_lead", t: f.date + " 11:20", state: "done", comment: "Dalillar yetarli, hisobotga tayyor." },
          { who: "u2", action: "Tasdiqladi", stage: "head", t: f.date + " 14:05", state: "done" },
          { who: "u1", action: "Yakuniy tasdiqladi", stage: "dept", t: f.date + " 16:40", state: "done" },
        ]
      : [
          { who: f.reportedBy, action: "Topilmani yaratdi", stage: "group_lead", t: f.date + " 09:02", state: "done" },
          { who: f.reportedBy, action: "Tasdiqlashga yubordi", stage: "group_lead", t: f.date + " 09:06", state: "done" },
        ];
    const apprCurrent = f.status === "approved" ? null : "group_lead";
    return h(Drawer, {
      open: !!f,
      onClose,
      wide: true,
      title: h("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, [
        h("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 10 } }, [
          h(Sev, { level: f.severity, key: 1 }),
          h("span", { key: 2, className: "font-mono cell-sub" }, f.id),
          h("span", { key: 3, className: "cell-sub" }, "· CVSS"),
          h("span", { key: 4, className: "font-bold tabular" }, f.cvss),
          f.ai ? h("span", { key: 5, className: "tag tag--brand" }, [h(I.Sparkles, { key: "i", size: 11 }), "AI"]) : null,
        ]),
        h("div", { key: 2, className: "panel__t", style: { fontSize: 16 } }, f.title),
      ]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Yopish"),
        h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("Finding tahrirlash oynasi ochilmoqda...", "info") }, [h(I.Edit3, { key: "i", size: 14 }), h("span", { key: "t" }, "Tahrir")]),
        h("button", { key: 3, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("AI remediation hisobotga qo‘shildi", "info") }, [h(I.Sparkles, { key: "i", size: 14 }), h("span", { key: "t" }, "Hisobotga")]),
      ],
    }, [
      // Quick props
      h("div", { key: "p", className: "grid", style: { gridTemplateColumns: "repeat(3, 1fr)", gap: 12 } }, [
        ["Asset",  h("span", { className: "font-mono", style: { fontSize: 13 } }, f.asset)],
        ["Turi",   h("span", { className: "tag tag--outline" }, f.type)],
        ["Status", statusTag(f.status === "approved" ? "approved" : f.status === "review" ? "review" : "in_progress")],
        ["CWE",    h("span", { className: "font-mono", style: { fontSize: 13 } }, f.cwe)],
        ["Audit",  h("span", { className: "font-mono", style: { fontSize: 13 } }, f.auditId)],
        ["Vazifa", h("span", { className: "font-mono", style: { fontSize: 13 } }, f.taskId)],
        ["Auditor", h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, [
          h(Avatar, { user: f.reportedBy, key: 1 }),
          h("span", { key: 2 }, D.userById(f.reportedBy).name),
        ])],
        ["Aniqlangan", h("span", { className: "tabular" }, f.date)],
        ["Dalillar", h("span", { className: "tag tag--ghost" }, [h(I.Paperclip, { key: "i-paperclip", size: 11 }), f.evidence + " ta"])],
      ].map(([l, v]) => h("div", { key: l, className: "field" }, [
        h("span", { key: 1, className: "field__label", style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)" } }, l),
        h("div", { key: 2 }, v),
      ]))),

      // 3-stage approval (TZ §9)
      h("div", { key: "appr", style: { marginTop: 20 } },
        h(window.ApprovalFlow, { stages: apprStages, timeline: apprTimeline, current: apprCurrent, role, kind: "finding" })),

      // Description
      h("div", { key: "desc", style: { marginTop: 20 } }, [
        h("h4", { key: 1, style: { fontSize: 14, marginBottom: 8 } }, "Tavsif"),
        h("p", { key: 2, style: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 } }, f.description),
      ]),

      // AI section
      f.ai ? h("div", { key: "ai", className: "ai-card", style: { marginTop: 20 } }, h("div", { className: "ai-card__inner" }, [
        h("div", { className: "ai-card__head", key: 1 }, [
          h("div", { className: "ai-card__icon", key: 1 }, h(I.Sparkles, { key: "i-sparkles", size: 14 })),
          h("span", { className: "ai-card__title", key: 2 }, "Ollama tavsiyasi — remediation"),
          h("span", { key: 3, className: "tag tag--brand", style: { marginLeft: "auto" } }, "qwen2.5:14b"),
        ]),
        h("p", { key: 2, className: "ai-card__body" },
          f.severity === "critical"
            ? "Ushbu zaiflik aniqlangan tizimni jamoatchilik kirishidan darhol ajratish tavsiya etiladi. WAF qoidalari yoki firewall darajasida bloklash hujum vektorini vaqtinchalik yopadi. Patch chiqarilgan versiyaga yangilash uchun changeman jarayonini tezlashtirish lozim. Yangilanish bajarilgach, ushbu konfiguratsiya boshqa shu turdagi tizimlarda ham tekshirilishi kerak."
            : "Tavsiya etiladi: tegishli xizmatni o‘chirib, eski protokolni zamonaviysiga (masalan, Telnet → SSHv2, SMBv1 → SMBv3, RDP NLA on) almashtirish. O‘zgartirishlar pilot bo‘limda sinab ko‘rilgach, qolgan tizimlarga rolloverka qilinishi kerak."
        ),
        h("div", { key: 3, style: { display: "flex", gap: 8, marginTop: 12 } }, [
          h("button", { key: 1, className: "btn btn--soft btn--sm", onClick: () => { try { navigator.clipboard.writeText("AI tavsiya..."); } catch(e){} window.showToast("AI tavsiya buferga ko'chirildi", "success"); } }, [h(I.Copy, { key: "i", size: 14 }), h("span", { key: "t" }, "Nusxa")]),
          h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => window.showToast("AI tahlil qaytadan ishga tushirildi...", "info") }, [h(I.Refresh, { key: "i", size: 14 }), h("span", { key: "t" }, "Qayta tahlil")]),
          h("button", { key: 3, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("AI tavsiyani tahrirlash oynasi ochilmoqda...", "info") }, [h(I.Edit3, { key: "i", size: 14 }), h("span", { key: "t" }, "Tahrir")]),
        ]),
      ])) : null,

      // Evidence
      h("h4", { key: "et", style: { fontSize: 14, marginTop: 20, marginBottom: 10 } }, "Dalillar (" + f.evidence + ")"),
      h("div", { key: "ev", className: "tile-grid" }, Array.from({ length: f.evidence }).map((_, i) => h("div", { key: i, className: "tile" }, [
        h("div", { key: 1, className: "tile__thumb " + (i === 1 ? "tile__thumb--code" : "") },
          i === 1 ? "interface GigabitEthernet0/0\n ip address 10.0.0.1 255.0.0.0\n no ip access-group in\n no logging\n!\nip access-list extended PERMIT_ALL\n permit ip any any" :
          h(i === 0 ? I.Image : i === 2 ? I.FileText : I.Activity)
        ),
        h("div", { key: 2, className: "tile__body" }, [
          h("div", { key: 1, className: "tile__name" }, ["screenshot-1.png", "fw-config-excerpt.txt", "nessus-output.csv", "tcpdump.pcap"][i] || ("evidence-" + (i + 1))),
          h("div", { key: 2, className: "tile__meta" }, ["1280x720 PNG", "4 KB", "12 satr", "3.4 MB"][i] || "—"),
        ]),
      ]))),

      // Comments
      h("h4", { key: "ct", style: { fontSize: 14, marginTop: 24, marginBottom: 10 } }, "Sharhlar"),
      h("div", { key: "cm", style: { display: "flex", flexDirection: "column", gap: 12 } },
        [
          { u: "u3", t: "Critical findinglarni darhol tasdiqladim. Sevara, OWASP ZAP natijalarini ham loyihaga qo‘shing.", at: "10 daqiqa oldin" },
          { u: "u4", t: "Bajaramiz. Sentral switch konfiguratsiyasini hozir tortib olayapman.", at: "8 daqiqa oldin" },
        ].map((c, i) => h("div", { key: i, style: { display: "flex", gap: 10, alignItems: "flex-start" } }, [
          h(Avatar, { user: c.u, key: 1 }),
          h("div", { key: 2, style: { flex: 1 } }, [
            h("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 8 } }, [
              h("strong", { key: 1, style: { fontSize: 13, color: "var(--text-primary)" } }, D.userById(c.u).name),
              h("span", { key: 2, className: "cell-sub" }, c.at),
            ]),
            h("p", { key: 2, style: { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55, marginTop: 2 } }, c.t),
          ]),
        ])),
      ),
      h("div", { key: "ci", style: { marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start" } }, [
        h(Avatar, { user: D.USERS.find(u => u.role === (role || "departament")) || D.USERS[0], key: 1 }),
        h("div", { key: 2, style: { flex: 1, position: "relative" } }, [
          h("textarea", { className: "textarea", placeholder: "Sharh yozish — @bilan eslatish ham mumkin...", style: { minHeight: 56 } }),
        ]),
      ]),
    ]);
  }
  window.FindingDrawer = FindingDrawer;

  // =========================================================================
  // TOKEN MANAGEMENT (reusable)
  // =========================================================================
  function TokenManagement({ tokens, scope }) {
    const [reveal, setReveal] = useState({});
    return h("div", null, [
      h("div", { key: "info", className: "card card__pad-sm", style: { marginBottom: 14, display: "flex", alignItems: "center", gap: 12, background: "var(--bg-surface-2)" } }, [
        h("div", { key: 1, className: "stat__icon" }, h(I.KeyRound, { key: "i-keyround", size: 14 })),
        h("div", { key: 2, style: { flex: 1, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 } },
          "Har bir audit va har bir xodim uchun alohida token generatsiya qilinadi. Token EXE agentda faqat shu xodimga biriktirilgan vazifalarni ochadi va qurilma identifikatori (hostname + OS) bilan bog‘lanadi."),
        h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.__openCreateToken && window.__openCreateToken() }, [h(I.Plus, { key: "i", size: 14 }), h("span", { key: "t" }, "Token chiqarish")]),
      ]),

      h("div", { key: "t", className: "tbl-wrap" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
        h("thead", { key: "h" }, h("tr", null, [
          h("th", { key: 1 }, "Token"),
          scope === "audit" ? null : h("th", { key: 2 }, "Audit"),
          h("th", { key: 3 }, "Xodim"),
          h("th", { key: 4 }, "Qurilma"),
          h("th", { key: 5 }, "Berilgan"),
          h("th", { key: 6 }, "Amal qiladi"),
          h("th", { key: 7 }, "Status"),
          h("th", { key: 8 }, "Oxirgi ishlatilgan"),
          h("th", { key: 9, className: "cell-actions" }, "Amallar"),
        ])),
        h("tbody", { key: "b" }, tokens.map(t => {
          const u = D.userById(t.user);
          return h("tr", { key: t.id }, [
            h("td", { key: 1 }, h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, [
              h("code", { key: 1, className: "font-mono", style: { fontSize: 12, padding: "3px 8px", background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: 4, color: reveal[t.id] ? "var(--text-primary)" : "var(--text-tertiary)" } }, reveal[t.id] ? "tk_a91xd6f0c47e80b" : t.id),
              h("button", { key: 2, className: "iconbtn", style: { width: 24, height: 24 }, onClick: () => setReveal(r => ({ ...r, [t.id]: !r[t.id] })) }, reveal[t.id] ? h(I.EyeOff, { key: "i-eyeoff", size: 12 }) : h(I.Eye, { key: "i-eye", size: 12 })),
              h("button", { key: 3, className: "iconbtn", style: { width: 24, height: 24 } }, h(I.Copy, { key: "i-copy", size: 12 })),
            ])),
            scope === "audit" ? null : h("td", { key: 2, className: "cell-mono", style: { fontSize: 12 } }, t.audit),
            h("td", { key: 3 }, h("div", { className: "cell-title" }, [
              h(Avatar, { user: u, key: 1 }),
              h("div", null, [
                h("div", { key: 1 }, u.name),
                h("div", { key: 2, className: "cell-sub" }, u.title),
              ]),
            ])),
            h("td", { key: 4 }, h("div", null, [
              h("div", { key: 1, className: "font-mono", style: { fontSize: 12.5, color: "var(--text-primary)" } }, t.hostname),
              h("div", { key: 2, className: "cell-sub" }, t.os + " · " + t.agent + " · " + t.ip),
            ])),
            h("td", { key: 5, className: "tabular cell-sub" }, t.issued),
            h("td", { key: 6, className: "tabular cell-sub" }, t.expires),
            h("td", { key: 7 }, t.status === "active" ? h("span", { className: "tag tag--success" }, [h("span", { className: "dot dot--pulse", style: { width: 6, height: 6 } }), "Aktiv"]) :
                                t.status === "expired" ? h("span", { className: "tag tag--ghost" }, "Muddati o‘tgan") :
                                h("span", { className: "tag tag--danger" }, "Bekor qilingan")),
            h("td", { key: 8, className: "tabular cell-sub" }, t.lastUsed),
            h("td", { key: 9, className: "cell-actions" }, h("div", { style: { display: "inline-flex", gap: 4, alignItems: "center" } }, [
              h("button", {
                key: 1,
                className: "btn btn--ghost btn--xs btn--icon",
                title: "Yangilash (rotate)",
                onClick: async () => {
                  const ok = await window.confirmAction({
                    title: "Tokenni yangilash",
                    body: "Eski token darhol bekor qilinadi va yangi token chiqariladi. Agent qurilmasini qayta ulashish kerak bo'ladi.",
                    confirmLabel: "Yangilash",
                  });
                  if (ok) window.showToast("Yangi token chiqarildi: tk_" + Math.random().toString(36).slice(2, 7) + "...", "success");
                },
              }, h(I.Refresh, { key: "i-refresh", size: 13 })),
              h("button", {
                key: 2,
                className: "btn btn--ghost btn--xs btn--icon",
                title: "Bekor qilish",
                onClick: async () => {
                  const ok = await window.confirmAction({
                    title: "Tokenni bekor qilish",
                    body: "Token " + t.id + " darhol o'chiriladi. Agent qurilmasi ulanmaydi.",
                    confirmLabel: "Bekor qilish",
                    danger: true,
                  });
                  if (ok) window.showToast("Token bekor qilindi", "warning");
                },
              }, h(I.X, { key: "i-x", size: 13 })),
              h(window.MoreMenu, {
                key: 3,
                items: [
                  { label: "Token ma'lumotlari",  icon: I.Eye,       onClick: () => window.showToast("Ma'lumotlar oynasi ochilmoqda...", "info") },
                  { label: "Qurilma loglarini ko'rish", icon: I.History, onClick: () => window.showToast("Agent loglari yuklanmoqda...", "info") },
                  { label: "Nusxalash (token ID)", icon: I.Copy,     onClick: () => { navigator.clipboard && navigator.clipboard.writeText(t.id); window.showToast("Token ID buferga ko'chirildi", "success"); } },
                  { label: "Muddatni uzaytirish", icon: I.Clock,     onClick: () => window.showToast("Muddat oynasi ochilmoqda...", "info") },
                ],
              }),
            ])),
          ]);
        })),
      ]))),
    ]);
  }
  window.TokenManagement = TokenManagement;

})();
