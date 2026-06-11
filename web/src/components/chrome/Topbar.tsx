"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckSquare,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { NotifBell } from "./NotifBell";
import { logoutAction } from "@/app/(app)/actions";
import type { ShellUser } from "./AppShell";

type Theme = "dark" | "light";

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/** Close a popover on outside click + Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function Topbar({
  user,
  onToggleCollapse,
  onOpenSearch,
}: {
  user: ShellUser;
  onToggleCollapse: () => void;
  onOpenSearch?: () => void;
}) {
  const t = useTranslations("shell");
  const tNav = useTranslations("nav");
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "dark" as Theme);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useDismiss(
    menuOpen,
    useCallback(() => setMenuOpen(false), []),
  );

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("ds-no-transition");
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("auditor-theme", next);
    } catch {
      // ignore
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("ds-no-transition")),
    );
  }, [theme]);

  return (
    <header className="shell-top">
      <div className="shell-top__brand">
        <div className="brand-mark">
          <ShieldCheck size={18} />
        </div>
        <div className="brand-text-wrap">
          <span className="brand-title">Auditor</span>
          <span className="brand-sub">{t("brandSub")}</span>
        </div>
      </div>

      <button
        type="button"
        className="iconbtn"
        aria-label={t("toggleSidebar")}
        onClick={onToggleCollapse}
      >
        <Menu size={18} />
      </button>

      <button type="button" className="shell-top__search" onClick={onOpenSearch}>
        <Search className="icon-search" />
        <span className="shell-top__search-ph">{t("searchPlaceholder")}</span>
        <span className="kbd-hint">⌘K</span>
      </button>

      <div className="shell-top__actions">
        <button
          type="button"
          className="iconbtn"
          aria-label={t("toggleTheme")}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotifBell />

        <Link href="/ai" className="iconbtn" aria-label="AI">
          <Sparkles size={18} />
        </Link>

        <div className="divider-v" style={{ height: 24, margin: "0 4px" }} />

        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className={`user-pill${menuOpen ? " is-open" : ""}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="avatar" title={user.name}>
              {user.avatar}
            </span>
            <div className="user-pill__text">
              <span className="user-pill__name">{user.name}</span>
              <span className="user-pill__role">{user.title}</span>
            </div>
            <ChevronDown className="user-pill__chev" style={{ color: "var(--text-tertiary)" }} />
          </button>
          {menuOpen ? (
            <div className="user-menu__pop" role="menu">
              <div className="user-menu__head">
                <span className="avatar avatar--lg" title={user.name}>
                  {user.avatar}
                </span>
                <div className="user-menu__head-text">
                  <div className="user-menu__name">{user.name}</div>
                  <div className="user-menu__sub">{user.title}</div>
                </div>
              </div>
              <div className="user-menu__group">
                <Link href="/profile" className="user-menu__item" role="menuitem">
                  <User size={16} />
                  <span>{t("myProfile")}</span>
                </Link>
                <Link href="/tasks" className="user-menu__item" role="menuitem">
                  <CheckSquare size={16} />
                  <span>{t("myTasks")}</span>
                </Link>
                <Link href="/settings" className="user-menu__item" role="menuitem">
                  <Settings size={16} />
                  <span>{tNav("settings")}</span>
                </Link>
              </div>
              <div className="user-menu__sep" />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="user-menu__item user-menu__item--danger"
                  role="menuitem"
                >
                  <LogOut size={16} />
                  <span>{t("logout")}</span>
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
