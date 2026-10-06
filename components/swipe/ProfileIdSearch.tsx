"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, PremiumBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

/**
 * "Search by profile ID" on Discover. Finds one specific person directly,
 * instead of waiting for them to come up in the deck.
 *
 * The result links to the full profile page rather than embedding it: opening
 * /profile/[userId] is what records the profile view server-side, so their
 * "Who Viewed You" stays accurate.
 */
export function ProfileIdSearch() {
  const me = useAuthStore((s) => s.user);
  const { searchResult, searchError, isSearching, searchByProfileId, clearSearch } =
    useProfileStore();
  const [query, setQuery] = useState("");

  // Results are per-visit; don't greet the next visit with a stale one.
  useEffect(() => clearSearch, [clearSearch]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value || isSearching) return;
    void searchByProfileId(value);
  };

  const reset = () => {
    setQuery("");
    clearSearch();
  };

  const isMe = !!searchResult && searchResult._id === me?._id;

  return (
    <section className="mb-5" aria-label="Search by profile ID">
      <form onSubmit={submit} className="flex gap-2" role="search">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-subtext"
            aria-hidden
          />
          <label htmlFor="profile-id-search" className="sr-only">
            Profile ID
          </label>
          <input
            id="profile-id-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searchError) clearSearch();
            }}
            placeholder="Search by profile ID, e.g. CH7K2Q9P"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={16}
            aria-invalid={searchError ? true : undefined}
            aria-describedby={searchError ? "profile-id-search-error" : undefined}
            className="h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-10 font-mono text-[15px] uppercase text-ink shadow-sm outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:text-subtext focus:border-primary"
          />
          {query && (
            <button
              type="button"
              onClick={reset}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-subtext hover:bg-ink/5"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <Button type="submit" size="md" disabled={!query.trim() || isSearching}>
          {isSearching ? <Spinner label="Searching" /> : "Search"}
        </Button>
      </form>

      {searchError && (
        <p id="profile-id-search-error" role="alert" className="ml-1 mt-2 text-sm text-danger">
          {searchError}
        </p>
      )}

      {searchResult && (
        <div className="mt-3 flex items-center gap-4 rounded-card border border-border bg-surface p-4">
          <Avatar src={searchResult.photos?.[0]} name={searchResult.full_name} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">
              {searchResult.full_name}
              {isMe && <span className="font-normal text-subtext"> (you)</span>}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge>Semester {searchResult.semester}</Badge>
              <Badge>{searchResult.branch}</Badge>
              {searchResult.is_premium && <PremiumBadge />}
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={isMe ? "/profile" : `/profile/${searchResult._id}`}>
              View
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
