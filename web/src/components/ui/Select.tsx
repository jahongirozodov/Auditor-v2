"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface PanelPos {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  above: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  placeholder?: string;
  size?: "sm";
}

export function Select({
  options,
  value,
  onChange,
  id,
  className,
  style,
  disabled,
  placeholder = "—",
  size,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [pos, setPos] = useState<PanelPos>({ top: 0, left: 0, width: 0, above: false });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;

  function calcPos(): PanelPos {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return { top: 0, left: 0, width: 0, above: false };
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < 280 && rect.top > 280;
    if (above) {
      return {
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
        above: true,
      };
    }
    return { top: rect.bottom + 4, left: rect.left, width: rect.width, above: false };
  }

  function openDropdown() {
    if (disabled) return;
    setPos(calcPos());
    setSearch("");
    setHighlighted(value ?? filtered[0]?.value ?? null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSearch("");
    triggerRef.current?.focus();
  }

  function pick(val: string) {
    onChange?.(val);
    close();
  }

  function handleTriggerKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      openDropdown();
    }
  }

  function handlePanelKey(e: React.KeyboardEvent) {
    const idx = filtered.findIndex((o) => o.value === highlighted);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted(filtered[Math.min(idx + 1, filtered.length - 1)]?.value ?? null);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted(filtered[Math.max(idx - 1, 0)]?.value ?? null);
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted) pick(highlighted);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  // Focus search on open
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    if (open && filtered.length > 0 && !filtered.find((o) => o.value === highlighted)) {
      setHighlighted(filtered[0].value);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll highlighted option into view
  useEffect(() => {
    if (!open || !highlighted || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-val="${CSS.escape(highlighted)}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    function update() {
      setPos(calcPos());
    }
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerCls = [
    "cselect",
    size === "sm" ? "cselect--sm" : "",
    open ? "cselect--open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: pos.left,
    width: pos.width,
    zIndex: 1100,
    ...(pos.above ? { bottom: pos.bottom } : { top: pos.top }),
  };

  const panel =
    open && mounted
      ? createPortal(
          <>
            <div className="cselect-overlay" onClick={close} />
            <div
              className={`cselect-panel${pos.above ? " cselect-panel--above" : ""}`}
              style={panelStyle}
              onKeyDown={handlePanelKey}
            >
              <div className="cselect-search">
                <Search size={13} className="cselect-search__icon" aria-hidden="true" />
                <input
                  ref={searchRef}
                  className="cselect-search__input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handlePanelKey}
                  placeholder="Qidirish…"
                  aria-label="Qidirish"
                  autoComplete="off"
                />
              </div>
              <ul
                ref={listRef}
                className="cselect-list"
                role="listbox"
                id={listId}
                aria-label="Variantlar"
              >
                {filtered.length === 0 ? (
                  <li className="cselect-empty" role="option" aria-disabled="true">
                    Topilmadi
                  </li>
                ) : (
                  filtered.map((o) => (
                    <li
                      key={o.value}
                      className={[
                        "cselect-option",
                        o.value === value ? "cselect-option--selected" : "",
                        o.value === highlighted ? "cselect-option--hl" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-val={o.value}
                      role="option"
                      aria-selected={o.value === value}
                      onClick={() => pick(o.value)}
                      onMouseEnter={() => setHighlighted(o.value)}
                    >
                      {o.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={triggerCls}
        style={style}
        disabled={disabled}
        onClick={openDropdown}
        onKeyDown={handleTriggerKey}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
      >
        <span className={`cselect__val${!selected ? " cselect__val--ph" : ""}`}>
          {displayLabel}
        </span>
        <ChevronDown size={14} className="cselect__arrow" aria-hidden="true" />
      </button>
      {panel}
    </>
  );
}
