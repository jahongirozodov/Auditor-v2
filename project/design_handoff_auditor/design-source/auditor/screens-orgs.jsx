/* Organizations (Tashkilotlar) — audit-object registry + full detail page
   (org info, its audits, device inventory, contacts, findings summary). TZ §5.2. */
(function () {
  const { useState } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  const PageHeader = window.PageHeader;
  const Avatar = window.Avatar;
  const statusTag = window.statusTag;
  const Sev = window.Sev;

  function riskTag(level) {
    const r = D.ORG_RISK[level] || D.ORG_RISK.low;
    return h("span", { className: "tag " + r.tag }, r.label);
  }
  function initials(name) {
    return name.replace(/[“”"]/g, "").split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }
  function orgFindings(orgId) {
    return D.AUDITS.filter(a => a.org === orgId).reduce((m, a) => {
      m.critical += a.findings.critical; m.high += a.findings.high; m.medium += a.findings.medium; m.low += a.findings.low;
      return m;
    }, { critical: 0, high: 0, medium: 0, low: 0 });
  }

  // =========================================================================
  // LIST
  // =========================================================================
  function OrgsScreen({ setRoute, openOrg }) {
    const orgs = D.ORGS;
    const totalAudits = orgs.reduce((s, o) => s + o.audits, 0);
    const highRisk = orgs.filter(o => (D.orgDetail(o.id).risk) === "high").length;
    const totalDevices = orgs.reduce((s, o) => s + (D.orgDetail(o.id).devices || []).length, 0);

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Tashkilotlar" }],
        title: "Tashkilotlar",
        sub: "Audit obyektlari reyestri — kontaktlar, qurilma inventari va audit tarixi",
        actions: [
          h(window.FilterButton, { key: 1, kind: "audits" }),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Yangi tashkilot qo‘shish oynasi ochilmoqda", "info") }, [h(I.Plus, { size: 14, key: "i" }), h("span", { key: "t" }, "Tashkilot qo‘shish")]),
        ],
      }),

      h("div", { key: "stats", className: "grid", style: { gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 } }, [
        [I.Building2, "Tashkilotlar", orgs.length, "audit obyekti"],
        [I.FolderKanban, "Jami auditlar", totalAudits, "barcha davrlar"],
        [I.ShieldAlert, "Yuqori xavfli", highRisk, "diqqat talab"],
        [I.Server, "Inventardagi qurilmalar", totalDevices, "kuzatuvda"],
      ].map(([Ic, label, val, meta], i) => h(window.Stat, { key: i, icon: Ic, label, value: val, meta }))),

      h("div", { key: "t", className: "tbl-wrap" }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
        h("thead", { key: "h" }, h("tr", null, [
          h("th", { key: 1 }, "Tashkilot"), h("th", { key: 2 }, "STIR"), h("th", { key: 3 }, "Soha"),
          h("th", { key: 4 }, "Hudud"), h("th", { key: 5 }, "Xavf darajasi"), h("th", { key: 6 }, "Qurilmalar"),
          h("th", { key: 7 }, "Auditlar"), h("th", { key: 8, className: "cell-actions" }, ""),
        ])),
        h("tbody", { key: "b" }, orgs.map(o => {
          const det = D.orgDetail(o.id);
          return h("tr", { key: o.id, onClick: () => openOrg(o.id), style: { cursor: "pointer" } }, [
            h("td", { key: 1 }, h("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, [
              h("div", { key: 1, className: "org-card__logo", style: { width: 34, height: 34, fontSize: 13 } }, initials(o.name)),
              h("div", { key: 2, style: { minWidth: 0 } }, [
                h("div", { key: 1, className: "text-primary font-semi" }, o.name),
                h("div", { key: 2, className: "cell-sub" }, o.contact),
              ]),
            ])),
            h("td", { key: 2, className: "cell-mono" }, o.stir),
            h("td", { key: 3 }, h("span", { className: "tag tag--outline" }, o.sector)),
            h("td", { key: 4, className: "cell-sub" }, det.region || "—"),
            h("td", { key: 5 }, riskTag(det.risk || "low")),
            h("td", { key: 6, className: "tabular" }, (det.devices || []).length),
            h("td", { key: 7, className: "tabular text-primary font-semi" }, o.audits),
            h("td", { key: 8, className: "cell-actions" }, h(I.ChevronRight, { size: 16, style: { color: "var(--text-tertiary)" } })),
          ]);
        })),
      ]))),
    ]);
  }
  window.OrgsScreen = OrgsScreen;

  // =========================================================================
  // DETAIL PAGE
  // =========================================================================
  function OrgDetailScreen({ orgId, setRoute, openAudit }) {
    const o = D.orgById(orgId);
    const det = D.orgDetail(orgId);
    const audits = D.AUDITS.filter(a => a.org === orgId);
    const f = orgFindings(orgId);
    const totalFindings = f.critical + f.high + f.medium + f.low;
    const activeAudits = audits.filter(a => ["in_progress", "review", "planning", "returned"].includes(a.status)).length;
    const devices = det.devices || [];

    const sevRow = (label, n, cls, color) => h("div", { key: label, style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0" } }, [
      h("span", { key: 1, style: { width: 10, height: 10, borderRadius: 3, background: color } }),
      h("span", { key: 2, style: { flex: 1, fontSize: 13, color: "var(--text-secondary)" } }, label),
      h("span", { key: 3, className: "tabular font-semi", style: { color: "var(--text-primary)" } }, n),
    ]);

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [
          { label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") },
          { label: "Tashkilotlar", onClick: () => setRoute("orgs") },
          { label: o.name },
        ],
        title: h("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, [
          h("div", { key: 1, className: "org-card__logo", style: { width: 46, height: 46, fontSize: 17 } }, initials(o.name)),
          h("span", { key: 2 }, o.name),
        ]),
        sub: h("span", { style: { display: "inline-flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, [
          h("span", { key: 1, className: "font-mono", style: { color: "var(--text-tertiary)" } }, "STIR " + o.stir),
          h("span", { key: 2 }, "·"), h("span", { key: 3 }, o.sector),
          h("span", { key: 4 }, "·"), h("span", { key: 5 }, det.region || "—"),
          h("span", { key: 6 }, "·"), riskTag(det.risk || "low"),
        ]),
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => setRoute("orgs") }, [h(I.ChevronLeft, { size: 14, key: "i" }), h("span", { key: "t" }, "Orqaga")]),
          h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("Tashkilot ma’lumotlari tahrirlanmoqda", "info") }, [h(I.Edit3, { size: 14, key: "i" }), h("span", { key: "t" }, "Tahrir")]),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => { setRoute("audits"); } }, [h(I.Plus, { size: 14, key: "i" }), h("span", { key: "t" }, "Yangi audit")]),
        ],
      }),

      // stat tiles
      h("div", { key: "stats", className: "grid", style: { gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 } }, [
        [I.FolderKanban, "Jami auditlar", o.audits, "barcha davrlar"],
        [I.Activity, "Faol auditlar", activeAudits, "hozir jarayonda"],
        [I.Server, "Qurilmalar", devices.length, "inventarda"],
        [I.AlertTriangle, "Topilmalar", totalFindings, f.critical + " critical"],
      ].map(([Ic, l, v, m], i) => h(window.Stat, { key: i, icon: Ic, label: l, value: v, meta: m })),
      ),

      h("div", { key: "grid", className: "grid", style: { gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: 16, alignItems: "start" } }, [
        // LEFT
        h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          // info
          h("div", { key: "info", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Building2, { size: 15, key: "i" }), h("span", { key: "t" }, "Tashkilot ma’lumotlari")])),
            h("div", { className: "panel__body", key: 2 }, h("div", { className: "grid", style: { gridTemplateColumns: "repeat(2,1fr)", gap: 14 } },
              [
                ["Soha", o.sector], ["Hudud", det.region || "—"], ["Manzil", det.address || "—"],
                ["Mas’ul auditor", det.head || "—"], ["Aloqa", o.contact], ["Hamkorlikdan beri", det.since || "—"],
              ].map(([k, v]) => h("div", { key: k, className: "field" }, [
                h("span", { key: 1, className: "field__label", style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)" } }, k),
                h("div", { key: 2, style: { fontSize: 13.5, color: "var(--text-primary)" } }, v),
              ]))
            )),
          ]),

          // audits belonging to org
          h("div", { key: "aud", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, [
              h("div", { className: "panel__t" }, [h(I.FolderKanban, { size: 15, key: "i" }), h("span", { key: "t" }, "Tashkilot auditlari")]),
              h("span", { key: 2, className: "tag tag--ghost tabular" }, audits.length),
            ]),
            h("div", { className: "panel__body panel__body--flush", key: 2 }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
              h("thead", { key: "h" }, h("tr", null, [
                h("th", { key: 1 }, "Kod"), h("th", { key: 2 }, "Audit"), h("th", { key: 3 }, "Turi"),
                h("th", { key: 4 }, "Holat"), h("th", { key: 5 }, "Progress"), h("th", { key: 6 }, "Critical"),
              ])),
              h("tbody", { key: "b" }, audits.map(a => h("tr", { key: a.id, style: { cursor: "pointer" }, onClick: () => openAudit(a.id) }, [
                h("td", { key: 1, className: "cell-mono" }, a.code),
                h("td", { key: 2 }, h("div", { className: "text-primary font-semi" }, a.title)),
                h("td", { key: 3 }, h("span", { className: "tag tag--outline" }, a.type)),
                h("td", { key: 4 }, statusTag(a.status)),
                h("td", { key: 5 }, h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, [
                  h("div", { key: 1, style: { width: 60, height: 5, borderRadius: 3, background: "var(--bg-surface-3)", overflow: "hidden" } }, h("div", { style: { width: a.progress + "%", height: "100%", background: "var(--brand)" } })),
                  h("span", { key: 2, className: "tabular cell-sub" }, a.progress + "%"),
                ])),
                h("td", { key: 6 }, a.findings.critical ? h("span", { className: "sev sev--critical" }, a.findings.critical) : h("span", { className: "cell-sub" }, "—")),
              ]))),
            ]))),
          ]),

          // device inventory
          h("div", { key: "dev", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, [
              h("div", { className: "panel__t" }, [h(I.Server, { size: 15, key: "i" }), h("span", { key: "t" }, "Qurilma inventari")]),
              h("span", { key: 2, className: "tag tag--ghost tabular" }, devices.length),
            ]),
            h("div", { className: "panel__body panel__body--flush", key: 2 }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
              h("thead", { key: "h" }, h("tr", null, [
                h("th", { key: 1 }, "Qurilma"), h("th", { key: 2 }, "Turi"), h("th", { key: 3 }, "Vendor / OS"), h("th", { key: 4 }, "IP"), h("th", { key: 5 }, "Kritiklik"),
              ])),
              h("tbody", { key: "b" }, devices.map((d, i) => h("tr", { key: i }, [
                h("td", { key: 1, className: "font-mono", style: { fontSize: 12 } }, d.name),
                h("td", { key: 2 }, h("span", { className: "tag tag--outline" }, d.kind)),
                h("td", { key: 3, className: "cell-sub" }, d.vendor),
                h("td", { key: 4, className: "font-mono", style: { fontSize: 12 } }, d.ip),
                h("td", { key: 5 }, h("span", { className: "tag " + (d.crit === "Kritik" ? "tag--danger" : d.crit === "Yuqori" ? "tag--warning" : "tag--ghost") }, d.crit)),
              ]))),
            ]))),
          ]),
        ]),

        // RIGHT
        h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          // findings summary
          h("div", { key: "fnd", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.AlertTriangle, { size: 15, key: "i" }), h("span", { key: "t" }, "Topilmalar profili")])),
            h("div", { className: "panel__body", key: 2 }, [
              h("div", { key: "tot", style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 } }, [
                h("span", { key: 1, style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "var(--text-primary)" } }, totalFindings),
                h("span", { key: 2, className: "cell-sub" }, "jami topilma"),
              ]),
              // stacked bar
              totalFindings ? h("div", { key: "bar", style: { display: "flex", height: 8, borderRadius: 4, overflow: "hidden", margin: "8px 0 6px" } }, [
                ["critical", f.critical, "var(--status-danger-fg)"], ["high", f.high, "var(--status-warning-fg)"],
                ["medium", f.medium, "var(--status-info-fg)"], ["low", f.low, "var(--status-success-fg)"],
              ].map(([k, n, c]) => n ? h("div", { key: k, style: { width: (n / totalFindings * 100) + "%", background: c } }) : null)) : null,
              h("div", { key: "rows" }, [
                sevRow("Critical", f.critical, "", "var(--status-danger-fg)"),
                sevRow("High", f.high, "", "var(--status-warning-fg)"),
                sevRow("Medium", f.medium, "", "var(--status-info-fg)"),
                sevRow("Low", f.low, "", "var(--status-success-fg)"),
              ]),
            ]),
          ]),

          // contacts
          h("div", { key: "ct", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Users, { size: 15, key: "i" }), h("span", { key: "t" }, "Kontaktlar")])),
            h("div", { className: "panel__body panel__body--flush", key: 2 },
              (det.contacts || []).map((c, i, arr) => h("div", { key: i, className: "lrow", style: { border: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", borderRadius: 0 } }, [
                h("div", { key: 1, className: "org-card__logo", style: { width: 34, height: 34, fontSize: 12, background: "var(--bg-surface-2)", color: "var(--text-secondary)" } }, initials(c.name)),
                h("div", { key: 2, className: "lrow__body" }, [
                  h("div", { key: 1, className: "lrow__title" }, [c.name, h("span", { key: "r", className: "tag tag--ghost", style: { marginLeft: 8 } }, c.role)]),
                  h("div", { key: 2, className: "lrow__sub font-mono" }, c.email + " · " + c.phone),
                ]),
                h(I.Mail, { key: 3, size: 16, style: { color: "var(--text-tertiary)" } }),
              ]))
            ),
          ]),
        ]),
      ]),
    ]);
  }
  window.OrgDetailScreen = OrgDetailScreen;
})();
