/* Settings (Sozlamalar) — system settings, custom roles (JSONB),
   KPI rule editor, AI/Ollama, notifications, security & retention (TZ §4.2, §11, §13, §15). */
(function () {
  const { useState } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  const PageHeader = window.PageHeader;

  function Switch({ on, onToggle }) {
    return h("button", { className: "set-switch", "data-on": String(!!on), onClick: onToggle, "aria-pressed": !!on }, h("i", null));
  }

  function SettingRow({ title, desc, on, onToggle }) {
    return h("div", { className: "set-row" }, [
      h("div", { key: 1, className: "set-row__body" }, [
        h("div", { key: 1, className: "set-row__title" }, title),
        desc ? h("div", { key: 2, className: "set-row__desc" }, desc) : null,
      ]),
      h(Switch, { key: 2, on, onToggle }),
    ]);
  }

  function panel(title, icon, body, foot) {
    return h("div", { className: "panel" }, [
      h("div", { className: "panel__h", key: "h" }, h("div", { className: "panel__t" }, [h(icon, { size: 15, key: "i" }), h("span", { key: "t" }, title)])),
      h("div", { className: "panel__body", key: "b", style: { padding: 0 } }, body),
      foot ? h("div", { className: "panel__foot", key: "f", style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, foot) : null,
    ]);
  }

  const SECTIONS = [
    { id: "general",  label: "Umumiy",            icon: I.Settings },
    { id: "roles",    label: "Custom rollar",     icon: I.ShieldCheck },
    { id: "kpi",      label: "KPI qoidalari",     icon: I.Trophy },
    { id: "ai",       label: "AI / Ollama",       icon: I.Sparkles },
    { id: "notif",    label: "Bildirishnomalar",  icon: I.Bell },
    { id: "security", label: "Xavfsizlik & saqlash", icon: I.Lock },
  ];

  function SettingsScreen({ setRoute, role }) {
    const [sec, setSec] = useState("general");
    const [kpi, setKpi] = useState(() => D.KPI_RULES.map(r => ({ ...r })));
    const [toggles, setToggles] = useState({
      twoFA: true, lockout: true, ipAlert: true, rls: true,
      nCritical: true, nReturn: true, nAssign: true, nReport: false, nSync: true,
      aiEnabled: true, aiClosed: true, aiHistory: true,
    });
    const t = (k) => () => setToggles(s => ({ ...s, [k]: !s[k] }));
    const save = () => window.showToast("Sozlamalar saqlandi", "success");

    const customRoles = [
      { name: "Tashqi auditor", code: "ext_auditor", base: "Yetakchi mutaxassis", perms: 12, color: "tag--info" },
      { name: "Read-only kuzatuvchi", code: "observer", base: "—", perms: 6, color: "tag--ghost" },
      { name: "Hisobot menejeri", code: "report_mgr", base: "Bosh mutaxassis", perms: 9, color: "tag--brand" },
    ];

    function body() {
      if (sec === "general") return h("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        panel("Tashkilot ma’lumotlari", I.Building2, h("div", { className: "form-grid", style: { padding: 16 } }, [
          h("div", { key: 1, className: "field span-2" }, [h("label", { className: "field__label" }, "Departament nomi"), h("input", { className: "input", defaultValue: "Axborot xavfsizligi auditi departamenti" })]),
          h("div", { key: 2, className: "field" }, [h("label", { className: "field__label" }, "Interfeys tili"), h("select", { className: "select", defaultValue: "uz" }, [h("option", { key: 1, value: "uz" }, "O‘zbek (lotin)"), h("option", { key: 2, value: "uz-cyrl" }, "O‘zbek (kirill)"), h("option", { key: 3, value: "ru" }, "Rus"), h("option", { key: 4, value: "en" }, "Ingliz")])]),
          h("div", { key: 3, className: "field" }, [h("label", { className: "field__label" }, "Vaqt zonasi"), h("select", { className: "select", defaultValue: "tas" }, [h("option", { key: 1, value: "tas" }, "Asia/Tashkent (UTC+5)"), h("option", { key: 2 }, "UTC")])]),
          h("div", { key: 4, className: "field" }, [h("label", { className: "field__label" }, "Audit kodi formati"), h("input", { className: "input font-mono", defaultValue: "AUD-{YYYY}-{NNN}" })]),
          h("div", { key: 5, className: "field" }, [h("label", { className: "field__label" }, "Sana formati"), h("select", { className: "select" }, [h("option", { key: 1 }, "YYYY-MM-DD"), h("option", { key: 2 }, "DD.MM.YYYY")])]),
        ]), [h("button", { key: 1, className: "btn btn--primary btn--sm", onClick: save }, [h(I.Save, { size: 14, key: "i" }), h("span", { key: "t" }, "Saqlash")])]),
      ]);

      if (sec === "roles") return h("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h("div", { className: "card card__pad-sm", style: { display: "flex", alignItems: "center", gap: 12, background: "var(--bg-surface-2)" } }, [
          h(I.Info, { key: 1, size: 18, style: { color: "var(--brand)", flexShrink: 0 } }),
          h("div", { key: 2, style: { flex: 1, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 } }, "Custom rollar system_settings jadvalidagi custom_roles (JSONB) ustunida saqlanadi. Ruxsat tekshiruvida avval custom_roles, so‘ng PermissionCatalog standartlari qo‘llanadi."),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Yangi custom rol oynasi ochilmoqda", "info") }, [h(I.Plus, { size: 14, key: "i" }), h("span", { key: "t" }, "Custom rol")]),
        ]),
        panel("System rollari (o‘zgarmas)", I.ShieldCheck, h("div", null, D.ROLES.map((r, i, arr) =>
          h("div", { key: r.id, className: "set-row" }, [
            h("div", { key: 1, style: { width: 44, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--brand)" } }, [100, 80, 60, 40, 20][i]),
            h("div", { key: 2, className: "set-row__body" }, [h("div", { className: "set-row__title" }, r.name), h("div", { className: "set-row__desc font-mono" }, r.id)]),
            h("span", { key: 3, className: "tag tag--ghost" }, (r.id === "departament" ? "barcha (*)" : [0, 38, 22, 16, 9][i] + " ruxsat")),
          ])
        ))),
        panel("Custom rollar (custom_roles JSONB)", I.Key, h("div", null, customRoles.map(r =>
          h("div", { key: r.code, className: "set-row" }, [
            h("div", { key: 1, className: "set-row__body" }, [
              h("div", { className: "set-row__title" }, [r.name, h("span", { key: "c", className: "tag " + r.color, style: { marginLeft: 8 } }, r.code)]),
              h("div", { className: "set-row__desc" }, "Asos: " + r.base + " · " + r.perms + " ruxsat"),
            ]),
            h("button", { key: 2, className: "iconbtn", onClick: () => window.showToast(r.name + " tahrirlanmoqda", "info") }, h(I.Edit3, { size: 15 })),
            h("button", { key: 3, className: "iconbtn", onClick: () => window.showToast(r.name + " o‘chirildi", "warning") }, h(I.Trash2, { size: 15 })),
          ])
        ))),
      ]);

      if (sec === "kpi") {
        const setPts = (i, v) => setKpi(k => k.map((r, j) => j === i ? { ...r, points: v } : r));
        return panel("KPI ball qoidalari (KpiRule)", I.Trophy, h("div", null, [
          h("div", { key: "head", className: "set-kpi", style: { background: "var(--bg-surface-2)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)" } }, [
            h("span", { key: 1, style: { flex: 1 } }, "Hodisa"), h("span", { key: 2, className: "set-kpi__pts", style: { textAlign: "center" } }, "Ball"), h("span", { key: 3, style: { width: 88, textAlign: "right" } }, "Holat"),
          ]),
          ...kpi.map((r, i) => h("div", { key: i, className: "set-kpi" }, [
            h("span", { key: 1, style: { flex: 1, fontSize: 13.5, color: "var(--text-primary)" } }, r.event),
            h("div", { key: 2, className: "set-kpi__pts" }, h("input", {
              className: "set-kpi__input", type: "number", value: r.points,
              onChange: e => setPts(i, parseInt(e.target.value, 10) || 0),
              style: { color: r.points > 0 ? "var(--status-success-fg)" : r.points < 0 ? "var(--status-danger-fg)" : "var(--text-tertiary)" },
            })),
            h("span", { key: 3, style: { width: 88, textAlign: "right" } }, h("span", { className: "tag " + (r.points >= 0 ? "tag--success" : "tag--danger") }, r.points >= 0 ? "Mukofot" : "Jarima")),
          ])),
        ]), [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => setKpi(D.KPI_RULES.map(r => ({ ...r }))) }, "Tiklash"),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: save }, [h(I.Save, { size: 14, key: "i" }), h("span", { key: "t" }, "Qoidalarni saqlash")]),
        ]);
      }

      if (sec === "ai") return h("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        panel("Ollama provayder (lokal LLM)", I.Sparkles, h("div", { className: "form-grid", style: { padding: 16 } }, [
          h("div", { key: 1, className: "field" }, [h("label", { className: "field__label" }, "Ollama URL"), h("input", { className: "input font-mono", defaultValue: "http://localhost:11434" })]),
          h("div", { key: 2, className: "field" }, [h("label", { className: "field__label" }, "Model"), h("select", { className: "select", defaultValue: "qwen" }, [h("option", { key: 1, value: "qwen" }, "qwen2.5:14b-instruct"), h("option", { key: 2 }, "llama3.1:8b"), h("option", { key: 3 }, "mistral-nemo:12b")])]),
          h("div", { key: 3, className: "field" }, [h("label", { className: "field__label" }, "Maksimal token (context)"), h("input", { className: "input", type: "number", defaultValue: 8192 })]),
          h("div", { key: 4, className: "field" }, [h("label", { className: "field__label" }, "Temperatura"), h("input", { className: "input", type: "number", step: "0.1", defaultValue: 0.2 })]),
        ]), [h("button", { key: 1, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("Ollama ulanishi: OK (qwen2.5:14b)", "success") }, [h(I.Activity, { size: 14, key: "i" }), h("span", { key: "t" }, "Ulanishni tekshirish")]), h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: save }, "Saqlash")]),
        panel("AI xulq-atvori", I.Brain, h("div", null, [
          h(SettingRow, { key: 1, title: "AI yordamchini yoqish", desc: "Findinglar, hisobotlar va tahlilda AI tavsiyalari.", on: toggles.aiEnabled, onToggle: t("aiEnabled") }),
          h(SettingRow, { key: 2, title: "Yopiq kontur rejimi", desc: "Ma’lumotlar faqat lokal tarmoqda qayta ishlanadi, tashqi API’larga chiqmaydi.", on: toggles.aiClosed, onToggle: t("aiClosed") }),
          h(SettingRow, { key: 3, title: "Sessiyalar tarixini saqlash", desc: "AiAnalysisResult: input, output, model, token, latency.", on: toggles.aiHistory, onToggle: t("aiHistory") }),
        ])),
      ]);

      if (sec === "notif") return h("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        panel("Bell trigger’lari", I.Bell, h("div", null, [
          h(SettingRow, { key: 1, title: "Critical zaiflik aniqlanganda", desc: "Tasdiqlovchilarga email + bell.", on: toggles.nCritical, onToggle: t("nCritical") }),
          h(SettingRow, { key: 2, title: "Topilma qaytarilganda", desc: "Topuvchiga bildirishnoma.", on: toggles.nReturn, onToggle: t("nReturn") }),
          h(SettingRow, { key: 3, title: "Yangi vazifa biriktirilganda", desc: "Mas’ul auditorga.", on: toggles.nAssign, onToggle: t("nAssign") }),
          h(SettingRow, { key: 4, title: "Hisobot tayyor bo‘lganda", desc: "Tegishli foydalanuvchilarga.", on: toggles.nReport, onToggle: t("nReport") }),
          h(SettingRow, { key: 5, title: "EXE agent sinxronlanganda", desc: "Guruh rahbariga.", on: toggles.nSync, onToggle: t("nSync") }),
        ])),
        panel("Email (SMTP)", I.Mail, h("div", { className: "form-grid", style: { padding: 16 } }, [
          h("div", { key: 1, className: "field" }, [h("label", { className: "field__label" }, "SMTP host"), h("input", { className: "input font-mono", defaultValue: "smtp.gov.uz" })]),
          h("div", { key: 2, className: "field" }, [h("label", { className: "field__label" }, "Port"), h("input", { className: "input", type: "number", defaultValue: 587 })]),
          h("div", { key: 3, className: "field" }, [h("label", { className: "field__label" }, "Jo‘natuvchi"), h("input", { className: "input font-mono", defaultValue: "auditor@gov.uz" })]),
          h("div", { key: 4, className: "field" }, [h("label", { className: "field__label" }, "Shifrlash"), h("select", { className: "select" }, [h("option", { key: 1 }, "STARTTLS"), h("option", { key: 2 }, "SSL/TLS")])]),
        ]), [h("button", { key: 1, className: "btn btn--primary btn--sm", onClick: save }, "Saqlash")]),
      ]);

      // security
      return h("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        panel("Autentifikatsiya", I.Fingerprint, h("div", null, [
          h(SettingRow, { key: 1, title: "TOTP 2FA majburiy", desc: "Barcha foydalanuvchilar uchun ikki bosqichli autentifikatsiya.", on: toggles.twoFA, onToggle: t("twoFA") }),
          h(SettingRow, { key: 2, title: "Failed login lockout", desc: "5 noto‘g‘ri urinishdan so‘ng 15 daqiqa bloklash.", on: toggles.lockout, onToggle: t("lockout") }),
          h(SettingRow, { key: 3, title: "Yangi IP/qurilma ogohlantirishi", desc: "Noma’lum qurilmadan kirishda email.", on: toggles.ipAlert, onToggle: t("ipAlert") }),
          h(SettingRow, { key: 4, title: "Row Level Security (RLS)", desc: "DB darajasida multi-tenant izolyatsiya.", on: toggles.rls, onToggle: t("rls") }),
        ])),
        panel("Parol siyosati", I.Lock, h("div", { className: "form-grid", style: { padding: 16 } }, [
          h("div", { key: 1, className: "field" }, [h("label", { className: "field__label" }, "Minimal uzunlik"), h("input", { className: "input", type: "number", defaultValue: 12 })]),
          h("div", { key: 2, className: "field" }, [h("label", { className: "field__label" }, "Hashlash algoritmi"), h("select", { className: "select" }, [h("option", { key: 1 }, "Argon2id (m=65536, t=3, p=4)")])]),
          h("div", { key: 3, className: "field" }, [h("label", { className: "field__label" }, "Parol tarixi (oxirgi)"), h("input", { className: "input", type: "number", defaultValue: 5 })]),
          h("div", { key: 4, className: "field" }, [h("label", { className: "field__label" }, "Yaroqlilik muddati (kun)"), h("input", { className: "input", type: "number", defaultValue: 90 })]),
        ])),
        panel("Audit log saqlash muddati", I.History, h("div", { className: "form-grid", style: { padding: 16 } }, [
          h("div", { key: 1, className: "field" }, [h("label", { className: "field__label" }, "audit_logs (yil)"), h("input", { className: "input", type: "number", defaultValue: 7 })]),
          h("div", { key: 2, className: "field" }, [h("label", { className: "field__label" }, "Bildirishnoma (kun)"), h("input", { className: "input", type: "number", defaultValue: 90 })]),
        ]), [h("button", { key: 1, className: "btn btn--primary btn--sm", onClick: save }, [h(I.Save, { size: 14, key: "i" }), h("span", { key: "t" }, "Saqlash")])]),
      ]);
    }

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "Sozlamalar" }],
        title: "Sozlamalar",
        sub: "Tizim sozlamalari, custom rollar, KPI qoidalari, AI va xavfsizlik",
      }),
      h("div", { key: "grid", className: "grid", style: { gridTemplateColumns: "220px minmax(0,1fr)", gap: 16, alignItems: "start" } }, [
        h("div", { key: "nav", className: "card", style: { padding: 8, position: "sticky", top: 12 } },
          h("div", { className: "set-nav" }, SECTIONS.map(s => h("button", {
            key: s.id, className: "set-nav__item" + (sec === s.id ? " set-nav__item--active" : ""), onClick: () => setSec(s.id),
          }, [h(s.icon, { key: "i", size: 16 }), h("span", { key: "t" }, s.label)])))
        ),
        h("div", { key: "body" }, body()),
      ]),
    ]);
  }

  window.SettingsScreen = SettingsScreen;
})();
