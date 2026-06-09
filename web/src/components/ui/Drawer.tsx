"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** Right-side drawer over the `.drawer` classes. Closes on backdrop click + Escape. */
export function Drawer({
  open,
  onClose,
  title,
  footer,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-bg" onClick={onClose}>
      <div
        className={`drawer${wide ? " drawer--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer__h">
          {typeof title === "string" ? <span className="panel__t">{title}</span> : title}
          <button type="button" className="iconbtn" aria-label="Yopish" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer ? <div className="drawer__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
