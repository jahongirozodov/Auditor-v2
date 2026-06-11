"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  pollNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notifications";
import { notifTitleKey, notifValues } from "@/lib/notifications/render";
import type { Prisma } from "@prisma/client";

type NotifRow = Prisma.NotificationGetPayload<object>;

const POLL_MS = 30_000;

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

export function NotifBell() {
  const t = useTranslations("notifications");
  const tShell = useTranslations("shell");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotifRow[]>([]);

  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  const poll = useCallback(async () => {
    if (document.hidden) return;
    try {
      const result = await pollNotifications();
      setUnread(result.unread);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setItems(result.items as any);
    } catch {
      // silent — bell is non-critical
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll();
    const id = setInterval(() => { void poll(); }, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  async function handleRowClick(item: NotifRow) {
    await markNotificationRead(item.id);
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date() } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
    if (item.href) router.push(item.href);
    setOpen(false);
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date() })));
    setUnread(0);
    setOpen(false);
  }

  return (
    <div className="notif-menu" ref={ref}>
      <button
        type="button"
        className={`iconbtn${open ? " is-active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={tShell("notifications")}
        onClick={() => setOpen((o) => !o)}
        style={{ position: "relative" }}
      >
        <Bell size={18} />
        {unread > 0 && <span className="dot" />}
      </button>
      {open ? (
        <div className="notif-menu__pop" role="menu">
          <div className="notif-menu__head">
            <div className="notif-menu__title">
              <span>{t("title")}</span>
              {unread > 0 && <span className="notif-menu__badge">{unread}</span>}
            </div>
            <button type="button" className="notif-menu__mark" onClick={handleMarkAll}>
              {t("markAllRead")}
            </button>
          </div>
          <div className="notif-menu__list">
            {items.length === 0 ? (
              <div
                style={{
                  padding: "var(--space-3)",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                {t("empty")}
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notif-menu__item${item.readAt ? "" : " is-unread"}`}
                  onClick={() => handleRowClick(item)}
                >
                  {t(
                    notifTitleKey(item.type as Parameters<typeof notifTitleKey>[0]),
                    notifValues(item.params),
                  )}
                </button>
              ))
            )}
          </div>
          <div className="notif-menu__foot">
            <Link href="/notifications" className="notif-menu__all" onClick={close}>
              <span>{t("all")}</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
