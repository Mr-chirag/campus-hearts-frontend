"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

interface OtpInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  length?: number;
}

/**
 * Six single-character boxes behaving as one field.
 *
 * Web affordances the app's version could not have: real paste of the whole
 * code from anywhere in the row, arrow-key navigation, and
 * `autocomplete="one-time-code"` on the first box so iOS/Android offer the SMS
 * or mail code above the keyboard.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  length = 6,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const commit = (next: string[]) => {
    onChange(next);
    const code = next.join("");
    if (code.length === length && !next.includes("")) onComplete?.(code);
  };

  const handleChange = (raw: string, index: number) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      const next = [...value];
      next[index] = "";
      return commit(next);
    }

    // A paste (or a fast typist) arrives as several digits at once.
    const next = [...value];
    digits
      .slice(0, length - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    commit(next);

    const landed = Math.min(index + digits.length, length - 1);
    inputs.current[landed]?.focus();
    inputs.current[landed]?.select();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      event.preventDefault();
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      inputs.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div
      className="flex justify-between gap-2"
      role="group"
      aria-label={`${length}-digit verification code`}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={value[index] ?? ""}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          // maxLength 6, not 1 — otherwise the browser truncates a pasted code.
          maxLength={length}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-14 w-full min-w-0 rounded-2xl border bg-surface text-center font-display text-2xl font-bold text-ink shadow-sm outline-none transition-colors",
            "focus:border-primary disabled:opacity-50",
            value[index] ? "border-primary" : "border-primary/10"
          )}
        />
      ))}
    </div>
  );
}
