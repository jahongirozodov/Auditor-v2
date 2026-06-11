"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { notifTitleKey, notifValues } from "@/lib/notifications/render";

type NotifRow = Prisma.NotificationGetPayload<object>;

export function NotificationsScreen({ items: initial }: { items: NotifRow[] }) {
  const t = useTranslations("notifications");
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const visible = filter === "unread" ? items.filter((n) => !n.readAt) : items;

  async function handleRead(id: string) {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n)));
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date() })));
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <h1 className="panel__title">{t("title")}</h1>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <button
            type="button"
            className={`btn btn--sm${filter === "all" ? " btn--primary" : " btn--ghost"}`}
            onClick={() => setFilter("all")}
          >
            {t("filterAll")}
          </button>
          <button
            type="button"
            className={`btn btn--sm${filter === "unread" ? " btn--primary" : " btn--ghost"}`}
            onClick={() => setFilter("unread")}
          >
            {t("filterUnread")}
          </button>
          <button type="button" className="btn btn--sm btn--ghost" onClick={handleMarkAll}>
            {t("markAllRead")}
          </button>
        </div>
      </div>
      <div className="panel__body">
        {visible.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", padding: "var(--space-4)" }}>{t("empty")}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {visible.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontWeight: item.readAt ? undefined : "600",
                }}
              >
                <Link
                  href={item.href ?? "#"}
                  onClick={() => handleRead(item.id)}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {t(notifTitleKey(item.type as Parameters<typeof notifTitleKey>[0]), notifValues(item.params))}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
