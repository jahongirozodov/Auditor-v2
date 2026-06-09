"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Building2, CheckSquare, FolderKanban, Search, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NAV } from "@/lib/nav";
import { AUDITS, FINDINGS, ORGS, TASKS, USERS, orgById } from "@/lib/fixtures";

interface CmdItem {
  cat: string;
  icon: LucideIcon;
  label: string;
  meta: string;
  kw: string;
  href: string;
}

/**
 * ⌘K command palette (ported from components-search.jsx). Mounted only while open
 * (AppShell), so each open starts fresh. Navigates via the App Router.
 */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const t = useTranslations("cmdk");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const catPages = t("catPages");
  const catAudits = t("catAudits");

  const items = useMemo<CmdItem[]>(() => {
    const all: CmdItem[] = [];
    NAV.forEach((g) =>
      g.items.forEach((it) =>
        all.push({
          cat: catPages,
          icon: it.icon,
          label: tNav(it.labelKey),
          meta: "",
          kw: tNav(it.labelKey).toLowerCase(),
          href: it.href,
        }),
      ),
    );
    AUDITS.forEach((a) =>
      all.push({
        cat: catAudits,
        icon: FolderKanban,
        label: a.title,
        meta: `${a.code} · ${orgById(a.org)?.name ?? ""}`,
        kw: `${a.title} ${a.code}`.toLowerCase(),
        href: `/audits/${a.id}`,
      }),
    );
    FINDINGS.forEach((f) =>
      all.push({
        cat: t("catFindings"),
        icon: AlertTriangle,
        label: f.title,
        meta: `${f.id} · ${f.asset} · CVSS ${f.cvss}`,
        kw: `${f.title} ${f.id} ${f.asset}`.toLowerCase(),
        href: "/findings",
      }),
    );
    TASKS.forEach((tk) =>
      all.push({
        cat: t("catTasks"),
        icon: CheckSquare,
        label: tk.title,
        meta: `${tk.id} · ${tk.type}`,
        kw: `${tk.title} ${tk.id}`.toLowerCase(),
        href: `/tasks/${tk.id}`,
      }),
    );
    ORGS.forEach((o) =>
      all.push({
        cat: t("catOrgs"),
        icon: Building2,
        label: o.name,
        meta: `STIR ${o.stir}`,
        kw: `${o.name} ${o.stir}`.toLowerCase(),
        href: `/organizations/${o.id}`,
      }),
    );
    USERS.forEach((u) =>
      all.push({
        cat: t("catUsers"),
        icon: User,
        label: u.name,
        meta: u.title,
        kw: `${u.name} ${u.title}`.toLowerCase(),
        href: "/users",
      }),
    );
    return all;
  }, [t, tNav, catPages, catAudits]);

  const results = useMemo<CmdItem[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      return [
        ...items.filter((i) => i.cat === catPages).slice(0, 6),
        ...items.filter((i) => i.cat === catAudits).slice(0, 3),
      ];
    }
    const terms = query.split(/\s+/);
    const counts: Record<string, number> = {};
    return items
      .filter((i) => terms.every((tm) => i.kw.includes(tm)))
      .filter((i) => {
        counts[i.cat] = (counts[i.cat] ?? 0) + 1;
        return counts[i.cat] <= 6;
      })
      .slice(0, 24);
  }, [q, items, catPages, catAudits]);

  const act = Math.min(active, Math.max(0, results.length - 1));

  function run(item: CmdItem) {
    router.push(item.href);
    onClose();
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(act + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(act - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[act]) run(results[act]);
    }
  }

  // Group results by category, preserving first-seen order.
  const groups: { cat: string; items: { item: CmdItem; idx: number }[] }[] = [];
  results.forEach((item, idx) => {
    let g = groups.find((x) => x.cat === item.cat);
    if (!g) {
      g = { cat: item.cat, items: [] };
      groups.push(g);
    }
    g.items.push({ item, idx });
  });

  return (
    <div className="cmdk-overlay" onMouseDown={onClose}>
      <div
        className="cmdk"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Qidiruv"
      >
        <div className="cmdk__input-wrap">
          <Search size={18} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
          <input
            autoFocus
            className="cmdk__input"
            value={q}
            placeholder={t("placeholder")}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
          />
          <span className="ui-kbd">ESC</span>
        </div>

        <div className="cmdk__list">
          {results.length === 0 ? (
            <div className="cmdk__empty">
              <Search size={22} style={{ opacity: 0.4 }} />
              <div>{t("empty", { q })}</div>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.cat} className="cmdk__group">
                <div className="cmdk__group-label">{g.cat}</div>
                {g.items.map(({ item, idx }) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`${item.cat}-${item.label}-${idx}`}
                      type="button"
                      className={`cmdk__item${idx === act ? " cmdk__item--active" : ""}`}
                      onMouseMove={() => setActive(idx)}
                      onClick={() => run(item)}
                    >
                      <span className="cmdk__item-icon">
                        <Icon size={16} />
                      </span>
                      <span className="cmdk__item-label">{item.label}</span>
                      <span className="cmdk__item-meta">{item.meta}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="cmdk__foot">
          <span>
            <span className="ui-kbd">↑</span>
            <span className="ui-kbd">↓</span> {t("move")}
          </span>
          <span>
            <span className="ui-kbd">↵</span> {t("open")}
          </span>
          <span style={{ marginLeft: "auto" }}>{t("results", { count: results.length })}</span>
        </div>
      </div>
    </div>
  );
}
