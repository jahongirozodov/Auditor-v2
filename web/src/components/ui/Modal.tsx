"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** Centered modal over the `.modal` classes. Closes on backdrop click + Escape. */
export function Modal({
  open,
  onClose,
  title,
  footer,
  wide = false,
  xl = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  xl?: boolean;
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
  const classes = ["modal", wide ? "modal--wide" : "", xl ? "modal--xl" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className={classes} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div className="modal__t">{title}</div>
          <button type="button" className="iconbtn" aria-label="Yopish" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
