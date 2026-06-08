"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

/**
 * Reads the active theme straight from the <html data-theme> attribute (set
 * pre-paint by the bootstrap script in layout.tsx) via useSyncExternalStore —
 * no setState-in-effect, no hydration flash. The real app will fold this into
 * the Topbar (see DEVELOPMENT-PLAN — Phase 2).
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("ds-no-transition");
    root.setAttribute("data-theme", next); // MutationObserver re-renders this component
    try {
      localStorage.setItem("auditor-theme", next);
    } catch {
      // ignore (private mode / closed network)
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("ds-no-transition")),
    );
  }, [theme]);

  return (
    <button type="button" className="btn btn--secondary btn--sm" onClick={toggle}>
      {label}: {theme}
    </button>
  );
}
