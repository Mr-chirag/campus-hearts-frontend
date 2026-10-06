"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { GENDER_OPTIONS, type Gender } from "@/types";

/**
 * The user's own gender: Male / Female / Other. Shared by the signup wizard and
 * profile edit so the two can't drift.
 *
 * There is deliberately no "who are you looking for" question. Discovery shows
 * everyone on campus regardless of gender, so asking would promise a filter
 * that doesn't exist.
 */
export function GenderFields({
  gender,
  onGenderChange,
  error,
}: {
  gender: Gender | null;
  onGenderChange: (value: Gender) => void;
  error?: string;
}) {
  return (
    <div>
      <fieldset role="radiogroup" aria-label="Gender">
        <legend className="mb-2 ml-1 text-sm font-semibold text-ink">Gender</legend>
        <div className="grid grid-cols-3 gap-2">
          {GENDER_OPTIONS.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              selected={gender === option.value}
              onClick={() => onGenderChange(option.value)}
            />
          ))}
        </div>
      </fieldset>

      {error && <p className="ml-1 mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Choice({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={cn(
        "flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary/5 text-primary-ink"
          : "border-border bg-surface text-ink hover:border-accent"
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      {selected && <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden />}
    </button>
  );
}
