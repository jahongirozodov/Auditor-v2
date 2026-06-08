/* Scanner/config/traffic import + AI tahlil/report builder + KPI dashboard. */
(function () {
  const { useState, useMemo, useEffect, useRef, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // SCANNER / CONFIG / TRAFFIC import + analysis
  // =========================================================================
  function ScannerScreen({ setRoute, role, showAI, initialTab }) {
    const [tab, setTab] = useState(initialTab || "scanner");
    const tabs = [
      { id: "scanner",  label: "Skaner natijalari", icon: I.Bug },
      { id: "config",   label: "Konfiguratsiya",    icon: I.Server },
      { id: "traffic",  label: "Trafik tahlili",    icon: I.Activity },
    ];
    const META = {
      scanner: { title: "Skaner importi",        crumb: "Skaner importi", sub: "Nessus / Nmap / OpenVAS / Burp / ZAP natijalarini yagona finding modeliga normalizatsiya qiling." },
      config:  { title: "Konfiguratsiya tahlili", crumb: "Konfiguratsiya", sub: "Cisco / Linux / Nginx / Apache / MikroTik konfiguratsiyalarida xavfsizlik bo‘shliqlarini avtomatik aniqlang." },
      traffic: { title: "Trafik tahlili",         crumb: "Trafik tahlili", sub: "PCAP / Wireshark / Suricata / Zeek fayllarini paket darajasida tahlil qilib, anomaliyalarni aniqlang." },
    };
    const meta = META[tab] || META.scanner;

    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: meta.crumb }],
        title: meta.title,
        sub: meta.sub,
        actions: [
          h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("Import tarixi oynasi ochilmoqda...", "info") }, [h(I.History, { key: "i", size: 14 }), h("span", { key: "t" }, "Tarix")]),
          h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info") }, [h(I.Upload, { key: "i", size: 14 }), h("span", { key: "t" }, "Fayl yuklash")]),
        ],
      }),

      h(Tabs, { key: "t", tabs, active: tab, onChange: setTab }),

      tab === "scanner" ? h(ScannerImport, { showAI }) :
      tab === "config" ? h(ConfigAnalysis, { showAI }) :
      h(TrafficAnalysis, { showAI }),
    ]);
  }
  window.ScannerScreen = ScannerScreen;

  function ScannerImport({ showAI }) {
    const formats = [
      { name: "Nessus",     desc: ".nessus, .csv",  count: 4, icon: I.Bug, color: "warning" },
      { name: "OpenVAS",    desc: ".xml, .csv",     count: 2, icon: I.Bug, color: "warning" },
      { name: "Nmap",       desc: ".xml, .gnmap",   count: 6, icon: I.Network, color: "info" },
      { name: "OWASP ZAP",  desc: ".json, .html",   count: 3, icon: I.Globe, color: "info" },
      { name: "Burp Suite", desc: ".xml, burp",     count: 2, icon: I.Globe, color: "info" },
      { name: "Universal",  desc: ".csv, .xlsx, .json, .txt", count: 0, icon: I.Layers, color: "ghost" },
    ];

    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 } }, [

      // LEFT: drop zone + history
      h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        // Drop zone
        h("div", { key: "drop", className: "card", style: { padding: 24, textAlign: "center", border: "1.5px dashed var(--border-strong)", background: "var(--bg-surface-2)" } }, [
          h("div", { key: 1, style: { width: 56, height: 56, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--brand-soft)", color: "var(--brand)", borderRadius: 12 } }, h(I.Upload, { key: "i-upload", size: 24 })),
          h("h3", { key: 2, style: { fontSize: 18, marginBottom: 4 } }, "Skaner natijalarini yuklash"),
          h("p", { key: 3, className: "text-sm text-muted", style: { marginBottom: 14 } }, "Drag & drop yoki tanlang. Qo‘llab-quvvatlanadigan formatlar: .nessus, .xml, .json, .csv, .txt, .xlsx (≤ 256 MB)."),
          h("div", { key: 4, style: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" } }, [
            h("button", { key: 1, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info") }, [h(I.Upload, { key: "i", size: 14 }), h("span", { key: "t" }, "Faylni tanlash")]),
            h("button", { key: 2, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("URL kiritish oynasi ochilmoqda...", "info") }, [h(I.Link, { key: "i", size: 14 }), h("span", { key: "t" }, "URL'dan yuklash")]),
          ]),
          h("div", { key: 5, style: { display: "flex", gap: 6, justifyContent: "center", marginTop: 14, flexWrap: "wrap" } },
            ["Nessus", "OpenVAS", "Nmap", "OWASP ZAP", "Burp Suite", "Custom CSV"].map(t =>
              h("span", { key: t, className: "tag tag--outline" }, t)
            )
          ),
        ]),

        // Recent imports
        h("div", { key: "imp", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.History, { key: "i", size: 15 }), h("span", { key: "t" }, "So‘nggi importlar")]),
            h(window.FilterButton, { key: 2, kind: "logs", size: "xs" }),
          ]),
          h("div", { className: "panel__body panel__body--flush", key: 2 }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
            h("thead", { key: "h" }, h("tr", null, [
              h("th", { key: 1 }, "Fayl"),
              h("th", { key: 2 }, "Skaner"),
              h("th", { key: 3 }, "Audit"),
              h("th", { key: 4 }, "Topildi"),
              h("th", { key: 5 }, "Holat"),
              h("th", { key: 6 }, "Vaqt"),
            ])),
            h("tbody", { key: "b" }, [
              { f: "internal-network.nessus", s: "Nessus", sIcon: I.Bug, a: "AUD-2026-014", found: { c: 4, h: 5, m: 12, l: 8 }, st: "Tahlil qilindi", t: "1 soat", color: "warning" },
              { f: "owasp-zap-portal.json",   s: "OWASP ZAP", sIcon: I.Globe, a: "AUD-2026-014", found: { c: 2, h: 4, m: 6, l: 3 }, st: "Tahlil qilindi", t: "3 soat", color: "info" },
              { f: "nmap-internal.xml",       s: "Nmap", sIcon: I.Network, a: "AUD-2026-014", found: { c: 0, h: 2, m: 7, l: 14 }, st: "Tahlil qilindi", t: "5 soat", color: "info" },
              { f: "openvas-dmz.xml",         s: "OpenVAS", sIcon: I.Bug, a: "AUD-2026-013", found: { c: 1, h: 3, m: 9, l: 5 }, st: "Dublikat tekshirish", t: "1 kun", color: "warning" },
              { f: "burp-spider.xml",         s: "Burp Suite", sIcon: I.Globe, a: "AUD-2026-012", found: { c: 0, h: 1, m: 4, l: 11 }, st: "Tahlil qilindi", t: "2 kun", color: "info" },
            ].map((r, i) => h("tr", { key: i }, [
              h("td", { key: 1 }, h("div", { className: "cell-title" }, [
                h("span", { key: 1, className: "icon-box", style: { background: r.color === "warning" ? "rgba(245,158,11,0.16)" : "rgba(14,165,233,0.16)", color: r.color === "warning" ? "var(--status-warning-fg)" : "var(--status-info-fg)" } }, h(r.sIcon, { size: 14 })),
                h("span", { key: 2, className: "font-mono", style: { fontSize: 13 } }, r.f),
              ])),
              h("td", { key: 2 }, h("span", { className: "tag tag--outline" }, r.s)),
              h("td", { key: 3, className: "font-mono cell-sub" }, r.a),
              h("td", { key: 4 }, h("div", { style: { display: "flex", gap: 4 } }, [
                r.found.c ? h("span", { key: 1, className: "sev sev--critical" }, r.found.c) : null,
                r.found.h ? h("span", { key: 2, className: "sev sev--high" }, r.found.h) : null,
                r.found.m ? h("span", { key: 3, className: "sev sev--medium" }, r.found.m) : null,
                r.found.l ? h("span", { key: 4, className: "sev sev--low" }, r.found.l) : null,
              ])),
              h("td", { key: 5 }, h("span", { className: "tag " + (r.st === "Tahlil qilindi" ? "tag--success" : "tag--warning") }, r.st)),
              h("td", { key: 6, className: "tabular cell-sub" }, r.t),
            ]))),
          ]))),
        ]),
      ]),

      // RIGHT: supported formats + AI
      h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h("div", { key: "fmt", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Boxes, { key: "i", size: 15 }), h("span", { key: "t" }, "Qo‘llab-quvvatlanadigan formatlar")])),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            formats.map((f, i, arr) => h("div", { key: f.name, style: { padding: "10px 14px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 12 } }, [
              h("div", { key: 1, className: "stat__icon", style: { background: f.color === "warning" ? "rgba(245,158,11,0.16)" : f.color === "info" ? "rgba(14,165,233,0.16)" : "var(--bg-surface-3)", color: f.color === "warning" ? "var(--status-warning-fg)" : f.color === "info" ? "var(--status-info-fg)" : "var(--text-tertiary)" } }, h(f.icon, { size: 15 })),
              h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                h("div", { key: 1, style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, f.name),
                h("div", { key: 2, className: "cell-sub font-mono" }, f.desc),
              ]),
              f.count ? h("span", { key: 3, className: "tag tag--ghost" }, f.count) : null,
            ]))
          ),
        ]),

        showAI ? h("div", { key: "ai", className: "ai-card" }, h("div", { className: "ai-card__inner" }, [
          h("div", { className: "ai-card__head", key: 1 }, [
            h("div", { className: "ai-card__icon", key: 1 }, h(I.Sparkles, { key: "i-sparkles", size: 14 })),
            h("span", { className: "ai-card__title", key: 2 }, "AI normalizatsiya"),
          ]),
          h("p", { key: 2, className: "ai-card__body" },
            "Yuklangan har bir skaner natijasi Ollama orqali tahlil qilinadi: oddiy texnik tilga aylantiriladi, takrorlanuvchi findinglar bitta yozuvga birlashtiriladi va remediation tavsiyasi tayyorlanadi. Kerakli auditga manual biriktirish mumkin."),
        ])) : null,
      ]),
    ]);
  }

  function ConfigAnalysis({ showAI }) {
    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 } }, [
      h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        // Drop
        h("div", { key: "d", className: "card", style: { padding: 20, textAlign: "center", border: "1.5px dashed var(--border-strong)", background: "var(--bg-surface-2)" } }, [
          h(I.Server, { size: 32, style: { margin: "0 auto 12px", color: "var(--brand)" }, key: 1 }),
          h("h3", { key: 2, style: { fontSize: 17 } }, "Qurilma konfiguratsiyasini yuklash"),
          h("p", { key: 3, className: "text-sm text-muted", style: { margin: "6px 0 14px" } }, "Cisco IOS, Juniper, Fortinet, MikroTik, pfSense, Linux iptables, Wi-Fi controller — barchasi qo‘llab-quvvatlanadi."),
          h("button", { key: 4, className: "btn btn--primary btn--sm", onClick: () => window.showToast("Konfiguratsiya fayl tanlash oynasi ochilmoqda...", "info") }, [h(I.Upload, { key: "i", size: 14 }), h("span", { key: "t" }, "Konfiguratsiya yuklash")]),
        ]),

        // Devices analyzed
        h("div", { key: "dev", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Server, { key: "i", size: 15 }), h("span", { key: "t" }, "Tahlil qilingan qurilmalar")])),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            [
              { name: "FW-CORE-01",   model: "Cisco ASA 5545-X",       fw: "9.16(4)", findings: { c: 2, h: 3, m: 5 }, icon: I.Shield },
              { name: "SW-DIST-02",   model: "Cisco Catalyst 9300-48", fw: "17.06.04", findings: { c: 0, h: 1, m: 4 }, icon: I.Network },
              { name: "VPN-GW-01",    model: "FortiGate 100F",         fw: "7.0.12",  findings: { c: 1, h: 2, m: 3 }, icon: I.Lock },
              { name: "WIFI-CTRL-01", model: "Aruba 7030 Controller",  fw: "8.10.0.6", findings: { c: 0, h: 0, m: 7 }, icon: I.Wifi },
              { name: "RTR-EDGE-01",  model: "MikroTik CCR2004",       fw: "RouterOS 7.13", findings: { c: 0, h: 2, m: 6 }, icon: I.Network },
            ].map((d, i, arr) => h("div", { key: d.name, style: { padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 12 } }, [
              h("div", { key: 1, className: "stat__icon" }, h(d.icon, { size: 14 })),
              h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
                h("div", { key: 1, className: "font-mono", style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, d.name),
                h("div", { key: 2, className: "cell-sub" }, d.model + " · " + d.fw),
              ]),
              h("div", { key: 3, style: { display: "flex", gap: 4 } }, [
                d.findings.c ? h("span", { key: 1, className: "sev sev--critical" }, d.findings.c) : null,
                d.findings.h ? h("span", { key: 2, className: "sev sev--high" }, d.findings.h) : null,
                d.findings.m ? h("span", { key: 3, className: "sev sev--medium" }, d.findings.m) : null,
              ]),
            ]))),
        ]),
      ]),

      h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        // Config preview
        h("div", { key: "code", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.Code, { key: "i", size: 15 }), h("span", { key: "t" }, "fw-core-01.cfg — qoidalar segmenti")]),
            h("div", { key: 2, style: { display: "flex", gap: 6 } }, [
              h("button", { key: 1, className: "btn btn--ghost btn--xs", onClick: () => { try { navigator.clipboard.writeText("fw-core-01 config..."); } catch(e){} window.showToast("Konfiguratsiya nusxa olindi", "success"); } }, [h(I.Copy, { key: "i", size: 12 }), h("span", { key: "t" }, "Nusxa")]),
              h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("fw-core-01.cfg yuklab olindi", "success") }, [h(I.Download, { key: "i", size: 12 }), h("span", { key: "t" }, "Yuklash")]),
            ]),
          ]),
          h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
            h("pre", { className: "code-block", style: { borderRadius: 0, border: "none", padding: 16 } }, [
              h("div", { key: 1 }, [h("span", { className: "ln" }, "01"), "! ASA 9.16(4) — generated config"]),
              h("div", { key: 2 }, [h("span", { className: "ln" }, "02"), "hostname FW-CORE-01"]),
              h("div", { key: 3 }, [h("span", { className: "ln" }, "03"), "domain-name gov.uz"]),
              h("div", { key: 4 }, [h("span", { className: "ln" }, "04"), "!"]),
              h("div", { key: 5 }, [h("span", { className: "ln" }, "05"), "interface GigabitEthernet0/0"]),
              h("div", { key: 6 }, [h("span", { className: "ln" }, "06"), " nameif inside"]),
              h("div", { key: 7, className: "hl" }, [h("span", { className: "ln" }, "07"), " no security-level"]),
              h("div", { key: 8 }, [h("span", { className: "ln" }, "08"), " ip address 10.0.0.1 255.0.0.0"]),
              h("div", { key: 9 }, [h("span", { className: "ln" }, "09"), "!"]),
              h("div", { key: 10 }, [h("span", { className: "ln" }, "10"), "access-list INSIDE_IN extended permit ip 10.0.0.0 255.0.0.0 any"]),
              h("div", { key: 11, className: "hl" }, [h("span", { className: "ln" }, "11"), "access-list INSIDE_IN extended permit tcp any any"]),
              h("div", { key: 12 }, [h("span", { className: "ln" }, "12"), "access-group INSIDE_IN in interface inside"]),
              h("div", { key: 13 }, [h("span", { className: "ln" }, "13"), "!"]),
              h("div", { key: 14, className: "hl" }, [h("span", { className: "ln" }, "14"), "telnet 0.0.0.0 0.0.0.0 inside"]),
              h("div", { key: 15 }, [h("span", { className: "ln" }, "15"), "ssh 10.20.4.0 255.255.255.0 inside"]),
              h("div", { key: 16 }, [h("span", { className: "ln" }, "16"), "ssh version 2"]),
              h("div", { key: 17 }, [h("span", { className: "ln" }, "17"), "logging buffered debugging"]),
              h("div", { key: 18, className: "hl" }, [h("span", { className: "ln" }, "18"), "no logging trap"]),
            ])
          ),
          h("div", { className: "panel__foot", key: 3 }, [
            h("span", { key: 1 }, "Konfiguratsiyada 3 ta kamchilik aniqlandi"),
            h("button", { key: 2, className: "btn btn--soft btn--xs", onClick: () => window.showToast("Findinglar paneliga o'tilmoqda...", "info") }, [h(I.AlertTriangle, { key: "i", size: 12 }), h("span", { key: "t" }, "Findinglarni ko‘rish")]),
          ]),
        ]),

        showAI ? h("div", { key: "ai", className: "ai-card" }, h("div", { className: "ai-card__inner" }, [
          h("div", { className: "ai-card__head", key: 1 }, [
            h("div", { className: "ai-card__icon", key: 1 }, h(I.Sparkles, { key: "i-sparkles", size: 14 })),
            h("span", { className: "ai-card__title", key: 2 }, "AI tahlil natijasi"),
          ]),
          h("div", { key: 2, className: "ai-card__body", style: { display: "flex", flexDirection: "column", gap: 10 } }, [
            h("div", { key: 1, style: { display: "flex", gap: 10, alignItems: "flex-start" } }, [
              h(Sev, { level: "critical", key: 1 }),
              h("div", { key: 2 }, [
                h("strong", { key: 1, style: { color: "var(--text-primary)" } }, "Satr 07, 11: \"no security-level\" + \"permit tcp any any\""),
                h("p", { key: 2, style: { marginTop: 4 } }, "Inside interfeysida xavfsizlik darajasi belgilanmagan va keng ruxsat berilgan ACL ishlatilmoqda. Segmentatsiya buzilgan."),
              ]),
            ]),
            h("div", { key: 2, style: { display: "flex", gap: 10, alignItems: "flex-start" } }, [
              h(Sev, { level: "high", key: 1 }),
              h("div", { key: 2 }, [
                h("strong", { key: 1, style: { color: "var(--text-primary)" } }, "Satr 14: \"telnet 0.0.0.0\""),
                h("p", { key: 2, style: { marginTop: 4 } }, "Telnet xizmati barcha manzillarga ochiq. Faqat SSHv2 ishlatilishi kerak."),
              ]),
            ]),
          ]),
          h("div", { key: 3, style: { display: "flex", gap: 8, marginTop: 14 } }, [
            h("button", { key: 1, className: "btn btn--primary btn--sm", onClick: () => window.showToast("3 ta finding qoralama ko'rinishida yaratildi", "success") }, [h(I.Plus, { key: "i", size: 13 }), h("span", { key: "t" }, "3 ta finding yaratish")]),
            h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => window.showToast("AI qayta tahlil boshlandi...", "info") }, [h(I.Refresh, { key: "i", size: 13 }), h("span", { key: "t" }, "Qayta tahlil")]),
          ]),
        ])) : null,
      ]),
    ]);
  }

  function TrafficAnalysis({ showAI }) {
    return h("div", { className: "grid", style: { gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 } }, [
      h("div", { key: "L", style: { display: "flex", flexDirection: "column", gap: 16 } }, [

        // Drop
        h("div", { key: "d", className: "card card__pad-sm", style: { display: "flex", gap: 16, alignItems: "center" } }, [
          h("div", { key: 1, className: "stat__icon", style: { width: 56, height: 56, fontSize: 0, background: "rgba(14,165,233,0.16)", color: "var(--status-info-fg)" } }, h(I.Activity, { key: "i-activity", size: 24 })),
          h("div", { key: 2, style: { flex: 1 } }, [
            h("div", { key: 1, style: { fontSize: 16, fontWeight: 700, color: "var(--text-primary)" } }, "PCAP / NetFlow / log yuklash"),
            h("div", { key: 2, className: "text-sm text-muted", style: { marginTop: 2 } }, "Port scanning, brute force, C2, DNS tunneling, data exfiltration va shubhali IP harakatlarini avtomatik aniqlash."),
          ]),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.showToast("PCAP fayl tanlash oynasi ochilmoqda...", "info") }, [h(I.Upload, { key: "i", size: 14 }), h("span", { key: "t" }, "Fayl yuklash")]),
        ]),

        // Anomaly chart
        h("div", { key: "ch", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.Activity, { key: "i", size: 15 }), h("span", { key: "t" }, "DNS so‘rovlar — 24 soat (core-net.pcap)")]),
            h("div", { key: 2, style: { display: "flex", gap: 6 } }, [
              h("span", { key: 1, className: "tag tag--outline" }, "All"),
              h("span", { key: 2, className: "tag tag--danger" }, "Anomaly 18,402"),
            ]),
          ]),
          h("div", { className: "panel__body", key: 2 },
            h("svg", { width: "100%", height: 180, viewBox: "0 0 600 180", preserveAspectRatio: "none" }, [
              // grid
              ...Array.from({ length: 5 }).map((_, i) => h("line", { key: "g" + i, x1: 0, y1: i * 36 + 18, x2: 600, y2: i * 36 + 18, stroke: "var(--border-color)", strokeWidth: 1 })),
              // baseline (normal)
              h("path", { key: "b1", d: "M0 130 C 40 128, 80 120, 120 122 C 160 124, 200 118, 240 124 C 280 130, 320 122, 360 126 C 400 130, 440 122, 480 128 C 520 132, 560 126, 600 130 L 600 180 L 0 180 Z", fill: "var(--brand)", opacity: 0.18 }),
              h("path", { key: "b2", d: "M0 130 C 40 128, 80 120, 120 122 C 160 124, 200 118, 240 124 C 280 130, 320 122, 360 126 C 400 130, 440 122, 480 128 C 520 132, 560 126, 600 130", fill: "none", stroke: "var(--brand)", strokeWidth: 1.5 }),
              // anomaly spike
              h("path", { key: "s1", d: "M280 130 C 285 130, 290 60, 320 30 C 340 20, 360 22, 380 50 C 400 80, 420 95, 440 120 C 460 130, 470 130, 480 130 L 480 180 L 280 180 Z", fill: "#f87171", opacity: 0.22 }),
              h("path", { key: "s2", d: "M280 130 C 285 130, 290 60, 320 30 C 340 20, 360 22, 380 50 C 400 80, 420 95, 440 120 C 460 130, 470 130, 480 130", fill: "none", stroke: "#f87171", strokeWidth: 1.8 }),
              // labels
              h("text", { key: "l1", x: 360, y: 14, textAnchor: "middle", fontSize: 11, fill: "var(--status-danger-fg)", fontWeight: 700 }, "▼ Anomaly — 14:00 – 17:00"),
              ...["00:00", "06:00", "12:00", "18:00", "23:59"].map((t, i) => h("text", { key: "x" + i, x: i * 150, y: 174, textAnchor: i === 0 ? "start" : i === 4 ? "end" : "middle", fontSize: 10, fill: "var(--text-tertiary)" }, t)),
            ])
          ),
        ]),

        // Anomalies table
        h("div", { key: "an", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.AlertTriangle, { key: "i", size: 15 }), h("span", { key: "t" }, "Aniqlangan anomaliyalar")])),
          h("div", { className: "panel__body panel__body--flush", key: 2 }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
            h("thead", { key: "h" }, h("tr", null, [
              h("th", { key: 1 }, "Severity"),
              h("th", { key: 2 }, "Anomaliya"),
              h("th", { key: 3 }, "Manba IP"),
              h("th", { key: 4 }, "Maqsad / port"),
              h("th", { key: 5 }, "Vaqt"),
              h("th", { key: 6 }, "Hodisalar"),
            ])),
            h("tbody", { key: "b" }, [
              { s: "critical", t: "DNS tunneling — uzun subdomainlar", src: "10.10.42.16", dst: "8.8.8.8:53", time: "14:02 – 16:48", c: 18402 },
              { s: "high",     t: "Port scanning — TCP SYN sweep",     src: "10.10.42.16", dst: "10.0.0.0/24", time: "13:55 – 14:01", c: 256 },
              { s: "high",     t: "Brute force — SSH login attempts",   src: "203.0.113.42", dst: "10.20.4.142:22", time: "08:22 – 08:30", c: 4112 },
              { s: "medium",   t: "Shubhali IP — known C2",             src: "10.10.42.16", dst: "185.62.190.78:443", time: "16:14", c: 24 },
              { s: "medium",   t: "Plaintext FTP transfer",             src: "10.10.42.18", dst: "10.0.0.42:21", time: "09:30 – 09:35", c: 8 },
            ].map((r, i) => h("tr", { key: i }, [
              h("td", { key: 1 }, h(Sev, { level: r.s })),
              h("td", { key: 2, className: "text-primary font-semi" }, r.t),
              h("td", { key: 3, className: "font-mono", style: { fontSize: 12 } }, r.src),
              h("td", { key: 4, className: "font-mono", style: { fontSize: 12 } }, r.dst),
              h("td", { key: 5, className: "tabular cell-sub" }, r.time),
              h("td", { key: 6, className: "tabular text-primary font-semi" }, r.c.toLocaleString()),
            ]))),
          ])))
        ]),
      ]),

      // RIGHT
      h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
        h("div", { key: "st", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.PieChart, { key: "i", size: 15 }), h("span", { key: "t" }, "Trafik profili")])),
          h("div", { className: "panel__body", key: 2 }, [
            h("div", { key: 1, className: "grid", style: { gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 } }, [
              h(Stat, { key: 1, label: "Paketlar", value: "12.4M", meta: "94 MB" }),
              h(Stat, { key: 2, label: "Anomaliya", value: 5, meta: "1 critical · 2 high" }),
              h(Stat, { key: 3, label: "Yagona IP", value: 1247, meta: "Internal 89%" }),
              h(Stat, { key: 4, label: "Davomiyligi", value: "24h", meta: "01:00 – 24:59" }),
            ]),
            h(BarChart, { key: 2, w: 280, h: 100, data: [
              { label: "HTTP",  value: 38, color: "var(--brand)" },
              { label: "HTTPS", value: 86, color: "var(--brand)" },
              { label: "DNS",   value: 64, color: "#f87171" },
              { label: "SSH",   value: 28, color: "var(--brand)" },
              { label: "FTP",   value: 9,  color: "#fbbf24" },
              { label: "SMB",   value: 22, color: "var(--brand)" },
              { label: "Other", value: 41, color: "var(--brand)" },
            ] }),
          ]),
        ]),

        showAI ? h("div", { key: "ai", className: "ai-card" }, h("div", { className: "ai-card__inner" }, [
          h("div", { className: "ai-card__head", key: 1 }, [
            h("div", { className: "ai-card__icon", key: 1 }, h(I.Sparkles, { key: "i-sparkles", size: 14 })),
            h("span", { className: "ai-card__title", key: 2 }, "AI xulosa — trafik"),
          ]),
          h("p", { key: 2, className: "ai-card__body" },
            "10.10.42.16 endpoint juda kuchli DNS tunneling belgilarini namoyish etmoqda — 18,400 ga yaqin uzun subdomain so‘rovlari (uzunligi 50+ belgi, base64 ko‘rinishida) bir necha soat davomida yuborilgan. Endpoint shu vaqt oralig‘ida known C2 (185.62.190.78) bilan ham aloqaga kirgan. Yuqori ehtimollikda — ma'lumot exfiltratsiyasi. Tavsiya: endpoint darhol tarmoqdan ajratilsin va EDR snapshoti olinsin."),
        ])) : null,
      ]),
    ]);
  }

  // =========================================================================
  // AI SCREEN — chat-style report builder with Ollama
  // =========================================================================
  function AIScreen({ audit, embedded, setRoute, showAI }) {
    const a = audit || D.AUDITS[0];
    const [input, setInput] = useState("");
    const [convo, setConvo] = useState(D.AI_CONVO);
    const [busy, setBusy] = useState(false);
    const [model, setModel] = useState("qwen2.5:14b-instruct");
    const scrollRef = React.useRef(null);
    React.useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [convo, busy]);
    const presets = [
      { t: "Executive summary tayyorla", i: I.Star },
      { t: "Remediation plan yarat",     i: I.Target },
      { t: "Critical findinglarni guruhlash", i: I.AlertTriangle },
      { t: "Configuration tahlilini izohlash", i: I.Server },
      { t: "KPI hisobotini umumlashtirish", i: I.Trophy },
    ];

    const fc = a.findings;
    function buildPrompt(history, text) {
      const sys = [
        "Sen \"Auditor\" kiberxavfsizlik audit platformasining AI yordamchisisan — lokal Ollama (qwen2.5:14b) ko‘rinishida, yopiq tarmoqda ishlaysan.",
        "Faqat o‘zbek tilida (lotin yozuvi), rasmiy va aniq javob ber. Hech qachon ingliz tilida uzun matn yozma (xavfsizlik atamalari — finding, CVSS, critical — joiz).",
        "Sen kiberxavfsizlik auditori uchun ishlaysan: findinglar tahlili, remediation reja, executive summary, KPI va hisobot bo‘limlarini tayyorlashda yordam berasan.",
        "Javobni tuzilgan ko‘rinishda ber: qisqa sarlavhalar, markdown ro‘yxatlar (- yoki 1.), kerak bo‘lsa **qalin** urg‘u. Ortiqcha kirish so‘zlarsiz, ishchanlik bilan.",
        "",
        "Joriy audit konteksti:",
        "- Kod: " + a.code + " — " + a.title,
        "- Tashkilot: " + (D.orgById(a.org) ? D.orgById(a.org).name : a.org),
        "- Findinglar: " + fc.critical + " critical, " + fc.high + " high, " + fc.medium + " medium, " + fc.low + " low",
        "- Vazifalar: " + a.tasks.done + "/" + a.tasks.total + " bajarilgan",
      ].join("\n");
      const hist = history.filter(m => m.role === "user" || m.role === "ai").slice(-6)
        .map(m => (m.role === "ai" ? "AI" : "Auditor") + ": " + m.text).join("\n");
      return sys + "\n\n--- Suhbat ---\n" + (hist ? hist + "\n" : "") + "Auditor: " + text + "\nAI:";
    }

    async function send(text) {
      text = (text || "").trim();
      if (!text || busy) return;
      const now = new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      const snapshot = convo;
      setConvo(c => [...c, { role: "user", who: "u3", time: now, text }, { role: "ai", time: now, text: "", pending: true }]);
      setInput("");
      setBusy(true);
      try {
        const resp = await window.claude.complete(buildPrompt(snapshot, text));
        const t2 = new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
        setConvo(c => c.map((m, i) => i === c.length - 1 ? { role: "ai", time: t2, text: (resp || "").trim() || "Javob bo‘sh qaytdi. Iltimos, so‘rovni aniqroq qayta yozing.", pending: false } : m));
      } catch (e) {
        setConvo(c => c.map((m, i) => i === c.length - 1 ? { role: "ai", time: now, text: "AI xizmatiga ulanib bo‘lmadi. Yopiq tarmoqda Ollama provayderi ishlayotganini tekshiring (Sozlamalar → AI / Ollama).", pending: false, error: true } : m));
      } finally {
        setBusy(false);
      }
    }
    function onInputKey(e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
    }

    return h("div", null, [
      embedded ? null : h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "AI tahlil & hisobot" }],
        title: "AI tahlil va hisobot quruvchi",
        sub: h("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } }, [
          h("span", { key: "d", className: "dot dot--pulse", style: { color: "var(--green-500)", width: 8, height: 8 } }),
          h("span", { key: 1, className: "text-sm" }, "Ollama lokal · " + model + " · " + a.code),
        ]),
        actions: [
          h("select", { key: 1, className: "select", value: model, onChange: e => setModel(e.target.value), style: { width: 220 } }, [
            h("option", { key: 1 }, "qwen2.5:14b-instruct"),
            h("option", { key: 2 }, "llama3.1:8b-instruct"),
            h("option", { key: 3 }, "mistral:7b-instruct"),
          ]),
          h("button", { key: 2, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("AI suhbat tarixi oynasi ochilmoqda...", "info") }, [h(I.History, { key: "i", size: 14 }), h("span", { key: "t" }, "Tarix")]),
          h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => window.showToast("AI tahlil tanlangan hisobotga qo'shildi", "success") }, [h(I.Save, { key: "i", size: 14 }), h("span", { key: "t" }, "Hisobotga eksport")]),
        ],
      }),

      h("div", { key: "g", className: "grid", style: { gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 } }, [

        // CHAT
        h("div", { key: "C", className: "panel", style: { display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 240px)", minHeight: 540 } }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [
              h(I.Sparkles, { size: 15, key: 1 }),
              h("span", { key: 2 }, "Suhbat — " + a.code),
            ]),
            h("div", { key: 2, style: { display: "flex", gap: 6, alignItems: "center" } }, [
              h("span", { key: 1, className: "tag tag--brand" }, [h(I.Cpu, { key: "i-cpu", size: 11 }), model.split(":")[0]]),
              h("button", { key: 2, className: "iconbtn", onClick: () => window.showToast("Model qayta yuklanmoqda...", "info") }, h(I.Refresh, { key: "i-refresh", size: 14 })),
              h("button", { key: 3, className: "iconbtn", onClick: () => window.showToast("Model sozlamalari oynasi ochilmoqda...", "info") }, h(I.MoreHorizontal, { key: "i-morehorizontal", size: 14 })),
            ]),
          ]),
          h("div", { key: 2, ref: scrollRef, style: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 } }, [
            ...convo.map((m, i) => h(ChatMessage, { key: i, m })),
          ]),
          h("div", { key: 3, style: { padding: 12, borderTop: "1px solid var(--border-color)", background: "var(--bg-surface-2)" } }, [
            h("div", { key: 1, style: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" } },
              presets.map((p, i) => h("button", { key: i, className: "btn btn--soft btn--xs", disabled: busy, onClick: () => send(p.t) }, [h(p.i, { size: 12 }), h("span", { key: "t" }, p.t)]))
            ),
            h("div", { key: 2, style: { display: "flex", gap: 8, alignItems: "flex-end" } }, [
              h("button", { key: 1, className: "iconbtn", title: "Fayl biriktirish" }, h(I.Paperclip, { key: "i-paperclip", size: 16 })),
              h("textarea", { key: 2, className: "textarea", placeholder: "AI ga so‘rov yozing — masalan 'Yangi finding F-2026-0349 uchun remediation plan tayyorla'...", value: input, onChange: e => setInput(e.target.value), onKeyDown: onInputKey, disabled: busy, style: { minHeight: 44, resize: "none", flex: 1 } }),
              h("button", { key: 3, className: "btn btn--primary", style: { padding: "10px 16px" }, onClick: () => send(input), disabled: busy || !input.trim() }, [h(busy ? I.Refresh : I.Send, { key: "i", size: 14, className: busy ? "spin" : undefined }), h("span", { key: "t" }, busy ? "Tahlil..." : "Yuborish")]),
            ]),
            h("div", { key: 3, style: { display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-tertiary)" } }, [
              h("span", { key: 1 }, "Audit konteksti yuklangan: " + a.tasks.total + " vazifa, " + (a.findings.critical + a.findings.high + a.findings.medium + a.findings.low) + " finding"),
              h("span", { key: 2 }, "Yopiq tarmoq · so‘rovlar tashqi servisga yuborilmaydi"),
            ]),
          ]),
        ]),

        // SIDE: report builder
        h("div", { key: "S", style: { display: "flex", flexDirection: "column", gap: 16 } }, [
          h("div", { key: "r", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.FileText, { key: "i", size: 15 }), h("span", { key: "t" }, "Hisobot quruvchi")])),
            h("div", { className: "panel__body", key: 2, style: { display: "flex", flexDirection: "column", gap: 10 } },
              [
                { t: "Audit umumiy ma'lumotlari",     done: true,  required: true },
                { t: "Audit guruhi va vazifalar",     done: true,  required: true },
                { t: "Tasdiqlangan findinglar (24)",  done: true,  required: true },
                { t: "Executive summary",             done: true,  required: false, ai: true },
                { t: "Remediation plan",              done: true,  required: false, ai: true },
                { t: "Tarmoq xaritasi va diagrammalar", done: false, required: false },
                { t: "KPI hisoboti",                   done: true,  required: false },
                { t: "Ilovalar (dalillar)",            done: false, required: false },
              ].map((s, i) => h("label", { key: i, style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" } }, [
                h("input", { type: "checkbox", className: "checkbox", defaultChecked: s.done, key: 1 }),
                h("span", { key: 2, style: { flex: 1, fontSize: 13.5, color: "var(--text-primary)" } }, s.t),
                s.ai ? h("span", { key: 3, className: "tag tag--brand", style: { fontSize: 10 } }, "AI") : null,
                s.required ? h("span", { key: 4, className: "tag tag--ghost", style: { fontSize: 10 } }, "Majburiy") : null,
              ]))
            ),
            h("div", { className: "panel__foot", key: 3, style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, [
              h("button", { key: 1, className: "btn btn--soft btn--sm", onClick: () => window.showToast("Hisobot qayta yaratilmoqda (qwen2.5:14b)...", "info") }, [h(I.Refresh, { key: "i", size: 13 }), h("span", { key: "t" }, "Qayta yaratish")]),
              h("button", { key: 2, className: "btn btn--primary btn--sm", onClick: () => window.showToast("DOCX hisobot yuklab olindi (~4.2 MB)", "success") }, [h(I.Download, { key: "i", size: 13 }), h("span", { key: "t" }, "DOCX yuklash")]),
            ]),
          ]),

          h("div", { key: "p", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.Layers, { key: "i", size: 15 }), h("span", { key: "t" }, "Prompt shablonlari")])),
            h("div", { className: "panel__body", key: 2, style: { padding: 0 } },
              [
                "Executive summary (5 jumla)", "Texnik remediation plan", "Critical findinglarni xulosa qilish", "Audit kirish bo‘limi (boshlanish)", "KPI tahlili (tavsifiy)", "Compliance mapping — ISO 27001"
              ].map((t, i, arr) => h("button", { key: i, className: "navitem", style: { padding: "10px 14px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", borderRadius: 0 } }, [
                h(I.Sparkles, { size: 14, key: 1, style: { color: "var(--brand)" } }),
                h("span", { className: "label", key: 2 }, t),
                h(I.ChevronRight, { size: 12, key: 3, style: { marginLeft: "auto", color: "var(--text-tertiary)" } }),
              ]))
            ),
          ]),
        ]),
      ]),
    ]);
  }
  window.AIScreen = AIScreen;

  // Lightweight markdown → HTML for AI replies (safe-escaped).
  function mdLite(t) {
    let s = (t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/`([^`]+)`/g, '<code class="aimd-code">$1</code>');
    s = s.replace(/^######\s?(.+)$/gm, '<div class="aimd-h">$1</div>');
    s = s.replace(/^#{1,5}\s?(.+)$/gm, '<div class="aimd-h">$1</div>');
    s = s.replace(/^\s*[-*\u2022]\s+(.+)$/gm, '<div class="aimd-li">$1</div>');
    s = s.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<div class="aimd-li aimd-li--num"><span class="aimd-num">$1.</span>$2</div>');
    return s;
  }

  function ChatMessage({ m }) {
    const isAi = m.role === "ai";
    const isSys = m.role === "system";
    if (isSys) {
      return h("div", { style: { textAlign: "center", color: "var(--text-tertiary)", fontSize: 11.5, padding: "4px 0" } }, [
        h("span", { className: "tag tag--ghost" }, [h(I.Cpu, { key: "i-cpu", size: 11 }), m.text + " · " + m.time]),
      ]);
    }
    const aiBubbleStyle = {
      padding: 14,
      background: m.error ? "var(--status-danger-bg)" : "var(--brand-soft)",
      border: "1px solid " + (m.error ? "var(--status-danger-fg)" : "var(--brand-soft-hover)"),
      borderRadius: "4px 12px 12px 12px",
      fontSize: 13.5,
      color: m.error ? "var(--status-danger-fg)" : "var(--text-primary)",
      lineHeight: 1.65,
    };
    return h("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } }, [
      isAi ? h("div", { key: 1, style: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand) 0%, #93b4fd 100%)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 } }, h(I.Sparkles, { key: "i-sparkles", size: 14 })) :
        h(Avatar, { key: 1, user: m.who || "u3" }),
      h("div", { key: 2, style: { flex: 1, minWidth: 0 } }, [
        h("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } }, [
          h("strong", { key: 1, style: { fontSize: 13, color: "var(--text-primary)" } }, isAi ? "Ollama AI" : D.userById(m.who || "u3").name),
          h("span", { key: 2, className: "cell-sub" }, m.time),
          isAi ? h("span", { key: 3, className: "tag tag--brand", style: { fontSize: 10 } }, "qwen2.5:14b") : null,
        ]),
        isAi && m.pending
          ? h("div", { key: 2, style: aiBubbleStyle }, h("span", { className: "ai-typing" }, [h("i", { key: 1 }), h("i", { key: 2 }), h("i", { key: 3 })]))
          : (isAi
            ? h("div", { key: 2, className: "aimd", style: aiBubbleStyle, dangerouslySetInnerHTML: { __html: mdLite(m.text) } })
            : h("div", { key: 2, style: { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" } }, m.text)),
        m.attach === "plan" ? h(RemediationPlan, { key: 3 }) : null,
        isAi && !m.pending && !m.error ? h("div", { key: 4, style: { display: "flex", gap: 6, marginTop: 8 } }, [
          h("button", { key: 1, className: "btn btn--ghost btn--xs", onClick: () => { try { navigator.clipboard.writeText("AI javob..."); } catch(e){} window.showToast("AI javob buferga ko'chirildi", "success"); } }, [h(I.Copy, { key: "i", size: 12 }), h("span", { key: "t" }, "Nusxa")]),
          h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("Javob tahrirlash oynasi ochilmoqda...", "info") }, [h(I.Edit3, { key: "i", size: 12 }), h("span", { key: "t" }, "Tahrir")]),
          h("button", { key: 3, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("AI javob qayta generatsiya qilinmoqda...", "info") }, [h(I.Refresh, { key: "i", size: 12 }), h("span", { key: "t" }, "Qayta")]),
          h("button", { key: 4, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("AI javob hisobotga qo'shildi", "success") }, [h(I.Save, { key: "i", size: 12 }), h("span", { key: "t" }, "Hisobotga qo‘shish")]),
        ]) : null,
      ]),
    ]);
  }

  function RemediationPlan() {
    const items = [
      { task: "Critical segmentlarni fizik/logik ajratish (VLAN + ACL)", owner: "u7", eta: "3 ish kuni", risk: "critical" },
      { task: "Telnet xizmatini barcha tarmoq qurilmalarida o‘chirish", owner: "u6", eta: "1 ish kuni", risk: "high" },
      { task: "SSHv2 + kalit asosida autentifikatsiyani konfiguratsiya qilish", owner: "u6", eta: "2 ish kuni", risk: "high" },
      { task: "Yangi konfiguratsiyani pilot bo‘limda sinash va rolloverka", owner: "u3", eta: "8 ish kuni", risk: "medium" },
    ];
    return h("div", { className: "tbl-wrap", style: { marginTop: 10, background: "var(--bg-surface)" } }, h("table", { className: "tbl", style: { fontSize: 12.5 } }, [
      h("thead", { key: "h" }, h("tr", null, [
        h("th", { key: 1 }, "#"),
        h("th", { key: 2 }, "Vazifa"),
        h("th", { key: 3 }, "Mas’ul"),
        h("th", { key: 4 }, "ETA"),
        h("th", { key: 5 }, "Xavf"),
      ])),
      h("tbody", { key: "b" }, items.map((it, i) => h("tr", { key: i }, [
        h("td", { key: 1, className: "font-bold tabular" }, i + 1),
        h("td", { key: 2, className: "text-primary" }, it.task),
        h("td", { key: 3 }, h("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, [
          h(Avatar, { user: it.owner, key: 1 }),
          h("span", { key: 2, className: "text-sm" }, D.userById(it.owner).name),
        ])),
        h("td", { key: 4, className: "tabular cell-sub" }, it.eta),
        h("td", { key: 5 }, h(Sev, { level: it.risk })),
      ]))),
    ]));
  }

  // =========================================================================
  // KPI SCREEN
  // =========================================================================
  function KpiScreen({ setRoute, role }) {
    const [period, setPeriod] = useState("month");
    return h("div", null, [
      h(PageHeader, {
        key: "h",
        crumbs: [{ label: "Boshqaruv paneli", onClick: () => setRoute("dashboard") }, { label: "KPI" }],
        title: "KPI va mutaxassislar reytingi",
        sub: "May 2026 · 8 mutaxassis · jami " + D.KPI_USERS.reduce((s, k) => s + k.total, 0) + " ball",
        actions: [
          h("div", { key: "p", style: { display: "inline-flex", background: "var(--bg-surface-2)", border: "1px solid var(--border-color)", borderRadius: 6, padding: 3 } },
            [["week", "Hafta"], ["month", "Oy"], ["quarter", "Chorak"], ["year", "Yil"]].map(([k, l]) => h("button", {
              key: k, className: "btn btn--ghost btn--xs", onClick: () => setPeriod(k),
              style: period === k ? { background: "var(--bg-surface)", color: "var(--brand)", boxShadow: "var(--shadow-xs)" } : {},
            }, l))
          ),
          h("button", { key: 2, className: "btn btn--ghost btn--sm", onClick: () => window.showToast("KPI XLSX formatda eksport qilindi", "success") }, [h(I.Download, { key: "i", size: 14 }), h("span", { key: "t" }, "XLSX")]),
          h("button", { key: 3, className: "btn btn--secondary btn--sm", onClick: () => window.showToast("KPI qoidalari tahrirlash oynasi ochilmoqda...", "info") }, [h(I.Settings, { key: "i", size: 14 }), h("span", { key: "t" }, "Qoidalarni tahrirlash")]),
        ],
      }),

      // Stat row
      h("div", { key: "s", className: "grid", style: { gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 } }, [
        h(Stat, { key: 1, icon: I.Trophy, label: "Jami ball",     value: D.KPI_USERS.reduce((s, k) => s + k.total, 0), delta: 14, spark: [820, 940, 1080, 1190, 1320, 1483] }),
        h(Stat, { key: 2, icon: I.Users,  label: "Faol mutaxassis", value: D.KPI_USERS.length, meta: "May oyida" }),
        h(Stat, { key: 3, icon: I.CheckSquare, label: "Muddatida bajarilgan", value: "89%", delta: 4 }),
        h(Stat, { key: 4, icon: I.TrendingDown, label: "Qaytarilgan vazifa", value: "6.2%", delta: 2, deltaNeg: true }),
      ]),

      h("div", { key: "g", className: "grid", style: { gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)", gap: 16 } }, [

        // Leaderboard
        h("div", { key: "L", className: "panel" }, [
          h("div", { className: "panel__h", key: 1 }, [
            h("div", { className: "panel__t" }, [h(I.Trophy, { key: "i", size: 15 }), h("span", { key: "t" }, "Mutaxassislar reytingi")]),
            h("div", { key: 2, style: { display: "flex", gap: 6 } }, [
              h(window.FilterButton, { key: 1, kind: "users", size: "xs" }),
              h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("Reyting tartiblandi: KPI ball bo'yicha", "info") }, [h(I.ChevronsUpDown, { key: "i", size: 12 }), h("span", { key: "t" }, "Tartiblash")]),
            ]),
          ]),
          h("div", { className: "panel__body panel__body--flush", key: 2 }, h("div", { className: "tbl-scroll" }, h("table", { className: "tbl" }, [
            h("thead", { key: "h" }, h("tr", null, [
              h("th", { key: 1 }, "#"),
              h("th", { key: 2 }, "Mutaxassis"),
              h("th", { key: 3 }, "Auditlar"),
              h("th", { key: 4 }, "Vazifa"),
              h("th", { key: 5 }, "Findinglar"),
              h("th", { key: 6 }, "Trend"),
              h("th", { key: 7 }, "Δ"),
              h("th", { key: 8 }, "Jami ball"),
            ])),
            h("tbody", { key: "b" }, D.KPI_USERS.map((k, i) => {
              const u = D.userById(k.user);
              const max = D.KPI_USERS[0].total;
              return h("tr", { key: k.user }, [
                h("td", { key: 1, style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: i === 0 ? "#fbbf24" : i === 1 ? "#cbd5e1" : i === 2 ? "#b45309" : "var(--text-tertiary)" } }, "#" + (i + 1)),
                h("td", { key: 2 }, h("div", { className: "cell-title" }, [
                  h(Avatar, { user: u, key: 1, size: "lg" }),
                  h("div", { key: 2 }, [
                    h("div", { key: 1 }, u.name),
                    h("div", { key: 2, className: "cell-sub" }, u.title),
                  ]),
                ])),
                h("td", { key: 3, className: "tabular" }, k.audits),
                h("td", { key: 4, className: "tabular" }, k.tasks),
                h("td", { key: 5, className: "tabular" }, k.findings),
                h("td", { key: 6 }, h(Sparkline, { data: k.sparkline, w: 100, h: 28 })),
                h("td", { key: 7 }, h("span", {
                  className: "tag " + (k.delta >= 0 ? "tag--success" : "tag--danger"),
                }, (k.delta > 0 ? "+" : "") + k.delta)),
                h("td", { key: 8 }, h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, [
                  h("div", { key: 1, style: { width: 80, height: 4, background: "var(--bg-surface-3)", borderRadius: 2 } },
                    h("div", { style: { width: ((k.total / max) * 100) + "%", height: "100%", background: "var(--brand)", borderRadius: 2 } })),
                  h("span", { key: 2, style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)", minWidth: 40, textAlign: "right" } }, k.total),
                ])),
              ]);
            })),
          ]))),
        ]),

        h("div", { key: "R", style: { display: "flex", flexDirection: "column", gap: 16 } }, [

          // KPI rules card
          h("div", { key: "r", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, [
              h("div", { className: "panel__t" }, [h(I.Settings, { key: "i", size: 15 }), h("span", { key: "t" }, "KPI qoidalari")]),
              h("button", { key: 2, className: "btn btn--ghost btn--xs", onClick: () => window.showToast("KPI qoidalari tahrirlash oynasi ochilmoqda...", "info") }, [h(I.Edit3, { key: "i", size: 12 }), h("span", { key: "t" }, "Tahrir")]),
            ]),
            h("div", { className: "panel__body", key: 2, style: { padding: 0, maxHeight: 300, overflowY: "auto" } },
              D.KPI_RULES.map((r, i, arr) => h("div", { key: i, style: { padding: "8px 14px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", gap: 10 } }, [
                h("span", { key: 1, style: { flex: 1, fontSize: 12.5, color: "var(--text-secondary)" } }, r.event),
                h("span", { key: 2, className: "font-bold tabular", style: { color: r.points > 0 ? "var(--status-success-fg)" : "var(--status-danger-fg)", fontFamily: "var(--font-display)", fontSize: 13, minWidth: 32, textAlign: "right" } },
                  (r.points > 0 ? "+" : "") + r.points),
              ]))
            ),
          ]),

          // Top breakdown
          h("div", { key: "b", className: "panel" }, [
            h("div", { className: "panel__h", key: 1 }, h("div", { className: "panel__t" }, [h(I.PieChart, { key: "i", size: 15 }), h("span", { key: "t" }, "Bobur Mirzayev — ball tarkibi")])),
            h("div", { className: "panel__body", key: 2 }, [
              h("div", { key: 1, style: { display: "flex", alignItems: "center", gap: 16 } }, [
                h(Donut, { key: 1, items: [
                  { value: 60,  color: "#3b65f6" },  // Audit ishtirok
                  { value: 75,  color: "#10b981" },  // Findinglar
                  { value: 95,  color: "#0ea5e9" },  // Vazifalar
                  { value: 45,  color: "#fbbf24" },  // Rahbarlik
                  { value: 12,  color: "#f87171" },  // Penalty
                ], total: 287, size: 100 }),
                h("div", { key: 2, style: { flex: 1, display: "flex", flexDirection: "column", gap: 8 } }, [
                  ["Vazifalar (bajarilgan)", 95, "#0ea5e9"],
                  ["Findinglar (tasdiq.)",   75, "#10b981"],
                  ["Audit ishtiroki",        60, "#3b65f6"],
                  ["Rahbarlik bonusi",       45, "#fbbf24"],
                  ["Penalty (qaytarish)",   -12, "#f87171"],
                ].map(([l, v, c]) => h("div", { key: l, style: { display: "flex", justifyContent: "space-between", fontSize: 12 } }, [
                  h("span", { key: 1, style: { display: "flex", alignItems: "center", gap: 6 } }, [
                    h("span", { key: 1, style: { width: 8, height: 8, borderRadius: 2, background: c } }),
                    h("span", { key: 2 }, l),
                  ]),
                  h("span", { key: 2, className: "font-bold tabular" }, (v >= 0 ? "+" : "") + v),
                ]))),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
  }
  window.KpiScreen = KpiScreen;

})();
