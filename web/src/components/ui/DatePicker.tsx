"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];
const DAYS = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(value: string): string {
  const d = parseDate(value);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function firstDowMonday(year: number, month: number): number {
  const dow = new Date(year, month, 1).getDay();
  return dow === 0 ? 6 : dow - 1;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "KK.OO.YYYY",
  disabled = false,
}: DatePickerProps) {
  const today = new Date();
  const todayYMD = toYMD(today);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPtr(e: PointerEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !popRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() { setOpen(false); }
    document.addEventListener("pointerdown", onPtr);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPtr);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  function toggle() {
    if (disabled) return;
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setPos({ top: rect.bottom + 6, left: rect.left });
      }
      const p = parseDate(value);
      setViewYear(p?.getFullYear() ?? today.getFullYear());
      setViewMonth(p?.getMonth() ?? today.getMonth());
    }
    setOpen((v) => !v);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const ymd = toYMD(new Date(viewYear, viewMonth, day));
    if ((min && ymd < min) || (max && ymd > max)) return;
    onChange(ymd);
    setOpen(false);
  }

  const leading = firstDowMonday(viewYear, viewMonth);
  const total = daysInMonth(viewYear, viewMonth);

  const popover = open
    ? createPortal(
        <div
          ref={popRef}
          role="dialog"
          aria-modal="false"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: "14px 12px 12px",
            width: 272,
            animation: "dp-drop 120ms var(--ease-out)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button type="button" className="iconbtn" onClick={prevMonth} aria-label="Oldingi oy"
              style={{ width: 26, height: 26 }}>
              <ChevronLeft size={13} />
            </button>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" className="iconbtn" onClick={nextMonth} aria-label="Keyingi oy"
              style={{ width: 26, height: 26 }}>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {DAYS.map((d) => (
              <div key={d} style={{
                textAlign: "center", fontSize: 10.5, fontWeight: 700,
                color: "var(--text-tertiary)", padding: "2px 0", letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: leading }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: total }, (_, i) => {
              const day = i + 1;
              const ymd = toYMD(new Date(viewYear, viewMonth, day));
              const isSel = ymd === value;
              const isToday = ymd === todayYMD;
              const isOff = (!!min && ymd < min) || (!!max && ymd > max);
              const cls = ["dp-day", isSel ? "dp-day--sel" : "", isToday ? "dp-day--today" : ""].filter(Boolean).join(" ");
              return (
                <button key={day} type="button" className={cls} disabled={isOff}
                  onClick={() => selectDay(day)}
                  style={{
                    color: isSel ? undefined : isOff ? "var(--text-tertiary)" : "var(--text-primary)",
                    fontWeight: isToday && !isSel ? 600 : undefined,
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <style>{`
        .dp-day{all:unset;display:flex;align-items:center;justify-content:center;
          aspect-ratio:1;border-radius:var(--radius-sm);font-size:12.5px;cursor:pointer;
          transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out);
          border:1px solid transparent;box-sizing:border-box;width:100%;}
        .dp-day:disabled{opacity:.35;cursor:not-allowed;}
        .dp-day:not(:disabled):not(.dp-day--sel):hover{background:var(--bg-hover);}
        .dp-day--today:not(.dp-day--sel){border-bottom-color:var(--brand);border-bottom-width:2px;}
        .dp-day--sel{background:var(--brand)!important;color:var(--brand-foreground)!important;font-weight:600;}
        @keyframes dp-drop{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}
      `}</style>

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="input"
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          color: value ? "var(--text-primary)" : "var(--text-tertiary)",
          fontFamily: "inherit",
        }}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <Calendar
          size={13}
          style={{
            color: open ? "var(--brand)" : "var(--text-tertiary)",
            flexShrink: 0,
            transition: "color var(--dur-fast) var(--ease-out)",
          }}
        />
      </button>

      {popover}
    </>
  );
}
