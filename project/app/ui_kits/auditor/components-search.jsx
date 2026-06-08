/* Command palette (⌘K) — global search across pages, audits, findings,
   tasks, organizations and users with keyboard navigation. */
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  const PAGES = [
    ["dashboard", "Boshqaruv paneli", I.LayoutDashboard], ["orgs", "Tashkilotlar", I.Building2],
    ["audits", "Auditlar", I.FolderKanban], ["tasks", "Mening vazifalarim", I.CheckSquare],
    ["findings", "Findinglar", I.AlertTriangle], ["config", "Konfiguratsiya", I.Server],
    ["scanner", "Skaner importi", I.FileSearch], ["topology", "Tarmoq topologiyasi", I.Network],
    ["traffic", "Trafik tahlili", I.Activity], ["ai", "AI tahlil & hisobot", I.Sparkles],
    ["kpi", "KPI reyting", I.BarChart3], ["reports", "Hisobotlar", I.FileText],
    ["tokens", "Audit tokenlar", I.KeyRound], ["users", "Foydalanuvchilar", I.Users],
    ["permissions", "Rollar va ruxsatlar", I.ShieldCheck], ["logs", "Audit loglar", I.History],
    ["agent", "EXE agent", I.Monitor], ["settings", "Sozlamalar", I.Settings],
    ["profile", "Profil", I.User],
  ];

  function CommandPalette({ open, onClose, setRoute, openAudit, openFinding, openOrg }) {
    const [q, setQ] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
      if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); }
    }, [open]);

    const items = useMemo(() => {
      const all = [];
      PAGES.forEach(([route, label, icon]) => all.push({ cat: "Sahifalar", icon, label, meta: "Sahifaga o‘tish", kw: (label + " " + route).toLowerCase(), run: () => setRoute(route) }));
      D.AUDITS.forEach(a => all.push({ cat: "Auditlar", icon: I.FolderKanban, label: a.title, meta: a.code + " · " + D.orgById(a.org).name, kw: (a.title + " " + a.code).toLowerCase(), run: () => openAudit(a.id) }));
      D.FINDINGS.forEach(f => all.push({ cat: "Topilmalar", icon: I.AlertTriangle, label: f.title, meta: f.id + " · " + f.asset + " · CVSS " + f.cvss, kw: (f.title + " " + f.id + " " + f.asset + " " + f.cwe).toLowerCase(), run: () => { setRoute("findings"); openFinding(f.id); } }));
      D.TASKS.forEach(t => all.push({ cat: "Vazifalar", icon: I.CheckSquare, label: t.title, meta: t.id + " · " + t.type, kw: (t.title + " " + t.id).toLowerCase(), run: () => setRoute("tasks") }));
      D.ORGS.forEach(o => all.push({ cat: "Tashkilotlar", icon: I.Building2, label: o.name, meta: "STIR " + o.stir, kw: (o.name + " " + o.stir).toLowerCase(), run: () => openOrg ? openOrg(o.id) : setRoute("orgs") }));
      D.USERS.forEach(u => all.push({ cat: "Foydalanuvchilar", icon: I.User, label: u.name, meta: u.title, kw: (u.name + " " + u.title).toLowerCase(), run: () => setRoute("users") }));
      return all;
    }, []);

    const results = useMemo(() => {
      const query = q.trim().toLowerCase();
      if (!query) {
        // default: quick pages + a couple of audits
        return items.filter(i => i.cat === "Sahifalar").slice(0, 6)
          .concat(items.filter(i => i.cat === "Auditlar").slice(0, 3));
      }
      const terms = query.split(/\s+/);
      const scored = items
        .map(i => ({ i, hit: terms.every(t => i.kw.includes(t)) }))
        .filter(x => x.hit)
        .map(x => x.i);
      // cap per category to keep the list tidy
      const counts = {};
      return scored.filter(i => { counts[i.cat] = (counts[i.cat] || 0) + 1; return counts[i.cat] <= 6; }).slice(0, 24);
    }, [q, items]);

    useEffect(() => { setActive(0); }, [q]);

    // keep active item in view without scrollIntoView
    useEffect(() => {
      const list = listRef.current; if (!list) return;
      const el = list.querySelector('[data-idx="' + active + '"]');
      if (!el) return;
      const top = el.offsetTop, bottom = top + el.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top - 6;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 6;
    }, [active, results]);

    function onKey(e) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(results.length - 1, a + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
      else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) { r.run(); onClose(); } }
    }

    if (!open) return null;

    // group results for display while keeping a flat index for keyboard nav
    let idx = -1;
    const groups = [];
    results.forEach(r => {
      let g = groups.find(x => x.cat === r.cat);
      if (!g) { g = { cat: r.cat, items: [] }; groups.push(g); }
      g.items.push(r);
    });

    return h("div", { className: "cmdk-overlay", onMouseDown: onClose }, [
      h("div", { key: "p", className: "cmdk", onMouseDown: e => e.stopPropagation(), role: "dialog", "aria-label": "Qidiruv" }, [
        h("div", { key: "in", className: "cmdk__input-wrap" }, [
          h(I.Search, { key: "i", size: 18, style: { color: "var(--text-tertiary)", flexShrink: 0 } }),
          h("input", {
            key: "f", ref: inputRef, className: "cmdk__input", value: q,
            placeholder: "Audit, topilma, vazifa, tashkilot yoki sahifa qidirish...",
            onChange: e => setQ(e.target.value), onKeyDown: onKey,
          }),
          h("span", { key: "esc", className: "ui-kbd" }, "ESC"),
        ]),
        h("div", { key: "l", className: "cmdk__list", ref: listRef },
          results.length === 0
            ? h("div", { className: "cmdk__empty" }, [h(I.Search, { key: "i", size: 22, style: { opacity: 0.4 } }), h("div", { key: "t" }, "“" + q + "” bo‘yicha hech narsa topilmadi")])
            : groups.map(g => h("div", { key: g.cat, className: "cmdk__group" }, [
                h("div", { key: "h", className: "cmdk__group-label" }, g.cat),
                ...g.items.map(r => {
                  idx++;
                  const myIdx = idx;
                  return h("button", {
                    key: myIdx, type: "button", "data-idx": myIdx,
                    className: "cmdk__item" + (active === myIdx ? " cmdk__item--active" : ""),
                    onMouseMove: () => setActive(myIdx),
                    onClick: () => { r.run(); onClose(); },
                  }, [
                    h("span", { key: "i", className: "cmdk__item-icon" }, h(r.icon, { size: 16 })),
                    h("span", { key: "l", className: "cmdk__item-label" }, r.label),
                    h("span", { key: "m", className: "cmdk__item-meta" }, r.meta),
                  ]);
                }),
              ]))
        ),
        h("div", { key: "ft", className: "cmdk__foot" }, [
          h("span", { key: 1 }, [h("span", { key: "a", className: "ui-kbd" }, "↑"), h("span", { key: "b", className: "ui-kbd" }, "↓"), " harakat"]),
          h("span", { key: 2 }, [h("span", { key: "a", className: "ui-kbd" }, "↵"), " ochish"]),
          h("span", { key: 3, style: { marginLeft: "auto" } }, results.length + " natija"),
        ]),
      ]),
    ]);
  }

  window.CommandPalette = CommandPalette;
})();
