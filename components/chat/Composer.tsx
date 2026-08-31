"use client";

import { Send } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface ComposerProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_ROWS_HEIGHT = 160;

/**
 * Auto-growing textarea.
 *
 * Enter sends and Shift+Enter makes a newline — the convention everywhere on
 * the web. On touch that would be hostile (the on-screen Return key is how you
 * make a newline), so soft keyboards get `enterKeyHint="send"` and the button
 * instead; the Enter-to-send shortcut is suppressed when the event carries no
 * physical-keyboard hint.
 */
export function Composer({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
  placeholder = "Message…",
}: ComposerProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_HEIGHT)}px`;
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    onStopTyping();
    setValue("");
    // Reset the box back to one row.
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.height = "auto";
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex shrink-0 items-end gap-2 border-t border-border bg-bg/95 px-3 py-3 pb-safe backdrop-blur-lg"
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        enterKeyHint="send"
        onChange={(e) => {
          setValue(e.target.value);
          resize();
          if (e.target.value.trim()) onTyping();
          else onStopTyping();
        }}
        onBlur={onStopTyping}
        onKeyDown={(e) => {
          // e.shiftKey guards the newline; the composition check stops an IME
          // (Hindi, Japanese, emoji pickers) from sending mid-candidate.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        className={cn(
          "max-h-40 min-h-12 flex-1 resize-none rounded-3xl border border-primary/10 bg-surface px-4 py-3 text-[15px] text-ink shadow-sm outline-none transition-colors",
          "placeholder:text-subtext focus:border-primary"
        )}
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-md transition-all active:scale-90 disabled:opacity-40"
      >
        <Send className="size-5" />
      </button>
    </form>
  );
}
