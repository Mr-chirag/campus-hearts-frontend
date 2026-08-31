"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

let idCounter = 0;
const useFieldId = (provided?: string) => {
  const [generated] = React.useState(() => `field-${++idCounter}`);
  return provided ?? generated;
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Renders a show/hide toggle. Use instead of type="password". */
  revealable?: boolean;
}

/**
 * The app's input: 56px, white, 16px radius, faint brand border.
 * `error` is wired to aria-describedby + aria-invalid so screen readers get the
 * message, not just sighted users.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, revealable, id, type, ...props }, ref) => {
    const fieldId = useFieldId(id);
    const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

    const [revealed, setRevealed] = React.useState(false);
    const resolvedType = revealable ? (revealed ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 ml-1 block text-sm font-semibold text-ink">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={resolvedType}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-14 w-full rounded-2xl border bg-surface px-5 text-base text-ink shadow-sm outline-none transition-colors",
              "placeholder:text-subtext",
              "focus:border-primary",
              error ? "border-danger" : "border-primary/10",
              revealable && "pr-14",
              className
            )}
            {...props}
          />

          {revealable && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-subtext transition-colors hover:text-ink"
              aria-label={revealed ? "Hide password" : "Show password"}
            >
              {revealed ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          )}
        </div>

        {error ? (
          <p id={`${fieldId}-error`} className="ml-1 mt-1.5 text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="ml-1 mt-1.5 text-xs italic text-subtext">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Shows "n / max" beneath the field. Requires maxLength. */
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, showCount, id, maxLength, value, ...props }, ref) => {
    const fieldId = useFieldId(id);
    const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
    const length = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 ml-1 block text-sm font-semibold text-ink">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={fieldId}
          maxLength={maxLength}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-32 w-full resize-y rounded-2xl border bg-surface px-5 py-4 text-base text-ink shadow-sm outline-none transition-colors",
            "placeholder:text-subtext focus:border-primary",
            error ? "border-danger" : "border-primary/10",
            className
          )}
          {...props}
        />

        <div className="ml-1 mt-1.5 flex items-start justify-between gap-3">
          {error ? (
            <p id={`${fieldId}-error`} className="text-xs text-danger">
              {error}
            </p>
          ) : hint ? (
            <p id={`${fieldId}-hint`} className="text-xs italic text-subtext">
              {hint}
            </p>
          ) : (
            <span />
          )}

          {showCount && maxLength ? (
            <span className="shrink-0 text-xs tabular-nums text-subtext">
              {length} / {maxLength}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
