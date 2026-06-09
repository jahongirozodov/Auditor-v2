"use client";

import { useCallback, useEffect, useState } from "react";
import type { RoleCode } from "@/lib/types/roles";
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

/**
 * Authenticated app chrome — the `.app` CSS grid (Topbar across the top, Sidebar
 * left, scrolling canvas right). Holds sidebar collapse state.
 */
export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <div className="app" data-collapsed={collapsed ? "true" : "false"}>
      <Topbar
        user={user}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onOpenSearch={() => setPaletteOpen(true)}
      />
      <Sidebar role={user.role} />
      <main className="canvas">
        <ToastProvider>
          <div className="canvas__inner">{children}</div>
        </ToastProvider>
      </main>
      {paletteOpen ? <CommandPalette onClose={closePalette} /> : null}
    </div>
  );
}
