import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

/** Labeled form field wrapper over the `.field` classes. */
export function Field({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      {label ? (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Leading icon (must carry the `icon-l` class). Wraps the input in `.input-group`. */
  iconLeft?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { iconLeft, className, ...rest },
  ref,
) {
  const input = (
    <input ref={ref} className={["input", className].filter(Boolean).join(" ")} {...rest} />
  );
  if (!iconLeft) return input;
  return (
    <div className="input-group">
      {iconLeft}
      {input}
    </div>
  );
});
