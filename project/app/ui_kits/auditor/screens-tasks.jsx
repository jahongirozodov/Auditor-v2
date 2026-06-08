/* Task detail page + task-distribution board (TZ §8).
   TaskDetailScreen: full task view with status workflow, linked findings (+add),
   reassignment, evidence and history. AssignScreen: group-lead task distribution. */
(function () {
  const { useState, useMemo } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  const PageHeader = window.PageHeader;
  const Avatar = window.Avatar;
  const Sev = window.Sev;

  const FLOW = [
    { key: "new",         label: "Yangi",       icon: I.Inbox },
    { key: "assigned",    label: "Biriktirilgan", icon: I.UserCheck },
    { key: "in_progress", label: "Jarayonda",   icon: I.Activity },
    { key: "review",      label: "Tekshiruvda", icon: I.Eye },
    { key: "done",        label: "Bajarilgan",  icon: I.Check },
  ];
  // status → which actions are available (TZ §8.2)
  function actionsFor(status) {
    switch (status) {
      case "new":         return [["assigned", "Biriktirish", "primary", I.UserCheck]];
      case "assigned":    return [["in_progress", "Ishni boshlash", "primary", I.Play]];
      case "in_progress": return [["review", "Tekshiruvga yuborish", "primary", I.Send], ["done", "Bajarildi deb belgilash", "secondary", I.Check]];
      case "review":      return [["done", "Ma’qullash", "primary", I.Check], ["returned", "Qaytarish", "danger", I.X]];
      case "returned":    return [["in_progress", "Qayta boshlash", "primary", I.Refresh]];
      case "blocked":     return [["in_progress", "Blokni ochish", "primary", I.Unlock]];
      default:            return [];
    }
  }

  // =========================================================================
  // TASK DETAIL
  // =========================================================================
  function TaskDetailScreen({ taskId, setRoute, openFinding, openAudit, role }) {
    const t = D.TASKS.find(x => x.id === taskId) || D.TASKS[0];
    const audit = D.auditById(t.auditId) || D.AUDITS[0];
    const [status, setStatus] = useState(t.status);
    const [assignee, setAssignee] = useState(t.assignee);
    const [history, setHistory] = useState(() => ([
      { who: audit.leader, action: "Vazifani yaratdi", t: "2026-05-15 09:10", state: "done" },
      { who: audit.leader, action: "Mas’ul etib biriktirdi: " + D.userById(t.assignee).name, t: "2026-05-15 09:12", state: "done" },
      { who: t.assignee, action: "Ishni boshladi", t: "2026-05-16 10:04", state: "done" },
    ]));

    const findings = D.FINDINGS.filter(f => f.taskId === t.id);
    const members = (audit.members || []).map(D.userById);
    const curIdx = FLOW.findIndex(s => s.key === status);
    const stamp = () => { const d = new Date(); const p = n => String(n).padStart(2, "0"); return `2026-05-21 ${p(d.getHours())}:${p(d.getMinutes())}`; };

    function advance(next, label) {
      setStatus(next);
      setHistory(hh => [...hh, { who: assignee, action: label, t: stamp(), state: next === "returned" ? "returned" : "done" }]);
      window.showToast("Vazifa holati: " + (D.TASK_STATUS[next] ? D.TASK_STATUS[next].label : next), next === "returned" ? "warning" : "success");
    }
    function reassign(uid) {
      setAssignee(uid);
      setHistory(hh => [...hh, { who: audit.leader, action: "Qayta biriktirildi: " + D.userById(uid).name, t: stamp(), state: "done" }]);
      window.showToast(D.userById(uid).name + " ga biriktirildi", "info");
    }

    const prioTag = h("span", { className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost") }, t.priority + " ustuvorlik");

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [
          { label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") },
          { label: "Mening vazifalarim", onClick: () => setRoute("tasks") },
          { label: t.id },
        ],
        title: t.title,
        sub: h("span", { style: { display: "inline-flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, [
          h("span", { key: 1, className: "font-mono", style: { color: "var(--text-tertiary)" } }, t.id),
          h("span", { key: 2 }, "·"), h("span", { key: 3, className: "tag " + (D.TASK_STATUS[status] ? "tag--info" : "tag--ghost") }, D.TASK_STATUS[status] ? D.TASK_STATUS[status].label : status),
          h("span", { key: 4 }, "·"), prioTag,
          h("span", { key: 5 }, "·"),
          h("button", { key: 6, className: "linklike font-mono", style: { background: "none", border: "none", color: "var(--brand)", cursor: "pointer", padding: 0, fontSize: 13 }, onClick: () => openAudit(audit.id) }, audit.code),
        ]),
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => setRoute("tasks") }, [h(I.ChevronLeft, { size: 14, key: "i" }), h("span", { key: "t" }, "Orqaga")]),
          h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("Vazifa tahrirlanmoqda", "info") }, [h(I.Edit3, { size: 14, key: "i" }), h("span", { key: "t" }, "Tahrir")]),
        ],
      }),

      // ---- status workflow strip ----
      h("div", { key: "flow", className: "panel", style: { marginBottom: 16 } }, h("div", { className: "panel__body", style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } }, [
        h("div", { key: "strip", className: "tflow" }, FLOW.flatMap((s, i) => {
          const done = i < curIdx, cur = i === curIdx;
          const node = h("div", { key: s.key, className: "tflow__node" + (done ? " tflow__node--done" : cur ? " tflow__node--cur" : "") }, [
            h("div", { key: "d", className: "tflow__dot" }, done ? h(I.Check, { size: 14, key: "i" }) : h(s.icon, { size: 14, key: "i" })),
            h("span", { key: "l", className: "tflow__lab" }, s.label),
          ]);
          return i === 0 ? [node] : [h("div", { key: "c" + i, className: "tflow__conn" + (i <= curIdx ? " tflow__conn--done" : "") }), node];
        })),
        status === "returned" ? h("span", { key: "ret", className: "tag tag--danger", style: { marginLeft: 8 } }, [h(I.Refresh, { size: 11, key: "i" }), "Qaytarilgan"]) : null,
        h("div", { key: "act", style: { marginLeft: "auto", display: "flex", gap: 8 } },
          actionsFor(status).map(([next, label, variant, Ic], i) => h("button", { key: i, className: "btn btn--" + variant + " btn--sm", onClick: () => advance(next, label) }, [h(Ic, { size: 14, key: "i" }), h("span", { key: "t" }, label)]))
        ),
      ])),

      h("div", { key: "grid", className: "grid", style: { gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: 16, alignItems: "start" } }, [
        // LEFT
        h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          // description
          h("div", { key: "desc", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.FileText, { size: 15, key: "i" }), h("span", { key: "t" }, "Vazifa tavsifi")])),
            h("div", { className: "panel__body", key: 2 }, [
              h("p", { key: 1, style: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 } },
                t.title + " — ushbu vazifa " + audit.code + " auditi doirasida bajariladi. Aniqlangan kamchiliklar topilma sifatida ro‘yxatga olinadi va 3-bosqichli tasdiqlash oqimidan o‘tkaziladi."),
              h("div", { key: 2, className: "grid", style: { gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 } },
                [["Turi", t.type], ["Muddat", t.due], ["KPI", t.kpi ? "+" + t.kpi : "—"]].map(([k, v]) => h("div", { key: k, className: "org-meta__cell" }, [
                  h("div", { key: 1, className: "org-meta__l" }, k), h("div", { key: 2, className: "org-meta__v", style: { fontSize: 15 } }, v),
                ]))),
            ]),
          ]),

          // linked findings
          h("div", { key: "fnd", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, [
              h("div", { className: "panel__t" }, [h(I.AlertTriangle, { size: 15, key: "i" }), h("span", { key: "t" }, "Topilmalar")]),
              h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.__openCreateFinding && window.__openCreateFinding() }, [h(I.Plus, { size: 13, key: "i" }), h("span", { key: "t" }, "Topilma qo‘shish")]),
            ]),
            h("div", { className: "panel__body panel__body--flush", key: 2 },
              findings.length ? findings.map((f, i) => h("div", {
                key: f.id, className: "lrow", style: { border: "none", borderBottom: i < findings.length - 1 ? "1px solid var(--border-color)" : "none", borderRadius: 0, cursor: "pointer", alignItems: "center" },
                onClick: () => { setRoute("findings"); openFinding(f.id); },
              }, [
                h(Sev, { key: 1, level: f.severity }),
                h("div", { key: 2, className: "lrow__body" }, [
                  h("div", { key: 1, className: "lrow__title" }, f.title),
                  h("div", { key: 2, className: "lrow__sub" }, [h("span", { key: 1, className: "font-mono" }, f.id), " · CVSS " + f.cvss + " · " + f.cwe]),
                ]),
                h("span", { key: 3, className: "tag " + (f.status === "approved" ? "tag--success" : "tag--warning") }, f.status === "approved" ? "Tasdiqlangan" : "Tekshiruvda"),
              ])) : h("div", { style: { padding: 16, color: "var(--text-tertiary)", fontSize: 13 } }, "Bu vazifa bo‘yicha hali topilma kiritilmagan. “Topilma qo‘shish” tugmasi orqali qo‘shing.")
            ),
          ]),

          // evidence
          h("div", { key: "ev", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, [
              h("div", { className: "panel__t" }, [h(I.Paperclip, { size: 15, key: "i" }), h("span", { key: "t" }, "Fayllar va dalillar")]),
              h("button", { key: 2, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Fayl yuklash oynasi ochilmoqda", "info") }, [h(I.Upload, { size: 13, key: "i" }), h("span", { key: "t" }, "Yuklash")]),
            ]),
            h("div", { className: "panel__body", key: 2 }, t.files ? h("div", { className: "tile-grid" }, Array.from({ length: t.files }).map((_, i) => h("div", { key: i, className: "tile" }, [
              h("div", { key: 1, className: "tile__thumb" }, h([I.FileText, I.Image, I.Code, I.Activity][i % 4], { size: 22, style: { color: "var(--text-tertiary)" } })),
              h("div", { key: 2, className: "tile__body" }, [
                h("div", { key: 1, className: "tile__name font-mono" }, ["config-dump.txt", "screenshot.png", "scan-output.csv", "capture.pcap"][i % 4]),
                h("div", { key: 2, className: "tile__meta" }, ["4 KB", "1.2 MB", "18 KB", "3.4 MB"][i % 4]),
              ]),
            ]))) : h("div", { style: { color: "var(--text-tertiary)", fontSize: 13 } }, "Fayl biriktirilmagan.")),
          ]),
        ]),

        // RIGHT
        h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          // assignment + details
          h("div", { key: "as", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.UserCheck, { size: 15, key: "i" }), h("span", { key: "t" }, "Mas’ul va tafsilotlar")])),
            h("div", { className: "panel__body", key: 2, style: { display: "flex", flexDirection: "column", gap: 14 } }, [
              h("div", { key: "cur", style: { display: "flex", alignItems: "center", gap: 12 } }, [
                h(Avatar, { key: 1, user: assignee }),
                h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                  h("div", { key: 1, style: { fontSize: 14, fontWeight: 650, color: "var(--text-primary)" } }, D.userById(assignee).name),
                  h("div", { key: 2, className: "cell-sub" }, D.userById(assignee).title),
                ]),
              ]),
              h("div", { key: "re", className: "field" }, [
                h("label", { className: "field__label" }, "Qayta biriktirish (group_lead)"),
                h("select", { className: "select", value: assignee, onChange: e => reassign(e.target.value) },
                  members.map(u => h("option", { key: u.id, value: u.id }, u.name + " — " + u.title))),
              ]),
              h("div", { key: "kv" }, [
                ["Audit", h("button", { className: "linklike font-mono", style: { background: "none", border: "none", color: "var(--brand)", cursor: "pointer", padding: 0 }, onClick: () => openAudit(audit.id) }, audit.code)],
                ["Turi", h("span", { className: "tag tag--outline" }, t.type)],
                ["Ustuvorlik", prioTag],
                ["Muddat", h("span", { className: "tabular" }, t.due)],
                ["KPI mukofoti", h("span", { className: "tabular font-semi", style: { color: "var(--brand)" } }, t.kpi ? "+" + t.kpi : "—")],
              ].map(([k, v]) => h("div", { key: k, className: "topo-detail__kv" }, [h("span", { key: 1, className: "topo-detail__k" }, k), h("span", { key: 2, className: "topo-detail__v" }, v)]))),
            ]),
          ]),

          // history
          h("div", { key: "hist", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.History, { size: 15, key: "i" }), h("span", { key: "t" }, "Holatlar tarixi")])),
            h("div", { className: "panel__body", key: 2 }, h("div", { className: "apf__tl" },
              history.map((e, i) => h("div", { key: i, className: "apf__tlitem apf__tlitem--" + (e.state || "done") }, [
                h("div", { key: "d", className: "apf__tldot" }, e.state === "returned" ? h(I.X, { size: 12, key: "i" }) : h(I.Check, { size: 12, key: "i" })),
                h("div", { key: "b", className: "apf__tlbody" }, [
                  h("div", { key: 1, className: "apf__tlhead" }, [
                    h(Avatar, { user: e.who, key: "a" }),
                    h("span", { key: "n", className: "apf__tlname" }, D.userById(e.who).name),
                    h("span", { key: "t", className: "apf__tltime tabular" }, e.t),
                  ]),
                  h("div", { key: 2, className: "apf__tlaction", style: { marginTop: 2 } }, e.action),
                ]),
              ]))
            )),
          ]),
        ]),
      ]),
    ]);
  }
  window.TaskDetailScreen = TaskDetailScreen;

  // =========================================================================
  // TASK DISTRIBUTION (Vazifalarni taqsimlash)
  // =========================================================================
  function AssignScreen({ setRoute, openTask, role }) {
    const [auditId, setAuditId] = useState("AUD-2026-014");
    const audit = D.auditById(auditId) || D.AUDITS[0];
    const auditTasks = D.TASKS.filter(t => t.auditId === audit.id);
    // local assignment + status overrides
    const [assign, setAssign] = useState(() => Object.fromEntries(D.TASKS.map(t => [t.id, t.assignee])));
    const members = (audit.members || []).map(D.userById);

    const tasksHere = D.TASKS.filter(t => t.auditId === audit.id);
    const workload = useMemo(() => {
      const m = {};
      members.forEach(u => { m[u.id] = 0; });
      tasksHere.forEach(t => { const a = assign[t.id]; if (a in m) m[a]++; });
      return m;
    }, [assign, auditId]);
    const maxLoad = Math.max(1, ...Object.values(workload));
    const canAssign = role === "departament" || role === "bolim" || role === "bosh";

    function setTaskAssignee(tid, uid) {
      setAssign(a => ({ ...a, [tid]: uid }));
      window.showToast(D.userById(uid).name + " ga biriktirildi", "success");
    }

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Vazifalarni taqsimlash" }],
        title: "Vazifalarni taqsimlash",
        sub: "Audit guruhi rahbari vazifalarni guruh a’zolari o‘rtasida taqsimlaydi (task.assign / group_lead)",
        actions: [
          h("button", { key: 1, className: "btn btn--primary btn--sm", onClick: () => window.__openCreateTask && window.__openCreateTask() }, [h(I.Plus, { size: 14, key: "i" }), h("span", { key: "t" }, "Yangi vazifa")]),
        ],
      }),

      // audit selector
      h("div", { key: "sel", style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" } }, [
        h("span", { key: "l", style: { fontSize: 13, color: "var(--text-tertiary)" } }, "Audit:"),
        h("select", { key: "s", className: "select", style: { maxWidth: 460 }, value: auditId, onChange: e => setAuditId(e.target.value) },
          D.AUDITS.map(a => h("option", { key: a.id, value: a.id }, a.code + " — " + a.title))),
        h("span", { key: "c", className: "tag tag--ghost", style: { marginLeft: "auto" } }, tasksHere.length + " ta vazifa"),
      ]),

      h("div", { key: "grid", className: "grid", style: { gridTemplateColumns: "minmax(0,1fr) 300px", gap: 16, alignItems: "start" } }, [
        // tasks table
        h("div", { key: "t", className: "tbl-wrap" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
          h("thead", { key: "h" }, h("tr", null, [
            h("th", { key: 1 }, "ID"), h("th", { key: 2 }, "Vazifa"), h("th", { key: 3 }, "Turi"),
            h("th", { key: 4 }, "Ustuvorlik"), h("th", { key: 5 }, "Mas’ul (biriktirish)"), h("th", { key: 6 }, "Holat"), h("th", { key: 7 }, "Muddat"),
          ])),
          h("tbody", { key: "b" }, tasksHere.map(t => h("tr", { key: t.id }, [
            h("td", { key: 1, className: "cell-mono", style: { cursor: "pointer" }, onClick: () => openTask(t.id) }, t.id),
            h("td", { key: 2, style: { cursor: "pointer" }, onClick: () => openTask(t.id) }, h("div", { className: "text-primary font-semi" }, t.title)),
            h("td", { key: 3 }, h("span", { className: "tag tag--outline" }, t.type)),
            h("td", { key: 4 }, h("span", { className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost") }, t.priority)),
            h("td", { key: 5 }, canAssign ? h("select", {
              className: "select select--sm", value: assign[t.id], onClick: e => e.stopPropagation(), onChange: e => setTaskAssignee(t.id, e.target.value),
            }, members.map(u => h("option", { key: u.id, value: u.id }, u.name))) : h("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, [h(Avatar, { key: 1, user: assign[t.id] }), h("span", { key: 2, className: "text-sm" }, D.userById(assign[t.id]).name)])),
            h("td", { key: 6 }, h("span", { className: "tag tag--info" }, D.TASK_STATUS[t.status] ? D.TASK_STATUS[t.status].label : t.status)),
            h("td", { key: 7, className: "tabular cell-sub" }, t.due),
          ]))),
        ]))),

        // workload sidebar
        h("div", { key: "w", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          h("div", { className: "panel", key: "wl" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.BarChart3, { size: 15, key: "i" }), h("span", { key: "t" }, "Ish yuki taqsimoti")])),
            h("div", { className: "panel__body", key: 2, style: { display: "flex", flexDirection: "column", gap: 14 } },
              members.map(u => h("div", { key: u.id }, [
                h("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } }, [
                  h(Avatar, { key: 1, user: u.id }),
                  h("span", { key: 2, style: { flex: 1, fontSize: 13, color: "var(--text-primary)", fontWeight: 550 } }, u.name),
                  u.id === audit.leader ? h("span", { key: 3, className: "tag tag--brand" }, [h(I.Star, { size: 10, key: "i" }), "Rahbar"]) : null,
                  h("span", { key: 4, className: "tabular font-semi", style: { color: "var(--text-primary)" } }, workload[u.id] || 0),
                ]),
                h("div", { key: 2, style: { height: 6, borderRadius: 3, background: "var(--bg-surface-3)", overflow: "hidden" } },
                  h("div", { style: { width: ((workload[u.id] || 0) / maxLoad * 100) + "%", height: "100%", background: u.id === audit.leader ? "var(--brand)" : "var(--status-info-fg)", transition: "width .3s" } })),
              ]))
            ),
          ]),
          h("div", { className: "card card__pad-sm", key: "note", style: { background: "var(--bg-surface-2)", display: "flex", gap: 10, alignItems: "flex-start" } }, [
            h(I.Info, { key: 1, size: 16, style: { color: "var(--brand)", flexShrink: 0, marginTop: 1 } }),
            h("span", { key: 2, style: { fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 } }, "Vazifa biriktirilganda mas’ulga bildirishnoma yuboriladi. Muvozanatli taqsimot KPI samaradorligini oshiradi."),
          ]),
        ]),
      ]),
    ]);
  }
  window.AssignScreen = AssignScreen;
})();
