"use client";

/* DatePicker — dizayn-tizimga mos sana tanlash (Next.js / React + TS).
 *
 * NEGA O'Z KOMPONENTIMIZ? Tashqi kutubxonalar (react-datepicker,
 * react-date-picker, native <input type="date">) popup'ni portal orqali
 * <body> ga chiqaradi va o'z stylesheet'iga tayanadi — agar uni import
 * qilmasangiz, popup brauzer default ko'rinishida (stilsiz) chiqadi.
 * Bu komponent faqat global `var(--*)` token'lardan rang oladi, shuning
 * uchun portal'da bo'lsa ham, light/dark'da ham to'g'ri stillanadi.
 *
 * Import qiling: import "./date-picker.css";  (yoki globals.css ga qo'shing)
 */

import { useState, useRef, useEffect } from "react";

const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const WD = ["Du","Se","Ch","Pa","Ju","Sh","Ya"]; // dushanbadan boshlab

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function buildGrid(view: Date): Date[] {
  const y = view.getFullYear(), m = view.getMonth();
  const startOffset = (new Date(y, m, 1).getDay() + 6) % 7; // dushanba = 0
  const start = new Date(y, m, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
}

function ChevronLeft() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
}
function ChevronRight() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>;
}
function CalendarIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x={3} y={4} width={18} height={18} rx={2} /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>;
}

export interface DatePickerProps {
  value: string;                 // "YYYY-MM-DD" yoki ""
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Sanani tanlang" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => (value ? new Date(value) : new Date()));
  const ref = useRef<HTMLDivElement>(null);
  const sel = value ? new Date(value) : null;
  const today = new Date();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const y = view.getFullYear(), m = view.getMonth();
  const days = buildGrid(view);
  const pick = (d: Date) => { onChange(iso(d)); setOpen(false); };

  return (
    <div className="dp" ref={ref}>
      <div
        className={"dp__field" + (open ? " dp__field--open" : "")}
        role="button" tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(o => !o); } }}
      >
        <span className={"dp__val" + (value ? "" : " dp__val--empty")}>{value || placeholder}</span>
        <CalendarIcon />
      </div>

      {open && (
        <div className="dp__pop" role="dialog" aria-label="Sana tanlash">
          <div className="dp__head">
            <div className="dp__title">{MONTHS[m]} {y}</div>
            <div className="dp__nav">
              <button type="button" className="dp__navbtn" aria-label="Oldingi oy" onClick={() => setView(new Date(y, m - 1, 1))}><ChevronLeft /></button>
              <button type="button" className="dp__navbtn" aria-label="Keyingi oy" onClick={() => setView(new Date(y, m + 1, 1))}><ChevronRight /></button>
            </div>
          </div>
          <div className="dp__week">{WD.map(w => <div key={w} className="dp__wd">{w}</div>)}</div>
          <div className="dp__grid">
            {days.map((d, i) => {
              const out = d.getMonth() !== m;
              const cls = "dp__day" + (out ? " dp__day--out" : "") + (sameDay(d, today) ? " dp__day--today" : "") + (sameDay(d, sel) ? " dp__day--sel" : "");
              return <button key={i} type="button" className={cls} onClick={() => pick(d)}>{d.getDate()}</button>;
            })}
          </div>
          <div className="dp__foot">
            <button type="button" className="dp__link" onClick={() => { onChange(""); setOpen(false); }}>Tozalash</button>
            <button type="button" className="dp__link" onClick={() => { const n = new Date(); setView(n); pick(n); }}>Bugun</button>
          </div>
        </div>
      )}
    </div>
  );
}
