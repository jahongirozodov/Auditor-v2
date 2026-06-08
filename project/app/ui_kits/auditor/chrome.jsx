/* App chrome: Sidebar + Topbar + small UI primitives shared by screens. */
(function () {
  const { useState, useEffect, useMemo, useRef, useContext, createContext, Fragment } = React;
  const h = React.createElement;
  const I = window.Icons;

  // ---------- Motion helpers ----------
  const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
  const easeOutExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));

  function useReducedMotion() {
    const [reduce, setReduce] = useState(
      () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    useEffect(() => {
      if (typeof matchMedia === "undefined") return undefined;
      const m = matchMedia("(prefers-reduced-motion: reduce)");
      const fn = () => setReduce(m.matches);
      m.addEventListener ? m.addEventListener("change", fn) : m.addListener(fn);
      return () => { m.removeEventListener ? m.removeEventListener("change", fn) : m.removeListener(fn); };
    }, []);
    return reduce;
  }
  window.useReducedMotion = useReducedMotion;

  // Animates an integer 0 → target with an ease-out curve. Honors reduced-motion.
  function useCountValue(target, reduce, duration = 1000) {
    const [v, setV] = useState(reduce ? target : 0);
    useEffect(() => {
      if (reduce || typeof target !== "number" || !isFinite(target)) { setV(target); return undefined; }
      let raf; const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setV(Math.round(target * easeOutExpo(p)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const safety = setTimeout(() => setV(target), duration + 400);
      return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
    }, [target, reduce]);
    return v;
  }

  // Renders a value (number OR string like "118/142", "89%") with every numeric
  // run counting up from zero. Non-numeric value passes straight through.
  function CountUp({ value, duration = 1100, className }) {
    const reduce = useReducedMotion();
    const str = String(value);
    const tokens = useMemo(() => str.match(/(\d[\d,]*\.?\d*)|([^\d]+)/g) || [str], [str]);
    const targets = useMemo(() => tokens.map(t => /^\d/.test(t) ? parseFloat(t.replace(/,/g, "")) : null), [tokens]);
    const hasNum = targets.some(t => t !== null);
    const [t, setT] = useState(reduce || !hasNum ? 1 : 0);
    useEffect(() => {
      if (reduce || !hasNum) { setT(1); return undefined; }
      let raf; const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setT(easeOutExpo(p));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setT(0);
      raf = requestAnimationFrame(tick);
      const safety = setTimeout(() => setT(1), duration + 400);
      return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
    }, [str, reduce]);
    const out = tokens.map((tok, i) => {
      if (targets[i] === null) return tok;
      const dec = (tok.split(".")[1] || "").length;
      const cur = targets[i] * t;
      const num = dec > 0 ? cur.toFixed(dec) : String(Math.round(cur));
      return tok.includes(",") ? Number(num).toLocaleString("en-US") : num;
    }).join("");
    return h("span", { className }, out);
  }
  window.CountUp = CountUp;

  // ---------- AppContext ----------
  const AppContext = createContext(null);
  window.AppContext = AppContext;

  // Returns label for a status key.
  function statusTag(key) {
    const s = window.AppData.STATUS_LABELS[key];
    if (!s) return null;
    return h("span", { key: "st-" + key, className: `tag ${s.tag}` }, s.label);
  }
  window.statusTag = statusTag;

  // ---------- Avatar ----------
  function Avatar({ user, size = "md", className }) {
    if (typeof user === "string") user = window.AppData.userById(user);
    const cls = ["avatar"];
    if (size === "lg") cls.push("avatar--lg");
    if (size === "xl") cls.push("avatar--xl");
    if (className) cls.push(className);
    return h("span", { className: cls.join(" "), title: user.name }, user.avatar);
  }
  window.Avatar = Avatar;

  // ---------- Avatar stack ----------
  function AvatarStack({ users, max = 4 }) {
    const list = users.slice(0, max).map(u => typeof u === "string" ? window.AppData.userById(u) : u);
    const more = users.length - max;
    return h("div", { className: "av-stack" }, [
      ...list.map((u, i) => h(Avatar, { key: u.id || i, user: u })),
      more > 0 ? h("span", { className: "avatar", key: "more", style: { background: "var(--bg-surface-3)", color: "var(--text-secondary)" } }, `+${more}`) : null,
    ]);
  }
  window.AvatarStack = AvatarStack;

  // ---------- Severity badge ----------
  function Sev({ level }) {
    const lvl = level && level.toLowerCase();
    return h("span", { className: `sev sev--${lvl}` }, window.AppData.SEV_LABELS[lvl] || level);
  }
  window.Sev = Sev;

  // ---------- Sparkline ----------
  let __sparkSeq = 0;
  function Sparkline({ data, w = 64, h: H = 28, color = "var(--brand)", fill = true }) {
    const gid = useMemo(() => "sg" + (++__sparkSeq), []);
    if (!data || !data.length) return null;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    const points = data.map((d, i) => [i * step, H - 4 - ((d - min) / range) * (H - 8)]);
    const path = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const area = path + ` L ${w},${H} L 0,${H} Z`;
    return h("svg", { width: w, height: H, viewBox: `0 0 ${w} ${H}`, className: "spark", "aria-hidden": "true" }, [
      h("defs", { key: "d" },
        h("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" }, [
          h("stop", { key: 1, offset: "0%", stopColor: color, stopOpacity: 0.34 }),
          h("stop", { key: 2, offset: "100%", stopColor: color, stopOpacity: 0 }),
        ])
      ),
      fill ? h("path", { key: "f", className: "spark-area", d: area, fill: `url(#${gid})` }) : null,
      h("path", { key: "l", className: "spark-line", pathLength: 1, d: path, stroke: color, strokeWidth: 1.5, fill: "none", strokeLinecap: "round" }),
    ]);
  }
  window.Sparkline = Sparkline;

  // ---------- Donut ----------
  function Donut({ items, size = 120, thickness = 18, total: forceTotal }) {
    const reduce = useReducedMotion();
    const total = forceTotal || items.reduce((s, x) => s + x.value, 0);
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    const cx = size / 2;
    const [drawn, setDrawn] = useState(reduce);
    const count = useCountValue(total, reduce, 1000);
    useEffect(() => {
      if (reduce) { setDrawn(true); return undefined; }
      let raf2;
      const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setDrawn(true)); });
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
    }, [reduce]);
    return h("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, className: "donut" }, [
      h("circle", { key: "bg", cx, cy: cx, r, fill: "none", stroke: "var(--bg-surface-3)", strokeWidth: thickness }),
      ...items.map((it, i) => {
        if (!it.value) return null;
        const len = (it.value / total) * c;
        const dashOff = -offset;
        offset += len;
        return h("circle", {
          key: i, className: "donut-seg", cx, cy: cx, r, fill: "none",
          stroke: it.color, strokeWidth: thickness,
          strokeDasharray: drawn ? `${len} ${c - len}` : `0 ${c}`,
          strokeDashoffset: dashOff,
          transform: `rotate(-90 ${cx} ${cx})`,
          strokeLinecap: "butt",
          style: { transitionDelay: (i * 140) + "ms" },
        });
      }),
      h("text", { key: "t", x: cx, y: cx - 4, textAnchor: "middle", fontSize: 22, fontWeight: 800, fill: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }, count),
      h("text", { key: "s", x: cx, y: cx + 14, textAnchor: "middle", fontSize: 10, fill: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.08em" }, "JAMI"),
    ]);
  }
  window.Donut = Donut;

  // ---------- Bar chart ----------
  function BarChart({ data, w = 240, h: H = 80, color = "var(--brand)" }) {
    if (!data || !data.length) return null;
    const max = Math.max(...data.map(d => d.value), 1);
    const bw = (w - (data.length - 1) * 6) / data.length;
    return h("svg", { width: w, height: H, viewBox: `0 0 ${w} ${H}` }, [
      ...data.map((d, i) => {
        const bh = (d.value / max) * (H - 18);
        const x = i * (bw + 6);
        const y = H - 16 - bh;
        return h(Fragment, { key: i }, [
          h("rect", { x, y, width: bw, height: bh, rx: 2, className: "bar-grow", fill: d.color || color, opacity: d.muted ? 0.4 : 1 }),
          h("text", { x: x + bw / 2, y: H - 4, textAnchor: "middle", fontSize: 10, fill: "var(--text-tertiary)" }, d.label),
        ]);
      }),
    ]);
  }
  window.BarChart = BarChart;

  // ---------- Sidebar ----------
  function Sidebar({ route, setRoute, role, collapsed }) {
    const items = [
      { group: "Asosiy", entries: [
        { id: "dashboard",  label: "Boshqaruv paneli",  icon: I.LayoutDashboard },
        { id: "orgs",      label: "Tashkilotlar",        icon: I.Building2 },
        { id: "audits",     label: "Auditlar",          icon: I.FolderKanban,    count: 6 },
        { id: "tasks",      label: "Mening vazifalarim", icon: I.CheckSquare,    count: 7 },
        { id: "assign",     label: "Vazifalarni taqsimlash", icon: I.Inbox },
        { id: "findings",   label: "Findinglar",        icon: I.AlertTriangle,   count: 34 },
      ]},
      { group: "Tahlil", entries: [
        { id: "config",     label: "Konfiguratsiya",       icon: I.Server },
        { id: "scanner",    label: "Skaner importi",       icon: I.FileSearch },
        { id: "topology",   label: "Tarmoq topologiyasi",   icon: I.Network },
        { id: "traffic",    label: "Trafik tahlili",        icon: I.Activity },
        { id: "ai",         label: "AI tahlil & hisobot",   icon: I.Sparkles },
        { id: "kpi",        label: "KPI",                  icon: I.BarChart3 },
        { id: "reports",    label: "Hisobotlar",            icon: I.FileText },
      ]},
      { group: "Boshqaruv", entries: [
        { id: "tokens",     label: "Audit tokenlar",       icon: I.KeyRound, roles: ["departament", "bolim"] },
        { id: "users",      label: "Foydalanuvchilar",     icon: I.Users,    roles: ["departament", "bolim"] },
        { id: "permissions",label: "Rollar va ruxsatlar",  icon: I.ShieldCheck, roles: ["departament"] },
        { id: "logs",       label: "Audit loglar",         icon: I.History },
        { id: "agent",      label: "EXE agent (demo)",     icon: I.Monitor },
        { id: "settings",   label: "Sozlamalar",           icon: I.Settings, roles: ["departament", "bolim"] },
      ]},
    ];

    return h("aside", { className: "sidebar" }, [
      ...items.map(group => h(Fragment, { key: group.group }, [
        h("div", { key: "l", className: "sidebar__label" }, group.group),
        h("div", { key: "s", className: "sidebar__section" },
          group.entries
            .filter(e => !e.roles || e.roles.includes(role))
            .map(e =>
              h("button", {
                key: e.id,
                className: "navitem" + (route === e.id ? " is-active" : ""),
                onClick: () => setRoute(e.id),
              }, [
                h(e.icon, { key: "i" }),
                h("span", { key: "l", className: "label" }, e.label),
                e.count != null ? h("span", { key: "c", className: "count" }, e.count) : null,
              ])
            )
        ),
      ])),
      h("div", { key: "foot", className: "sidebar__foot" }, [
        h("strong", { key: 1 }, "Yopiq kontur"),
        h("span", { key: 2 }, "Lokal Ollama: qwen2.5:14b · sync OK"),
      ]),
    ]);
  }
  window.Sidebar = Sidebar;

  // ---------- Topbar ----------
  function Topbar({ collapsed, setCollapsed, theme, setTheme, role, setRole, setRoute, onLogout, onOpenSearch }) {
    const user = window.AppData.USERS.find(u => u.role === role) || window.AppData.USERS[0];
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
      if (!menuOpen) return;
      function onDocClick(e) {
        if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      }
      function onKey(e) { if (e.key === "Escape") setMenuOpen(false); }
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [menuOpen]);

    useEffect(() => {
      if (!notifOpen) return;
      function onDocClick(e) {
        if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      }
      function onKey(e) { if (e.key === "Escape") setNotifOpen(false); }
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [notifOpen]);

    const notifications = [
      { id: 1, type: "finding", icon: I.AlertTriangle, tone: "danger", title: "Yangi critical finding biriktirildi", body: "AUD-2026-014 · FW-CORE-01 da to'liq ruxsat aniqlandi", time: "5 daq oldin", unread: true },
      { id: 2, type: "task", icon: I.CheckSquare, tone: "info", title: "Vazifa muddati yaqinlashmoqda", body: "T-218 — Firewall qoidalarini tahlil qilish · 2 kun qoldi", time: "1 soat oldin", unread: true },
      { id: 3, type: "approval", icon: I.UserCheck, tone: "success", title: "Audit loyihasi tasdiqlandi", body: "AUD-2026-013 — Soliq qo'mitasi DBMS auditi", time: "3 soat oldin", unread: true },
      { id: 4, type: "sync", icon: I.Refresh, tone: "neutral", title: "EXE agent sinxronlandi", body: "AUD-2026-014 · 6 ta yangi log, 2 ta finding qoralama", time: "Bugun, 09:42", unread: false },
      { id: 5, type: "report", icon: I.FileText, tone: "neutral", title: "Hisobot tayyor", body: "AUD-2026-012 — yakuniy hisobot DOCX + PDF", time: "Kecha", unread: false },
    ];
    const unreadCount = notifications.filter(n => n.unread).length;

    return h("header", { className: "shell-top" }, [
      h("div", { key: "brand", className: "shell-top__brand" }, [
        h("div", { key: "m", className: "brand-mark" },
          h(I.ShieldCheck, { key: "i-shieldcheck", size: 18 })
        ),
        h("div", { key: "t", className: "brand-text-wrap" }, [
          h("span", { key: "1", className: "brand-title" }, "Auditor"),
          h("span", { key: "2", className: "brand-sub" }, "Audit boshqaruvi"),
        ]),
      ]),
      h("button", { key: "tog", className: "iconbtn", onClick: () => setCollapsed(!collapsed), title: "Menyu" },
        h(I.Menu, { key: "i-menu", size: 18 })
      ),
      h("button", { key: "s", className: "shell-top__search", type: "button", onClick: () => onOpenSearch && onOpenSearch() }, [
        h(I.Search, { key: "i", className: "icon-search", size: 16 }),
        h("span", { key: "in", className: "shell-top__search-ph" }, "Audit, finding, foydalanuvchi yoki tashkilot bo‘yicha izlash..."),
        h("span", { key: "k", className: "kbd-hint" }, "⌘K"),
      ]),
      h("div", { key: "a", className: "shell-top__actions" }, [
        h("button", { key: "th", className: "iconbtn", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), title: "Mavzu" },
          theme === "dark" ? h(I.Sun, { key: "i-sun", size: 18 }) : h(I.Moon, { key: "i-moon", size: 18 })
        ),
        h("div", { key: "be", className: "notif-menu", ref: notifRef }, [
          h("button", {
            key: "btn",
            className: "iconbtn" + (notifOpen ? " is-active" : ""),
            title: "Bildirishnomalar",
            onClick: () => setNotifOpen(o => !o),
            "aria-haspopup": "menu",
            "aria-expanded": notifOpen ? "true" : "false",
          }, [
            h(I.Bell, { size: 18, key: "i" }),
            unreadCount > 0 ? h("span", { className: "dot", key: "d" }) : null,
          ]),
          notifOpen ? h("div", { key: "pop", className: "notif-menu__pop", role: "menu" }, [
            h("div", { key: "head", className: "notif-menu__head" }, [
              h("div", { key: "t", className: "notif-menu__title" }, [
                h("span", { key: 1 }, "Bildirishnomalar"),
                unreadCount > 0 ? h("span", { key: 2, className: "notif-menu__badge" }, unreadCount + " yangi") : null,
              ]),
              h("button", { key: "a", className: "notif-menu__mark", onClick: () => setNotifOpen(false) }, "Hammasini o'qildi"),
            ]),
            h("div", { key: "list", className: "notif-menu__list" },
              notifications.map(n => h("button", {
                key: n.id,
                className: "notif-item" + (n.unread ? " is-unread" : ""),
                role: "menuitem",
                onClick: () => setNotifOpen(false),
              }, [
                h("span", { key: "ic", className: "notif-item__icon notif-item__icon--" + n.tone },
                  h(n.icon, { size: 14 })
                ),
                h("div", { key: "tx", className: "notif-item__body" }, [
                  h("div", { key: 1, className: "notif-item__title" }, n.title),
                  h("div", { key: 2, className: "notif-item__sub" }, n.body),
                  h("div", { key: 3, className: "notif-item__time" }, n.time),
                ]),
                n.unread ? h("span", { key: "ud", className: "notif-item__dot" }) : null,
              ]))
            ),
            h("div", { key: "foot", className: "notif-menu__foot" },
              h("button", { className: "notif-menu__all", onClick: () => setNotifOpen(false) }, [
                h("span", { key: 1 }, "Barcha bildirishnomalar"),
                h(I.ChevronRight, { key: 2, size: 13 }),
              ])
            ),
          ]) : null,
        ]),
        h("button", { key: "ai", className: "iconbtn", onClick: () => setRoute("ai"), title: "AI yordamchi" },
          h(I.Sparkles, { key: "i-sparkles", size: 18 })
        ),
        h("div", { key: "div", className: "divider-v", style: { height: 24, margin: "0 4px" } }),
        h("div", { key: "u", className: "user-menu", ref: menuRef }, [
          h("button", {
            key: "btn",
            className: "user-pill" + (menuOpen ? " is-open" : ""),
            title: user.name,
            onClick: () => setMenuOpen(o => !o),
            "aria-haspopup": "menu",
            "aria-expanded": menuOpen ? "true" : "false",
          }, [
            h(Avatar, { key: "av", user }),
            h("div", { key: "tx", className: "user-pill__text" }, [
              h("span", { key: 1, className: "user-pill__name" }, user.name),
              h("span", { key: 2, className: "user-pill__role" }, user.title),
            ]),
            h(I.ChevronDown, { key: "c", size: 14, className: "user-pill__chev", style: { color: "var(--text-tertiary)" } }),
          ]),
          menuOpen ? h("div", { key: "menu", className: "user-menu__pop", role: "menu" }, [
            h("div", { key: "head", className: "user-menu__head" }, [
              h(Avatar, { key: "av", user, size: "lg" }),
              h("div", { key: "tx", className: "user-menu__head-text" }, [
                h("div", { key: 1, className: "user-menu__name" }, user.name),
                h("div", { key: 2, className: "user-menu__sub" }, user.title),
                h("div", { key: 3, className: "user-menu__sub user-menu__sub--muted" }, user.dept),
              ]),
            ]),
            h("div", { key: "g1", className: "user-menu__group" }, [
              h("button", { key: 1, className: "user-menu__item", role: "menuitem", onClick: () => { setRoute && setRoute("profile"); setMenuOpen(false); } }, [
                h(I.User, { key: "i", size: 16 }),
                h("span", { key: "l" }, "Mening profilim"),
              ]),
              h("button", { key: 2, className: "user-menu__item", role: "menuitem", onClick: () => { setRoute && setRoute("tasks"); setMenuOpen(false); } }, [
                h(I.CheckSquare, { key: "i", size: 16 }),
                h("span", { key: "l" }, "Mening vazifalarim"),
                h("span", { key: "c", className: "count" }, "7"),
              ]),
              h("button", { key: 3, className: "user-menu__item", role: "menuitem", onClick: () => { setRoute && setRoute("settings"); setMenuOpen(false); } }, [
                h(I.Settings, { key: "i", size: 16 }),
                h("span", { key: "l" }, "Sozlamalar"),
              ]),
            ]),
            h("div", { key: "sep1", className: "user-menu__sep" }),
            h("div", { key: "g2", className: "user-menu__group" }, [
              h("div", { key: "lbl", className: "user-menu__label" }, "Rolni almashtirish (demo)"),
              ...window.AppData.ROLES.map(r =>
                h("button", {
                  key: r.id,
                  className: "user-menu__item user-menu__item--role" + (r.id === role ? " is-active" : ""),
                  role: "menuitemradio",
                  "aria-checked": r.id === role ? "true" : "false",
                  onClick: () => { setRole && setRole(r.id); setMenuOpen(false); },
                }, [
                  h(I.UserCheck, { key: "i", size: 16 }),
                  h("span", { key: "l" }, r.name),
                  r.id === role ? h(I.Check, { key: "c", size: 14, className: "user-menu__check" }) : null,
                ])
              ),
            ]),
            h("div", { key: "sep2", className: "user-menu__sep" }),
            h("div", { key: "g3", className: "user-menu__group" }, [
              h("button", { key: 1, className: "user-menu__item user-menu__item--danger", role: "menuitem", onClick: () => { setMenuOpen(false); onLogout && onLogout(); } }, [
                h(I.LogOut, { key: "i", size: 16 }),
                h("span", { key: "l" }, "Tizimdan chiqish"),
              ]),
            ]),
          ]) : null,
        ]),
      ]),
    ]);
  }
  window.Topbar = Topbar;

  // ---------- Profile drawer ----------
  function ProfileDrawer({ user, role, onClose, setRoute }) {
    if (!user) return null;
    const D = window.AppData;
    const myAudits = D.AUDITS.filter(a => a.members && a.members.includes(user.id));
    const myTasks  = D.TASKS.filter(t => t.assignee === user.id);
    const openTasks = myTasks.filter(t => t.status !== "done").length;
    const doneTasks = myTasks.filter(t => t.status === "done").length;
    const kpi = D.KPI_USERS.find(k => k.user === user.id);
    const roleObj = D.ROLES.find(r => r.id === role);
    const initials = user.avatar;

    const recent = [
      { i: I.CheckSquare,  tone: "success", t: "Vazifa bajarildi", s: "T-116 — Nessus skaner natijalarini import qildingiz", time: "2 soat oldin" },
      { i: I.AlertTriangle, tone: "danger",  t: "Critical finding qo'shildi", s: "AUD-2026-014 · FW-CORE-01", time: "Bugun, 09:18" },
      { i: I.FileText,     tone: "info",    t: "Hisobot qoralamasini saqladingiz", s: "AUD-2026-013 yakuniy hisobot", time: "Kecha" },
      { i: I.UserCheck,    tone: "neutral", t: "Audit guruhiga qo'shildingiz", s: "AUD-2026-014 — Aloqa vazirligi", time: "3 kun oldin" },
    ];

    return h(Drawer, {
      open: true, onClose, wide: true,
      title: h("span", { className: "panel__t" }, [h(I.User, { key: "i", size: 15 }), h("span", { key: "t" }, "Mening profilim")]),
      footer: [
        h("button", { key: 1, className: "btn btn--ghost btn--sm", onClick: onClose }, "Yopish"),
        h("button", { key: 2, className: "btn btn--soft btn--sm", onClick: () => { onClose(); window.showToast("Sozlamalar oynasi ochilmoqda...", "info"); } }, [h(I.Settings, { key: "i", size: 14 }), h("span", { key: "t" }, "Sozlamalar")]),
        h("button", { key: 3, className: "btn btn--primary btn--sm", onClick: () => { onClose(); window.showToast("Profilni tahrirlash uchun Sozlamalar tabini oching", "info"); } }, [h(I.Edit3, { key: "i", size: 14 }), h("span", { key: "t" }, "Profilni tahrirlash")]),
      ],
    }, [
      // Header card
      h("div", { key: "head", className: "profile-head" }, [
        h("div", { key: "av", className: "avatar avatar--xl" }, initials),
        h("div", { key: "info", className: "profile-head__info" }, [
          h("div", { key: 1, className: "profile-head__name" }, user.name),
          h("div", { key: 2, className: "profile-head__title" }, user.title),
          h("div", { key: 3, className: "profile-head__meta" }, [
            h("span", { key: 1, className: "tag tag--brand" }, [h(I.UserCheck, { key: "i", size: 11 }), h("span", { key: "t" }, roleObj ? roleObj.short : role)]),
            h("span", { key: 2, className: "profile-head__dept" }, [h(I.Building2, { key: "i", size: 12 }), h("span", { key: "t" }, user.dept)]),
          ]),
        ]),
      ]),

      // Contact
      h("div", { key: "contact", className: "profile-contact" }, [
        h("div", { key: 1, className: "profile-contact__row" }, [
          h(I.Mail, { key: "i", size: 13 }),
          h("span", { key: "t" }, user.name.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".") + "@gov.uz"),
        ]),
        h("div", { key: 2, className: "profile-contact__row" }, [
          h(I.Building, { key: "i", size: 13 }),
          h("span", { key: "t" }, "Toshkent · Markaziy apparat, 4-bino"),
        ]),
        h("div", { key: 3, className: "profile-contact__row" }, [
          h(I.History, { key: "i", size: 13 }),
          h("span", { key: "t" }, "Oxirgi faol: 4 daqiqa oldin"),
        ]),
      ]),

      // Stats
      h("div", { key: "stats", className: "profile-stats" }, [
        h("div", { key: 1, className: "profile-stat" }, [
          h("span", { key: "l", className: "profile-stat__label" }, "Faol auditlar"),
          h("span", { key: "v", className: "profile-stat__value tabular" }, myAudits.length),
        ]),
        h("div", { key: 2, className: "profile-stat" }, [
          h("span", { key: "l", className: "profile-stat__label" }, "Ochiq vazifalar"),
          h("span", { key: "v", className: "profile-stat__value tabular" }, openTasks),
        ]),
        h("div", { key: 3, className: "profile-stat" }, [
          h("span", { key: "l", className: "profile-stat__label" }, "Bajarilgan"),
          h("span", { key: "v", className: "profile-stat__value tabular" }, doneTasks),
        ]),
        h("div", { key: 4, className: "profile-stat" }, [
          h("span", { key: "l", className: "profile-stat__label" }, "KPI ball"),
          h("span", { key: "v", className: "profile-stat__value tabular" }, kpi ? kpi.total : "—"),
          kpi ? h("span", { key: "d", className: "profile-stat__delta" + (kpi.delta < 0 ? " is-neg" : "") }, [
            kpi.delta < 0 ? h(I.TrendingDown, { key: "i", size: 11 }) : h(I.TrendingUp, { key: "i", size: 11 }),
            h("span", { key: "t" }, (kpi.delta > 0 ? "+" : "") + kpi.delta),
          ]) : null,
        ]),
      ]),

      // My audits
      myAudits.length > 0 ? h("div", { key: "audits", className: "profile-section" }, [
        h("div", { key: "h", className: "profile-section__head" }, [
          h("span", { key: 1, className: "profile-section__title" }, "Mening auditlarim"),
          h("button", { key: 2, className: "profile-section__more", onClick: () => { setRoute && setRoute("audits"); onClose(); } }, [
            h("span", { key: 1 }, "Hammasi"),
            h(I.ChevronRight, { key: 2, size: 12 }),
          ]),
        ]),
        h("div", { key: "l", className: "profile-list" },
          myAudits.slice(0, 3).map(a => h("div", { key: a.id, className: "profile-list__row" }, [
            h("div", { key: 1, className: "profile-list__main" }, [
              h("span", { key: 1, className: "font-mono profile-list__id" }, a.code),
              h("span", { key: 2, className: "profile-list__title" }, a.title),
            ]),
            h("div", { key: 2, className: "profile-list__meta" }, [
              statusTag(a.status),
              h("span", { key: 2, className: "profile-list__progress" }, a.progress + "%"),
            ]),
          ]))
        ),
      ]) : null,

      // Active tasks
      openTasks > 0 ? h("div", { key: "tasks", className: "profile-section" }, [
        h("div", { key: "h", className: "profile-section__head" }, [
          h("span", { key: 1, className: "profile-section__title" }, "Faol vazifalar"),
          h("button", { key: 2, className: "profile-section__more", onClick: () => { setRoute && setRoute("tasks"); onClose(); } }, [
            h("span", { key: 1 }, "Hammasi"),
            h(I.ChevronRight, { key: 2, size: 12 }),
          ]),
        ]),
        h("div", { key: "l", className: "profile-list" },
          myTasks.filter(t => t.status !== "done").slice(0, 4).map(t => h("div", { key: t.id, className: "profile-list__row" }, [
            h("div", { key: 1, className: "profile-list__main" }, [
              h("span", { key: 1, className: "font-mono profile-list__id" }, t.id),
              h("span", { key: 2, className: "profile-list__title" }, t.title),
            ]),
            h("div", { key: 2, className: "profile-list__meta" }, [
              h("span", { key: 1, className: "tag tag--outline", style: { fontSize: 10 } }, t.priority),
              h("span", { key: 2, className: "profile-list__due" }, t.due),
            ]),
          ]))
        ),
      ]) : null,

      // Recent activity
      h("div", { key: "act", className: "profile-section" }, [
        h("div", { key: "h", className: "profile-section__head" }, [
          h("span", { key: 1, className: "profile-section__title" }, "So'nggi faoliyat"),
        ]),
        h("div", { key: "l", className: "profile-activity" },
          recent.map((r, i) => h("div", { key: i, className: "profile-activity__row" }, [
            h("span", { key: 1, className: "profile-activity__icon notif-item__icon--" + r.tone },
              h(r.i, { size: 13 })
            ),
            h("div", { key: 2, className: "profile-activity__body" }, [
              h("div", { key: 1, className: "profile-activity__title" }, r.t),
              h("div", { key: 2, className: "profile-activity__sub" }, r.s),
            ]),
            h("span", { key: 3, className: "profile-activity__time" }, r.time),
          ]))
        ),
      ]),
    ]);
  }
  window.ProfileDrawer = ProfileDrawer;

  // ---------- Filter button + popover ----------
  // Reusable filter dropdown — pass `kind` to get sensible defaults:
  //   "audits"   → Status + sana oralig'i + tashkilot
  //   "findings" → Severity + Status + AI bor/yo'q
  //   "tasks"    → Status + Ustuvorlik + Mas'ul
  function FilterButton({ kind = "audits", size = "sm", align = "right" }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState({}); // { key: Set<string> }
    const ref = useRef(null);

    useEffect(() => {
      if (!open) return;
      function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
      function onKey(e) { if (e.key === "Escape") setOpen(false); }
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
    }, [open]);

    const PRESETS = {
      audits: [
        { key: "status",  label: "Holat", options: [
          { value: "in_progress", label: "Jarayonda" },
          { value: "review",      label: "Tekshiruvda" },
          { value: "returned",    label: "Qaytarilgan" },
          { value: "planning",    label: "Rejalashtirilmoqda" },
          { value: "approved",    label: "Tasdiqlangan" },
          { value: "completed",   label: "Yakunlangan" },
        ]},
        { key: "type", label: "Audit turi", options: [
          { value: "kompleks",   label: "Kompleks audit" },
          { value: "texnik",     label: "Texnik audit" },
          { value: "pentest",    label: "Penetration test" },
          { value: "web",        label: "Web audit" },
          { value: "maxsus",     label: "Maxsus audit" },
        ]},
        { key: "period", label: "Davr", kindType: "radio", options: [
          { value: "7d",  label: "Oxirgi 7 kun" },
          { value: "30d", label: "Oxirgi 30 kun" },
          { value: "90d", label: "Oxirgi 90 kun" },
          { value: "y",   label: "Joriy yil" },
          { value: "all", label: "Hammasi", default: true },
        ]},
      ],
      findings: [
        { key: "severity", label: "Xavf darajasi", options: [
          { value: "critical", label: "Critical" },
          { value: "high",     label: "High" },
          { value: "medium",   label: "Medium" },
          { value: "low",      label: "Low" },
          { value: "info",     label: "Info" },
        ]},
        { key: "status", label: "Holat", options: [
          { value: "open",     label: "Ochiq" },
          { value: "review",   label: "Tekshiruvda" },
          { value: "fixed",    label: "Bartaraf etilgan" },
          { value: "verified", label: "Tasdiqlangan" },
        ]},
        { key: "extra", label: "Qo'shimcha", options: [
          { value: "ai",        label: "AI tavsiyali" },
          { value: "no_owner",  label: "Mas'ulsiz" },
          { value: "with_cve",  label: "CVE bog'langan" },
        ]},
      ],
      tasks: [
        { key: "status", label: "Holat", options: [
          { value: "new",         label: "Yangi" },
          { value: "in_progress", label: "Jarayonda" },
          { value: "review",      label: "Tekshiruvda" },
          { value: "blocked",     label: "Blok" },
          { value: "done",        label: "Bajarilgan" },
        ]},
        { key: "priority", label: "Ustuvorlik", options: [
          { value: "high",   label: "Yuqori" },
          { value: "medium", label: "O'rta" },
          { value: "low",    label: "Past" },
        ]},
        { key: "scope", label: "Doira", kindType: "radio", options: [
          { value: "mine",   label: "Faqat meniki", default: true },
          { value: "team",   label: "Mening jamoam" },
          { value: "all",    label: "Hamma vazifalar" },
        ]},
      ],
      users: [
        { key: "role", label: "Rol", options: [
          { value: "departament", label: "Departament rahbari" },
          { value: "bolim",       label: "Bo'lim boshlig'i" },
          { value: "bosh",        label: "Bosh mutaxassis" },
          { value: "yetakchi",    label: "Yetakchi mutaxassis" },
          { value: "toifa1",      label: "1-toifa mutaxassis" },
        ]},
        { key: "status", label: "Hisob holati", options: [
          { value: "active",   label: "Aktiv" },
          { value: "inactive", label: "Nofaol" },
          { value: "locked",   label: "Bloklangan" },
        ]},
      ],
      logs: [
        { key: "action", label: "Action", options: [
          { value: "login",   label: "Login" },
          { value: "create",  label: "Yaratish" },
          { value: "update",  label: "O'zgartirish" },
          { value: "delete",  label: "O'chirish" },
          { value: "export",  label: "Eksport" },
          { value: "token",   label: "Token operatsiyalari" },
        ]},
        { key: "severity", label: "Daraja", options: [
          { value: "info",    label: "Info" },
          { value: "warning", label: "Warning" },
          { value: "error",   label: "Error" },
        ]},
        { key: "period", label: "Davr", kindType: "radio", options: [
          { value: "1h",  label: "Oxirgi 1 soat" },
          { value: "24h", label: "Oxirgi 24 soat", default: true },
          { value: "7d",  label: "Oxirgi 7 kun" },
          { value: "30d", label: "Oxirgi 30 kun" },
          { value: "all", label: "Hammasi" },
        ]},
      ],
      reports: [
        { key: "type", label: "Hisobot turi", options: [
          { value: "final",    label: "Yakuniy hisobot" },
          { value: "exec",     label: "Executive summary" },
          { value: "remed",    label: "Remediation plan" },
          { value: "pentest",  label: "Penetration test" },
          { value: "kpi",      label: "KPI hisoboti" },
        ]},
        { key: "format", label: "Format", options: [
          { value: "docx", label: "DOCX" },
          { value: "pdf",  label: "PDF" },
          { value: "xlsx", label: "XLSX" },
          { value: "html", label: "HTML" },
        ]},
        { key: "status", label: "Holat", options: [
          { value: "draft",   label: "Qoralama" },
          { value: "ready",   label: "Tayyor" },
          { value: "sent",    label: "Yuborilgan" },
        ]},
      ],
    };

    const sections = PRESETS[kind] || PRESETS.audits;

    function toggle(secKey, val, isRadio) {
      setActive(a => {
        const next = { ...a };
        if (isRadio) {
          next[secKey] = new Set([val]);
        } else {
          const set = new Set(next[secKey] || []);
          if (set.has(val)) set.delete(val); else set.add(val);
          next[secKey] = set;
        }
        return next;
      });
    }

    const totalActive = Object.values(active).reduce((n, s) => n + (s ? s.size : 0), 0);

    return h("div", { className: "filter-btn", ref }, [
      h("button", {
        key: "b",
        className: "btn btn--ghost btn--" + size + (open ? " is-active" : ""),
        onClick: () => setOpen(o => !o),
      }, [
        h(I.Filter, { key: "i", size: size === "xs" ? 12 : 14 }),
        h("span", { key: "t" }, "Filtr"),
        totalActive > 0 ? h("span", { key: "c", className: "filter-btn__count" }, totalActive) : null,
      ]),
      open ? h("div", { key: "p", className: "filter-pop filter-pop--" + align }, [
        h("div", { key: "h", className: "filter-pop__head" }, [
          h("span", { key: 1, className: "filter-pop__title" }, "Filtr"),
          totalActive > 0 ? h("button", {
            key: 2, className: "filter-pop__clear",
            onClick: () => setActive({}),
          }, "Tozalash") : null,
        ]),
        h("div", { key: "body", className: "filter-pop__body" },
          sections.map(sec => h("div", { key: sec.key, className: "filter-sec" }, [
            h("div", { key: "l", className: "filter-sec__label" }, sec.label),
            h("div", { key: "o", className: "filter-sec__opts" },
              sec.options.map(opt => {
                const isRadio = sec.kindType === "radio";
                const set = active[sec.key];
                let checked;
                if (isRadio) {
                  checked = set ? set.has(opt.value) : !!opt.default;
                } else {
                  checked = set ? set.has(opt.value) : false;
                }
                return h("label", {
                  key: opt.value,
                  className: "filter-chip" + (checked ? " is-on" : ""),
                }, [
                  h("input", {
                    key: "i",
                    type: isRadio ? "radio" : "checkbox",
                    name: isRadio ? "fr-" + sec.key : undefined,
                    checked,
                    onChange: () => toggle(sec.key, opt.value, isRadio),
                  }),
                  h("span", { key: "l" }, opt.label),
                ]);
              })
            ),
          ]))
        ),
        h("div", { key: "f", className: "filter-pop__foot" }, [
          h("button", { key: 1, className: "btn btn--ghost btn--xs", onClick: () => setActive({}) }, "Bekor"),
          h("button", { key: 2, className: "btn btn--primary btn--xs", onClick: () => setOpen(false) }, [
            h(I.Check, { key: "i", size: 12 }),
            h("span", { key: "t" }, "Qo'llash" + (totalActive > 0 ? " (" + totalActive + ")" : "")),
          ]),
        ]),
      ]) : null,
    ]);
  }
  window.FilterButton = FilterButton;

  // ---------- Toast system ----------
  // Usage: window.showToast("message", "success" | "info" | "warning" | "danger")
  let toastContainer = null;
  let toastSeq = 0;
  function ensureToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-host";
    document.body.appendChild(toastContainer);
    return toastContainer;
  }
  window.showToast = function(message, tone = "info", opts = {}) {
    const host = ensureToastContainer();
    const id = ++toastSeq;
    const el = document.createElement("div");
    el.className = "toast toast--" + tone;
    el.dataset.toastId = id;
    const iconKey = tone === "success" ? "Check" : tone === "warning" ? "AlertTriangle" : tone === "danger" ? "X" : "Info";
    const path = window.Icons && window.Icons[iconKey] ? null : null; // we'll just inline svg below
    el.innerHTML = `
      <span class="toast__ic toast__ic--${tone}">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          ${tone === "success" ? '<path d="M20 6 9 17l-5-5"/>' :
            tone === "warning" ? '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>' :
            tone === "danger"  ? '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' :
                                 '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'}
        </svg>
      </span>
      <span class="toast__msg"></span>
      <button class="toast__close" aria-label="Yopish">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    `;
    el.querySelector(".toast__msg").textContent = message;
    function dismiss() {
      el.classList.add("toast--out");
      setTimeout(() => el.remove(), 200);
    }
    el.querySelector(".toast__close").addEventListener("click", dismiss);
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast--in"));
    const duration = opts.duration || 3200;
    setTimeout(dismiss, duration);
    return id;
  };

  // ---------- MoreMenu (for "..." row actions) ----------
  // items: [{ label, icon?, onClick, danger? }] — separators with { sep: true }
  function MoreMenu({ items = [], align = "right", size = "xs" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      if (!open) return;
      function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
      function onKey(e) { if (e.key === "Escape") setOpen(false); }
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
    }, [open]);

    return h("div", { className: "more-menu", ref }, [
      h("button", {
        key: "b",
        className: "btn btn--ghost btn--" + size + " btn--icon" + (open ? " is-active" : ""),
        onClick: (e) => { e.stopPropagation(); setOpen(o => !o); },
        title: "Boshqa amallar",
      }, h(I.MoreHorizontal, { size: 13 })),
      open ? h("div", {
        key: "p",
        className: "more-menu__pop more-menu__pop--" + align,
        onClick: (e) => e.stopPropagation(),
      }, items.map((it, i) => {
        if (it.sep) return h("div", { key: "s" + i, className: "more-menu__sep" });
        return h("button", {
          key: i,
          className: "more-menu__item" + (it.danger ? " is-danger" : ""),
          onClick: (e) => { e.stopPropagation(); setOpen(false); it.onClick && it.onClick(); },
        }, [
          it.icon ? h(it.icon, { key: "i", size: 14 }) : null,
          h("span", { key: "l" }, it.label),
        ]);
      })) : null,
    ]);
  }
  window.MoreMenu = MoreMenu;

  // ---------- Confirm dialog ----------
  // Lightweight imperative confirm — returns Promise<boolean>
  window.confirmAction = function({ title, body, confirmLabel = "Tasdiqlash", cancelLabel = "Bekor", danger = false }) {
    return new Promise((resolve) => {
      const bg = document.createElement("div");
      bg.className = "modal-bg";
      bg.innerHTML = `
        <div class="modal" style="max-width:420px;">
          <div class="modal__h">
            <div class="modal__t" style="display:flex; align-items:center; gap:10px;">
              <span class="confirm-ic ${danger ? 'confirm-ic--danger' : ''}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${danger ? '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>' :
                             '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'}
                </svg>
              </span>
              <span></span>
            </div>
          </div>
          <div class="modal__body" style="font-size:13.5px; color:var(--text-secondary); line-height:1.5;"></div>
          <div class="modal__foot" style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn btn--ghost btn--sm" data-act="cancel"></button>
            <button class="btn btn--sm ${danger ? '' : 'btn--primary'}" data-act="ok" style="${danger ? 'background:var(--status-danger-fg); color:#fff; border-color:var(--status-danger-fg);' : ''}"></button>
          </div>
        </div>
      `;
      bg.querySelector(".modal__t > span:last-child").textContent = title;
      bg.querySelector(".modal__body").textContent = body || "";
      bg.querySelector('[data-act="cancel"]').textContent = cancelLabel;
      bg.querySelector('[data-act="ok"]').textContent = confirmLabel;
      function close(result) {
        bg.remove();
        document.removeEventListener("keydown", onKey);
        resolve(result);
      }
      function onKey(e) {
        if (e.key === "Escape") close(false);
        if (e.key === "Enter") close(true);
      }
      bg.addEventListener("click", (e) => { if (e.target === bg) close(false); });
      bg.querySelector('[data-act="cancel"]').addEventListener("click", () => close(false));
      bg.querySelector('[data-act="ok"]').addEventListener("click", () => close(true));
      document.addEventListener("keydown", onKey);
      document.body.appendChild(bg);
    });
  };

  // ---------- Page header ----------
  function PageHeader({ crumbs, title, sub, actions }) {
    return h("div", { className: "pageh" }, [
      h("div", { key: "t", className: "pageh__title" }, [
        crumbs ? h("div", { key: "c", className: "pageh__crumbs" },
          crumbs.flatMap((c, i) => [
            i > 0 ? h(I.ChevronRight, { key: "s" + i, size: 12 }) : null,
            c.href ? h("a", { key: "l" + i, href: "#", onClick: e => { e.preventDefault(); c.onClick && c.onClick(); } }, c.label) : h("span", { key: "l" + i }, c.label),
          ])
        ) : null,
        h("h1", { key: "h" }, title),
        sub ? h("p", { key: "s", className: "pageh__sub" }, sub) : null,
      ]),
      actions ? h("div", { key: "a", className: "pageh__actions" }, actions) : null,
    ]);
  }
  window.PageHeader = PageHeader;

  // ---------- Tabs ----------
  function Tabs({ active, onChange, tabs }) {
    return h("div", { className: "tabs" }, tabs.map(t =>
      h("button", {
        key: t.id,
        className: "tabs__btn" + (active === t.id ? " is-active" : ""),
        onClick: () => onChange(t.id),
      }, [
        t.icon ? h(t.icon, { key: "i", size: 15 }) : null,
        h("span", { key: "l" }, t.label),
        t.count != null ? h("span", { key: "c", className: "count" }, t.count) : null,
      ])
    ));
  }
  window.Tabs = Tabs;

  // ---------- Modal ----------
  function Modal({ open, onClose, title, children, footer, wide, xl }) {
    if (!open) return null;
    const cls = ["modal"];
    if (wide) cls.push("modal--wide");
    if (xl) cls.push("modal--xl");
    return h("div", { className: "modal-bg", onClick: onClose }, [
      h("div", { key: "m", className: cls.join(" "), onClick: e => e.stopPropagation() }, [
        h("div", { key: "h", className: "modal__h" }, [
          h("div", { key: "t", className: "modal__t" }, title),
          h("button", { key: "c", className: "iconbtn", onClick: onClose }, h(I.X, { key: "i-x", size: 16 })),
        ]),
        h("div", { key: "b", className: "modal__body" }, children),
        footer ? h("div", { key: "f", className: "modal__foot" }, footer) : null,
      ]),
    ]);
  }
  window.Modal = Modal;

  // ---------- Drawer (right-side) ----------
  function Drawer({ open, onClose, title, children, footer, wide }) {
    if (!open) return null;
    return h("div", { className: "drawer-bg", onClick: onClose }, [
      h("div", { key: "d", className: "drawer" + (wide ? " drawer--wide" : ""), onClick: e => e.stopPropagation() }, [
        h("div", { key: "h", className: "drawer__h" }, [
          h("div", { key: "t", style: { display: "flex", alignItems: "center", gap: 10 } }, [
            typeof title === "string" ? h("span", { className: "panel__t", key: "t" }, title) : title,
          ]),
          h("button", { key: "c", className: "iconbtn", onClick: onClose }, h(I.X, { key: "i-x", size: 16 })),
        ]),
        h("div", { key: "b", className: "drawer__body" }, children),
        footer ? h("div", { key: "f", className: "drawer__foot" }, footer) : null,
      ]),
    ]);
  }
  window.Drawer = Drawer;

  // ---------- Stat tile ----------
  function Stat({ icon, label, value, delta, deltaNeg, meta, spark, bar }) {
    return h("div", { className: "stat" }, [
      h("div", { key: "r", className: "stat__row" }, [
        h("span", { key: "l", className: "stat__label" }, label),
        icon ? h("span", { key: "i", className: "stat__icon" }, h(icon, { size: 15 })) : null,
      ]),
      h("div", { key: "v", className: "stat__row" }, [
        h("span", { key: "x", className: "stat__value tabular" }, h(CountUp, { value })),
        spark ? h("span", { key: "s" }, h(Sparkline, { data: spark })) : null,
      ]),
      delta != null || meta ? h("div", { key: "m", className: "stat__row" }, [
        meta ? h("span", { className: "stat__meta", key: "m" }, meta) : h("span", { key: "p" }),
        delta != null ? h("span", { key: "d", className: "stat__delta" + (deltaNeg ? " stat__delta--neg" : "") }, [
          deltaNeg ? h(I.TrendingDown, { key: "i", size: 12 }) : h(I.TrendingUp, { key: "i", size: 12 }),
          h("span", { key: "t" }, (delta > 0 ? "+" : "") + delta + (typeof delta === "number" && Math.abs(delta) < 100 ? "%" : "")),
        ]) : null,
      ]) : null,
      bar != null ? h("div", { key: "b", className: "stat__bar" }, h("span", { style: { width: bar + "%" } })) : null,
    ]);
  }
  window.Stat = Stat;

})();
