"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { GENDER_OPTIONS, type Gender } from "@/types";

/**
 * Gender and who you want to see. Shared by the signup wizard and profile edit
 * so the two can't drift.
 *
 * `interested_in` is the half that actually does the work: gender alone tells
 * the feed nothing about who to show you. The server applies it as a MUTUAL
 * filter — you see people you're interested in who are also interested in you —
 * so leaving it empty means "show me everyone" rather than "show me nobody".
 */
export function GenderFields({
  gender,
  interestedIn,
  onGenderChange,
  onInterestedInChange,
  error,
}: {
  gender: Gender | null;
  interestedIn: Gender[];
  onGenderChange: (value: Gender) => void;
  onInterestedInChange: (value: Gender[]) => void;
  error?: string;
}) {
  const toggleInterest = (value: Gender) => {
    onInterestedInChange(
      interestedIn.includes(value)
        ? interestedIn.filter((g) => g !== value)
        : [...interestedIn, value]
    );
  };

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 ml-1 text-sm font-semibold text-ink">I am a…</legend>
        <div className="grid grid-cols-2 gap-2">
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

      <fieldset>
        <legend className="mb-1 ml-1 text-sm font-semibold text-ink">
          Show me…
        </legend>
        <p className="mb-2 ml-1 text-xs text-subtext">
          Pick as many as you like. Leave it empty to see everyone.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GENDER_OPTIONS.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              selected={interestedIn.includes(option.value)}
              onClick={() => toggleInterest(option.value)}
              multi
            />
          ))}
        </div>
      </fieldset>

      {error && <p className="ml-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Choice({
  label,
  selected,
  onClick,
  multi,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={multi ? "checkbox" : "radio"}
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
