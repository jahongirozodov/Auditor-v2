"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAV, navVisible } from "@/lib/nav";
import type { RoleCode } from "@/lib/types/roles";

/**
 * Role-filtered nav. Visibility is an explicit allowlist (lib/nav.ts) mirroring the
 * prototype — UI gating only. Real authorization is enforced server-side per page.
 */
export function Sidebar({ role }: { role: RoleCode }) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tShell = useTranslations("shell");

  return (
    <aside className="sidebar">
      {NAV.map((group) => {
        const items = group.items.filter((item) => navVisible(item, role));
        if (items.length === 0) return null;
        return (
          <Fragment key={group.labelKey}>
            <div className="sidebar__label">{tNav(group.labelKey)}</div>
            <div className="sidebar__section">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`navitem${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon />
                    <span className="label">{tNav(item.labelKey)}</span>
                    {item.count != null ? <span className="count">{item.count}</span> : null}
                  </Link>
                );
              })}
            </div>
          </Fragment>
        );
      })}
      <div className="sidebar__foot">
        <strong>{tShell("footTitle")}</strong>
        <span>{tShell("footText")}</span>
      </div>
    </aside>
  );
}
