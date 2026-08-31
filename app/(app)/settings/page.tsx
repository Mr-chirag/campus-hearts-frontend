"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Switch } from "@/components/ui/Switch";
import { Crown } from "lucide-react";
import { PremiumUpsell } from "@/components/premium/PremiumUpsell";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const deactivateAccount = useAuthStore((s) => s.deactivateAccount);

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  if (!user) return null;

  // Optimistic in the store, with rollback — the switch must never lag under
  // the thumb, and updateSettings deliberately doesn't touch isLoading.
  const toggle = (key: keyof User) => (value: boolean) =>
    void updateSettings({ [key]: value } as Partial<User>);

  return (
    <>
      <AppHeader title="Settings" back="/profile" />

      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 lg:py-8">
        <Card>
          <CardTitle className="mb-1">Discovery</CardTitle>
          <p className="mb-4 text-sm text-subtext">
            Control whether you show up for other students.
          </p>

          <Row
            label="Pause my profile"
            description="You stay logged in, but you're hidden from the deck, Top Profiles and search."
            checked={user.profile_paused ?? false}
            onChange={toggle("profile_paused")}
          />
        </Card>

        <Card>
          <CardTitle className="mb-1">Privacy</CardTitle>
          <p className="mb-4 text-sm text-subtext">
            Who can tell what you&apos;ve read. Seeing other people&apos;s read
            receipts is a Premium feature.
          </p>

          {user.is_premium ? (
            <Row
              label="Ghost read"
              description="Read messages without the sender being told. On by default with Premium — switch it off if you'd rather receipts went both ways."
              checked={user.seen_off ?? false}
              onChange={toggle("seen_off")}
            />
          ) : (
            /* Locked, and the server enforces it too — a free account gets a
               403 from PUT /users/profile, so this isn't a UI-only gate. */
            <button
              type="button"
              onClick={() => setUpsellOpen(true)}
              className="flex w-full items-start justify-between gap-4 rounded-2xl py-3 text-left transition-colors hover:bg-surface-muted"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  Ghost read
                  <Crown className="size-4 text-gold-ink" aria-hidden />
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-subtext">
                  Read messages without the sender being told. Tap to see
                  Premium.
                </span>
              </span>
              {/* Visibly a switch, but inert — the whole row opens the upsell
                  instead of silently doing nothing when tapped. */}
              <span className="pointer-events-none">
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  disabled
                  aria-label="Ghost read (Premium only)"
                />
              </span>
            </button>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-1">Notifications</CardTitle>
          {/*
            HONESTY. These toggles persist to the user document and nothing
            reads them — push notifications are not implemented. Saying so on
            screen is the only decent option until they are; do not quietly
            drop this note.
          */}
          <p className="mb-4 text-sm text-subtext">
            These preferences are saved, but push notifications aren&apos;t built
            yet — so nothing will be sent either way for now.
          </p>

          <div className="space-y-1">
            <Row
              label="New matches"
              checked={user.notify_matches ?? true}
              onChange={toggle("notify_matches")}
            />
            <Row
              label="Messages"
              checked={user.notify_messages ?? true}
              onChange={toggle("notify_messages")}
            />
            <Row
              label="Confessions"
              checked={user.notify_confessions ?? true}
              onChange={toggle("notify_confessions")}
            />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-1">Account</CardTitle>
          <p className="mb-4 text-sm leading-relaxed text-subtext">
            Deactivating hides your profile and signs you out. Nothing is
            deleted — logging back in restores everything exactly as it was.
          </p>
          <Button variant="danger" size="md" onClick={() => setConfirmDeactivate(true)}>
            Deactivate my account
          </Button>
        </Card>
      </main>

      <PremiumUpsell
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        trigger="ghost_read"
      />

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="Deactivate your account?"
        description="You'll be signed out and hidden from everyone. Log back in any time to restore it — your matches and messages are kept."
        confirmLabel="Deactivate"
        destructive
        loading={deactivating}
        onConfirm={async () => {
          setDeactivating(true);
          try {
            await deactivateAccount();
            router.replace("/login");
          } catch {
            setDeactivating(false);
          }
        }}
      />
    </>
  );
}

function Row({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm leading-relaxed text-subtext">
            {description}
          </span>
        )}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </label>
  );
}
