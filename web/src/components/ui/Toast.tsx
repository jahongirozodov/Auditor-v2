"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ToastTone = "success" | "info" | "warning" | "danger";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast>(() => {});

/** Imperative-style toast trigger. Replaces the prototype's window.showToast. */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}

let counter = 0;

export function ToastProvider({
  children,
  duration = 3200,
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback<ShowToast>(
    (message, tone = "info") => {
      const id = ++counter;
      setItems((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), duration);
    },
    [duration],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-host">
        {items.map((t) => (
          <div key={t.id} role="status" className={`toast toast--in toast--${t.tone}`}>
            <span className="toast__msg">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
