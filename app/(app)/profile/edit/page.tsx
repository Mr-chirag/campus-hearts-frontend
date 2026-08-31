"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { PhotoManager } from "@/components/profile/PhotoManager";
import { GenderFields } from "@/components/profile/GenderFields";
import { useAuthStore } from "@/store/authStore";
import type { Gender, User } from "@/types";
import { validateFullName } from "@/lib/validation";
import { cn } from "@/lib/cn";

/** Server limits: interests max 10 items, 30 chars each. */
const MAX_INTERESTS = 10;
const MAX_INTEREST_LENGTH = 30;
const MAX_BIO = 500;

const SUGGESTED = [
  "Coding", "Music", "Gym", "Reading", "Photography", "Gaming",
  "Dancing", "Travel", "Coffee", "Cricket", "Movies", "Art",
];

export default function EditProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <>
        <AppHeader title="Edit profile" back="/profile" />
        <main className="mx-auto w-full max-w-2xl px-4 py-4">
          <Card>
            <p className="text-sm text-subtext">Loading your profile…</p>
          </Card>
        </main>
      </>
    );
  }

  // Keyed on the account so a different user gets a fresh form. The child
  // seeds its state lazily from props — no effect syncing prop into state.
  return <EditProfileForm key={user._id} user={user} />;
}

function EditProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const uploadImage = useAuthStore((s) => s.uploadImage);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [semester, setSemester] = useState(String(user.semester ?? ""));
  const [branch, setBranch] = useState(user.branch ?? "");
  const [interests, setInterests] = useState<string[]>(user.interests ?? []);
  const [photos, setPhotos] = useState<string[]>(user.photos ?? []);
  const [interestDraft, setInterestDraft] = useState("");
  const [gender, setGender] = useState<Gender | null>(user.gender ?? null);
  const [interestedIn, setInterestedIn] = useState<Gender[]>(user.interested_in ?? []);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);

  const addInterest = (raw: string) => {
    const value = raw.trim().slice(0, MAX_INTEREST_LENGTH);
    if (!value) return;
    if (interests.length >= MAX_INTERESTS) return;
    if (interests.some((i) => i.toLowerCase() === value.toLowerCase())) return;
    setInterests([...interests, value]);
    setInterestDraft("");
  };

  const save = async () => {
    const nameError = validateFullName(fullName);
    const sem = Number(semester);
    const semesterError =
      !semester || !Number.isInteger(sem) || sem < 1 || sem > 8
        ? "Choose a semester between 1 and 8"
        : undefined;
    const branchError = branch.trim() ? undefined : "Branch is required";
    const photoError = photos.length === 0 ? "At least one photo is required" : undefined;

    setErrors({
      fullName: nameError ?? undefined,
      semester: semesterError,
      branch: branchError,
      photos: photoError,
    });
    if (nameError || semesterError || branchError || photoError) return;

    setSaving(true);
    try {
      /**
       * ONLY whitelisted fields. `is_premium`, `is_email_verified` and
       * `is_active` live on the same document, and the server ignores them
       * here by design — never widen this to spread form state, or the next
       * person to add a field will assume the server filters it.
       */
      await updateProfile({
        full_name: fullName.trim(),
        bio: bio.trim(),
        semester: sem,
        branch: branch.trim(),
        interests,
        photos,
        ...(gender ? { gender } : {}),
        interested_in: interestedIn,
      });
      router.push("/profile");
    } catch {
      // Surfaced by the store.
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppHeader title="Edit profile" back="/profile" />

      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 lg:py-8">
        <Card>
          <CardTitle className="mb-4">Photos</CardTitle>
          <PhotoManager photos={photos} onChange={setPhotos} upload={uploadImage} />
          {errors.photos && <p className="mt-2 text-xs text-danger">{errors.photos}</p>}
        </Card>

        <Card className="space-y-4">
          <CardTitle>About you</CardTitle>

          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />

          <Textarea
            label="Bio"
            placeholder="What should people know about you?"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={MAX_BIO}
            showCount
            hint="10 characters or more adds 20 to your profile strength."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="semester" className="mb-1.5 ml-1 block text-sm font-semibold text-ink">
                Semester
              </label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={cn(
                  "h-14 w-full rounded-2xl border bg-surface px-5 text-base text-ink shadow-sm outline-none focus:border-primary",
                  errors.semester ? "border-danger" : "border-primary/10"
                )}
              >
                <option value="">Choose…</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>Semester {n}</option>
                ))}
              </select>
              {errors.semester && (
                <p className="ml-1 mt-1.5 text-xs text-danger">{errors.semester}</p>
              )}
            </div>

            <Input
              label="Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              error={errors.branch}
            />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-1">Who you are, who you want to meet</CardTitle>
          <p className="mb-5 text-sm leading-relaxed text-subtext">
            Used to decide whose deck you appear in. The match has to go both
            ways — you see people you&apos;re interested in who are also
            interested in you.
          </p>
          <GenderFields
            gender={gender}
            interestedIn={interestedIn}
            onGenderChange={setGender}
            onInterestedInChange={setInterestedIn}
          />
        </Card>

        <Card>
          <CardTitle>Interests</CardTitle>
          <p className="mt-1 text-sm text-subtext">
            Each of your first four adds 5 to your profile strength.
          </p>

          {!!interests.length && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <li key={interest}>
                  <button
                    type="button"
                    onClick={() => setInterests(interests.filter((i) => i !== interest))}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 py-1.5 pl-3 pr-2 text-sm font-medium text-primary-ink transition-colors hover:bg-primary/20"
                  >
                    {interest}
                    <X className="size-3.5" aria-label={`Remove ${interest}`} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {interests.length < MAX_INTERESTS && (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addInterest(interestDraft);
                }}
                className="mt-4 flex gap-2"
              >
                <Input
                  placeholder="Add your own"
                  value={interestDraft}
                  maxLength={MAX_INTEREST_LENGTH}
                  onChange={(e) => setInterestDraft(e.target.value)}
                />
                <Button type="submit" size="lg" variant="subtle" className="shrink-0 px-6">
                  Add
                </Button>
              </form>

              <ul className="mt-3 flex flex-wrap gap-2">
                {SUGGESTED.filter(
                  (s) => !interests.some((i) => i.toLowerCase() === s.toLowerCase())
                ).map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => addInterest(suggestion)}
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-subtext transition-colors hover:border-primary hover:text-primary-ink"
                    >
                      + {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <div className="flex gap-3 pb-4">
          <Button variant="subtle" block onClick={() => router.push("/profile")}>
            Cancel
          </Button>
          <Button block loading={saving} onClick={() => void save()}>
            Save changes
          </Button>
        </div>
      </main>
    </>
  );
}
