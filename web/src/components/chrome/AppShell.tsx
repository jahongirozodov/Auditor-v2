"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { RoleCode } from "@/lib/types/roles";
import type { NavCounts } from "@/lib/nav";
import { CommandPalette } from "@/components/search/CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export interface ShellUser {
  id: string;
  name: string;
  title: string;
  avatar: string;
  role: RoleCode;
}

const TABLET_BREAKPOINT = 1024;

/**
 * Authenticated app chrome — the `.app` CSS grid (Topbar across the top, Sidebar
 * left, scrolling canvas right). Holds sidebar collapse state (desktop) and
 * drawer open state (tablet ≤1024px).
 */
export function AppShell({
  user,
  navCounts,
  children,
}: {
  user: ShellUser;
  navCounts: NavCounts;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change (tablet nav)
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // On tablet: toggle drawer. On desktop: toggle sidebar collapse.
  const handleToggleSidebar = useCallback(() => {
    if (window.innerWidth <= TABLET_BREAKPOINT) {
      setDrawerOpen((d) => !d);
    } else {
      setCollapsed((c) => !c);
    }
  }, []);

  return (
    <div
      className="app"
      data-collapsed={collapsed ? "true" : "false"}
      data-drawer-open={drawerOpen ? "true" : "false"}
    >
      <Topbar
        user={user}
        onToggleSidebar={handleToggleSidebar}
        onOpenSearch={() => setPaletteOpen(true)}
      />
      <Sidebar role={user.role} counts={navCounts} />
      <div
        className="sidebar-backdrop"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <main className="canvas">
        <ToastProvider>
          <div className="canvas__inner">{children}</div>
        </ToastProvider>
      </main>
      {paletteOpen ? <CommandPalette onClose={closePalette} /> : null}
    </div>
  );
}
