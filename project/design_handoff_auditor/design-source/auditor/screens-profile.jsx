/* Profile screen — current user's profile, KPI, sessions, settings */
(function () {
  const { useState, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  function ProfileScreen({ role, setRoute }) {
    const user = D.USERS.find(u => u.role === role) || D.USERS[0];
    const kpi = D.KPI_USERS.find(k => k.user === user.id) || { audits: 0, tasks: 0, findings: 0, total: 0, delta: 0, sparkline: [] };
    const myTokens = D.TOKENS.filter(t => t.user === user.id);
    const myFindings = D.FINDINGS.filter(f => f.reportedBy === user.id);
    const myTasks = D.TASKS.filter(t => t.assignee === user.id);
    const [tab, setTab] = useState("overview");

    const tabs = [
      { id: "overview",  label: "Umumiy ma'lumot", icon: I.LayoutDashboard },
      { id: "activity",  label: "Faollik",         icon: I.Activity, count: 18 },
      { id: "sessions",  label: "Sessiyalar va qurilmalar", icon: I.Monitor },
      { id: "security",  label: "Xavfsizlik",      icon: I.ShieldCheck },
      { id: "settings",  label: "Sozlamalar",      icon: I.Settings },
    ];

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Mening profilim" }],
        title: "Mening profilim",
        sub: user.title + " · " + user.dept,
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("KPI hisoboti XLSX formatda yuklab olindi", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "KPI eksport")]),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Profilni tahrirlash uchun Sozlamalar tabiga o'ting", "info") }, [h(I.Edit3, { key: "i", size: 14 }), h("span", { key: "t" }, "Profilni tahrirlash")]),
        ],
      }),

      // Hero card
      h("div", { key: "hero", className: "profile-hero" }, [
        h("div", { key: "av", className: "profile-hero__av" },
          h(Avatar, { user, size: "xl" })
        ),
        h("div", { key: "info", className: "profile-hero__info" }, [
          h("div", { key: 1, className: "profile-hero__name" }, [
            h("span", { key: "n" }, user.name),
            h("span", { key: "b", className: "tag tag--success" }, [
              h("span", { className: "dot", style: { width: 6, height: 6 } }),
              "Onlayn",
            ]),
          ]),
          h("div", { key: 2, className: "profile-hero__role" }, user.title),
          h("div", { key: 3, className: "profile-hero__meta" }, [
            h("span", { key: 1 }, [h(I.Building2, { size: 13 }), h("span", null, user.dept)]),
            h("span", { key: 2 }, [h(I.Mail, { size: 13 }), h("span", { className: "font-mono" }, user.id + "@gov.uz")]),
            h("span", { key: 3 }, [h(I.Calendar, { size: 13 }), h("span", null, "Tizimga qo'shilgan: 2023-08-14")]),
            h("span", { key: 4 }, [h(I.History, { size: 13 }), h("span", null, "Oxirgi kirish: bugun 09:42")]),
          ]),
        ]),
        h("div", { key: "kpi", className: "profile-hero__kpi" }, [
          h("div", { key: 1, className: "profile-kpi" }, [
            h("div", { className: "profile-kpi__v tabular" }, kpi.total),
            h("div", { className: "profile-kpi__l" }, "KPI ball"),
            kpi.delta != null ? h("div", { className: "profile-kpi__d" + (kpi.delta < 0 ? " is-neg" : "") }, [
              kpi.delta < 0 ? h(I.TrendingDown, { size: 11 }) : h(I.TrendingUp, { size: 11 }),
              h("span", null, (kpi.delta > 0 ? "+" : "") + kpi.delta + "%"),
            ]) : null,
          ]),
          h("div", { key: 2, className: "profile-kpi" }, [
            h("div", { className: "profile-kpi__v tabular" }, kpi.audits),
            h("div", { className: "profile-kpi__l" }, "Auditlar"),
          ]),
          h("div", { key: 3, className: "profile-kpi" }, [
            h("div", { className: "profile-kpi__v tabular" }, kpi.tasks),
            h("div", { className: "profile-kpi__l" }, "Vazifalar"),
          ]),
          h("div", { key: 4, className: "profile-kpi" }, [
            h("div", { className: "profile-kpi__v tabular" }, kpi.findings),
            h("div", { className: "profile-kpi__l" }, "Findinglar"),
          ]),
        ]),
      ]),

      h(Tabs, { key: "t", tabs, active: tab, onChange: setTab }),

      tab === "overview" ? h(OverviewTab,  { key: "ov", user, kpi, myTasks, myFindings, setRoute }) :
      tab === "activity" ? h(ActivityTab,  { key: "ac", user }) :
      tab === "sessions" ? h(SessionsTab,  { key: "se", user, myTokens }) :
      tab === "security" ? h(SecurityTab,  { key: "sc", user }) :
      tab === "settings" ? h(SettingsTab,  { key: "st", user }) : null,
    ]);
  }
  window.ProfileScreen = ProfileScreen;

  // ---------- Overview tab ----------
  function OverviewTab({ user, kpi, myTasks, myFindings, setRoute }) {
    const myAudits = D.AUDITS.filter(a => a.members && a.members.includes(user.id)).slice(0, 4);

    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 } }, [
      h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [

        // KPI breakdown
        h("div", { key: "kpi", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.BarChart3, { key: "i", size: 15 }), h("span", { key: "t" }, "KPI dinamikasi")]),
            h("div", { key: 2, className: "tag tag--success" }, [h(I.TrendingUp, { size: 11 }), "+" + (kpi.delta || 0) + "% (oxirgi oy)"]),
          ]),
          h("div", { className: "panel__body", key: 2 }, [
            kpi.sparkline && kpi.sparkline.length ? h("div", { key: 0, style: { display: "flex", alignItems: "flex-end", gap: 12, height: 140, padding: "12px 8px", marginBottom: 16, borderBottom: "1px dashed var(--border-color)" } },
              kpi.sparkline.map((v, i) => {
                const max = Math.max(...kpi.sparkline);
                const hp = (v / max) * 100;
                const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun"];
                return h("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } }, [
                  h("div", { key: 1, className: "tabular", style: { fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 } }, v),
                  h("div", { key: 2, style: { width: "100%", height: hp + "%", background: i === kpi.sparkline.length - 1 ? "var(--brand)" : "var(--brand-soft-hover)", borderRadius: "4px 4px 0 0", minHeight: 8 } }),
                  h("div", { key: 3, style: { fontSize: 10, color: "var(--text-tertiary)", letterSpacing: "0.04em" } }, months[i] || "—"),
                ]);
              })
            ) : null,
            h("div", { key: 1, style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 } }, [
              h(KpiBlock, { key: 1, label: "Bajarilgan auditlar", value: kpi.audits, target: 8, color: "var(--brand)" }),
              h(KpiBlock, { key: 2, label: "Vazifalar bajarilishi", value: kpi.tasks, target: 40, color: "var(--status-info-fg)" }),
              h(KpiBlock, { key: 3, label: "Aniqlangan findinglar", value: kpi.findings, target: 30, color: "var(--status-warning-fg)" }),
            ]),
          ]),
        ]),

        // My audits
        h("div", { key: "aud", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.FolderKanban, { key: "i", size: 15 }), h("span", { key: "t" }, "Mening auditlarim"), h("span", { key: "c", className: "count" }, myAudits.length)]),
            h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => setRoute("audits") }, [h("span", { key: "t" }, "Hammasi"), h(I.ChevronRight, { key: "i", size: 12 })]),
          ]),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            myAudits.length === 0
              ? h("div", { className: "empty-state" }, [
                  h(I.FolderKanban, { size: 28, key: 0 }),
                  h("div", { key: 1 }, "Hozircha biriktirilgan audit yo'q"),
                ])
              : myAudits.map((a, i) =>
                h("div", { key: a.id, style: { padding: "12px 16px", borderBottom: i < myAudits.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" } }, [
                  h("div", { key: 1, style: { flex: 1, minWidth: 0 } }, [
                    h("div", { key: 1, className: "cell-title", style: { fontSize: 13, fontWeight: 600, marginBottom: 2 } }, a.title),
                    h("div", { key: 2, className: "cell-sub font-mono", style: { fontSize: 11 } }, a.code + " · " + a.type),
                  ]),
                  h("div", { key: 2, style: { display: "flex", alignItems: "center", gap: 8 } }, [
                    statusTag(a.status),
                    h("span", { key: 1, className: "tabular text-secondary", style: { fontSize: 12, fontWeight: 600, minWidth: 36, textAlign: "right" } }, a.progress + "%"),
                  ]),
                ])
              )
          ),
        ]),
      ]),

      h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [

        // Quick stats
        h("div", { key: "s", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 },
            h("div", { className: "panel__t" }, [h(I.CheckSquare, { key: "i", size: 15 }), h("span", { key: "t" }, "Mening vazifalarim")])
          ),
          h("div", { className: "panel__body", key: 2, style: { padding: "10px 0" } },
            Object.entries({
              new: "Yangi",
              in_progress: "Jarayonda",
              review: "Tekshiruvda",
              done: "Bajarilgan",
              blocked: "Blok",
            }).map(([k, lbl]) => {
              const n = myTasks.filter(t => t.status === k).length;
              const total = myTasks.length || 1;
              const w = (n / total) * 100;
              return h("div", { key: k, style: { display: "flex", alignItems: "center", gap: 10, padding: "6px 16px" } }, [
                h("span", { key: 1, style: { flex: "0 0 100px", fontSize: 12, color: "var(--text-secondary)" } }, lbl),
                h("div", { key: 2, style: { flex: 1, height: 6, background: "var(--bg-surface-3)", borderRadius: 3, overflow: "hidden" } },
                  h("div", { style: { width: w + "%", height: "100%", background: k === "done" ? "var(--status-success-fg)" : k === "blocked" ? "var(--status-danger-fg)" : "var(--brand)" } })
                ),
                h("span", { key: 3, className: "tabular text-primary font-semi", style: { fontSize: 12, minWidth: 22, textAlign: "right" } }, n),
              ]);
            })
          ),
        ]),

        // Badges / achievements
        h("div", { key: "b", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 },
            h("div", { className: "panel__t" }, [h(I.Trophy, { key: "i", size: 15 }), h("span", { key: "t" }, "Yutuqlar va belgilar")])
          ),
          h("div", { className: "panel__body", key: 2 },
            h("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 } }, [
              { icon: I.Zap, title: "Tezkor auditor", sub: "5 ta auditni muddatidan oldin", tone: "warning" },
              { icon: I.ShieldAlert, title: "Critical detector", sub: "3 ta kritik finding topdi", tone: "danger" },
              { icon: I.Sparkles, title: "AI ustasi", sub: "AI tahlilidan 92% foydalanish", tone: "info" },
              { icon: I.Star, title: "Top 3 KPI", sub: "Bo'lim ichida", tone: "success" },
            ].map((b, i) =>
              h("div", { key: i, className: "achievement achievement--" + b.tone }, [
                h(b.icon, { key: 1, size: 18 }),
                h("div", { key: 2, style: { minWidth: 0 } }, [
                  h("div", { key: 1, style: { fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 } }, b.title),
                  h("div", { key: 2, style: { fontSize: 10.5, color: "var(--text-tertiary)", lineHeight: 1.3, marginTop: 2 } }, b.sub),
                ]),
              ])
            ))
          ),
        ]),

        // Last findings
        myFindings.length > 0 ? h("div", { key: "f", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 },
            h("div", { className: "panel__t" }, [h(I.AlertTriangle, { key: "i", size: 15 }), h("span", { key: "t" }, "So'nggi findinglarim"), h("span", { key: "c", className: "count" }, myFindings.length)])
          ),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            myFindings.slice(0, 4).map((f, i) =>
              h("div", { key: f.id, style: { padding: "10px 16px", borderBottom: i < Math.min(myFindings.length, 4) - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" } }, [
                h(window.Sev, { key: 1, level: f.severity }),
                h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                  h("div", { key: 1, style: { fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, f.title),
                  h("div", { key: 2, className: "cell-sub font-mono", style: { fontSize: 10.5 } }, f.id + " · " + f.date),
                ]),
              ])
            )
          ),
        ]) : null,
      ]),
    ]);
  }

  function KpiBlock({ label, value, target, color }) {
    const pct = Math.min(100, Math.round((value / target) * 100));
    return h("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, [
      h("div", { key: 1, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, [
        h("span", { key: 1, className: "cell-sub", style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 } }, label),
        h("span", { key: 2, className: "tabular", style: { fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 } }, value + " / " + target),
      ]),
      h("div", { key: 2, className: "tabular", style: { fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" } }, pct + "%"),
      h("div", { key: 3, style: { height: 6, background: "var(--bg-surface-3)", borderRadius: 3, overflow: "hidden" } },
        h("div", { style: { width: pct + "%", height: "100%", background: color, borderRadius: 3 } })
      ),
    ]);
  }

  // ---------- Activity tab ----------
  function ActivityTab({ user }) {
    const items = [
      { time: "Bugun, 09:42", icon: I.LogIn,        tone: "neutral", title: "Tizimga kirildi",                     sub: "IP 10.20.4.78 · Chrome 124 · Windows 11" },
      { time: "Bugun, 09:48", icon: I.AlertTriangle, tone: "danger",  title: "Yangi finding qo'shildi",            sub: "F-2026-0347 — Telnet (port 23) ochiq" },
      { time: "Bugun, 10:14", icon: I.CheckSquare,  tone: "success", title: "Vazifa yakunlandi",                  sub: "T-115 — AD parol siyosatini tahlil qilish" },
      { time: "Bugun, 11:02", icon: I.Sparkles,     tone: "info",    title: "AI tahlili so'raldi",                sub: "F-2026-0341 uchun remediation tavsiyasi" },
      { time: "Bugun, 12:36", icon: I.Upload,       tone: "neutral", title: "Dalil fayllar yuklandi",             sub: "3 ta skrinshot · 1 PCAP · 4.2 MB" },
      { time: "Kecha, 17:21", icon: I.Send,         tone: "info",    title: "Hisobotni ko'rib chiqishga yubordi", sub: "AUD-2026-013 — Soliq qo'mitasi (Executive)" },
      { time: "Kecha, 14:08", icon: I.FolderKanban, tone: "success", title: "Audit guruhiga qo'shildi",           sub: "AUD-2026-014 — Aloqa va kommunikatsiya vazirligi" },
      { time: "2 kun oldin", icon: I.KeyRound,     tone: "warning", title: "Yangi token qabul qilindi",          sub: "tk_a91x...c47e · Windows 11 · DESKTOP-MS-NB14" },
      { time: "2 kun oldin", icon: I.Edit3,        tone: "neutral", title: "Profil sozlamalari o'zgartirildi",   sub: "Telefon raqami yangilandi" },
      { time: "3 kun oldin", icon: I.LogIn,        tone: "neutral", title: "Tizimga kirildi",                     sub: "IP 10.20.4.78 · Chrome 124 · Windows 11" },
    ];

    return h("div", { className: "panel" }, [
      h("div", { className: "panel__h", key: 1 }, [
        h("div", { className: "panel__t" }, [h(I.Activity, { key: "i", size: 15 }), h("span", { key: "t" }, "Faollik tarixi")]),
        h("div", { key: 2, style: { display: "flex", gap: 6 } }, [
          h(window.FilterButton, { key: 1, kind: "logs", size: "xs" }),
          h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("Faollik tarixi CSV formatda yuklab olindi", "success") }, [h(I.Download, { key: "i", size: 12 }), h("span", { key: "t" }, "Eksport")]),
        ]),
      ]),
        h("div", { className: "panel__body", key: 2, style: { padding: "8px 0" } },
        h("div", { className: "profile-tl" }, items.map((it, i) =>
          h("div", { key: i, className: "profile-tl__row" }, [
            h("span", { key: 0, className: "profile-tl__icon profile-tl__icon--" + it.tone },
              h(it.icon, { size: 13 })
            ),
            h("div", { key: 1, className: "profile-tl__body" }, [
              h("div", { key: 1, style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 } }, [
                h("span", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, it.title),
                h("span", { key: 2, className: "tabular", style: { fontSize: 11, color: "var(--text-tertiary)" } }, it.time),
              ]),
              h("div", { key: 2, className: "cell-sub", style: { fontSize: 11.5, marginTop: 2 } }, it.sub),
            ]),
          ])
        ))
      ),
    ]);
  }

  // ---------- Sessions tab ----------
  function SessionsTab({ user, myTokens }) {
    const sessions = [
      { id: 1, current: true,  device: "Chrome 124 · Windows 11",       location: "Toshkent, O'zbekiston", ip: "10.20.4.78",   last: "Hozir faol",     icon: I.Monitor },
      { id: 2, current: false, device: "Safari 17 · macOS 14",          location: "Toshkent, O'zbekiston", ip: "10.20.4.78",   last: "Kecha, 22:14",   icon: I.Monitor },
      { id: 3, current: false, device: "Auditor iOS · iPhone 15",       location: "Toshkent, O'zbekiston", ip: "10.20.4.142",  last: "3 kun oldin",    icon: I.Smartphone },
      { id: 4, current: false, device: "Chrome 123 · Ubuntu 22.04",     location: "Samarqand, O'zbekiston", ip: "10.30.1.18",   last: "12 kun oldin",   icon: I.Monitor },
    ];

    return h("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [

      // Active sessions
      h("div", { key: "s", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, [
          h("div", { className: "panel__t" }, [h(I.Monitor, { key: "i", size: 15 }), h("span", { key: "t" }, "Aktiv sessiyalar")]),
          h("button", { key: 2, className: "btn btn--soft btn--xs", onClick: async () => {
            const ok = await window.confirmAction({
              title: "Boshqa sessiyalardan chiqish",
              body: "Joriy sessiyani saqlab, qolgan barcha qurilmalardan chiqishni xohlaysizmi?",
              confirmLabel: "Chiqish",
              danger: true,
            });
            if (ok) window.showToast("3 ta boshqa sessiyadan chiqildi", "warning");
          } }, [h(I.LogOut, { key: "i", size: 12 }), h("span", { key: "t" }, "Boshqa qurilmalardan chiqish")]),
        ]),
        h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
          sessions.map((s, i) =>
            h("div", { key: s.id, style: { padding: "14px 16px", borderBottom: i < sessions.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 14 } }, [
              h("div", { key: 1, style: { width: 36, height: 36, borderRadius: 8, background: s.current ? "var(--brand-soft)" : "var(--bg-surface-2)", display: "grid", placeItems: "center", color: s.current ? "var(--brand)" : "var(--text-secondary)" } },
                h(s.icon, { size: 18 })
              ),
              h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                h("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 8 } }, [
                  h("span", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, s.device),
                  s.current ? h("span", { key: 2, className: "tag tag--success" }, [h("span", { className: "dot", style: { width: 6, height: 6 } }), "Joriy sessiya"]) : null,
                ]),
                h("div", { key: 2, className: "cell-sub", style: { fontSize: 11.5, marginTop: 2 } }, s.location + " · " + s.ip + " · " + s.last),
              ]),
              !s.current ? h("button", { key: 3, className: "btn btn--ghost btn--xs btn--icon", title: "Sessiyani tugatish" }, h(I.X, { size: 14 })) : null,
            ])
          )
        ),
      ]),

      // My audit tokens
      h("div", { key: "t", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, [
          h("div", { className: "panel__t" }, [h(I.KeyRound, { key: "i", size: 15 }), h("span", { key: "t" }, "Mening audit tokenlarim"), h("span", { key: "c", className: "count" }, myTokens.length)]),
        ]),
        h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
          myTokens.length === 0
            ? h("div", { className: "empty-state" }, [
                h(I.KeyRound, { size: 28, key: 0 }),
                h("div", { key: 1 }, "Sizga biriktirilgan audit tokenlari yo'q"),
              ])
            : myTokens.map((t, i) =>
              h("div", { key: t.id, style: { padding: "12px 16px", borderBottom: i < myTokens.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 14 } }, [
                h("div", { key: 0, style: { width: 32, height: 32, borderRadius: 8, background: "var(--brand-soft)", display: "grid", placeItems: "center", color: "var(--brand)" } },
                  h(I.KeyRound, { size: 15 })
                ),
                h("div", { key: 1, style: { flex: 1, minWidth: 0 } }, [
                  h("div", { key: 1, className: "font-mono", style: { fontSize: 12, fontWeight: 600, color: "var(--text-primary)" } }, t.id),
                  h("div", { key: 2, className: "cell-sub", style: { fontSize: 11 } }, t.audit + " · " + t.hostname + " · " + t.os),
                ]),
                h("span", { key: 2, className: "tag " + (t.status === "active" ? "tag--success" : t.status === "expired" ? "tag--outline" : "tag--danger") }, t.status),
              ])
            )
        ),
      ]),
    ]);
  }

  // ---------- Security tab ----------
  function SecurityTab({ user }) {
    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 } }, [

      // Password
      h("div", { key: "p", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 },
          h("div", { className: "panel__t" }, [h(I.Lock, { key: "i", size: 15 }), h("span", { key: "t" }, "Parol")])
        ),
        h("div", { className: "panel__body", key: 2 }, [
          h("div", { key: 1, className: "form-grid" }, [
            h("div", { className: "field span-2", key: 1 }, [
              h("label", { className: "field__label" }, "Joriy parol"),
              h("input", { className: "input", type: "password", placeholder: "••••••••••" }),
            ]),
            h("div", { className: "field", key: 2 }, [
              h("label", { className: "field__label" }, "Yangi parol"),
              h("input", { className: "input", type: "password" }),
            ]),
            h("div", { className: "field", key: 3 }, [
              h("label", { className: "field__label" }, "Tasdiqlash"),
              h("input", { className: "input", type: "password" }),
            ]),
          ]),
          h("div", { key: 2, className: "cell-sub", style: { fontSize: 11.5, marginTop: 12, marginBottom: 12 } },
            "Oxirgi marta o'zgartirilgan: 47 kun oldin · Kelgusi muddat: 43 kun"
          ),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Parol muvaffaqiyatli yangilandi", "success") }, [h(I.Check, { key: "i", size: 14 }), h("span", { key: "t" }, "Parolni yangilash")]),
        ]),
      ]),

      // 2FA
      h("div", { key: "f", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 }, [
          h("div", { className: "panel__t" }, [h(I.ShieldCheck, { key: "i", size: 15 }), h("span", { key: "t" }, "Ikki bosqichli autentifikatsiya")]),
          h("span", { key: 2, className: "tag tag--success" }, [h(I.Check, { size: 11 }), "Yoqilgan"]),
        ]),
        h("div", { className: "panel__body", key: 2 }, [
          h(SecurityRow, { key: 1, icon: I.Smartphone, title: "Autentifikator ilovasi", sub: "Google Authenticator · ulangan", active: true }),
          h(SecurityRow, { key: 2, icon: I.Mail,       title: "Email kodi",             sub: user.id + "@gov.uz",                 active: true }),
          h(SecurityRow, { key: 3, icon: I.Key,        title: "Zaxira kodlari",         sub: "8 ta zaxira kod qoldi",             active: true }),
          h(SecurityRow, { key: 4, icon: I.Fingerprint, title: "WebAuthn / qurilma kaliti", sub: "Yoqilmagan", active: false }),
        ]),
      ]),

      // Access logs warning
      h("div", { key: "a", className: "panel", style: { gridColumn: "span 2" } }, [
        h("div", { className: "panel__h", key: 1 }, [
          h("div", { className: "panel__t" }, [h(I.ShieldAlert, { key: "i", size: 15 }), h("span", { key: "t" }, "Xavfsizlik signal va alarmlar")]),
        ]),
        h("div", { className: "panel__body", key: 2, style: { padding: 0 } }, [
          h(AlertRow, { key: 1, tone: "warning", title: "Notanish IP'dan kirish urinishi", sub: "192.168.42.7 · 4 kun oldin · bloklandi" }),
          h(AlertRow, { key: 2, tone: "info",    title: "Yangi qurilma ro'yxatdan o'tdi", sub: "Auditor iOS · iPhone 15 · 3 kun oldin · tasdiqlangan" }),
          h(AlertRow, { key: 3, tone: "success", title: "Parol siyosati talablariga javob beradi", sub: "16 belgi · raqam + maxsus belgi · majburiy yangilash 90 kun" }),
        ]),
      ]),
    ]);
  }

  function SecurityRow({ icon, title, sub, active }) {
    return h("div", { className: "sec-row" }, [
      h("div", { key: 1, className: "sec-row__icon" + (active ? " is-on" : "") },
        h(icon, { size: 16 })
      ),
      h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
        h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, title),
        h("div", { key: 2, className: "cell-sub", style: { fontSize: 11.5 } }, sub),
      ]),
      h("label", { key: 3, className: "switch" }, [
        h("input", { type: "checkbox", defaultChecked: active }),
        h("span", { className: "switch__track" }, h("span", { className: "switch__thumb" })),
      ]),
    ]);
  }

  function AlertRow({ tone, title, sub }) {
    return h("div", { style: { padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 } }, [
      h("span", { key: 0, className: "notif-item__icon notif-item__icon--" + tone, style: { width: 26, height: 26, borderRadius: 8 } },
        h(tone === "warning" ? I.AlertTriangle : tone === "success" ? I.ShieldCheck : I.Info || I.Bell, { size: 13 })
      ),
      h("div", { key: 1, style: { flex: 1, minWidth: 0 } }, [
        h("div", { key: 1, style: { fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" } }, title),
        h("div", { key: 2, className: "cell-sub", style: { fontSize: 11 } }, sub),
      ]),
    ]);
  }

  // ---------- Settings tab ----------
  function SettingsTab({ user }) {
    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 } }, [

      // Personal info
      h("div", { key: "p", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 },
          h("div", { className: "panel__t" }, [h(I.User, { key: "i", size: 15 }), h("span", { key: "t" }, "Shaxsiy ma'lumotlar")])
        ),
        h("div", { className: "panel__body", key: 2 },
          h("div", { className: "form-grid" }, [
            h("div", { className: "field", key: 1 }, [
              h("label", { className: "field__label" }, "Ism"),
              h("input", { className: "input", defaultValue: user.name.split(" ")[0] }),
            ]),
            h("div", { className: "field", key: 2 }, [
              h("label", { className: "field__label" }, "Familiya"),
              h("input", { className: "input", defaultValue: user.name.split(" ")[1] || "" }),
            ]),
            h("div", { className: "field span-2", key: 3 }, [
              h("label", { className: "field__label" }, "Lavozim"),
              h("input", { className: "input", defaultValue: user.title, disabled: true }),
              h("label", { className: "field__hint" }, "Lavozimni faqat admin o'zgartira oladi"),
            ]),
            h("div", { className: "field", key: 4 }, [
              h("label", { className: "field__label" }, "Telefon"),
              h("input", { className: "input", defaultValue: "+998 90 123-45-67" }),
            ]),
            h("div", { className: "field", key: 5 }, [
              h("label", { className: "field__label" }, "Ish telefoni"),
              h("input", { className: "input", defaultValue: "+998 71 200-12-34 (1142)" }),
            ]),
          ])
        ),
      ]),

      // Notifications
      h("div", { key: "n", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 },
          h("div", { className: "panel__t" }, [h(I.Bell, { key: "i", size: 15 }), h("span", { key: "t" }, "Bildirishnoma sozlamalari")])
        ),
        h("div", { className: "panel__body", key: 2 }, [
          h(SecurityRow, { key: 1, icon: I.AlertTriangle, title: "Yangi critical/high finding", sub: "Web + email + Telegram", active: true }),
          h(SecurityRow, { key: 2, icon: I.CheckSquare,   title: "Vazifa muddati yaqinlashishi", sub: "Web + email (1 kun oldin)", active: true }),
          h(SecurityRow, { key: 3, icon: I.UserCheck,     title: "Audit guruhiga qo'shilish",    sub: "Faqat web",                 active: true }),
          h(SecurityRow, { key: 4, icon: I.FileText,      title: "Hisobot tayyor",                sub: "Email",                     active: false }),
          h(SecurityRow, { key: 5, icon: I.Refresh,       title: "EXE agent sinxronlash",        sub: "Faqat xato bo'lganda",       active: true }),
        ]),
      ]),

      // Language + theme + appearance
      h("div", { key: "l", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 },
          h("div", { className: "panel__t" }, [h(I.Globe, { key: "i", size: 15 }), h("span", { key: "t" }, "Til va hudud")])
        ),
        h("div", { className: "panel__body", key: 2 },
          h("div", { className: "form-grid" }, [
            h("div", { className: "field", key: 1 }, [
              h("label", { className: "field__label" }, "Interfeys tili"),
              h("select", { className: "select", defaultValue: "uz" }, [
                h("option", { key: 1, value: "uz" }, "O'zbek (lotin)"),
                h("option", { key: 2, value: "uz-cyrl" }, "O'zbek (kirill)"),
                h("option", { key: 3, value: "ru" }, "Rus"),
                h("option", { key: 4, value: "en" }, "English"),
              ]),
            ]),
            h("div", { className: "field", key: 2 }, [
              h("label", { className: "field__label" }, "Vaqt zonasi"),
              h("select", { className: "select", defaultValue: "tashkent" }, [
                h("option", { key: 1, value: "tashkent" }, "Asia/Tashkent (UTC+5)"),
                h("option", { key: 2, value: "samarkand" }, "Asia/Samarkand (UTC+5)"),
              ]),
            ]),
            h("div", { className: "field span-2", key: 3 }, [
              h("label", { className: "field__label" }, "Sana formati"),
              h("div", { style: { display: "flex", gap: 6 } }, ["YYYY-MM-DD", "DD.MM.YYYY", "DD/MM/YYYY"].map((f, i) =>
                h("label", { key: f, style: { flex: 1, display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid " + (i === 0 ? "var(--brand)" : "var(--border-color)"), background: i === 0 ? "var(--brand-soft)" : "var(--bg-surface)", borderRadius: 6, cursor: "pointer" } }, [
                  h("input", { type: "radio", className: "radio", name: "df", defaultChecked: i === 0 }),
                  h("span", { className: "font-mono", style: { fontSize: 12 } }, f),
                ])
              )),
            ]),
          ])
        ),
      ]),

      // Danger zone
      h("div", { key: "d", className: "panel" }, [
        h("div", { className: "panel__h", key: 1 },
          h("div", { className: "panel__t", style: { color: "var(--status-danger-fg)" } }, [h(I.ShieldAlert, { key: "i", size: 15 }), h("span", { key: "t" }, "Xavf zonasi")])
        ),
        h("div", { className: "panel__body", key: 2 }, [
          h("div", { key: 1, style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 12, border: "1px solid var(--border-color)", borderRadius: 8, marginBottom: 10 } }, [
            h("div", { key: 1 }, [
              h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, "Barcha sessiyalardan chiqish"),
              h("div", { key: 2, className: "cell-sub", style: { fontSize: 11.5 } }, "Joriy sessiyani saqlab, qolgan barcha qurilmalardan chiqish"),
            ]),
            h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: async () => {
              const ok = await window.confirmAction({
                title: "Boshqa sessiyalardan chiqish",
                body: "Joriy sessiyani saqlab, qolgan barcha qurilmalardan chiqishni xohlaysizmi?",
                confirmLabel: "Chiqish",
                danger: true,
              });
              if (ok) window.showToast("3 ta boshqa sessiyadan chiqildi", "warning");
            } }, "Chiqish"),
          ]),
          h("div", { key: 2, style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 12, border: "1px solid color-mix(in srgb, var(--status-danger-fg) 30%, transparent)", borderRadius: 8, background: "color-mix(in srgb, var(--status-danger-fg) 6%, transparent)" } }, [
            h("div", { key: 1 }, [
              h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--status-danger-fg)" } }, "Hisobni o'chirishni so'rash"),
              h("div", { key: 2, className: "cell-sub", style: { fontSize: 11.5 } }, "So'rov departament rahbariga yuboriladi"),
            ]),
            h("button", { key: 2, className: "btn btn--sm", style: { background: "var(--status-danger-bg)", color: "var(--status-danger-fg)", border: "1px solid color-mix(in srgb, var(--status-danger-fg) 30%, transparent)" } }, "So'rov yuborish"),
          ]),
        ]),
      ]),
    ]);
  }

})();
